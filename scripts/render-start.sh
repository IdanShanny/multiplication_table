#!/usr/bin/env sh
set -e
cd "$(dirname "$0")/.."
if [ -z "$DATABASE_URL" ]; then
  echo "FATAL: Set DATABASE_URL on this Render service (same Postgres as nifgashim)."
  exit 1
fi
npx prisma migrate deploy
exec node server.js