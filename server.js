const path = require('path');
const express = require('express');

const app = express();
app.set('trust proxy', 1);

const PORT = process.env.PORT || 3000;
const VERSION = require('./package.json').version;
const DIST = path.join(__dirname, 'dist');

app.get('/api/health', (req, res) => {
    res.json({ ok: true, version: VERSION });
});

app.use(express.static(DIST, { index: 'index.html' }));

app.get(/.*/, (req, res) => {
    res.sendFile(path.join(DIST, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`לוח הכפל: http://localhost:${PORT}`);
});