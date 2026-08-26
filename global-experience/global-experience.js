(() => {
  'use strict';

  const NS = 'http://www.w3.org/2000/svg';
  const markets = {
    'north-america': {
      name: 'North America', ko: '북미', xy: [317.1, 188.0], iso: ['USA', 'CAN'],
      localization: true, payment: true,
      copy: 'Localization과 Payment / PG 경험이 함께 있는 시장.', meter: 100,
      labelDx: 14, labelDy: -13
    },
    taiwan: {
      name: 'Taiwan', ko: '대만', xy: [966.2, 252.1], iso: ['TWN'],
      localization: true, payment: false,
      copy: 'Localization 경험이 있는 시장.', meter: 72,
      labelDx: 14, labelDy: 16
    },
    japan: {
      name: 'Japan', ko: '일본', xy: [1000.2, 205.4], iso: ['JPN'],
      localization: true, payment: false,
      copy: 'Localization 경험이 있는 시장.', meter: 74,
      labelDx: 15, labelDy: -12
    },
    russia: {
      name: 'Russia', ko: '러시아', xy: [825.1, 130.5], iso: ['RUS'],
      localization: true, payment: false,
      copy: 'Localization 경험이 있는 시장.', meter: 70,
      labelDx: 14, labelDy: -14
    },
    brazil: {
      name: 'Brazil', ko: '브라질', xy: [439.6, 374.0], iso: ['BRA'],
      localization: true, payment: true,
      copy: 'Localization과 Payment / PG 경험이 함께 있는 시장.', meter: 100,
      labelDx: 15, labelDy: 18
    },
    vietnam: {
      name: 'Vietnam', ko: '베트남', xy: [931.2, 279.2], iso: ['VNM'],
      localization: true, payment: true,
      copy: 'Localization과 Payment / PG 경험이 함께 있는 시장.', meter: 100,
      labelDx: 14, labelDy: 17
    },
    italy: {
      name: 'Italy', ko: '이탈리아', xy: [635.5, 186.2], iso: ['ITA'],
      localization: true, payment: false,
      copy: 'Localization 경험이 있는 시장.', meter: 72,
      labelDx: 14, labelDy: -12
    }
  };

  const routePairs = [
    ['north-america', 'brazil'],
    ['brazil', 'italy'],
    ['italy', 'russia'],
    ['russia', 'japan'],
    ['japan', 'taiwan'],
    ['taiwan', 'vietnam'],
    ['vietnam', 'north-america'],
    ['brazil', 'vietnam']
  ];

  const state = { mode: 'both', selected: 'north-america' };
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const el = (tag, attrs = {}) => {
    const node = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, String(value)));
    return node;
  };

  function initDust() {
    const canvas = document.getElementById('dust');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let dpr = Math.min(devicePixelRatio || 1, 2), w = 0, h = 0, raf = 0;
    const points = [];

    function resize() {
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, rect.width); h = Math.max(1, rect.height);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      points.length = 0;
      const count = Math.min(130, Math.round(w / 10));
      for (let i = 0; i < count; i++) points.push({
        x: Math.random() * w, y: Math.random() * h,
        r: Math.random() * 1.35 + .25, a: Math.random() * .38 + .08, s: Math.random() * .12 + .03
      });
    }

    function draw(t = 0) {
      ctx.clearRect(0, 0, w, h);
      points.forEach((p, i) => {
        const pulse = .68 + Math.sin(t * .0012 + i) * .32;
        ctx.fillStyle = `rgba(255,255,255,${Math.max(.03, p.a * pulse)})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
        if (!reduceMotion) { p.y += p.s; if (p.y > h + 4) p.y = -4; }
      });
      if (!reduceMotion) raf = requestAnimationFrame(draw);
    }

    resize(); draw();
    addEventListener('resize', resize, { passive: true });
    addEventListener('pagehide', () => cancelAnimationFrame(raf), { once: true });
  }

  function modeMatches(market) {
    if (state.mode === 'localization') return market.localization;
    if (state.mode === 'payment') return market.payment;
    return market.localization || market.payment;
  }

  function makeRoutePath(a, b) {
    const [x1, y1] = a.xy, [x2, y2] = b.xy;
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    const dx = x2 - x1, dy = y2 - y1, dist = Math.hypot(dx, dy) || 1;
    const lift = Math.min(140, Math.max(35, dist * .22));
    const nx = -dy / dist, ny = dx / dist;
    return `M${x1},${y1} Q${(mx + nx * lift).toFixed(1)},${(my + ny * lift).toFixed(1)} ${x2},${y2}`;
  }

  function drawMapOverlays() {
    const routeLayer = document.getElementById('routeLayer');
    const nodeLayer = document.getElementById('nodeLayer');
    if (!routeLayer || !nodeLayer) return;
    routeLayer.textContent = ''; nodeLayer.textContent = '';

    routePairs.forEach(([aKey, bKey], idx) => {
      const a = markets[aKey], b = markets[bKey];
      const path = el('path', {
        class: `route${a.payment && b.payment ? ' payment-route' : ''}`,
        'data-a': aKey, 'data-b': bKey, d: makeRoutePath(a, b)
      });
      path.style.animationDelay = `${-idx * 1.1}s`;
      routeLayer.appendChild(path);
    });

    Object.entries(markets).forEach(([key, m], idx) => {
      const cls = m.localization && m.payment ? 'has-both' : m.payment ? 'has-payment' : 'has-localization';
      const g = el('g', {
        class: `market-node ${cls}`, 'data-market': key,
        transform: `translate(${m.xy[0]},${m.xy[1]})`, tabindex: '0', role: 'button',
        'aria-label': `${m.name}, ${m.localization ? 'Localization' : ''}${m.payment ? ' Payment/PG' : ''}`
      });
      const halo = el('circle', { class: 'node-halo', r: '12' });
      halo.style.animationDelay = `${-idx * .32}s`;
      g.appendChild(halo);
      g.appendChild(el('circle', { class: 'node-core', r: '5.5' }));
      const label = el('text', { class: 'node-label', x: m.labelDx, y: m.labelDy }); label.textContent = m.name; g.appendChild(label);
      const sub = el('text', { class: 'node-sub', x: m.labelDx, y: m.labelDy + 12 }); sub.textContent = m.payment ? 'L10N + PG' : 'LOCALIZATION'; g.appendChild(sub);
      g.addEventListener('mouseenter', () => selectMarket(key, 'map'));
      g.addEventListener('click', () => selectMarket(key, 'map'));
      g.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectMarket(key, 'map'); }
      });
      nodeLayer.appendChild(g);
    });
  }

  function updateFlyout(key, animate = true) {
    const m = markets[key]; if (!m) return;
    const flyout = document.getElementById('marketFlyout');
    const apply = () => {
      document.getElementById('flyoutKicker').textContent = `${m.ko} / SELECTED MARKET`;
      document.getElementById('flyoutName').textContent = m.name;
      document.getElementById('flyoutTags').innerHTML = [
        m.localization ? '<span>LOCALIZATION</span>' : '', m.payment ? '<span>PAYMENT / PG</span>' : ''
      ].join('');
      document.getElementById('flyoutCopy').textContent = m.copy;
      document.getElementById('flyoutMeter').style.width = `${m.meter}%`;
    };
    if (!animate || reduceMotion || !flyout?.animate) { apply(); return; }
    flyout.animate([{ opacity: 1, transform: 'translateY(0)' }, { opacity: .15, transform: 'translateY(8px)' }], { duration: 130, easing: 'ease-in', fill: 'forwards' }).finished.then(() => {
      apply();
      flyout.animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 350, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'forwards' });
    }).catch(apply);
  }

  function selectMarket(key, source = 'program') {
    const m = markets[key]; if (!m) return;
    state.selected = key;
    document.querySelectorAll('.market-row').forEach((row) => row.classList.toggle('is-active', row.dataset.market === key));
    document.querySelectorAll('.market-node').forEach((node) => node.classList.toggle('is-selected', node.dataset.market === key));
    document.querySelectorAll('.country').forEach((country) => country.classList.toggle('is-selected', m.iso.includes(country.dataset.iso)));
    document.querySelectorAll('.route').forEach((route) => route.classList.toggle('is-hot', route.dataset.a === key || route.dataset.b === key));
    updateFlyout(key, source !== 'init');
  }

  function applyMode(mode) {
    if (!['both', 'localization', 'payment'].includes(mode)) return;
    state.mode = mode;
    document.querySelectorAll('.map-tabs button').forEach((btn) => {
      const active = btn.dataset.mode === mode;
      btn.classList.toggle('is-active', active); btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    document.getElementById('hudMode').textContent = mode === 'both' ? 'BOTH' : mode === 'payment' ? 'PAYMENT' : 'L10N';
    document.querySelectorAll('.market-row').forEach((row) => { row.hidden = !modeMatches(markets[row.dataset.market]); });
    document.querySelectorAll('.market-node').forEach((node) => node.classList.toggle('is-dim', !modeMatches(markets[node.dataset.market])));
    document.querySelectorAll('.route').forEach((route) => {
      const a = markets[route.dataset.a], b = markets[route.dataset.b];
      const visible = mode === 'both' ? true : mode === 'payment' ? (a.payment && b.payment) : (a.localization && b.localization);
      route.classList.toggle('is-dim', !visible);
    });
    document.querySelectorAll('.country').forEach((country) => {
      const related = Object.values(markets).filter((m) => m.iso.includes(country.dataset.iso));
      const visible = related.some(modeMatches);
      country.classList.toggle('is-dim', related.length > 0 && !visible);
    });
    if (!modeMatches(markets[state.selected])) {
      const next = Object.keys(markets).find((key) => modeMatches(markets[key]));
      if (next) selectMarket(next, 'mode');
    }
  }

  function bindControls() {
    document.querySelectorAll('.market-row').forEach((row) => {
      row.addEventListener('click', () => selectMarket(row.dataset.market, 'list'));
      row.addEventListener('mouseenter', () => selectMarket(row.dataset.market, 'list'));
    });
    document.querySelectorAll('.map-tabs button').forEach((btn) => btn.addEventListener('click', () => applyMode(btn.dataset.mode)));
  }

  function initMapTilt() {
    const card = document.getElementById('mapCard');
    const map = document.getElementById('worldMap');
    if (!card || !map || matchMedia('(pointer: coarse)').matches || reduceMotion) return;
    let rect;
    card.addEventListener('pointerenter', () => { rect = card.getBoundingClientRect(); });
    card.addEventListener('pointermove', (event) => {
      rect ||= card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5, y = (event.clientY - rect.top) / rect.height - .5;
      map.style.transform = `scale(1.04) translate(${x * 8}px,${y * 7}px)`;
    });
    card.addEventListener('pointerleave', () => { map.style.transform = 'scale(1.04) translate(0,0)'; });
  }

  function animateIntro() {
    if (reduceMotion) return;
    const seq = [
      ['.hero .eyebrow', 0], ['.hero h1', 80], ['.hero-copy', 220], ['.hero-stats', 350]
    ];
    seq.forEach(([selector, delay]) => {
      const node = document.querySelector(selector); if (!node?.animate) return;
      node.animate([{ opacity: 0, transform: 'translateY(34px)' }, { opacity: 1, transform: 'translateY(0)' }], {
        duration: 820, delay, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'both'
      });
    });
  }

  function initScrollReveal() {
    if (!('IntersectionObserver' in window) || reduceMotion) return;
    const targets = document.querySelectorAll('.atlas-head, .map-card, .market-list, .story-card, .closing-shell');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.animate([
          { opacity: 0, transform: 'translateY(38px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ], { duration: 760, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'both' });
        observer.unobserve(entry.target);
      });
    }, { threshold: .13 });
    targets.forEach((node) => observer.observe(node));
  }

  function initAutoCycle() {
    if (reduceMotion) return;
    const keys = Object.keys(markets); let i = 0, timer = 0;
    const start = () => {
      clearInterval(timer);
      timer = setInterval(() => {
        const visible = keys.filter((key) => modeMatches(markets[key])); if (!visible.length) return;
        i = (i + 1) % visible.length; selectMarket(visible[i], 'auto');
      }, 4200);
    };
    start();
    ['mapCard'].forEach((id) => {
      const node = document.getElementById(id); if (!node) return;
      node.addEventListener('pointerenter', () => clearInterval(timer)); node.addEventListener('pointerleave', start);
    });
    const list = document.querySelector('.market-list');
    list?.addEventListener('pointerenter', () => clearInterval(timer)); list?.addEventListener('pointerleave', start);
    addEventListener('pagehide', () => clearInterval(timer), { once: true });
  }

  function boot() {
    initDust(); drawMapOverlays(); bindControls(); initMapTilt(); animateIntro(); initScrollReveal();
    applyMode('both'); selectMarket('north-america', 'init'); initAutoCycle();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
