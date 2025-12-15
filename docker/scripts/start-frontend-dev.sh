#!/bin/sh

cd /app

echo "📦 Verifying frontend dependencies..."
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.bin/vite" ]; then
  if [ -f "package-lock.json" ]; then
    npm ci || npm install
  else
    npm install
  fi
fi

echo "🎯 Starting Vite dev server (0.0.0.0:5174)..."
exec npm run dev -- --host 0.0.0.0 --port 5174
