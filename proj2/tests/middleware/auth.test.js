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
const auth_1 = require("../../src/web/middleware/auth");
const userQueries = __importStar(require("../../src/db/queries/users"));
// Mock the database query module
jest.mock('../../src/db/queries/users');
const mockUserQueries = userQueries;
describe('Authentication Middleware', () => {
    let mockRequest;
    let mockResponse;
    let mockNext;
    beforeEach(() => {
        jest.clearAllMocks();
        mockRequest = {
            headers: {},
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
        mockNext = jest.fn();
        process.env.DATA_BACKEND = 'memory'; // Use memory mode for most tests
    });
    afterEach(() => {
        delete process.env.DATA_BACKEND;
    });
    describe('generateToken', () => {
        it('generates a valid JWT token', () => {
            const token = (0, auth_1.generateToken)('user-1', 'test@test.com', 'STUDENT');
            expect(token).toBeDefined();
            expect(typeof token).toBe('string');
            expect(token.split('.').length).toBe(3); // JWT has 3 parts
        });
        it('generates different tokens for different users', () => {
            const token1 = (0, auth_1.generateToken)('user-1', 'test1@test.com', 'STUDENT');
            const token2 = (0, auth_1.generateToken)('user-2', 'test2@test.com', 'VENDOR');
            expect(token1).not.toBe(token2);
        });
    });
    describe('verifyToken', () => {
        it('verifies a valid token', () => {
            const token = (0, auth_1.generateToken)('user-1', 'test@test.com', 'STUDENT');
            const decoded = (0, auth_1.verifyToken)(token);
            expect(decoded).toBeDefined();
            expect(decoded?.userId).toBe('user-1');
            expect(decoded?.email).toBe('test@test.com');
            expect(decoded?.role).toBe('STUDENT');
        });
        it('returns null for invalid token', () => {
            const decoded = (0, auth_1.verifyToken)('invalid-token');
            expect(decoded).toBeNull();
        });
        it('returns null for malformed token', () => {
            const decoded = (0, auth_1.verifyToken)('not.a.valid.token.structure');
            expect(decoded).toBeNull();
        });
        it('returns null for empty token', () => {
            const decoded = (0, auth_1.verifyToken)('');
            expect(decoded).toBeNull();
        });
    });
    describe('authenticate', () => {
        it('rejects request without authorization header', async () => {
            mockRequest.headers = {};
            await (0, auth_1.authenticate)(mockRequest, mockResponse, mockNext);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'No token provided' });
            expect(mockNext).not.toHaveBeenCalled();
        });
        it('rejects request with wrong authorization header format', async () => {
            mockRequest.headers = { authorization: 'Invalid token' };
            await (0, auth_1.authenticate)(mockRequest, mockResponse, mockNext);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'No token provided' });
            expect(mockNext).not.toHaveBeenCalled();
        });
        it('rejects request with invalid token', async () => {
            mockRequest.headers = { authorization: 'Bearer invalid-token' };
            await (0, auth_1.authenticate)(mockRequest, mockResponse, mockNext);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid token' });
            expect(mockNext).not.toHaveBeenCalled();
        });
        it('accepts valid token and calls next in memory mode', async () => {
            const token = (0, auth_1.generateToken)('user-1', 'test@test.com', 'STUDENT');
            mockRequest.headers = { authorization: `Bearer ${token}` };
            await (0, auth_1.authenticate)(mockRequest, mockResponse, mockNext);
            expect(mockNext).toHaveBeenCalled();
            expect(mockRequest.userId).toBe('user-1');
            expect(mockRequest.user).toBeDefined();
        });
        it('fetches user from database in postgres mode', async () => {
            process.env.DATA_BACKEND = 'postgres';
            const token = (0, auth_1.generateToken)('user-1', 'test@test.com', 'STUDENT');
            mockRequest.headers = { authorization: `Bearer ${token}` };
            const mockUser = {
                id: 'user-1',
                email: 'test@test.com',
                name: 'Test User',
                role: 'STUDENT',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            mockUserQueries.getUserById.mockResolvedValue(mockUser);
            await (0, auth_1.authenticate)(mockRequest, mockResponse, mockNext);
            expect(mockUserQueries.getUserById).toHaveBeenCalledWith('user-1');
            expect(mockNext).toHaveBeenCalled();
            expect(mockRequest.user).toBeDefined();
        });
        it('rejects token when user not found in database (postgres mode)', async () => {
            process.env.DATA_BACKEND = 'postgres';
            const token = (0, auth_1.generateToken)('user-1', 'test@test.com', 'STUDENT');
            mockRequest.headers = { authorization: `Bearer ${token}` };
            mockUserQueries.getUserById.mockResolvedValue(null);
            await (0, auth_1.authenticate)(mockRequest, mockResponse, mockNext);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'User not found' });
            expect(mockNext).not.toHaveBeenCalled();
        });
        it('handles database errors gracefully', async () => {
            process.env.DATA_BACKEND = 'postgres';
            const token = (0, auth_1.generateToken)('user-1', 'test@test.com', 'STUDENT');
            mockRequest.headers = { authorization: `Bearer ${token}` };
            mockUserQueries.getUserById.mockRejectedValue(new Error('Database connection failed'));
            await (0, auth_1.authenticate)(mockRequest, mockResponse, mockNext);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Authentication failed' });
        });
    });
    describe('requireRole', () => {
        it('allows access for user with required role', () => {
            mockRequest.user = { id: 'user-1', email: 'test@test.com', name: 'Test', role: 'VENDOR' };
            const middleware = (0, auth_1.requireRole)('VENDOR', 'ADMIN');
            middleware(mockRequest, mockResponse, mockNext);
            expect(mockNext).toHaveBeenCalled();
        });
        it('rejects access for user without required role', () => {
            mockRequest.user = { id: 'user-1', email: 'test@test.com', name: 'Test', role: 'STUDENT' };
            const middleware = (0, auth_1.requireRole)('VENDOR', 'ADMIN');
            middleware(mockRequest, mockResponse, mockNext);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Insufficient permissions' });
            expect(mockNext).not.toHaveBeenCalled();
        });
        it('rejects access when user not authenticated', () => {
            mockRequest.user = undefined;
            const middleware = (0, auth_1.requireRole)('VENDOR');
            middleware(mockRequest, mockResponse, mockNext);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Not authenticated' });
            expect(mockNext).not.toHaveBeenCalled();
        });
        it('requires ADMIN to be explicitly in allowed roles', () => {
            mockRequest.user = { id: 'admin-1', email: 'admin@test.com', name: 'Admin', role: 'ADMIN' };
            const middleware = (0, auth_1.requireRole)('ADMIN', 'VENDOR');
            middleware(mockRequest, mockResponse, mockNext);
            expect(mockNext).toHaveBeenCalled();
        });
        it('rejects ADMIN when not in allowed roles', () => {
            mockRequest.user = { id: 'admin-1', email: 'admin@test.com', name: 'Admin', role: 'ADMIN' };
            const middleware = (0, auth_1.requireRole)('VENDOR');
            middleware(mockRequest, mockResponse, mockNext);
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(mockNext).not.toHaveBeenCalled();
        });
    });
});
//# sourceMappingURL=auth.test.js.map