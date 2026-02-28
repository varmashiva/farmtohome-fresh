import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import jwt from 'jsonwebtoken';
import User from './models/User.js';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: true, // Allow all origins for dev
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        credentials: true
    }
});

app.use(cors({
    origin: true, // Allow all origins for dev
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
}));
app.use(express.json());

// Set up io available to routes/controllers
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/upload', uploadRoutes);

// In-memory store for active administrators monitoring active sockets
export const onlineUsers = new Map();

// Socket.io connection handling
io.on('connection', async (socket) => {
    console.log('A user connected:', socket.id);

    try {
        const token = socket.handshake.auth?.token;
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');

            if (user) {
                onlineUsers.set(socket.id, {
                    userId: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    connectedAt: new Date()
                });

                // Immediately update admins unconditionally mapping new identities
                io.emit("liveUsersUpdate", Array.from(onlineUsers.values()));
            }
        }
    } catch (error) {
        console.error("Socket authentication anomaly:", error.message);
    }

    // Allow components mounting later to securely request the active list natively
    socket.on('requestLiveUsers', () => {
        socket.emit("liveUsersUpdate", Array.from(onlineUsers.values()));
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        if (onlineUsers.has(socket.id)) {
            onlineUsers.delete(socket.id);
            io.emit("liveUsersUpdate", Array.from(onlineUsers.values()));
        }
    });
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB Database FIRST before starting server
connectDB().then(() => {
    httpServer.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});
