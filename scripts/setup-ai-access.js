
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://oyluktulqizavhrcmrfd.supabase.co';
const SERVICE_KEY = 'sb_secret_tgJJQ4GeWEj-uWa-ZVGOdw_5PuxwAtB';

async function setup() {
    // Note: If SERVICE_KEY is invalid/mock, this will fail.
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const email = 'robot@example.com';
    const password = 'Password123!';

    console.log(`Setting up user ${email}...`);

    try {
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

        if (listError) {
            console.error('Failed to list users:', listError.message);
            return;
        }

        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
            console.log('User already exists. Updating password...');
            await supabase.auth.admin.updateUserById(existingUser.id, { password: password });
            console.log('Password updated.');
        } else {
            const { data, error } = await supabase.auth.admin.createUser({
                email,
                password,
                email_confirm: true
            });
            if (error) {
                console.error('Failed to create user:', error.message);
                return;
            }
            console.log('User created successfully.');
        }
    } catch (e) {
        console.error('Error:', e.message);
    }
}

setup().catch(console.error);
