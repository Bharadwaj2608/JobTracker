import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import protect from '../middleware/auth.js';
import Job from '../models/Job.js';

const router = express.Router();
router.use(protect);

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

router.post('/scan', async (req, res) => {
  const { emails } = req.body;
  if (!emails || !emails.length) {
    return res.status(400).json({ success: false, message: 'No emails provided' });
  }
  try {
    const emailsText = emails.map((e, i) =>
      `--- EMAIL ${i + 1} ---\nFrom: ${e.from}\nDate: ${e.date}\nSubject: ${e.subject}\nBody:\n${e.body?.slice(0, 1500)}`
    ).join('\n\n');

    const message = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: `You are a job application email parser. Analyze these emails and extract job applications.
Only extract emails that are clearly about a job application — confirmations, interview invites, offer letters, rejections, or recruiter outreach.
Return ONLY a JSON array, no other text:
[
  {
    "emailIndex": 0,
    "company": "Company name",
    "position": "Job title",
    "status": "applied|screening|interview|offer|rejected",
    "location": "City or Remote",
    "appliedDate": "YYYY-MM-DD or null",
    "source": "linkedin|indeed|glassdoor|company-website|referral|other",
    "notes": "Brief summary",
    "confidence": "high|medium|low"
  }
]
If no job emails found return: []

Emails:
${emailsText}`
      }]
    });

    const raw = message.content[0].text.trim();
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return res.json({ success: true, parsed: [] });

    const parsed = JSON.parse(jsonMatch[0]);
    const result = parsed.map(item => ({ ...item, originalEmail: emails[item.emailIndex] || null }));
    res.json({ success: true, parsed: result });
  } catch (err) {
    console.error('Email scan error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/add', async (req, res) => {
  const { jobs } = req.body;
  if (!jobs || !jobs.length) {
    return res.status(400).json({ success: false, message: 'No jobs to add' });
  }
  try {
    const created = await Promise.all(
      jobs.map(j => Job.create({
        user: req.user._id,
        company: j.company || 'Unknown',
        position: j.position || 'Unknown',
        status: j.status || 'applied',
        location: j.location || 'Remote',
        source: j.source || 'other',
        notes: j.notes || '',
        appliedDate: j.appliedDate ? new Date(j.appliedDate) : new Date(),
        priority: 'medium',
      }))
    );
    res.json({ success: true, added: created.length, jobs: created });
  } catch (err) {
    console.error('Email import add error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;