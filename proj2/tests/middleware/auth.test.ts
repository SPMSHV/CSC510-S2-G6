import { Request, Response, NextFunction } from 'express';
import { authenticate, verifyToken, generateToken, requireRole, AuthRequest } from '../../src/web/middleware/auth';
import * as userQueries from '../../src/db/queries/users';

// Mock the database query module
jest.mock('../../src/db/queries/users');

const mockUserQueries = userQueries as jest.Mocked<typeof userQueries>;

describe('Authentication Middleware', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

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
      const token = generateToken('user-1', 'test@test.com', 'STUDENT');
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT has 3 parts
    });

    it('generates different tokens for different users', () => {
      const token1 = generateToken('user-1', 'test1@test.com', 'STUDENT');
      const token2 = generateToken('user-2', 'test2@test.com', 'VENDOR');
      expect(token1).not.toBe(token2);
    });
  });

  describe('verifyToken', () => {
    it('verifies a valid token', () => {
      const token = generateToken('user-1', 'test@test.com', 'STUDENT');
      const decoded = verifyToken(token);
      expect(decoded).toBeDefined();
      expect(decoded?.userId).toBe('user-1');
      expect(decoded?.email).toBe('test@test.com');
      expect(decoded?.role).toBe('STUDENT');
    });

    it('returns null for invalid token', () => {
      const decoded = verifyToken('invalid-token');
      expect(decoded).toBeNull();
    });

    it('returns null for malformed token', () => {
      const decoded = verifyToken('not.a.valid.token.structure');
      expect(decoded).toBeNull();
    });

    it('returns null for empty token', () => {
      const decoded = verifyToken('');
      expect(decoded).toBeNull();
    });
  });

  describe('authenticate', () => {
    it('rejects request without authorization header', async () => {
      mockRequest.headers = {};
      await authenticate(mockRequest as AuthRequest, mockResponse as Response, mockNext);
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'No token provided' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('rejects request with wrong authorization header format', async () => {
      mockRequest.headers = { authorization: 'Invalid token' };
      await authenticate(mockRequest as AuthRequest, mockResponse as Response, mockNext);
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'No token provided' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('rejects request with invalid token', async () => {
      mockRequest.headers = { authorization: 'Bearer invalid-token' };
      await authenticate(mockRequest as AuthRequest, mockResponse as Response, mockNext);
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid token' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('accepts valid token and calls next in memory mode', async () => {
      const token = generateToken('user-1', 'test@test.com', 'STUDENT');
      mockRequest.headers = { authorization: `Bearer ${token}` };
      await authenticate(mockRequest as AuthRequest, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.userId).toBe('user-1');
      expect(mockRequest.user).toBeDefined();
    });

    it('fetches user from database in postgres mode', async () => {
      process.env.DATA_BACKEND = 'postgres';
      const token = generateToken('user-1', 'test@test.com', 'STUDENT');
      mockRequest.headers = { authorization: `Bearer ${token}` };

      const mockUser = {
        id: 'user-1',
        email: 'test@test.com',
        name: 'Test User',
        role: 'STUDENT' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockUserQueries.getUserById.mockResolvedValue(mockUser);

      await authenticate(mockRequest as AuthRequest, mockResponse as Response, mockNext);
      expect(mockUserQueries.getUserById).toHaveBeenCalledWith('user-1');
      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.user).toBeDefined();
    });

    it('rejects token when user not found in database (postgres mode)', async () => {
      process.env.DATA_BACKEND = 'postgres';
      const token = generateToken('user-1', 'test@test.com', 'STUDENT');
      mockRequest.headers = { authorization: `Bearer ${token}` };

      mockUserQueries.getUserById.mockResolvedValue(null);

      await authenticate(mockRequest as AuthRequest, mockResponse as Response, mockNext);
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'User not found' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('handles database errors gracefully', async () => {
      process.env.DATA_BACKEND = 'postgres';
      const token = generateToken('user-1', 'test@test.com', 'STUDENT');
      mockRequest.headers = { authorization: `Bearer ${token}` };

      mockUserQueries.getUserById.mockRejectedValue(new Error('Database connection failed'));

      await authenticate(mockRequest as AuthRequest, mockResponse as Response, mockNext);
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Authentication failed' });
    });
  });

  describe('requireRole', () => {
    it('allows access for user with required role', () => {
      mockRequest.user = { id: 'user-1', email: 'test@test.com', name: 'Test', role: 'VENDOR' };
      const middleware = requireRole('VENDOR', 'ADMIN');
      middleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });

    it('rejects access for user without required role', () => {
      mockRequest.user = { id: 'user-1', email: 'test@test.com', name: 'Test', role: 'STUDENT' };
      const middleware = requireRole('VENDOR', 'ADMIN');
      middleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Insufficient permissions' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('rejects access when user not authenticated', () => {
      mockRequest.user = undefined;
      const middleware = requireRole('VENDOR');
      middleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Not authenticated' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('requires ADMIN to be explicitly in allowed roles', () => {
      mockRequest.user = { id: 'admin-1', email: 'admin@test.com', name: 'Admin', role: 'ADMIN' };
      const middleware = requireRole('ADMIN', 'VENDOR');
      middleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });

    it('rejects ADMIN when not in allowed roles', () => {
      mockRequest.user = { id: 'admin-1', email: 'admin@test.com', name: 'Admin', role: 'ADMIN' };
      const middleware = requireRole('VENDOR');
      middleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});

