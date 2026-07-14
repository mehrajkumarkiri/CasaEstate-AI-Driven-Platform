import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { auth } from '../config/firebase';
import { sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';

export default function Login() {
  const { requestOtp, verifyOtp, pushNotification } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active tab based on query param '?role='
  const getInitialRole = () => {
    const params = new URLSearchParams(location.search);
    const r = params.get('role');
    if (r === 'resident' || r === 'admin') return r;
    return 'buyer';
  };

  const [activeTab, setActiveTab] = useState(getInitialRole);
  const [authMethod, setAuthMethod] = useState('email'); // 'email' or 'phone'
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [phoneVal, setPhoneVal] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState(1); // 1: request, 2: verify
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/buyer-lounge';

  // Update activeTab when query string changes
  useEffect(() => {
    setActiveTab(getInitialRole());
  }, [location.search]);

  // Handle Firebase Sign-In Link verification on mount
  useEffect(() => {
    const handleFirebaseLink = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        let email = window.localStorage.getItem('emailForSignIn');
        if (!email) {
          email = window.prompt('Please enter your email for confirmation:');
        }
        if (email) {
          setLoading(true);
          setError('');
          try {
            await signInWithEmailLink(auth, email, window.location.href);
            window.localStorage.removeItem('emailForSignIn');
            
            // Log in via our backend with custom verification bypass
            const res = await verifyOtp(email, 'firebase_verified', activeTab);
            setLoading(false);
            
            if (res.success) {
              pushNotification({
                type: 'success',
                title: '✓ Access Verified via Email Link',
                message: `Welcome, ${res.user.name || 'User'}! Successfully entered ${res.user.role === 'resident' ? 'Resident Portal' : 'Buyer Lounge'}.`,
              });
              
              if (res.user.role === 'admin') {
                navigate('/admin');
              } else if (res.user.role === 'resident') {
                navigate('/resident-portal');
              } else {
                navigate('/buyer-lounge');
              }
            } else {
              setError(res.error || 'Backend session verification failed.');
            }
          } catch (err) {
            setLoading(false);
            setError(err.message || 'Error signing in with link.');
          }
        }
      }
    };
    handleFirebaseLink();
  }, [location.search, navigate, verifyOtp, pushNotification, activeTab]);

  const validateInput = () => {
    if (authMethod === 'email') {
      if (!emailOrPhone) return 'Email address is required';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailOrPhone.trim())) return 'Provide a valid email address';
    } else {
      if (!phoneVal) return 'Phone number is required';
      const cleaned = phoneVal.replace(/\D/g, '');
      if (cleaned.length < 10) return 'Provide a valid phone number (min 10 digits)';
    }
    return '';
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    const validationError = validateInput();
    if (validationError) {
      setError(validationError);
      return;
    }

    const targetInput = authMethod === 'email' 
      ? emailOrPhone.trim() 
      : `${countryCode}${phoneVal.replace(/\D/g, '')}`;

    setLoading(true);

    if (authMethod === 'email') {
      const actionCodeSettings = {
        url: `${window.location.origin}/login?role=${activeTab}`,
        handleCodeInApp: true,
      };

      try {
        await sendSignInLinkToEmail(auth, targetInput, actionCodeSettings);
        window.localStorage.setItem('emailForSignIn', targetInput);
        setLoading(false);
        setStep(2);
        pushNotification({
          type: 'success',
          title: '✉️ Secure Login Link Dispatched',
          message: `A secure login link has been sent to ${targetInput}. Please check your email inbox and click the link to confirm.`,
          duration: 12000
        });
      } catch (err) {
        setLoading(false);
        setError(err.message || 'Error sending email verification link.');
      }
    } else {
      const res = await requestOtp(targetInput, activeTab);
      setLoading(false);

      if (res.success) {
        setStep(2);
        pushNotification({
          type: 'success',
          title: '🔑 Verification Code Dispatched',
          message: `A 6-digit verification code has been sent directly to ${targetInput}. Please check your inbox.`,
          duration: 10000
        });
      } else {
        setError(res.error || 'Could not send verification code.');
      }
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!otpCode || otpCode.length !== 6) {
      setError('Enter the 6-digit numeric verification code');
      return;
    }

    const targetInput = authMethod === 'email' 
      ? emailOrPhone.trim() 
      : `${countryCode}${phoneVal.replace(/\D/g, '')}`;

    setLoading(true);
    const res = await verifyOtp(targetInput, otpCode.trim(), activeTab);
    setLoading(false);

    if (res.success) {
      pushNotification({
        type: 'success',
        title: '✓ Access Verified',
        message: `Welcome, ${res.user.name || 'User'}! Successfully entered ${res.user.role === 'resident' ? 'Resident Portal' : 'Buyer Lounge'}.`,
      });

      // Redirect based on validated role
      if (res.user.role === 'admin') {
        navigate('/admin');
      } else if (res.user.role === 'resident') {
        navigate('/resident-portal');
      } else {
        navigate('/buyer-lounge');
      }
    } else {
      setError(res.error || 'Invalid code. Use the master bypass 123456');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-stone-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative transition-colors duration-350">
      
      {/* Soft Background Accent */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-100/40 dark:bg-blue-900/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-50/40 dark:bg-emerald-900/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 text-center">
        {/* Logo */}
        <div className="flex justify-center items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 flex items-center justify-center shadow-sm">
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
            <span className="text-2xl font-extrabold text-[#c06014] tracking-tight">Casa</span>
            <span className="text-2xl font-extrabold text-[#4a4a4a] dark:text-[#d4d4d8] tracking-tight">Estate</span>
          </div>
        </div>

        <h2 className="text-center text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {step === 1 ? 'Authorized Access Portal' : 'Verify Identity'}
        </h2>
        <p className="mt-2 text-center text-xs font-semibold text-slate-500 dark:text-stone-400 uppercase tracking-wider">
          {step === 1 
            ? 'Role-specific entry for secure real estate operations' 
            : `Code dispatched to: ${emailOrPhone}`}
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="bg-white dark:bg-stone-900 py-8 px-4 shadow-md border border-slate-205 dark:border-stone-800 rounded-2xl sm:px-10 text-left">
          
          {/* Segmented Control for Persona Access */}
          {step === 1 && (
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-stone-850 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('buyer');
                  navigate('/login?role=buyer', { replace: true });
                }}
                className={`py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                  activeTab === 'buyer'
                    ? 'bg-white dark:bg-stone-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:text-stone-400 dark:hover:text-stone-200'
                }`}
              >
                🏢 Buyer Lounge
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('resident');
                  navigate('/login?role=resident', { replace: true });
                }}
                className={`py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                  activeTab === 'resident'
                    ? 'bg-white dark:bg-stone-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:text-stone-400 dark:hover:text-stone-200'
                }`}
              >
                🏠 Resident Portal
              </button>
            </div>
          )}

          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500 p-3 rounded-r-xl">
              <p className="text-xs text-red-700 dark:text-red-400 font-bold">⚠️ {error}</p>
            </div>
          )}

          {step === 1 ? (
            <form className="space-y-4" onSubmit={handleRequestOtp}>
              {/* Auth Method Selector */}
              <div className="grid grid-cols-2 gap-1 p-0.5 bg-slate-50 dark:bg-stone-850 border border-slate-200 dark:border-stone-800 rounded-xl mb-4">
                <button
                  type="button"
                  onClick={() => { setAuthMethod('email'); setError(''); }}
                  className={`py-1.5 text-[10px] font-extrabold uppercase tracking-wider rounded-lg transition-all ${
                    authMethod === 'email'
                      ? 'bg-slate-900 dark:bg-stone-800 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:text-stone-400 dark:hover:text-stone-200'
                  }`}
                >
                  ✉️ Email
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMethod('phone'); setError(''); }}
                  className={`py-1.5 text-[10px] font-extrabold uppercase tracking-wider rounded-lg transition-all ${
                    authMethod === 'phone'
                      ? 'bg-slate-900 dark:bg-stone-800 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:text-stone-400 dark:hover:text-stone-200'
                  }`}
                >
                  📞 Phone Number
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                  {authMethod === 'email' 
                    ? (activeTab === 'resident' ? 'Registered Resident Email' : 'Potential Applicant Email')
                    : (activeTab === 'resident' ? 'Registered Resident Phone' : 'Potential Applicant Phone')
                  }
                </label>

                {authMethod === 'email' ? (
                  <input
                    id="emailOrPhone"
                    name="emailOrPhone"
                    type="email"
                    required
                    placeholder="e.g. user@domain.com"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    className="input-field"
                  />
                ) : (
                  <div className="flex gap-2">
                    {/* Flags Prepended Dropdown */}
                    <div className="relative flex-shrink-0">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="bg-slate-50 dark:bg-stone-800 border border-slate-205 dark:border-stone-750 text-slate-800 dark:text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 font-bold h-[42px]"
                      >
                        <option value="+91">🇮🇳 +91</option>
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+44">🇬🇧 +44</option>
                        <option value="+971">🇦🇪 +971</option>
                        <option value="+65">🇸🇬 +65</option>
                      </select>
                    </div>
                    <input
                      id="phoneVal"
                      name="phoneVal"
                      type="tel"
                      required
                      placeholder="98765 43210"
                      value={phoneVal}
                      onChange={(e) => setPhoneVal(e.target.value.replace(/\D/g, ''))}
                      className="input-field flex-1"
                    />
                  </div>
                )}

                <p className="mt-1.5 text-[10px] font-semibold text-slate-400 dark:text-stone-500 leading-normal">
                  {activeTab === 'resident'
                    ? 'Please use details matching your RERA registry/allotment letter records.'
                    : 'We will register you as a provisional buyer to preview and secure bookings.'}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 flex items-center justify-center disabled:opacity-50 text-xs font-bold uppercase tracking-wider"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white dark:border-stone-900 border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Request OTP Passcode'
                )}
              </button>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={handleVerifyOtp}>
              {authMethod === 'email' ? (
                <div className="text-center py-4 space-y-4">
                  <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400">
                    <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-slate-800 dark:text-white">Waiting for Email Verification Link...</p>
                    <p className="text-xs text-slate-500 dark:text-stone-400 leading-relaxed">
                      We sent a secure login link to <strong className="text-slate-800 dark:text-white">{emailOrPhone}</strong>.
                      Please check your email inbox and click the link to confirm and access your workspace.
                    </p>
                  </div>
                  <div className="pt-2">
                    <button 
                      type="button" 
                      onClick={() => { setStep(1); }} 
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-extrabold"
                    >
                      ← Back / Change Email
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label htmlFor="otpCode" className="block text-xs font-bold text-slate-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                      6-Digit OTP Code
                    </label>
                    <input
                      id="otpCode"
                      name="otpCode"
                      type="text"
                      maxLength={6}
                      required
                      placeholder="------"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-slate-50 dark:bg-stone-800 border border-slate-205 dark:border-stone-700 text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-stone-500 text-center tracking-[0.6em] text-lg font-black rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-550/20 focus:border-slate-500 transition-all"
                    />
                    <div className="mt-3 flex items-center justify-between text-[10px] font-semibold text-slate-400 dark:text-stone-500">
                      <span></span>
                      <button 
                        type="button" 
                        onClick={() => { setStep(1); setOtpCode(''); }} 
                        className="text-blue-600 dark:text-blue-400 hover:underline font-bold"
                      >
                        Change Contact Info
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-primary py-3 flex items-center justify-center disabled:opacity-50 text-xs font-bold uppercase tracking-wider"
                  >
                    {loading ? (
                      <span className="w-4 h-4 border-2 border-white dark:border-stone-950 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Verify Code & Access Space'
                    )}
                  </button>
                </>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
