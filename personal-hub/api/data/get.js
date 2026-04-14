// api/data/get.js
export default async function handler(req, res) {
  const url   = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
 
  const r = await fetch(`${url}/get/hub_data`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const d = await r.json();
 
  let data = { moodImages: [], projects: [] };
  if (d.result) {
    try {
      // Upstash may double-stringify — handle both cases
      const parsed = typeof d.result === 'string' ? JSON.parse(d.result) : d.result;
      data = typeof parsed === 'string' ? JSON.parse(parsed) : parsed;
    } catch { /* return empty default */ }
  }
 
  return res.status(200).json(data);
}
 
