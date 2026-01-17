
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://oyluktulqizavhrcmrfd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95bHVrdHVscWl6YXZocmNtcmZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NTM1NDEsImV4cCI6MjA4MzUyOTU0MX0.SVHYkjvPBiwv6YH6cyEMPtzAolzqejkDiYR21ykt_18';
// The potentially truncated/weird service key found in .env
const SERVICE_KEY = 'sb_secret_tgJJQ4GeWEj-uWa-ZVGOdw_5PuxwAtB';

async function test() {
    console.log('--- Starting Diagnostics ---');

    // 1. Test Admin/Service Connection
    const adminSupabase = createClient(SUPABASE_URL, SERVICE_KEY);

    // Create a random test email
    const email = `test.delete.${Date.now()}@example.com`;
    const password = 'TestPassword123!';
    let userId = null;

    try {
        console.log(`Creating test user: ${email}...`);
        const { data: userData, error: createError } = await adminSupabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true
        });

        if (createError) {
            console.error('Failed to create test user with Admin API (expected if Service Key is invalid).');
            console.error('Error:', createError.message);
            // We cannot proceed without a logged-in user to test RLS.
            // But we can try logging in with the user's REAL credentials if we had them.
            // Since we don't, we'll try to signup publicly.
            console.log('Attempting public signup...');
            const { data: signUpData, error: signUpError } = await createClient(SUPABASE_URL, SUPABASE_ANON_KEY).auth.signUp({
                email,
                password
            });

            if (signUpError) {
                console.error('Public signup failed:', signUpError.message);
                return;
            }
            if (signUpData.session) {
                console.log('Public signup yielded a session (Email confirm disabled?)');
                userId = signUpData.user.id;
            } else {
                console.log('Public signup requires email confirmation. Cannot proceed.');
                return;
            }
        } else {
            console.log('Test user created via Admin API.');
            userId = userData.user.id;
        }
    } catch (e) {
        console.error('Exception during user creation:', e.message);
    }

    // 2. Login as the user (using Anon key)
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    if (!userId) {
        // Just in case we got here without a user
        console.log('No user created. Trying validation with anonymous connection (will fail RLS)...');
    } else {
        console.log('Logging in...');
        const { data: { session }, error: loginError } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (loginError) {
            console.error('Login failed:', loginError.message);
            console.log('Cannot proceed with RLS testing.');
            return;
        }
        console.log('Logged in successfully.');
    }

    // 3. Test Storage RLS: Delete
    const bucketName = 'documents';
    const testFileName = `test_delete_${Date.now()}.txt`;

    console.log('\n--- Testing Storage Operations ---');

    console.log(`Uploading test file: ${testFileName}...`);
    // Create a dummy file object? node doesn't have File.
    // supabase-js in node accepts Buffer, ArrayBuffer, string...
    const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(testFileName, Buffer.from('Test content'), { upsert: true });

    if (uploadError) {
        console.error('Upload failed:', uploadError.message);
    } else {
        console.log('Upload successful.');

        // TEST DELETE
        console.log(`Attempting to DELETE ${testFileName}...`);
        const { error: deleteError } = await supabase.storage
            .from(bucketName)
            .remove([testFileName]);

        if (deleteError) {
            console.error('DELETE FAILED:', deleteError.message);
        } else {
            console.log('DELETE SUCCESSFUL!');
        }
    }

    // 4. Test DB Update
    console.log('\n--- Testing Database Operations ---');
    const { error: dbError } = await supabase
        .from('profile')
        .update({ cv_url: null })
        .eq('id', 1);

    if (dbError) {
        console.error('Database Update FAILED:', dbError.message);
    } else {
        console.log('Database Update SUCCESSFUL.');
    }

    // Cleanup
    if (userId) {
        console.log('\nCleaning up test user...');
        await adminSupabase.auth.admin.deleteUser(userId);
    }
}

test().catch(console.error);
