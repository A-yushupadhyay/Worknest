const Organization = require('../models/Organization');

module.exports = async function (req, res, next) {
  // expects req.user from auth middleware + either req.body.orgId or req.params.orgId or req.query.orgId
  const orgId = req.body.orgId || req.params.orgId || req.query.orgId || (req.body.projectId && req.body.orgId);
  if (!orgId) return res.status(400).json({ msg: 'orgId required' });

  try {
    const org = await Organization.findById(orgId);
    if (!org) return res.status(404).json({ msg: 'Organization not found' });

    const isMember = org.members.some(m => m.user.toString() === req.user._id.toString()) || org.owner.toString() === req.user._id.toString();
    if (!isMember) return res.status(403).json({ msg: 'Not a member of this organization' });

    req.org = org;
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};
