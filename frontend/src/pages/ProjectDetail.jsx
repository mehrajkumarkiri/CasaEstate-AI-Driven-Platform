import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProject } from '../hooks/useProjects';
import { useApp } from '../context/AppContext';
import { unitsApi } from '../services/api';
import InteractiveFloorPlan from '../components/InteractiveFloorPlan';
import BookingForm from '../components/BookingForm';
import { ProjectCardSkeleton } from '../components/SkeletonLoader';
import { formatCurrencyShort, formatDate, formatArea } from '../utils/formatters';

function generateMockUnits(projectId, floors = 8, perFloor = 8) {
  const bhkTypes = ['2BHK', '2BHK', '3BHK', '3BHK', '4BHK', '2BHK', '3BHK', '3BHK'];
  const availabilities = ['Available', 'Available', 'Reserved', 'Available', 'Sold', 'Available', 'Reserved', 'Available'];
  const facings = ['North', 'South', 'East', 'West', 'North-East', 'South-East', 'North-West', 'South-West'];
  const basePrices = { '2BHK': 6500000, '3BHK': 9800000, '4BHK': 14500000 };
  const carpetAreas = { '2BHK': 950, '3BHK': 1350, '4BHK': 1850 };
  const units = [];
  for (let floor = 1; floor <= floors; floor++) {
    for (let u = 1; u <= perFloor; u++) {
      const bhkType = bhkTypes[(u - 1) % bhkTypes.length];
      const base = (basePrices[bhkType] || 9800000) + floor * 50000;
      const area = carpetAreas[bhkType] || 1350;
      units.push({
        _id: `unit-${projectId}-f${floor}-u${u}`,
        projectId,
        unitNumber: `${['A', 'B'][Math.floor((u - 1) / 4)]}${floor}0${u}`,
        floor,
        tower: floor <= 16 ? 'A' : 'B',
        bhkType,
        carpetArea: area,
        builtUpArea: Math.round(area * 1.2),
        superBuiltUpArea: Math.round(area * 1.35),
        facing: facings[(u - 1) % facings.length],
        availability: availabilities[(u - 1) % availabilities.length],
        pricing: {
          basePrice: base,
          pricePerSqFt: Math.round(base / area),
          stampDuty: 5, registrationFee: 1,
          maintenanceDeposit: 50000, parkingCharges: 150000, gst: 5,
        },
        balconies: bhkType === '2BHK' ? 1 : 2,
        parking: 1,
      });
    }
  }
  return units;
}

function UnitFilters({ filter, setFilter, units }) {
  const counts = {
    all: units.length,
    Available: units.filter(u => u.availability === 'Available').length,
    Reserved: units.filter(u => u.availability === 'Reserved').length,
    Sold: units.filter(u => u.availability === 'Sold').length,
  };
  const tabs = [
    { key: 'all', label: 'All Layouts', color: 'text-slate-650 dark:text-stone-400' },
    { key: 'Available', label: 'Available', color: 'text-emerald-700 dark:text-emerald-400' },
    { key: 'Reserved', label: 'Reserved', color: 'text-amber-700 dark:text-amber-400' },
    { key: 'Sold', label: 'Sold', color: 'text-red-700 dark:text-red-400' },
  ];
  return (
    <div className="flex gap-1.5 flex-wrap">
      {tabs.map(t => (
        <button key={t.key} id={`unit-filter-${t.key}`}
          onClick={() => setFilter(t.key)}
          className={`text-xs font-bold uppercase tracking-wider px-3.5 py-2 rounded-xl border transition-all ${
            filter === t.key
              ? 'bg-slate-900 dark:bg-stone-100 border-slate-900 dark:border-white text-white dark:text-stone-950 shadow-xs'
              : 'bg-white dark:bg-stone-900 border-slate-205 dark:border-stone-800 text-slate-500 hover:border-slate-350 dark:hover:border-stone-700 hover:text-slate-800 dark:hover:text-stone-200'
          }`}
        >
          {t.label} <span className="ml-1 font-bold">({counts[t.key]})</span>
        </button>
      ))}
    </div>
  );
}

function UnitListItem({ unit, onSelect }) {
  const dotColor = { Available: 'bg-emerald-500', Reserved: 'bg-amber-500', Sold: 'bg-red-500' };
  const badgeBg = { Available: 'badge-available', Reserved: 'badge-reserved', Sold: 'badge-sold' };
  
  return (
    <div
      className={`flex items-center gap-4 px-4 py-3.5 rounded-xl border border-slate-205 dark:border-stone-800 bg-white dark:bg-stone-900
        transition-all group hover:shadow-xs
        ${unit.availability === 'Available' ? 'hover:border-slate-400 dark:hover:border-stone-600 cursor-pointer' : 'opacity-85'}`}
      onClick={() => unit.availability === 'Available' && onSelect(unit)}
    >
      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dotColor[unit.availability]}`} />
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-slate-900 dark:text-white">Unit {unit.unitNumber}</span>
          <span className="text-[10px] text-slate-500 dark:text-stone-400 bg-slate-100 dark:bg-stone-800 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">{unit.bhkType}</span>
          <span className="text-xs text-slate-400 dark:text-stone-500 font-medium">Floor {unit.floor} · Facing {unit.facing}</span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-stone-400 mt-0.5">{formatArea(unit.carpetArea)} carpet · {formatArea(unit.superBuiltUpArea)} built-up</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-extrabold text-slate-900 dark:text-white font-display">{formatCurrencyShort(unit.pricing?.basePrice)}</p>
        <p className="text-[10px] text-slate-400 dark:text-stone-500 font-semibold">₹{unit.pricing?.pricePerSqFt?.toLocaleString('en-IN')}/sq.ft</p>
      </div>
      {unit.availability === 'Available' ? (
        <button
          className="flex-shrink-0 text-xs font-bold uppercase tracking-wider bg-slate-900 dark:bg-stone-100 text-white dark:text-stone-950 px-3 py-1.5 rounded-lg
          opacity-0 group-hover:opacity-100 transition-opacity"
        >
          Book Now
        </button>
      ) : (
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${badgeBg[unit.availability]}`}>
          {unit.availability}
        </span>
      )}
    </div>
  );
}

function EnterpriseWholesaleDesk({ project, units, pushNotification }) {
  const [bhk, setBhk] = useState('3BHK');
  const [quantity, setQuantity] = useState(5);
  const [proposedPrice, setProposedPrice] = useState(0);
  const [logs, setLogs] = useState([]);
  const [dealStatus, setDealStatus] = useState('idle'); // 'idle', 'analyzing', 'rejected', 'accepted', 'finalizing', 'complete'
  const [allotment, setAllotment] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const termRef = useRef(null);

  useEffect(() => {
    const base = bhk === '2BHK' ? 6500000 : bhk === '3BHK' ? 9800000 : 14500000;
    setProposedPrice(Math.round(base * quantity * 0.88)); // Default 12% B2B bulk discount
  }, [bhk, quantity]);

  useEffect(() => {
    if (termRef.current) {
      termRef.current.scrollTop = termRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = (msg) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handlePropose = async () => {
    setLogs([]);
    setDealStatus('analyzing');
    setIsTyping(true);

    const base = bhk === '2BHK' ? 6500000 : bhk === '3BHK' ? 9800000 : 14500000;
    const baseTotal = base * quantity;
    const marginRatio = proposedPrice / baseTotal;

    const steps = [
      `[AI-NEGOTIATOR] Proposing B2B wholesale contract proposal: ${quantity} units of ${bhk}...`,
      `[AI-NEGOTIATOR] Querying inventory scarcity index for project: ${project.name}...`,
      `[AI-NEGOTIATOR] Real-time check: ${units.filter(u => u.bhkType === bhk && u.availability === 'Available').length} active blocks available.`,
      `[AI-NEGOTIATOR] Evaluating yield targets. Bulk threshold margin is 90.0% of standard pricing...`,
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 700));
      addLog(steps[i]);
    }

    await new Promise(r => setTimeout(r, 500));

    if (marginRatio < 0.90) {
      addLog(`[AI-NEGOTIATOR] YIELD FAIL: Proposed price yields ${(marginRatio * 100).toFixed(1)}%, which is below target margins.`);
      addLog(`[AI-NEGOTIATOR] REJECTED. Proposing counter-offer: ₹${((baseTotal * 0.91) / 10000000).toFixed(2)} Cr (9% bulk discount rate).`);
      setDealStatus('rejected');
    } else {
      addLog(`[AI-NEGOTIATOR] YIELD MATCH: Propose price yields ${(marginRatio * 100).toFixed(1)}% (margin targets satisfied).`);
      addLog(`[AI-NEGOTIATOR] Deal Confirmed. Security database lock authorized.`);
      setDealStatus('accepted');
    }
    setIsTyping(false);
  };

  const handleAcceptCounter = () => {
    const base = bhk === '2BHK' ? 6500000 : bhk === '3BHK' ? 9800000 : 14500000;
    const baseTotal = base * quantity;
    setProposedPrice(Math.round(baseTotal * 0.91));
    setDealStatus('accepted');
    addLog(`[AI-NEGOTIATOR] Counter-offer accepted by buyer. Ready for transaction finalization.`);
  };

  const handleFinalize = async () => {
    setDealStatus('finalizing');
    addLog(`[SYSTEM] Dispatches finalization block to /api/v1/negotiations/finalize...`);

    try {
      const response = await fetch('/api/v1/negotiations/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project._id,
          bhkType: bhk,
          quantity,
          agreedPrice: proposedPrice,
          userName: 'Arjun Mehta',
          userEmail: 'arjun.mehta@casaestate.com',
          userPhone: '+91-9876543210'
        })
      });
      const data = await response.json();
      if (data.success) {
        setAllotment(data.allotmentLetter);
        setDealStatus('complete');
        addLog(`[SYSTEM] Allotment secured successfully! Document ID: ${data.allotmentLetter.documentRef}`);
        pushNotification({
          type: 'success',
          title: '🎉 Wholesale Allotment Confirmed',
          message: `Secured RERA lock on ${quantity} units of ${bhk} for ${project.name}.`
        });
      } else {
        addLog(`[SYSTEM] Finalization failed: ${data.message}`);
        setDealStatus('idle');
      }
    } catch {
      // Local demo mode simulation
      await new Promise(r => setTimeout(r, 1200));
      const mockUuid = 'MOCK-UUID-' + Date.now().toString().slice(-4);
      const counterResult = {
        documentRef: `AL-B2B-${mockUuid}`,
        allottee: { name: 'Arjun Mehta', email: 'arjun.mehta@casaestate.com', phone: '+91-9876543210', company: 'Enterprise Client Holdings' },
        transactionUuid: mockUuid,
        project: { id: project._id, name: project.name },
        costBreakdown: { unitsCount: quantity, agreedBulkPrice: proposedPrice, averageUnitPrice: Math.round(proposedPrice / quantity), stampDutyEstimated: Math.round(proposedPrice * 0.05) },
        legalTerms: [
          'This document constitutes a provisional RERA-locked bulk inventory allotment.',
          'The buyer agrees to clear the provisional token deposit (5%) within 48 business hours.',
          'Stock status is locked. System-wide double-booking guard has blocked other negotiators.'
        ]
      };
      setAllotment(counterResult);
      setDealStatus('complete');
      addLog(`[SYSTEM] Mock Registry locked successfully! Reference Ref: CB-MOCK-99`);
    }
  };

  return (
    <div className="bg-white dark:bg-stone-900 border border-slate-205 dark:border-stone-800 rounded-2xl p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
      {/* Parameters Panel */}
      <div className="lg:col-span-5 space-y-4">
        <div>
          <h3 className="text-xs font-bold text-slate-800 dark:text-stone-200 uppercase tracking-wider">Enterprise Wholesale Desk</h3>
          <p className="text-[11px] text-slate-500 dark:text-stone-400 mt-0.5">Autonomous bulk buyout rate negotiation console.</p>
        </div>

        {dealStatus === 'complete' ? (
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 p-4 rounded-xl text-xs space-y-2 text-emerald-800 dark:text-emerald-400">
            <p className="font-bold">🎉 Contract Provisional Secured</p>
            <p>Invoice Registry Ref: <span className="font-mono font-bold">{allotment?.transactionUuid}</span></p>
            <p>Allotted units: <strong>{allotment?.costBreakdown?.unitsCount} blocks</strong></p>
            <p>Total Agreed Cost: <strong>₹{(allotment?.costBreakdown?.agreedBulkPrice / 10000000).toFixed(2)} Cr</strong></p>
            <button 
              onClick={() => alert(`Downloading RERA B2B Contract Deed: ${allotment?.documentRef}`)}
              className="mt-2 w-full text-center bg-emerald-600 text-white font-bold py-2 rounded-lg text-[10px] uppercase tracking-wider hover:bg-emerald-700"
            >
              Download Signed Deed PDF
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1">Target Layout Block</label>
              <select 
                value={bhk} 
                disabled={dealStatus !== 'idle' && dealStatus !== 'rejected'}
                onChange={e => setBhk(e.target.value)}
                className="w-full bg-slate-50 dark:bg-stone-800 border border-slate-200 dark:border-stone-750 text-slate-900 dark:text-white text-xs rounded-xl px-4 py-2.5"
              >
                <option value="2BHK">2BHK Layout</option>
                <option value="3BHK">3BHK Layout</option>
                <option value="4BHK">4BHK Layout</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1">Bulk Buyout Quantity</label>
              <input 
                type="number" 
                min={2} 
                max={20}
                disabled={dealStatus !== 'idle' && dealStatus !== 'rejected'}
                value={quantity}
                onChange={e => setQuantity(Math.max(2, parseInt(e.target.value, 10) || 2))}
                className="w-full bg-slate-50 dark:bg-stone-800 border border-slate-200 dark:border-stone-750 text-slate-900 dark:text-white text-xs rounded-xl px-4 py-2.5"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1">Proposed Bulk Price (in INR)</label>
              <input 
                type="number"
                disabled={dealStatus !== 'idle' && dealStatus !== 'rejected'}
                value={proposedPrice}
                onChange={e => setProposedPrice(parseInt(e.target.value, 10) || 0)}
                className="w-full bg-slate-50 dark:bg-stone-800 border border-slate-200 dark:border-stone-750 text-slate-900 dark:text-white text-xs rounded-xl px-4 py-2.5 font-mono"
              />
              <p className="text-[10px] text-slate-400 dark:text-stone-500 mt-1">₹{(proposedPrice / 10000000).toFixed(2)} Crores total price</p>
            </div>

            {dealStatus === 'idle' && (
              <button 
                onClick={handlePropose}
                className="w-full btn-primary text-xs font-bold uppercase tracking-wider py-2.5 flex items-center justify-center gap-1.5"
              >
                💼 Propose Contract
              </button>
            )}

            {dealStatus === 'rejected' && (
              <div className="space-y-2">
                <button 
                  onClick={handleAcceptCounter}
                  className="w-full bg-slate-900 dark:bg-stone-100 text-white dark:text-stone-950 text-xs font-bold uppercase tracking-wider py-2.5 rounded-xl hover:bg-slate-800"
                >
                  Accept Counter Deal
                </button>
                <button 
                  onClick={() => setDealStatus('idle')}
                  className="w-full btn-secondary text-xs font-bold py-2"
                >
                  Re-negotiate
                </button>
              </div>
            )}

            {dealStatus === 'accepted' && (
              <button 
                onClick={handleFinalize}
                className="w-full bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider py-2.5 rounded-xl hover:bg-emerald-700"
              >
                🔒 Lock Deal & Sign Allotment
              </button>
            )}
          </div>
        )}
      </div>

      {/* Terminal Output */}
      <div className="lg:col-span-7 flex flex-col bg-black border border-stone-800 rounded-xl overflow-hidden min-h-[260px] max-h-[360px]">
        <div className="bg-stone-900 border-b border-stone-850 px-4 py-2 flex items-center justify-between">
          <span className="text-[10px] text-stone-400 font-mono font-bold">CASA-AI-NEGOTIATOR v2.4</span>
          <div className="flex gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="w-2 h-2 rounded-full bg-green-500" />
          </div>
        </div>
        <div ref={termRef} className="flex-1 overflow-y-auto p-4 space-y-2.5 font-mono text-[11px] text-emerald-400/90 scrollbar-hide">
          {logs.length === 0 ? (
            <p className="text-stone-600">Awaiting enterprise buyer contract submission details...</p>
          ) : (
            logs.map((log, i) => <p key={i} className="leading-relaxed whitespace-pre-wrap">{log}</p>)
          )}
          {isTyping && (
            <span className="inline-block w-1.5 h-3 bg-emerald-400 animate-pulse ml-0.5" />
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProjectDetail() {
  const { id } = useParams();
  const { project, loading: pLoading } = useProject(id);
  const { openBookingDrawer, pushNotification } = useApp();
  const [units, setUnits] = useState([]);
  const [unitsLoading, setUnitsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('floorplan');
  const [syncTime, setSyncTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const interval = setInterval(() => {
      setSyncTime(new Date().toLocaleTimeString());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!id) return;
    setUnitsLoading(true);
    unitsApi.getAll({ projectId: id })
      .then((res) => setUnits(res.data || generateMockUnits(id)))
      .catch(() => setUnits(generateMockUnits(id)))
      .finally(() => setUnitsLoading(false));
  }, [id]);

  const filteredUnits = useMemo(() =>
    filter === 'all' ? units : units.filter(u => u.availability === filter),
    [units, filter]
  );

  const stats = useMemo(() => ({
    available: units.filter(u => u.availability === 'Available').length,
    reserved: units.filter(u => u.availability === 'Reserved').length,
    sold: units.filter(u => u.availability === 'Sold').length,
    total: units.length,
  }), [units]);

  const handleDownload = (docName, size) => {
    pushNotification({
      type: 'success',
      title: '📥 Sanction Document Downloaded',
      message: `Successfully compiled and downloaded "${docName}" (Size: ${size}). RERA verification reference active.`,
      duration: 5000
    });
  };

  if (pLoading) {
    return (
      <div className="pt-20 px-4 max-w-7xl mx-auto bg-slate-50 dark:bg-stone-950 min-h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2"><ProjectCardSkeleton /></div>
          <ProjectCardSkeleton />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="pt-32 text-center text-slate-500 bg-slate-50 dark:bg-stone-950 min-h-screen">
        <p className="text-4xl mb-4">🏗️</p>
        <p className="text-lg font-semibold text-slate-900 dark:text-white">Project Registry Not Found</p>
        <Link to="/" className="btn-primary mt-6 inline-block">← Back to Portfolio</Link>
      </div>
    );
  }

  return (
    <>
      <div className="pt-16 min-h-screen bg-slate-50 dark:bg-stone-950 transition-colors duration-350">
        
        {/* Hero Bar */}
        <div className="relative bg-white dark:bg-stone-900 border-b border-slate-205 dark:border-stone-800 text-left">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
            <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 dark:text-stone-400 dark:hover:text-white mb-4 transition-colors">
              ← Back to Projects Portfolio
            </Link>
            
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                    project.status === 'Ready to Move' ? 'badge-available' :
                    project.status === 'Pre-Launch' ? 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30' :
                    'badge-reserved'
                  }`}>{project.status}</span>
                  {project.reraNumber && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-stone-400 border border-slate-205 dark:border-stone-850 bg-slate-50 dark:bg-stone-850 px-2.5 py-1 rounded-full">
                      RERA REGISTRY: {project.reraNumber}
                    </span>
                  )}
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">{project.name}</h1>
                <p className="text-slate-500 dark:text-stone-400 mt-1 font-semibold text-xs">📍 {project.location?.address}, {project.location?.city}</p>
              </div>
              <div className="text-left lg:text-right">
                <p className="text-[9px] font-bold text-slate-400 dark:text-stone-500 uppercase tracking-widest">Sanctioned Price Matrix</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white font-display">
                  {formatCurrencyShort(project.priceRange?.min)} – {formatCurrencyShort(project.priceRange?.max)}
                </p>
                <div className="flex items-center lg:justify-end gap-1.5 text-xs text-slate-500 dark:text-stone-400 mt-1 font-semibold">
                  <span>Target Handover: <strong>{formatDate(project.possessionDate)}</strong></span>
                </div>
              </div>
            </div>

            {/* Inventory overview statistics */}
            <div className="mt-6 grid grid-cols-4 gap-3">
              {[
                { label: 'Total Inventory', value: stats.total, cls: 'text-slate-900 dark:text-white' },
                { label: 'Available RERA', value: stats.available, cls: 'text-emerald-700 dark:text-emerald-400' },
                { label: 'Provisional Locks', value: stats.reserved, cls: 'text-amber-700 dark:text-amber-400' },
                { label: 'Allotted & Sold', value: stats.sold, cls: 'text-red-700 dark:text-red-400' },
              ].map(s => (
                <div key={s.label} className="bg-slate-50 dark:bg-stone-850 border border-slate-200 dark:border-stone-800 rounded-xl p-3 text-center">
                  <p className={`text-xl font-black font-display ${s.cls}`}>{s.value}</p>
                  <p className="text-[9px] font-bold text-slate-400 dark:text-stone-500 uppercase tracking-wider">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-slate-450 dark:text-stone-550 bg-slate-50 dark:bg-stone-850 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-stone-800">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Availability Ledger (Updated at: {syncTime})
              </span>
              <span className="font-bold text-slate-800 dark:text-stone-300 uppercase tracking-wider text-[10px]">Atomic Database Locks Enabled</span>
            </div>

          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Main content area */}
          <div className="xl:col-span-2 space-y-6">
            
            {/* Tabs */}
            <div className="flex gap-1 border-b border-slate-200 dark:border-stone-800 pb-0 overflow-x-auto scrollbar-hide text-left">
              {[
                { key: 'floorplan', label: '🗺️ Blueprint Map' },
                { key: 'units', label: '🏠 Available Units' },
                { key: 'specs', label: '📋 Technical Specs' },
                { key: 'rera', label: '🔒 RERA Compliance Documents' },
                { key: 'wholesale', label: '💼 Enterprise Wholesale Desk' },
              ].map(t => (
                <button key={t.key} id={`tab-${t.key}`}
                  onClick={() => setActiveTab(t.key)}
                  className={`text-xs font-bold uppercase tracking-wider px-4 py-3 border-b-2 transition-all -mb-px whitespace-nowrap ${
                    activeTab === t.key
                      ? 'text-slate-900 dark:text-white border-slate-900 dark:border-white'
                      : 'text-slate-500 border-transparent hover:text-slate-850 dark:hover:text-stone-250'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* SVG Blueprint Tab */}
            {activeTab === 'floorplan' && (
              <div className="animate-fade-in">
                {unitsLoading ? (
                  <div className="bg-white dark:bg-stone-900 border border-slate-205 dark:border-stone-800 h-80 flex items-center justify-center rounded-2xl">
                    <div className="skeleton h-60 w-11/12 rounded-xl" />
                  </div>
                ) : (
                  <InteractiveFloorPlan units={units} projectName={project.name} />
                )}
              </div>
            )}

            {/* Unit list tab */}
            {activeTab === 'units' && (
              <div className="animate-fade-in space-y-4">
                <div className="flex justify-between items-center flex-wrap gap-3">
                  <UnitFilters filter={filter} setFilter={setFilter} units={units} />
                </div>
                <div className="space-y-2.5">
                  {filteredUnits.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 dark:text-stone-400 bg-white dark:bg-stone-900 border border-slate-205 dark:border-stone-800 rounded-2xl">No units match criteria.</div>
                  ) : (
                    filteredUnits.slice(0, 35).map(u => (
                      <UnitListItem key={u._id} unit={u} onSelect={(unit) => openBookingDrawer(unit, project)} />
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Specs Tab */}
            {activeTab === 'specs' && (
              <div className="animate-fade-in space-y-4 text-left">
                <div className="bg-white dark:bg-stone-900 border border-slate-205 dark:border-stone-800 p-5 rounded-2xl shadow-xs">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Building Specifications</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(project.specifications || {}).map(([k, v]) => (
                      <div key={k} className="bg-slate-50 dark:bg-stone-850 rounded-xl p-4 border border-slate-200 dark:border-stone-800">
                        <p className="text-[9px] text-slate-400 dark:text-stone-500 uppercase font-bold mb-1">{k}</p>
                        <p className="text-xs text-slate-700 dark:text-stone-200 leading-relaxed font-bold">{v}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white dark:bg-stone-900 border border-slate-205 dark:border-stone-800 p-5 rounded-2xl shadow-xs">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Integrated Structural Systems</h3>
                  <div className="flex flex-wrap gap-2">
                    {(project.features || []).map(f => (
                      <span key={f} className="text-xs font-semibold text-slate-700 dark:text-stone-300 bg-slate-50 dark:bg-stone-850 border border-slate-200 dark:border-stone-800 px-3 py-1.5 rounded-xl">
                        ✓ {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* RERA disclosures Tab */}
            {activeTab === 'rera' && (
              <div className="animate-fade-in space-y-4 text-left">
                <div className="bg-white dark:bg-stone-900 border border-slate-205 dark:border-stone-800 p-6 rounded-2xl shadow-xs space-y-6">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">Legal Certifications & Sanction Blueprints</h3>
                    <p className="text-xs text-slate-550 dark:text-stone-400 leading-relaxed">
                      Download municipal sanctions, environment clears, fire safety certificates, and construction status proofs registered under RERA.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 dark:border-stone-800 pt-4">
                    <div className="p-4 bg-slate-50 dark:bg-stone-850 border border-slate-200 dark:border-stone-800 rounded-xl flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-stone-200">Sanctioned Building Layout</p>
                        <p className="text-[9px] text-slate-400 dark:text-stone-500 uppercase font-bold mt-0.5">PDF blueprint · 12.4 MB</p>
                      </div>
                      <button 
                        onClick={() => handleDownload('Sanctioned Layout Drawing.pdf', '12.4 MB')}
                        className="text-[10px] font-bold uppercase bg-slate-900 hover:bg-slate-800 dark:bg-stone-800 dark:hover:bg-stone-700 text-white dark:text-stone-200 px-3 py-2 rounded-lg"
                      >
                        Download
                      </button>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-stone-850 border border-slate-200 dark:border-stone-800 rounded-xl flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-stone-200">RERA Registration Certificate</p>
                        <p className="text-[9px] text-slate-400 dark:text-stone-500 uppercase font-bold mt-0.5">Government Stamp · 3.1 MB</p>
                      </div>
                      <button 
                        onClick={() => handleDownload('RERA Certification.pdf', '3.1 MB')}
                        className="text-[10px] font-bold uppercase bg-slate-900 hover:bg-slate-800 dark:bg-stone-800 dark:hover:bg-stone-700 text-white dark:text-stone-200 px-3 py-2 rounded-lg"
                      >
                        Download
                      </button>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-stone-850 border border-slate-200 dark:border-stone-800 rounded-xl flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-stone-200">Fire NOC Clear Certificate</p>
                        <p className="text-[9px] text-slate-400 dark:text-stone-500 uppercase font-bold mt-0.5">Safety clearance · 1.8 MB</p>
                      </div>
                      <button 
                        onClick={() => handleDownload('Fire Marshall NOC.pdf', '1.8 MB')}
                        className="text-[10px] font-bold uppercase bg-slate-900 hover:bg-slate-800 dark:bg-stone-800 dark:hover:bg-stone-700 text-white dark:text-stone-200 px-3 py-2 rounded-lg"
                      >
                        Download
                      </button>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-stone-850 border border-slate-200 dark:border-stone-800 rounded-xl flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-stone-200">Commencement NOC</p>
                        <p className="text-[9px] text-slate-400 dark:text-stone-500 uppercase font-bold mt-0.5">Municipal Authority · 4.2 MB</p>
                      </div>
                      <button 
                        onClick={() => handleDownload('Commencement NOC Drawing.pdf', '4.2 MB')}
                        className="text-[10px] font-bold uppercase bg-slate-900 hover:bg-slate-800 dark:bg-stone-800 dark:hover:bg-stone-700 text-white dark:text-stone-200 px-3 py-2 rounded-lg"
                      >
                        Download
                      </button>
                    </div>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl p-4 text-xs text-amber-800 dark:text-amber-400 leading-normal">
                    <strong>Note:</strong> Environmental audit ledgers, bank project tie-up details, and escrow details can be verified at our Noida corporate head office directly.
                  </div>
                </div>
              </div>
            )}

            {/* Enterprise B2B Wholesale Desk Tab */}
            {activeTab === 'wholesale' && (
              <div className="animate-fade-in">
                <EnterpriseWholesaleDesk project={project} units={units} pushNotification={pushNotification} />
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="space-y-4 text-left">
            
            {/* Description */}
            <div className="bg-white dark:bg-stone-900 border border-slate-205 dark:border-stone-800 p-5 rounded-2xl shadow-xs">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">Project Description</h3>
              <p className="text-xs text-slate-650 dark:text-stone-400 leading-relaxed font-semibold">{project.description}</p>
            </div>

            {/* Stats Overview */}
            <div className="bg-white dark:bg-stone-900 border border-slate-205 dark:border-stone-800 p-5 rounded-2xl shadow-xs">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Overview Parameters</h3>
              <div className="space-y-3">
                {[
                  ['Total Floors', `${project.totalFloors} floors`],
                  ['Towers Count', `${project.totalTowers} Block Towers`],
                  ['Total Capacity', `${project.totalUnits} Units`],
                  ['City Location', project.location?.city],
                  ['Possession Release', formatDate(project.possessionDate)],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-xs py-2 border-b border-slate-100 dark:border-stone-800 last:border-0">
                    <span className="text-slate-400 dark:text-stone-500 font-bold uppercase">{k}</span>
                    <span className="text-slate-800 dark:text-stone-200 font-bold">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Amenities listings */}
            {(project.amenities || []).length > 0 && (
              <div className="bg-white dark:bg-stone-900 border border-slate-205 dark:border-stone-800 p-5 rounded-2xl shadow-xs">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Amenity Slot Prices</h3>
                <div className="space-y-3">
                  {(project.amenities || []).map(a => (
                    <div key={a._id || a.name} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-stone-800 border border-slate-200 dark:border-stone-750 flex items-center justify-center text-sm">
                        {a.type === 'Clubhouse' ? '🏛️' :
                         a.type === 'Swimming Pool' ? '🏊' :
                         a.type === 'Tennis Court' ? '🎾' :
                         a.type === 'Gym' ? '💪' :
                         a.type === 'Party Hall' ? '🎉' : '🏢'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-stone-200 truncate">{a.name}</p>
                        <p className="text-[9px] text-slate-400 dark:text-stone-500 font-bold uppercase">{a.operatingHours}</p>
                      </div>
                      <span className="text-[10px] font-bold text-slate-700 dark:text-stone-300 bg-slate-150 dark:bg-stone-800 px-2 py-0.5 rounded border border-slate-200 dark:border-stone-700">
                        {a.pricePerSlot === 0 ? 'Free' : `₹${a.pricePerSlot}`}
                      </span>
                    </div>
                  ))}
                </div>
                <Link to="/resident" className="btn-secondary w-full text-center text-xs mt-4 py-2.5 font-bold flex items-center justify-center">
                  Book Slot via Resident Portal →
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>

      <BookingForm />
    </>
  );
}
