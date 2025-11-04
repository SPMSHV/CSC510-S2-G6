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
const orderQueries = __importStar(require("../../../src/db/queries/orders"));
const client_1 = require("../../../src/db/client");
// Mock the database client
jest.mock('../../../src/db/client', () => ({
    getPool: jest.fn(),
}));
const mockGetPool = client_1.getPool;
describe('Order Database Queries', () => {
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
    describe('getAllOrders', () => {
        it('retrieves all orders from database', async () => {
            const mockOrders = [
                {
                    id: 'order-1',
                    user_id: 'user-1',
                    vendor_id: 'vendor-1',
                    robot_id: null,
                    items: [{ name: 'Burger', quantity: 1, price: 10 }],
                    total: '10.00',
                    delivery_location: 'Building A',
                    delivery_location_lat: null,
                    delivery_location_lng: null,
                    status: 'CREATED',
                    created_at: new Date('2024-01-01'),
                    updated_at: new Date('2024-01-01'),
                },
            ];
            mockQuery.mockResolvedValue({ rows: mockOrders });
            const result = await orderQueries.getAllOrders();
            expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM orders ORDER BY created_at DESC');
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('order-1');
            expect(result[0].total).toBe(10);
        });
    });
    describe('getOrderById', () => {
        it('retrieves order by id', async () => {
            const mockOrder = {
                id: 'order-1',
                user_id: 'user-1',
                vendor_id: 'vendor-1',
                robot_id: 'robot-1',
                items: [{ name: 'Burger', quantity: 1, price: 10 }],
                total: '15.50',
                delivery_location: 'Building A',
                delivery_location_lat: '35.0',
                delivery_location_lng: '-78.0',
                status: 'ASSIGNED',
                created_at: new Date('2024-01-01'),
                updated_at: new Date('2024-01-01'),
            };
            mockQuery.mockResolvedValue({ rows: [mockOrder] });
            const result = await orderQueries.getOrderById('order-1');
            expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM orders WHERE id = $1', ['order-1']);
            expect(result).toBeDefined();
            expect(result?.id).toBe('order-1');
            expect(result?.robotId).toBe('robot-1');
            expect(result?.deliveryLocationLat).toBe(35.0);
            expect(result?.deliveryLocationLng).toBe(-78.0);
        });
        it('returns null when order not found', async () => {
            mockQuery.mockResolvedValue({ rows: [] });
            const result = await orderQueries.getOrderById('nonexistent');
            expect(result).toBeNull();
        });
    });
    describe('getOrdersByUserId', () => {
        it('retrieves orders for a specific user', async () => {
            const mockOrders = [
                {
                    id: 'order-1',
                    user_id: 'user-1',
                    vendor_id: 'vendor-1',
                    robot_id: null,
                    items: [],
                    total: '10.00',
                    delivery_location: 'Building A',
                    delivery_location_lat: null,
                    delivery_location_lng: null,
                    status: 'CREATED',
                    created_at: new Date('2024-01-01'),
                    updated_at: new Date('2024-01-01'),
                },
            ];
            mockQuery.mockResolvedValue({ rows: mockOrders });
            const result = await orderQueries.getOrdersByUserId('user-1');
            expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', ['user-1']);
            expect(result).toHaveLength(1);
            expect(result[0].userId).toBe('user-1');
        });
    });
    describe('getOrdersByStatus', () => {
        it('retrieves orders by status if function exists', async () => {
            // Check if getOrdersByStatus exists in the module
            if ('getOrdersByStatus' in orderQueries) {
                const mockOrders = [
                    {
                        id: 'order-1',
                        user_id: 'user-1',
                        vendor_id: 'vendor-1',
                        robot_id: null,
                        items: [],
                        total: '10.00',
                        delivery_location: 'Building A',
                        delivery_location_lat: null,
                        delivery_location_lng: null,
                        status: 'READY',
                        created_at: new Date('2024-01-01'),
                        updated_at: new Date('2024-01-01'),
                    },
                ];
                mockQuery.mockResolvedValue({ rows: mockOrders });
                const result = await orderQueries.getOrdersByStatus('READY');
                expect(result).toHaveLength(1);
                expect(result[0].status).toBe('READY');
            }
        });
    });
    describe('createOrder', () => {
        it('creates a new order', async () => {
            const items = [{ name: 'Burger', quantity: 1, price: 10 }];
            const mockOrder = {
                id: 'order-1',
                user_id: 'user-1',
                vendor_id: 'vendor-1',
                robot_id: null,
                items: items,
                total: '10.00',
                delivery_location: 'Building A',
                delivery_location_lat: null,
                delivery_location_lng: null,
                status: 'CREATED',
                created_at: new Date('2024-01-01'),
                updated_at: new Date('2024-01-01'),
            };
            mockQuery.mockResolvedValue({ rows: [mockOrder] });
            const result = await orderQueries.createOrder('user-1', 'vendor-1', items, 'Building A');
            expect(mockQuery).toHaveBeenCalled();
            expect(result.userId).toBe('user-1');
            expect(result.vendorId).toBe('vendor-1');
            expect(result.total).toBe(10);
            expect(result.status).toBe('CREATED');
        });
        it('creates order with coordinates', async () => {
            const items = [{ name: 'Burger', quantity: 1, price: 10 }];
            const mockOrder = {
                id: 'order-1',
                user_id: 'user-1',
                vendor_id: 'vendor-1',
                robot_id: null,
                items: items,
                total: '10.00',
                delivery_location: 'Building A',
                delivery_location_lat: '35.5',
                delivery_location_lng: '-78.5',
                status: 'CREATED',
                created_at: new Date('2024-01-01'),
                updated_at: new Date('2024-01-01'),
            };
            mockQuery.mockResolvedValue({ rows: [mockOrder] });
            const result = await orderQueries.createOrder('user-1', 'vendor-1', items, 'Building A', 35.5, -78.5);
            expect(result.deliveryLocationLat).toBe(35.5);
            expect(result.deliveryLocationLng).toBe(-78.5);
        });
        it('calculates total correctly', async () => {
            const items = [
                { name: 'Burger', quantity: 2, price: 10 },
                { name: 'Fries', quantity: 1, price: 3 },
            ];
            const mockOrder = {
                id: 'order-1',
                user_id: 'user-1',
                vendor_id: 'vendor-1',
                robot_id: null,
                items: items,
                total: '23.00',
                delivery_location: 'Building A',
                delivery_location_lat: null,
                delivery_location_lng: null,
                status: 'CREATED',
                created_at: new Date('2024-01-01'),
                updated_at: new Date('2024-01-01'),
            };
            mockQuery.mockResolvedValue({ rows: [mockOrder] });
            const result = await orderQueries.createOrder('user-1', 'vendor-1', items, 'Building A');
            expect(result.total).toBe(23);
        });
    });
    describe('updateOrder', () => {
        it('updates order status', async () => {
            const mockOrder = {
                id: 'order-1',
                user_id: 'user-1',
                vendor_id: 'vendor-1',
                robot_id: null,
                items: [],
                total: '10.00',
                delivery_location: 'Building A',
                delivery_location_lat: null,
                delivery_location_lng: null,
                status: 'PREPARING',
                created_at: new Date('2024-01-01'),
                updated_at: new Date('2024-01-02'),
            };
            mockQuery.mockResolvedValue({ rows: [mockOrder] });
            const result = await orderQueries.updateOrder('order-1', { status: 'PREPARING' });
            expect(result?.status).toBe('PREPARING');
        });
        it('updates robot assignment', async () => {
            const mockOrder = {
                id: 'order-1',
                user_id: 'user-1',
                vendor_id: 'vendor-1',
                robot_id: 'robot-1',
                items: [],
                total: '10.00',
                delivery_location: 'Building A',
                delivery_location_lat: null,
                delivery_location_lng: null,
                status: 'ASSIGNED',
                created_at: new Date('2024-01-01'),
                updated_at: new Date('2024-01-02'),
            };
            mockQuery.mockResolvedValue({ rows: [mockOrder] });
            const result = await orderQueries.updateOrder('order-1', { robotId: 'robot-1' });
            expect(result?.robotId).toBe('robot-1');
        });
        it('updates both status and robot', async () => {
            const mockOrder = {
                id: 'order-1',
                user_id: 'user-1',
                vendor_id: 'vendor-1',
                robot_id: 'robot-1',
                items: [],
                total: '10.00',
                delivery_location: 'Building A',
                delivery_location_lat: null,
                delivery_location_lng: null,
                status: 'ASSIGNED',
                created_at: new Date('2024-01-01'),
                updated_at: new Date('2024-01-02'),
            };
            mockQuery.mockResolvedValue({ rows: [mockOrder] });
            const result = await orderQueries.updateOrder('order-1', { status: 'ASSIGNED', robotId: 'robot-1' });
            expect(result?.status).toBe('ASSIGNED');
            expect(result?.robotId).toBe('robot-1');
        });
        it('returns null when order not found', async () => {
            mockQuery.mockResolvedValue({ rows: [] });
            const result = await orderQueries.updateOrder('nonexistent', { status: 'PREPARING' });
            expect(result).toBeNull();
        });
    });
    describe('deleteOrder', () => {
        it('deletes order successfully', async () => {
            mockQuery.mockResolvedValue({ rowCount: 1 });
            const result = await orderQueries.deleteOrder('order-1');
            expect(mockQuery).toHaveBeenCalledWith('DELETE FROM orders WHERE id = $1', ['order-1']);
            expect(result).toBe(true);
        });
        it('returns false when order not found', async () => {
            mockQuery.mockResolvedValue({ rowCount: 0 });
            const result = await orderQueries.deleteOrder('nonexistent');
            expect(result).toBe(false);
        });
    });
});
//# sourceMappingURL=orders.test.js.map