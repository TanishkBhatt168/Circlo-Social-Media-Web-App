import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/client/client';

dotenv.config();

// Use direct TCP connection to Local Prisma Postgres (Port 51214 usually)
// This avoids the prisma+postgres protocol incompatibility with pg driver
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });

import authRoutes from './routes/authRoutes';
import postRoutes from './routes/postRoutes';

import path from 'path';

const app = express();

app.use(cors());
app.use(express.json());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

import messageRoutes from './routes/messageRoutes';
app.use('/api/messages', messageRoutes);

import userRoutes from './routes/userRoutes';
app.use('/api/users', userRoutes);

import debugRoutes from './routes/debugRoutes';
app.use('/api/debug', debugRoutes);

app.get('/', (req: Request, res: Response) => {
    res.send('Circlo API is running');
});

export default app;
