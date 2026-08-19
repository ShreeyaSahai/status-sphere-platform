# StatusSphere Frontend

Modern service monitoring and uptime platform frontend built with React, TypeScript, Vite, Tailwind CSS, and TanStack Query.

## Features

- **Real-Time System Dashboard**: Fleet-wide health metrics, global uptime percentage, active incident alerts, and service status cards.
- **Service Management**: Register, configure, edit, and deactivate monitored HTTP/HTTPS endpoints.
- **Historical Telemetry & Metrics**:
  - Interactive 50-check uptime bar strip with timestamp and error tooltips.
  - Smooth response latency trend area chart with average and P95 metrics.
  - Execution log history table with HTTP status codes and response times.
- **Incident Center**: Aggregated feed tracking active and resolved downtime events with duration counters.
- **Configurable Auto-Refresh**: Aligned with the backend scheduler (Default: 30s, Options: 15s, 30s, 60s, Off). Automatically pauses polling when the browser tab is hidden.
- **Zero-CORS Development**: Built-in Vite reverse proxy to seamlessly communicate with the FastAPI backend on `http://127.0.0.1:8000`.

## Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

`VITE_API_BASE_URL` defaults to `/api/v1` (proxied by Vite to the backend).

### 3. Run Development Server

```bash
npm run dev
```

The frontend will be available at: `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

### 5. Run Linter

```bash
npm run lint
```
