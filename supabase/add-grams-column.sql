-- ============================================================================
-- ADD GRAMS COLUMN TO INVESTMENTS TABLE
-- ============================================================================
-- This migration adds a 'grams' column to track weight of gold/silver
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Add grams column to investments table
ALTER TABLE public.investments 
ADD COLUMN IF NOT EXISTS grams NUMERIC(12, 4) CHECK (grams > 0);

-- Add comment to explain the column
COMMENT ON COLUMN public.investments.grams IS 'Weight in grams (or pavan for gold)';

-- Verify the column was added
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'investments' 
AND column_name = 'grams';

-- ============================================================================
-- MIGRATION COMPLETE!
-- ============================================================================
-- The 'grams' column has been added to track weight
-- Existing records will have NULL for grams (optional field)
-- New investments can include grams value
-- ============================================================================
