const express = require('express');
const Message = require('../models/Message');

const router = express.Router();

router.get('/', (req, res) => {
  try {
    res.json(Message.getMessages(200));
  } catch (error) {
    console.error('Load messages error:', error);
    res.status(500).json({ error: 'Failed to load messages' });
  }
});

router.post('/', (req, res) => {
  try {
    const text = typeof req.body.text === 'string' ? req.body.text.trim() : '';
    const clientMessageId = typeof req.body.clientMessageId === 'string' ? req.body.clientMessageId.trim() : '';
    if (!text) return res.status(400).json({ error: 'Message text is required' });
    const message = Message.createMessage({ text, user: req.user?.id || req.user?.username || req.body.user || null, clientMessageId });
    res.status(201).json(message);
  } catch (error) {
    console.error('Create message error:', error);
    res.status(500).json({ error: 'Failed to create message' });
  }
});

module.exports = router;
