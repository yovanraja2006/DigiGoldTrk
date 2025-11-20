# Grams Column Migration Guide

## Overview
This migration adds a `grams` column to track the weight of gold and silver investments.

## What's New
- **Grams field** in the investment form (optional)
- **Total grams display** in Dashboard cards for Gold and Silver
- **Database column** to store weight data

## Migration Steps

### 1. Run the SQL Migration
Open your Supabase SQL Editor and run the migration file:

```sql
-- File: add-grams-column.sql
ALTER TABLE public.investments 
ADD COLUMN IF NOT EXISTS grams NUMERIC(12, 4) CHECK (grams > 0);
```

Or simply copy and paste this command in the SQL Editor.

### 2. Verify the Migration
After running the migration, verify it worked:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'investments' 
AND column_name = 'grams';
```

You should see:
- column_name: `grams`
- data_type: `numeric`
- is_nullable: `YES`

### 3. Test the Feature
1. Add a new investment with grams value
2. Check the Dashboard - you should see total grams displayed under Gold/Silver cards
3. Existing investments without grams will still work fine

## Features

### Dashboard Display
- **Gold Card**: Shows total grams of gold (if any entries have grams)
- **Silver Card**: Shows total grams of silver (if any entries have grams)
- Format: `X.XXXX g` (4 decimal places for precision)

### Investment Form
- New optional field: "Weight in Grams (or Pavan)"
- For Gold: Accepts grams or pavan (1 pavan = 8 grams)
- For Silver: Accepts grams
- Supports up to 4 decimal places

### History Table
- History table continues to show amounts in rupees
- Grams are NOT displayed in the history list
- Grams are only shown in Dashboard summary cards

## Notes
- The `grams` field is **optional** - you can still add investments without it
- Existing investments will have `NULL` for grams (won't affect anything)
- Grams are stored with 4 decimal precision for accuracy
- Only investments with grams > 0 will contribute to the total grams display

## Rollback (if needed)
If you need to remove the grams column:

```sql
ALTER TABLE public.investments DROP COLUMN IF EXISTS grams;
```

**Warning**: This will permanently delete all grams data!
