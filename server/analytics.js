const crypto = require('crypto');

function fallbackPlayerId(clientPlayerId) {
  const trimmed = typeof clientPlayerId === 'string' ? clientPlayerId.trim() : '';
  return trimmed || crypto.randomUUID();
}

function registerAnalyticsRoutes(app, prisma) {
  if (!prisma) {
    return;
  }

  app.post('/api/players/ensure', async (req, res) => {
    const clientPlayerId =
      typeof req.body?.clientPlayerId === 'string' ? req.body.clientPlayerId.trim() : '';

    try {
      if (clientPlayerId) {
        const existing = await prisma.mtPlayer.findUnique({ where: { id: clientPlayerId } });
        if (existing) {
          await prisma.mtPlayer.update({
            where: { id: existing.id },
            data: { lastSeenAt: new Date() },
          });
          res.json({ playerId: existing.id, isNew: false });
          return;
        }
      }

      const player = await prisma.mtPlayer.create({ data: {} });
      await prisma.mtVisit.create({
        data: {
          playerId: player.id,
          visitKind: 'bootstrap',
        },
      });
      res.json({ playerId: player.id, isNew: true });
    } catch (err) {
      console.error('POST /api/players/ensure failed:', err);
      res.json({ playerId: fallbackPlayerId(clientPlayerId), isNew: true, dbSkipped: true });
    }
  });

  app.post('/api/registrations', async (req, res) => {
    try {
      const playerId = typeof req.body?.playerId === 'string' ? req.body.playerId.trim() : '';
      const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
      const gender = req.body?.gender === 'female' ? 'female' : 'male';

      if (!playerId || !name) {
        res.status(400).json({ error: 'invalid_payload' });
        return;
      }

      const player = await prisma.mtPlayer.findUnique({ where: { id: playerId } });
      if (!player) {
        res.json({ ok: true, dbSkipped: true });
        return;
      }

      await prisma.$transaction([
        prisma.mtRegistration.create({
          data: { playerId, name, gender },
        }),
        prisma.mtPlayer.update({
          where: { id: playerId },
          data: { latestName: name, latestGender: gender, lastSeenAt: new Date() },
        }),
      ]);

      res.json({ ok: true });
    } catch (err) {
      console.error('POST /api/registrations failed:', err);
      res.json({ ok: true, dbSkipped: true });
    }
  });

  app.post('/api/visits', async (req, res) => {
    try {
      const playerId = typeof req.body?.playerId === 'string' ? req.body.playerId.trim() : '';
      if (!playerId) {
        res.status(400).json({ error: 'invalid_payload' });
        return;
      }

      const player = await prisma.mtPlayer.findUnique({ where: { id: playerId } });
      if (!player) {
        res.json({ ok: true, dbSkipped: true });
        return;
      }

      const name =
        typeof req.body?.name === 'string' && req.body.name.trim() ? req.body.name.trim() : null;
      const gender =
        req.body?.gender === 'female' ? 'female' : req.body?.gender === 'male' ? 'male' : null;

      const toInt = (v) =>
        typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.floor(v)) : null;

      const sessionMs =
        typeof req.body?.sessionMs === 'number' && req.body.sessionMs >= 0
          ? Math.floor(req.body.sessionMs)
          : null;

      const appVersion =
        typeof req.body?.appVersion === 'string' && req.body.appVersion.trim()
          ? req.body.appVersion.trim()
          : null;

      await prisma.$transaction([
        prisma.mtVisit.create({
          data: {
            playerId,
            visitKind: 'snapshot',
            name,
            gender,
            group1Count: toInt(req.body?.group1Count),
            group2Count: toInt(req.body?.group2Count),
            group3Count: toInt(req.body?.group3Count),
            group4Count: toInt(req.body?.group4Count),
            appVersion,
            sessionMs,
          },
        }),
        prisma.mtPlayer.update({
          where: { id: playerId },
          data: {
            lastSeenAt: new Date(),
            ...(name ? { latestName: name } : {}),
            ...(gender ? { latestGender: gender } : {}),
          },
        }),
      ]);

      res.json({ ok: true });
    } catch (err) {
      console.error('POST /api/visits failed:', err);
      res.json({ ok: true, dbSkipped: true });
    }
  });
}

module.exports = { registerAnalyticsRoutes };