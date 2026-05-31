import * as AuthSession from "expo-auth-session";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";

const AUTH_STORAGE_KEY = "igbo-made-easy.auth-session.v1";
const AUTH_NATIVE_REDIRECT_URI = "igbomadeeasy://auth/callback";

WebBrowser.maybeCompleteAuthSession();

type StoredAuthSession = {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  userSub: string;
  expiresAt?: number;
};

type AuthConfig = {
  domain: string;
  clientId: string;
  audience?: string;
};

function getAuthConfig(): AuthConfig {
  const domain = process.env.EXPO_PUBLIC_AUTH0_DOMAIN ?? "";
  const clientId = process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID ?? "";
  const audience = process.env.EXPO_PUBLIC_AUTH0_AUDIENCE;

  return {
    domain,
    clientId,
    audience,
  };
}

function ensureAuthConfig(config: AuthConfig) {
  if (!config.domain || !config.clientId) {
    throw new Error(
      "Missing Auth0 config. Set EXPO_PUBLIC_AUTH0_DOMAIN and EXPO_PUBLIC_AUTH0_CLIENT_ID."
    );
  }
}

function getDiscovery(config: AuthConfig): AuthSession.DiscoveryDocument {
  return {
    authorizationEndpoint: `https://${config.domain}/authorize`,
    tokenEndpoint: `https://${config.domain}/oauth/token`,
    revocationEndpoint: `https://${config.domain}/oauth/revoke`,
  };
}

function getProjectNameForProxy(): string | null {
  const owner =
    process.env.EXPO_PUBLIC_EXPO_OWNER?.trim() || Constants.expoConfig?.owner;
  const slug = Constants.expoConfig?.slug;

  if (!owner || !slug) {
    return null;
  }

  return `@${owner}/${slug}`;
}

function resolveRedirectConfig(): {
  redirectUri: string;
  useProxy: boolean;
  projectNameForProxy?: string;
} {
  const explicitRedirectUri = process.env.EXPO_PUBLIC_AUTH0_REDIRECT_URI?.trim();
  if (explicitRedirectUri) {
    return {
      redirectUri: explicitRedirectUri,
      useProxy: false,
    };
  }

  const isExpoGo = Constants.appOwnership === "expo";
  if (isExpoGo) {
    throw new Error(
      "Auth0 sign-in is configured for native redirects. Use a development build (not Expo Go)."
    );
  }

  return { redirectUri: AUTH_NATIVE_REDIRECT_URI, useProxy: false };
}

export async function loginWithAuth0(): Promise<StoredAuthSession | null> {
  const config = getAuthConfig();
  ensureAuthConfig(config);

  const { redirectUri, useProxy, projectNameForProxy } = resolveRedirectConfig();
  const redirectDebugSuffix = ` Redirect URI used: ${redirectUri}`;

  const request = new AuthSession.AuthRequest({
    clientId: config.clientId,
    scopes: ["openid", "profile", "email", "offline_access"],
    redirectUri,
    usePKCE: true,
    responseType: AuthSession.ResponseType.Code,
    extraParams: config.audience ? { audience: config.audience } : undefined,
  });

  const discovery = getDiscovery(config);
  await request.makeAuthUrlAsync(discovery);

  const result = await request.promptAsync(discovery, {
    useProxy,
    projectNameForProxy,
  });

  if (result.type === "dismiss" || result.type === "cancel") {
    throw new Error(`Sign-in cancelled before completion.${redirectDebugSuffix}`);
  }

  if (result.type === "error") {
    const errorDescription = result.params.error_description;
    const errorCode = result.params.error;
    throw new Error(
      `${errorDescription || errorCode || "Auth0 returned an unknown login error."}${redirectDebugSuffix}`
    );
  }

  if (result.type !== "success" || !result.params.code) {
    throw new Error(
      `Auth session did not return a valid authorization code.${redirectDebugSuffix}`
    );
  }

  const tokenResponse = await AuthSession.exchangeCodeAsync(
    {
      clientId: config.clientId,
      code: result.params.code,
      redirectUri,
      extraParams: {
        code_verifier: request.codeVerifier ?? "",
      },
    },
    discovery
  );

  if (!tokenResponse.accessToken) {
    throw new Error(`Auth0 login returned no access token.${redirectDebugSuffix}`);
  }

  const userSub = await fetchUserSub(config.domain, tokenResponse.accessToken);

  const session: StoredAuthSession = {
    accessToken: tokenResponse.accessToken,
    refreshToken: tokenResponse.refreshToken,
    idToken: tokenResponse.idToken,
    userSub,
    expiresAt: tokenResponse.issuedAt
      ? tokenResponse.issuedAt + (tokenResponse.expiresIn ?? 0)
      : undefined,
  };

  await SecureStore.setItemAsync(AUTH_STORAGE_KEY, JSON.stringify(session));
  return session;
}

export async function getStoredAuthSession(): Promise<StoredAuthSession | null> {
  const raw = await SecureStore.getItemAsync(AUTH_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StoredAuthSession;
  } catch {
    return null;
  }
}

export async function clearStoredAuthSession(): Promise<void> {
  await SecureStore.deleteItemAsync(AUTH_STORAGE_KEY);
}

async function fetchUserSub(domain: string, accessToken: string): Promise<string> {
  const response = await fetch(`https://${domain}/userinfo`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Unable to fetch Auth0 user profile.");
  }

  const profile = (await response.json()) as { sub?: string };
  if (!profile.sub) {
    throw new Error("Auth0 profile missing sub claim.");
  }

  return profile.sub;
}

export type { StoredAuthSession };
