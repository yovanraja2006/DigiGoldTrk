# Digital Gold Tracker

A modern, responsive React app for tracking your daily gold and silver investments with secure authentication and private screenshot storage.

## ✨ Features

- 🔐 **Security Code Access** - Simple PIN protection (no email signup)
- 💰 **Track Investments** - Record gold and silver purchases
- 📸 **Screenshot Storage** - Upload payment screenshots to private storage
- 📊 **Dashboard** - Real-time statistics and totals
- 🔍 **Search & Filter** - Find investments quickly
- 📄 **Pagination** - 10 entries per page
- 📱 **Mobile Responsive** - Works on all devices
- 📥 **CSV Export** - Download your investment history

## 🚀 Quick Setup

### 1. Supabase Setup

1. Create project at [app.supabase.com](https://app.supabase.com)
2. Go to SQL Editor → New Query
3. Copy/paste entire `supabase/complete-setup.sql` and run it
4. Create storage bucket: `payment-screenshots` (Private)
5. Add storage policies via UI (see STORAGE_SETUP.md)

### 2. Local Setup

```bash
# Copy environment file
copy .env.example .env.local

# Edit .env.local with your Supabase credentials
# Get from: Supabase → Settings → API

# Install dependencies
npm install

# Start dev server
npm run dev
```

### 3. First Login

- Open http://localhost:3000
- Enter default code: **`1234`**
- **Important**: Change the security code immediately!

## 🔐 Change Security Code

**Default code is `1234` - Change it now!**

1. Supabase → Table Editor → `app_settings`
2. Find row where `setting_key` = `security_code`
3. Change `setting_value` to your code
4. Save

Or run SQL:
```sql
UPDATE public.app_settings 
SET setting_value = 'YOUR_NEW_CODE' 
WHERE setting_key = 'security_code';
```

## 📚 Documentation

- **QUICKSTART.md** - 5-minute setup guide
- **SECURITY_CODE_SETUP.md** - How to change your code
- **STORAGE_SETUP.md** - Setup storage policies
- **DATABASE_SETUP.md** - Database setup guide
- **QUICK_REFERENCE.md** - Quick reference
- **RLS_FIX.md** - Troubleshooting

## 🛠️ Tech Stack

- React 18 + Vite 5
- Supabase (Auth, Postgres, Storage)
- Tailwind CSS 3
- Custom security code authentication

## 📊 Features Overview

### Dashboard
- Total invested amount
- Gold/Silver breakdown
- Average investment
- Entry count

### Investment Management
- Add investments with amount and currency
- Upload payment screenshots
- Add receipt URLs and notes
- View investment history

### Search & Filter
- Search by amount, currency, or notes
- Filter by currency type
- Sort 6 different ways
- Pagination (10 per page)

### Security
- Security code protection
- Private storage bucket
- Row-Level Security (RLS)
- Session management (24 hours)

## 🐛 Troubleshooting

### "new row violates row-level security policy"
- Run `supabase/complete-setup.sql` in SQL Editor
- Sign out and sign back in

### "Failed to upload screenshot"
- Create storage policies via UI (see STORAGE_SETUP.md)
- Verify bucket is private

### Code not working
- Codes are case-sensitive
- Check Supabase Table Editor
- Verify in `.env.local`

## ⚠️ Important Notes

### Single-User App
- Anyone with the code has full access
- No separate user accounts
- Perfect for personal use

### Security
- Change default code immediately
- Use strong, unique code
- Don't share your code
- Private storage bucket

## 📝 License

MIT - Free to use for personal or commercial projects

---

**Ready to start?** Run `npm run dev` and enter code `1234` to unlock!

Don't forget to change the default security code!
