# TMO-G5AR Portal

A modern web admin interface for the T-Mobile Arcadyan G5AR 5G Gateway, built with Vite, TanStack Router, and shadcn/ui.

[![GitHub](https://img.shields.io/badge/GitHub-rchen14b-181717?style=flat&logo=github)](https://github.com/rchen14b/TMO-G5AR-Portal)
[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-support-yellow?style=flat&logo=buy-me-a-coffee)](https://buymeacoffee.com/rchen14b)

## Screenshots

### Dashboard
Real-time gateway status with 5G signal metrics, connection details, and device overview.

![Dashboard](docs/screenshots/screenshot_dashboard.png)

### Cell Information
Detailed 5G cellular metrics with signal quality sparklines, tower information, and SIM details.

![Cell Info](docs/screenshots/screenshot_cell_info.png)

### Connected Devices
View all devices connected to your network with IP/MAC addresses and signal strength.

![Devices](docs/screenshots/screenshot_devices.png)

### WiFi Settings
Manage your wireless networks across 2.4GHz, 5GHz, and 6GHz bands.

![WiFi](docs/screenshots/screenshot_wifi.png)

### System
Gateway information, system status, and quick actions like reboot.

![System](docs/screenshots/screenshot_system.png)

## Features

- **Dashboard** - Real-time signal strength gauges (RSRP/RSRQ/SINR), connection status, uptime
- **Connected Devices** - View all clients with names, IPs, MAC addresses, and signal strength
- **WiFi Settings** - Manage SSID, password, and band configurations (2.4GHz, 5GHz, 6GHz)
- **Cell Info** - Detailed 5G metrics including tower ID, band info (n41), and GPS coordinates
- **SIM Info** - ICCID, IMEI, IMSI details
- **System Controls** - Reboot gateway, view device info and firmware version

## Tech Stack

- **SPA**: Vite + React 18 + [TanStack Router](https://tanstack.com/router)
- **API proxy**: Hono on Node (`/api/router/*`, httpOnly cookies, same-origin from the UI)
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Data Fetching**: SWR for real-time updates
- **Icons**: Lucide React

## Router API Endpoints

| Endpoint | Auth | Description |
|----------|------|-------------|
| `POST /TMI/v1/auth/login` | No | Authenticate, returns JWT token |
| `GET /TMI/v1/version` | No | API version |
| `GET /TMI/v1/gateway?get=all` | No | Device info, signal summary, uptime |
| `GET /TMI/v1/gateway?get=signal` | No | Signal info only |
| `GET /TMI/v1/network/telemetry?get=cell` | Yes | 5G signal metrics |
| `GET /TMI/v1/network/telemetry?get=clients` | Yes | Connected devices |
| `GET /TMI/v1/network/telemetry?get=sim` | Yes | SIM card info |
| `GET /TMI/v1/network/configuration/v2?get=ap` | Yes | WiFi AP settings |
| `POST /TMI/v1/network/configuration/v2?set=ap` | Yes | Update WiFi settings |
| `POST /TMI/v1/gateway/reset?set=reboot` | Yes | Reboot gateway |

## Getting Started

```bash
# Install dependencies
pnpm install

# Run API (port 3000) + Vite dev server (port 5173) together
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser. The Vite dev server proxies `/api` to the Hono server on port 3000 so cookies and same-origin `fetch("/api/router/...")` behave like production.

For production-style single port after a build:

```bash
pnpm build
PORT=3000 pnpm start
```

Then open [http://localhost:3000](http://localhost:3000).

Login with your gateway credentials (found on the label of your device). The default username is `admin` and the default gateway IP is `192.168.12.1`.

## Docker

### Prerequisites

Make sure [Docker Desktop](https://www.docker.com/products/docker-desktop/) is installed and running before proceeding.

### Build

```bash
docker buildx build -t g5ar-portal .
```

### Run

**Linux:**
```bash
docker run --network host g5ar-portal
```

**macOS/Windows:** Docker Desktop doesn't support `--network host`. Use port mapping instead:
```bash
docker run -p 3000:3000 g5ar-portal
```

Access the portal at [http://localhost:3000](http://localhost:3000).

### Docker Compose

**Linux** (`docker-compose.yml`):
```yaml
services:
  g5ar-portal:
    build: .
    network_mode: host
    restart: unless-stopped
```

**macOS/Windows** (`docker-compose.yml`):
```yaml
services:
  g5ar-portal:
    build: .
    ports:
      - "3000:3000"
    restart: unless-stopped
```

Then run:

```bash
docker compose up -d
```

## Project Structure

```
server/
├── index.ts              # Hono app: /api/router/* + static SPA in production
└── router-api.ts         # Server-side gateway proxy (cookies → LAN HTTP)

src/
├── routes/               # TanStack Router file routes (see routeTree.gen.ts)
├── pages/                # Page-level React components
├── components/
│   ├── ui/               # shadcn/ui components
│   └── ...
├── lib/
│   ├── router-types.ts   # Shared TypeScript types for gateway JSON
│   └── utils.ts
└── hooks/
    └── use-router-data.ts
```

## License

MIT
