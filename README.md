# ProCam - Professional Mobile Camera App

A professional mobile-first Progressive Web App camera with real device camera access, manual controls, composition guides, and subscription-based premium features.

## Features

### Free Tier
- Camera access with live viewfinder
- Manual controls: Aperture, Shutter Speed, ISO, White Balance
- Lens selection: 14mm, 24mm, 35mm, 50mm
- JPEG capture
- Composition guides: Rule of Thirds, Center Cross
- Gallery with up to 50 photos
- Camera presets (save/load settings)

### ProCam+ (Subscription)
- All free features plus:
- 85mm portrait lens
- RAW + JPEG dual capture
- Unlimited photo storage
- Golden Ratio composition guide
- Priority support

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite build tool
- Tailwind CSS with shadcn/ui components
- Framer Motion animations
- TanStack Query for state management
- Wouter for routing

### Backend
- Node.js with Express
- **MongoDB** (MongoDB Atlas or any MongoDB) with Mongoose
- OpenID Connect (OIDC) auth — any provider (Auth0, Keycloak, Google, etc.)
- Stripe for subscriptions (env-based; no platform lock-in)

## Getting Started

### Development
```bash
npm install
npm run dev
```

The app runs on port 5000 with hot reloading.

### Database
MongoDB: no migrations. Collections (users, presets, gallery, sessions) are created on first use. See **LOCAL_TESTING.md** for MongoDB Atlas and local testing.

## ProCam business

- **Support:** support@procam.cloud  
- **Landing:** https://procam.cloud  
- **Contact:** Visitors and users can email **support@procam.cloud** (landing page and app Settings).

## Admin portal

- **Access:** `/admin` (linked from the login page). Only the **admin email** (set via `ADMIN_EMAIL`) and **partner emails** (set in admin config) can access.
- **Features:** Metrics (users, MRR, subscriptions), revenue split (35% admin / 35% partner / 30% scaling), first-year 10% payout notice, announcements, withdrawals with dual confirmation (admin + partner), tax details, and reports (CSV and PDF).
- **Reports:** CSV and PDF exports from the Admin Portal; all reports include ProCam business details.
- See **ADMIN_PORTAL.md** for full details.

## Deployment

- **Vercel:** The codebase is ready for Vercel. See **DEPLOY_VERCEL.md** for build, env vars, and deploy steps.
- **Landing page (procam.cloud):** Run `npm run landing:build` (or `npm run landing:prep`) to build the landing page to `landing/dist/`. Set `LANDING_APP_URL` to your app URL so the "Open App" button links correctly. See **LANDING.md** for deploy and linking steps.

## PWA Installation

The app can be installed as a Progressive Web App on any device:

1. Visit the published URL in your browser
2. Click "Add to Home Screen" or install prompt
3. Launch from your home screen for fullscreen experience

## App Store Distribution

### Google Play Store

1. Publish the app to get a live HTTPS URL
2. Go to [PWABuilder.com](https://pwabuilder.com)
3. Enter your published URL
4. Download the Android package
5. Update the SHA256 fingerprint in the server routes:
   - Get the fingerprint from PWABuilder
   - Update `server/routes.ts` in the `assetlinks.json` endpoint
6. Upload AAB to Google Play Console

### iOS App Store

1. Publish the app to get a live HTTPS URL
2. Go to [PWABuilder.com](https://pwabuilder.com)
3. Download the iOS package
4. Open in Xcode on a Mac
5. Configure signing with your Apple Developer account
6. Submit to App Store Connect

## Project Structure

```
client/
  src/
    components/     # Reusable UI components
    hooks/          # Custom React hooks
    lib/            # Utilities and helpers
    pages/          # Route pages (Camera, Gallery, Settings)
  public/
    icons/          # App icons (72x72 to 512x512)
    manifest.json   # PWA manifest
    sw.js           # Service worker

server/
  auth/             # OIDC auth (setupAuth, isAuthenticated, routes)
  routes.ts         # API endpoints
  storage.ts        # Database operations
  stripeClient.ts   # Stripe client (env-based)
  stripeService.ts  # Stripe checkout, portal, products
  webhookHandlers.ts # Stripe webhook (subscription updates)

shared/
  schema.ts         # Database schema and types
  routes.ts         # API route definitions
```

## Environment Variables

Copy `.env.example` to `.env` and set:

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default `5000`) |
| `NODE_ENV` | No | `development` or `production` |
| `BASE_URL` | Yes | Public URL (e.g. `http://localhost:5000` or `https://yourdomain.com`) — used for OIDC callbacks and webhook URL |
| `MONGODB_URI` or `DATABASE_URL` | Yes | MongoDB connection string (e.g. MongoDB Atlas: `mongodb+srv://user:pass@cluster.mongodb.net/procam?retryWrites=true&w=majority`) |
| `SESSION_SECRET` | Yes | Session encryption key (min 32 chars) |
| `ISSUER_URL` | Yes | OIDC issuer URL (e.g. Auth0 tenant, Keycloak realm) |
| `OIDC_CLIENT_ID` | Yes | OIDC client ID |
| `OIDC_CLIENT_SECRET` | Yes | OIDC client secret |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key (e.g. `sk_test_...`) |
| `STRIPE_PUBLISHABLE_KEY` | Yes | Stripe publishable key (e.g. `pk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | Yes (for webhooks) | Stripe webhook signing secret (`whsec_...`) — add endpoint in [Stripe Dashboard](https://dashboard.stripe.com/webhooks): `{BASE_URL}/api/stripe/webhook` |

## Camera Controls

| Control | Range | Description |
|---------|-------|-------------|
| Aperture | f/1.4 - f/22 | Depth of field |
| Shutter | 1/8000s - 30s | Exposure time |
| ISO | 50 - 25600 | Light sensitivity |
| White Balance | 2500K - 10000K | Color temperature |
| Lens | 14mm - 85mm | Focal length |

## License

Proprietary - All rights reserved
