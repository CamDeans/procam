import { useSubscription } from "./use-stripe";

export type SubscriptionTier = "free" | "pro";

export interface FeatureAccess {
  tier: SubscriptionTier;
  isPro: boolean;
  canUseRaw: boolean;
  canUse85mm: boolean;
  canUseGoldenRatio: boolean;
  maxPhotos: number;
  availableLenses: string[];
  availableGuides: string[];
}

const FREE_LENSES = ["14mm", "24mm", "35mm", "50mm"];
const PRO_LENSES = ["14mm", "24mm", "35mm", "50mm", "85mm"];
const FREE_GUIDES = ["none", "rule-of-thirds", "center", "diagonal"];
const PRO_GUIDES = ["none", "rule-of-thirds", "golden-ratio", "center", "diagonal"];

export function useFeatureAccess(): FeatureAccess & { isLoading: boolean } {
  const { data: subData, isLoading } = useSubscription();
  
  const isPro = !!subData?.subscription;
  const tier: SubscriptionTier = isPro ? "pro" : "free";
  
  return {
    tier,
    isPro,
    isLoading,
    canUseRaw: isPro,
    canUse85mm: isPro,
    canUseGoldenRatio: isPro,
    maxPhotos: isPro ? Infinity : 50,
    availableLenses: isPro ? PRO_LENSES : FREE_LENSES,
    availableGuides: isPro ? PRO_GUIDES : FREE_GUIDES,
  };
}
