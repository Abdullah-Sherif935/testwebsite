import { supabase } from './supabase';

export const getCVUrl = async () => {
    try {
        const { data, error } = await supabase
            .from('profile')
            .select('cv_url')
            .limit(1)
            .single();

        if (error) throw error;
        return data?.cv_url;
    } catch (error) {
        console.error('Error fetching CV URL:', error);
        return null;
    }
};

export const updateCV = async (file: File) => {
    try {
        // 1. Upload file to 'documents' bucket
        const fileExt = file.name.split('.').pop();
        const fileName = `cv_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('documents')
            .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        // 2. Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('documents')
            .getPublicUrl(filePath);

        // 3. Update 'profile' table (assuming id=1 for the main profile)
        const { error: dbError } = await supabase
            .from('profile')
            .upsert({ id: 1, cv_url: publicUrl });

        if (dbError) throw dbError;

        return publicUrl;
    } catch (error) {
        console.error('Error updating CV:', error);
        throw error;
    }
};

export const deleteCV = async (url: string) => {
    try {
        // 1. Extract file path from URL
        // Example: https://.../storage/v1/object/public/documents/cv_123.pdf
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/');
        const rawFileName = pathParts[pathParts.length - 1]; // Get the last segment
        const fileName = decodeURIComponent(rawFileName);

        if (!fileName) throw new Error('Invalid URL format');

        console.log('Attempting to delete file:', fileName);

        // 2. Delete from storage
        const { error: storageError } = await supabase.storage
            .from('documents')
            .remove([fileName]);

        if (storageError) throw storageError;

        // 3. Update profile table to null
        const { error: dbError } = await supabase
            .from('profile')
            .update({ cv_url: null })
            .eq('id', 1);

        if (dbError) throw dbError;

        return true;
    } catch (error) {
        console.error('Error deleting CV:', error);
        throw error;
    }
};
