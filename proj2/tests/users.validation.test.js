"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const request_1 = require("./helpers/request");
const app = (0, request_1.createApp)();
describe('Users API - validation', () => {
    const invalidUsers = [
        {},
        { email: 'not-an-email', name: 'x', role: 'STUDENT' },
        { email: 'a@b.com', role: 'STUDENT' },
        { email: 'a@b.com', name: 'x' },
        { email: 'a@b.com', name: 'x', role: 'UNKNOWN' },
    ];
    test.each(invalidUsers.map((p, i) => [i, p]))('rejects invalid user create %p', async (_i, payload) => {
        const res = await (0, supertest_1.default)(app).post('/api/users').send(payload);
        expect(res.status).toBe(400);
    });
    const roles = ['STUDENT', 'VENDOR', 'ADMIN', 'ENGINEER'];
    test.each(roles.map((r) => [r]))('creates user with role %p', async (role) => {
        const res = await (0, supertest_1.default)(app)
            .post('/api/users')
            .send({ email: `${role.toLowerCase()}@u.edu`, name: `${role}-User`, role });
        expect(res.status).toBe(201);
    });
    const n = Array.from({ length: 25 }).map((_, i) => i + 1);
    test.each(n.map((i) => [i]))('updates user variant #%p', async (i) => {
        const create = await (0, supertest_1.default)(app)
            .post('/api/users')
            .send({ email: `u${i}@u.edu`, name: `User ${i}`, role: 'STUDENT' });
        const id = create.body.id;
        const patch = await (0, supertest_1.default)(app).patch(`/api/users/${id}`).send({ name: `User ${i}X` });
        expect(patch.status).toBe(200);
        expect(patch.body.name).toBe(`User ${i}X`);
    });
});
//# sourceMappingURL=users.validation.test.js.map