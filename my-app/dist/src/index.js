"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_server_1 = require("@hono/node-server");
const hono_1 = require("hono");
const api_1 = __importDefault(require("./api"));
const app = new hono_1.Hono();
// NOT FOUND
app.notFound((c) => {
    return c.text('Custom 404 Message', 404);
});
app.route("/api", api_1.default);
const port = 3000;
console.log(`Server is running on port ${port}`);
exports.default = app;
if (process.env.NODE_ENV !== 'test') {
    (0, node_server_1.serve)(app);
}
