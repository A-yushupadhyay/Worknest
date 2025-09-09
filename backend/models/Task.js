const mongoose = require('mongoose');
const { Schema } = mongoose;

const AttachmentSchema = new Schema(
  {
    url: { type: String },
    filename: { type: String },
    size: { type: Number },
    mime: { type: String },
  },
  { _id: false }
);

const TaskSchema = new Schema(
  {
    orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    columnId: { type: String, required: true, index: true },
    title: { type: String, required: true, index: 'text' },
    description: { type: String, default: '' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    assignee: { type: Schema.Types.ObjectId, ref: 'User' },
    creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    dueDate: { type: Date },
    attachments: [AttachmentSchema],
    commentsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);


// after schema definition
TaskSchema.index({ title: 'text', description: 'text' }, { weights: { title: 5, description: 1 } });
// compound index for common queries
TaskSchema.index({ projectId: 1, columnId: 1, createdAt: -1 });
TaskSchema.index({ orgId: 1, assignee: 1, dueDate: 1 });


module.exports = mongoose.model('Task', TaskSchema);