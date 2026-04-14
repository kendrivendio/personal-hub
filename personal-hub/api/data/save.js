// api/data/save.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  // Verify owner cookie
  const cookieHeader = req.headers.cookie || '';
  const match = cookieHeader.match(/owner_token=([^;]+)/);
  if (!match) return res.status(401).json({ error: 'not_authenticated' });
  try {
    const [payloadB64, sigB64] = match[1].split('.');
    const { expires } = JSON.parse(Buffer.from(payloadB64, 'base64').toString());
    if (Date.now() > expires) return res.status(401).json({ error: 'token_expired' });
    const expectedSig = Buffer.from(expires + '|' + process.env.OWNER_PASSWORD).toString('base64');
    if (sigB64 !== expectedSig) return res.status(401).json({ error: 'token_invalid' });
  } catch { return res.status(401).json({ error: 'token_invalid' }); }

  const url   = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  const { moodImages, projects } = req.body;

  // Upstash REST API: POST /set/key with plain string body
  const r = await fetch(`${url}/set/hub_data`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(JSON.stringify({ moodImages, projects }))
  });

  const d = await r.json();
  return res.status(200).json({ ok: true, result: d });
}
