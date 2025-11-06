# 🤖 CampusBot — Autonomous Campus Food Delivery

[![Build Status](https://img.shields.io/github/actions/workflow/status/SPMSHV/CSC510-S2-G6/ci.yml?branch=main&label=Build)](https://github.com/SPMSHV/CSC510-S2-G6/actions/workflows/ci.yml)
[![Tests](https://img.shields.io/badge/tests-437%20passing-success)](https://github.com/SPMSHV/CSC510-S2-G6/actions/runs/19147686918)
[![Coverage](https://img.shields.io/badge/coverage-73%25-green)](https://github.com/SPMSHV/CSC510-S2-G6/actions/runs/19147686918)
[![License](https://img.shields.io/badge/license-MIT-blue)](https://github.com/SPMSHV/CSC510-S2-G6/blob/main/proj2/LICENSE.md)
[![Node Version](https://img.shields.io/badge/node-18.x-green)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-passing-success)](https://github.com/SPMSHV/CSC510-S2-G6/actions/runs/19147686918)
[![ESLint](https://img.shields.io/badge/ESLint-passing-success)](https://github.com/SPMSHV/CSC510-S2-G6/actions/runs/19147686918)
[![Prettier](https://img.shields.io/badge/Prettier-formatted-success)](https://github.com/SPMSHV/CSC510-S2-G6/actions/runs/19147686918)
[![DOI](https://img.shields.io/badge/DOI-10.5281%2Fzenodo.17544418-blue)](https://doi.org/10.5281/zenodo.17544418)


**Tagline:** Robots on campus. Meals on time. Operations you can trust.

---

## 📺 Demo Video

Watch our 3-minute demonstration showing how students order food, how vendors manage orders, and how autonomous robots handle deliveries on campus:

[![CampusBot Demo: Autonomous Campus Food Delivery Platform](https://img.youtube.com/vi/3s_SQrm5GHk/0.jpg)](https://www.youtube.com/watch?v=3s_SQrm5GHk "CampusBot Demo: Watch how students order, vendors manage, and robots deliver food autonomously on campus")


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
- **Repository:** [GitHub Link](https://github.com/SPMSHV/CSC510-S2-G6)
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

### ✅ Additional Features
- **Data Import/Export** - Export data in JSON/CSV formats, import data from JSON (admin only)
- **Accessibility** - ARIA labels, keyboard navigation, semantic HTML for screen readers
- **Dependency Documentation** - Automated dependency documentation with licenses (`npm run docs:dependencies`)
- **License Headers** - Copyright and license headers in source files

### Quality & Testing
- ✅ **419 Test Cases** - Comprehensive coverage including nominal and off-nominal scenarios
- ✅ **22 Test Suites** - All passing with 100% success rate
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

## 📚 Documentation

### Getting Started
- **[Installation Guide](./INSTALL.md)** — Step-by-step setup instructions for local development
- **[Quick Start Tutorial](#quick-start)** — Get CampusBot running in 5 minutes

### API Documentation
- **Interactive API Explorer**: `http://localhost:3000/api-docs` (Swagger UI)
- **OpenAPI Specification**: `http://localhost:3000/api-docs.json` or [docs/openapi.yaml](docs/openapi.yaml)
- **[Backend Documentation](docs/BACKEND.md)** — Comprehensive backend API guide with examples
- **[Frontend Documentation](docs/FRONTEND.md)** — Frontend architecture, components, and UI patterns

### Project Information
- **[Accessibility Guide](./docs/ACCESSIBILITY.md)** — Accessibility standards and testing procedures
- **[Roadmap](./ROADMAP.md)** — Future features, milestones, and project timeline
- **[Contributing Guide](./CONTRIBUTING.md)** — How to contribute code, documentation, and tests
- **[Code of Conduct](./CODE_OF_CONDUCT.md)** — Community guidelines and expectations
- **[Dependency Documentation](./docs/DEPENDENCIES.md)** — Third-party dependencies with licenses (generate with `npm run docs:dependencies`)

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

### ✅ Milestone 4: Vendor Kiosk + Order Handoff Flow (COMPLETED)
- Vendor kiosk UI for order management (`/vendor/kiosk`)
- Order status transitions (CREATED → PREPARING → READY)
- Automatic robot assignment when order becomes READY
- Vendor authorization and access control
- Real-time order updates with status filtering
- Order details modal with full information
- End-to-end order lifecycle: student → vendor → robot assignment
- Comprehensive test suite (40+ tests)
- See [DEMO_GUIDE.md](docs/DEMO_GUIDE.md) for end-to-end demo instructions

---

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

---

## 💬 Support

### Getting Help

- **Documentation**: Check [INSTALL.md](INSTALL.md) for installation and setup guides
- **API Documentation**: Visit Swagger UI at `http://localhost:3000/api-docs`
- **Issues**: Report bugs or request features via [GitHub Issues](https://github.com/your-org/campusbot/issues)
- **Questions**: Open a GitHub issue with the `question` label

### What Support We Provide

- **For Users**: 
  - Installation and setup assistance
  - API usage documentation
  - Troubleshooting common issues
  - Bug fixes and feature requests

- **For Developers**:
  - Code contribution guidelines (see [CONTRIBUTING.md](CONTRIBUTING.md))
  - Code review and feedback on pull requests
  - Architecture and design discussions
  - Test coverage and code quality standards

---

## 🐛 Troubleshooting

### Common Issues

**Issue**: Tests failing with database connection errors
- **Solution**: Ensure PostgreSQL is running if using database mode, or use in-memory mode for development (`npm run dev`)

**Issue**: Port 3000 already in use
- **Solution**: Change the `PORT` environment variable in `.env` or stop the process using port 3000

**Issue**: Client UI not loading
- **Solution**: Ensure backend is running first, then start client with `cd client && npm run dev`

**Issue**: Telemetry stream not connecting
- **Solution**: Check that telemetry simulator is enabled (`ENABLE_TELEMETRY_SIM=1`) or run `npm run dev:telemetry`

**Issue**: Authentication errors
- **Solution**: Ensure JWT_SECRET is set in `.env` file

**Issue**: Build errors with TypeScript
- **Solution**: Run `npm install` to ensure all dependencies are installed, then try `npm run build`

For more detailed troubleshooting, see [INSTALL.md](INSTALL.md).

---

## 📄 License

MIT — see [LICENSE.md](LICENSE.md)

### Citation

If you use CampusBot in your research or project, please cite it as:

```
CampusBot: Autonomous Campus Food Delivery System
Group 6, CSC510 Software Engineering, NC State University
https://github.com/your-org/campusbot
```
