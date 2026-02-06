# Testing ProCam Locally (MongoDB Atlas)

This guide walks you through running ProCam on your machine with **MongoDB Atlas** as the database.

---

## 1. MongoDB Atlas setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign in or create an account.
2. Create a **free cluster** (M0).
3. Under **Database Access**, add a database user (username + password). Note the password.
4. Under **Network Access**, add your IP (or `0.0.0.0/0` for “allow from anywhere” — only for local/testing).
5. Click **Connect** on your cluster → **Connect your application** → copy the connection string. It looks like:
   ```text
   mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Add the database name to the path (e.g. `procam`):
   ```text
   mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/procam?retryWrites=true&w=majority
   ```
   Replace `USER` and `PASSWORD` with your DB user and password.

---

## 2. Environment variables

1. Copy the example env file:
   ```bash
   cp .env.example .env
   ```
2. Edit `.env` and set at least:

   | Variable | Example / notes |
   |----------|------------------|
   | `MONGODB_URI` | Your Atlas connection string (with `/procam` and real user/password). |
   | `BASE_URL` | `http://localhost:5000` |
   | `SESSION_SECRET` | Long random string (e.g. 32+ chars). |
   | `ISSUER_URL` | Your OIDC provider issuer (e.g. Auth0). |
   | `OIDC_CLIENT_ID` | OIDC client ID. |
   | `OIDC_CLIENT_SECRET` | OIDC client secret. |
   | `STRIPE_SECRET_KEY` | Stripe test key (`sk_test_...`). |
   | `STRIPE_PUBLISHABLE_KEY` | Stripe test key (`pk_test_...`). |

   For **Stripe webhooks** in local dev you can use Stripe CLI (see step 5).  
   For **auth**, use an OIDC provider (e.g. Auth0 free tier) and set redirect URI to `http://localhost:5000/api/callback`.

---

## 3. Install and run

```bash
npm install
npm run dev
```

- App: **http://localhost:5000**
- MongoDB collections (users, presets, gallery, sessions) are created automatically on first use.

---

## 4. Optional: seed Stripe products

To create the ProCam+ product and prices in Stripe (once):

```bash
npx tsx server/seed-products.ts
```

Requires `STRIPE_SECRET_KEY` in `.env`.

---

## 5. Optional: Stripe webhooks locally

1. Install [Stripe CLI](https://stripe.com/docs/stripe-cli).
2. Log in: `stripe login`
3. Forward webhooks to your app:
   ```bash
   stripe listen --forward-to localhost:5000/api/stripe/webhook
   ```
4. Copy the printed **webhook signing secret** (`whsec_...`) into `.env` as `STRIPE_WEBHOOK_SECRET`.

---

## 6. Quick checklist

- [ ] MongoDB Atlas cluster + user + network access
- [ ] `MONGODB_URI` in `.env` (with `/procam` and real credentials)
- [ ] `BASE_URL=http://localhost:5000`
- [ ] `SESSION_SECRET` set
- [ ] OIDC provider configured (redirect `http://localhost:5000/api/callback`)
- [ ] Stripe test keys in `.env`
- [ ] `npm run dev` → open http://localhost:5000
- [ ] (Optional) `npx tsx server/seed-products.ts` and Stripe CLI for webhooks

---

## Troubleshooting

- **“MONGODB_URI or DATABASE_URL must be set”**  
  Set `MONGODB_URI` (or `DATABASE_URL`) in `.env` to your Atlas connection string.

- **“BASE_URL must be set”**  
  Add `BASE_URL=http://localhost:5000` to `.env`.

- **“ISSUER_URL and OIDC_CLIENT_ID must be set”**  
  Configure an OIDC provider (e.g. Auth0) and set `ISSUER_URL`, `OIDC_CLIENT_ID`, and `OIDC_CLIENT_SECRET` in `.env`.

- **MongoDB connection timeout**  
  Check Network Access in Atlas (your IP or `0.0.0.0/0` for testing) and that the connection string user/password and cluster host are correct.

- **Preset/Gallery IDs**  
  IDs are now MongoDB ObjectIds (24-char strings). The API uses these string IDs for delete and list; the client does not need numeric IDs.
