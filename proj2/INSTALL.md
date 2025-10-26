# CampusBot API - Installation Guide

This guide will help you install and run the CampusBot API locally.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (version 18 or higher)
- npm (comes with Node.js)
- PostgreSQL (version 12 or higher)
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

### 5. Build and Start the Application

npm run build
npm start

The API will be available at http://localhost:3000

## API Documentation

- Swagger UI: http://localhost:3000/api-docs
- Health Check: http://localhost:3000/health

## Testing

npm test
