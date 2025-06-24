#!/bin/bash

# ExamKlar Build Cache Cleaner
# Similar to deleting build/cache in TypeScript projects
# This script removes all build artifacts and cache directories

echo "🧹 ExamKlar Build Cache Cleaner"
echo "=============================="

# Function to safely remove directory
safe_remove() {
    if [ -d "$1" ]; then
        echo "🗑️  Removing $1..."
        rm -rf "$1"
        echo "✅ Removed $1"
    else
        echo "ℹ️  $1 does not exist, skipping"
    fi
}

# Function to safely remove file
safe_remove_file() {
    if [ -f "$1" ]; then
        echo "🗑️  Removing $1..."
        rm -f "$1"
        echo "✅ Removed $1"
    else
        echo "ℹ️  $1 does not exist, skipping"
    fi
}

echo ""
echo "📁 Cleaning Node.js dependencies..."
safe_remove "node_modules"
safe_remove_file "package-lock.json"

echo ""
echo "📁 Cleaning test artifacts..."
safe_remove "test-results"
safe_remove "playwright-report"
safe_remove ".playwright"

echo ""
echo "📁 Cleaning cache directories..."
safe_remove ".cache"
safe_remove ".tmp"
safe_remove "tmp"
safe_remove "dist"
safe_remove "build"

echo ""
echo "📁 Cleaning log files..."
safe_remove_file "*.log"
safe_remove_file "npm-debug.log*"
safe_remove_file "yarn-debug.log*"
safe_remove_file "yarn-error.log*"

echo ""
echo "📁 Cleaning OS specific files..."
safe_remove_file ".DS_Store"
safe_remove "**/.DS_Store"
safe_remove_file "Thumbs.db"
safe_remove_file "desktop.ini"

echo ""
echo "🔧 Reinstalling dependencies..."
if command -v npm &> /dev/null; then
    echo "📦 Running npm install..."
    npm install
    echo "✅ Dependencies reinstalled"
else
    echo "❌ npm not found, please install dependencies manually"
fi

echo ""
echo "✅ Build cache cleanup completed!"
echo "💡 You can now run the application with: npm start"
echo "🌐 Or open clear-cache.html to clear browser cache"
echo ""
echo "📋 Summary of actions:"
echo "   - Removed node_modules and package-lock.json"
echo "   - Cleaned test artifacts and reports"
echo "   - Removed cache and temporary directories"
echo "   - Cleaned OS-specific files"
echo "   - Reinstalled npm dependencies"
echo ""
echo "🚀 Your ExamKlar project is now clean and ready!"