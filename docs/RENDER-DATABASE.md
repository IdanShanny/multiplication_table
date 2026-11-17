# Render — לוח הכפל + shared Postgres

## Environment (Web Service)

| Key | Value |
|-----|--------|
| `DATABASE_URL` | **Same** connection string as the nifgashim service (Internal Database URL from Render Postgres, or External if you use that). |

No new Postgres instance.

## Commands (unchanged names)

| Phase | Command |
|--------|---------|
| **Build** | `npm run render:build` |
| **Start** | `npm run render:start` |

`render:build` runs `prisma generate` (dummy `DATABASE_URL` if unset).  
`render:start` runs `prisma migrate deploy` then `node server.js`.

## After first deploy

1. Open the app once (creates/updates `MtPlayer`, `MtVisit`).
2. Browse raw data: `https://<your-service>.onrender.com/db` (lists `Mt*` tables only).

## If deploy fails

- **“FATAL: Set DATABASE_URL”** — add env var on this service.
- **migrate deploy failed** — check logs; DB user must be allowed to create tables.
- App still works if API fails; check Network tab for `/api/players/ensure` and `/api/visits`.

## Local dev (optional)

```sh
export DATABASE_URL="postgresql://..."
npx prisma migrate deploy
npm run web   # separate terminal: node server.js with DATABASE_URL for API
```