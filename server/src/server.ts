import { createServer } from 'http';
import { Server } from 'socket.io';
import app, { prisma } from './app';

const PORT = process.env.PORT || 5000;

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.io
const io = new Server(httpServer, {
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

    socket.on('send_message', async (data) => {
        // data = { senderId, receiverId, content }
        try {
            // Save to DB
            const message = await prisma.message.create({
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
        } catch (error) {
            console.error('Socket message error:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('User Disconnected', socket.id);
    });
});

httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
