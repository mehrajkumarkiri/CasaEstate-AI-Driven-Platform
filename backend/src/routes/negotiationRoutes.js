const express = require('express');
const router = express.Router();
const negotiationController = require('../controllers/negotiationController');

router.post('/finalize', negotiationController.finalizeNegotiation);

module.exports = router;
