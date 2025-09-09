// backend/routes/projects.js
const express = require('express');
const mongoose = require('mongoose');
const Project = require('../models/Project');
const Organization = require('../models/Organization');
const auth = require('../middleware/auth');
const router = express.Router();
const guestGuard = require("../middleware/guestGuard");


// Create project under org
router.post('/', auth, guestGuard, async (req, res) => {
  try {
    const { orgId, name, description, columns } = req.body;
    if (!orgId || !name) return res.status(400).json({ msg: 'orgId and name required' });

    const org = await Organization.findById(orgId);
    if (!org) return res.status(404).json({ msg: 'Organization not found' });

    const isMember =
      org.owner.toString() === req.user._id.toString() ||
      org.members.some((m) => m.user.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ msg: 'Not authorized' });

    // ✅ Always include default columns if none passed
    const defaultColumns = [
      { _id: 'col_todo', title: 'Todo', order: 0 },
      { _id: 'col_inprogress', title: 'In Progress', order: 1 },
      { _id: 'col_done', title: 'Done', order: 2 },
    ];

    const proj = await Project.create({
      orgId: new mongoose.Types.ObjectId(orgId),
      workspaceId: org.workspaceId || org._id, // ✅ derive workspaceId (fallback orgId if no workspace model yet)
      name,
      description: description || '',
      columns: Array.isArray(columns) && columns.length ? columns : defaultColumns,
      owner: req.user._id, // ✅ track creator
    });

    if (req.io) req.io.to(`org_${orgId}`).emit('project:created', proj);

    res.json(proj);
  } catch (err) {
    console.error('[projects] POST / error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// List projects for an org
router.get('/', auth, async (req, res) => {
  try {
    const { orgId } = req.query;
    if (!orgId) return res.status(400).json({ msg: 'orgId required' });

    const org = await Organization.findById(orgId);
    if (!org) return res.status(404).json({ msg: 'Organization not found' });

    const isMember =
      org.owner.toString() === req.user._id.toString() ||
      org.members.some((m) => m.user.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ msg: 'Not authorized' });

    const projects = await Project.find({ orgId }).sort({ createdAt: -1 });

    res.json(projects);
  } catch (err) {
    console.error('[projects] GET / error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get single project by id
router.get('/:id', auth, async (req, res) => {
  try {
    const proj = await Project.findById(req.params.id);
    if (!proj) return res.status(404).json({ msg: 'Project not found' });

    const org = await Organization.findById(proj.orgId);
    const isMember =
      org &&
      (org.owner.toString() === req.user._id.toString() ||
        org.members.some((m) => m.user.toString() === req.user._id.toString()));
    if (!isMember) return res.status(403).json({ msg: 'Not authorized' });

    res.json(proj);
  } catch (err) {
    console.error('[projects] GET /:id error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update project
router.put('/:id', auth, async (req, res) => {
  try {
    const updates = req.body;
    const proj = await Project.findById(req.params.id);
    if (!proj) return res.status(404).json({ msg: 'Project not found' });

    const org = await Organization.findById(proj.orgId);
    const isMember =
      org &&
      (org.owner.toString() === req.user._id.toString() ||
        org.members.some((m) => m.user.toString() === req.user._id.toString()));
    if (!isMember) return res.status(403).json({ msg: 'Not authorized' });

    Object.assign(proj, updates);
    await proj.save();

    if (req.io) req.io.to(`org_${proj.orgId}`).emit('project:updated', proj);
    res.json(proj);
  } catch (err) {
    console.error('[projects] PUT /:id error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete project
router.delete('/:id', auth, async (req, res) => {
  try {
    const proj = await Project.findById(req.params.id);
    if (!proj) return res.status(404).json({ msg: 'Project not found' });

    const org = await Organization.findById(proj.orgId);
    const isMember =
      org &&
      (org.owner.toString() === req.user._id.toString() ||
        org.members.some((m) => m.user.toString() === req.user._id.toString()));
    if (!isMember) return res.status(403).json({ msg: 'Not authorized' });

    await proj.deleteOne();
    if (req.io) req.io.to(`org_${proj.orgId}`).emit('project:deleted', { id: proj._id });
    res.json({ ok: true });
  } catch (err) {
    console.error('[projects] DELETE /:id error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
