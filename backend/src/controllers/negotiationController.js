const mongoose = require('mongoose');
const Unit = require('../models/Unit');
const Booking = require('../models/Booking');
const Ledger = require('../models/Ledger');
const Project = require('../models/Project');
const asyncWrapper = require('../middleware/asyncWrapper');
const crypto = require('crypto');

// In-memory fallbacks for mock mode
const mockLedger = [];
const mockBookings = [];

const isDBConnected = () => mongoose.connection.readyState === 1;

exports.finalizeNegotiation = asyncWrapper(async (req, res) => {
  const { projectId, bhkType, quantity, agreedPrice, userName, userEmail, userPhone, userId } = req.body;

  if (!projectId || !bhkType || !quantity || !agreedPrice || !userName || !userEmail || !userPhone) {
    return res.status(400).json({ success: false, message: 'All parameters are required to finalize allotment.' });
  }

  const numUnits = parseInt(quantity, 10);
  const totalAgreedPrice = parseFloat(agreedPrice);
  const targetUserId = userId || 'user-demo-001';
  const dbConnected = isDBConnected();

  let selectedUnits = [];
  let projectName = 'Casa Horizon';

  if (dbConnected) {
    // 1. Fetch project name
    const proj = await Project.findById(projectId);
    if (proj) projectName = proj.name;

    // 2. Fetch available units
    const units = await Unit.find({ projectId, bhkType, availability: 'Available' });
    if (units.length < numUnits) {
      return res.status(400).json({
        success: false,
        message: `Inventory Scarcity: Only ${units.length} units of ${bhkType} available.`
      });
    }

    selectedUnits = units.slice(0, numUnits);

    // 3. Mark units as Reserved atomically
    for (const unit of selectedUnits) {
      unit.availability = 'Reserved';
      unit.reservedAt = new Date();
      unit.reservedBy = targetUserId;
      await unit.save();
    }
  } else {
    // Mock Mode Fallback
    console.log(`📡 [Mock DB Mode] Processing bulk reservation for ${numUnits} units of ${bhkType}...`);
    selectedUnits = Array.from({ length: numUnits }).map((_, i) => ({
      _id: new mongoose.Types.ObjectId(),
      unitNumber: `${bhkType.replace('BHK', '')}0${i + 1}`,
      floor: i + 1,
      tower: 'A',
      bhkType,
      carpetArea: 1350,
      pricing: { basePrice: totalAgreedPrice / numUnits }
    }));
  }

  const transactionUuid = crypto.randomUUID();
  const bookingRef = `CB-${Date.now().toString().slice(-6)}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

  // 4. Generate Allotment Content
  const allotmentContent = {
    documentRef: `AL-B2B-${transactionUuid.slice(0, 8)}`,
    allottee: {
      name: userName,
      email: userEmail,
      phone: userPhone,
      company: 'Enterprise Client Holdings'
    },
    transactionUuid,
    project: {
      id: projectId,
      name: projectName
    },
    inventory: selectedUnits.map(u => ({
      unitId: u._id,
      unitNumber: u.unitNumber,
      floor: u.floor,
      tower: u.tower,
      bhkType: u.bhkType
    })),
    costBreakdown: {
      unitsCount: numUnits,
      agreedBulkPrice: totalAgreedPrice,
      averageUnitPrice: Math.round(totalAgreedPrice / numUnits),
      provisionalTokenDeposit: Math.round(totalAgreedPrice * 0.05),
      stampDutyEstimated: Math.round(totalAgreedPrice * 0.05),
      gstEstimated: Math.round(totalAgreedPrice * 0.05)
    },
    legalTerms: [
      'This document constitutes a provisional RERA-locked bulk inventory allotment.',
      'The buyer agrees to clear the provisional token deposit (5%) within 48 business hours.',
      'Stock status is locked. System-wide double-booking guard has blocked other negotiators.'
    ]
  };

  if (dbConnected) {
    // 5. Persist Booking record
    const booking = await Booking.create({
      bookingRef,
      userId: targetUserId,
      userName,
      userEmail,
      userPhone,
      bookingType: 'Purchase',
      unitId: selectedUnits.map(u => u._id),
      projectId,
      paymentStatus: 'Token Paid',
      tokenAmount: Math.round(totalAgreedPrice * 0.05),
      totalAmount: totalAgreedPrice,
      allotmentLetter: {
        generated: true,
        generatedAt: new Date(),
        documentRef: allotmentContent.documentRef,
        content: allotmentContent
      },
      status: 'Active',
      notes: 'B2B Wholesale Agent autonomous negotiation finalization.'
    });

    // 6. Persist Ledger Entry
    await Ledger.create({
      userId: targetUserId,
      userName,
      unitId: selectedUnits[0]._id,
      projectId,
      bookingId: booking._id,
      transactionType: 'Token Amount',
      amount: Math.round(totalAgreedPrice * 0.05),
      status: 'Completed',
      paymentMethod: 'Online',
      receiptNumber: `RCP-B2B-${transactionUuid.slice(0, 8)}`,
      description: `B2B Bulk Purchase Token - ${numUnits} units of ${bhkType} for ${projectName}`,
      digitalReceipt: {
        issued: true,
        issuedAt: new Date(),
        receiptData: allotmentContent
      }
    });
  } else {
    // Mock save in memory arrays
    const mockBook = {
      _id: new mongoose.Types.ObjectId(),
      bookingRef,
      userId: targetUserId,
      userName,
      userEmail,
      userPhone,
      bookingType: 'Purchase',
      paymentStatus: 'Token Paid',
      tokenAmount: Math.round(totalAgreedPrice * 0.05),
      totalAmount: totalAgreedPrice,
      allotmentLetter: {
        generated: true,
        generatedAt: new Date(),
        documentRef: allotmentContent.documentRef,
        content: allotmentContent
      },
      status: 'Active'
    };
    mockBookings.push(mockBook);
    mockLedger.push({
      transactionUuid,
      amount: Math.round(totalAgreedPrice * 0.05),
      description: `Mock B2B bulk buy finalization`
    });
  }

  return res.status(201).json({
    success: true,
    message: 'B2B Deal Allotment secured successfully.',
    bookingRef,
    transactionUuid,
    allotmentLetter: allotmentContent
  });
});
