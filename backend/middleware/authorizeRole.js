// backend/middleware/authorizeRole.js
const Organization = require('../models/Organization');
const Project = require('../models/Project');

module.exports = function authorizeRole(...allowedRoles) {
  return async (req, res, next) => {
    try {
      // Collect orgId from multiple sources
      let orgId = req.body.orgId || req.query.orgId || req.params.orgId || req.params.id;

      // If projectId is provided instead of orgId, resolve it
      if (!orgId && (req.body.projectId || req.query.projectId)) {
        const projectId = req.body.projectId || req.query.projectId;
        const proj = await Project.findById(projectId).select('orgId');
        if (!proj) return res.status(404).json({ msg: 'Project not found for role check' });
        orgId = proj.orgId;
      }

      // Validate orgId
      if (!orgId) return res.status(400).json({ msg: 'orgId or projectId required for role check' });
      orgId = orgId.toString().trim(); // 🚀 trim whitespace like " d"

      const org = await Organization.findById(orgId);
      if (!org) return res.status(404).json({ msg: 'Organization not found' });

      // Owner is always org_admin
      if (org.owner.toString() === req.user._id.toString()) return next();

      const member = org.members.find(m => m.user.toString() === req.user._id.toString());
      if (!member) return res.status(403).json({ msg: 'Not a member of this organization' });

      if (allowedRoles.length === 0) return next(); // no role restriction
      if (allowedRoles.includes(member.role)) return next();

      return res.status(403).json({ msg: 'Insufficient role' });
    } catch (err) {
      console.error('authorizeRole error', err);
      return res.status(500).json({ msg: 'Server error' });
    }
  };
};
