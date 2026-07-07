const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const Booking = require('../models/Booking');
const Unit = require('../models/Unit');
const Ledger = require('../models/Ledger');
const asyncWrapper = require('../middleware/asyncWrapper');
const documentGenerator = require('../services/documentGenerator');
const notificationService = require('../services/notificationService');
const { mockBookings } = require('../seed/mockData');

const isDBConnected = () => mongoose.connection.readyState === 1;

// GET /api/v1/bookings
exports.getBookings = asyncWrapper(async (req, res) => {
  const { userId, status, bookingType } = req.query;
  if (!isDBConnected()) {
    let data = mockBookings;
    if (userId) data = data.filter((b) => b.userId === userId);
    return res.json({ success: true, data, source: 'mock' });
  }
  const query = {};
  if (userId) query.userId = userId;
  if (status) query.status = status;
  if (bookingType) query.bookingType = bookingType;
  const bookings = await Booking.find(query)
    .populate('unitId', 'unitNumber floor bhkType')
    .populate('projectId', 'name slug')
    .sort({ createdAt: -1 });
  res.json({ success: true, count: bookings.length, data: bookings });
});

// GET /api/v1/bookings/:id
exports.getBooking = asyncWrapper(async (req, res) => {
  if (!isDBConnected()) {
    const b = mockBookings.find((b) => b._id === req.params.id);
    if (!b) return res.status(404).json({ success: false, message: 'Booking not found' });
    return res.json({ success: true, data: b, source: 'mock' });
  }
  const booking = await Booking.findById(req.params.id)
    .populate('unitId')
    .populate('projectId', 'name location amenities');
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
  res.json({ success: true, data: booking });
});

/**
 * POST /api/v1/bookings
 * Race-condition safe booking using MongoDB findOneAndUpdate atomic operation.
 * Two concurrent requests for the same unit will result in only one succeeding.
 */
exports.createBooking = asyncWrapper(async (req, res) => {
  const { userId, userName, userEmail, userPhone, bookingType, unitId, projectId,
          amenityId, amenityName, slotDate, slotTime, tokenAmount } = req.body;

  if (!isDBConnected()) {
    // Mock booking creation
    const newBooking = {
      _id: uuidv4(),
      bookingRef: `AE-${Date.now()}`,
      userId, userName, userEmail, userPhone, bookingType,
      unitId, projectId, amenityId, amenityName, slotDate, slotTime,
      tokenAmount: tokenAmount || 100000,
      totalAmount: tokenAmount ? tokenAmount * 10 : 8500000,
      paymentStatus: 'Token Paid',
      status: 'Active',
      createdAt: new Date().toISOString(),
      allotmentLetter: {
        generated: true,
        generatedAt: new Date().toISOString(),
        documentRef: `AL-${Date.now()}`,
        content: documentGenerator.generateDocument({ userName, userEmail, unitId, projectId, bookingRef: `AE-${Date.now()}` }),
      },
    };
    mockBookings.push(newBooking);
    notificationService.sendNotification({ type: 'BOOKING_CONFIRMED', booking: newBooking });
    return res.status(201).json({ success: true, data: newBooking, source: 'mock' });
  }

  // ── Real DB path: atomic race-condition-safe unit reservation ──────────────
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let unit = null;
    if (bookingType === 'Purchase' && unitId) {
      // Atomic: only update if currently 'Available'
      unit = await Unit.findOneAndUpdate(
        { _id: unitId, availability: 'Available' },
        { $set: { availability: 'Reserved', reservedAt: new Date(), reservedBy: userId } },
        { new: true, session }
      );
      if (!unit) {
        await session.abortTransaction();
        session.endSession();
        return res.status(409).json({
          success: false,
          message: 'This unit has just been reserved by another client. Please choose a different unit.',
        });
      }
    }

    const bookingRef = `AE-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    const totalAmount = unit ? unit.totalPrice : (tokenAmount || 0);

    const booking = await Booking.create(
      [{
        bookingRef,
        userId, userName, userEmail, userPhone,
        bookingType, unitId, projectId,
        amenityId, amenityName, slotDate, slotTime,
        tokenAmount: tokenAmount || 100000,
        totalAmount,
        paymentStatus: 'Token Paid',
        status: 'Active',
      }],
      { session }
    );

    // Create ledger entry
    await Ledger.create(
      [{
        userId, userName,
        unitId: unitId || null,
        projectId: projectId || null,
        bookingId: booking[0]._id,
        transactionType: 'Token Amount',
        amount: tokenAmount || 100000,
        paymentMethod: 'Online',
        receiptNumber: `RCP-${Date.now()}`,
        status: 'Completed',
        description: `Token amount for booking ${bookingRef}`,
      }],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    // Generate allotment letter asynchronously (non-blocking)
    const docContent = documentGenerator.generateDocument({
      userName, userEmail, userPhone, bookingRef,
      unit, projectId, totalAmount,
    });

    await Booking.findByIdAndUpdate(booking[0]._id, {
      $set: {
        'allotmentLetter.generated': true,
        'allotmentLetter.generatedAt': new Date(),
        'allotmentLetter.documentRef': `AL-${bookingRef}`,
        'allotmentLetter.content': docContent,
      },
    });

    notificationService.sendNotification({ type: 'BOOKING_CONFIRMED', booking: booking[0], docContent });

    res.status(201).json({ success: true, data: { ...booking[0].toObject(), allotmentLetter: { content: docContent, generated: true } } });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
});

// PATCH /api/v1/bookings/:id/approve
exports.approveBooking = asyncWrapper(async (req, res) => {
  if (!isDBConnected()) {
    const b = mockBookings.find((b) => b._id === req.params.id);
    if (b) { b.paymentStatus = 'Completed'; b.status = 'Completed'; }
    return res.json({ success: true, data: b, source: 'mock' });
  }
  const booking = await Booking.findByIdAndUpdate(
    req.params.id,
    { $set: { paymentStatus: 'Completed', status: 'Completed', approvedBy: 'admin', approvedAt: new Date() } },
    { new: true }
  );
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

  // Mark unit as Sold
  if (booking.unitId) {
    await Unit.findByIdAndUpdate(booking.unitId, { $set: { availability: 'Sold', soldAt: new Date() } });
  }
  res.json({ success: true, data: booking });
});

// DELETE /api/v1/bookings/:id
exports.cancelBooking = asyncWrapper(async (req, res) => {
  if (!isDBConnected()) {
    const idx = mockBookings.findIndex((b) => b._id === req.params.id);
    if (idx > -1) mockBookings[idx].status = 'Cancelled';
    return res.json({ success: true, message: 'Booking cancelled', source: 'mock' });
  }
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

  booking.status = 'Cancelled';
  booking.paymentStatus = 'Cancelled';
  await booking.save();

  if (booking.unitId) {
    await Unit.findByIdAndUpdate(booking.unitId, { $set: { availability: 'Available', reservedAt: null, reservedBy: null } });
  }
  res.json({ success: true, message: 'Booking cancelled and unit released' });
});
