export interface Article {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    content_md: string;
    content_rich?: any; // TipTap JSON
    category: string;
    status: 'draft' | 'published' | 'deleted_by_admin';
    moderation_status: 'pending' | 'approved' | 'rejected';
    moderation_note?: string;
    user_id?: string;
    author_name?: string;
    pending_content_rich?: any;
    language: 'ar' | 'en';
    created_at: string;
    updated_at?: string;
    image_url?: string;
    tags?: string[];
    views_count: number;
    author?: {
        is_verified: boolean;
        avatar_url: string;
        full_name_ar?: string;
        email?: string;
        cv_file_url?: string;
    };
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
    rating?: number; // 1-5 stars
    parent_id: string | null;
    created_at: string;
    author?: {
        full_name_ar: string;
        avatar_url: string;
    };
    replies?: ArticleComment[];
}
