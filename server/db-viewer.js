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
    table { border-collapse: collapse; width: 100%; max-width: 56rem; font-size: 0.9rem; }
    th, td { border: 1px solid #ddd; padding: 0.5rem 0.75rem; text-align: left; }
    th { background: #f5f5f5; }
    tr:nth-child(even) { background: #fafafa; }
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
  <p><strong>Reports:</strong> <a href="/db/MtVisit/players">All players (summary)</a></p>
  <ul>${items || '<li>(no Mt tables yet — run migrations)</li>'}</ul>`;
      res.type('html').send(renderDbHtmlDocument('Database tables', indexBody));
    } catch (err) {
      console.error('DB viewer index failed:', err);
      res.type('html').send(renderDbHtmlDocument('Database unavailable', '<p>Database is temporarily unreachable.</p><p><a href="/">← App</a></p>'));
    }
  });

  app.get('/db/MtVisit/players', async (req, res) => {
    try {
      const players = await prisma.mtPlayer.findMany({
        orderBy: { lastSeenAt: 'desc' },
        select: { id: true, latestName: true, lastSeenAt: true },
      });

      const rowsHtml = players
        .map((p) => {
          const name = p.latestName ? escapeHtml(p.latestName) : '<em>(no name yet)</em>';
          const last = p.lastSeenAt ? escapeHtml(p.lastSeenAt.toISOString()) : '—';
          return `<tr><td><code>${escapeHtml(p.id)}</code></td><td>${name}</td><td>${last}</td></tr>`;
        })
        .join('');

      const body = `
  <p><a href="/db">← Database tables</a> · <a href="/db/MtVisit">MtVisit (raw)</a> · <a href="/">App</a></p>
  <h1>All players</h1>
  <p>Unique player id, last name used, last connection.</p>
  <p>Total: ${players.length}</p>
  <table>
    <thead><tr><th>Player ID</th><th>Last name</th><th>Last connection (UTC)</th></tr></thead>
    <tbody>${rowsHtml || '<tr><td colspan="3">(no players yet)</td></tr>'}</tbody>
  </table>`;
      res.type('html').send(renderDbHtmlDocument('All players', body));
    } catch (err) {
      console.error('DB players report failed:', err);
      res.type('html').send(renderDbHtmlDocument('Database unavailable', '<p>Database is temporarily unreachable.</p><p><a href="/db">← Database</a></p>'));
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
      const extraLinks =
        tableName === 'MtVisit'
          ? ' · <a href="/db/MtVisit/players">All players (summary)</a>'
          : '';
      const body = [
        `<p><a href="/db">← Database tables</a> · <a href="/">App</a>${extraLinks}</p>`,
        `<pre>${escapeHtml(
          [`Table: ${tableName}`, `Rows: ${rows.length}`, '---', rowsToPlainText(rows)].join('\n'),
        )}</pre>`,
      ].join('\n');
      res.type('html').send(renderDbHtmlDocument(`Table: ${tableName}`, body));
    } catch (err) {
      console.error('DB viewer table failed:', err);
      res.type('html').send(renderDbHtmlDocument('Database unavailable', '<p>Database is temporarily unreachable.</p><p><a href="/db">← Database</a></p>'));
    }
  });
}

module.exports = { registerDbViewerRoutes };