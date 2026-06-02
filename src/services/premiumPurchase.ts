import Purchases, { type CustomerInfo } from "react-native-purchases";

const REVENUECAT_IOS_API_KEY =
  process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY ?? "";
const PREMIUM_ENTITLEMENT_ID =
  process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID ?? "premium";

const KNOWN_PREMIUM_PRODUCT_IDS = new Set<string>([
  "premium_annual_igbo_easy",
  "premium_monthly_igbo_easy",
  // RevenueCat test products often use simple IDs.
  "annual",
  "monthly",
]);

let configuredUserId: string | null = null;
let lastPremiumAccessReason = "none";

function ensureRevenueCatKey() {
  if (!REVENUECAT_IOS_API_KEY) {
    throw new Error(
      "Missing RevenueCat key. Set EXPO_PUBLIC_REVENUECAT_IOS_API_KEY."
    );
  }
}

function hasPremiumAccess(customerInfo: CustomerInfo): boolean {
  if (Boolean(customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID])) {
    lastPremiumAccessReason = `entitlement:${PREMIUM_ENTITLEMENT_ID}`;
    return true;
  }

  const dynamicInfo = customerInfo as CustomerInfo & {
    activeSubscriptions?: string[];
    allPurchasedProductIdentifiers?: string[];
  };

  const purchasedIds = new Set<string>([
    ...(dynamicInfo.activeSubscriptions ?? []),
    ...(dynamicInfo.allPurchasedProductIdentifiers ?? []),
  ]);

  for (const id of KNOWN_PREMIUM_PRODUCT_IDS) {
    if (purchasedIds.has(id)) {
      lastPremiumAccessReason = `product:${id}`;
      return true;
    }
  }

  lastPremiumAccessReason = "none";
  return false;
}

export function getLastPremiumAccessReason(): string {
  return lastPremiumAccessReason;
}

function configureRevenueCat() {
  ensureRevenueCatKey();

  if (configuredUserId != null) {
    return;
  }

  Purchases.configure({
    apiKey: REVENUECAT_IOS_API_KEY,
  });
  configuredUserId = "__configured__";
}

export const PREMIUM_ANNUAL_PRODUCT_ID = "premium_annual_igbo_easy";
export const PREMIUM_MONTHLY_PRODUCT_ID = "premium_monthly_igbo_easy";

export async function purchasePremiumAccess(
  productId?: string
): Promise<boolean> {
  configureRevenueCat();

  const offerings = await Purchases.getOfferings();
  const packages = offerings.current?.availablePackages ?? [];
  const selectedPackage =
    packages.find((item) => item.product.identifier === productId) ??
    packages.find((item) => item.identifier === productId) ??
    packages[0];

  if (!selectedPackage) {
    throw new Error(
      "No subscription products are currently available. Configure offerings and App Store products in RevenueCat."
    );
  }

  const purchaseResult = await Purchases.purchasePackage(selectedPackage);
  return hasPremiumAccess(purchaseResult.customerInfo);
}

export async function restorePremiumStatus(): Promise<boolean> {
  configureRevenueCat();

  const customerInfo = await Purchases.getCustomerInfo();
  return hasPremiumAccess(customerInfo);
}

export async function restorePremiumPurchases(): Promise<boolean> {
  configureRevenueCat();

  const customerInfo = await Purchases.restorePurchases();
  return hasPremiumAccess(customerInfo);
}

export async function logoutPremiumAccess(): Promise<void> {
  configuredUserId = null;
}
