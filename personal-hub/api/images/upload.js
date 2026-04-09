// api/images/upload.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method_not_allowed' });
  }
 
  // Verify owner cookie before allowing upload
  const cookieHeader = req.headers.cookie || '';
  const match = cookieHeader.match(/owner_token=([^;]+)/);
  if (!match) return res.status(401).json({ error: 'not_authenticated' });
 
  try {
    const [payloadB64, sigB64] = match[1].split('.');
    const { expires } = JSON.parse(Buffer.from(payloadB64, 'base64').toString());
    if (Date.now() > expires) return res.status(401).json({ error: 'token_expired' });
    const expectedSig = Buffer.from(expires + '|' + process.env.OWNER_PASSWORD).toString('base64');
    if (sigB64 !== expectedSig) return res.status(401).json({ error: 'token_invalid' });
  } catch {
    return res.status(401).json({ error: 'token_invalid' });
  }
 
  const { image } = req.body; // base64 data URL
  if (!image) return res.status(400).json({ error: 'no_image' });
 
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey    = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
 
  // Build signed upload request
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = 'personal-hub-mood';
 
  // Generate signature
  const crypto = await import('crypto');
  const sigStr = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash('sha1').update(sigStr).digest('hex');
 
  const formData = new URLSearchParams();
  formData.append('file', image);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp);
  formData.append('signature', signature);
  formData.append('folder', folder);
 
  const r = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData
  });
 
  const data = await r.json();
 
  if (data.secure_url) {
    return res.status(200).json({ url: data.secure_url, publicId: data.public_id });
  } else {
    return res.status(500).json({ error: 'upload_failed', detail: data });
  }
}
