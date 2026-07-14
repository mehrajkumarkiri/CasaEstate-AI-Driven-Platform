const mongoose = require('mongoose');
const Ledger = require('../models/Ledger');
const asyncWrapper = require('../middleware/asyncWrapper');
const { mockLedger } = require('../seed/mockData');

const isDBConnected = () => mongoose.connection.readyState === 1;

// GET /api/v1/ledger?userId=xxx
exports.getLedger = asyncWrapper(async (req, res) => {
  const user = req.user;
  const { userId, unitId } = req.query;
  
  let targetUserId = userId;
  if (!user || user.role !== 'admin') {
    targetUserId = user ? user.userId : userId;
  }

  if (!isDBConnected()) {
    let data = mockLedger;
    if (targetUserId) data = data.filter((l) => l.userId === targetUserId);
    return res.json({ success: true, data, source: 'mock' });
  }
  const query = {};
  if (targetUserId) query.userId = targetUserId;
  if (unitId) query.unitId = unitId;
  const entries = await Ledger.find(query).sort({ transactionDate: -1 });
  res.json({ success: true, count: entries.length, data: entries });
});

// GET /api/v1/ledger/:id
exports.getLedgerEntry = asyncWrapper(async (req, res) => {
  const user = req.user;
  if (!isDBConnected()) {
    const entry = mockLedger.find((l) => l._id === req.params.id);
    if (!entry) return res.status(404).json({ success: false, message: 'Entry not found' });
    if (user && user.role !== 'admin' && entry.userId !== user.userId) {
      return res.status(403).json({ success: false, message: 'Access denied: You can only view your own ledger entries.' });
    }
    return res.json({ success: true, data: entry, source: 'mock' });
  }
  const entry = await Ledger.findById(req.params.id).populate('bookingId', 'bookingRef');
  if (!entry) return res.status(404).json({ success: false, message: 'Entry not found' });
  if (user && user.role !== 'admin' && entry.userId !== user.userId) {
    return res.status(403).json({ success: false, message: 'Access denied: You can only view your own ledger entries.' });
  }
  res.json({ success: true, data: entry });
});
