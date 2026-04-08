// api/owner/check.js
export default async function handler(req, res) {
  const cookieHeader = req.headers.cookie || '';
  const match = cookieHeader.match(/owner_token=([^;]+)/);

  if (!match) {
    return res.status(401).json({ error: 'not_authenticated' });
  }

  try {
    const [payloadB64, sigB64] = match[1].split('.');
    const { expires } = JSON.parse(Buffer.from(payloadB64, 'base64').toString());

    if (Date.now() > expires) {
      return res.status(401).json({ error: 'token_expired' });
    }

    const correct = process.env.OWNER_PASSWORD;
    const expectedSig = Buffer.from(expires + '|' + correct).toString('base64');

    if (sigB64 !== expectedSig) {
      return res.status(401).json({ error: 'token_invalid' });
    }

    return res.status(200).json({ owner: true });
  } catch {
    return res.status(401).json({ error: 'token_invalid' });
  }
}
