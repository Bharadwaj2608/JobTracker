import express from 'express';
import cron from 'node-cron';
import protect from '../middleware/auth.js';
import User from '../models/User.js';
import { syncGmailForUser } from '../services/gmailService.js';

const router = express.Router();
router.use(protect);

// Manual sync
router.post('/sync', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.gmailConnected) {
      return res.status(400).json({ success: false, message: 'Gmail not connected. Please login with Google.' });
    }
    const added = await syncGmailForUser(req.user._id);
    res.json({ success: true, message: `Sync complete — ${added} new application${added !== 1 ? 's' : ''} added`, added });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get sync status
router.get('/status', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      gmailConnected: user.gmailConnected || false,
      lastSync: user.lastEmailSync || null,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Auto sync every 30 minutes for all connected users
cron.schedule('*/30 * * * *', async () => {
  console.log('⏰ Running Gmail auto-sync...');
  try {
    const users = await User.find({ gmailConnected: true });
    for (const user of users) {
      await syncGmailForUser(user._id);
    }
    console.log(`✅ Synced ${users.length} users`);
  } catch (err) {
    console.error('Cron sync error:', err.message);
  }
});

export default router;