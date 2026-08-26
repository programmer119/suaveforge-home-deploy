window.SF_CONFIG = Object.freeze({
  contactEmail: "project@suaveforge.com",
  contactEndpoint: "https://formsubmit.co/ajax/project@suaveforge.com",
  responsePromise: "영업일 기준 1일 이내 확인 후 연락드립니다."
});

// Revival analytics: keep the existing page markup untouched and load the
// first-party funnel tracker from the already-shared site configuration.
(()=>{
  if(window.SF_ANALYTICS||document.querySelector('script[data-sf-analytics]'))return;
  const s=document.createElement('script');
  s.src='/analytics.js?v=20260826-07';
  s.defer=true;
  s.dataset.sfAnalytics='';
  document.head.appendChild(s);
})();
