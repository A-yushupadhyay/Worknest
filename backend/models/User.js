const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String },
    googleId: { type: String },
    avatarUrl: { type: String },
    role: { type: String, enum: ['member', 'org_admin', 'super_admin'], default: 'member' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);