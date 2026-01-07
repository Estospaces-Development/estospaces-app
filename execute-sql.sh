#!/bin/bash
# This script helps execute SQL in Supabase
# You'll need your database password from Supabase Dashboard

echo "To execute SQL directly, you need:"
echo "1. Database password from Supabase Dashboard → Settings → Database"
echo "2. Connection string format: postgresql://postgres:[PASSWORD]@db.yydtsteyknbpfpxjtlxe.supabase.co:5432/postgres"
echo ""
echo "Then run:"
echo "psql 'postgresql://postgres:[PASSWORD]@db.yydtsteyknbpfpxjtlxe.supabase.co:5432/postgres' < supabase_setup_properties.sql"
echo ""
echo "OR use the Supabase Dashboard (recommended):"
echo "1. Go to: https://supabase.com/dashboard/project/yydtsteyknbpfpxjtlxe/sql/new"
echo "2. Copy contents of supabase_setup_properties.sql"
echo "3. Paste and Run"
