const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema(
  {
    emailOrPhone: { type: String, required: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: { expires: 300 } }, // Expires in 5 minutes
  },
  { timestamps: true }
);

module.exports = mongoose.model('Otp', otpSchema);
