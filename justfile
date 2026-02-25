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

e2e-backend-dev:
  if (!(Test-Path backend/.env.e2e)) { throw "Missing backend/.env.e2e. Copy backend/.env.e2e.example first." }; Get-Content backend/.env.e2e | ForEach-Object { if ($_ -and -not $_.StartsWith('#')) { $name,$value = $_ -split '=',2; [Environment]::SetEnvironmentVariable($name.Trim(),$value.Trim(),'Process') } }; cd backend; poetry run python manage.py runserver 0.0.0.0:8003

e2e-frontend-dev:
  cd frontend; $env:BASE_URL='http://localhost:8003'; bunx next dev -p 5001 -H 0.0.0.0

e2e-reset:
  if (!(Test-Path backend/.env.e2e)) { throw "Missing backend/.env.e2e. Copy backend/.env.e2e.example first." }; Get-Content backend/.env.e2e | ForEach-Object { if ($_ -and -not $_.StartsWith('#')) { $name,$value = $_ -split '=',2; [Environment]::SetEnvironmentVariable($name.Trim(),$value.Trim(),'Process') } }; cd backend; poetry run python manage.py migrate; poetry run python manage.py flush --no-input; poetry run python manage.py migrate; poetry run python manage.py seed_e2e

e2e-run:
  just e2e-reset
  if (!(Test-Path frontend/cypress.env.e2e.json)) { throw "Missing frontend/cypress.env.e2e.json. Copy frontend/cypress.env.e2e.json.example first." }; $cfg = Get-Content frontend/cypress.env.e2e.json -Raw | ConvertFrom-Json; if ($cfg.baseUrl) { $env:CYPRESS_BASE_URL = [string]$cfg.baseUrl }; if ($cfg.adminUsername) { $env:CYPRESS_ADMIN_USERNAME = [string]$cfg.adminUsername }; if ($cfg.adminPassword) { $env:CYPRESS_ADMIN_PASSWORD = [string]$cfg.adminPassword }; if ($cfg.userUsername) { $env:CYPRESS_USER_USERNAME = [string]$cfg.userUsername }; if ($cfg.userPassword) { $env:CYPRESS_USER_PASSWORD = [string]$cfg.userPassword }; cd frontend; bunx cypress run

e2e-open:
  just e2e-reset
  if (!(Test-Path frontend/cypress.env.e2e.json)) { throw "Missing frontend/cypress.env.e2e.json. Copy frontend/cypress.env.e2e.json.example first." }; $cfg = Get-Content frontend/cypress.env.e2e.json -Raw | ConvertFrom-Json; if ($cfg.baseUrl) { $env:CYPRESS_BASE_URL = [string]$cfg.baseUrl }; if ($cfg.adminUsername) { $env:CYPRESS_ADMIN_USERNAME = [string]$cfg.adminUsername }; if ($cfg.adminPassword) { $env:CYPRESS_ADMIN_PASSWORD = [string]$cfg.adminPassword }; if ($cfg.userUsername) { $env:CYPRESS_USER_USERNAME = [string]$cfg.userUsername }; if ($cfg.userPassword) { $env:CYPRESS_USER_PASSWORD = [string]$cfg.userPassword }; cd frontend; bunx cypress open

e2e:
  @echo "1) just db-up"
  @echo "2) just e2e-backend-dev    # separate terminal"
  @echo "3) just e2e-frontend-dev   # separate terminal"
  @echo "4) just e2e-run            # this terminal"

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
