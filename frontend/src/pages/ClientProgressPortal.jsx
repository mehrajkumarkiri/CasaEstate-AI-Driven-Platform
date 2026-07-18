import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { milestonesApi } from '../services/milestoneApi';
import { bookingsApi } from '../services/api';
import MilestoneTimeline from '../components/MilestoneTimeline';
import AIPredictiveDashboard from '../components/AIPredictiveDashboard';
import CasaOpsSwarmConsole from '../components/CasaOpsSwarmConsole';
import WorkflowDashboard from './WorkflowDashboard';
import { formatCurrency, formatDate } from '../utils/formatters';

// Static project list (matches what engineer sees)
const PROJECTS = [
  { id: 'proj-001', name: 'Casa Horizon', location: 'Sector 62, Noida', possessionDate: new Date(Date.now() + 86400000 * 150).toISOString(), budget: 850000000 },
  { id: 'proj-002', name: 'Casa Serenity', location: 'Golf Course Rd, Gurugram', possessionDate: new Date(Date.now() + 86400000 * 240).toISOString(), budget: 420000000 },
  { id: 'proj-003', name: 'Casa Pinnacle', location: 'Andheri East, Mumbai', possessionDate: new Date(Date.now() + 86400000 * 90).toISOString(), budget: 1200000000 },
];

// Payment schedule mock
const PAYMENT_SCHEDULE = [
  { label: 'Token Amount', percent: 2, status: 'Paid', date: new Date(Date.now() - 86400000 * 90).toISOString(), amount: 196000 },
  { label: 'Foundation Complete', percent: 10, status: 'Paid', date: new Date(Date.now() - 86400000 * 30).toISOString(), amount: 980000 },
  { label: 'Slab Level 5', percent: 15, status: 'Pending', date: new Date(Date.now() + 86400000 * 30).toISOString(), amount: 1470000 },
  { label: 'Slab Level 10', percent: 15, status: 'Upcoming', date: new Date(Date.now() + 86400000 * 90).toISOString(), amount: 1470000 },
  { label: 'MEP Completion', percent: 10, status: 'Upcoming', date: new Date(Date.now() + 86400000 * 150).toISOString(), amount: 980000 },
  { label: 'Finishing & Handover', percent: 48, status: 'Upcoming', date: new Date(Date.now() + 86400000 * 210).toISOString(), amount: 4704000 },
];

// Ticker alerts that stream across the top
const TICKER_ALERTS = [
  '🏗️ Foundation phase COMPLETED for Casa Horizon Tower A',
  '⚡ MEP installation at 62% — on schedule',
  '🤖 AI Engine: No scheduling deviations detected in last 48 hours',
  '📦 Material delivery: 2400 bags of cement received at Noida site',
  '✅ Structural inspection passed for floors 1–18',
  '🔔 Maintenance reminder: Monthly payment due in 5 days',
];

function NotificationTicker({ alerts }) {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((prev) => (prev + 1) % alerts.length);
        setVisible(true);
      }, 400);
    }, 4000);
    return () => clearInterval(interval);
  }, [alerts.length]);

  return (
    <div className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 flex items-center gap-3 overflow-hidden">
      <span className="text-[10px] font-extrabold uppercase tracking-widest opacity-80 flex-shrink-0">LIVE</span>
      <span className="w-px h-3 bg-white/30" />
      <p
        className={`text-xs font-semibold transition-all duration-400 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}`}
        style={{ transitionDuration: '300ms' }}
      >
        {alerts[idx]}
      </p>
    </div>
  );
}

function PaymentRow({ item, index }) {
  const statusConfig = {
    Paid: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    Pending: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700',
    Upcoming: 'bg-slate-100 dark:bg-stone-800 text-slate-500 dark:text-stone-400 border-slate-200 dark:border-stone-700',
  };
  return (
    <div className={`flex items-center gap-3 py-3 border-b border-slate-100 dark:border-stone-800 last:border-0 ${
      item.status === 'Pending' ? 'bg-amber-50/30 dark:bg-amber-900/5' : ''
    }`}>
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-extrabold flex-shrink-0 ${
        item.status === 'Paid' ? 'bg-emerald-500 text-white' :
        item.status === 'Pending' ? 'bg-amber-400 text-white' : 'bg-slate-200 dark:bg-stone-700 text-slate-500 dark:text-stone-400'
      }`}>
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-slate-800 dark:text-stone-200">{item.label}</p>
        <p className="text-[10px] text-slate-400 dark:text-stone-500">{formatDate(item.date)} · {item.percent}% of total</p>
      </div>
      <div className="text-right">
        <p className="text-xs font-extrabold text-slate-900 dark:text-white">{formatCurrency(item.amount)}</p>
        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${statusConfig[item.status]}`}>{item.status}</span>
      </div>
    </div>
  );
}

export default function ClientProgressPortal() {
  const { currentUser, pushNotification } = useApp();
  const [activeTab, setActiveTab] = useState('progress');
  const [selectedProject, setSelectedProject] = useState(PROJECTS[0]);
  const [milestones, setMilestones] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [botConsoleMessages, setBotConsoleMessages] = useState([
    { type: 'bot', text: 'CasaBot Agent Node initialized. Ready to execute pipeline optimization prompts.' }
  ]);
  const [botConsoleLoading, setBotConsoleLoading] = useState(false);
  const terminalEndRef = useRef(null);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [botConsoleMessages]);

  const handleConsoleAction = (prompt, reply) => {
    setBotConsoleLoading(true);
    setBotConsoleMessages(prev => [...prev, { type: 'user', text: prompt }]);
    setTimeout(() => {
      setBotConsoleMessages(prev => [...prev, { type: 'bot', text: reply }]);
      setBotConsoleLoading(false);
      pushNotification({
        type: 'success',
        title: `🤖 CasaBot: ${prompt} Complete`,
        message: 'Telemetry metrics updated.'
      });
    }, 1500);
  };

  useEffect(() => {
    loadProjectData();
  }, [selectedProject]);

  const MOCK_PROJECT_MILESTONES = {
    'proj-001': [
      { _id: 'ms-001', phase: 'Foundation', status: 'Completed', progressPercent: 100, engineerNotes: 'RCC piling complete. Raft foundation poured and cured. Soil test reports approved by structural consultant.', updatedByName: 'Rajesh Kumar (Site Engineer)' },
      { _id: 'ms-002', phase: 'Framing', status: 'Completed', progressPercent: 100, engineerNotes: 'All 24 floors of Tower A framing complete. Slab casting up to 24th floor done. Shuttering removed and surface treatment applied.', updatedByName: 'Priya Sharma (Senior Engineer)' },
      { _id: 'ms-003', phase: 'MEP', status: 'In Progress', progressPercent: 62, engineerNotes: 'Electrical conduit laying complete up to floor 18. Plumbing risers installed for Tower A. HVAC ducting at 40%. Fire suppression system pending approval.', updatedByName: 'Anil Verma (MEP Engineer)' },
      { _id: 'ms-004', phase: 'Finishing', status: 'Pending', progressPercent: 0, engineerNotes: '' },
      { _id: 'ms-005', phase: 'Handover', status: 'Pending', progressPercent: 0, engineerNotes: '' }
    ],
    'proj-002': [
      { _id: 'ms-101', phase: 'Foundation', status: 'Completed', progressPercent: 100, engineerNotes: 'Villa raft foundation concrete pouring completed. Curing checks show maximum core strength.', updatedByName: 'Rajesh Kumar (Site Engineer)' },
      { _id: 'ms-102', phase: 'Framing', status: 'Completed', progressPercent: 100, engineerNotes: 'Pillar and roof masonry completed. High-durability structural columns verified.', updatedByName: 'Priya Sharma (Senior Engineer)' },
      { _id: 'ms-103', phase: 'MEP', status: 'Completed', progressPercent: 100, engineerNotes: 'All premium modular electrical fittings and plumbing pipes installed. Fire safety clearance obtained.', updatedByName: 'Anil Verma (MEP Engineer)' },
      { _id: 'ms-104', phase: 'Finishing', status: 'Completed', progressPercent: 100, engineerNotes: 'Exterior wall cladding and interior premium Italian marble flooring complete. Ready for possession.', updatedByName: 'Vijay Singh (Finishing Specialist)' },
      { _id: 'ms-105', phase: 'Handover', status: 'Completed', progressPercent: 100, engineerNotes: 'Final RERA registry registration and keys handover completed for initial owners.', updatedByName: 'Shalini Sharma (Facility Head)' }
    ],
    'proj-003': [
      { _id: 'ms-201', phase: 'Foundation', status: 'Completed', progressPercent: 100, engineerNotes: 'Skyscraper pile foundation anchored to bedrock completed.', updatedByName: 'Rajesh Kumar (Site Engineer)' },
      { _id: 'ms-202', phase: 'Framing', status: 'In Progress', progressPercent: 45, engineerNotes: 'Floor slab casting active for floor 28. High wind resistance framing checks active.', updatedByName: 'Priya Sharma (Senior Engineer)' },
      { _id: 'ms-203', phase: 'MEP', status: 'Pending', progressPercent: 0, engineerNotes: '' },
      { _id: 'ms-204', phase: 'Finishing', status: 'Pending', progressPercent: 0, engineerNotes: '' },
      { _id: 'ms-205', phase: 'Handover', status: 'Pending', progressPercent: 0, engineerNotes: '' }
    ]
  };

  const loadProjectData = async () => {
    setLoading(true);
    try {
      const [msRes, sumRes] = await Promise.all([
        milestonesApi.getAll(selectedProject.id),
        milestonesApi.getSummary(selectedProject.id, selectedProject.budget),
      ]);
      const list = msRes.data?.data || [];
      if (list.length === 0) throw new Error('Empty backend list');
      setMilestones(list);
      setSummary(sumRes.data?.data || null);
    } catch {
      const fallbackList = MOCK_PROJECT_MILESTONES[selectedProject.id] || MOCK_PROJECT_MILESTONES['proj-001'];
      setMilestones(fallbackList);
      setSummary({
        projectId: selectedProject.id,
        milestones: fallbackList,
        aiSummary: selectedProject.id === 'proj-002' 
          ? `📊 **BuildFlow AI — Project Progress Summary**\n\nYour project Casa Serenity is fully completed and keys are ready for handover. RERA certifications HR-RERA-2026-REG-74011 and structural checks have been fully signed off with no remaining punchlist items.`
          : selectedProject.id === 'proj-003'
          ? `📊 **BuildFlow AI — Project Progress Summary**\n\nYour project Casa Pinnacle is currently in the structural framing stage at 45% phase completion. Foundation piling has been anchored successfully to base rock level.`
          : `📊 **BuildFlow AI — Project Progress Summary**\n\nYour project Casa Horizon is currently progressing through the MEP (Mechanical, Electrical & Plumbing) phase at 62% phase completion. Foundation and structural framing have been successfully completed ahead of schedule. Site engineers have confirmed that electrical conduit installation is complete through floor 18, plumbing risers are connected, and HVAC work is at 40% with a fire NOC pending.`,
        delayPrediction: { riskLevel: selectedProject.id === 'proj-002' ? 'Low' : selectedProject.id === 'proj-003' ? 'Medium' : 'Low' }
      });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { key: 'progress', label: '🏗️ Live Progress' },
    { key: 'summary', label: '🤖 AI Summary' },
    { key: 'analytics', label: '📊 Predictions' },
    { key: 'payments', label: '💳 Payment Schedule' },
    { key: 'workflow', label: '⚙️ Autonomous Workflows' },
  ];

  const aiSummaryText = summary?.aiSummary || `📊 **BuildFlow AI — Project Progress Summary**\n\nYour project Casa Horizon is currently progressing through the MEP (Mechanical, Electrical & Plumbing) phase at 62% phase completion. Foundation and structural framing have been successfully completed ahead of schedule. Site engineers have confirmed that electrical conduit installation is complete through floor 18, plumbing risers are connected, and HVAC work is at 40% with a fire NOC pending. All critical inspections are on schedule. BuildFlow AI has assessed no significant scheduling deviations at this time.\n\n_Last updated by BuildFlow AI on ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}._`;

  // Parse AI summary markdown to JSX simply
  const renderAISummary = (text) => {
    return text.split('\n\n').map((para, i) => {
      if (para.startsWith('📊 **')) {
        const title = para.replace(/📊 \*\*(.*?)\*\*/, '$1').replace(/\n.*/, '');
        return <h3 key={i} className="text-sm font-extrabold text-slate-900 dark:text-white mb-3">📊 {title}</h3>;
      }
      if (para.startsWith('_') && para.endsWith('._')) {
        return <p key={i} className="text-[10px] text-slate-400 dark:text-stone-500 italic mt-2">{para.slice(1, -1)}</p>;
      }
      return (
        <p key={i} className="text-sm text-slate-700 dark:text-stone-300 leading-relaxed mb-3">
          {para.replace(/⚠️ /g, '').split('**').map((seg, j) =>
            j % 2 === 1 ? <strong key={j} className="text-slate-900 dark:text-white font-bold">{seg}</strong> : seg
          )}
        </p>
      );
    });
  };

  return (
    <div className="pt-16 min-h-screen bg-slate-50 dark:bg-stone-950">
      {/* Notification ticker */}
      <NotificationTicker alerts={TICKER_ALERTS} />

      {/* ── Header ── */}
      <div className="bg-white dark:bg-stone-900 border-b border-slate-200 dark:border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-left">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold uppercase tracking-wider">
                  CasaEstate · Client Portal
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Your Project Dashboard
              </h1>
              <p className="text-xs font-semibold text-slate-500 dark:text-stone-400 mt-0.5">
                Real-time construction progress, AI summaries & financial schedule
              </p>
            </div>
            {/* Project selector */}
            <div className="flex flex-col items-end gap-2">
              <label className="text-[10px] font-bold text-slate-400 dark:text-stone-500 uppercase tracking-wider">Your Project</label>
              <select
                value={selectedProject.id}
                onChange={(e) => setSelectedProject(PROJECTS.find((p) => p.id === e.target.value))}
                className="text-sm font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-stone-800 border border-slate-200 dark:border-stone-700 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {PROJECTS.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <span className="text-[10px] text-slate-400 dark:text-stone-500">{selectedProject.location}</span>
            </div>
          </div>

          {/* Possession date banner */}
          <div className="mt-4 flex flex-wrap gap-3">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-2.5 flex items-center gap-3">
              <span className="text-base">🔑</span>
              <div>
                <p className="text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Target Possession</p>
                <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {new Date(selectedProject.possessionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
            {summary?.delayPrediction && (
              <div className={`border rounded-xl px-4 py-2.5 flex items-center gap-3 ${
                summary.delayPrediction.riskLevel === 'Low'
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                  : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700'
              }`}>
                <span className="text-base">{summary.delayPrediction.riskLevel === 'Low' ? '🟢' : '🟡'}</span>
                <div>
                  <p className={`text-[9px] font-extrabold uppercase tracking-wider ${
                    summary.delayPrediction.riskLevel === 'Low'
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-amber-600 dark:text-amber-400'
                  }`}>AI Risk Assessment</p>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white">{summary.delayPrediction.riskLevel} Risk</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="border-b border-slate-200 dark:border-stone-800 bg-white dark:bg-stone-900 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-1 overflow-x-auto scrollbar-hide">
          {tabs.map((t) => (
            <button
              key={t.key}
              id={`client-tab-${t.key}`}
              onClick={() => setActiveTab(t.key)}
              className={`text-xs font-semibold px-4 py-3.5 border-b-2 whitespace-nowrap transition-all duration-150 -mb-px ${
                activeTab === t.key
                  ? 'text-emerald-600 dark:text-emerald-400 border-emerald-600 dark:border-emerald-400'
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

        {/* ── LIVE PROGRESS ── */}
        {activeTab === 'progress' && (
          <div className="animate-fade-in space-y-6">
            {/* Timeline */}
            <div className="bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-700 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Live Construction Timeline</h2>
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <span className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                </div>
              ) : (
                <MilestoneTimeline milestones={milestones} />
              )}
            </div>

            {/* Phase details grid */}
            {milestones.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {milestones.filter((m) => m.status !== 'Pending' || m.engineerNotes).map((m) => (
                  <div key={m._id} className="bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-700 rounded-xl p-4 text-left shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-extrabold text-slate-900 dark:text-white">{m.phase}</p>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                        m.status === 'Completed' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' :
                        m.status === 'In Progress' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' :
                        m.status === 'Delayed' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700' :
                        'bg-slate-100 dark:bg-stone-800 text-slate-500 dark:text-stone-400 border-slate-200 dark:border-stone-700'
                      }`}>{m.status}</span>
                    </div>
                    {/* Progress bar */}
                    <div className="h-1.5 bg-slate-200 dark:bg-stone-700 rounded-full mb-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          m.status === 'Completed' ? 'bg-emerald-500' :
                          m.status === 'In Progress' ? 'bg-blue-500' :
                          m.status === 'Delayed' ? 'bg-amber-500' : 'bg-slate-300 dark:bg-stone-600'
                        }`}
                        style={{ width: `${m.progressPercent}%` }}
                      />
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 dark:text-stone-400 mb-2">{m.progressPercent}% complete</p>
                    {m.engineerNotes && (
                      <p className="text-[10px] text-slate-500 dark:text-stone-500 italic leading-relaxed line-clamp-2">"{m.engineerNotes}"</p>
                    )}
                    {m.updatedByName && (
                      <p className="text-[9px] text-slate-400 dark:text-stone-600 mt-1.5">Updated by {m.updatedByName}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── AI SUMMARY ── */}
        {activeTab === 'summary' && (
          <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-700 rounded-2xl p-6 shadow-sm text-left">
                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100 dark:border-stone-800">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-sm flex-shrink-0">🤖</div>
                  <div>
                    <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">CasaEstate — Project Narrative</h2>
                    <p className="text-[10px] text-slate-400 dark:text-stone-500">Generated from raw engineer field logs</p>
                  </div>
                </div>
                <div className="space-y-1 prose-sm max-w-none">
                  {renderAISummary(aiSummaryText)}
                </div>
              </div>
            </div>

            {/* Right Side Column: Embedded CasaBot Console */}
            <div className="space-y-4">
              <CasaOpsSwarmConsole autoTriggerKey={selectedProject.name} />
              <div className="bg-slate-950 dark:bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 text-left font-mono">
                {/* Header node with pulsing green status dot */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest leading-none">CasaBot AI • Active Node</span>
                  </div>
                  <span className="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700 font-bold uppercase tracking-wider">v1.2</span>
                </div>

                {/* Context Badges */}
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[8px] bg-blue-950/60 text-blue-400 px-2 py-0.5 rounded border border-blue-900/40 font-bold">
                    [Scope: {selectedProject.name}]
                  </span>
                  <span className="text-[8px] bg-purple-950/60 text-purple-400 px-2 py-0.5 rounded border border-purple-900/40 font-bold">
                    [Status: Syncing Ledger]
                  </span>
                </div>

                {/* Terminal Output Console */}
                <div className="bg-black border border-slate-850 rounded-2xl p-4 min-h-[160px] max-h-[220px] overflow-y-auto space-y-2 text-left text-[11px]">
                  <p className="text-slate-500">{"[system_init] initializing neural parameters..."}</p>
                  <p className="text-slate-500">{"[context_bind] project: " + selectedProject.name + " active"}</p>
                  {botConsoleMessages.map((msg, i) => (
                    <p key={i} className={msg.type === 'user' ? 'text-blue-400' : 'text-slate-200'}>
                      <span className="text-slate-500">{msg.type === 'user' ? '> ' : '# '}</span>
                      {msg.text}
                    </p>
                  ))}
                  {botConsoleLoading && (
                    <div className="flex items-center gap-1.5 text-emerald-400 animate-pulse">
                      <span>█</span>
                      <span>Running predictive inference...</span>
                    </div>
                  )}
                  <div ref={terminalEndRef} />
                </div>

                {/* Quick Action Chips */}
                <div>
                  <p className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider mb-2">Execute Agent Operations</p>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      disabled={botConsoleLoading}
                      onClick={() => handleConsoleAction('Show Delay Impact', 'Analyzing timeline logs... calculating critical path delay impact index... delay risk is LOW (+1.2 days variance forecast).')}
                      className="text-[9px] font-bold uppercase tracking-wider bg-slate-900 hover:bg-slate-850 text-slate-350 border border-slate-800 px-2.5 py-1.5 rounded-xl transition-all"
                    >
                      ⚡ Show Delay Impact
                    </button>
                    <button
                      type="button"
                      disabled={botConsoleLoading}
                      onClick={() => handleConsoleAction('Audit Cost', 'Auditing procurement ledger... material pricing efficiency optimization active. Total savings ₹30 Lakhs against benchmark.')}
                      className="text-[9px] font-bold uppercase tracking-wider bg-slate-900 hover:bg-slate-850 text-slate-350 border border-slate-800 px-2.5 py-1.5 rounded-xl transition-all"
                    >
                      💰 Audit Cost
                    </button>
                    <button
                      type="button"
                      disabled={botConsoleLoading}
                      onClick={() => handleConsoleAction('Push Invoice', 'Drafting Slab Level 5 invoice... pushing receipt logs to Ledger database. Next payment installment locked.')}
                      className="text-[9px] font-bold uppercase tracking-wider bg-slate-900 hover:bg-slate-850 text-slate-350 border border-slate-800 px-2.5 py-1.5 rounded-xl transition-all"
                    >
                      🧾 Push Invoice
                    </button>
                  </div>
                </div>
            </div>
          </div>
        </div>
        )}

        {/* ── PREDICTIONS ── */}
        {activeTab === 'analytics' && (
          <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-700 rounded-2xl p-6 shadow-sm">
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-5">AI Predictive Analytics</h2>
              <AIPredictiveDashboard
                milestones={milestones}
                delayPrediction={summary?.delayPrediction || {}}
                costAnalysis={summary?.costAnalysis || {}}
                originalPossessionDate={selectedProject.possessionDate}
              />
            </div>
            <div className="bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-700 rounded-2xl p-5 shadow-sm">
              <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Full Timeline</h3>
              <MilestoneTimeline milestones={milestones} />
            </div>
          </div>
        )}

        {/* ── PAYMENT SCHEDULE ── */}
        {activeTab === 'payments' && (
          <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Schedule table */}
            <div className="bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-700 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-200 dark:border-stone-700 bg-slate-50 dark:bg-stone-800/50 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">Payment Schedule</h3>
                  <p className="text-[10px] text-slate-400 dark:text-stone-500 mt-0.5">{selectedProject.name} — Construction-linked plan</p>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700">
                  1 Pending
                </span>
              </div>
              <div className="px-5">
                {PAYMENT_SCHEDULE.map((item, i) => (
                  <PaymentRow key={i} item={item} index={i} />
                ))}
              </div>
              {/* Total */}
              <div className="px-5 py-4 bg-slate-50 dark:bg-stone-800/50 border-t border-slate-200 dark:border-stone-700">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-extrabold text-slate-700 dark:text-stone-300 uppercase tracking-wider">Total Value</p>
                  <p className="text-base font-extrabold text-slate-900 dark:text-white">
                    {formatCurrency(PAYMENT_SCHEDULE.reduce((s, p) => s + p.amount, 0))}
                  </p>
                </div>
              </div>
            </div>

            {/* Invoice summary */}
            <div className="space-y-4">
              <div className="bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-700 rounded-2xl p-5 shadow-sm text-left">
                <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Payment Summary</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Amount Paid', value: formatCurrency(PAYMENT_SCHEDULE.filter((p) => p.status === 'Paid').reduce((s, p) => s + p.amount, 0)), color: 'text-emerald-600 dark:text-emerald-400' },
                    { label: 'Amount Pending', value: formatCurrency(PAYMENT_SCHEDULE.filter((p) => p.status === 'Pending').reduce((s, p) => s + p.amount, 0)), color: 'text-amber-600 dark:text-amber-400' },
                    { label: 'Remaining Balance', value: formatCurrency(PAYMENT_SCHEDULE.filter((p) => p.status === 'Upcoming').reduce((s, p) => s + p.amount, 0)), color: 'text-slate-700 dark:text-stone-300' },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-stone-800 last:border-0">
                      <span className="text-xs text-slate-500 dark:text-stone-400 font-medium">{row.label}</span>
                      <span className={`text-sm font-extrabold ${row.color}`}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900 rounded-2xl p-4 text-left">
                <p className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">Next Payment Due</p>
                <p className="text-sm font-extrabold text-slate-900 dark:text-white mb-0.5">Slab Level 5 — ₹14,70,000</p>
                <p className="text-xs text-slate-500 dark:text-stone-400">
                  Due: {new Date(Date.now() + 86400000 * 30).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
                <button
                  className="mt-3 w-full px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-extrabold hover:bg-emerald-700 transition-colors"
                  onClick={() => {}}
                >
                  Pay Now →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── AUTONOMOUS WORKFLOWS ── */}
        {activeTab === 'workflow' && (
          <div className="animate-fade-in bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <WorkflowDashboard embedMode={true} initialRole={currentUser?.role || 'client'} />
          </div>
        )}

      </div>
    </div>
  );
}
