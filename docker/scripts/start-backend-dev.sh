#!/bin/sh
set -e

echo "🚀 Starting Backend API Development..."
echo "Waiting for services to be ready..."
sleep 10

echo "🔍 Checking database status..."

# Check if database exists
DB_EXISTS=$(PGPASSWORD=${DB_PASSWORD} psql -h postgres-dev -U ${DB_USER} -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" 2>/dev/null || echo "0")

if [ "$DB_EXISTS" = "1" ]; then
  echo "✓ Database '${DB_NAME}' already exists"
  
  # Check if tables exist
  TABLE_EXISTS=$(PGPASSWORD=${DB_PASSWORD} psql -h postgres-dev -U ${DB_USER} -d ${DB_NAME} -tAc "SELECT 1 FROM information_schema.tables WHERE table_name='users'" 2>/dev/null || echo "0")
  
  if [ "$TABLE_EXISTS" = "0" ]; then
    echo "⚠️  Tables not found. Running migration..."
    npx ts-node -r tsconfig-paths/register src/scripts/sync-models.ts || true
    echo "🌱 Seeding initial data..."
    npm run seed || true
  else
    echo "✓ Database and tables ready"
  fi
else
  echo "⚙️  Database not found. Running full setup..."
  npm run setup-db-simple || true
  
  echo "🔄 Syncing database models..."
  npx ts-node -r tsconfig-paths/register src/scripts/sync-models.ts || true
  
  echo "🌱 Seeding database..."
  npm run seed || true
fi

echo "🎯 Starting API server with hot reload..."
exec npm run dev
