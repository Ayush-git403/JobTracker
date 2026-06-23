const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
  applyToJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus
} = require('../controllers/applicationController');

// Applicant only
router.post('/', authMiddleware, roleMiddleware('applicant'), applyToJob);
router.get('/my', authMiddleware, roleMiddleware('applicant'), getMyApplications);

// Employer only
router.get('/job/:job_id', authMiddleware, roleMiddleware('employer'), getJobApplications);
router.patch('/:id', authMiddleware, roleMiddleware('employer'), updateApplicationStatus);

module.exports = router;