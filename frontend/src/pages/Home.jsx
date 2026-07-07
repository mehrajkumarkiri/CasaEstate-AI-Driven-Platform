import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BookingForm from '../components/BookingForm';
import { useApp } from '../context/AppContext';

export default function Home() {
  const { theme, toggleTheme } = useApp();
  const navigate = useNavigate();

  // Carousel data mock matching the reference image layout
  const carouselItems = [
    {
      completion: 'Q4 2026',
      plotSize: '0.12 HA',
      area: '450 M²',
      type: 'House Type C',
      line: 'Horizon Comfort Line',
      photo1: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=120&q=80',
      photo2: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=120&q=80'
    },
    {
      completion: 'Ready to Move',
      plotSize: '0.18 HA',
      area: '620 M²',
      type: 'House Type A',
      line: 'Serenity Green Villa',
      photo1: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=120&q=80',
      photo2: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=120&q=80'
    },
    {
      completion: 'Q2 2028',
      plotSize: '0.35 HA',
      area: '1,150 M²',
      type: 'House Type S',
      line: 'Pinnacle Sky Mansion',
      photo1: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=120&q=80',
      photo2: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=120&q=80'
    }
  ];

  const getBlueprintDrawing = (index) => {
    if (index === 0) {
      return (
        <>
          <rect x="10" y="10" width="100" height="60" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <line x1="40" y1="10" x2="40" y2="70" stroke="currentColor" strokeWidth="0.5" />
          <line x1="75" y1="10" x2="75" y2="70" stroke="currentColor" strokeWidth="0.5" />
          <line x1="10" y1="35" x2="110" y2="35" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="25" cy="22" r="5" fill="none" stroke="currentColor" strokeWidth="0.3" strokeDasharray="1 1" />
          <rect x="45" y="15" width="22" height="15" fill="none" stroke="currentColor" strokeWidth="0.3" />
          <rect x="48" y="18" width="16" height="9" fill="none" stroke="currentColor" strokeWidth="0.2" />
          <rect x="85" y="45" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="0.3" />
          <circle cx="94" cy="54" r="3" fill="none" stroke="currentColor" strokeWidth="0.3" />
        </>
      );
    } else if (index === 1) {
      return (
        <>
          <rect x="15" y="15" width="90" height="50" fill="none" stroke="currentColor" strokeWidth="0.5" rx="3" />
          <line x1="60" y1="15" x2="60" y2="65" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
          <circle cx="38" cy="40" r="12" fill="none" stroke="currentColor" strokeWidth="0.4" />
          <circle cx="38" cy="40" r="6" fill="none" stroke="currentColor" strokeWidth="0.3" />
          <rect x="70" y="25" width="25" height="30" fill="none" stroke="currentColor" strokeWidth="0.4" />
          <line x1="70" y1="40" x2="95" y2="40" stroke="currentColor" strokeWidth="0.3" />
        </>
      );
    } else {
      return (
        <>
          <rect x="20" y="10" width="80" height="60" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <line x1="20" y1="30" x2="100" y2="30" stroke="currentColor" strokeWidth="0.5" />
          <line x1="20" y1="50" x2="100" y2="50" stroke="currentColor" strokeWidth="0.5" />
          <line x1="50" y1="10" x2="50" y2="70" stroke="currentColor" strokeWidth="0.5" />
          <line x1="75" y1="10" x2="75" y2="70" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="35" cy="20" r="4" fill="none" stroke="currentColor" strokeWidth="0.3" />
          <circle cx="62" cy="40" r="4" fill="none" stroke="currentColor" strokeWidth="0.3" />
          <circle cx="87" cy="60" r="4" fill="none" stroke="currentColor" strokeWidth="0.3" />
        </>
      );
    }
  };

  const [carouselIndex, setCarouselIndex] = useState(0);
  const cur = carouselItems[carouselIndex];

  const handleNext = () => setCarouselIndex((prev) => (prev + 1) % carouselItems.length);
  const handlePrev = () => setCarouselIndex((prev) => (prev - 1 + carouselItems.length) % carouselItems.length);

  const [showEvacModal, setShowEvacModal] = useState(false);
  const [footerModal, setFooterModal] = useState({ open: false, title: '', content: '' });
  const [activeFaq, setActiveFaq] = useState(null);

  return (
    <div className="bg-[#f4f4f3] dark:bg-stone-950 text-stone-900 dark:text-white transition-colors duration-350 flex flex-col min-h-screen">
      
      {/* 🏙️ Same-to-Same Hero Section matching Reference Image */}
      <section className="relative w-full h-[72vh] md:h-[82vh] bg-cover bg-center overflow-hidden flex flex-col justify-between"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=80')` }}
      >
        {/* Sky / Top dark gradient protection overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/35 pointer-events-none" />



        {/* Center Massive Tall Condensed Title Overlay */}
        <div className="relative z-10 w-full text-center flex-1 flex items-center justify-center">
          <h1 className="text-white text-[12vw] tracking-wider select-none font-bold text-huge leading-none opacity-95">
            CASAESTATE
          </h1>
        </div>

        {/* Bottom Hero Strip: Slogan (Left) & Theme Selector (Right) */}
        <div className="relative z-10 w-full px-6 md:px-12 pb-8 flex flex-col md:flex-row items-start md:items-end justify-between gap-4 text-left">
          <p className="max-w-md text-[11px] font-bold text-white/80 leading-relaxed uppercase tracking-wider">
            A vision that transcends property and space, where unmatched craftsmanship inspires elegance and innovation to enrich lives.
          </p>

          {/* Theme switcher pill matching reference layout */}
          <div className="flex bg-white/95 dark:bg-stone-900 border border-slate-205 dark:border-stone-800 rounded-full p-1 shadow-md">
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
                theme === 'dark' ? 'bg-white text-stone-950' : 'text-slate-550 hover:text-slate-905'
              }`}
            >
              🌙
            </button>
          </div>
        </div>
      </section>

      {/* 📐 Bottom Split-Screen Module matching Reference Image */}
      <section className="w-full grid grid-cols-1 md:grid-cols-12 border-b border-slate-205 dark:border-stone-800">
        
        {/* Left Side (Black bg): Architectural floor plan drawing */}
        <div className="md:col-span-5 bg-black p-8 flex items-center justify-center relative min-h-[220px] md:min-h-0 border-r border-stone-900">
          <div className="absolute inset-0 opacity-10 bg-grid" />
          <svg viewBox="0 0 120 80" className="w-full max-w-[280px] h-auto opacity-70 text-stone-400">
            {getBlueprintDrawing(carouselIndex)}
          </svg>
        </div>

        {/* Right Side (Off-white/Stone bg): Metrics & Carousel */}
        <div className="md:col-span-7 bg-[#f4f4f3] dark:bg-stone-900 p-8 sm:p-10 flex flex-col justify-between text-left border-t md:border-t-0 border-slate-205 dark:border-stone-850">
          
          {/* Row of Metrics */}
          <div className="grid grid-cols-3 gap-4 pb-6 border-b border-slate-200 dark:border-stone-800">
            <div>
              <p className="text-[10px] text-slate-400 dark:text-stone-500 font-bold uppercase tracking-wider">Completion:</p>
              <p className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white font-display mt-1">{cur.completion}</p>
            </div>
            <div className="border-x border-slate-300/40 dark:border-stone-800 px-4">
              <p className="text-[10px] text-slate-400 dark:text-stone-500 font-bold uppercase tracking-wider">Plot Size:</p>
              <p className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white font-display mt-1">{cur.plotSize}</p>
            </div>
            <div className="pl-4">
              <p className="text-[10px] text-slate-400 dark:text-stone-500 font-bold uppercase tracking-wider">House Area:</p>
              <p className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white font-display mt-1">{cur.area}</p>
            </div>
          </div>

          {/* Carousel footer buttons and preview thumbnails */}
          <div className="pt-6 flex items-center justify-between flex-wrap gap-4">
            
            {/* Arrows */}
            <div className="flex gap-2">
              <button 
                onClick={handlePrev}
                className="w-9 h-9 rounded-full border border-slate-300 dark:border-stone-750 flex items-center justify-center text-slate-700 dark:text-stone-300 hover:bg-slate-900 hover:text-white dark:hover:bg-stone-100 dark:hover:text-stone-950 transition-all text-xs"
              >
                ←
              </button>
              <button 
                onClick={handleNext}
                className="w-9 h-9 rounded-full border border-slate-300 dark:border-stone-750 flex items-center justify-center text-slate-700 dark:text-stone-300 hover:bg-slate-900 hover:text-white dark:hover:bg-stone-100 dark:hover:text-stone-950 transition-all text-xs"
              >
                →
              </button>
            </div>

            {/* Thumbnail details */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-bold text-slate-800 dark:text-stone-200">{cur.type}</p>
                <p className="text-[10px] text-slate-400 dark:text-stone-500 font-bold uppercase tracking-wider">– {cur.line}</p>
              </div>
              <div className="flex gap-1.5">
                <img src={cur.photo1} alt="render 1" className="w-8 h-8 rounded-full border border-white dark:border-stone-800 object-cover" />
                <img src={cur.photo2} alt="render 2" className="w-8 h-8 rounded-full border border-white dark:border-stone-800 object-cover" />
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 👥 Segregated Operational Hub */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-stone-900 text-left border-b border-slate-205 dark:border-stone-800">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10 text-center sm:text-left">
            <p className="text-xs font-bold text-slate-400 dark:text-stone-500 uppercase tracking-widest mb-1">OPERATIONAL CHANNELS</p>
            <h2 className="section-title">Select Your Desired Path</h2>
            <p className="section-subtitle">Exposing clear access points tailored for buyers, active tower residents, and internal staff.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Buyers */}
            <div className="bg-slate-50 dark:bg-stone-800 border border-slate-200 dark:border-stone-750 p-6 rounded-2xl shadow-xs space-y-4">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white dark:bg-stone-100 dark:text-stone-900 flex items-center justify-center text-lg">
                💎
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">Potential Buyers & Investors</h3>
              <p className="text-xs text-slate-600 dark:text-stone-300 leading-relaxed font-semibold">
                Browse our registered premium towers, inspect carpet layouts, download government sanction files, and lock digital allotments instantly.
              </p>
              <div className="pt-2">
                <Link to="/deals" className="inline-block text-xs font-extrabold text-slate-950 dark:text-white hover:underline uppercase tracking-wider">
                  Explore Deals Room →
                </Link>
              </div>
            </div>

            {/* Residents */}
            <div className="bg-slate-50 dark:bg-stone-800 border border-slate-200 dark:border-stone-750 p-6 rounded-2xl shadow-xs space-y-4">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white dark:bg-stone-100 dark:text-stone-900 flex items-center justify-center text-lg">
                🏠
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">Active Tower Residents</h3>
              <p className="text-xs text-slate-600 dark:text-stone-300 leading-relaxed font-semibold">
                Log maintenance grievances, view upcoming society notice boards, clear monthly electricity bills, and register gate pass codes for visitors.
              </p>
              <div className="pt-2">
                <Link to="/login?role=resident" className="inline-block text-xs font-extrabold text-slate-950 dark:text-white hover:underline uppercase tracking-wider">
                  Enter Resident Space →
                </Link>
              </div>
            </div>

            {/* Legal / Admin */}
            <div className="bg-slate-50 dark:bg-stone-800 border border-slate-200 dark:border-stone-750 p-6 rounded-2xl shadow-xs space-y-4">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white dark:bg-stone-100 dark:text-stone-900 flex items-center justify-center text-lg">
                📊
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">Legal Staff & Admins</h3>
              <p className="text-xs text-slate-600 dark:text-stone-300 leading-relaxed font-semibold">
                Verify provisional unit booking allocations, clear transaction audit ledgers, review society saturation metrics, and authorize RERA files.
              </p>
              <div className="pt-2">
                <Link to="/login?role=admin" className="inline-block text-xs font-extrabold text-slate-950 dark:text-white hover:underline uppercase tracking-wider">
                  Access Admin Cockpit →
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 🚨 Emergency Tower Info Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-205 dark:border-stone-800 bg-[#f4f4f3] dark:bg-stone-950 text-left">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10 text-center sm:text-left">
            <p className="text-xs font-bold text-slate-400 dark:text-stone-500 uppercase tracking-widest mb-1">SECURITY & ASSURANCE</p>
            <h2 className="section-title">Emergency Safety Directory</h2>
            <p className="section-subtitle">Access critical numbers, fire evacuation plans, and guard marshals instantly.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-800 p-5 rounded-2xl">
              <span className="text-2xl block mb-2">🔥</span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">Fire Desk Marshal</h4>
              <p className="text-xs text-slate-500 dark:text-stone-400">Assigned Fire safety officer</p>
              <a href="tel:+91-9999988811" className="block text-xs font-bold text-blue-600 dark:text-blue-400 mt-2 hover:underline">
                +91-9999988811
              </a>
            </div>

            <div className="bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-800 p-5 rounded-2xl">
              <span className="text-2xl block mb-2">🏢</span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">Tower A Guard Desk</h4>
              <p className="text-xs text-slate-500 dark:text-stone-400">Gate security desk intercom</p>
              <p className="text-xs font-bold text-slate-800 dark:text-stone-200 mt-2">
                Extension: 101
              </p>
            </div>

            <div className="bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-800 p-5 rounded-2xl">
              <span className="text-2xl block mb-2">🏢</span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">Tower B Guard Desk</h4>
              <p className="text-xs text-slate-500 dark:text-stone-400">Gate security desk intercom</p>
              <p className="text-xs font-bold text-slate-800 dark:text-stone-200 mt-2">
                Extension: 102
              </p>
            </div>

            <div className="bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-800 p-5 rounded-2xl">
              <span className="text-2xl block mb-2">🚨</span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">Builder Safety Escalation</h4>
              <p className="text-xs text-slate-500 dark:text-stone-400">24/7 Security escalation helpline</p>
              <a href="tel:+91-120-6677889" className="block text-xs font-bold text-blue-600 dark:text-blue-400 mt-2 hover:underline">
                +91-120-6677889
              </a>
            </div>

          </div>

          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl p-4 mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="text-xs text-amber-805 dark:text-amber-400 font-semibold">
              <strong className="font-bold">⚠️ Regular Fire Safety Drill Notice:</strong> Next mock evacuation drill scheduled for Tower A & B on 12th July at 11:00 AM. Intercom tests will occur.
            </div>
            <button 
              onClick={() => setShowEvacModal(true)}
              className="text-[10px] font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 dark:text-amber-300 dark:bg-amber-900/30 px-3 py-1.5 rounded-lg border border-amber-200/50"
            >
              Show Evacuation Map
            </button>
          </div>
        </div>
      </section>

      {/* Corporate Grievance & Legal Disclosures */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-205 dark:border-stone-800 bg-white dark:bg-stone-900 text-left">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Corporate Headquarters</h3>
            <p className="text-xs text-slate-600 dark:text-stone-400 leading-relaxed font-semibold">
              CasaEstate Infrastructure Private Limited<br />
              Corporate Tower B, 14th Floor, Sector 62,<br />
              Noida, Uttar Pradesh, 201301, India.
            </p>
            <p className="text-xs text-slate-600 dark:text-stone-400 font-semibold">
              <span className="font-bold text-slate-800 dark:text-stone-300">CIN:</span> U45201UP2026PTC123456<br />
              <span className="font-bold text-slate-800 dark:text-stone-300">Support:</span> support@casaestate.com<br />
              <span className="font-bold text-slate-800 dark:text-stone-300">Helpline:</span> +91-120-6677889
            </p>
          </div>
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Nodal Grievance Officer</h3>
            <p className="text-xs text-slate-600 dark:text-stone-400 leading-relaxed font-semibold">
              In accordance with real estate regulatory norms, for any escalation regarding allotment delays or facility issues, you can file a ticket or contact our designated officer:
            </p>
            <p className="text-xs text-slate-600 dark:text-stone-400 font-semibold">
              <span className="font-bold text-slate-800 dark:text-stone-300">Name:</span> Ms. Shalini Sharma (Nodal Grievance Officer)<br />
              <span className="font-bold text-slate-800 dark:text-stone-300">Email:</span> shalini.sharma@casaestate.com<br />
              <span className="font-bold text-slate-800 dark:text-stone-300">Redressal Timeline:</span> Under 48 Business Hours
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-3xl mx-auto text-left">
          <div className="text-center mb-10">
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest font-mono">FAQ Desk</span>
            <h2 className="text-2xl font-extrabold uppercase font-display tracking-tight text-slate-900 dark:text-white mt-1">Frequently Asked Questions</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">Find instant resolutions regarding allotments, predictive construction timelines, and compliance standards.</p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "How does BuildFlow AI predict delay risks and schedules?",
                a: "BuildFlow AI integrates live field log dispatches from site engineers (e.g. concrete pouring, HVAC testing) and runs them through a predictive scheduling model. If a bottleneck is detected, the engine forecasts the exact delay cascade and updates downstream possession timelines."
              },
              {
                q: "What is RERA compliance and how can I verify my tower?",
                a: "All towers managed by CasaEstate carry certified registrations under the Real Estate Regulatory Authority (RERA). These include: Noida (UP-RERA-2026-REG-88209), Gurugram (HR-RERA-2026-REG-74011), and Mumbai (MH-RERA-2026-REG-10925). You can check blueprints and licenses inside the Deals Room."
              },
              {
                q: "How does the B2B Enterprise Negotiation Desk function?",
                a: "Our AI-driven B2B Negotiation Desk allows corporate clients to propose bulk allotments. The system compares the offer against live scarcity level indexes and margin thresholds, automatically approving optimal bids or proposing counter-offers."
              },
              {
                q: "Can I retrieve my official deeds and evacuation maps?",
                a: "Yes! All RERA approved construction plans, safety inspection reports, and official invoices are securely archived in the client vault. You can also view the emergency Fire Safety Evacuation Map on the home page."
              }
            ].map((faq, i) => {
              const isOpen = activeFaq === i;
              return (
                <div key={i} className="border-b border-slate-200 dark:border-slate-800 pb-4">
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : i)}
                    className="w-full flex justify-between items-center py-3 text-left font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm uppercase tracking-wide font-mono"
                  >
                    <span>{faq.q}</span>
                    <span className="text-xs font-black">{isOpen ? '−' : '+'}</span>
                  </button>
                  {isOpen && (
                    <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed mt-2 animate-fade-in pl-1">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-205 dark:border-stone-800 bg-[#f4f4f3] dark:bg-stone-955 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500 dark:text-stone-400">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <span className="font-bold">
              <span className="text-[#c06014]">Casa</span>
              <span className="text-[#4a4a4a] dark:text-[#d4d4d8]">Estate</span> Infrastructure
            </span>
            <span className="hidden sm:inline">·</span>
            <span>© 2026 CasaEstate Pvt. Ltd. All rights reserved.</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/login" className="hover:underline hover:text-slate-900 dark:hover:text-white">Legal Agreement</Link>
            <span>·</span>
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                setFooterModal({
                  open: true,
                  title: 'Terms of Use',
                  content: 'CASAESTATE TERMS OF USE:\n\n1. Authenticity of Listings: All units, scarcities, prices and RERA certifications displayed on this platform are synchronized in real time with our central ledger database.\n2. B2B Margin Protocols: Bulk wholesaling negotiation contracts proposed via the Enterprise Wholesale Desk are evaluated strictly using our margins algorithms based on stock availability and Scarcity Indexes.\n3. Allotment Locks: Provisional locks reserved by the Allotment Wizard hold the designated unit for 10 minutes, after which it is released back to public availability automatically.'
                });
              }}
              className="hover:underline hover:text-slate-900 dark:hover:text-white"
            >
              Terms of Use
            </a>
            <span>·</span>
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                setFooterModal({
                  open: true,
                  title: 'Privacy Policy',
                  content: 'CASAESTATE PRIVACY POLICY:\n\n1. Data Integrity: All booking information, user identities, contact emails, and mobile phone numbers verified during OTP sessions are saved securely under corporate database collections.\n2. Ledgers Auditing: Every confirmed reservation transaction logs metadata to the immutable ledger record, guaranteeing complete legal auditing and protection against double-allocations.\n3. Communication Consent: We only use your primary phone number and notification email for deed delivery, RERA sanctions updates, and regular society drill reminders.'
                });
              }}
              className="hover:underline hover:text-slate-900 dark:hover:text-white"
            >
              Privacy Policy
            </a>
            <span>·</span>
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                setFooterModal({
                  open: true,
                  title: 'RERA Sanction Documents',
                  content: 'CASAESTATE RERA COMPLIANCE STATUS:\n\nAll real estate developments under CasaEstate Infrastructure Pvt. Ltd. are fully approved by the Real Estate Regulatory Authority (RERA):\n\n- Casa Horizon (Noida): UP-RERA-2026-REG-88209\n- Casa Serenity (Gurugram): HR-RERA-2026-REG-74011\n- Casa Pinnacle (Mumbai): MH-RERA-2026-REG-10925\n\nAll construction blueprints, fire NOC evacuation maps, and structural layouts are legally sanctioned and approved for allotment.'
                });
              }}
              className="hover:underline hover:text-slate-900 dark:hover:text-white"
            >
              RERA Sanction Documents
            </a>
          </div>
        </div>
      </footer>

      {/* Evacuation Map Modal */}
      {showEvacModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm" onClick={() => setShowEvacModal(false)} />
          <div className="relative bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl z-10 space-y-4 text-left animate-fade-in">
            <div className="flex justify-between items-center border-b border-stone-800 pb-3">
              <div>
                <span className="text-[10px] text-red-500 font-mono font-bold uppercase tracking-widest">Emergency Fire NOC Layout</span>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Evacuation Escape Map</h3>
              </div>
              <button 
                onClick={() => setShowEvacModal(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-stone-800 text-stone-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="bg-black border border-stone-800 rounded-2xl p-6 aspect-[4/3] flex items-center justify-center relative">
              <div className="absolute inset-0 bg-grid opacity-5" />
              <svg viewBox="0 0 120 80" className="w-full h-full text-emerald-500 stroke-current" fill="none" strokeWidth="0.8">
                {/* Structural escape lanes layout */}
                <rect x="5" y="5" width="110" height="70" rx="2" />
                <line x1="30" y1="5" x2="30" y2="75" />
                <line x1="90" y1="5" x2="90" y2="75" />
                <line x1="30" y1="40" x2="90" y2="40" />
                {/* Stair cores escape zones */}
                <rect x="12" y="32" width="12" height="16" className="text-red-500" />
                <text x="14" y="42" className="fill-current text-red-500 stroke-none text-[4px] font-sans font-bold">STAIR A</text>
                
                <rect x="96" y="32" width="12" height="16" className="text-red-500" />
                <text x="98" y="42" className="fill-current text-red-500 stroke-none text-[4px] font-sans font-bold">STAIR B</text>
                
                {/* Evacuation Arrows */}
                <path d="M 40 40 L 32 40" strokeWidth="1" className="text-emerald-500" markerEnd="url(#arrow)" />
                <path d="M 80 40 L 88 40" strokeWidth="1" className="text-emerald-500" markerEnd="url(#arrow)" />
                
                {/* Arrow markers */}
                <defs>
                  <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" className="fill-current" />
                  </marker>
                </defs>
                <text x="50" y="35" className="fill-current stroke-none text-[5px] font-sans font-bold">ASSEMBLY ZONE</text>
              </svg>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => alert('Downloading official Fire safety map PDF...')}
                className="flex-1 text-center bg-stone-100 hover:bg-white text-stone-900 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all"
              >
                Download Layout PDF
              </button>
              <button 
                onClick={() => setShowEvacModal(false)}
                className="flex-1 text-center bg-stone-800 hover:bg-stone-700 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all border border-stone-700"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Legal Modal */}
      {footerModal.open && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm" onClick={() => setFooterModal({ open: false, title: '', content: '' })} />
          <div className="relative bg-white dark:bg-stone-900 border border-slate-205 dark:border-stone-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl z-10 space-y-4 text-left animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-stone-850 pb-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">{footerModal.title}</h3>
              <button 
                onClick={() => setFooterModal({ open: false, title: '', content: '' })}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-stone-800 text-slate-400 hover:text-slate-800 dark:hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="bg-slate-50 dark:bg-stone-800 border border-slate-200 dark:border-stone-750 rounded-2xl p-5 max-h-[60vh] overflow-y-auto">
              <p className="text-xs text-slate-700 dark:text-stone-300 font-medium leading-relaxed whitespace-pre-line font-mono">
                {footerModal.content}
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <button 
                onClick={() => setFooterModal({ open: false, title: '', content: '' })}
                className="btn-primary text-xs font-bold py-2.5 px-6 rounded-xl uppercase tracking-wider"
              >
                Accept & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Allotment Drawer */}
      <BookingForm />
    </div>
  );
}
