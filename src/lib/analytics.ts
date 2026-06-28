// ─── Analytics & Tracking ─────────────────────────────────────────────────────
// IDs can be set via:
//   A) Admin → Site Content → Analytics & Integrations  (recommended)
//   B) Frontend .env: VITE_GA4_ID, VITE_META_PIXEL_ID, VITE_ONESIGNAL_APP_ID

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
    fbq?: ((...args: unknown[]) => void) & { queue: unknown[]; callMethod?: (...args: unknown[]) => void };
    OneSignalDeferred: unknown[];
  }
}

// Fallback to env vars; can be overridden at runtime by passing an id
const ENV_GA4      = import.meta.env.VITE_GA4_ID as string | undefined;
const ENV_PIXEL    = import.meta.env.VITE_META_PIXEL_ID as string | undefined;
const ENV_ONESIGNAL = import.meta.env.VITE_ONESIGNAL_APP_ID as string | undefined;

// ── Google Analytics 4 ────────────────────────────────────────────────────────
export function initGA4(idOverride?: string) {
  const id = idOverride || ENV_GA4;
  if (!id) return;
  if (document.querySelector(`script[src*="gtag/js?id=${id}"]`)) return; // already loaded
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function (...args) { window.dataLayer.push(args); };
  window.gtag('js', new Date());
  window.gtag('config', id, { send_page_view: true });
}

export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window.gtag === 'function') window.gtag('event', name, params ?? {});
}

// ── Meta Pixel ────────────────────────────────────────────────────────────────
export function initMetaPixel(idOverride?: string) {
  const id = idOverride || ENV_PIXEL;
  if (!id) return;
  if (window.fbq) return; // already loaded
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fbq: any = function (...args: unknown[]) {
    if (fbq.callMethod) fbq.callMethod(...args); else fbq.queue.push(args);
  };
  fbq.queue = [];
  window.fbq = fbq;
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(s);
  window.fbq!('init', id);
  window.fbq!('track', 'PageView');
}

export function trackPixelEvent(event: string, params?: Record<string, unknown>) {
  if (typeof window.fbq === 'function') window.fbq('track', event, params ?? {});
}

// ── OneSignal Push Notifications ──────────────────────────────────────────────
export function initOneSignal(idOverride?: string) {
  const id = idOverride || ENV_ONESIGNAL;
  if (!id) return;
  if (document.querySelector('script[src*="OneSignalSDK"]')) return; // already loaded
  const s = document.createElement('script');
  s.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
  s.async = true;
  document.head.appendChild(s);
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(async (OneSignal: { init: (cfg: unknown) => Promise<void> }) => {
    await OneSignal.init({
      appId: id,
      promptOptions: {
        slidedown: {
          prompts: [{
            type: 'push',
            autoPrompt: true,
            text: {
              actionMessage: 'Get notified about new music, blog posts, and events from Succeed Michael Lawani.',
              acceptButton: 'Allow',
              cancelButton: 'Maybe later',
            },
          }],
        },
      },
    });
  });
}
