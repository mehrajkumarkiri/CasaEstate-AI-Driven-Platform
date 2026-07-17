import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects';
import PropertyListingCard from '../components/PropertyListingCard';
import { ProjectCardSkeleton } from '../components/SkeletonLoader';
import { formatCurrencyShort, formatDate } from '../utils/formatters';
import { useApp } from '../context/AppContext';

const BHK_OPTIONS = ['2BHK', '3BHK', '4BHK'];
const POSSESSION_OPTIONS = [
  { label: 'Any time', value: 'any' },
  { label: 'Ready to move', value: 'ready' },
  { label: 'Within 1 year', value: '1y' },
  { label: 'Within 2 years', value: '2y' },
  { label: '2+ years out', value: '2y+' },
];
const MAX_BUDGET = 150000000; // 15 Cr ceiling for the slider

// Derive decision-grade fields the base project record doesn't carry yet
function enrichProject(project, idx) {
  const bhkByProject = {
    'proj-001': ['2BHK', '3BHK'],
    'proj-002': ['3BHK', '4BHK'],
    'proj-003': ['3BHK', '4BHK'],
  };
  const builderNames = ['CasaEstate Infra Pvt. Ltd.', 'CasaEstate Green Developers', 'CasaEstate Prime Towers'];
  const builderRatings = [4.3, 4.6, 4.8];

  return {
    ...project,
    bhkTypes: bhkByProject[project._id] || BHK_OPTIONS.slice(0, 2),
    builderName: builderNames[idx % builderNames.length],
    builderRating: builderRatings[idx % builderRatings.length],
    locality: project.location?.city || project.location?.address?.split(',').pop()?.trim() || 'Unknown',
    amenityNames: (project.amenities || []).map(a => a.type),
  };
}

function possessionBucket(dateStr) {
  if (!dateStr) return 'any';
  const target = new Date(dateStr);
  const now = new Date();
  const diffYears = (target - now) / (1000 * 60 * 60 * 24 * 365);
  if (diffYears <= 0) return 'ready';
  if (diffYears <= 1) return '1y';
  if (diffYears <= 2) return '2y';
  return '2y+';
}

function generateAiReport(projects) {
  if (projects.length === 0) return null;
  const reports = projects.map(p => {
    const sold = p.salesData?.soldUnits || 0;
    const total = p.totalUnits || 1;
    const velocity = (sold / total) * 100;
    let investmentGrade = 'B+';
    let investmentText = 'Steady demand and reliable RERA tracking.';
    if (velocity > 70) {
      investmentGrade = 'A+';
      investmentText = 'Extremely high demand and velocity. Scarcity pricing expected soon.';
    } else if (velocity > 50) {
      investmentGrade = 'A';
      investmentText = 'Solid uptake. Good combination of risk and value.';
    } else if (p.status === 'Ready to Move') {
      investmentGrade = 'A-';
      investmentText = 'Zero execution risk. Ideal for immediate rental yielding.';
    }
    
    let pros = ['Premium infrastructure design', 'Strategic locality access'];
    let cons = ['Higher price segment than local average'];
    if (p.name.includes('Horizon') || p._id === 'proj-001') {
      pros = ['Breathtaking panoramic sky views', 'Infinity pool & smart home features included'];
      cons = ['Traffic during peak hours in Sector 74 corridor'];
    } else if (p.name.includes('Serenity') || p._id === 'proj-002') {
      pros = ['Low-density eco-friendly villa community', 'High privacy & private garden spaces'];
      cons = ['Fewer public transport links nearby'];
    } else if (p.name.includes('Pinnacle') || p._id === 'proj-003') {
      pros = ['Bespoke helipad and private butler service', 'Calacatta marble finishes & wind-engineered façade'];
      cons = ['Longer execution timeframe (Pre-Launch)', 'Highest absolute capital outlay'];
    }

    return {
      _id: p._id,
      name: p.name,
      velocity: velocity.toFixed(0),
      grade: investmentGrade,
      text: investmentText,
      pros,
      cons
    };
  });

  let recommendation = '';
  if (projects.length === 1) {
    recommendation = `CasaAI Advisor: ${projects[0].name} is a solid pick. We recommend verifying the builder RERA credentials.`;
  } else if (projects.length === 2) {
    const [p1, p2] = reports;
    if (p1.grade === 'A+' || p1.grade === 'A') {
      recommendation = `CasaAI Advisor: We recommend <strong>${p1.name}</strong> for investment growth potential, and <strong>${p2.name}</strong> if you prioritize lower entry pricing or immediate possession.`;
    } else {
      recommendation = `CasaAI Advisor: <strong>${p2.name}</strong> represents high market velocity, while <strong>${p1.name}</strong> is suitable for long-term luxury living.`;
    }
  } else {
    recommendation = `CasaAI Advisor: For immediate yield/occupancy, choose <strong>Ready to Move</strong> projects. For maximum long-term capital appreciation, pre-launch options in key commercial sectors represent the highest ROI multiplier.`;
  }

  return { reports, recommendation };
}

export default function PropertyDiscovery() {
  const { projects, loading } = useProjects();
  const { currentUser } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [budget, setBudget] = useState(MAX_BUDGET);
  const [selectedBhk, setSelectedBhk] = useState([]);
  const [possession, setPossession] = useState('any');
  const [locality, setLocality] = useState('all');
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [compareIds, setCompareIds] = useState([]);
  const [showCompare, setShowCompare] = useState(false);

  const [aiQuery, setAiQuery] = useState('');
  const [aiParsing, setAiParsing] = useState(false);
  const [aiMessage, setAiMessage] = useState('');

  const [showProfiler, setShowProfiler] = useState(false);
  const [profilerStep, setProfilerStep] = useState(1);
  const [profileAnswers, setProfileAnswers] = useState({ goal: '', vibe: '', funding: '' });
  const [profileResult, setProfileResult] = useState(null);

  // 3D Walkthrough States
  const [selected3DProperty, setSelected3DProperty] = useState(null);
  const [show3DModal, setShow3DModal] = useState(false);
  const [walkthroughRoom, setWalkthroughRoom] = useState('lounge');
  const [walkthroughAngle, setWalkthroughAngle] = useState(45);
  const [walkthroughNightMode, setWalkthroughNightMode] = useState(false);
  const [walkthroughZoom, setWalkthroughZoom] = useState(1);

  const enriched = useMemo(() => projects.map(enrichProject), [projects]);

  const handleAiSearch = () => {
    if (!aiQuery.trim()) return;
    setAiParsing(true);
    setAiMessage('CasaAI is parsing your search query...');
    
    setTimeout(() => {
      const query = aiQuery.toLowerCase();
      
      // 1. Locality detection
      let matchedLocality = 'all';
      for (const loc of localities) {
        if (query.includes(loc.toLowerCase())) {
          matchedLocality = loc;
          break;
        }
      }
      if (matchedLocality === 'all') {
        if (query.includes('noida')) matchedLocality = 'Noida';
        else if (query.includes('gurugram') || query.includes('gurgaon')) matchedLocality = 'Gurugram';
        else if (query.includes('mumbai')) matchedLocality = 'Mumbai';
      }

      // 2. Budget detection
      let matchedBudget = MAX_BUDGET;
      const crMatch = query.match(/(?:under|below|max|maximum|within)?\s*(\d+(?:\.\d+)?)\s*(?:cr|crore|crs)/);
      const lMatch = query.match(/(?:under|below|max|maximum|within)?\s*(\d+(?:\.\d+)?)\s*(?:l|lakh|lakhs|lacs)/);
      const numMatch = query.match(/(?:under|below|max|maximum|within)?\s*(\d{7,9})/);

      if (crMatch) {
        matchedBudget = parseFloat(crMatch[1]) * 10000000;
      } else if (lMatch) {
        matchedBudget = parseFloat(lMatch[1]) * 100000;
      } else if (numMatch) {
        matchedBudget = parseInt(numMatch[1]);
      }

      // 3. BHK detection
      let matchedBhks = [];
      if (query.includes('2bhk') || query.includes('2 bhk') || query.includes('2-bhk') || query.includes('2 bedroom')) {
        matchedBhks.push('2BHK');
      }
      if (query.includes('3bhk') || query.includes('3 bhk') || query.includes('3-bhk') || query.includes('3 bedroom')) {
        matchedBhks.push('3BHK');
      }
      if (query.includes('4bhk') || query.includes('4 bhk') || query.includes('4-bhk') || query.includes('4 bedroom')) {
        matchedBhks.push('4BHK');
      }

      // 4. Possession detection
      let matchedPossession = 'any';
      if (query.includes('ready to move') || query.includes('ready') || query.includes('immediate')) {
        matchedPossession = 'ready';
      } else if (query.includes('1 year') || query.includes('1y') || query.includes('12 months')) {
        matchedPossession = '1y';
      } else if (query.includes('2 years') || query.includes('2y') || query.includes('24 months')) {
        matchedPossession = '2y';
      } else if (query.includes('future') || query.includes('2+ years') || query.includes('long term')) {
        matchedPossession = '2y+';
      }

      // 5. Amenities detection
      let matchedAmenities = [];
      if (query.includes('pool') || query.includes('swimming')) {
        matchedAmenities.push('Swimming Pool');
      }
      if (query.includes('gym') || query.includes('fitness')) {
        matchedAmenities.push('Gym');
      }
      if (query.includes('club') || query.includes('clubhouse')) {
        matchedAmenities.push('Clubhouse');
      }
      if (query.includes('tennis') || query.includes('court')) {
        matchedAmenities.push('Tennis Court');
      }
      if (query.includes('hall') || query.includes('party')) {
        matchedAmenities.push('Party Hall');
      }
      if (query.includes('co-working') || query.includes('office') || query.includes('work')) {
        matchedAmenities.push('Co-working Space');
      }

      // Apply the filters
      if (matchedLocality !== 'all') setLocality(matchedLocality);
      if (matchedBudget !== MAX_BUDGET) setBudget(matchedBudget);
      if (matchedBhks.length > 0) setSelectedBhk(matchedBhks);
      if (matchedPossession !== 'any') setPossession(matchedPossession);
      if (matchedAmenities.length > 0) setSelectedAmenities(matchedAmenities);

      // Build the success summary message
      let summaryParts = [];
      if (matchedBhks.length > 0) summaryParts.push(matchedBhks.join('/'));
      if (matchedLocality !== 'all') summaryParts.push(`in ${matchedLocality}`);
      if (matchedBudget !== MAX_BUDGET) summaryParts.push(`under ${formatCurrencyShort(matchedBudget)}`);
      if (matchedPossession !== 'any') {
        const label = POSSESSION_OPTIONS.find(o => o.value === matchedPossession)?.label;
        summaryParts.push(`(${label.toLowerCase()})`);
      }
      if (matchedAmenities.length > 0) summaryParts.push(`with ${matchedAmenities.join(', ')}`);

      const summaryStr = summaryParts.join(' ');
      setAiParsing(false);
      setAiMessage(`✨ Filters applied: ${summaryStr || 'General Search'}`);
    }, 1200);
  };

  const localities = useMemo(
    () => Array.from(new Set(enriched.map(p => p.locality))).sort(),
    [enriched]
  );

  const amenityOptions = useMemo(
    () => Array.from(new Set(enriched.flatMap(p => p.amenityNames))).sort(),
    [enriched]
  );

  const toggleBhk = (bhk) =>
    setSelectedBhk(prev => prev.includes(bhk) ? prev.filter(b => b !== bhk) : [...prev, bhk]);

  const toggleAmenity = (a) =>
    setSelectedAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);

  const toggleCompare = (id) =>
    setCompareIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : (prev.length < 3 ? [...prev, id] : prev));

  const resetFilters = () => {
    setSearchQuery(''); setBudget(MAX_BUDGET); setSelectedBhk([]);
    setPossession('any'); setLocality('all'); setSelectedAmenities([]);
  };

  const filtered = useMemo(() => {
    return enriched.filter((p) => {
      if (searchQuery && !(
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.location?.address?.toLowerCase().includes(searchQuery.toLowerCase())
      )) return false;

      if ((p.priceRange?.min ?? 0) > budget) return false;

      if (selectedBhk.length > 0 && !selectedBhk.some(b => p.bhkTypes.includes(b))) return false;

      if (possession !== 'any' && possessionBucket(p.possessionDate) !== possession) return false;

      if (locality !== 'all' && p.locality !== locality) return false;

      if (selectedAmenities.length > 0 && !selectedAmenities.every(a => p.amenityNames.includes(a))) return false;

      return true;
    });
  }, [enriched, searchQuery, budget, selectedBhk, possession, locality, selectedAmenities]);

  const compareProjects = enriched.filter(p => compareIds.includes(p._id));

  return (
    <div className="bg-[#f4f4f3] dark:bg-stone-950 text-stone-900 dark:text-white min-h-screen">

      {/* Page header */}
      <section className="border-b border-slate-205 dark:border-stone-800 bg-white dark:bg-stone-900 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-105 dark:border-stone-850 pb-5 mb-5">
            <div className="text-left">
              <p className="text-xs font-bold text-slate-400 dark:text-stone-500 uppercase tracking-widest mb-1">Property Discovery</p>
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-slate-900 dark:text-white">Find Your Home</h1>
              <p className="text-xs text-slate-500 dark:text-stone-400 mt-1">Filter registered premium towers by budget, layout, possession date, amenities, and locality.</p>
            </div>
            
            <button
              onClick={() => { setShowProfiler(true); setProfilerStep(1); setProfileResult(null); }}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-[10px] font-black uppercase tracking-widest px-5 py-3 rounded-xl flex items-center gap-2 border-none shadow-lg shadow-emerald-950/20 transition-all cursor-pointer"
            >
              📋 AI Lead Intent Profiler
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
            <div className="text-left">
              <label className="text-[10px] font-extrabold text-slate-500 dark:text-stone-400 uppercase tracking-widest block mb-2">Standard Search</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by project name or locality…"
                className="w-full text-sm bg-slate-50 dark:bg-stone-850 border border-slate-205 dark:border-stone-750 rounded-xl px-4 py-3 outline-none focus:border-slate-500 dark:focus:border-stone-500 transition-colors"
              />
            </div>
            
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 dark:from-stone-900 dark:to-indigo-950 border border-indigo-900/35 rounded-2xl p-4 text-left relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.04] bg-grid" />
              <div className="relative z-10 flex flex-col sm:flex-row gap-3 items-end">
                <div className="flex-1 w-full">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-[9px] bg-indigo-500 text-white font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-md animate-pulse">CasaAI Smart Search</span>
                    <span className="text-[9px] text-indigo-200 font-medium">Try natural language</span>
                  </div>
                  <input
                    type="text"
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAiSearch()}
                    placeholder="e.g. '3 BHK ready to move in Noida with gym'..."
                    className="w-full text-xs font-semibold text-white bg-white/10 dark:bg-black/20 border border-white/15 dark:border-stone-750 rounded-xl px-3 py-2.5 outline-none placeholder-indigo-300/40 focus:border-indigo-400 dark:focus:border-indigo-500 transition-colors"
                  />
                </div>
                <button
                  onClick={handleAiSearch}
                  disabled={aiParsing || !aiQuery.trim()}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 border-none shadow-md shadow-indigo-950/30 transition-all cursor-pointer h-10 w-full sm:w-auto"
                >
                  {aiParsing ? 'Parsing...' : '✨ Ask AI'}
                </button>
              </div>
              {aiMessage && (
                <div className="mt-2 text-[9px] font-bold text-indigo-300 flex items-center gap-1.5 animate-fade-in">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                  {aiMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">

        {/* Filter sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-24 h-fit">
          <div className="bg-white dark:bg-stone-900 border border-slate-205 dark:border-stone-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Filters</h3>
              <button onClick={resetFilters} className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-800 dark:text-stone-500 dark:hover:text-white">
                Reset
              </button>
            </div>

            {/* Budget */}
            <div className="mb-6">
              <label className="text-[10px] font-bold text-slate-500 dark:text-stone-400 uppercase tracking-wider block mb-2">
                Max Budget — {formatCurrencyShort(budget)}
              </label>
              <input
                type="range"
                min={5000000}
                max={MAX_BUDGET}
                step={500000}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full accent-slate-900 dark:accent-white"
              />
            </div>

            {/* BHK */}
            <div className="mb-6">
              <label className="text-[10px] font-bold text-slate-500 dark:text-stone-400 uppercase tracking-wider block mb-2">BHK Configuration</label>
              <div className="flex flex-wrap gap-2">
                {BHK_OPTIONS.map((bhk) => (
                  <button
                    key={bhk}
                    onClick={() => toggleBhk(bhk)}
                    className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-colors ${
                      selectedBhk.includes(bhk)
                        ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-stone-950 dark:border-white'
                        : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-stone-850 dark:text-stone-300 dark:border-stone-750'
                    }`}
                  >
                    {bhk}
                  </button>
                ))}
              </div>
            </div>

            {/* Possession */}
            <div className="mb-6">
              <label className="text-[10px] font-bold text-slate-500 dark:text-stone-400 uppercase tracking-wider block mb-2">Possession Date</label>
              <select
                value={possession}
                onChange={(e) => setPossession(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-50 dark:bg-stone-850 border border-slate-205 dark:border-stone-750 rounded-lg px-3 py-2 outline-none"
              >
                {POSSESSION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {/* Locality */}
            <div className="mb-6">
              <label className="text-[10px] font-bold text-slate-500 dark:text-stone-400 uppercase tracking-wider block mb-2">Locality</label>
              <select
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-50 dark:bg-stone-850 border border-slate-205 dark:border-stone-750 rounded-lg px-3 py-2 outline-none"
              >
                <option value="all">All localities</option>
                {localities.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            {/* Amenities */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 dark:text-stone-400 uppercase tracking-wider block mb-2">Amenities</label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {amenityOptions.map((a) => (
                  <label key={a} className="flex items-center gap-2 text-xs text-slate-600 dark:text-stone-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedAmenities.includes(a)}
                      onChange={() => toggleAmenity(a)}
                      className="accent-slate-900 dark:accent-white"
                    />
                    {a}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Results */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <p className="text-xs font-bold text-slate-500 dark:text-stone-400 uppercase tracking-wider">
              {loading ? 'Loading…' : `${filtered.length} matching ${filtered.length === 1 ? 'property' : 'properties'}`}
            </p>
            {compareIds.length > 0 && (
              <button
                onClick={() => setShowCompare(true)}
                className="text-[10px] font-bold uppercase tracking-wider text-slate-900 dark:text-white hover:underline"
              >
                Compare {compareIds.length} selected →
              </button>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <ProjectCardSkeleton key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white dark:bg-stone-900 border border-slate-205 dark:border-stone-800 rounded-2xl p-12 text-center">
              <p className="text-sm font-bold text-slate-700 dark:text-stone-300">No properties match these filters.</p>
              <button onClick={resetFilters} className="mt-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-stone-400 hover:underline">
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map((listing, idx) => (
                <PropertyListingCard
                  key={listing._id}
                  listing={listing}
                  index={idx}
                  compareChecked={compareIds.includes(listing._id)}
                  compareDisabled={compareIds.length >= 3}
                  onToggleCompare={toggleCompare}
                  matchPercentage={profileResult ? profileResult.matches[listing._id] : null}
                  onOpen3DView={(item) => {
                    setSelected3DProperty(item);
                    setShow3DModal(true);
                    setWalkthroughRoom('lounge');
                    setWalkthroughAngle(45);
                    setWalkthroughNightMode(false);
                    setWalkthroughZoom(1);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Sticky compare bar */}
      {compareIds.length > 0 && !showCompare && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900 dark:bg-white text-white dark:text-stone-950 border-t border-slate-800 dark:border-stone-300 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <p className="text-xs font-bold uppercase tracking-wider">{compareIds.length} of 3 selected for comparison</p>
          <div className="flex gap-2">
            <button onClick={() => setCompareIds([])} className="text-[10px] font-bold uppercase tracking-wider opacity-70 hover:opacity-100">Clear</button>
            <button
              onClick={() => setShowCompare(true)}
              disabled={compareIds.length < 2}
              className="bg-white text-stone-950 dark:bg-stone-950 dark:text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg disabled:opacity-40"
            >
              Compare Now
            </button>
          </div>
        </div>
      )}

      {/* Compare modal */}
      {showCompare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setShowCompare(false)} />
          <div className="relative bg-white dark:bg-stone-900 border border-slate-205 dark:border-stone-800 rounded-3xl w-full max-w-4xl max-h-[85vh] overflow-y-auto p-6 shadow-2xl z-10">
            <div className="flex justify-between items-center mb-5 border-b border-slate-200 dark:border-stone-800 pb-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">Compare Properties</h3>
              <button onClick={() => setShowCompare(false)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-stone-800 text-slate-400 hover:text-slate-800 dark:hover:text-white">✕</button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-stone-500 pb-3 pr-4 w-32">Attribute</th>
                    {compareProjects.map(p => (
                      <th key={p._id} className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white pb-3 px-4 min-w-[180px]">{p.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {[
                    ['Locality', p => p.location?.address],
                    ['Status', p => p.status],
                    ['Price Range', p => `${formatCurrencyShort(p.priceRange?.min)} – ${formatCurrencyShort(p.priceRange?.max)}`],
                    ['BHK Types', p => p.bhkTypes.join(', ')],
                    ['Possession', p => formatDate(p.possessionDate)],
                    ['RERA ID', p => p.reraNumber || 'Pending'],
                    ['Builder', p => p.builderName],
                    ['Builder Rating', p => `${p.builderRating.toFixed(1)} / 5`],
                    ['Total Units', p => p.totalUnits],
                    ['Units Sold', p => p.salesData?.soldUnits ?? '—'],
                  ].map(([label, getVal]) => (
                    <tr key={label} className="border-t border-slate-100 dark:border-stone-850">
                      <td className="py-3 pr-4 font-bold text-slate-500 dark:text-stone-400 uppercase tracking-wider text-[10px]">{label}</td>
                      {compareProjects.map(p => (
                        <td key={p._id} className="py-3 px-4 font-semibold text-slate-800 dark:text-stone-200">{getVal(p)}</td>
                      ))}
                    </tr>
                  ))}
                  <tr className="border-t border-slate-100 dark:border-stone-850">
                    <td className="py-3 pr-4"></td>
                    {compareProjects.map(p => (
                      <td key={p._id} className="py-3 px-4">
                        <Link to={`/projects/${p._id}`} className="btn-primary inline-block text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-lg">
                          View Project →
                        </Link>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* AI Advisor Section */}
            {compareProjects.length > 0 && (
              <div className="mt-8 border-t border-slate-200 dark:border-stone-850 pt-6 text-left">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">✨</span>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">CasaAI Comparison Advisor</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                  {generateAiReport(compareProjects).reports.map(rep => (
                    <div key={rep._id} className="bg-slate-50 dark:bg-stone-850 border border-slate-205 dark:border-stone-800 rounded-2xl p-4 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-2 border-b border-slate-200/60 dark:border-stone-800 pb-2 mb-2">
                          <p className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white truncate">{rep.name}</p>
                          <span className={`text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                            rep.grade.startsWith('A+') ? 'bg-emerald-100 text-emerald-805 dark:bg-emerald-950/40 dark:text-emerald-400' :
                            rep.grade.startsWith('A') ? 'bg-blue-105 text-blue-808 dark:bg-blue-950/40 dark:text-blue-400' :
                            'bg-amber-105 text-amber-808 dark:bg-amber-950/40 dark:text-amber-400'
                          }`}>
                            {rep.grade}
                          </span>
                        </div>
                        
                        <p className="text-[10px] font-bold text-slate-500 dark:text-stone-300 leading-normal mb-3">{rep.text}</p>
                        
                        <div className="space-y-2">
                          <div>
                            <p className="text-[8px] font-black text-emerald-605 dark:text-emerald-400 uppercase tracking-widest mb-1">Pros</p>
                            <ul className="space-y-1">
                              {rep.pros.map((pro, i) => (
                                <li key={i} className="text-[9px] font-bold text-slate-600 dark:text-stone-400 flex items-start gap-1">
                                  <span className="text-emerald-500 font-sans">✓</span> {pro}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="mt-2">
                            <p className="text-[8px] font-black text-rose-605 dark:text-rose-400 uppercase tracking-widest mb-1">Cons</p>
                            <ul className="space-y-1">
                              {rep.cons.map((con, i) => (
                                <li key={i} className="text-[9px] font-bold text-slate-600 dark:text-stone-400 flex items-start gap-1">
                                  <span className="text-rose-500 font-sans">·</span> {con}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-2 border-t border-slate-200/40 dark:border-stone-850 flex items-center justify-between">
                        <span className="text-[8px] font-bold text-slate-400 dark:text-stone-500 uppercase tracking-wider">Demand Velocity</span>
                        <span className="text-[10px] font-extrabold text-slate-800 dark:text-stone-200">{rep.velocity}%</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-gradient-to-r from-indigo-50 to-slate-50 dark:from-stone-900 dark:to-indigo-950/30 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl p-4 flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500 text-white flex items-center justify-center text-sm flex-shrink-0">🤖</div>
                  <div>
                    <p className="text-[8px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">CasaAI Advisor Recommendation</p>
                    <p className="text-xs font-semibold text-slate-700 dark:text-indigo-205 mt-1 leading-relaxed" dangerouslySetInnerHTML={{ __html: generateAiReport(compareProjects).recommendation }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Lead Intent Profiler Modal */}
      {showProfiler && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setShowProfiler(false)} />
          <div className="relative bg-white dark:bg-stone-900 border border-slate-205 dark:border-stone-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl z-10 text-left">
            <div className="flex justify-between items-center mb-5 border-b border-slate-200 dark:border-stone-800 pb-3">
              <div>
                <span className="text-[9px] text-emerald-605 dark:text-emerald-400 font-mono font-bold uppercase tracking-widest">Lead Qualification Engine</span>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider animate-pulse">AI Buyer Intent Profiler</h3>
              </div>
              <button onClick={() => setShowProfiler(false)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-stone-800 text-slate-400 hover:text-slate-800 dark:hover:text-white">✕</button>
            </div>

            {profilerStep === 1 && (
              <div className="space-y-4">
                <p className="text-xs font-bold text-slate-700 dark:text-stone-300">Step 1 of 3: What is your primary purchase goal?</p>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { label: 'Self-Use (Immediate or near-term residency)', value: 'Self-Use' },
                    { label: 'Rental Yield (Passive cash flow & high tenancy)', value: 'Rental Yield' },
                    { label: 'Capital Appreciation (Long-term growth)', value: 'Capital Appreciation' },
                  ].map(o => (
                    <button
                      key={o.value}
                      onClick={() => { setProfileAnswers(prev => ({ ...prev, goal: o.value })); setProfilerStep(2); }}
                      className="bg-slate-50 hover:bg-slate-100 dark:bg-stone-850 dark:hover:bg-stone-800 border border-slate-205 dark:border-stone-750 text-left px-4 py-3 rounded-xl text-xs font-bold text-slate-805 dark:text-stone-200 transition-colors cursor-pointer"
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {profilerStep === 2 && (
              <div className="space-y-4">
                <p className="text-xs font-bold text-slate-700 dark:text-stone-300">Step 2 of 3: What environment fits your lifestyle best?</p>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { label: 'Connected & Bustling (Near corporate nodes & commercial centers)', value: 'Connected & Bustling' },
                    { label: 'Green, Quiet & Low-Density (Villas, expansive open areas)', value: 'Green, Quiet & Low-Density' },
                  ].map(o => (
                    <button
                      key={o.value}
                      onClick={() => { setProfileAnswers(prev => ({ ...prev, vibe: o.value })); setProfilerStep(3); }}
                      className="bg-slate-50 hover:bg-slate-100 dark:bg-stone-850 dark:hover:bg-stone-800 border border-slate-205 dark:border-stone-750 text-left px-4 py-3 rounded-xl text-xs font-bold text-slate-805 dark:text-stone-200 transition-colors cursor-pointer"
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
                <button onClick={() => setProfilerStep(1)} className="text-[10px] font-bold text-slate-400 hover:text-slate-650 block mt-2">← Back</button>
              </div>
            )}

            {profilerStep === 3 && (
              <div className="space-y-4">
                <p className="text-xs font-bold text-slate-700 dark:text-stone-300">Step 3 of 3: What is your target funding method?</p>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    'All-Cash Purchase',
                    'Partial Bank Loan & Personal Funds',
                    'High-Ratio Bank Loan (>80%)',
                  ].map(opt => (
                    <button
                      key={opt}
                      onClick={() => {
                        const updated = { ...profileAnswers, funding: opt };
                        setProfileAnswers(updated);
                        setTimeout(() => {
                          let score = 70;
                          let grade = 'Warm Explorer';
                          if (updated.goal === 'Self-Use') {
                            if (updated.funding !== 'High-Ratio Bank Loan (>80%)') {
                              score = 95;
                              grade = 'Hot Lead - Active Purchaser';
                            } else {
                              score = 88;
                              grade = 'Hot Lead - Financing Required';
                            }
                          } else if (updated.goal === 'Rental Yield') {
                            if (updated.funding === 'All-Cash Purchase') {
                              score = 90;
                              grade = 'Hot Lead - Cash Investor';
                            } else {
                              score = 82;
                              grade = 'Warm Lead - Investor';
                            }
                          } else {
                            score = 75;
                            grade = 'Warm Lead - Future Appreciation';
                          }

                          const matches = {};
                          enriched.forEach(p => {
                            let matchScore = 70;
                            if (updated.goal === 'Self-Use' && (p._id === 'proj-001' || p.name.includes('Horizon'))) matchScore += 15;
                            if (updated.goal === 'Rental Yield' && (p._id === 'proj-002' || p.name.includes('Serenity'))) matchScore += 20;
                            if (updated.goal === 'Capital Appreciation' && (p._id === 'proj-003' || p.name.includes('Pinnacle'))) matchScore += 25;
                            if (updated.vibe === 'Connected & Bustling' && (p._id === 'proj-001' || p._id === 'proj-003' || p.name.includes('Horizon') || p.name.includes('Pinnacle'))) matchScore += 10;
                            if (updated.vibe === 'Green, Quiet & Low-Density' && (p._id === 'proj-002' || p.name.includes('Serenity'))) matchScore += 15;
                            matches[p._id] = Math.min(matchScore, 98);
                          });

                          setProfileResult({ intentScore: score, leadGrade: grade, matches });
                          setProfilerStep(4);
                        }, 500);
                      }}
                      className="bg-slate-50 hover:bg-slate-100 dark:bg-stone-850 dark:hover:bg-stone-800 border border-slate-205 dark:border-stone-750 text-left px-4 py-3 rounded-xl text-xs font-bold text-slate-805 dark:text-stone-200 transition-colors cursor-pointer"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                <button onClick={() => setProfilerStep(2)} className="text-[10px] font-bold text-slate-400 hover:text-slate-650 block mt-2">← Back</button>
              </div>
            )}

            {profilerStep === 4 && profileResult && (
              <div className="space-y-5">
                <div className="bg-slate-50 dark:bg-stone-850 border border-slate-205 dark:border-stone-750 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-[8px] font-black text-slate-400 dark:text-stone-500 uppercase tracking-widest">Calculated Intent Score</p>
                    <p className="text-xl font-black text-slate-900 dark:text-white mt-1 leading-none">{profileResult.intentScore}%</p>
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                    profileResult.intentScore >= 90 ? 'bg-emerald-100 text-emerald-805 dark:bg-emerald-950/40 dark:text-emerald-450' : 'bg-blue-105 text-blue-808 dark:bg-blue-950/40 dark:text-blue-450'
                  }`}>
                    {profileResult.leadGrade}
                  </span>
                </div>

                <div className="space-y-2">
                  <p className="text-[9px] font-black text-slate-400 dark:text-stone-500 uppercase tracking-widest">Match Strength Mapped to Inventory</p>
                  <div className="space-y-2">
                    {enriched.map(p => (
                      <div key={p._id} className="flex items-center justify-between gap-4 bg-slate-50 dark:bg-stone-850 p-2.5 rounded-xl border border-slate-100 dark:border-stone-800">
                        <div className="truncate text-xs font-bold text-slate-800 dark:text-stone-200">{p.name}</div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="w-16 bg-slate-200 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${profileResult.matches[p._id]}%` }} />
                          </div>
                          <span className="text-[10px] font-black text-slate-700 dark:text-stone-300">{profileResult.matches[p._id]}% Match</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-4 flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-sm flex-shrink-0">💼</div>
                  <div>
                    <p className="text-[8px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Agent Negotiation Advice</p>
                    <p className="text-xs font-semibold text-slate-750 dark:text-emerald-205 mt-1 leading-relaxed">
                      {profileResult.intentScore >= 90
                        ? `Client is highly active. Pitch immediate site tours and emphasize inventory scarcity in Gurugram/Mumbai.`
                        : `Client is exploring appreciation timelines. Nurture with RERA documentation files and long-term infrastructure projections.`
                      }
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-stone-800">
                  <button
                    onClick={() => { setShowProfiler(false); }}
                    className="bg-emerald-650 hover:bg-emerald-550 text-white text-xs font-black uppercase tracking-wider py-2.5 rounded-xl flex-1 border-none shadow-md cursor-pointer transition-colors"
                  >
                    Apply Match Ratings to Discovery Grid
                  </button>
                  <button
                    onClick={() => { setProfileResult(null); setProfilerStep(1); }}
                    className="border border-slate-205 dark:border-stone-750 text-slate-500 dark:text-stone-400 hover:text-slate-805 dark:hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Retake
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🕶️ 3D Interactive Walkthrough Modal */}
      {show3DModal && selected3DProperty && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md" onClick={() => setShow3DModal(false)} />
          <div className="relative bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-4xl p-6 shadow-2xl z-10 grid grid-cols-1 md:grid-cols-12 gap-6 text-white animate-fade-in">
            
            {/* Header Block */}
            <div className="col-span-1 md:col-span-12 flex justify-between items-center border-b border-slate-850 pb-4">
              <div>
                <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase tracking-widest leading-none">CasaAI Premium Suite Walkthrough</span>
                <h3 className="text-base font-black uppercase tracking-wider mt-0.5">🕶️ 3D Virtual Walkthrough: {selected3DProperty.name}</h3>
              </div>
              <button 
                onClick={() => setShow3DModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Left Column: Rotating 3D Viewscreen */}
            <div className="md:col-span-7 bg-slate-900/60 border border-slate-850 rounded-2xl p-6 flex flex-col items-center justify-center relative min-h-[300px] overflow-hidden">
              <div className="absolute inset-0 opacity-[0.03] bg-grid pointer-events-none" />
              
              {/* Rotating Canvas Wrapper */}
              <div className="w-64 h-64 flex items-center justify-center relative transition-transform duration-500 ease-out">
                {/* 3D SVG Render */}
                {(() => {
                  const strokeColor = walkthroughNightMode ? '#6366f1' : '#34d399';
                  const fillColor = walkthroughNightMode ? 'rgba(99, 102, 241, 0.2)' : 'rgba(52, 211, 153, 0.1)';
                  const gridColor = walkthroughNightMode ? '#1e1b4b' : '#064e3b';
                  const transformStyle = `rotate(${walkthroughAngle}deg) scale(${walkthroughZoom})`;

                  if (walkthroughRoom === 'lounge') {
                    return (
                      <svg viewBox="0 0 200 200" className="w-full h-full transition-all duration-500" style={{ transform: transformStyle }}>
                        <polygon points="100,20 180,70 100,120 20,70" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
                        <line x1="60" y1="45" x2="140" y2="95" stroke={gridColor} strokeWidth="0.5" strokeDasharray="2 2" />
                        <line x1="140" y1="45" x2="60" y2="95" stroke={gridColor} strokeWidth="0.5" strokeDasharray="2 2" />
                        <polygon points="70,65 110,65 95,80 55,80" fill="none" stroke={strokeColor} strokeWidth="1.5" />
                        <polygon points="55,80 95,80 95,90 55,90" fill="none" stroke={strokeColor} strokeWidth="1.5" />
                        <polygon points="100,85 120,85 110,95 90,95" fill="none" stroke={strokeColor} strokeWidth="1" />
                      </svg>
                    );
                  } else if (walkthroughRoom === 'bedroom') {
                    return (
                      <svg viewBox="0 0 200 200" className="w-full h-full transition-all duration-500" style={{ transform: transformStyle }}>
                        <polygon points="100,20 180,70 100,120 20,70" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
                        <polygon points="60,60 110,60 90,95 40,95" fill="none" stroke={strokeColor} strokeWidth="1.8" />
                        <polygon points="65,65 80,65 75,72 60,72" fill="none" stroke={strokeColor} strokeWidth="1" />
                        <polygon points="85,65 100,65 95,72 80,72" fill="none" stroke={strokeColor} strokeWidth="1" />
                      </svg>
                    );
                  } else if (walkthroughRoom === 'kitchen') {
                    return (
                      <svg viewBox="0 0 200 200" className="w-full h-full transition-all duration-500" style={{ transform: transformStyle }}>
                        <polygon points="100,20 180,70 100,120 20,70" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
                        <polygon points="30,65 70,45 80,55 40,75" fill="none" stroke={strokeColor} strokeWidth="1.5" />
                        <polygon points="80,55 120,40 130,50 90,65" fill="none" stroke={strokeColor} strokeWidth="1.5" />
                      </svg>
                    );
                  } else {
                    return (
                      <svg viewBox="0 0 200 200" className="w-full h-full transition-all duration-500" style={{ transform: transformStyle }}>
                        <polygon points="100,20 180,70 100,120 20,70" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
                        <line x1="20" y1="70" x2="100" y2="120" stroke={strokeColor} strokeWidth="2.5" />
                        <line x1="20" y1="60" x2="20" y2="70" stroke={strokeColor} strokeWidth="1.5" />
                        <line x1="40" y1="72" x2="40" y2="82" stroke={strokeColor} strokeWidth="1.5" />
                        <line x1="60" y1="85" x2="60" y2="95" stroke={strokeColor} strokeWidth="1.5" />
                        <line x1="80" y1="97" x2="80" y2="107" stroke={strokeColor} strokeWidth="1.5" />
                        <line x1="100" y1="110" x2="100" y2="120" stroke={strokeColor} strokeWidth="1.5" />
                      </svg>
                    );
                  }
                })()}
              </div>

              {/* Viewscreen Interactive Tool Tray */}
              <div className="w-full mt-4 flex items-center justify-between bg-slate-950/80 border border-slate-850 px-4 py-2.5 rounded-xl text-[10px]">
                <div className="flex gap-2">
                  <button 
                    onClick={() => setWalkthroughAngle(prev => prev - 45)}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 text-white px-3 py-1.5 rounded-lg cursor-pointer"
                  >
                    ↺ Rotate Left
                  </button>
                  <button 
                    onClick={() => setWalkthroughAngle(prev => prev + 45)}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 text-white px-3 py-1.5 rounded-lg cursor-pointer"
                  >
                    ↻ Rotate Right
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-400">Zoom: {walkthroughZoom.toFixed(2)}x</span>
                  <button 
                    onClick={() => setWalkthroughZoom(prev => Math.min(2, prev + 0.25))}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 text-white w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer font-bold text-xs"
                  >
                    +
                  </button>
                  <button 
                    onClick={() => setWalkthroughZoom(prev => Math.max(0.5, prev - 0.25))}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 text-white w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer font-bold text-xs"
                  >
                    -
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Console & Controls */}
            <div className="md:col-span-5 flex flex-col justify-between text-left space-y-4">
              
              {/* Room Selection */}
              <div className="space-y-2">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Select Room view</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'lounge', label: '🌅 Living Lounge' },
                    { key: 'bedroom', label: '🛌 Master Suite' },
                    { key: 'kitchen', label: '🍳 Gourmet Kitchen' },
                    { key: 'balcony', label: '🏊 View Deck' },
                  ].map(r => (
                    <button
                      key={r.key}
                      onClick={() => setWalkthroughRoom(r.key)}
                      className={`p-3 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                        walkthroughRoom === r.key
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-750 text-slate-300'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lighting Mode Selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Lighting Environment</p>
                  <span className="text-[9px] bg-slate-900 text-slate-400 border border-slate-800 px-2 py-0.5 rounded uppercase font-bold">
                    {walkthroughNightMode ? 'Ambient LED' : 'Daylight Solar'}
                  </span>
                </div>
                <div className="bg-slate-900 border border-slate-850 p-2.5 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-350">Simulate Night Mode lighting</span>
                  <button
                    type="button"
                    onClick={() => setWalkthroughNightMode(!walkthroughNightMode)}
                    className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${
                      walkthroughNightMode ? 'bg-indigo-650' : 'bg-slate-700'
                    }`}
                  >
                    <span className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                      walkthroughNightMode ? 'right-1 translate-x-0' : 'left-1 translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>

              {/* Room Telemetry Log */}
              <div className="bg-slate-900 border border-slate-850 rounded-2xl p-4 space-y-2.5">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Walkthrough Telemetry</p>
                <div className="grid grid-cols-2 gap-3 text-[11px] font-mono">
                  <div>
                    <span className="text-slate-500 block leading-none">Ceiling Height</span>
                    <span className="text-white font-bold block mt-1">10.8 Feet</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block leading-none">Luminosity Index</span>
                    <span className="text-white font-bold block mt-1">
                      {walkthroughNightMode ? '22% (Warm LED)' : '94% (Natural)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block leading-none">Acoustic Shield</span>
                    <span className="text-white font-bold block mt-1">-34 dB (Premium)</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block leading-none">Air Exchange Rate</span>
                    <span className="text-white font-bold block mt-1">6.2 AirChanges/hr</span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="pt-2 border-t border-slate-900 flex gap-2">
                <button
                  type="button"
                  onClick={() => alert(`Pre-booking interest registered for 3D layout of ${selected3DProperty.name}!`)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider py-3 px-6 rounded-xl flex-1 cursor-pointer transition-all text-center border-none shadow-md shadow-emerald-950/20"
                >
                  Confirm Structural Layout Interest
                </button>
              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}
