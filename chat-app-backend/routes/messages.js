const express = require('express');
const Message = require('../models/Message');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: 1 }).limit(200);
    res.json(messages);
  } catch (error) {
    console.error('Load messages error:', error);
    res.status(500).json({ error: 'Failed to load messages' });
  }
});

router.post('/', async (req, res) => {
  try {
    const text = typeof req.body.text === 'string' ? req.body.text.trim() : '';
    const clientMessageId = typeof req.body.clientMessageId === 'string'
      ? req.body.clientMessageId.trim()
      : '';

    if (!text) return res.status(400).json({ error: 'Message text is required' });

    if (clientMessageId) {
      const existing = await Message.findOne({ clientMessageId });
      if (existing) return res.status(200).json(existing);
    }

    const message = await Message.create({
      text,
      user: req.user?.id || req.user?.username || null,
      clientMessageId: clientMessageId || null
    });

    res.status(201).json(message);
  } catch (error) {
    console.error('Create message error:', error);
    res.status(500).json({ error: 'Failed to create message' });
  }
});

module.exports = router;
