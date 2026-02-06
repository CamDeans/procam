import { getStripeClient } from "./stripeClient";

export class StripeService {
  async createCustomer(email: string, userId: string) {
    const stripe = getStripeClient();
    return await stripe.customers.create({
      email,
      metadata: { userId },
    });
  }

  async createCheckoutSession(customerId: string, priceId: string, successUrl: string, cancelUrl: string) {
    const stripe = getStripeClient();
    return await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
  }

  async createCustomerPortalSession(customerId: string, returnUrl: string) {
    const stripe = getStripeClient();
    return await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
  }

  async getActiveSubscription(customerId: string) {
    const stripe = getStripeClient();
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 10,
    });
    console.log('[stripe] Found subscriptions for customer:', customerId, subscriptions.data.map(s => ({ id: s.id, status: s.status })));
    const activeOrTrialing = subscriptions.data.find(s => s.status === 'active' || s.status === 'trialing');
    return activeOrTrialing || null;
  }

  async getActiveSubscriptionByEmail(email: string) {
    const stripe = getStripeClient();
    const customers = await stripe.customers.list({
      email: email,
      limit: 10,
    });
    console.log('[stripe] Found customers for email:', email, customers.data.map(c => c.id));
    
    for (const customer of customers.data) {
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        limit: 10,
      });
      console.log('[stripe] Checking customer:', customer.id, 'subscriptions:', subscriptions.data.map(s => ({ id: s.id, status: s.status })));
      const activeOrTrialing = subscriptions.data.find(s => s.status === 'active' || s.status === 'trialing');
      if (activeOrTrialing) {
        return { subscription: activeOrTrialing, customerId: customer.id };
      }
    }
    return null;
  }

  async getSubscriptionById(subscriptionId: string) {
    const stripe = getStripeClient();
    return await stripe.subscriptions.retrieve(subscriptionId);
  }

  /** List products with prices from Stripe API (no DB sync required). */
  async listProductsWithPrices(): Promise<
    Array<{
      id: string;
      name: string;
      description: string | null;
      active: boolean;
      prices: Array<{
        id: string;
        unit_amount: number | null;
        currency: string;
        recurring: object | null;
        active: boolean;
      }>;
    }>
  > {
    const stripe = getStripeClient();
    const products = await stripe.products.list({ active: true, limit: 20 });
    const result = [];
    for (const p of products.data) {
      const prices = await stripe.prices.list({ product: p.id, active: true });
      result.push({
        id: p.id,
        name: p.name,
        description: p.description ?? null,
        active: p.active,
        prices: prices.data.map((pr) => ({
          id: pr.id,
          unit_amount: pr.unit_amount,
          currency: pr.currency,
          recurring: pr.recurring,
          active: pr.active,
        })),
      });
    }
    return result;
  }

  /** MRR and subscription counts for admin metrics. */
  async getMRRAndCounts(): Promise<{ mrrCents: number; activeCount: number; trialingCount: number }> {
    const stripe = getStripeClient();
    const subs = await stripe.subscriptions.list({ status: "active", limit: 100, expand: ["data.items.data.price"] });
    const trialing = await stripe.subscriptions.list({ status: "trialing", limit: 100, expand: ["data.items.data.price"] });
    let mrrCents = 0;
    for (const s of [...subs.data, ...trialing.data]) {
      const item = s.items?.data?.[0];
      const amount = (item?.price as { unit_amount?: number })?.unit_amount ?? 0;
      const interval = (item?.price as { recurring?: { interval?: string; interval_count?: number } })?.recurring?.interval;
      const count = (item?.price as { recurring?: { interval_count?: number } })?.recurring?.interval_count ?? 1;
      if (interval === "month") mrrCents += Math.round(amount / count);
      else if (interval === "year") mrrCents += Math.round(amount / 12 / count);
      else mrrCents += amount;
    }
    return {
      mrrCents,
      activeCount: subs.data.length,
      trialingCount: trialing.data.length,
    };
  }
}

export const stripeService = new StripeService();
