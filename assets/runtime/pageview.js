(()=>{
  'use strict';
  if(window.SF_PAGEVIEW_RUNTIME||window.SF_PAGEVIEW_SCHEDULER)return;
  window.__SF_PAGE_VIEW_MANAGED=true;
  const API='https://api-suaveforge.suaveforge.com:18454';
  let timer=0,running=false;
  const uuid=()=>globalThis.crypto?.randomUUID?crypto.randomUUID():'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const r=Math.random()*16|0,v=c==='x'?r:(r&3|8);return v.toString(16)});
  const get=(store,key)=>{try{let v=store.getItem(key);if(!v){v=uuid();store.setItem(key,v)}return v}catch{return uuid()}};
  const send=(beacon=false)=>{
    if(window.__SF_PAGE_VIEW_SENT||running)return window.__SF_PAGE_IDS||null;
    running=true;
    const visitorId=get(localStorage,'sf_vid'),sessionId=get(sessionStorage,'sf_sid'),q=new URLSearchParams(location.search);
    let first={};try{first=JSON.parse(sessionStorage.getItem('sf_touch')||'{}')}catch{}
    if(!first?.landingPage){first={landingPage:location.pathname+location.search,referrer:document.referrer||'',utmSource:q.get('utm_source')||'',utmMedium:q.get('utm_medium')||'',utmCampaign:q.get('utm_campaign')||''};try{sessionStorage.setItem('sf_touch',JSON.stringify(first))}catch{}}
    const base={visitorId,sessionId,...first,deviceType:innerWidth<768?'mobile':innerWidth<1100?'tablet':'desktop'};
    window.__SF_PAGE_IDS=base;window.__SF_PAGE_VIEW_SENT=true;running=false;
    const body=JSON.stringify({...base,eventType:'page_view',page:location.pathname}),url=API+'/api/v1/analytics/events';
    try{if(beacon&&navigator.sendBeacon)navigator.sendBeacon(url,new Blob([body],{type:'text/plain;charset=UTF-8'}));else fetch(url,{method:'POST',headers:{'Content-Type':'text/plain;charset=UTF-8'},credentials:'include',keepalive:true,body}).catch(()=>{})}catch{}
    return base;
  };
  const arm=()=>{if(timer||window.__SF_PAGE_VIEW_SENT)return;timer=setTimeout(()=>send(false),8000)};
  if(document.readyState==='complete')arm();else addEventListener('load',arm,{once:true,passive:true});
  addEventListener('pagehide',()=>send(true),{once:true,capture:true});
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')send(true)},{capture:true});
  window.SF_ENSURE_PAGE_VIEW=()=>send(false);window.SF_PAGEVIEW_RUNTIME={send};
})();
