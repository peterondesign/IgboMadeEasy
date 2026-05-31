type PremiumConfig = {
  supabaseUrl: string;
  supabaseAnonKey: string;
  table: string;
  userIdColumn: string;
  premiumColumn: string;
};

function getPremiumConfig(): PremiumConfig {
  return {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? "",
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "",
    table: process.env.EXPO_PUBLIC_PREMIUM_TABLE ?? "subscriptions",
    userIdColumn: process.env.EXPO_PUBLIC_PREMIUM_USER_ID_COLUMN ?? "user_id",
    premiumColumn: process.env.EXPO_PUBLIC_PREMIUM_FLAG_COLUMN ?? "is_premium",
  };
}

export async function fetchPremiumAccess(
  accessToken: string,
  authUserSub: string
): Promise<boolean> {
  const config = getPremiumConfig();

  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    throw new Error(
      "Missing Supabase config. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  const encodedSub = encodeURIComponent(authUserSub);
  const url = `${config.supabaseUrl}/rest/v1/${config.table}?select=${config.premiumColumn}&${config.userIdColumn}=eq.${encodedSub}&limit=1`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      apikey: config.supabaseAnonKey,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Unable to load premium access from Supabase.");
  }

  const rows = (await response.json()) as Array<Record<string, unknown>>;
  if (!Array.isArray(rows) || rows.length === 0) {
    return false;
  }

  return Boolean(rows[0]?.[config.premiumColumn]);
}
