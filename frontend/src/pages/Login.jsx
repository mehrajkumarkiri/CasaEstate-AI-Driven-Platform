import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { auth } from '../config/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export default function Login() {
  const { verifyOtp, pushNotification } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async (actionType) => {
    setLoading(true);
    setError('');
    
    try {
      const provider = new GoogleAuthProvider();
      // Force Google account selection pop-up just like standard production sites
      provider.setCustomParameters({ prompt: 'select_account' });
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Establish session with the backend using the verified email
      const res = await verifyOtp(user.email, 'firebase_verified', 'buyer');
      setLoading(false);
      
      if (res.success) {
        pushNotification({
          type: 'success',
          title: `✓ Google ${actionType === 'login' ? 'Login' : 'Sign-Up'} Successful`,
          message: `Welcome back, ${res.user.name || user.displayName || 'User'}!`,
        });
        
        // Redirect to respective portal based on backend role
        if (res.user.role === 'admin') {
          navigate('/admin');
        } else if (res.user.role === 'resident') {
          navigate('/resident-portal');
        } else if (res.user.role === 'engineer') {
          navigate('/engineer');
        } else {
          navigate('/buyer-lounge'); // client/buyer is routed to properties/buyer portal
        }
      } else {
        setError(res.error || 'Backend session verification failed.');
      }
    } catch (err) {
      setLoading(false);
      console.error("Firebase Google Sign-In failed:", err);
      setError(err.message || 'Google Authentication failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-stone-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative transition-colors duration-350">
      
      {/* Background Accent Gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-100/40 dark:bg-blue-900/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-50/40 dark:bg-emerald-900/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 text-center">
        {/* Brand Logo */}
        <div className="flex justify-center items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 flex items-center justify-center shadow-sm">
            <svg viewBox="0 0 100 100" fill="currentColor" className="w-6 h-6 text-slate-800 dark:text-white" stroke="none">
              <rect x="15" y="80" width="70" height="4" />
              <rect x="20" y="20" width="32" height="58" />
              <rect x="25" y="25" width="4" height="48" className="fill-slate-50 dark:fill-slate-900" />
              <rect x="34" y="25" width="4" height="48" className="fill-slate-50 dark:fill-slate-900" />
              <rect x="43" y="25" width="4" height="48" className="fill-slate-50 dark:fill-slate-900" />
              <rect x="54" y="38" width="22" height="40" />
              <rect x="58" y="44" width="14" height="3" className="fill-slate-50 dark:fill-slate-900" />
              <rect x="58" y="50" width="14" height="3" className="fill-slate-50 dark:fill-slate-900" />
              <rect x="58" y="56" width="14" height="3" className="fill-slate-50 dark:fill-slate-900" />
              <rect x="58" y="62" width="14" height="3" className="fill-slate-50 dark:fill-slate-900" />
              <rect x="58" y="68" width="14" height="3" className="fill-slate-50 dark:fill-slate-900" />
              <rect x="58" y="74" width="14" height="3" className="fill-slate-50 dark:fill-slate-900" />
            </svg>
          </div>
          <div>
            <span className="text-2xl font-extrabold text-blue-600 tracking-tight">Casa</span>
            <span className="text-2xl font-extrabold text-slate-850 dark:text-[#d4d4d8] tracking-tight">Estate</span>
          </div>
        </div>

        <h2 className="text-center text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Login or SignUp
        </h2>
        <p className="mt-2 text-center text-xs font-semibold text-slate-500 dark:text-stone-450 uppercase tracking-widest">
          Access your secure workspace instantly
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="bg-white dark:bg-stone-900 py-8 px-6 shadow-md border border-slate-205 dark:border-stone-800 rounded-3xl text-center space-y-6">
          
          {error && (
            <div className="bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500 p-3 rounded-r-xl text-left">
              <p className="text-xs text-red-700 dark:text-red-400 font-bold">⚠️ {error}</p>
            </div>
          )}

          {/* Social Sign-In Panel */}
          <div className="space-y-3">
            {/* Login with Google Button */}
            <button
              onClick={() => handleGoogleLogin('login')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-700 font-bold border border-slate-250 py-3 px-4 rounded-xl shadow-xs transition-all text-xs uppercase tracking-wider disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {loading ? 'Opening Google Account Select...' : 'Login with Google'}
            </button>

            {/* SignUp with Google Button */}
            <button
              onClick={() => handleGoogleLogin('signup')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-500 hover:to-indigo-650 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all text-xs uppercase tracking-wider disabled:opacity-50"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
              </svg>
              {loading ? 'Opening Google Account Select...' : 'SignUp with Google'}
            </button>
          </div>

          <p className="text-[10px] text-slate-455 dark:text-stone-500 leading-relaxed pt-4">
            Unified Single Sign-On handles secure workspace authorization. If the Google popup fails to load, ensure pop-up block settings are configured.
          </p>

        </div>
      </div>
    </div>
  );
}
