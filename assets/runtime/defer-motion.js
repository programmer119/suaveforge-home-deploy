(() => {
  const run = () => {
    if (document.querySelector('script[data-sf-motion]')) return;
    const s = document.createElement('script');
    s.src = 'motion.js?v=20260827-26';
    s.defer = true;
    s.dataset.sfMotion = '';
    document.body.appendChild(s);
  };
  window.addEventListener('load', () => {
    if ('requestIdleCallback' in window) requestIdleCallback(run, { timeout: 4200 });
    else setTimeout(run, 1200);
  }, { once: true });
})();
