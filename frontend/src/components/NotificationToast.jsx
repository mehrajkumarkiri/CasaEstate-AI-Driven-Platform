import { useApp } from '../context/AppContext';
import { useEffect, useRef } from 'react';

const icons = {
  success: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
};

const colorMap = {
  success: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400',
  error: 'border-red-500/50 bg-red-500/10 text-red-400',
  info: 'border-blue-500/50 bg-blue-500/10 text-blue-400',
  warning: 'border-amber-500/50 bg-amber-500/10 text-amber-400',
};

function Toast({ notification, onDismiss }) {
  const { id, type = 'info', title, message } = notification;
  const color = colorMap[type] || colorMap.info;

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md bg-slate-900/90 
        shadow-[0_8px_32px_rgba(0,0,0,0.5)] animate-slide-in-right max-w-sm w-full ${color.split(' ')[0]} ${color.split(' ')[1]}`}
      role="alert"
    >
      <div className={`flex-shrink-0 mt-0.5 ${color.split(' ').pop()}`}>
        {icons[type]}
      </div>
      <div className="flex-1 min-w-0">
        {title && <p className="text-sm font-semibold text-white leading-tight">{title}</p>}
        {message && <p className="text-xs text-slate-400 mt-1 leading-relaxed">{message}</p>}
      </div>
      <button
        onClick={() => onDismiss(id)}
        className="flex-shrink-0 text-slate-500 hover:text-white transition-colors p-0.5 rounded"
        aria-label="Dismiss"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

export default function NotificationToast() {
  const { notifications, dismissNotification } = useApp();

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 items-end pointer-events-none"
    >
      {notifications.map((n) => (
        <div key={n.id} className="pointer-events-auto">
          <Toast notification={n} onDismiss={dismissNotification} />
        </div>
      ))}
    </div>
  );
}
