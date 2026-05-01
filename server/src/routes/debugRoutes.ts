import { Router } from 'express';
import { prisma } from '../app';

const router = Router();

router.get('/db', async (req, res) => {
    try {
        await prisma.$connect();
        const userCount = await prisma.user.count();
        res.json({ status: 'ok', message: 'Database connected', userCount });
    } catch (error: any) {
        console.error('DB Debug Error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message,
            stack: error.stack
        });
    }
});

export default router;
