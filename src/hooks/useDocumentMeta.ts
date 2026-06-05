import { useEffect } from 'react';

const SITE = 'codedev.tools';

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/**
 * Updates per-page SEO metadata (managed manually because this is an SPA).
 * @param title page-specific title (site name is appended automatically)
 * @param description meta description
 * @param path canonical path (e.g. "/tool/json-formatter")
 */
export function useDocumentMeta(title: string, description: string, path = '/') {
  useEffect(() => {
    const fullTitle = path === '/' ? `${SITE} — ${title}` : `${title} · ${SITE}`;
    document.title = fullTitle;
    setMeta('name', 'description', description);
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', `https://${SITE}${path}`);
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', description);
    setCanonical(`https://${SITE}${path}`);
  }, [title, description, path]);
}
