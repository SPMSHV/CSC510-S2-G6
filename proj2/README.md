# 🤖 CampusBot — Autonomous Campus Food Delivery

[![Build Status](https://img.shields.io/github/actions/workflow/status/SPMSHV/CSC510-S2-G6/ci.yml?branch=main&label=Build)](https://github.com/SPMSHV/CSC510-S2-G6/actions/workflows/ci.yml)
[![Tests](https://img.shields.io/badge/tests-437%20passing-success)](https://github.com/SPMSHV/CSC510-S2-G6/actions/runs/19151588484)
[![Coverage](https://img.shields.io/badge/coverage-68%25-green)](https://github.com/SPMSHV/CSC510-S2-G6/actions/runs/19151588484)
[![License](https://img.shields.io/badge/license-MIT-blue)](https://github.com/SPMSHV/CSC510-S2-G6/blob/main/proj2/LICENSE.md)
[![Node Version](https://img.shields.io/badge/node-18.x-green)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-passing-success)](https://github.com/SPMSHV/CSC510-S2-G6/actions/runs/19151588484)
[![ESLint](https://img.shields.io/badge/ESLint-passing-success)](https://github.com/SPMSHV/CSC510-S2-G6/actions/runs/19151588484)
[![Prettier](https://img.shields.io/badge/Prettier-formatted-success)](https://github.com/SPMSHV/CSC510-S2-G6/actions/runs/19151588484)
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
- **Orders API** - Full CRUD operations for food orders with status management
- **Robots API** - Fleet management and robot status tracking
- **Users API** - User profiles, roles, and authentication
- **Restaurants API** - Restaurant and menu management with menu items
- **RESTful Architecture** - Clean, documented REST endpoints
- **OpenAPI Specification** - Complete API documentation with Swagger UI
- **Database Schema** - PostgreSQL-ready; in-memory default for development
- **Sample Data** - Seed script for quick demos and testing
- **Comprehensive Testing** - 437 test cases across 23 test suites
- **CI/CD Pipeline** - GitHub Actions for automated testing and deployment
- **Docker Support** - Containerization with Docker and Docker Compose

### ✅ Milestone 2: Student Mobile UI (Completed Oct 2025)
- **Home Page** - Browse restaurants with search functionality
- **Restaurant Detail Page** - View menus, add items to cart
- **Shopping Cart** - Add/remove items, view totals
- **Checkout Flow** - Order placement with delivery location and coordinates
- **Live Order Tracking** - Real-time order status with progress bar
- **My Orders Page** - View order history and track active orders with auto-refresh
- **Authentication** - User registration, login, and session management
- **JWT Authentication** - Secure token-based authentication
- **Role-Based Access Control** - Student, Vendor, Admin, Engineer roles
- **Responsive Design** - Mobile-first UI with Tailwind CSS
- **Password Security** - Bcrypt hashing and validation

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
- **Telemetry API** - Complete endpoints for snapshot and streaming
- **Robot Health Monitoring** - Real-time status tracking and diagnostics

### ✅ Milestone 4: Vendor Kiosk + Order Handoff Flow (Completed Nov 2025)
- **Vendor Kiosk UI** - Dedicated interface for restaurant order management (`/vendor/kiosk`)
- **Order Acceptance Workflow** - Vendors can accept and manage incoming orders
- **Order Status Transitions** - CREATED → PREPARING → READY workflow
- **Automatic Robot Assignment** - Robots automatically assigned when orders become READY
- **Order Automation** - Automatic status transitions (ASSIGNED → EN_ROUTE → DELIVERED)
- **Vendor Authorization** - Role-based access control for vendor operations
- **Order Filtering** - Filter orders by status (CREATED, PREPARING, READY, etc.)
- **Order Details Modal** - Full order information display
- **Real-time Updates** - Polling mechanism for live order status updates
- **End-to-End Lifecycle** - Complete flow: Student → Vendor → Robot → Delivery
- **Comprehensive Testing** - 40+ tests for vendor functionality
- **Coordinate-Based Assignment** - Nearest robot assignment using Haversine formula

### ✅ Additional Features
- **Data Import/Export** - Export data in JSON/CSV formats, import data from JSON (admin only)
- **Accessibility** - ARIA labels, keyboard navigation, semantic HTML for screen readers
- **Dependency Documentation** - Automated dependency documentation with licenses (`npm run docs:dependencies`)
- **License Headers** - Copyright and license headers in source files

### Quality & Testing
- ✅ **437 Test Cases** - Comprehensive coverage including nominal and off-nominal scenarios
- ✅ **23 Test Suites** - All passing with 100% success rate
- ✅ **Telemetry Tests** - Full test coverage for new telemetry features
- ✅ **73% Code Coverage** - Statements, branches, functions, and lines
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
├── src/                              # Backend source code
│   ├── db/                           # Database layer
│   │   ├── queries/                  # Database query functions
│   │   │   ├── menuItems.ts         # Menu item queries
│   │   │   ├── orders.ts            # Order queries
│   │   │   ├── restaurants.ts       # Restaurant queries
│   │   │   ├── robots.ts           # Robot queries
│   │   │   └── users.ts            # User queries
│   │   ├── client.ts                # Database client (PostgreSQL/in-memory)
│   │   ├── migrate.ts               # Database migrations
│   │   ├── rollback.ts              # Migration rollback
│   │   └── seed.ts                 # Seed script for sample data
│   ├── services/                     # Business logic services
│   │   ├── orderAssignmentService.ts # Automatic order-to-robot assignment
│   │   ├── orderAutomation.ts       # 🆕 Milestone 4: Auto status transitions
│   │   ├── orderTracking.ts         # Order tracking and progress
│   │   ├── robotAssignment.ts       # Robot assignment logic (Haversine)
│   │   └── telemetry.ts             # 🆕 Milestone 3: Telemetry simulator
│   ├── web/                          # Web layer
│   │   ├── middleware/
│   │   │   └── auth.ts              # JWT authentication middleware
│   │   └── routes/                   # API route handlers
│   │       ├── auth.ts              # Authentication routes
│   │       ├── export.ts            # Data export/import routes
│   │       ├── orders.ts            # Order routes (includes vendor endpoints)
│   │       ├── restaurants.ts       # Restaurant routes
│   │       ├── robots.ts           # Robot routes
│   │       ├── telemetry.ts        # 🆕 Milestone 3: Telemetry routes
│   │       ├── users.ts            # User routes
│   │       └── routes.ts           # Route aggregator
│   ├── server.ts                     # Express server setup
│   └── index.ts                      # Application entry point
├── client/                            # React frontend application
│   ├── src/
│   │   ├── components/              # Reusable React components
│   │   │   ├── AuthModal.tsx        # Authentication modal
│   │   │   ├── Cart.tsx             # Shopping cart component
│   │   │   ├── CheckoutModal.tsx   # Checkout form with coordinates
│   │   │   ├── Header.tsx           # Navigation header
│   │   │   ├── MenuItemCard.tsx    # Menu item display
│   │   │   ├── OrderCard.tsx       # Order display card
│   │   │   ├── OrderDetailsModal.tsx # Order details popup
│   │   │   ├── OrderProgressBar.tsx # Order status progress
│   │   │   ├── RestaurantCard.tsx  # Restaurant display card
│   │   │   ├── RobotInfo.tsx       # Robot information display
│   │   │   ├── SearchBar.tsx       # Search functionality
│   │   │   └── VendorOrderCard.tsx # 🆕 Milestone 4: Vendor order card
│   │   ├── context/                 # React context providers
│   │   │   ├── AuthContext.tsx      # Authentication state
│   │   │   └── CartContext.tsx      # Shopping cart state
│   │   ├── lib/
│   │   │   └── api.ts               # API client functions
│   │   ├── pages/                   # Page components
│   │   │   ├── FleetDashboardPage.tsx # 🆕 Milestone 3: Fleet dashboard
│   │   │   ├── HomePage.tsx         # Restaurant browsing
│   │   │   ├── MyOrdersPage.tsx     # User order history
│   │   │   ├── OrderTrackingPage.tsx # Live order tracking
│   │   │   ├── RestaurantDetailPage.tsx # Menu viewing
│   │   │   └── VendorKioskPage.tsx # 🆕 Milestone 4: Vendor kiosk
│   │   ├── types/
│   │   │   └── index.ts             # TypeScript type definitions
│   │   ├── App.tsx                  # Main app component
│   │   └── main.tsx                 # React entry point
│   └── package.json
├── scripts/                          # Utility scripts
│   ├── dev-with-seed.ts             # Development server with seeding
│   ├── generate-dependency-docs.ts  # Generate dependency documentation
│   └── telemetry-sim.ts             # 🆕 Milestone 3: Telemetry generator
├── tests/                            # Test suite (437 tests, 23 suites)
│   ├── db/                          # Database tests
│   │   ├── client.test.ts
│   │   └── queries/                 # Query function tests
│   ├── middleware/                  # Middleware tests
│   │   └── auth.test.ts
│   ├── services/                    # Service tests
│   │   ├── orderTracking.test.ts
│   │   └── robotAssignment.test.ts
│   ├── auth.test.ts                 # Authentication tests
│   ├── health.test.ts               # Health check tests
│   ├── export.test.ts              # Data export/import tests
│   ├── orders.test.ts               # Order API tests
│   ├── orders.validation.test.ts   # Order validation tests
│   ├── orderTracking.test.ts        # Order tracking tests
│   ├── restaurants.test.ts          # Restaurant API tests
│   ├── robots.test.ts              # Robot API tests
│   ├── robots.validation.test.ts   # Robot validation tests
│   ├── telemetry.test.ts           # 🆕 Milestone 3: Telemetry tests
│   ├── users.test.ts               # User API tests
│   ├── users.validation.test.ts    # User validation tests
│   ├── vendorOrders.test.ts        # 🆕 Milestone 4: Vendor order tests
│   └── vendorService.test.ts       # 🆕 Milestone 4: Vendor service tests
├── docs/                             # Documentation
│   ├── ACCESSIBILITY.md             # Accessibility standards and testing
│   ├── API_REFERENCE.md             # Comprehensive API reference
│   ├── BACKEND.md                   # Backend API guide with examples
│   ├── DEMO_GUIDE.md                # End-to-end demo guide
│   ├── DEPENDENCIES.md              # Dependency licenses
│   ├── FRONTEND.md                  # Frontend architecture and UI patterns
│   ├── openapi.yaml                 # OpenAPI 3.0 specification
│   ├── RELEASES.md                  # Release management guide
│   ├── ROADMAP.md                   # Project roadmap
│   └── SUSTAINABILITY.md            # Sustainability documentation
├── db/
│   └── schema.sql                   # PostgreSQL database schema
├── dist/                             # Compiled JavaScript (build output)
├── coverage/                         # Test coverage reports
├── .github/
│   └── workflows/
│       └── ci.yml                   # GitHub Actions CI/CD
├── client/scripts/                   # Client utility scripts
│   └── check-and-seed.js            # Check and seed database script
├── Dockerfile                        # Docker container definition
├── docker-compose.yml                # Docker Compose configuration
├── package.json                      # Backend dependencies
├── Section_2_Group_6.pdf            # Project documentation PDF
├── SECURITY.md                       # Security policy
├── tsconfig.json                     # TypeScript configuration
├── tsconfig.build.json               # Build-specific TypeScript config
└── video_demo.mp4                    # Demo video file
```

---

## 🎯 Milestones

### ✅ Milestone 1: Core API Foundation (Completed Oct 2025)

**Objective**: Build a robust RESTful API foundation with comprehensive data models and testing infrastructure.

**Key Achievements**:
- ✅ Complete REST API with Express.js and TypeScript
- ✅ Full CRUD operations for Orders, Robots, Users, and Restaurants
- ✅ OpenAPI 3.0 specification with Swagger UI documentation
- ✅ Dual database support: PostgreSQL (production) and in-memory (development)
- ✅ Database migrations and seed scripts for sample data
- ✅ Comprehensive test suite with 437 test cases across 23 test suites
- ✅ CI/CD pipeline with GitHub Actions
- ✅ Docker containerization support
- ✅ Project governance: CONTRIBUTING.md, CODE_OF_CONDUCT.md, LICENSE.md

**API Endpoints**:
- `GET/POST /api/orders` - Order management
- `GET/POST /api/robots` - Robot fleet management
- `GET/POST /api/users` - User management
- `GET/POST /api/restaurants` - Restaurant and menu management

---

### ✅ Milestone 2: Student Mobile UI (Completed Oct 2025)

**Objective**: Create an intuitive mobile-first interface for students to browse, order, and track food deliveries.

**Key Achievements**:
- ✅ Home page with restaurant browsing and search functionality
- ✅ Restaurant detail pages with menu viewing and cart management
- ✅ Shopping cart with add/remove items and total calculation
- ✅ Checkout flow with delivery location and coordinate input
- ✅ Live order tracking page with real-time progress bar
- ✅ My Orders page with order history and auto-refresh polling
- ✅ User authentication: registration, login, and session management
- ✅ JWT-based secure authentication with bcrypt password hashing
- ✅ Role-based access control (STUDENT, VENDOR, ADMIN, ENGINEER)
- ✅ Responsive mobile-first design with Tailwind CSS
- ✅ Real-time order status updates with dynamic polling intervals

**User Flows**:
1. Browse restaurants → View menu → Add to cart → Checkout → Track order
2. Register/Login → View order history → Track active orders

---

### ✅ Milestone 3: Simulated Robot Telemetry & Fleet Dashboard (Completed Oct 2025)

**Objective**: Implement real-time robot telemetry simulation and fleet management dashboard for monitoring and control.

**Key Achievements**:
- ✅ Telemetry generator script simulating 5 robots with realistic data
- ✅ Fleet dashboard UI with real-time updates via Server-Sent Events (SSE)
- ✅ Robot metrics display: battery, location, speed, distance traveled
- ✅ Visual status indicators with color-coded badges (IDLE, ASSIGNED, EN_ROUTE, etc.)
- ✅ Emergency stop command functionality for fleet control
- ✅ Live connection status indicator for telemetry stream
- ✅ Telemetry API endpoints: `/api/telemetry/snapshot` and `/api/telemetry/stream`
- ✅ Comprehensive telemetry test suite (437 total tests)
- ✅ Real-time position updates using simulated movement algorithms

**Dashboard Features**:
- Battery percentage with visual indicators
- Current GPS coordinates (latitude/longitude)
- Speed in km/h and total distance traveled
- Status badges with color coding
- Last update timestamps
- Connection status indicator

---

### ✅ Milestone 4: Vendor Kiosk + Order Handoff Flow (Completed Nov 2025)

**Objective**: Enable vendors to manage orders and automate the complete order lifecycle from creation to delivery.

**Key Achievements**:
- ✅ Vendor kiosk UI (`/vendor/kiosk`) for order management
- ✅ Order acceptance workflow: vendors can accept incoming orders
- ✅ Order status transitions: CREATED → PREPARING → READY
- ✅ Automatic robot assignment when orders become READY
- ✅ Order automation service: automatic transitions (ASSIGNED → EN_ROUTE → DELIVERED)
- ✅ Vendor authorization and role-based access control
- ✅ Order filtering by status (CREATED, PREPARING, READY, ASSIGNED, etc.)
- ✅ Order details modal with complete order information
- ✅ Real-time order updates with polling mechanism
- ✅ Coordinate-based robot assignment using Haversine distance formula
- ✅ End-to-end order lifecycle: Student → Vendor → Robot → Delivery
- ✅ Comprehensive test suite: 437 total tests including vendor functionality
- ✅ Delivery coordinate input in checkout for accurate robot assignment

**Order Lifecycle**:
1. **Student** places order (CREATED)
2. **Vendor** accepts order (PREPARING)
3. **Vendor** marks order ready (READY)
4. **System** automatically assigns nearest robot (ASSIGNED)
5. **System** automatically transitions to en route (EN_ROUTE) after 30 seconds
6. **System** automatically marks delivered (DELIVERED) after 1 minute
7. **Robot** returns to IDLE status

**Technical Features**:
- Nearest robot calculation using Haversine formula
- Automatic order status transitions with configurable delays
- Real-time polling for order updates
- Coordinate-based delivery location support
- Vendor-specific order filtering and management

See [docs/DEMO_GUIDE.md](docs/DEMO_GUIDE.md) for end-to-end demo instructions.

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
