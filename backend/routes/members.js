const { Router } = require("express");
const Membership = require("../models/Membership");
const Organization = require("../models/Organization");
const User = require("../models/User");
const auth = require("../middleware/auth");
const { createNotification } = require("./notifications");

const router = Router();

/**
 * GET /api/members?orgId=xxx
 * List members of an org
 */
router.get("/", auth, async (req, res) => {
  try {
    const orgId = String(req.query.orgId || "");
    if (!orgId) return res.status(400).json({ msg: "orgId required" });

    // Validate org
    const org = await Organization.findById(orgId);
    if (!org) return res.status(404).json({ msg: "Organization not found" });

    // Check requester is member
    const isMember =
      org.owner.toString() === req.user._id.toString() ||
      (await Membership.exists({ orgId, userId: req.user._id }));
    if (!isMember) return res.status(403).json({ msg: "Not authorized" });

    // Pagination + Search
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const q = req.query.q?.toString().trim() || "";

    const filter = { orgId };

    if (q) {
      const users = await User.find({
        $or: [
          { name: { $regex: q, $options: "i" } },
          { email: { $regex: q, $options: "i" } },
        ],
      }).select("_id");

      filter.userId = { $in: users.map((u) => u._id) };
    }

    const total = await Membership.countDocuments(filter);

    const results = await Membership.find(filter)
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ results, total });
  } catch (e) {
    console.error("GET /members error:", e.message);
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * POST /api/members/invite
 * Invite/add member by email
 */
router.post("/invite", auth, async (req, res) => {
  try {
    const { orgId, email, role } = req.body;
    if (!orgId || !email) return res.status(400).json({ msg: "orgId and email required" });

    const validRoles = ["org_admin", "member", "viewer"];
    if (!validRoles.includes(role)) return res.status(400).json({ msg: "Invalid role" });

    const org = await Organization.findById(orgId);
    if (!org) return res.status(404).json({ msg: "Organization not found" });

    // ✅ Permission check: owner OR org_admin
    const inviterMembership = await Membership.findOne({ orgId, userId: req.user._id });
    const isAdminOrOwner =
      req.user._id.toString() === org.owner.toString() ||
      (inviterMembership && inviterMembership.role === "org_admin");

    if (!isAdminOrOwner) return res.status(403).json({ msg: "Only admins can invite" });

    let user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found. Ask them to register first." });

    const exists = await Membership.findOne({ orgId, userId: user._id });
    if (exists) return res.status(400).json({ msg: "User already a member" });

    const membership = await Membership.create({ orgId, userId: user._id, role });

    // Notify invited user
    await createNotification(req.io, {
      userId: user._id,
      type: "invite",
      payload: {
        orgId,
        orgName: org.name,
        invitedBy: req.user._id,
        invitedByName: req.user.name,
        role,
      },
    });

    res.json({ msg: "User invited successfully", membership });
  } catch (err) {
    console.error("POST /members/invite error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * DELETE /api/members/:id
 */
router.delete("/:id", auth, async (req, res) => {
  try {
    const mem = await Membership.findById(req.params.id);
    if (!mem) return res.status(404).json({ msg: "Membership not found" });

    await mem.deleteOne();
    res.json({ ok: true });
  } catch (e) {
    console.error("DELETE /members/:id error:", e.message);
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * GET /api/members/search-users?query=xxx
 */
router.get("/search-users", auth, async (req, res) => {
  try {
    const query = req.query.query?.toString().trim() || "";
    if (!query) return res.json([]);

    const users = await User.find({ email: { $regex: query, $options: "i" } })
      .limit(8)
      .select("name email");

    res.json(users);
  } catch (e) {
    console.error("GET /members/search-users error:", e.message);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
