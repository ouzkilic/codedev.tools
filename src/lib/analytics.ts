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
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  };
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
