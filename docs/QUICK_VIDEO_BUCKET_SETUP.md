# Quick Fix: Create Video Storage Bucket

## Problem
Videos can't upload because the `property-videos` storage bucket doesn't exist.

## Solution (2 minutes)

### Step 1: Create the Bucket
1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/yydtsteyknbpfpxjtlxe
2. Click **Storage** in the left sidebar
3. Click **"New bucket"** button (top right)
4. Fill in:
   - **Name**: `property-videos`
   - **Public bucket**: ✅ **CHECK THIS** (important for video URLs to work)
5. Click **"Create bucket"**

### Step 2: Set Permissions (Optional but Recommended)
1. Click on the `property-videos` bucket you just created
2. Go to **"Policies"** tab
3. Click **"New Policy"**
4. Select **"For full customization"**
5. Copy and paste this policy:

```sql
-- Allow authenticated users to upload videos
CREATE POLICY "Allow authenticated video uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'property-videos' AND
  auth.role() = 'authenticated'
);
```

6. Click **"Review"** then **"Save policy"**

### Step 3: Test Video Upload
1. Go back to your app
2. Try uploading a video again
3. It should work now! ✅

## Alternative: Use property-images Bucket
If you prefer to use the existing `property-images` bucket:
1. Go to Storage → `property-images` bucket
2. Check if it allows video MIME types
3. If not, you may need to contact Supabase support or recreate the bucket with video support

**Recommended**: Use the dedicated `property-videos` bucket for better organization.
