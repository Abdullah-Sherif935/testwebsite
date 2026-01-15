export interface Resource {
    id: string;
    title: string;
    description?: string;
    type: 'pdf' | 'code' | 'link';
    url: string;
    related_article_slug?: string;
    created_at: string;
}
