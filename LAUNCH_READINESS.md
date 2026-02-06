# ProCam — Launch Readiness Plan

This document summarizes the **Replit → local/deploy-agnostic** migration and a **launch readiness checklist** with gaps and improvements.

---

## ✅ Completed: Replit Removal & Local-Ready

### 1. Replit references removed
- **Deleted**: `.replit`, `replit.md`, `server/replit_integrations/` (auth moved to `server/auth/`).
- **Stripe**: No longer uses Replit connectors or `stripe-replit-sync`. Uses `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` from env.
- **Auth**: Replaced Replit OIDC with **generic OIDC** in `server/auth/` — configurable via `ISSUER_URL`, `OIDC_CLIENT_ID`, `OIDC_CLIENT_SECRET`, `BASE_URL`.
- **Vite**: Removed `@replit/vite-plugin-*` and `stripe-replit-sync` from `package.json`; Vite config uses only `react()`.

### 2. Auth (`server/auth/`)
- **oidcAuth.ts**: Single strategy `oidc`; callback URL from `BASE_URL`; logout uses `OIDC_CLIENT_ID` and `BASE_URL`.
- **storage.ts**: Same user/session storage (no Replit-specific comments).
- **routes.ts**: `/api/auth/user` behind `isAuthenticated`.

### 3. Stripe
- **stripeClient.ts**: Reads `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` from env; no Replit connector.
- **stripeService.ts**: Uses `getStripeClient()`; added `listProductsWithPrices()` (Stripe API) and `getSubscriptionById()`.
- **webhookHandlers.ts**: Uses `stripe.webhooks.constructEvent` and `STRIPE_WEBHOOK_SECRET`; handles `customer.subscription.updated` / `customer.subscription.deleted` to update `users.stripeSubscriptionId`.
- **Products/prices**: Served from Stripe API via `stripeService.listProductsWithPrices()` (no DB sync).
- **Subscription status**: Fetched from Stripe API when user has `stripeSubscriptionId`.

### 4. Config & docs
- **.env.example**: All required env vars (BASE_URL, OIDC, Stripe, DB, SESSION_SECRET).
- **.cursorrules**: Project conventions, auth/Stripe approach, no Replit.
- **README.md**: Updated env table, backend description, project structure.

---

## Launch checklist (fill gaps & improve)

### Must-have before first deploy

| Item | Status | Notes |
|------|--------|--------|
| Set all env vars from `.env.example` | ⬜ | Use real values for production (OIDC provider, Stripe live keys, BASE_URL = production URL). |
| OIDC provider | ⬜ | Configure Auth0 / Keycloak / Google OAuth with redirect URI `{BASE_URL}/api/callback` and logout/post-logout URI. |
| Stripe webhook | ⬜ | In Stripe Dashboard, add endpoint `{BASE_URL}/api/stripe/webhook`, subscribe to `customer.subscription.updated`, `customer.subscription.deleted`; set `STRIPE_WEBHOOK_SECRET`. |
| Database | ⬜ | Run `npm run db:push` against production DB; ensure `sessions` and app tables exist. |
| Build & start | ⬜ | `npm run build` then `npm run start` (or your host’s command). |
| HTTPS in production | ⬜ | `BASE_URL` must be `https://...`; cookies use `secure: true` in production. |

### Recommended improvements

| Area | Suggestion |
|------|------------|
| **Dev script (Windows)** | Use `cross-env` so `NODE_ENV=development` works: `"dev": "cross-env NODE_ENV=development tsx server/index.ts"`. |
| **Error handling** | Centralize API error responses; avoid leaking stack traces in production. |
| **Logging** | In production, consider structured logging (e.g. JSON) and log levels. |
| **Rate limiting** | Add rate limiting on `/api/login`, `/api/checkout`, and webhook to reduce abuse. |
| **Health check** | Add `GET /api/health` (e.g. DB ping + optional Stripe connectivity) for load balancers and monitoring. |
| **PWA / assetlinks** | Replace `REPLACE_WITH_YOUR_SHA256_FINGERPRINT` in `server/routes.ts` (assetlinks.json) with real SHA256 from PWABuilder/Play Store. |
| **Stripe products** | Ensure ProCam+ product and prices exist in Stripe (run `npx tsx server/seed-products.ts` once with `STRIPE_SECRET_KEY` set). |

### Optional / later

- **Email/password auth**: Add a second auth strategy (e.g. Passport Local) for users who don’t want OIDC.
- **Stripe publishable key API**: Expose `GET /api/stripe/publishable-key` if the client ever needs it (e.g. Stripe Elements).
- **Monitoring**: Add error tracking (e.g. Sentry) and uptime checks.
- **CI/CD**: Add `npm run check` (TypeScript) and basic smoke tests in pipeline.

---

## Quick start (local)

1. Copy `.env.example` to `.env` and set at least: `BASE_URL`, `DATABASE_URL`, `SESSION_SECRET`, `ISSUER_URL`, `OIDC_CLIENT_ID`, `OIDC_CLIENT_SECRET`, `STRIPE_*`.
2. `npm install`
3. `npm run db:push`
4. (Optional) `npx tsx server/seed-products.ts` to create ProCam+ product in Stripe.
5. `npm run dev` (on Windows you may need `set NODE_ENV=development` first or use `cross-env`).
6. Open `BASE_URL` (e.g. `http://localhost:5000`), sign in via OIDC, and test camera, gallery, and subscription flow.

---

## Deploy targets

The app is **deployment-agnostic**. Typical options:

- **Railway / Render / Fly.io**: Set env vars, connect Postgres, run `npm run build && npm run start`.
- **Vercel**: Use serverless functions for API or run the Express app via a custom server; ensure WebSocket/streaming if needed for future features.
- **VPS (e.g. Ubuntu)**: Node, PM2 or systemd, reverse proxy (nginx/Caddy), SSL (e.g. Let’s Encrypt).

Ensure `BASE_URL` matches the public URL and that OIDC and Stripe webhook URLs use that base.

---

You’re ready to launch once env, OIDC, Stripe webhook, DB, and build/start are in place. Use the checklist above to close any remaining gaps and then iterate on the recommended improvements.
