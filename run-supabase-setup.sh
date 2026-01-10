#!/bin/bash

# Script to help set up Supabase tables
# This script will open the SQL file and provide instructions

echo "=========================================="
echo "Supabase Properties Table Setup"
echo "=========================================="
echo ""
echo "To create the tables in Supabase:"
echo ""
echo "1. Open Supabase Dashboard:"
echo "   https://supabase.com/dashboard/project/yydtsteyknbpfpxjtlxe"
echo ""
echo "2. Click 'SQL Editor' in the left sidebar"
echo ""
echo "3. Click 'New Query'"
echo ""
echo "4. Copy the contents of 'supabase_setup_properties.sql'"
echo ""
echo "5. Paste into the SQL Editor and click 'Run'"
echo ""
echo "=========================================="
echo ""
echo "Opening SQL file for you to copy..."
echo ""

# Open the SQL file
if command -v open &> /dev/null; then
    open supabase_setup_properties.sql
elif command -v xdg-open &> /dev/null; then
    xdg-open supabase_setup_properties.sql
else
    echo "Please manually open: supabase_setup_properties.sql"
fi

echo ""
echo "After running the SQL, refresh your browser to see UK properties!"
echo ""

