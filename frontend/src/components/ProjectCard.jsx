import { Link } from 'react-router-dom';
import { formatCurrencyShort } from '../utils/formatters';

const statusConfig = {
  'Under Construction': { color: 'text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30', dot: 'bg-amber-500 animate-pulse' },
  'Ready to Move': { color: 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30', dot: 'bg-emerald-500' },
  'Pre-Launch': { color: 'text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/30', dot: 'bg-blue-500' },
  'Sold Out': { color: 'text-slate-700 bg-slate-50 dark:text-stone-400 dark:bg-stone-800/50 border-slate-200 dark:border-stone-705', dot: 'bg-slate-500' },
};

const projectGradients = [
  'from-blue-100/60 to-sky-50/50 dark:from-blue-950/30 dark:to-stone-900',
  'from-amber-100/60 to-orange-50/50 dark:from-amber-950/30 dark:to-stone-900',
  'from-emerald-100/60 to-teal-50/50 dark:from-emerald-950/30 dark:to-stone-900',
];

const projectIllustrations = [
  // Tower A SVG (Daylight / Lineart)
  <svg viewBox="0 0 320 200" className="w-full h-full opacity-90" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="skyA" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#bae6fd" className="dark:stop-color-stone-950"/>
        <stop offset="100%" stopColor="#e0f2fe" className="dark:stop-color-stone-900"/>
      </linearGradient>
      <linearGradient id="buildA" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#3b82f6" className="dark:stop-color-stone-400"/>
        <stop offset="100%" stopColor="#1d4ed8" className="dark:stop-color-stone-600"/>
      </linearGradient>
    </defs>
    <rect width="320" height="200" fill="url(#skyA)" className="fill-sky-100 dark:fill-stone-900"/>
    {/* Sun */}
    <circle cx="270" cy="45" r="18" fill="#f59e0b" opacity="0.8" className="dark:opacity-20"/>
    {/* Clouds */}
    <ellipse cx="60" cy="40" rx="30" ry="12" fill="white" opacity="0.7" className="dark:opacity-10"/>
    {/* Main tower */}
    <rect x="100" y="40" width="120" height="155" fill="url(#buildA)" rx="2"/>
    {/* Windows */}
    {Array.from({length:8}).map((_,row)=>
      [0,1,2].map((_,col)=>(
        <rect key={`${row}-${col}`} x={116+col*32} y={50+row*18} width="20" height="12" rx="2"
          fill={(row+col)%3===0?"#eff6ff":"#2563eb"} opacity="0.9" className="dark:fill-stone-900 dark:opacity-60"/>
      ))
    )}
    {/* Roof detail */}
    <rect x="90" y="35" width="140" height="8" fill="#60a5fa" rx="2" className="dark:fill-stone-500"/>
    <rect x="148" y="20" width="24" height="18" fill="#3b82f6" rx="1" className="dark:fill-stone-500"/>
    {/* Side buildings */}
    <rect x="40" y="90" width="55" height="105" fill="#64748b" rx="1" className="dark:fill-stone-800"/>
    <rect x="225" y="100" width="55" height="95" fill="#64748b" rx="1" className="dark:fill-stone-800"/>
    {/* Ground */}
    <rect x="0" y="195" width="320" height="5" fill="#94a3b8" className="dark:fill-stone-800"/>
  </svg>,

  // Low-rise complex (Daylight Green)
  <svg viewBox="0 0 320 200" className="w-full h-full opacity-90" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="skyB" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#a7f3d0" className="dark:stop-color-stone-950"/>
        <stop offset="100%" stopColor="#ecfdf5" className="dark:stop-color-stone-900"/>
      </linearGradient>
    </defs>
    <rect width="320" height="200" fill="url(#skyB)" className="fill-emerald-100 dark:fill-stone-900"/>
    {/* Sun */}
    <circle cx="50" cy="40" r="14" fill="#f59e0b" opacity="0.7" className="dark:opacity-20"/>
    {/* Trees */}
    {[20,60,240,280].map((x,i)=>(
      <g key={i}>
        <rect x={x+6} y={140} width="8" height="40" fill="#78350f" className="dark:fill-stone-800"/>
        <ellipse cx={x+10} cy={135} rx="16" ry="20" fill="#059669" opacity="0.9" className="dark:fill-stone-700 dark:opacity-40"/>
      </g>
    ))}
    {/* Buildings */}
    {[0,1,2,3].map((i)=>(
      <g key={i}>
        <rect x={85+i*40} y={80+i*10} width="36" height={100-i*10} fill="#475569" rx="2" className="dark:fill-stone-400"/>
        {[0,1,2].map((_,r)=>[0,1].map((_,c)=>(
          <rect key={`${r}-${c}`} x={91+i*40+c*16} y={90+i*10+r*24} width="10" height="14" rx="1"
            fill="#a7f3d0" opacity="0.9" className="dark:fill-stone-900 dark:opacity-60"/>
        )))}
      </g>
    ))}
    {/* Pool glint */}
    <ellipse cx="160" cy="185" rx="40" ry="8" fill="#38bdf8" opacity="0.8" className="dark:opacity-30"/>
    <rect x="0" y="190" width="320" height="10" fill="#047857" opacity="0.3" className="dark:opacity-10"/>
  </svg>,

  // Skyscraper (Sunrise Light)
  <svg viewBox="0 0 320 200" className="w-full h-full opacity-90" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="skyC" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#fef3c7" className="dark:stop-color-stone-950"/>
        <stop offset="100%" stopColor="#fdf2e9" className="dark:stop-color-stone-900"/>
      </linearGradient>
      <linearGradient id="buildC" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#6366f1" className="dark:stop-color-stone-450"/>
        <stop offset="100%" stopColor="#4f46e5" className="dark:stop-color-stone-650"/>
      </linearGradient>
    </defs>
    <rect width="320" height="200" fill="url(#skyC)" className="fill-amber-50 dark:fill-stone-900"/>
    {/* Main skyscraper */}
    <rect x="120" y="10" width="80" height="185" fill="url(#buildC)" rx="3"/>
    {/* Glass panels */}
    {Array.from({length:15}).map((_,row)=>(
      <rect key={row} x="122" y={14+row*12} width="76" height="10" rx="1"
        fill={row%3===0?"#e0e7ff":"#818cf8"} opacity="0.9" className="dark:fill-stone-900 dark:opacity-60"/>
    ))}
    {/* Antenna */}
    <rect x="157" y="0" width="6" height="14" fill="#a5b4fc" className="dark:fill-stone-500"/>
    {/* Side towers */}
    <rect x="60" y="80" width="55" height="115" fill="#4f46e5" rx="2" opacity="0.6" className="dark:fill-stone-600 dark:opacity-40"/>
    <rect x="205" y="95" width="55" height="100" fill="#4f46e5" rx="2" opacity="0.6" className="dark:fill-stone-600 dark:opacity-40"/>
    <rect x="0" y="195" width="320" height="5" fill="#312e81" className="dark:fill-stone-850"/>
  </svg>,
];

export default function ProjectCard({ project, index = 0 }) {
  const sc = statusConfig[project.status] || statusConfig['Under Construction'];
  const gradient = projectGradients[index % projectGradients.length];
  const illustration = projectIllustrations[index % projectIllustrations.length];
  
  const soldPct = project.totalUnits > 0
    ? Math.round(((project.salesData?.soldUnits || 0) / project.totalUnits) * 100)
    : 0;

  const getAtGlanceTags = () => {
    if (project._id === 'proj-001') {
      return ['Possession in 2026', 'Investment-Grade', 'RERA Approved'];
    } else if (project._id === 'proj-002') {
      return ['Ready to Occupy', 'Family-Friendly', 'Luxury Greens'];
    } else {
      return ['Possession in 2028', 'Bespoke Luxury', 'Mumbai Prime'];
    }
  };

  const tags = getAtGlanceTags();

  const getOperationalDetails = () => {
    if (project._id === 'proj-001') {
      return { maintenance: '₹4,500 / mo', parking: '1 Car Slot', handover: 'Dec 31, 2026' };
    } else if (project._id === 'proj-002') {
      return { maintenance: '₹6,000 / mo', parking: '2 Car Parks', handover: 'Immediate' };
    } else {
      return { maintenance: '₹9,500 / mo', parking: '2 Private Slots', handover: 'March 2028' };
    }
  };

  const opDetails = getOperationalDetails();

  return (
    <div className="group bg-white dark:bg-stone-900 border border-slate-205 dark:border-stone-800 rounded-2xl overflow-hidden flex flex-col hover:border-slate-400 dark:hover:border-stone-600 transition-all duration-300 hover:-translate-y-1 text-left">
      {/* Hero illustration */}
      <div className={`relative h-48 sm:h-52 overflow-hidden bg-gradient-to-br ${gradient}`}>
        {illustration}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/90 dark:from-stone-900/90 via-transparent to-transparent" />

        {/* Status badge */}
        <div className="absolute top-3 left-3">
          <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border backdrop-blur-sm shadow-xs ${sc.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
            {project.status}
          </span>
        </div>

        {/* RERA */}
        {project.reraNumber && (
          <div className="absolute top-3 right-3">
            <span className="text-[9px] uppercase tracking-widest font-extrabold text-slate-700 dark:text-stone-300 bg-white/90 dark:bg-stone-850/90 backdrop-blur-sm px-2 py-1 rounded-lg border border-slate-205 dark:border-stone-750 shadow-xs">
              RERA Compliant
            </span>
          </div>
        )}

        {/* Bottom info bar */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-3 pt-8">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] font-extrabold text-slate-500 dark:text-stone-400 uppercase tracking-wider">{project.location?.address}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Base Rate</p>
              <p className="text-sm font-extrabold text-slate-900 dark:text-white font-display">{formatCurrencyShort(project.priceRange?.min)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex flex-col flex-1 gap-4">
        {/* Title & Tags */}
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-stone-200 transition-colors">
            {project.name}
          </h3>
          {project.tagline && (
            <p className="text-xs text-slate-500 dark:text-stone-400 mt-0.5">{project.tagline}</p>
          )}
          {/* At-a-glance tags */}
          <div className="flex flex-wrap gap-1 mt-2.5">
            {tags.map((tag, idx) => (
              <span 
                key={tag} 
                className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                  idx === 0 ? 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30' :
                  idx === 1 ? 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30' :
                  'bg-slate-50 text-slate-700 border-slate-100 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700'
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Actionable Specifications */}
        <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-stone-850 border border-slate-200 dark:border-stone-800 rounded-xl p-3 text-center">
          <div>
            <p className="text-slate-400 dark:text-stone-500 text-[9px] uppercase font-bold tracking-wider">Maintenance</p>
            <p className="text-[11px] font-bold text-slate-700 dark:text-stone-200 mt-0.5">{opDetails.maintenance}</p>
          </div>
          <div className="border-x border-slate-200 dark:border-stone-800">
            <p className="text-slate-400 dark:text-stone-500 text-[9px] uppercase font-bold tracking-wider">Parking Allocation</p>
            <p className="text-[11px] font-bold text-slate-700 dark:text-stone-200 mt-0.5">{opDetails.parking}</p>
          </div>
          <div>
            <p className="text-slate-400 dark:text-stone-500 text-[9px] uppercase font-bold tracking-wider">Target Handover</p>
            <p className="text-[11px] font-bold text-slate-700 dark:text-stone-200 mt-0.5">{opDetails.handover}</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-stone-400 py-1.5 border-y border-slate-100 dark:border-stone-800">
          <span>Towers: <strong className="text-slate-800 dark:text-stone-200">{project.totalTowers}</strong></span>
          <span>Floors: <strong className="text-slate-800 dark:text-stone-200">{project.totalFloors}</strong></span>
          <span>Inventory: <strong className="text-slate-800 dark:text-stone-200">{project.totalUnits} Units</strong></span>
        </div>

        {/* Sales progress */}
        <div>
          <div className="flex justify-between text-[10px] text-slate-500 dark:text-stone-400 mb-1.5 font-bold uppercase tracking-wider">
            <span>Allotted: <strong>{project.salesData?.soldUnits || 0} sold</strong></span>
            <span className="font-bold text-slate-900 dark:text-white">{soldPct}% RERA Locked</span>
          </div>
          <div className="h-1.5 bg-slate-100 dark:bg-stone-800 border border-slate-200/50 dark:border-stone-750 rounded-full overflow-hidden">
            <div
              className="h-full bg-slate-900 dark:bg-white rounded-full transition-all duration-700"
              style={{ width: `${soldPct}%` }}
            />
          </div>
        </div>

        {/* CTA */}
        <Link
          to={`/projects/${project._id}`}
          id={`project-card-cta-${project._id}`}
          className="btn-primary text-center text-xs font-bold uppercase tracking-wider py-2.5 mt-auto flex items-center justify-center gap-1.5"
        >
          Check Detailed Blueprint & Units →
        </Link>
      </div>
    </div>
  );
}
