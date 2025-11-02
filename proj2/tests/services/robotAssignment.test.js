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
const robotAssignment_1 = require("../../src/services/robotAssignment");
const robotQueries = __importStar(require("../../src/db/queries/robots"));
const orderQueries = __importStar(require("../../src/db/queries/orders"));
// Mock the database query modules
jest.mock('../../src/db/queries/robots');
jest.mock('../../src/db/queries/orders');
const mockRobotQueries = robotQueries;
const mockOrderQueries = orderQueries;
describe('Robot Assignment Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('findNearestAvailableRobot', () => {
        it('returns null when no robots are available', async () => {
            mockRobotQueries.getAvailableRobots.mockResolvedValue([]);
            const result = await (0, robotAssignment_1.findNearestAvailableRobot)(35.0, -78.0);
            expect(result).toBeNull();
            expect(mockRobotQueries.getAvailableRobots).toHaveBeenCalledTimes(1);
        });
        it('finds the nearest robot when multiple robots are available', async () => {
            const robots = [
                {
                    id: 'robot-1',
                    robotId: 'RB-01',
                    status: 'IDLE',
                    batteryPercent: 90,
                    location: { lat: 35.1, lng: -78.1 }, // Closest
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
                {
                    id: 'robot-2',
                    robotId: 'RB-02',
                    status: 'IDLE',
                    batteryPercent: 85,
                    location: { lat: 40.0, lng: -80.0 }, // Farther
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
                {
                    id: 'robot-3',
                    robotId: 'RB-03',
                    status: 'IDLE',
                    batteryPercent: 80,
                    location: { lat: 35.2, lng: -78.2 }, // Medium distance
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
            ];
            mockRobotQueries.getAvailableRobots.mockResolvedValue(robots);
            const result = await (0, robotAssignment_1.findNearestAvailableRobot)(35.0, -78.0);
            expect(result).toBeDefined();
            expect(result?.id).toBe('robot-1'); // Closest robot
            expect(mockRobotQueries.getAvailableRobots).toHaveBeenCalledTimes(1);
        });
        it('handles single robot available', async () => {
            const robots = [
                {
                    id: 'robot-1',
                    robotId: 'RB-01',
                    status: 'IDLE',
                    batteryPercent: 90,
                    location: { lat: 35.5, lng: -78.5 },
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
            ];
            mockRobotQueries.getAvailableRobots.mockResolvedValue(robots);
            const result = await (0, robotAssignment_1.findNearestAvailableRobot)(35.0, -78.0);
            expect(result).toBeDefined();
            expect(result?.id).toBe('robot-1');
        });
        it('correctly calculates distances using Haversine formula', async () => {
            const robots = [
                {
                    id: 'robot-near',
                    robotId: 'RB-NEAR',
                    status: 'IDLE',
                    batteryPercent: 90,
                    location: { lat: 35.001, lng: -78.001 }, // Very close
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
                {
                    id: 'robot-far',
                    robotId: 'RB-FAR',
                    status: 'IDLE',
                    batteryPercent: 95,
                    location: { lat: 36.0, lng: -79.0 }, // Farther (higher battery but distance wins)
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
            ];
            mockRobotQueries.getAvailableRobots.mockResolvedValue(robots);
            const result = await (0, robotAssignment_1.findNearestAvailableRobot)(35.0, -78.0);
            expect(result?.id).toBe('robot-near'); // Distance matters more than battery
        });
    });
    describe('assignRobotToOrder', () => {
        it('successfully assigns robot to order', async () => {
            mockOrderQueries.updateOrder.mockResolvedValue({
                id: 'order-1',
                userId: 'user-1',
                vendorId: 'vendor-1',
                robotId: 'robot-1',
                items: [],
                total: 10,
                deliveryLocation: 'Location',
                deliveryLocationLat: null,
                deliveryLocationLng: null,
                status: 'ASSIGNED',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
            mockRobotQueries.updateRobot.mockResolvedValue({
                id: 'robot-1',
                robotId: 'RB-01',
                status: 'ASSIGNED',
                batteryPercent: 90,
                location: { lat: 35.0, lng: -78.0 },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
            await (0, robotAssignment_1.assignRobotToOrder)('order-1', 'robot-1');
            expect(mockOrderQueries.updateOrder).toHaveBeenCalledWith('order-1', {
                robotId: 'robot-1',
                status: 'ASSIGNED',
            });
            expect(mockRobotQueries.updateRobot).toHaveBeenCalledWith('robot-1', { status: 'ASSIGNED' });
        });
    });
    describe('processOrderStatusChange', () => {
        it('assigns robot when order becomes READY', async () => {
            const order = {
                id: 'order-1',
                userId: 'user-1',
                vendorId: 'vendor-1',
                robotId: null,
                items: [],
                total: 10,
                deliveryLocation: 'Location',
                deliveryLocationLat: 35.0,
                deliveryLocationLng: -78.0,
                status: 'CREATED',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            const robot = {
                id: 'robot-1',
                robotId: 'RB-01',
                status: 'IDLE',
                batteryPercent: 90,
                location: { lat: 35.1, lng: -78.1 },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            mockOrderQueries.getOrderById.mockResolvedValue(order);
            mockRobotQueries.getAvailableRobots.mockResolvedValue([robot]);
            mockOrderQueries.updateOrder.mockResolvedValue({ ...order, status: 'ASSIGNED', robotId: 'robot-1' });
            mockRobotQueries.updateRobot.mockResolvedValue({ ...robot, status: 'ASSIGNED' });
            await (0, robotAssignment_1.processOrderStatusChange)('order-1', 'READY');
            expect(mockOrderQueries.getOrderById).toHaveBeenCalledWith('order-1');
            expect(mockRobotQueries.getAvailableRobots).toHaveBeenCalled();
            expect(mockOrderQueries.updateOrder).toHaveBeenCalled();
            expect(mockRobotQueries.updateRobot).toHaveBeenCalled();
        });
        it('does not assign robot when order is READY but no robots available', async () => {
            const order = {
                id: 'order-1',
                userId: 'user-1',
                vendorId: 'vendor-1',
                robotId: null,
                items: [],
                total: 10,
                deliveryLocation: 'Location',
                deliveryLocationLat: 35.0,
                deliveryLocationLng: -78.0,
                status: 'CREATED',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            mockOrderQueries.getOrderById.mockResolvedValue(order);
            mockRobotQueries.getAvailableRobots.mockResolvedValue([]);
            await (0, robotAssignment_1.processOrderStatusChange)('order-1', 'READY');
            expect(mockRobotQueries.getAvailableRobots).toHaveBeenCalled();
            expect(mockOrderQueries.updateOrder).not.toHaveBeenCalled();
        });
        it('does not assign robot when order is READY but missing coordinates', async () => {
            const order = {
                id: 'order-1',
                userId: 'user-1',
                vendorId: 'vendor-1',
                robotId: null,
                items: [],
                total: 10,
                deliveryLocation: 'Location',
                deliveryLocationLat: null,
                deliveryLocationLng: null,
                status: 'CREATED',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            mockOrderQueries.getOrderById.mockResolvedValue(order);
            await (0, robotAssignment_1.processOrderStatusChange)('order-1', 'READY');
            expect(mockRobotQueries.getAvailableRobots).not.toHaveBeenCalled();
        });
        it('does not assign robot when order is READY but already has robot', async () => {
            const order = {
                id: 'order-1',
                userId: 'user-1',
                vendorId: 'vendor-1',
                robotId: 'robot-1',
                items: [],
                total: 10,
                deliveryLocation: 'Location',
                deliveryLocationLat: 35.0,
                deliveryLocationLng: -78.0,
                status: 'ASSIGNED',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            mockOrderQueries.getOrderById.mockResolvedValue(order);
            await (0, robotAssignment_1.processOrderStatusChange)('order-1', 'READY');
            expect(mockRobotQueries.getAvailableRobots).not.toHaveBeenCalled();
        });
        it('updates robot to EN_ROUTE when order becomes EN_ROUTE', async () => {
            const order = {
                id: 'order-1',
                userId: 'user-1',
                vendorId: 'vendor-1',
                robotId: 'robot-1',
                items: [],
                total: 10,
                deliveryLocation: 'Location',
                deliveryLocationLat: null,
                deliveryLocationLng: null,
                status: 'ASSIGNED',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            const robot = {
                id: 'robot-1',
                robotId: 'RB-01',
                status: 'ASSIGNED',
                batteryPercent: 90,
                location: { lat: 35.0, lng: -78.0 },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            mockOrderQueries.getOrderById.mockResolvedValue(order);
            mockRobotQueries.updateRobot.mockResolvedValue({ ...robot, status: 'EN_ROUTE' });
            await (0, robotAssignment_1.processOrderStatusChange)('order-1', 'EN_ROUTE');
            expect(mockRobotQueries.updateRobot).toHaveBeenCalledWith('robot-1', { status: 'EN_ROUTE' });
        });
        it('frees robot when order is DELIVERED', async () => {
            const order = {
                id: 'order-1',
                userId: 'user-1',
                vendorId: 'vendor-1',
                robotId: 'robot-1',
                items: [],
                total: 10,
                deliveryLocation: 'Location',
                deliveryLocationLat: 35.5,
                deliveryLocationLng: -78.5,
                status: 'EN_ROUTE',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            const robot = {
                id: 'robot-1',
                robotId: 'RB-01',
                status: 'EN_ROUTE',
                batteryPercent: 90,
                location: { lat: 35.0, lng: -78.0 },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            mockOrderQueries.getOrderById.mockResolvedValue(order);
            const updatedRobot = { ...robot, status: 'IDLE' };
            mockRobotQueries.updateRobot.mockResolvedValue(updatedRobot);
            await (0, robotAssignment_1.processOrderStatusChange)('order-1', 'DELIVERED');
            // Function calls updateRobot twice: once for status, once for location
            expect(mockRobotQueries.updateRobot).toHaveBeenCalledTimes(2);
            expect(mockRobotQueries.updateRobot).toHaveBeenCalledWith('robot-1', { status: 'IDLE' });
            expect(mockRobotQueries.updateRobot).toHaveBeenCalledWith('robot-1', {
                location: { lat: 35.5, lng: -78.5 },
            });
        });
        it('frees robot without location update when order DELIVERED but missing coordinates', async () => {
            const order = {
                id: 'order-1',
                userId: 'user-1',
                vendorId: 'vendor-1',
                robotId: 'robot-1',
                items: [],
                total: 10,
                deliveryLocation: 'Location',
                deliveryLocationLat: null,
                deliveryLocationLng: null,
                status: 'EN_ROUTE',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            mockOrderQueries.getOrderById.mockResolvedValue(order);
            await (0, robotAssignment_1.processOrderStatusChange)('order-1', 'DELIVERED');
            expect(mockRobotQueries.updateRobot).toHaveBeenCalledWith('robot-1', { status: 'IDLE' });
        });
        it('frees robot when order is CANCELLED', async () => {
            const order = {
                id: 'order-1',
                userId: 'user-1',
                vendorId: 'vendor-1',
                robotId: 'robot-1',
                items: [],
                total: 10,
                deliveryLocation: 'Location',
                deliveryLocationLat: null,
                deliveryLocationLng: null,
                status: 'ASSIGNED',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            mockOrderQueries.getOrderById.mockResolvedValue(order);
            mockRobotQueries.updateRobot.mockResolvedValue({
                id: 'robot-1',
                robotId: 'RB-01',
                status: 'IDLE',
                batteryPercent: 90,
                location: { lat: 35.0, lng: -78.0 },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
            mockOrderQueries.updateOrder.mockResolvedValue({ ...order, robotId: null });
            await (0, robotAssignment_1.processOrderStatusChange)('order-1', 'CANCELLED');
            expect(mockRobotQueries.updateRobot).toHaveBeenCalledWith('robot-1', { status: 'IDLE' });
            expect(mockOrderQueries.updateOrder).toHaveBeenCalledWith('order-1', { robotId: null });
        });
        it('throws error when order not found', async () => {
            mockOrderQueries.getOrderById.mockResolvedValue(null);
            await expect((0, robotAssignment_1.processOrderStatusChange)('nonexistent', 'READY')).rejects.toThrow('Order not found');
        });
        it('handles status transitions that do not require robot updates', async () => {
            const order = {
                id: 'order-1',
                userId: 'user-1',
                vendorId: 'vendor-1',
                robotId: null,
                items: [],
                total: 10,
                deliveryLocation: 'Location',
                deliveryLocationLat: null,
                deliveryLocationLng: null,
                status: 'CREATED',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            mockOrderQueries.getOrderById.mockResolvedValue(order);
            await (0, robotAssignment_1.processOrderStatusChange)('order-1', 'PREPARING');
            expect(mockRobotQueries.getAvailableRobots).not.toHaveBeenCalled();
            expect(mockRobotQueries.updateRobot).not.toHaveBeenCalled();
            expect(mockOrderQueries.updateOrder).not.toHaveBeenCalled();
        });
    });
});
//# sourceMappingURL=robotAssignment.test.js.map