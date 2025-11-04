"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const client_1 = require("../../src/db/client");
const fs_1 = __importDefault(require("fs"));
// Mock pg
jest.mock('pg', () => ({
    Pool: jest.fn(),
}));
// Mock fs
jest.mock('fs', () => ({
    readFileSync: jest.fn(),
}));
describe('Database Client', () => {
    let mockPool;
    let mockQuery;
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
        pg_1.Pool.mockImplementation(() => mockPool);
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
            (0, client_1.getPool)();
            expect(pg_1.Pool).toHaveBeenCalledWith({
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
            (0, client_1.getPool)();
            expect(pg_1.Pool).toHaveBeenCalledWith({
                host: 'test-host',
                port: 5433,
                user: 'test-user',
                password: 'test-password',
                database: 'test-db',
            });
        });
        it('parses port as integer', () => {
            process.env.DB_PORT = '5433';
            (0, client_1.getPool)();
            expect(pg_1.Pool).toHaveBeenCalledWith(expect.objectContaining({
                port: 5433,
            }));
        });
    });
    describe('runSqlFile', () => {
        it('reads and executes SQL file', async () => {
            const mockSql = 'CREATE TABLE test (id INT);';
            fs_1.default.readFileSync.mockReturnValue(mockSql);
            // Mock process.cwd
            const originalCwd = process.cwd;
            process.cwd = jest.fn(() => '/test');
            mockQuery.mockResolvedValue(undefined);
            await (0, client_1.runSqlFile)('db/test.sql');
            expect(fs_1.default.readFileSync).toHaveBeenCalled();
            expect(mockQuery).toHaveBeenCalledWith(mockSql);
            expect(mockPool.end).toHaveBeenCalled();
            process.cwd = originalCwd;
        });
        it('handles SQL execution errors', async () => {
            const mockSql = 'CREATE TABLE test (id INT);';
            fs_1.default.readFileSync.mockReturnValue(mockSql);
            const originalCwd = process.cwd;
            process.cwd = jest.fn(() => '/test');
            const dbError = new Error('Database error');
            mockQuery.mockRejectedValue(dbError);
            await expect((0, client_1.runSqlFile)('db/test.sql')).rejects.toThrow('Database error');
            expect(mockPool.end).toHaveBeenCalled(); // Should still close connection
            process.cwd = originalCwd;
        });
    });
});
//# sourceMappingURL=client.test.js.map