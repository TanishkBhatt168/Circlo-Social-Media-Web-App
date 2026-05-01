import { Request, Response } from 'express';
import { prisma } from '../app';

interface AuthRequest extends Request {
    user?: {
        id: string;
        username: string;
        email: string;
    } | null;
}

// Get User Profile
export const getUserProfile = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        console.log('Fetching profile for ID:', id);

        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                username: true,
                bio: true,
                avatar: true,
                createdAt: true,
                followers: {
                    select: { followerId: true }
                },
                blockedBy: {
                    select: { blockerId: true }
                },
                _count: {
                    select: {
                        posts: true,
                        followers: true,
                        following: true,
                    }
                },
                posts: {
                    orderBy: { createdAt: 'desc' },
                    include: {
                        author: {
                            select: { id: true, username: true, avatar: true }
                        },
                        likes: { select: { userId: true } },
                        _count: { select: { likes: true, comments: true } }
                    }
                }
            }
        });

        if (!user) {
            console.log('User not found in DB for ID:', id);
            res.status(404).json({ message: 'User not found' });
            return;
        }

        console.log('User found:', user.username);
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Follow User
export const followUser = async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    try {
        const followingId = req.params.id as string; // ID of user to follow
        const followerId = authReq.user?.id;

        if (!followerId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        if (followerId === followingId) {
            res.status(400).json({ message: 'Cannot follow yourself' });
            return;
        }

        await prisma.follows.create({
            data: {
                followerId,
                followingId
            }
        });

        res.json({ message: 'Followed successfully' });
    } catch (error) {
        console.error(error);
        // Check for unique constraint violation (already following)
        res.status(500).json({ message: 'Server error' });
    }
};

// Unfollow User
export const unfollowUser = async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    try {
        const followingId = req.params.id as string;
        const followerId = authReq.user?.id;

        if (!followerId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        await prisma.follows.delete({
            where: {
                followerId_followingId: {
                    followerId,
                    followingId
                }
            }
        });

        res.json({ message: 'Unfollowed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Search Users
export const searchUsers = async (req: Request, res: Response) => {
    try {
        const q = req.query.q as string;

        if (!q || typeof q !== 'string') {
            res.status(400).json({ message: 'Query parameter required' });
            return;
        }

        const users = await prisma.user.findMany({
            where: {
                username: {
                    contains: q,
                    mode: 'insensitive'
                }
            },
            select: {
                id: true,
                username: true,
                avatar: true,
                bio: true
            },
            take: 10
        });

        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update Profile Photo
export const updateProfilePhoto = async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    try {
        const id = req.params.id as string;
        const userId = authReq.user?.id;

        if (!userId || userId !== id) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        if (!req.file) {
            res.status(400).json({ message: 'No image file provided' });
            return;
        }

        const avatarUrl = `/uploads/${req.file.filename}`;

        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                avatar: avatarUrl
            },
            select: {
                id: true,
                username: true,
                avatar: true,
                bio: true
            }
        });

        res.json(updatedUser);
    } catch (error) {
        console.error('Error updating profile photo:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Block User
export const blockUser = async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    try {
        const blockedId = req.params.id as string;
        const blockerId = authReq.user?.id;

        if (!blockerId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        if (blockerId === blockedId) {
            res.status(400).json({ message: 'Cannot block yourself' });
            return;
        }

        await prisma.$transaction([
            // Create block
            prisma.blocks.create({
                data: { blockerId, blockedId }
            }),
            // Delete follows both ways if they exist
            prisma.follows.deleteMany({
                where: {
                    OR: [
                        { followerId: blockerId, followingId: blockedId },
                        { followerId: blockedId, followingId: blockerId }
                    ]
                }
            })
        ]);

        res.json({ message: 'Blocked successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Unblock User
export const unblockUser = async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    try {
        const blockedId = req.params.id as string;
        const blockerId = authReq.user?.id;

        if (!blockerId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        await prisma.blocks.delete({
            where: {
                blockerId_blockedId: { blockerId, blockedId }
            }
        });

        res.json({ message: 'Unblocked successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
