"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const request_1 = require("./helpers/request");
const app = (0, request_1.createApp)();
describe('Users API', () => {
    it('lists empty users initially', async () => {
        const res = await (0, supertest_1.default)(app).get('/api/users');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(0);
    });
    it('creates a user', async () => {
        const res = await (0, supertest_1.default)(app)
            .post('/api/users')
            .send({ email: 'student@university.edu', name: 'Student', role: 'STUDENT' });
        expect(res.status).toBe(201);
        expect(res.body.email).toBe('student@university.edu');
    });
    it('rejects invalid user', async () => {
        const res = await (0, supertest_1.default)(app).post('/api/users').send({});
        expect(res.status).toBe(400);
    });
    it('updates a user', async () => {
        const create = await (0, supertest_1.default)(app)
            .post('/api/users')
            .send({ email: 'eng@university.edu', name: 'Eng', role: 'ENGINEER' });
        const id = create.body.id;
        const patch = await (0, supertest_1.default)(app).patch(`/api/users/${id}`).send({ name: 'Engineer' });
        expect(patch.status).toBe(200);
        expect(patch.body.name).toBe('Engineer');
    });
    it('returns 404 for non-existing user', async () => {
        const res = await (0, supertest_1.default)(app).get('/api/users/nonexistent');
        expect(res.status).toBe(404);
    });
    describe('Error Paths', () => {
        it('rejects user with invalid email format', async () => {
            const res = await (0, supertest_1.default)(app).post('/api/users').send({
                email: 'not-an-email',
                name: 'Test',
                role: 'STUDENT',
            });
            expect(res.status).toBe(400);
        });
        it('rejects user with empty name', async () => {
            const res = await (0, supertest_1.default)(app).post('/api/users').send({
                email: 'test@test.com',
                name: '',
                role: 'STUDENT',
            });
            expect(res.status).toBe(400);
        });
        it('rejects user with name too short', async () => {
            const res = await (0, supertest_1.default)(app).post('/api/users').send({
                email: 'test@test.com',
                name: 'A',
                role: 'STUDENT',
            });
            expect(res.status).toBe(400);
        });
        it('rejects user with invalid role', async () => {
            const res = await (0, supertest_1.default)(app).post('/api/users').send({
                email: 'test@test.com',
                name: 'Test User',
                role: 'INVALID_ROLE',
            });
            expect(res.status).toBe(400);
        });
        it('rejects update with invalid email format', async () => {
            const create = await (0, supertest_1.default)(app)
                .post('/api/users')
                .send({ email: 'update@test.com', name: 'Test', role: 'STUDENT' });
            const id = create.body.id;
            const res = await (0, supertest_1.default)(app).patch(`/api/users/${id}`).send({ email: 'invalid-email' });
            expect(res.status).toBe(400);
        });
        it('rejects update with empty payload', async () => {
            const create = await (0, supertest_1.default)(app)
                .post('/api/users')
                .send({ email: 'empty@test.com', name: 'Test', role: 'STUDENT' });
            const id = create.body.id;
            const res = await (0, supertest_1.default)(app).patch(`/api/users/${id}`).send({});
            expect(res.status).toBe(400);
        });
        it('handles invalid UUID format in get request', async () => {
            const res = await (0, supertest_1.default)(app).get('/api/users/invalid-uuid-format');
            expect(res.status).toBe(404);
        });
        it('handles invalid UUID format in patch request', async () => {
            const res = await (0, supertest_1.default)(app).patch('/api/users/invalid-uuid').send({ name: 'Test' });
            expect(res.status).toBe(404);
        });
        it('handles invalid UUID format in delete request', async () => {
            const res = await (0, supertest_1.default)(app).delete('/api/users/invalid-uuid');
            expect(res.status).toBe(404);
        });
    });
});
//# sourceMappingURL=users.test.js.map