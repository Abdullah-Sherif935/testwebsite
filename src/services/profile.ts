import { supabase } from './supabase';

// ==================== ADMIN SETTINGS (Site-wide) ====================

/**
 * Get the global admin CV URL from admin_settings table
 */
export const getAdminCVUrl = async () => {
    try {
        const { data, error } = await supabase
            .from('admin_settings')
            .select('value')
            .eq('key', 'main_cv')
            .maybeSingle();

        if (error) throw error;
        return data?.value || null;
    } catch (error) {
        console.error('Error fetching admin CV:', error);
        return null;
    }
};

/**
 * Update the global admin CV URL
 */
export const updateAdminCV = async (url: string | null, client = supabase) => {
    try {
        const { error } = await client
            .from('admin_settings')
            .upsert({
                key: 'main_cv',
                value: url,
                updated_at: new Date().toISOString()
            }, { onConflict: 'key' });

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error updating admin CV:', error);
        throw error;
    }
};

export const getCVUrl = async () => {
    // Priority: Admin settings, then fallback to first library profile
    const adminCv = await getAdminCVUrl();
    if (adminCv) return adminCv;

    try {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('cv_file_url')
            .order('created_at', { ascending: true })
            .limit(1)
            .maybeSingle();

        if (error) throw error;
        return data?.cv_file_url;
    } catch (error) {
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

// ==================== USER PROFESSIONAL PROFILES ====================

// Type definitions for user profile data
export interface UserProject {
    title: string;
    description: string;
    link?: string;
}

export interface UserExperience {
    title: string;
    company: string;
    description: string;
    from: string;
    to?: string;
}

export interface UserProfile {
    id?: string;
    user_id?: string;
    full_name_ar?: string;
    full_name_en?: string;
    birth_date?: string;
    governorate?: string;
    education_status?: 'student' | 'graduate';
    university?: string;
    faculty?: string;
    department?: string;
    projects?: UserProject[];
    experiences?: UserExperience[];
    skills?: string[];
    about_me?: string;
    linkedin_url?: string;
    cv_file_url?: string;
    cv_file_name?: string;
    cv_file_size?: number;
    is_verified?: boolean;
    avatar_url?: string;
    email?: string;
    verification_date?: string;
    created_at?: string;
    updated_at?: string;
    last_name_update?: string;
}

/**
 * Get user's professional profile
 */
export async function getUserProfile(userId: string, client = supabase): Promise<UserProfile | null> {
    try {
        const { data, error } = await client
            .from('user_profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) {
            // If profile doesn't exist, return null (not an error)
            if (error.code === 'PGRST116') {
                return null;
            }
            throw error;
        }

        return data;
    } catch (err) {
        console.error('Error fetching user profile:', err);
        throw err;
    }
}

/**
 * Create or update user's professional profile
 */
export async function upsertUserProfile(
    userId: string,
    profileData: Partial<UserProfile>,
    client = supabase
): Promise<UserProfile> {
    try {
        // Remove ID fields that shouldn't be updated
        const { id, user_id, created_at, updated_at, ...dataToUpsert } = profileData;

        const { data, error } = await client
            .from('user_profiles')
            .upsert(
                {
                    user_id: userId,
                    ...dataToUpsert,
                },
                {
                    onConflict: 'user_id',
                }
            )
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (err) {
        console.error('Error upserting user profile:', err);
        throw err;
    }
}

/**
 * Upload CV PDF file to storage
 */
export async function uploadUserCV(
    userId: string,
    file: File,
    client = supabase
): Promise<{ url: string; fileName: string; size: number }> {
    try {
        // Validate file type
        if (file.type !== 'application/pdf') {
            throw new Error('Only PDF files are allowed');
        }

        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            throw new Error('File size must be less than 5MB');
        }

        // Generate unique file name
        const timestamp = Date.now();
        const fileName = `${userId}/cv_${timestamp}.pdf`;

        // Delete old CV if exists
        const profile = await getUserProfile(userId, client);
        if (profile?.cv_file_url) {
            await deleteUserCV(userId, client);
        }

        // Upload to storage
        const { data, error } = await client.storage
            .from('author-documents')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: true,
            });

        if (error) throw error;

        // Get public URL
        const {
            data: { publicUrl },
        } = client.storage.from('author-documents').getPublicUrl(data.path);

        // Update profile with CV info
        await upsertUserProfile(userId, {
            cv_file_url: publicUrl,
            cv_file_name: file.name,
            cv_file_size: file.size,
        }, client);

        return {
            url: publicUrl,
            fileName: file.name,
            size: file.size,
        };
    } catch (err) {
        console.error('Error uploading CV:', err);
        throw err;
    }
}

/**
 * Delete CV file from storage
 */
export async function deleteUserCV(userId: string, client = supabase): Promise<void> {
    try {
        const profile = await getUserProfile(userId, client);
        if (!profile?.cv_file_url) {
            return; // No CV to delete
        }

        // Extract file path from URL (Handles any bucket name correctly)
        const pathParts = profile.cv_file_url.split('/public/');
        if (pathParts.length < 2) throw new Error('Invalid URL');

        // The first part of the remaining string is the bucket name, the rest is the path
        const fullPath = pathParts[1];
        const bucketAndPath = fullPath.split('/');
        const bucketName = bucketAndPath[0];
        const filePath = bucketAndPath.slice(1).join('/');

        // Delete from storage
        const { error } = await client.storage.from(bucketName).remove([filePath]);

        if (error) throw error;

        // Update profile to remove CV info
        await upsertUserProfile(userId, {
            cv_file_url: null as any,
            cv_file_name: null as any,
            cv_file_size: null as any,
        }, client);
    } catch (err) {
        console.error('Error deleting CV:', err);
        throw err;
    }
}

/**
 * Download CV file
 */
export async function downloadUserCV(userId: string): Promise<Blob | null> {
    try {
        const profile = await getUserProfile(userId);
        if (!profile?.cv_file_url) {
            return null;
        }

        // Extract file path from URL
        const pathParts = profile.cv_file_url.split('/public/');
        if (pathParts.length < 2) throw new Error('Invalid URL');

        const fullPath = pathParts[1];
        const bucketAndPath = fullPath.split('/');
        const bucketName = bucketAndPath[0];
        const filePath = bucketAndPath.slice(1).join('/');

        const { data, error } = await supabase.storage.from(bucketName).download(filePath);

        if (error) throw error;
        return data;
    } catch (err) {
        console.error('Error downloading CV:', err);
        throw err;
    }
}

/**
 * Delete user account permanently
 */
export async function deleteUserAccount(): Promise<void> {
    try {
        const { error } = await supabase.rpc('delete_own_account');
        if (error) throw error;
    } catch (err) {
        console.error('Error deleting account:', err);
        throw err;
    }
}
