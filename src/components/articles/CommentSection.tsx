import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../services/supabase';
import { getArticleComments, postComment, deleteComment, updateComment } from '../../services/articles';
import { filterProfanity } from '../../utils/filter';
import type { ArticleComment } from '../../types/article';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

interface CommentSectionProps {
    articleId: string;
}

export function CommentSection({ articleId }: CommentSectionProps) {
    const { i18n } = useTranslation();
    const isArabic = i18n.language.startsWith('ar');
    const [comments, setComments] = useState<ArticleComment[]>([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        fetchComments();
    }, [articleId]);

    async function fetchComments() {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(articleId);

        if (!isUuid) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const data = await getArticleComments(articleId);
        setComments(data);
        setLoading(false);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!user || !newComment.trim()) return;

        const { isFlagged } = filterProfanity(newComment);
        if (isFlagged && newComment.length < 5) {
            alert(isArabic ? 'التعليق قصير جداً أو يحتوي على محتوى غير لائق.' : 'Comment is too short or contains inappropriate content.');
            return;
        }

        try {
            const { error } = await postComment(articleId, user.id, newComment);
            if (error) {
                alert(error.message);
            } else {
                setNewComment('');
                fetchComments();
            }
        } catch (err: any) {
            alert(isArabic ? 'تم رفض التعليق لاحتوائه على محتوى غير لائق أو سبام.' : 'Comment rejected: Inappropriate content or spam detected.');
        }
    }

    async function handleReply(parentId: string) {
        if (!user || !replyContent.trim()) return;

        const { error } = await postComment(articleId, user.id, replyContent, parentId);
        if (error) {
            alert(error.message);
        } else {
            setReplyContent('');
            setReplyingTo(null);
            fetchComments();
        }
    }

    async function handleDelete(commentId: string) {
        if (!confirm(isArabic ? 'هل أنت متأكد من حذف التعليق؟' : 'Are you sure you want to delete this comment?')) return;
        const { error } = await deleteComment(commentId, user.id);
        if (error) {
            alert(error.message);
        } else {
            fetchComments();
        }
    }

    async function handleUpdate(commentId: string, content: string) {
        try {
            const { error } = await updateComment(commentId, user.id, content);
            if (error) {
                alert(error.message);
                return false;
            } else {
                fetchComments();
                return true;
            }
        } catch (err: any) {
            alert(isArabic ? 'حدث خطأ أثناء تعديل التعليق.' : 'Error updating comment.');
            return false;
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center py-10">
                <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(articleId);

    if (!isUuid) {
        return (
            <div className="mt-16 p-8 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
                <span className="text-3xl mb-3 block">💡</span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    {isArabic ? 'التعليقات متاحة للمقالات الحقيقية فقط' : 'Comments available on real articles'}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                    {isArabic ? 'هذه مقالة افتراضية. أنشئ مقالة حقيقية من لوحة التحكم لتفعيل التعليقات.' : 'This is a placeholder article. Create a real article from the Admin Panel to enable user discussions.'}
                </p>
            </div>
        );
    }

    return (
        <section className="mt-16 space-y-8">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {isArabic ? 'التعليقات' : 'Comments'} ({comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)})
                </h2>
            </div>

            {user ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={isArabic ? 'اكتب تعليقاً...' : 'Write a comment...'}
                        className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]"
                    />
                    <div className="flex justify-end">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold shadow-lg shadow-blue-500/20"
                        >
                            {isArabic ? 'نشر التعليق' : 'Post Comment'}
                        </motion.button>
                    </div>
                </form>
            ) : (
                <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl text-center border border-dashed border-slate-200 dark:border-slate-800">
                    <p className="text-slate-600 dark:text-slate-400">
                        {isArabic ? (
                            <>يرجى <Link to="/admin/login" className="text-blue-600 font-bold hover:underline">تسجيل الدخول</Link> للمشاركة في النقاش.</>
                        ) : (
                            <>Please <Link to="/admin/login" className="text-blue-600 font-bold hover:underline">login</Link> to join the discussion.</>
                        )}
                    </p>
                </div>
            )}

            <div className="space-y-6">
                {comments.length === 0 ? (
                    <p className="text-center text-slate-500 py-10">
                        {isArabic ? 'لا توجد تعليقات بعد. كن أول من يشارك برأيه!' : 'No comments yet. Be the first to share your thoughts!'}
                    </p>
                ) : (
                    comments.map((comment) => (
                        <CommentCard
                            key={comment.id}
                            comment={comment}
                            user={user}
                            onReply={handleReply}
                            onDelete={handleDelete}
                            onUpdate={handleUpdate}
                            replyingTo={replyingTo}
                            setReplyingTo={setReplyingTo}
                            replyContent={replyContent}
                            setReplyContent={setReplyContent}
                            isArabic={isArabic}
                        />
                    ))
                )}
            </div>
        </section>
    );
}

function CommentCard({
    comment,
    user,
    onReply,
    onDelete,
    onUpdate,
    replyingTo,
    setReplyingTo,
    replyContent,
    setReplyContent,
    isArabic
}: any) {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const isOwner = user?.id === comment.user_id;

    async function handleUpdateSubmit() {
        if (!editContent.trim()) return;
        const success = await onUpdate(comment.id, editContent);
        if (success) {
            setIsEditing(false);
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group"
        >
            <div className="flex gap-4">
                <div className="shrink-0">
                    {comment.profiles?.avatar_url ? (
                        <img src={comment.profiles.avatar_url} alt="" className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800" />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                            👤
                        </div>
                    )}
                </div>
                <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="font-bold text-slate-900 dark:text-white mr-2">
                                {comment.profiles?.full_name || (isArabic ? 'مستخدم مجهول' : 'Anonymous')}
                            </span>
                            <span className="text-xs text-slate-500">
                                {new Date(comment.created_at).toLocaleDateString()}
                            </span>
                        </div>
                        {isOwner && (
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className="p-1 text-slate-400 hover:text-blue-600"
                                    title={isArabic ? 'تعديل' : 'Edit'}
                                >
                                    ✏️
                                </button>
                                <button
                                    onClick={() => onDelete(comment.id)}
                                    className="p-1 text-slate-400 hover:text-red-600"
                                    title={isArabic ? 'حذف' : 'Delete'}
                                >
                                    🗑️
                                </button>
                            </div>
                        )}
                    </div>

                    {isEditing ? (
                        <div className="space-y-4">
                            <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm min-h-[100px]"
                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setEditContent(comment.content);
                                    }}
                                    className="px-4 py-2 text-xs font-bold text-slate-500"
                                >
                                    {isArabic ? 'إلغاء' : 'Cancel'}
                                </button>
                                <button
                                    onClick={handleUpdateSubmit}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold"
                                >
                                    {isArabic ? 'حفظ التغييرات' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="prose prose-sm dark:prose-invert text-slate-700 dark:text-slate-300">
                            <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                                {comment.content}
                            </ReactMarkdown>
                        </div>
                    )}

                    <div className="flex items-center gap-4 mt-2">
                        {user && !isEditing && (
                            <button
                                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                className="text-xs font-bold text-blue-600 hover:underline"
                            >
                                {isArabic ? 'رد' : 'Reply'}
                            </button>
                        )}
                    </div>

                    {replyingTo === comment.id && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-4 space-y-2"
                        >
                            <textarea
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder={isArabic ? 'اكتب رداً...' : 'Write a reply...'}
                                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm min-h-[80px]"
                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setReplyingTo(null)}
                                    className="px-4 py-2 text-xs font-bold text-slate-500"
                                >
                                    {isArabic ? 'إلغاء' : 'Cancel'}
                                </button>
                                <button
                                    onClick={() => onReply(comment.id)}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold"
                                >
                                    {isArabic ? 'نشر الرد' : 'Post Reply'}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Replies */}
                    <AnimatePresence>
                        {comment.replies && comment.replies.length > 0 && (
                            <div className="mt-6 space-y-6 border-l-2 border-slate-100 dark:border-slate-800 pl-6 ml-1">
                                {comment.replies.map((reply: any) => (
                                    <CommentCard
                                        key={reply.id}
                                        comment={reply}
                                        user={user}
                                        onDelete={onDelete}
                                        onUpdate={onUpdate}
                                        isArabic={isArabic}
                                    />
                                ))}
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
}
