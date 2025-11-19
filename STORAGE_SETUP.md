# Storage Bucket Setup Guide

Storage policies **cannot** be created via SQL. You must use the Supabase UI.

## Step 1: Create the Bucket (if not done)

1. Go to your Supabase dashboard: https://app.supabase.com
2. Select your project
3. Click **Storage** in the left sidebar
4. Click **Create a new bucket**
5. Name: `payment-screenshots`
6. **IMPORTANT**: Keep it **Private** (uncheck "Public bucket")
7. Click **Create bucket**

## Step 2: Add Storage Policies

### Navigate to Policies

1. In **Storage**, click on the `payment-screenshots` bucket
2. Click the **Policies** tab at the top
3. You should see "No policies created yet"

### Policy 1: Allow Uploads (INSERT)

1. Click **New Policy**
2. Choose **"For full customization"** (not a template)
3. Fill in:
   - **Policy name**: `Authenticated users can upload`
   - **Allowed operation**: Check **INSERT** only
   - **Policy definition**: 
     ```sql
     bucket_id = 'payment-screenshots'
     ```
   - **Target roles**: Select **authenticated**
4. Click **Review** then **Save policy**

### Policy 2: Allow Viewing (SELECT)

1. Click **New Policy** again
2. Choose **"For full customization"**
3. Fill in:
   - **Policy name**: `Users can view files`
   - **Allowed operation**: Check **SELECT** only
   - **Policy definition**: 
     ```sql
     bucket_id = 'payment-screenshots'
     ```
   - **Target roles**: Select **authenticated**
4. Click **Review** then **Save policy**

### Policy 3: Allow Deletion (DELETE)

1. Click **New Policy** again
2. Choose **"For full customization"**
3. Fill in:
   - **Policy name**: `Users can delete files`
   - **Allowed operation**: Check **DELETE** only
   - **Policy definition**: 
     ```sql
     bucket_id = 'payment-screenshots'
     ```
   - **Target roles**: Select **authenticated**
4. Click **Review** then **Save policy**

## Step 3: Verify Policies

You should now see 3 policies listed:
- ✅ Authenticated users can upload (INSERT)
- ✅ Users can view files (SELECT)
- ✅ Users can delete files (DELETE)

## Alternative: Quick Template Method

If you want a faster setup (less secure but works):

1. Click **New Policy**
2. Choose template: **"Allow authenticated uploads"**
3. Click **Use this template**
4. Repeat for **"Allow authenticated reads"**
5. Repeat for **"Allow authenticated deletes"**

## Testing

After setting up policies:

1. Go back to your app: http://localhost:3000
2. Sign in (or create account)
3. Try adding an investment with a screenshot
4. Should upload successfully!

## Troubleshooting

### "new row violates row-level security policy"
- This is about the **database** table, not storage
- Run `supabase/schema.sql` in SQL Editor
- Sign out and back in

### "Failed to upload screenshot"
- Check that all 3 storage policies are created
- Verify bucket name is exactly `payment-screenshots`
- Check that bucket is **Private** (not public)
- Make sure you're signed in (check debug panel)

### "Unable to load screenshot"
- This is normal if bucket is private
- The app uses signed URLs which expire after 1 hour
- Click "View" again to generate a new signed URL

## More Restrictive Policies (Optional)

For better security, you can restrict users to only access their own files:

**Policy definition for INSERT:**
```sql
bucket_id = 'payment-screenshots' AND (storage.foldername(name))[1] = auth.uid()::text
```

**Policy definition for SELECT:**
```sql
bucket_id = 'payment-screenshots' AND (storage.foldername(name))[1] = auth.uid()::text
```

**Policy definition for DELETE:**
```sql
bucket_id = 'payment-screenshots' AND (storage.foldername(name))[1] = auth.uid()::text
```

This ensures users can only access files in their own folder (userId/filename.jpg).

The app already organizes files this way in `EntryForm.jsx`:
```javascript
const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
```

## Need Help?

- Check Supabase Storage docs: https://supabase.com/docs/guides/storage
- Verify you're on the correct project
- Make sure you have owner/admin access to the project
