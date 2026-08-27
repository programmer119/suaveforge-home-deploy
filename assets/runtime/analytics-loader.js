(() => {
  'use strict';
  if (window.SF_ANALYTICS_LOADER) return;
  const VERSION = '20260827-27';
  let promise = null;
  let timer = 0;
  const load = () => {
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
    clearTimeout(timer);
    load();
    removeEventListener('pointerdown', onIntent, true);
    removeEventListener('keydown', onIntent, true);
  };
  addEventListener('pointerdown', onIntent, {capture:true, once:true, passive:true});
  addEventListener('keydown', onIntent, {capture:true, once:true});
  // Passive visitors do not need analytics code on the startup critical path.
  // Load it well after the interaction-readiness window instead.
  addEventListener('load', () => { timer = setTimeout(load, 12000); }, {once:true});
  window.SF_ANALYTICS_LOADER = { load };
})();
