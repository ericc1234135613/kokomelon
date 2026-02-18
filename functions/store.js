export async function onRequestPost({ request, env }) {
  const body = await request.json().catch(() => null);
  if (!body) return new Response("Bad JSON", { status: 400 });

  // ✅ Allowed: non-sensitive fields (ex: email)
  // ❌ Not allowed: otp, password, auth codes, session tokens, etc.
  if ("otp" in body || body?.event === "otp_complete") {
    return new Response("Refused: OTP/auth codes are not accepted.", { status: 400 });
  }

  const entry = {
    ts: Date.now(),
    ip: request.headers.get("CF-Connecting-IP") || "",
    ua: request.headers.get("User-Agent") || "",
    body,
  };

  const key = "store_log";
  const existing = await env.STORE_KV.get(key, "json");
  const next = Array.isArray(existing) ? existing : [];
  next.push(entry);

  // Keep last 500 records
  const capped = next.slice(-500);

  await env.STORE_KV.put(key, JSON.stringify(capped));
  return Response.json({ ok: true });
}
