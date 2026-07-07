const express = require('express');
const router = express.Router();
const {
  getMilestones,
  getProjectSummary,
  createMilestone,
  updateMilestone,
} = require('../controllers/milestoneController');

// GET /api/v1/milestones?projectId=&phase=&status=
router.get('/', getMilestones);

// GET /api/v1/milestones/summary/:projectId
router.get('/summary/:projectId', getProjectSummary);

// POST /api/v1/milestones
router.post('/', createMilestone);

// PATCH /api/v1/milestones/:id
router.patch('/:id', updateMilestone);

module.exports = router;
