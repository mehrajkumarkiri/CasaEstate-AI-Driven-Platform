const express = require('express');
const router = express.Router();
const { getBookings, getBooking, createBooking, approveBooking, cancelBooking } = require('../controllers/bookingController');

router.get('/', getBookings);
router.post('/', createBooking);
router.get('/:id', getBooking);
router.patch('/:id/approve', approveBooking);
router.delete('/:id', cancelBooking);

module.exports = router;
