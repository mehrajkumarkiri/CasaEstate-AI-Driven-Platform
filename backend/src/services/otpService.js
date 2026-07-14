const nodemailer = require('nodemailer');
const twilio = require('twilio');

/**
 * Sends a real-time OTP via Email or SMS.
 * Uses the OTP_API_KEY for HTTP API delivery when defined.
 * Falls back to Twilio/Nodemailer if specific credentials exist.
 * Otherwise, outputs the code in the terminal for local sandbox simulation.
 * 
 * @param {string} emailOrPhone - The user's input (email address or phone number)
 * @param {string} otp - The 6-digit verification code
 * @returns {Promise<{ success: boolean, method: string, message: string }>}
 */
const sendRealTimeOtp = async (emailOrPhone, otp) => {
  const isEmail = emailOrPhone.includes('@');
  const apiKey = process.env.OTP_API_KEY;

  if (apiKey && apiKey !== 'your-otp-api-key') {
    console.log(`[OTP INITIATOR] Deploying API Key dispatch using key: ${apiKey.substring(0, 4)}...`);
    
    if (isEmail) {
      // ── EMAIL DELIVERY via Brevo/Sendinblue HTTP API ──
      try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'api-key': apiKey,
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            sender: { name: 'CasaEstate Auth', email: 'auth@casaestate.com' },
            to: [{ email: emailOrPhone }],
            subject: `Your CasaEstate Verification Code: ${otp}`,
            textContent: `Hello,\n\nYour 6-digit verification code is: ${otp}\n\nValid for 5 minutes.`,
            htmlContent: `<h3>CasaEstate Secure Access</h3><p>Your 6-digit verification code is: <strong>${otp}</strong></p><p>Valid for 5 minutes.</p>`
          })
        });

        if (response.ok) {
          console.log(`[OTP SUCCESS] Email sent to ${emailOrPhone} via Brevo API`);
          return { success: true, method: 'email-api', message: 'OTP sent to your email.' };
        } else {
          const errData = await response.json().catch(() => ({}));
          console.warn(`[OTP WARNING] Brevo API rejected request:`, errData);
          throw new Error(errData.message || 'Brevo API error');
        }
      } catch (err) {
        console.error(`[OTP ERROR] Brevo API dispatch failed:`, err.message);
      }
    } else {
      // ── SMS DELIVERY via 2Factor HTTP API ──
      try {
        const cleanPhone = emailOrPhone.replace(/\D/g, '');
        // 2Factor URL format: https://2factor.in/API/V1/{api_key}/SMS/{phone_number}/{otp_val}/OTPSENT
        const url = `https://2factor.in/API/V1/${apiKey}/SMS/${cleanPhone}/${otp}/OTPSENT`;
        const response = await fetch(url);
        
        if (response.ok) {
          console.log(`[OTP SUCCESS] SMS sent to ${emailOrPhone} via 2Factor API`);
          return { success: true, method: 'sms-api', message: 'OTP sent to your mobile.' };
        } else {
          const errText = await response.text();
          console.warn(`[OTP WARNING] 2Factor API rejected request:`, errText);
          throw new Error(errText || '2Factor API error');
        }
      } catch (err) {
        console.error(`[OTP ERROR] 2Factor API dispatch failed:`, err.message);
      }
    }
  }

  // ── FALLBACK 1: Standard Nodemailer/Twilio ──
  if (isEmail) {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT || 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.SMTP_FROM || user;

    if (host && user && pass) {
      try {
        const transporter = nodemailer.createTransport({
          host,
          port: parseInt(port, 10),
          secure: port == 465,
          auth: { user, pass },
        });

        await transporter.sendMail({
          from: `"CasaEstate Auth" <${from}>`,
          to: emailOrPhone,
          subject: `Your CasaEstate Verification Code: ${otp}`,
          text: `Your 6-digit verification code is: ${otp}`,
        });

        console.log(`[OTP SUCCESS] Email sent to ${emailOrPhone} via Nodemailer SMTP`);
        return { success: true, method: 'email-smtp', message: 'OTP sent to email.' };
      } catch (error) {
        console.error(`[OTP ERROR] Nodemailer SMTP failed:`, error.message);
      }
    }
  } else {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_FROM_NUMBER;

    if (accountSid && authToken && fromNumber) {
      try {
        const client = twilio(accountSid, authToken);
        await client.messages.create({
          body: `Your CasaEstate verification code is: ${otp}. Valid for 5 minutes.`,
          from: fromNumber,
          to: emailOrPhone
        });

        console.log(`[OTP SUCCESS] SMS sent to ${emailOrPhone} via Twilio`);
        return { success: true, method: 'sms-twilio', message: 'OTP sent to mobile.' };
      } catch (error) {
        console.error(`[OTP ERROR] Twilio failed:`, error.message);
      }
    }
  }

  // ── FALLBACK 2: Local sandbox terminal logging ──
  console.log(`\n===========================================`);
  console.log(`🔑  [OTP SIMULATOR LOG] Target: ${emailOrPhone}`);
  console.log(`🔑  Verification Code (OTP): ${otp}`);
  console.log(`===========================================\n`);

  return {
    success: false,
    method: 'simulator',
    message: 'OTP logged to server terminal for testing.'
  };
};

module.exports = { sendRealTimeOtp };
