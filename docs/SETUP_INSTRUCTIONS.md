# Quick Setup Instructions - UK Properties

## 🚨 Error: "Could not find the table 'public.properties'"

This error means the database tables haven't been created yet. Follow these steps:

## Step 1: Create Tables in Supabase

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project: **Estospaces-App** (yydtsteyknbpfpxjtlxe)

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run the Setup Script**
   - Open the file: `supabase_setup_properties.sql` in your project
   - Copy the **entire contents** of the file
   - Paste into the SQL Editor
   - Click **Run** (or press Cmd/Ctrl + Enter)

4. **Verify Tables Created**
   - Go to "Table Editor" in the left sidebar
   - You should see these tables:
     - `properties`
     - `saved_properties`
     - `applied_properties`
     - `viewed_properties`

## Step 2: Verify Sample Data

After running the SQL, you should have 10 sample UK properties inserted automatically. To verify:

1. Go to "Table Editor" → `properties`
2. You should see 10 properties from various UK cities:
   - London, Manchester, Birmingham, Leeds, Edinburgh, Liverpool, Bristol, Sheffield, Glasgow, York

## Step 3: Refresh Your Application

1. Go back to your application
2. Refresh the browser (Cmd/Ctrl + R)
3. The error should be gone and you should see UK properties!

## Alternative: Run via Supabase CLI

If you prefer using the CLI:

```bash
cd /Users/apple/repos/estospaces-app

# Copy SQL content
cat supabase_setup_properties.sql | pbcopy  # macOS
# or manually copy the file contents

# Then paste into Supabase Dashboard SQL Editor
```

## What the SQL Script Does

1. ✅ Creates `properties` table with all required fields
2. ✅ Creates `saved_properties`, `applied_properties`, `viewed_properties` tables
3. ✅ Adds indexes for performance
4. ✅ Sets up Row Level Security (RLS) policies
5. ✅ Inserts 10 sample UK properties with real locations

## Troubleshooting

### Still seeing the error?

1. **Check Supabase Connection**
   - Verify `.env` file has correct credentials
   - Check browser console for connection errors

2. **Verify Tables Exist**
   - Go to Supabase Dashboard → Table Editor
   - Confirm `properties` table exists

3. **Check RLS Policies**
   - Go to Supabase Dashboard → Authentication → Policies
   - Verify policies are set for `properties` table

4. **Clear Browser Cache**
   - Hard refresh: Cmd/Ctrl + Shift + R

### Properties not showing?

1. **Check Data**
   - Go to Table Editor → `properties`
   - Verify there are rows with `country = 'UK'` and `status = 'online'`

2. **Check Filters**
   - The app filters for `country = 'UK'` and `status = 'online'`
   - Make sure your properties match these criteria

## Need Help?

- Check `PROPERTY_PLATFORM_SETUP.md` for detailed documentation
- Review the SQL file: `supabase_setup_properties.sql`
- Check browser console for detailed error messages

---

**Once tables are created, refresh your browser and you'll see real UK properties!** 🏠🇬🇧

