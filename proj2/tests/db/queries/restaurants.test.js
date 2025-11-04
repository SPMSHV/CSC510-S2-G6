"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const restaurantQueries = __importStar(require("../../../src/db/queries/restaurants"));
const client_1 = require("../../../src/db/client");
// Mock the database client
jest.mock('../../../src/db/client', () => ({
    getPool: jest.fn(),
}));
const mockGetPool = client_1.getPool;
describe('Restaurant Database Queries', () => {
    let mockPool;
    let mockQuery;
    beforeEach(() => {
        mockQuery = jest.fn();
        mockPool = {
            query: mockQuery,
        };
        mockGetPool.mockReturnValue(mockPool);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('getAllRestaurants', () => {
        it('retrieves all restaurants from database', async () => {
            const mockRestaurants = [
                {
                    id: 'rest-1',
                    vendor_id: 'vendor-1',
                    name: 'Restaurant One',
                    description: 'A great restaurant',
                    location_lat: '35.0',
                    location_lng: '-78.0',
                    hours: { monday: '9am-5pm' },
                    created_at: new Date('2024-01-01'),
                    updated_at: new Date('2024-01-01'),
                },
            ];
            mockQuery.mockResolvedValue({ rows: mockRestaurants });
            const result = await restaurantQueries.getAllRestaurants();
            expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM restaurants ORDER BY created_at DESC');
            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('Restaurant One');
        });
    });
    describe('getRestaurantById', () => {
        it('retrieves restaurant by id', async () => {
            const mockRestaurant = {
                id: 'rest-1',
                vendor_id: 'vendor-1',
                name: 'Restaurant One',
                description: 'Description',
                location_lat: '35.0',
                location_lng: '-78.0',
                hours: null,
                created_at: new Date('2024-01-01'),
                updated_at: new Date('2024-01-01'),
            };
            mockQuery.mockResolvedValue({ rows: [mockRestaurant] });
            const result = await restaurantQueries.getRestaurantById('rest-1');
            expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM restaurants WHERE id = $1', ['rest-1']);
            expect(result).toBeDefined();
            expect(result?.id).toBe('rest-1');
            expect(result?.location).toEqual({ lat: 35.0, lng: -78.0 });
        });
        it('returns null when restaurant not found', async () => {
            mockQuery.mockResolvedValue({ rows: [] });
            const result = await restaurantQueries.getRestaurantById('nonexistent');
            expect(result).toBeNull();
        });
    });
    describe('getRestaurantByVendorId', () => {
        it('retrieves restaurant by vendor id', async () => {
            const mockRestaurant = {
                id: 'rest-1',
                vendor_id: 'vendor-1',
                name: 'Restaurant One',
                description: null,
                location_lat: null,
                location_lng: null,
                hours: null,
                created_at: new Date('2024-01-01'),
                updated_at: new Date('2024-01-01'),
            };
            mockQuery.mockResolvedValue({ rows: [mockRestaurant] });
            const result = await restaurantQueries.getRestaurantByVendorId('vendor-1');
            expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM restaurants WHERE vendor_id = $1', ['vendor-1']);
            expect(result).toBeDefined();
            expect(result?.vendorId).toBe('vendor-1');
            expect(result?.location).toBeNull();
        });
    });
    describe('createRestaurant', () => {
        it('creates a new restaurant', async () => {
            const mockRestaurant = {
                id: 'rest-1',
                vendor_id: 'vendor-1',
                name: 'New Restaurant',
                description: 'Description',
                location_lat: '35.0',
                location_lng: '-78.0',
                hours: { monday: '9am-5pm' },
                created_at: new Date('2024-01-01'),
                updated_at: new Date('2024-01-01'),
            };
            mockQuery.mockResolvedValue({ rows: [mockRestaurant] });
            const result = await restaurantQueries.createRestaurant('vendor-1', 'New Restaurant', 'Description', { lat: 35.0, lng: -78.0 }, { monday: '9am-5pm' });
            expect(mockQuery).toHaveBeenCalled();
            expect(result.name).toBe('New Restaurant');
            expect(result.vendorId).toBe('vendor-1');
            expect(result.location).toEqual({ lat: 35.0, lng: -78.0 });
        });
        it('creates restaurant without optional fields', async () => {
            const mockRestaurant = {
                id: 'rest-1',
                vendor_id: 'vendor-1',
                name: 'Simple Restaurant',
                description: null,
                location_lat: null,
                location_lng: null,
                hours: null,
                created_at: new Date('2024-01-01'),
                updated_at: new Date('2024-01-01'),
            };
            mockQuery.mockResolvedValue({ rows: [mockRestaurant] });
            const result = await restaurantQueries.createRestaurant('vendor-1', 'Simple Restaurant');
            expect(result.name).toBe('Simple Restaurant');
            expect(result.description).toBeNull();
            expect(result.location).toBeNull();
        });
    });
    describe('updateRestaurant', () => {
        it('updates restaurant name', async () => {
            const mockRestaurant = {
                id: 'rest-1',
                vendor_id: 'vendor-1',
                name: 'Updated Name',
                description: 'Description',
                location_lat: null,
                location_lng: null,
                hours: null,
                created_at: new Date('2024-01-01'),
                updated_at: new Date('2024-01-02'),
            };
            mockQuery.mockResolvedValue({ rows: [mockRestaurant] });
            const result = await restaurantQueries.updateRestaurant('rest-1', { name: 'Updated Name' });
            expect(result?.name).toBe('Updated Name');
        });
        it('updates multiple fields', async () => {
            const mockRestaurant = {
                id: 'rest-1',
                vendor_id: 'vendor-1',
                name: 'Updated Name',
                description: 'Updated Description',
                location_lat: '35.5',
                location_lng: '-78.5',
                hours: { tuesday: '10am-6pm' },
                created_at: new Date('2024-01-01'),
                updated_at: new Date('2024-01-02'),
            };
            mockQuery.mockResolvedValue({ rows: [mockRestaurant] });
            const result = await restaurantQueries.updateRestaurant('rest-1', {
                name: 'Updated Name',
                description: 'Updated Description',
                location: { lat: 35.5, lng: -78.5 },
                hours: { tuesday: '10am-6pm' },
            });
            expect(result?.name).toBe('Updated Name');
            expect(result?.description).toBe('Updated Description');
            expect(result?.location).toEqual({ lat: 35.5, lng: -78.5 });
        });
        it('returns null when restaurant not found', async () => {
            mockQuery.mockResolvedValue({ rows: [] });
            const result = await restaurantQueries.updateRestaurant('nonexistent', { name: 'Test' });
            expect(result).toBeNull();
        });
    });
    describe('deleteRestaurant', () => {
        it('deletes restaurant successfully', async () => {
            mockQuery.mockResolvedValue({ rowCount: 1 });
            const result = await restaurantQueries.deleteRestaurant('rest-1');
            expect(mockQuery).toHaveBeenCalledWith('DELETE FROM restaurants WHERE id = $1', ['rest-1']);
            expect(result).toBe(true);
        });
        it('returns false when restaurant not found', async () => {
            mockQuery.mockResolvedValue({ rowCount: 0 });
            const result = await restaurantQueries.deleteRestaurant('nonexistent');
            expect(result).toBe(false);
        });
    });
});
//# sourceMappingURL=restaurants.test.js.map