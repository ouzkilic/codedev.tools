import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { initAnalytics, trackPageview } from '@/lib/analytics';

/** Initializes GA4 and sends an anonymous page view on every route change. */
export function Analytics() {
  const location = useLocation();

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    trackPageview(location.pathname);
  }, [location.pathname]);

  return null;
}
