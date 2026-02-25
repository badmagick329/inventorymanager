set windows-shell := ["powershell.exe", "-NoLogo", "-Command"]

default:
  @just --list

# Install dependencies
install:
  poetry install
  cd frontend; bun install

backend-install:
  poetry install

frontend-install:
  cd frontend; bun install

# Frontend build
frontend-build:
  cd frontend; bun run build

# Development servers
backend-dev:
  cd backend; poetry run python manage.py runserver 0.0.0.0:8002

frontend-dev:
  cd frontend; bun run dev

db-up:
  docker compose -f docker-compose-db.yml up -d

db-down:
  docker compose -f docker-compose-db.yml down

# Backend utilities
backend-migrate:
  cd backend; poetry run python manage.py migrate

backend-shell:
  cd backend; poetry run python manage.py shell

# Tests
test:
  just test-backend
  just test-frontend

test-backend:
  poetry run pytest backend/users/tests backend/items/tests -q

test-frontend:
  cd frontend; bun run test --run

