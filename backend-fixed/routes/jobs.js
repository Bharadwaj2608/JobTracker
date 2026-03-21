import express from 'express';
import { body, validationResult } from 'express-validator';
import Job from '../models/Job.js';
import protect from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// @route   GET /api/jobs
// @desc    Get all jobs for logged-in user
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { status, priority, jobType, source, search, sort = '-createdAt', page = 1, limit = 20 } = req.query;

    const query = { user: req.user._id };

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (jobType) query.jobType = jobType;
    if (source) query.source = source;
    if (search) {
      query.$or = [
        { company: { $regex: search, $options: 'i' } },
        { position: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query).sort(sort).skip(skip).limit(Number(limit));

    res.json({
      success: true,
      count: jobs.length,
      total,
      pages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      jobs,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/jobs
// @desc    Add a new job application
// @access  Private
router.post(
  '/',
  [
    body('company').trim().notEmpty().withMessage('Company name is required'),
    body('position').trim().notEmpty().withMessage('Position is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const job = await Job.create({ ...req.body, user: req.user._id });
      res.status(201).json({ success: true, message: 'Job application added', job });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

// @route   GET /api/jobs/:id
// @desc    Get a single job application
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, user: req.user._id });
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job application not found' });
    }
    res.json({ success: true, job });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/jobs/:id
// @desc    Update a job application
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job application not found' });
    }
    res.json({ success: true, message: 'Job application updated', job });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PATCH /api/jobs/:id/status
// @desc    Update only the status of a job application
// @access  Private
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['applied', 'screening', 'interview', 'offer', 'approved', 'rejected', 'withdrawn'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { status },
      { new: true }
    );
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job application not found' });
    }
    res.json({ success: true, message: `Status updated to "${status}"`, job });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/jobs/:id
// @desc    Delete a job application
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job application not found' });
    }
    res.json({ success: true, message: 'Job application deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
