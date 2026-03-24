#!/bin/sh

echo "=== LMS Backend Development Start Script ==="

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Check if tsconfig.json exists
if [ ! -f "tsconfig.json" ]; then
    echo "ERROR: tsconfig.json not found!"
    exit 1
fi

echo "Starting development server with nodemon + tsx..."
exec npm run dev