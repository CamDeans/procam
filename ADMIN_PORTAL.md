# ProCam Admin Portal

The **Admin Portal** is for the **admin** (lead developer / business) and **investors/founders** (partners). All metrics visible to the admin are also visible to partners to ensure transparency.

**Partner & investor feedback:** The dashboard and reports (CSV / PDF) are intended to give partners and investors a clear view of **turnover metrics** (users, subscriptions, churn) and **sales that scale** (MRR, revenue split, withdrawals). Use the metrics and downloadable reports to share this feedback with partners or investors; the admin does not need to expose these concepts on the public landing or app.

---

## Access

- **URL:** `/admin` (linked from the main app login page).
- **Who can access:** Only users whose email is the **admin email** or listed as a **partner email** in admin config.
- **Admin email:** Set via **`ADMIN_EMAIL`** in your environment. This is the only email that can:
  - Change admin config (partner emails, split %, first-year payout %).
  - Create announcements.
  - Create withdrawal requests and confirm as admin.
  - Execute withdrawals after dual confirmation.
- **Partner emails:** Set in the admin config (Admin Portal → config, admin only). Partners can:
  - View all metrics (same as admin).
  - View announcements.
  - Confirm withdrawals as partner (dual confirmation).
  - Manage their own tax details and download reports.

---

## Revenue split (default)

- **Admin / Lead:** 35%
- **Partner:** 35%
- **Scaling & dev:** 30%

**First-year payout policy:** In the app’s first year, only **10%** of each portion (admin and partner) is paid out to admin and partner. The remaining 90% stays for scaling and future planning. Override requires **dual email confirmation** (admin + partner).

---

## Features

| Feature | Admin | Partner |
|--------|--------|--------|
| View metrics (users, MRR, subscriptions) | ✓ | ✓ |
| View revenue split (pie chart) | ✓ | ✓ |
| View first-year 10% notice | ✓ | ✓ |
| View announcements | ✓ | ✓ |
| Create announcements | ✓ | — |
| View withdrawals | ✓ | ✓ |
| Create withdrawal request | ✓ | — |
| Confirm withdrawal (admin) | ✓ | — |
| Confirm withdrawal (partner) | ✓ | ✓ |
| Execute withdrawal (after dual confirm) | ✓ | — |
| Tax details (own) | ✓ | ✓ |
| Download reports (CSV / PDF) | ✓ | ✓ |
| Edit admin config | ✓ | — |

---

## Reports

- **CSV:** `/api/admin/reports/csv` — metrics, config, withdrawals (download as CSV).
- **PDF:** `/api/admin/reports/pdf` — same content as HTML; use **Print → Save as PDF** in the browser.

All documentation and reports should reflect **ProCam business details** and **support@procam.cloud**.

---

## Database

- **Admin config** is stored in MongoDB (single document: `AdminConfig`). Default admin email comes from **`ADMIN_EMAIL`**; if no document exists, it is created on first access with that email.
- **Announcements**, **withdrawal requests**, **tax details**, and **app logs** are stored in their own collections.

---

## ProCam business

- **Support:** support@procam.cloud  
- **Landing:** https://procam.cloud  
- **App:** Your deployed app URL (e.g. https://app.procam.cloud)

All admin reports and documentation should include these details where relevant.
