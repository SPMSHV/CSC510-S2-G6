import { Pool } from 'pg';
import { getPool, runSqlFile } from '../../src/db/client';
import fs from 'fs';
import path from 'path';

// Mock pg
jest.mock('pg', () => ({
  Pool: jest.fn(),
}));

// Mock fs
jest.mock('fs', () => ({
  readFileSync: jest.fn(),
}));

describe('Database Client', () => {
  let mockPool: Partial<Pool>;
  let mockQuery: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.DB_HOST = 'localhost';
    process.env.DB_PORT = '5432';
    process.env.DB_USER = 'postgres';
    process.env.DB_PASSWORD = 'postgres';
    process.env.DB_NAME = 'campusbot';

    mockQuery = jest.fn();
    mockPool = {
      query: mockQuery,
      end: jest.fn().mockResolvedValue(undefined),
    };
    (Pool as unknown as jest.Mock).mockImplementation(() => mockPool);
  });

  afterEach(() => {
    delete process.env.DB_HOST;
    delete process.env.DB_PORT;
    delete process.env.DB_USER;
    delete process.env.DB_PASSWORD;
    delete process.env.DB_NAME;
  });

  describe('getPool', () => {
    it('creates pool with default configuration', () => {
      delete process.env.DB_HOST;
      delete process.env.DB_PORT;
      delete process.env.DB_USER;
      delete process.env.DB_PASSWORD;
      delete process.env.DB_NAME;

      getPool();

      expect(Pool).toHaveBeenCalledWith({
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: 'postgres',
        database: 'campusbot',
      });
    });

    it('creates pool with environment variables', () => {
      process.env.DB_HOST = 'test-host';
      process.env.DB_PORT = '5433';
      process.env.DB_USER = 'test-user';
      process.env.DB_PASSWORD = 'test-password';
      process.env.DB_NAME = 'test-db';

      getPool();

      expect(Pool).toHaveBeenCalledWith({
        host: 'test-host',
        port: 5433,
        user: 'test-user',
        password: 'test-password',
        database: 'test-db',
      });
    });

    it('parses port as integer', () => {
      process.env.DB_PORT = '5433';

      getPool();

      expect(Pool).toHaveBeenCalledWith(
        expect.objectContaining({
          port: 5433,
        }),
      );
    });
  });

  describe('runSqlFile', () => {
    it('reads and executes SQL file', async () => {
      const mockSql = 'CREATE TABLE test (id INT);';
      (fs.readFileSync as jest.Mock).mockReturnValue(mockSql);

      // Mock process.cwd
      const originalCwd = process.cwd;
      process.cwd = jest.fn(() => '/test');

      mockQuery.mockResolvedValue(undefined);

      await runSqlFile('db/test.sql');

      expect(fs.readFileSync).toHaveBeenCalled();
      expect(mockQuery).toHaveBeenCalledWith(mockSql);
      expect(mockPool.end).toHaveBeenCalled();

      process.cwd = originalCwd;
    });

    it('handles SQL execution errors', async () => {
      const mockSql = 'CREATE TABLE test (id INT);';
      (fs.readFileSync as jest.Mock).mockReturnValue(mockSql);
      const originalCwd = process.cwd;
      process.cwd = jest.fn(() => '/test');

      const dbError = new Error('Database error');
      mockQuery.mockRejectedValue(dbError);

      await expect(runSqlFile('db/test.sql')).rejects.toThrow('Database error');
      expect(mockPool.end).toHaveBeenCalled(); // Should still close connection

      process.cwd = originalCwd;
    });
  });
});

