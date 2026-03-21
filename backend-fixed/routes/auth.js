import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import Job from '../models/Job.js';
import protect from '../middleware/auth.js';

const router = express.Router();

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

// Register
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ success: false, errors: errors.array() });

  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ success: false, message: 'User already exists with this email' });

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        _id: user._id, name: user.name,
        email: user.email, avatar: user.avatar, createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().withMessage('Enter a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ success: false, errors: errors.array() });

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user)
      return res.status(401).json({ success: false, message: 'Invalid email or password' });

    if (!user.password)
      return res.status(401).json({ success: false, message: 'This account uses Google Sign-In. Please click "Continue with Google".' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const token = generateToken(user._id);
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id, name: user.name,
        email: user.email, avatar: user.avatar, createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get me
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, email, avatar } = req.body;
    const existing = await User.findOne({ email, _id: { $ne: req.user._id } });
    if (existing)
      return res.status(400).json({ success: false, message: 'Email already in use' });

    const user = await User.findByIdAndUpdate(
      req.user._id, { name, email, avatar }, { new: true, runValidators: true }
    );
    res.json({ success: true, message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Profile error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Change password
router.put('/change-password', protect, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!user.password)
      return res.status(400).json({ success: false, message: 'Google accounts cannot change password here' });

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch)
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });

    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Password change error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete account
router.delete('/delete-account', protect, async (req, res) => {
  try {
    await Job.deleteMany({ user: req.user._id });
    await User.findByIdAndDelete(req.user._id);
    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
