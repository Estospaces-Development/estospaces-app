# 🏠 Real Properties Setup Guide

## Overview

This guide explains how to set up and manage **real properties** with real data, images, addresses, contact details, and a complete purchase workflow.

## ✅ What's Been Implemented

### 1. Enhanced Database Schema
- ✅ Added contact fields: `agent_name`, `agent_email`, `agent_phone`, `agent_company`
- ✅ Added property details: `property_size_sqm`, `year_built`, `property_features`
- ✅ Added viewing info: `viewing_available`, `viewing_instructions`
- ✅ Added financial details: `deposit_amount`, `council_tax_band`, `energy_rating`
- ✅ Added verification: `verified` field for admin approval
- ✅ **Removed all sample/test data**

### 2. Admin Property Management Interface
- ✅ **Location:** `/admin/properties`
- ✅ Add new properties with full details
- ✅ Edit existing properties
- ✅ Delete properties
- ✅ Upload real property images
- ✅ Manage all property information
- ✅ View property list with contact details

### 3. Property Display Updates
- ✅ Property cards show agent contact information
- ✅ Property detail page shows full contact details
- ✅ Contact form for messaging agents
- ✅ Real images from Supabase Storage
- ✅ Real addresses and locations

### 4. Purchase/Application Workflow
- ✅ "Apply Now" button on property cards
- ✅ Application tracking in `applied_properties` table
- ✅ Status management (pending, under_review, approved, rejected)
- ✅ Application detail view with property info

## 🚀 Setup Steps

### Step 1: Run Updated SQL Schema

1. Open Supabase Dashboard: https://supabase.com/dashboard/project/yydtsteyknbpfpxjtlxe/sql/new
2. Copy contents of `supabase_setup_properties.sql`
3. Paste and Run in SQL Editor
4. **Note:** No sample data will be inserted - you'll add real properties via admin interface

### Step 2: Create Storage Bucket for Property Images

1. Go to Supabase Dashboard → **Storage**
2. Click **"New bucket"**
3. Name: `property-images`
4. Make it **Public** (for displaying images)
5. Click **"Create bucket"**

### Step 3: Set Up Storage Policies

Run this SQL in Supabase SQL Editor:

```sql
-- Allow public read access to property images
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT
USING (bucket_id = 'property-images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated Upload" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'property-images');
```

### Step 4: Access Admin Property Management

1. Navigate to: `/admin/properties`
2. You'll need to be logged in as admin
3. Click **"Add New Property"**
4. Fill in all real property details:
   - Property title, description, price
   - Address (real address)
   - Location (latitude/longitude)
   - Bedrooms, bathrooms
   - **Agent contact details** (name, email, phone, company)
   - Upload real property images
   - Property features, size, year built
   - Viewing instructions

### Step 5: Add Real Properties

For each real property:

1. **Basic Info:**
   - Title: Real property title
   - Description: Real property description
   - Price: Real asking price
   - Type: Sale or Rent
   - Status: Online

2. **Location:**
   - Address Line 1: Real street address
   - Address Line 2: (Optional)
   - City: Real city
   - Postcode: Real UK postcode
   - Latitude/Longitude: Real coordinates (use Google Maps to get exact location)

3. **Property Details:**
   - Bedrooms: Actual number
   - Bathrooms: Actual number
   - Property Size: Square meters
   - Year Built: Actual year
   - Features: e.g., ["garden", "parking", "balcony"]

4. **Contact Information (REQUIRED):**
   - Agent Name: Real agent's name
   - Agent Email: Real agent email
   - Agent Phone: Real agent phone number
   - Agent Company: Real estate company name

5. **Images:**
   - Upload real property photos
   - Multiple images supported
   - Images stored in Supabase Storage

6. **Additional Info:**
   - Viewing Available: Yes/No
   - Viewing Instructions: How to arrange viewing
   - Deposit Amount: (For rent properties)
   - Council Tax Band: UK council tax band
   - Energy Rating: EPC rating

## 📋 Property Data Requirements

### Required Fields:
- ✅ Title
- ✅ Description
- ✅ Price
- ✅ Property Type (rent/sale)
- ✅ Status
- ✅ Bedrooms
- ✅ Bathrooms
- ✅ Address Line 1
- ✅ City
- ✅ Postcode
- ✅ Agent Name
- ✅ Agent Email
- ✅ Agent Phone
- ✅ At least one property image

### Optional but Recommended:
- Latitude/Longitude (for map view)
- Property Size
- Year Built
- Property Features
- Viewing Instructions
- Deposit Amount
- Council Tax Band
- Energy Rating

## 🔄 Purchase Workflow

### For Users:

1. **Browse Properties:**
   - View all real properties on Dashboard
   - Search and filter properties
   - See property cards with contact info

2. **View Property Details:**
   - Click "View Details" on any property
   - See full property information
   - View all property images
   - See agent contact details
   - Contact agent via form or direct email/phone

3. **Apply/Purchase:**
   - Click "Apply Now" button
   - Application created in `applied_properties` table
   - Status: "pending"
   - View application in "My Applications"

4. **Contact Agent:**
   - Use contact form on property detail page
   - Or call/email agent directly
   - Arrange viewing if available

### For Agents/Admins:

1. **Add Properties:**
   - Go to `/admin/properties`
   - Add new property with all details
   - Upload real images
   - Set contact information

2. **Manage Properties:**
   - Edit property details
   - Update status (online, under_offer, sold, let)
   - Delete properties if needed

3. **View Applications:**
   - Applications stored in `applied_properties` table
   - Can be viewed in admin dashboard (to be implemented)

## 🎯 Best Practices

1. **Use Real Data Only:**
   - Real property addresses
   - Real agent contact information
   - Real property images
   - Accurate pricing

2. **Complete Information:**
   - Fill in all required fields
   - Add multiple property images
   - Include accurate location coordinates

3. **Keep Data Updated:**
   - Update property status when sold/let
   - Update prices if changed
   - Remove properties no longer available

4. **Image Quality:**
   - Use high-quality property photos
   - Multiple angles and rooms
   - Exterior and interior shots

## 🔒 Security & Verification

- Properties have `verified` field for admin approval
- Only authenticated users can add properties
- Row Level Security (RLS) policies protect data
- Storage policies control image access

## 📞 Support

If you need help:
1. Check SQL schema in `supabase_setup_properties.sql`
2. Review admin interface at `/admin/properties`
3. Check property service in `src/services/propertiesService.js`
4. Review PropertiesContext in `src/contexts/PropertiesContext.jsx`

---

**Ready to add real properties?** Go to `/admin/properties` and start adding your first real property! 🏠

