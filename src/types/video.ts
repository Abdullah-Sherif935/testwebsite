export interface Video {
    id: string;
    youtube_video_id?: string;
    title: string;
    description?: string;
    youtube_url: string;
    thumbnail_url?: string;
    video_id?: string;
    duration?: string;
    view_count?: number;
    published_at?: string;
    related_article_slug?: string;
    created_at: string;
}
