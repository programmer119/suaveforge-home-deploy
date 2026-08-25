(()=>{
  window.SF_ANALYTICS?.event('diagnosis_page_view');
  const form=document.getElementById('diagForm'),status=document.getElementById('status'),progress=document.getElementById('progress'),btn=document.getElementById('startBtn'),estimateTitle=document.getElementById('estimateTitle'),estimateDetail=document.getElementById('estimateDetail');
  const preset=new URLSearchParams(location.search).get('url');
  if(preset){const field=document.getElementById('url');if(field)field.value=preset;}

  async function loadEstimate(){
    try{
      const a=window.SF_ANALYTICS,r=await fetch(a.API+'/api/v1/diagnoses/estimate',{credentials:'include'}),b=await r.json();
      if(!r.ok)throw new Error();
      const min=Math.max(10,Number(b.minSeconds)||20),max=Math.max(min+5,Number(b.maxSeconds)||50),typ=Math.max(min,Number(b.typicalSeconds)||35);
      estimateTitle.textContent=`예상 소요 ${min}~${max}초 · 보통 ${typ}초 안팎`;
      estimateDetail.textContent=b.source==='recent-runs'&&b.sampleSize?`최근 실제 진단 ${b.sampleSize}건을 반영한 예상시간입니다. 대상 사이트 응답속도에 따라 달라질 수 있습니다.`:'실제 Chromium으로 데스크톱·모바일을 각각 열고 Lighthouse·접근성·SEO·보안 신호까지 확인합니다.';
    }catch{}
  }
  loadEstimate();

  form.addEventListener('submit',async e=>{
    e.preventDefault();status.className='status';status.textContent='URL 안전 확인 후 실제 브라우저 진단을 시작합니다.';progress.classList.add('on');btn.disabled=true;const url=document.getElementById('url').value.trim();
    try{
      const a=window.SF_ANALYTICS;const r=await fetch(a.API+'/api/v1/diagnoses',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'include',body:JSON.stringify({...a.touch,url})});const b=await r.json();if(!r.ok)throw new Error(b.error||'진단을 시작하지 못했습니다.');location.href='./result/?id='+encodeURIComponent(b.diagnosisId);
    }catch(err){progress.classList.remove('on');btn.disabled=false;status.className='status error';status.textContent=err.message||String(err)}
  });
})();
