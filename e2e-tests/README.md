# E2E tests (Cypress)

Step-by-step guide to run the frontend e2e suite against a local Docker test stack, and to open the Cypress UI.

## Prerequisites

- Docker / Docker Compose
- Node.js + npm
- Host entry so Cypress can reach CKAN by hostname:

```bash
# /etc/hosts
127.0.0.1 ckan-dev
```

Default credentials (from `cypress.config.js` / CKAN env):

| | |
|---|---|
| Username | `ckan_admin` |
| Password | `test1234` |
| Frontend | http://127.0.0.1:3000 |
| CKAN API | http://ckan-dev:5000/private-admin/en |

## 1. Build the CKAN image

From the repo root:

```bash
docker build -t wri-ckan:local -f ckan-backend-dev/ckan/Dockerfile.dev ckan-backend-dev/ckan/
```

## 2. Start the test stack

```bash
cd ckan-backend-dev
export CKAN_IMAGE=wri-ckan:local
docker compose -f docker-compose.test.yml --env-file .env.example up -d --build
```

Wait until CKAN and the frontend are healthy:

```bash
curl -f http://localhost:5000/private-admin/en
curl -f http://127.0.0.1:3000
```

Confirm plugins (including `auth` / `wri`) are loaded and login works:

```bash
curl -s http://localhost:5000/private-admin/en/api/3/action/status_show \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['result']['extensions'])"

curl -s -X POST http://localhost:5000/private-admin/en/api/3/action/user_login \
  -H 'Content-Type: application/json' \
  -d '{"id":"ckan_admin","password":"test1234"}'
```

You should see a non-empty extensions list and `"success": true` with a `frontend_token`.

> **Note:** Do not run `npm run dev` for the frontend at the same time — Docker already binds `:3000`. Use the Docker `wri-frontend` service for e2e.

## 3. Generate the Cypress API token

With `ckan-wri` running:

```bash
# from repo root
bash ./ckan-backend-dev/ckan/scripts/cypress_setup.sh
```

This creates a `ckan_admin` API token and writes it into:

- `e2e-tests/cypress.config.js` (`API_KEY`)
- `ckan-backend-dev/.env.example` (`SYS_ADMIN_API_KEY`)
- `integration-tests/cypress.json`

Restart the frontend so it picks up the new key:

```bash
cd ckan-backend-dev
export CKAN_IMAGE=wri-ckan:local
docker compose -f docker-compose.test.yml --env-file .env.example up -d --force-recreate frontend
```

## 4. Install e2e dependencies

```bash
cd e2e-tests
npm install
```

## 5. Open the Cypress console (interactive)

```bash
cd e2e-tests
npm run open
```

In the Cypress UI:

1. Choose **E2E Testing**
2. Pick a browser (Chrome / Electron)
3. Click a spec under `cypress/e2e/` to run it

## 6. Run tests headless

All specs:

```bash
cd e2e-tests
npm test
```

One spec:

```bash
cd e2e-tests
npx cypress run --spec cypress/e2e/approval_review_unauthorized.cy.js
```

CI-style groups (see `split-tests.js`):

```bash
npm run test:group1
# … through test:group11
```

## Troubleshooting

| Symptom | Likely cause | Fix |
|--------|----------------|-----|
| `POST /api/auth/callback/credentials` → 401 | Frontend authing against wrong CKAN, or plugins missing | Use Docker frontend; ensure `CKAN__PLUGINS` in `.env.example` includes `auth`; recreate `ckan-dev` |
| `Action name not known: user_login` | CKAN started with empty plugins | Recreate with plugins enabled; confirm `status_show` extensions list |
| `extensions: []` | `CKAN__PLUGINS` not applied | Check `.env.example`, then `docker compose … up -d --force-recreate ckan-dev` |
| Port 3000 conflict | Host `npm run dev` + Docker frontend | Stop `npm run dev`; use Docker only |
| API 401 / cleanup 404s | Stale `API_KEY` after CKAN recreate | Re-run `cypress_setup.sh` and recreate frontend |
| Login works but redirects to `chrome-error://` | `NEXTAUTH_URL=http://wri-frontend:3000` in Docker | Prefer clearing cookies between users in specs; avoid relying on browser sign-out redirects to that hostname |

## Useful checks

```bash
# Stack status
docker ps --format '{{.Names}}\t{{.Status}}'

# Frontend auth providers (should include credentials)
curl -s http://127.0.0.1:3000/api/auth/providers
```
