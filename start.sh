#!/usr/bin/env bash
set -euo pipefail

# Ensure we run from repo root
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT_DIR/route-optimizer-app/backend"

cd "$BACKEND_DIR"

# Install dependencies (ci when lockfile exists)
if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi

npm run build
npm run start
