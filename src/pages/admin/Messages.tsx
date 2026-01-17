import { useState, useEffect } from 'react';
import {
    getContactMessages,
    markMessageAsRead,
    sendReplyEmail,
    updateMessageReply,
    toggleArchiveMessage,
    moveMessageToTrash,
    restoreFromTrash,
    deleteMessageForever,
    emptyTrash
} from '../../services/contact';
import type { MessageRecord } from '../../services/contact';

export function AdminMessages() {
    const [messages, setMessages] = useState<MessageRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const [sendingReply, setSendingReply] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
    const [filter, setFilter] = useState<'inbox' | 'unread' | 'archived' | 'trash'>('inbox');

    useEffect(() => {
        loadMessages();
    }, []);

    async function loadMessages() {
        try {
            const data = await getContactMessages();
            setMessages(data || []);
        } catch (error) {
            console.error('Error loading messages:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleMarkAsRead(id: string) {
        try {
            await markMessageAsRead(id);
            setMessages(messages.map(m => m.id === id ? { ...m, is_read: true } : m));
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async function handleToggleArchive(msg: MessageRecord) {
        try {
            await toggleArchiveMessage(msg.id, msg.is_archived);
            setMessages(messages.map(m => m.id === msg.id ? { ...m, is_archived: !msg.is_archived } : m));
        } catch (error) {
            console.error('Error toggling archive:', error);
        }
    }

    async function handleMoveToTrash(id: string) {
        try {
            await moveMessageToTrash(id);
            setMessages(messages.map(m => m.id === id ? { ...m, is_deleted: true } : m));
        } catch (error) {
            console.error('Error moving to trash:', error);
        }
    }

    async function handleRestore(id: string) {
        try {
            await restoreFromTrash(id);
            setMessages(messages.map(m => m.id === id ? { ...m, is_deleted: false } : m));
        } catch (error) {
            console.error('Error restoring:', error);
        }
    }

    async function handleDeleteForever(id: string) {
        if (!confirm('Are you sure you want to delete this message forever?')) return;
        try {
            await deleteMessageForever(id);
            setMessages(messages.filter(m => m.id !== id));
        } catch (error) {
            console.error('Error deleting forever:', error);
        }
    }

    async function handleEmptyTrash() {
        if (!confirm('Empty all messages in Trash? This cannot be undone.')) return;
        try {
            await emptyTrash();
            setMessages(messages.filter(m => !m.is_deleted));
            setStatus({ type: 'success', msg: 'Trash emptied successfully!' });
        } catch (error) {
            console.error('Error emptying trash:', error);
        }
    }

    async function handleSendReply(msg: MessageRecord) {
        if (!replyText.trim()) return;
        setSendingReply(true);
        setStatus(null);
        try {
            await sendReplyEmail(msg.email, msg.name, replyText);
            await updateMessageReply(msg.id, replyText);
            setStatus({ type: 'success', msg: 'Reply sent and saved successfully!' });
            setReplyingTo(null);
            setReplyText('');
            loadMessages();
        } catch (error: any) {
            console.error('Error:', error);
            setStatus({ type: 'error', msg: error.message || 'Failed to send reply' });
        } finally {
            setSendingReply(false);
        }
    }

    // Stats calculations
    const activeMessages = messages.filter(m => !m.is_deleted);
    const unreadCount = activeMessages.filter(m => !m.is_read && !m.is_archived).length;
    const archivedCount = activeMessages.filter(m => m.is_archived).length;
    const trashCount = messages.filter(m => m.is_deleted).length;
    const inboxCount = activeMessages.filter(m => !m.is_archived).length;

    const filteredMessages = messages.filter(m => {
        if (filter === 'trash') return m.is_deleted;
        if (m.is_deleted) return false; // Hide deleted from other views

        if (filter === 'unread') return !m.is_read && !m.is_archived;
        if (filter === 'archived') return m.is_archived;
        if (filter === 'inbox') return !m.is_archived;
        return true;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[500px]">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-20">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card
                    icon="📥"
                    label="Inbox"
                    count={inboxCount}
                    isActive={filter === 'inbox'}
                    onClick={() => setFilter('inbox')}
                    color="blue"
                />
                <Card
                    icon="🔔"
                    label="Unread"
                    count={unreadCount}
                    isActive={filter === 'unread'}
                    onClick={() => setFilter('unread')}
                    color="indigo"
                />
                <Card
                    icon="📦"
                    label="Archived"
                    count={archivedCount}
                    isActive={filter === 'archived'}
                    onClick={() => setFilter('archived')}
                    color="slate"
                />
                <Card
                    icon="🗑️"
                    label="Trash"
                    count={trashCount}
                    isActive={filter === 'trash'}
                    onClick={() => setFilter('trash')}
                    color="red"
                />
            </div>

            {/* Filter Bar & Actions */}
            <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex gap-2">
                    <span className="px-4 py-2 text-sm font-bold text-slate-400 uppercase tracking-widest">
                        {filter.toUpperCase()}
                    </span>
                </div>

                {filter === 'trash' && trashCount > 0 && (
                    <button
                        onClick={handleEmptyTrash}
                        className="px-6 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-all"
                    >
                        Empty Trash Forever
                    </button>
                )}
            </div>

            {status && (
                <div className={`p-4 rounded-2xl text-sm font-medium animate-fade-in ${status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {status.msg}
                </div>
            )}

            {/* Message List */}
            <div className="grid gap-6">
                {filteredMessages.length === 0 ? (
                    <div className="text-center py-32 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
                        <span className="text-6xl mb-6 block opacity-10">📭</span>
                        <p className="text-slate-400 text-lg font-medium">No messages in {filter}.</p>
                    </div>
                ) : (
                    filteredMessages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`group bg-white dark:bg-slate-900 rounded-[2.5rem] border transition-all duration-300 ${msg.is_read
                                ? 'border-slate-200 dark:border-slate-800'
                                : 'border-blue-500 shadow-[0_0_20px_-5px_rgba(59,130,246,0.15)]'
                                }`}
                        >
                            <div className="p-8">
                                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                                    <div className="flex gap-5">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black ${!msg.is_read ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                            {msg.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-black text-xl text-slate-900 dark:text-white flex items-center gap-3">
                                                {msg.name}
                                                {!msg.is_read && <span className="w-3 h-3 bg-blue-600 rounded-full animate-ping" />}
                                            </h3>
                                            <a href={`mailto:${msg.email}`} className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                                                {msg.email}
                                            </a>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                                        <p className="text-xs text-slate-400 font-bold bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full uppercase tracking-tighter">
                                            {new Date(msg.created_at).toLocaleString()}
                                        </p>

                                        {/* Action Icons */}
                                        <div className="flex gap-2">
                                            {filter === 'trash' ? (
                                                <>
                                                    <ActionButton onClick={() => handleRestore(msg.id)} icon="↩️" label="Restore" />
                                                    <ActionButton onClick={() => handleDeleteForever(msg.id)} icon="❌" label="Delete" color="red" />
                                                </>
                                            ) : (
                                                <>
                                                    <ActionButton onClick={() => handleToggleArchive(msg)} icon={msg.is_archived ? "📤" : "📦"} label={msg.is_archived ? "Unarchive" : "Archive"} />
                                                    <ActionButton onClick={() => handleMoveToTrash(msg.id)} icon="🗑️" label="Trash" color="red" />
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 p-8 bg-slate-50/50 dark:bg-slate-800/30 rounded-3xl border border-slate-100 dark:border-white/5 relative group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors duration-500">
                                    <p className="text-slate-700 dark:text-slate-200 whitespace-pre-wrap text-[16px] leading-[1.8]">
                                        {msg.message}
                                    </p>
                                </div>

                                {msg.reply_text && (
                                    <div className="mt-6 p-6 bg-blue-50/30 dark:bg-blue-600/5 rounded-3xl border border-blue-100/50 dark:border-blue-900/30">
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-100 dark:bg-blue-900/40 px-3 py-1 rounded-lg">REPLY</span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                                Sent {new Date(msg.replied_at!).toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed">
                                            {msg.reply_text}
                                        </p>
                                    </div>
                                )}

                                <div className="mt-8 flex justify-end">
                                    {filter !== 'trash' && (
                                        <button
                                            onClick={() => {
                                                setReplyingTo(replyingTo === msg.id ? null : msg.id);
                                                setReplyText('');
                                            }}
                                            className={`px-10 py-3 rounded-2xl text-sm font-black transition-all shadow-lg transform hover:-translate-y-1 active:scale-95 ${msg.reply_text
                                                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                                                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20'
                                                }`}
                                        >
                                            {replyingTo === msg.id ? 'Cancel' : msg.reply_text ? 'Reply Again' : 'Reply From Site'}
                                        </button>
                                    )}
                                </div>

                                {replyingTo === msg.id && (
                                    <div className="mt-6 space-y-4 animate-slide-up">
                                        <textarea
                                            autoFocus
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            placeholder={`Type your reply to ${msg.name}...`}
                                            className="w-full px-8 py-6 rounded-[2rem] bg-slate-50 dark:bg-slate-800 border-2 border-blue-100 dark:border-blue-900 focus:border-blue-500 outline-none transition-all text-[16px] text-slate-900 dark:text-white min-h-[220px] resize-none shadow-inner"
                                        />
                                        <div className="flex justify-end">
                                            <button
                                                disabled={sendingReply || !replyText.trim()}
                                                onClick={() => handleSendReply(msg)}
                                                className="px-12 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm hover:scale-[1.02] shadow-2xl disabled:opacity-50 flex items-center gap-3 transition-all"
                                            >
                                                {sendingReply ? (
                                                    <div className="w-5 h-5 border-3 border-current border-t-transparent rounded-full animate-spin" />
                                                ) : '🚀 Send It Now'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

// Helper Components
function Card({ icon, label, count, isActive, onClick, color }: any) {
    const colorClasses: any = {
        blue: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
        indigo: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20',
        slate: 'text-slate-600 bg-slate-50 dark:bg-slate-800/50',
        red: 'text-red-600 bg-red-50 dark:bg-red-900/20'
    };

    return (
        <button
            onClick={onClick}
            className={`p-6 rounded-[2.5rem] border transition-all text-left relative overflow-hidden group ${isActive
                    ? 'border-current shadow-xl scale-105 z-10 bg-white dark:bg-slate-900'
                    : 'border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50'
                } ${colorClasses[color]}`}
        >
            <span className="text-4xl mb-4 block group-hover:scale-125 transition-transform duration-500">{icon}</span>
            <div className="text-4xl font-black mb-1">{count}</div>
            <div className="text-xs font-black uppercase tracking-[0.2em] opacity-60">{label}</div>
        </button>
    );
}

function ActionButton({ onClick, icon, label, color = "blue" }: any) {
    const colors: any = {
        blue: 'hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-400 hover:text-blue-600',
        red: 'hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-600'
    };

    return (
        <button
            onClick={onClick}
            title={label}
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${colors[color]}`}
        >
            <span className="text-lg">{icon}</span>
        </button>
    );
}
