import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Youtube from '@tiptap/extension-youtube';
import { useEffect } from 'react';

interface RichTextRendererProps {
    content: any;
}

export function RichTextRenderer({ content }: RichTextRendererProps) {
    const editor = useEditor({
        editable: false,
        extensions: [
            StarterKit,
            Underline,
            Link.configure({
                HTMLAttributes: {
                    class: 'text-blue-600 hover:underline',
                    target: '_blank',
                    rel: 'noopener noreferrer',
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'rounded-2xl max-w-full h-auto my-12 shadow-2xl mx-auto block',
                },
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Youtube.configure({
                controls: true,
                nocookie: true,
                allowFullscreen: true,
                HTMLAttributes: {
                    class: 'rounded-2xl aspect-video w-full my-12 shadow-2xl',
                },
            }),
        ],
        content: content,
        editorProps: {
            attributes: {
                class: 'prose prose-lg md:prose-xl dark:prose-invert max-w-none prose-slate',
                dir: 'auto'
            },
        },
    });

    useEffect(() => {
        if (editor && content) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    if (!editor) {
        return null;
    }

    return <EditorContent editor={editor} />;
}
