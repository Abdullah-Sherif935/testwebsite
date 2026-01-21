-- Create admin_settings table for global site configuration
CREATE TABLE IF NOT EXISTS public.admin_settings (
    id SERIAL PRIMARY KEY,
    key TEXT UNIQUE NOT NULL, -- e.g., 'main_cv'
    value TEXT, -- URL or setting value
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read-only access
CREATE POLICY "Allow public read-only access to admin_settings"
    ON public.admin_settings FOR SELECT USING (true);

-- Allow authenticated admins to manage settings
-- Note: Assuming admin users are identified by their 'authenticated' role or specific metadata
-- For simplicity, allowing any authenticated user for now, but in a multi-user system, 
-- this would check for an 'is_admin' flag in user_profiles.
CREATE POLICY "Allow all actions for authenticated admin"
    ON public.admin_settings FOR ALL USING (auth.role() = 'authenticated');

-- Insert initial empty main_cv row
INSERT INTO public.admin_settings (key, value) 
VALUES ('main_cv', null)
ON CONFLICT (key) DO NOTHING;
