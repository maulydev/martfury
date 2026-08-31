import { createAuthClient } from 'better-auth/react';
import { expoClient } from '@better-auth/expo/client';
import { adminClient } from 'better-auth/client/plugins';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Resolve the Better Auth backend origin.
 *
 * Set EXPO_PUBLIC_BETTER_AUTH_BASE_URL (e.g. in a .env.local, see
 * .env.local.example) to point at your API — this is required when testing
 * on a physical device, where it must be your machine's LAN IP
 * (e.g. http://192.168.1.20:3000). Without it we fall back to sensible
 * per-platform localhost defaults for simulators/emulators/web.
 */
function resolveBaseURL(): string {
  const fromEnv = process.env.EXPO_PUBLIC_BETTER_AUTH_BASE_URL;
  if (fromEnv) return fromEnv;

  if (Platform.OS === 'android') {
    // The Android emulator maps the host machine's localhost to 10.0.2.2.
    return 'http://10.0.2.2:3000';
  }

  // iOS simulator and web can reach the host machine directly.
  return 'http://localhost:3000';
}

const baseURL = resolveBaseURL();

/**
 * The Origin header value Better Auth will actually trust by default.
 *
 * Better Auth always implicitly trusts the origin of its own configured
 * `baseURL` — on the backend that's BETTER_AUTH_BASE_URL, which in dev is
 * "http://localhost:3000" regardless of what address a device used to reach
 * it (LAN IP, 10.0.2.2, etc). So this must NOT just be `baseURL` above: on a
 * physical device `baseURL` is your machine's LAN IP, which the backend
 * doesn't recognize and gets rejected with "Invalid origin". Override with
 * EXPO_PUBLIC_BETTER_AUTH_TRUSTED_ORIGIN if the backend's own baseURL config
 * ever differs from this default (e.g. in production).
 */
const trustedOrigin =
  process.env.EXPO_PUBLIC_BETTER_AUTH_TRUSTED_ORIGIN ?? 'http://localhost:3000';

export const authClient = createAuthClient({
  baseURL,
  plugins: [
    expoClient({
      scheme: 'martfury',
      storagePrefix: 'martfury',
      storage: SecureStore,
    }),
    adminClient(),
  ],
  fetchOptions: {
    // Better Auth rejects any cookie-bearing request that lacks a real
    // Origin header ("Missing or null origin"). Browsers set this
    // automatically and native apps have no equivalent, so
    // @better-auth/expo's client only ever sends a custom `expo-origin`
    // header — meant to be read by a server-side `expo()` plugin that
    // translates it into `origin`. Our backend doesn't have that plugin
    // installed (and we don't control it), so we set the real header
    // ourselves instead, matching what the backend already trusts by
    // default — no trustedOrigins entry needed on the backend.
    headers: {
      origin: trustedOrigin,
    },
  },
});

export const { signIn, signUp, signOut, useSession } = authClient;

/**
 * Call a backend route that isn't part of Better Auth's own handler (e.g. the
 * app's custom /api/auth/profile), attaching the session cookie ourselves.
 * These routes just read `auth.api.getSession(...)` from the Cookie header —
 * they aren't behind Better Auth's origin-check middleware — so no Origin
 * header juggling is needed here, only the cookie.
 */
export async function authFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const cookie = authClient.getCookie();
  return fetch(`${baseURL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { Cookie: cookie } : {}),
      ...init.headers,
    },
  });
}
