// Google Analytics 4 — loaded only if VITE_GA_ID is defined.
// Collects ONLY anonymous page-view metrics.
// Content the user enters into the tools (JSON, files, etc.) is NEVER sent.

const GA_ID = import.meta.env.VITE_GA_ID as string | undefined;

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

let initialized = false;

export function initAnalytics() {
  if (initialized || !GA_ID || typeof window === 'undefined') return;
  initialized = true;

  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  // gtag.js only processes the queue when each entry is the `arguments` object —
  // pushing a real array (e.g. [...args]) silently breaks it, so no hits are sent.
  function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag as (...args: unknown[]) => void;
  window.gtag('js', new Date());
  // send_page_view: false — page views are sent manually via the router.
  window.gtag('config', GA_ID, { send_page_view: false, anonymize_ip: true });
}

export function trackPageview(path: string) {
  if (!GA_ID || typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', 'page_view', {
    page_path: path,
    page_location: `https://codedev.tools${path}`,
  });
}
