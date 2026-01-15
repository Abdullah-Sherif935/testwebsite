export function extractSEOData(content_rich: any, fallbackExcerpt: string = '') {
    let description = fallbackExcerpt;
    let ogImage = '';

    if (!content_rich || !content_rich.content) {
        return { description, ogImage };
    }

    const nodes = content_rich.content;

    // 1. Extract first paragraph for description if excerpt is missing
    if (!description) {
        const firstParagraph = nodes.find((node: any) => node.type === 'paragraph' && node.content && node.content[0]?.text);
        if (firstParagraph) {
            description = firstParagraph.content[0].text.substring(0, 160);
        }
    }

    // 2. Extract first image or youtube thumbnail
    for (const node of nodes) {
        if (node.type === 'image' && node.attrs?.src) {
            ogImage = node.attrs.src;
            break;
        }
        if (node.type === 'youtube' && node.attrs?.src) {
            const videoIdMatch = node.attrs.src.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([^& \n\r]+)/);
            const videoId = videoIdMatch ? videoIdMatch[1] : null;
            if (videoId) {
                ogImage = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
                break;
            }
        }
    }

    return { description, ogImage };
}
