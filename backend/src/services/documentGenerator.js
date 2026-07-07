/**
 * AI Document Generation Service
 * Generates structured Allotment Letters & Cost Quotation Invoices.
 * In production, this would integrate with a PDF generation library (e.g., PDFKit).
 */

const generateDocument = ({ userName, userEmail, userPhone, bookingRef, unit, projectId, totalAmount }) => {
  const now = new Date();
  const formatCurrency = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

  const basePrice = unit?.pricing?.basePrice || totalAmount || 8500000;
  const gstPct = unit?.pricing?.gst || 5;
  const gstAmt = Math.round((basePrice * gstPct) / 100);
  const stampDutyPct = unit?.pricing?.stampDuty || 5;
  const stampDutyAmt = Math.round((basePrice * stampDutyPct) / 100);
  const regFee = Math.round((basePrice * (unit?.pricing?.registrationFee || 1)) / 100);
  const parking = unit?.pricing?.parkingCharges || 150000;
  const maintenance = unit?.pricing?.maintenanceDeposit || 50000;
  const grandTotal = basePrice + gstAmt + stampDutyAmt + regFee + parking + maintenance;

  const paymentSchedule = [
    { milestone: 'Token Amount (on Booking)', percentage: 2, amount: Math.round(basePrice * 0.02), dueDate: formatDate(now) },
    { milestone: 'Down Payment (within 30 days)', percentage: 15, amount: Math.round(basePrice * 0.15), dueDate: formatDate(addDays(now, 30)) },
    { milestone: 'On Commencement of Foundation', percentage: 10, amount: Math.round(basePrice * 0.10), dueDate: formatDate(addDays(now, 90)) },
    { milestone: 'On Completion of Structure (Floor 5)', percentage: 15, amount: Math.round(basePrice * 0.15), dueDate: formatDate(addDays(now, 180)) },
    { milestone: 'On Completion of Brickwork', percentage: 10, amount: Math.round(basePrice * 0.10), dueDate: formatDate(addDays(now, 270)) },
    { milestone: 'On Completion of Flooring', percentage: 10, amount: Math.round(basePrice * 0.10), dueDate: formatDate(addDays(now, 360)) },
    { milestone: 'On Offer of Possession', percentage: 20, amount: Math.round(basePrice * 0.20), dueDate: formatDate(addDays(now, 540)) },
    { milestone: 'At the Time of Registration', percentage: 18, amount: Math.round(basePrice * 0.18), dueDate: formatDate(addDays(now, 570)) },
  ];

  const legalTerms = [
    'This allotment is subject to the terms and conditions of the Builder-Buyer Agreement.',
    'The allottee shall pay all dues as per the agreed payment schedule. Delay will attract interest @ 15% p.a.',
    'The allottee shall not transfer or assign the allotment without prior written consent from AuraEstates Pvt. Ltd.',
    'Force majeure clauses apply for construction delays beyond the builder\'s control.',
    'Possession subject to completion of all payments and obtaining OC/CC from competent authorities.',
    'Maintenance charges shall be applicable from the date of possession at prevailing rates.',
    'The apartment dimensions are subject to minor variations (+/- 3%) as per RERA guidelines.',
    'This document is auto-generated and constitutes a provisional allotment. The formal Agreement for Sale shall be executed separately.',
  ];

  return {
    documentType: 'Provisional Allotment Letter & Cost Quotation Invoice',
    documentRef: `AL-${bookingRef}`,
    issuedAt: now.toISOString(),
    validUntil: addDays(now, 30).toISOString(),
    issuer: {
      company: 'AuraEstates Infrastructure Pvt. Ltd.',
      address: 'AuraEstates Corporate Tower, Sector 74, Noida, UP - 201301',
      rera: 'UPRERAPRJ' + Math.floor(Math.random() * 900000 + 100000),
      gstin: '09AABCA1234B1ZA',
      cin: 'U70200UP2018PTC123456',
    },
    allottee: {
      name: userName,
      email: userEmail,
      phone: userPhone,
    },
    unit: {
      number: unit?.unitNumber || 'B-402',
      floor: unit?.floor || 4,
      tower: unit?.tower || 'B',
      bhkType: unit?.bhkType || '3BHK',
      carpetArea: unit?.carpetArea || 1450,
      superBuiltUpArea: unit?.superBuiltUpArea || 1850,
      facing: unit?.facing || 'North-East',
    },
    costBreakdown: {
      basePrice: { label: 'Base Sale Price', amount: basePrice, formatted: formatCurrency(basePrice) },
      gst: { label: `GST @ ${gstPct}%`, amount: gstAmt, formatted: formatCurrency(gstAmt) },
      stampDuty: { label: `Stamp Duty @ ${stampDutyPct}%`, amount: stampDutyAmt, formatted: formatCurrency(stampDutyAmt) },
      registrationFee: { label: 'Registration Fee @ 1%', amount: regFee, formatted: formatCurrency(regFee) },
      parkingCharges: { label: 'Parking Charges (1 Covered)', amount: parking, formatted: formatCurrency(parking) },
      maintenanceDeposit: { label: 'Maintenance Deposit (2 Years)', amount: maintenance, formatted: formatCurrency(maintenance) },
      grandTotal: { label: 'Grand Total (All Inclusive)', amount: grandTotal, formatted: formatCurrency(grandTotal) },
    },
    paymentSchedule,
    legalTerms,
    signatures: {
      allottee: { name: userName, date: now.toISOString(), status: 'Pending' },
      authorizedSignatory: { name: 'Rajesh Kumar Sharma', designation: 'Head of Sales', date: now.toISOString(), status: 'Signed' },
    },
  };
};

const formatDate = (d) => d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
const addDays = (d, days) => new Date(d.getTime() + days * 86400000);

module.exports = { generateDocument };
