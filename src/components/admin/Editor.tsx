import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import Youtube from '@tiptap/extension-youtube';
import { supabase } from '../../services/supabase';
import { useRef, useState } from 'react';

interface EditorProps {
    value: any;
    onChange: (json: any) => void;
    placeholder?: string;
    articleSlug?: string;
}

export function Editor({ value, onChange, placeholder = 'Start writing...', articleSlug }: EditorProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-blue-600 hover:underline cursor-pointer',
                },
            }),
            Image.configure({
                allowBase64: true,
                HTMLAttributes: {
                    class: 'rounded-xl max-w-full h-auto my-4 shadow-lg',
                },
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Placeholder.configure({
                placeholder,
            }),
            Youtube.configure({
                controls: false,
                nocookie: true,
                allowFullscreen: true,
                HTMLAttributes: {
                    class: 'rounded-xl aspect-video w-full my-6 shadow-lg',
                },
            }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getJSON());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-slate dark:prose-invert max-w-none min-h-[400px] focus:outline-none p-4',
            },
        },
    });

    if (!editor) {
        return null;
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!articleSlug) {
            alert('Please enter an article title first to generate a slug for the image path.');
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        setUploading(true);
        console.log('Starting image upload for article:', articleSlug);

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `${articleSlug}/${fileName}`;

            console.log('Uploading to path:', filePath);

            const { error: uploadError } = await supabase.storage
                .from('article-images')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) {
                console.error('Full Supabase upload error:', uploadError);
                if (uploadError.message.includes('bucket not found')) {
                    throw new Error('Storage bucket "article-images" not found. Please create it in Supabase Storage.');
                }
                throw uploadError;
            }

            console.log('Upload successful, getting public URL...');

            const { data: { publicUrl } } = supabase.storage
                .from('article-images')
                .getPublicUrl(filePath);

            if (!publicUrl) {
                throw new Error('Failed to generate public URL.');
            }

            console.log('Public URL generated:', publicUrl);

            // Insert image at current cursor position
            editor.chain().focus().setImage({ src: publicUrl }).run();
            console.log('Image successfully inserted into editor.');

        } catch (error: any) {
            console.error('Catch-block upload error:', error);
            alert('❌ Image Upload Failed: ' + (error.message || 'Unknown error occurred.'));
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const addYoutubeVideo = () => {
        const url = prompt('Enter YouTube URL (e.g., https://www.youtube.com/watch?v=...)');
        if (url) {
            editor.commands.setYoutubeVideo({
                src: url,
            });
            console.log('YouTube video added:', url);
        }
    };

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = prompt('Enter URL', previousUrl);

        if (url === null) return;

        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    const MenuButton = ({ onClick, isActive = false, label, disabled = false, title }: { onClick: () => void, isActive?: boolean, label: React.ReactNode, disabled?: boolean, title?: string }) => (
        <button
            type="button"
            onClick={(e) => {
                e.preventDefault();
                onClick();
            }}
            disabled={disabled}
            title={title}
            className={`px-3 py-1.5 rounded-md text-sm font-bold transition-all ${isActive
                ? 'bg-blue-600 text-white shadow-sm scale-105'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm flex flex-col">
            <div className="flex flex-wrap items-center gap-1 p-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 sticky top-0 z-10">
                <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-inner">
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        isActive={editor.isActive('heading', { level: 1 })}
                        label="H1"
                        title="Heading 1"
                    />
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        isActive={editor.isActive('heading', { level: 2 })}
                        label="H2"
                        title="Heading 2"
                    />
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                        isActive={editor.isActive('heading', { level: 3 })}
                        label="H3"
                        title="Heading 3"
                    />
                </div>

                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

                <div className="flex items-center gap-1">
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        isActive={editor.isActive('bold')}
                        label="B"
                        title="Bold"
                    />
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        isActive={editor.isActive('italic')}
                        label="I"
                        title="Italic"
                    />
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        isActive={editor.isActive('underline')}
                        label="U"
                        title="Underline"
                    />
                </div>

                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

                <div className="flex items-center gap-1">
                    <MenuButton
                        onClick={() => editor.chain().focus().setTextAlign('left').run()}
                        isActive={editor.isActive({ textAlign: 'left' })}
                        label="⬅️"
                        title="Align Left"
                    />
                    <MenuButton
                        onClick={() => editor.chain().focus().setTextAlign('center').run()}
                        isActive={editor.isActive({ textAlign: 'center' })}
                        label="↔️"
                        title="Align Center"
                    />
                    <MenuButton
                        onClick={() => editor.chain().focus().setTextAlign('right').run()}
                        isActive={editor.isActive({ textAlign: 'right' })}
                        label="➡️"
                        title="Align Right"
                    />
                </div>

                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

                <div className="flex items-center gap-1">
                    <MenuButton
                        onClick={setLink}
                        isActive={editor.isActive('link')}
                        label="🔗"
                        title="Add Link"
                    />
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileUpload}
                    />
                    <MenuButton
                        onClick={() => fileInputRef.current?.click()}
                        label={uploading ? '⌛' : '🖼️'}
                        disabled={uploading}
                        title="Upload Image"
                    />
                    <MenuButton
                        onClick={addYoutubeVideo}
                        label="🎥"
                        title="Add YouTube Video"
                    />
                </div>
            </div>
            <div className="flex-1 bg-white dark:bg-slate-900 min-h-[400px]">
                <EditorContent editor={editor} />
            </div>
            <style dangerouslySetInnerHTML={{
                __html: `
                .ProseMirror h1 { font-size: 2.25rem; font-weight: 800; margin-top: 2rem; margin-bottom: 1rem; line-height: 1.2; }
                .ProseMirror h2 { font-size: 1.875rem; font-weight: 700; margin-top: 1.75rem; margin-bottom: 0.75rem; line-height: 1.3; }
                .ProseMirror h3 { font-size: 1.5rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.5rem; line-height: 1.4; }
                .ProseMirror p { margin-bottom: 1rem; }
                .ProseMirror { outline: none !important; }
            `}} />
        </div>
    );
}
