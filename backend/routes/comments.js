const { Router } = require('express');
const Comment = require('../models/Comment');
const Task = require('../models/Task');
const Organization = require('../models/Organization');
const auth = require('../middleware/auth');

const router = Router();

// List comments for a task
router.get('/', auth, async (req, res) => {
  const taskId = String(req.query.taskId || '');
  if (!taskId) return res.status(400).json({ msg: 'taskId required' });

  try {
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ msg: 'Task not found' });

    const org = await Organization.findById(task.orgId);
    const isMember =
      org &&
      (org.owner.toString() === req.user._id.toString() ||
        org.members.some((m) => m.user.toString() === req.user._id.toString()));
    if (!isMember) return res.status(403).json({ msg: 'Not authorized' });

    const comments = await Comment.find({ taskId }).sort({ createdAt: 1 }).populate('author', 'name email');
    res.json(comments);
  } catch (e) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Create comment
router.post('/', auth, async (req, res) => {
  const { taskId, text } = req.body;
  if (!taskId || !text) return res.status(400).json({ msg: 'taskId and text required' });

  try {
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ msg: 'Task not found' });

    const c = await Comment.create({
      taskId: task._id,
      author: req.user._id,
      text,
    });

    await c.populate('author', 'name email');

    // emit to project room
    req.io.to(`project_${task.projectId}`).emit('comment:created', c);

    res.json(c);
  } catch (e) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
