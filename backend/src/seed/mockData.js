/**
 * Mock Data Layer — Used when MongoDB is not connected.
 * Provides rich, realistic seed data for full demo functionality.
 */

const mockProjects = [
  {
    _id: 'proj-001',
    name: 'Casa Horizon',
    slug: 'casa-horizon',
    location: { address: 'Sector 74, Noida', city: 'Noida', state: 'Uttar Pradesh', pincode: '201301' },
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
      { name: 'Grand Clubhouse', type: 'Clubhouse', totalSlots: 12, operatingHours: '07:00 - 23:00', pricePerSlot: 1000 },
      { name: 'Olympic Swimming Pool', type: 'Swimming Pool', totalSlots: 20, operatingHours: '06:00 - 21:00', pricePerSlot: 300 },
      { name: 'Tennis Court A', type: 'Tennis Court', totalSlots: 8, operatingHours: '06:00 - 22:00', pricePerSlot: 500 },
      { name: 'Premium Gym', type: 'Gym', totalSlots: 30, operatingHours: '05:00 - 23:00', pricePerSlot: 0 },
      { name: 'Sky Lounge', type: 'Party Hall', totalSlots: 4, operatingHours: '10:00 - 23:00', pricePerSlot: 5000 },
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
    name: 'Casa Serenity',
    slug: 'casa-serenity',
    location: { address: 'Golf Course Extension Road', city: 'Gurugram', state: 'Haryana', pincode: '122018' },
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
      { name: 'Serenity Club', type: 'Clubhouse', totalSlots: 10, operatingHours: '07:00 - 22:00', pricePerSlot: 1500 },
      { name: 'Lap Pool', type: 'Swimming Pool', totalSlots: 15, operatingHours: '06:00 - 20:00', pricePerSlot: 500 },
      { name: 'Co-working Studio', type: 'Co-working Space', totalSlots: 20, operatingHours: '08:00 - 20:00', pricePerSlot: 200 },
    ],
    salesData: { totalRevenue: 298000000, soldUnits: 32, reservedUnits: 14 },
    specifications: {
      structure: 'Load-bearing structure with premium brick construction',
      flooring: 'European Oak hardwood, premium Italian tiles',
      kitchen: 'Chef\'s kitchen with island counter, built-in appliances',
      bathroom: 'Jacuzzi provisions, rain shower, luxury fittings',
    },
  },
  {
    _id: 'proj-003',
    name: 'Casa Pinnacle',
    slug: 'casa-pinnacle',
    location: { address: 'Bandra Kurla Complex', city: 'Mumbai', state: 'Maharashtra', pincode: '400051' },
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
      { name: 'Pinnacle Lounge', type: 'Clubhouse', totalSlots: 6, operatingHours: '24/7', pricePerSlot: 0 },
      { name: 'Sky Pool (Level 48)', type: 'Swimming Pool', totalSlots: 10, operatingHours: '06:00 - 23:00', pricePerSlot: 0 },
      { name: 'Business Suite', type: 'Co-working Space', totalSlots: 8, operatingHours: '24/7', pricePerSlot: 0 },
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

// Generate floor plan units for project 1
const generateUnits = (projectId, floors = 5, unitsPerFloor = 8) => {
  const units = [];
  const bhkTypes = ['2BHK', '2BHK', '3BHK', '3BHK', '4BHK', '2BHK', '3BHK', '4BHK'];
  const availabilities = ['Available', 'Available', 'Available', 'Reserved', 'Sold', 'Available', 'Reserved', 'Sold'];
  const facings = ['North', 'South', 'East', 'West', 'North-East', 'South-East', 'North-West', 'South-West'];

  // SVG floor plan grid: 4 units per row, 2 rows
  const svgPositions = [
    { x: 20, y: 80, width: 90, height: 65 },
    { x: 120, y: 80, width: 90, height: 65 },
    { x: 220, y: 80, width: 90, height: 65 },
    { x: 320, y: 80, width: 90, height: 65 },
    { x: 20, y: 165, width: 90, height: 65 },
    { x: 120, y: 165, width: 90, height: 65 },
    { x: 220, y: 165, width: 90, height: 65 },
    { x: 320, y: 165, width: 90, height: 65 },
  ];

  const basePrices = {
    '2BHK': 6500000,
    '3BHK': 9800000,
    '4BHK': 14500000,
    'Penthouse': 22000000,
  };

  const carpetAreas = { '2BHK': 950, '3BHK': 1350, '4BHK': 1850, 'Penthouse': 2800 };

  for (let floor = 1; floor <= floors; floor++) {
    for (let unit = 1; unit <= unitsPerFloor; unit++) {
      const bhkType = bhkTypes[(unit - 1) % bhkTypes.length];
      const basePrice = (basePrices[bhkType] || 9800000) + (floor * 50000); // premium per floor
      const carpetArea = carpetAreas[bhkType] || 1350;

      units.push({
        _id: `unit-${projectId}-f${floor}-u${unit}`,
        projectId,
        unitNumber: `${String.fromCharCode(65 + Math.floor((unit - 1) / 4))}${floor}0${unit}`,
        floor,
        tower: floor <= 16 ? 'A' : 'B',
        bhkType,
        carpetArea,
        builtUpArea: Math.round(carpetArea * 1.2),
        superBuiltUpArea: Math.round(carpetArea * 1.35),
        facing: facings[(unit - 1) % facings.length],
        availability: availabilities[(unit - 1) % availabilities.length],
        pricing: {
          basePrice,
          pricePerSqFt: Math.round(basePrice / carpetArea),
          stampDuty: 5,
          registrationFee: 1,
          maintenanceDeposit: 50000,
          parkingCharges: 150000,
          gst: 5,
        },
        svgCoordinates: svgPositions[(unit - 1) % svgPositions.length],
        amenities: ['Power Backup', 'Security', 'Lift'],
        balconies: bhkType === '2BHK' ? 1 : 2,
        parking: bhkType === '4BHK' ? 2 : 1,
      });
    }
  }
  return units;
};

const mockUnits = [
  ...generateUnits('proj-001', 10, 8),
  ...generateUnits('proj-002', 8, 6),
];

const mockBookings = [
  {
    _id: 'booking-001',
    bookingRef: 'AE-1719120000-XK7Y2',
    userId: 'user-demo-001',
    userName: 'Arjun Mehta',
    userEmail: 'arjun.mehta@email.com',
    userPhone: '+91-9876543210',
    bookingType: 'Purchase',
    unitId: 'unit-proj-001-f3-u2',
    projectId: 'proj-001',
    paymentStatus: 'Token Paid',
    tokenAmount: 200000,
    totalAmount: 9800000,
    status: 'Active',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    allotmentLetter: { generated: true, documentRef: 'AL-AE-1719120000', generatedAt: new Date(Date.now() - 86400000 * 3).toISOString() },
  },
  {
    _id: 'booking-002',
    bookingRef: 'AE-1719033600-PQ8R4',
    userId: 'user-demo-001',
    userName: 'Arjun Mehta',
    userEmail: 'arjun.mehta@email.com',
    userPhone: '+91-9876543210',
    bookingType: 'AmenityReservation',
    amenityId: 'amen-001',
    amenityName: 'Grand Clubhouse',
    slotDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    slotTime: '10:00 - 12:00',
    paymentStatus: 'Completed',
    tokenAmount: 1000,
    totalAmount: 1000,
    status: 'Active',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    allotmentLetter: { generated: false },
  },
];

const mockLedger = [
  {
    _id: 'ledger-001',
    userId: 'user-demo-001',
    userName: 'Arjun Mehta',
    unitId: 'unit-proj-001-f3-u2',
    projectId: 'proj-001',
    bookingId: 'booking-001',
    transactionType: 'Token Amount',
    amount: 200000,
    currency: 'INR',
    status: 'Completed',
    transactionDate: new Date(Date.now() - 86400000 * 3).toISOString(),
    paymentMethod: 'Online',
    receiptNumber: 'RCP-1719120001',
    referenceId: 'TXN-98765432',
    description: 'Token amount for Aura Horizon - Unit A302',
    digitalReceipt: { issued: true, issuedAt: new Date(Date.now() - 86400000 * 3).toISOString() },
  },
  {
    _id: 'ledger-002',
    userId: 'user-demo-001',
    userName: 'Arjun Mehta',
    transactionType: 'Amenity Charge',
    amount: 1000,
    currency: 'INR',
    status: 'Completed',
    transactionDate: new Date(Date.now() - 86400000).toISOString(),
    paymentMethod: 'Online',
    receiptNumber: 'RCP-1719206402',
    description: 'Clubhouse booking - 2 hours slot',
    digitalReceipt: { issued: true, issuedAt: new Date(Date.now() - 86400000).toISOString() },
  },
  {
    _id: 'ledger-003',
    userId: 'user-demo-001',
    userName: 'Arjun Mehta',
    transactionType: 'Maintenance Fee',
    amount: 8500,
    currency: 'INR',
    status: 'Pending',
    transactionDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 86400000 * 5).toISOString(),
    paymentMethod: 'Online',
    receiptNumber: null,
    description: 'Monthly maintenance fee - July 2026',
    digitalReceipt: { issued: false },
  },
];

module.exports = { mockProjects, mockUnits, mockBookings, mockLedger };
