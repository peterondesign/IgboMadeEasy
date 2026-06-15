import {
  initConnection,
  endConnection,
  fetchProducts,
  requestPurchase,
  getAvailablePurchases,
  finishTransaction,
  purchaseUpdatedListener,
  purchaseErrorListener,
  type Purchase,
} from "react-native-iap";

export const PREMIUM_ANNUAL_PRODUCT_ID = "premium_annual_igbo_easy";
export const PREMIUM_MONTHLY_PRODUCT_ID = "premium_monthly_igbo_easy";

export const PREMIUM_PRICING = {
  monthlyUsd: 7.99,
  yearlyUsd: 79.99,
  monthlyLabel: "$7.99/month",
  yearlyLabel: "$79.99/year",
} as const;

export const SUBSCRIPTION_METADATA = {
  annual: {
    productId: PREMIUM_ANNUAL_PRODUCT_ID,
    name: "Premium Annual Igbo Easy",
    description: "Unlock full access to all Igbo Made Easy lessons for one year. Perfect for learners committed to mastering Igbo.",
    localizations: {
      en: "Unlock full access to all Igbo Made Easy lessons for one year.",
    },
  },
  monthly: {
    productId: PREMIUM_MONTHLY_PRODUCT_ID,
    name: "Premium Monthly Igbo Easy",
    description: "Unlock full access to all Igbo Made Easy lessons for one month. Flexible premium access billed monthly.",
    localizations: {
      en: "Unlock full access to all Igbo Made Easy lessons for one month.",
    },
  },
} as const;

let isConnected = false;
let lastPremiumAccessReason = "none";
let purchaseListener: ReturnType<typeof purchaseUpdatedListener> | null = null;
let errorListener: ReturnType<typeof purchaseErrorListener> | null = null;

const PREMIUM_PRODUCT_IDS = new Set<string>([
  PREMIUM_ANNUAL_PRODUCT_ID,
  PREMIUM_MONTHLY_PRODUCT_ID,
]);

async function assertSkuIsAvailable(targetProductId: string): Promise<void> {
  const products = await fetchProducts({
    type: "subs",
    skus: Array.from(PREMIUM_PRODUCT_IDS),
  });

  const availableSkuSet = new Set((products ?? []).map((product) => product.id));

  if (!availableSkuSet.has(targetProductId)) {
    throw new Error(
      `SKU not found: ${targetProductId}. In App Store Connect, confirm the Product ID matches exactly, metadata is complete, and the subscription is attached to this app version under In-App Purchases and Subscriptions. For first-time subscriptions, upload a new binary and submit that version with at least one subscription selected for App Review.`
    );
  }
}

export function getLastPremiumAccessReason(): string {
  return lastPremiumAccessReason;
}

function hasPremiumAccess(purchases: Purchase[]): boolean {
  for (const purchase of purchases) {
    if (PREMIUM_PRODUCT_IDS.has(purchase.productId)) {
      if (purchase.purchaseState === "purchased") {
        lastPremiumAccessReason = `product:${purchase.productId}`;
        return true;
      }
    }
  }

  lastPremiumAccessReason = "none";
  return false;
}

async function ensureConnection(): Promise<void> {
  if (isConnected) {
    return;
  }

  try {
    await initConnection();
    isConnected = true;

    if (!purchaseListener) {
      purchaseListener = purchaseUpdatedListener(async (purchase: Purchase) => {
        try {
          if (purchase.purchaseState === "purchased") {
            await finishTransaction({
              purchase,
              isConsumable: false,
            });
          }
        } catch (error) {
          console.warn("Error finishing transaction:", error);
        }
      });
    }

    if (!errorListener) {
      errorListener = purchaseErrorListener((error) => {
        console.warn("IAP Error:", error);
      });
    }
  } catch (error) {
    console.warn("Failed to initialize IAP connection:", error);
    throw new Error("Could not connect to App Store. Please check your internet connection.");
  }
}

export async function purchasePremiumAccess(productId?: string): Promise<boolean> {
  await ensureConnection();

  const targetProductId = productId || PREMIUM_ANNUAL_PRODUCT_ID;

  if (!PREMIUM_PRODUCT_IDS.has(targetProductId)) {
    throw new Error(`Invalid premium product ID: ${targetProductId}`);
  }

  await assertSkuIsAvailable(targetProductId);

  return new Promise<boolean>((resolve, reject) => {
    const unsubscribePurchase = purchaseUpdatedListener(async (purchase: Purchase) => {
      if (purchase.productId === targetProductId && purchase.purchaseState === "purchased") {
        unsubscribePurchase.remove();
        unsubscribeError.remove();
        try {
          await finishTransaction({
            purchase,
            isConsumable: false,
          });
          lastPremiumAccessReason = `product:${purchase.productId}`;
          resolve(true);
        } catch (error) {
          console.warn("Error finishing transaction after purchase:", error);
          resolve(true);
        }
      }
    });

    const unsubscribeError = purchaseErrorListener((error) => {
      unsubscribePurchase.remove();
      unsubscribeError.remove();
      console.warn("Purchase error:", error);
      reject(new Error(error.message || "Purchase failed"));
    });

    requestPurchase({
      type: "subs",
      request: {
        apple: {
          sku: targetProductId,
        },
        google: {
          skus: [targetProductId],
        },
      },
    }).catch((error) => {
      unsubscribePurchase.remove();
      unsubscribeError.remove();
      reject(error);
    });
  });
}

export async function restorePremiumStatus(): Promise<boolean> {
  await ensureConnection();

  try {
    const purchases = await getAvailablePurchases();
    return hasPremiumAccess(purchases);
  } catch (error) {
    console.warn("Error checking premium status:", error);
    return false;
  }
}

export async function restorePremiumPurchases(): Promise<boolean> {
  await ensureConnection();

  try {
    const purchases = await getAvailablePurchases();

    for (const purchase of purchases) {
      if (
        PREMIUM_PRODUCT_IDS.has(purchase.productId) &&
        purchase.purchaseState === "purchased"
      ) {
        try {
          await finishTransaction({
            purchase,
            isConsumable: false,
          });
        } catch (error) {
          console.warn(`Error finishing transaction for ${purchase.productId}:`, error);
        }
      }
    }

    return hasPremiumAccess(purchases);
  } catch (error) {
    console.warn("Error restoring purchases:", error);
    throw new Error("Could not restore purchases. Please try again.");
  }
}

export async function logoutPremiumAccess(): Promise<void> {
  if (purchaseListener) {
    purchaseListener.remove();
    purchaseListener = null;
  }
  if (errorListener) {
    errorListener.remove();
    errorListener = null;
  }

  try {
    await endConnection();
    isConnected = false;
  } catch (error) {
    console.warn("Error ending IAP connection:", error);
  }

  lastPremiumAccessReason = "none";
}
