const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/auth");

// Search users by email or name (for autocomplete)
router.get("/search", auth, async (req, res) => {
  try {
    const query = req.query.query || "";
    if (!query) return res.json([]);

    const regex = new RegExp(query, "i");
    const users = await User.find({
      $or: [{ email: regex }, { name: regex }],
    })
      .select("name email")
      .limit(10);

    res.json(users);
  } catch (err) {
    console.error("User search error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
