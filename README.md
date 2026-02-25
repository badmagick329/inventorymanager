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
npm install
npm run dev
```

- Backend tests (if poetry/pytest is installed locally):

```bash
poetry run pytest backend/users/tests backend/items/tests -q
```

- Frontend tests:

```bash
cd frontend
npm test -- --run
```
