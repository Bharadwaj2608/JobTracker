import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import multer from 'multer';
import fs from 'fs';
import protect from '../middleware/auth.js';
import Job from '../models/Job.js';

const router = express.Router();
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Multer for PDF upload (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files allowed'));
  }
});

router.use(protect);

// ─────────────────────────────────────────
// AI CAREER COACH CHAT (Streaming)
// ─────────────────────────────────────────
router.post('/chat', async (req, res) => {
  const { message, conversationHistory = [] } = req.body;

  try {
    const jobs = await Job.find({ user: req.user._id }).limit(50).lean();

    const jobsContext = jobs.map(j => ({
      company: j.company,
      position: j.position,
      status: j.status,
      priority: j.priority,
      location: j.location,
      appliedDate: j.appliedDate,
      salary: j.salary,
      source: j.source,
      notes: j.notes,
    }));

    const systemPrompt = `You are an expert AI career coach inside JobTrackr, a job application tracking app.

The user's current job applications:
${JSON.stringify(jobsContext, null, 2)}

Your role:
- Give personalized career advice based on their actual application data
- Help with interview preparation, salary negotiation, follow-up strategies
- Analyse patterns in their job search (success rate, response rate, etc.)
- Suggest improvements to their job search strategy
- Be encouraging, specific, and actionable
- Keep responses concise but thorough
- Use emojis occasionally to keep it friendly

Always reference their actual data when relevant (e.g. "I see you applied to Microsoft 5 days ago...").`;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    const stream = await client.messages.stream({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        ...conversationHistory.slice(-10), // keep last 10 messages
        { role: 'user', content: message }
      ]
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta?.text) {
        res.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();

  } catch (error) {
    console.error('Chat error:', error);
    res.write(`data: ${JSON.stringify({ error: 'Something went wrong' })}\n\n`);
    res.end();
  }
});

// ─────────────────────────────────────────
// RESUME ANALYSER
// ─────────────────────────────────────────
router.post('/analyse-resume', upload.single('resume'), async (req, res) => {
  try {
    const { jobDescription, jobId } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a resume PDF' });
    }

    const pdfBase64 = req.file.buffer.toString('base64');

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'document',
            source: {
              type: 'base64',
              media_type: 'application/pdf',
              data: pdfBase64,
            }
          },
          {
            type: 'text',
            text: `Analyse this resume against the job description below.

Job Description:
${jobDescription || 'Not provided — do a general resume analysis'}

Return ONLY a valid JSON object with this exact structure:
{
  "matchScore": <number 0-100>,
  "overallRating": "<Excellent|Good|Fair|Poor>",
  "summary": "<2-3 sentence overall assessment>",
  "matchingSkills": ["skill1", "skill2"],
  "missingSkills": ["skill1", "skill2"],
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["improvement1", "improvement2", "improvement3"],
  "experienceMatch": "<Strong|Moderate|Weak>",
  "educationMatch": "<Strong|Moderate|Weak|N/A>",
  "keywordDensity": "<High|Medium|Low>",
  "atsScore": <number 0-100>,
  "topRecommendation": "<single most important action to take>"
}`
          }
        ]
      }]
    });

    const rawText = message.content[0].text;
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid AI response format');

    const result = JSON.parse(jsonMatch[0]);
    res.json({ success: true, result });

  } catch (error) {
    console.error('Resume analysis error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;