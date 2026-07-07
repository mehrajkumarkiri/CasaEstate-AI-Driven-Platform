import { useMemo } from 'react';

const RISK_CONFIG = {
  Low: {
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
    dot: 'bg-emerald-500',
    bar: 'bg-emerald-500',
    icon: '🟢',
    label: 'On Track',
  },
  Medium: {
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700',
    dot: 'bg-amber-500',
    bar: 'bg-amber-500',
    icon: '🟡',
    label: 'Moderate Risk',
  },
  High: {
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700',
    dot: 'bg-orange-500',
    bar: 'bg-orange-500',
    icon: '🔴',
    label: 'High Risk',
  },
  Critical: {
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    dot: 'bg-red-500 animate-pulse',
    bar: 'bg-red-500',
    icon: '🆘',
    label: 'Critical',
  },
};

function MetricCard({ title, value, subtitle, icon, color }) {
  return (
    <div className="bg-white dark:bg-stone-800 border border-slate-200 dark:border-stone-700 rounded-xl p-4 text-left">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-base">{icon}</span>
        <span className="text-[10px] font-extrabold text-slate-400 dark:text-stone-500 uppercase tracking-wider">{title}</span>
      </div>
      <p className={`text-xl font-extrabold ${color || 'text-slate-900 dark:text-white'}`}>{value}</p>
      {subtitle && <p className="text-[10px] text-slate-400 dark:text-stone-500 mt-0.5 font-medium">{subtitle}</p>}
    </div>
  );
}

function RiskGauge({ riskLevel }) {
  const cfg = RISK_CONFIG[riskLevel] || RISK_CONFIG.Low;
  const levels = ['Low', 'Medium', 'High', 'Critical'];
  const idx = levels.indexOf(riskLevel);

  return (
    <div className={`border rounded-xl p-4 text-left ${cfg.bg}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
        <span className="text-[10px] font-extrabold text-slate-600 dark:text-stone-300 uppercase tracking-wider">Schedule Risk</span>
      </div>
      <div className="flex items-end gap-2 mb-3">
        <span className={`text-2xl font-extrabold ${cfg.color}`}>{riskLevel}</span>
        <span className="text-xs text-slate-500 dark:text-stone-400 mb-0.5">{cfg.label}</span>
      </div>
      {/* Gauge bars */}
      <div className="flex gap-1 h-2">
        {levels.map((l, i) => (
          <div
            key={l}
            className={`flex-1 rounded-full transition-all duration-500 ${
              i <= idx ? cfg.bar : 'bg-slate-200 dark:bg-stone-700'
            }`}
          />
        ))}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[8px] text-slate-400 dark:text-stone-600 font-semibold">LOW</span>
        <span className="text-[8px] text-slate-400 dark:text-stone-600 font-semibold">CRITICAL</span>
      </div>
    </div>
  );
}

function AlertStream({ alerts }) {
  if (!alerts || alerts.length === 0) return null;
  return (
    <div className="bg-slate-50 dark:bg-stone-900 border border-slate-200 dark:border-stone-700 rounded-xl p-4 text-left">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
        <span className="text-[10px] font-extrabold text-slate-500 dark:text-stone-400 uppercase tracking-wider">AI Alert Stream</span>
      </div>
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {alerts.map((alert, i) => (
          <div key={i} className={`flex items-start gap-2 text-xs py-2 border-b border-slate-100 dark:border-stone-800 last:border-0 ${
            alert.type === 'deviation' ? 'text-amber-700 dark:text-amber-400' :
            alert.type === 'overrun' ? 'text-red-700 dark:text-red-400' :
            'text-slate-600 dark:text-stone-400'
          }`}>
            <span className="text-sm flex-shrink-0">{alert.icon}</span>
            <div>
              <p className="font-semibold">{alert.title}</p>
              <p className="text-[10px] opacity-80">{alert.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * AIPredictiveDashboard — Predictive analytics panel for BuildFlow AI
 * @param {Object} delayPrediction - { riskLevel, deviationDays, newEstimate, reasoning }
 * @param {Object} costAnalysis - { varianceAmount, variancePercent, severity }
 * @param {Array} milestones - Milestone array for computing metrics
 * @param {string} originalPossessionDate - ISO date string
 */
export default function AIPredictiveDashboard({
  delayPrediction = {},
  costAnalysis = {},
  milestones = [],
  originalPossessionDate,
}) {
  const riskLevel = delayPrediction.riskLevel || 'Low';
  const deviationDays = delayPrediction.deviationDays || 0;
  const newEstimate = delayPrediction.newEstimate ? new Date(delayPrediction.newEstimate) : null;
  const originalDate = originalPossessionDate ? new Date(originalPossessionDate) : null;

  const overallProgress = useMemo(() => {
    if (!milestones.length) return 0;
    return Math.round(milestones.reduce((s, m) => s + (m.progressPercent || 0), 0) / milestones.length);
  }, [milestones]);

  const daysToCompletion = useMemo(() => {
    if (!newEstimate) return '—';
    const diff = Math.ceil((newEstimate - new Date()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? `${diff} days` : 'Overdue';
  }, [newEstimate]);

  // Build alert stream from analysis
  const alerts = useMemo(() => {
    const list = [];
    if (deviationDays > 7) {
      list.push({
        type: 'deviation', icon: '🚨',
        title: `Schedule Deviation Detected`,
        message: `+${deviationDays} day(s) behind target. ${delayPrediction.reasoning || ''}`,
      });
    }
    if (costAnalysis.varianceAmount > 0) {
      list.push({
        type: 'overrun', icon: '💸',
        title: `Cost Variance: ${costAnalysis.severity}`,
        message: `₹${Math.abs(costAnalysis.varianceAmount).toLocaleString('en-IN')} (${costAnalysis.variancePercent}% deviation from budget)`,
      });
    }
    if (deviationDays === 0 && costAnalysis.varianceAmount <= 0) {
      list.push({
        type: 'success', icon: '✅',
        title: 'All systems nominal',
        message: 'No scheduling or cost deviations detected. Project is on track.',
      });
    }
    return list;
  }, [deviationDays, costAnalysis, delayPrediction.reasoning]);

  const costSeverityColor =
    costAnalysis.severity === 'On Budget' || costAnalysis.severity === 'Under Budget'
      ? 'text-emerald-600 dark:text-emerald-400'
      : costAnalysis.severity?.includes('Critical')
      ? 'text-red-600 dark:text-red-400'
      : 'text-amber-600 dark:text-amber-400';

  return (
    <div className="space-y-4 text-left">
      {/* Section label */}
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
        <span className="text-[10px] font-extrabold text-slate-500 dark:text-stone-400 uppercase tracking-wider">
          BuildFlow AI — Predictive Engine
        </span>
      </div>

      {/* Metric cards grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <MetricCard
          title="Overall Progress"
          value={`${overallProgress}%`}
          subtitle="Across all phases"
          icon="📊"
          color="text-blue-600 dark:text-blue-400"
        />
        <MetricCard
          title="Est. Days Left"
          value={daysToCompletion}
          subtitle={newEstimate ? `ETA: ${newEstimate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}` : 'No target set'}
          icon="📅"
          color={deviationDays > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}
        />
        <MetricCard
          title="Cost Status"
          value={costAnalysis.severity || 'On Budget'}
          subtitle={costAnalysis.varianceAmount ? `₹${Math.abs(costAnalysis.varianceAmount).toLocaleString('en-IN')} variance` : 'No variance'}
          icon="💰"
          color={costSeverityColor}
        />
      </div>

      {/* Risk gauge */}
      <RiskGauge riskLevel={riskLevel} />

      {/* Original vs Revised date */}
      {(originalDate || newEstimate) && (
        <div className="bg-white dark:bg-stone-800 border border-slate-200 dark:border-stone-700 rounded-xl p-4">
          <p className="text-[10px] font-extrabold text-slate-400 dark:text-stone-500 uppercase tracking-wider mb-3">Possession Date Forecast</p>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-[10px] text-slate-400 dark:text-stone-500 mb-0.5">Original Target</p>
              <p className="text-sm font-bold text-slate-700 dark:text-stone-300">
                {originalDate ? originalDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'}
              </p>
            </div>
            <span className="text-slate-300 dark:text-stone-600 text-lg">→</span>
            <div className="flex-1">
              <p className="text-[10px] text-slate-400 dark:text-stone-500 mb-0.5">AI Revised Estimate</p>
              <p className={`text-sm font-extrabold ${deviationDays > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {newEstimate ? newEstimate.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'}
              </p>
            </div>
            {deviationDays > 0 && (
              <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700 whitespace-nowrap">
                +{deviationDays}d
              </span>
            )}
          </div>
        </div>
      )}

      {/* Alert stream */}
      <AlertStream alerts={alerts} />

      {/* Reasoning */}
      {delayPrediction.reasoning && (
        <div className="bg-slate-50 dark:bg-stone-900/50 border border-slate-100 dark:border-stone-800 rounded-xl p-3">
          <p className="text-[9px] font-bold text-slate-400 dark:text-stone-500 uppercase tracking-wider mb-1">AI Reasoning</p>
          <p className="text-xs text-slate-600 dark:text-stone-400 italic">{delayPrediction.reasoning}</p>
        </div>
      )}
    </div>
  );
}
