import * as menuItemQueries from '../../../src/db/queries/menuItems';
import { Pool } from 'pg';
import { getPool } from '../../../src/db/client';

// Mock the database client
jest.mock('../../../src/db/client', () => ({
  getPool: jest.fn(),
}));

const mockGetPool = getPool as jest.MockedFunction<typeof getPool>;

describe('Menu Item Database Queries', () => {
  let mockPool: jest.Mocked<Pool>;
  let mockQuery: jest.Mock;

  beforeEach(() => {
    mockQuery = jest.fn();
    mockPool = {
      query: mockQuery,
    } as unknown as jest.Mocked<Pool>;
    mockGetPool.mockReturnValue(mockPool as Pool);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getMenuItemsByRestaurantId', () => {
    it('retrieves menu items for a restaurant', async () => {
      const mockItems = [
        {
          id: 'item-1',
          restaurant_id: 'rest-1',
          name: 'Burger',
          description: 'Delicious burger',
          price: '10.99',
          category: 'Main',
          available: true,
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01'),
        },
      ];

      mockQuery.mockResolvedValue({ rows: mockItems });

      const result = await menuItemQueries.getMenuItemsByRestaurantId('rest-1');

      expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM menu_items WHERE restaurant_id = $1 ORDER BY category, name', ['rest-1']);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Burger');
      expect(result[0].price).toBe(10.99);
    });

    it('returns empty array when no menu items', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const result = await menuItemQueries.getMenuItemsByRestaurantId('rest-1');

      expect(result).toHaveLength(0);
    });
  });

  describe('getMenuItemById', () => {
    it('retrieves menu item by id', async () => {
      const mockItem = {
        id: 'item-1',
        restaurant_id: 'rest-1',
        name: 'Burger',
        description: 'Delicious burger',
        price: '10.99',
        category: 'Main',
        available: true,
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
      };

      mockQuery.mockResolvedValue({ rows: [mockItem] });

      const result = await menuItemQueries.getMenuItemById('item-1');

      expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM menu_items WHERE id = $1', ['item-1']);
      expect(result).toBeDefined();
      expect(result?.id).toBe('item-1');
      expect(result?.name).toBe('Burger');
    });

    it('returns null when menu item not found', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const result = await menuItemQueries.getMenuItemById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('createMenuItem', () => {
    it('creates a new menu item', async () => {
      const mockItem = {
        id: 'item-1',
        restaurant_id: 'rest-1',
        name: 'Pizza',
        description: 'Delicious pizza',
        price: '15.99',
        category: 'Main',
        available: true,
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
      };

      mockQuery.mockResolvedValue({ rows: [mockItem] });

      const result = await menuItemQueries.createMenuItem('rest-1', 'Pizza', 15.99, 'Delicious pizza', 'Main');

      expect(mockQuery).toHaveBeenCalledWith(
        `INSERT INTO menu_items (restaurant_id, name, description, price, category, available)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        ['rest-1', 'Pizza', 'Delicious pizza', 15.99, 'Main', true],
      );
      expect(result.name).toBe('Pizza');
      expect(result.price).toBe(15.99);
    });

    it('creates menu item with default available status', async () => {
      const mockItem = {
        id: 'item-1',
        restaurant_id: 'rest-1',
        name: 'Burger',
        description: null,
        price: '10.00',
        category: null,
        available: true,
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
      };

      mockQuery.mockResolvedValue({ rows: [mockItem] });

      const result = await menuItemQueries.createMenuItem('rest-1', 'Burger', 10.0);

      expect(result.available).toBe(true);
    });
  });

  describe('updateMenuItem', () => {
    it('updates menu item name', async () => {
      const mockItem = {
        id: 'item-1',
        restaurant_id: 'rest-1',
        name: 'Updated Burger',
        description: 'Description',
        price: '10.99',
        category: 'Main',
        available: true,
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-02'),
      };

      mockQuery.mockResolvedValue({ rows: [mockItem] });

      const result = await menuItemQueries.updateMenuItem('item-1', { name: 'Updated Burger' });

      expect(result?.name).toBe('Updated Burger');
    });

    it('updates menu item availability', async () => {
      const mockItem = {
        id: 'item-1',
        restaurant_id: 'rest-1',
        name: 'Burger',
        description: 'Description',
        price: '10.99',
        category: 'Main',
        available: false,
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-02'),
      };

      mockQuery.mockResolvedValue({ rows: [mockItem] });

      const result = await menuItemQueries.updateMenuItem('item-1', { available: false });

      expect(result?.available).toBe(false);
    });

    it('updates multiple fields', async () => {
      const mockItem = {
        id: 'item-1',
        restaurant_id: 'rest-1',
        name: 'Updated Burger',
        description: 'New Description',
        price: '12.99',
        category: 'Special',
        available: false,
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-02'),
      };

      mockQuery.mockResolvedValue({ rows: [mockItem] });

      const result = await menuItemQueries.updateMenuItem('item-1', {
        name: 'Updated Burger',
        description: 'New Description',
        price: 12.99,
        category: 'Special',
        available: false,
      });

      expect(result?.name).toBe('Updated Burger');
      expect(result?.price).toBe(12.99);
      expect(result?.available).toBe(false);
    });

    it('returns null when menu item not found', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const result = await menuItemQueries.updateMenuItem('nonexistent', { name: 'Test' });

      expect(result).toBeNull();
    });
  });

  describe('deleteMenuItem', () => {
    it('deletes menu item successfully', async () => {
      mockQuery.mockResolvedValue({ rowCount: 1 });

      const result = await menuItemQueries.deleteMenuItem('item-1');

      expect(mockQuery).toHaveBeenCalledWith('DELETE FROM menu_items WHERE id = $1', ['item-1']);
      expect(result).toBe(true);
    });

    it('returns false when menu item not found', async () => {
      mockQuery.mockResolvedValue({ rowCount: 0 });

      const result = await menuItemQueries.deleteMenuItem('nonexistent');

      expect(result).toBe(false);
    });
  });
});

