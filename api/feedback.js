export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, feedback, rating } = req.body || {};

  if (!feedback) {
    return res.status(400).json({ error: 'Feedback message is required' });
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
