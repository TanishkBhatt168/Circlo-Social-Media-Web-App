"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const app_1 = __importStar(require("./app"));
const PORT = process.env.PORT || 5000;
// Create HTTP server
const httpServer = (0, http_1.createServer)(app_1.default);
// Initialize Socket.io
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: "http://localhost:5173", // Allow frontend (update if port changes)
        methods: ["GET", "POST"]
    }
});
io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);
    socket.on('join_room', (userId) => {
        socket.join(userId); // Join a room with their own User ID
        console.log(`User with ID: ${socket.id} joined room: ${userId}`);
    });
    socket.on('send_message', (data) => __awaiter(void 0, void 0, void 0, function* () {
        // data = { senderId, receiverId, content }
        try {
            // Save to DB
            const message = yield app_1.prisma.message.create({
                data: {
                    senderId: data.senderId,
                    receiverId: data.receiverId,
                    content: data.content,
                    read: false
                },
                include: {
                    sender: { select: { id: true, username: true, avatar: true } }
                }
            });
            // Emit to the receiver's room
            socket.to(data.receiverId).emit('receive_message', message);
            // Verify sending back to sender for confirmation if needed, 
            // but usually sender updates UI optimistically or via this ack
        }
        catch (error) {
            console.error('Socket message error:', error);
        }
    }));
    socket.on('disconnect', () => {
        console.log('User Disconnected', socket.id);
    });
});
httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
