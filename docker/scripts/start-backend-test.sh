#!/bin/sh
set -e

echo "🚀 Starting Backend API for E2E Testing..."
echo "Waiting for services to be ready..."
sleep 10

# Resolve database connection settings (defaults match host-DB mode)
DB_HOST="${DB_HOST:-host.docker.internal}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-lms_db}"
DB_USER="${DB_USER:-lms_user}"
DB_PASSWORD="${DB_PASSWORD:-123456}"

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

echo "🔍 Checking database status (host=${DB_HOST}, port=${DB_PORT}, db=${DB_NAME})..."

# Attempt simple connectivity against target DB
DB_CONNECTION=$(PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -tAc "SELECT 1" 2>/dev/null || echo "0")

if [ "$DB_CONNECTION" = "0" ]; then
  echo "❌ Unable to connect to PostgreSQL. Please verify:"
  echo "   - PostgreSQL listen_addresses (should include '*')"
  echo "   - pg_hba.conf allows the Docker subnet / host gateway"
  echo "   - Windows firewall exposes port ${DB_PORT}"
  echo "   - DB_HOST / DB_PORT point to the correct gateway"
  exit 1
fi

echo "✓ PostgreSQL connection verified"

# Check if tables exist
TABLE_EXISTS=$(PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -tAc "SELECT 1 FROM information_schema.tables WHERE table_name='users'" 2>/dev/null || echo "0")

if [ "$TABLE_EXISTS" = "0" ]; then
  echo "⚠️  Required tables missing. Running migration + seed..."
  npx ts-node -r tsconfig-paths/register src/scripts/sync-models.ts || true
  echo "🌱 Seeding initial data..."
  npm run seed || true
else
  echo "✓ Database and tables already in place"
fi

echo "🎯 Starting API server with hot reload..."
exec npm run dev
