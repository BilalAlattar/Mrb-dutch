// Vercel Serverless Function — proxies chat/test requests to the Anthropic API.
// The API key stays on the server (ANTHROPIC_API_KEY env var) and is never sent to the browser.
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'ANTHROPIC_API_KEY is not configured on the server' });
    return;
  }

  try {
    const { system, messages } = req.body || {};
    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: 'messages array is required' });
      return;
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: system || undefined,
        messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      res.status(response.status).json({ error: data });
      return;
    }

    const textBlock = (data.content || []).find((b) => b.type === 'text');
    res.status(200).json({ text: textBlock ? textBlock.text : '' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Unknown server error' });
  }
};
