(()=>{
  'use strict';
  if(new URLSearchParams(location.search).has('noinfo'))document.documentElement.classList.add('noinfo-mode');
  if(!document.querySelector('link[data-sf-hotfix37]')){
    const l=document.createElement('link');l.rel='stylesheet';l.href='/assets/runtime/hotfix-37.css?v=20260831-37';l.dataset.sfHotfix37='';document.head.appendChild(l);
  }
  if(window.SF_PAGEVIEW_RUNTIME)return;
  if(!document.querySelector('script[data-sf-pageview-runtime]')){
    const s=document.createElement('script');
    s.src='/assets/runtime/pageview.js?v=20260904-01';
    s.dataset.sfPageviewRuntime='';
    document.head.appendChild(s);
  }
})();
