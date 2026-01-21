import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import Youtube from '@tiptap/extension-youtube';
import { compressImage } from '../../utils/imageCompression';
import { supabase } from '../../services/supabase';
import { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';

// Define extensions outside the component to prevent re-registration and duplicates
const rawExtensions = [
    StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        // CRITICAL: Disable these extensions in StarterKit because we add them manually with custom config
        link: false,       // We configure Link separately with custom HTMLAttributes
        underline: false,  // We configure Underline separately
    }),
    // Now add them manually with our custom configurations
    Underline,
    Link.configure({
        openOnClick: false,
        linkOnPaste: true,
        autolink: true,
        HTMLAttributes: {
            class: 'text-blue-600 hover:underline cursor-link underline-offset-4',
        },
    }),
    Image.configure({
        allowBase64: true,
        HTMLAttributes: {
            class: 'rounded-xl max-w-full h-auto my-4 shadow-lg border-2 border-slate-100',
        },
    }),
    TextAlign.configure({
        types: ['heading', 'paragraph'],
    }),
    Placeholder.configure({
        placeholder: 'Start writing...',
    }),
    Youtube.configure({
        controls: true,
        nocookie: true,
        HTMLAttributes: {
            class: 'rounded-xl aspect-video w-full my-6 shadow-lg bg-slate-100',
        },
    }),
];

// Strictly deduplicate by name
const editorExtensions = Array.from(
    new Map(rawExtensions.map(ext => [ext.name, ext])).values()
);

interface EditorProps {
    value: any;
    onChange: (json: any) => void;
    placeholder?: string;
    articleSlug?: string;
}

const MenuButton = ({
    onClick,
    isActive = false,
    label,
    disabled = false,
    title
}: {
    onClick: () => void,
    isActive?: boolean,
    label: React.ReactNode,
    disabled?: boolean,
    title?: string
}) => (
    <button
        type="button"
        onClick={onClick}
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

export function Editor({ value, onChange, placeholder = 'Start writing...', articleSlug }: EditorProps) {
    const { i18n } = useTranslation();
    const { user } = useAuth();
    const isArabic = i18n.language.startsWith('ar');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalConfig, setModalConfig] = useState<{
        title: string;
        placeholder: string;
        defaultValue?: string;
        onSubmit: (value: string) => void;
    } | null>(null);
    const [modalValue, setModalValue] = useState('');

    const openModal = (config: { title: string; placeholder: string; defaultValue?: string; onSubmit: (value: string) => void }) => {
        setModalConfig(config);
        setModalValue(config.defaultValue || '');
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setModalConfig(null);
        setModalValue('');
    };

    const handleModalSubmit = () => {
        if (modalConfig && modalValue.trim()) {
            modalConfig.onSubmit(modalValue.trim());
            closeModal();
        }
    };

    const editor = useEditor({
        extensions: editorExtensions,
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

    // Update placeholder dynamically
    useEffect(() => {
        if (editor && placeholder) {
            editor.extensionManager.extensions
                .find(e => e.name === 'placeholder')
                ?.configure({ placeholder });
        }
    }, [editor, placeholder]);

    // Debug registered extensions
    useEffect(() => {
        if (editor) {
            console.log('Editor: Final extensions:', editor.extensionManager.extensions.map(ext => ext.name));
        }
    }, [editor]);

    // Handle initial value loading if it comes late
    useEffect(() => {
        if (editor && value && editor.isEmpty) {
            editor.commands.setContent(value);
        }
    }, [editor, value]);

    if (!editor) {
        return null;
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        console.log('Editor: File selected:', file.name);

        if (!articleSlug) {
            alert(isArabic ? 'يرجى كتابة العنوان أولاً' : 'Please enter title first');
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        setUploading(true);
        try {
            console.log('Editor: Compressing image...');
            const compressedBlob = await compressImage(file, 1400, 0.82);

            const fileName = `editor-${Date.now()}.jpeg`;
            // Use user.id as folder to avoid 'Invalid key' issues with Arabic slugs in Storage
            const filePath = `${user?.id}/${fileName}`;

            console.log('Editor: Uploading compressed to:', filePath);
            const { error: uploadError } = await supabase.storage
                .from('article-images')
                .upload(filePath, compressedBlob, {
                    cacheControl: '3600',
                    upsert: false,
                    contentType: 'image/jpeg'
                });

            if (uploadError) {
                console.error('Editor: Upload error:', uploadError);
                throw uploadError;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('article-images')
                .getPublicUrl(filePath);

            console.log('Editor: Inserted URL:', publicUrl);
            editor.chain().focus().setImage({ src: publicUrl }).run();
            alert(isArabic ? '✅ تم الرفع' : '✅ Image Inserted');
        } catch (error: any) {
            console.error('Editor: Final error:', error);
            alert('❌ Image Upload Failed: ' + (error.message || 'Unknown error.'));
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const addYoutubeVideo = () => {
        openModal({
            title: isArabic ? 'إضافة فيديو يوتيوب' : 'Add YouTube Video',
            placeholder: isArabic ? 'الصق رابط الفيديو هنا...' : 'Paste video URL here...',
            defaultValue: 'https://www.youtube.com/watch?v=',
            onSubmit: (url) => {
                console.log('Editor: Adding video:', url);
                editor.chain().focus().setYoutubeVideo({ src: url }).run();
            }
        });
    };

    const setLink = () => {
        const { from, to } = editor.state.selection;
        const previousUrl = editor.getAttributes('link').href;

        // If no text is selected, prompt for text first
        if (from === to) {
            openModal({
                title: isArabic ? 'نص الرابط' : 'Link Text',
                placeholder: isArabic ? 'أدخل النص...' : 'Enter text...',
                onSubmit: (text) => {
                    // After getting text, ask for URL
                    openModal({
                        title: isArabic ? 'عنوان الرابط' : 'Link URL',
                        placeholder: isArabic ? 'الصق الرابط هنا...' : 'Paste URL here...',
                        defaultValue: 'https://',
                        onSubmit: (url) => {
                            editor.chain().focus().insertContent(`<a href="${url}">${text}</a> `).run();
                        }
                    });
                }
            });
            return;
        }

        // Text is selected, just ask for URL
        openModal({
            title: isArabic ? 'عنوان الرابط' : 'Link URL',
            placeholder: isArabic ? 'الصق الرابط هنا...' : 'Paste URL here...',
            defaultValue: previousUrl || 'https://',
            onSubmit: (url) => {
                if (!url) {
                    editor.chain().focus().extendMarkRange('link').unsetLink().run();
                    return;
                }
                console.log('Editor: Setting link:', url);
                editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
            }
        });
    };

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
                        title={isArabic ? 'إضافة رابط' : 'Add Link'}
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
                        isActive={false}
                        title={isArabic ? 'إضافة صورة' : 'Add Image'}
                    />
                    <MenuButton
                        onClick={addYoutubeVideo}
                        label="🎥"
                        isActive={false}
                        title={isArabic ? 'إضافة فيديو يوتيوب' : 'Add YouTube Video'}
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

            {/* Custom Input Modal */}
            {showModal && modalConfig && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                    onClick={closeModal}
                >
                    <div
                        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 border border-slate-200 dark:border-slate-800"
                        onClick={(e) => e.stopPropagation()}
                        dir={isArabic ? 'rtl' : 'ltr'}
                    >
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                            {modalConfig.title}
                        </h3>
                        <input
                            type="text"
                            value={modalValue}
                            onChange={(e) => setModalValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleModalSubmit();
                                if (e.key === 'Escape') closeModal();
                            }}
                            placeholder={modalConfig.placeholder}
                            autoFocus
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all mb-4"
                        />
                        <div className="flex gap-3 justify-end">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                            >
                                {isArabic ? 'إلغاء' : 'Cancel'}
                            </button>
                            <button
                                type="button"
                                onClick={handleModalSubmit}
                                disabled={!modalValue.trim()}
                                className="px-5 py-2.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
                            >
                                {isArabic ? 'تأكيد' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
