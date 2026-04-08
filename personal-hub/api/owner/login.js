// api/owner/login.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const { password } = req.body || {};
  const correct = process.env.OWNER_PASSWORD;

  if (!password || !correct || password !== correct) {
    await new Promise(r => setTimeout(r, 400));
    return res.status(401).json({ error: 'incorrect_password' });
  }

  const expires = Date.now() + 12 * 60 * 60 * 1000;
  const payload = Buffer.from(JSON.stringify({ expires })).toString('base64');
  const sig = Buffer.from(expires + '|' + correct).toString('base64');
  const token = payload + '.' + sig;

  res.setHeader('Set-Cookie', `owner_token=${token}; HttpOnly; SameSite=Strict; Max-Age=43200; Path=/`);
  return res.status(200).json({ ok: true });
}
