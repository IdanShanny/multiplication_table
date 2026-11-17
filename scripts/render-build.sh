#!/usr/bin/env sh
set -e
cd "$(dirname "$0")/.."
npm ci
export DATABASE_URL="${DATABASE_URL:-postgresql://build:build@127.0.0.1:5432/build?schema=public}"
npx prisma generate
export EXPO_NO_DEPENDENCY_VALIDATION=1
npx expo export -p web