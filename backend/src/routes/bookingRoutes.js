const express = require('express');
const router = express.Router();
const { getBookings, getBooking, createBooking, approveBooking, cancelBooking } = require('../controllers/bookingController');
const { authenticate } = require('../middleware/authMiddleware');

router.get('/', authenticate, getBookings);
router.post('/', authenticate, createBooking);
router.get('/:id', authenticate, getBooking);
router.patch('/:id/approve', authenticate, approveBooking);
router.delete('/:id', authenticate, cancelBooking);

module.exports = router;
