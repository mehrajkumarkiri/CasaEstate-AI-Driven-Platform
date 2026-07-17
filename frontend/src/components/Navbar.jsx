import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Navbar() {
  const { currentUser, logout, theme, toggleTheme } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  // Prevent body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  // Get dynamic navigation links based on user role
  const getNavLinks = () => {
    const links = [
      { label: 'Browse Estates', path: '/properties', icon: '🏙️' },
      { label: 'Deals Room', path: '/deals', icon: '💎' },
      { label: 'Casa AI', path: '/dashboard', icon: '⚙️' }
    ];
    if (!currentUser) return links;

    if (currentUser.role === 'resident') {
      links.push({ label: 'Resident Portal', path: '/resident-portal', icon: '🏠' });
      links.push({ label: 'Buyer Lounge', path: '/buyer-lounge', icon: '🏗️' });
    } else if (currentUser.role === 'engineer') {
      links.push({ label: 'Field Console', path: '/engineer', icon: '🔧' });
      links.push({ label: 'Buyer Lounge', path: '/buyer-lounge', icon: '🏗️' });
    } else if (currentUser.role === 'admin') {
      links.push({ label: 'Resident Portal', path: '/resident-portal', icon: '🏠' });
      links.push({ label: 'Admin Cockpit', path: '/admin', icon: '📊' });
      links.push({ label: 'Field Console', path: '/engineer', icon: '🔧' });
      links.push({ label: 'Buyer Lounge', path: '/buyer-lounge', icon: '🏗️' });
    }
    return links;
  };


  const navLinks = getNavLinks();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const themeToggler = (
    <div className="flex bg-slate-100 dark:bg-stone-850 border border-slate-205 dark:border-stone-800 rounded-full p-0.5 shadow-xs">
      <button
        onClick={() => { if (theme !== 'light') toggleTheme(); }}
        className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] transition-all ${
          theme === 'light' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400 hover:text-stone-200'
        }`}
        aria-label="Light Mode"
        title="Switch to Light Mode"
      >
        ☀️
      </button>
      <button
        onClick={() => { if (theme !== 'dark') toggleTheme(); }}
        className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] transition-all ${
          theme === 'dark' ? 'bg-stone-800 text-white shadow-sm' : 'text-slate-550 hover:text-slate-905'
        }`}
        aria-label="Dark Mode"
        title="Switch to Dark Mode"
      >
        🌙
      </button>
    </div>
  );

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/95 dark:bg-stone-950/95 backdrop-blur-md border-b border-slate-205 dark:border-stone-900 shadow-xs"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group flex-shrink-0 text-left">
              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 flex items-center justify-center shadow-sm transition-all group-hover:border-slate-300 dark:group-hover:border-slate-700">
                <svg viewBox="0 0 100 100" fill="currentColor" className="w-6 h-6 text-slate-800 dark:text-white" stroke="none">
                  {/* Ground line */}
                  <rect x="15" y="80" width="70" height="4" />
                  {/* Tall left building */}
                  <rect x="20" y="20" width="32" height="58" />
                  {/* Vertical windows on left building */}
                  <rect x="25" y="25" width="4" height="48" className="fill-slate-100 dark:fill-slate-900" />
                  <rect x="34" y="25" width="4" height="48" className="fill-slate-100 dark:fill-slate-900" />
                  <rect x="43" y="25" width="4" height="48" className="fill-slate-100 dark:fill-slate-900" />
                  {/* Shorter right building */}
                  <rect x="54" y="38" width="22" height="40" />
                  {/* Horizontal windows on right building */}
                  <rect x="58" y="44" width="14" height="3" className="fill-slate-100 dark:fill-slate-900" />
                  <rect x="58" y="50" width="14" height="3" className="fill-slate-100 dark:fill-slate-900" />
                  <rect x="58" y="56" width="14" height="3" className="fill-slate-100 dark:fill-slate-900" />
                  <rect x="58" y="62" width="14" height="3" className="fill-slate-100 dark:fill-slate-900" />
                  <rect x="58" y="68" width="14" height="3" className="fill-slate-100 dark:fill-slate-900" />
                  <rect x="58" y="74" width="14" height="3" className="fill-slate-100 dark:fill-slate-900" />
                </svg>
              </div>
              <div>
                <span className="text-base font-extrabold text-[#c06014] tracking-tight">Casa</span>
                <span className="text-base font-extrabold text-[#4a4a4a] dark:text-[#d4d4d8] tracking-tight">Estate</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                    isActive(link.path)
                      ? 'text-slate-900 dark:text-white bg-slate-100 dark:bg-stone-800'
                      : 'text-slate-500 hover:text-slate-900 dark:text-stone-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-stone-850'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop Access Actions & Theme Toggle */}
            <div className="hidden md:flex items-center gap-3">
              {themeToggler}
              
              {currentUser ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2.5 bg-slate-100 dark:bg-stone-800 border border-slate-200/80 dark:border-stone-700 rounded-xl px-3 py-1.5">
                    <div className="w-7 h-7 rounded-full bg-slate-900 dark:bg-stone-100 flex items-center justify-center text-xs font-bold text-white dark:text-stone-900 uppercase shadow-xs">
                      {currentUser.name ? currentUser.name.charAt(0) : 'U'}
                    </div>
                    <div className="text-left hidden lg:block">
                      <p className="text-xs font-bold text-slate-800 dark:text-stone-200 leading-tight">{currentUser.name || 'User'}</p>
                      <p className="text-[9px] text-slate-400 dark:text-stone-500 uppercase font-bold tracking-wider leading-tight">{currentUser.role}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-xs font-bold text-red-650 hover:text-red-750 bg-red-50 dark:bg-red-950/20 hover:bg-red-100/70 border border-red-100 dark:border-red-900/30 px-3 py-1.5 rounded-xl transition-all"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login?role=buyer"
                    className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-350 hover:text-slate-900 dark:hover:text-white px-3.5 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-slate-200 dark:border-slate-800"
                  >
                    Buyer Lounge
                  </Link>
                  <Link
                    to="/login?role=resident"
                    className="bg-slate-900 hover:bg-slate-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-950 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xl shadow-xs transition-all"
                  >
                    Resident Sign-In
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Actions Container */}
            <div className="flex items-center gap-2 md:hidden">
              {themeToggler}
              <button
                id="navbar-mobile-toggle"
                onClick={() => setMenuOpen((o) => !o)}
                className="w-10 h-10 flex flex-col items-center justify-center gap-1 rounded-xl hover:bg-slate-100 dark:hover:bg-stone-800 transition-colors border border-slate-205 dark:border-stone-800"
                aria-label="Toggle menu"
              >
                <span className={`block w-4 h-0.5 bg-slate-800 dark:bg-stone-200 transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
                <span className={`block w-4 h-0.5 bg-slate-800 dark:bg-stone-200 transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
                <span className={`block w-4 h-0.5 bg-slate-800 dark:bg-stone-200 transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar Panel */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-50 w-72 bg-white dark:bg-stone-900 border-l border-slate-205 dark:border-stone-800 flex flex-col
          transition-transform duration-300 ease-out md:hidden
          ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-900 dark:bg-stone-100 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-white dark:text-stone-905" stroke="currentColor" strokeWidth="2.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <span className="font-extrabold text-slate-900 dark:text-white">CasaEstate</span>
          </div>
          <button
            onClick={() => setMenuOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-500 dark:text-stone-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-stone-800 transition-colors border border-slate-100 dark:border-stone-800"
          >
            ✕
          </button>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-slate-100 dark:border-stone-800">
          {currentUser ? (
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-stone-850 border border-slate-100 dark:border-stone-800 rounded-xl p-3">
              <div className="w-10 h-10 rounded-full bg-slate-900 dark:bg-stone-100 flex items-center justify-center font-bold text-white dark:text-stone-900 uppercase shadow-xs">
                {currentUser.name ? currentUser.name.charAt(0) : 'U'}
              </div>
              <div className="overflow-hidden text-left">
                <p className="font-bold text-slate-800 dark:text-stone-200 text-sm truncate">{currentUser.name || 'User'}</p>
                <p className="text-xs text-slate-500 dark:text-stone-400 capitalize truncate">{currentUser.role} · {currentUser.email}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Link
                to="/login?role=buyer"
                className="block text-center bg-slate-50 dark:bg-stone-800 border border-slate-205 dark:border-stone-750 text-slate-800 dark:text-stone-200 font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all"
              >
                Access Buyer Lounge
              </Link>
              <Link
                to="/login?role=resident"
                className="block text-center bg-slate-900 dark:bg-stone-100 text-white dark:text-stone-950 font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow-xs"
              >
                Resident Sign-In
              </Link>
            </div>
          )}
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto text-left">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                isActive(link.path)
                  ? 'text-slate-900 dark:text-white bg-slate-50 dark:bg-stone-800 border border-slate-100 dark:border-stone-750'
                  : 'text-slate-500 hover:text-slate-950 dark:text-stone-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-stone-850'
              }`}
            >
              <span className="text-base">{link.icon}</span>
              {link.label}
              {isActive(link.path) && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-white" />
              )}
            </Link>
          ))}
        </nav>

        {/* Logout at bottom */}
        {currentUser && (
          <div className="p-4 border-t border-slate-100 dark:border-stone-800">
            <button
              onClick={handleLogout}
              className="w-full text-center bg-red-50 hover:bg-red-100/70 text-red-650 font-bold py-2.5 px-4 rounded-xl border border-red-100 transition-all text-xs uppercase tracking-wider"
            >
              Log Out
            </button>
          </div>
        )}

        {/* RERA badge */}
        <div className="p-4 border-t border-slate-105 dark:border-stone-800 bg-slate-50/50 dark:bg-stone-850/50 text-center text-[10px] text-slate-400 dark:text-stone-500">
          <p className="font-semibold uppercase tracking-wider mb-0.5">RERA Registered Developer</p>
          <p>© 2026 CasaEstate Pvt. Ltd.</p>
        </div>
      </div>
    </>
  );
}
