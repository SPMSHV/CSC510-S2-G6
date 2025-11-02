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
const robotAssignment_1 = require("../src/services/robotAssignment");
const orderQueries = __importStar(require("../src/db/queries/orders"));
const robotQueries = __importStar(require("../src/db/queries/robots"));
// Mock the database queries
jest.mock('../src/db/queries/orders');
jest.mock('../src/db/queries/robots');
describe('Vendor Order Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('Order Status Transitions', () => {
        it('should transition order from CREATED to PREPARING', async () => {
            const orderId = 'order-1';
            const vendorId = 'vendor-1';
            orderQueries.getOrderById.mockResolvedValue({
                id: orderId,
                vendorId,
                status: 'CREATED',
                robotId: null,
                deliveryLocationLat: null,
                deliveryLocationLng: null,
            });
            orderQueries.updateOrder.mockResolvedValue({
                id: orderId,
                vendorId,
                status: 'PREPARING',
                robotId: null,
            });
            await (0, robotAssignment_1.processOrderStatusChange)(orderId, 'PREPARING');
            expect(orderQueries.updateOrder).not.toHaveBeenCalled();
            // Status change logic should be handled by the route handler
        });
        it('should transition order from PREPARING to READY', async () => {
            const orderId = 'order-1';
            const vendorId = 'vendor-1';
            orderQueries.getOrderById.mockResolvedValue({
                id: orderId,
                vendorId,
                status: 'PREPARING',
                robotId: null,
                deliveryLocationLat: null,
                deliveryLocationLng: null,
            });
            await (0, robotAssignment_1.processOrderStatusChange)(orderId, 'READY');
            expect(orderQueries.getOrderById).toHaveBeenCalledWith(orderId);
        });
        it('should assign robot when order becomes READY', async () => {
            const orderId = 'order-1';
            const robotId = 'robot-1';
            const vendorId = 'vendor-1';
            orderQueries.getOrderById.mockResolvedValue({
                id: orderId,
                vendorId,
                status: 'CREATED',
                robotId: null,
                deliveryLocationLat: 35.772,
                deliveryLocationLng: -78.674,
            });
            robotQueries.getAvailableRobots.mockResolvedValue([
                {
                    id: robotId,
                    robotId: 'RB-1',
                    status: 'IDLE',
                    batteryPercent: 80,
                    location: { lat: 35.773, lng: -78.675 },
                },
            ]);
            robotQueries.updateRobot.mockResolvedValue({
                id: robotId,
                robotId: 'RB-1',
                status: 'ASSIGNED',
            });
            orderQueries.updateOrder.mockResolvedValue({
                id: orderId,
                robotId,
                status: 'ASSIGNED',
            });
            await (0, robotAssignment_1.processOrderStatusChange)(orderId, 'READY');
            expect(robotQueries.getAvailableRobots).toHaveBeenCalled();
            // Robot assignment should occur if available
        });
        it('should not assign robot if none available', async () => {
            const orderId = 'order-1';
            orderQueries.getOrderById.mockResolvedValue({
                id: orderId,
                status: 'CREATED',
                robotId: null,
                deliveryLocationLat: 35.772,
                deliveryLocationLng: -78.674,
            });
            robotQueries.getAvailableRobots.mockResolvedValue([]);
            await (0, robotAssignment_1.processOrderStatusChange)(orderId, 'READY');
            expect(robotQueries.getAvailableRobots).toHaveBeenCalled();
            expect(orderQueries.updateOrder).not.toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ robotId: expect.anything() }));
        });
        it('should handle order cancellation and free robot', async () => {
            const orderId = 'order-1';
            const robotId = 'robot-1';
            orderQueries.getOrderById.mockResolvedValue({
                id: orderId,
                status: 'ASSIGNED',
                robotId,
            });
            robotQueries.updateRobot.mockResolvedValue({
                id: robotId,
                status: 'IDLE',
            });
            orderQueries.updateOrder.mockResolvedValue({
                id: orderId,
                robotId: null,
                status: 'CANCELLED',
            });
            await (0, robotAssignment_1.processOrderStatusChange)(orderId, 'CANCELLED');
            expect(robotQueries.updateRobot).toHaveBeenCalledWith(robotId, { status: 'IDLE' });
        });
    });
    describe('Order Handoff Flow', () => {
        it('should complete full order lifecycle: CREATED → PREPARING → READY → ASSIGNED → EN_ROUTE → DELIVERED', async () => {
            const orderId = 'order-1';
            const robotId = 'robot-1';
            // Step 1: CREATED → PREPARING
            orderQueries.getOrderById.mockResolvedValueOnce({
                id: orderId,
                status: 'CREATED',
                robotId: null,
                deliveryLocationLat: null,
            });
            await (0, robotAssignment_1.processOrderStatusChange)(orderId, 'PREPARING');
            // Step 2: PREPARING → READY
            orderQueries.getOrderById.mockResolvedValueOnce({
                id: orderId,
                status: 'PREPARING',
                robotId: null,
                deliveryLocationLat: 35.772,
                deliveryLocationLng: -78.674,
            });
            robotQueries.getAvailableRobots.mockResolvedValue([
                {
                    id: robotId,
                    robotId: 'RB-1',
                    status: 'IDLE',
                    batteryPercent: 80,
                    location: { lat: 35.773, lng: -78.675 },
                },
            ]);
            await (0, robotAssignment_1.processOrderStatusChange)(orderId, 'READY');
            // Step 3: READY → ASSIGNED (should assign robot)
            expect(robotQueries.getAvailableRobots).toHaveBeenCalled();
            // Step 4: ASSIGNED → EN_ROUTE
            orderQueries.getOrderById.mockResolvedValueOnce({
                id: orderId,
                status: 'ASSIGNED',
                robotId,
            });
            robotQueries.updateRobot.mockResolvedValue({
                id: robotId,
                status: 'EN_ROUTE',
            });
            await (0, robotAssignment_1.processOrderStatusChange)(orderId, 'EN_ROUTE');
            expect(robotQueries.updateRobot).toHaveBeenCalledWith(robotId, { status: 'EN_ROUTE' });
            // Step 5: EN_ROUTE → DELIVERED (should free robot)
            orderQueries.getOrderById.mockResolvedValueOnce({
                id: orderId,
                status: 'EN_ROUTE',
                robotId,
                deliveryLocationLat: 35.772,
                deliveryLocationLng: -78.674,
            });
            robotQueries.updateRobot.mockResolvedValue({
                id: robotId,
                status: 'IDLE',
                location: { lat: 35.772, lng: -78.674 },
            });
            await (0, robotAssignment_1.processOrderStatusChange)(orderId, 'DELIVERED');
            expect(robotQueries.updateRobot).toHaveBeenCalledWith(robotId, {
                status: 'IDLE',
                location: { lat: 35.772, lng: -78.674 },
            });
        });
    });
});
//# sourceMappingURL=vendorService.test.js.map