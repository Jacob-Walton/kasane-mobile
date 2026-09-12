/* A CORS proxy for the web preview only. A phone talks to the instance directly; a browser cannot,
   so `expo start --web` is pointed here instead.

   node proxy.mjs   then   EXPO_PUBLIC_GITEA_API=http://localhost:8788/api/v1 npx expo start --web */

import { createServer } from 'node:http';

const UPSTREAM = 'https://git.konpeki.co.uk';
const PORT = 8788;

createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Accept, Content-Type');
  if (req.method === 'OPTIONS') return res.writeHead(204).end();
  try {
    const upstream = await fetch(`${UPSTREAM}${req.url}`, { headers: { Accept: 'application/json' } });
    res.writeHead(upstream.status, { 'Content-Type': 'application/json' });
    res.end(await upstream.text());
  } catch (e) {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: String(e) }));
  }
}).listen(PORT, () => console.log(`proxying ${UPSTREAM} on http://localhost:${PORT}`));
