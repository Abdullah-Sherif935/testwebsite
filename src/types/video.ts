export interface Video {
    id: string;
    title: string;
    youtube_url: string;
    thumbnail_url?: string;
    description?: string;
    video_id?: string;
    duration?: string;
    related_article_slug?: string;
    created_at: string;
}
