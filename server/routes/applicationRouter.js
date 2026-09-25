const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
  applyToJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  getResumeUploadUrl,
  confirmResumeUpload
} = require('../controllers/applicationController');

// Applicant only
router.post('/', authMiddleware, roleMiddleware('applicant'), applyToJob);
router.get('/my', authMiddleware, roleMiddleware('applicant'), getMyApplications);
router.post('/:id/resume-upload-url', authMiddleware, roleMiddleware('applicant'), getResumeUploadUrl);
router.post('/:id/resume-confirm', authMiddleware, roleMiddleware('applicant'), confirmResumeUpload);

// Employer only
router.get('/job/:job_id', authMiddleware, roleMiddleware('employer'), getJobApplications);
router.patch('/:id', authMiddleware, roleMiddleware('employer'), updateApplicationStatus);

module.exports = router;