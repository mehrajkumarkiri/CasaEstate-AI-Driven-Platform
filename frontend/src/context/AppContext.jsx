import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authApi } from '../services/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // Global notification queue
  const [notifications, setNotifications] = useState([]);

  // Active booking drawer state
  const [bookingDrawer, setBookingDrawer] = useState({ open: false, unit: null, project: null });

  // Currently viewed project
  const [activeProject, setActiveProject] = useState(null);

  // Global Theme Preferences
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('aura_theme_pref');
    if (saved) return saved;
    // Default to light as requested
    return 'light';
  });

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('aura_theme_pref', next);
      const root = document.documentElement;
      if (next === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      return next;
    });
  }, []);

  // Sync theme class on mount
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Authenticated User State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('aura_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [authToken, setAuthToken] = useState(() => localStorage.getItem('aura_token') || null);

  const requestOtp = useCallback(async (emailOrPhone, role) => {
    try {
      const res = await authApi.requestOtp(emailOrPhone, role);
      return { success: true, otp: res.otp, realSent: res.realSent };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const verifyOtp = useCallback(async (emailOrPhone, otp, role) => {
    try {
      const res = await authApi.verifyOtp(emailOrPhone, otp, role);
      if (res.success && res.token && res.user) {
        localStorage.setItem('aura_token', res.token);
        localStorage.setItem('aura_user', JSON.stringify(res.user));
        setAuthToken(res.token);
        setCurrentUser(res.user);
        return { success: true, user: res.user };
      }
      return { success: false, error: 'Authentication failed' };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('aura_token');
    localStorage.removeItem('aura_user');
    setAuthToken(null);
    setCurrentUser(null);
  }, []);

  const pushNotification = useCallback(({ type = 'info', title, message, duration = 5000 }) => {
    const id = Date.now() + Math.random();
    setNotifications((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, duration);
  }, []);

  const dismissNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const openBookingDrawer = useCallback((unit, project) => {
    setBookingDrawer({ open: true, unit, project });
  }, []);

  const closeBookingDrawer = useCallback(() => {
    setBookingDrawer({ open: false, unit: null, project: null });
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        authToken,
        requestOtp,
        verifyOtp,
        logout,
        notifications,
        pushNotification,
        dismissNotification,
        bookingDrawer,
        openBookingDrawer,
        closeBookingDrawer,
        activeProject,
        setActiveProject,
        theme,
        toggleTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
