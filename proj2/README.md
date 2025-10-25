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

## ✨ Features (Milestone 1 - Completed Oct 2025)

### Core API Endpoints
- ✅ **Orders API** - Full CRUD operations for food orders
- ✅ **Robots API** - Fleet management and robot status tracking
- ✅ **Users API** - User profiles and roles
- ✅ **RESTful Architecture** - Clean, documented REST endpoints
- ✅ **OpenAPI Specification** - Complete API documentation
- ✅ **Database Schema** - PostgreSQL-ready; in-memory default for dev
- ✅ **Sample Data** - Seed script for quick demos

### Quality & Testing
- ✅ **Extensive Test Suite** - Covers happy-path and error cases
- ✅ **90%+ Code Coverage** - Via Jest coverage reports
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
```

---

## 📁 Project Structure

```
proj2/
├── src/
│   ├── db/
│   ├── web/
│   │   └── routes/
│   ├── server.ts
│   └── index.ts
├── tests/
├── docs/
│   └── openapi.yaml
├── .github/workflows/ci.yml
├── Dockerfile
├── docker-compose.yml
├── package.json
└── tsconfig.json
```

---

## 🎯 Milestones

### ✅ Milestone 1 (Oct 06) - COMPLETED
- REST spec + OpenAPI file
- Basic CRUD for Orders, Robots, Users
- `GET /orders` & `GET /robots` return data
- Tests and CI configured

### 📋 Milestone 2–4 - Planned
As per `Aim.txt` and poster; see project root for details.

---

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

---

## 📄 License

MIT — see [LICENSE.md](LICENSE.md)
