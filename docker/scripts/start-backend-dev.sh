#!/bin/sh
set -e

# Avoid tsconfig-paths walking the entire /app tree (can OOM in Docker).
# Explicitly pin the tsconfig used by ts-node/ts-node-dev.
export TS_NODE_PROJECT=/app/tsconfig.json

# Ensure expected working directory
cd /app

# Always install dependencies first (critical for Docker volume mounts)
echo "📦 Verifying dependencies..."
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.bin/ts-node-dev" ]; then
  echo "Installing dependencies..."
  npm install || npm ci || true
fi

# If DATABASE_URL points to an external DB (e.g., Supabase), do not run local-postgres
# bootstrap logic. Instead, ensure migrations are applied and start the server.
if [ -n "${DATABASE_URL:-}" ]; then
  if echo "$DATABASE_URL" | grep -qi "supabase"; then
    echo "🧭 External DATABASE_URL detected (Supabase)."
    echo "🔁 Running migrations against DATABASE_URL..."
    npm run migrate migrate || true
    echo "🎯 Starting API server with hot reload..."
    exec npm run dev
  fi
fi

echo "🚀 Starting Backend API Development..."
echo "Waiting for services to be ready..."
sleep 10

echo "📦 Verifying dependencies..."
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.bin/ts-node-dev" ]; then
  echo "Installing dependencies..."
  npm install || npm ci || true
fi

echo "🔎 Checking OpenTelemetry packages..."
if [ ! -f "node_modules/@opentelemetry/sdk-node/package.json" ] \
  || [ ! -f "node_modules/@opentelemetry/auto-instrumentations-node/package.json" ] \
  || [ ! -f "node_modules/@opentelemetry/exporter-trace-otlp-http/package.json" ]; then
  echo "Installing OpenTelemetry packages..."
  npm install @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node @opentelemetry/exporter-trace-otlp-http --no-audit --no-fund || true
fi

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
