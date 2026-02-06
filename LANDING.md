# ProCam Landing Page (procam.cloud)

The landing page lives in **`landing/`** and is built/prepped for deploy at **https://procam.cloud**. You then link it to the ProCam app (Vercel URL or custom domain).

---

## Quick start

### 1. Set the app URL

The "Open App" button points to **`window.PROCAM_APP_URL`**. You can set it in two ways:

- **Edit `landing/config.js`** and set:
  ```js
  window.PROCAM_APP_URL = 'https://your-app.vercel.app';
  ```
  or your custom app domain (e.g. `https://app.procam.cloud`).

- **Or** use the build script with an env var:
  ```bash
  LANDING_APP_URL=https://your-app.vercel.app npm run landing:build
  ```
  This runs `script/landing-build.cjs` and writes `landing/dist/config.js` with that URL.

### 2. Build the landing page

From the project root:

```bash
npm run landing:build
```

This creates **`landing/dist/`** with:

- `index.html`
- `config.js` (with the app URL from `LANDING_APP_URL` or default `https://app.procam.cloud`)

### 3. Prep for launch (same as build)

```bash
npm run landing:prep
```

Same as `landing:build`; use it when you’re ready to deploy the contents of **`landing/dist/`** to procam.cloud.

### 4. Deploy to procam.cloud

Deploy the **`landing/dist/`** folder to the host that serves **procam.cloud**:

- **Vercel:** Create a separate Vercel project for the landing page.
  - Root directory: `landing` (or use a subfolder deploy).
  - Build command: `npm run landing:build` (run from repo root; you may need to set "Root Directory" to repo root and "Output Directory" to `landing/dist`), **or** manually run `landing:build` locally and deploy only `landing/dist` (e.g. drag-and-drop or `vercel landing/dist`).
  - Simpler: run `npm run landing:build` locally, then in the Vercel project set **Root Directory** to `landing` and add a build step that runs the root script, or deploy `landing/dist` as a static export.

- **Netlify / other:** Upload or connect a repo and set the publish directory to **`landing/dist`** (after running `npm run landing:build` from repo root), or run the build in CI and publish `landing/dist`.

**Linking the app:** After the app is live (e.g. on Vercel), set `LANDING_APP_URL` (or `landing/config.js`) to that URL so "Open App" goes to the right place. Then deploy the landing to procam.cloud.

---

## Scripts (run from repo root)

| Script | Description |
|--------|-------------|
| `npm run landing:build` | Build landing → `landing/dist/`. Uses `LANDING_APP_URL` for the app link. |
| `npm run landing:prep` | Same as `landing:build`; use when prepping for launch. |
| `npm run landing:preview` | Serves `landing/dist/` at http://localhost:8080 (optional). |

---

## File layout

```
landing/
  index.html    # Single-page landing
  config.js     # App URL (default https://app.procam.cloud)
  dist/         # Output after landing:build (gitignored)
    index.html
    config.js
```

After building, deploy **`landing/dist/`** to the server or static host that serves **https://procam.cloud**.
