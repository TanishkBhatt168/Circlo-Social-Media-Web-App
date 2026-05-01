import { Request, Response } from 'express';
import { prisma } from '../app';

interface AuthRequest extends Request {
    user?: {
        id: string;
        username: string;
        email: string;
    } | null;
}

// Get conversations (users communicated with)
export const getConversations = async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    try {
        const userId = authReq.user?.id;

        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        // Find users who have sent messages to me OR I have sent messages to
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: userId },
                    { receiverId: userId }
                ]
            },
            include: {
                sender: { select: { id: true, username: true, avatar: true } },
                receiver: { select: { id: true, username: true, avatar: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        const usersMap = new Map();

        messages.forEach(msg => {
            const otherUser = msg.senderId === userId ? msg.receiver : msg.sender;
            if (!usersMap.has(otherUser.id)) {
                usersMap.set(otherUser.id, otherUser);
            }
        });

        const conversations = Array.from(usersMap.values());
        res.json(conversations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get messages between current user and another user
export const getMessages = async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    try {
        const otherUserId = req.params.userId as string;
        const currentUserId = authReq.user?.id;

        if (!currentUserId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: currentUserId, receiverId: otherUserId },
                    { senderId: otherUserId, receiverId: currentUserId }
                ]
            },
            orderBy: { createdAt: 'asc' }
        });

        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Save a new message
export const sendMessage = async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    try {
        const { receiverId, content } = req.body;
        const senderId = authReq.user?.id;

        if (!senderId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const message = await prisma.message.create({
            data: {
                senderId,
                receiverId,
                content,
            },
        });

        res.status(201).json(message);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
