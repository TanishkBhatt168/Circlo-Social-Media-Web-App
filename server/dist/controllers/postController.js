"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPost = exports.getPosts = exports.deleteComment = exports.addComment = exports.likePost = exports.createPost = void 0;
const app_1 = require("../app");
// Create a new post
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const authReq = req;
    try {
        const { content, image } = req.body;
        const authorId = (_a = authReq.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!content && !image) {
            res.status(400).json({ message: 'Post must contain content or an image' });
            return;
        }
        if (!authorId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const post = yield app_1.prisma.post.create({
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.createPost = createPost;
// Like a post
const likePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const authReq = req;
    try {
        const postId = req.params.id;
        const userId = (_a = authReq.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const post = yield app_1.prisma.post.findUnique({ where: { id: postId } });
        if (!post) {
            res.status(404).json({ message: 'Post not found' });
            return;
        }
        const existingLike = yield app_1.prisma.like.findUnique({
            where: {
                userId_postId: {
                    userId,
                    postId,
                },
            },
        });
        if (existingLike) {
            yield app_1.prisma.like.delete({
                where: {
                    userId_postId: {
                        userId,
                        postId,
                    },
                },
            });
            res.json({ message: 'Post unliked' });
        }
        else {
            yield app_1.prisma.like.create({
                data: {
                    userId,
                    postId,
                },
            });
            res.json({ message: 'Post liked' });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.likePost = likePost;
// Add a comment
const addComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const authReq = req;
    try {
        const postId = req.params.id;
        const userId = (_a = authReq.user) === null || _a === void 0 ? void 0 : _a.id;
        const { content } = req.body;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        if (!content) {
            res.status(400).json({ message: 'Comment content is required' });
            return;
        }
        const post = yield app_1.prisma.post.findUnique({ where: { id: postId } });
        if (!post) {
            res.status(404).json({ message: 'Post not found' });
            return;
        }
        const comment = yield app_1.prisma.comment.create({
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.addComment = addComment;
// Delete a comment
const deleteComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const authReq = req;
    try {
        const postId = req.params.id;
        const commentId = req.params.commentId;
        const userId = (_a = authReq.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const comment = yield app_1.prisma.comment.findUnique({
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
        yield app_1.prisma.comment.delete({
            where: { id: commentId },
        });
        res.json({ message: 'Comment removed' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.deleteComment = deleteComment;
// Get all posts
const getPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const posts = yield app_1.prisma.post.findMany({
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getPosts = getPosts;
// Get a single post
const getPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const post = yield app_1.prisma.post.findUnique({
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getPost = getPost;
