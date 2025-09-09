// /backend/routes/search.js
const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const Organization = require('../models/Organization');
const auth = require('../middleware/auth');

// Ensure Task has text index on title + description in model update (see below)

router.get('/tasks', auth, async (req, res) => {
  // query params: q, orgId, projectId, assignee, status(columnId), page, limit, sort
  const { q = '', orgId, projectId, assignee, status, page = 1, limit = 25, sort = 'updatedAt' } = req.query;

  if (!orgId) return res.status(400).json({ msg: 'orgId required' });

  try {
    const org = await Organization.findById(orgId);
    if (!org) return res.status(404).json({ msg: 'Org not found' });

    // membership check
    const isMember = org.owner.toString() === req.user._id.toString() || org.members.some(m => m.user.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ msg: 'Not authorized' });

    const filter = { orgId };
    if (projectId) filter.projectId = projectId;
    if (assignee) filter.assignee = assignee;
    if (status) filter.columnId = status;

    const pageNum = Math.max(1, Number(page));
    const pageSize = Math.min(100, Number(limit));

    let query;
    if (q && String(q).trim().length > 0) {
      // text search with score
      query = Task.find({ $text: { $search: String(q) }, ...filter }, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } })
        .skip((pageNum - 1) * pageSize)
        .limit(pageSize);
    } else {
      query = Task.find(filter)
        .sort({ [sort]: -1 })
        .skip((pageNum - 1) * pageSize)
        .limit(pageSize);
    }

    const results = await query.populate('assignee creator', 'name email').exec();
    return res.json({ page: pageNum, limit: pageSize, results });
  } catch (err) {
    console.error('search error', err);
    return res.status(500).json({ msg: 'Server error' });
  }
});






//
router.get("/", auth, async (req, res) => {
  const { q, orgId } = req.query;
  if (!q) return res.json({ orgs: [], projects: [] });

  const regex = new RegExp(q, "i");

  const orgs = await Organization.find({ name: regex }).select("_id name");
  let projects = [];
  if (orgId) {
    projects = await Project.find({ orgId, name: regex }).select("_id name");
  }

  res.json({ orgs, projects });
});





module.exports = router;
