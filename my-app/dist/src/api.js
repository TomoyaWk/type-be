"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const hono_1 = require("hono");
const prisma_1 = __importDefault(require("./prisma"));
const bcrypt = __importStar(require("bcryptjs"));
const jwt_1 = require("hono/jwt");
const jwt_2 = require("hono/utils/jwt");
const api = new hono_1.Hono();
//Auth
api.post("/signup", async (c) => {
    const req = await c.req.json();
    const hashed = await bcrypt.hash(req?.password, 10);
    const user = await prisma_1.default.user.create({
        data: {
            name: req?.name,
            email: req?.email,
            password: hashed,
        }
    });
    return c.json(user, 200);
});
api.post("/login", async (c) => {
    try {
        const req = await c.req.json();
        const user = await prisma_1.default.user.findFirst({ where: {
                email: req?.email,
            } });
        if (!user) {
            throw new Error;
        }
        const isPasswordOk = bcrypt.compare(req?.password, user?.password);
        if (!isPasswordOk) {
            throw new Error;
        }
        const payload = {
            id: user.id
        };
        //return token
        const token = await jwt_2.Jwt.sign(payload, "ENV_SECRET_KEY");
        return c.json({ token }, 200);
    }
    catch {
        return c.text("authenticate failed.", 401);
    }
});
api.use("/todos/*", (0, jwt_1.jwt)({ secret: "ENV_SECRET_KEY" }));
// todo CRUD
api.get("/todos", async (c) => {
    /**
     * Get List
     */
    const tasks = await prisma_1.default.task.findMany({ orderBy: { id: "asc" } });
    return c.json(tasks, 200);
}).post("/todos", async (c) => {
    /**
     * Create
     */
    const req = await c.req.json();
    const created = await prisma_1.default.task.create({
        data: {
            title: req.title,
            content: req.content,
            isDone: false,
        }
    });
    return c.text(`created todos => id: ${created.id} title: ${created.title}`, 201);
});
api.get("/todos/:id", async (c) => {
    /**
     * get one
     */
    const t_id = Number(c.req.param("id"));
    const task = await prisma_1.default.task.findFirst({
        where: { id: t_id }
    });
    // Not Found
    if (task == null) {
        return c.text("task not found.", 404);
    }
    return c.json(task, 200);
}).put("/todos/:id", async (c) => {
    /**
     * Update
     */
    const t_id = Number(c.req.param("id"));
    const req = await c.req.json();
    const task = await prisma_1.default.task.findFirst({
        where: { id: t_id }
    });
    // Not Found
    if (task == null) {
        return c.status(404);
    }
    const updated = await prisma_1.default.task.update({
        where: { id: task.id },
        data: req,
    });
    return c.json(updated, 200);
}).delete("/todos/:id", async (c) => {
    /**
     * DELETE
     */
    const t_id = Number(c.req.param("id"));
    const task = await prisma_1.default.task.findFirst({
        where: {
            id: t_id
        }
    });
    // Not Found
    if (task == null) {
        return c.status(404);
    }
    const del = await prisma_1.default.task.delete({
        where: { id: task.id },
    });
    return c.text(`id:${del.id} todo is deleted!`, 200);
});
exports.default = api;
