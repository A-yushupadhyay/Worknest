// backend/middleware/guestGuard.js
module.exports = function guestGuard(req, res, next) {
  try {
    // guest is identified by email (you can also check role if you store it in DB)
    if (req.user && req.user.email === "guest@worknest.com") {
      return res.status(403).json({ msg: "Guest account is read-only" });
    }
    next();
  } catch (err) {
    console.error("guestGuard error", err);
    res.status(500).json({ msg: "Server error" });
  }
};
