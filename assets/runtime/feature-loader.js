(() => {
  'use strict';
  if (window.SF_FEATURE_LOADER) return;
  const VERSION = '20260827-27';
  let appPromise = null;
  let motionPromise = null;
  const loaded = new Set();
  const loadScript = (src) => {
    if (loaded.has(src)) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const existing = [...document.scripts].find(s => (s.getAttribute('src') || '').split('?')[0] === src);
      if (existing) { loaded.add(src); resolve(); return; }
      const s = document.createElement('script');
      s.src = `${src}?v=${VERSION}`;
      s.async = false;
      s.dataset.sfFeature = src;
      s.onload = () => { loaded.add(src); resolve(); };
      s.onerror = () => reject(new Error(`feature load failed: ${src}`));
      document.head.appendChild(s);
    });
  };
  const loadApp = () => {
    if (window.SF_APP_READY) return Promise.resolve();
    if (!appPromise) appPromise = loadScript('data/projects.js')
      .then(() => loadScript('config.js'))
      .then(() => loadScript('app.js'))
      .catch(err => { appPromise = null; console.error(err); throw err; });
    return appPromise;
  };
  const loadMotion = () => {
    if (window.SF_MOTION_READY) return Promise.resolve();
    if (!motionPromise) motionPromise = loadApp()
      .then(() => loadScript('motion.js'))
      .catch(err => { motionPromise = null; console.error(err); throw err; });
    return motionPromise;
  };
  window.SF_FEATURE_LOADER = { loadApp, loadMotion };

  const appIntentSelector = '[data-language-trigger],[data-global-search-open],[data-open-project],[data-copy-brief]';
  document.addEventListener('click', async (event) => {
    if (window.SF_APP_READY) return;
    const target = event.target instanceof Element ? event.target.closest(appIntentSelector) : null;
    if (!target) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    try {
      await loadApp();
      target.dispatchEvent(new MouseEvent('click', {bubbles:true, cancelable:true, view:window}));
    } catch {}
  }, true);

  document.addEventListener('submit', async (event) => {
    if (window.SF_APP_READY) return;
    const form = event.target instanceof HTMLFormElement ? event.target : null;
    if (!form?.matches('[data-project-form]')) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    try { await loadApp(); form.requestSubmit(); } catch {}
  }, true);

  document.addEventListener('keydown', async (event) => {
    if (window.SF_APP_READY) return;
    const el = event.target instanceof HTMLElement ? event.target : null;
    const editing = !!el && (el.matches('input,textarea,select') || el.isContentEditable);
    const command = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k';
    const slash = event.key === '/' && !editing && !event.ctrlKey && !event.metaKey && !event.altKey;
    if (!command && !slash) return;
    event.preventDefault();
    try {
      await loadApp();
      document.querySelector('[data-global-search-open]')?.dispatchEvent(new MouseEvent('click', {bubbles:true,cancelable:true,view:window}));
    } catch {}
  }, true);

  const observe = (selector, cb, margin='280px 0px') => {
    const targets = [...document.querySelectorAll(selector)];
    if (!targets.length || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(entries => {
      if (!entries.some(e => e.isIntersecting && e.intersectionRatio > 0)) return;
      io.disconnect();
      cb();
    }, {rootMargin:margin, threshold:0});
    targets.forEach(t => io.observe(t));
  };

  let belowFoldArmed = false;
  const armBelowFold = () => {
    if (belowFoldArmed) return;
    belowFoldArmed = true;
    observe('[data-featured-cases],[data-portfolio-track],[data-project-form]', () => loadApp());
    observe('[data-featured-cases],[data-portfolio-track],.live-demo-rail', () => loadMotion());
  };

  // Do not even register the heavy-feature viewport observers during the
  // no-interaction startup window. Deep links still materialize immediately.
  const deepFeatureHash = /^#(?:cases|demos|portfolio|contact|team|process|partnership)$/i.test(location.hash);
  if (deepFeatureHash || scrollY > 120) armBelowFold();
  else {
    const onFirstScroll = () => {
      if (scrollY <= 120) return;
      removeEventListener('scroll', onFirstScroll);
      armBelowFold();
    };
    addEventListener('scroll', onFirstScroll, {passive:true});
  }
  addEventListener('hashchange', () => {
    if (/^#(?:cases|demos|portfolio|contact|team|process|partnership)$/i.test(location.hash)) {
      armBelowFold();
      if (/^#(?:cases|demos|portfolio|contact)$/i.test(location.hash)) loadApp();
    }
  });
})();
