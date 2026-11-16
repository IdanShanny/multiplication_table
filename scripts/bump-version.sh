#!/usr/bin/env sh
# Usage: ./scripts/bump-version.sh 1.2.1
set -e
cd "$(dirname "$0")/.."
NEW="${1:?Pass new version e.g. 1.2.1}"
node -e "
const fs = require('fs');
const v = process.argv[1];
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.version = v;
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
const app = JSON.parse(fs.readFileSync('app.json', 'utf8'));
app.expo.version = v;
fs.writeFileSync('app.json', JSON.stringify(app, null, 2) + '\n');
console.log('Version set to', v, 'in package.json and app.json');
" "$NEW"