import { useState, useEffect, useCallback } from 'react';
import { projectsApi } from '../services/api';

// Mock fallback data (matches backend mock)
const MOCK_PROJECTS = [
  {
    _id: 'proj-001',
    name: 'Aura Horizon',
    slug: 'aura-horizon',
    location: { address: 'Sector 74, Noida', city: 'Noida', state: 'Uttar Pradesh' },
    description: 'A landmark residential tower offering panoramic city views. Designed for the discerning urban elite with world-class amenities and sustainable architecture.',
    tagline: 'Where the Sky Meets Luxury',
    status: 'Under Construction',
    totalUnits: 120,
    totalFloors: 32,
    totalTowers: 2,
    possessionDate: '2026-12-31',
    reraNumber: 'UPRERAPRJ654321',
    priceRange: { min: 6500000, max: 18500000, currency: 'INR' },
    features: ['Rooftop Infinity Pool', 'Smart Home Automation', 'EV Charging', '5-tier Security', 'Yoga Pavilion', 'Organic Garden'],
    amenities: [
      { _id: 'amen-001', name: 'Grand Clubhouse', type: 'Clubhouse', totalSlots: 12, operatingHours: '07:00 - 23:00', pricePerSlot: 1000 },
      { _id: 'amen-002', name: 'Olympic Swimming Pool', type: 'Swimming Pool', totalSlots: 20, operatingHours: '06:00 - 21:00', pricePerSlot: 300 },
      { _id: 'amen-003', name: 'Tennis Court A', type: 'Tennis Court', totalSlots: 8, operatingHours: '06:00 - 22:00', pricePerSlot: 500 },
      { _id: 'amen-004', name: 'Premium Gym', type: 'Gym', totalSlots: 30, operatingHours: '05:00 - 23:00', pricePerSlot: 0 },
      { _id: 'amen-005', name: 'Sky Lounge', type: 'Party Hall', totalSlots: 4, operatingHours: '10:00 - 23:00', pricePerSlot: 5000 },
    ],
    salesData: { totalRevenue: 380000000, soldUnits: 45, reservedUnits: 18 },
    specifications: {
      structure: 'RCC Framed Structure with earthquake-resistant design',
      flooring: 'Italian Marble in living areas, Vitrified tiles in bedrooms',
      kitchen: 'Modular kitchen with granite platform, chimney provision',
      bathroom: 'Premium CP fittings, anti-skid flooring, concealed plumbing',
    },
  },
  {
    _id: 'proj-002',
    name: 'Aura Serenity',
    slug: 'aura-serenity',
    location: { address: 'Golf Course Extension Road', city: 'Gurugram', state: 'Haryana' },
    description: 'Low-rise luxury residences nestled amidst curated green spaces. A sanctuary of calm in the heart of the millennium city.',
    tagline: 'Your Private Green Sanctuary',
    status: 'Ready to Move',
    totalUnits: 80,
    totalFloors: 8,
    totalTowers: 4,
    possessionDate: '2025-06-30',
    reraNumber: 'HRERAGGM789012',
    priceRange: { min: 9500000, max: 25000000, currency: 'INR' },
    features: ['Private Gardens', 'Zen Meditation Zone', 'Concierge Services', 'Wine Cellar', 'Pet Park', 'Library'],
    amenities: [
      { _id: 'amen-006', name: 'Serenity Club', type: 'Clubhouse', totalSlots: 10, operatingHours: '07:00 - 22:00', pricePerSlot: 1500 },
      { _id: 'amen-007', name: 'Lap Pool', type: 'Swimming Pool', totalSlots: 15, operatingHours: '06:00 - 20:00', pricePerSlot: 500 },
      { _id: 'amen-008', name: 'Co-working Studio', type: 'Co-working Space', totalSlots: 20, operatingHours: '08:00 - 20:00', pricePerSlot: 200 },
    ],
    salesData: { totalRevenue: 298000000, soldUnits: 32, reservedUnits: 14 },
    specifications: {
      structure: 'Load-bearing with premium brick construction',
      flooring: 'European Oak hardwood, premium Italian tiles',
      kitchen: 'Chef\'s kitchen with island counter, built-in appliances',
      bathroom: 'Jacuzzi provisions, rain shower, luxury fittings',
    },
  },
  {
    _id: 'proj-003',
    name: 'Aura Pinnacle',
    slug: 'aura-pinnacle',
    location: { address: 'Bandra Kurla Complex', city: 'Mumbai', state: 'Maharashtra' },
    description: 'Ultra-premium residences at the apex of Mumbai\'s most prestigious commercial district. Redefining urban luxury for global citizens.',
    tagline: 'The Apex of Mumbai Living',
    status: 'Pre-Launch',
    totalUnits: 40,
    totalFloors: 50,
    totalTowers: 1,
    possessionDate: '2028-03-31',
    reraNumber: 'P51800012345',
    priceRange: { min: 35000000, max: 120000000, currency: 'INR' },
    features: ['Private Elevator Lobbies', 'Concierge 24/7', 'Helipad', 'Butler Service', 'Private Pool per unit', 'Art Gallery'],
    amenities: [
      { _id: 'amen-009', name: 'Pinnacle Lounge', type: 'Clubhouse', totalSlots: 6, operatingHours: '24/7', pricePerSlot: 0 },
      { _id: 'amen-010', name: 'Sky Pool (Level 48)', type: 'Swimming Pool', totalSlots: 10, operatingHours: '06:00 - 23:00', pricePerSlot: 0 },
    ],
    salesData: { totalRevenue: 169500000, soldUnits: 21, reservedUnits: 10 },
    specifications: {
      structure: 'Steel-concrete composite, wind-engineered façade',
      flooring: 'Calacatta marble, bespoke hardwood parquet',
      kitchen: 'Full Miele appliance suite, Corian surfaces',
      bathroom: 'Private spa, infinity bathtub, steam room',
    },
  },
];

export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await projectsApi.getAll();
      setProjects(res.data || MOCK_PROJECTS);
    } catch {
      setProjects(MOCK_PROJECTS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  return { projects, loading, error, refetch: fetchProjects };
}

export function useProject(id) {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    projectsApi.getById(id)
      .then((res) => setProject(res.data))
      .catch(() => {
        const mock = MOCK_PROJECTS.find((p) => p._id === id || p.slug === id);
        if (mock) setProject(mock);
        else setError('Project not found');
      })
      .finally(() => setLoading(false));
  }, [id]);

  return { project, loading, error };
}

export { MOCK_PROJECTS };
