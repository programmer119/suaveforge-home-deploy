(()=>{
  window.SF_ANALYTICS?.event('diagnosis_page_view');
  const form=document.getElementById('diagForm'),status=document.getElementById('status'),progress=document.getElementById('progress'),btn=document.getElementById('startBtn'),estimateTitle=document.getElementById('estimateTitle'),estimateDetail=document.getElementById('estimateDetail');
  const preset=new URLSearchParams(location.search).get('url');
  if(preset){const field=document.getElementById('url');if(field)field.value=preset;}

  async function loadEstimate(url=''){
    try{
      const a=window.SF_ANALYTICS,q=url?'?url='+encodeURIComponent(url):'',r=await fetch(a.API+'/api/v1/diagnoses/estimate'+q,{credentials:'include'}),b=await r.json();
      if(!r.ok)throw new Error();
      if(Number(b.sampleSize)>=5&&Number(b.p50Seconds)>0&&Number(b.p80Seconds)>0){
        estimateTitle.textContent=`최근 완료 ${b.sampleSize}건 기준 · 절반 ${b.p50Seconds}초 이내 · 80% ${b.p80Seconds}초 이내`;
        estimateDetail.textContent='사이트 복잡도와 외부 리소스 상태에 따라 수 분까지 걸릴 수 있습니다. 고정 제한시간으로 정상 검사를 끊지 않습니다.';
      }else{
        estimateTitle.textContent='사이트마다 검사 시간이 다릅니다.';
        estimateDetail.textContent='고정 초 단위 약속 대신 시작 후 실제 검사 단계·경과시간·서버 활동을 실시간으로 표시합니다.';
      }
    }catch{}
  }
  loadEstimate();
  const urlField=document.getElementById('url');
  let estimateTimer=null;
  urlField?.addEventListener('input',()=>{
    clearTimeout(estimateTimer);
    estimateTimer=setTimeout(()=>{const v=urlField.value.trim();if(/^https?:\/\//i.test(v))loadEstimate(v);},700);
  });

  form.addEventListener('submit',async e=>{
    e.preventDefault();status.className='status';status.textContent='URL 안전 확인 후 실제 브라우저 진단을 시작합니다.';progress.classList.add('on');btn.disabled=true;const url=document.getElementById('url').value.trim();
    try{
      const a=window.SF_ANALYTICS;const r=await fetch(a.API+'/api/v1/diagnoses',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'include',body:JSON.stringify({...a.touch,url})});const b=await r.json();if(!r.ok)throw new Error(b.error||'진단을 시작하지 못했습니다.');location.href='./result/?id='+encodeURIComponent(b.diagnosisId);
    }catch(err){progress.classList.remove('on');btn.disabled=false;status.className='status error';status.textContent=err.message||String(err)}
  });
})();
