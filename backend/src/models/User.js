const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String },
    role: {
      type: String,
      enum: ['buyer', 'resident', 'admin', 'engineer'],
      default: 'buyer',
    },
    // For residents, link to their project and unit
    projectId: { type: mongoose.Schema.Types.Mixed },
    unitId: { type: mongoose.Schema.Types.Mixed },
    tower: String,
    unitNumber: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
