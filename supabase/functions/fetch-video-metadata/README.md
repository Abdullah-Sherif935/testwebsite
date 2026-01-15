# Deploying the YouTube Metadata Function

This function automatically fetches YouTube metadata (title, description, thumbnail, duration) when a new video is inserted into your Supabase database.

## Prerequisites

1.  **Supabase CLI**: installed and logged in.
2.  **YouTube Data API Key**: from Google Cloud Console.

## Deployment Steps

### 1. Set Environment Variables
Set your YouTube API Key in your Supabase project's secrets.
Run this command in your terminal:

```bash
supabase secrets set YT_API_KEY=your_google_api_key_here
```

### 2. Deploy the Function
Deploy the function to Supabase:

```bash
supabase functions deploy fetch-video-metadata
```

## Automating with Database Webhooks

To make this run **automatically** when you insert a row, you need to set up a Database Webhook in the Supabase Dashboard.

1.  Go to **Supabase Dashboard** -> **Database** -> **Webhooks**.
2.  Click **Create a new webhook**.
3.  **Name**: `auto-fetch-youtube-metadata`
4.  **Table**: `public.videos`
5.  **Events**: Check `INSERT` (and optionally `UPDATE` if you want it to refresh when URL changes).
6.  **Type**: `HTTP Request`.
7.  **HTTP Request Method**: `POST`.
8.  **URL**: The URL of your deployed function.
    *   It usually looks like: `https://<project-ref>.supabase.co/functions/v1/fetch-video-metadata`
    *   You can find this URL in the **Edge Functions** section of your dashboard.
9.  **HTTP Headers**:
    *   Add `Authorization`: `Bearer <YOUR_ANON_KEY>` (or Service Role Key, but Anon is usually sufficient if RLS allows, otherwise Service Role is safer for backend ops). *Better:* Use the **Service Role Key** passed securely or rely on Supabase's internal signing if available.
    *   *Simpler:* Just use the URL. Supabase Webhooks inside the ecosystem are secure.
10. **Confirm**.

Now, whenever you insert a row with just `youtube_url`, Supabase will trigger this function, which will fetch the data and update the row in the background.
