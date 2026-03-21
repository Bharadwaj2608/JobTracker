import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import passport from 'passport';
import connectDB from './config/db.js';
import './config/passport.js';

import authRoutes from './routes/auth.js';
import jobRoutes from './routes/jobs.js';
import statsRoutes from './routes/stats.js';
import googleRoutes from './routes/google.js';
import aiRoutes from './routes/ai.js';
import gmailRoutes from './routes/gmail.js';
import emailImport from './routes/emailImport.js'

connectDB();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(passport.initialize());

app.use('/api/auth', authRoutes);
app.use('/api/auth/google', googleRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/gmail', gmailRoutes);
app.use('/api/email-import', emailImport);

app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ success: false, message: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
