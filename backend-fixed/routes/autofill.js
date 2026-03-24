import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import protect from '../middleware/auth.js';

const router = express.Router();
router.use(protect);
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

router.post('/', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ success: false, message: 'URL is required' });

  try {
    // Fetch the page HTML
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    const html = await response.text();

    // Strip tags, keep text only, limit size
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 6000);

    const message = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `Extract job details from this job posting text. Return ONLY a JSON object, no other text:
{
  "company": "",
  "position": "",
  "location": "Remote or City, Country",
  "jobType": "full-time|part-time|contract|internship|freelance",
  "source": "linkedin|indeed|glassdoor|company-website|referral|other",
  "description": "2-3 sentence summary of the role",
  "salaryMin": null,
  "salaryMax": null,
  "currency": "USD"
}

Job posting text:
${text}`
      }]
    });

    const raw = message.content[0].text.trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.status(422).json({ success: false, message: 'Could not parse job details' });

    const parsed = JSON.parse(jsonMatch[0]);
    res.json({ success: true, data: parsed });

  } catch (err) {
    console.error('Autofill error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch or parse the URL' });
  }
});

export default router;