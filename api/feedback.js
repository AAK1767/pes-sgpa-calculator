const feedbackAttempts = new Map();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const MAX_FEEDBACK_REQUESTS = 5;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.headers['x-real-ip']
    || 'unknown';
  const now = Date.now();
  const recentAttempts = (feedbackAttempts.get(clientIp) || [])
    .filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);
  if (recentAttempts.length >= MAX_FEEDBACK_REQUESTS) {
    return res.status(429).json({ error: 'Too many feedback requests. Please try again later.' });
  }
  recentAttempts.push(now);
  feedbackAttempts.set(clientIp, recentAttempts);

  const { name, feedback, rating } = req.body || {};

  if (!feedback) {
    return res.status(400).json({ error: 'Feedback message is required' });
  }
  if (typeof feedback !== 'string' || feedback.trim().length > 2000) {
    return res.status(413).json({ error: 'Feedback message is too long' });
  }
  if (name != null && (typeof name !== 'string' || name.trim().length > 100)) {
    return res.status(413).json({ error: 'Name is too long' });
  }
  if (rating != null && Number(rating) !== 0
    && (!Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5)) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    console.error('Missing DISCORD_WEBHOOK_URL environment variable');
    return res.status(500).json({ error: 'Feedback system is not configured yet' });
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        embeds: [
          {
            title: '📝 New App Feedback',
            color: rating >= 4 ? 3066993 : rating <= 2 ? 15158332 : 15844367, // Green, Red, Yellow
            fields: [
              { name: 'Rating', value: rating ? `${rating} / 5 ⭐` : 'N/A', inline: true },
              { name: 'Name', value: name || 'Anonymous', inline: true },
              { name: 'Feedback', value: feedback },
            ],
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Discord Webhook error:', text);
      return res.status(500).json({ error: 'Failed to send feedback to Discord' });
    }

    return res.status(200).json({ message: 'Feedback sent successfully!' });
  } catch (error) {
    console.error('Feedback error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
