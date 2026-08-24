(()=>{
  'use strict';
  const API='https://api-suaveforge.suaveforge.com';
  const uuid=()=>globalThis.crypto?.randomUUID?crypto.randomUUID():'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const r=Math.random()*16|0,v=c==='x'?r:(r&3|8);return v.toString(16)});
  const safeStorage=(storage,key,getOrCreate)=>{try{let v=storage.getItem(key);if(!v){v=getOrCreate();storage.setItem(key,v)}return v}catch{return getOrCreate()}};
  const visitorId=safeStorage(localStorage,'sf_vid',uuid);
  const sessionId=safeStorage(sessionStorage,'sf_sid',uuid);
  const q=new URLSearchParams(location.search);
  const browser=(()=>{const ua=navigator.userAgent;if(/Edg\//.test(ua))return'Edge';if(/OPR\//.test(ua))return'Opera';if(/Chrome\//.test(ua))return'Chrome';if(/Firefox\//.test(ua))return'Firefox';if(/Safari\//.test(ua)&&!/Chrome\//.test(ua))return'Safari';return'Other'})();
  const deviceType=innerWidth<768?'mobile':innerWidth<1100?'tablet':'desktop';
  let first={};
  try{first=JSON.parse(sessionStorage.getItem('sf_touch')||'{}')}catch{}
  if(!first || !first.landingPage){
    first={landingPage:location.pathname+location.search,referrer:document.referrer||'',utmSource:q.get('utm_source')||'',utmMedium:q.get('utm_medium')||'',utmCampaign:q.get('utm_campaign')||''};
    try{sessionStorage.setItem('sf_touch',JSON.stringify(first))}catch{}
  }
  const touch={visitorId,sessionId,...first,deviceType,browser};
  async function event(eventType,extra={}){
    try{
      await fetch(API+'/api/v1/analytics/events',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'include',keepalive:true,body:JSON.stringify({...touch,eventType,page:location.pathname,...extra})});
    }catch{}
  }
  window.SF_ANALYTICS={API,touch,event};
  event('page_view');
})();
