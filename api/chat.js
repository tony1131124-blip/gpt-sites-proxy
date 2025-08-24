// /api/chat.js — Vercel Serverless Function（Node.js）
// 重要：不要把 API Key 放前端，改放到 Vercel 的環境變數 OPENAI_API_KEY

module.exports = async (req, res) => {
  // CORS：允許不同來源呼叫
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { message } = req.body || {};
    if (!message) return res.status(400).json({ error: 'message is required' });

    // 呼叫 OpenAI Chat Completions API
    const apiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that replies in Traditional Chinese.' },
          { role: 'user', content: message }
        ]
      })
    });

    const json = await apiRes.json();
    if (!apiRes.ok) {
      return res.status(apiRes.status).json({ error: json.error?.message || 'OpenAI error' });
    }

    const reply = json.choices?.[0]?.message?.content || '';
    return res.status(200).json({ reply });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};
