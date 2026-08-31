(()=>{
  'use strict';
  if(window.SF_ANALYTICS)return;
  const API='https://api-suaveforge.suaveforge.com:18454';
  const uuid=()=>globalThis.crypto?.randomUUID?crypto.randomUUID():'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const r=Math.random()*16|0,v=c==='x'?r:(r&3|8);return v.toString(16)});
  const safeStorage=(storage,key,getOrCreate)=>{try{let v=storage.getItem(key);if(!v){v=getOrCreate();storage.setItem(key,v)}return v}catch{return getOrCreate()}};
  const seed=window.__SF_PAGE_IDS||{};
  const visitorId=seed.visitorId||safeStorage(localStorage,'sf_vid',uuid),sessionId=seed.sessionId||safeStorage(sessionStorage,'sf_sid',uuid),q=new URLSearchParams(location.search);
  let first={landingPage:seed.landingPage,referrer:seed.referrer,utmSource:seed.utmSource,utmMedium:seed.utmMedium,utmCampaign:seed.utmCampaign};
  if(!first.landingPage){try{first=JSON.parse(sessionStorage.getItem('sf_touch')||'{}')}catch{};if(!first?.landingPage){first={landingPage:location.pathname+location.search,referrer:document.referrer||'',utmSource:q.get('utm_source')||'',utmMedium:q.get('utm_medium')||'',utmCampaign:q.get('utm_campaign')||''};try{sessionStorage.setItem('sf_touch',JSON.stringify(first))}catch{}}}
  const ua=navigator.userAgent;
  const browser=/Edg\//.test(ua)?'Edge':/OPR\//.test(ua)?'Opera':/Chrome\//.test(ua)?'Chrome':/Firefox\//.test(ua)?'Firefox':/Safari\//.test(ua)&&!/Chrome\//.test(ua)?'Safari':'Other';
  const os=/Windows NT/i.test(ua)?'Windows':/Android/i.test(ua)?'Android':/iPhone|iPad|iPod/i.test(ua)?'iOS':/Mac OS X/i.test(ua)?'macOS':/Linux/i.test(ua)?'Linux':'Other';
  let timezone='';try{timezone=Intl.DateTimeFormat().resolvedOptions().timeZone||''}catch{}
  const touch={visitorId,sessionId,...first,deviceType:seed.deviceType|| (innerWidth<768?'mobile':innerWidth<1100?'tablet':'desktop'),browser,os,language:(navigator.language||'').slice(0,80),timezone,screenWidth:Math.round(screen?.width||innerWidth||0),screenHeight:Math.round(screen?.height||innerHeight||0)};
  const event=(eventType,extra={})=>fetch(API+'/api/v1/analytics/events',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'include',keepalive:true,body:JSON.stringify({...touch,eventType,page:location.pathname,...extra})}).catch(()=>{});
  window.SF_ANALYTICS={API,touch,event};
  if(!window.__SF_PAGE_VIEW_MANAGED&&!window.__SF_PAGE_VIEW_SENT){window.__SF_PAGE_VIEW_SENT=true;void event('page_view');}
})();
