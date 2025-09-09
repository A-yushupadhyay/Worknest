const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const Organization = require('../models/Organization');
const auth = require('../middleware/auth');
const router = express.Router();
const guestGuard = require("../middleware/guestGuard");
const { createNotification } = require("./notifications");


// GET tasks for a project (paginated)
router.get('/', auth,guestGuard, async (req, res) => {
  // query params: projectId, page, limit
  const { projectId, page = 1, limit = 100 } = req.query;
  if (!projectId) return res.status(400).json({ msg: 'projectId required' });

  try {
    const proj = await Project.findById(projectId);
    if (!proj) return res.status(404).json({ msg: 'Project not found' });
    const org = await Organization.findById(proj.orgId);
    const isMember = org && (org.owner.toString() === req.user._id.toString() || org.members.some(m => m.user.toString() === req.user._id.toString()));
    if (!isMember) return res.status(403).json({ msg: 'Not authorized' });

    const tasks = await Task.find({ projectId }).sort({ createdAt: -1 }).skip((page-1)*limit).limit(Number(limit)).populate('assignee creator', 'name email');
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// POST create task
// POST create task
router.post('/', auth, async (req, res) => {
  const { projectId, title, description, columnId, assigneeEmail, dueDate, priority } = req.body;
  if (!projectId || !title || !columnId) return res.status(400).json({ msg: 'projectId, title and columnId required' });

  try {
    const proj = await Project.findById(projectId);
    if (!proj) return res.status(404).json({ msg: 'Project not found' });

    const org = await Organization.findById(proj.orgId);
    const isMember = org && (
      org.owner.toString() === req.user._id.toString() ||
      org.members.some(m => m.user.toString() === req.user._id.toString())
    );
    if (!isMember) return res.status(403).json({ msg: 'Not authorized' });

    let assigneeId = null;
    let assigneeName = '';
    if (assigneeEmail) {
      const User = require('../models/User');
      const found = await User.findOne({ email: assigneeEmail });
      if (!found) return res.status(404).json({ msg: 'Assignee email not found' });
      assigneeId = found._id;
      assigneeName = found.name;
    }

    const task = await Task.create({
      orgId: proj.orgId,
      workspaceId: proj.workspaceId || org._id,
      projectId: proj._id,
      columnId,
      title,
      description,
      assignee: assigneeId,
      priority: priority || 'medium',
      creator: req.user._id,
      dueDate: dueDate ? new Date(dueDate) : undefined
    });

    await task.populate('assignee creator', 'name email');

    // emit creation to project room
    req.io.to(`project_${proj._id}`).emit('task:created', task);

    // ✅ Notify assignee
    if (assigneeId) {
      await createNotification(req.io, {
        userId: assigneeId,
        type: 'assignment',
        payload: {
          taskId: task._id,
          taskTitle: task.title,
          assignedBy: req.user._id,
          assignedByName: req.user.name
        }
      });
    }

    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// PUT update task
router.put('/:id', auth, async (req, res) => {
  try {
    const updates = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ msg: 'Task not found' });

    const org = await Organization.findById(task.orgId);
    const isMember = org && (org.owner.toString() === req.user._id.toString() || org.members.some(m => m.user.toString() === req.user._id.toString()));
    if (!isMember) return res.status(403).json({ msg: 'Not authorized' });

    Object.assign(task, updates);
    await task.save();
    await task.populate('assignee creator', 'name email');

    // emit update to project room
    req.io.to(`project_${task.projectId}`).emit('task:updated', task);

    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// DELETE task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ msg: 'Task not found' });

    const org = await Organization.findById(task.orgId);
    const isMember = org && (org.owner.toString() === req.user._id.toString() || org.members.some(m => m.user.toString() === req.user._id.toString()));
    if (!isMember) return res.status(403).json({ msg: 'Not authorized' });

    await task.remove();

    // emit deletion
    req.io.to(`project_${task.projectId}`).emit('task:deleted', { id: req.params.id });

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
