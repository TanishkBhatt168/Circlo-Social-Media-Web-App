"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const pg_1 = require("pg");
const adapter_pg_1 = require("@prisma/adapter-pg");
const client_1 = require("./generated/client/client");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = 5001;
console.log('Initializing DB...');
const originalConnectionString = `${process.env.DATABASE_URL}`;
console.log('Original Connection String:', originalConnectionString);
// Use the original string first to test if it crashes
const connectionString = originalConnectionString;
// const connectionString = originalConnectionString.replace('prisma+postgres://', 'postgres://');
console.log('Using Connection String:', connectionString);
try {
    const pool = new pg_1.Pool({ connectionString });
    const adapter = new adapter_pg_1.PrismaPg(pool);
    const prisma = new client_1.PrismaClient({ adapter });
    console.log('DB Initialized (Pool created, not connected yet)');
    // Try to connect explicitely to trigger potential error
    pool.connect().then(client => {
        console.log('Pool connected successfully');
        client.release();
    }).catch(err => {
        console.error('Pool connection error:', err);
    });
}
catch (e) {
    console.error('Error during DB init:', e);
}
app.get('/', (req, res) => {
    res.send('Minimal server is running');
});
app.listen(PORT, () => {
    console.log(`Minimal server running on port ${PORT}`);
});
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
