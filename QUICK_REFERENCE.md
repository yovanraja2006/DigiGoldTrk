# Quick Reference Card

## 🚀 Setup in 3 Steps

### 1️⃣ Database (2 min)
```
Supabase → SQL Editor → Run: supabase/complete-setup.sql
```

### 2️⃣ Storage (2 min)
```
Storage → payment-screenshots → Policies → Create 3 policies
See: STORAGE_SETUP.md
```

### 3️⃣ Test (30 sec)
```
http://localhost:3000 → Enter: 1234 → Unlock
```

## 🔐 Security Code

**Default:** `1234`

**Change it:**
```
Supabase → Table Editor → app_settings → Edit setting_value
```

**Or SQL:**
```sql
UPDATE public.app_settings 
SET setting_value = 'YOUR_CODE' 
WHERE setting_key = 'security_code';
```

## 📁 Key Files

| File | Purpose |
|------|---------|
| `supabase/complete-setup.sql` | **Run this first!** Complete database setup |
| `STORAGE_SETUP.md` | How to setup storage policies |
| `DATABASE_SETUP.md` | Detailed database guide |
| `SECURITY_CODE_SETUP.md` | How to change your code |
| `FIX_RLS_ERROR.md` | Fix RLS policy errors |

## 🐛 Common Issues

| Error | Fix |
|-------|-----|
| "new row violates RLS policy" | Run `supabase/complete-setup.sql` |
| "Failed to verify security code" | Check Table Editor → app_settings |
| "Failed to upload screenshot" | Setup storage policies (STORAGE_SETUP.md) |
| Code not working | Case-sensitive! Check spelling |

## 📊 Useful SQL Queries

### View all investments
```sql
SELECT * FROM public.investments ORDER BY created_at DESC;
```

### Calculate totals
```sql
SELECT 
    currency,
    COUNT(*) as count,
    SUM(amount) as total
FROM public.investments
GROUP BY currency;
```

### Change security code
```sql
UPDATE public.app_settings 
SET setting_value = 'NEW_CODE' 
WHERE setting_key = 'security_code';
```

### Reset to default
```sql
UPDATE public.app_settings 
SET setting_value = '1234' 
WHERE setting_key = 'security_code';
```

### Delete all investments
```sql
DELETE FROM public.investments;
```

## 🎯 App Features

- ✅ Security code protection
- ✅ Track gold/silver investments
- ✅ Upload payment screenshots
- ✅ View investment history
- ✅ Calculate running total
- ✅ Export to CSV
- ✅ Delete with confirmation
- ✅ Mobile responsive
- ✅ 24-hour sessions
- ✅ Manual lock button

## 🔧 Configuration

### Session Duration
Edit `src/App.jsx`:
```javascript
const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours
```

### App Title
Edit `index.html` and component files

### Colors
Edit Tailwind classes in components

## 📱 How It Works

```
1. Open app → Lock screen
2. Enter code → Verify in database
3. Correct? → Save session (24h)
4. Show main app
5. Add investments
6. Auto-lock after 24h
```

## 🔒 Security

- Security code in database
- Session in localStorage
- RLS enabled on tables
- Private storage bucket
- Anon user policies
- Perfect for personal use

## 📞 Help

| Question | Answer |
|----------|--------|
| How to setup? | Run `complete-setup.sql` |
| Change code? | `SECURITY_CODE_SETUP.md` |
| RLS error? | `FIX_RLS_ERROR.md` |
| Storage issues? | `STORAGE_SETUP.md` |
| Full docs? | `README_SECURITY_CODE.md` |

## ⚡ Quick Commands

### Start dev server
```bash
npm run dev
```

### Build for production
```bash
npm run build
```

### Preview production build
```bash
npm run preview
```

## 🎉 You're Ready!

1. Run `supabase/complete-setup.sql`
2. Setup storage policies
3. Open http://localhost:3000
4. Enter code: `1234`
5. Start tracking! 🚀

---

**Default Security Code:** `1234` (change it!)

**App URL:** http://localhost:3000
