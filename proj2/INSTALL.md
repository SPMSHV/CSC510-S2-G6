# CampusBot - Installation Guide

This guide will help you install and run the CampusBot API and Client UI locally.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (version 18 or higher)
- npm (comes with Node.js)
- PostgreSQL (version 12 or higher)
- TypeScript
- Git

## Installation Steps

### 1. Clone the Repository

git clone https://github.com/SPMSHV/CSC510-S2-G6.git
cd CSC510-S2-G6/proj2

### 2. Install Dependencies

npm install

### 3. Set Up Environment Variables

Copy the example environment file:

cp .env.example .env

### 4. Set Up PostgreSQL Database

Create a new database and run migrations:

npm run migrate
npm run seed

### 5. Build and Start the Backend Application

npm run build
npm start

The API will be available at http://localhost:3000

### 6. Install Client Dependencies

Navigate to the client directory and install dependencies:

cd client
npm install

### 7. Set Up Client Environment (Optional)

The client uses the `VITE_API_URL` environment variable to connect to the backend API. By default, it is set to `http://localhost:3000/api`. If you need to change this, create a `.env` file in the `client` directory:

VITE_API_URL=http://localhost:3000/api

### 8. Start the Client Development Server

From the client directory, run:

npm run dev

The client UI will be available at http://localhost:5173 (or the next available port).

Note: The client has a predev script that automatically checks if the backend server is running and waits for it to be ready before starting. Make sure the backend (step 5) is running before starting the client.

## Development

### Running Backend and Client Together

1. Start the backend server (from the `proj2` directory):
   ```bash
   npm start
   ```

2. In a separate terminal, start the client (from the `proj2/client` directory):
   ```bash
   npm run dev
   ```

The client will automatically wait for the backend server to be ready before starting.

### Building for Production

#### Backend Production Build

From the `proj2` directory:
```bash
npm run build
npm start
```

#### Client Production Build

From the `proj2/client` directory:
```bash
npm run build
```

The production build will be created in the `client/dist` directory. You can preview the production build with:
```bash
npm run preview
```

## URLs

- **Backend API**: http://localhost:3000
- **Client UI**: http://localhost:5173 (development)
- **Swagger UI**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health

## Testing

### Backend Tests

From the `proj2` directory:
```bash
npm test
```

### Client Linting

From the `proj2/client` directory:
```bash
npm run lint
```
