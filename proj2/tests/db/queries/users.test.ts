import * as userQueries from '../../../src/db/queries/users';
import { Pool } from 'pg';
import { getPool } from '../../../src/db/client';

// Mock the database client
jest.mock('../../../src/db/client', () => ({
  getPool: jest.fn(),
}));

const mockGetPool = getPool as jest.MockedFunction<typeof getPool>;

describe('User Database Queries', () => {
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

  describe('getAllUsers', () => {
    it('retrieves all users from database', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          email: 'user1@test.com',
          name: 'User One',
          role: 'STUDENT',
          password_hash: null,
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01'),
        },
        {
          id: 'user-2',
          email: 'user2@test.com',
          name: 'User Two',
          role: 'VENDOR',
          password_hash: 'hash',
          created_at: new Date('2024-01-02'),
          updated_at: new Date('2024-01-02'),
        },
      ];

      mockQuery.mockResolvedValue({ rows: mockUsers });

      const result = await userQueries.getAllUsers();

      expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM users ORDER BY created_at DESC');
      expect(result).toHaveLength(2);
      expect(result[0].email).toBe('user1@test.com');
      expect(result[1].email).toBe('user2@test.com');
    });

    it('returns empty array when no users exist', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const result = await userQueries.getAllUsers();

      expect(result).toHaveLength(0);
    });
  });

  describe('getUserById', () => {
    it('retrieves user by id', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'user1@test.com',
        name: 'User One',
        role: 'STUDENT',
        password_hash: null,
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
      };

      mockQuery.mockResolvedValue({ rows: [mockUser] });

      const result = await userQueries.getUserById('user-1');

      expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM users WHERE id = $1', ['user-1']);
      expect(result).toBeDefined();
      expect(result?.id).toBe('user-1');
      expect(result?.email).toBe('user1@test.com');
    });

    it('returns null when user not found', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const result = await userQueries.getUserById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getUserByEmail', () => {
    it('retrieves user by email', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'user1@test.com',
        name: 'User One',
        role: 'STUDENT',
        password_hash: 'hash',
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
      };

      mockQuery.mockResolvedValue({ rows: [mockUser] });

      const result = await userQueries.getUserByEmail('user1@test.com');

      expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM users WHERE email = $1', ['user1@test.com']);
      expect(result).toBeDefined();
      expect(result?.email).toBe('user1@test.com');
      expect(result?.password_hash).toBe('hash');
    });

    it('returns null when user not found', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const result = await userQueries.getUserByEmail('nonexistent@test.com');

      expect(result).toBeNull();
    });
  });

  describe('createUser', () => {
    it('creates a new user without password', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'newuser@test.com',
        name: 'New User',
        role: 'STUDENT',
        password_hash: null,
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
      };

      mockQuery.mockResolvedValue({ rows: [mockUser] });

      const result = await userQueries.createUser('newuser@test.com', 'New User', 'STUDENT');

      expect(mockQuery).toHaveBeenCalledWith(
        'INSERT INTO users (email, name, role, password_hash) VALUES ($1, $2, $3, $4) RETURNING *',
        ['newuser@test.com', 'New User', 'STUDENT', null],
      );
      expect(result.email).toBe('newuser@test.com');
      expect(result.role).toBe('STUDENT');
    });

    it('creates a new user with password hash', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'newuser@test.com',
        name: 'New User',
        role: 'STUDENT',
        password_hash: 'hashed-password',
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
      };

      mockQuery.mockResolvedValue({ rows: [mockUser] });

      const result = await userQueries.createUser('newuser@test.com', 'New User', 'STUDENT', 'hashed-password');

      expect(mockQuery).toHaveBeenCalledWith(
        'INSERT INTO users (email, name, role, password_hash) VALUES ($1, $2, $3, $4) RETURNING *',
        ['newuser@test.com', 'New User', 'STUDENT', 'hashed-password'],
      );
      expect(result.email).toBe('newuser@test.com');
    });
  });

  describe('updateUser', () => {
    it('updates user email', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'updated@test.com',
        name: 'User One',
        role: 'STUDENT',
        password_hash: null,
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-02'),
      };

      mockQuery.mockResolvedValue({ rows: [mockUser] });

      const result = await userQueries.updateUser('user-1', { email: 'updated@test.com' });

      expect(mockQuery).toHaveBeenCalled();
      expect(result?.email).toBe('updated@test.com');
    });

    it('updates multiple fields', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'updated@test.com',
        name: 'Updated Name',
        role: 'VENDOR',
        password_hash: null,
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-02'),
      };

      mockQuery.mockResolvedValue({ rows: [mockUser] });

      const result = await userQueries.updateUser('user-1', {
        email: 'updated@test.com',
        name: 'Updated Name',
        role: 'VENDOR',
      });

      expect(result?.email).toBe('updated@test.com');
      expect(result?.name).toBe('Updated Name');
      expect(result?.role).toBe('VENDOR');
    });

    it('updates password hash', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'user@test.com',
        name: 'User',
        role: 'STUDENT',
        password_hash: 'new-hash',
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-02'),
      };

      mockQuery.mockResolvedValue({ rows: [mockUser] });

      const result = await userQueries.updateUser('user-1', { passwordHash: 'new-hash' });

      expect(result).toBeDefined();
      expect(mockQuery).toHaveBeenCalled();
    });

    it('returns null when user not found', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const result = await userQueries.updateUser('nonexistent', { name: 'Test' });

      expect(result).toBeNull();
    });

    it('returns user without updates when update object is empty', async () => {
      // When no updates, it calls getUserById
      const mockUser = {
        id: 'user-1',
        email: 'user@test.com',
        name: 'User',
        role: 'STUDENT',
        password_hash: null,
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
      };

      mockQuery.mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({ rows: [mockUser] });

      const result = await userQueries.updateUser('user-1', {});

      expect(result).toBeDefined();
    });
  });

  describe('deleteUser', () => {
    it('deletes user successfully', async () => {
      mockQuery.mockResolvedValue({ rowCount: 1 });

      const result = await userQueries.deleteUser('user-1');

      expect(mockQuery).toHaveBeenCalledWith('DELETE FROM users WHERE id = $1', ['user-1']);
      expect(result).toBe(true);
    });

    it('returns false when user not found', async () => {
      mockQuery.mockResolvedValue({ rowCount: 0 });

      const result = await userQueries.deleteUser('nonexistent');

      expect(result).toBe(false);
    });
  });
});

