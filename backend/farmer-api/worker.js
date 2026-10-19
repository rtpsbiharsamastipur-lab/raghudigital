/**
 * RAGHU BABA ONLINE SERVICE — Farmer Verify proxy
 * Deploy as a Cloudflare Worker. Set FINPAY_API_KEY as a Worker secret.
 * Never put provider credentials in index.html or commit them to GitHub.
 */
const ALLOWED_ORIGINS = new Set([
  "https://rtpsbiharsamastipur-lab.github.io",
]);

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.has(origin) ? origin : "https://rtpsbiharsamastipur-lab.github.io";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  };
}
function json(data, status, origin) {
  return new Response(JSON.stringify(data), { status, headers: corsHeaders(origin) });
}
export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }
    if (request.method !== "GET") return json({ status: "ERROR", message: "Method not allowed" }, 405, origin);
    if (origin && !ALLOWED_ORIGINS.has(origin)) return json({ status: "ERROR", message: "Origin not allowed" }, 403, origin);
    if (!env.FINPAY_API_KEY) return json({ status: "ERROR", message: "Backend API secret is not configured" }, 503, origin);

    const url = new URL(request.url);
    const aadhaar = (url.searchParams.get("aadhaar") || "").replace(/\s/g, "");
    const state = (url.searchParams.get("state") || "").trim().toUpperCase();
    if (!/^\d{12}$/.test(aadhaar)) return json({ status: "ERROR", message: "Aadhaar must contain 12 digits" }, 400, origin);
    if (!/^[A-Z]{2}$/.test(state)) return json({ status: "ERROR", message: "Use a two-letter state code, e.g. BR" }, 400, origin);

    const orderid = (url.searchParams.get("orderid") || ("RB-FARMER-" + crypto.randomUUID())).slice(0, 64);
    const upstream = new URL("https://api.finpayultra.com/api/farmer-verify");
    upstream.searchParams.set("api_key", env.FINPAY_API_KEY);
    upstream.searchParams.set("orderid", orderid);
    upstream.searchParams.set("aadhaar", aadhaar);
    upstream.searchParams.set("state", state);

    try {
      const response = await fetch(upstream.toString(), {
        method: "GET",
        headers: { "Accept": "application/json" },
        signal: AbortSignal.timeout(20000),
      });
      const text = await response.text();
      let data;
      try { data = JSON.parse(text); }
      catch { data = { status: "ERROR", message: "Provider returned a non-JSON response" }; }
      // Do not log Aadhaar, API key, or provider URL.
      return json({ http_status: response.status, orderid, provider: data }, response.ok ? 200 : 502, origin);
    } catch {
      return json({ status: "ERROR", orderid, message: "Provider request failed or timed out. Please check provider status before retrying." }, 502, origin);
    }
  }
};
