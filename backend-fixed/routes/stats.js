import express from 'express';
import Job from '../models/Job.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// @route   GET /api/stats
// @desc    Get dashboard statistics for logged-in user
// @access  Private
router.get('/', async (req, res) => {
  try {
    const userId = req.user._id;

    const statusCounts = await Job.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const priorityCounts = await Job.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);

    const sourceCounts = await Job.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$source', count: { $sum: 1 } } },
    ]);

    // Monthly applications (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyApps = await Job.aggregate([
      { $match: { user: userId, createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const total = await Job.countDocuments({ user: userId });
    const recent = await Job.find({ user: userId }).sort('-createdAt').limit(5);

    const statusMap = {};
    statusCounts.forEach((s) => { statusMap[s._id] = s.count; });

    res.json({
      success: true,
      stats: {
        total,
        statusCounts: statusMap,
        priorityCounts,
        sourceCounts,
        monthlyApps,
        recentApplications: recent,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
