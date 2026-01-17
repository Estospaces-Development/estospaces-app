# Supabase Setup for Waitlist Feature

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in/create an account
2. Click "New Project"
3. Fill in your project details:
   - Name: `estospaces-mvp` (or your preferred name)
   - Database Password: Create a strong password (save this!)
   - Region: Choose closest to your users
4. Click "Create new project" and wait for it to initialize

## Step 2: Create the Waitlist Table

1. In your Supabase dashboard, go to the **SQL Editor**
2. Click "New Query"
3. Copy and paste the following SQL:

```sql
-- Create waitlist table
CREATE TABLE waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_type TEXT NOT NULL CHECK (user_type IN ('buyer', 'renter', 'seller')),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  location TEXT NOT NULL,
  looking_for TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX idx_waitlist_user_type ON waitlist(user_type);
CREATE INDEX idx_waitlist_created_at ON waitlist(created_at DESC);
CREATE INDEX idx_waitlist_email ON waitlist(email);

-- Enable Row Level Security
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts from anyone (for waitlist signup)
CREATE POLICY "Allow public inserts" ON waitlist
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create policy to allow you to read all data (for analytics)
CREATE POLICY "Allow authenticated reads" ON waitlist
  FOR SELECT
  TO authenticated
  USING (true);
```

4. Click "Run" to execute the SQL

## Step 3: Get Your API Credentials

1. In your Supabase dashboard, go to **Project Settings** (gear icon)
2. Click on **API** in the left sidebar
3. You'll see two important values:
   - **Project URL**: Looks like `https://xxxxx.supabase.co`
   - **anon public** key: A long string starting with `eyJ...`

## Step 4: Add Credentials to Your App

1. In your project root, create a file named `.env.local` (if it doesn't exist)
2. Add the following lines, replacing with your actual values:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

3. Save the file
4. **Restart your dev server** (`npm run dev`) for the changes to take effect

## Step 5: Test the Integration

1. Open your app in the browser
2. Click "Reserve Your Spot" or "Join Waitlist"
3. Fill out the form and submit
4. Go to your Supabase dashboard → **Table Editor** → **waitlist**
5. You should see your test entry!

## Viewing and Analyzing Data

### View All Waitlist Entries
```sql
SELECT * FROM waitlist ORDER BY created_at DESC;
```

### Count by User Type
```sql
SELECT user_type, COUNT(*) as count
FROM waitlist
GROUP BY user_type
ORDER BY count DESC;
```

### Recent Signups (Last 7 Days)
```sql
SELECT *
FROM waitlist
WHERE created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

### Export to CSV
1. Go to **Table Editor** → **waitlist**
2. Click the "..." menu → "Download as CSV"

## Security Notes

- The `anon` key is safe to use in your frontend code
- Row Level Security (RLS) ensures users can only insert, not read others' data
- Only authenticated users (you) can view the full waitlist data
- Never commit `.env.local` to Git (it's already in `.gitignore`)

## Troubleshooting

**Error: "Failed to join waitlist"**
- Check that your `.env.local` file has the correct credentials
- Restart your dev server after adding credentials
- Check browser console for specific error messages

**Error: "This email is already registered"**
- This is expected behavior - each email can only join once
- The database enforces email uniqueness

**Can't see data in Supabase**
- Make sure you're looking at the correct project
- Check that the SQL script ran successfully
- Try refreshing the Table Editor page
