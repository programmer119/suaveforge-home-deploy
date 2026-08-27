(()=>{
  'use strict';
  const nav=document.querySelector('[data-mega-nav]');
  if(!nav)return;
  const header=document.querySelector('[data-header]');
  const groups=[...nav.querySelectorAll('[data-mega-item]')];
  const fine=matchMedia('(hover:hover) and (pointer:fine)');
  let active=null,openTimer=0,closeTimer=0,popperPromise=null,pinned=false;

  const loadPopper=()=>{
    if(window.Popper?.createPopper)return Promise.resolve(window.Popper);
    if(popperPromise)return popperPromise;
    popperPromise=new Promise(resolve=>{
      const s=document.createElement('script');
      s.src='https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js';
      s.async=true;s.crossOrigin='anonymous';
      s.onload=()=>resolve(window.Popper||null);s.onerror=()=>resolve(null);
      document.head.appendChild(s);
    });
    return popperPromise;
  };

  const destroyPosition=g=>{try{g?._popper?.destroy?.()}catch{};if(g)g._popper=null};
  const position=async g=>{
    const Popper=await loadPopper();
    if(!g?.isConnected||active!==g||!Popper?.createPopper)return;
    destroyPosition(g);
    const trigger=g.querySelector('[data-mega-trigger]'),panel=g.querySelector('[data-mega-panel]');
    g._popper=Popper.createPopper(trigger,panel,{placement:'bottom',strategy:'fixed',modifiers:[
      {name:'offset',options:{offset:[0,10]}},
      {name:'flip',options:{fallbackPlacements:['bottom-start','bottom-end']}},
      {name:'preventOverflow',options:{padding:18,altAxis:true}},
      {name:'computeStyles',options:{adaptive:true}}
    ]});
  };
  const close=(g=active,{focus=false}={})=>{
    clearTimeout(openTimer);clearTimeout(closeTimer);
    if(!g)return;
    const trigger=g.querySelector('[data-mega-trigger]'),panel=g.querySelector('[data-mega-panel]');
    trigger?.setAttribute('aria-expanded','false');panel?.classList.remove('is-open');panel?.setAttribute('aria-hidden','true');
    destroyPosition(g);if(active===g)active=null;pinned=false;header?.classList.remove('mega-active');
    if(focus)trigger?.focus();
  };
  const closeAll=except=>groups.forEach(g=>{if(g!==except&&g.querySelector('[data-mega-trigger]')?.getAttribute('aria-expanded')==='true')close(g)});
  const open=g=>{
    clearTimeout(openTimer);clearTimeout(closeTimer);if(!g)return;
    closeAll(g);active=g;
    const trigger=g.querySelector('[data-mega-trigger]'),panel=g.querySelector('[data-mega-panel]');
    trigger?.setAttribute('aria-expanded','true');panel?.setAttribute('aria-hidden','false');panel?.classList.add('is-open');header?.classList.add('mega-active');
    position(g);
  };
  const laterOpen=g=>{clearTimeout(closeTimer);clearTimeout(openTimer);openTimer=setTimeout(()=>open(g),90)};
  const laterClose=g=>{if(pinned)return;clearTimeout(openTimer);clearTimeout(closeTimer);closeTimer=setTimeout(()=>close(g),190)};

  groups.forEach((g,gi)=>{
    const trigger=g.querySelector('[data-mega-trigger]'),panel=g.querySelector('[data-mega-panel]');
    panel?.querySelectorAll('.mega-link').forEach((a,i)=>a.style.setProperty('--delay',`${40+i*35}ms`));
    trigger?.addEventListener('click',e=>{e.preventDefault();const isOpen=trigger.getAttribute('aria-expanded')==='true';if(isOpen){close(g);return}pinned=true;open(g)});
    trigger?.addEventListener('keydown',e=>{
      if(e.key==='ArrowDown'){e.preventDefault();open(g);requestAnimationFrame(()=>panel?.querySelector('a')?.focus())}
      if(e.key==='Escape'){e.preventDefault();close(g,{focus:true})}
      if((e.key==='ArrowRight'||e.key==='ArrowLeft')&&fine.matches){e.preventDefault();const next=groups[(gi+(e.key==='ArrowRight'?1:-1)+groups.length)%groups.length];next.querySelector('[data-mega-trigger]')?.focus()}
    });
    if(fine.matches){
      trigger?.addEventListener('pointerenter',()=>laterOpen(g));g.addEventListener('pointerleave',()=>laterClose(g));
      panel?.addEventListener('pointerenter',()=>clearTimeout(closeTimer));panel?.addEventListener('pointerleave',()=>laterClose(g));
    }
    g.addEventListener('focusin',()=>open(g));
    g.addEventListener('focusout',()=>setTimeout(()=>{if(!g.contains(document.activeElement)&&!pinned)close(g)},0));
    panel?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>close(g)));
  });
  document.addEventListener('pointerdown',e=>{if(active&&!active.contains(e.target))close(active)});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&active)close(active,{focus:true})});
  window.addEventListener('resize',()=>active?position(active):null,{passive:true});

  document.querySelectorAll('[data-mobile-nav-trigger]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const panel=document.getElementById(btn.getAttribute('aria-controls'));
      const open=btn.getAttribute('aria-expanded')!=='true';
      btn.setAttribute('aria-expanded',String(open));panel?.classList.toggle('is-open',open);
    });
  });
})();
