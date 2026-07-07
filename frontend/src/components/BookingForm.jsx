import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useBooking } from '../hooks/useBooking';
import { formatCurrency } from '../utils/formatters';
import PaymentGateway from './PaymentGateway';

const STEPS = ['Applicant Info', 'Terms & RERA', 'Reservation Check'];

function StepIndicator({ current }) {
  return (
    <div className="flex items-center gap-0 mb-5 text-left">
      {STEPS.map((step, i) => (
        <div key={step} className="flex items-center flex-1">
          <div className="flex flex-col items-center">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
              i < current ? 'bg-emerald-600 text-white' :
              i === current ? 'bg-slate-900 dark:bg-stone-100 text-white dark:text-stone-900' :
              'bg-slate-100 dark:bg-stone-800 text-slate-400 dark:text-stone-500 border border-slate-200 dark:border-stone-700'
            }`}>
              {i < current ? '✓' : i + 1}
            </div>
            <span className={`text-[9px] mt-1 font-bold uppercase tracking-wider ${i === current ? 'text-slate-900 dark:text-white font-extrabold' : 'text-slate-400 dark:text-stone-500'}`}>{step}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 mx-1 mb-4 transition-colors duration-300 ${i < current ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-stone-800'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function CostBreakdown({ unit }) {
  if (!unit?.pricing) return null;
  const p = unit.pricing;
  const base = p.basePrice;
  const gstAmt = Math.round((base * (p.gst || 5)) / 100);
  const total = base + gstAmt + (p.parkingCharges || 150000) + (p.maintenanceDeposit || 50000);
  const tokenAmt = Math.round(base * 0.02);

  const rows = [
    { label: 'Base Purchase Price', amount: base },
    { label: `GST Service Tax @ ${p.gst || 5}%`, amount: gstAmt },
    { label: 'Sanctioned Covered Parking Fee', amount: p.parkingCharges || 150000 },
    { label: 'One-time Maintenance Deposit', amount: p.maintenanceDeposit || 50000 },
  ];

  return (
    <div className="bg-slate-50 dark:bg-stone-800 rounded-xl p-4 space-y-2 border border-slate-200 dark:border-stone-750 text-left">
      <h4 className="text-[9px] font-bold text-slate-400 dark:text-stone-500 uppercase tracking-wider mb-2">Government & Facility Cost Breakdown</h4>
      {rows.map((r) => (
        <div key={r.label} className="flex justify-between text-xs">
          <span className="text-slate-500 dark:text-stone-400 font-semibold">{r.label}</span>
          <span className="text-slate-800 dark:text-stone-200 font-bold">{formatCurrency(r.amount)}</span>
        </div>
      ))}
      <div className="border-t border-slate-200 dark:border-stone-750 pt-2 flex justify-between">
        <span className="text-xs font-bold text-slate-700 dark:text-stone-300">Total Allotment Cost</span>
        <span className="text-xs font-black text-slate-900 dark:text-white font-display">{formatCurrency(total)}</span>
      </div>
      <div className="bg-slate-100 dark:bg-stone-800 border border-slate-200 dark:border-stone-700 rounded-lg px-3 py-2 mt-1">
        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
          <span className="text-slate-800 dark:text-stone-250">Provisional Booking Deposit (2%)</span>
          <span className="text-slate-900 dark:text-white">{formatCurrency(tokenAmt)}</span>
        </div>
      </div>
    </div>
  );
}

export default function BookingForm() {
  const { bookingDrawer, closeBookingDrawer, currentUser, pushNotification } = useApp();
  const { submitBooking, loading } = useBooking();
  const { open, unit, project } = bookingDrawer;

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    userName: '',
    userEmail: '',
    userPhone: '',
    notes: '',
    agreeTerms: false,
    agreeRera: false,
    agreeContact: false,
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [gatewayOpen, setGatewayOpen] = useState(false);

  // Atomic database lock countdown timer (10 mins)
  const [timeLeft, setTimeLeft] = useState(600);

  useEffect(() => {
    if (!open || submitted) return;
    setTimeLeft(600);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          pushNotification({
            type: 'error',
            title: '❌ Lock Session Expired',
            message: 'Your 10-minute database reservation has expired. The unit has been released.'
          });
          closeBookingDrawer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [open, submitted, closeBookingDrawer, pushNotification]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (open) {
      setForm({
        userName: currentUser?.name || '',
        userEmail: currentUser?.email || '',
        userPhone: currentUser?.phone || '',
        notes: '',
        agreeTerms: false,
        agreeRera: false,
        agreeContact: false,
      });
    }
  }, [open, currentUser]);

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep(0);
        setErrors({});
        setSubmitted(false);
        setBookingResult(null);
      }, 300);
    }
  }, [open]);

  const validate = () => {
    const e = {};
    if (!form.userName.trim()) e.userName = 'Full legal applicant name is required';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.userEmail.trim()) {
      e.userEmail = 'Applicant notification email is required';
    } else if (!emailRegex.test(form.userEmail)) {
      e.userEmail = 'Please provide a valid email format';
    }

    const phoneRegex = /^[+]?[\d\s-]{10,}$/;
    if (!form.userPhone.trim()) {
      e.userPhone = 'Contact phone number is required';
    } else if (!phoneRegex.test(form.userPhone.replace(/[\s-]/g, ''))) {
      e.userPhone = 'Provide a valid phone (at least 10 digits)';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 0 && !validate()) return;
    setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    if (!form.agreeTerms || !form.agreeRera || !form.agreeContact) {
      setErrors({ consent: 'All compliance approvals are mandatory to book a RERA unit.' });
      return;
    }
    setGatewayOpen(true);
  };

  const handlePaymentSuccess = async () => {
    setGatewayOpen(false);
    try {
      const res = await submitBooking({
        ...form,
        bookingType: 'Purchase',
        unitId: unit?._id,
        projectId: unit?.projectId || project?._id,
        tokenAmount: Math.round((unit?.pricing?.basePrice || 9800000) * 0.02),
      });
      setBookingResult(res);
      setSubmitted(true);
      pushNotification({
        type: 'success',
        title: '✓ Booking & Payment Secured',
        message: 'Your provisional unit booking has been confirmed and token fee paid.'
      });
    } catch {
      pushNotification({
        type: 'error',
        title: 'Error',
        message: 'Could not secure database lock. Try again.'
      });
    }
  };

  const handleDiscard = () => {
    if (window.confirm('Are you sure you want to release the database lock and exit?')) {
      closeBookingDrawer();
    }
  };

  const field = (key, label, type = 'text', placeholder = '', help = '') => (
    <div>
      <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1">
        {label} <span className="text-red-500 font-bold">*</span>
      </label>
      <input
        id={`booking-${key}`}
        type={type}
        value={form[key]}
        placeholder={placeholder}
        onChange={(e) => {
          setForm((f) => ({ ...f, [key]: e.target.value }));
          if (errors[key]) setErrors((er) => ({ ...er, [key]: '' }));
        }}
        className={`w-full bg-slate-50 dark:bg-stone-800 border text-slate-900 dark:text-white placeholder-slate-450 dark:placeholder-stone-500 text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition-all ${
          errors[key] ? 'border-red-500' : 'border-slate-205 dark:border-stone-750'
        }`}
      />
      {help && !errors[key] && <p className="text-[9px] text-slate-400 dark:text-stone-550 mt-0.5 leading-normal">{help}</p>}
      {errors[key] && <p className="text-[10px] text-red-500 font-bold mt-0.5 text-left">⚠️ {errors[key]}</p>}
    </div>
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-60 bg-slate-950/40 dark:bg-stone-950/60 backdrop-blur-xs transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleDiscard}
      />

      {/* Drawer Panel */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-70 w-full sm:w-[480px] bg-white dark:bg-stone-900 border-l border-slate-205 dark:border-stone-800
          flex flex-col transition-transform duration-300 ease-out shadow-xl
          ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-205 dark:border-stone-800 flex-shrink-0 bg-slate-50/50 dark:bg-stone-800/50 text-left">
          <div>
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              {submitted ? '🎉 Unit Allotted Successfully' : 'Digital Unit Booking Wizard'}
            </h2>
            {unit && !submitted && (
              <p className="text-[11px] text-slate-500 dark:text-stone-400 mt-0.5 font-bold">
                Target: {project?.name || 'Casa Tower'} · Unit: {unit.unitNumber} ({unit.bhkType})
              </p>
            )}
          </div>
          <button
            id="booking-drawer-close"
            onClick={handleDiscard}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-stone-800 transition-colors border border-slate-200/50 dark:border-stone-750"
          >
            ✕
          </button>
        </div>

        {/* Atomic database lock indicator */}
        {open && !submitted && (
          <div className="bg-blue-50 dark:bg-blue-950/20 border-b border-blue-100 dark:border-blue-900/30 px-5 py-2.5 flex items-center justify-between text-xs text-blue-800 dark:text-blue-400 font-bold">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              Atomic Database Lock Active
            </span>
            <span className="font-mono text-xs bg-white dark:bg-stone-800 px-2 py-0.5 rounded shadow-xs border border-blue-200 dark:border-blue-900/40">
              {formatTime(timeLeft)} remaining
            </span>
          </div>
        )}

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-white dark:bg-stone-900">
          
          {/* Target Unit Context Card */}
          {unit && !submitted && (
            <div className="bg-slate-50 dark:bg-stone-800 border border-slate-205 dark:border-stone-750 p-4 rounded-xl text-left">
              <p className="text-[9px] font-bold text-slate-400 dark:text-stone-500 uppercase tracking-widest mb-2">Sanctioned Real Estate Unit Details</p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                {[
                  ['Project / Tower', `${project?.name || 'Tower A'} (Block ${unit.tower || 'A'})`],
                  ['Apartment Block Number', `Unit ${unit.unitNumber} (${unit.bhkType})`],
                  ['Tower Floor Level', `Floor Level L${unit.floor}`],
                  ['Carpet Area (Sanctioned)', `${unit.carpetArea} sq.ft`],
                  ['Base Rate Price', formatCurrency(unit.pricing?.basePrice)],
                ].map(([k, v]) => (
                  <div key={k}>
                    <p className="text-[9px] text-slate-405 dark:text-stone-500 font-bold uppercase">{k}</p>
                    <p className="font-bold text-slate-800 dark:text-stone-200 mt-0.5 leading-tight">{v}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!submitted ? (
            <>
              <StepIndicator current={step} />

              {/* Step 0: Applicant Details */}
              {step === 0 && (
                <div className="space-y-4 animate-fade-in text-left">
                  <div className="bg-slate-50 dark:bg-stone-800 border border-slate-205 dark:border-stone-750 p-4 rounded-xl space-y-3">
                    <p className="text-[9px] font-bold text-slate-400 dark:text-stone-500 uppercase tracking-wider mb-1">Applicant Legal Registration</p>
                    {field('userName', 'Full Legal Name', 'text', 'e.g. Kavita Sharma', 'Must match government identity / PAN card.')}
                    {field('userEmail', 'Notification Email ID', 'email', 'e.g. name@domain.com', 'Agreement deed notifications will be routed here.')}
                    {field('userPhone', 'Primary Mobile Number', 'tel', 'e.g. +91 9999988888', 'Required for critical transaction OTP checks.')}
                    <div className="pt-1">
                      <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1">Special Booking Instructions (optional)</label>
                      <textarea
                        id="booking-notes"
                        value={form.notes}
                        onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                        placeholder="Request bank loan assistance, tower directions, parking allocations..."
                        rows={2}
                        className="w-full bg-slate-50 dark:bg-stone-800 border border-slate-205 dark:border-stone-750 text-slate-900 dark:text-white placeholder-slate-450 dark:placeholder-stone-500 text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 1: Cost Review & Consents */}
              {step === 1 && (
                <div className="space-y-4 animate-fade-in text-left">
                  <div className="bg-slate-50 dark:bg-stone-800 border border-slate-205 dark:border-stone-750 p-4 rounded-xl space-y-2">
                    <p className="text-[9px] font-bold text-slate-400 dark:text-stone-500 uppercase tracking-wider mb-2">Applicant Registration Overview</p>
                    {[['Name', form.userName], ['Email', form.userEmail], ['Phone', form.userPhone]].map(([k, v]) => (
                      <div key={k} className="flex justify-between text-xs py-1.5 border-b border-slate-200/50 dark:border-stone-800 last:border-0">
                        <span className="text-slate-500 dark:text-stone-400 font-semibold">{k}</span>
                        <span className="text-slate-800 dark:text-stone-200 font-bold">{v}</span>
                      </div>
                    ))}
                  </div>

                  {unit && <CostBreakdown unit={unit} />}

                  {/* Consents section with required inline markers */}
                  <div className="bg-slate-50 dark:bg-stone-800 border border-slate-205 dark:border-stone-750 rounded-xl p-4 space-y-3">
                    <p className="text-[9px] font-bold text-slate-400 dark:text-stone-500 uppercase tracking-wider mb-1">RERA Disclosures Consent <span className="text-red-500 font-bold">*</span></p>
                    
                    <div className="flex items-start gap-2.5">
                      <input
                        id="booking-agree-terms"
                        type="checkbox"
                        checked={form.agreeTerms}
                        onChange={(e) => setForm((f) => ({ ...f, agreeTerms: e.target.checked }))}
                        className="mt-0.5 w-4 h-4 accent-slate-900 dark:accent-white rounded border-slate-300"
                      />
                      <label htmlFor="booking-agree-terms" className="text-[11px] text-slate-600 dark:text-stone-400 leading-normal cursor-pointer select-none">
                        I confirm review and accept the official <strong className="text-slate-800 dark:text-stone-200">Terms of Use & Privacy Policy</strong>. This constitutes a provisional allotment booking subject to regular invoice clearance.
                      </label>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <input
                        id="booking-agree-rera"
                        type="checkbox"
                        checked={form.agreeRera}
                        onChange={(e) => setForm((f) => ({ ...f, agreeRera: e.target.checked }))}
                        className="mt-0.5 w-4 h-4 accent-slate-900 dark:accent-white rounded border-slate-300"
                      />
                      <label htmlFor="booking-agree-rera" className="text-[11px] text-slate-600 dark:text-stone-400 leading-normal cursor-pointer select-none">
                        I acknowledge I have downloaded and reviewed the <strong className="text-slate-800 dark:text-stone-200">RERA Registration documents</strong> and layout sanctions for {project?.name || 'this project'}.
                      </label>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <input
                        id="booking-agree-contact"
                        type="checkbox"
                        checked={form.agreeContact}
                        onChange={(e) => setForm((f) => ({ ...f, agreeContact: e.target.checked }))}
                        className="mt-0.5 w-4 h-4 accent-slate-900 dark:accent-white rounded border-slate-300"
                      />
                      <label htmlFor="booking-agree-contact" className="text-[11px] text-slate-600 dark:text-stone-400 leading-normal cursor-pointer select-none">
                        I authorize CasaEstate agents to contact me regarding payments, legal deed signatures, and RWA notices.
                      </label>
                    </div>

                    {errors.consent && <p className="text-[10px] text-red-500 font-bold mt-1">⚠️ {errors.consent}</p>}
                  </div>
                </div>
              )}

              {/* Step 2: Confirm */}
              {step === 2 && (
                <div className="space-y-4 animate-fade-in text-left">
                  <div className="bg-slate-50 dark:bg-stone-800 border border-slate-205 dark:border-stone-750 p-5 text-center space-y-3 rounded-2xl shadow-xs">
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-stone-800 border border-slate-200 dark:border-stone-750 flex items-center justify-center mx-auto text-xl shadow-xs">
                      🔒
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Authorize Database Allotment</h3>
                    <p className="text-xs text-slate-600 dark:text-stone-400 leading-normal">
                      We will block other potential buyers. Provisional booking deposit required is{' '}
                      <strong className="text-slate-800 dark:text-stone-200 font-display">
                        {formatCurrency(Math.round((unit?.pricing?.basePrice || 9800000) * 0.02))}
                      </strong>.
                    </p>
                    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl p-4 text-left">
                      <p className="text-xs text-amber-800 dark:text-amber-400 font-bold">⚠️ Double-Booking Database Protection active</p>
                      <p className="text-[10px] text-amber-700 dark:text-amber-500 mt-1 leading-normal">
                        Confirming locks the unit status under your email ID. A digital sale deed contract and invoice breakdown receipts will be compiled instantly.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Success State */
            <div className="space-y-4 animate-fade-in text-left">
              <div className="bg-slate-50 dark:bg-stone-800 border border-slate-205 dark:border-stone-750 p-6 text-center space-y-4 rounded-2xl shadow-xs">
                <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center mx-auto text-2xl shadow-xs">
                  ✓
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Provisional Unit Allotted</h3>
                  <p className="text-xs font-bold text-slate-800 dark:text-stone-300 font-mono mt-1">Ref: {bookingResult?.bookingRef}</p>
                </div>
                <p className="text-xs text-slate-500 dark:text-stone-400 leading-normal">
                  Your digital sale deed agreement and transaction invoice have been generated successfully. The unit status is now set to <strong>Reserved</strong>.
                </p>
              </div>

              {bookingResult?.allotmentLetter?.content && (
                <div className="bg-white dark:bg-stone-900 border border-slate-205 dark:border-stone-800 p-4 rounded-xl space-y-3 shadow-xs">
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-stone-800 pb-2">
                    <p className="text-[9px] font-bold text-slate-400 dark:text-stone-500 uppercase tracking-widest">Sale Deed Allotment Letter</p>
                    <button 
                      onClick={() => alert('Downloading official Sale Deed PDF... (Compiled AL-' + bookingResult.bookingRef + ')')}
                      className="text-[9px] font-bold text-slate-700 dark:text-stone-350 bg-slate-50 dark:bg-stone-800 hover:bg-slate-100 dark:hover:bg-stone-700 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-stone-750"
                    >
                      Download Agreement PDF
                    </button>
                  </div>
                  
                  <div className="text-xs space-y-2 text-slate-650 dark:text-stone-450">
                    <div className="flex justify-between">
                      <span>Registration Registry Ref</span>
                      <span className="text-slate-900 dark:text-white font-bold font-mono">{bookingResult.allotmentLetter.content.documentRef || `AL-${bookingResult.bookingRef}`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Provisional Owner</span>
                      <span className="text-slate-900 dark:text-white font-bold">{bookingResult.allotmentLetter.content.allottee?.name}</span>
                    </div>
                    {bookingResult.allotmentLetter.content.costBreakdown?.grandTotal && (
                      <div className="flex justify-between">
                        <span>Total Price (with tax)</span>
                        <span className="text-slate-900 dark:text-white font-bold">
                          {bookingResult.allotmentLetter.content.costBreakdown.grandTotal.formatted}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="pt-2 border-t border-slate-100 dark:border-stone-800">
                    <p className="text-[9px] text-slate-400 dark:text-stone-500 font-bold uppercase tracking-wider">Legal Disclosures Included</p>
                    <ul className="mt-1.5 space-y-1">
                      {(bookingResult.allotmentLetter.content.legalTerms || []).slice(0, 3).map((t, i) => (
                        <li key={i} className="text-[11px] text-slate-500 dark:text-stone-400 flex gap-2 leading-relaxed">
                          <span className="text-slate-600 dark:text-stone-500 font-bold">•</span>
                          <span className="line-clamp-2">{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        {!submitted && (
          <div className="px-5 py-4 border-t border-slate-205 dark:border-stone-800 flex gap-3 flex-shrink-0 bg-slate-50 dark:bg-stone-850/50">
            {step > 0 ? (
              <button 
                onClick={() => setStep((s) => s - 1)} 
                className="btn-secondary text-xs font-bold py-2.5 flex-1"
              >
                ← Back
              </button>
            ) : (
              <button 
                onClick={handleDiscard} 
                className="btn-secondary text-xs font-bold py-2.5 flex-1"
              >
                Discard Lock
              </button>
            )}
            {step < 2 ? (
              <button 
                onClick={handleNext} 
                className="btn-primary text-xs font-bold py-2.5 flex-1"
              >
                Next Step →
              </button>
            ) : (
              <button
                id="booking-submit-btn"
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary text-xs font-bold py-2.5 flex-1 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white dark:border-stone-900 border-t-transparent rounded-full animate-spin" />
                ) : '🔒 Confirm & Block Unit'}
              </button>
            )}
          </div>
        )}
        {submitted && (
          <div className="px-5 py-4 border-t border-slate-205 dark:border-stone-800 flex-shrink-0 bg-slate-50 dark:bg-stone-850/50">
            <button onClick={closeBookingDrawer} className="btn-primary text-xs font-bold py-2.5 w-full">
              Done & Return to Portfolio
            </button>
          </div>
        )}
      </div>
      <PaymentGateway
        isOpen={gatewayOpen}
        paymentDetails={{
          amount: Math.round((unit?.pricing?.basePrice || 9800000) * 0.02),
          label: 'Apartment Booking Deposit (2%)',
          description: `Locking fee for Unit ${unit?.unitNumber || ''} · Tower ${unit?.tower || ''}`
        }}
        onSuccess={handlePaymentSuccess}
        onCancel={() => setGatewayOpen(false)}
      />
    </>
  );
}
