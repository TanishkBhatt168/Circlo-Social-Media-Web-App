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
exports.updateProfilePhoto = exports.searchUsers = exports.unfollowUser = exports.followUser = exports.getUserProfile = void 0;
const app_1 = require("../app");
// Get User Profile
const getUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        console.log('Fetching profile for ID:', id);
        const user = yield app_1.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                username: true,
                bio: true,
                avatar: true,
                createdAt: true,
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getUserProfile = getUserProfile;
// Follow User
const followUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const authReq = req;
    try {
        const followingId = req.params.id; // ID of user to follow
        const followerId = (_a = authReq.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!followerId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        if (followerId === followingId) {
            res.status(400).json({ message: 'Cannot follow yourself' });
            return;
        }
        yield app_1.prisma.follows.create({
            data: {
                followerId,
                followingId
            }
        });
        res.json({ message: 'Followed successfully' });
    }
    catch (error) {
        console.error(error);
        // Check for unique constraint violation (already following)
        res.status(500).json({ message: 'Server error' });
    }
});
exports.followUser = followUser;
// Unfollow User
const unfollowUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const authReq = req;
    try {
        const followingId = req.params.id;
        const followerId = (_a = authReq.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!followerId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        yield app_1.prisma.follows.delete({
            where: {
                followerId_followingId: {
                    followerId,
                    followingId
                }
            }
        });
        res.json({ message: 'Unfollowed successfully' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.unfollowUser = unfollowUser;
// Search Users
const searchUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const q = req.query.q;
        if (!q || typeof q !== 'string') {
            res.status(400).json({ message: 'Query parameter required' });
            return;
        }
        const users = yield app_1.prisma.user.findMany({
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.searchUsers = searchUsers;
// Update Profile Photo
const updateProfilePhoto = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const authReq = req;
    try {
        const id = req.params.id;
        const userId = (_a = authReq.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId || userId !== id) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        if (!req.file) {
            res.status(400).json({ message: 'No image file provided' });
            return;
        }
        const avatarUrl = `/uploads/${req.file.filename}`;
        const updatedUser = yield app_1.prisma.user.update({
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
    }
    catch (error) {
        console.error('Error updating profile photo:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.updateProfilePhoto = updateProfilePhoto;
