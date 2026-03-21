import dotenv from 'dotenv';
dotenv.config();

import passport from 'passport';
import pkg from 'passport-google-oauth20';
const { Strategy: GoogleStrategy } = pkg;
import User from '../models/User.js';

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
},
async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });
    if (user) {
      user.gmailAccessToken = accessToken;
      if (refreshToken) user.gmailRefreshToken = refreshToken;
      user.gmailConnected = true;
      await user.save();
      return done(null, user);
    }

    user = await User.findOne({ email: profile.emails[0].value });
    if (user) {
      user.googleId = profile.id;
      user.authProvider = 'google';
      user.avatar = profile.photos[0]?.value || '';
      user.gmailAccessToken = accessToken;
      if (refreshToken) user.gmailRefreshToken = refreshToken;
      user.gmailConnected = true;
      await user.save();
      return done(null, user);
    }

    user = await User.create({
      name: profile.displayName,
      email: profile.emails[0].value,
      googleId: profile.id,
      avatar: profile.photos[0]?.value || '',
      authProvider: 'google',
      gmailAccessToken: accessToken,
      gmailRefreshToken: refreshToken || null,
      gmailConnected: true,
    });

    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

export default passport;
