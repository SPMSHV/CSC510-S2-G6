import axios from 'axios';
import type { Restaurant, MenuItem, User, AuthResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
const TOKEN_KEY = 'campusbot_token';
const USER_KEY = 'campusbot_user';

export const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const getStoredUser = (): User | null => {
  const userStr = localStorage.getItem(USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};

export const setAuthData = (token: string, user: User): void => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearAuthData = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

// Set up axios interceptor to include token in requests
apiClient.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 errors (unauthorized)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthData();
      // Optionally redirect to login or trigger logout
      window.dispatchEvent(new Event('auth:logout'));
    }
    return Promise.reject(error);
  }
);

export const getRestaurants = async (): Promise<Restaurant[]> => {
  try {
    const response = await apiClient.get<Restaurant[]>('/restaurants');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        throw new Error(`Cannot connect to API at ${API_BASE_URL}. Make sure the backend server is running.`);
      }
      if (error.response) {
        // Server responded with error status
        throw new Error(error.response.data?.error || `Server error: ${error.response.status}`);
      }
      if (error.request) {
        // Request was made but no response received
        throw new Error(`No response from server at ${API_BASE_URL}. Check if the server is running.`);
      }
      throw new Error(error.message || 'Failed to fetch restaurants');
    }
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch restaurants');
  }
};

export const getRestaurantById = async (id: string): Promise<Restaurant> => {
  try {
    const response = await apiClient.get<Restaurant>(`/restaurants/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Failed to fetch restaurant');
    }
    throw new Error('Failed to fetch restaurant');
  }
};

export const getRestaurantMenu = async (restaurantId: string): Promise<MenuItem[]> => {
  try {
    const response = await apiClient.get<MenuItem[]>(`/restaurants/${restaurantId}/menu`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Failed to fetch menu items');
    }
    throw new Error('Failed to fetch menu items');
  }
};

// Authentication API functions
export const login = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
    setAuthData(response.data.token, response.data.user);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
    throw new Error('Login failed');
  }
};

export const register = async (
  email: string,
  name: string,
  password: string,
  role: 'STUDENT' | 'VENDOR' | 'ADMIN' | 'ENGINEER' = 'STUDENT'
): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<AuthResponse>('/auth/register', {
      email,
      name,
      password,
      role,
    });
    setAuthData(response.data.token, response.data.user);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
    throw new Error('Registration failed');
  }
};

export const getCurrentUser = async (): Promise<User> => {
  try {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Failed to fetch user');
    }
    throw new Error('Failed to fetch user');
  }
};

export const logout = (): void => {
  clearAuthData();
};

