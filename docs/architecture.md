# System Architecture

## Overview

SuperStar Influencer Consulting & Marketing Portal is a web-based SaaS product consisting of:

- **Backend API**: FastAPI application (`app/main.py`) with SQLite database (`data.db`).
- **Frontend**: React (Vite) single-page application (`frontend/`), consuming the backend API.
- **Data Layer**: `metrics` and `metrics_history` tables storing influencer and historical performance.

The product exposes two main experiences:

- **Supervisor Dashboard**: For agency managers (already implemented).
- **Influencer Portal**: For individual creators (UI skeleton implemented, data endpoints planned).

## Backend Components

- `app/main.py`
  - REST API endpoints for metrics, charts, group performance, etc.
  - Period-aware queries (daily, weekly, monthly) using `metrics_history`.
  - Aggregation logic for ABPS, TIS, COS and other KPIs.

- Database (`data.db`)
  - `metrics`: current snapshot per influencer (tokens, hours, scores, followers, likes, joined_at, etc.).
  - `metrics_history`: daily history per influencer (date, tokens, hours, abps, tis, cos, etc.).

### Planned Auth & Users

> Design-level only for now, to be implemented.

- `users` table (planned schema):
  - `id` (integer, PK)
  - `email` (text, unique)
  - `password_hash` (text)
  - `role` (text: `admin` | `supervisor` | `influencer`)
  - `linked_influencer_username` (text, nullable) – binds a user to a row in `metrics` when role = `influencer`.

- Key endpoints (planned):
  - `POST /api/login` → returns auth token + role + basic user info.
  - `GET /api/me` → returns current authenticated user.
  - `GET /api/influencer/me/summary` → influencer-specific KPIs based on `linked_influencer_username`.
  - `GET /api/influencer/me/history` → time series for that influencer.

## Frontend Architecture

- Entry: `frontend/src/main.jsx`
  - Wraps the app in `BrowserRouter`.
  - Handles login state and routes.

- Pages:
  - `Supervisor.jsx` – main agency dashboard.
  - `Influencers.jsx`, `InfluencerDetail.jsx` – lists and detail views.
  - `Veriler.jsx` – raw data / development view.
  - `Login.jsx` – login screen.
  - `InfluencerPortal.jsx` – **creator dashboard skeleton** at `/creator`.

- Components:
  - Performance cards, charts, tables (MentorBarChart, GrupPerformansTable, PerformanceMetrics, etc.).

### Routing (High level)

- Root routing (after `main.jsx` update):
  - If **not logged in**:
    - `/creator` → `InfluencerPortal` (preview mode, no auth yet).
    - `*` → `Login`.
  - If **logged in** (admin/supervisor mock):
    - `/creator` → `InfluencerPortal`.
    - `*` → `Layout` with sidebar + supervisor pages.

In the next auth iteration, routing will depend on `user.role`.

## Data Flow (Supervisor)

1. Browser requests supervisor dashboard.
2. Frontend calls backend endpoints such as:
   - `/api/metrics`, `/api/metrics/period`
   - `/api/chart/period`
   - `/api/grup-stats`
3. Backend queries `metrics` / `metrics_history` and computes:
   - Totals per agency / group / mentor.
   - Averages and scores (ABPS, TIS, COS).
4. Frontend renders cards, charts, and tables based on the JSON responses.

## Data Flow (Influencer – Planned)

1. Influencer logs in (future `POST /api/login` with role = `influencer`).
2. Frontend loads `/creator` and calls:
   - `/api/influencer/me/summary` → personal KPIs.
   - `/api/influencer/me/history?period=...` → time series.
3. Backend resolves the current user, maps to `linked_influencer_username` and queries `metrics` / `metrics_history` for that creator only.
4. Frontend shows simplified scores and tips (no cross-influencer comparisons).

## Security & Separation (Planned)

- Auth tokens to protect supervisor and influencer APIs.
- Role-based checks in FastAPI dependencies.
- Influencer views restricted to their own data.
- Supervisor views allowed to aggregate across all influencers of the agency.
