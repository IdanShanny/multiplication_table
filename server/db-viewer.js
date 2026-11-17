const MT_TABLE_PREFIX = 'Mt';

function renderDbHtmlDocument(title, bodyHtml) {
  return `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 2rem; line-height: 1.5; }
    h1 { font-size: 1.25rem; }
    a { color: #c0392b; }
    pre { white-space: pre-wrap; word-break: break-word; font-size: 0.875rem; }
  </style>
</head>
<body>
${bodyHtml}
</body>
</html>`;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function quotePgIdentifier(name) {
  return `"${String(name).replace(/"/g, '""')}"`;
}

async function listMtTables(prisma) {
  const rows = await prisma.$queryRaw`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      AND table_name LIKE 'Mt%'
    ORDER BY table_name ASC
  `;
  return rows.map((row) => row.table_name);
}

async function fetchTableRows(prisma, tableName, allowedTables) {
  if (!allowedTables.includes(tableName)) {
    return null;
  }
  const sql = `SELECT * FROM ${quotePgIdentifier(tableName)}`;
  return prisma.$queryRawUnsafe(sql);
}

function rowsToPlainText(rows) {
  if (!rows.length) {
    return '(empty)\n';
  }
  return rows
    .map((row) =>
      Object.fromEntries(
        Object.entries(row).map(([key, value]) => {
          if (value === null || value === undefined) return [key, value];
          if (typeof value === 'bigint') return [key, value.toString()];
          if (value instanceof Date) return [key, value.toISOString()];
          return [key, value];
        }),
      ),
    )
    .map((row) => JSON.stringify(row))
    .join('\n')
    .concat('\n');
}

function registerDbViewerRoutes(app, prisma) {
  app.get('/db', async (req, res) => {
    try {
      const tables = await listMtTables(prisma);
      const items = tables
        .map((name) => `<li><a href="/db/${encodeURIComponent(name)}">${escapeHtml(name)}</a></li>`)
        .join('');
      const indexBody = `
  <h1>לוח הכפל — database (Mt tables)</h1>
  <p><a href="/">← Back to app</a></p>
  <p>Shared Postgres may also hold nifgashim tables; only <code>Mt*</code> tables are listed here.</p>
  <ul>${items || '<li>(no Mt tables yet — run migrations)</li>'}</ul>`;
      res.type('html').send(renderDbHtmlDocument('Database tables', indexBody));
    } catch (err) {
      console.error('DB viewer index failed:', err);
      res.status(500).type('text/plain').send('Failed to list tables.\n');
    }
  });

  app.get('/db/:tableName', async (req, res) => {
    try {
      const tableName = decodeURIComponent(req.params.tableName);
      const tables = await listMtTables(prisma);
      const rows = await fetchTableRows(prisma, tableName, tables);
      if (rows === null) {
        res.status(404).type('text/plain').send('Table not found.\n');
        return;
      }
      const body = [
        `<p><a href="/db">← Database tables</a> · <a href="/">App</a></p>`,
        `<pre>${escapeHtml(
          [`Table: ${tableName}`, `Rows: ${rows.length}`, '---', rowsToPlainText(rows)].join('\n'),
        )}</pre>`,
      ].join('\n');
      res.type('html').send(renderDbHtmlDocument(`Table: ${tableName}`, body));
    } catch (err) {
      console.error('DB viewer table failed:', err);
      res.status(500).type('text/plain').send('Failed to load table.\n');
    }
  });
}

module.exports = { registerDbViewerRoutes };