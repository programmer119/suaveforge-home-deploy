(() => {
  'use strict';
  if (window.SF_CORE_READY) return;
  const qs = (s, r=document) => r?.querySelector(s) || null;
  const qsa = (s, r=document) => r ? [...r.querySelectorAll(s)] : [];
  const header = qs('[data-header]');
  const menuButton = qs('[data-menu-button]');
  const mobileMenu = qs('[data-mobile-menu]');
  const setMenu = (open) => {
    document.body.classList.toggle('menu-open', !!open);
    menuButton?.setAttribute('aria-expanded', String(!!open));
    menuButton?.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
    mobileMenu?.classList.toggle('is-open', !!open);
  };
  qsa('[data-year]').forEach(n => { n.textContent = String(new Date().getFullYear()); });
  menuButton?.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
  qsa('a', mobileMenu).forEach(a => a.addEventListener('click', () => setMenu(false)));
  let scrolled = null, raf = 0;
  const updateHeader = () => {
    raf = 0;
    const next = scrollY > 16;
    if (next === scrolled) return;
    scrolled = next;
    header?.classList.toggle('is-scrolled', next);
  };
  const requestHeader = () => { if (!raf) raf = requestAnimationFrame(updateHeader); };
  updateHeader();
  addEventListener('scroll', requestHeader, {passive:true});

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealItems = qsa('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    }, {threshold:.06, rootMargin:'0px 0px -35px'});
    revealItems.forEach(el => revealObserver.observe(el));
  } else {
    revealItems.forEach(el => el.classList.add('is-visible'));
  }
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  window.SF_CORE = { setMenu };
  window.SF_CORE_READY = true;
})();
