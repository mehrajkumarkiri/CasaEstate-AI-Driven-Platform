import { useState, useEffect } from 'react';
import RealTimeAnalyticsDashboard from '../components/RealTimeAnalyticsDashboard';
import AIPredictiveDashboard from '../components/AIPredictiveDashboard';
import MilestoneTimeline from '../components/MilestoneTimeline';
import { milestonesApi } from '../services/milestoneApi';
import { bookingsApi } from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { TableRowSkeleton } from '../components/SkeletonLoader';
import { useApp } from '../context/AppContext';

const MOCK_PENDING_BOOKINGS = [
  {
    _id: 'booking-001',
    bookingRef: 'AE-1719120000-XK7Y2',
    userName: 'Arjun Mehta',
    userEmail: 'arjun.mehta@email.com',
    bookingType: 'Purchase',
    projectName: 'Casa Horizon',
    unitNumber: 'A302',
    bhkType: '3BHK',
    tokenAmount: 200000,
    totalAmount: 9800000,
    paymentStatus: 'Token Paid',
    status: 'Active',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    _id: 'booking-003',
    bookingRef: 'AE-1719207200-MN9B1',
    userName: 'Priya Sharma',
    userEmail: 'priya.sharma@email.com',
    bookingType: 'Purchase',
    projectName: 'Casa Serenity',
    unitNumber: 'C205',
    bhkType: '2BHK',
    tokenAmount: 150000,
    totalAmount: 6800000,
    paymentStatus: 'Token Paid',
    status: 'Active',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

const RECENT_ACTIVITY = [
  { type: 'booking', user: 'Arjun Mehta', action: 'booked Unit A302', project: 'Casa Horizon', time: '3 days ago' },
  { type: 'payment', user: 'Priya Sharma', action: 'paid token ₹1.5L', project: 'Casa Serenity', time: '1 day ago' },
  { type: 'amenity', user: 'Kavita Rao', action: 'reserved Clubhouse slot', project: 'Casa Horizon', time: '5 hours ago' },
  { type: 'booking', user: 'Rohit Verma', action: 'booked Unit A4801', project: 'Casa Pinnacle', time: '12 hours ago' },
];

function ActivityFeed({ items }) {
  const icons = {
    booking: { icon: '🏢', color: 'bg-blue-50 border-blue-100 text-blue-700' },
    payment: { icon: '💰', color: 'bg-emerald-50 border-emerald-100 text-emerald-700' },
    amenity: { icon: '🏛️', color: 'bg-violet-50 border-violet-100 text-violet-700' },
  };
  return (
    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm text-left">
      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Recent Portfolio Activity</h3>
      <div className="space-y-4">
        {items.map((item, i) => {
          const cfg = icons[item.type] || icons.booking;
          return (
            <div key={i} className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border text-xs font-bold ${cfg.color}`}>
                {cfg.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-700 font-medium">
                  <strong className="text-slate-900 font-bold">{item.user}</strong>
                  {' '}{item.action}
                </p>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{item.project} · {item.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PendingBookingsTable({ bookings, onApprove, onReject }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm text-left">
      <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Allotment Verification Queue</h3>
          <p className="text-xs text-slate-500 mt-0.5">{bookings.length} requests awaiting legal validation</p>
        </div>
        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
          {bookings.length} Pending
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/20">
              {['Booking Ref', 'Applicant Client', 'Target Estate Unit', 'Allotment Cost & Token', 'Application Date', 'Verification Actions'].map(h => (
                <th key={h} className="text-slate-400 font-extrabold uppercase px-4 py-3 tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bookings.map(b => (
              <tr key={b._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <p className="text-xs font-bold font-mono text-blue-600">{b.bookingRef}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">{b.bookingType}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-xs font-bold text-slate-800">{b.userName}</p>
                  <p className="text-[10px] text-slate-500">{b.userEmail}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-xs font-bold text-slate-800">{b.projectName}</p>
                  <p className="text-[10px] text-slate-500 font-semibold">Unit {b.unitNumber} · {b.bhkType}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-xs font-extrabold text-slate-800">{formatCurrency(b.totalAmount)}</p>
                  <p className="text-[10px] text-slate-500">Token deposit: {formatCurrency(b.tokenAmount)}</p>
                </td>
                <td className="px-4 py-3 text-slate-400 font-semibold whitespace-nowrap">{formatDate(b.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      id={`approve-${b._id}`}
                      onClick={() => onApprove(b._id)}
                      className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                    >
                      Verify & Approve
                    </button>
                    <button
                      id={`reject-${b._id}`}
                      onClick={() => onReject(b._id)}
                      className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-red-50 text-white hover:bg-red-600 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { pushNotification } = useApp();
  const [pendingBookings, setPendingBookings] = useState(MOCK_PENDING_BOOKINGS);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [buildflowMilestones, setBuildflowMilestones] = useState([]);
  const [buildflowSummary, setBuildflowSummary] = useState(null);
  const [buildflowLoading, setBuildflowLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    bookingsApi.getAll({ status: 'Active' })
      .then(res => { if (res.data?.length) setPendingBookings(res.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const loadBuildflowData = async () => {
    setBuildflowLoading(true);
    try {
      const [msRes, sumRes] = await Promise.all([
        milestonesApi.getAll('proj-001'),
        milestonesApi.getSummary('proj-001', 850000000),
      ]);
      setBuildflowMilestones(msRes.data?.data || []);
      setBuildflowSummary(sumRes.data?.data || null);
    } catch {
      setBuildflowMilestones([]);
    } finally {
      setBuildflowLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'buildflow') loadBuildflowData();
  }, [activeTab]);

  const handleApprove = async (id) => {
    try {
      await bookingsApi.approve(id).catch(() => {});
      setPendingBookings(prev => prev.filter(b => b._id !== id));
      pushNotification({ type: 'success', title: '✅ Booking Approved', message: 'The unit has been marked as Sold.' });
    } catch {
      pushNotification({ type: 'error', title: 'Error', message: 'Could not approve booking.' });
    }
  };

  const handleReject = (id) => {
    setPendingBookings(prev => prev.filter(b => b._id !== id));
    pushNotification({ type: 'info', title: 'Booking Rejected', message: 'The unit has been released.' });
  };

  return (
    <div className="pt-16 min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-wider">Operational Console Live</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Infrastructure Cockpit</h1>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">Central portfolio controls and unit registries</p>
            </div>
            <div className="flex items-center gap-3">
              {pendingBookings.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-xs text-amber-700 font-bold">{pendingBookings.length} pending review requests</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 bg-white sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-1 overflow-x-auto scrollbar-hide">
          {[
            { key: 'overview', label: '📊 Portfolio Analytics' },
            { key: 'approvals', label: `🔔 Allotments Queue (${pendingBookings.length})` },
            { key: 'activity', label: '📝 Audit Log' },
            { key: 'buildflow', label: '🏗️ BuildFlow AI Command' },
          ].map(t => (
            <button key={t.key} id={`admin-tab-${t.key}`}
              onClick={() => setActiveTab(t.key)}
              className={`text-xs font-semibold px-4 py-3.5 border-b-2 whitespace-nowrap transition-all duration-150 -mb-px ${
                activeTab === t.key
                  ? 'text-blue-600 border-blue-600'
                  : 'text-slate-500 border-transparent hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <div className="animate-fade-in">
            <RealTimeAnalyticsDashboard />
          </div>
        )}

        {activeTab === 'approvals' && (
          <div className="animate-fade-in">
            {loading ? (
              <div className="bg-white border border-slate-200 rounded-2xl"><TableRowSkeleton rows={4} /></div>
            ) : pendingBookings.length === 0 ? (
              <div className="bg-white border border-slate-200 p-12 text-center rounded-2xl shadow-sm">
                <p className="text-4xl mb-3">✓</p>
                <p className="text-sm font-bold text-slate-800">All unit allocations verified</p>
                <p className="text-xs text-slate-500 mt-1">There are no pending approvals in the RERA verification queue.</p>
              </div>
            ) : (
              <PendingBookingsTable
                bookings={pendingBookings}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            )}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ActivityFeed items={RECENT_ACTIVITY} />
            
            {/* System Status and Quick Actions */}
            <div className="space-y-4 text-left">
              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Registry Service Logs</h3>
                <div className="space-y-3">
                  {[
                    { label: 'API Server', status: 'Operational', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
                    { label: 'Asset DB Registry', status: 'Mock Fallback Active', color: 'text-blue-600 bg-blue-50 border-blue-100' },
                    { label: 'Sale Deed Compiler', status: 'Active', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
                    { label: 'Notification Relay', status: 'Active', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
                    { label: 'Double-Booking Guard', status: 'Enabled', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
                  ].map(s => (
                    <div key={s.label} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                      <span className="text-xs text-slate-500 font-medium">{s.label}</span>
                      <div className={`flex items-center gap-1 px-2 py-0.5 rounded border text-[9px] font-bold ${s.color}`}>
                        <span className="w-1 h-1 rounded-full bg-current animate-pulse" />
                        <span>{s.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Export Reports</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Download Audited Sales Ledger', icon: '📥' },
                    { label: 'Relay Maintenance Bill Notices', icon: '📧' },
                    { label: 'Export RERA Inventory (CSV)', icon: '📊' },
                  ].map(a => (
                    <button key={a.label}
                      onClick={() => alert(`Exporting ${a.label}...`)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200/80
                        hover:border-slate-300 hover:bg-slate-100/50 text-left transition-all group font-semibold text-xs text-slate-700"
                    >
                      <span className="text-base">{a.icon}</span>
                      <span>{a.label}</span>
                      <span className="ml-auto text-slate-400 group-hover:text-slate-700">→</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}
        {activeTab === 'buildflow' && (
          <div className="animate-fade-in space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-[10px] text-blue-600 font-extrabold uppercase tracking-wider">BuildFlow AI — Live Command Center</span>
                </div>
                <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">All Projects Risk & Progress Monitor</h2>
              </div>
              <button
                id="buildflow-push-alert-btn"
                onClick={() => {
                  pushNotification({ type: 'error', title: '🚨 BuildFlow AI Alert Pushed', message: 'Schedule deviation detected in Casa Horizon MEP phase. Client notifications dispatched.' });
                }}
                className="text-xs font-bold px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors shadow-sm"
              >
                🚨 Push Deviation Alert
              </button>
            </div>

            {/* Project cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { name: 'Casa Horizon', location: 'Noida', risk: 'Medium', progress: 62, phase: 'MEP' },
                { name: 'Casa Serenity', location: 'Gurugram', risk: 'Low', progress: 38, phase: 'Framing' },
                { name: 'Casa Pinnacle', location: 'Mumbai', risk: 'High', progress: 85, phase: 'Finishing' },
              ].map((proj) => (
                <div key={proj.name} className={`bg-white border rounded-xl p-4 text-left shadow-sm ${
                  proj.risk === 'High' ? 'border-orange-300' : proj.risk === 'Medium' ? 'border-amber-200' : 'border-slate-200'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs font-extrabold text-slate-900">{proj.name}</p>
                      <p className="text-[9px] text-slate-400">{proj.location}</p>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                      proj.risk === 'High' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                      proj.risk === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>{proj.risk === 'Low' ? '🟢' : proj.risk === 'Medium' ? '🟡' : '🔴'} {proj.risk}</span>
                  </div>
                  <div className="h-1.5 bg-slate-200 rounded-full mb-2 overflow-hidden">
                    <div className={`h-full rounded-full ${
                      proj.risk === 'High' ? 'bg-orange-500' : proj.risk === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`} style={{ width: `${proj.progress}%` }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-slate-500 font-semibold">Active: {proj.phase} Phase</p>
                    <p className="text-[10px] font-extrabold text-slate-700">{proj.progress}%</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Full analytics for primary project */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-4">Casa Horizon — AI Predictive Engine</h3>
                {buildflowLoading ? (
                  <div className="flex justify-center py-8">
                    <span className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                  </div>
                ) : (
                  <AIPredictiveDashboard
                    milestones={buildflowMilestones}
                    delayPrediction={buildflowSummary?.delayPrediction || {}}
                    costAnalysis={buildflowSummary?.costAnalysis || {}}
                    originalPossessionDate={new Date(Date.now() + 86400000 * 150).toISOString()}
                  />
                )}
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-4">Live Construction Timeline</h3>
                {buildflowLoading ? (
                  <div className="flex justify-center py-8">
                    <span className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                  </div>
                ) : (
                  <MilestoneTimeline milestones={buildflowMilestones} compact />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
