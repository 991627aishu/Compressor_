# Database Setup Instructions

## To fix the database connection error, you need to create a `.env` file:

1. **Create a `.env` file** in the `backend/` directory
2. **Add your Supabase database URL** to the file

## Option 1: Use Supabase (Recommended)

If you have a Supabase project:

```
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

To get your Supabase URL:
1. Go to your Supabase project dashboard
2. Go to Settings > Database
3. Copy the "Connection string" and replace `[YOUR-PASSWORD]` with your database password

## Option 2: Use Local PostgreSQL

If you want to use a local PostgreSQL database:

```
DATABASE_URL=postgresql://username:password@localhost:5432/compressor_db
```

## Option 3: Use Supabase Template (Quick Setup)

For testing, you can use this template (replace with your actual details):

```
DATABASE_URL=postgresql://postgres:your_password@db.your_project_ref.supabase.co:5432/postgres
JWT_SECRET=your-super-secret-jwt-key-change-in-production-ultra-compressor-2024
PORT=5000
```

## After creating the .env file:

1. Save the file
2. Restart your server: `npm start`
3. The database connection should work and email verification will be enabled

## If you don't have a Supabase account:

1. Go to https://supabase.com
2. Sign up for a free account
3. Create a new project
4. Get your database URL from Settings > Database
5. Create the .env file with your URL
