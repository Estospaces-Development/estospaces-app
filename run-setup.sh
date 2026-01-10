#!/bin/bash

# Quick setup script for Supabase properties tables

echo "🚀 Supabase Properties Setup"
echo "============================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    exit 1
fi

# Read project ref from .env
PROJECT_REF=$(grep SUPABASE_PROJECT_REF .env | cut -d '=' -f2 | tr -d ' ')

if [ -z "$PROJECT_REF" ]; then
    PROJECT_REF="yydtsteyknbpfpxjtlxe"
fi

echo "📋 Project: $PROJECT_REF"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📖 INSTRUCTIONS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Open Supabase Dashboard:"
echo "   👉 https://supabase.com/dashboard/project/$PROJECT_REF/sql/new"
echo ""
echo "2. Copy the SQL file:"
echo "   📄 supabase_setup_properties.sql"
echo ""
echo "3. Paste into SQL Editor and click 'Run'"
echo ""
echo "4. Refresh your app to see UK properties!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Open SQL file
if command -v open &> /dev/null; then
    echo "📂 Opening SQL file..."
    open supabase_setup_properties.sql
elif command -v xdg-open &> /dev/null; then
    xdg-open supabase_setup_properties.sql
else
    echo "📄 Please open: supabase_setup_properties.sql"
fi

echo ""
echo "✅ Ready! Follow the instructions above."

