import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Login() {
  const { verifyOtp, pushNotification } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCredentialResponse = async (response) => {
    setLoading(true);
    setError('');
    
    try {
      // Decode JWT token payload from Google Identity Services response
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window.atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      const googleUser = JSON.parse(jsonPayload);
      
      // Establish session with the backend using the verified email
      const res = await verifyOtp(googleUser.email, 'firebase_verified', 'buyer');
      setLoading(false);
      
      if (res.success) {
        pushNotification({
          type: 'success',
          title: '✓ Google Authentication Successful',
          message: `Welcome back, ${res.user.name || googleUser.name}!`,
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
      console.error("GSI payload parsing or session creation failed:", err);
      setError('Google Sign-In failed during token processing.');
    }
  };

  useEffect(() => {
    // Dynamically load Google GSI script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: '662894785515-iv6ij1iej4oi80qdfhvdije6jngeacut.apps.googleusercontent.com',
          callback: handleCredentialResponse,
          auto_select: false
        });
        
        // Render the official Google Sign-In/SignUp button
        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-target'),
          { 
            theme: 'outline', 
            size: 'large', 
            text: 'continue_with', 
            shape: 'rectangular',
            width: '340'
          }
        );
      }
    };
    document.body.appendChild(script);

    return () => {
      // Clean up the script on unmount
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

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
            <span className="text-2xl font-extrabold text-slate-855 dark:text-[#d4d4d8] tracking-tight">Estate</span>
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
          <div className="flex flex-col items-center justify-center py-2 space-y-4">
            {loading && (
              <div className="flex items-center gap-2 mb-2">
                <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-slate-500 font-semibold">Authenticating with Google...</span>
              </div>
            )}
            
            {/* Target Div for Google Identity Services SDK Render */}
            <div id="google-signin-target" className="min-h-[44px] flex items-center justify-center"></div>
          </div>

          <p className="text-[10px] text-slate-455 dark:text-stone-500 leading-relaxed pt-2">
            Social Single Sign-On ensures unified workspace isolation. Click the Google button to open account selection.
          </p>

        </div>
      </div>
    </div>
  );
}
