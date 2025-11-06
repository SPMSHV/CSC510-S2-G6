import { Router, Request, Response } from 'express';
import Joi from 'joi';
import { v4 as uuidv4 } from 'uuid';
import * as restaurantQueries from '../../db/queries/restaurants';
import * as menuItemQueries from '../../db/queries/menuItems';
import { authenticate, AuthRequest } from '../middleware/auth';

export const router = Router();

const backend = process.env.DATA_BACKEND || 'memory';

const createRestaurantSchema = Joi.object({
  name: Joi.string().min(2).required(),
  description: Joi.string().optional(),
  location: Joi.object({
    lat: Joi.number().required(),
    lng: Joi.number().required(),
  }).optional(),
  hours: Joi.object().pattern(Joi.string(), Joi.string()).optional(),
});

const updateRestaurantSchema = Joi.object({
  name: Joi.string().min(2),
  description: Joi.string(),
  location: Joi.object({
    lat: Joi.number().required(),
    lng: Joi.number().required(),
  }),
  hours: Joi.object().pattern(Joi.string(), Joi.string()),
}).min(1);

const createMenuItemSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().optional(),
  price: Joi.number().min(0).required(),
  category: Joi.string().optional(),
  available: Joi.boolean().optional(),
});

const updateMenuItemSchema = Joi.object({
  name: Joi.string(),
  description: Joi.string(),
  price: Joi.number().min(0),
  category: Joi.string(),
  available: Joi.boolean(),
}).min(1);

// Fallback in-memory storage for non-postgres backends
export const restaurants: Record<string, restaurantQueries.Restaurant> = {};
export const menuItems: Record<string, menuItemQueries.MenuItem> = {};

// Get all restaurants
router.get('/', async (_req: Request, res: Response) => {
  try {
    if (backend === 'postgres') {
      const allRestaurants = await restaurantQueries.getAllRestaurants();
      return res.json(allRestaurants);
    }
    res.json(Object.values(restaurants));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch restaurants' });
  }
});

// Get restaurant by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    if (backend === 'postgres') {
      const restaurant = await restaurantQueries.getRestaurantById(req.params.id);
      if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
      return res.json(restaurant);
    }
    const restaurant = restaurants[req.params.id];
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch restaurant' });
  }
});

// Get menu items for a restaurant
router.get('/:id/menu', async (req: Request, res: Response) => {
  try {
    if (backend === 'postgres') {
      const items = await menuItemQueries.getMenuItemsByRestaurantId(req.params.id);
      return res.json(items);
    }
    const items = Object.values(menuItems).filter((item) => item.restaurantId === req.params.id);
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

// Create restaurant (requires authentication and VENDOR role)
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { error, value } = createRestaurantSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    // Check if user is VENDOR
    if (req.user?.role !== 'VENDOR') {
      return res.status(403).json({ error: 'Only vendors can create restaurants' });
    }

    // Use authenticated user's ID as vendorId
    const vendorId = req.user.id;

    if (backend === 'postgres') {
      // Check if restaurant already exists for this vendor
      const existing = await restaurantQueries.getRestaurantByVendorId(vendorId);
      if (existing) {
        return res.status(409).json({ error: 'Restaurant already exists for this vendor' });
      }

      const restaurant = await restaurantQueries.createRestaurant(
        vendorId,
        value.name,
        value.description,
        value.location,
        value.hours,
      );
      return res.status(201).json(restaurant);
    }

    // In-memory fallback
    const existing = Object.values(restaurants).find((r) => r.vendorId === vendorId);
    if (existing) {
      return res.status(409).json({ error: 'Restaurant already exists for this vendor' });
    }

    const id = uuidv4();
    const restaurant: restaurantQueries.Restaurant = {
      id,
      vendorId,
      name: value.name,
      description: value.description || null,
      location: value.location || null,
      hours: value.hours || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    restaurants[id] = restaurant;
    res.status(201).json(restaurant);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create restaurant' });
  }
});

// Update restaurant
router.patch('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { error, value } = updateRestaurantSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    if (backend === 'postgres') {
      const restaurant = await restaurantQueries.getRestaurantById(req.params.id);
      if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });

      // Check ownership
      if (restaurant.vendorId !== req.user?.id && req.user?.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Not authorized to update this restaurant' });
      }

      const updated = await restaurantQueries.updateRestaurant(req.params.id, value);
      return res.json(updated);
    }

    const restaurant = restaurants[req.params.id];
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
    if (restaurant.vendorId !== req.user?.id && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    Object.assign(restaurant, value);
    restaurant.updatedAt = new Date().toISOString();
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update restaurant' });
  }
});

// Create menu item
router.post('/:id/menu', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { error, value } = createMenuItemSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    if (backend === 'postgres') {
      const restaurant = await restaurantQueries.getRestaurantById(req.params.id);
      if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });

      // Check ownership
      if (restaurant.vendorId !== req.user?.id && req.user?.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Not authorized' });
      }

      const item = await menuItemQueries.createMenuItem(
        req.params.id,
        value.name,
        value.price,
        value.description,
        value.category,
        value.available,
      );
      return res.status(201).json(item);
    }

    // In-memory fallback
    const restaurant = restaurants[req.params.id];
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
    if (restaurant.vendorId !== req.user?.id && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const id = uuidv4();
    const item: menuItemQueries.MenuItem = {
      id,
      restaurantId: req.params.id,
      name: value.name,
      description: value.description || null,
      price: value.price,
      category: value.category || null,
      available: value.available !== undefined ? value.available : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    menuItems[id] = item;
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create menu item' });
  }
});

// Update menu item
router.patch('/:id/menu/:itemId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { error, value } = updateMenuItemSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    if (backend === 'postgres') {
      const restaurant = await restaurantQueries.getRestaurantById(req.params.id);
      if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });

      if (restaurant.vendorId !== req.user?.id && req.user?.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Not authorized' });
      }

      const item = await menuItemQueries.updateMenuItem(req.params.itemId, value);
      if (!item) return res.status(404).json({ error: 'Menu item not found' });
      return res.json(item);
    }

    // In-memory fallback
    const item = menuItems[req.params.itemId];
    if (!item || item.restaurantId !== req.params.id) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    const restaurant = restaurants[req.params.id];
    if (restaurant.vendorId !== req.user?.id && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    Object.assign(item, value);
    item.updatedAt = new Date().toISOString();
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update menu item' });
  }
});

