# Security Code Setup Guide

Your app now uses a simple security code instead of email authentication. This is perfect for personal use!

## Default Security Code

The default code is: **`1234`**

⚠️ **Important**: Change this immediately after setup for security!

## How to Change Your Security Code

### Method 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase dashboard: https://app.supabase.com
2. Select your project
3. Go to **Table Editor**
4. Select the `app_settings` table
5. Find the row where `setting_key` = `security_code`
6. Click on the `setting_value` cell
7. Change it to your desired code (e.g., `9876` or `mySecretCode123`)
8. Press Enter to save

### Method 2: Using SQL Editor

1. Go to **SQL Editor** in Supabase
2. Run this query (replace `YOUR_NEW_CODE` with your desired code):

```sql
UPDATE public.app_settings 
SET setting_value = 'YOUR_NEW_CODE', updated_at = NOW()
WHERE setting_key = 'security_code';
```

Example:
```sql
UPDATE public.app_settings 
SET setting_value = '9876', updated_at = NOW()
WHERE setting_key = 'security_code';
```

## Security Code Tips

### Good Security Codes
- ✅ `8472` - Random 4-digit number
- ✅ `mySecret2024` - Alphanumeric with meaning to you
- ✅ `GoldTracker!` - Mix of letters and symbols
- ✅ `2024Gold$` - Memorable but unique

### Avoid These
- ❌ `1234` - Too common (default)
- ❌ `0000` - Too simple
- ❌ `password` - Too obvious
- ❌ Your birthday or phone number - Too guessable

## How Authentication Works

1. **First Visit**: You'll see a lock screen asking for security code
2. **Enter Code**: Type your security code and click "Unlock"
3. **Verification**: App checks code against database
4. **Session**: If correct, you're logged in for 24 hours
5. **Auto-Lock**: After 24 hours, you'll need to enter code again

## Session Duration

- Default: **24 hours**
- After 24 hours, you'll be automatically logged out
- You can manually lock the app anytime by clicking the "Lock" button

### To Change Session Duration

Edit `src/App.jsx` and change this line:

```javascript
const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours
```

Examples:
- 1 hour: `1 * 60 * 60 * 1000`
- 12 hours: `12 * 60 * 60 * 1000`
- 7 days: `7 * 24 * 60 * 60 * 1000`

## Testing Your Security Code

1. Open the app: http://localhost:3000
2. You should see the lock screen
3. Enter your security code
4. Click "Unlock"
5. If correct, you'll see the main app
6. If wrong, you'll see an error message

## Troubleshooting

### "Failed to verify security code"
- Make sure you ran `supabase/schema.sql` in SQL Editor
- Check that `app_settings` table exists
- Verify the table has a row with `setting_key` = `security_code`

### Code not working after change
- Clear browser cache and cookies
- Try in incognito/private window
- Verify you saved the change in Supabase
- Check for typos (codes are case-sensitive!)

### Forgot your security code?
1. Go to Supabase → Table Editor → `app_settings`
2. View the `setting_value` for `security_code`
3. Or reset it to a new code using SQL Editor

## Security Notes

### This is NOT for Multi-User Apps
- This security code system is designed for **personal use only**
- Everyone who knows the code has full access
- There's no user accounts or permissions
- Perfect for: Personal tracking, family use, single-user apps

### For Better Security
- Don't share your security code
- Change it regularly (monthly recommended)
- Use a strong, unique code
- Don't write it down in obvious places
- Consider using a password manager

### If You Need Multi-User
If you need multiple users with separate data, you should use the original email authentication system. The security code system is intentionally simple for single-user scenarios.

## Advanced: Multiple Security Codes

You can add multiple codes for different purposes:

```sql
-- Add a backup code
INSERT INTO public.app_settings (setting_key, setting_value)
VALUES ('backup_code', 'emergency123');
```

Then modify `Auth.jsx` to check both codes:

```javascript
// Check primary or backup code
const primaryCode = data.find(d => d.setting_key === 'security_code')
const backupCode = data.find(d => d.setting_key === 'backup_code')

if (securityCode === primaryCode?.setting_value || 
    securityCode === backupCode?.setting_value) {
  // Allow access
}
```

## Quick Reference

| Action | Location | Method |
|--------|----------|--------|
| View current code | Table Editor → app_settings | Look at setting_value |
| Change code | Table Editor or SQL Editor | Update setting_value |
| Reset to default | SQL Editor | `UPDATE ... SET setting_value = '1234'` |
| Add backup code | SQL Editor | `INSERT INTO app_settings ...` |
| Change session time | src/App.jsx | Edit SESSION_DURATION |

---

**Remember**: After changing your code, test it immediately to make sure it works!
