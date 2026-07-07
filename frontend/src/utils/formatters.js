/**
 * Formatting utility functions for consistent display across the app.
 */

export const formatCurrency = (amount, currency = 'INR') => {
  if (amount === null || amount === undefined) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatCurrencyShort = (amount) => {
  if (!amount) return '—';
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
  return `₹${amount.toLocaleString('en-IN')}`;
};

export const formatDate = (dateStr, opts = {}) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...opts,
  });
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatArea = (sqFt) => {
  if (!sqFt) return '—';
  return `${sqFt.toLocaleString('en-IN')} sq.ft.`;
};

export const getAvailabilityColor = (availability) => {
  switch (availability) {
    case 'Available': return { bg: '#10b981', text: '#d1fae5', border: '#059669' };
    case 'Reserved':  return { bg: '#f59e0b', text: '#fef3c7', border: '#d97706' };
    case 'Sold':      return { bg: '#ef4444', text: '#fee2e2', border: '#dc2626' };
    default:          return { bg: '#6b7280', text: '#f3f4f6', border: '#4b5563' };
  }
};

export const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'Available':       return 'badge-available';
    case 'Reserved':        return 'badge-reserved';
    case 'Sold':            return 'badge-sold';
    case 'Token Paid':
    case 'Partial':         return 'badge-reserved';
    case 'Completed':       return 'badge-available';
    case 'Cancelled':       return 'badge-sold';
    default:                return 'bg-slate-700 text-slate-300 text-xs px-2.5 py-1 rounded-full';
  }
};

export const truncate = (str, maxLen = 120) =>
  str && str.length > maxLen ? str.slice(0, maxLen) + '…' : (str || '');

export const generateBookingRef = () =>
  `AE-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
