import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { milestonesApi } from '../services/milestoneApi';
import MilestoneTimeline from '../components/MilestoneTimeline';
import AIPredictiveDashboard from '../components/AIPredictiveDashboard';

const PHASES = ['Foundation', 'Framing', 'MEP', 'Finishing', 'Handover'];
const STATUSES = ['Pending', 'In Progress', 'Completed', 'Delayed'];

// Mock projects list for the engineer to select from
const MOCK_PROJECTS = [
  { id: 'proj-001', name: 'Casa Horizon', location: 'Sector 62, Noida', budget: 850000000 },
  { id: 'proj-002', name: 'Casa Serenity', location: 'Golf Course Rd, Gurugram', budget: 420000000 },
  { id: 'proj-003', name: 'Casa Pinnacle', location: 'Andheri East, Mumbai', budget: 1200000000 },
];

function StatBadge({ label, value, color }) {
  return (
    <div className={`flex flex-col items-center px-4 py-3 rounded-xl border ${color}`}>
      <span className="text-lg font-extrabold">{value}</span>
      <span className="text-[9px] font-bold uppercase tracking-wider opacity-70 mt-0.5">{label}</span>
    </div>
  );
}

function ResourceRow({ resource, onRemove }) {
  return (
    <div className="flex items-center gap-2 bg-slate-50 dark:bg-stone-800 border border-slate-200 dark:border-stone-700 rounded-lg px-3 py-2 text-xs">
      <span className="flex-1 font-semibold text-slate-800 dark:text-stone-200">{resource.name}</span>
      <span className="text-slate-500 dark:text-stone-400">{resource.quantity} {resource.unit}</span>
      <button
        onClick={onRemove}
        className="text-red-400 hover:text-red-600 font-bold ml-2 transition-colors"
        title="Remove"
      >×</button>
    </div>
  );
}

export default function SiteEngineerPortal() {
  const { pushNotification } = useApp();
  const [activeTab, setActiveTab] = useState('logger');
  const [milestones, setMilestones] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Logger form state
  const [selectedProject, setSelectedProject] = useState(MOCK_PROJECTS[0]);
  const [form, setForm] = useState({
    phase: 'Foundation',
    status: 'In Progress',
    progressPercent: 50,
    engineerNotes: '',
    targetDate: '',
    deviationDays: 0,
    costVariance: 0,
    updatedByName: 'Rajesh Kumar (Site Engineer)',
    updatedByEmail: 'rajesh.kumar@buildflow.ai',
  });

  // Resources
  const [resources, setResources] = useState([]);
  const [resForm, setResForm] = useState({ name: '', quantity: '', unit: 'bags' });

  // Daily reports
  const [dailyLogs, setDailyLogs] = useState([
    { date: new Date(Date.now() - 86400000 * 2).toLocaleDateString('en-IN'), note: 'Concrete pour complete on floor 18. MEP rough-in at 55%. 42 workers on site.', phase: 'MEP', progress: 55 },
    { date: new Date(Date.now() - 86400000).toLocaleDateString('en-IN'), note: 'Fire suppression permit obtained. HVAC contractor mobilized. Electrical inspection pending.', phase: 'MEP', progress: 60 },
    { date: new Date().toLocaleDateString('en-IN'), note: 'Plumbing risers connected to floors 19–22. Electrical conduit inspection passed. Team strength: 48.', phase: 'MEP', progress: 62 },
  ]);
  const [newLog, setNewLog] = useState('');

  // Load milestones when project changes
  useEffect(() => {
    loadData();
  }, [selectedProject]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [msRes, sumRes] = await Promise.all([
        milestonesApi.getAll(selectedProject.id),
        milestonesApi.getSummary(selectedProject.id, selectedProject.budget),
      ]);
      setMilestones(msRes.data?.data || []);
      setSummary(sumRes.data?.data || null);
    } catch {
      // Fall through to mock data — API not connected
      setMilestones([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddResource = () => {
    if (!resForm.name || !resForm.quantity) return;
    setResources((prev) => [...prev, { ...resForm, quantity: parseFloat(resForm.quantity) }]);
    setResForm({ name: '', quantity: '', unit: 'bags' });
  };

  const handleSubmitMilestone = async () => {
    if (!form.engineerNotes.trim()) {
      pushNotification({ type: 'warning', title: 'Notes Required', message: 'Please enter engineer field notes before submitting.' });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        projectId: selectedProject.id,
        projectName: selectedProject.name,
        ...form,
        progressPercent: parseInt(form.progressPercent),
        deviationDays: parseInt(form.deviationDays),
        costVariance: parseInt(form.costVariance),
        resources,
      };

      // Try real API, fall back gracefully
      let result;
      try {
        const res = await milestonesApi.create(payload);
        result = res.data?.data;
      } catch {
        // Mock success
        result = { ...payload, _id: `ms-mock-${Date.now()}` };
      }

      pushNotification({
        type: 'success',
        title: '🏗️ BuildFlow AI — Milestone Logged',
        message: `${form.phase} phase updated to ${form.status} (${form.progressPercent}%). AI re-analysis triggered.`,
      });

      // Simulate AI notification for deviations
      if (parseInt(form.deviationDays) > 7) {
        setTimeout(() => {
          pushNotification({
            type: 'error',
            title: '🚨 AI Alert: Schedule Deviation',
            message: `${form.phase} is +${form.deviationDays} days behind. Predictive engine flagging risk for client notification.`,
          });
        }, 1500);
      }

      // Reset and reload
      setForm((prev) => ({ ...prev, engineerNotes: '', progressPercent: 50, deviationDays: 0, costVariance: 0 }));
      setResources([]);
      await loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddLog = () => {
    if (!newLog.trim()) return;
    setDailyLogs((prev) => [
      ...prev,
      {
        date: new Date().toLocaleDateString('en-IN'),
        note: newLog,
        phase: form.phase,
        progress: parseInt(form.progressPercent),
      },
    ]);
    setNewLog('');
    pushNotification({ type: 'success', title: '📋 Daily Log Added', message: 'Site activity log recorded and synced.' });
  };

  const tabs = [
    { key: 'logger', label: '📋 Milestone Logger' },
    { key: 'resources', label: '🔧 Resource Tracker' },
    { key: 'reports', label: '📊 Daily Reports' },
    { key: 'analytics', label: '🤖 AI Analytics' },
  ];

  const activeMilestone = milestones.find((m) => m.status === 'In Progress') || milestones[0];
  const completedCount = milestones.filter((m) => m.status === 'Completed').length;
  const delayedCount = milestones.filter((m) => m.status === 'Delayed').length;

  return (
    <div className="pt-16 min-h-screen bg-slate-50 dark:bg-stone-950">
      {/* ── Header ── */}
      <div className="bg-white dark:bg-stone-900 border-b border-slate-200 dark:border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-left">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-extrabold uppercase tracking-wider">
                  Field Operations Console · LIVE
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                BuildFlow AI — Site Engineer Portal
              </h1>
              <p className="text-xs font-semibold text-slate-500 dark:text-stone-400 mt-0.5">
                Log milestones, track resources, and trigger AI analysis in real time
              </p>
            </div>
            {/* Project selector */}
            <div className="flex flex-col items-end gap-2">
              <label className="text-[10px] font-bold text-slate-400 dark:text-stone-500 uppercase tracking-wider">Active Project</label>
              <select
                value={selectedProject.id}
                onChange={(e) => setSelectedProject(MOCK_PROJECTS.find((p) => p.id === e.target.value))}
                className="text-sm font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-stone-800 border border-slate-200 dark:border-stone-700 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {MOCK_PROJECTS.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <span className="text-[10px] text-slate-400 dark:text-stone-500">{selectedProject.location}</span>
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex flex-wrap gap-3 mt-5">
            <StatBadge label="Total Phases" value={5} color="bg-slate-50 dark:bg-stone-800 border-slate-200 dark:border-stone-700 text-slate-700 dark:text-stone-300" />
            <StatBadge label="Completed" value={completedCount} color="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400" />
            <StatBadge label="In Progress" value={milestones.filter((m) => m.status === 'In Progress').length} color="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400" />
            <StatBadge label="Delayed" value={delayedCount} color={`bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-400 ${delayedCount > 0 ? 'ring-1 ring-amber-300' : ''}`} />
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="border-b border-slate-200 dark:border-stone-800 bg-white dark:bg-stone-900 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-1 overflow-x-auto scrollbar-hide">
          {tabs.map((t) => (
            <button
              key={t.key}
              id={`engineer-tab-${t.key}`}
              onClick={() => setActiveTab(t.key)}
              className={`text-xs font-semibold px-4 py-3.5 border-b-2 whitespace-nowrap transition-all duration-150 -mb-px ${
                activeTab === t.key
                  ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
                  : 'text-slate-500 dark:text-stone-400 border-transparent hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* ── MILESTONE LOGGER ── */}
        {activeTab === 'logger' && (
          <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-700 rounded-2xl p-6 text-left shadow-sm">
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-5">
                  Log Milestone Update
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phase */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-stone-400 mb-1.5 uppercase tracking-wider">Construction Phase</label>
                    <select
                      value={form.phase}
                      onChange={(e) => handleFormChange('phase', e.target.value)}
                      className="w-full text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-stone-800 border border-slate-200 dark:border-stone-700 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {PHASES.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-stone-400 mb-1.5 uppercase tracking-wider">Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => handleFormChange('status', e.target.value)}
                      className="w-full text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-stone-800 border border-slate-200 dark:border-stone-700 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  {/* Progress */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-600 dark:text-stone-400 mb-1.5 uppercase tracking-wider">
                      Progress Completion — {form.progressPercent}%
                    </label>
                    <input
                      type="range" min="0" max="100" step="5"
                      value={form.progressPercent}
                      onChange={(e) => handleFormChange('progressPercent', e.target.value)}
                      className="w-full accent-blue-600"
                    />
                    <div className="flex justify-between text-[9px] text-slate-400 dark:text-stone-600 mt-0.5">
                      <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
                    </div>
                  </div>

                  {/* Target Date */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-stone-400 mb-1.5 uppercase tracking-wider">Target Completion Date</label>
                    <input
                      type="date"
                      value={form.targetDate}
                      onChange={(e) => handleFormChange('targetDate', e.target.value)}
                      className="w-full text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-stone-800 border border-slate-200 dark:border-stone-700 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Deviation Days */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-stone-400 mb-1.5 uppercase tracking-wider">Deviation (Days Behind)</label>
                    <input
                      type="number" min="0"
                      value={form.deviationDays}
                      onChange={(e) => handleFormChange('deviationDays', e.target.value)}
                      placeholder="0"
                      className="w-full text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-stone-800 border border-slate-200 dark:border-stone-700 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Cost Variance */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-stone-400 mb-1.5 uppercase tracking-wider">Cost Variance (₹)</label>
                    <input
                      type="number"
                      value={form.costVariance}
                      onChange={(e) => handleFormChange('costVariance', e.target.value)}
                      placeholder="0"
                      className="w-full text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-stone-800 border border-slate-200 dark:border-stone-700 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Engineer name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-stone-400 mb-1.5 uppercase tracking-wider">Engineer Name</label>
                    <input
                      type="text"
                      value={form.updatedByName}
                      onChange={(e) => handleFormChange('updatedByName', e.target.value)}
                      className="w-full text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-stone-800 border border-slate-200 dark:border-stone-700 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Notes */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-600 dark:text-stone-400 mb-1.5 uppercase tracking-wider">Field Notes (Raw Log) *</label>
                    <textarea
                      rows={4}
                      value={form.engineerNotes}
                      onChange={(e) => handleFormChange('engineerNotes', e.target.value)}
                      placeholder="Enter raw site observations, material usage, issues encountered, safety notes..."
                      className="w-full text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-stone-800 border border-slate-200 dark:border-stone-700 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    <p className="text-[9px] text-slate-400 dark:text-stone-500 mt-1">
                      These raw notes will be synthesized by the BuildFlow AI engine into client-facing summaries.
                    </p>
                  </div>
                </div>

                {/* Submit */}
                <button
                  id="submit-milestone-btn"
                  onClick={handleSubmitMilestone}
                  disabled={submitting}
                  className="mt-5 w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white text-sm font-extrabold
                    hover:bg-blue-700 disabled:opacity-60 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  {submitting ? (
                    <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Triggering AI Analysis...</>
                  ) : (
                    <><span>🏗️</span> Log Milestone & Trigger AI</>
                  )}
                </button>
              </div>
            </div>

            {/* Live timeline sidebar */}
            <div className="space-y-4">
              <div className="bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-700 rounded-2xl p-5 shadow-sm">
                <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Live Project Timeline</h3>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <span className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                  </div>
                ) : (
                  <MilestoneTimeline milestones={milestones} compact />
                )}
              </div>

              {/* Active phase detail */}
              {activeMilestone && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 text-left">
                  <p className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">Active Phase</p>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white">{activeMilestone.phase}</p>
                  <p className="text-xs text-slate-600 dark:text-stone-400 mt-1">{activeMilestone.progressPercent}% complete</p>
                  {activeMilestone.engineerNotes && (
                    <p className="text-[10px] text-slate-500 dark:text-stone-500 mt-2 italic leading-relaxed line-clamp-3">
                      "{activeMilestone.engineerNotes}"
                    </p>
                  )}
                  <p className="text-[9px] text-blue-500 dark:text-blue-400 mt-2 font-semibold">
                    Last updated by {activeMilestone.updatedByName || 'Site Engineer'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── RESOURCE TRACKER ── */}
        {activeTab === 'resources' && (
          <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Add resource */}
            <div className="bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-700 rounded-2xl p-6 text-left shadow-sm">
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-5">Log Resource Usage</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-stone-400 mb-1.5 uppercase tracking-wider">Material Name</label>
                  <input type="text" value={resForm.name} onChange={(e) => setResForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="e.g., OPC 53 Cement, TMT Steel..."
                    className="w-full text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-stone-800 border border-slate-200 dark:border-stone-700 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-stone-400 mb-1.5 uppercase tracking-wider">Quantity</label>
                    <input type="number" value={resForm.quantity} onChange={(e) => setResForm((p) => ({ ...p, quantity: e.target.value }))}
                      placeholder="0"
                      className="w-full text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-stone-800 border border-slate-200 dark:border-stone-700 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-stone-400 mb-1.5 uppercase tracking-wider">Unit</label>
                    <select value={resForm.unit} onChange={(e) => setResForm((p) => ({ ...p, unit: e.target.value }))}
                      className="w-full text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-stone-800 border border-slate-200 dark:border-stone-700 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {['bags', 'MT', 'cum', 'meters', 'pcs', 'liters', 'KG', 'sqft'].map((u) => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </div>
                <button onClick={handleAddResource}
                  className="w-full px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-extrabold hover:bg-emerald-700 transition-colors"
                >
                  + Add Resource
                </button>
              </div>

              {/* Current session resources */}
              {resources.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-stone-500 uppercase tracking-wider">This Session</p>
                  {resources.map((r, i) => (
                    <ResourceRow key={i} resource={r} onRemove={() => setResources((prev) => prev.filter((_, j) => j !== i))} />
                  ))}
                </div>
              )}
            </div>

            {/* Historical resource usage from milestones */}
            <div className="bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-700 rounded-2xl p-6 text-left shadow-sm">
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-5">Cumulative Usage — {selectedProject.name}</h2>
              {milestones.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-stone-500 italic">No resource data logged yet.</p>
              ) : (
                <div className="space-y-4">
                  {milestones.filter((m) => m.resources?.length > 0).map((m) => (
                    <div key={m._id}>
                      <p className="text-[10px] font-extrabold text-slate-400 dark:text-stone-500 uppercase tracking-wider mb-2">{m.phase} Phase</p>
                      <div className="space-y-1.5">
                        {m.resources.map((r, i) => (
                          <div key={i} className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-stone-800 last:border-0">
                            <span className="text-xs font-semibold text-slate-700 dark:text-stone-300">{r.name}</span>
                            <span className="text-xs text-slate-500 dark:text-stone-400 font-bold">{r.quantity} {r.unit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── DAILY REPORTS ── */}
        {activeTab === 'reports' && (
          <div className="animate-fade-in space-y-4">
            {/* Add log */}
            <div className="bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-700 rounded-2xl p-6 text-left shadow-sm">
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Add Site Activity Log</h2>
              <textarea
                rows={3}
                value={newLog}
                onChange={(e) => setNewLog(e.target.value)}
                placeholder="Describe today's site activity, team strength, key observations..."
                className="w-full text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-stone-800 border border-slate-200 dark:border-stone-700 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-3"
              />
              <button onClick={handleAddLog}
                className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-extrabold hover:bg-blue-700 transition-colors"
              >
                + Save Daily Log
              </button>
            </div>

            {/* Log history */}
            <div className="bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-700 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-200 dark:border-stone-700 bg-slate-50 dark:bg-stone-800/50">
                <h3 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">Field Activity Log — {selectedProject.name}</h3>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-stone-800">
                {[...dailyLogs].reverse().map((log, i) => (
                  <div key={i} className="px-5 py-4 text-left hover:bg-slate-50 dark:hover:bg-stone-800/30 transition-colors">
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className="text-[10px] font-extrabold text-slate-400 dark:text-stone-500 uppercase tracking-wider">{log.date}</span>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">{log.phase}</span>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">{log.progress}%</span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-stone-300 leading-relaxed">{log.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── AI ANALYTICS ── */}
        {activeTab === 'analytics' && (
          <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-700 rounded-2xl p-6 shadow-sm">
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-5">AI Predictive Analytics</h2>
              <AIPredictiveDashboard
                milestones={milestones}
                delayPrediction={summary?.delayPrediction || {}}
                costAnalysis={summary?.costAnalysis || {}}
                originalPossessionDate={new Date(Date.now() + 86400000 * 150).toISOString()}
              />
            </div>
            <div className="space-y-4">
              <div className="bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-700 rounded-2xl p-5 shadow-sm">
                <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Project Timeline</h3>
                <MilestoneTimeline milestones={milestones} />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
