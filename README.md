# CasaEstates — Setup & Run Guide

## Prerequisites
- Node.js v18+ (LTS)
- MongoDB (optional — app works with mock data if unavailable)

## Quick Start

### 1. Backend
```powershell
cd C:\Users\kumar\.gemini\antigravity\scratch\aura-estates\backend
npm install
npm run dev
# → API running at http://localhost:5000
```

### 2. Frontend
```powershell
cd C:\Users\kumar\.gemini\antigravity\scratch\aura-estates\frontend
npm install
npm run dev
# → App running at http://localhost:5173
```

### 3. Seed MongoDB (optional)
```powershell
cd C:\Users\kumar\.gemini\antigravity\scratch\aura-estates\backend
npm run seed
```

## Pages & Routes
| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Hero, project showcase, stats |
| `/projects/:id` | ProjectDetail | Interactive floor plan, unit list |
| `/resident` | ResidentPortal | Amenity booking, ledger |
| `/admin` | AdminDashboard | Analytics cockpit, approvals |

## API Endpoints (`http://localhost:5000/api/v1/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/projects` | List all projects |
| GET | `/projects/:id` | Single project |
| GET | `/projects/analytics/global` | Global analytics |
| GET | `/units?projectId=xxx` | Units by project |
| PATCH | `/units/:id/availability` | Update unit status |
| GET | `/bookings` | All bookings |
| POST | `/bookings` | Create booking (race-safe) |
| PATCH | `/bookings/:id/approve` | Approve booking |
| DELETE | `/bookings/:id` | Cancel booking |
| GET | `/ledger?userId=xxx` | Transaction ledger |
| GET | `/health` | API health check |

## Key Features
- **No MongoDB required** — all endpoints fall back to rich mock data automatically
- **Interactive SVG Floor Plan** — pinch-zoom on mobile, drag to pan, click available units
- **Race-condition safe bookings** — MongoDB atomic `findOneAndUpdate` on unit availability
- **AI document generation** — allotment letter + cost invoice on booking confirmation
- **Real-time analytics** — Recharts dashboard auto-refreshes every 30 seconds
- **Multi-step booking drawer** — 3-step flow with form validation and cost breakdown
