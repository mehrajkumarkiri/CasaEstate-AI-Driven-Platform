const express = require('express');
const router = express.Router();
const { getLedger, getLedgerEntry } = require('../controllers/ledgerController');

router.get('/', getLedger);
router.get('/:id', getLedgerEntry);

module.exports = router;
