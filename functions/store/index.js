function unauthorized() {
  return new Response("Unauthorized", { status: 401 });
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  if (!env.STORE_TOKEN || token !== env.STORE_TOKEN) return unauthorized();

  const log = await env.STORE_KV.get("store_log", "json");
  const data = Array.isArray(log) ? log : [];

  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Store</title>
  <style>
    body{font-family:system-ui;padding:16px}
    pre{white-space:pre-wrap;word-break:break-word}
  </style>
</head>
<body>
  <h1>Stored submissions</h1>
  <p>Count: ${data.length}</p>
  <pre>${escapeHtml(JSON.stringify(data, null, 2))}</pre>
</body>
</html>`;

  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function escapeHtml(s) {
  return s.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");
}
