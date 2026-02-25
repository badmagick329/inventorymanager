# Inventory Manager

## Architecture

Read this first for full codebase orientation:
- `notes/AGENT_READ_THIS_FIRST_CODEBASE_ARCHITECTURE.md`

## Quick Start

1. Copy `.env.example` to `.env` and set values for your environment.
2. Start services:

```bash
docker compose up --build
```

3. App endpoints:
- Frontend (via Nginx): `http://localhost:${NGINX_PORT}`
- Backend API: `http://localhost:${DJANGO_PORT}/api/...`

## Local Commands

- Frontend dev:

```bash
cd frontend
bun install
bun run dev
```

- Backend tests (if poetry/pytest is installed locally):

```bash
poetry run pytest backend/users/tests backend/items/tests -q
```

- Frontend tests:

```bash
cd frontend
bun run test --run
```

## Cypress

Use a file instead of terminal env vars:

1. Copy `frontend/cypress.env.json.example` to `frontend/cypress.env.json`
2. Edit values (`baseUrl`, usernames, passwords)
3. Run Cypress:

```bash
cd frontend
bunx cypress run
```

## E2E With Isolated Test DB

This project supports running dev DB and test DB in parallel:
- Dev DB: `localhost:5432`
- Test DB: `localhost:5433`

Setup:

1. Copy `backend/.env.e2e.example` to `backend/.env.e2e`
2. Copy `frontend/cypress.env.e2e.json.example` to `frontend/cypress.env.json`
3. Start DBs:

```bash
just db-up
```

Run e2e stack in separate terminals:

```bash
just e2e-backend-dev
just e2e-frontend-dev
```

Then run Cypress with deterministic reset/seed:

```bash
just e2e-run
```
