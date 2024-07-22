"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jwt_1 = require("hono/jwt");
const secretKey = "ENV_JWT_SECRET_KEY";
const payload = {
    sub: "test_user",
    exp: Math.floor(Date.now() / 1000) + 60 * 30, // 30min
};
const generateToken = async () => { return await (0, jwt_1.sign)(payload, secretKey); };
exports.default = generateToken;
