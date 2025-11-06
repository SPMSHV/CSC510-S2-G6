# CSC-510, Fall 2025
## Section-2, Group-6

# CampusBot - Autonomous Campus Food Delivery System

## Overview

Welcome to the **CampusBot** repository! CampusBot is an autonomous campus food delivery system that combines a student-facing food delivery app with a robot fleet management portal. This system enables students to order food from on-campus restaurants and have it delivered by autonomous robots, while providing real-time fleet management capabilities for campus administrators and engineers.

## 🎯 Project Mission

CampusBot solves the challenge of fragmented, slow, and costly food delivery on university campuses by:
1. Enabling students to browse campus menus and order food in seconds
2. Dispatching and tracking fully autonomous delivery robots
3. Providing campus admins and robot engineers with a real-time operations console with per-robot health, telemetry, and incident management tools

**Benefits:** Faster deliveries, lower per-delivery costs, predictable campus logistics, improved accessibility for students, and clear accountability for campus facilities and engineers.

---

## 📁 Repository Structure

```
CSC510-S2-G6/
├── proj1/                          # Project 1 deliverables
│   ├── Requirement Analysis.pdf
│   ├── proj1b1.pdf
│   ├── proj1c1.pdf
│   ├── proj1d1.pdf
│   ├── proj1e1.pdf
│   └── readme.md
│
└── proj2/                          # Main CampusBot application
    ├── src/                        # Backend source code
    │   ├── db/                     # Database queries and migrations
    │   ├── services/               # Business logic services
    │   ├── web/                    # Express routes and middleware
    │   └── server.ts               # Server setup
    ├── client/                     # React frontend application
    │   ├── src/
    │   │   ├── components/         # React components
    │   │   ├── pages/              # Page components
    │   │   ├── context/            # React context providers
    │   │   └── lib/                # Utility functions
    │   └── package.json
    ├── tests/                      # Test suite (419+ tests)
    ├── docs/                       # Documentation
    │   ├── DEMO_GUIDE.md
    │   ├── ROADMAP.md
    │   └── openapi.yaml
    ├── INSTALL.md                  # Installation guide
    ├── README.md                   # Detailed project README
    └── package.json
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js (version 18 or higher)
- npm (comes with Node.js)
- PostgreSQL (optional, for production; in-memory mode available for development)
- Git

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/SPMSHV/CSC510-S2-G6.git
   cd CSC510-S2-G6/proj2
   ```

2. **Install dependencies:**
   ```bash
   npm install
   cd client && npm install && cd ..
   ```

3. **Start the application:**
   ```bash
   # Start backend (in-memory mode, no database required)
   npm run dev
   
   # In a separate terminal, start the frontend
   cd client && npm run dev
   ```

4. **Access the application:**
   - **Backend API**: http://localhost:3000
   - **Frontend UI**: http://localhost:5173
   - **API Documentation**: http://localhost:3000/api-docs

For detailed installation instructions, see [proj2/INSTALL.md](proj2/INSTALL.md).

---

## ✨ Project Milestones

### ✅ Milestone 1: Core API Foundation (Completed Oct 2025)
- RESTful API with Express.js and TypeScript
- CRUD operations for Users, Robots, Orders, and Restaurants
- OpenAPI 3.0 specification with Swagger UI
- PostgreSQL database schema with in-memory fallback
- Comprehensive test suite (437 tests, 23 suites)
- Docker containerization
- CI/CD pipeline with GitHub Actions

### ✅ Milestone 2: Student Mobile UI (Completed Oct 2025)
- Home page with restaurant browsing and search
- Restaurant detail pages with menu items
- Shopping cart and checkout flow with coordinate input
- Live order tracking with progress bar and real-time polling
- My Orders page for order history with auto-refresh
- User authentication (registration/login)
- JWT-based authentication with role-based access control
- Responsive mobile-first UI with Tailwind CSS
- Password security with bcrypt hashing

### ✅ Milestone 3: Simulated Robot Telemetry & Fleet Dashboard (Completed Oct 2025)
- Telemetry generator for 5 simulated robots
- Real-time fleet dashboard with live updates
- Server-Sent Events (SSE) for telemetry streaming
- Robot status tracking (battery, position, speed, distance)
- Emergency stop command functionality
- Visual status indicators and connection monitoring
- Telemetry API endpoints for snapshot and streaming
- Robot health monitoring and diagnostics

### ✅ Milestone 4: Vendor Kiosk + Order Handoff Flow (Completed Nov 2025)
- Vendor kiosk UI for order management (`/vendor/kiosk`)
- Order status transitions (CREATED → PREPARING → READY)
- Automatic robot assignment when orders become READY
- Order automation service: automatic transitions (ASSIGNED → EN_ROUTE → DELIVERED)
- Coordinate-based robot assignment using Haversine distance formula
- End-to-end order lifecycle: CREATED → PREPARING → READY → ASSIGNED → EN_ROUTE → DELIVERED
- Vendor authorization and role-based access control
- Real-time order updates with polling mechanism
- Order filtering and order details modal
- Comprehensive test suite (437 total tests including vendor functionality)

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| **Backend** | Node.js 18 + Express + TypeScript |
| **Database** | PostgreSQL 15 (optional); in-memory default |
| **Frontend** | React 18 + TypeScript + Vite + Tailwind CSS |
| **Testing** | Jest + Supertest |
| **API Docs** | OpenAPI 3.0 + Swagger UI |
| **Containerization** | Docker + Docker Compose |
| **Code Quality** | ESLint + Prettier |
| **CI/CD** | GitHub Actions |

---

## 📊 Project Statistics

- **Test Coverage**: 437 test cases, all passing
- **Test Suites**: 23 test suites
- **Code Coverage**: 73%
- **Code Quality**: TypeScript, ESLint, Prettier configured
- **API Endpoints**: 20+ RESTful endpoints
- **Frontend Pages**: 7 main pages (Home, Restaurant Detail, Checkout, Order Tracking, My Orders, Fleet Dashboard, Vendor Kiosk)

---

## 📖 Documentation

- **[Installation Guide](proj2/INSTALL.md)** - Detailed setup instructions
- **[Project README](proj2/README.md)** - Comprehensive project documentation
- **[API Documentation](proj2/docs/openapi.yaml)** - OpenAPI specification
- **[Roadmap](proj2/docs/ROADMAP.md)** - Development roadmap and milestones
- **[Demo Guide](proj2/docs/DEMO_GUIDE.md)** - End-to-end demo instructions
- **[Contributing Guide](proj2/CONTRIBUTING.md)** - How to contribute
- **[Code of Conduct](proj2/CODE_OF_CONDUCT.md)** - Community guidelines

---

## 🧪 Testing

Run the test suite:
```bash
cd proj2
npm test
npm run test:coverage
```

---

## 👥 Contributors

- **Pranshav Gajjar**
- **Aniruddh Sanjeev Bhagwat**
- **Ishan Patel**
- **Hardik Majethia**

---

## 📄 License

MIT License - see [proj2/LICENSE.md](proj2/LICENSE.md) for details.

---

## 🔗 Links

- **Repository**: [GitHub](https://github.com/SPMSHV/CSC510-S2-G6)
- **Main Project**: [proj2/README.md](proj2/README.md)
- **Installation**: [proj2/INSTALL.md](proj2/INSTALL.md)

---

## 📝 Repository Contents

- `proj1/` - Project 1 deliverables and requirements analysis
- `proj2/` - Main CampusBot application (backend + frontend)
  - Backend API server
  - React frontend client
  - Test suite
  - Documentation

---

## 🆘 Support

For installation help, see [proj2/INSTALL.md](proj2/INSTALL.md).

For API documentation, visit the Swagger UI at `http://localhost:3000/api-docs` when the server is running.

For issues or questions, please open a GitHub issue.
