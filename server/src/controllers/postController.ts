import { Request, Response } from 'express';
import { prisma } from '../app';

interface AuthRequest extends Request {
    user?: {
        id: string;
        username: string;
        email: string;
    } | null;
}

// Create a new post
export const createPost = async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    try {
        const { content } = req.body;
        const authorId = authReq.user?.id;
        
        const image = req.file ? `/uploads/${req.file.filename}` : null;

        if (!content && !image) {
            res.status(400).json({ message: 'Post must contain content or an image' });
            return;
        }

        if (!authorId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const post = await prisma.post.create({
            data: {
                content,
                image,
                authorId,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true,
                    },
                },
            },
        });

        res.status(201).json(post);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Like a post
export const likePost = async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    try {
        const postId = req.params.id as string;
        const userId = authReq.user?.id;

        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const post = await prisma.post.findUnique({ where: { id: postId } });

        if (!post) {
            res.status(404).json({ message: 'Post not found' });
            return;
        }

        const existingLike = await prisma.like.findUnique({
            where: {
                userId_postId: {
                    userId,
                    postId,
                },
            },
        });

        if (existingLike) {
            await prisma.like.delete({
                where: {
                    userId_postId: {
                        userId,
                        postId,
                    },
                },
            });
            res.json({ message: 'Post unliked' });
        } else {
            await prisma.like.create({
                data: {
                    userId,
                    postId,
                },
            });
            res.json({ message: 'Post liked' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Add a comment
export const addComment = async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    try {
        const postId = req.params.id as string;
        const userId = authReq.user?.id;
        const { content } = req.body;

        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        if (!content) {
            res.status(400).json({ message: 'Comment content is required' });
            return;
        }

        const post = await prisma.post.findUnique({ where: { id: postId } });

        if (!post) {
            res.status(404).json({ message: 'Post not found' });
            return;
        }

        const comment = await prisma.comment.create({
            data: {
                content,
                postId,
                authorId: userId,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true,
                    },
                },
            },
        });

        res.status(201).json(comment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete a comment
export const deleteComment = async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    try {
        const postId = req.params.id as string;
        const commentId = req.params.commentId as string;
        const userId = authReq.user?.id;

        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const comment = await prisma.comment.findUnique({
            where: { id: commentId },
        });

        if (!comment) {
            res.status(404).json({ message: 'Comment not found' });
            return;
        }

        if (comment.authorId !== userId) {
            res.status(401).json({ message: 'User not authorized' });
            return;
        }

        await prisma.comment.delete({
            where: { id: commentId },
        });

        res.json({ message: 'Comment removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all posts
export const getPosts = async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    try {
        const userId = authReq.user?.id;
        let blockedIds: string[] = [];

        if (userId) {
            const blocks = await prisma.blocks.findMany({
                where: {
                    OR: [
                        { blockerId: userId },
                        { blockedId: userId }
                    ]
                }
            });
            blockedIds = blocks.map(b => b.blockerId === userId ? b.blockedId : b.blockerId);
        }

        const posts = await prisma.post.findMany({
            where: {
                authorId: {
                    notIn: blockedIds
                }
            },
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true,
                    },
                },
                likes: {
                    select: { userId: true }, // Include likes to check if user liked
                },
                _count: {
                    select: {
                        comments: true,
                        likes: true,
                    },
                },
            },
        });

        res.json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get a single post
export const getPost = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;

        const post = await prisma.post.findUnique({
            where: { id },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true,
                    },
                },
                likes: {
                    select: { userId: true },
                },
                comments: {
                    include: {
                        author: {
                            select: {
                                id: true,
                                username: true,
                                avatar: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
                _count: {
                    select: {
                        likes: true,
                    },
                },
            },
        });

        if (!post) {
            res.status(404).json({ message: 'Post not found' });
            return;
        }

        res.json(post);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete a post
export const deletePost = async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    try {
        const id = req.params.id as string;
        const userId = authReq.user?.id;

        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const post = await prisma.post.findUnique({
            where: { id },
        });

        if (!post) {
            res.status(404).json({ message: 'Post not found' });
            return;
        }

        if (post.authorId !== userId) {
            res.status(401).json({ message: 'User not authorized to delete this post' });
            return;
        }

        await prisma.post.delete({
            where: { id },
        });

        res.json({ message: 'Post removed' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
