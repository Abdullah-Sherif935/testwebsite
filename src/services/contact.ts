import { supabase } from './supabase';
import emailjs from '@emailjs/browser';

export interface ContactMessage {
    name: string;
    email: string;
    message: string;
}

export interface MessageRecord extends ContactMessage {
    id: string;
    is_read: boolean;
    is_archived: boolean;
    is_deleted: boolean;
    created_at: string;
    reply_text?: string;
    replied_at?: string;
    deleted_at?: string;
}

export async function sendContactMessage(message: ContactMessage) {
    const { data, error } = await supabase
        .from('contact_messages')
        .insert([
            {
                name: message.name,
                email: message.email,
                message: message.message,
            }
        ]);

    if (error) throw error;
    return data;
}

export async function getContactMessages() {
    const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

export async function markMessageAsRead(id: string) {
    const { data, error } = await supabase
        .from('contact_messages')
        .update({ is_read: true })
        .eq('id', id);

    if (error) throw error;
    return data;
}

export async function toggleArchiveMessage(id: string, is_archived: boolean) {
    const { data, error } = await supabase
        .from('contact_messages')
        .update({ is_archived: !is_archived })
        .eq('id', id);

    if (error) throw error;
    return data;
}

export async function moveMessageToTrash(id: string) {
    const { data, error } = await supabase
        .from('contact_messages')
        .update({
            is_deleted: true,
            deleted_at: new Date().toISOString()
        })
        .eq('id', id);

    if (error) throw error;
    return data;
}

export async function restoreFromTrash(id: string) {
    const { data, error } = await supabase
        .from('contact_messages')
        .update({
            is_deleted: false,
            deleted_at: null
        })
        .eq('id', id);

    if (error) throw error;
    return data;
}

export async function deleteMessageForever(id: string) {
    const { data, error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', id);

    if (error) throw error;
    return data;
}

export async function emptyTrash() {
    const { data, error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('is_deleted', true);

    if (error) throw error;
    return data;
}

export async function updateMessageReply(id: string, replyText: string) {
    const { data, error } = await supabase
        .from('contact_messages')
        .update({
            reply_text: replyText,
            replied_at: new Date().toISOString(),
            is_read: true
        })
        .eq('id', id);

    if (error) throw error;
    return data;
}

export async function sendReplyEmail(toEmail: string, toName: string, message: string) {
    const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
        const missing = [];
        if (!SERVICE_ID) missing.push('VITE_EMAILJS_SERVICE_ID');
        if (!TEMPLATE_ID) missing.push('VITE_EMAILJS_TEMPLATE_ID');
        if (!PUBLIC_KEY) missing.push('VITE_EMAILJS_PUBLIC_KEY');
        throw new Error(`Missing EmailJS keys: ${missing.join(', ')}. Please double-check your Vercel Environment Variables and Redeploy.`);
    }

    return emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
            to_email: toEmail,
            to_name: toName,
            message: message,
            reply_to: 'eng.abdullah.sherif@gmail.com'
        },
        PUBLIC_KEY
    );
}
