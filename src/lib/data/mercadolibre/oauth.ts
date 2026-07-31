/**
 * Mercado Libre OAuth2 token manager.
 *
 * ML now requires a Bearer access_token for virtually every endpoint (verified by
 * hand: even /sites/MLM returns 403 without one). Access tokens expire in ~6h;
 * the refresh_token you capture once during the manual authorize step does not
 * expire until it's used, so we exchange it for a fresh access_token on demand
 * and cache it in memory for the process lifetime.
 *
 * One-time setup (do this yourself, it needs your own ML login in a browser):
 *   1. Create an app at https://developers.mercadolibre.com.mx -> "Mis aplicaciones"
 *      -> "Crear aplicación". Note the client_id (App ID) and client_secret.
 *      Set a redirect_uri, e.g. https://localhost:3001/oauth/callback (doesn't need
 *      to be a real running page, just needs to match exactly).
 *   2. Visit in your browser (with client_id and redirect_uri filled in):
 *      https://auth.mercadolibre.com.mx/authorization?response_type=code&client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI
 *   3. Log in / approve. You'll be redirected to redirect_uri?code=TG-xxxxx -- copy that code.
 *   4. Exchange it once for a refresh_token:
 *      curl -X POST https://api.mercadolibre.com/oauth/token \
 *        -H "accept: application/json" -H "content-type: application/x-www-form-urlencoded" \
 *        -d "grant_type=authorization_code&client_id=YOUR_CLIENT_ID&client_secret=YOUR_CLIENT_SECRET&code=THE_CODE&redirect_uri=YOUR_REDIRECT_URI"
 *   5. The response's "refresh_token" goes into ML_REFRESH_TOKEN in .env.local.
 *      (Its "access_token" is a throwaway -- this module gets its own fresh one.)
 */

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}

let cachedToken: { value: string; expiresAt: number } | null = null;

export function isMLConfigured(): boolean {
  return Boolean(process.env.ML_CLIENT_ID && process.env.ML_CLIENT_SECRET && process.env.ML_REFRESH_TOKEN);
}

export async function getAccessToken(): Promise<string> {
  if (!isMLConfigured()) {
    throw new Error("Mercado Libre未配置:缺少 ML_CLIENT_ID / ML_CLIENT_SECRET / ML_REFRESH_TOKEN");
  }

  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 30_000) {
    return cachedToken.value;
  }

  const res = await fetch("https://api.mercadolibre.com/oauth/token", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: process.env.ML_CLIENT_ID!,
      client_secret: process.env.ML_CLIENT_SECRET!,
      refresh_token: process.env.ML_REFRESH_TOKEN!,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Mercado Libre token刷新失败 (${res.status}): ${body}`);
  }

  const data = (await res.json()) as TokenResponse;
  cachedToken = { value: data.access_token, expiresAt: now + data.expires_in * 1000 };
  return cachedToken.value;
}
