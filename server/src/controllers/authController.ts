import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../app';

const generateToken = (id: string) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d',
    });
};

export const register = async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            res.status(400).json({ message: 'Please add all fields' });
            return;
        }

        const userExists = await prisma.user.findFirst({
            where: { OR: [{ email }, { username }] },
        });

        if (userExists) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
            },
        });

        res.status(201).json({
            id: user.id,
            username: user.username,
            email: user.email,
            token: generateToken(user.id),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ message: 'Please add all fields' });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                id: user.id,
                username: user.username,
                email: user.email,
                token: generateToken(user.id),
            });
        } else {
            res.status(400).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
