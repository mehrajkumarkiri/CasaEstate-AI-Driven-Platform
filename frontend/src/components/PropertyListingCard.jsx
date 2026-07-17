import { Link } from 'react-router-dom';
import { formatCurrencyShort, formatDate } from '../utils/formatters';

const statusConfig = {
  'Under Construction': { color: 'text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30', dot: 'bg-amber-500 animate-pulse' },
  'Ready to Move': { color: 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30', dot: 'bg-emerald-500' },
  'Pre-Launch': { color: 'text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/30', dot: 'bg-blue-500' },
  'Sold Out': { color: 'text-slate-700 bg-slate-50 dark:text-stone-400 dark:bg-stone-800/50 border-slate-200 dark:border-stone-705', dot: 'bg-slate-500' },
};

function StarRating({ value = 0 }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <div className="flex items-center gap-0.5" title={`${value.toFixed(1)} / 5 builder rating`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className="text-[11px] leading-none">
          {i < full ? '★' : (i === full && half ? '⯨' : '☆')}
        </span>
      ))}
    </div>
  );
}

export default function PropertyListingCard({ listing, index = 0, compareChecked = false, onToggleCompare, compareDisabled = false }) {
  const sc = statusConfig[listing.status] || statusConfig['Under Construction'];
  const availableCount = listing.units?.filter(u => u.availability === 'Available').length;
  const totalUnitsKnown = listing.units?.length;

  return (
    <div className="group relative bg-white dark:bg-stone-900 border border-slate-205 dark:border-stone-800 rounded-2xl overflow-hidden flex flex-col hover:border-slate-400 dark:hover:border-stone-600 transition-all duration-300 hover:-translate-y-1 text-left">

      {/* Compare checkbox */}
      <label
        className={`absolute z-10 top-3 left-3 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border backdrop-blur-sm shadow-xs cursor-pointer select-none transition-colors
          ${compareChecked
            ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-stone-950 dark:border-white'
            : 'bg-white/90 dark:bg-stone-850/90 text-slate-600 dark:text-stone-300 border-slate-205 dark:border-stone-750'}
          ${compareDisabled && !compareChecked ? 'opacity-40 cursor-not-allowed' : ''}`}
      >
        <input
          type="checkbox"
          className="sr-only"
          checked={compareChecked}
          disabled={compareDisabled && !compareChecked}
          onChange={() => onToggleCompare?.(listing._id)}
        />
        <span className={`w-3 h-3 rounded-sm border flex items-center justify-center ${compareChecked ? 'border-white dark:border-stone-950' : 'border-slate-400 dark:border-stone-500'}`}>
          {compareChecked && '✓'}
        </span>
        Compare
      </label>

      {/* Header strip */}
      <div className="relative h-40 sm:h-44 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50 dark:from-stone-850 dark:to-stone-900 flex items-end p-4">
        <div className="absolute inset-0 opacity-[0.06] bg-grid" />
        <div className="absolute top-3 right-3">
          <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border backdrop-blur-sm shadow-xs ${sc.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
            {listing.status}
          </span>
        </div>
        <div className="relative z-[1]">
          <p className="text-[10px] font-extrabold text-slate-500 dark:text-stone-400 uppercase tracking-wider">{listing.location?.address}</p>
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">{listing.name}</h3>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1 gap-4">

        {/* Price range */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[9px] font-bold text-slate-400 dark:text-stone-500 uppercase tracking-widest">Price Range</p>
            <p className="text-base font-extrabold text-slate-900 dark:text-white font-display">
              {formatCurrencyShort(listing.priceRange?.min)} – {formatCurrencyShort(listing.priceRange?.max)}
            </p>
          </div>
          <StarRating value={listing.builderRating || 0} />
        </div>

        {/* BHK config chips */}
        <div className="flex flex-wrap gap-1.5">
          {(listing.bhkTypes || []).map((bhk) => (
            <span key={bhk} className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border bg-slate-50 text-slate-700 border-slate-200 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700">
              {bhk}
            </span>
          ))}
        </div>

        {/* Decision data grid */}
        <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-stone-850 border border-slate-200 dark:border-stone-800 rounded-xl p-3 text-left">
          <div>
            <p className="text-slate-400 dark:text-stone-500 text-[9px] uppercase font-bold tracking-wider">RERA ID</p>
            <p className="text-[11px] font-bold text-slate-700 dark:text-stone-200 mt-0.5 truncate" title={listing.reraNumber}>{listing.reraNumber || 'Pending'}</p>
          </div>
          <div>
            <p className="text-slate-400 dark:text-stone-500 text-[9px] uppercase font-bold tracking-wider">Possession</p>
            <p className="text-[11px] font-bold text-slate-700 dark:text-stone-200 mt-0.5">{formatDate(listing.possessionDate)}</p>
          </div>
          <div>
            <p className="text-slate-400 dark:text-stone-500 text-[9px] uppercase font-bold tracking-wider">Availability</p>
            <p className="text-[11px] font-bold text-slate-700 dark:text-stone-200 mt-0.5">
              {typeof availableCount === 'number' ? `${availableCount} of ${totalUnitsKnown} shown` : `${listing.totalUnits} total units`}
            </p>
          </div>
          <div>
            <p className="text-slate-400 dark:text-stone-500 text-[9px] uppercase font-bold tracking-wider">Builder</p>
            <p className="text-[11px] font-bold text-slate-700 dark:text-stone-200 mt-0.5 truncate">{listing.builderName || 'CasaEstate Infra'}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-auto flex gap-2">
          <Link
            to={`/projects/${listing._id}`}
            className="btn-primary flex-1 text-center text-xs font-bold uppercase tracking-wider py-2.5 flex items-center justify-center gap-1.5"
          >
            View Floor Plans →
          </Link>
        </div>
      </div>
    </div>
  );
}
