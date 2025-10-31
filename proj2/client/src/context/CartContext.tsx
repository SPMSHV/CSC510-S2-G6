import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { MenuItem } from '../types';

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  restaurantId: string;
}

interface CartContextType {
  items: CartItem[];
  restaurantId: string | null;
  addToCart: (menuItem: MenuItem, restaurantId: string, quantity?: number) => void;
  removeFromCart: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'campusbot_cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        setItems(parsed.items || []);
        setRestaurantId(parsed.restaurantId || null);
      } catch (error) {
        // Invalid saved cart, ignore
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ items, restaurantId }));
  }, [items, restaurantId]);

  const addToCart = (menuItem: MenuItem, newRestaurantId: string, quantity: number = 1) => {
    setItems((prevItems) => {
      // If adding item from different restaurant, replace cart
      if (restaurantId && restaurantId !== newRestaurantId) {
        const shouldReplace = window.confirm(
          'Your cart contains items from another restaurant. Would you like to clear your cart and start a new order?'
        );
        if (shouldReplace) {
          setRestaurantId(newRestaurantId);
          return [{ menuItem, quantity, restaurantId: newRestaurantId }];
        }
        return prevItems; // User cancelled, keep existing cart
      }

      // Update restaurant ID if this is first item
      if (!restaurantId) {
        setRestaurantId(newRestaurantId);
      }

      // Check if item already exists in cart
      const existingItemIndex = prevItems.findIndex((item) => item.menuItem.id === menuItem.id);

      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity,
        };
        return updatedItems;
      }

      // Add new item
      return [...prevItems, { menuItem, quantity, restaurantId: newRestaurantId }];
    });
  };

  const removeFromCart = (menuItemId: string) => {
    setItems((prevItems) => {
      const newItems = prevItems.filter((item) => item.menuItem.id !== menuItemId);
      // Clear restaurant ID if cart is empty
      if (newItems.length === 0) {
        setRestaurantId(null);
      }
      return newItems;
    });
  };

  const updateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(menuItemId);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.menuItem.id === menuItemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setRestaurantId(null);
  };

  const getCartTotal = (): number => {
    return items.reduce((total, item) => total + item.menuItem.price * item.quantity, 0);
  };

  const getItemCount = (): number => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  const value: CartContextType = {
    items,
    restaurantId,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getItemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}


