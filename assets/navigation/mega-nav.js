(()=>{
  'use strict';
  const nav=document.querySelector('[data-mega-nav]');
  if(!nav)return;

  const header=document.querySelector('[data-header]');
  const groups=[...nav.querySelectorAll('[data-mega-item]')];
  const fine=matchMedia('(hover:hover) and (pointer:fine)');
  let active=null,openTimer=0,closeTimer=0,popperPromise=null,transitionSeq=0;

  const loadPopper=()=>{
    if(window.Popper?.createPopper)return Promise.resolve(window.Popper);
    if(popperPromise)return popperPromise;
    popperPromise=new Promise(resolve=>{
      const s=document.createElement('script');
      s.src='https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js';
      s.async=true;s.crossOrigin='anonymous';
      s.onload=()=>resolve(window.Popper||null);
      s.onerror=()=>resolve(null);
      document.head.appendChild(s);
    });
    return popperPromise;
  };

  const triggerOf=g=>g?.querySelector('[data-mega-trigger]');
  const panelOf=g=>g?.querySelector('[data-mega-panel]');
  const destroyPosition=g=>{try{g?._popper?.destroy?.()}catch{};if(g)g._popper=null};

  const position=async(g,seq)=>{
    const Popper=await loadPopper();
    if(!g?.isConnected||active!==g||seq!==transitionSeq||!Popper?.createPopper)return false;
    destroyPosition(g);
    const trigger=triggerOf(g),panel=panelOf(g);
    g._popper=Popper.createPopper(trigger,panel,{placement:'bottom',strategy:'fixed',modifiers:[
      {name:'offset',options:{offset:[0,6]}},
      {name:'flip',options:{fallbackPlacements:['bottom-start','bottom-end']}},
      {name:'preventOverflow',options:{padding:16,altAxis:true}},
      {name:'computeStyles',options:{adaptive:false,gpuAcceleration:true}}
    ]});
    try{await g._popper.update()}catch{}
    return active===g&&seq===transitionSeq;
  };

  const closeNow=(g=active,{focus=false}={})=>{
    clearTimeout(openTimer);clearTimeout(closeTimer);transitionSeq++;
    if(!g)return;
    const trigger=triggerOf(g),panel=panelOf(g);
    trigger?.setAttribute('aria-expanded','false');
    panel?.classList.remove('is-open','is-positioning');
    panel?.setAttribute('aria-hidden','true');
    destroyPosition(g);
    if(active===g)active=null;
    if(!active)header?.classList.remove('mega-active');
    if(focus)trigger?.focus();
  };

  const closeOthers=except=>groups.forEach(g=>{
    if(g!==except&&triggerOf(g)?.getAttribute('aria-expanded')==='true')closeNow(g);
  });

  const openNow=async g=>{
    clearTimeout(openTimer);clearTimeout(closeTimer);
    if(!g)return;
    const trigger=triggerOf(g),panel=panelOf(g);
    if(active===g&&(panel?.classList.contains('is-open')||panel?.classList.contains('is-positioning')))return;

    closeOthers(g);
    active=g;
    const seq=++transitionSeq;
    trigger?.setAttribute('aria-expanded','true');
    panel?.setAttribute('aria-hidden','true');
    panel?.classList.remove('is-open');
    panel?.classList.add('is-positioning');
    header?.classList.add('mega-active');

    const positioned=await position(g,seq);
    if(!positioned)return;
    panel?.classList.remove('is-positioning');
    panel?.setAttribute('aria-hidden','false');
    requestAnimationFrame(()=>{
      if(active===g&&seq===transitionSeq)panel?.classList.add('is-open');
    });
  };

  const scheduleOpen=g=>{
    clearTimeout(closeTimer);clearTimeout(openTimer);
    if(active===g)return;
    openTimer=setTimeout(()=>openNow(g),70);
  };

  const scheduleClose=g=>{
    clearTimeout(openTimer);clearTimeout(closeTimer);
    closeTimer=setTimeout(()=>{
      const panel=panelOf(g);
      const stillHovered=g.matches(':hover')||panel?.matches(':hover');
      const stillFocused=g.contains(document.activeElement);
      if(!stillHovered&&!stillFocused)closeNow(g);
    },260);
  };

  groups.forEach((g,gi)=>{
    const trigger=triggerOf(g),panel=panelOf(g);
    panel?.querySelectorAll('.mega-link').forEach((a,i)=>a.style.setProperty('--delay',`${40+i*35}ms`));

    // Fine-pointer desktop: hover/focus owns disclosure. A click NEVER toggles an
    // already-hovered panel closed; it simply keeps/open the same disclosure.
    // Coarse/touch: click is the only pointer disclosure mechanism.
    trigger?.addEventListener('click',e=>{
      e.preventDefault();
      if(fine.matches){
        clearTimeout(closeTimer);
        openNow(g);
        return;
      }
      const isOpen=trigger.getAttribute('aria-expanded')==='true';
      if(isOpen)closeNow(g);else openNow(g);
    });

    trigger?.addEventListener('keydown',e=>{
      if(e.key==='ArrowDown'||e.key==='Enter'||e.key===' '){
        e.preventDefault();openNow(g);
        requestAnimationFrame(()=>panel?.querySelector('a')?.focus());
      }
      if(e.key==='Escape'){e.preventDefault();closeNow(g,{focus:true})}
      if((e.key==='ArrowRight'||e.key==='ArrowLeft')&&fine.matches){
        e.preventDefault();
        const next=groups[(gi+(e.key==='ArrowRight'?1:-1)+groups.length)%groups.length];
        next.querySelector('[data-mega-trigger]')?.focus();
      }
    });

    // Hover listeners may exist on hybrid hardware, but they only act while the
    // current primary input reports a fine pointer. Touch/coarse input therefore
    // never races the hover state machine.
    trigger?.addEventListener('pointerenter',()=>{if(fine.matches)scheduleOpen(g)});
    g.addEventListener('pointerleave',()=>{if(fine.matches)scheduleClose(g)});
    panel?.addEventListener('pointerenter',()=>{if(fine.matches)clearTimeout(closeTimer)});
    panel?.addEventListener('pointerleave',()=>{if(fine.matches)scheduleClose(g)});

    g.addEventListener('focusin',()=>openNow(g));
    g.addEventListener('focusout',()=>setTimeout(()=>{
      if(!g.contains(document.activeElement)&&!g.matches(':hover')&&!panel?.matches(':hover'))closeNow(g);
    },0));
    panel?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>closeNow(g)));
  });

  // Do not reinterpret the same physical gesture when the primary input mode
  // changes; just close and let the next gesture open under the new policy.
  const onModeChange=()=>{if(active)closeNow(active)};
  try{fine.addEventListener('change',onModeChange)}catch{try{fine.addListener(onModeChange)}catch{}}

  document.addEventListener('pointerdown',e=>{if(active&&!active.contains(e.target))closeNow(active)});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&active)closeNow(active,{focus:true})});
  window.addEventListener('resize',()=>{if(active){const seq=transitionSeq;position(active,seq)}},{passive:true});

  document.querySelectorAll('[data-mobile-nav-trigger]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const panel=document.getElementById(btn.getAttribute('aria-controls'));
      const open=btn.getAttribute('aria-expanded')!=='true';
      btn.setAttribute('aria-expanded',String(open));panel?.classList.toggle('is-open',open);
    });
  });
})();
