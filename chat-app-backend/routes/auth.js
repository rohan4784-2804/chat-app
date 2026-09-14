const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verifyJWT } = require('../middleware/auth');

const router = express.Router();

function makeToken(user) {
  return jwt.sign({ id: user.id, username: user.username, email: user.email }, process.env.JWT_SECRET || 'change-this-secret', { expiresIn: '7d' });
}

router.post('/register', async (req, res) => {
  try {
    const username = typeof req.body.username === 'string' ? req.body.username.trim() : '';
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    if (!username || !email || !password) return res.status(400).json({ error: 'Username, email and password are required' });
    if (username.length < 3 || username.length > 30) return res.status(400).json({ error: 'Username must be 3-30 characters' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    if (User.findByUsername(username) || User.findByEmail(email)) return res.status(409).json({ error: 'Username or email is already registered' });
    const passwordHash = await bcrypt.hash(password, 12);
    const user = User.createUser({ username, email, passwordHash });
    res.status(201).json({ message: 'Registration successful', token: makeToken(user), user: { id: user.id, username: user.username, email: user.email } });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const identifier = typeof req.body.identifier === 'string' ? req.body.identifier.trim() : (typeof req.body.email === 'string' ? req.body.email.trim() : '');
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    if (!identifier || !password) return res.status(400).json({ error: 'Email/username and password are required' });
    const user = User.findByEmail(identifier) || User.findByUsername(identifier);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ error: 'Invalid login details' });
    res.json({ message: 'Login successful', token: makeToken(user), user: { id: user.id, username: user.username, email: user.email } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/me', verifyJWT, (req, res) => {
  const user = User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user: { id: user.id, username: user.username, email: user.email, createdAt: user.createdAt } });
});

module.exports = router;
