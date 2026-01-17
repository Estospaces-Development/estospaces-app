# 🗑️ Clear Fake/Sample Data

## Current Status

**The properties you're seeing are FAKE/SAMPLE data.**

The addresses are clearly placeholder addresses:
- ❌ "123 Westminster Street" (London)
- ❌ "456 Oxford Road" (Manchester)  
- ❌ "789 New Street" (Birmingham)
- ❌ "321 Park Lane" (Leeds)
- ❌ "654 Royal Mile" (Edinburgh)
- ❌ "987 Mersey Road" (Liverpool)

These are sequential numbers (123, 456, 789, etc.) - not real addresses!

## How to Remove Fake Data

### Option 1: Delete Sample Properties Only (Recommended)

1. Open Supabase Dashboard: https://supabase.com/dashboard/project/yydtsteyknbpfpxjtlxe/sql/new
2. Copy and paste this SQL:

```sql
-- Delete all sample properties
DELETE FROM properties 
WHERE address_line_1 IN (
  '123 Westminster Street',
  '456 Oxford Road',
  '789 New Street',
  '321 Park Lane',
  '654 Royal Mile',
  '987 Mersey Road',
  '147 Harbour Side',
  '258 Steel Street',
  '369 Buchanan Street',
  '741 Shambles'
);
```

3. Click "Run"
4. Refresh your app - fake properties will be gone!

### Option 2: Delete ALL Properties (Fresh Start)

⚠️ **WARNING:** This deletes ALL properties, including any real ones!

```sql
DELETE FROM properties;
```

## After Clearing Fake Data

1. **Properties list will be empty** - this is correct!
2. **Add real properties** via Admin interface:
   - Go to: `/admin/properties`
   - Click "Add New Property"
   - Fill in REAL property details:
     - ✅ Real street addresses (not 123, 456, etc.)
     - ✅ Real agent contact information
     - ✅ Real property images
     - ✅ Accurate pricing and details

## How to Identify Real vs Fake Properties

### ❌ FAKE Properties Have:
- Sequential address numbers (123, 456, 789, 321, etc.)
- Generic descriptions
- Stock images from Unsplash
- Placeholder agent info

### ✅ REAL Properties Should Have:
- Real street addresses (actual UK addresses)
- Real agent names, emails, phone numbers
- Real property photos (uploaded by you)
- Accurate property details
- Real coordinates (latitude/longitude)

## Next Steps

1. **Clear the fake data** (use SQL above)
2. **Add your first real property:**
   - Navigate to `/admin/properties`
   - Fill in all real details
   - Upload real property images
   - Add real agent contact info
3. **Verify it appears** in Browse Properties page
4. **Continue adding** more real properties

---

**Remember:** The system is now set up for REAL properties only. No more sample data will be inserted automatically.

