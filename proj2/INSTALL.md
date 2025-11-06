# CampusBot - Installation Guide

This guide will help you install and run the CampusBot API and Client UI locally.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **PostgreSQL** (version 12 or higher) - [Download](https://www.postgresql.org/download/) - *Optional for development*
- **Git** - [Download](https://git-scm.com/downloads)

### Verify Installation

```bash
node --version    # Should be v18.0.0 or higher
npm --version     # Should be 9.0.0 or higher
git --version     # Any recent version
```

---

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/SPMSHV/CSC510-S2-G6.git
cd CSC510-S2-G6/proj2
```

### 2. Install Backend Dependencies

```bash
npm install
```

This will install all required dependencies for the backend server.

### 3. Set Up Environment Variables

Create a `.env` file in the `proj2` directory:

```bash
# Copy example if available, or create new
cp .env.example .env  # If .env.example exists
# Otherwise, create .env manually
```

**Minimum required environment variables:**

```env
# Server Configuration
PORT=3000
HOST=0.0.0.0

# Database Configuration (Optional - uses in-memory by default)
DATA_BACKEND=memory
# For PostgreSQL:
# DATA_BACKEND=postgres
# DATABASE_URL=postgresql://user:password@localhost:5432/campusbot

# JWT Secret (for authentication)
JWT_SECRET=your-secret-key-change-in-production

# Telemetry Simulator (Optional)
ENABLE_TELEMETRY_SIM=1

# Order Automation (Optional)
ENABLE_ORDER_AUTOMATION=1
ASSIGNED_TO_EN_ROUTE_DELAY=30
EN_ROUTE_TO_DELIVERED_DELAY=60
ORDER_AUTOMATION_POLL_INTERVAL=30
```

**Note:** For development, you can use the in-memory backend (default) which doesn't require PostgreSQL.

### 4. Set Up PostgreSQL Database (Optional)

If you want to use PostgreSQL instead of in-memory storage:

#### 4.1. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE campusbot;

# Exit psql
\q
```

#### 4.2. Update Environment Variables

In your `.env` file:
```env
DATA_BACKEND=postgres
DATABASE_URL=postgresql://username:password@localhost:5432/campusbot
```

#### 4.3. Run Migrations

```bash
npm run migrate
```

#### 4.4. Seed Database (Optional)

```bash
npm run seed
```

This populates the database with sample data for testing.

### 5. Build and Start the Backend Application

#### Development Mode (Recommended)

```bash
npm run dev
```

This starts the server in development mode with hot-reloading.

#### Production Mode

```bash
npm run build
npm start
```

The API will be available at `http://localhost:3000`

**Verify the server is running:**
```bash
curl http://localhost:3000/health
```

You should see: `{"status":"ok"}`

### 6. Install Client Dependencies

Open a new terminal window and navigate to the client directory:

```bash
cd client
npm install
```

### 7. Set Up Client Environment (Optional)

The client uses the `VITE_API_URL` environment variable to connect to the backend API. By default, it is set to `http://localhost:3000/api`.

If you need to change this, create a `.env` file in the `client` directory:

```env
VITE_API_URL=http://localhost:3000/api
```

### 8. Start the Client Development Server

From the `client` directory:

```bash
npm run dev
```

The client UI will be available at `http://localhost:5173` (or the next available port).

**Note:** The client has a predev script that automatically checks if the backend server is running and waits for it to be ready before starting. Make sure the backend (step 5) is running before starting the client.

---

## Development Workflow

### Running Backend and Client Together

1. **Terminal 1 - Start the backend** (from the `proj2` directory):
   ```bash
   npm run dev
   ```

2. **Terminal 2 - Start the client** (from the `proj2/client` directory):
   ```bash
   npm run dev
   ```

The client will automatically wait for the backend server to be ready before starting.

### Quick Development Commands

```bash
# Backend
npm run dev              # Start development server
npm run build            # Build for production
npm test                 # Run tests
npm run test:coverage    # Run tests with coverage
npm run lint             # Lint code
npm run lint:fix         # Fix linting issues

# Client
cd client
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Lint code
```

---

## Building for Production

### Backend Production Build

From the `proj2` directory:
```bash
npm run build
npm start
```

### Client Production Build

From the `proj2/client` directory:
```bash
npm run build
```

The production build will be created in the `client/dist` directory. You can preview the production build with:
```bash
npm run preview
```

---

## URLs and Endpoints

Once everything is running:

- **Backend API**: http://localhost:3000
- **Client UI**: http://localhost:5173 (development)
- **Swagger UI** (API Documentation): http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health
- **Fleet Dashboard**: http://localhost:5173/fleet (Milestone 3)
- **Vendor Kiosk**: http://localhost:5173/vendor/kiosk (Milestone 4)

---

## Starting the Telemetry Simulator (Milestone 3)

The telemetry simulator is automatically started when the backend runs if `ENABLE_TELEMETRY_SIM=1` is set in your `.env` file.

To enable it explicitly:
```bash
# In your .env file
ENABLE_TELEMETRY_SIM=1
```

Or run the telemetry simulator script directly:
```bash
# From the proj2 directory
npm run dev:telemetry
```

The fleet dashboard will automatically connect to the telemetry stream when you navigate to `/fleet` in the client UI.

---

## Order Automation (Milestone 4)

The order automation service automatically transitions orders through the delivery lifecycle:
- ASSIGNED → EN_ROUTE (after 30 seconds by default)
- EN_ROUTE → DELIVERED (after 1 minute by default)

To configure delays, set in your `.env` file:
```env
ENABLE_ORDER_AUTOMATION=1
ASSIGNED_TO_EN_ROUTE_DELAY=30    # seconds
EN_ROUTE_TO_DELIVERED_DELAY=60   # seconds
ORDER_AUTOMATION_POLL_INTERVAL=30 # seconds
```

---

## Testing

### Backend Tests

From the `proj2` directory:
```bash
npm test                 # Run all tests
npm run test:coverage    # Run tests with coverage report
npm run test:watch       # Run tests in watch mode
```

**Current Test Statistics:**
- 419+ test cases
- 22 test suites
- All tests passing

### Client Linting

From the `proj2/client` directory:
```bash
npm run lint
```

---

## Database Management

### Using In-Memory Backend (Default)

No setup required! Just start the server:
```bash
npm run dev
```

Data is stored in memory and will be lost when the server restarts.

### Using PostgreSQL

1. **Create and migrate database:**
   ```bash
   npm run migrate
   ```

2. **Seed with sample data:**
   ```bash
   npm run seed
   ```

3. **Reset database (rollback + migrate + seed):**
   ```bash
   npm run db:reset
   ```

4. **Rollback migrations:**
   ```bash
   npm run migrate:rollback
   ```

---

## Troubleshooting

### Common Issues

**Issue**: Port 3000 already in use
- **Solution**: Change the `PORT` environment variable in `.env` or stop the process using port 3000
  ```bash
  # Find process using port 3000
  lsof -i :3000
  # Kill the process
  kill -9 <PID>
  ```

**Issue**: Client UI not loading
- **Solution**: Ensure backend is running first, then start client with `cd client && npm run dev`
- Check that `VITE_API_URL` in client `.env` matches your backend URL

**Issue**: Database connection errors
- **Solution**: 
  - If using PostgreSQL, ensure PostgreSQL is running: `pg_isready`
  - Check `DATABASE_URL` in `.env` is correct
  - Or switch to in-memory mode: `DATA_BACKEND=memory`

**Issue**: Tests failing with database connection errors
- **Solution**: Tests use in-memory backend by default. If you see PostgreSQL errors, ensure `DATA_BACKEND` is not set to `postgres` in your environment

**Issue**: Telemetry stream not connecting
- **Solution**: 
  - Check that telemetry simulator is enabled: `ENABLE_TELEMETRY_SIM=1` in `.env`
  - Or run `npm run dev:telemetry` separately

**Issue**: Authentication errors
- **Solution**: Ensure `JWT_SECRET` is set in `.env` file

**Issue**: Build errors with TypeScript
- **Solution**: 
  ```bash
  npm install          # Ensure all dependencies are installed
  npm run build        # Try building again
  ```

**Issue**: Module not found errors
- **Solution**: 
  ```bash
  # Clean install
  rm -rf node_modules package-lock.json
  npm install
  ```

### Getting Help

- Check the [README.md](README.md) for more information
- Review [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for detailed troubleshooting steps
- Visit Swagger UI at `http://localhost:3000/api-docs` for API documentation
- Open a GitHub issue for bugs or questions

---

## Docker Installation (Alternative)

If you prefer using Docker:

```bash
# Build and start with Docker Compose
docker-compose up --build

# Or build Docker image manually
docker build -t campusbot .
docker run -p 3000:3000 campusbot
```

See [Dockerfile](Dockerfile) and [docker-compose.yml](docker-compose.yml) for details.

---

## Next Steps

After installation:

1. **Explore the API**: Visit http://localhost:3000/api-docs
2. **Try the UI**: Visit http://localhost:5173
3. **Read the Documentation**: 
   - [README.md](README.md) - Full project documentation
   - [docs/API_REFERENCE.md](docs/API_REFERENCE.md) - Comprehensive API reference
   - [docs/DEPENDENCIES.md](docs/DEPENDENCIES.md) - Dependencies and licenses
   - [docs/DEMO_GUIDE.md](docs/DEMO_GUIDE.md) - End-to-end demo guide
   - [docs/ROADMAP.md](docs/ROADMAP.md) - Development roadmap
   - [docs/RELEASES.md](docs/RELEASES.md) - Release management guide

---

## Support

For additional help:
- **Documentation**: See [README.md](README.md)
- **API Docs**: http://localhost:3000/api-docs
- **Issues**: [GitHub Issues](https://github.com/SPMSHV/CSC510-S2-G6/issues)
