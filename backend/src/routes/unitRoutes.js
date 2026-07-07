const express = require('express');
const router = express.Router();
const { getUnits, getUnit, updateAvailability } = require('../controllers/unitController');

router.get('/', getUnits);
router.get('/:id', getUnit);
router.patch('/:id/availability', updateAvailability);

module.exports = router;
