-- CampusBot Database Schema

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('STUDENT', 'VENDOR', 'ADMIN', 'ENGINEER')),
  password_hash VARCHAR(255),
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
  robot_id UUID REFERENCES robots(id),
  items JSONB NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  delivery_location VARCHAR(255) NOT NULL,
  delivery_location_lat DECIMAL(10, 8),
  delivery_location_lng DECIMAL(11, 8),
  status VARCHAR(50) NOT NULL CHECK (status IN ('CREATED', 'PREPARING', 'READY', 'ASSIGNED', 'EN_ROUTE', 'DELIVERED', 'CANCELLED')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  hours JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100),
  available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_vendor_id ON orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_robot_id ON orders(robot_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_vendor_id ON restaurants(vendor_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant_id ON menu_items(restaurant_id);
