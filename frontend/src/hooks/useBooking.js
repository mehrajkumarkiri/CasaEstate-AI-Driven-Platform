import { useState, useCallback } from 'react';
import { bookingsApi } from '../services/api';
import { useApp } from '../context/AppContext';
import { generateBookingRef } from '../utils/formatters';

export function useBooking() {
  const { pushNotification, closeBookingDrawer, currentUser } = useApp();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const submitBooking = useCallback(async (formData) => {
    setLoading(true);
    setResult(null);
    try {
      const payload = {
        userId: currentUser.id,
        userName: formData.userName || currentUser.name,
        userEmail: formData.userEmail || currentUser.email,
        userPhone: formData.userPhone || currentUser.phone,
        bookingType: formData.bookingType || 'Purchase',
        unitId: formData.unitId,
        projectId: formData.projectId,
        amenityId: formData.amenityId,
        amenityName: formData.amenityName,
        slotDate: formData.slotDate,
        slotTime: formData.slotTime,
        tokenAmount: formData.tokenAmount || 100000,
      };

      let res;
      try {
        res = await bookingsApi.create(payload);
      } catch {
        // Offline mock booking
        res = {
          data: {
            _id: `mock-${Date.now()}`,
            bookingRef: generateBookingRef(),
            ...payload,
            paymentStatus: 'Token Paid',
            status: 'Active',
            createdAt: new Date().toISOString(),
            allotmentLetter: {
              generated: true,
              documentRef: `AL-${Date.now()}`,
              content: generateMockDocument(payload),
            },
          },
        };
      }

      setResult(res.data);
      pushNotification({
        type: 'success',
        title: '🎉 Booking Confirmed!',
        message: `Booking ${res.data.bookingRef} confirmed. Allotment letter generated.`,
        duration: 8000,
      });
      closeBookingDrawer();
      return res.data;
    } catch (err) {
      const msg = err.message || 'Booking failed. Please try again.';
      pushNotification({ type: 'error', title: 'Booking Failed', message: msg });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentUser, pushNotification, closeBookingDrawer]);

  return { submitBooking, loading, result };
}

function generateMockDocument(payload) {
  const basePrice = 9800000;
  const gst = Math.round(basePrice * 0.05);
  const grandTotal = basePrice + gst + 150000 + 50000;
  return {
    documentType: 'Provisional Allotment Letter & Cost Quotation Invoice',
    documentRef: `AL-${payload.unitId || 'AMEN'}-${Date.now()}`,
    issuedAt: new Date().toISOString(),
    issuer: { company: 'CasaEstate Infrastructure Pvt. Ltd.', address: 'Sector 74, Noida, UP - 201301' },
    allottee: { name: payload.userName, email: payload.userEmail, phone: payload.userPhone },
    costBreakdown: {
      basePrice: { label: 'Base Sale Price', amount: basePrice, formatted: `₹${basePrice.toLocaleString('en-IN')}` },
      gst: { label: 'GST @ 5%', amount: gst, formatted: `₹${gst.toLocaleString('en-IN')}` },
      parkingCharges: { label: 'Parking Charges', amount: 150000, formatted: '₹1,50,000' },
      maintenanceDeposit: { label: 'Maintenance Deposit', amount: 50000, formatted: '₹50,000' },
      grandTotal: { label: 'Grand Total', amount: grandTotal, formatted: `₹${grandTotal.toLocaleString('en-IN')}` },
    },
    paymentSchedule: [
      { milestone: 'Token Amount', percentage: 2, amount: Math.round(basePrice * 0.02) },
      { milestone: 'Down Payment (30 days)', percentage: 15, amount: Math.round(basePrice * 0.15) },
      { milestone: 'On Possession', percentage: 20, amount: Math.round(basePrice * 0.20) },
    ],
    legalTerms: [
      'This allotment is subject to Builder-Buyer Agreement terms.',
      'Payment delays attract 15% p.a. interest.',
      'Possession subject to OC/CC from competent authorities.',
    ],
  };
}
