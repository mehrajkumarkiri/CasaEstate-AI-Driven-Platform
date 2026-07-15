import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Login() {
  const { login, signup, pushNotification } = useApp();
  const navigate = useNavigate();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirectUser = (user) => {
    if (user.role === 'admin') {
      navigate('/admin');
    } else if (user.role === 'resident') {
      navigate('/resident-portal');
    } else if (user.role === 'engineer') {
      navigate('/engineer');
    } else {
      navigate('/buyer-lounge');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (!name.trim() || !email.trim() || !phone.trim() || !password) {
          setError('All registration fields are required.');
          setLoading(false);
          return;
        }
        
        const res = await signup({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          password: password
        });
        
        setLoading(false);
        if (res.success) {
          pushNotification({
            type: 'success',
            title: '✓ Account Registered',
            message: `Welcome to CasaEstate, ${res.user.name || 'User'}!`
          });
          redirectUser(res.user);
        } else {
          setError(res.error || 'Registration failed.');
        }
      } else {
        if (!email.trim() || !password) {
          setError('Please provide both your email and password.');
          setLoading(false);
          return;
        }

        const res = await login(email.trim().toLowerCase(), password);
        setLoading(false);
        if (res.success) {
          pushNotification({
            type: 'success',
            title: '✓ Login Successful',
            message: `Welcome back, ${res.user.name || 'User'}!`
          });
          redirectUser(res.user);
        } else {
          setError(res.error || 'Invalid email or password.');
        }
      }
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Authentication error.');
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
            <span className="text-2xl font-extrabold text-slate-855 dark:text-[#d4d4d8] tracking-tight">Estate</span>
          </div>
        </div>

        <h2 className="text-center text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {isSignUp ? 'Sign Up' : 'Login'}
        </h2>
        <p className="mt-2 text-center text-xs font-semibold text-slate-505 dark:text-stone-450 uppercase tracking-widest">
          {isSignUp ? 'Create a secure workspace' : 'Access your secure workspace'}
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="bg-white dark:bg-stone-900 py-8 px-6 shadow-md border border-slate-205 dark:border-stone-800 rounded-3xl text-left space-y-6">
          
          {error && (
            <div className="bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500 p-3 rounded-r-xl">
              <p className="text-xs text-red-700 dark:text-red-400 font-bold">⚠️ {error}</p>
            </div>
          )}

          {/* Credentials Authentication Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-xs font-bold text-slate-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    placeholder="e.g. Arjun Mehta"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-stone-800 border border-slate-205 dark:border-stone-700 text-slate-900 dark:text-white text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Phone Field */}
                <div>
                  <label htmlFor="phone" className="block text-xs font-bold text-slate-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    required
                    placeholder="e.g. +91-9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-stone-800 border border-slate-205 dark:border-stone-700 text-slate-900 dark:text-white text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="e.g. user@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-stone-800 border border-slate-205 dark:border-stone-700 text-slate-900 dark:text-white text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-stone-800 border border-slate-205 dark:border-stone-700 text-slate-900 dark:text-white text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-500 hover:to-indigo-600 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all text-xs uppercase tracking-wider disabled:opacity-50"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white dark:border-stone-900 border-t-transparent rounded-full animate-spin" />
              ) : isSignUp ? (
                'Create Account'
              ) : (
                'Login'
              )}
            </button>
          </form>

          {/* Toggle login/signup mode links */}
          <div className="text-center pt-2">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline"
            >
              {isSignUp ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
            </button>
          </div>

          <p className="text-[10px] text-slate-455 dark:text-stone-500 text-center leading-relaxed">
            Enter your credentials to verify your workspace access tokens. Accounts ending in @casaestate.com are automatically assigned Admin access.
          </p>

        </div>
      </div>
    </div>
  );
}
