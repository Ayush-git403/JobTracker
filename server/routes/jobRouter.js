const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
  createJob,
  getAllJobs,
  getJobById,
  getMyJobs,
  updateJob,
  deleteJob
} = require('../controllers/jobController');

// Public
router.get('/', getAllJobs);
router.get('/:id', getJobById);

// Employer only
router.post('/', authMiddleware, roleMiddleware('employer'), createJob);
router.get('/employer/myjobs', authMiddleware, roleMiddleware('employer'), getMyJobs);
router.put('/:id', authMiddleware, roleMiddleware('employer'), updateJob);
router.delete('/:id', authMiddleware, roleMiddleware('employer'), deleteJob);

module.exports = router;