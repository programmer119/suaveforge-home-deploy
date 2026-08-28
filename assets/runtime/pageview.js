(()=>{
  'use strict';
  if(window.__SF_PAGE_VIEW_SENT)return;
  const API='https://api-suaveforge.suaveforge.com:18454';
  const uuid=()=>globalThis.crypto?.randomUUID?crypto.randomUUID():'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const r=Math.random()*16|0,v=c==='x'?r:(r&3|8);return v.toString(16)});
  const get=(store,key)=>{try{let v=store.getItem(key);if(!v){v=uuid();store.setItem(key,v)}return v}catch{return uuid()}};
  const visitorId=get(localStorage,'sf_vid'),sessionId=get(sessionStorage,'sf_sid'),q=new URLSearchParams(location.search);
  let first={};try{first=JSON.parse(sessionStorage.getItem('sf_touch')||'{}')}catch{}
  if(!first?.landingPage){first={landingPage:location.pathname+location.search,referrer:document.referrer||'',utmSource:q.get('utm_source')||'',utmMedium:q.get('utm_medium')||'',utmCampaign:q.get('utm_campaign')||''};try{sessionStorage.setItem('sf_touch',JSON.stringify(first))}catch{}}
  const base={visitorId,sessionId,...first,deviceType:innerWidth<768?'mobile':innerWidth<1100?'tablet':'desktop'};
  window.__SF_PAGE_IDS=base;window.__SF_PAGE_VIEW_SENT=true;
  const body=JSON.stringify({...base,eventType:'page_view',page:location.pathname});
  try{fetch(API+'/api/v1/analytics/events',{method:'POST',headers:{'Content-Type':'text/plain;charset=UTF-8'},credentials:'include',keepalive:true,body}).catch(()=>{})}catch{}
})();
