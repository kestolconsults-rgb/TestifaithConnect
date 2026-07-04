---
name: Cloudflare Turnstile dev testing
description: How to test Cloudflare Turnstile CAPTCHA locally without domain allow-list errors
---

Real Turnstile site keys are locked to specific hostnames in the Cloudflare dashboard. Replit's dev preview domain is random per session/workspace and can't be permanently allow-listed, so the real site key throws Cloudflare error 110200 ("hostname not allowed") in dev preview — Turnstile hostname fields also reject full URLs, they need a bare hostname (no `https://`, no path).

**Why:** Needed a way to test the full signup + CAPTCHA flow locally without asking the user to constantly update Cloudflare's domain allow-list for ephemeral preview URLs.

**How to apply:** Serve Cloudflare's official dummy site key (`1x00000000000000000000AA`, always passes) from the backend config endpoint whenever `NODE_ENV !== "production"`, and verify with the paired dummy secret key (`1x0000000000000000000000000000000AA`) server-side in the same condition. Only use the real `TURNSTILE_SITE_KEY`/`TURNSTILE_SECRET_KEY` env secrets when `NODE_ENV === "production"`. The dummy token/secret pair only pass verification when matched with each other — a dummy token will NOT pass against the real secret key, and vice versa.
