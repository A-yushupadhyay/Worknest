const express = require('express');
const Organization = require('../models/Organization');
const auth = require('../middleware/auth');
const router = express.Router();
const guestGuard = require("../middleware/guestGuard");
const Membership = require('../models/Membership'); // ✅ FIXED import


// Utility: generate slug safely
function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')       // spaces → dashes
    .replace(/[^a-z0-9-]/g, ''); // remove invalid chars
}

router.post('/', auth,guestGuard, async (req, res) => {
  try {
    let { name, slug } = req.body;
    if (!name) return res.status(400).json({ msg: 'Name is required' });

    slug = slug && slug.trim() !== '' ? generateSlug(slug) : generateSlug(name);

    const exists = await Organization.findOne({ slug });
    if (exists) {
      return res.status(400).json({ msg: 'Slug already exists. Choose another name/slug' });
    }

    // Create org
    const org = await Organization.create({
      name,
      slug,
      owner: req.user._id,
    });

    // ✅ Create Membership for creator
    await Membership.create({
      orgId: org._id,
      userId: req.user._id,
      role: 'org_admin',
    });

    res.json(org);
  } catch (err) {
    console.error('POST /orgs error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});



// ===== List orgs user belongs to =====
router.get('/', auth, async (req, res) => {
  try {
    const orgs = await Organization.find({
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    }).sort({ createdAt: -1 });
    res.json(orgs);
  } catch (err) {
    console.error('GET /orgs error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ===== Get org by id (with members) =====
router.get('/:id', auth, async (req, res) => {
  try {
    const org = await Organization.findById(req.params.id);
    if (!org) return res.status(404).json({ msg: 'Organization not found' });

    const membership = await Membership.findOne({
      orgId: org._id,
      userId: req.user._id,
    });

    if (!membership && org.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    // load members from Membership collection
    const members = await Membership.find({ orgId: org._id })
      .populate('userId', 'name email');

    res.json({ org, members });
  } catch (err) {
    console.error('GET /orgs/:id error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});
module.exports = router;
