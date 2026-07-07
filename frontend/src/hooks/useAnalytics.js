import { useState, useEffect, useCallback } from 'react';
import { projectsApi } from '../services/api';

const MOCK_ANALYTICS = {
  totalRevenue: 847500000,
  revenueGrowth: 18.4,
  totalUnits: 240,
  soldUnits: 98,
  reservedUnits: 42,
  availableUnits: 100,
  occupancyRate: 58.3,
  monthlySales: [
    { month: 'Jan', revenue: 45000000, units: 8 },
    { month: 'Feb', revenue: 52000000, units: 9 },
    { month: 'Mar', revenue: 61000000, units: 11 },
    { month: 'Apr', revenue: 48000000, units: 8 },
    { month: 'May', revenue: 73000000, units: 13 },
    { month: 'Jun', revenue: 89000000, units: 16 },
    { month: 'Jul', revenue: 95000000, units: 17 },
  ],
  amenityUtilization: [
    { name: 'Gym', utilization: 92, bookings: 312 },
    { name: 'Clubhouse', utilization: 78, bookings: 234 },
    { name: 'Pool', utilization: 65, bookings: 189 },
    { name: 'Co-work', utilization: 55, bookings: 156 },
    { name: 'Tennis', utilization: 45, bookings: 127 },
  ],
  projectPerformance: [
    { name: 'Aura Horizon', sold: 45, reserved: 18, available: 57, revenue: 380000000 },
    { name: 'Aura Serenity', sold: 32, reserved: 14, available: 34, revenue: 298000000 },
    { name: 'Aura Pinnacle', sold: 21, reserved: 10, available: 9, revenue: 169500000 },
  ],
  alerts: [
    { type: 'warning', message: 'Gym approaching peak saturation (92%)', severity: 'high' },
    { type: 'info', message: 'Aura Pinnacle: Only 9 units remaining', severity: 'medium' },
    { type: 'success', message: 'Monthly revenue target exceeded by 18%', severity: 'low' },
  ],
};

export function useAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await projectsApi.getGlobalAnalytics();
      setAnalytics(res.data || MOCK_ANALYTICS);
    } catch {
      setAnalytics(MOCK_ANALYTICS);
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
    // Simulate live updates every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, [fetchAnalytics]);

  return { analytics, loading, error, lastUpdated, refetch: fetchAnalytics };
}
