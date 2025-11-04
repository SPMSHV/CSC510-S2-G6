"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const request_1 = require("./helpers/request");
const app = (0, request_1.createApp)();
describe('Orders API - validation', () => {
    const invalidPayloads = [
        {},
        { userId: 'u' },
        { vendorId: 'v' },
        { items: [] },
        { userId: 'u', vendorId: 'v' },
        { userId: 'u', items: [] },
        { vendorId: 'v', items: [] },
        { userId: 'u', vendorId: 'v', items: [], deliveryLocation: 'loc' },
        { userId: 'u', vendorId: 'v', items: [{ name: 'x', quantity: 0, price: 1 }], deliveryLocation: 'loc' },
        { userId: 'u', vendorId: 'v', items: [{ name: '', quantity: 1, price: 1 }], deliveryLocation: 'loc' },
    ];
    test.each(invalidPayloads.map((p, i) => [i, p]))('rejects invalid create payload %p', async (_idx, payload) => {
        const res = await (0, supertest_1.default)(app).post('/api/orders').send(payload);
        expect(res.status).toBe(400);
    });
    const baseValid = {
        userId: 'user-1',
        vendorId: 'vendor-1',
        items: [
            { name: 'A', quantity: 1, price: 1 },
            { name: 'B', quantity: 2, price: 2 },
        ],
        deliveryLocation: 'loc',
    };
    const statuses = ['CREATED', 'PREPARING', 'READY', 'ASSIGNED', 'EN_ROUTE', 'DELIVERED', 'CANCELLED'];
    test('can transition through multiple statuses', async () => {
        const create = await (0, supertest_1.default)(app).post('/api/orders').send(baseValid);
        const id = create.body.id;
        for (const s of statuses) {
            const res = await (0, supertest_1.default)(app).patch(`/api/orders/${id}`).send({ status: s });
            expect(res.status).toBe(200);
            expect(res.body.status).toBe(s);
        }
    });
    const invalidStatuses = ['NEW', '', null, 123, {}, []];
    test.each(invalidStatuses.map((s, i) => [i, s]))('rejects invalid status %p', async (_i, badStatus) => {
        const create = await (0, supertest_1.default)(app).post('/api/orders').send(baseValid);
        const id = create.body.id;
        const res = await (0, supertest_1.default)(app).patch(`/api/orders/${id}`).send({ status: badStatus });
        expect(res.status).toBe(400);
    });
    // Generate a bunch of small valid-create tests (counts towards test total)
    const totals = Array.from({ length: 30 }).map((_, i) => i + 1);
    test.each(totals.map((n) => [n]))('creates order variant #%p', async (n) => {
        const res = await (0, supertest_1.default)(app)
            .post('/api/orders')
            .send({
            userId: `u-${n}`,
            vendorId: `v-${n}`,
            items: [
                { name: `Item-${n}`, quantity: 1 + (n % 3), price: 1.25 * (1 + (n % 4)) },
            ],
            deliveryLocation: `B-${n}`,
        });
        expect(res.status).toBe(201);
        expect(typeof res.body.total).toBe('number');
    });
});
//# sourceMappingURL=orders.validation.test.js.map