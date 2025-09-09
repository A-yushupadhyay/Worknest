// scripts/seedGuest.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

async function seedGuest() {
  await mongoose.connect("mongodb://localhost:27017/worknest");

  const email = "guest@worknest.com";
  const password = "guest123";

  const existing = await User.findOne({ email });
  if (existing) {
    console.log("Guest user already exists");
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = new User({
    name: "Guest User",
    email,
    passwordHash,
    role: "member", // optional if you track roles
  });
  await user.save();

  console.log("Guest user created:", user.email);
  process.exit(0);
}

seedGuest();
