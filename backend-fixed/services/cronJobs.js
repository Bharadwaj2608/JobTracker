import cron from 'node-cron';
import nodemailer from 'nodemailer';
import Job from '../models/Job.js';
import User from '../models/User.js';

// ── Email transporter ──────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD, // Gmail App Password (not your real password)
  },
});

const sendEmail = async (to, subject, html) => {
  await transporter.sendMail({
    from: `"JobTrackr" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

// ── 1. 7-day follow-up reminder — runs every day at 9am ────────────
export const startFollowUpReminder = () => {
  cron.schedule('0 9 * * *', async () => {
    console.log('⏰ Running follow-up reminder check...');
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const staleJobs = await Job.find({
        status: 'applied',
        appliedDate: { $lte: sevenDaysAgo },
        followUpSent: { $ne: true },
      }).populate('user', 'name email');

      for (const job of staleJobs) {
        if (!job.user?.email) continue;

        const html = `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
            <h2 style="color:#6366f1;margin-bottom:4px">JobTrackr Reminder</h2>
            <p style="color:#6b7280;font-size:14px;margin-top:0">You applied 7+ days ago and haven't heard back yet</p>
            <div style="background:#f9fafb;border-radius:12px;padding:20px;margin:20px 0;border-left:4px solid #6366f1">
              <p style="margin:0 0 6px;font-weight:600;color:#111">${job.position}</p>
              <p style="margin:0;color:#6b7280;font-size:14px">${job.company} · Applied ${new Date(job.appliedDate).toDateString()}</p>
            </div>
            <p style="color:#374151">Consider sending a polite follow-up email to check on your application status.</p>
            <a href="${process.env.CLIENT_URL}/jobs" style="display:inline-block;background:#6366f1;color:#fff;padding:10px 22px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:8px">View Application</a>
            <p style="color:#9ca3af;font-size:12px;margin-top:24px">JobTrackr · You're receiving this because you have an account</p>
          </div>`;

        await sendEmail(job.user.email, `Follow up on your ${job.position} application at ${job.company}`, html);
        await Job.findByIdAndUpdate(job._id, { followUpSent: true });
        console.log(`✉️  Follow-up sent to ${job.user.email} for ${job.company}`);
      }
    } catch (err) {
      console.error('Follow-up cron error:', err.message);
    }
  });
  console.log('✅ Follow-up reminder cron started');
};

// ── 2. Weekly digest — every Sunday at 8am ─────────────────────────
export const startWeeklyDigest = () => {
  cron.schedule('0 8 * * 0', async () => {
    console.log('📊 Running weekly digest...');
    try {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const users = await User.find({});

      for (const user of users) {
        const allJobs   = await Job.find({ user: user._id });
        const weekJobs  = allJobs.filter(j => new Date(j.createdAt) >= oneWeekAgo);

        if (weekJobs.length === 0) continue;

        const counts = {
          applied:   allJobs.filter(j => j.status === 'applied').length,
          interview: allJobs.filter(j => j.status === 'interview').length,
          offer:     allJobs.filter(j => j.status === 'offer').length,
          rejected:  allJobs.filter(j => j.status === 'rejected').length,
        };

        const recentRows = weekJobs.slice(0, 5).map(j => `
          <tr>
            <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;font-weight:500;color:#111">${j.position}</td>
            <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;color:#6b7280">${j.company}</td>
            <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6">
              <span style="background:#ede9fe;color:#6d28d9;padding:2px 10px;border-radius:99px;font-size:12px;font-weight:600">${j.status}</span>
            </td>
          </tr>`).join('');

        const html = `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
            <h2 style="color:#6366f1;margin-bottom:4px">Your Weekly Job Search Summary</h2>
            <p style="color:#6b7280;font-size:14px;margin-top:0">Week ending ${new Date().toDateString()}</p>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:20px 0">
              ${[
                { label:'Applied this week', val: weekJobs.length, color:'#6366f1' },
                { label:'Total applications', val: allJobs.length, color:'#8b5cf6' },
                { label:'Interviews', val: counts.interview, color:'#a855f7' },
                { label:'Offers', val: counts.offer, color:'#22c55e' },
              ].map(({ label, val, color }) => `
                <div style="background:#f9fafb;border-radius:12px;padding:16px;border-top:3px solid ${color}">
                  <div style="font-size:28px;font-weight:700;color:${color}">${val}</div>
                  <div style="font-size:13px;color:#6b7280;margin-top:2px">${label}</div>
                </div>`).join('')}
            </div>

            ${weekJobs.length > 0 ? `
            <h3 style="color:#374151;font-size:15px;margin:24px 0 12px">Applied this week</h3>
            <table style="width:100%;border-collapse:collapse;font-size:14px">
              <thead>
                <tr style="background:#f9fafb">
                  <th style="padding:10px 12px;text-align:left;color:#6b7280;font-weight:500">Role</th>
                  <th style="padding:10px 12px;text-align:left;color:#6b7280;font-weight:500">Company</th>
                  <th style="padding:10px 12px;text-align:left;color:#6b7280;font-weight:500">Status</th>
                </tr>
              </thead>
              <tbody>${recentRows}</tbody>
            </table>` : ''}

            ${counts.rejected > 0 ? `<p style="color:#6b7280;font-size:14px;margin-top:20px">💪 ${counts.rejected} rejection${counts.rejected>1?'s':''} this week — keep going, you've got this!</p>` : ''}

            <a href="${process.env.CLIENT_URL}/dashboard" style="display:inline-block;background:#6366f1;color:#fff;padding:10px 22px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:16px">View Dashboard</a>
            <p style="color:#9ca3af;font-size:12px;margin-top:24px">JobTrackr · Weekly digest every Sunday</p>
          </div>`;

        await sendEmail(user.email, `Your weekly job search summary — ${weekJobs.length} new this week`, html);
        console.log(`📧 Weekly digest sent to ${user.email}`);
      }
    } catch (err) {
      console.error('Weekly digest cron error:', err.message);
    }
  });
  console.log('✅ Weekly digest cron started');
};