const mongoose = require('mongoose');
const Unit = require('../models/Unit');
const asyncWrapper = require('../middleware/asyncWrapper');
const { mockUnits } = require('../seed/mockData');

const isDBConnected = () => mongoose.connection.readyState === 1;

// GET /api/v1/units?projectId=xxx
exports.getUnits = asyncWrapper(async (req, res) => {
  const { projectId, floor, availability, tower } = req.query;

  if (!isDBConnected()) {
    let filtered = mockUnits;
    if (projectId) filtered = filtered.filter((u) => u.projectId === projectId);
    if (floor) filtered = filtered.filter((u) => u.floor === parseInt(floor));
    if (availability) filtered = filtered.filter((u) => u.availability === availability);
    if (tower) filtered = filtered.filter((u) => u.tower === tower);
    return res.json({ success: true, data: filtered, source: 'mock' });
  }

  const query = {};
  if (projectId) query.projectId = projectId;
  if (floor) query.floor = parseInt(floor);
  if (availability) query.availability = availability;
  if (tower) query.tower = tower;

  const units = await Unit.find(query).sort({ floor: 1, unitNumber: 1 });
  res.json({ success: true, count: units.length, data: units });
});

// GET /api/v1/units/:id
exports.getUnit = asyncWrapper(async (req, res) => {
  if (!isDBConnected()) {
    const unit = mockUnits.find((u) => u._id === req.params.id);
    if (!unit) return res.status(404).json({ success: false, message: 'Unit not found' });
    return res.json({ success: true, data: unit, source: 'mock' });
  }

  const unit = await Unit.findById(req.params.id).populate('projectId', 'name slug');
  if (!unit) return res.status(404).json({ success: false, message: 'Unit not found' });
  res.json({ success: true, data: unit });
});

// PATCH /api/v1/units/:id/availability
exports.updateAvailability = asyncWrapper(async (req, res) => {
  const { availability } = req.body;
  if (!['Available', 'Reserved', 'Sold'].includes(availability)) {
    return res.status(400).json({ success: false, message: 'Invalid availability status' });
  }

  if (!isDBConnected()) {
    const unit = mockUnits.find((u) => u._id === req.params.id);
    if (!unit) return res.status(404).json({ success: false, message: 'Unit not found' });
    unit.availability = availability;
    return res.json({ success: true, data: unit, source: 'mock' });
  }

  const unit = await Unit.findByIdAndUpdate(
    req.params.id,
    { $set: { availability } },
    { new: true, runValidators: true }
  );
  if (!unit) return res.status(404).json({ success: false, message: 'Unit not found' });
  res.json({ success: true, data: unit });
});
