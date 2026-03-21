import { google } from 'googleapis';
import Anthropic from '@anthropic-ai/sdk';
import User from '../models/User.js';
import Job from '../models/Job.js';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const getOAuthClient = (accessToken, refreshToken) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL
  );
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  return oauth2Client;
};

const extractEmailBody = (payload) => {
  let body = '';
  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        body += Buffer.from(part.body.data, 'base64').toString('utf-8');
      } else if (part.parts) {
        body += extractEmailBody(part);
      }
    }
  } else if (payload.body?.data) {
    body = Buffer.from(payload.body.data, 'base64').toString('utf-8');
  }
  return body.slice(0, 3000);
};

const isJobEmail = (subject, body) => {
  const keywords = [
    'application received', 'thank you for applying', 'we received your application',
    'application confirmation', 'job application', 'your application to',
    'applied for', 'application for', 'interview invitation', 'interview request',
    'offer letter', 'job offer', 'congratulations', 'unfortunately', 'regret to inform',
    'application status', 'next steps', 'hiring', 'position', 'role'
  ];
  const text = (subject + ' ' + body).toLowerCase();
  return keywords.some(kw => text.includes(kw));
};

export const syncGmailForUser = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user?.gmailConnected || !user?.gmailRefreshToken) return;

    const auth = getOAuthClient(user.gmailAccessToken, user.gmailRefreshToken);
    const gmail = google.gmail({ version: 'v1', auth });

    // Get emails from last 7 days
    const since = Math.floor((Date.now() - 7 * 24 * 60 * 60 * 1000) / 1000);
    const query = `after:${since} (subject:application OR subject:interview OR subject:offer OR subject:hiring)`;

    const listRes = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: 20,
    });

    const messages = listRes.data.messages || [];
    let added = 0;

    for (const msg of messages) {
      const full = await gmail.users.messages.get({ userId: 'me', id: msg.id, format: 'full' });
      const headers = full.data.payload.headers;
      const subject = headers.find(h => h.name === 'Subject')?.value || '';
      const from = headers.find(h => h.name === 'From')?.value || '';
      const date = headers.find(h => h.name === 'Date')?.value || '';
      const body = extractEmailBody(full.data.payload);

      if (!isJobEmail(subject, body)) continue;

      // Check for duplicate by email message ID
      const existingJob = await Job.findOne({
        user: userId,
        'emailMetadata.messageId': msg.id
      });
      if (existingJob) continue;

      // Use AI to extract job details
      const aiRes = await client.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 512,
        messages: [{
          role: 'user',
          content: `Extract job application details from this email. Return ONLY valid JSON:
{
  "company": "<company name or null>",
  "position": "<job title or null>",
  "status": "<applied|screening|interview|offer|approved|rejected|withdrawn>",
  "location": "<location or Remote>",
  "isJobEmail": <true|false>
}

From: ${from}
Subject: ${subject}
Body: ${body}`
        }]
      });

      const rawText = aiRes.content[0].text;
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) continue;

      const extracted = JSON.parse(jsonMatch[0]);
      if (!extracted.isJobEmail || !extracted.company) continue;

      await Job.create({
        user: userId,
        company: extracted.company,
        position: extracted.position || 'Unknown Position',
        status: extracted.status || 'applied',
        location: extracted.location || 'Remote',
        source: 'other',
        priority: 'medium',
        appliedDate: new Date(date) || new Date(),
        notes: `Auto-imported from Gmail: "${subject}"`,
        emailMetadata: { messageId: msg.id, subject, from },
      });

      added++;
    }

    await User.findByIdAndUpdate(userId, { lastEmailSync: new Date() });
    return added;

  } catch (error) {
    console.error('Gmail sync error:', error.message);
    return 0;
  }
};