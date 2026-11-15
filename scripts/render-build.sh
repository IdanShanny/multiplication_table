#!/usr/bin/env sh
set -e
cd "$(dirname "$0")/.."
npm ci
export EXPO_NO_DEPENDENCY_VALIDATION=1
npx expo export -p web