import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";

// Using 'any' for Stripe types temporarily as they are complex in Zod schema
// In a strictly typed production app, we would duplicate Stripe types or import from 'stripe' package

export function useProducts() {
  return useQuery({
    queryKey: [api.stripe.products.list.path],
    queryFn: async () => {
      const res = await fetch(api.stripe.products.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      // Ensure we access the data property correctly based on the Stripe response wrapper
      return data.data || []; 
    },
  });
}

export function useSubscription() {
  return useQuery({
    queryKey: [api.stripe.subscription.get.path],
    queryFn: async () => {
      const res = await fetch(api.stripe.subscription.get.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch subscription");
      return await res.json();
    },
  });
}

export function useCreateCheckoutSession() {
  return useMutation({
    mutationFn: async (priceId: string) => {
      const res = await fetch(api.stripe.checkout.create.path, {
        method: api.stripe.checkout.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create checkout session");
      return await res.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
  });
}

export function useCreateBillingPortalSession() {
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.stripe.portal.create.path, {
        method: api.stripe.portal.create.method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create billing portal session");
      return await res.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
  });
}
