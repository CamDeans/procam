import Stripe from "stripe";
import { getStripeClient, getStripeWebhookSecret } from "./stripeClient";
import { storage } from "./storage";

export class WebhookHandlers {
  static async processWebhook(payload: Buffer, signature: string): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error("STRIPE WEBHOOK ERROR: Payload must be a Buffer.");
    }

    const stripe = getStripeClient();
    const webhookSecret = getStripeWebhookSecret();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err: any) {
      throw new Error(`Webhook signature verification failed: ${err.message}`);
    }

    switch (event.type) {
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
        if (!customerId) break;

        const user = await storage.getUserByStripeCustomerId(customerId);
        if (!user) break;

        if (event.type === "customer.subscription.deleted" || sub.status === "canceled" || sub.status === "unpaid") {
          await storage.updateUserStripeInfo(user.id, { stripeSubscriptionId: null });
        } else {
          await storage.updateUserStripeInfo(user.id, { stripeSubscriptionId: sub.id });
        }
        break;
      }
      default:
        // Unhandled event type
        break;
    }
  }
}
