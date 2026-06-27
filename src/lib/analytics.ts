// ─── Analytics & Tracking ─────────────────────────────────────────────────────
// To activate, add these to your frontend .env file:
//   VITE_GA4_ID=G-XXXXXXXXXX          ← from Google Analytics → Admin → Data Streams
//   VITE_META_PIXEL_ID=1234567890      ← from Meta Business Suite → Events Manager
//   VITE_ONESIGNAL_APP_ID=xxxx-xxxx   ← from OneSignal → Settings → Keys & IDs

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
    fbq: ((...args: unknown[]) => void) & { queue: unknown[]; callMethod?: (...args: unknown[]) => void };
    OneSignalDeferred: unknown[];
  }
}

const GA4_ID = import.meta.env.VITE_GA4_ID as string | undefined;
const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID as string | undefined;
const ONESIGNAL_ID = import.meta.env.VITE_ONESIGNAL_APP_ID as string | undefined;

// ── Google Analytics 4 ────────────────────────────────────────────────────────
export function initGA4() {
  if (!GA4_ID) return;
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function (...args) { window.dataLayer.push(args); };
  window.gtag('js', new Date());
  window.gtag('config', GA4_ID, { send_page_view: true });
}

export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window.gtag === 'function') window.gtag('event', name, params ?? {});
}

// ── Meta Pixel ────────────────────────────────────────────────────────────────
export function initMetaPixel() {
  if (!PIXEL_ID) return;
  const fbq = function (...args: unknown[]) {
    if (fbq.callMethod) fbq.callMethod(...args); else fbq.queue.push(args);
  } as typeof window.fbq;
  fbq.queue = [];
  window.fbq = fbq;
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(s);
  window.fbq('init', PIXEL_ID);
  window.fbq('track', 'PageView');
}

export function trackPixelEvent(event: string, params?: Record<string, unknown>) {
  if (typeof window.fbq === 'function') window.fbq('track', event, params ?? {});
}

// ── OneSignal Push Notifications ──────────────────────────────────────────────
export function initOneSignal() {
  if (!ONESIGNAL_ID) return;
  const s = document.createElement('script');
  s.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
  s.async = true;
  document.head.appendChild(s);
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(async (OneSignal: { init: (cfg: unknown) => Promise<void> }) => {
    await OneSignal.init({
      appId: ONESIGNAL_ID,
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
