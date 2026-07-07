export function ProjectCardSkeleton() {
  return (
    <div className="glass-card overflow-hidden">
      <div className="skeleton h-52 w-full rounded-none" />
      <div className="p-5 space-y-3">
        <div className="skeleton h-3 w-24 rounded-full" />
        <div className="skeleton h-6 w-3/4 rounded-lg" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-2/3 rounded" />
        <div className="flex gap-2 pt-2">
          <div className="skeleton h-8 w-24 rounded-lg" />
          <div className="skeleton h-8 w-20 rounded-lg" />
        </div>
        <div className="skeleton h-10 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function UnitCardSkeleton() {
  return (
    <div className="skeleton h-16 w-full rounded-xl" />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="glass-card p-5 space-y-3">
      <div className="skeleton h-4 w-24 rounded" />
      <div className="skeleton h-8 w-32 rounded-lg" />
      <div className="skeleton h-3 w-20 rounded" />
    </div>
  );
}

export function TableRowSkeleton({ rows = 5 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 px-4 py-3 border-b border-slate-800/50">
          <div className="skeleton h-4 w-28 rounded" />
          <div className="skeleton h-4 flex-1 rounded" />
          <div className="skeleton h-4 w-20 rounded" />
          <div className="skeleton h-4 w-16 rounded" />
        </div>
      ))}
    </>
  );
}

export function ChartSkeleton() {
  return (
    <div className="glass-card p-5">
      <div className="skeleton h-5 w-40 rounded mb-6" />
      <div className="flex items-end gap-3 h-40">
        {[60, 80, 45, 90, 65, 75, 55].map((h, i) => (
          <div key={i} className="skeleton flex-1 rounded-t-sm" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}
