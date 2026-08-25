(()=>{
  'use strict';
  const API='https://api-suaveforge.suaveforge.com';
  const login=document.getElementById('login');
  const dash=document.getElementById('dashboard');
  const range=document.getElementById('range');
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const num=v=>Number(v||0).toLocaleString();
  const pct=(a,b)=>b?Math.round(Number(a||0)/Number(b)*1000)/10:0;
  const date=v=>v?new Date(v).toLocaleString('ko-KR'):'-';
  const seconds=v=>v?`${Math.round(Number(v)/100)/10}초`:'-';
  const empty=(cols,text='데이터 없음')=>`<tr><td colspan="${cols}" class="empty">${text}</td></tr>`;
  const state=x=>[x.consultation?'상담':'',x.pilot?'선개발':'',x.contract?'계약':''].filter(Boolean).map(v=>`<span class="tag ${v==='계약'?'tag-contract':''}">${v}</span>`).join(' ')||'<span class="muted">-</span>';

  document.getElementById('loginForm').addEventListener('submit',async e=>{
    e.preventDefault();
    const f=e.currentTarget,s=f.querySelector('.status');
    s.textContent='';
    try{
      const r=await fetch(API+'/api/v1/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'include',body:JSON.stringify({password:f.password.value})});
      if(!r.ok){s.textContent='로그인 정보를 확인해 주세요.';return;}
      login.hidden=true;dash.hidden=false;await load();
    }catch{s.textContent='관리자 API에 연결할 수 없습니다.';}
  });

  range.addEventListener('change',load);

  async function load(){
    const r=await fetch(API+'/api/v1/admin/analytics?days='+encodeURIComponent(range.value),{credentials:'include'});
    if(r.status===401){dash.hidden=true;login.hidden=false;return;}
    if(!r.ok)throw new Error('analytics request failed');
    const d=await r.json();
    login.hidden=true;dash.hidden=false;render(d);
  }

  function render(d){
    const m=d.topMetrics||{};
    const metricDefs=[
      ['방문자','visitors'],['페이지뷰','pageviews'],['진단 시작','diagnosis_started'],['진단 완료','diagnosis_completed'],['결과 조회','result_viewed'],['이메일','email_report_submitted'],['상담','consultation_submitted'],['선개발','pilot_started'],['계약','contract']
    ];
    document.getElementById('topMetrics').innerHTML=metricDefs.map(([label,key])=>`<article><span>${label}</span><b>${num(m[key])}</b></article>`).join('');

    const labels={visitor:'방문',diagnosis_started:'진단 시작',diagnosis_completed:'진단 완료',result_viewed:'결과 확인',email_report_submitted:'이메일',consultation_submitted:'상담',pilot_started:'선개발',contract:'계약'};
    document.getElementById('funnel').innerHTML=(d.stages||[]).map((x,i)=>`<div class="stage"><div class="stage-index">${String(i+1).padStart(2,'0')}</div><label>${labels[x.name]||esc(x.name)}</label><b>${num(x.count)}</b><small>${i===0?'기준 방문자':`이전 단계 ${x.fromPrevious}%`}<br>방문 대비 ${x.fromVisit}%</small></div>`).join('');

    document.getElementById('channels').innerHTML=(d.channels||[]).length?(d.channels||[]).map(x=>`<div class="data-row"><b>${esc(x.source)}</b><span>진단 ${num(x.diagnoses)}</span><span>완료 ${num(x.completed)}</span><span>상담 ${num(x.consultations)}</span><span>계약 ${num(x.contracts)}</span></div>`).join(''):'<p class="empty-block">데이터 없음</p>';

    document.getElementById('campaigns').innerHTML=(d.campaigns||[]).length?(d.campaigns||[]).map(x=>`<div class="data-row"><b>${esc(x.campaign)}</b><span>진단 ${num(x.diagnoses)}</span><span>상담 ${num(x.consultations)}</span><span>계약 ${num(x.contracts)}</span></div>`).join(''):'<p class="empty-block">데이터 없음</p>';

    document.getElementById('devices').innerHTML=(d.devices||[]).length?(d.devices||[]).map(x=>`<div class="device-row"><b>${esc(x.device)}</b><span>${num(x.sessions)} sessions</span></div>`).join(''):'<p class="empty-block">데이터 없음</p>';

    document.getElementById('timing').innerHTML=`<article><b>${seconds(d.timing?.avg_ms)}</b><span>평균</span></article><article><b>${seconds(d.timing?.p95_ms)}</b><span>P95</span></article>`;

    document.getElementById('landings').innerHTML=(d.landingPages||[]).length?(d.landingPages||[]).map(x=>`<tr><td class="path">${esc(x.landing)}</td><td>${num(x.diagnoses)}</td><td>${num(x.completed)}</td><td>${pct(x.completed,x.diagnoses)}%</td></tr>`).join(''):empty(4);

    document.getElementById('recent').innerHTML=(d.recent||[]).length?(d.recent||[]).map(x=>`<tr><td>${date(x.created_at)}</td><td><b>${esc(x.hostname)}</b></td><td><span class="pill ${x.status==='failed'?'pill-fail':''}">${esc(x.status)}</span></td><td>${seconds(x.processing_time_ms)}</td><td>${state(x)}</td><td><div class="actions"><button data-pilot="${esc(x.diagnosis_id)}" ${x.pilot?'disabled':''}>${x.pilot?'선개발 완료':'선개발'}</button><button class="contract" data-contract="${esc(x.diagnosis_id)}" ${x.contract?'disabled':''}>${x.contract?'계약 완료':'계약'}</button></div></td></tr>`).join(''):empty(6);

    document.getElementById('consultations').innerHTML=(d.consultations||[]).length?(d.consultations||[]).map(x=>`<tr><td>${date(x.created_at)}</td><td>${esc(x.name)||'-'}</td><td>${esc(x.email)||'-'}</td><td>${esc(x.phone)||'-'}</td><td class="message">${esc(x.message)||'-'}</td></tr>`).join(''):empty(5);

    document.getElementById('contractOrigins').innerHTML=(d.contractOrigins||[]).length?(d.contractOrigins||[]).map(x=>`<tr><td>${date(x.created_at)}</td><td>${esc(x.hostname)||'-'}</td><td>${esc(x.source)}</td><td>${esc(x.campaign)}</td><td class="path">${esc(x.landing)}</td></tr>`).join(''):empty(5);

    document.getElementById('failed').innerHTML=(d.failed||[]).length?(d.failed||[]).map(x=>`<tr><td>${date(x.created_at)}</td><td>${esc(x.hostname)}</td><td>${esc(x.error_code)||'-'}</td><td class="message">${esc(x.error_message)||'-'}</td></tr>`).join(''):empty(4);

    document.querySelectorAll('[data-pilot]:not([disabled])').forEach(b=>b.addEventListener('click',()=>mark(b.dataset.pilot,'pilot')));
    document.querySelectorAll('[data-contract]:not([disabled])').forEach(b=>b.addEventListener('click',()=>mark(b.dataset.contract,'contract')));
  }

  async function mark(id,type){
    if(!confirm(type==='pilot'?'이 진단을 선개발 단계로 표시할까요?':'이 진단을 계약 전환으로 표시할까요?'))return;
    const r=await fetch(`${API}/api/v1/admin/diagnoses/${encodeURIComponent(id)}/${type}`,{method:'POST',credentials:'include'});
    if(r.ok)await load();
    else alert('상태를 저장하지 못했습니다.');
  }

  load().catch(()=>{});
})();
