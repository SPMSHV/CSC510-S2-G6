# 🤖 CampusBot — Autonomous Campus Food Delivery

![Build Status](https://img.shields.io/github/actions/workflow/status/your-org/campusbot/ci.yml?branch=main)
![Tests](https://img.shields.io/badge/tests-passing-success)
![Coverage](https://img.shields.io/badge/coverage-90%2B%25-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Node Version](https://img.shields.io/badge/node-18.x-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Code Style](https://img.shields.io/badge/code%20style-prettier-ff69b4)

**Tagline:** Robots on campus. Meals on time. Operations you can trust.

---

## 📺 Demo Video

[▶️ Watch 2-Minute Demo](https://youtu.be/demo-placeholder) _(Demo shows complete API functionality, database operations, and test suite execution)_

---

## 🎯 Mission Statement

Online and on-campus food options are fragmented, slow, and costly to manage when every delivery needs a person — especially inside dense university campuses. **CampusBot** solves that challenge by combining a fast student-facing food delivery app with an autonomous **robot fleet management portal** for universities and engineers. We build a single integrated system that: 

1. Lets students browse campus menus and order in seconds
2. Dispatches and tracks fully autonomous delivery robots
3. Provides campus admins and robot engineers a real-time operations console with per-robot health, telemetry, and incident tools

**So what?** Faster deliveries, lower per-delivery costs, predictable campus logistics, improved accessibility for students, and clear accountability for campus facilities and engineers. The system reduces human labor on repetitive routes, gives campus stakeholders visibility and control, and delivers a safer, measurable rollout path for autonomous delivery.

---

## 👥 Stakeholders

- **Students / Customers** — order, track, rate
- **On-campus Restaurants / Vendors** — accept orders, prepare food, hand off to robot
- **Delivery Robots** (autonomous agents) — physical asset & telemetry source
- **Robot Engineers / Fleet Maintenance** — repair, diagnostics, updates
- **University (Campus Ops & Facilities)** — policy, corridor management, power/charging infrastructure
- **App Admins / Support Staff** — refunds, order issues, analytics

---

## 🚀 Project Information

- **Project Name:** CampusBot
- **Group #:** 6
- **Group Members:** 
- **Repository:** [GitHub Link](https://github.com/your-org/campusbot)
- **Discussion Forum:** [Discord/Forum QR Code Link]

---

## ✨ Features

### ✅ Milestone 1: Core API Foundation (Completed Oct 2025)
- **Orders API** - Full CRUD operations for food orders
- **Robots API** - Fleet management and robot status tracking
- **Users API** - User profiles and roles
- **Restaurants API** - Restaurant and menu management
- **RESTful Architecture** - Clean, documented REST endpoints
- **OpenAPI Specification** - Complete API documentation
- **Database Schema** - PostgreSQL-ready; in-memory default for dev
- **Sample Data** - Seed script for quick demos

### ✅ Milestone 2: Student Mobile UI (Completed Oct 2025)
- **Home Page** - Browse restaurants and search functionality
- **Restaurant Menu** - View menus, add items to cart
- **Checkout Flow** - Order placement with delivery location
- **Live Order Tracking** - Real-time order status with progress bar
- **My Orders** - View order history and track active orders
- **Authentication** - User registration, login, and session management
- **Responsive Design** - Mobile-first UI with Tailwind CSS

### ✅ Milestone 3: Simulated Robot Telemetry & Fleet Dashboard (Completed Oct 2025)
- **Telemetry Generator** - Simulates 5 robots with live position, battery, and status updates
- **Fleet Dashboard** - Real-time dashboard showing all robots with:
  - Battery percentage with visual indicators
  - Current location (lat/lng coordinates)
  - Speed (km/h) and distance traveled metrics
  - Status badges with color coding (IDLE, ASSIGNED, EN_ROUTE, etc.)
  - Last update timestamps
- **Stop Command** - Simulated emergency stop functionality for fleet control
- **SSE Streaming** - Server-Sent Events for real-time telemetry updates
- **Connection Status** - Live connection indicator for telemetry stream

### Quality & Testing
- ✅ **378 Test Cases** - Comprehensive coverage including nominal and off-nominal scenarios
- ✅ **20 Test Suites** - All passing with 100% success rate
- ✅ **Telemetry Tests** - Full test coverage for new telemetry features
- ✅ **Automated CI** - GitHub Actions for lint/build/test
- ✅ **Type Safety** - Full TypeScript implementation
- ✅ **Code Quality Tools** - ESLint, Prettier

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| 🚀 **Backend** | Node.js 18 + Express + TypeScript |
| 🗄️ **Database** | PostgreSQL 15 (optional); in-memory default |
| 🧪 **Testing** | Jest + Supertest |
| 📊 **API Docs** | OpenAPI 3.0 + Swagger UI |
| 🐳 **Containerization** | Docker + Docker Compose |
| 🔧 **Code Quality** | ESLint + Prettier |
| 📈 **CI** | GitHub Actions |

---

## 📦 Installation

See [INSTALL.md](INSTALL.md) for detailed installation instructions.

### Quick Start

```bash
# Clone the repository
git clone https://github.com/your-org/campusbot.git
cd campusbot/proj2

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start in dev (in-memory storage)
npm run dev
```

The API will be available at `http://localhost:3000`

---

## 🧪 Testing

```bash
npm test
npm run test:coverage
```

---

## 📖 API Documentation

- Swagger UI: `http://localhost:3000/api-docs`
- OpenAPI JSON: `http://localhost:3000/api-docs.json`

### Quick API Examples

```bash
# Health
curl http://localhost:3000/health

# Create a user
curl -X POST http://localhost:3000/api/users -H 'Content-Type: application/json' \
  -d '{"email":"student@university.edu","name":"Student","role":"STUDENT"}'

# Create a robot
curl -X POST http://localhost:3000/api/robots -H 'Content-Type: application/json' \
  -d '{"robotId":"RB-07","status":"IDLE","batteryPercent":95,"location":{"lat":35.77,"lng":-78.64}}'

# Create an order
curl -X POST http://localhost:3000/api/orders -H 'Content-Type: application/json' \
  -d '{"userId":"student-1","vendorId":"vendor-1","items":[{"name":"Burger","quantity":1,"price":10},{"name":"Fries","quantity":2,"price":3}],"deliveryLocation":"Engineering"}'

# Get telemetry snapshot (5 simulated robots)
curl http://localhost:3000/api/telemetry/snapshot

# Stream telemetry updates (SSE)
curl http://localhost:3000/api/telemetry/stream

# Send stop command to robot
curl -X POST http://localhost:3000/api/telemetry/robots/sim-1/stop
```

---

## 📁 Project Structure

```
proj2/
├── src/
│   ├── db/
│   │   ├── queries/
│   │   ├── client.ts
│   │   ├── migrate.ts
│   │   └── seed.ts
│   ├── services/
│   │   ├── orderTracking.ts
│   │   ├── robotAssignment.ts
│   │   └── telemetry.ts          # 🆕 Milestone 3: Telemetry simulator
│   ├── web/
│   │   ├── middleware/
│   │   │   └── auth.ts
│   │   └── routes/
│   │       ├── auth.ts
│   │       ├── orders.ts
│   │       ├── restaurants.ts
│   │       ├── robots.ts
│   │       ├── telemetry.ts      # 🆕 Milestone 3: Telemetry endpoints
│   │       └── users.ts
│   ├── server.ts
│   └── index.ts
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── lib/
│   │   ├── pages/
│   │   │   ├── HomePage.tsx
│   │   │   ├── RestaurantDetailPage.tsx
│   │   │   ├── MyOrdersPage.tsx
│   │   │   ├── OrderTrackingPage.tsx
│   │   │   └── FleetDashboardPage.tsx  # 🆕 Milestone 3: Fleet dashboard
│   │   └── types/
│   └── package.json
├── scripts/
│   ├── dev-with-seed.ts
│   └── telemetry-sim.ts           # 🆕 Milestone 3: Telemetry generator
├── tests/
│   ├── telemetry.test.ts          # 🆕 Milestone 3: Telemetry tests
│   └── ...
├── docs/
│   ├── openapi.yaml
│   ├── ROADMAP.md
│   └── SUSTAINABILITY.md
├── .github/workflows/ci.yml
├── Dockerfile
├── docker-compose.yml
├── package.json
└── tsconfig.json
```

---

## 🎯 Milestones

### ✅ Milestone 1: Core API Foundation (COMPLETED)
- REST spec + OpenAPI file
- Basic CRUD for Orders, Robots, Users, Restaurants
- `GET /orders` & `GET /robots` return sample data
- Database schema and seed scripts
- Tests and CI configured

### ✅ Milestone 2: Student Mobile UI (COMPLETED)
- Home, Menu, Checkout, Live Track mock in React
- Clickable flows for ordering → tracking
- Authentication and user management
- Responsive mobile-first design

### ✅ Milestone 3: Simulated Robot Telemetry & Fleet Dashboard (COMPLETED)
- Telemetry generator script for 5 simulated robots
- Fleet dashboard showing battery, position, speed, distance
- Ability to send simulated "stop" command
- Real-time SSE streaming for live updates

### 📋 Milestone 4: Vendor Kiosk + Order Handoff Flow (PLANNED)
- Kiosk UI for vendors to accept orders
- API integration for order lifecycle management
- End-to-end demo showing student → vendor → robot assignment flow

---

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

---

## 📄 License

MIT — see [LICENSE.md](LICENSE.md)
