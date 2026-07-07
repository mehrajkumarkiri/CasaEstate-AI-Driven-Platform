const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingRef: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    userPhone: { type: String, required: true },

    bookingType: {
      type: String,
      enum: ['Purchase', 'AmenityReservation', 'TourViewing'],
      required: true,
    },

    // For Purchase bookings
    unitId: { type: mongoose.Schema.Types.Mixed },
    projectId: { type: mongoose.Schema.Types.Mixed },

    // For Amenity bookings
    amenityId: String,
    amenityName: String,
    slotDate: Date,
    slotTime: String,

    paymentStatus: {
      type: String,
      enum: ['Pending', 'Token Paid', 'Partial', 'Completed', 'Refunded', 'Cancelled'],
      default: 'Pending',
    },

    tokenAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },

    // AI-generated document
    allotmentLetter: {
      generated: { type: Boolean, default: false },
      generatedAt: Date,
      documentRef: String,
      content: mongoose.Schema.Types.Mixed,
    },

    status: {
      type: String,
      enum: ['Active', 'Cancelled', 'Completed'],
      default: 'Active',
    },

    notes: String,
    approvedBy: String,
    approvedAt: Date,
  },
  { timestamps: true }
);

// Index for fast user queries
bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ unitId: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
