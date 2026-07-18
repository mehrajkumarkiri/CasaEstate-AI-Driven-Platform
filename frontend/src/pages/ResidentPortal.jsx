import { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { bookingsApi, ledgerApi } from '../services/api';
import { milestonesApi } from '../services/milestoneApi';
import BookingForm from '../components/BookingForm';
import MilestoneTimeline from '../components/MilestoneTimeline';
import AIPredictiveDashboard from '../components/AIPredictiveDashboard';
import PaymentGateway from '../components/PaymentGateway';
import CasaOpsSwarmConsole from '../components/CasaOpsSwarmConsole';
import WorkflowDashboard from './WorkflowDashboard';
import { formatCurrency, formatDate } from '../utils/formatters';
import { TableRowSkeleton } from '../components/SkeletonLoader';

const DEMO_USER_ID = 'user-demo-001';

const MOCK_BOOKINGS = [
  {
    _id: 'booking-001',
    bookingRef: 'AE-1719120000-XK7Y2',
    bookingType: 'Purchase',
    unitId: 'unit-proj-001-f3-u2',
    projectName: 'Aura Horizon',
    unitNumber: 'A302',
    bhkType: '3BHK',
    paymentStatus: 'Token Paid',
    tokenAmount: 200000,
    totalAmount: 9800000,
    status: 'Active',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    allotmentLetter: { generated: true },
  },
  {
    _id: 'booking-002',
    bookingRef: 'AE-1719033600-PQ8R4',
    bookingType: 'AmenityReservation',
    amenityName: 'Grand Clubhouse',
    slotDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    slotTime: '10:00 - 12:00',
    paymentStatus: 'Completed',
    totalAmount: 1000,
    status: 'Active',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    allotmentLetter: { generated: false },
  },
];

const MOCK_LEDGER = [
  {
    _id: 'ledger-001',
    transactionType: 'Token Amount',
    amount: 200000,
    status: 'Completed',
    transactionDate: new Date(Date.now() - 86400000 * 3).toISOString(),
    paymentMethod: 'Online',
    receiptNumber: 'RCP-1719120001',
    description: 'Token amount for Aura Horizon - Unit A302',
    digitalReceipt: { issued: true },
  },
  {
    _id: 'ledger-002',
    transactionType: 'Amenity Charge',
    amount: 1000,
    status: 'Completed',
    transactionDate: new Date(Date.now() - 86400000).toISOString(),
    paymentMethod: 'Online',
    receiptNumber: 'RCP-1719206402',
    description: 'Grand Clubhouse booking – 2 hours',
    digitalReceipt: { issued: true },
  },
  {
    _id: 'ledger-003',
    transactionType: 'Maintenance Fee',
    amount: 8500,
    status: 'Pending',
    transactionDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 86400000 * 5).toISOString(),
    paymentMethod: 'Online',
    receiptNumber: null,
    description: 'Monthly maintenance fee – July 2026',
    digitalReceipt: { issued: false },
  },
];

const AMENITIES = [
  { _id: 'amen-001', name: 'Grand Clubhouse', type: 'Clubhouse', icon: '🏛️', slots: ['09:00–11:00', '11:00–13:00', '14:00–16:00', '16:00–18:00', '19:00–21:00'], price: 1000 },
  { _id: 'amen-002', name: 'Olympic Swimming Pool', type: 'Swimming Pool', icon: '🏊', slots: ['06:00–08:00', '08:00–10:00', '16:00–18:00', '18:00–20:00'], price: 300 },
  { _id: 'amen-003', name: 'Tennis Court A', type: 'Tennis Court', icon: '🎾', slots: ['06:00–08:00', '08:00–10:00', '16:00–18:00', '18:00–20:00'], price: 500 },
  { _id: 'amen-004', name: 'Premium Gym', type: 'Gym', icon: '💪', slots: ['05:00–07:00', '07:00–09:00', '17:00–19:00', '19:00–21:00'], price: 0 },
  { _id: 'amen-005', name: 'Sky Lounge', type: 'Party Hall', icon: '🎉', slots: ['10:00–14:00', '15:00–19:00', '20:00–23:00'], price: 5000 },
];

function AmenityBookingPanel({ onBooked }) {
  const { pushNotification } = useApp();
  const [selected, setSelected] = useState(null);
  const [slotDate, setSlotDate] = useState('');
  const [slotTime, setSlotTime] = useState('');
  const [booking, setBooking] = useState(false);

  const minDate = new Date().toISOString().split('T')[0];

  const handleBook = async () => {
    if (!selected || !slotDate || !slotTime) {
      pushNotification({ type: 'warning', title: 'Missing Details', message: 'Select amenity, date and time slot.' });
      return;
    }
    setBooking(true);
    try {
      await new Promise(r => setTimeout(r, 1200));
      pushNotification({
        type: 'success',
        title: '✅ Amenity Reserved',
        message: `${selected.name} booked for ${slotDate} at ${slotTime}.`,
      });
      setSelected(null); setSlotDate(''); setSlotTime('');
      onBooked?.();
    } catch {
      pushNotification({ type: 'error', title: 'Booking Failed', message: 'Could not confirm slot.' });
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="bg-white dark:bg-stone-900 border border-slate-205 dark:border-stone-800 rounded-2xl p-5 space-y-5 shadow-xs text-left">
      <h3 className="text-xs font-bold text-slate-800 dark:text-stone-200 uppercase tracking-wider">Book Club Amenities</h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {AMENITIES.map(a => (
          <button
            key={a._id}
            id={`amenity-${a._id}`}
            onClick={() => { setSelected(a); setSlotTime(''); }}
            className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-center transition-all ${
              selected?._id === a._id
                ? 'border-slate-900 dark:border-white bg-slate-50 dark:bg-stone-800 text-slate-950 dark:text-white'
                : 'border-slate-200 dark:border-stone-750 bg-slate-50/50 dark:bg-stone-850/50 text-slate-600 dark:text-stone-400 hover:border-slate-350 dark:hover:border-stone-700'
            }`}
          >
            <span className="text-xl">{a.icon}</span>
            <p className="text-[11px] font-bold leading-tight truncate w-full">{a.name}</p>
            <span className="text-[10px] text-slate-400 dark:text-stone-500 font-semibold">
              {a.price === 0 ? 'Free' : `₹${a.price}/slot`}
            </span>
          </button>
        ))}
      </div>

      {selected && (
        <div className="space-y-4 border-t border-slate-100 dark:border-stone-800 pt-4 animate-fade-in">
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-stone-850 border border-slate-200 dark:border-stone-800 rounded-xl p-3 max-w-md">
            <span className="text-2xl">{selected.icon}</span>
            <div className="text-left">
              <p className="text-xs font-bold text-slate-800 dark:text-stone-200">{selected.name}</p>
              <p className="text-[10px] text-slate-500 dark:text-stone-400 font-semibold">{selected.type} · Price: {selected.price === 0 ? 'Free' : `₹${selected.price}`}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1">Reservation Date</label>
              <input
                id="amenity-date"
                type="date"
                min={minDate}
                value={slotDate}
                onChange={e => setSlotDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-stone-800 border border-slate-205 dark:border-stone-750 text-slate-900 dark:text-white placeholder-slate-400 text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1">Operating Time Slot</label>
              <select
                id="amenity-time"
                value={slotTime}
                onChange={e => setSlotTime(e.target.value)}
                className="w-full bg-slate-50 dark:bg-stone-800 border border-slate-205 dark:border-stone-750 text-slate-900 dark:text-white text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition-all"
              >
                <option value="">Select slot</option>
                {selected.slots.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <button
            id="amenity-book-btn"
            onClick={handleBook}
            disabled={booking || !slotDate || !slotTime}
            className="btn-primary text-xs font-bold uppercase tracking-wider py-2.5 max-w-md flex items-center justify-center gap-2"
          >
            {booking ? 'Locking slot...' : `Confirm Slot Booking`}
          </button>
        </div>
      )}
    </div>
  );
}

function LedgerTable({ entries, onPayDues }) {
  const totalPaid = entries.filter(e => e.status === 'Completed').reduce((s, e) => s + e.amount, 0);
  const totalPending = entries.filter(e => e.status === 'Pending').reduce((s, e) => s + e.amount, 0);

  return (
    <div className="bg-white dark:bg-stone-900 border border-slate-205 dark:border-stone-800 rounded-2xl overflow-hidden shadow-xs text-left">
      <div className="p-4 border-b border-slate-200 dark:border-stone-800 bg-slate-50/50 dark:bg-stone-850/50 flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
        <h3 className="text-xs font-bold text-slate-800 dark:text-stone-200 uppercase tracking-wider">Maintenance Ledger & Receipts</h3>
        <div className="flex gap-4 text-xs font-bold uppercase tracking-wider">
          <span className="text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-900/30">Paid: {formatCurrency(totalPaid)}</span>
          <span className="text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/20 px-2 py-0.5 rounded border border-amber-100 dark:border-amber-900/30">Due: {formatCurrency(totalPending)}</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-stone-800 bg-slate-50/20">
              {['Transaction Date', 'Type', 'Description', 'Amount', 'Status', 'Digital Receipt'].map(h => (
                <th key={h} className="text-slate-400 dark:text-stone-500 font-extrabold uppercase px-4 py-3 tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map(e => (
              <tr key={e._id} className="border-b border-slate-100 dark:border-stone-800 hover:bg-slate-50 dark:hover:bg-stone-850/50 transition-colors">
                <td className="px-4 py-3 text-slate-500 dark:text-stone-400 whitespace-nowrap">{formatDate(e.transactionDate)}</td>
                <td className="px-4 py-3">
                  <span className="font-bold text-[10px] text-slate-655 dark:text-stone-300 bg-slate-100 dark:bg-stone-800 border border-slate-200/50 dark:border-stone-700 px-2.5 py-1 rounded-md uppercase tracking-wider">{e.transactionType}</span>
                </td>
                <td className="px-4 py-3 text-slate-605 dark:text-stone-350 max-w-[200px] truncate">{e.description}</td>
                <td className="px-4 py-3 font-extrabold text-slate-800 dark:text-stone-200 whitespace-nowrap">{formatCurrency(e.amount)}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    e.status === 'Completed' ? 'badge-available' :
                    e.status === 'Pending' ? 'badge-reserved' : 'badge-sold'
                  }`}>{e.status}</span>
                </td>
                <td className="px-4 py-3 font-semibold text-blue-600">
                  {e.receiptNumber ? (
                    <button 
                      onClick={() => alert(`Downloading Transaction Receipt ${e.receiptNumber} PDF...`)} 
                      className="hover:underline text-left font-mono text-xs text-slate-700 dark:text-stone-300 font-bold"
                    >
                      {e.receiptNumber}
                    </button>
                  ) : (
                    <button 
                      type="button"
                      onClick={() => onPayDues(e)}
                      className="text-[10px] font-bold uppercase tracking-wider text-white bg-slate-900 hover:bg-slate-800 dark:bg-stone-100 dark:text-stone-900 px-3 py-1 rounded-lg"
                    >
                      Pay Dues
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BookingsList({ bookings }) {
  return (
    <div className="bg-white dark:bg-stone-900 border border-slate-205 dark:border-stone-800 rounded-2xl overflow-hidden shadow-xs text-left">
      <div className="p-4 border-b border-slate-200 dark:border-stone-800 bg-slate-50/50 dark:bg-stone-850/50">
        <h3 className="text-xs font-bold text-slate-800 dark:text-stone-200 uppercase tracking-wider">Allotments & Reserved Amenities</h3>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-stone-800">
        {bookings.map(b => (
          <div key={b._id} className="px-5 py-4 hover:bg-slate-50/50 dark:hover:bg-stone-855/50 transition-colors">
            <div className="flex items-start gap-4 flex-wrap">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg ${
                b.bookingType === 'Purchase' 
                  ? 'bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30' 
                  : 'bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30'
              }`}>
                {b.bookingType === 'Purchase' ? '🏢' : '🏛️'}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-bold text-slate-850 dark:text-stone-200">
                    {b.bookingType === 'Purchase' ? `Apartment Unit ${b.unitNumber || b.unitId}` : b.amenityName}
                  </p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    b.paymentStatus === 'Completed' ? 'badge-available' :
                    b.paymentStatus === 'Token Paid' ? 'badge-reserved' : 'badge-sold'
                  }`}>{b.paymentStatus}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-stone-400 mt-0.5 font-semibold">
                  {b.bookingType === 'Purchase'
                    ? `${b.projectName || 'Aura Horizon Tower'} · ${b.bhkType || '3BHK Layout'}`
                    : `Reserved Date: ${formatDate(b.slotDate)} · Timings: ${b.slotTime}`
                  }
                </p>
                <p className="text-[10px] text-slate-400 dark:text-stone-500 font-bold mt-1 uppercase">Registry Ref: <span className="font-mono">{b.bookingRef}</span></p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-extrabold text-slate-900 dark:text-white font-display">{formatCurrency(b.totalAmount)}</p>
                <p className="text-xs text-slate-450 dark:text-stone-500 font-semibold">{formatDate(b.createdAt)}</p>
                {b.allotmentLetter?.generated && (
                  <button 
                    onClick={() => alert(`Downloading Deed Agreement AL-${b.bookingRef} PDF...`)}
                    className="text-[10px] font-bold uppercase bg-slate-900 hover:bg-slate-800 dark:bg-stone-800 dark:hover:bg-stone-700 text-white dark:text-stone-200 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-stone-750 mt-1.5 inline-block"
                  >
                    Sale Deed PDF
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ResidentPortal() {
  const { currentUser, pushNotification } = useApp();
  const [bookings, setBookings] = useState(MOCK_BOOKINGS);
  const [ledger, setLedger] = useState(MOCK_LEDGER);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('amenities');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedDues, setSelectedDues] = useState(null);

  const handlePaymentSuccess = () => {
    setCheckoutOpen(false);
    if (!selectedDues) return;
    setLedger((prev) => 
      prev.map((item) => 
        item._id === selectedDues._id 
          ? { 
              ...item, 
              status: 'Completed', 
              receiptNumber: `RCP-171920${Math.floor(1000 + Math.random() * 9000)}` 
            } 
          : item
      )
    );
    pushNotification({
      type: 'success',
      title: '✓ Payment Complete',
      message: `Your payment of ${formatCurrency(selectedDues.amount)} has been cleared and receipt issued.`
    });
  };
  
  const [tickets, setTickets] = useState([
    { id: 't-1', title: 'Clubhouse lift sensor failure', category: 'Common Area Lift', status: 'In Progress', createdAt: '2026-07-01' },
    { id: 't-2', title: 'Water leakage in Tower A balcony', category: 'Plumbing Service', status: 'Resolved', createdAt: '2026-06-28' },
  ]);
  const [newTicketTitle, setNewTicketTitle] = useState('');
  const [newTicketCat, setNewTicketCat] = useState('Plumbing Service');

  const [aiClassification, setAiClassification] = useState(null);
  const [isClassifying, setIsClassifying] = useState(false);

  const handleAIClassify = () => {
    if (!newTicketTitle.trim()) return;
    setIsClassifying(true);
    
    setTimeout(() => {
      const text = newTicketTitle.toLowerCase();
      let category = 'Plumbing Service';
      let priority = 'Standard';
      let technician = 'Rajiv Sen (Plumber)';
      let sla = '24 Hours';
      
      if (text.includes('spark') || text.includes('wire') || text.includes('current') || text.includes('short circuit') || text.includes('shock') || text.includes('electrical') || text.includes('power')) {
        category = 'Electrical Repair';
        priority = 'Urgent Hazard';
        technician = 'Suresh Nair (Electrical Specialist)';
        sla = '30 Minutes';
      } else if (text.includes('lift') || text.includes('elevator') || text.includes('escalator')) {
        category = 'Common Area Lift';
        priority = 'High Priority';
        technician = 'Manish Verma (OTIS Technician)';
        sla = '2 Hours';
      } else if (text.includes('leak') || text.includes('water') || text.includes('seepage') || text.includes('pipe') || text.includes('tap')) {
        category = 'Plumbing Service';
        priority = 'High Priority';
        technician = 'Kiran Patil (Plumber Master)';
        sla = '4 Hours';
      } else if (text.includes('guard') || text.includes('theft') || text.includes('stranger') || text.includes('security') || text.includes('gate') || text.includes('fight')) {
        category = 'Security Violation';
        priority = 'Urgent Hazard';
        technician = 'Commander Singh (Security Chief)';
        sla = '15 Minutes';
      } else {
        category = 'Housekeeping Unit';
        priority = 'Standard';
        technician = 'Gita Bai (Housekeeping Supervisor)';
        sla = '12 Hours';
      }
      
      setAiClassification({ category, priority, technician, sla });
      setNewTicketCat(category);
      setIsClassifying(false);
      pushNotification({
        type: 'info',
        title: '🤖 CasaAI Dispatch Routing',
        message: `Routed to ${technician}. Priority: ${priority}. SLA: ${sla}.`
      });
    }, 1000);
  };


  // Construction Progress state
  const [constructionMilestones, setConstructionMilestones] = useState([]);
  const [constructionSummary, setConstructionSummary] = useState(null);
  const [constructionLoading, setConstructionLoading] = useState(false);

  const loadConstructionData = async () => {
    setConstructionLoading(true);
    try {
      const [msRes, sumRes] = await Promise.all([
        milestonesApi.getAll('proj-001'),
        milestonesApi.getSummary('proj-001', 850000000),
      ]);
      setConstructionMilestones(msRes.data?.data || []);
      setConstructionSummary(sumRes.data?.data || null);
    } catch {
      setConstructionMilestones([]);
    } finally {
      setConstructionLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'construction') loadConstructionData();
  }, [activeTab]);
  
  const handleRaiseTicket = (e) => {
    e.preventDefault();
    if (!newTicketTitle.trim()) return;
    const newT = {
      id: `t-${Date.now()}`,
      title: newTicketTitle,
      category: newTicketCat,
      status: 'Open / Assigned',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setTickets([newT, ...tickets]);
    setNewTicketTitle('');
    setAiClassification(null);
    pushNotification({
      type: 'success',
      title: '✓ Complaint Logged',
      message: `Assigned to ${aiClassification ? aiClassification.technician : 'Facility Head'}. Redressal SLA: ${aiClassification ? aiClassification.sla : '24 hours'}.`
    });
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      bookingsApi.getAll({ userId: DEMO_USER_ID }).catch(() => ({ data: MOCK_BOOKINGS })),
      ledgerApi.getAll({ userId: DEMO_USER_ID }).catch(() => ({ data: MOCK_LEDGER })),
    ]).then(([bRes, lRes]) => {
      if (bRes.data?.length) setBookings(bRes.data);
      if (lRes.data?.length) setLedger(lRes.data);
    }).finally(() => setLoading(false));
  }, []);

  const totalDue = ledger.filter(e => e.status === 'Pending').reduce((s, e) => s + e.amount, 0);

  return (
    <>
      <div className="pt-16 min-h-screen bg-slate-50 dark:bg-stone-950 transition-colors duration-350">
        
        {/* Header Block */}
        <div className="bg-white dark:bg-stone-900 border-b border-slate-205 dark:border-stone-800 text-left">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 dark:bg-stone-100 flex items-center justify-center text-2xl font-black text-white dark:text-stone-900 shadow-xs">
                  {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Resident Portal</h1>
                  <p className="text-xs font-bold text-slate-500 dark:text-stone-400 mt-0.5">
                    Logged in: <strong className="text-slate-800 dark:text-stone-200">{currentUser?.name || 'Resident'}</strong> · Unit C-302 (Aura Horizon)
                  </p>
                </div>
              </div>
              {totalDue > 0 && (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl px-4 py-3 flex flex-col items-start shadow-xs">
                  <p className="text-[10px] text-amber-700 dark:text-amber-400 font-extrabold uppercase tracking-wider">Maintenance Dues Pending</p>
                  <p className="text-lg font-black text-amber-600 dark:text-amber-300 mt-0.5 font-display">{formatCurrency(totalDue)}</p>
                </div>
              )}
            </div>

            {/* Quick counters */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                { icon: '🏢', label: 'Allotments', value: bookings.filter(b=>b.bookingType==='Purchase').length },
                { icon: '🏛', label: 'Reserved Amenities', value: bookings.filter(b => b.bookingType === 'AmenityReservation').length },
                { icon: '📜', label: 'Ledger Dues', value: ledger.filter(l=>l.status==='Pending').length },
              ].map(s => (
                <div key={s.label} className="bg-slate-50 dark:bg-stone-850 border border-slate-200 dark:border-stone-800 p-3 rounded-xl text-center">
                  <p className="text-xl">{s.icon}</p>
                  <p className="text-base font-bold text-slate-800 dark:text-stone-200 mt-0.5">{s.value}</p>
                  <p className="text-[9px] font-bold text-slate-400 dark:text-stone-500 uppercase tracking-wider">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-slate-200 dark:border-stone-800 bg-white dark:bg-stone-900 sticky top-16 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-1 overflow-x-auto scrollbar-hide text-left">
            {[
              { key: 'amenities', label: '🏛️ Society Amenities' },
              { key: 'bookings', label: '📋 Allotments History' },
              { key: 'ledger', label: '📊 Billing Ledger' },
              { key: 'helpdesk', label: '🔧 Raise Complaint' },
              { key: 'safety', label: '🚨 Safety & Evacuation' },
              { key: 'construction', label: '🏗️ Construction Progress' },
              { key: 'workflow', label: '⚙️ Autonomous Workflows' },
            ].map(tab => (
              <button key={tab.key} id={`resident-tab-${tab.key}`}
                onClick={() => setActiveTab(tab.key)}
                className={`text-xs font-bold uppercase tracking-wider px-4 py-3.5 border-b-2 transition-all -mb-px whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'text-slate-900 dark:text-white border-slate-900 dark:border-white'
                    : 'text-slate-500 border-transparent hover:text-slate-950 dark:hover:text-stone-250'
                }`}
              >
                {tab.label}
              </button>
            ))}

          </div>
        </div>

        {/* Content Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          
          {activeTab === 'amenities' && (
            <div className="animate-fade-in">
              <AmenityBookingPanel onBooked={() => {}} />
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="animate-fade-in">
              {loading
                ? <div className="bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-800 rounded-2xl"><TableRowSkeleton rows={3} /></div>
                : <BookingsList bookings={bookings} />
              }
            </div>
          )}

          {activeTab === 'ledger' && (
            <div className="animate-fade-in">
              {loading
                ? <div className="bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-800 rounded-2xl"><TableRowSkeleton rows={5} /></div>
                : <LedgerTable entries={ledger} onPayDues={(item) => { setSelectedDues(item); setCheckoutOpen(true); }} />
              }
            </div>
          )}

          {/* Helpdesk */}
          {activeTab === 'helpdesk' && (
            <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
              <div className="lg:col-span-7 bg-white dark:bg-stone-900 border border-slate-205 dark:border-stone-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-bold text-slate-800 dark:text-stone-200 uppercase tracking-wider">Raise Grievance Complaint</h3>
                <form onSubmit={handleRaiseTicket} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1">Select Category</label>
                    <select 
                      value={newTicketCat}
                      onChange={e=>setNewTicketCat(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-stone-800 border border-slate-205 dark:border-stone-750 text-slate-900 dark:text-white text-xs rounded-xl px-4 py-2.5"
                    >
                      <option value="Plumbing Service">Plumbing Service</option>
                      <option value="Electrical Repair">Electrical Repair</option>
                      <option value="Common Area Lift">Common Area Lift</option>
                      <option value="Housekeeping Unit">Housekeeping Unit</option>
                      <option value="Security Violation">Security Violation</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1">Explain the problem</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Balcony paint chipping due to pipe leakage"
                      value={newTicketTitle}
                      onChange={e=>setNewTicketTitle(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-stone-800 border border-slate-205 dark:border-stone-750 text-slate-900 dark:text-white text-xs rounded-xl px-4 py-2.5"
                    />
                  </div>

                  {/* AI Router Preview Panel */}
                  {newTicketTitle.trim() && (
                    <div className="bg-gradient-to-r from-slate-900 to-indigo-950 dark:from-stone-900 dark:to-indigo-950 border border-indigo-900/35 rounded-2xl p-4 text-white relative overflow-hidden text-left">
                      <div className="absolute inset-0 opacity-[0.03] bg-grid" />
                      <div className="relative z-10 flex items-center justify-between gap-4">
                        <div className="text-left">
                          <p className="text-[9px] font-black text-indigo-305 uppercase tracking-widest leading-none">AI Dispatch Router</p>
                          {aiClassification ? (
                            <div className="mt-2 space-y-1 text-xs">
                              <p className="text-left">Routed Category: <strong className="text-white font-bold">{aiClassification.category}</strong></p>
                              <p className="text-left">Priority Tier: <strong className="text-amber-400 font-bold">{aiClassification.priority}</strong></p>
                              <p className="text-left">Technician: <strong className="text-white font-bold">{aiClassification.technician}</strong></p>
                              <p className="text-left">SLA Resolution: <strong className="text-emerald-400 font-bold">{aiClassification.sla}</strong></p>
                            </div>
                          ) : (
                            <p className="text-[10px] text-indigo-200/70 mt-1 text-left">Let CasaAI read your description to classify category and assign optimal SLA.</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={handleAIClassify}
                          disabled={isClassifying}
                          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-lg border-none shadow-md shadow-indigo-950/30 transition-all cursor-pointer whitespace-nowrap"
                        >
                          {isClassifying ? 'Classifying...' : '⚡ Classify & Route'}
                        </button>
                      </div>
                    </div>
                  )}

                  <button type="submit" className="btn-primary text-xs font-bold uppercase tracking-wider py-2.5">
                    File Complaint Ticket
                  </button>
                </form>


                {/* Tickets queue */}
                <div className="border-t border-slate-100 dark:border-stone-800 pt-4 space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 dark:text-stone-500 uppercase tracking-wider">Active Complaints Queue</h4>
                  <div className="space-y-2">
                    {tickets.map(t=>(
                      <div key={t.id} className="p-3 bg-slate-50 dark:bg-stone-850 border border-slate-200 dark:border-stone-800 rounded-xl flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-stone-200">{t.title}</p>
                          <p className="text-[10px] text-slate-400 dark:text-stone-500 mt-0.5">{t.category} · Created: {t.createdAt}</p>
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                          t.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-105 dark:bg-emerald-950/20 dark:text-emerald-400' : 'bg-amber-50 text-amber-700 border-amber-105 dark:bg-amber-950/20 dark:text-amber-400'
                        }`}>
                          {t.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RWA Escalations */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white dark:bg-stone-900 border border-slate-205 dark:border-stone-800 rounded-2xl p-5">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">RWA Escalation Workflow</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-50 dark:bg-stone-850 border border-slate-200 dark:border-stone-800 rounded-xl">
                      <p className="text-xs font-bold text-slate-800 dark:text-stone-200">Ms. Shalini Sharma (Facility Manager)</p>
                      <p className="text-[10px] text-slate-500 dark:text-stone-400 font-semibold mt-0.5">Email: shalini.sharma@casaestate.com</p>
                      <p className="text-[9px] text-blue-600 dark:text-blue-400 font-bold uppercase mt-1">Level 1 Escalation Officer</p>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-stone-850 border border-slate-200 dark:border-stone-800 rounded-xl">
                      <p className="text-xs font-bold text-slate-800 dark:text-stone-200">Dr. Rajesh Varma (RWA Secretary)</p>
                      <p className="text-[10px] text-slate-500 dark:text-stone-400 font-semibold mt-0.5">Office: Tower A Ground Lobby</p>
                      <p className="text-[9px] text-amber-600 dark:text-amber-400 font-bold uppercase mt-1">Level 2 Residents Association</p>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-stone-850 border border-slate-200 dark:border-stone-800 rounded-xl">
                      <p className="text-xs font-bold text-slate-800 dark:text-stone-200">Builder Grievance Cell Representative</p>
                      <p className="text-[10px] text-slate-500 dark:text-stone-400 font-semibold mt-0.5">Helpline: +91-120-6677889</p>
                      <p className="text-[9px] text-red-650 dark:text-red-400 font-bold uppercase mt-1">Level 3 Nodal Officer</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Safety */}
          {activeTab === 'safety' && (
            <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
              <div className="lg:col-span-8 bg-white dark:bg-stone-900 border border-slate-205 dark:border-stone-800 rounded-2xl p-6 space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 dark:text-stone-200 uppercase tracking-wider mb-2">Emergency Safety Protocol</h3>
                  <p className="text-xs text-slate-550 dark:text-stone-400 leading-relaxed font-semibold">
                    Aura Towers feature high-grade fire sprinklers, concrete pressurization wells, and earthquake-resistant RCC shear walls. In case of safety alarms, evacuate via structural staircase wells.
                  </p>
                </div>

                <div className="border-t border-slate-100 dark:border-stone-800 pt-4 space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-stone-300 uppercase tracking-wider">Fire Evacuation Assembly Zones</h4>
                  <ul className="space-y-2 text-xs text-slate-655 dark:text-stone-400 font-semibold">
                    <li className="flex gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span><strong>Tower A Assembly Point:</strong> Central Garden lawn area (opposite clubhouse).</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span><strong>Tower B Assembly Point:</strong> Main entry drop-off circle gate path.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span><strong>Evacuation Voice Alarms:</strong> Corridors contain automated strobe systems and PA announcement alerts.</span>
                    </li>
                  </ul>
                </div>

                <div className="border-t border-slate-100 dark:border-stone-800 pt-4">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-stone-300 uppercase tracking-wider mb-3">Society Drills & Testing Logs</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl text-xs text-amber-800 dark:text-amber-400 leading-relaxed font-semibold">
                      <strong>📅 RWA Evacuation Drill:</strong> Fire evacuation mock drill scheduled for Tower A & B on 12th July at 11:00 AM. Emergency voice relays will test.
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-xl text-xs text-blue-800 dark:text-blue-400 leading-relaxed font-semibold">
                      <strong>⚡ Generator Testing:</strong> regular loads testing of power backing diesel generator is scheduled for Monday 3:00 AM. Aux lift systems online.
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Sidebar extensions */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-white dark:bg-stone-900 border border-slate-205 dark:border-stone-800 rounded-2xl p-5">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Tower Guard Extensions</h3>
                  <div className="space-y-2 text-xs font-semibold">
                    
                    <div className="flex justify-between py-2 border-b border-slate-100 dark:border-stone-800">
                      <span className="text-slate-400 dark:text-stone-500 uppercase">Tower A Gate Marshal</span>
                      <span className="text-slate-800 dark:text-stone-200 font-bold">Extension: 101</span>
                    </div>

                    <div className="flex justify-between py-2 border-b border-slate-100 dark:border-stone-800">
                      <span className="text-slate-400 dark:text-stone-500 uppercase">Tower B Gate Marshal</span>
                      <span className="text-slate-800 dark:text-stone-200 font-bold">Extension: 102</span>
                    </div>

                    <div className="flex justify-between py-2 border-b border-slate-100 dark:border-stone-800">
                      <span className="text-slate-400 dark:text-stone-500 uppercase">Security Control Desk</span>
                      <span className="text-slate-800 dark:text-stone-200 font-bold">Extension: 100</span>
                    </div>

                    <div className="flex justify-between py-2 text-red-650 font-bold">
                      <span className="uppercase">Fire Safety Marshal</span>
                      <span>Extension: 99</span>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'construction' && (
            <div className="animate-fade-in space-y-6">
              {/* Header */}
              <div className="bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-700 rounded-2xl p-5 shadow-xs text-left">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-extrabold uppercase tracking-wider">BuildFlow AI — Live Construction Updates</span>
                </div>
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-1">Your Project Build Progress</h2>
                <p className="text-xs text-slate-500 dark:text-stone-400">Real-time construction milestones for Casa Horizon · Unit C-302</p>
              </div>
              <CasaOpsSwarmConsole autoTriggerKey={activeTab} />

              {/* Timeline */}
              <div className="bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-700 rounded-2xl p-6 shadow-xs">
                {constructionLoading ? (
                  <div className="flex justify-center py-10">
                    <span className="w-7 h-7 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                  </div>
                ) : (
                  <MilestoneTimeline milestones={constructionMilestones} />
                )}
              </div>

              {/* AI Summary + Predictive grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* AI summary box */}
                <div className="bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-700 rounded-2xl p-5 shadow-xs text-left">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-sm flex-shrink-0">🤖</div>
                    <div>
                      <p className="text-xs font-extrabold text-slate-900 dark:text-white">BuildFlow AI Summary</p>
                      <p className="text-[9px] text-slate-400 dark:text-stone-500">Generated from engineer field logs</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-stone-300 leading-relaxed">
                    {constructionSummary?.aiSummary
                      ? constructionSummary.aiSummary.replace(/\*\*(.*?)\*\*/g, '$1').replace(/📊.*?\n\n/, '').replace(/\n\n_.*?_$/, '')
                      : 'Your project is progressing through the MEP phase at 62% completion. Foundation and structural framing have been successfully completed. Electrical, plumbing, and HVAC works are actively underway. No scheduling deviations detected by BuildFlow AI at this time.'}
                  </p>
                </div>

                {/* Predictive analytics */}
                <div className="bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-700 rounded-2xl p-5 shadow-xs">
                  <AIPredictiveDashboard
                    milestones={constructionMilestones}
                    delayPrediction={constructionSummary?.delayPrediction || {}}
                    costAnalysis={constructionSummary?.costAnalysis || {}}
                    originalPossessionDate={new Date(Date.now() + 86400000 * 150).toISOString()}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'workflow' && (
            <div className="animate-fade-in bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
              <WorkflowDashboard embedMode={true} initialRole={currentUser?.role || 'client'} />
            </div>
          )}

        </div>
      </div>

      <PaymentGateway
        isOpen={checkoutOpen}
        paymentDetails={{
          amount: selectedDues?.amount || 0,
          label: selectedDues?.transactionType || 'Dues Payment',
          description: selectedDues?.description || 'BuildFlow AI Payment Escrow'
        }}
        onSuccess={handlePaymentSuccess}
        onCancel={() => setCheckoutOpen(false)}
      />
      <BookingForm />
    </>
  );
}
