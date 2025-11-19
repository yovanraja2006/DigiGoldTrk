# Quick Start Guide

Get your DigiGoldTrk app running in 5 minutes!

## Step 1: Supabase Setup (2 minutes)

1. **Create Project**: Go to [app.supabase.com](https://app.supabase.com) → New Project
2. **Get Credentials**: Settings → API → Copy:
   - Project URL
   - anon public key
3. **Enable Email Auth**: Authentication → Providers → Enable "Email"
4. **Create Storage Bucket**: 
   - Storage → New Bucket
   - Name: `payment-screenshots`
   - **Set to PRIVATE** ✓
5. **Run SQL**: 
   - SQL Editor → New Query
   - Copy/paste entire `supabase/schema.sql`
   - Click "Run"
6. **Setup Storage Policies** (via UI, not SQL):
   - Storage → payment-screenshots → Policies tab
   - See [STORAGE_SETUP.md](STORAGE_SETUP.md) for step-by-step
   - Create 3 policies: INSERT, SELECT, DELETE

## Step 2: Local Setup (1 minute)

```bash
# 1. Copy environment file
copy .env.example .env.local

# 2. Edit .env.local with your Supabase credentials
# (Use notepad or your favorite editor)

# 3. Install dependencies (if not already done)
npm install

# 4. Start dev server
npm run dev
```

## Step 3: Test It! (2 minutes)

1. Open http://localhost:3000
2. Sign up with your email (magic link or password)
3. Add a test investment
4. Upload a screenshot
5. See it appear in the list!

## That's It! 🎉

Your app is now running with:
- ✅ Secure authentication
- ✅ Private screenshot storage
- ✅ Row-level security
- ✅ Responsive UI

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Test with multiple accounts to verify data isolation
- Customize the UI to your liking
- Deploy to production (Vercel, Netlify, etc.)

## Need Help?

Check the Troubleshooting section in README.md
