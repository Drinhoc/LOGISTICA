#!/usr/bin/env bash
set -euo pipefail

# Ensure we run from repo root
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT_DIR/route-optimizer-app/backend"

cd "$BACKEND_DIR"

echo "📦 Installing dependencies..."
# Install dependencies (ci when lockfile exists)
if [ -f package-lock.json ]; then
  npm ci --production=false
else
  npm install
fi

echo "🔧 Generating Prisma Client..."
npx prisma generate

echo "🏗️  Building TypeScript..."
npm run build

echo "🚀 Starting server..."
npm run start
