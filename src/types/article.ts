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
    views_count: number;
}
export interface ArticleAction {
    id: string;
    user_id: string;
    article_id: string;
    is_saved: boolean;
    is_read: boolean;
}

export interface ArticleComment {
    id: string;
    article_id: string;
    user_id: string;
    content: string;
    parent_id: string | null;
    created_at: string;
    profiles?: {
        full_name: string;
        avatar_url: string;
    };
    replies?: ArticleComment[];
}
