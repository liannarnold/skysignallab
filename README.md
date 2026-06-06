# SkySignalLab

A full-stack SDR (Software Defined Radio) companion app for browsing radio frequencies, managing favorites, and tracking live ADS-B aircraft.

![SkySignalLab](https://img.shields.io/badge/Go-1.26-00ADD8?style=flat&logo=go)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-3ECF8E?style=flat&logo=supabase)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=flat&logo=docker)
![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-2088FF?style=flat&logo=githubactions)

---

## Features

### Signals
- Browse a curated database of radio frequencies filtered by category (HAM, Weather, Aviation, Marine, Emergency, CB, Broadcast)
- Search by frequency or description
- Filter by mode (AM, FM, NFM, USB, LSB) and frequency range
- Copy frequencies to clipboard with one click
- Save favorites with personal notes

### HAM Radio
- Live HF band conditions pulled from hamqsl.com
- Local repeater directory for the Shreveport/Bossier City area
- ARRL band plan reference
- Filter frequencies by HF, VHF, and UHF

### FM / AM
- Interactive frequency tuner with slider
- Local Shreveport/Bossier City broadcast station directory
- RDS now-playing metadata (requires RTL-SDR kit)
- FM and AM band support

### Aircraft
- Live ADS-B aircraft tracking map (requires RTL-SDR kit + dump1090)
- Real Leaflet.js map centered on local area
- Commercial and military aircraft differentiation
- Click-to-inspect aircraft detail drawer (callsign, altitude, speed, heading, route)

### Account
- JWT-based authentication (register, login, logout)
- Personal favorites with notes
- Custom user-defined signals (full CRUD)
- CSV export and import of signal data
- Accent color customization (WCAG AA accessible)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 (Vite), TypeScript, Tailwind CSS 4 |
| Map | Leaflet.js + react-leaflet |
| Icons | Tabler Icons |
| Backend | Go 1.26, Chi router |
| Auth | JWT (golang-jwt) |
| Database | PostgreSQL (Supabase) |
| Containerization | Docker + Docker Compose |
| CI/CD | GitHub Actions |
| Hosting | Oracle Cloud ARM VM + Vercel |
| Logging | zerolog |
| API Docs | Swagger / OpenAPI |

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   React (Vite)                  │
│              Vercel — Static hosting            │
└──────────────────────┬──────────────────────────┘
                       │ HTTPS
┌──────────────────────▼──────────────────────────┐
│              Go API (Chi router)                │
│         Oracle Cloud ARM Ampere VM              │
│                                                 │
│  /api/auth        JWT auth                      │
│  /api/signals     Signal database               │
│  /api/favorites   User favorites                │
│  /api/user-signals Custom signals               │
│  /api/band-conditions → hamqsl.com proxy        │
│  /api/repeaters   Local repeater directory      │
│  /ws/aircraft     WebSocket (V2 — ADS-B)        │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│           PostgreSQL (Supabase)                 │
│  users · signals · favorites · user_signals     │
│  signal_tags · sdr_session                      │
└─────────────────────────────────────────────────┘
                       │ (V2)
┌──────────────────────▼──────────────────────────┐
│         RTL-SDR Kit + dump1090                  │
│    ADS-B decoder → Go WebSocket hub             │
└─────────────────────────────────────────────────┘
```

---

## Local Development

### Prerequisites
- Go 1.26+
- Node.js 20+
- Docker + Docker Compose
- A [Supabase](https://supabase.com) project

### Backend

```bash
cd backend

# Install dependencies
go mod download

# Create .env file
cp .env.example .env
# Fill in DATABASE_URL and JWT_SECRET

# Run database migrations
# Paste backend/migrations/001_initial_schema.sql into Supabase SQL Editor

# Run locally
go run cmd/main.go

# Or with Docker
docker compose up --build
```

The API will be available at `http://localhost:8080`
Swagger docs at `http://localhost:8080/swagger/index.html`

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local
echo "VITE_API_URL=http://localhost:8080" > .env.local

# Run dev server
npm run dev
```

The app will be available at `http://localhost:5173`

---

## Database Schema

```sql
users          — Auth accounts with admin flag
signals        — Curated radio frequency database
favorites      — User-saved signals with notes
user_signals   — User-defined custom frequencies
signal_tags    — Custom tags on signals
sdr_session    — SDR hardware session management (V2)
```

---

## API Endpoints

### Public
```
GET  /health
GET  /api/signals
GET  /api/signals/:id
GET  /api/band-conditions
GET  /api/repeaters
```

### Protected (Bearer token required)
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/favorites
POST   /api/favorites
DELETE /api/favorites/:id
PATCH  /api/favorites/:id
GET    /api/user-signals
POST   /api/user-signals
PUT    /api/user-signals/:id
DELETE /api/user-signals/:id
```

Full interactive documentation available at `/swagger/index.html`

---

## CI/CD Pipeline

```
Push to main
    ↓
GitHub Actions
    ↓
Run Go unit tests
    ↓
Build Docker image (linux/arm64)
    ↓
Push to GitHub Container Registry
    ↓
SSH into Oracle Cloud ARM VM
    ↓
Pull new image + restart container
    ↓
Vercel auto-deploys React frontend
```

---

## Roadmap

### V2 — ADS-B Integration (RTL-SDR kit required)
- [ ] Live aircraft tracking via dump1090 + WebSocket
- [ ] Historical aircraft sighting logs
- [ ] Flight path trails on map
- [ ] RepeaterBook API integration (replace hardcoded repeaters)
- [ ] RDS now-playing metadata via redsea decoder
- [ ] Redis caching for signals and aircraft feed
- [ ] SDR session management (single-user hardware lock)

### V3 — Future
- [ ] React Native companion mobile app
- [ ] Admin UI for managing signals database
- [ ] Signal strength meter
- [ ] OpenSky Network aircraft registration details

---

## Project Structure

```
skysignallab/
├── frontend/                  # React app (Vite + TypeScript)
│   ├── src/
│   │   ├── components/        # Tab components + shared UI
│   │   ├── context/           # Auth context
│   │   └── services/          # API service layer
├── backend/
│   ├── cmd/                   # main.go entry point
│   ├── internal/
│   │   ├── auth/              # JWT auth handlers
│   │   ├── handlers/          # HTTP route handlers
│   │   ├── middleware/        # JWT, rate limiting, logging
│   │   ├── db/                # PostgreSQL connection pool
│   │   └── external/          # Third-party API clients
│   ├── migrations/            # SQL schema
│   └── docs/                  # Swagger generated docs
├── docker-compose.yml
└── .github/workflows/         # GitHub Actions CI/CD
```

---

## License

MIT