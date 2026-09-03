(()=>{
  'use strict';
  if(window.SF_PAGEVIEW_RUNTIME||window.SF_PAGEVIEW_SCHEDULER)return;
  window.__SF_PAGE_VIEW_MANAGED=true;

  const API='https://api-suaveforge.suaveforge.com:18454/api/v1/analytics/events';
  const QUEUE_KEY='sf_pending_pageviews_v2';
  const ACK_KEY='sf_pageview_acks_v2';
  const MAX_QUEUE=40;
  const MAX_ACKS=80;
  let flushing=false;

  const uuid=()=>globalThis.crypto?.randomUUID?crypto.randomUUID():'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const r=Math.random()*16|0,v=c==='x'?r:(r&3|8);return v.toString(16)});
  const get=(store,key)=>{try{let v=store.getItem(key);if(!v){v=uuid();store.setItem(key,v)}return v}catch{return uuid()}};
  let memoryQueue=[],memoryAcks=[];
  const readJson=(key,fallback)=>{try{const raw=localStorage.getItem(key);if(!raw)return fallback;const x=JSON.parse(raw);return x??fallback}catch{return fallback}};
  const writeJson=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));return true}catch{return false}};
  const ackedIds=()=>{const saved=readJson(ACK_KEY,memoryAcks);const ids=Array.isArray(saved)?saved:memoryAcks;memoryAcks=ids.filter(x=>typeof x==='string').slice(0,MAX_ACKS);return new Set(memoryAcks)};
  const rememberAck=(id)=>{memoryAcks=[id,...ackedIds()].slice(0,MAX_ACKS);writeJson(ACK_KEY,memoryAcks)};
  const readQueue=()=>{const saved=readJson(QUEUE_KEY,memoryQueue);const a=Array.isArray(saved)?saved:memoryQueue;memoryQueue=a.filter(x=>x&&x.id&&x.body).slice(-MAX_QUEUE);return [...memoryQueue]};
  const writeQueue=(items)=>{memoryQueue=(items||[]).slice(-MAX_QUEUE);writeJson(QUEUE_KEY,memoryQueue);return true};

  const visitorId=get(localStorage,'sf_vid');
  const sessionId=get(sessionStorage,'sf_sid');
  const q=new URLSearchParams(location.search);
  let first={};
  try{first=JSON.parse(sessionStorage.getItem('sf_touch')||'{}')}catch{}
  if(!first?.landingPage){
    first={landingPage:location.pathname+location.search,referrer:document.referrer||'',utmSource:q.get('utm_source')||'',utmMedium:q.get('utm_medium')||'',utmCampaign:q.get('utm_campaign')||''};
    try{sessionStorage.setItem('sf_touch',JSON.stringify(first))}catch{}
  }
  const base={visitorId,sessionId,...first,deviceType:innerWidth<768?'mobile':innerWidth<1100?'tablet':'desktop'};
  window.__SF_PAGE_IDS=base;

  const pageViewId=uuid();
  const payload={...base,eventType:'page_view',page:location.pathname,metadata:{pageViewId,captureVersion:'20260903-01',capturedAt:new Date().toISOString()}};
  const current={id:pageViewId,body:JSON.stringify(payload),createdAt:Date.now(),attempts:0};
  const existing=readQueue().filter(x=>!ackedIds().has(x.id));
  if(!existing.some(x=>x.id===current.id)){existing.push(current);writeQueue(existing)};

  const removeFromQueue=(id)=>writeQueue(readQueue().filter(x=>x.id!==id));
  const markAck=(id)=>{rememberAck(id);removeFromQueue(id);if(id===pageViewId)window.__SF_PAGE_VIEW_SENT=true};

  const post=async(item)=>{
    try{
      const r=await fetch(API,{method:'POST',headers:{'Content-Type':'text/plain;charset=UTF-8'},credentials:'include',keepalive:true,cache:'no-store',body:item.body});
      if(r.ok){markAck(item.id);return true}
    }catch{}
    return false;
  };

  const flush=async()=>{
    if(flushing)return;
    flushing=true;
    try{
      const acks=ackedIds();
      const queue=readQueue().filter(x=>!acks.has(x.id));
      for(const item of queue){
        item.attempts=Number(item.attempts||0)+1;
        writeQueue(queue);
        const ok=await post(item);
        if(!ok)break;
      }
    }finally{flushing=false}
  };

  const beaconPending=()=>{
    if(!navigator.sendBeacon)return;
    const acks=ackedIds();
    for(const item of readQueue()){
      if(acks.has(item.id))continue;
      try{navigator.sendBeacon(API,new Blob([item.body],{type:'text/plain;charset=UTF-8'}))}catch{}
    }
  };

  // Capture immediately. No load/8s delay: even short visits enter the durable queue first.
  void flush();
  setTimeout(()=>void flush(),1200);
  setTimeout(()=>void flush(),4500);
  addEventListener('online',()=>void flush(),{passive:true});
  addEventListener('pagehide',beaconPending,{capture:true});
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')beaconPending();else void flush()},{capture:true});

  window.SF_ENSURE_PAGE_VIEW=()=>{void flush();return base};
  window.SF_PAGEVIEW_RUNTIME={send:()=>{void flush();return base},flush};
})();
