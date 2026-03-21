import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';

const router = express.Router();

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

router.get('/',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

router.get('/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=google_failed`
  }),
  (req, res) => {
    const token = generateToken(req.user._id);
    const user = {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      avatar: req.user.avatar,
      gmailConnected: req.user.gmailConnected,
    };
    res.redirect(
      `${process.env.CLIENT_URL}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`
    );
  }
);

export default router;