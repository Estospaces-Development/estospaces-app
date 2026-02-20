# 🚀 Quick Setup - Create Tables in Supabase

## Step-by-Step Instructions

### 1. Open Supabase Dashboard
Click this link or copy-paste into your browser:
**https://supabase.com/dashboard/project/yydtsteyknbpfpxjtlxe**

### 2. Navigate to SQL Editor
- In the left sidebar, click **"SQL Editor"**
- Click **"New Query"** button (top right)

### 3. Copy the SQL Script
- Open the file: `supabase_setup_properties.sql` in this project
- Select **ALL** the contents (Cmd/Ctrl + A)
- Copy it (Cmd/Ctrl + C)

### 4. Paste and Run
- Paste into the SQL Editor
- Click **"Run"** button (or press Cmd/Ctrl + Enter)
- Wait for "Success" message

### 5. Verify Tables Created
- Go to **"Table Editor"** in left sidebar
- You should see these tables:
  - ✅ `properties`
  - ✅ `saved_properties`
  - ✅ `applied_properties`
  - ✅ `viewed_properties`

### 6. Check Sample Data
- Click on `properties` table
- You should see **10 UK properties** already inserted:
  - London, Manchester, Birmingham, Leeds, Edinburgh
  - Liverpool, Bristol, Sheffield, Glasgow, York

### 7. Refresh Your App
- Go back to your application
- Refresh the browser (Cmd/Ctrl + R)
- **You should now see UK properties!** 🎉

---

## What Gets Created

✅ **4 Tables:**
- `properties` - Main property listings
- `saved_properties` - User favorites
- `applied_properties` - User applications
- `viewed_properties` - Viewing history

✅ **10 Sample UK Properties:**
- Properties from major UK cities
- Mix of rent and sale properties
- Real coordinates for map view
- Property images

✅ **Performance Indexes:**
- Fast queries by location, price, type
- Optimized for UK property searches

✅ **Security Policies:**
- Row Level Security enabled
- Users can only see their own saved/applied properties
- Everyone can view property listings

---

## Troubleshooting

**Still seeing "table not found" error?**
1. Verify you ran the SQL successfully
2. Check Table Editor to confirm tables exist
3. Hard refresh browser (Cmd/Ctrl + Shift + R)
4. Check browser console for detailed errors

**Properties not showing?**
1. Verify properties exist in `properties` table
2. Check that properties have `country = 'UK'` and `status = 'online'`
3. Check browser console for API errors

---

**Need the SQL file?** It's located at: `supabase_setup_properties.sql`

