import express from 'express';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/client/client';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 5001;

console.log('Initializing DB...');
const originalConnectionString = `${process.env.DATABASE_URL}`;
console.log('Original Connection String:', originalConnectionString);

// Use the original string first to test if it crashes
const connectionString = originalConnectionString;
// const connectionString = originalConnectionString.replace('prisma+postgres://', 'postgres://');

console.log('Using Connection String:', connectionString);

try {
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });
    console.log('DB Initialized (Pool created, not connected yet)');

    // Try to connect explicitely to trigger potential error
    pool.connect().then(client => {
        console.log('Pool connected successfully');
        client.release();
    }).catch(err => {
        console.error('Pool connection error:', err);
    });

} catch (e) {
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
