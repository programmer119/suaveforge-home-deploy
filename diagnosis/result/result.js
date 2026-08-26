(()=>{
  const main=document.getElementById('main'),id=new URLSearchParams(location.search).get('id'),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),a=window.SF_ANALYTICS;
  if(!id){main.innerHTML='<div class="loading">진단 ID가 없습니다.</div>';return}

  const stages=[
    {key:'prepare',label:'검사 환경 준비',sub:'URL 안전 확인 · Chromium 준비',match:['queued','prepare','browser']},
    {key:'desktop',label:'데스크톱 실제 로딩',sub:'1440px 렌더링 · 실행 오류 감지',match:['desktop']},
    {key:'seo',label:'SEO 구조 확인',sub:'메타 · robots.txt · sitemap.xml',match:['seo']},
    {key:'accessibility',label:'접근성 검사',sub:'axe-core 자동 규칙 검사',match:['accessibility']},
    {key:'performance',label:'성능·리소스 수집',sub:'로딩 타이밍 · 전송량 · 화면 증거',match:['performance','desktop_capture']},
    {key:'mobile',label:'모바일 UX 재현',sub:'390×844 · 터치 · 폼 · CTA · 넘침',match:['mobile','mobile_ux','evidence']},
    {key:'security',label:'기본 보안 신호',sub:'HTTPS · 헤더 · 혼합 콘텐츠',match:['security']},
    {key:'lighthouse',label:'Lighthouse 교차 측정',sub:'Performance · SEO · Accessibility',match:['lighthouse']},
    {key:'finalize',label:'결과 우선순위 정리',sub:'근거 기반 Top 3 구성',match:['finalize','completed']}
  ];
  const signalDefs=[
    ['desktop','DESKTOP','1440px'],['mobile','MOBILE','390×844'],['seo','SEO','STRUCTURE'],['accessibility','A11Y','AXE'],['security','SECURITY','HEADERS'],['lighthouse','LIGHTHOUSE','LAB']
  ];
  const stageOrder={queued:0,prepare:0,browser:0,desktop:1,seo:2,accessibility:3,performance:4,desktop_capture:4,mobile:5,mobile_ux:5,evidence:5,security:6,lighthouse:7,finalize:8,completed:9,failed:9};
  let viewed=false,lastData=null,ticker=null;

  const fmtSec=ms=>Math.max(0,Math.round(ms/1000));
  const statusFor=(signal,current,status)=>{
    if(status==='completed')return 'done';
    const target=stages.findIndex(s=>s.key===signal),cur=stageOrder[current]??0;
    if(target<0)return 'wait';
    if(cur>target)return 'done';
    if(cur===target)return 'active';
    return 'wait';
  };

  function progressShell(){
    if(main.querySelector('.audit-live'))return;
    main.innerHTML=`<section class="audit-live" aria-live="polite">
      <div class="audit-kicker"><span class="live-dot"></span> LIVE DIAGNOSIS <span class="audit-id">#${esc(id.slice(0,8))}</span></div>
      <div class="audit-grid">
        <div class="audit-visual">
          <div class="audit-orbit" aria-hidden="true"><div class="orbit-core"><strong id="progressNumber">0</strong><span>%</span></div></div>
          <div class="audit-copy"><h1 id="progressTitle">진단 엔진을 준비하고 있습니다.</h1><p id="progressDetail">실제 브라우저 검사 상태를 불러오는 중입니다.</p><div class="audit-meta"><span id="elapsedText">경과 0초</span><span id="estimateText">예상 시간을 계산 중</span></div></div>
          <div class="scan-stage" aria-hidden="true"><div class="browser-frame"><div class="browser-top"><i></i><i></i><i></i><span id="targetHost">target</span></div><div class="browser-body"><div class="scan-beam"></div><div class="skeleton s1"></div><div class="skeleton s2"></div><div class="skeleton s3"></div><div class="skeleton s4"></div></div></div></div>
        </div>
        <div class="audit-steps">${stages.map((s,i)=>`<div class="audit-step" data-step="${i}"><span class="step-no">${String(i+1).padStart(2,'0')}</span><span class="step-mark"></span><div><b>${s.label}</b><small>${s.sub}</small></div><em></em></div>`).join('')}</div>
      </div>
      <div class="audit-rail"><div id="progressBar"></div></div>
      <div class="signal-row">${signalDefs.map(([k,l,v])=>`<div class="signal" data-signal="${k}"><span></span><div><b>${l}</b><small>${v}</small></div><em>대기</em></div>`).join('')}</div>
      <p class="audit-note">페이지를 새로고침하지 않아도 실제 서버 작업 단계가 자동으로 반영됩니다. 임의로 시간을 채우는 가짜 진행률이 아닙니다.</p>
    </section>`;
  }

  function updateClock(){
    if(!lastData||!main.querySelector('.audit-live'))return;
    const start=Date.parse(lastData.started_at||lastData.created_at||Date.now());
    const elapsed=Date.now()-start;
    const el=document.getElementById('elapsedText'),et=document.getElementById('estimateText');
    if(el)el.textContent=`경과 ${fmtSec(elapsed)}초`;
    const estimate=Number(lastData.estimated_duration_ms||35000);
    if(et){
      if(elapsed>estimate*1.35)et.textContent='예상보다 오래 걸리는 중';
      else et.textContent=`예상 총 ${Math.max(10,Math.round(estimate/1000))}초 안팎`;
    }
  }

  function renderProgress(d){
    lastData=d;progressShell();
    const current=d.progress_stage||d.status||'queued',cur=stageOrder[current]??0,pct=Math.max(2,Math.min(99,Number(d.progress_percent)||2));
    const idx=Math.min(stages.length-1,cur),stage=stages[idx];
    document.getElementById('progressNumber').textContent=String(pct);
    const orbit=main.querySelector('.audit-orbit');if(orbit)orbit.style.setProperty('--angle',(pct*3.6)+'deg');
    document.getElementById('progressTitle').textContent=d.status==='queued'?'진단 대기열에 등록되었습니다.':stage.label+' 중입니다.';
    document.getElementById('progressDetail').textContent=d.progress_detail||stage.sub;
    document.getElementById('progressBar').style.width=pct+'%';
    document.getElementById('targetHost').textContent=d.hostname||'대상 사이트';
    main.querySelectorAll('.audit-step').forEach((el,i)=>{
      el.classList.toggle('done',i<cur);
      el.classList.toggle('active',i===idx&&d.status!=='queued');
      const em=el.querySelector('em');
      if(em)em.textContent=i<cur?'완료':i===idx?(d.status==='queued'?'대기':'진행 중'):'대기';
    });
    main.querySelectorAll('.signal').forEach(el=>{
      const s=statusFor(el.dataset.signal,current,d.status),em=el.querySelector('em');
      el.className='signal '+s;
      if(em)em.textContent=s==='done'?'완료':s==='active'?'검사 중':'대기';
    });
    updateClock();
    if(!ticker)ticker=setInterval(updateClock,1000);
  }

  async function load(){
    try{
      const r=await fetch(a.API+'/api/v1/diagnoses/'+encodeURIComponent(id),{credentials:'include'}),d=await r.json();
      if(!r.ok)throw new Error(d.error||'결과를 찾지 못했습니다.');
      if(['queued','running'].includes(d.status)){renderProgress(d);setTimeout(load,1200);return}
      if(ticker){clearInterval(ticker);ticker=null}
      if(d.status==='failed'){
        const stageKey=d.error_stage||'unknown',stageInfo=stages.find(x=>x.match.includes(stageKey)||x.key===stageKey),stageLabel=stageInfo?.label||stageKey;
        main.innerHTML=`<section class="failure-view">
          <div class="eyebrow">DIAGNOSIS FAILED</div>
          <h1>진단이 ${esc(stageLabel)} 단계에서 중단됐습니다.</h1>
          <p class="failure-message">${esc(d.error_message||'대상 사이트 응답 또는 검사 환경을 확인해 주세요.')}</p>
          <div class="failure-meta"><span><b>단계</b>${esc(stageKey)}</span><span><b>오류 코드</b>${esc(d.error_code||'DIAGNOSIS_FAILED')}</span><span><b>진단 ID</b>${esc(id)}</span></div>
          <p class="failure-help">이 화면의 단계·오류 코드·진단 ID를 그대로 전달하면 서버 로그와 바로 대조할 수 있습니다.</p>
          <a class="btn" href="../">다시 진단하기</a>
        </section>`;
        return
      }
      render(d);if(!viewed){viewed=true;a.event('result_viewed',{diagnosisId:id})}
    }catch(e){main.innerHTML='<div class="loading">'+esc(e.message||e)+'</div>'}
  }

  function render(d){
    const top=d.top_issues||[],all=d.findings||[],shots=d.screenshots||{},summary=d.summary?.conclusion||'공개 페이지 검사 결과를 정리했습니다.',warnings=d.metrics?.warnings||[];
    main.innerHTML=`<section class="result-head"><div class="eyebrow">DIAGNOSIS RESULT</div><h1>${esc(d.site_title||d.hostname)}</h1><p>${esc(d.normalized_url)} · ${d.processing_time_ms?Math.round(d.processing_time_ms/100)/10+'초':''}</p></section><section class="summary"><h2>${esc(summary)}</h2></section>${warnings.length?`<section class="diagnosis-warnings"><b>일부 보조 검사가 완료되지 않았습니다.</b>${warnings.map(w=>`<p><strong>${esc(w.stage||'검사')}</strong> · ${esc(w.code||'WARNING')} · ${esc(w.message||'원인 미상')}</p>`).join('')}</section>`:''}<section class="top3">${top.length?top.map((x,i)=>issue(x,i)).join(''):'<article class="issue"><div class="n">TOP</div><h3>즉시 우선순위로 분류된 문제가 많지 않습니다.</h3><p>상세 항목과 공개 페이지 검사 범위를 확인해 주세요.</p></article>'}</section>${Object.keys(shots).length?`<section class="section"><h2>실제 화면과 근거</h2><div class="shots">${[['desktop','데스크톱 캡처'],['mobile','모바일 캡처'],['annotated','문제 위치 표시']].filter(([k])=>shots[k]).map(([k,l])=>`<a href="${esc(shots[k])}" target="_blank"><img src="${esc(shots[k])}" alt="${l}"><span>${l} ↗</span></a>`).join('')}</div></section>`:''}<section class="section"><h2>상세 진단</h2><div class="details">${all.map((x,i)=>`<details class="detail" ${i<3?'open':''}><summary>${esc(x.title)} · ${esc(x.category)}</summary><div class="detail-grid"><div><b>실제 근거</b>${esc(x.evidence)}</div><div><b>사용자 영향</b>${esc(x.userImpact)}</div><div><b>사업 영향</b>${esc(x.businessImpact)}</div><div><b>개선방법</b>${esc(x.improvement)}</div><div><b>수정 난이도</b>${esc(x.difficulty)}</div><div><b>재개발 판단</b>${esc(x.redevelopment)}</div></div></details>`).join('')}</div></section><section class="section"><h2>결과를 이어서 확인하기</h2><div class="forms"><form class="formbox" id="mailForm"><h3>이메일로 결과 받기</h3><p>현재 결과 링크와 핵심 문제를 이메일로 보내드립니다.</p><input type="email" name="email" required placeholder="you@example.com"><label class="check"><input type="checkbox" name="marketing"> SuaveForge 개선 사례 및 서비스 안내도 이메일로 받겠습니다.</label><button type="submit">리포트 받기</button><p class="status"></p></form><form class="formbox" id="consultForm"><h3>무료로 직접 봐달라고 하기</h3><p>로그인·예약·결제·관리자처럼 외부에서 확인할 수 없는 영역은 직접 사용해보고 가장 큰 문제를 찾습니다.</p><input name="name" placeholder="이름 / 회사명"><input name="email" type="email" placeholder="이메일"><input name="phone" placeholder="연락처"><textarea name="message" rows="4" placeholder="특히 확인했으면 하는 흐름이 있다면 적어주세요."></textarea><button type="submit">무료 컨설팅 요청</button><p class="status"></p></form></div></section>`;wire()
  }
  function issue(x,i){return `<article class="issue"><div class="n">TOP ${i+1} · ${esc(x.confidence)}</div><h3>${esc(x.title)}</h3><p>${esc(x.userImpact)}</p><p class="evidence"><b>근거</b><br>${esc(x.evidence)}</p></article>`}
  function wire(){
    const cf=document.getElementById('consultForm');let ctaTracked=false;const trackConsult=()=>{if(ctaTracked)return;ctaTracked=true;a.event('consultation_cta_clicked',{diagnosisId:id})};cf.addEventListener('focusin',trackConsult,{once:true});cf.addEventListener('click',trackConsult,{once:true});
    document.getElementById('mailForm').addEventListener('submit',async e=>{e.preventDefault();const f=e.currentTarget,s=f.querySelector('.status'),email=f.email.value.trim();s.textContent='발송 중…';const r=await fetch(a.API+'/api/v1/diagnoses/'+id+'/email',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'include',body:JSON.stringify({email,marketingConsent:f.marketing.checked})}),b=await r.json();s.textContent=b.status==='sent'?'이메일을 발송했습니다.':b.status==='pending'?'진단 완료 후 자동 발송합니다.':b.message||b.error||'메일 발송 상태를 확인해 주세요.'});
    document.getElementById('consultForm').addEventListener('submit',async e=>{e.preventDefault();const f=e.currentTarget,s=f.querySelector('.status'),data=Object.fromEntries(new FormData(f));if(!data.email&&!data.phone){s.textContent='이메일 또는 연락처 중 하나는 입력해 주세요.';return}s.textContent='접수 중…';const r=await fetch(a.API+'/api/v1/consultations',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'include',body:JSON.stringify({...a.touch,...data,diagnosisId:id})});s.textContent=r.ok?'접수했습니다. 확인 후 직접 연락드리겠습니다.':'접수하지 못했습니다. 잠시 후 다시 시도해 주세요.'})
  }
  load();
})();
