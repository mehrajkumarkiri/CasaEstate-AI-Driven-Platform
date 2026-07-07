const mongoose = require('mongoose');
const Project = require('../models/Project');
const Unit = require('../models/Unit');
const asyncWrapper = require('../middleware/asyncWrapper');
const { mockProjects } = require('../seed/mockData');

const isDBConnected = () => mongoose.connection.readyState === 1;

// GET /api/v1/projects
exports.getAllProjects = asyncWrapper(async (_req, res) => {
  if (!isDBConnected()) {
    return res.json({ success: true, data: mockProjects, source: 'mock' });
  }
  const projects = await Project.find().sort({ createdAt: -1 });
  res.json({ success: true, count: projects.length, data: projects });
});

// GET /api/v1/projects/:id
exports.getProject = asyncWrapper(async (req, res) => {
  if (!isDBConnected()) {
    const project = mockProjects.find((p) => p._id === req.params.id || p.slug === req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    return res.json({ success: true, data: project, source: 'mock' });
  }
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
  res.json({ success: true, data: project });
});

// GET /api/v1/projects/:id/analytics
exports.getProjectAnalytics = asyncWrapper(async (req, res) => {
  if (!isDBConnected()) {
    return res.json({ success: true, data: generateMockAnalytics(), source: 'mock' });
  }

  const projectId = req.params.id;
  const units = await Unit.find({ projectId });

  const analytics = {
    totalUnits: units.length,
    available: units.filter((u) => u.availability === 'Available').length,
    reserved: units.filter((u) => u.availability === 'Reserved').length,
    sold: units.filter((u) => u.availability === 'Sold').length,
    occupancyRate: ((units.filter((u) => u.availability !== 'Available').length / units.length) * 100).toFixed(1),
    revenueProjected: units.filter((u) => u.availability === 'Sold').reduce((sum, u) => sum + u.pricing.basePrice, 0),
    byBHK: ['Studio', '1BHK', '2BHK', '3BHK', '4BHK', 'Penthouse'].map((bhk) => ({
      type: bhk,
      total: units.filter((u) => u.bhkType === bhk).length,
      sold: units.filter((u) => u.bhkType === bhk && u.availability === 'Sold').length,
    })),
    byFloor: [...new Set(units.map((u) => u.floor))].sort((a, b) => a - b).map((floor) => ({
      floor,
      available: units.filter((u) => u.floor === floor && u.availability === 'Available').length,
      reserved: units.filter((u) => u.floor === floor && u.availability === 'Reserved').length,
      sold: units.filter((u) => u.floor === floor && u.availability === 'Sold').length,
    })),
  };

  res.json({ success: true, data: analytics });
});

// POST /api/v1/projects
exports.createProject = asyncWrapper(async (req, res) => {
  if (!isDBConnected()) return res.status(503).json({ success: false, message: 'Database not connected' });
  const project = await Project.create(req.body);
  res.status(201).json({ success: true, data: project });
});

// GET /api/v1/projects/analytics/global
exports.getGlobalAnalytics = asyncWrapper(async (_req, res) => {
  res.json({ success: true, data: generateMockAnalytics(), source: 'mock' });
});

function generateMockAnalytics() {
  return {
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
      { name: 'Clubhouse', utilization: 78, bookings: 234 },
      { name: 'Swimming Pool', utilization: 65, bookings: 189 },
      { name: 'Tennis Court', utilization: 45, bookings: 127 },
      { name: 'Gym', utilization: 92, bookings: 312 },
      { name: 'Co-working', utilization: 55, bookings: 156 },
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
}
