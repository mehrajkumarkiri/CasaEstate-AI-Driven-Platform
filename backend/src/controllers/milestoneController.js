const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const Milestone = require('../models/Milestone');
const asyncWrapper = require('../middleware/asyncWrapper');
const aiProgressSummarizer = require('../services/aiProgressSummarizer');
const notificationService = require('../services/notificationService');

const isDBConnected = () => mongoose.connection.readyState === 1;

// ─── Mock Fallback Data ────────────────────────────────────────────────────────
const MOCK_MILESTONES = [
  {
    _id: 'ms-001',
    projectId: 'proj-001',
    projectName: 'Casa Horizon',
    phase: 'Foundation',
    status: 'Completed',
    progressPercent: 100,
    engineerNotes: 'RCC piling complete. Raft foundation poured and cured. Soil test reports approved by structural consultant.',
    startDate: new Date(Date.now() - 86400000 * 180).toISOString(),
    targetDate: new Date(Date.now() - 86400000 * 120).toISOString(),
    actualDate: new Date(Date.now() - 86400000 * 125).toISOString(),
    resources: [{ name: 'Cement (OPC 53)', quantity: 2400, unit: 'bags' }, { name: 'TMT Steel Bars', quantity: 180, unit: 'MT' }],
    deviationDays: 0,
    costVariance: -85000,
    riskLevel: 'Low',
    order: 1,
    updatedByName: 'Rajesh Kumar (Site Engineer)',
    createdAt: new Date(Date.now() - 86400000 * 180).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 125).toISOString(),
  },
  {
    _id: 'ms-002',
    projectId: 'proj-001',
    projectName: 'Casa Horizon',
    phase: 'Framing',
    status: 'Completed',
    progressPercent: 100,
    engineerNotes: 'All 24 floors of Tower A framing complete. Slab casting up to 24th floor done. Shuttering removed and surface treatment applied.',
    startDate: new Date(Date.now() - 86400000 * 120).toISOString(),
    targetDate: new Date(Date.now() - 86400000 * 60).toISOString(),
    actualDate: new Date(Date.now() - 86400000 * 55).toISOString(),
    resources: [{ name: 'Concrete M30 Grade', quantity: 6800, unit: 'cum' }, { name: 'Shuttering Panels', quantity: 450, unit: 'pcs' }],
    deviationDays: 5,
    costVariance: 120000,
    riskLevel: 'Low',
    order: 2,
    updatedByName: 'Priya Sharma (Senior Engineer)',
    createdAt: new Date(Date.now() - 86400000 * 120).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 55).toISOString(),
  },
  {
    _id: 'ms-003',
    projectId: 'proj-001',
    projectName: 'Casa Horizon',
    phase: 'MEP',
    status: 'In Progress',
    progressPercent: 62,
    engineerNotes: 'Electrical conduit laying complete up to floor 18. Plumbing risers installed for Tower A. HVAC ducting at 40%. Fire suppression system pending approval from fire NOC authority.',
    startDate: new Date(Date.now() - 86400000 * 55).toISOString(),
    targetDate: new Date(Date.now() + 86400000 * 30).toISOString(),
    actualDate: null,
    resources: [{ name: 'Copper Wiring (6mm)', quantity: 48000, unit: 'meters' }, { name: 'CPVC Pipes', quantity: 3200, unit: 'meters' }],
    deviationDays: 0,
    costVariance: 45000,
    riskLevel: 'Medium',
    order: 3,
    updatedByName: 'Anil Verma (MEP Engineer)',
    createdAt: new Date(Date.now() - 86400000 * 55).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    _id: 'ms-004',
    projectId: 'proj-001',
    projectName: 'Casa Horizon',
    phase: 'Finishing',
    status: 'Pending',
    progressPercent: 0,
    engineerNotes: '',
    startDate: null,
    targetDate: new Date(Date.now() + 86400000 * 90).toISOString(),
    actualDate: null,
    resources: [],
    deviationDays: 0,
    costVariance: 0,
    riskLevel: 'Low',
    order: 4,
    updatedByName: '',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    _id: 'ms-005',
    projectId: 'proj-001',
    projectName: 'Casa Horizon',
    phase: 'Handover',
    status: 'Pending',
    progressPercent: 0,
    engineerNotes: '',
    startDate: null,
    targetDate: new Date(Date.now() + 86400000 * 150).toISOString(),
    actualDate: null,
    resources: [],
    deviationDays: 0,
    costVariance: 0,
    riskLevel: 'Low',
    order: 5,
    updatedByName: '',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
];

// ─── Controllers ──────────────────────────────────────────────────────────────

// GET /api/v1/milestones?projectId=&phase=&status=
exports.getMilestones = asyncWrapper(async (req, res) => {
  const { projectId, phase, status } = req.query;

  if (!isDBConnected()) {
    let data = MOCK_MILESTONES;
    if (projectId) data = data.filter((m) => m.projectId === projectId);
    if (phase) data = data.filter((m) => m.phase === phase);
    if (status) data = data.filter((m) => m.status === status);
    return res.json({ success: true, data, source: 'mock' });
  }

  const query = {};
  if (projectId) query.projectId = projectId;
  if (phase) query.phase = phase;
  if (status) query.status = status;

  const milestones = await Milestone.find(query).sort({ order: 1, createdAt: -1 });
  res.json({ success: true, count: milestones.length, data: milestones });
});

// GET /api/v1/milestones/summary/:projectId
exports.getProjectSummary = asyncWrapper(async (req, res) => {
  const { projectId } = req.params;
  const { budget } = req.query;

  let milestones;
  if (!isDBConnected()) {
    milestones = MOCK_MILESTONES.filter((m) => m.projectId === projectId || projectId === 'proj-001');
  } else {
    milestones = await Milestone.find({ projectId }).sort({ order: 1 });
  }

  const aiSummary = aiProgressSummarizer.synthesizeProgressReport(milestones);
  const delayPrediction = aiProgressSummarizer.predictDelay(
    milestones,
    milestones.find((m) => m.phase === 'Handover')?.targetDate || new Date(Date.now() + 86400000 * 180)
  );
  const costAnalysis = aiProgressSummarizer.predictCostVariance(milestones, budget ? parseInt(budget) : 50000000);

  res.json({
    success: true,
    data: {
      projectId,
      milestones,
      aiSummary,
      delayPrediction,
      costAnalysis,
      lastUpdated: new Date().toISOString(),
    },
  });
});

// POST /api/v1/milestones
exports.createMilestone = asyncWrapper(async (req, res) => {
  const { projectId, projectName, phase, status, progressPercent, engineerNotes,
          startDate, targetDate, resources, updatedByName, updatedByEmail } = req.body;

  if (!projectId || !phase) {
    return res.status(400).json({ success: false, message: 'projectId and phase are required.' });
  }

  if (!isDBConnected()) {
    const newMilestone = {
      _id: uuidv4(),
      projectId, projectName, phase, status: status || 'Pending',
      progressPercent: progressPercent || 0, engineerNotes: engineerNotes || '',
      startDate, targetDate, resources: resources || [],
      deviationDays: 0, costVariance: 0, riskLevel: 'Low',
      updatedByName: updatedByName || 'Site Engineer', updatedByEmail: updatedByEmail || '',
      order: { Foundation: 1, Framing: 2, MEP: 3, Finishing: 4, Handover: 5 }[phase] || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    MOCK_MILESTONES.push(newMilestone);

    notificationService.sendNotification({ type: 'MILESTONE_UPDATED', milestone: newMilestone });
    return res.status(201).json({ success: true, data: newMilestone, source: 'mock' });
  }

  const milestone = await Milestone.create({
    projectId, projectName, phase, status: status || 'Pending',
    progressPercent: progressPercent || 0, engineerNotes: engineerNotes || '',
    startDate, targetDate, resources: resources || [],
    updatedByName: updatedByName || 'Site Engineer', updatedByEmail: updatedByEmail || '',
  });

  notificationService.sendNotification({ type: 'MILESTONE_UPDATED', milestone });
  res.status(201).json({ success: true, data: milestone });
});

// PATCH /api/v1/milestones/:id
exports.updateMilestone = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  if (!isDBConnected()) {
    const idx = MOCK_MILESTONES.findIndex((m) => m._id === id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Milestone not found' });

    MOCK_MILESTONES[idx] = { ...MOCK_MILESTONES[idx], ...updates, updatedAt: new Date().toISOString() };
    const updated = MOCK_MILESTONES[idx];

    // Re-run AI on every update
    const projectMilestones = MOCK_MILESTONES.filter((m) => m.projectId === updated.projectId);
    const aiSummary = aiProgressSummarizer.synthesizeProgressReport(projectMilestones);
    const delayPred = aiProgressSummarizer.predictDelay(projectMilestones, updated.targetDate);

    MOCK_MILESTONES[idx].aiSummary = aiSummary;
    MOCK_MILESTONES[idx].riskLevel = delayPred.riskLevel;

    // Fire notification
    notificationService.sendNotification({ type: 'MILESTONE_UPDATED', milestone: updated });
    if (delayPred.riskLevel !== 'Low') {
      notificationService.sendNotification({ type: 'DEVIATION_DETECTED', milestone: updated, prediction: delayPred });
    }
    if (updates.costVariance && Math.abs(updates.costVariance) > 500000) {
      notificationService.sendNotification({ type: 'COST_OVERRUN', milestone: updated });
    }

    return res.json({ success: true, data: MOCK_MILESTONES[idx], aiSummary, delayPrediction: delayPred, source: 'mock' });
  }

  const milestone = await Milestone.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true });
  if (!milestone) return res.status(404).json({ success: false, message: 'Milestone not found' });

  // Re-run AI analysis
  const projectMilestones = await Milestone.find({ projectId: milestone.projectId }).sort({ order: 1 });
  const aiSummary = aiProgressSummarizer.synthesizeProgressReport(projectMilestones);
  const delayPred = aiProgressSummarizer.predictDelay(
    projectMilestones,
    projectMilestones.find((m) => m.phase === 'Handover')?.targetDate
  );

  // Persist AI results
  await Milestone.findByIdAndUpdate(id, {
    $set: { aiSummary, riskLevel: delayPred.riskLevel },
  });

  // Fire notifications
  notificationService.sendNotification({ type: 'MILESTONE_UPDATED', milestone });
  if (delayPred.riskLevel !== 'Low') {
    notificationService.sendNotification({ type: 'DEVIATION_DETECTED', milestone, prediction: delayPred });
  }

  res.json({ success: true, data: milestone, aiSummary, delayPrediction: delayPred });
});
