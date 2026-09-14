const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { connectDB } = require('./config/db');
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');
const { verifyJWT } = require('./middleware/auth');
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] } });

app.use(cors());
app.use(express.json());

// Serve the actual DChat website from the same Render service.
app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/auth', authRoutes);
app.use('/messages', verifyJWT, messageRoutes);

// Track live Socket.IO connections by user ID.
// A user is online only while at least one of their chat tabs is connected.
const onlineUsers = new Map();

function broadcastPresence() {
  io.emit('presence:update', Array.from(onlineUsers.keys()));
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('presence:join', (userId) => {
    if (!userId || typeof userId !== 'string') return;
    socket.data.userId = userId;
    onlineUsers.set(userId, (onlineUsers.get(userId) || 0) + 1);
    broadcastPresence();
  });

  socket.on('chat message', (msg, ack) => {
    try {
      if (!msg || typeof msg.text !== 'string' || !msg.text.trim()) {
        if (typeof ack === 'function') ack({ ok: false, error: 'Message text is required' });
        return;
      }
      const newMsg = Message.createMessage({
        text: msg.text,
        user: msg.user || null,
        clientMessageId: msg.clientMessageId || null
      });
      socket.broadcast.emit('chat message', newMsg);
      if (typeof ack === 'function') ack({ ok: true, message: newMsg });
    } catch (error) {
      console.error('chat message error:', error);
      if (typeof ack === 'function') ack({ ok: false, error: 'Failed to send message' });
    }
  });

  socket.on('disconnect', () => {
    const userId = socket.data.userId;
    if (userId) {
      const count = (onlineUsers.get(userId) || 1) - 1;
      if (count <= 0) onlineUsers.delete(userId);
      else onlineUsers.set(userId, count);
      broadcastPresence();
    }
    console.log('User disconnected:', socket.id);
  });
});

const PORT = Number(process.env.PORT) || 3000;

async function start() {
  try {
    await connectDB();
    server.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error('Startup error:', error);
    process.exit(1);
  }
}

start();
