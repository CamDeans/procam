# Deploying ProCam on Vercel

This project is set up for **Vercel** deployment: Express runs as a serverless function, and the built client is served from `public/`.

---

## Before you deploy

1. **Environment variables**  
   In the Vercel project → **Settings → Environment Variables**, add all variables from `.env.example` (see README).  
   **Important:** Set `BASE_URL` to your Vercel app URL, e.g. `https://your-app.vercel.app` (no trailing slash). After the first deploy, replace with your custom domain if you use one.

2. **Build**  
   Vercel runs `npm run build`, which:
   - Builds the client (Vite) → `public/`
   - Builds the server (esbuild) → `dist/index.cjs`

3. **Static files**  
   Vercel serves everything in `public/` from the CDN. `express.static()` is not used on Vercel.

4. **API / SPA**  
   All non-static requests are rewritten to the serverless function (`api/index.ts`), which forwards to the Express app. The app serves `index.html` for SPA routes when running on Vercel.

---

## Deploy steps

1. **Connect the repo**  
   [Vercel Dashboard](https://vercel.com/new) → Import your Git repository.

2. **Configure project**
   - **Framework Preset:** Other (or leave auto)
   - **Build Command:** `npm run build`
   - **Output Directory:** `public`
   - **Install Command:** `npm install`

3. **Environment variables**  
   Add every variable from `.env.example`. At minimum:
   - `MONGODB_URI`, `BASE_URL`, `SESSION_SECRET`
   - `ISSUER_URL`, `OIDC_CLIENT_ID`, `OIDC_CLIENT_SECRET`
   - `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`

4. **Deploy**  
   Push to your connected branch or click Deploy. After deploy, set `BASE_URL` to the deployed URL (e.g. `https://your-app.vercel.app`).

5. **OIDC and Stripe**
   - In your OIDC provider, set redirect URI to `https://<your-vercel-url>/api/callback`.
   - In Stripe Dashboard → Webhooks, add `https://<your-vercel-url>/api/stripe/webhook` and set `STRIPE_WEBHOOK_SECRET`.

---

## Local production build (optional)

To run the same build locally:

```bash
npm run build
npm run start
```

Static files are served from `public/` and the server from `dist/index.cjs`. For Vercel, only the serverless path is used; static files are served by Vercel’s CDN.

---

## Linking the app to procam.cloud

After the app is live on Vercel (e.g. `https://procam.vercel.app`):

1. Deploy the **landing page** to **procam.cloud** (see `LANDING.md` and `landing/`).
2. On the landing page, set the **“Open App”** (or equivalent) button/link to your Vercel app URL.
3. Optionally, add a custom domain in Vercel for the app (e.g. `app.procam.cloud`) and use that as the app link and as `BASE_URL`.
