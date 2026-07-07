const mongoose = require('mongoose');

const ledgerEntrySchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    userName: String,
    unitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit' },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },

    transactionType: {
      type: String,
      enum: [
        'Token Amount',
        'Down Payment',
        'EMI',
        'Maintenance Fee',
        'Amenity Charge',
        'Penalty',
        'Refund',
        'Registration Fee',
        'Stamp Duty',
      ],
      required: true,
    },

    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },

    status: {
      type: String,
      enum: ['Pending', 'Processing', 'Completed', 'Failed', 'Refunded'],
      default: 'Completed',
    },

    transactionDate: { type: Date, default: Date.now },
    dueDate: Date,

    paymentMethod: {
      type: String,
      enum: ['Online', 'Cheque', 'NEFT', 'RTGS', 'Cash', 'DD'],
      default: 'Online',
    },

    receiptNumber: String,
    referenceId: String,
    description: String,

    // Digital receipt blob (structured)
    digitalReceipt: {
      issued: { type: Boolean, default: false },
      issuedAt: Date,
      receiptData: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

ledgerEntrySchema.index({ userId: 1, transactionDate: -1 });
ledgerEntrySchema.index({ unitId: 1 });

module.exports = mongoose.model('Ledger', ledgerEntrySchema);
