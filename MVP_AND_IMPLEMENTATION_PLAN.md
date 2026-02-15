# Route Traffic History & Prediction — MVP & Implementation Plan

## Executive Summary

This project enables users to **collect, store, and analyze route traffic data** over time using the Google Maps API. Users can schedule automated data collection between two locations and view historical trends and predictions for travel time.

---

## 1. Project Vision & Goals

### Core Value Proposition
- **Predict** travel times between locations based on historical traffic patterns
- **Visualize** how route duration varies by time of day, day of week, and season
- **Automate** data collection without manual intervention

### Target Users
- Commuters planning optimal departure times
- Logistics and delivery planners
- Urban mobility researchers
- Developers building traffic-aware applications

---

## 2. MVP Scope Definition

### MVP 1 — Data Collection Engine (Core)

**Goal:** Reliably collect and store route data on a configurable schedule.

| Feature | Priority | Description |
|---------|----------|-------------|
| Single route input | P0 | Start location + destination (address or coordinates) |
| Google Maps API integration | P0 | Directions API + Distance Matrix API for route times & distances |
| Configurable schedule | P0 | Cycle duration (default 1 hr), end time (default 1 week) |
| Navigation type | P0 | Driving (default), walking, transit |
| Local or cloud storage | P0 | SQLite or PostgreSQL for MVP |
| Basic logging | P0 | Log collection runs, errors, API usage |

**Out of scope for MVP 1:**
- Live portal, predictions, multiple routes, route preferences (avoid highways/tolls)

---

### MVP 2 — Data Collection + Single Route Results

**Goal:** Collect data and view results for one route.

| Feature | Priority | Description |
|---------|----------|-------------|
| Route preferences | P0 | Fastest route (default), avoid highways, avoid tolls |
| Route details storage | P0 | Roads, turns, distance, duration per collection |
| Simple results view | P0 | Table or chart of collected times over timeline |
| Data export | P1 | CSV/JSON export of collected data |

---

### MVP 3 — Full MVP (Product-Ready)

**Goal:** End-to-end product with live monitoring and multi-route support.

| Feature | Priority | Description |
|---------|----------|-------------|
| Multiple routes | P0 | Get 2–3 alternative routes per collection |
| Retrieve start time | P0 | Default now, optional future date/time |
| Live portal | P0 | Current collection status, progress, basic stats |
| Timeline visualization | P0 | Chart showing route times over collected period |
| Stop/start collection | P1 | Pause, resume, or stop data collection |
| Navigation modes | P1 | Walking, transit in addition to driving |

---

## 3. Technical Architecture

### System Components

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Web Portal    │────▶│  API / Backend   │────▶│   Scheduler     │
│   (Frontend)    │     │  (REST/GraphQL)  │     │   (Cron/Worker)  │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
        │                           │                      │
        │                           │                      ▼
        │                           │             ┌──────────────────┐
        │                           │             │  Google Maps API │
        │                           │             └────────┬────────┘
        │                           │                      │
        │                           ▼                      │
        │                 ┌──────────────────┐            │
        └────────────────▶│   Database       │◀───────────┘
                          │   (PostgreSQL)   │
                          └──────────────────┘
```

### Technology Recommendations

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Frontend | React or Next.js | Component-based UI, good charting libraries |
| Backend | Node.js (Express/Fastify) or Python (FastAPI) | Rapid development, strong ecosystem |
| Database | PostgreSQL | Relational fit, JSON support for route details |
| Scheduler | node-cron / APScheduler / Celery Beat | Reliable cron-like scheduling |
| Charts | Chart.js, Recharts, or Visx | Timeline and time-series visualization |
| Deployment | Docker + VPS or Railway/Render | Simple deployment for MVP |

---

## 4. Data Model

### Core Entities

```sql
-- Collection jobs (user-defined schedules)
CREATE TABLE collection_jobs (
  id UUID PRIMARY KEY,
  start_location TEXT NOT NULL,
  end_location TEXT NOT NULL,
  start_time TIMESTAMPTZ DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  cycle_minutes INT DEFAULT 60,
  navigation_type TEXT DEFAULT 'driving',
  route_preferences JSONB DEFAULT '{}',  -- avoid_highways, avoid_tolls, etc.
  status TEXT DEFAULT 'pending',  -- pending, running, paused, completed
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual route snapshots (per collection cycle)
CREATE TABLE route_snapshots (
  id UUID PRIMARY KEY,
  job_id UUID REFERENCES collection_jobs(id),
  route_index INT,  -- 0 = primary, 1 = alt 1, etc.
  collected_at TIMESTAMPTZ NOT NULL,
  duration_seconds INT,
  distance_meters INT,
  route_details JSONB,  -- steps, polyline, traffic zones
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX idx_snapshots_job_collected ON route_snapshots(job_id, collected_at);
```

---

## 5. Google Maps API Usage

### Required APIs
- **Directions API** — Route geometry, steps, duration, distance
- **Distance Matrix API** — Fast duration/distance for multiple routes (optional)
- **Maps JavaScript API** (optional) — Map visualization in portal

### Rate Limits & Cost
- Directions API: ~$5 per 1,000 requests; 24 requests/day = ~720/month ≈ $3.60
- Use request caching to avoid duplicate calls for same route/time
- Consider **Places API** for autocomplete on start/end locations

---

## 6. Phased Implementation Plan

### Phase 1: Foundation (Weeks 1–2)

| Task | Deliverable |
|------|-------------|
| Project setup | Repo, dependencies, env config |
| Database schema | Migrations, seed data |
| Google Maps integration | Directions API client, error handling |
| Basic collection job | Create job, run single collection, store snapshot |
| Unit tests | Core logic + API client mocks |

### Phase 2: Scheduler & Storage (Weeks 2–3)

| Task | Deliverable |
|------|-------------|
| Scheduler service | Cron job runs at configured intervals |
| Job lifecycle | Start, pause, resume, stop |
| API routes | CRUD for jobs, list snapshots |
| Route preferences | Avoid highways, tolls via Directions API params |

### Phase 3: Frontend MVP (Weeks 3–4)

| Task | Deliverable |
|------|-------------|
| Job creation form | All inputs from spec |
| Jobs list & detail | View active/completed jobs |
| Live status | Collection progress, last run time |
| Simple results view | Table of snapshots by time |

### Phase 4: Visualization & Polish (Weeks 4–5)

| Task | Deliverable |
|------|-------------|
| Timeline chart | Route duration over time (line/area chart) |
| Multi-route comparison | Overlay multiple routes on same chart |
| Export | CSV/JSON download |
| Error handling & UX | Retry, notifications, loading states |

### Phase 5: Extensions (Post-MVP)

| Task | Description |
|------|-------------|
| Predictions | ML model (e.g., time series) for “expected time at X” |
| Traffic zones | Store and visualize traffic density areas |
| Alerts | Notify when travel time exceeds threshold |
| API for third parties | Public API for developers |

---

## 7. Additional Ideas & Enhancements

### Predictive Features
- **Expected travel time** at a given future datetime using historical patterns
- **Best departure window** — suggest when to leave for shortest commute
- **Anomaly detection** — flag unusually slow days (accidents, events)

### UX Enhancements
- **Map preview** — Show route on map before starting collection
- **Address autocomplete** — Google Places Autocomplete for start/end
- **Favorites** — Save common routes for quick re-collection
- **Dark mode** — For dashboard users monitoring overnight

### Data & Analytics
- **Aggregations** — Average by hour, day of week, month
- **Percentiles** — P50, P90, P95 travel times
- **Correlation** — Compare with weather, holidays, events (if data available)

### Operational
- **Health checks** — Monitor API quota, DB, scheduler health
- **Retry logic** — Exponential backoff for transient API failures
- **Data retention** — Auto-archive or delete old snapshots per policy

---

## 8. Success Metrics

| Metric | Target (MVP) |
|--------|--------------|
| Data collection reliability | >99% of scheduled cycles complete |
| Portal load time | <3 seconds |
| API cost per job | <$5/month for 1 route, 1 hr cycle |
| User can create job → see results | End-to-end in <10 minutes |

---

## 9. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Google Maps API cost | Set budget alerts, cache aggressively, limit route count |
| Rate limits | Respect quotas, add delays between requests |
| Long-running jobs | Persist state, support restart after crash |
| Data volume | Partition tables by time, archive old data |

---

## 10. Next Steps

1. **Choose stack** — Confirm backend (Node vs Python) and frontend framework
2. **Set up Google Cloud** — Enable APIs, create credentials, set billing
3. **Implement Phase 1** — Database + single collection run
4. **Iterate** — Add scheduler, then UI, then visualization

---

*Document version: 1.0*  
*Last updated: February 10, 2025*
