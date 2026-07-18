import { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useProjects } from '../hooks/useProjects';
import { formatCurrencyShort } from '../utils/formatters';
import BookingForm from '../components/BookingForm';

const PROJECT_PHOTOS = {
  'proj-001': 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
  'proj-002': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
  'proj-003': 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
};

const PROJECT_2D_LAYOUTS = {
  'proj-001': 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80',
  'proj-002': 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
  'proj-003': 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80',
};

// SVG Blueprints matching Noida (proj-001), Gurugram (proj-002), and Mumbai (proj-003)
const getRealTimeBlueprint = (id) => {
  if (id === 'proj-001') {
    return (
      <svg viewBox="0 0 120 80" className="w-full h-full text-blue-500 dark:text-blue-400 stroke-current" fill="none" strokeWidth="0.8">
        {/* Noida comfort line blueprint */}
        <rect x="5" y="5" width="110" height="70" rx="2" />
        <line x1="35" y1="5" x2="35" y2="75" />
        <line x1="75" y1="5" x2="75" y2="75" />
        <line x1="35" y1="40" x2="115" y2="40" />
        <circle cx="20" cy="22" r="6" strokeDasharray="1.5 1.5" />
        <circle cx="20" cy="58" r="6" strokeDasharray="1.5 1.5" />
        <rect x="45" y="12" width="20" height="18" />
        <rect x="85" y="12" width="20" height="18" />
        <rect x="45" y="48" width="20" height="18" />
        <rect x="85" y="48" width="20" height="18" />
        <text x="10" y="43" className="fill-current stroke-none text-[6px] font-sans font-bold">LOBBY</text>
        <text x="50" y="23" className="fill-current stroke-none text-[6px] font-sans font-bold">BED-1</text>
        <text x="90" y="23" className="fill-current stroke-none text-[6px] font-sans font-bold">LIVING</text>
      </svg>
    );
  } else if (id === 'proj-002') {
    return (
      <svg viewBox="0 0 120 80" className="w-full h-full text-emerald-500 dark:text-emerald-400 stroke-current" fill="none" strokeWidth="0.8">
        {/* Gurugram luxury green line blueprint */}
        <rect x="10" y="10" width="100" height="60" rx="3" />
        <line x1="60" y1="10" x2="60" y2="70" />
        <line x1="10" y1="40" x2="110" y2="40" />
        <circle cx="35" cy="25" r="8" />
        <circle cx="85" cy="25" r="8" />
        <rect x="20" y="48" width="30" height="14" />
        <rect x="70" y="48" width="30" height="14" />
        <text x="25" y="28" className="fill-current stroke-none text-[6px] font-sans font-bold">POOL</text>
        <text x="75" y="28" className="fill-current stroke-none text-[6px] font-sans font-bold">DECK</text>
        <text x="28" y="57" className="fill-current stroke-none text-[5px] font-sans font-bold">SUITE-1</text>
        <text x="78" y="57" className="fill-current stroke-none text-[5px] font-sans font-bold">SUITE-2</text>
      </svg>
    );
  } else {
    return (
      <svg viewBox="0 0 120 80" className="w-full h-full text-amber-500 dark:text-amber-400 stroke-current" fill="none" strokeWidth="0.8">
        {/* Mumbai sky mansion blueprint */}
        <rect x="5" y="5" width="110" height="70" rx="1" />
        <line x1="55" y1="5" x2="55" y2="75" />
        <line x1="5" y1="35" x2="115" y2="35" />
        <line x1="5" y1="55" x2="115" y2="55" />
        <circle cx="30" cy="20" r="10" />
        <circle cx="85" cy="20" r="10" />
        <rect x="15" y="40" width="30" height="10" />
        <rect x="75" y="40" width="30" height="10" />
        <text x="25" y="22" className="fill-current stroke-none text-[5px] font-sans font-bold">MASTER</text>
        <text x="85" y="22" className="fill-current stroke-none text-[5px] font-sans font-bold">TERRACE</text>
        <text x="20" y="47" className="fill-current stroke-none text-[4px] font-sans font-bold">LOUNGE</text>
      </svg>
    );
  }
};

export default function Deals() {
  const { projects, loading } = useProjects();
  const { openBookingDrawer, theme, toggleTheme, pushNotification, currentUser } = useApp();
  const [selectedId, setSelectedId] = useState('proj-001');
  const [showBlueprintModal, setShowBlueprintModal] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const [negUnits, setNegUnits] = useState(1);
  const [negDownpayment, setNegDownpayment] = useState(20);
  const [negDiscount, setNegDiscount] = useState(5);
  const [negStatus, setNegStatus] = useState(null);
  const [negMessage, setNegMessage] = useState('');
  const [negOutcome, setNegOutcome] = useState('');
  const [negCounterTerms, setNegCounterTerms] = useState(null);

  useEffect(() => {
    setCarouselIndex(0);
    setNegStatus(null);
    setNegCounterTerms(null);
  }, [selectedId]);
  
  const handleNegSubmit = () => {
    setNegStatus('analyzing');
    setNegMessage('CasaAI Pricing Controller is analyzing inventory saturation, margin safety index, and funding velocity...');
    setNegCounterTerms(null);

    setTimeout(() => {
      const pId = selectedProject?._id || 'proj-001';
      let maxAllowedDiscount = 10;
      if (pId === 'proj-003') {
        maxAllowedDiscount = 6;
      } else if (pId === 'proj-002') {
        maxAllowedDiscount = 11;
      } else {
        maxAllowedDiscount = 16;
      }

      let headroom = 0;
      if (negUnits >= 3) headroom += 3;
      else if (negUnits >= 2) headroom += 1.5;

      if (negDownpayment >= 40) headroom += 3;
      else if (negDownpayment >= 30) headroom += 1.5;
      else if (negDownpayment < 15) headroom -= 3;

      const finalMaxDiscount = maxAllowedDiscount + headroom;

      if (negDiscount <= finalMaxDiscount) {
        setNegOutcome('approved');
        setNegMessage(`🎉 Offer Approved! CasaAI has locked the terms. A margin-safe yield of ${finalMaxDiscount.toFixed(1)}% headroom is maintained. Select "Book Allotment" to lock this deal.`);
      } else if (negDiscount > finalMaxDiscount + 5) {
        setNegOutcome('rejected');
        setNegMessage(`❌ Offer Rejected. The requested discount of ${negDiscount}% exceeds builder regulatory margin floors. Please propose more conservative terms.`);
      } else {
        setNegOutcome('counter');
        const counterDiscount = Math.floor(finalMaxDiscount);
        const counterDownpayment = Math.min(negDownpayment + 15, 50);
        setNegCounterTerms({
          discount: counterDiscount,
          downpayment: counterDownpayment,
        });
        setNegMessage(`⚖️ AI Counter-Offer: We cannot support ${negDiscount}% discount under current parameters. However, our pricing swarm has approved a counter of <strong>${counterDiscount}% discount</strong> at your current downpayment, OR <strong>${negDiscount}% discount</strong> if you increase your downpayment to <strong>${counterDownpayment}%</strong>.`);
      }
      setNegStatus('done');
    }, 1500);
  };
  
  // Viewing schedule form state
  const [showViewingModal, setShowViewingModal] = useState(false);
  const [viewingForm, setViewingForm] = useState({
    userName: '',
    userEmail: '',
    userPhone: '',
    preferredDate: '',
    preferredSlot: 'Morning (10:00 AM - 1:00 PM)',
  });
  const [submittingViewing, setSubmittingViewing] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setViewingForm(f => ({
        ...f,
        userName: currentUser.name || '',
        userEmail: currentUser.email || '',
        userPhone: currentUser.phone || '',
      }));
    }
  }, [currentUser]);

  const selectedProject = projects.find(p => p._id === selectedId) || projects[0] || null;

  const getMetricDetails = (id) => {
    if (id === 'proj-001') {
      return { completion: 'Q4 2026', plotSize: '0.12 HA', area: '450 M²', type: 'Horizon Comfort Line' };
    } else if (id === 'proj-002') {
      return { completion: 'Ready to Move', plotSize: '0.18 HA', area: '620 M²', type: 'Serenity Green Villa' };
    } else {
      return { completion: 'Q2 2028', plotSize: '0.35 HA', area: '1,150 M²', type: 'Pinnacle Sky Mansion' };
    }
  };

  const metrics = selectedProject ? getMetricDetails(selectedProject._id) : { completion: 'Q4 2026', plotSize: '0.12 HA', area: '450 M²', type: 'Horizon Comfort Line' };
  
  const getProjectImages = (id) => {
    const defaultImages = [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80'
    ];
    if (id === 'proj-002') {
      return [
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=80'
      ];
    }
    if (id === 'proj-003') {
      return [
        'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1000&q=80'
      ];
    }
    return defaultImages;
  };

  const projectImages = getProjectImages(selectedId);
  const photo = projectImages[carouselIndex] || projectImages[0];

  const handleBookAllotment = () => {
    if (!selectedProject) return;
    const defaultUnit = {
      _id: `unit-${selectedProject._id}-f3-u2`,
      projectId: selectedProject._id,
      unitNumber: 'A302',
      floor: 3,
      tower: 'A',
      bhkType: selectedProject._id === 'proj-001' ? '3BHK' : selectedProject._id === 'proj-002' ? '2BHK' : '4BHK',
      carpetArea: selectedProject._id === 'proj-001' ? 1350 : selectedProject._id === 'proj-002' ? 950 : 1850,
      availability: 'Available',
      pricing: {
        basePrice: selectedProject._id === 'proj-001' ? 9800000 : selectedProject._id === 'proj-002' ? 6500000 : 14500000,
        gst: 5,
        parkingCharges: 150000,
        maintenanceDeposit: 50000,
      }
    };
    openBookingDrawer(defaultUnit, selectedProject);
  };

  const handleViewingSubmit = async (e) => {
    e.preventDefault();
    if (!viewingForm.userName || !viewingForm.userEmail || !viewingForm.userPhone || !viewingForm.preferredDate) {
      alert('Please fill out all viewing schedule details.');
      return;
    }
    setSubmittingViewing(true);

    try {
      const response = await fetch('/api/v1/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id || 'guest-viewing-001',
          userName: viewingForm.userName,
          userEmail: viewingForm.userEmail,
          userPhone: viewingForm.userPhone,
          bookingType: 'TourViewing',
          projectId: selectedProject?._id,
          slotDate: viewingForm.preferredDate,
          slotTime: viewingForm.preferredSlot,
          tokenAmount: 0
        })
      });
      const data = await response.json();
      if (data.success) {
        pushNotification({
          type: 'success',
          title: '📅 Tour Scheduled Successfully',
          message: `Your on-site viewing for ${selectedProject?.name} has been secured. Ref: ${data.data?.bookingRef || 'AE-VIEW'}`,
          duration: 8000
        });
        setShowViewingModal(false);
      } else {
        alert(`Failed: ${data.message}`);
      }
    } catch {
      // Mock fallback
      pushNotification({
        type: 'success',
        title: '📅 Tour Scheduled (Mock mode)',
        message: `Your tour viewing for ${selectedProject?.name} is provisionally secured.`,
        duration: 8000
      });
      setShowViewingModal(false);
    } finally {
      setSubmittingViewing(false);
    }
  };

  return (
    <div className="pt-16 min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-350 flex flex-col">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Property details selector */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-6 text-left">
            
            {/* Reduced/Clean Mini-Header */}
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span>Deals Room · Live Projects</span>
            </div>
 
            {/* Title */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-stone-400 mb-1 font-mono">SELECT TOWER PORTFOLIO</h2>
              <p className="text-xs text-slate-650 dark:text-stone-300 font-semibold">Click any collection block to preview structural blueprints and rates.</p>
            </div>
 
            {/* List items (Uniform sizes and high-contrast styling) */}
            <div className="space-y-2.5">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-24 bg-slate-105 dark:bg-stone-850 animate-pulse rounded-xl" />
                  ))}
                </div>
              ) : (
                projects.map((p) => {
                  const isActive = p._id === selectedId;
                  const itemMetrics = getMetricDetails(p._id);
                  return (
                    <button
                      key={p._id}
                      onClick={() => setSelectedId(p._id)}
                      className={`w-full text-left p-5 rounded-2xl border transition-all flex items-center justify-between h-24 min-h-[96px] ${
                        isActive
                          ? 'bg-slate-900 text-white dark:bg-slate-800 dark:text-white border-slate-900 dark:border-slate-700 shadow-lg ring-1 ring-blue-500/20'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 hover:border-slate-350 dark:hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <h3 className={`text-lg font-extrabold uppercase font-display tracking-wide leading-tight ${isActive ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                          {p.name?.replace('Aura', 'Casa')}
                        </h3>
                        <p className={`text-[10px] uppercase font-bold tracking-wider mt-0.5 ${isActive ? 'text-slate-300 dark:text-slate-400' : 'text-slate-400 dark:text-stone-500'}`}>
                          {p.location?.city} · {p.status}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`text-lg font-black font-display tracking-tight ${isActive ? 'text-white' : 'text-slate-905 dark:text-white'}`}>
                          {itemMetrics.area}
                        </span>
                        <p className={`text-[9px] font-bold uppercase tracking-wider mt-0.5 ${isActive ? 'text-slate-300 dark:text-slate-400' : 'text-slate-550'}`}>
                          Starting {formatCurrencyShort(p.priceRange?.min)}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
          </div>
        </div>

          {/* Action Footer */}
          {selectedProject && (
            <div className="pt-8 border-t border-slate-100 dark:border-stone-800 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between text-left">
              <div>
                <p className="text-[10px] font-bold text-slate-500 dark:text-stone-400 uppercase tracking-widest">Selected Estate Location</p>
                <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">{selectedProject.location?.address}</p>
              </div>
              <button
                onClick={handleBookAllotment}
                className="btn-primary text-xs font-bold uppercase tracking-wider py-3 px-6 w-full sm:w-auto"
              >
                Book Allotment
              </button>
            </div>
          )}

          {/* AI B2B Negotiation Desk */}
          {selectedProject && (
            <div className="mt-8 border-t border-slate-200 dark:border-stone-800 pt-6 text-left">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base">✨</span>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">AI B2B Negotiation Desk</h4>
              </div>
              
              <div className="bg-gradient-to-r from-slate-900 to-indigo-950 dark:from-stone-900 dark:to-indigo-950 border border-indigo-900/35 rounded-3xl p-5 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03] bg-grid" />
                
                <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Units Input */}
                  <div>
                    <label className="text-[9px] font-bold text-indigo-200 uppercase tracking-widest block mb-1">Wholesale Units</label>
                    <div className="flex items-center gap-1.5 mt-1">
                      {[1, 2, 3, 4, 5].map(u => (
                        <button
                          key={u}
                          type="button"
                          onClick={() => setNegUnits(u)}
                          className={`w-7 h-7 rounded-lg text-xs font-black transition-all cursor-pointer ${
                            negUnits === u ? 'bg-indigo-650 text-white shadow-md' : 'bg-white/10 text-indigo-200 hover:bg-white/20'
                          }`}
                        >
                          {u}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Downpayment Slider */}
                  <div>
                    <label className="text-[9px] font-bold text-indigo-200 uppercase tracking-widest block mb-1">Downpayment — {negDownpayment}%</label>
                    <input
                      type="range"
                      min={10}
                      max={50}
                      step={5}
                      value={negDownpayment}
                      onChange={(e) => setNegDownpayment(Number(e.target.value))}
                      className="w-full accent-indigo-500 bg-white/10 mt-2"
                    />
                  </div>

                  {/* Target Discount Slider */}
                  <div>
                    <label className="text-[9px] font-bold text-indigo-200 uppercase tracking-widest block mb-1">Requested Discount — {negDiscount}%</label>
                    <input
                      type="range"
                      min={0}
                      max={20}
                      step={1}
                      value={negDiscount}
                      onChange={(e) => setNegDiscount(Number(e.target.value))}
                      className="w-full accent-indigo-500 bg-white/10 mt-2"
                    />
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-[9px] text-indigo-200 font-semibold uppercase">Pricing controlled under RERA margin floors.</p>
                  <button
                    type="button"
                    onClick={handleNegSubmit}
                    disabled={negStatus === 'analyzing'}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl border-none shadow-md shadow-indigo-950/30 transition-all cursor-pointer"
                  >
                    {negStatus === 'analyzing' ? 'Evaluating...' : '✨ Submit Offer'}
                  </button>
                </div>

                {/* Outcome Display */}
                {negStatus && (
                  <div className="mt-4 pt-4 border-t border-white/10 animate-fade-in relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs">🤖</span>
                      <p className="text-[9px] font-black text-indigo-200 uppercase tracking-widest">CasaAI pricing response</p>
                      
                      {negStatus === 'done' && (
                        <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded ml-auto ${
                          negOutcome === 'approved' ? 'bg-emerald-500 text-white' :
                          negOutcome === 'counter' ? 'bg-amber-500 text-stone-950' :
                          'bg-rose-500 text-white'
                        }`}>
                          {negOutcome}
                        </span>
                      )}
                    </div>

                    <p 
                      className="text-xs text-indigo-100 font-semibold leading-relaxed" 
                      dangerouslySetInnerHTML={{ __html: negMessage }}
                    />

                    {negOutcome === 'counter' && negCounterTerms && (
                      <div className="mt-3 flex gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => {
                            setNegDiscount(negCounterTerms.discount);
                            pushNotification({ type: 'info', title: 'Counter Accepted', message: `Adjusted discount to ${negCounterTerms.discount}%.` });
                          }}
                          className="bg-white/10 hover:bg-white/20 text-white text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          Accept {negCounterTerms.discount}% Discount
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setNegDownpayment(negCounterTerms.downpayment);
                            pushNotification({ type: 'info', title: 'Counter Accepted', message: `Adjusted downpayment to ${negCounterTerms.downpayment}%.` });
                          }}
                          className="bg-white/10 hover:bg-white/20 text-white text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          Increase Downpayment to {negCounterTerms.downpayment}%
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Right Side: Split view photo and metrics */}
        <div className="lg:col-span-6 relative min-h-[50vh] lg:min-h-0 flex flex-col justify-between bg-cover bg-center transition-all duration-300 rounded-3xl overflow-hidden"
          style={{ backgroundImage: `url('${photo}')` }}
        >
          {/* Top subtle overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />

          {/* Header Action Button (Book Viewing) & Switcher */}
          <div className="relative z-10 p-6 flex items-center justify-between gap-4">
            {/* View Mode Carousel Controls */}
            <div className="flex bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-full p-1 shadow-md gap-1 items-center">
              <button
                type="button"
                onClick={() => setCarouselIndex(prev => (prev === 0 ? projectImages.length - 1 : prev - 1))}
                className="w-7 h-7 flex items-center justify-center rounded-full text-white hover:bg-slate-800 transition-all font-bold text-xs"
              >
                ←
              </button>
              <span className="text-[10px] text-white font-mono font-black px-2.5 whitespace-nowrap">
                VIEW {carouselIndex + 1} / {projectImages.length}
              </span>
              <button
                type="button"
                onClick={() => setCarouselIndex(prev => (prev === projectImages.length - 1 ? 0 : prev + 1))}
                className="w-7 h-7 flex items-center justify-center rounded-full text-white hover:bg-slate-800 transition-all font-bold text-xs"
              >
                →
              </button>
            </div>

            <button 
              onClick={() => setShowViewingModal(true)}
              className="bg-white/95 text-stone-900 text-[10px] font-bold uppercase tracking-widest px-4 py-2.5 rounded-full shadow-md border border-slate-205 hover:bg-white transition-all"
            >
              Book a Viewing 📅
            </button>
          </div>

          {/* Metrics card block overlapping at the bottom */}
          <div className="relative z-10 p-6 sm:p-10 space-y-4">
            
            {/* Split Metrics Card */}
            <div className="bg-[#f4f4f3]/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-300/60 dark:border-slate-800 rounded-2xl p-6 grid grid-cols-3 gap-3 shadow-lg max-w-md text-left">
              <div>
                <p className="text-slate-500 dark:text-stone-400 text-[9px] font-bold uppercase tracking-wider">Completion</p>
                <p className="text-lg font-black text-slate-900 dark:text-white font-display mt-0.5">{metrics.completion}</p>
              </div>
              <div className="border-x border-slate-300/40 dark:border-slate-800 px-3">
                <p className="text-slate-500 dark:text-stone-400 text-[9px] font-bold uppercase tracking-wider">Plot Size</p>
                <p className="text-lg font-black text-slate-900 dark:text-white font-display mt-0.5">{metrics.plotSize}</p>
              </div>
              <div className="pl-3">
                <p className="text-slate-500 dark:text-stone-400 text-[9px] font-bold uppercase tracking-wider">House Area</p>
                <p className="text-lg font-black text-slate-900 dark:text-white font-display mt-0.5">{metrics.area}</p>
              </div>
            </div>

            {/* Mini blueprint snippet card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg max-w-md flex items-center justify-between">
              <div className="text-left">
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">✓ RERA Sanction Approved</p>
                <p className="text-xs text-white font-bold mt-0.5">{metrics.type}</p>
              </div>
              <button 
                onClick={() => setShowBlueprintModal(true)}
                className="text-[9px] font-bold uppercase text-white bg-stone-800 hover:bg-stone-700 px-3 py-1.5 rounded-lg border border-stone-700"
              >
                Blueprint Map
              </button>
            </div>

          </div>

          {/* Theme switcher capsule (Bottom Right) */}
          <div className="absolute bottom-6 right-6 z-20 flex bg-white/95 dark:bg-stone-900 border border-slate-205 dark:border-stone-800 rounded-full p-1 shadow-md">
            <button
              onClick={() => { if (theme !== 'light') toggleTheme(); }}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all ${
                theme === 'light' ? 'bg-slate-900 text-white' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              ☀️
            </button>
            <button
              onClick={() => { if (theme !== 'dark') toggleTheme(); }}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all ${
                theme === 'dark' ? 'bg-white text-stone-950' : 'text-slate-500 hover:text-slate-905'
              }`}
            >
              🌙
            </button>
          </div>

        </div>

      </div>

      {/* 📐 Pop-up Blueprint Modal (Real-Time Blueprint Viewer) */}
      {showBlueprintModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm" onClick={() => setShowBlueprintModal(false)} />
          <div className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl z-10 space-y-4 text-left animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase tracking-widest">RERA Map Active</span>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">{selectedProject?.name} Blueprint</h3>
              </div>
              <button 
                onClick={() => setShowBlueprintModal(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="bg-black border border-slate-800 rounded-2xl p-6 aspect-[4/3] flex items-center justify-center relative">
              <div className="absolute inset-0 bg-grid opacity-5" />
              {selectedProject && getRealTimeBlueprint(selectedProject._id)}
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => alert(`Downloading blueprint deed AL-${selectedProject?._id}.pdf`)}
                className="flex-1 text-center bg-stone-100 hover:bg-white text-stone-900 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all"
              >
                Download Blueprint Deed
              </button>
              <button 
                onClick={() => setShowBlueprintModal(false)}
                className="flex-1 text-center bg-stone-800 hover:bg-stone-700 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all border border-stone-700"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📅 Book a Viewing Tour Modal */}
      {showViewingModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm" onClick={() => setShowViewingModal(false)} />
          <form onSubmit={handleViewingSubmit} className="relative bg-white dark:bg-stone-900 border border-slate-205 dark:border-stone-800 rounded-3xl w-full max-w-md p-6 shadow-2xl z-10 space-y-4 text-left animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-stone-850 pb-3">
              <div>
                <span className="text-[10px] text-blue-650 dark:text-blue-400 font-bold uppercase tracking-widest">SCHEDULE ONSITE TOUR</span>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Book a Viewing</h3>
              </div>
              <button 
                type="button"
                onClick={() => setShowViewingModal(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-stone-800 text-slate-400 hover:text-slate-800 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-stone-400 uppercase mb-1">Target Estate</label>
                <input 
                  type="text" 
                  disabled
                  value={selectedProject?.name || 'Casa Estate'}
                  className="w-full bg-slate-50 dark:bg-stone-800 border border-slate-200 dark:border-stone-750 text-slate-800 dark:text-stone-200 text-xs rounded-xl px-4 py-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-stone-400 uppercase mb-1">Preferred Date</label>
                  <input 
                    type="date"
                    required
                    value={viewingForm.preferredDate}
                    onChange={e => setViewingForm(f => ({ ...f, preferredDate: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-stone-800 border border-slate-200 dark:border-stone-750 text-slate-850 dark:text-stone-200 text-xs rounded-xl px-4 py-2.5 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-stone-400 uppercase mb-1">Time Slot</label>
                  <select
                    value={viewingForm.preferredSlot}
                    onChange={e => setViewingForm(f => ({ ...f, preferredSlot: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-stone-800 border border-slate-200 dark:border-stone-750 text-slate-855 dark:text-stone-200 text-xs rounded-xl px-4 py-2.5 focus:outline-none"
                  >
                    <option>Morning (10:00 AM - 1:00 PM)</option>
                    <option>Afternoon (1:00 PM - 4:00 PM)</option>
                    <option>Evening (4:00 PM - 7:00 PM)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-stone-400 uppercase mb-1">Full Legal Name</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Arjun Mehta"
                  value={viewingForm.userName}
                  onChange={e => setViewingForm(f => ({ ...f, userName: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-stone-800 border border-slate-200 dark:border-stone-750 text-slate-900 dark:text-white text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-slate-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-stone-400 uppercase mb-1">Email ID</label>
                  <input 
                    type="email"
                    required
                    placeholder="e.g. arjun@domain.com"
                    value={viewingForm.userEmail}
                    onChange={e => setViewingForm(f => ({ ...f, userEmail: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-stone-800 border border-slate-200 dark:border-stone-750 text-slate-900 dark:text-white text-xs rounded-xl px-4 py-2.5 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-stone-400 uppercase mb-1">Contact Phone</label>
                  <input 
                    type="tel"
                    required
                    placeholder="e.g. +91 9999988888"
                    value={viewingForm.userPhone}
                    onChange={e => setViewingForm(f => ({ ...f, userPhone: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-stone-800 border border-slate-200 dark:border-stone-750 text-slate-900 dark:text-white text-xs rounded-xl px-4 py-2.5 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-stone-850 flex gap-3">
              <button 
                type="button"
                onClick={() => setShowViewingModal(false)}
                className="flex-1 btn-secondary text-xs font-bold py-2.5 rounded-xl"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={submittingViewing}
                className="flex-1 btn-primary text-xs font-bold py-2.5 rounded-xl flex items-center justify-center"
              >
                {submittingViewing ? (
                  <span className="w-4 h-4 border-2 border-white dark:border-stone-900 border-t-transparent rounded-full animate-spin" />
                ) : 'Schedule Tour'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Global Booking Drawer */}
      <BookingForm />
    </div>
  );
}
