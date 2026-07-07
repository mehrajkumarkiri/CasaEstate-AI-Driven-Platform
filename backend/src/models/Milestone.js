const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, default: 'units' },
  costPerUnit: { type: Number, default: 0 },
});

const milestoneSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project reference is required'],
    },
    projectName: { type: String, required: true },
    phase: {
      type: String,
      enum: ['Foundation', 'Framing', 'MEP', 'Finishing', 'Handover'],
      required: [true, 'Construction phase is required'],
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed', 'Delayed'],
      default: 'Pending',
    },
    progressPercent: { type: Number, min: 0, max: 100, default: 0 },
    engineerNotes: { type: String, default: '' },
    startDate: { type: Date },
    targetDate: { type: Date },
    actualDate: { type: Date },
    resources: [resourceSchema],
    // AI-computed fields
    deviationDays: { type: Number, default: 0 },
    costVariance: { type: Number, default: 0 },
    riskLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Low',
    },
    aiSummary: { type: String, default: '' },
    // Engineer who last updated
    updatedByName: { type: String, default: 'Site Engineer' },
    updatedByEmail: { type: String, default: '' },
    // Sequential order index for timeline rendering
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Auto-assign phase order on save
milestoneSchema.pre('save', function (next) {
  const PHASE_ORDER = { Foundation: 1, Framing: 2, MEP: 3, Finishing: 4, Handover: 5 };
  this.order = PHASE_ORDER[this.phase] || 0;
  next();
});

module.exports = mongoose.model('Milestone', milestoneSchema);
