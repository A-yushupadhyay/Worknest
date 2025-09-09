const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const Task = require("../models/Task"); // ✅ assuming you have a Task model
const Organization = require("../models/Organization");
const auth = require("../middleware/auth");

// GET /api/admin/metrics?orgId=xxx
router.get("/metrics", auth, async (req, res) => {
  try {
    const { orgId } = req.query;
    if (!orgId) return res.status(400).json({ msg: "orgId required" });

    // validate org + membership
    const org = await Organization.findById(orgId);
    if (!org) return res.status(404).json({ msg: "Organization not found" });

    const isMember =
      org.owner.toString() === req.user._id.toString() ||
      org.members.some((m) => m.user.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ msg: "Not authorized" });

    // get all projects in org
    const projects = await Project.find({ orgId }).select("_id");

    // get all tasks in those projects
    const tasks = await Task.find({ projectId: { $in: projects.map((p) => p._id) } });

    const totals = tasks.length;

    // group by status
    const byStatus = tasks.reduce((acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    }, {});

    // overdue count
    const now = new Date();
    const overdue = tasks.filter((t) => t.dueDate && t.dueDate < now && t.status !== "Done").length;

    // tasks per user
    const perUserMap = {};
    tasks.forEach((t) => {
      const uid = t.assignee ? t.assignee.toString() : "unassigned";
      perUserMap[uid] = (perUserMap[uid] || 0) + 1;
    });
    const perUser = Object.entries(perUserMap).map(([userId, count]) => ({
      userId,
      count,
    }));

    res.json({ totals, byStatus, overdue, perUser });
  } catch (err) {
    console.error("[admin] GET /metrics error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
