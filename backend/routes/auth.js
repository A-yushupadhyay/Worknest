// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');
const authProtection = require('../middleware/auth');

// ====== Register ======
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields required" });
    }

    // Check if user exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({ name, email, passwordHash });
    await user.save();

    // Issue JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ====== Login ======
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ msg: 'Missing fields' });

  try {
    const user = await User.findOne({ email });
    if (!user || !user.passwordHash) return res.status(400).json({ msg: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ====== Google OAuth ======
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/auth/failure' }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    const redirectUrl = `${process.env.FRONTEND_URL}/dashboard?token=${token}`;
    res.redirect(redirectUrl);
  }
);

// ====== Me (verify token & return user) ======
router.get('/me', authProtection, async (req, res) => {
  try {
    // const header = req.header('Authorization');
    // if (!header) return res.status(401).json({ msg: 'No token' });

    // const token = header.replace('Bearer ', '');
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(req.user._id).select('-passwordHash');
    if (!user) return res.status(404).json({ msg: 'User not found' });

    res.json({ user });
  } catch (err) {
    console.error("Me endpoint error:", err);
    return res.status(401).json({ msg: 'Invalid token' });
  }
});

module.exports = router;
