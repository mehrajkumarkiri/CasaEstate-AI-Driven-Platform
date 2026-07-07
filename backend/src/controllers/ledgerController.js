const mongoose = require('mongoose');
const Ledger = require('../models/Ledger');
const asyncWrapper = require('../middleware/asyncWrapper');
const { mockLedger } = require('../seed/mockData');

const isDBConnected = () => mongoose.connection.readyState === 1;

// GET /api/v1/ledger?userId=xxx
exports.getLedger = asyncWrapper(async (req, res) => {
  const { userId, unitId } = req.query;
  if (!isDBConnected()) {
    let data = mockLedger;
    if (userId) data = data.filter((l) => l.userId === userId);
    return res.json({ success: true, data, source: 'mock' });
  }
  const query = {};
  if (userId) query.userId = userId;
  if (unitId) query.unitId = unitId;
  const entries = await Ledger.find(query).sort({ transactionDate: -1 });
  res.json({ success: true, count: entries.length, data: entries });
});

// GET /api/v1/ledger/:id
exports.getLedgerEntry = asyncWrapper(async (req, res) => {
  if (!isDBConnected()) {
    const entry = mockLedger.find((l) => l._id === req.params.id);
    if (!entry) return res.status(404).json({ success: false, message: 'Entry not found' });
    return res.json({ success: true, data: entry, source: 'mock' });
  }
  const entry = await Ledger.findById(req.params.id).populate('bookingId', 'bookingRef');
  if (!entry) return res.status(404).json({ success: false, message: 'Entry not found' });
  res.json({ success: true, data: entry });
});
