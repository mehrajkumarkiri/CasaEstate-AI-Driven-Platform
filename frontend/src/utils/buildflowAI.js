/**
 * BuildFlow AI — Client-Side Synthesis & Predictive Engine
 * Runs entirely in-browser from live milestone state.
 * Zero API dependency — always produces output.
 */

export const PHASES = ['Foundation', 'Framing', 'MEP', 'Finishing', 'Handover'];

export const PHASE_ICONS = {
  Foundation: '🏗️',
  Framing: '🪵',
  MEP: '⚡',
  Finishing: '🎨',
  Handover: '🔑',
};

export const PHASE_DESCRIPTIONS = {
  Foundation: 'Excavation, piling, raft slab, and waterproofing works',
  Framing: 'RCC structural frame, column casting, slab work per floor',
  MEP: 'Mechanical, Electrical & Plumbing — conduits, risers, HVAC',
  Finishing: 'Internal plastering, tiling, woodwork, facade & paint',
  Handover: 'Final inspection, snag clearance, possession & registry',
};

// ─── DEFAULT MILESTONE SEED DATA ──────────────────────────────────────────────
export const DEFAULT_MILESTONES = [
  {
    id: 'ms-foundation',
    phase: 'Foundation',
    status: 'Completed',
    progressPercent: 100,
    engineerNotes: 'Raft slab casting complete. Waterproofing membrane applied. Sub-surface drainage commissioned. No deviations.',
    targetDate: new Date(Date.now() - 86400000 * 120).toISOString(),
    completedDate: new Date(Date.now() - 86400000 * 115).toISOString(),
    deviationDays: 0,
    costVariance: 0,
    riskLevel: 'Low',
    updatedByName: 'Rajesh Kumar (Site Engineer)',
    resources: [
      { name: 'OPC 53 Cement', quantity: 8400, unit: 'bags' },
      { name: 'TMT Fe-550 Steel', quantity: 320, unit: 'MT' },
      { name: 'Ready Mix Concrete M-30', quantity: 1200, unit: 'cum' },
    ],
    documents: [
      { label: 'Foundation Completion Certificate', url: '#', type: 'compliance' },
      { label: 'Structural Inspection Report', url: '#', type: 'inspection' },
    ],
  },
  {
    id: 'ms-framing',
    phase: 'Framing',
    status: 'Completed',
    progressPercent: 100,
    engineerNotes: 'RCC structural frame completed up to floor 22. All columns and slabs cleared inspection. No material shortage.',
    targetDate: new Date(Date.now() - 86400000 * 60).toISOString(),
    completedDate: new Date(Date.now() - 86400000 * 58).toISOString(),
    deviationDays: 0,
    costVariance: 120000,
    riskLevel: 'Low',
    updatedByName: 'Suresh Nair (Sr. Engineer)',
    resources: [
      { name: 'TMT Fe-550 Steel', quantity: 780, unit: 'MT' },
      { name: 'Ready Mix Concrete M-40', quantity: 3600, unit: 'cum' },
      { name: 'Centering Shuttering', quantity: 18000, unit: 'sqft' },
    ],
    documents: [
      { label: 'Structural Completion Certificate', url: '#', type: 'compliance' },
      { label: 'Floor-wise Inspection Log', url: '#', type: 'inspection' },
    ],
  },
  {
    id: 'ms-mep',
    phase: 'MEP',
    status: 'In Progress',
    progressPercent: 62,
    engineerNotes: 'Electrical conduit installation complete through floor 18. Plumbing risers connected to floors 19–22. HVAC rough-in at 40%. Fire NOC pending from NOIDA Fire Dept.',
    targetDate: new Date(Date.now() + 86400000 * 30).toISOString(),
    completedDate: null,
    deviationDays: 8,
    costVariance: 340000,
    riskLevel: 'Medium',
    updatedByName: 'Priya Mehta (MEP Supervisor)',
    resources: [
      { name: 'FRLS Electrical Cable', quantity: 48000, unit: 'meters' },
      { name: 'CPVC Plumbing Pipe', quantity: 12000, unit: 'meters' },
      { name: 'HVAC Ducting', quantity: 2400, unit: 'sqft' },
    ],
    documents: [
      { label: 'Electrical Inspection Certificate', url: '#', type: 'compliance' },
      { label: 'Material Procurement Invoice — HVAC', url: '#', type: 'invoice' },
    ],
  },
  {
    id: 'ms-finishing',
    phase: 'Finishing',
    status: 'Pending',
    progressPercent: 0,
    engineerNotes: '',
    targetDate: new Date(Date.now() + 86400000 * 90).toISOString(),
    completedDate: null,
    deviationDays: 0,
    costVariance: 0,
    riskLevel: 'Low',
    updatedByName: '',
    resources: [],
    documents: [],
  },
  {
    id: 'ms-handover',
    phase: 'Handover',
    status: 'Pending',
    progressPercent: 0,
    engineerNotes: '',
    targetDate: new Date(Date.now() + 86400000 * 150).toISOString(),
    completedDate: null,
    deviationDays: 0,
    costVariance: 0,
    riskLevel: 'Low',
    updatedByName: '',
    resources: [],
    documents: [],
  },
];

// ─── SYNTHESIZER ──────────────────────────────────────────────────────────────
/**
 * Synthesizes raw engineer field notes into a polished, client-facing narrative.
 * @param {Array} milestones - Live milestone state array
 * @returns {string} Rich, client-readable paragraph
 */
export function synthesizeReport(milestones) {
  if (!milestones || milestones.length === 0) {
    return 'Construction activity is underway. Detailed progress updates will appear here once site engineers begin logging milestone data.';
  }

  const completed = milestones.filter((m) => m.status === 'Completed');
  const inProgress = milestones.find((m) => m.status === 'In Progress');
  const overallProgress = Math.round(
    milestones.reduce((s, m) => s + (m.progressPercent || 0), 0) / milestones.length
  );

  let narrative = `Your BuildFlow AI engine has processed the latest field dispatches from our site team. `;

  if (completed.length > 0) {
    const completedNames = completed.map((m) => m.phase).join(' and ');
    narrative += `The **${completedNames}** phase${completed.length > 1 ? 's have' : ' has'} been successfully completed and cleared all structural inspections. `;
  }

  if (inProgress) {
    const pct = inProgress.progressPercent;
    narrative += `Your project is currently progressing through the **${inProgress.phase}** phase at **${pct}% completion**. `;

    if (inProgress.engineerNotes) {
      // Translate technical jargon into client-friendly language
      const clientNote = inProgress.engineerNotes
        .replace(/FRLS/gi, 'fire-resistant')
        .replace(/CPVC/gi, 'high-grade polymer')
        .replace(/RCC/gi, 'reinforced concrete')
        .replace(/HVAC/gi, 'air-conditioning and ventilation')
        .replace(/MEP/gi, 'essential services')
        .replace(/TMT/gi, 'high-tensile')
        .replace(/NOC/gi, 'safety clearance')
        .replace(/conduit/gi, 'wiring infrastructure');

      narrative += `Our engineers report: "${clientNote}" `;
    }

    if (inProgress.deviationDays > 0) {
      narrative += `Our AI engine has detected a scheduling consideration of approximately **${inProgress.deviationDays} day(s)** in this phase, which has been factored into the revised possession estimate below. Rest assured, your project team is actively monitoring and mitigating all schedule impacts. `;
    } else {
      narrative += `BuildFlow AI confirms this phase is tracking within schedule parameters. No deviations detected. `;
    }
  }

  narrative += `Overall project completion stands at **${overallProgress}%**. You will receive an instant notification the moment any phase status changes.`;

  return narrative;
}

// ─── DELAY PREDICTOR ─────────────────────────────────────────────────────────
/**
 * Evaluates milestone completion dates against scheduling parameters.
 * @param {Array} milestones
 * @param {string} originalPossessionDate ISO string
 * @returns {{ riskLevel, deviationDays, newEstimate, reasoning }}
 */
export function predictDelay(milestones, originalPossessionDate) {
  if (!milestones || milestones.length === 0) {
    return { riskLevel: 'Low', deviationDays: 0, newEstimate: originalPossessionDate, reasoning: 'No milestone data available.' };
  }

  const totalDeviation = milestones.reduce((s, m) => s + (m.deviationDays || 0), 0);
  // Cascade: upstream delays push downstream milestones
  const cascadedDays = Math.round(totalDeviation * 1.15);

  let riskLevel = 'Low';
  if (cascadedDays >= 30) riskLevel = 'Critical';
  else if (cascadedDays >= 21) riskLevel = 'High';
  else if (cascadedDays >= 7) riskLevel = 'Medium';

  const original = originalPossessionDate ? new Date(originalPossessionDate) : new Date(Date.now() + 86400000 * 150);
  const newEstimate = new Date(original.getTime() + cascadedDays * 86400000);

  const inProgressPhase = milestones.find((m) => m.status === 'In Progress');
  let reasoning = '';
  if (cascadedDays === 0) {
    reasoning = 'All phases are tracking on schedule. No deviations detected by BuildFlow AI.';
  } else if (inProgressPhase) {
    reasoning = `${inProgressPhase.phase} phase is running ${inProgressPhase.deviationDays} day(s) behind schedule. Cascade effect adds ~${cascadedDays - inProgressPhase.deviationDays} additional day(s) to downstream phases.`;
  }

  return { riskLevel, deviationDays: cascadedDays, newEstimate: newEstimate.toISOString(), reasoning };
}

// ─── COST VARIANCE PREDICTOR ─────────────────────────────────────────────────
/**
 * Calculates live cost variance from milestone data.
 * @param {Array} milestones
 * @param {number} totalBudget — total project budget in INR
 * @returns {{ varianceAmount, variancePercent, severity, trend }}
 */
export function predictCostVariance(milestones, totalBudget = 85000000) {
  if (!milestones || milestones.length === 0) {
    return { varianceAmount: 0, variancePercent: 0, severity: 'On Budget', trend: 'stable' };
  }

  const totalVariance = milestones.reduce((s, m) => s + (m.costVariance || 0), 0);
  const variancePercent = parseFloat(((totalVariance / totalBudget) * 100).toFixed(2));

  let severity = 'On Budget';
  if (variancePercent > 15) severity = 'Critical Overrun';
  else if (variancePercent > 8) severity = 'Significant Overrun';
  else if (variancePercent > 3) severity = 'Minor Overrun';
  else if (variancePercent < -3) severity = 'Under Budget';

  const trend = totalVariance > 0 ? 'over' : totalVariance < 0 ? 'under' : 'stable';

  return { varianceAmount: totalVariance, variancePercent, severity, trend };
}

// ─── LIVE AI ALERTS GENERATOR ─────────────────────────────────────────────────
/**
 * Generates structured alert objects from live milestone state.
 * Used by RealTimeAnalyticsDashboard to replace static alerts.
 * @param {Array} milestones
 * @param {number} totalBudget
 * @returns {Array<{ type, icon, title, detail, tag, tagColor }>}
 */
export function generateAIAlerts(milestones, totalBudget = 85000000) {
  const alerts = [];
  const delay = predictDelay(milestones);
  const cost = predictCostVariance(milestones, totalBudget);

  if (delay.deviationDays > 0) {
    alerts.push({
      type: 'warning',
      icon: '⚠️',
      color: 'red',
      title: `SCHEDULE DEVIATION DETECTED — ${delay.riskLevel.toUpperCase()} RISK`,
      detail: `BuildFlow AI has identified a cumulative pipeline lag of <strong class="text-white">${delay.deviationDays} day(s)</strong> across active construction phases. ${delay.reasoning}`,
      tag: 'Action Advised',
      tagDetail: `Revised possession estimate: ${new Date(delay.newEstimate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`,
    });
  }

  if (cost.varianceAmount > 0) {
    const amountInL = (cost.varianceAmount / 100000).toFixed(2);
    alerts.push({
      type: 'warning',
      icon: '💸',
      color: 'amber',
      title: `COST VARIANCE ALERT — ${cost.severity.toUpperCase()}`,
      detail: `Material procurement and labour costs show a <strong class="text-white">₹${amountInL}L (${cost.variancePercent}%)</strong> overage against sanctioned budget. Primary driver: MEP phase material inflation and HVAC contractor revision.`,
      tag: 'Monitor',
      tagDetail: 'Review procurement schedule and enforce margin controls on pending POs.',
    });
  }

  const completed = milestones.filter((m) => m.status === 'Completed');
  if (completed.length > 0) {
    alerts.push({
      type: 'success',
      icon: '✅',
      color: 'emerald',
      title: `${completed.length} PHASE${completed.length > 1 ? 'S' : ''} COMPLETED — ALL INSPECTIONS CLEARED`,
      detail: `${completed.map((m) => m.phase).join(', ')} phase${completed.length > 1 ? 's have' : ' has'} passed all structural and compliance inspections. Documents are archived under the project registry.`,
      tag: 'Milestone Locked',
      tagDetail: 'Compliance certificates issued and stored.',
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      type: 'info',
      icon: '🔍',
      color: 'blue',
      title: 'AWAITING MILESTONE DATA',
      detail: 'No construction phases have been logged yet. BuildFlow AI will begin generating predictive alerts once site engineers submit the first milestone update.',
      tag: 'Standby',
      tagDetail: 'System ready.',
    });
  }

  return alerts;
}

// ─── PHASE COMPLETION CHART DATA ──────────────────────────────────────────────
/**
 * Produces bar chart data for phase-completion analytics.
 * @param {Array} milestones
 * @returns {Array<{ name, completion, target }>}
 */
export function getPhaseChartData(milestones) {
  return PHASES.map((phase) => {
    const ms = milestones?.find((m) => m.phase === phase);
    return {
      name: phase.slice(0, 5), // shorten for chart axis
      fullName: phase,
      completion: ms?.progressPercent || 0,
      target: 100,
      status: ms?.status || 'Pending',
    };
  });
}
