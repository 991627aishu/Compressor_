# 🚨 URGENT: Fix Database Connection

## The Problem
Your current Supabase database URL `db.mtbaoaoztqibonyltunv.supabase.co` is not working (ENOTFOUND error).

## 🔧 IMMEDIATE SOLUTION

### Step 1: Create a New Supabase Project
1. Go to: https://supabase.com
2. Click "Start your project"
3. Sign up/Login with GitHub
4. Click "New Project"
5. Choose your organization
6. Fill in:
   - **Name**: `ultra-compressor`
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to you
7. Click "Create new project"
8. Wait 2-3 minutes for setup

### Step 2: Get Your Database URL
1. In your Supabase dashboard, go to **Settings** → **Database**
2. Scroll down to "Connection string"
3. Copy the **URI** format
4. It should look like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[NEW-PROJECT-REF].supabase.co:5432/postgres
   ```

### Step 3: Update Your .env File
1. Open `backend/.env` file
2. Replace the DATABASE_URL with your new one:
   ```
   DATABASE_URL=postgresql://postgres:YOUR_NEW_PASSWORD@db.YOUR_NEW_PROJECT_REF.supabase.co:5432/postgres
   JWT_SECRET=your-super-secret-jwt-key-change-in-production-ultra-compressor-2024
   PORT=5000
   ```
3. Save the file

### Step 4: Test the Connection
1. Restart your server
2. Check console for "✅ Database initialized successfully"
3. Try registration - it should work now!

## 🆘 Alternative: Quick Test Database

If you want to test immediately without Supabase setup:

1. Create `backend/.env` with:
   ```
   DATABASE_URL=postgresql://postgres:password@localhost:5432/testdb
   JWT_SECRET=test-secret-key
   PORT=5000
   ```
2. Install PostgreSQL locally
3. Create database named `testdb`

## ✅ What Will Work After Fix:
- ✅ User registration
- ✅ Email verification
- ✅ Login with verified email only
- ✅ File uploads with auto-delete
- ✅ All protected routes

## ❌ What's Broken Now:
- ❌ Registration (database error)
- ❌ Login (database error)
- ❌ Email verification (database error)
- ✅ File uploads (still work)
- ✅ Auto-delete (still works)
