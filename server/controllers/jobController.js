const { JobListing, User } = require('../models');

// CREATE JOB (Employer only)
const createJob = async (req, res) => {
  try {
    const { title, description } = req.body;

    const job = await JobListing.create({
      title,
      description,
      employer_id: req.user.id,
      status: 'open'
    });

    res.status(201).json({ message: 'Job created successfully', job });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET ALL JOBS (Public)
const getAllJobs = async (req, res) => {
  try {
    const jobs = await JobListing.findAll({
      where: { status: 'open' },
      include: [{
        model: User,
        as: 'employer',
        attributes: ['id', 'name', 'email']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET SINGLE JOB
const getJobById = async (req, res) => {
  try {
    const job = await JobListing.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'employer',
        attributes: ['id', 'name', 'email']
      }]
    });

    if (!job) return res.status(404).json({ message: 'Job not found' });

    res.json(job);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET EMPLOYER'S OWN JOBS
const getMyJobs = async (req, res) => {
  try {
    const jobs = await JobListing.findAll({
      where: { employer_id: req.user.id },
      order: [['createdAt', 'DESC']]
    });

    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// UPDATE JOB (Employer only)
const updateJob = async (req, res) => {
  try {
    const job = await JobListing.findByPk(req.params.id);

    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.employer_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this job' });
    }

    await job.update(req.body);
    res.json({ message: 'Job updated successfully', job });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE JOB (Employer only)
const deleteJob = async (req, res) => {
  try {
    const job = await JobListing.findByPk(req.params.id);

    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.employer_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }

    await job.destroy();
    res.json({ message: 'Job deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { createJob, getAllJobs, getJobById, getMyJobs, updateJob, deleteJob };