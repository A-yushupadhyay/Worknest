const mongoose = require('mongoose');
const { Schema } = mongoose;

const MembershipSchema = new Schema(
  {
    orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: { type: String, enum: ['org_admin', 'member', 'viewer'], default: 'member' },
  },
  { timestamps: true }
);

MembershipSchema.index({ orgId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Membership', MembershipSchema);