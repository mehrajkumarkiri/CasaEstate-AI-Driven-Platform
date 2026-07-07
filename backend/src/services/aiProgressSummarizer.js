/**
 * AI Progress Summarizer Service — BuildFlow AI
 * Converts raw engineer notes and milestone states into:
 *  1. Client-facing narrative summaries
 *  2. Delay predictions
 *  3. Cost variance assessments
 *
 * Uses deterministic mock logic (no external API required).
 * In production: swap with Vertex AI / Gemini API call.
 */

const PHASE_LABELS = {
  Foundation: 'foundation and excavation works',
  Framing: 'structural framing and concrete pouring',
  MEP: 'mechanical, electrical, and plumbing installations',
  Finishing: 'interior finishing, flooring, and façade work',
  Handover: 'pre-handover inspections and snagging',
};

const RISK_THRESHOLDS = { Low: 7, Medium: 21, High: 45 };

/**
 * Synthesizes raw engineer data into a client-friendly progress narrative.
 * @param {Array} milestones - Array of Milestone documents
 * @returns {string} - Human-readable paragraph for client portal
 */
function synthesizeProgressReport(milestones) {
  if (!milestones || milestones.length === 0) {
    return 'No construction data has been logged for this project yet. Your site engineer will begin uploading progress reports shortly.';
  }

  const completed = milestones.filter((m) => m.status === 'Completed');
  const inProgress = milestones.find((m) => m.status === 'In Progress');
  const delayed = milestones.filter((m) => m.status === 'Delayed');
  const totalProgress = Math.round(
    milestones.reduce((sum, m) => sum + (m.progressPercent || 0), 0) / milestones.length
  );

  let summary = `📊 **BuildFlow AI — Project Progress Summary**\n\n`;

  // Overall status
  summary += `Your project is currently **${totalProgress}% complete** across all construction phases. `;

  // Completed phases
  if (completed.length > 0) {
    const phaseNames = completed.map((m) => PHASE_LABELS[m.phase] || m.phase).join(', ');
    summary += `The team has successfully completed ${phaseNames}. `;
  }

  // Active phase
  if (inProgress) {
    const notes = inProgress.engineerNotes
      ? `The site engineer's latest log reads: "${inProgress.engineerNotes.slice(0, 120)}${inProgress.engineerNotes.length > 120 ? '…' : ''}". `
      : '';
    summary += `Work is actively underway on ${PHASE_LABELS[inProgress.phase] || inProgress.phase} at ${inProgress.progressPercent}% completion. ${notes}`;
  }

  // Delays
  if (delayed.length > 0) {
    const delayedNames = delayed.map((m) => PHASE_LABELS[m.phase] || m.phase).join(' and ');
    const maxDeviation = Math.max(...delayed.map((m) => m.deviationDays || 0));
    summary += `⚠️ There is a reported delay affecting ${delayedNames}, currently estimated at ${maxDeviation} day(s) behind schedule. `;
    summary += `Our AI engine has automatically flagged this for management review and is recalibrating the project timeline. `;
  }

  // Positive close
  if (delayed.length === 0 && inProgress) {
    summary += `All phases are currently tracking on or ahead of schedule. `;
  }

  summary += `\n\n_Last updated by BuildFlow AI on ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}._`;

  return summary;
}

/**
 * Predicts delay risk and estimated possession date deviation.
 * @param {Array} milestones - Array of Milestone documents
 * @param {Date|string} targetDate - Original possession target date
 * @returns {{ riskLevel: string, deviationDays: number, newEstimate: Date, reasoning: string }}
 */
function predictDelay(milestones, targetDate) {
  if (!milestones || milestones.length === 0) {
    return { riskLevel: 'Low', deviationDays: 0, newEstimate: new Date(targetDate), reasoning: 'Insufficient data for prediction.' };
  }

  const delayed = milestones.filter((m) => m.status === 'Delayed');
  const pending = milestones.filter((m) => m.status === 'Pending' && m.targetDate && new Date(m.targetDate) < new Date());
  const avgProgress = milestones.reduce((s, m) => s + (m.progressPercent || 0), 0) / milestones.length;

  // Base deviation: sum of logged deviation days
  let totalDeviation = delayed.reduce((sum, m) => sum + (m.deviationDays || 0), 0);

  // Add risk buffer for overdue pending phases
  totalDeviation += pending.length * 14;

  // Reduce risk if project is > 80% overall
  if (avgProgress > 80) totalDeviation = Math.floor(totalDeviation * 0.5);

  let riskLevel = 'Low';
  if (totalDeviation > RISK_THRESHOLDS.High) riskLevel = 'Critical';
  else if (totalDeviation > RISK_THRESHOLDS.Medium) riskLevel = 'High';
  else if (totalDeviation > RISK_THRESHOLDS.Low) riskLevel = 'Medium';

  const newEstimate = new Date(targetDate || Date.now());
  newEstimate.setDate(newEstimate.getDate() + totalDeviation);

  const reasoning =
    totalDeviation === 0
      ? 'All tracked milestones are on schedule. Possession date remains unchanged.'
      : `${delayed.length} delayed phase(s) and ${pending.length} overdue pending phase(s) contribute an estimated ${totalDeviation}-day deviation.`;

  return { riskLevel, deviationDays: totalDeviation, newEstimate, reasoning };
}

/**
 * Predicts cost variance against a given budget.
 * @param {Array} milestones - Array of Milestone documents
 * @param {number} budget - Original approved project budget (INR)
 * @returns {{ varianceAmount: number, variancePercent: number, severity: string }}
 */
function predictCostVariance(milestones, budget) {
  if (!milestones || milestones.length === 0 || !budget) {
    return { varianceAmount: 0, variancePercent: 0, severity: 'On Budget' };
  }

  const totalVariance = milestones.reduce((sum, m) => sum + (m.costVariance || 0), 0);
  const variancePercent = budget > 0 ? ((totalVariance / budget) * 100).toFixed(2) : 0;

  let severity = 'On Budget';
  if (Math.abs(totalVariance) > budget * 0.1) severity = 'Critical Overrun';
  else if (Math.abs(totalVariance) > budget * 0.05) severity = 'Moderate Overrun';
  else if (totalVariance > 0) severity = 'Minor Overrun';
  else if (totalVariance < 0) severity = 'Under Budget';

  return { varianceAmount: totalVariance, variancePercent: parseFloat(variancePercent), severity };
}

module.exports = { synthesizeProgressReport, predictDelay, predictCostVariance };
