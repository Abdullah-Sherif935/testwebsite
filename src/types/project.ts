export interface Project {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content_rich: any; // TipTap JSON
    technologies: string[];
    video_url?: string;
    cover_image?: string;
    status: 'draft' | 'published';
    created_at: string;
}
