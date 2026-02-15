# Route Traffic History & Prediction

Track and predict travel times between locations by collecting route and traffic data over time using the Google Maps API.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   cd frontend && npm install && cd ..
   ```

2. **Configure Google Maps API**
   - Create a [Google Cloud project](https://console.cloud.google.com/)
   - Enable: **Directions API**, **Maps JavaScript API**, **Places API**
   - Create an API key
   - Copy `.env.example` to `.env` and add your keys:
     ```bash
     cp .env.example .env
     # Edit .env: set GOOGLE_MAPS_API_KEY and VITE_GOOGLE_MAPS_API_KEY
     # (Can use the same key for both, or a separate key with HTTP referrer restrictions for frontend)
     ```

3. **Initialize database**
   ```bash
   npm run db:init
   ```

## Run

Start both backend and frontend:

```bash
npm run dev
```

- **Backend:** http://localhost:3001  
- **Frontend:** http://localhost:5173 (proxies API to backend)

## Features

- **Address autocomplete** for start/destination (Places API)
- **Embedded route map** on job detail page (Maps JavaScript API)
- **Create jobs** with start/destination, schedule, navigation type, route preferences
- **Live status** — see collection progress and last run time
- **Timeline chart** — visualize travel times over the collected period
- **Multiple routes** — compare up to 3 alternative routes
- **Export** — CSV or JSON download of collected data
- **Start / Pause / Resume / Stop** — control collection jobs

## Tech Stack

- **Backend:** Node.js, Express, SQLite (better-sqlite3), node-cron
- **Frontend:** React, Vite, Recharts
