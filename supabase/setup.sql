-- ============================================================================
-- COMPLETE DATABASE SETUP FOR DIGITAL GOLD TRACKER
-- ============================================================================
-- This file contains everything you need to set up your database
-- Run this entire file in Supabase SQL Editor
-- ============================================================================

-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- STEP 1: DROP EXISTING TABLES (Clean slate)
-- ============================================================================
-- Warning: This will delete all existing data!
DROP TABLE IF EXISTS public.investments CASCADE;
DROP TABLE IF EXISTS public.app_settings CASCADE;

-- ============================================================================
-- STEP 2: CREATE APP SETTINGS TABLE
-- ============================================================================
-- This table stores your security code and other app settings
CREATE TABLE public.app_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default security code
-- IMPORTANT: Change '1234' to your preferred security code!
INSERT INTO public.app_settings (setting_key, setting_value)
VALUES ('security_code', '1234')
ON CONFLICT (setting_key) DO NOTHING;

-- ============================================================================
-- STEP 3: CREATE INVESTMENTS TABLE
-- ============================================================================
-- This table stores all your gold and silver investment records
CREATE TABLE public.investments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    grams NUMERIC(12, 4) CHECK (grams > 0),
    currency TEXT NOT NULL CHECK (currency IN ('Gold', 'Silver')),
    screenshot_path TEXT,
    receipt_url TEXT
);

-- Add comment to explain the grams column
COMMENT ON COLUMN public.investments.grams IS 'Weight in grams (or pavan for gold)';

-- Create index for efficient querying by date
CREATE INDEX idx_investments_created 
ON public.investments(created_at DESC);

-- ============================================================================
-- STEP 4: ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 5: CREATE RLS POLICIES
-- ============================================================================

-- Policy for investments table: Allow all operations for anonymous users
-- (We use security code for protection, not Supabase Auth)
CREATE POLICY "Allow all operations for anon users"
ON public.investments
FOR ALL
TO anon
USING (true)
WITH CHECK (true);

-- Policy for app_settings table: Allow reading security code for login
CREATE POLICY "Allow reading settings for anon"
ON public.app_settings
FOR SELECT
TO anon
USING (setting_key = 'security_code');

-- ============================================================================
-- STEP 6: VERIFY SETUP
-- ============================================================================

-- Check that tables were created
SELECT 'Tables created successfully!' as status;

-- Show all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('investments', 'app_settings');

-- Show RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    roles,
    cmd as operation
FROM pg_policies 
WHERE tablename IN ('investments', 'app_settings')
ORDER BY tablename, policyname;

-- Show current security code (for verification)
SELECT 
    setting_key,
    setting_value,
    created_at
FROM public.app_settings
WHERE setting_key = 'security_code';

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================
-- Next steps:
-- 1. Change your security code (see below)
-- 2. Setup storage policies for screenshots (see STORAGE_SETUP.md)
-- 3. Test your app at http://localhost:5173
-- ============================================================================

-- ============================================================================
-- OPTIONAL: CHANGE YOUR SECURITY CODE
-- ============================================================================
-- Uncomment and modify the line below to change your security code
-- Replace 'YOUR_NEW_CODE' with your desired code (numbers only recommended)

-- UPDATE public.app_settings 
-- SET setting_value = 'YOUR_NEW_CODE', updated_at = NOW()
-- WHERE setting_key = 'security_code';

-- Examples:
-- UPDATE public.app_settings SET setting_value = '9876', updated_at = NOW() WHERE setting_key = 'security_code';
-- UPDATE public.app_settings SET setting_value = '123456', updated_at = NOW() WHERE setting_key = 'security_code';
-- UPDATE public.app_settings SET setting_value = '0000', updated_at = NOW() WHERE setting_key = 'security_code';

-- ============================================================================
-- OPTIONAL: ADD BACKUP SECURITY CODE
-- ============================================================================
-- Uncomment to add a backup code (in case you forget your main code)

-- INSERT INTO public.app_settings (setting_key, setting_value)
-- VALUES ('backup_code', '0000')
-- ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value;

-- ============================================================================
-- USEFUL QUERIES FOR LATER
-- ============================================================================

-- View all investments
-- SELECT * FROM public.investments ORDER BY created_at DESC;

-- Count total investments
-- SELECT COUNT(*) as total_investments FROM public.investments;

-- Calculate total invested by currency
-- SELECT 
--     currency,
--     COUNT(*) as count,
--     SUM(amount) as total_amount,
--     SUM(grams) as total_grams
-- FROM public.investments
-- GROUP BY currency;

-- View investments with grams
-- SELECT 
--     created_at,
--     amount,
--     grams,
--     currency
-- FROM public.investments
-- WHERE grams IS NOT NULL
-- ORDER BY created_at DESC;

-- View all settings
-- SELECT * FROM public.app_settings;

-- Delete all investments (use with caution!)
-- DELETE FROM public.investments;

-- Reset security code to default
-- UPDATE public.app_settings SET setting_value = '1234' WHERE setting_key = 'security_code';

-- ============================================================================
-- MIGRATION: If you already have data and need to add grams column
-- ============================================================================
-- If you're upgrading from an older version without grams column, run this:

-- ALTER TABLE public.investments 
-- ADD COLUMN IF NOT EXISTS grams NUMERIC(12, 4) CHECK (grams > 0);

-- COMMENT ON COLUMN public.investments.grams IS 'Weight in grams (or pavan for gold)';

-- ============================================================================
-- END OF SETUP
-- ============================================================================
