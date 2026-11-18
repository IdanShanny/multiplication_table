const path = require('path');
const express = require('express');

const app = express();
app.set('trust proxy', 1);

const PORT = process.env.PORT || 3000;
const VERSION = require('./package.json').version;
const DIST = path.join(__dirname, 'dist');

app.use(express.json({ limit: '32kb' }));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, version: VERSION });
});

const databaseUrl = process.env.DATABASE_URL;
if (databaseUrl) {
  const prisma = require('./db');
  const { registerAnalyticsRoutes } = require('./server/analytics');
  const { registerDbViewerRoutes } = require('./server/db-viewer');
  registerAnalyticsRoutes(app, prisma);
  registerDbViewerRoutes(app, prisma);
} else {
  console.warn('DATABASE_URL is unset — analytics and /db are disabled.');
}

app.get(['/preview/avatars', '/preview/avatars/'], (req, res) => {
  res.redirect(302, '/?avatarPreview=1');
});

app.use(express.static(DIST, { index: 'index.html' }));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(DIST, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`לוח הכפל: http://localhost:${PORT}`);
});