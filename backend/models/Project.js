const mongoose = require('mongoose');

const ColumnSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // e.g. 'col_todo'
  title: { type: String, required: true },
  order: { type: Number, default: 0 }
}, { _id: false });

const ProjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true }, // optional if you use workspace
  description: { type: String, default: '' },
  columns: { type: [ColumnSchema], default: [
    { _id: 'col_todo', title: 'Todo', order: 0 },
    { _id: 'col_inprogress', title: 'In Progress', order: 1 },
    { _id: 'col_done', title: 'Done', order: 2 },
  ] },
  settings: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

ProjectSchema.index({ orgId: 1, createdAt: -1 });

module.exports = mongoose.model('Project', ProjectSchema);
