// backend/middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async function (req, res, next) {
  try {
    const header = req.header("Authorization");
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ msg: "No token provided" });
    }

    const token = header.split(" ")[1];

    // ✅ Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ msg: "Invalid or expired token" });
    }

    // ✅ Always check if user still exists in DB
    const user = await User.findById(decoded.id).select("_id name email role");
    if (!user) {
      console.warn(`Auth: user ${decoded.id} not found in DB, rejecting token`);
      return res.status(401).json({ msg: "User no longer exists. Please log in again." });
    }

    // ✅ Attach user to request
    req.user = user;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err.message);
    res.status(401).json({ msg: "Authentication failed" });
  }
};
