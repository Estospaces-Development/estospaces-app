#!/bin/bash
# Script to commit and push user dashboard changes to GitHub

set -e  # Exit on error

echo "🚀 Starting git operations..."

# Navigate to project directory
cd /Users/apple/repos/estospaces-app

# Check git status
echo "📋 Checking git status..."
git status

# Switch to user-dashboard branch or create it
echo "🌿 Switching to user-dashboard branch..."
git checkout user-dashboard 2>/dev/null || git checkout -b user-dashboard

# Stage all changes
echo "📦 Staging all changes..."
git add -A

# Show what will be committed
echo "📝 Files to be committed:"
git status --short

# Commit changes
echo "💾 Committing changes..."
git commit -m "feat: Add comprehensive user dashboard with dark theme, AI assistant, contracts, payments, and messaging

- Add responsive dashboard layout with sidebar and header
- Implement dark mode theme switcher (Light/Deep Dark)
- Add Lakshmi AI assistant with chat interface
- Create digital contracts with e-signature functionality
- Add payments page with rent/utility bills and payment history
- Implement messaging system for broker communication
- Add property cards with image carousel and virtual tours
- Create map view component (Mapbox-ready)
- Add comprehensive navigation and dashboard pages
- Update README with setup instructions and feature documentation"

# Set remote URL
echo "🔗 Setting remote repository..."
git remote set-url origin https://github.com/Estospaces/estospaces-app.git 2>/dev/null || git remote add origin https://github.com/Estospaces/estospaces-app.git

# Push to remote
echo "⬆️  Pushing to GitHub..."
git push -u origin user-dashboard

echo "✅ Successfully pushed to https://github.com/Estospaces/estospaces-app/tree/user-dashboard"


