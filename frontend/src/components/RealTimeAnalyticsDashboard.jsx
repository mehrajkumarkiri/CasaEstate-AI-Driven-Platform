import { useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useAnalytics } from '../hooks/useAnalytics';
import { formatCurrencyShort, formatDateTime } from '../utils/formatters';
import { StatCardSkeleton } from './SkeletonLoader';

const ALERT_STYLES = {
  warning: { bg: 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/30', text: 'text-amber-800 dark:text-amber-400', icon: '⚠️' },
  info:    { bg: 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/30',   text: 'text-blue-800 dark:text-blue-400',  icon: 'ℹ️' },
  success: { bg: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/30', text: 'text-emerald-800 dark:text-emerald-400', icon: '✅' },
};

const PALETTE = ['#2563eb', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6'];

function ChartTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-800 rounded-xl px-3 py-2.5 shadow-md text-xs text-left">
      <p className="text-slate-400 dark:text-stone-500 mb-1.5 font-bold uppercase tracking-wider">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-500 dark:text-stone-400 font-semibold">{p.name}:</span>
          <span className="text-slate-800 dark:text-white font-extrabold">{formatter ? formatter(p.value) : p.value}</span>
        </div>
      ))}
    </div>
  );
}

function StatCard({ label, value, sub, icon, color = 'blue', trend }) {
  const colorMap = {
    blue: 'text-blue-650 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950/20 dark:border-blue-900/30',
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/20 dark:border-emerald-900/30',
    amber: 'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/20 dark:border-amber-900/30',
    violet: 'text-violet-600 bg-violet-50 border-violet-200 dark:text-violet-400 dark:bg-violet-950/20 dark:border-violet-900/30',
  };
  return (
    <div className="bg-white dark:bg-stone-900 border border-slate-205 dark:border-stone-800 p-5 rounded-2xl shadow-xs text-left relative group">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border text-lg ${colorMap[color]}`}>
          {icon}
        </div>
        {trend !== undefined && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            trend >= 0 ? 'text-emerald-700 bg-emerald-50 border border-emerald-100 dark:text-emerald-400 dark:bg-emerald-950/20 dark:border-emerald-900/30' : 'text-red-700 bg-red-50 border border-red-100'
          }`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% MoM
          </span>
        )}
      </div>
      <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight font-display">{value}</p>
      <p className="text-[11px] font-bold text-slate-400 dark:text-stone-500 mt-1 uppercase tracking-wider">{label}</p>
      {sub && <p className="text-[10px] text-slate-400 dark:text-stone-500 font-semibold mt-0.5 leading-normal">{sub}</p>}
    </div>
  );
}

export default function RealTimeAnalyticsDashboard() {
  const { analytics: data, loading, lastUpdated, refetch } = useAnalytics();

  const revenueChartData = useMemo(() =>
    (data?.monthlySales || []).map((m) => ({ ...m, revenueL: Math.round(m.revenue / 100000) })),
    [data]
  );

  const scarcityIndexData = useMemo(() => [
    { name: 'Studio', scarcity: 8 },
    { name: '1BHK', scarcity: 12 },
    { name: '2BHK', scarcity: 45 },
    { name: '3BHK', scarcity: 92 }, // Extremely scarce due to B2B
    { name: '4BHK', scarcity: 68 },
    { name: 'Penthouse', scarcity: 85 }
  ], []);

  if (loading && !data) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between text-left">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Predictive Operations Cockpit</h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            {lastUpdated ? `Sync Date: ${formatDateTime(lastUpdated)}` : 'Real-time telemetry'}
          </p>
        </div>
        <button
          id="analytics-refresh-btn"
          onClick={refetch}
          className="text-xs font-bold text-slate-650 hover:text-slate-900 dark:text-stone-300 dark:hover:text-white border border-slate-205 dark:border-stone-850 bg-slate-50 dark:bg-stone-900 rounded-lg px-3 py-2 flex items-center gap-1.5 transition-all"
        >
          🔄 Refresh Cockpit
        </button>
      </div>

      {/* Decision Intelligence Panel Alerts */}
      <div className="bg-slate-950 border border-stone-800 rounded-2xl p-5 text-left space-y-3">
        <div className="flex items-center justify-between border-b border-stone-900 pb-3">
          <div>
            <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest">🧠 AI Decision Intelligence Stream</h3>
            <p className="text-[10px] text-stone-500 mt-0.5 font-mono">Live dynamic optimization recommendations</p>
          </div>
          <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-900 px-2 py-0.5 rounded">Active Engine</span>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-start gap-3 bg-red-950/20 border border-red-900/30 p-3.5 rounded-xl text-xs">
            <span className="text-base">⚠️</span>
            <div className="flex-1">
              <p className="font-mono text-red-400 font-bold">INVENTORY COMPRESSION DETECTED</p>
              <p className="text-stone-400 mt-1 leading-relaxed">
                3BHK layouts scarcity index has crossed <strong className="text-white">92%</strong> due to accelerated B2B wholesale negotiator activity.
              </p>
              <div className="mt-2.5 flex items-center gap-2">
                <span className="text-[10px] font-bold text-amber-500 bg-amber-950/40 border border-amber-900/30 px-2 py-0.5 rounded">Action Advised</span>
                <span className="text-[10px] font-bold text-stone-300">Adjust AI Wholesale minimum margin threshold up by <strong className="text-emerald-400">4.5%</strong>.</span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-blue-950/20 border border-blue-900/30 p-3.5 rounded-xl text-xs">
            <span className="text-base">📈</span>
            <div className="flex-1">
              <p className="font-mono text-blue-400 font-bold">REVENUE FORECAST EXPANSION</p>
              <p className="text-stone-400 mt-1 leading-relaxed">
                Cumulative B2B wholesale bookings are projected to increase monthly cash flow yields by <strong className="text-white">₹14.2 Cr</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="💰" color="emerald" label="Total Audited Sales" trend={data?.revenueGrowth}
          value={formatCurrencyShort(data?.totalRevenue)}
          sub={`${data?.revenueGrowth || 18.4}% growth this month`}
        />
        <StatCard
          icon="🏠" color="blue" label="Allotments Sold"
          value={data?.soldUnits}
          sub={`${data?.reservedUnits} reserved · ${data?.availableUnits} available`}
        />
        <StatCard
          icon="📊" color="violet" label="B2B Pipeline Revenue"
          value="₹18.45 Cr"
          sub="Ongoing bulk negotiation pools"
        />
        <StatCard
          icon="🏗️" color="amber" label="Active Projects"
          value={data?.projectPerformance?.length || 3}
          sub="RERA sanctioned towers"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Scarcity Index Chart */}
        <div className="bg-white dark:bg-stone-900 border border-slate-205 dark:border-stone-850 p-5 rounded-2xl shadow-xs text-left">
          <div className="mb-4">
            <h3 className="text-xs font-bold text-slate-800 dark:text-stone-200 uppercase tracking-wider">Live Layout Scarcity Index</h3>
            <p className="text-[10px] font-bold text-slate-400 dark:text-stone-500 uppercase">Demand saturation percentage (higher means low stock)</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={scarcityIndexData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-stone-800" vertical={false}/>
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} width={30}/>
              <Tooltip content={<ChartTooltip formatter={(v) => `${v}% Demand`} />}/>
              <Bar dataKey="scarcity" name="Scarcity Index" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={30}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Revenue Area Chart */}
        <div className="bg-white dark:bg-stone-900 border border-slate-205 dark:border-stone-850 p-5 rounded-2xl shadow-xs text-left">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-stone-200 uppercase tracking-wider">Revenue Cash Flows</h3>
              <p className="text-[10px] font-bold text-slate-400 dark:text-stone-500 uppercase">In Lakhs (INR)</p>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 dark:text-emerald-450 dark:bg-emerald-950/20 dark:border-emerald-900/30 px-2 py-0.5 rounded-full">
              ↑ 18.4% MoM
            </span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revenueChartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-stone-800" vertical={false}/>
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} width={36}/>
              <Tooltip content={<ChartTooltip formatter={(v) => `₹${v}L`}/>}/>
              <Area type="monotone" dataKey="revenueL" name="Revenue" stroke="#2563eb" strokeWidth={2}
                fill="url(#revenueGrad)" dot={{ fill: '#2563eb', strokeWidth: 0, r: 2.5 }}
                activeDot={{ r: 4, fill: '#3b82f6', stroke: '#1d4ed8', strokeWidth: 1.5 }}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
