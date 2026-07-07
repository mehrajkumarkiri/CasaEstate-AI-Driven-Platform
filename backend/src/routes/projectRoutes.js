const express = require('express');
const router = express.Router();
const { getAllProjects, getProject, getProjectAnalytics, createProject, getGlobalAnalytics } = require('../controllers/projectController');

router.get('/analytics/global', getGlobalAnalytics);
router.get('/', getAllProjects);
router.post('/', createProject);
router.get('/:id', getProject);
router.get('/:id/analytics', getProjectAnalytics);

module.exports = router;
