export interface Article {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    content_md: string;
    content_rich?: any; // TipTap JSON
    category: string;
    status: 'draft' | 'published';
    language: 'ar' | 'en';
    created_at: string;
    updated_at?: string;
    image_url?: string;
    tags?: string[];
}
