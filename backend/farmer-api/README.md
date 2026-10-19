# Farmer Verify API backend (Cloudflare Worker)

This is a separate backend scaffold for RAGHU BABA ONLINE SERVICE. It does not modify the live site or existing Firebase retailer/wallet/order data.

## 1. Create Worker
1. Sign in at https://dash.cloudflare.com/
2. Open **Workers & Pages** → **Create** → **Worker**.
3. Name it, for example `raghu-farmer-api`, and deploy the contents of `worker.js`.
4. In Worker **Settings → Variables and Secrets**, add a secret named `FINPAY_API_KEY` with the key from FinPay ULTRA. Do not commit the key to GitHub or put it in frontend JavaScript.
5. Deploy and copy the Worker URL.

## 2. Test
Open this URL in a browser (replace the host and use a test Aadhaar only with explicit consent):
`https://YOUR-WORKER.workers.dev/?aadhaar=123456789012&state=BR`

This example Aadhaar is a placeholder; it should fail validation only if malformed, and must not be used as a real identity. Prefer a provider-approved test mode/test identity. Provider charges may apply even for unsuccessful verification.

## 3. Important limitations
- This Worker is a proxy scaffold, not a verified live integration. It has not been deployed or tested against the provider.
- Verify FinPay's current endpoint, field names, billable behavior, test-mode rules, privacy terms and actual response before production.
- It does not debit retailer wallets. Do not implement wallet deduction until billing behavior and duplicate/retry handling are confirmed.
- Before production, add rate limiting/abuse controls and ensure only authorized, consented requests are made. Aadhaar is sensitive personal data; do not log it.
- CORS currently permits the GitHub Pages origin `https://rtpsbiharsamastipur-lab.github.io`; update this allowlist if the site origin changes.
- Do not use this proxy to bypass authentication or provider access restrictions.
