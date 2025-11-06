# Frontend Documentation

## Table of Contents
- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Pages & Routes](#pages--routes)
- [Components](#components)
- [State Management](#state-management)
- [API Integration](#api-integration)
- [Styling](#styling)
- [Accessibility](#accessibility)
- [Development](#development)
- [Building for Production](#building-for-production)

## Overview

**What is it?** CampusBot frontend is a React application built with TypeScript and Vite. It provides a mobile-first user interface for students to browse restaurants, place orders, track deliveries, and for vendors to manage orders.

**Why use it?** The frontend delivers a fast, intuitive experience for campus food delivery. Students can order in seconds, vendors can efficiently manage orders, and both get real-time updates on delivery status.

**How does it work?** Built with React and TypeScript, the app uses React Router for navigation, Context API for state management, and Server-Sent Events for real-time updates. The mobile-first design with Tailwind CSS ensures a great experience on any device.

## Tech Stack

- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State Management**: React Context API
- **HTTP Client**: Fetch API
- **Real-time Updates**: Server-Sent Events (SSE) for telemetry

## Project Structure

```
client/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── AuthModal.tsx     # Login/Register modal
│   │   ├── Cart.tsx          # Shopping cart component
│   │   ├── CheckoutModal.tsx # Checkout flow
│   │   ├── Header.tsx        # Navigation header
│   │   ├── MenuItemCard.tsx  # Menu item display
│   │   ├── OrderCard.tsx     # Order list item
│   │   ├── OrderDetailsModal.tsx  # Order details popup
│   │   ├── OrderProgressBar.tsx    # Order status progress
│   │   ├── RestaurantCard.tsx       # Restaurant display
│   │   ├── RobotInfo.tsx           # Robot information display
│   │   ├── SearchBar.tsx           # Search functionality
│   │   └── VendorOrderCard.tsx     # Vendor order display
│   ├── context/              # React Context providers
│   │   ├── AuthContext.tsx   # Authentication state
│   │   └── CartContext.tsx   # Shopping cart state
│   ├── lib/
│   │   └── api.ts            # API client functions
│   ├── pages/                # Page components
│   │   ├── HomePage.tsx      # Restaurant browsing
│   │   ├── RestaurantDetailPage.tsx  # Menu view
│   │   ├── MyOrdersPage.tsx  # Order history
│   │   ├── OrderTrackingPage.tsx     # Live order tracking
│   │   ├── FleetDashboardPage.tsx     # Robot fleet dashboard
│   │   └── VendorKioskPage.tsx       # Vendor order management
│   ├── types/
│   │   └── index.ts          # TypeScript type definitions
│   ├── App.tsx               # Main app component with routing
│   ├── main.tsx              # Application entry point
│   └── index.css             # Global styles
├── public/                   # Static assets
├── index.html                # HTML template
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Pages & Routes

### Home Page (`/`)

- Browse all available restaurants
- Search restaurants by name or description
- Click restaurant cards to view menu
- Authentication: Optional (required for ordering)

**Components Used:**
- `Header` - Navigation and authentication
- `SearchBar` - Restaurant search
- `RestaurantCard` - Restaurant display cards

### Restaurant Detail (`/restaurant/:id`)

- View restaurant information
- Browse menu items
- Add items to cart
- View cart and proceed to checkout
- Authentication: Optional (required for checkout)

**Components Used:**
- `Header` - Navigation
- `MenuItemCard` - Menu item display
- `Cart` - Shopping cart sidebar

### My Orders (`/orders`)

- View order history
- Filter by status
- Click orders to track
- Authentication: **Required** (STUDENT role)

**Components Used:**
- `Header` - Navigation
- `OrderCard` - Order list items

### Order Tracking (`/orders/:id`)

- Real-time order status updates
- Progress bar showing order stages
- Robot information (if assigned)
- Estimated delivery time
- Authentication: **Required** (order owner)

**Components Used:**
- `Header` - Navigation
- `OrderProgressBar` - Status visualization
- `RobotInfo` - Robot details

### Fleet Dashboard (`/fleet`)

- Real-time view of all robots
- Live telemetry updates via SSE
- Robot status, battery, location, speed
- Stop command functionality
- Connection status indicator
- Authentication: Optional (public view)

**Components Used:**
- `Header` - Navigation
- Robot status cards with live updates

### Vendor Kiosk (`/vendor/kiosk`)

- View all orders for vendor's restaurants
- Filter orders by status (ALL, CREATED, PREPARING, READY, etc.)
- Update order status
- View order details
- Automatic robot assignment when order becomes READY
- Authentication: **Required** (VENDOR role)

**Components Used:**
- `Header` - Navigation with vendor-specific links
- `VendorOrderCard` - Order display cards
- `OrderDetailsModal` - Order details popup

## Components

### Authentication Components

#### `AuthModal`

Modal dialog for user registration and login.

**Props:**
- `isOpen: boolean` - Controls modal visibility
- `onClose: () => void` - Close handler

**Features:**
- Registration form (email, name, password, role)
- Login form (email, password)
- Role selection (STUDENT, VENDOR, ADMIN, ENGINEER)
- Form validation
- Error handling

#### `Header`

Navigation header with authentication state.

**Features:**
- Logo/branding
- Navigation links (conditional based on role)
- User menu (when authenticated)
- Login/Register buttons (when not authenticated)
- Cart icon with item count
- Vendor Kiosk link (for VENDOR role)

### Order Components

#### `OrderCard`

Displays order summary in list view.

**Props:**
- `order: Order` - Order object
- `onClick?: () => void` - Click handler

**Displays:**
- Order ID
- Restaurant name
- Order status badge
- Total amount
- Order date

#### `OrderProgressBar`

Visual progress indicator for order status.

**Props:**
- `status: OrderStatus` - Current order status

**Stages:**
1. CREATED
2. PREPARING
3. READY
4. ASSIGNED
5. EN_ROUTE
6. DELIVERED

#### `OrderDetailsModal`

Modal showing full order details.

**Props:**
- `order: Order` - Order object
- `isOpen: boolean` - Modal visibility
- `onClose: () => void` - Close handler

**Displays:**
- Order items with quantities and prices
- Total amount
- Delivery location
- Current status
- Robot information (if assigned)
- Timestamps

### Restaurant Components

#### `RestaurantCard`

Card displaying restaurant information.

**Props:**
- `restaurant: Restaurant` - Restaurant object
- `onClick?: () => void` - Click handler

**Displays:**
- Restaurant name
- Description
- Location (if available)

#### `MenuItemCard`

Card displaying menu item information.

**Props:**
- `item: MenuItem` - Menu item object
- `onAddToCart?: (item: MenuItem) => void` - Add to cart handler

**Displays:**
- Item name
- Description
- Price
- Category
- Availability status
- Add to cart button

### Cart Components

#### `Cart`

Shopping cart sidebar.

**Features:**
- List of cart items
- Quantity adjustment
- Item removal
- Total calculation
- Checkout button
- Empty state

#### `CheckoutModal`

Checkout flow modal.

**Props:**
- `isOpen: boolean` - Modal visibility
- `onClose: () => void` - Close handler
- `onSuccess?: () => void` - Success callback

**Features:**
- Delivery location input
- Order summary
- Place order button
- Form validation

## State Management

### Authentication Context (`AuthContext`)

Manages user authentication state.

**State:**
- `user: User | null` - Current user
- `token: string | null` - JWT token
- `loading: boolean` - Loading state

**Methods:**
- `login(email, password)` - Login user
- `register(email, name, password, role)` - Register user
- `logout()` - Logout user

**Usage:**
```typescript
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, login, logout } = useAuth();
  // ...
}
```

### Cart Context (`CartContext`)

Manages shopping cart state.

**State:**
- `items: CartItem[]` - Cart items
- `isOpen: boolean` - Cart visibility

**Methods:**
- `addItem(item)` - Add item to cart
- `removeItem(itemId)` - Remove item from cart
- `updateQuantity(itemId, quantity)` - Update item quantity
- `clearCart()` - Clear all items
- `toggleCart()` - Toggle cart visibility

**Usage:**
```typescript
import { useCart } from '../context/CartContext';

function MyComponent() {
  const { items, addItem, clearCart } = useCart();
  // ...
}
```

## API Integration

### API Client (`lib/api.ts`)

Centralized API client functions for backend communication.

**Functions:**
- `getRestaurants()` - Fetch all restaurants
- `getRestaurant(id)` - Fetch restaurant by ID
- `getMenuItems(restaurantId)` - Fetch menu items
- `createOrder(orderData)` - Create new order
- `getMyOrders()` - Fetch user's orders
- `getOrder(id)` - Fetch order by ID
- `updateOrderStatus(id, status)` - Update order status
- `getTelemetrySnapshot()` - Get telemetry snapshot
- `getTelemetryStream()` - Get SSE stream
- `register(email, name, password, role)` - Register user
- `login(email, password)` - Login user
- `getCurrentUser()` - Get current user

**Authentication:**
All authenticated requests automatically include JWT token from `AuthContext`.

## Real-time Features

### Telemetry Streaming

The Fleet Dashboard uses Server-Sent Events (SSE) for real-time telemetry updates:

```typescript
const eventSource = new EventSource('/api/telemetry/stream');

eventSource.addEventListener('telemetry', (event) => {
  const data = JSON.parse(event.data);
  // Update robot telemetry
});

eventSource.onerror = () => {
  // Handle connection errors
};
```

### Order Status Polling

Order tracking pages poll for status updates:

```typescript
useEffect(() => {
  const interval = setInterval(async () => {
    const order = await getOrder(orderId);
    setOrder(order);
  }, 5000); // Poll every 5 seconds

  return () => clearInterval(interval);
}, [orderId]);
```

## Styling

### Tailwind CSS

The application uses Tailwind CSS for styling. Configuration is in `tailwind.config.js`.

### Responsive Design

Mobile-first approach with breakpoints:
- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px

### Color Scheme

- Primary: Blue (`blue-600`, `blue-500`)
- Success: Green (`green-600`, `green-500`)
- Warning: Yellow (`yellow-600`, `yellow-500`)
- Error: Red (`red-600`, `red-500`)
- Background: Gray (`gray-50`, `gray-100`)

## Development

### Start Development Server

```bash
cd client
npm install
npm run dev
```

The client will be available at `http://localhost:5173` (or next available port).

### Build for Production

```bash
npm run build
```

Output will be in `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Linting

```bash
npm run lint
```

## Environment Variables

Create a `.env` file in the `client/` directory:

```env
VITE_API_URL=http://localhost:3000/api
```

## Testing

The frontend currently doesn't have automated tests. Consider adding:
- Component tests (React Testing Library)
- Integration tests
- E2E tests (Playwright, Cypress)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

### Optimization Tips

1. **Code Splitting**: Routes are lazy-loaded
2. **Image Optimization**: Use optimized images
3. **Bundle Size**: Monitor with `npm run build -- --report`
4. **Caching**: API responses can be cached
5. **Debouncing**: Search input is debounced

## Troubleshooting

### Common Issues

**API connection errors**
- Ensure backend is running on `http://localhost:3000`
- Check `VITE_API_URL` in `.env`
- Verify CORS settings on backend

**Authentication not persisting**
- Check browser localStorage
- Verify token expiration
- Check `AuthContext` implementation

**Cart not updating**
- Verify `CartContext` is properly wrapped
- Check cart state management
- Ensure components are using `useCart` hook

**Real-time updates not working**
- Check SSE connection in browser DevTools
- Verify telemetry service is running
- Check network tab for SSE events

For more help, see [INSTALL.md](../INSTALL.md) or open an issue on GitHub.

