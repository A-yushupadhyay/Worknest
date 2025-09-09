const { Router } = require('express');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

const router = Router();

// List notifications (optionally only unread)
router.get('/', auth, async (req, res) => {
  const unread = String(req.query.unread || '') === '1';
  try {
    const filter = { userId: req.user._id, ...(unread ? { read: false } : {}) };
    const items = await Notification.find(filter).sort({ createdAt: -1 }).limit(50);
    res.json(items);
  } catch {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Mark one as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const n = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: { read: true } },
      { new: true }
    );
    if (!n) return res.status(404).json({ msg: 'Not found' });
    res.json(n);
  } catch {
    res.status(500).json({ msg: 'Server error' });
  }
});
// Utility: create and emit notification
async function createNotification(io, { userId, type, payload }) {
  const n = await Notification.create({ userId, type, payload });
  io.to(`user_${userId}`).emit('notification:new', n); // ✅ emit realtime
  return n;
}

module.exports = { router, createNotification };