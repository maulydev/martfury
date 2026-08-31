import { Platform } from 'react-native';

/**
 * Resolve the backend origin (shared by auth-client.ts and catalog.ts).
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

export const baseURL = resolveBaseURL();

// This dev backend cold-compiles routes on first hit (Turbopack) and can
// genuinely take several seconds to respond — a tighter timeout was firing
// on legitimate, still-in-flight requests. Shared so every fetch in the app
// fails at the same, deliberately generous threshold.
export const DEFAULT_FETCH_TIMEOUT_MS = 30000;

/**
 * API key for the AI Shopping Assistant (see lib/ai-assistant.ts).
 *
 * Unlike the web app — where Gemini is called from a Next.js server action
 * with a server-only key — this app has no server of its own to proxy
 * through (the backend is read-only reference, never edit it), so the
 * Gemini SDK is called directly from the client. That means this key ships
 * inside the compiled app bundle and can be extracted by anyone who
 * inspects it. Use a key scoped/rate-limited for this purpose in Google AI
 * Studio (https://aistudio.google.com/apikey), never a shared production key.
 */
export const geminiApiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
