import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { getAvailabilityColor } from '../utils/formatters';
import { useApp } from '../context/AppContext';

// SVG size parameters
const SVG_W = 480;
const SVG_H = 320;
const UNIT_W = 88;
const UNIT_H = 60;
const GAP = 6;
const CORRIDOR_H = 24;
const OFFSET_X = 12;
const OFFSET_Y = 12;

function computeUnitRect(unitIndex, totalPerFloor) {
  const cols = Math.min(totalPerFloor, 4);
  const col = unitIndex % cols;
  const row = Math.floor(unitIndex / cols);
  return {
    x: OFFSET_X + col * (UNIT_W + GAP),
    y: OFFSET_Y + row * (UNIT_H + GAP + CORRIDOR_H),
    width: UNIT_W,
    height: UNIT_H,
  };
}

export default function InteractiveFloorPlan({ units = [], projectName = 'Building' }) {
  const { openBookingDrawer } = useApp();

  const floors = useMemo(() => [...new Set(units.map((u) => u.floor))].sort((a, b) => a - b), [units]);
  const [selectedFloor, setSelectedFloor] = useState(floors[0] || 1);

  const [hoveredUnit, setHoveredUnit] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);

  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const isPanning = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const lastDist = useRef(null);

  const floorUnits = useMemo(
    () => units.filter((u) => u.floor === selectedFloor),
    [units, selectedFloor]
  );

  useEffect(() => {
    setTransform({ x: 0, y: 0, scale: 1 });
    setSelectedUnit(null);
    setHoveredUnit(null);
  }, [selectedFloor]);

  const onMouseDown = (e) => {
    if (e.target.tagName === 'rect' || e.target.tagName === 'text') return;
    isPanning.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
    svgRef.current.style.cursor = 'grabbing';
  };
  const onMouseMove = (e) => {
    if (!isPanning.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setTransform((t) => ({ ...t, x: t.x + dx, y: t.y + dy }));
  };
  const onMouseUp = () => {
    isPanning.current = false;
    if (svgRef.current) svgRef.current.style.cursor = 'grab';
  };

  const onWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform((t) => ({
      ...t,
      scale: Math.min(Math.max(t.scale * delta, 0.5), 3),
    }));
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [onWheel]);

  const onTouchStart = (e) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastDist.current = Math.sqrt(dx * dx + dy * dy);
    } else {
      isPanning.current = true;
      lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };
  const onTouchMove = (e) => {
    e.preventDefault();
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (lastDist.current) {
        const ratio = dist / lastDist.current;
        setTransform((t) => ({ ...t, scale: Math.min(Math.max(t.scale * ratio, 0.5), 3) }));
      }
      lastDist.current = dist;
    } else if (isPanning.current && e.touches.length === 1) {
      const dx = e.touches[0].clientX - lastPos.current.x;
      const dy = e.touches[0].clientY - lastPos.current.y;
      lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      setTransform((t) => ({ ...t, x: t.x + dx, y: t.y + dy }));
    }
  };
  const onTouchEnd = () => {
    isPanning.current = false;
    lastDist.current = null;
  };

  const resetZoom = () => setTransform({ x: 0, y: 0, scale: 1 });

  const handleUnitClick = (unit) => {
    if (unit.availability !== 'Available') return;
    setSelectedUnit(unit);
    openBookingDrawer(unit, null);
  };

  return (
    <div className="bg-white dark:bg-stone-900 border border-slate-205 dark:border-stone-800 rounded-2xl overflow-hidden shadow-xs text-left">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-stone-200">Interactive Architectural Blueprint Map</h3>
          <p className="text-[11px] text-slate-500 dark:text-stone-450 mt-0.5 font-medium">Select any available RERA unit block to initiate digital sale booking.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Legend */}
          <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-wider">
            {[
              ['Available', '#10b981', 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30'],
              ['Reserved', '#f59e0b', 'text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30'],
              ['Sold', '#ef4444', 'text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-950/20 border-red-100 dark:border-red-900/30']
            ].map(([label, color, badgeCls]) => (
              <div key={label} className={`flex items-center gap-1 px-2 py-0.5 border rounded-md ${badgeCls}`}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                <span>{label}</span>
              </div>
            ))}
          </div>
          {/* Reset zoom */}
          <button
            id="floorplan-reset-zoom"
            onClick={resetZoom}
            className="text-[10px] font-bold text-slate-650 hover:text-slate-905 border border-slate-205 dark:border-stone-750 bg-slate-50 dark:bg-stone-800 hover:bg-slate-100 dark:hover:bg-stone-700 px-3 py-1 rounded-lg transition-all"
          >
            Reset View
          </button>
        </div>
      </div>

      {/* Floor Selector */}
      <div className="px-4 py-2 border-b border-slate-200 dark:border-stone-800 bg-slate-50/50 dark:bg-stone-850/50 flex gap-1.5 overflow-x-auto scrollbar-hide">
        <span className="text-[9px] font-bold text-slate-400 dark:text-stone-500 uppercase self-center mr-1 flex-shrink-0">Towers Level Select:</span>
        {floors.map((fl) => (
          <button
            key={fl}
            id={`floor-btn-${fl}`}
            onClick={() => setSelectedFloor(fl)}
            className={`flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
              selectedFloor === fl
                ? 'bg-slate-900 dark:bg-stone-100 border-slate-900 dark:border-white text-white dark:text-stone-950 shadow-xs'
                : 'text-slate-600 bg-white dark:bg-stone-900 border-slate-200 dark:border-stone-800 hover:bg-slate-50 dark:hover:bg-stone-850 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            L{fl}
          </button>
        ))}
      </div>

      {/* Floor Stats */}
      <div className="px-4 py-2 border-b border-slate-100 dark:border-stone-800 flex gap-4 text-[10px] font-bold uppercase tracking-wider bg-white dark:bg-stone-900">
        {[
          ['Available', floorUnits.filter(u => u.availability === 'Available').length, 'text-emerald-700 bg-emerald-50/50 dark:text-emerald-400 dark:bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-100/50 dark:border-emerald-900/30'],
          ['Reserved', floorUnits.filter(u => u.availability === 'Reserved').length, 'text-amber-700 bg-amber-50/50 dark:text-amber-400 dark:bg-amber-950/20 px-2 py-0.5 rounded border border-amber-100/50 dark:border-amber-900/30'],
          ['Sold', floorUnits.filter(u => u.availability === 'Sold').length, 'text-red-700 bg-red-50/50 dark:text-red-400 dark:bg-red-950/20 px-2 py-0.5 rounded border border-red-100/50 dark:border-red-900/30'],
        ].map(([label, count, cls]) => (
          <span key={label} className={cls}>{count} {label}</span>
        ))}
        <span className="ml-auto text-slate-400 dark:text-stone-550">Level {selectedFloor} · {floorUnits.length} units total</span>
      </div>

      {/* SVG Canvas */}
      <div
        ref={containerRef}
        className="relative overflow-hidden bg-slate-50 dark:bg-stone-950 select-none border-b border-slate-200 dark:border-stone-800"
        style={{ height: 320, cursor: 'grab' }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="w-full h-full text-slate-200 dark:text-stone-800"
          style={{ touchAction: 'none' }}
        >
          {/* Background grid */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.4" opacity="0.6"/>
            </pattern>
          </defs>
          <rect width={SVG_W} height={SVG_H} fill="url(#grid)"/>

          <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}>
            {/* Floor label */}
            <rect x="0" y="0" width={SVG_W} height="22" fill="currentColor" rx="4" opacity="0.1"/>
            <text x={SVG_W/2} y="15" textAnchor="middle" fill="#64748b" className="dark:fill-stone-400" fontSize="10" fontWeight="700" fontFamily="Inter, sans-serif">
              FLOOR LEVEL {selectedFloor} — {projectName.toUpperCase()}
            </text>

            {/* Corridor */}
            <rect x={OFFSET_X} y={OFFSET_Y + UNIT_H + GAP}
              width={Math.min(floorUnits.length, 4) * (UNIT_W + GAP) - GAP}
              height={CORRIDOR_H} fill="currentColor" rx="2" opacity="0.1"/>
            <text
              x={OFFSET_X + (Math.min(floorUnits.length, 4) * (UNIT_W + GAP) - GAP) / 2}
              y={OFFSET_Y + UNIT_H + GAP + CORRIDOR_H / 2 + 3}
              textAnchor="middle" fill="#64748b" className="dark:fill-stone-450" fontSize="8" fontWeight="bold" fontFamily="Inter, sans-serif">
              CENTRAL CORRIDOR / ACCESS AREA
            </text>

            {/* Units */}
            {floorUnits.map((unit, idx) => {
              const rect = computeUnitRect(idx, floorUnits.length);
              const colors = getAvailabilityColor(unit.availability);
              const isHovered = hoveredUnit?._id === unit._id;
              const isSelected = selectedUnit?._id === unit._id;
              const isClickable = unit.availability === 'Available';

              return (
                <g
                  key={unit._id}
                  style={{ cursor: isClickable ? 'pointer' : 'default' }}
                  onClick={() => handleUnitClick(unit)}
                  onMouseEnter={() => setHoveredUnit(unit)}
                  onMouseLeave={() => setHoveredUnit(null)}
                >
                  {/* Shadow */}
                  <rect
                    x={rect.x + 1} y={rect.y + 2}
                    width={rect.width} height={rect.height}
                    rx="6" fill="rgba(148,163,184,0.1)"
                  />
                  {/* Main block */}
                  <rect
                    x={rect.x} y={rect.y}
                    width={rect.width} height={rect.height}
                    rx="6"
                    fill={colors.bg}
                    fillOpacity={isHovered ? 0.95 : 0.85}
                    stroke={isSelected ? '#2563eb' : colors.border}
                    strokeWidth={isSelected ? 2 : 1.2}
                    style={{ transition: 'all 0.15s ease' }}
                  />
                  {/* Unit label */}
                  <text
                    x={rect.x + rect.width / 2}
                    y={rect.y + 19}
                    textAnchor="middle"
                    fill={colors.text}
                    fontSize="11"
                    fontWeight="800"
                    fontFamily="Inter, sans-serif"
                  >
                    {unit.unitNumber}
                  </text>
                  <text
                    x={rect.x + rect.width / 2}
                    y={rect.y + 33}
                    textAnchor="middle"
                    fill={colors.text}
                    fontSize="9"
                    fontWeight="600"
                    fontFamily="Inter, sans-serif"
                    opacity="0.8"
                  >
                    {unit.bhkType}
                  </text>
                  {/* Status label */}
                  <rect
                    x={rect.x + rect.width / 2 - 28}
                    y={rect.y + 40}
                    width="56" height="12"
                    rx="6"
                    fill={colors.border}
                    opacity="0.12"
                  />
                  <text
                    x={rect.x + rect.width / 2}
                    y={rect.y + 49}
                    textAnchor="middle"
                    fill={colors.text}
                    fontSize="7"
                    fontFamily="Inter, sans-serif"
                    fontWeight="800"
                  >
                    {unit.availability.toUpperCase()}
                  </text>
                  {/* Click pulse dot */}
                  {isClickable && !isHovered && (
                    <circle cx={rect.x + rect.width - 8} cy={rect.y + 8} r="3" fill="#10b981">
                      <animate attributeName="opacity" values="1;0.3;1" dur="2.5s" repeatCount="indefinite"/>
                    </circle>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Zoom guides */}
        <div className="absolute bottom-2 left-2 text-[10px] font-bold text-slate-500 bg-white/90 dark:bg-stone-900/90 border border-slate-200 dark:border-stone-800 px-2 py-1 rounded-lg backdrop-blur-xs">
          Scroll to Zoom · Hold/Drag to Pan
        </div>
        <div className="absolute bottom-2 right-2 text-[10px] font-bold text-slate-500 bg-white/90 dark:bg-stone-900/90 border border-slate-200 dark:border-stone-800 px-2 py-1 rounded-lg backdrop-blur-xs">
          {Math.round(transform.scale * 100)}% scale
        </div>
      </div>

      {/* Unit Detail Preview Panel */}
      {hoveredUnit && (
        <div className="px-4 py-3 bg-slate-50 dark:bg-stone-850 border-t border-slate-200 dark:border-stone-800 animate-fade-in">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-extrabold border"
                style={{
                  backgroundColor: getAvailabilityColor(hoveredUnit.availability).bg,
                  color: getAvailabilityColor(hoveredUnit.availability).text,
                  borderColor: getAvailabilityColor(hoveredUnit.availability).border,
                }}
              >
                {hoveredUnit.bhkType?.replace('BHK', '')}
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-slate-900 dark:text-white">Unit {hoveredUnit.unitNumber}</p>
                <p className="text-xs text-slate-500 dark:text-stone-400 font-semibold">{hoveredUnit.bhkType} · Facing {hoveredUnit.facing} · {hoveredUnit.carpetArea} sq.ft carpet</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 dark:text-stone-500 uppercase">Base Price</p>
                <p className="text-sm font-extrabold text-slate-900 dark:text-white font-display">
                  ₹{((hoveredUnit.pricing?.basePrice || 0) / 100000).toFixed(2)} Lakhs
                </p>
              </div>
              {hoveredUnit.availability === 'Available' && (
                <button
                  onClick={() => handleUnitClick(hoveredUnit)}
                  className="btn-primary text-xs font-bold uppercase tracking-wider py-2 px-4 shadow-xs"
                >
                  Book Unit
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
