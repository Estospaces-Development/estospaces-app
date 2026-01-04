#!/bin/bash

# Git commit and push script for estospaces-app user-dashboard branch
cd /Users/apple/repos/estospaces-app

echo "=== Checking git status ==="
git status

echo ""
echo "=== Staging all changes ==="
git add -A

echo ""
echo "=== Committing changes ==="
git commit -m "feat: Add property detail page, market insights, verified badge, and smart search navigation

- Add comprehensive PropertyDetail page with property info and market insights
- Include financial metrics dashboard with charts and analytics
- Add verified badge to Property Viewer in sidebar
- Implement smart search navigation in header and dashboard search bars
- Make chatbot available on all dashboard pages
- Add theme switcher to all dashboard pages
- Fix JSX syntax error in Dashboard.jsx form tag
- Update README with new features and functionality"

echo ""
echo "=== Pushing to user-dashboard branch ==="
git push origin user-dashboard

echo ""
echo "=== Done! ==="

