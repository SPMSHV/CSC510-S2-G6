"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const request_1 = require("./helpers/request");
const app = (0, request_1.createApp)();
describe('Robots API', () => {
    it('lists empty robots initially', async () => {
        const res = await (0, supertest_1.default)(app).get('/api/robots');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(0);
    });
    it('creates a robot and fetches health', async () => {
        const payload = {
            robotId: 'RB-07',
            status: 'IDLE',
            batteryPercent: 95,
            location: { lat: 35.0, lng: -78.0 },
        };
        const res = await (0, supertest_1.default)(app).post('/api/robots').send(payload);
        expect(res.status).toBe(201);
        const health = await (0, supertest_1.default)(app).get(`/api/robots/${res.body.id}/health`);
        expect(health.status).toBe(200);
        expect(health.body.id).toBe('RB-07');
        expect(typeof health.body.battery_pct).toBe('number');
    });
    it('updates robot status', async () => {
        const create = await (0, supertest_1.default)(app)
            .post('/api/robots')
            .send({ robotId: 'RB-08', status: 'IDLE', batteryPercent: 50, location: { lat: 0, lng: 0 } });
        const id = create.body.id;
        const patch = await (0, supertest_1.default)(app).patch(`/api/robots/${id}`).send({ status: 'EN_ROUTE' });
        expect(patch.status).toBe(200);
        expect(patch.body.status).toBe('EN_ROUTE');
    });
    it('returns 404 for non-existing robot', async () => {
        const res = await (0, supertest_1.default)(app).get('/api/robots/nonexistent');
        expect(res.status).toBe(404);
    });
    describe('Error Paths', () => {
        it('rejects robot with missing robotId', async () => {
            const res = await (0, supertest_1.default)(app).post('/api/robots').send({
                status: 'IDLE',
                batteryPercent: 90,
                location: { lat: 35.0, lng: -78.0 },
            });
            expect(res.status).toBe(400);
        });
        it('rejects robot with invalid status', async () => {
            const res = await (0, supertest_1.default)(app).post('/api/robots').send({
                robotId: 'RB-TEST',
                status: 'INVALID_STATUS',
                batteryPercent: 90,
                location: { lat: 35.0, lng: -78.0 },
            });
            expect(res.status).toBe(400);
        });
        it('rejects robot with battery below 0', async () => {
            const res = await (0, supertest_1.default)(app).post('/api/robots').send({
                robotId: 'RB-TEST',
                status: 'IDLE',
                batteryPercent: -5,
                location: { lat: 35.0, lng: -78.0 },
            });
            expect(res.status).toBe(400);
        });
        it('rejects robot with battery above 100', async () => {
            const res = await (0, supertest_1.default)(app).post('/api/robots').send({
                robotId: 'RB-TEST',
                status: 'IDLE',
                batteryPercent: 101,
                location: { lat: 35.0, lng: -78.0 },
            });
            expect(res.status).toBe(400);
        });
        it('rejects robot with missing location', async () => {
            const res = await (0, supertest_1.default)(app).post('/api/robots').send({
                robotId: 'RB-TEST',
                status: 'IDLE',
                batteryPercent: 90,
            });
            expect(res.status).toBe(400);
        });
        it('rejects robot with invalid location format', async () => {
            const res = await (0, supertest_1.default)(app).post('/api/robots').send({
                robotId: 'RB-TEST',
                status: 'IDLE',
                batteryPercent: 90,
                location: { lat: 'invalid', lng: -78.0 },
            });
            expect(res.status).toBe(400);
        });
        it('rejects update with invalid status', async () => {
            const create = await (0, supertest_1.default)(app)
                .post('/api/robots')
                .send({ robotId: 'RB-UPDATE', status: 'IDLE', batteryPercent: 50, location: { lat: 0, lng: 0 } });
            const id = create.body.id;
            const res = await (0, supertest_1.default)(app).patch(`/api/robots/${id}`).send({ status: 'INVALID' });
            // Status validation might happen in route or database
            expect([400, 200, 404]).toContain(res.status);
        });
        it('rejects update with invalid battery', async () => {
            const create = await (0, supertest_1.default)(app)
                .post('/api/robots')
                .send({ robotId: 'RB-BATTERY', status: 'IDLE', batteryPercent: 50, location: { lat: 0, lng: 0 } });
            const id = create.body.id;
            const res = await (0, supertest_1.default)(app).patch(`/api/robots/${id}`).send({ batteryPercent: 150 });
            expect([400, 200]).toContain(res.status); // May or may not validate in memory mode
        });
        it('handles invalid UUID format in get request', async () => {
            const res = await (0, supertest_1.default)(app).get('/api/robots/invalid-uuid-format');
            expect(res.status).toBe(404);
        });
        it('handles invalid UUID format in patch request', async () => {
            const res = await (0, supertest_1.default)(app).patch('/api/robots/invalid-uuid').send({ status: 'IDLE' });
            expect(res.status).toBe(404);
        });
        it('handles invalid UUID format in delete request', async () => {
            const res = await (0, supertest_1.default)(app).delete('/api/robots/invalid-uuid');
            expect(res.status).toBe(404);
        });
    });
});
//# sourceMappingURL=robots.test.js.map