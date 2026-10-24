# SkySignalLab

A companion web app for SDR (Software Defined Radio): browse radio frequencies, save favorites, check HAM band conditions, and track ADS-B aircraft.

![Go](https://img.shields.io/badge/Go-1.27-00ADD8?style=flat&logo=go)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-3ECF8E?style=flat&logo=supabase)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=flat&logo=docker)
![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-2088FF?style=flat&logo=githubactions)

---

## Features

- **Signals** — Browse a frequency database by category, search by frequency or description, show 15/30/50/100 per page, copy frequencies, and see suggested SDR++ settings (demod, bandwidth, squelch) for each signal.
- **HAM Radio** — Live HF band conditions from hamqsl.com and a local Shreveport/Bossier City repeater list.
- **FM / AM** — Interactive tuner and a local broadcast station directory.
- **Aircraft** — Leaflet map with an aircraft detail drawer (shows mock data until an RTL-SDR + dump1090 feed is connected).
- **Account** — Register/login, favorites with notes, custom signals, CSV import/export, and accent color themes.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 (Vite), TypeScript, Tailwind CSS 4, Leaflet, Tabler Icons |
| Backend | Go 1.27, Chi router, zerolog, Swagger (swaggo) |
| Auth | JWT + bcrypt |
| Database | PostgreSQL (Supabase) |
| Tooling | Docker Compose, GitHub Actions, pnpm |

```
React (Vite)  ──HTTPS──▶  Go API (Chi)  ──▶  PostgreSQL (Supabase)
                               │
                               └──▶  hamqsl.com (band conditions)
```

---

## Getting Started

### 1. Prerequisites

- Go 1.27+
- Node.js 24 (run `nvm use` — the repo includes `.nvmrc`)
- pnpm 12
- Docker (optional, for running the API in a container)
- A [Supabase](https://supabase.com) project

### 2. Set up the database

In the Supabase SQL Editor, run these files in order:

1. `backend/migrations/001_initial_schema.sql` — creates the tables
2. `backend/migrations/002_signal_setup.sql` — seeds the signal list

### 3. Start the backend

Create `backend/.env`:

```env
DATABASE_URL="postgresql://..."   # Supabase Session Pooler connection string
JWT_SECRET=any-long-random-string
PORT=8080                         # optional, defaults to 8080
```

> Use the **Session Pooler** connection string, not Direct Connection — Direct is IPv6-only and fails on most home networks. If your password contains `#`, keep the value in double quotes.

To generate a `JWT_SECRET`:

```bash
openssl rand -base64 48
```

Paste the output as the value. Changing it later logs everyone out, since existing tokens will no longer verify.

Then run it:

```bash
cd backend
go run cmd/main.go
```

Or with Docker, from the repo root:

```bash
docker compose up --build -d     # runs in the background
docker compose logs -f api       # follow logs (Ctrl+C to stop following)
docker compose down              # stop it
```

- API: http://localhost:8080
- Swagger docs: http://localhost:8080/swagger/index.html

### 4. Start the frontend

```bash
cd frontend
pnpm install
echo "VITE_API_URL=http://localhost:8080" > .env.local
pnpm run dev
```

Open http://localhost:5173.

---

## Common Tasks

| Task | Command |
|---|---|
| Run backend tests | `cd backend && go test ./...` |
| Type-check frontend | `cd frontend && pnpm exec tsc --noEmit` |
| Build frontend | `cd frontend && pnpm run build` |
| Regenerate Swagger docs | `cd backend && swag init -g cmd/main.go -o docs` |

If `swag` isn't found, install it with `go install github.com/swaggo/swag/cmd/swag@latest` and make sure `$(go env GOPATH)/bin` is on your `PATH`.

---

## API Endpoints

Full interactive docs are at `/swagger/index.html`.

**Public**

```
GET    /health
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/signals
GET    /api/signals/{id}
GET    /api/band-conditions
GET    /api/repeaters
```

**Requires `Authorization: Bearer <token>`**

```
GET    /api/favorites
POST   /api/favorites
PATCH  /api/favorites/{id}
DELETE /api/favorites/{id}
GET    /api/user-signals
POST   /api/user-signals
PUT    /api/user-signals/{id}
DELETE /api/user-signals/{id}
```

---

## CI/CD

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs on every push and PR to `main`:

- **backend-test** — `go vet` and `go test`
- **frontend-build** — `tsc --noEmit` and `vite build`
- **docker-build-push** (push to `main` only) — builds a `linux/arm64` image and pushes it to `ghcr.io` (verifies the image builds; deploys build locally)

To deploy the API on the host machine:

```bash
git pull && docker compose up --build -d
```

---

## Project Structure

```
skysignallab/
├── backend/
│   ├── cmd/main.go        # Entry point and routes
│   ├── internal/
│   │   ├── auth/          # Register, login, JWT
│   │   ├── handlers/      # HTTP handlers
│   │   ├── middleware/    # Auth, rate limiting, logging
│   │   ├── db/            # Postgres connection pool
│   │   └── external/      # Third-party API clients
│   ├── migrations/        # SQL schema and seed data
│   └── docs/              # Generated Swagger docs
├── frontend/
│   └── src/
│       ├── components/    # One component per tab
│       ├── context/       # Auth context
│       ├── services/      # API client (all fetch calls)
│       └── utils/         # Helpers (e.g. SDR++ settings)
├── docker-compose.yml
└── .github/workflows/     # CI/CD
```

---

## License

MIT
