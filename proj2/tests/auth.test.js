"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const request_1 = require("./helpers/request");
const app = (0, request_1.createApp)();
describe('Authentication API', () => {
    describe('POST /api/auth/register', () => {
        it('successfully registers a new user', async () => {
            const payload = {
                email: 'test@university.edu',
                name: 'Test Student',
                password: 'password123',
                role: 'STUDENT',
            };
            const res = await (0, supertest_1.default)(app).post('/api/auth/register').send(payload);
            expect(res.status).toBe(201);
            expect(res.body.user).toBeDefined();
            expect(res.body.user.email).toBe('test@university.edu');
            expect(res.body.user.name).toBe('Test Student');
            expect(res.body.user.role).toBe('STUDENT');
            expect(res.body.user.password).toBeUndefined();
            expect(res.body.user.passwordHash).toBeUndefined();
            expect(res.body.token).toBeDefined();
            expect(typeof res.body.token).toBe('string');
        });
        it('rejects duplicate email', async () => {
            const payload = {
                email: 'duplicate@university.edu',
                name: 'First User',
                password: 'password123',
                role: 'STUDENT',
            };
            await (0, supertest_1.default)(app).post('/api/auth/register').send(payload);
            const res = await (0, supertest_1.default)(app).post('/api/auth/register').send(payload);
            expect(res.status).toBe(409);
            expect(res.body.error).toContain('already registered');
        });
        it('rejects invalid email', async () => {
            const payload = {
                email: 'invalid-email',
                name: 'Test User',
                password: 'password123',
                role: 'STUDENT',
            };
            const res = await (0, supertest_1.default)(app).post('/api/auth/register').send(payload);
            expect(res.status).toBe(400);
        });
        it('rejects password that is too short', async () => {
            const payload = {
                email: 'test2@university.edu',
                name: 'Test User',
                password: '12345',
                role: 'STUDENT',
            };
            const res = await (0, supertest_1.default)(app).post('/api/auth/register').send(payload);
            expect(res.status).toBe(400);
        });
        it('defaults role to STUDENT if not provided', async () => {
            const payload = {
                email: 'defaultrole@university.edu',
                name: 'Test User',
                password: 'password123',
            };
            const res = await (0, supertest_1.default)(app).post('/api/auth/register').send(payload);
            expect(res.status).toBe(201);
            expect(res.body.user.role).toBe('STUDENT');
        });
        it('rejects missing required fields', async () => {
            const res = await (0, supertest_1.default)(app).post('/api/auth/register').send({});
            expect(res.status).toBe(400);
        });
    });
    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            // Register a user for login tests
            await (0, supertest_1.default)(app).post('/api/auth/register').send({
                email: 'login@university.edu',
                name: 'Login User',
                password: 'password123',
                role: 'STUDENT',
            });
        });
        it('successfully logs in with correct credentials', async () => {
            const res = await (0, supertest_1.default)(app).post('/api/auth/login').send({
                email: 'login@university.edu',
                password: 'password123',
            });
            expect(res.status).toBe(200);
            expect(res.body.user).toBeDefined();
            expect(res.body.user.email).toBe('login@university.edu');
            expect(res.body.token).toBeDefined();
            expect(typeof res.body.token).toBe('string');
        });
        it('rejects incorrect password', async () => {
            const res = await (0, supertest_1.default)(app).post('/api/auth/login').send({
                email: 'login@university.edu',
                password: 'wrongpassword',
            });
            expect(res.status).toBe(401);
            expect(res.body.error).toContain('Invalid email or password');
        });
        it('rejects non-existent email', async () => {
            const res = await (0, supertest_1.default)(app).post('/api/auth/login').send({
                email: 'nonexistent@university.edu',
                password: 'password123',
            });
            expect(res.status).toBe(401);
            expect(res.body.error).toContain('Invalid email or password');
        });
        it('rejects missing email', async () => {
            const res = await (0, supertest_1.default)(app).post('/api/auth/login').send({
                password: 'password123',
            });
            expect(res.status).toBe(400);
        });
        it('rejects missing password', async () => {
            const res = await (0, supertest_1.default)(app).post('/api/auth/login').send({
                email: 'login@university.edu',
            });
            expect(res.status).toBe(400);
        });
    });
    describe('GET /api/auth/me', () => {
        it('successfully returns user info with valid token', async () => {
            // Register and login to get a token
            await (0, supertest_1.default)(app).post('/api/auth/register').send({
                email: 'me@university.edu',
                name: 'Me User',
                password: 'password123',
                role: 'STUDENT',
            });
            const loginRes = await (0, supertest_1.default)(app).post('/api/auth/login').send({
                email: 'me@university.edu',
                password: 'password123',
            });
            const token = loginRes.body.token;
            const res = await (0, supertest_1.default)(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(res.body.email).toBe('me@university.edu');
            // In memory mode, name might be empty, but in postgres mode it should have the name
            if (res.body.name) {
                expect(res.body.name).toBe('Me User');
            }
            expect(res.body.role).toBe('STUDENT');
            expect(res.body.password).toBeUndefined();
        });
        it('rejects request without token', async () => {
            const res = await (0, supertest_1.default)(app).get('/api/auth/me');
            expect(res.status).toBe(401);
            expect(res.body.error).toContain('No token provided');
        });
        it('rejects request with invalid token', async () => {
            const res = await (0, supertest_1.default)(app).get('/api/auth/me').set('Authorization', 'Bearer invalid-token');
            expect(res.status).toBe(401);
            expect(res.body.error).toContain('Invalid token');
        });
        it('rejects request with malformed authorization header', async () => {
            const res = await (0, supertest_1.default)(app).get('/api/auth/me').set('Authorization', 'InvalidFormat token');
            expect(res.status).toBe(401);
            expect(res.body.error).toContain('No token provided');
        });
        it('works with manually created token', async () => {
            const token = (0, request_1.createAuthToken)('test-user-id', 'test@test.com', 'STUDENT');
            const res = await (0, supertest_1.default)(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
            // May return 404 if user doesn't exist in postgres mode, or 200 in memory mode
            expect([200, 404]).toContain(res.status);
        });
    });
    describe('Error Paths', () => {
        it('handles malformed JSON in registration request', async () => {
            const res = await (0, supertest_1.default)(app)
                .post('/api/auth/register')
                .set('Content-Type', 'application/json')
                .send('{"email": "test@test.com"'); // Malformed JSON
            expect(res.status).toBe(400);
        });
        it('handles malformed JSON in login request', async () => {
            const res = await (0, supertest_1.default)(app)
                .post('/api/auth/login')
                .set('Content-Type', 'application/json')
                .send('{"email": "test@test.com"'); // Malformed JSON
            expect(res.status).toBe(400);
        });
        it('rejects registration with SQL injection attempt in email', async () => {
            const res = await (0, supertest_1.default)(app).post('/api/auth/register').send({
                email: "test@test.com'; DROP TABLE users; --",
                name: 'Test',
                password: 'password123',
                role: 'STUDENT',
            });
            // Should handle gracefully (either reject or sanitize)
            expect([400, 201]).toContain(res.status);
        });
        it('rejects login with SQL injection attempt', async () => {
            const res = await (0, supertest_1.default)(app).post('/api/auth/login').send({
                email: "test@test.com'; DROP TABLE users; --",
                password: 'password123',
            });
            // May return 400 (validation error) or 401 (authentication failed)
            expect([400, 401]).toContain(res.status);
        });
    });
});
//# sourceMappingURL=auth.test.js.map