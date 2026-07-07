const nodemailer = require('nodemailer');
const twilio = require('twilio');

/**
 * Sends a real-time OTP via Email (using Nodemailer) or SMS (using Twilio).
 * Loads configuration from environment variables.
 * 
 * @param {string} emailOrPhone - The user's input (email address or phone number)
 * @param {string} otp - The 6-digit verification code
 * @returns {Promise<{ success: boolean, method: string, message: string }>}
 */
const sendRealTimeOtp = async (emailOrPhone, otp) => {
  const isEmail = emailOrPhone.includes('@');
  
  if (isEmail) {
    // ── EMAIL DELIVERY (NODEMAILER) ──
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT || 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.SMTP_FROM || user;

    if (!host || !user || !pass) {
      console.warn(`[OTP WARNING] SMTP is not fully configured in backend/.env.`);
      console.warn(`Please add SMTP_HOST, SMTP_USER, and SMTP_PASS to send real emails.`);
      console.log(`[DEVELOPER CONSOLE LOG] Real-world OTP for ${emailOrPhone} is: ${otp}`);
      return {
        success: false,
        method: 'email',
        message: 'SMTP credentials missing. OTP printed to server terminal.'
      };
    }

    try {
      const transporter = nodemailer.createTransport({
        host,
        port: parseInt(port, 10),
        secure: port == 465, // true for 465, false for other ports
        auth: {
          user,
          pass,
        },
      });

      const mailOptions = {
        from: `"BuildFlow AI Auth" <${from}>`,
        to: emailOrPhone,
        subject: `Your BuildFlow AI Verification Code: ${otp}`,
        text: `Hello,\n\nYour 6-digit verification code for BuildFlow AI (formerly CasaEstate) is: ${otp}\n\nThis code will expire in 5 minutes.\n\nBest regards,\nThe BuildFlow AI Team`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
            <h2 style="color: #1e293b; text-align: center;">BuildFlow AI Portal</h2>
            <p>Hello,</p>
            <p>Your 6-digit verification code for secure portal access is:</p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #2563eb; background-color: #eff6ff; padding: 10px 20px; border-radius: 8px; border: 1px solid #bfdbfe;">
                ${otp}
              </span>
            </div>
            <p>This verification code is valid for <strong>5 minutes</strong>. Do not share this code with anyone.</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
            <p style="font-size: 11px; color: #64748b; text-align: center;">
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        `,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`[OTP SUCCESS] Email sent to ${emailOrPhone}: ${info.messageId}`);
      return { success: true, method: 'email', message: 'OTP sent to your email address.' };
    } catch (error) {
      console.error(`[OTP ERROR] Failed to send email to ${emailOrPhone}:`, error);
      return { success: false, method: 'email', message: `Email send failure: ${error.message}` };
    }
  } else {
    // ── SMS DELIVERY (TWILIO) ──
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_FROM_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      console.warn(`[OTP WARNING] Twilio SMS config is missing in backend/.env.`);
      console.warn(`Please add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER to send real SMS.`);
      console.log(`[DEVELOPER CONSOLE LOG] Real-world OTP for ${emailOrPhone} is: ${otp}`);
      return {
        success: false,
        method: 'sms',
        message: 'Twilio credentials missing. OTP printed to server terminal.'
      };
    }

    try {
      const client = twilio(accountSid, authToken);
      const message = await client.messages.create({
        body: `Your BuildFlow AI verification code is: ${otp}. Valid for 5 minutes.`,
        from: fromNumber,
        to: emailOrPhone
      });

      console.log(`[OTP SUCCESS] SMS sent to ${emailOrPhone}: ${message.sid}`);
      return { success: true, method: 'sms', message: 'OTP sent to your mobile device.' };
    } catch (error) {
      console.error(`[OTP ERROR] Failed to send SMS to ${emailOrPhone}:`, error);
      return { success: false, method: 'sms', message: `SMS send failure: ${error.message}` };
    }
  }
};

module.exports = { sendRealTimeOtp };
