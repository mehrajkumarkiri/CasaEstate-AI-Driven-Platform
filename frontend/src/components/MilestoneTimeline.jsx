import { useMemo } from 'react';

const PHASES = [
  { key: 'Foundation', icon: '⛏️', label: 'Foundation', desc: 'Excavation & RCC piling' },
  { key: 'Framing', icon: '🏗️', label: 'Framing', desc: 'Structural slab & columns' },
  { key: 'MEP', icon: '⚡', label: 'MEP', desc: 'Mechanical, Electrical & Plumbing' },
  { key: 'Finishing', icon: '🎨', label: 'Finishing', desc: 'Interior, flooring & façade' },
  { key: 'Handover', icon: '🔑', label: 'Handover', desc: 'Inspection & possession' },
];

const STATUS_CONFIG = {
  'Completed': {
    ring: 'bg-emerald-500',
    text: 'text-emerald-600 dark:text-emerald-400',
    badge: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    connector: 'bg-emerald-500',
    label: 'Completed',
  },
  'In Progress': {
    ring: 'bg-blue-500 animate-pulse',
    text: 'text-blue-600 dark:text-blue-400',
    badge: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    connector: 'bg-slate-300 dark:bg-stone-600',
    label: 'In Progress',
  },
  'Delayed': {
    ring: 'bg-amber-500 animate-pulse',
    text: 'text-amber-600 dark:text-amber-400',
    badge: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700',
    connector: 'bg-slate-300 dark:bg-stone-600',
    label: 'Delayed',
  },
  'Pending': {
    ring: 'bg-slate-300 dark:bg-stone-600',
    text: 'text-slate-400 dark:text-stone-500',
    badge: 'bg-slate-100 dark:bg-stone-800 text-slate-500 dark:text-stone-400 border-slate-200 dark:border-stone-700',
    connector: 'bg-slate-200 dark:bg-stone-700',
    label: 'Pending',
  },
};

function ProgressRing({ percent, status }) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['Pending'];

  return (
    <div className="relative w-14 h-14 flex items-center justify-center">
      <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
        <circle cx="28" cy="28" r={r} strokeWidth="4" fill="none" className="stroke-slate-200 dark:stroke-stone-700" />
        <circle
          cx="28" cy="28" r={r} strokeWidth="4" fill="none"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          className={`transition-all duration-1000 ${
            status === 'Completed' ? 'stroke-emerald-500' :
            status === 'In Progress' ? 'stroke-blue-500' :
            status === 'Delayed' ? 'stroke-amber-500' : 'stroke-slate-300 dark:stroke-stone-600'
          }`}
        />
      </svg>
      <span className={`absolute text-[10px] font-extrabold ${cfg.text}`}>{percent}%</span>
    </div>
  );
}

/**
 * MilestoneTimeline — Reusable animated construction phase stepper
 * @param {Array} milestones - Array of milestone data objects
 * @param {boolean} compact - Compact mode for embedded views
 */
export default function MilestoneTimeline({ milestones = [], compact = false }) {
  // Map milestone data by phase key for fast lookup
  const milestoneMap = useMemo(() => {
    const map = {};
    milestones.forEach((m) => { map[m.phase] = m; });
    return map;
  }, [milestones]);

  // Overall project progress
  const overallProgress = useMemo(() => {
    if (!milestones.length) return 0;
    return Math.round(milestones.reduce((s, m) => s + (m.progressPercent || 0), 0) / milestones.length);
  }, [milestones]);

  const completedCount = milestones.filter((m) => m.status === 'Completed').length;

  return (
    <div className="w-full">
      {/* Header bar */}
      {!compact && (
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              Construction Timeline
            </h3>
            <p className="text-xs text-slate-500 dark:text-stone-400 mt-0.5">
              {completedCount} of {PHASES.length} phases completed
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-stone-800 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-700 dark:text-stone-300">{overallProgress}% Overall</span>
          </div>
        </div>
      )}

      {/* Overall progress bar */}
      <div className="h-1.5 bg-slate-200 dark:bg-stone-700 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 via-emerald-500 to-emerald-600 rounded-full transition-all duration-1000"
          style={{ width: `${overallProgress}%` }}
        />
      </div>

      {/* Phase steps */}
      <div className="relative">
        {/* Connector line */}
        <div className="absolute top-7 left-7 right-7 h-0.5 bg-slate-200 dark:bg-stone-700 hidden sm:block" />

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-2">
          {PHASES.map((phase, idx) => {
            const m = milestoneMap[phase.key];
            const status = m?.status || 'Pending';
            const progress = m?.progressPercent || 0;
            const cfg = STATUS_CONFIG[status];

            return (
              <div key={phase.key} className="flex-1 flex flex-col items-center text-center relative">
                {/* Phase node */}
                <div className="relative z-10 mb-2">
                  <ProgressRing percent={progress} status={status} />
                </div>

                {/* Phase icon label */}
                <div className="text-base mb-1">{phase.icon}</div>

                {/* Phase name */}
                <p className={`text-xs font-extrabold mb-0.5 ${
                  status === 'Pending' ? 'text-slate-400 dark:text-stone-500' : 'text-slate-900 dark:text-white'
                }`}>
                  {phase.label}
                </p>

                {/* Description (hide in compact) */}
                {!compact && (
                  <p className="text-[9px] text-slate-400 dark:text-stone-500 mb-2 leading-tight px-1">
                    {phase.desc}
                  </p>
                )}

                {/* Status badge */}
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${cfg.badge}`}>
                  {cfg.label}
                </span>

                {/* Engineer note preview — only on non-compact */}
                {!compact && m?.engineerNotes && (
                  <p className="text-[9px] text-slate-400 dark:text-stone-500 mt-1.5 line-clamp-2 px-1 italic leading-tight">
                    "{m.engineerNotes.slice(0, 60)}{m.engineerNotes.length > 60 ? '…' : ''}"
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      {!compact && (
        <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-stone-800">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${cfg.ring.split(' ')[0]}`} />
              <span className="text-[10px] font-semibold text-slate-500 dark:text-stone-400">{cfg.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
