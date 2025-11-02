"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
exports.createAuthToken = createAuthToken;
const server_1 = require("../../src/server");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function createApp() {
    return (0, server_1.createServer)();
}
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
/**
 * Create a JWT token for testing purposes
 */
function createAuthToken(userId, email, role) {
    return jsonwebtoken_1.default.sign({ userId, email, role }, JWT_SECRET, { expiresIn: '7d' });
}
//# sourceMappingURL=request.js.map