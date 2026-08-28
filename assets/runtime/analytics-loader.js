(() => {
  'use strict';
  if (window.SF_ANALYTICS_LOADER) return;
  const VERSION = '20260828-34';
  let promise = null;
  const load = () => {
    window.SF_ENSURE_PAGE_VIEW?.();
    if (window.SF_ANALYTICS) return Promise.resolve(window.SF_ANALYTICS);
    if (promise) return promise;
    promise = new Promise((resolve) => {
      const s = document.createElement('script');
      s.src = `analytics.js?v=${VERSION}`;
      s.async = true;
      s.dataset.sfAnalytics = '';
      s.onload = () => resolve(window.SF_ANALYTICS || null);
      s.onerror = () => resolve(null);
      document.head.appendChild(s);
    });
    return promise;
  };
  const onIntent = () => {
    load();
    removeEventListener('pointerdown', onIntent, true);
    removeEventListener('keydown', onIntent, true);
  };
  addEventListener('pointerdown', onIntent, {capture:true, once:true, passive:true});
  addEventListener('keydown', onIntent, {capture:true, once:true});
  // Detailed analytics is interaction-driven only. The lightweight page-view
  // beacon owns passive traffic so analytics.js never enters the Lighthouse
  // startup/TTI window simply because a timer expired.
  window.SF_ANALYTICS_LOADER = { load };
})();
