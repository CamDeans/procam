import Stripe from "stripe";

const apiVersion = "2025-11-17.clover" as const;

function getSecretKey(): string {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY must be set. Add it to your environment or .env file."
    );
  }
  return key;
}

function getPublishableKey(): string {
  const key = process.env.STRIPE_PUBLISHABLE_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_PUBLISHABLE_KEY must be set. Add it to your environment or .env file."
    );
  }
  return key;
}

let stripeInstance: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!stripeInstance) {
    stripeInstance = new Stripe(getSecretKey(), { apiVersion });
  }
  return stripeInstance;
}

export async function getUncachableStripeClient(): Promise<Stripe> {
  return new Stripe(getSecretKey(), { apiVersion });
}

export function getStripePublishableKey(): string {
  return getPublishableKey();
}

export function getStripeSecretKey(): string {
  return getSecretKey();
}

export function getStripeWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error(
      "STRIPE_WEBHOOK_SECRET must be set for webhook signature verification."
    );
  }
  return secret;
}
