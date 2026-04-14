// api/data/get.js
export default async function handler(req, res) {
  const url   = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
 
  const r = await fetch(`${url}/get/hub_data`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const d = await r.json();
  const data = d.result ? JSON.parse(d.result) : { moodImages: [], projects: [] };
  return res.status(200).json(data);
}
 
