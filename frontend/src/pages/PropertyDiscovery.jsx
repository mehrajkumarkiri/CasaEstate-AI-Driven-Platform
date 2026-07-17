import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects';
import PropertyListingCard from '../components/PropertyListingCard';
import { ProjectCardSkeleton } from '../components/SkeletonLoader';
import { formatCurrencyShort, formatDate } from '../utils/formatters';

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

export default function PropertyDiscovery() {
  const { projects, loading } = useProjects();
  const [searchQuery, setSearchQuery] = useState('');
  const [budget, setBudget] = useState(MAX_BUDGET);
  const [selectedBhk, setSelectedBhk] = useState([]);
  const [possession, setPossession] = useState('any');
  const [locality, setLocality] = useState('all');
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [compareIds, setCompareIds] = useState([]);
  const [showCompare, setShowCompare] = useState(false);

  const enriched = useMemo(() => projects.map(enrichProject), [projects]);

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
          <p className="text-xs font-bold text-slate-400 dark:text-stone-500 uppercase tracking-widest mb-1">Property Discovery</p>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-slate-900 dark:text-white">Find Your Home</h1>
          <p className="text-xs text-slate-500 dark:text-stone-400 mt-1">Filter registered premium towers by budget, layout, possession date, amenities, and locality.</p>

          <div className="mt-5 max-w-xl">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by project name or locality…"
              className="w-full text-sm bg-slate-50 dark:bg-stone-850 border border-slate-205 dark:border-stone-750 rounded-xl px-4 py-3 outline-none focus:border-slate-500 dark:focus:border-stone-500 transition-colors"
            />
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
          </div>
        </div>
      )}
    </div>
  );
}
