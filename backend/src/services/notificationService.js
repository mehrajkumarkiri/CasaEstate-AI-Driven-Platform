/**
 * Notification Service — BuildFlow AI (Extended)
 * Handles both real estate booking alerts AND construction milestone events.
 * In production: integrate Socket.IO / Firebase / SendGrid / Twilio
 */

const sendNotification = ({ type, booking, docContent, milestone, prediction }) => {
  const timestamp = new Date().toISOString();

  switch (type) {
    // ── Real Estate Booking Alerts ──────────────────────────────────────────
    case 'BOOKING_CONFIRMED':
      console.log(`\n📧 [NOTIFICATION] Booking Confirmed`);
      console.log(`   To: ${booking.userEmail}`);
      console.log(`   Booking Ref: ${booking.bookingRef}`);
      console.log(`   Type: ${booking.bookingType}`);
      if (docContent) {
        console.log(`   Allotment Letter: ${docContent.documentRef} (Generated)`);
      }
      console.log(`   Timestamp: ${timestamp}\n`);
      if (global.io) {
        global.io.emit('booking:confirmed', { bookingRef: booking.bookingRef, timestamp });
      }
      break;

    case 'PAYMENT_RECEIVED':
      console.log(`\n💰 [NOTIFICATION] Payment Received`);
      console.log(`   Amount: ₹${booking.amount?.toLocaleString('en-IN')}`);
      console.log(`   Timestamp: ${timestamp}\n`);
      break;

    case 'UNIT_SATURATION_ALERT':
      console.log(`\n⚠️  [ALERT] Unit Saturation — ${booking?.projectName}: ${booking?.occupancyRate}% occupied`);
      break;

    // ── BuildFlow AI — Construction Milestone Alerts ────────────────────────
    case 'MILESTONE_UPDATED':
      console.log(`\n🏗️  [BUILDFLOW AI] Milestone Updated`);
      console.log(`   Project  : ${milestone?.projectName || 'N/A'}`);
      console.log(`   Phase    : ${milestone?.phase}`);
      console.log(`   Status   : ${milestone?.status} (${milestone?.progressPercent}% complete)`);
      console.log(`   Engineer : ${milestone?.updatedByName || 'Site Engineer'}`);
      console.log(`   Timestamp: ${timestamp}\n`);
      if (global.io) {
        global.io.emit('milestone:updated', {
          projectId: milestone?.projectId,
          phase: milestone?.phase,
          status: milestone?.status,
          progressPercent: milestone?.progressPercent,
          timestamp,
        });
      }
      break;

    case 'DEVIATION_DETECTED':
      console.log(`\n🚨 [BUILDFLOW AI — ALERT] Schedule Deviation Detected`);
      console.log(`   Project    : ${milestone?.projectName || 'N/A'}`);
      console.log(`   Phase      : ${milestone?.phase}`);
      console.log(`   Risk Level : ${prediction?.riskLevel}`);
      console.log(`   Deviation  : +${prediction?.deviationDays} day(s)`);
      console.log(`   New ETA    : ${prediction?.newEstimate ? new Date(prediction.newEstimate).toDateString() : 'Recalculating'}`);
      console.log(`   Reason     : ${prediction?.reasoning}`);
      console.log(`   Timestamp  : ${timestamp}\n`);
      if (global.io) {
        global.io.emit('buildflow:deviation', {
          projectId: milestone?.projectId,
          riskLevel: prediction?.riskLevel,
          deviationDays: prediction?.deviationDays,
          timestamp,
        });
      }
      break;

    case 'COST_OVERRUN':
      console.log(`\n💸 [BUILDFLOW AI — ALERT] Cost Overrun Detected`);
      console.log(`   Project     : ${milestone?.projectName || 'N/A'}`);
      console.log(`   Phase       : ${milestone?.phase}`);
      console.log(`   Variance    : ₹${milestone?.costVariance?.toLocaleString('en-IN')}`);
      console.log(`   Timestamp   : ${timestamp}\n`);
      if (global.io) {
        global.io.emit('buildflow:cost_overrun', {
          projectId: milestone?.projectId,
          costVariance: milestone?.costVariance,
          timestamp,
        });
      }
      break;

    default:
      console.log(`\n🔔 [NOTIFICATION] ${type} at ${timestamp}`);
  }
};

const scheduleMaintenanceReminder = ({ userId, userName, unitNumber, dueAmount, dueDate }) => {
  console.log(`\n🗓️  [REMINDER] Maintenance Due`);
  console.log(`   Resident: ${userName} (${userId})`);
  console.log(`   Unit: ${unitNumber}`);
  console.log(`   Amount: ₹${dueAmount?.toLocaleString('en-IN')}`);
  console.log(`   Due: ${dueDate}\n`);
};

module.exports = { sendNotification, scheduleMaintenanceReminder };

