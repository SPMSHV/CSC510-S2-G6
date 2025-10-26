-- CampusBot Database Schema

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('STUDENT', 'VENDOR', 'ADMIN', 'ENGINEER')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS robots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  robot_id VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('IDLE', 'ASSIGNED', 'EN_ROUTE', 'CHARGING', 'MAINTENANCE', 'OFFLINE')),
  battery_percent INTEGER NOT NULL CHECK (battery_percent >= 0 AND battery_percent <= 100),
  location_lat DECIMAL(10, 8) NOT NULL,
  location_lng DECIMAL(11, 8) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  vendor_id UUID NOT NULL REFERENCES users(id),
  items JSONB NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  delivery_location VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('CREATED', 'PREPARING', 'READY', 'ASSIGNED', 'EN_ROUTE', 'DELIVERED', 'CANCELLED')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_vendor_id ON orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
