import Purchases, { type CustomerInfo } from "react-native-purchases";

const REVENUECAT_IOS_API_KEY =
  process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY ?? "";
const PREMIUM_ENTITLEMENT_ID =
  process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID ?? "premium";

let configuredUserId: string | null = null;

function ensureRevenueCatKey() {
  if (!REVENUECAT_IOS_API_KEY) {
    throw new Error(
      "Missing RevenueCat key. Set EXPO_PUBLIC_REVENUECAT_IOS_API_KEY."
    );
  }
}

function hasPremiumEntitlement(customerInfo: CustomerInfo): boolean {
  return Boolean(customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID]);
}

function configureForUser(userId?: string) {
  ensureRevenueCatKey();

  if (configuredUserId === userId) {
    return;
  }

  if (configuredUserId == null) {
    Purchases.configure({
      apiKey: REVENUECAT_IOS_API_KEY,
      appUserID: userId,
    });
    configuredUserId = userId ?? "__anonymous__";
  }
}

export async function purchasePremiumAccess(userEmail: string): Promise<boolean> {
  configureForUser(userEmail);

  if (configuredUserId !== userEmail) {
    await Purchases.logIn(userEmail);
    configuredUserId = userEmail;
  }

  const offerings = await Purchases.getOfferings();
  const selectedPackage = offerings.current?.availablePackages?.[0];

  if (!selectedPackage) {
    throw new Error(
      "No subscription products are currently available. Configure offerings and App Store products in RevenueCat."
    );
  }

  const purchaseResult = await Purchases.purchasePackage(selectedPackage);
  return hasPremiumEntitlement(purchaseResult.customerInfo);
}

export async function restorePremiumStatus(userEmail?: string): Promise<boolean> {
  configureForUser(userEmail);

  if (userEmail && configuredUserId !== userEmail) {
    await Purchases.logIn(userEmail);
    configuredUserId = userEmail;
  }

  const customerInfo = await Purchases.getCustomerInfo();
  return hasPremiumEntitlement(customerInfo);
}

export async function restorePremiumPurchases(userEmail?: string): Promise<boolean> {
  configureForUser(userEmail);

  if (userEmail && configuredUserId !== userEmail) {
    await Purchases.logIn(userEmail);
    configuredUserId = userEmail;
  }

  const customerInfo = await Purchases.restorePurchases();
  return hasPremiumEntitlement(customerInfo);
}

export async function logoutPremiumAccess(): Promise<void> {
  try {
    await Purchases.logOut();
  } finally {
    configuredUserId = null;
  }
}
