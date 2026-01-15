// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const payload = await req.json()
        // Support both direct call (payload is row) and webhook (payload.record is row)
        const record = payload.record || payload

        if (!record.youtube_url || !record.id) {
            return new Response(JSON.stringify({ error: "Missing youtube_url or id" }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        // Initialize Supabase Client
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        const supabase = createClient(supabaseUrl, supabaseKey)
        const ytApiKey = Deno.env.get('YT_API_KEY')

        // 1. Extract Video ID
        const videoId = extractVideoId(record.youtube_url)
        if (!videoId) {
            return new Response(JSON.stringify({ error: "Invalid YouTube URL" }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        console.log(`Processing video ${videoId} for row ${record.id}`)

        let title = ''
        let thumbnail_url = ''
        let description = ''
        let duration = ''

        // 2. Fetch oEmbed (No Key Required) - Good fallback for Title/Thumbnail
        try {
            const oembedRes = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`)
            if (oembedRes.ok) {
                const data = await oembedRes.json()
                title = data.title
                thumbnail_url = data.thumbnail_url
            }
        } catch (e) {
            console.error("oEmbed failed", e)
        }

        // 3. Fetch YouTube Data API v3 (If Key Presnet) - For Description & Duration
        if (ytApiKey) {
            try {
                // Fetch 'snippet' for detailed text and 'contentDetails' for duration
                const apiRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${ytApiKey}`)
                if (apiRes.ok) {
                    const data = await apiRes.json()
                    if (data.items && data.items.length > 0) {
                        const item = data.items[0]
                        // Use API fields if available
                        if (item.snippet.title) title = item.snippet.title
                        if (item.snippet.description) description = item.snippet.description

                        // Get highest resolution thumbnail
                        const thumbs = item.snippet.thumbnails
                        thumbnail_url = thumbs.maxres?.url || thumbs.standard?.url || thumbs.high?.url || thumbs.medium?.url || thumbnail_url

                        // Duration (ISO 8601 format, e.g., PT15M33S)
                        duration = item.contentDetails.duration
                    }
                } else {
                    console.error("YouTube API returned error:", await apiRes.text())
                }
            } catch (e) {
                console.error("YouTube API failed", e)
            }
        } else {
            console.warn("YT_API_KEY is missing. Skipping description and duration fetch.")
        }

        // 4. Update Supabase Row
        // Only update fields that we successfully fetched
        const updates: any = {}
        if (title) updates.title = title
        if (description) updates.description = description
        if (thumbnail_url) updates.thumbnail_url = thumbnail_url
        if (duration) updates.duration = duration

        if (Object.keys(updates).length > 0) {
            const { error } = await supabase
                .from('videos')
                .update(updates)
                .eq('id', record.id)

            if (error) throw error
        }

        return new Response(JSON.stringify({ success: true, updates }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

    } catch (err: any) {
        console.error("Function error:", err)
        return new Response(JSON.stringify({ error: err?.message || 'Unknown error' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
})

function extractVideoId(url: string) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}
