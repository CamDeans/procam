import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, registerAuthRoutes } from "./auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { stripeService } from "./stripeService";
import { isAdmin, isAdminOrPartner } from "./admin";
import * as adminStorage from "./adminStorage";
import { z } from "zod";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  // Android App Links verification for Google Play Store
  // Update the sha256_cert_fingerprints after generating your PWABuilder package
  app.get('/.well-known/assetlinks.json', (req, res) => {
    res.json([{
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: "app.procam.twa",
        sha256_cert_fingerprints: [
          "REPLACE_WITH_YOUR_SHA256_FINGERPRINT"
        ]
      }
    }]);
  });

  // Auth Setup
  await setupAuth(app);
  registerAuthRoutes(app);

  const { isAuthenticated } = await import("./auth");

  // Presets
  app.get(api.presets.list.path, isAuthenticated, async (req: any, res) => {
    const items = await storage.getPresets(req.user.claims.sub);
    res.json(items);
  });
  app.post(api.presets.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.presets.create.input.parse(req.body);
      const item = await storage.createPreset({ ...input, userId: req.user.claims.sub });
      res.status(201).json(item);
    } catch (e) {
      res.status(400).json({ error: e });
    }
  });
  app.delete(api.presets.delete.path, isAuthenticated, async (req: any, res) => {
    await storage.deletePreset(req.params.id, req.user.claims.sub);
    res.status(204).send();
  });

  // Gallery
  app.get(api.gallery.list.path, isAuthenticated, async (req: any, res) => {
    const items = await storage.getGallery(req.user.claims.sub);
    res.json(items);
  });

  const FREE_LENSES = ["14mm", "24mm", "35mm", "50mm"];
  const FREE_PHOTO_LIMIT = 50;

  app.post(api.gallery.create.path, isAuthenticated, async (req: any, res) => {
    try {
      console.log('[gallery] Save request from user:', req.user.claims.sub);
      console.log('[gallery] Body size:', JSON.stringify(req.body).length, 'bytes');
      const input = api.gallery.create.input.parse(req.body);
      console.log('[gallery] Input validated, url length:', input.url?.length);
      const user = await storage.getUser(req.user.claims.sub);
      console.log('[gallery] User found:', !!user, 'isPro:', !!(user?.stripeSubscriptionId));
      const isPro = !!(user?.stripeSubscriptionId);
      
      if (!isPro) {
        const currentGallery = await storage.getGallery(req.user.claims.sub);
        if (currentGallery.length >= FREE_PHOTO_LIMIT) {
          return res.status(403).json({ error: "Free tier limit of 50 photos reached. Upgrade to ProCam+ for unlimited storage." });
        }
        
        const metadata = input.metadata as any;
        if (metadata?.rawMode || input.originalUrl) {
          return res.status(403).json({ error: "RAW capture requires ProCam+ subscription." });
        }
        if (metadata?.lens && !FREE_LENSES.includes(metadata.lens)) {
          return res.status(403).json({ error: "85mm lens requires ProCam+ subscription." });
        }
      }
      
      const item = await storage.createGalleryItem({ ...input, userId: req.user.claims.sub });
      console.log('[gallery] Created item with id:', item.id);
      res.status(201).json(item);
    } catch (e) {
      console.log('[gallery] Error saving:', e);
      res.status(400).json({ error: e });
    }
  });
  app.delete(api.gallery.delete.path, isAuthenticated, async (req: any, res) => {
    await storage.deleteGalleryItem(req.params.id, req.user.claims.sub);
    res.status(204).send();
  });

  // Stripe Routes
  app.get('/api/subscription', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      console.log('[subscription] Checking subscription for user:', user?.id, 'customerId:', user?.stripeCustomerId, 'subscriptionId:', user?.stripeSubscriptionId);
      
      if (user?.stripeCustomerId && !user.stripeSubscriptionId) {
        console.log('[subscription] User has customer ID but no subscription ID, checking Stripe...');
        const activeSubscription = await stripeService.getActiveSubscription(user.stripeCustomerId);
        console.log('[subscription] Stripe returned subscription:', activeSubscription?.id, 'status:', activeSubscription?.status);
        if (activeSubscription) {
          await storage.updateUserStripeInfo(user.id, { stripeSubscriptionId: activeSubscription.id });
          console.log('[subscription] Updated user with subscription ID:', activeSubscription.id);
          return res.json({ 
            subscription: {
              id: activeSubscription.id,
              status: activeSubscription.status,
              currentPeriodEnd: new Date(((activeSubscription as any).current_period_end || 0) * 1000).toISOString(),
            }
          });
        }
      }
      
      if (!user?.stripeSubscriptionId && user?.email) {
        console.log('[subscription] No subscription found by customer ID, trying email lookup:', user.email);
        const result = await stripeService.getActiveSubscriptionByEmail(user.email);
        if (result) {
          await storage.updateUserStripeInfo(user.id, { 
            stripeCustomerId: result.customerId,
            stripeSubscriptionId: result.subscription.id 
          });
          console.log('[subscription] Found subscription by email! Customer:', result.customerId, 'Subscription:', result.subscription.id);
          return res.json({ 
            subscription: {
              id: result.subscription.id,
              status: result.subscription.status,
              currentPeriodEnd: new Date(((result.subscription as any).current_period_end || 0) * 1000).toISOString(),
            }
          });
        }
        return res.json({ subscription: null });
      }
      
      if (!user?.stripeSubscriptionId) {
        return res.json({ subscription: null });
      }

      try {
        const sub = await stripeService.getSubscriptionById(user.stripeSubscriptionId);
        const periodEnd = sub && "current_period_end" in sub ? (sub as { current_period_end?: number }).current_period_end : undefined;
        res.json({
          subscription: {
            id: sub.id,
            status: sub.status,
            currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
          },
        });
      } catch {
        res.json({ subscription: null });
      }
    } catch (e: any) {
      console.error('Subscription check error:', e);
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/checkout', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user) return res.status(404).json({error: "User not found"});

      const { priceId } = req.body;
      let customerId = user.stripeCustomerId;
      
      if (!customerId) {
        const customer = await stripeService.createCustomer(user.email || "", user.id);
        await storage.updateUserStripeInfo(user.id, { stripeCustomerId: customer.id });
        customerId = customer.id;
      }

      try {
        const session = await stripeService.createCheckoutSession(
          customerId,
          priceId,
          `${req.protocol}://${req.get('host')}/settings`, 
          `${req.protocol}://${req.get('host')}/settings` 
        );
        res.json({ url: session.url });
      } catch (stripeError: any) {
        if (stripeError.code === 'resource_missing' && stripeError.param === 'customer') {
          const customer = await stripeService.createCustomer(user.email || "", user.id);
          await storage.updateUserStripeInfo(user.id, { stripeCustomerId: customer.id });
          customerId = customer.id;
          
          const session = await stripeService.createCheckoutSession(
            customerId,
            priceId,
            `${req.protocol}://${req.get('host')}/settings`, 
            `${req.protocol}://${req.get('host')}/settings` 
          );
          res.json({ url: session.url });
        } else {
          throw stripeError;
        }
      }
    } catch (e: any) {
      console.error('Checkout error:', e);
      res.status(500).json({ error: e.message || 'Checkout failed' });
    }
  });

  app.post('/api/billing-portal', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user) return res.status(404).json({ error: "User not found" });
      
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripeService.createCustomer(user.email || "", user.id);
        await storage.updateUserStripeInfo(user.id, { stripeCustomerId: customer.id });
        customerId = customer.id;
      }
      
      try {
        const session = await stripeService.createCustomerPortalSession(
          customerId,
          `${req.protocol}://${req.get('host')}/settings`
        );
        res.json({ url: session.url });
      } catch (stripeError: any) {
        if (stripeError.code === 'resource_missing' && stripeError.param === 'customer') {
          const customer = await stripeService.createCustomer(user.email || "", user.id);
          await storage.updateUserStripeInfo(user.id, { stripeCustomerId: customer.id });
          customerId = customer.id;
          
          const session = await stripeService.createCustomerPortalSession(
            customerId,
            `${req.protocol}://${req.get('host')}/settings`
          );
          res.json({ url: session.url });
        } else {
          throw stripeError;
        }
      }
    } catch (e: any) {
      console.error('Billing portal error:', e);
      res.status(500).json({ error: e.message || 'Billing portal failed' });
    }
  });

  app.get("/api/products-with-prices", async (req, res) => {
    try {
      const data = await stripeService.listProductsWithPrices();
      res.json({ data });
    } catch (e: any) {
      console.error("Products fetch error:", e);
      res.status(500).json({ error: e.message ?? "Failed to fetch products" });
    }
  });

  // ---------- Admin Portal (admin or partner = investor/founder) ----------
  app.get("/api/admin/config", isAuthenticated, isAdminOrPartner, async (req: any, res) => {
    try {
      const config = await adminStorage.getAdminConfig();
      res.json(config);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });
  app.put("/api/admin/config", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const config = await adminStorage.updateAdminConfig(req.body);
      res.json(config);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/admin/metrics", isAuthenticated, isAdminOrPartner, async (req: any, res) => {
    try {
      const [dbMetrics, stripeMetrics] = await Promise.all([
        adminStorage.getMetrics(),
        stripeService.getMRRAndCounts().catch(() => ({ mrrCents: 0, activeCount: 0, trialingCount: 0 })),
      ]);
      res.json({
        ...dbMetrics,
        mrrCents: stripeMetrics.mrrCents,
        activeSubscriptions: stripeMetrics.activeCount,
        trialingSubscriptions: stripeMetrics.trialingCount,
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/admin/announcements", isAuthenticated, isAdminOrPartner, async (req, res) => {
    try {
      const list = await adminStorage.listAnnouncements();
      res.json({ data: list });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });
  app.post("/api/admin/announcements", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const email = req.user?.claims?.email ?? req.user?.email;
      const { title, body } = req.body;
      if (!title || !body) return res.status(400).json({ error: "title and body required" });
      const doc = await adminStorage.createAnnouncement(email, title, body);
      res.status(201).json(doc);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/admin/withdrawals", isAuthenticated, isAdminOrPartner, async (req, res) => {
    try {
      const list = await adminStorage.listWithdrawalRequests();
      res.json({ data: list });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });
  app.post("/api/admin/withdrawals", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const email = req.user?.claims?.email ?? req.user?.email;
      const { amountCents, reason } = req.body;
      if (amountCents == null) return res.status(400).json({ error: "amountCents required" });
      const doc = await adminStorage.createWithdrawalRequest(email, Number(amountCents), reason);
      await adminStorage.appendAppLog("info", "Withdrawal request created", { id: doc._id, amountCents, by: email });
      res.status(201).json(doc);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });
  app.post("/api/admin/withdrawals/:id/confirm-admin", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const email = req.user?.claims?.email ?? req.user?.email;
      const doc = await adminStorage.confirmWithdrawalAsAdmin(req.params.id, email);
      if (!doc) return res.status(404).json({ error: "Not found or not admin" });
      res.json(doc);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });
  app.post("/api/admin/withdrawals/:id/confirm-partner", isAuthenticated, isAdminOrPartner, async (req: any, res) => {
    try {
      const email = req.user?.claims?.email ?? req.user?.email;
      const doc = await adminStorage.confirmWithdrawalAsPartner(req.params.id, email);
      if (!doc) return res.status(404).json({ error: "Not found or not partner" });
      res.json(doc);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });
  app.post("/api/admin/withdrawals/:id/execute", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const email = req.user?.claims?.email ?? req.user?.email;
      const doc = await adminStorage.executeWithdrawal(req.params.id, email);
      if (!doc) return res.status(400).json({ error: "Only dual-confirmed withdrawals can be executed" });
      res.json(doc);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/admin/logs", isAuthenticated, isAdminOrPartner, async (req, res) => {
    try {
      const list = await adminStorage.listAppLogs();
      res.json({ data: list });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/admin/tax", isAuthenticated, isAdminOrPartner, async (req: any, res) => {
    try {
      const email = req.user?.claims?.email ?? req.user?.email;
      const doc = await adminStorage.getTaxDetail(email);
      res.json(doc || null);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });
  app.put("/api/admin/tax", isAuthenticated, isAdminOrPartner, async (req: any, res) => {
    try {
      const email = req.user?.claims?.email ?? req.user?.email;
      const doc = await adminStorage.upsertTaxDetail(email, req.body);
      res.json(doc);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/admin/reports/csv", isAuthenticated, isAdminOrPartner, async (req, res) => {
    try {
      const [config, metrics, withdrawals] = await Promise.all([
        adminStorage.getAdminConfig(),
        (async () => {
          const [db, stripe] = await Promise.all([
            adminStorage.getMetrics(),
            stripeService.getMRRAndCounts().catch(() => ({ mrrCents: 0, activeCount: 0, trialingCount: 0 })),
          ]);
          return { ...db, ...stripe };
        })(),
        adminStorage.listWithdrawalRequests(500),
      ]);
      const rows = [
        ["Report", "ProCam Admin Metrics"],
        ["Generated", new Date().toISOString()],
        [],
        ["Config", "Value"],
        ["Admin split %", config.splitAdminPct],
        ["Partner split %", config.splitPartnerPct],
        ["Scaling %", config.splitScalingPct],
        ["First year payout %", config.firstYearPayoutPct],
        [],
        ["Metrics", "Value"],
        ["Total users", metrics.totalUsers],
        ["Users with subscription", metrics.usersWithSubscription],
        ["MRR (cents)", metrics.mrrCents],
        ["Active subscriptions", metrics.activeCount],
        ["Trialing", metrics.trialingCount],
        [],
        ["Withdrawals", "id", "requestedBy", "amountCents", "status", "createdAt"],
        ...withdrawals.map((w: any) => [w._id, w.requestedByEmail, w.amountCents, w.status, w.createdAt]),
      ];
      const csv = rows.map((r) => (Array.isArray(r) ? r.join(",") : r)).join("\n");
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="procam-admin-report-${new Date().toISOString().slice(0, 10)}.csv"`);
      res.send(csv);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/admin/reports/pdf", isAuthenticated, isAdminOrPartner, async (req, res) => {
    try {
      const [config, metrics, withdrawals] = await Promise.all([
        adminStorage.getAdminConfig(),
        (async () => {
          const [db, stripe] = await Promise.all([
            adminStorage.getMetrics(),
            stripeService.getMRRAndCounts().catch(() => ({ mrrCents: 0, activeCount: 0, trialingCount: 0 })),
          ]);
          return { ...db, ...stripe };
        })(),
        adminStorage.listWithdrawalRequests(100),
      ]);
      const html = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"/><title>ProCam Admin Report</title></head>
<body style="font-family:system-ui;padding:2rem;max-width:800px;margin:0 auto;">
  <h1>ProCam Admin Report</h1>
  <p>Generated: ${new Date().toISOString()}</p>
  <h2>Revenue split (first year: ${config.firstYearPayoutPct}% payout to admin/partner)</h2>
  <ul>
    <li>Admin / Lead: ${config.splitAdminPct}%</li>
    <li>Partner: ${config.splitPartnerPct}%</li>
    <li>Scaling &amp; dev: ${config.splitScalingPct}%</li>
  </ul>
  <h2>Metrics</h2>
  <ul>
    <li>Total users: ${metrics.totalUsers}</li>
    <li>Users with subscription: ${metrics.usersWithSubscription}</li>
    <li>MRR (cents): ${metrics.mrrCents}</li>
    <li>Active subscriptions: ${metrics.activeCount}</li>
    <li>Trialing: ${metrics.trialingCount}</li>
  </ul>
  <h2>Withdrawals (${withdrawals.length})</h2>
  <table border="1" cellpadding="8" style="border-collapse:collapse;width:100%;">
    <tr><th>Requested by</th><th>Amount (cents)</th><th>Status</th><th>Date</th></tr>
    ${withdrawals.map((w: any) => `<tr><td>${w.requestedByEmail}</td><td>${w.amountCents}</td><td>${w.status}</td><td>${w.createdAt}</td></tr>`).join("")}
  </table>
  <p style="margin-top:2rem;color:#666;">ProCam — Professional Mobile Photography. support@procam.cloud</p>
</body></html>`;
      res.setHeader("Content-Type", "text/html");
      res.setHeader("Content-Disposition", `inline; filename="procam-admin-report-${new Date().toISOString().slice(0, 10)}.html"`);
      res.send(html);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/admin/me", isAuthenticated, isAdminOrPartner, async (req: any, res) => {
    try {
      const email = req.user?.claims?.email ?? req.user?.email;
      const [isAdminUser, isPartnerUser] = await Promise.all([
        adminStorage.isAdminEmail(email),
        adminStorage.isPartnerEmail(email),
      ]);
      res.json({
        email,
        role: isAdminUser ? "admin" : isPartnerUser ? "partner" : "unknown",
        canEditConfig: isAdminUser,
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  return httpServer;
}
