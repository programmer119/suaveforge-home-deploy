(()=>{
  'use strict';
  if(window.SF_FEATURE_LOADER)return;
  const VERSION='20260828-34';
  let appPromise=null,motionPromise=null,megaPromise=null,diagnosisPromise=null,corePromise=null;
  const loaded=new Set();
  const loadScript=src=>{
    if(loaded.has(src))return Promise.resolve();
    return new Promise((resolve,reject)=>{
      const existing=[...document.scripts].find(s=>(s.getAttribute('src')||'').split('?')[0]===src);
      if(existing){loaded.add(src);resolve();return}
      const s=document.createElement('script');s.src=`${src}?v=${VERSION}`;s.async=false;s.dataset.sfFeature=src;
      s.onload=()=>{loaded.add(src);resolve()};s.onerror=()=>reject(new Error(`feature load failed: ${src}`));document.head.appendChild(s);
    });
  };
  const loadApp=()=>window.SF_APP_READY?Promise.resolve():appPromise||(appPromise=loadScript('data/projects.js').then(()=>loadScript('config.js')).then(()=>loadScript('app.js')).catch(e=>{appPromise=null;throw e}));
  const loadMotion=()=>window.SF_MOTION_READY?Promise.resolve():motionPromise||(motionPromise=loadScript('data/projects.js').then(()=>loadScript('motion.js')).catch(e=>{motionPromise=null;throw e}));
  const loadMega=()=>window.SF_MEGA_NAV_READY?Promise.resolve():megaPromise||(megaPromise=loadScript('assets/navigation/mega-nav.js').catch(e=>{megaPromise=null;throw e}));
  const loadDiagnosis=()=>window.SF_DIAGNOSIS_ENTRY_READY?Promise.resolve():diagnosisPromise||(diagnosisPromise=loadScript('assets/revival/diagnosis-entry.js').catch(e=>{diagnosisPromise=null;throw e}));
  const loadCore=()=>window.SF_CORE_READY?Promise.resolve():corePromise||(corePromise=loadScript('assets/runtime/core.js').catch(e=>{corePromise=null;throw e}));
  window.SF_FEATURE_LOADER={loadApp,loadMotion,loadMega,loadDiagnosis,loadCore};

  document.addEventListener('pointerover',event=>{
    if(window.SF_MEGA_NAV_READY)return;
    const trigger=event.target instanceof Element?event.target.closest('[data-mega-trigger]'):null;if(!trigger)return;
    void loadMega().then(()=>trigger.dispatchEvent(new PointerEvent('pointerenter',{bubbles:false,pointerType:'mouse'}))).catch(()=>{});
  },{capture:true,passive:true});

  const appIntentSelector='[data-language-trigger],[data-global-search-open],[data-open-project],[data-copy-brief],[data-case-more],[data-portfolio-more],[data-project-search-clear]';
  document.addEventListener('click',async event=>{
    const el=event.target instanceof Element?event.target:null;
    const menu=!window.SF_CORE_READY?el?.closest('[data-menu-button]'):null;
    if(menu){event.preventDefault();event.stopImmediatePropagation();try{await loadCore();menu.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window}))}catch{}return}
    const mega=!window.SF_MEGA_NAV_READY?el?.closest('[data-mega-trigger]'):null;
    if(mega){event.preventDefault();event.stopImmediatePropagation();try{await loadMega();mega.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window}))}catch{}return}
    if(window.SF_APP_READY)return;
    const target=el?.closest(appIntentSelector);if(!target)return;
    event.preventDefault();event.stopImmediatePropagation();try{await loadApp();target.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window}))}catch{}
  },true);

  document.addEventListener('focusin',event=>{
    const el=event.target instanceof Element?event.target:null;
    if(!window.SF_MEGA_NAV_READY&&el?.closest('[data-mega-trigger]'))void loadMega();
    if(!window.SF_DIAGNOSIS_ENTRY_READY&&el?.closest('[data-home-diagnosis-form]'))void loadDiagnosis();
    if(!window.SF_APP_READY&&el?.matches('[data-project-search],[data-global-search-input]'))void loadApp();
  },true);

  document.addEventListener('submit',async event=>{
    const form=event.target instanceof HTMLFormElement?event.target:null;if(!form)return;
    if(form.matches('[data-home-diagnosis-form]')&&!window.SF_DIAGNOSIS_ENTRY_READY){event.preventDefault();event.stopImmediatePropagation();try{await loadDiagnosis();form.requestSubmit()}catch{}return}
    if(window.SF_APP_READY||!form.matches('[data-project-form]'))return;
    event.preventDefault();event.stopImmediatePropagation();try{await loadApp();form.requestSubmit()}catch{}
  },true);

  document.addEventListener('keydown',async event=>{
    if(window.SF_APP_READY)return;const el=event.target instanceof HTMLElement?event.target:null;
    const editing=!!el&&(el.matches('input,textarea,select')||el.isContentEditable),command=(event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k',slash=event.key==='/'&&!editing&&!event.ctrlKey&&!event.metaKey&&!event.altKey;
    if(!command&&!slash)return;event.preventDefault();try{await loadApp();document.querySelector('[data-global-search-open]')?.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window}))}catch{}
  },true);

  const observe=(selector,cb,margin='280px 0px')=>{const targets=[...document.querySelectorAll(selector)];if(!targets.length||!('IntersectionObserver'in window))return;const io=new IntersectionObserver(entries=>{if(!entries.some(e=>e.isIntersecting&&e.intersectionRatio>0))return;io.disconnect();cb()},{rootMargin:margin,threshold:0});targets.forEach(t=>io.observe(t))};
  observe('[data-home-diagnosis-form]',()=>loadDiagnosis(),'520px 0px');
  // Rich case/portfolio DOM and the 57 KB app bundle are now below-fold work.
  // The crawler-facing /work/ pages and sitemap remain static, while the homepage
  // hydrates the visual cards shortly before a real user reaches them.
  observe('[data-featured-cases],[data-portfolio-track]',()=>loadApp().then(()=>loadMotion()).catch(()=>{}),'1400px 0px');

  const onFirstScroll=()=>{void loadCore();};
  addEventListener('scroll',onFirstScroll,{passive:true,once:true});
  const deepFeatureHash=/^#(?:cases|demos|portfolio|contact|team|process|partnership)$/i.test(location.hash);
  if(deepFeatureHash){void loadCore();void loadApp().then(()=>loadMotion()).catch(()=>{})}
  if(location.hash==='#diagnosis')void loadDiagnosis();
  addEventListener('hashchange',()=>{
    if(/^#(?:cases|demos|portfolio|contact|team|process|partnership)$/i.test(location.hash)){void loadCore();void loadApp().then(()=>loadMotion()).catch(()=>{})}
    if(location.hash==='#diagnosis')void loadDiagnosis();
  });
})();
