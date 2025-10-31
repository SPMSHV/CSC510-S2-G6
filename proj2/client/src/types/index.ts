export interface Location {
  lat: number;
  lng: number;
}

export interface Restaurant {
  id: string;
  vendorId: string;
  name: string;
  description: string | null;
  location: Location | null;
  hours: Record<string, string> | null;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  available: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  vendorId: string;
  robotId: string | null;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  deliveryLocation: string;
  deliveryLocationLat?: number;
  deliveryLocationLng?: number;
  status: 'CREATED' | 'PREPARING' | 'READY' | 'ASSIGNED' | 'EN_ROUTE' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'VENDOR' | 'ADMIN' | 'ENGINEER';
}

export interface AuthResponse {
  user: User;
  token: string;
}

