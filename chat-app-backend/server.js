const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const redisClient = require('./config/redis');
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');
const { verifyJWT } = require('./middleware/auth');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.json());
app.use('/auth', authRoutes);
app.use('/messages', verifyJWT, messageRoutes);

// Socket.IO for real-time chat
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('chat message', async (msg) => {
    // Save to MongoDB
    const Message = require('./models/Message');
    const newMsg = new Message({ text: msg.text, user: msg.user });
    await newMsg.save();

    // Publish to Redis for scaling
    redisClient.publish('chat_channel', JSON.stringify(newMsg));

    io.emit('chat message', newMsg);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(3000, () => console.log('Server running on port 3000'));
