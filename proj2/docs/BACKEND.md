# Backend Documentation

## Table of Contents
- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [Database](#database)
- [Services](#services)
- [Development](#development)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## Overview

**What is it?** CampusBot backend is a RESTful API built with Node.js, Express, and TypeScript. It provides endpoints for managing orders, robots, users, restaurants, authentication, and real-time telemetry.

**Why use it?** The backend handles all business logic for autonomous campus food delivery, from order placement to robot fleet management. It's designed for scalability, maintainability, and easy integration with frontend clients.

**How does it work?** The API uses a layered architecture with Express routes handling HTTP requests, services containing business logic, and a data layer supporting both PostgreSQL and in-memory storage for development.

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (optional) or in-memory storage
- **Testing**: Jest + Supertest
- **API Documentation**: OpenAPI 3.0 + Swagger UI
- **Security**: Helmet.js, CORS, JWT authentication
- **Validation**: Joi

## Project Structure

```
src/
├── db/
│   ├── client.ts              # Database client (PostgreSQL or in-memory)
│   ├── migrate.ts              # Database migrations
│   ├── rollback.ts             # Database rollback
│   ├── seed.ts                 # Seed script for sample data
│   └── queries/                # Database query functions
│       ├── orders.ts
│       ├── robots.ts
│       ├── restaurants.ts
│       ├── users.ts
│       └── menuItems.ts
├── services/
│   ├── orderTracking.ts        # Order tracking service
│   ├── orderAssignmentService.ts  # Order assignment logic
│   ├── robotAssignment.ts      # Robot assignment service
│   └── telemetry.ts            # Telemetry simulator service
├── web/
│   ├── middleware/
│   │   └── auth.ts             # JWT authentication middleware
│   └── routes/
│       ├── auth.ts             # Authentication endpoints
│       ├── orders.ts           # Order management endpoints
│       ├── robots.ts           # Robot management endpoints
│       ├── restaurants.ts      # Restaurant management endpoints
│       ├── telemetry.ts        # Telemetry endpoints
│       ├── users.ts            # User management endpoints
│       └── routes.ts           # Route aggregator
├── server.ts                   # Express server setup
└── index.ts                    # Application entry point
```

## API Endpoints

### Authentication (`/api/auth`)

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user (requires authentication)

### Orders (`/api/orders`)

- `GET /api/orders` - Get all orders (admin only)
- `POST /api/orders` - Create a new order
- `GET /api/orders/:id` - Get order by ID
- `PATCH /api/orders/:id` - Update order status
- `DELETE /api/orders/:id` - Cancel/delete order
- `GET /api/orders/my-orders` - Get current user's orders (requires authentication)
- `GET /api/orders/vendor-orders` - Get vendor's orders (requires vendor role)
- `GET /api/orders/:id/track` - Get order tracking information
- `GET /api/orders/:id/status` - Get order status

### Robots (`/api/robots`)

- `GET /api/robots` - Get all robots
- `POST /api/robots` - Create a new robot
- `GET /api/robots/:id` - Get robot by ID
- `PATCH /api/robots/:id` - Update robot information
- `DELETE /api/robots/:id` - Delete robot
- `GET /api/robots/:id/health` - Get robot health status

### Restaurants (`/api/restaurants`)

- `GET /api/restaurants` - Get all restaurants
- `POST /api/restaurants` - Create a new restaurant (requires vendor role)
- `GET /api/restaurants/:id` - Get restaurant by ID
- `PATCH /api/restaurants/:id` - Update restaurant (requires vendor role)
- `GET /api/restaurants/:id/menu` - Get restaurant menu items
- `POST /api/restaurants/:id/menu` - Add menu item (requires vendor role)
- `PATCH /api/restaurants/:id/menu/:itemId` - Update menu item (requires vendor role)

### Users (`/api/users`)

- `GET /api/users` - Get all users (admin only)
- `POST /api/users` - Create a new user
- `GET /api/users/:id` - Get user by ID
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Telemetry (`/api/telemetry`)

- `GET /api/telemetry/snapshot` - Get current telemetry snapshot (all robots)
- `GET /api/telemetry/stream` - Stream telemetry updates via Server-Sent Events (SSE)
- `POST /api/telemetry/robots/:id/stop` - Send stop command to robot

### Export/Import (`/api/export`)

- `GET /api/export/json` - Export all data as JSON (admin only)
- `GET /api/export/orders/csv` - Export orders as CSV (admin or vendor)
- `POST /api/export/import` - Import data from JSON (admin only, PostgreSQL mode)

### Health Check

- `GET /health` - Health check endpoint

## Authentication & Authorization

### JWT Authentication

The API uses JWT (JSON Web Tokens) for authentication. Tokens are issued on login and must be included in the `Authorization` header:

```
Authorization: Bearer <token>
```

### Roles

- **STUDENT** - Can place orders, view own orders, track deliveries
- **VENDOR** - Can manage restaurants, menu items, and orders for their restaurants
- **ADMIN** - Full access to all resources
- **ENGINEER** - Can manage robots and view telemetry

### Protected Routes

Most routes require authentication. Use the `authenticate` middleware:

```typescript
import { authenticate } from '../middleware/auth';

router.get('/protected', authenticate, (req, res) => {
  // Access req.user (userId, email, role)
});
```

### Role-Based Access Control

Use the `requireRole` middleware for role-based access:

```typescript
import { requireRole } from '../middleware/auth';

router.post('/admin-only', authenticate, requireRole('ADMIN'), (req, res) => {
  // Only ADMIN users can access
});
```

## Data Storage

### PostgreSQL Mode

Set `DATA_BACKEND=postgres` in your `.env` file to use PostgreSQL. Requires:
- PostgreSQL database running
- Database connection string in `DATABASE_URL`
- Run migrations: `npm run migrate`
- Seed data: `npm run seed`

### In-Memory Mode (Default)

If PostgreSQL is not configured, the API automatically uses in-memory storage. Data is lost on server restart but is useful for development and testing.

## Services

### Order Tracking Service

Tracks order status and provides progress information:

```typescript
import { getOrderTrackingInfo, getOrderProgress } from '../services/orderTracking';

const trackingInfo = getOrderTrackingInfo(orderId);
const progress = getOrderProgress(order);
```

### Robot Assignment Service

Automatically assigns robots to orders when they become READY:

```typescript
import { processOrderStatusChange } from '../services/robotAssignment';

// Called automatically when order status changes to READY
await processOrderStatusChange(orderId, 'READY');
```

### Telemetry Service

Simulates robot telemetry data for 5 robots:

```typescript
import { telemetryService } from '../services/telemetry';

const snapshot = telemetryService.getSnapshot();
telemetryService.on('telemetry', (data) => {
  // Handle telemetry updates
});
```

## Validation

All input is validated using Joi schemas:

```typescript
import Joi from 'joi';

const createOrderSchema = Joi.object({
  userId: Joi.string().required(),
  vendorId: Joi.string().required(),
  items: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      quantity: Joi.number().integer().min(1).required(),
      price: Joi.number().min(0).required()
    })
  ).min(1).required(),
  deliveryLocation: Joi.string().required()
});
```

## Error Handling

The API returns standard HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (e.g., duplicate email)
- `500` - Internal Server Error

Error responses follow this format:

```json
{
  "error": "Error message"
}
```

## Testing

Run the test suite:

```bash
npm test
npm run test:coverage
```

The test suite includes:
- **419 test cases** across 22 test suites
- Unit tests for services and utilities
- Integration tests for API endpoints
- Validation tests for input schemas
- Authentication and authorization tests

## Development

### Start Development Server

```bash
npm run dev
```

### Start with Telemetry Simulator

```bash
npm run dev:telemetry
```

### Run Database Migrations

```bash
npm run migrate
npm run migrate:rollback
```

### Seed Database

```bash
npm run seed
```

## API Documentation

Interactive API documentation is available at:

- **Swagger UI**: `http://localhost:3000/api-docs`
- **OpenAPI JSON**: `http://localhost:3000/api-docs.json`

The OpenAPI specification is located at `docs/openapi.yaml`.

## Environment Variables

Create a `.env` file with the following variables:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATA_BACKEND=memory  # or 'postgres'
DATABASE_URL=postgresql://user:password@localhost:5432/campusbot

# Authentication
JWT_SECRET=your-secret-key-here

# Telemetry
ENABLE_TELEMETRY_SIM=1
```

## Security

- **Helmet.js** - Sets various HTTP headers for security
- **CORS** - Configured for cross-origin requests
- **JWT** - Secure token-based authentication
- **Input Validation** - All inputs validated with Joi
- **Password Hashing** - bcrypt for password storage

## Deployment

### Docker

Build and run with Docker:

```bash
docker build -t campusbot-backend .
docker run -p 3000:3000 campusbot-backend
```

### Docker Compose

Use the provided `docker-compose.yml`:

```bash
docker-compose up
```

## Troubleshooting

### Common Issues

**Database connection errors**
- Ensure PostgreSQL is running
- Check `DATABASE_URL` in `.env`
- Run migrations: `npm run migrate`

**Authentication errors**
- Ensure `JWT_SECRET` is set in `.env`
- Check token expiration
- Verify token in Authorization header

**Port already in use**
- Change `PORT` in `.env`
- Or stop the process using port 3000

**Tests failing**
- Ensure database is set up correctly
- Or use in-memory mode: `DATA_BACKEND=memory`

For more help, see [INSTALL.md](../INSTALL.md) or open an issue on GitHub.

