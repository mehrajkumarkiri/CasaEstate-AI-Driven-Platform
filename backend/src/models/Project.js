const mongoose = require('mongoose');

const amenitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['Clubhouse', 'Tennis Court', 'Swimming Pool', 'Gym', 'Party Hall', 'Co-working Space'], required: true },
  totalSlots: { type: Number, default: 10 },
  operatingHours: { type: String, default: '06:00 - 22:00' },
  pricePerSlot: { type: Number, default: 500 },
});

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Project name is required'], trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    location: {
      address: String,
      city: { type: String, required: true },
      state: String,
      pincode: String,
      coordinates: { lat: Number, lng: Number },
    },
    description: { type: String, required: true },
    tagline: String,
    heroImage: String,
    gallery: [String],
    status: {
      type: String,
      enum: ['Pre-Launch', 'Under Construction', 'Ready to Move', 'Sold Out'],
      default: 'Under Construction',
    },
    totalUnits: { type: Number, required: true },
    totalFloors: { type: Number, default: 10 },
    totalTowers: { type: Number, default: 1 },
    possessionDate: Date,
    reraNumber: String,
    amenities: [amenitySchema],
    priceRange: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
      currency: { type: String, default: 'INR' },
    },
    features: [String],
    specifications: {
      structure: String,
      flooring: String,
      kitchen: String,
      bathroom: String,
    },
    salesData: {
      totalRevenue: { type: Number, default: 0 },
      soldUnits: { type: Number, default: 0 },
      reservedUnits: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);
