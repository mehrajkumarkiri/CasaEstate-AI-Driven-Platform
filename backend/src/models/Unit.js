const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    unitNumber: { type: String, required: true },
    floor: { type: Number, required: true },
    tower: { type: String, default: 'A' },
    bhkType: {
      type: String,
      enum: ['Studio', '1BHK', '2BHK', '3BHK', '4BHK', 'Penthouse'],
      required: true,
    },
    carpetArea: { type: Number, required: true }, // in sq ft
    builtUpArea: { type: Number },
    superBuiltUpArea: { type: Number },
    facing: {
      type: String,
      enum: ['North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West'],
    },
    availability: {
      type: String,
      enum: ['Available', 'Reserved', 'Sold'],
      default: 'Available',
    },
    pricing: {
      basePrice: { type: Number, required: true },
      pricePerSqFt: Number,
      stampDuty: { type: Number, default: 5 }, // percentage
      registrationFee: { type: Number, default: 1 }, // percentage
      maintenanceDeposit: { type: Number, default: 50000 },
      parkingCharges: { type: Number, default: 150000 },
      gst: { type: Number, default: 5 }, // percentage
    },
    // SVG floor plan positioning data
    svgCoordinates: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      width: { type: Number, default: 80 },
      height: { type: Number, default: 60 },
    },
    amenities: [String],
    balconies: { type: Number, default: 1 },
    parking: { type: Number, default: 1 },
    reservedAt: Date,
    reservedBy: String,
    soldAt: Date,
  },
  {
    timestamps: true,
    // Optimistic concurrency control via version key
    optimisticConcurrency: true,
  }
);

// Compound index to prevent duplicate unit numbers per project
unitSchema.index({ projectId: 1, unitNumber: 1 }, { unique: true });

// Compute total price on the fly
unitSchema.virtual('totalPrice').get(function () {
  const p = this.pricing;
  if (!p) return 0;
  const base = p.basePrice;
  const gstAmt = (base * p.gst) / 100;
  return base + gstAmt + (p.parkingCharges || 0) + (p.maintenanceDeposit || 0);
});

unitSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Unit', unitSchema);
