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
exports.sendMessage = exports.getMessages = exports.getConversations = void 0;
const app_1 = require("../app");
// Get conversations (users communicated with)
const getConversations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const authReq = req;
    try {
        const userId = (_a = authReq.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        // Find users who have sent messages to me OR I have sent messages to
        const messages = yield app_1.prisma.message.findMany({
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getConversations = getConversations;
// Get messages between current user and another user
const getMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const authReq = req;
    try {
        const otherUserId = req.params.userId;
        const currentUserId = (_a = authReq.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!currentUserId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const messages = yield app_1.prisma.message.findMany({
            where: {
                OR: [
                    { senderId: currentUserId, receiverId: otherUserId },
                    { senderId: otherUserId, receiverId: currentUserId }
                ]
            },
            orderBy: { createdAt: 'asc' }
        });
        res.json(messages);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getMessages = getMessages;
// Save a new message
const sendMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const authReq = req;
    try {
        const { receiverId, content } = req.body;
        const senderId = (_a = authReq.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!senderId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const message = yield app_1.prisma.message.create({
            data: {
                senderId,
                receiverId,
                content,
            },
        });
        res.status(201).json(message);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.sendMessage = sendMessage;
