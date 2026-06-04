// Vercel Serverless Function — Commission Request → Slack
//
// Expects a POST with JSON body: { name, email, type, description, budget, timeline, reference }
// Forwards to a Slack Incoming Webhook stored in SLACK_COMMISSION_WEBHOOK env var.
//
// To set up: create a Slack webhook at https://api.slack.com/messaging/webhooks
// then: vercel env add SLACK_COMMISSION_WEBHOOK

const WEBHOOK_URL = process.env.SLACK_COMMISSION_WEBHOOK;

export default async function handler(req, res) {
  // CORS for browser requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};

  // Basic validation
  if (!body.name || !body.email || !body.description) {
    return res.status(400).json({ error: 'Name, email, and description are required.' });
  }

  // Build a nicely formatted Slack message
  const blocks = [
    {
      type: 'header',
      text: { type: 'plain_text', text: '🎨 New Commission Request', emoji: true }
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Name:*\n${escapeMd(body.name)}` },
        { type: 'mrkdwn', text: `*Email:*\n${escapeMd(body.email)}` }
      ]
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Type:*\n${body.type ? escapeMd(body.type) : 'Not specified'}` },
        { type: 'mrkdwn', text: `*Budget:*\n${body.budget ? escapeMd(body.budget) : 'Not specified'}` }
      ]
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Timeline:*\n${body.timeline ? escapeMd(body.timeline) : 'Not specified'}` },
      ]
    },
    {
      type: 'section',
      text: { type: 'mrkdwn', text: `*Description:*\n${escapeMd(body.description)}` }
    }
  ];

  if (body.reference) {
    blocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text: `*Reference / Links:*\n${escapeMd(body.reference)}` }
    });
  }

  blocks.push({
    type: 'context',
    elements: [
      { type: 'mrkdwn', text: `Requested on ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}` }
    ]
  });

  const slackPayload = { blocks };

  try {
    if (WEBHOOK_URL) {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slackPayload),
      });

      if (!response.ok) {
        console.error(`Slack webhook returned ${response.status}`);
        return res.status(500).json({ error: 'Failed to notify team. Please try again later.' });
      }
    } else {
      // No webhook configured — log and return success anyway
      // (the form still works, the artist just won't get notified until the webhook is set)
      console.log('SLACK_COMMISSION_WEBHOOK not set. Commission data:', JSON.stringify(body));
    }

    return res.status(200).json({ ok: true, message: 'Commission request received! We will get back to you soon.' });
  } catch (err) {
    console.error('Error sending to Slack:', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
}

function escapeMd(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '\n');
}