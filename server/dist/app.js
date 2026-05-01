"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const pg_1 = require("pg");
const adapter_pg_1 = require("@prisma/adapter-pg");
const client_1 = require("./generated/client/client");
dotenv_1.default.config();
// Use direct TCP connection to Local Prisma Postgres (Port 51214 usually)
// This avoids the prisma+postgres protocol incompatibility with pg driver
const connectionString = process.env.DATABASE_URL;
const pool = new pg_1.Pool({ connectionString });
const adapter = new adapter_pg_1.PrismaPg(pool);
exports.prisma = new client_1.PrismaClient({ adapter });
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const postRoutes_1 = __importDefault(require("./routes/postRoutes"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Serve static files from the uploads directory
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Request logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});
app.use('/api/auth', authRoutes_1.default);
app.use('/api/posts', postRoutes_1.default);
const messageRoutes_1 = __importDefault(require("./routes/messageRoutes"));
app.use('/api/messages', messageRoutes_1.default);
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
app.use('/api/users', userRoutes_1.default);
const debugRoutes_1 = __importDefault(require("./routes/debugRoutes"));
app.use('/api/debug', debugRoutes_1.default);
app.get('/', (req, res) => {
    res.send('Circlo API is running');
});
exports.default = app;
