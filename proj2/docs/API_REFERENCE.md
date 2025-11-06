# CampusBot API Reference

This document provides a comprehensive guide to all API endpoints, functions, and commands available in CampusBot.

## Table of Contents

- [API Endpoints](#api-endpoints)
- [Service Functions](#service-functions)
- [Database Queries](#database-queries)
- [Command Line Tools](#command-line-tools)
- [Environment Variables](#environment-variables)

## API Endpoints

### Health Check

**GET** `/health`

Returns the health status of the API server.

**Response:**
```json
{
  "status": "ok",
  "service": "campusbot",
  "time": "2025-01-15T10:30:00.000Z"
}
```

### Authentication

**POST** `/api/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe",
  "role": "STUDENT"
}
```

**Response:** 201 Created
```json
{
  "id": "user-123",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "STUDENT"
}
```

**POST** `/api/auth/login`

Authenticate and receive a JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:** 200 OK
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "STUDENT"
  }
}
```

### Orders

**GET** `/api/orders`

List all orders (requires authentication).

**Query Parameters:**
- `userId` (optional): Filter by user ID
- `vendorId` (optional): Filter by vendor ID
- `status` (optional): Filter by order status

**Response:** 200 OK
```json
[
  {
    "id": "order-123",
    "userId": "user-123",
    "vendorId": "vendor-1",
    "status": "CREATED",
    "items": [...],
    "deliveryLocation": "Engineering Building",
    "createdAt": "2025-01-15T10:00:00.000Z"
  }
]
```

**POST** `/api/orders`

Create a new order (requires authentication).

**Request Body:**
```json
{
  "userId": "user-123",
  "vendorId": "vendor-1",
  "items": [
    {
      "name": "Burger",
      "quantity": 1,
      "price": 10.99
    }
  ],
  "deliveryLocation": "Engineering Building, Room 201",
  "deliveryLocationLat": 35.7871,
  "deliveryLocationLng": -78.6701
}
```

**Response:** 201 Created

**GET** `/api/orders/:id`

Get a specific order by ID (requires authentication).

**Response:** 200 OK

**PATCH** `/api/orders/:id`

Update order status (requires VENDOR role for CREATED→PREPARING→READY, or ADMIN for all statuses).

**Request Body:**
```json
{
  "status": "PREPARING"
}
```

**Response:** 200 OK

**GET** `/api/orders/:id/tracking`

Get order tracking information with progress (requires authentication).

**Response:** 200 OK
```json
{
  "order": {...},
  "progress": {
    "status": "ASSIGNED",
    "progress": 60,
    "statusLabel": "Robot Assigned",
    "estimatedTimeToNext": 3
  },
  "robot": {...}
}
```

### Robots

**GET** `/api/robots`

List all robots.

**Response:** 200 OK
```json
[
  {
    "id": "robot-1",
    "robotId": "RB-001",
    "status": "IDLE",
    "batteryPercent": 95,
    "location": {
      "lat": 35.7871,
      "lng": -78.6701
    }
  }
]
```

**POST** `/api/robots`

Create a new robot (requires ADMIN or ENGINEER role).

**Request Body:**
```json
{
  "robotId": "RB-001",
  "status": "IDLE",
  "batteryPercent": 100,
  "location": {
    "lat": 35.7871,
    "lng": -78.6701
  }
}
```

**Response:** 201 Created

**GET** `/api/robots/:id`

Get a specific robot by ID.

**Response:** 200 OK

**PATCH** `/api/robots/:id`

Update robot information (requires ADMIN or ENGINEER role).

**Request Body:**
```json
{
  "status": "CHARGING",
  "batteryPercent": 50
}
```

**Response:** 200 OK

### Restaurants

**GET** `/api/restaurants`

List all restaurants.

**Response:** 200 OK
```json
[
  {
    "id": "restaurant-1",
    "name": "Campus Cafe",
    "description": "Fresh food on campus",
    "menuItems": [...]
  }
]
```

**GET** `/api/restaurants/:id`

Get a specific restaurant with menu items.

**Response:** 200 OK

### Telemetry

**GET** `/api/telemetry/snapshot`

Get current telemetry snapshot for all robots.

**Response:** 200 OK
```json
{
  "robots": [
    {
      "id": "sim-1",
      "robotId": "RB-001",
      "status": "IDLE",
      "batteryPercent": 95,
      "location": {...},
      "speed": 0,
      "distanceTraveled": 0
    }
  ]
}
```

**GET** `/api/telemetry/stream`

Stream real-time telemetry updates via Server-Sent Events (SSE).

**Response:** Event stream

**POST** `/api/telemetry/robots/:id/stop`

Send emergency stop command to a robot (requires ADMIN or ENGINEER role).

**Response:** 200 OK

### Users

**GET** `/api/users`

List all users (requires ADMIN role).

**Response:** 200 OK

**POST** `/api/users`

Create a new user (requires ADMIN role).

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "role": "STUDENT"
}
```

**Response:** 201 Created

**GET** `/api/users/:id`

Get a specific user by ID (requires authentication, own user or ADMIN).

**Response:** 200 OK

## Service Functions

### Order Tracking Service

**Location:** `src/services/orderTracking.ts`

#### `getOrderProgress(status: OrderStatus): OrderStatusProgress`

Calculates progress percentage and status label based on order status.

**Parameters:**
- `status`: Order status (CREATED, PREPARING, READY, ASSIGNED, EN_ROUTE, DELIVERED, CANCELLED)

**Returns:**
```typescript
{
  status: OrderStatus;
  progress: number; // 0-100
  statusLabel: string;
  estimatedTimeToNext?: number; // minutes
}
```

### Robot Assignment Service

**Location:** `src/services/robotAssignment.ts`

#### `assignRobotToOrder(orderId: string, robotId: string): Promise<void>`

Assigns a robot to an order and updates both order and robot status to ASSIGNED.

**Parameters:**
- `orderId`: Order ID
- `robotId`: Robot ID

#### `findNearestAvailableRobot(lat: number, lng: number): Promise<Robot | null>`

Finds the nearest available robot to given coordinates.

**Parameters:**
- `lat`: Latitude
- `lng`: Longitude

**Returns:** Robot object or null if no available robots

### Order Automation Service

**Location:** `src/services/orderAutomation.ts`

#### `scheduleTransitions(orderId: string): Promise<void>`

Schedules automatic status transitions for an order (ASSIGNED → EN_ROUTE → DELIVERED).

**Parameters:**
- `orderId`: Order ID

### Telemetry Service

**Location:** `src/services/telemetry.ts`

#### `getTelemetrySnapshot(): Promise<TelemetrySnapshot>`

Returns current telemetry data for all robots.

**Returns:** Object containing array of robot telemetry data

#### `initializeFleetIfEmpty(): void`

Initializes the robot fleet with default robots if empty.

## Database Queries

### Order Queries

**Location:** `src/db/queries/orders.ts`

- `getAllOrders()`: Get all orders
- `getOrderById(id: string)`: Get order by ID
- `createOrder(order: CreateOrderInput)`: Create new order
- `updateOrder(id: string, updates: Partial<Order>)`: Update order
- `getOrdersByUserId(userId: string)`: Get orders for a user
- `getOrdersByVendorId(vendorId: string)`: Get orders for a vendor

### Robot Queries

**Location:** `src/db/queries/robots.ts`

- `getAllRobots()`: Get all robots
- `getRobotById(id: string)`: Get robot by ID
- `createRobot(robot: CreateRobotInput)`: Create new robot
- `updateRobot(id: string, updates: Partial<Robot>)`: Update robot
- `getAvailableRobots()`: Get robots with IDLE status

### User Queries

**Location:** `src/db/queries/users.ts`

- `getAllUsers()`: Get all users
- `getUserById(id: string)`: Get user by ID
- `getUserByEmail(email: string)`: Get user by email
- `createUser(user: CreateUserInput)`: Create new user
- `updateUser(id: string, updates: Partial<User>)`: Update user

## Command Line Tools

### Development

```bash
# Start development server
npm run dev

# Start with database seeding
npm run dev:with-seed

# Start telemetry simulator
npm run dev:telemetry
```

### Building

```bash
# Build TypeScript to JavaScript
npm run build

# Start production server
npm start
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Code Quality

```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check code formatting
npm run format:check
```

### Database Management

```bash
# Run migrations
npm run migrate

# Rollback migrations
npm run migrate:rollback

# Seed database
npm run seed

# Reset database (rollback + migrate + seed)
npm run db:reset
```

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | 3000 | No |
| `HOST` | Server host | 0.0.0.0 | No |
| `DATA_BACKEND` | Backend type: 'memory' or 'postgres' | memory | No |
| `DATABASE_URL` | PostgreSQL connection string | - | Yes (if postgres) |
| `JWT_SECRET` | Secret key for JWT tokens | - | Yes |
| `ENABLE_TELEMETRY_SIM` | Enable telemetry simulator (0 or 1) | 0 | No |
| `ENABLE_ORDER_AUTOMATION` | Enable automatic order transitions (0 or 1) | 1 | No |
| `ASSIGNED_TO_EN_ROUTE_DELAY` | Delay in seconds for ASSIGNED→EN_ROUTE | 30 | No |
| `EN_ROUTE_TO_DELIVERED_DELAY` | Delay in seconds for EN_ROUTE→DELIVERED | 60 | No |
| `API_PREFIX` | API route prefix | /api | No |

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <token>
```

## Error Responses

All endpoints return standard HTTP status codes:

- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

Error response format:
```json
{
  "error": "Error message",
  "details": "Additional error details (optional)"
}
```

## Rate Limiting

Currently, there is no rate limiting implemented. This may be added in future versions.

## API Versioning

The current API version is 0.2.0. API versioning information is available in the OpenAPI specification at `/api-docs.json`.


