const express = require('express');
const router = express.Router();
const { getLedger, getLedgerEntry } = require('../controllers/ledgerController');
const { authenticate } = require('../middleware/authMiddleware');

router.get('/', authenticate, getLedger);
router.get('/:id', authenticate, getLedgerEntry);

module.exports = router;
