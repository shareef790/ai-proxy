export const config = { runtime: 'edge' };

function cors(origin, allowed) {
  const ok = !origin || allowed.includes(origin);
  return {
    'access-control-allow-origin': ok ? (origin || '*') : 'null',
    'access-control-allow-headers': 'content-type,x-tenant,x-tenant-key',
    'access-control-allow-methods': 'POST,OPTIONS',
    'access-control-allow-credentials': 'true',
    'vary': 'Origin'
  };
}

export default async function handler(req) {
  const allowed = (process.env.ALLOWED_ORIGINS || '')
    .split(',').map(s => s.trim()).filter(Boolean);

  const origin = req.headers.get('origin') || '';
  const corsHdrs = cors(origin, allowed);

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHdrs });
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'POST only' }), {
      status: 405, headers: { ...corsHdrs, 'content-type': 'application/json' }
    });
  }

  const body = await req.json().catch(() => ({}));
  const { messages = [], model = 'gpt-4o-mini', clientId = 'unknown' } = body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: 'messages[] required' }), {
      status: 400, headers: { ...corsHdrs, 'content-type': 'application/json' }
    });
  }

  const system = {
    role: 'system',
    content:
      'You are Techsmart AI Assistant. Be concise (2–4 sentences). Focus on services and politely capture lead details.'
  };

  const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({ model, messages: [system, ...messages], stream: false })
  });

  const data = await upstream.json();
  const status = upstream.status;

  return new Response(JSON.stringify({
    clientId, reply: data?.choices?.[0]?.message?.content || '', usage: data?.usage || {}
  }), { status, headers: { ...corsHdrs, 'content-type': 'application/json' }});
}
