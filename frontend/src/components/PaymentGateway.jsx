import { useState, useEffect } from 'react';

/**
 * Payment Gateway Modal — Mimics Stripe/Razorpay Premium Interface
 * Features: Card Inputs, UPI QR Code, Netbanking Selector, and real-time processing simulation.
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Is modal visible
 * @param {Object} props.paymentDetails - Details of purchase { amount, label, description, metadata }
 * @param {function} props.onSuccess - Success callback
 * @param {function} props.onCancel - Cancel/Close callback
 */
export default function PaymentGateway({ isOpen, paymentDetails, onSuccess, onCancel }) {
  const [activeTab, setActiveTab] = useState('card'); // 'card', 'upi', 'netbanking'
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [countdown, setCountdown] = useState(300); // 5 minutes for QR code

  useEffect(() => {
    if (activeTab === 'upi' && isOpen) {
      const timer = setInterval(() => {
        setCountdown((c) => (c > 0 ? c - 1 : 300));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [activeTab, isOpen]);

  if (!isOpen) return null;

  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
    setCardNumber(formatted.slice(0, 19));
  };

  const handleExpiryChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    let formatted = value;
    if (value.length > 2) {
      formatted = `${value.slice(0, 2)}/${value.slice(2, 4)}`;
    }
    setCardExpiry(formatted.slice(0, 5));
  };

  const handlePay = () => {
    setProcessing(true);
    // Simulate real gateway verification and payment processing
    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onSuccess();
      }, 2000);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md" onClick={onCancel} />
      
      {/* Gateway Card */}
      <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl z-10 text-left flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-50 dark:bg-slate-950/40 p-6 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-black tracking-tighter">
              B
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">SECURE CHECKOUT</p>
              <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">BuildFlow AI Gateway</h3>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onCancel}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all"
          >
            ✕
          </button>
        </div>

        {processing ? (
          /* Processing Screen */
          <div className="p-10 flex flex-col items-center justify-center space-y-6 flex-1">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full" />
              <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Processing Transaction</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Verifying secure payment authorization logs with bank servers...</p>
            </div>
          </div>
        ) : success ? (
          /* Success Screen */
          <div className="p-10 flex flex-col items-center justify-center space-y-6 flex-1 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-350 dark:border-emerald-800 flex items-center justify-center text-2xl">
              ✅
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Transaction Authorized</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Funds secured successfully. Updating ledger logs and database records...</p>
            </div>
          </div>
        ) : (
          /* Payment Forms */
          <>
            {/* Amount details banner */}
            <div className="bg-blue-50/50 dark:bg-blue-950/20 p-5 border-b border-blue-100 dark:border-blue-900/10 flex items-center justify-between text-left">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{paymentDetails?.label || 'Allotment Booking Fee'}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">{paymentDetails?.description || 'BuildFlow Secure Escrow Account'}</p>
              </div>
              <p className="text-lg font-black text-blue-650 dark:text-blue-400 font-display">
                ₹{paymentDetails?.amount?.toLocaleString('en-IN')}
              </p>
            </div>

            {/* Selector Tabs */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-950 border-b border-slate-205 dark:border-slate-850">
              {[
                { id: 'card', label: '💳 Cards', desc: 'Visa / MC / RuPay' },
                { id: 'upi', label: '📱 UPI', desc: 'Scan / ID' },
                { id: 'netbanking', label: '🏦 Net', desc: 'Netbanking' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Scrollable Container */}
            <div className="p-6 flex-1 overflow-y-auto space-y-4">
              
              {/* CARD FORM */}
              {activeTab === 'card' && (
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Card Holder Name</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Arjun Mehta"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white text-xs rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Card Number</label>
                    <input 
                      type="text"
                      required
                      placeholder="4111 2222 3333 4444"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white text-xs rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Expiry Date</label>
                      <input 
                        type="text"
                        required
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={handleExpiryChange}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white text-xs rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">CVV</label>
                      <input 
                        type="password"
                        required
                        maxLength={3}
                        placeholder="•••"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white text-xs rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* UPI FORM */}
              {activeTab === 'upi' && (
                <div className="space-y-5 text-center flex flex-col items-center">
                  {/* Dynamic QR Code */}
                  <div className="bg-white border border-slate-200 p-4 rounded-2xl w-40 h-40 flex items-center justify-center shadow-xs">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900">
                      {/* Simple SVG QR Code mockup */}
                      <rect x="10" y="10" width="20" height="20" fill="currentColor" />
                      <rect x="13" y="13" width="14" height="14" fill="white" />
                      <rect x="15" y="15" width="10" height="10" fill="currentColor" />

                      <rect x="70" y="10" width="20" height="20" fill="currentColor" />
                      <rect x="73" y="13" width="14" height="14" fill="white" />
                      <rect x="75" y="15" width="10" height="10" fill="currentColor" />

                      <rect x="10" y="70" width="20" height="20" fill="currentColor" />
                      <rect x="13" y="73" width="14" height="14" fill="white" />
                      <rect x="15" y="75" width="10" height="10" fill="currentColor" />

                      {/* Random QR clusters */}
                      <rect x="40" y="15" width="10" height="5" fill="currentColor" />
                      <rect x="45" y="25" width="15" height="10" fill="currentColor" />
                      <rect x="35" y="45" width="20" height="20" fill="currentColor" />
                      <rect x="65" y="45" width="15" height="5" fill="currentColor" />
                      <rect x="75" y="55" width="10" height="15" fill="currentColor" />
                      <rect x="45" y="70" width="5" height="15" fill="currentColor" />
                      <rect x="55" y="80" width="25" height="5" fill="currentColor" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scan QR using GPay / PhonePe / BHIM</p>
                    <p className="text-xs font-semibold text-blue-650 dark:text-blue-400">QR active for: <span className="font-bold font-mono">{formatCountdown(countdown)}</span></p>
                  </div>

                  <div className="w-full border-t border-slate-100 dark:border-slate-800/80 pt-4">
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Or enter UPI VPA Address</p>
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        placeholder="e.g. arjun@okaxis"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-850 dark:text-white text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* NETBANKING SELECTOR */}
              {activeTab === 'netbanking' && (
                <div className="space-y-4">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Select Bank Account</p>
                  <div className="grid grid-cols-2 gap-3.5">
                    {[
                      { name: 'SBI', icon: '🔵' },
                      { name: 'HDFC', icon: '🔷' },
                      { name: 'ICICI', icon: '🔶' },
                      { name: 'Axis Bank', icon: '🔺' },
                      { name: 'KOTAK', icon: '🟥' },
                      { name: 'Yes Bank', icon: '⭐' }
                    ].map((bank) => (
                      <button
                        key={bank.name}
                        type="button"
                        onClick={handlePay}
                        className="p-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-850 rounded-xl flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-semibold transition-all text-left"
                      >
                        <span className="text-sm">{bank.icon}</span>
                        <span>{bank.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Action Button */}
            {activeTab !== 'netbanking' && (
              <div className="p-6 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/40">
                <button
                  type="button"
                  onClick={handlePay}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-widest transition-all shadow-md shadow-blue-500/20"
                >
                  Authorize Payment
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
