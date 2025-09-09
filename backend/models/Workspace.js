const mongoose = require('mongoose');
const { Schema } = mongoose;

const WorkspaceSchema = new Schema(
  {
    orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    createdAt: { type: Date, default: Date.now },
  }
);

module.exports = mongoose.model('Workspace', WorkspaceSchema);