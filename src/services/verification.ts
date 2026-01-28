import { supabase } from './supabase';
import { adminSupabase } from './adminSupabase';
import type { UserProfile } from './profile';

export interface CreatorRequest {
    id?: string;
    user_id?: string;
    status: 'pending' | 'approved' | 'rejected';
    profile_data?: UserProfile;
    admin_note?: string;
    reviewed_by?: string;
    reviewed_at?: string;
    created_at?: string;
    updated_at?: string;
}

/**
 * Submit a creator request
 */
export async function submitCreatorRequest(
    userId: string,
    profileData: UserProfile
): Promise<CreatorRequest> {
    try {
        // Fetch user email to include in the request
        const { data: userData } = await supabase.auth.getUser();
        const userEmail = userData.user?.email;

        const { data, error } = await supabase
            .from('creator_requests')
            .upsert(
                {
                    user_id: userId,
                    status: 'pending',
                    profile_data: { ...profileData, email: userEmail },
                    updated_at: new Date().toISOString(),
                },
                { onConflict: 'user_id' }
            )
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (err) {
        console.error('Error submitting creator request:', err);
        throw err;
    }
}

/**
 * Get user's creator request
 */
export async function getUserRequest(userId: string): Promise<CreatorRequest | null> {
    try {
        const { data, error } = await supabase
            .from('creator_requests')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }

        return data;
    } catch (err) {
        console.error('Error fetching user request:', err);
        throw err;
    }
}


/**
 * Get all pending creator requests (Admin only)
 */
export async function getAllPendingRequests(): Promise<CreatorRequest[]> {
    try {
        // Simple query without joins - user data is in profile_data
        const { data, error } = await adminSupabase
            .from('creator_requests')
            .select('*')
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (err) {
        console.error('Error fetching pending requests:', err);
        throw err;
    }
}

/**
 * Get all verified users (Admin only)
 */
export async function getAllVerifiedUsers(): Promise<any[]> {
    try {
        const { data, error } = await adminSupabase
            .from('user_profiles')
            .select('*')
            .eq('is_verified', true)
            .order('verification_date', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (err) {
        console.error('Error fetching verified users:', err);
        throw err;
    }
}

/**
 * Approve creator request (Admin only)
 */
export async function approveCreatorRequest(
    requestId: string,
    adminId: string,
    adminNote?: string
): Promise<void> {
    try {
        // First, get the request to find the user_id
        const { data: request, error: fetchError } = await adminSupabase
            .from('creator_requests')
            .select('user_id')
            .eq('id', requestId)
            .single();

        if (fetchError) throw fetchError;
        if (!request) throw new Error('Request not found');

        // Update the request status
        const { error: updateRequestError } = await adminSupabase
            .from('creator_requests')
            .update({
                status: 'approved',
                admin_note: adminNote,
                reviewed_by: adminId,
                reviewed_at: new Date().toISOString(),
            })
            .eq('id', requestId);

        if (updateRequestError) throw updateRequestError;

        // Update user_profiles to set is_verified = true
        const { error: updateProfileError } = await adminSupabase
            .from('user_profiles')
            .update({
                is_verified: true,
                verification_date: new Date().toISOString(),
            })
            .eq('user_id', request.user_id);

        if (updateProfileError) throw updateProfileError;
    } catch (err) {
        console.error('Error approving creator request:', err);
        throw err;
    }
}

/**
 * Reject creator request (Admin only)
 */
export async function rejectCreatorRequest(
    requestId: string,
    adminId: string,
    adminNote: string
): Promise<void> {
    try {
        const { error } = await adminSupabase
            .from('creator_requests')
            .update({
                status: 'rejected',
                admin_note: adminNote,
                reviewed_by: adminId,
                reviewed_at: new Date().toISOString(),
            })
            .eq('id', requestId);

        if (error) throw error;
    } catch (err) {
        console.error('Error rejecting creator request:', err);
        throw err;
    }
}

/**
 * Revoke verification (Admin only)
 */
export async function revokeVerification(userId: string): Promise<void> {
    try {
        // Update user_profiles
        const { error: profileError } = await adminSupabase
            .from('user_profiles')
            .update({
                is_verified: false,
                verification_date: null,
            })
            .eq('user_id', userId);

        if (profileError) throw profileError;

        // Update creator_request if exists
        await adminSupabase
            .from('creator_requests')
            .update({ status: 'rejected' })
            .eq('user_id', userId);

        // Ignore error if no request exists
    } catch (err) {
        console.error('Error revoking verification:', err);
        throw err;
    }
}

/**
 * Check if user is verified
 */
export async function isUserVerified(userId: string): Promise<boolean> {
    try {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('is_verified')
            .eq('user_id', userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return false;
            throw error;
        }

        return data?.is_verified || false;
    } catch (err) {
        console.error('Error checking verification status:', err);
        return false;
    }
}

/**
 * Upload profile picture with compression
 */
export async function uploadProfilePicture(
    userId: string,
    file: File
): Promise<{ url: string; fileName: string }> {
    try {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            throw new Error('Only image files are allowed');
        }

        // Compress image before upload
        const compressedBlob = await compressImage(file);

        // Generate unique file name
        const timestamp = Date.now();
        const ext = file.name.split('.').pop() || 'jpg';
        const fileName = `${userId}/avatar_${timestamp}.${ext}`;

        // Delete old avatar if exists
        try {
            const { data: oldFiles } = await supabase.storage
                .from('profile-pictures')
                .list(userId);

            if (oldFiles && oldFiles.length > 0) {
                const filesToDelete = oldFiles.map(f => `${userId}/${f.name}`);
                await supabase.storage.from('profile-pictures').remove(filesToDelete);
            }
        } catch (err) {
            console.log('No old files to delete');
        }

        // Upload compressed image
        const { data, error } = await supabase.storage
            .from('profile-pictures')
            .upload(fileName, compressedBlob, {
                cacheControl: '3600',
                upsert: false,
            });

        if (error) throw error;

        // Get public URL
        const {
            data: { publicUrl },
        } = supabase.storage.from('profile-pictures').getPublicUrl(data.path);

        // Update user profile
        const { error: updateError } = await supabase
            .from('user_profiles')
            .upsert(
                { user_id: userId, avatar_url: publicUrl },
                { onConflict: 'user_id' }
            );

        if (updateError) throw updateError;

        // Also update Auth metadata so things like Header update immediately
        await supabase.auth.updateUser({
            data: { avatar_url: publicUrl }
        });

        return {
            url: publicUrl,
            fileName: file.name,
        };
    } catch (err) {
        console.error('Error uploading profile picture:', err);
        throw err;
    }
}

/**
 * Compress image to reduce file size
 */
async function compressImage(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event: any) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // Resize to max 400x400 while maintaining aspect ratio
                const MAX_SIZE = 400;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_SIZE) {
                        height = (height * MAX_SIZE) / width;
                        width = MAX_SIZE;
                    }
                } else {
                    if (height > MAX_SIZE) {
                        width = (width * MAX_SIZE) / height;
                        height = MAX_SIZE;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                ctx?.drawImage(img, 0, 0, width, height);

                // Convert to blob with 80% quality
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Failed to compress image'));
                        }
                    },
                    'image/jpeg',
                    0.8
                );
            };
            img.onerror = reject;
        };
        reader.onerror = reject;
    });
}

/**
 * Delete profile picture
 */
export async function deleteProfilePicture(userId: string): Promise<void> {
    try {
        // Get all files in user folder
        const { data: files } = await supabase.storage
            .from('profile-pictures')
            .list(userId);

        if (files && files.length > 0) {
            const filesToDelete = files.map(f => `${userId}/${f.name}`);
            const { error } = await supabase.storage
                .from('profile-pictures')
                .remove(filesToDelete);

            if (error) throw error;
        }

        // Update user profile
        const { error: updateError } = await supabase
            .from('user_profiles')
            .update({ avatar_url: null })
            .eq('user_id', userId);

        if (updateError) throw updateError;

        // Also update Auth metadata to remove avatar
        await supabase.auth.updateUser({
            data: { avatar_url: null }
        });
    } catch (err) {
        console.error('Error deleting profile picture:', err);
        throw err;
    }
}
