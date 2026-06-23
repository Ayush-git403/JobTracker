const { Application, JobListing, User } = require('../models');

// APPLY TO JOB (Applicant only)
const applyToJob = async (req, res) => {
  try {
    const { job_id } = req.body;

    // Check job exists
    const job = await JobListing.findByPk(job_id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.status !== 'open') return res.status(400).json({ message: 'Job is no longer open' });

    // Check already applied
    const existing = await Application.findOne({
      where: { job_id, applicant_id: req.user.id }
    });
    if (existing) return res.status(400).json({ message: 'Already applied to this job' });

    // Create application
    const application = await Application.create({
      job_id,
      applicant_id: req.user.id,
      status: 'pending'
    });

    res.status(201).json({ message: 'Application submitted successfully', application });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET MY APPLICATIONS (Applicant only)
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.findAll({
      where: { applicant_id: req.user.id },
      include: [{
        model: JobListing,
        as: 'job',
        include: [{
          model: User,
          as: 'employer',
          attributes: ['id', 'name', 'email']
        }]
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET APPLICATIONS FOR A JOB (Employer only)
const getJobApplications = async (req, res) => {
  try {
    const job = await JobListing.findByPk(req.params.job_id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.employer_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const applications = await Application.findAll({
      where: { job_id: req.params.job_id },
      include: [{
        model: User,
        as: 'applicant',
        attributes: ['id', 'name', 'email']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// UPDATE APPLICATION STATUS (Employer only)
const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'shortlisted', 'rejected'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const application = await Application.findByPk(req.params.id, {
      include: [{ model: JobListing, as: 'job' }]
    });

    if (!application) return res.status(404).json({ message: 'Application not found' });

    if (application.job.employer_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await application.update({ status });
    res.json({ message: 'Application status updated', application });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { applyToJob, getMyApplications, getJobApplications, updateApplicationStatus };