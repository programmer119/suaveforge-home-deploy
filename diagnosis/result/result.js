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
  const signalDefs=[['desktop','DESKTOP','1440px'],['mobile','MOBILE','390×844'],['seo','SEO','STRUCTURE'],['accessibility','A11Y','AXE'],['security','SECURITY','HEADERS'],['lighthouse','LIGHTHOUSE','LAB']];
  const stageOrder={queued:0,prepare:0,browser:0,desktop:1,seo:2,accessibility:3,performance:4,desktop_capture:4,mobile:5,mobile_ux:5,evidence:5,security:6,lighthouse:7,finalize:8,completed:9,failed:9};
  let viewed=false,lastData=null,ticker=null,charts=[];

  const fmtSec=ms=>Math.max(0,Math.round(ms/1000));
  const statusFor=(signal,current,status)=>{if(status==='completed')return 'done';const target=stages.findIndex(s=>s.key===signal),cur=stageOrder[current]??0;if(target<0)return 'wait';if(cur>target)return 'done';if(cur===target)return 'active';return 'wait'};
  const num=v=>Number.isFinite(Number(v))?Number(v):null;
  const score=v=>{const n=num(v);if(n===null)return null;return Math.max(0,Math.min(100,n<=1?n*100:n))};
  const priorityLabel=x=>Number(x.priority)>=85?'즉시 수정':Number(x.priority)>=65?'권장 수정':'참고';
  const priorityClass=x=>Number(x.priority)>=85?'immediate':Number(x.priority)>=65?'recommended':'reference';
  const difficulty=x=>x?.difficulty||'판단 필요';
  const bytes=v=>{const n=num(v);if(n===null)return '—';if(n<1024)return `${Math.round(n)} B`;if(n<1024*1024)return `${(n/1024).toFixed(n<10240?1:0)} KB`;return `${(n/1024/1024).toFixed(1)} MB`};
  const short=s=>String(s||'').length>34?String(s).slice(0,32)+'…':String(s||'');
  const scoreState=s=>s===null?['N/A','na']:s>=90?['우수','good']:s>=50?['개선 가능','needs']:['우선 개선','poor'];
  const metricState=(key,v)=>{const n=num(v);if(n===null)return ['측정 없음','na'];if(key==='lcp')return n<=2500?['좋음','good']:n<=4000?['개선 필요','needs']:['나쁨','poor'];if(key==='cls')return n<=.1?['좋음','good']:n<=.25?['개선 필요','needs']:['나쁨','poor'];if(key==='tbt')return n<=200?['좋음','good']:n<=600?['개선 필요','needs']:['나쁨','poor'];if(key==='fcp')return n<=1800?['좋음','good']:n<=3000?['개선 필요','needs']:['나쁨','poor'];return ['측정됨','good']};
  const metricValue=(key,v)=>{const n=num(v);if(n===null)return '—';if(key==='cls')return n.toFixed(3).replace(/0+$/,'').replace(/\.$/,'');return n<1000?`${Math.round(n)} ms`:`${(n/1000).toFixed(2)} s`};
  const locations=x=>Array.isArray(x.locations)&&x.locations.length?`<div class="locations"><b>Problem locations</b>${x.locations.slice(0,8).map(v=>`<code>${esc(v)}</code>`).join('')}</div>`:'';

  function progressShell(){
    if(main.querySelector('.audit-live'))return;
    main.innerHTML=`<section class="audit-live" aria-live="polite">
      <div class="audit-kicker"><span class="live-dot"></span> LIVE DIAGNOSIS <span class="audit-id">#${esc(id.slice(0,8))}</span></div>
      <div class="audit-grid">
        <div class="audit-visual">
          <div class="audit-orbit" aria-hidden="true"><div class="orbit-core"><strong id="progressNumber">0</strong><span>%</span></div></div>
          <div class="audit-copy"><h1 id="progressTitle">진단 엔진을 준비하고 있습니다.</h1><p id="progressDetail">실제 브라우저 검사 상태를 불러오는 중입니다.</p><div class="audit-meta"><span id="elapsedText">경과 0초</span><span id="estimateText">서버 활동 확인 중</span></div></div>
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
    const start=Date.parse(lastData.started_at||lastData.created_at||Date.now()),elapsed=Date.now()-start,el=document.getElementById('elapsedText'),et=document.getElementById('estimateText');
    if(el)el.textContent=`경과 ${fmtSec(elapsed)}초`;
    if(et){const last=Date.parse(lastData.last_progress_at||lastData.started_at||Date.now()),idle=Math.max(0,Date.now()-last);if(idle<5000)et.textContent='서버 활동 정상 · 방금 진행 신호 수신';else if(idle<30000)et.textContent=`현재 단계 처리 중 · 마지막 활동 ${fmtSec(idle)}초 전`;else et.textContent=`현재 단계 장기 처리 중 · 마지막 활동 ${fmtSec(idle)}초 전`}
  }

  function renderProgress(d){
    lastData=d;progressShell();const current=d.progress_stage||d.status||'queued',cur=stageOrder[current]??0,pct=Math.max(2,Math.min(99,Number(d.progress_percent)||2)),idx=Math.min(stages.length-1,cur),stage=stages[idx];
    document.getElementById('progressNumber').textContent=String(pct);const orbit=main.querySelector('.audit-orbit');if(orbit)orbit.style.setProperty('--angle',(pct*3.6)+'deg');document.getElementById('progressTitle').textContent=d.status==='queued'?'진단 대기열에 등록되었습니다.':stage.label+' 중입니다.';document.getElementById('progressDetail').textContent=d.progress_detail||stage.sub;document.getElementById('progressBar').style.width=pct+'%';document.getElementById('targetHost').textContent=d.hostname||'대상 사이트';
    main.querySelectorAll('.audit-step').forEach((el,i)=>{el.classList.toggle('done',i<cur);el.classList.toggle('active',i===idx&&d.status!=='queued');const em=el.querySelector('em');if(em)em.textContent=i<cur?'완료':i===idx?(d.status==='queued'?'대기':'진행 중'):'대기'});
    main.querySelectorAll('.signal').forEach(el=>{const s=statusFor(el.dataset.signal,current,d.status),em=el.querySelector('em');el.className='signal '+s;if(em)em.textContent=s==='done'?'완료':s==='active'?'검사 중':'대기'});updateClock();if(!ticker)ticker=setInterval(updateClock,1000);
  }

  async function load(){
    try{
      const r=await fetch(a.API+'/api/v1/diagnoses/'+encodeURIComponent(id),{credentials:'include'}),d=await r.json();if(!r.ok)throw new Error(d.error||'결과를 찾지 못했습니다.');
      if(['queued','running'].includes(d.status)){renderProgress(d);setTimeout(load,1200);return}if(ticker){clearInterval(ticker);ticker=null}
      if(d.status==='failed'){
        const stageKey=d.error_stage||'unknown',stageInfo=stages.find(x=>x.match.includes(stageKey)||x.key===stageKey),stageLabel=stageInfo?.label||stageKey;
        main.innerHTML=`<section class="failure-view"><div class="eyebrow">DIAGNOSIS FAILED</div><h1>진단이 ${esc(stageLabel)} 단계에서 중단됐습니다.</h1><p class="failure-message">${esc(d.error_message||'대상 사이트 응답 또는 검사 환경을 확인해 주세요.')}</p><div class="failure-meta"><span><b>단계</b>${esc(stageKey)}</span><span><b>오류 코드</b>${esc(d.error_code||'DIAGNOSIS_FAILED')}</span><span><b>진단 ID</b>${esc(id)}</span></div><p class="failure-help">이 화면의 단계·오류 코드·진단 ID를 그대로 전달하면 서버 로그와 바로 대조할 수 있습니다.</p><a class="btn" href="../">다시 진단하기</a></section>`;return
      }
      render(d);if(!viewed){viewed=true;a.event('result_viewed',{diagnosisId:id})}
    }catch(e){main.innerHTML='<div class="loading">'+esc(e.message||e)+'</div>'}
  }

  function categoryRows(all){
    const m=new Map();for(const x of all){const k=String(x.category||'기타'),p=Number(x.priority)||0,o=m.get(k)||{category:k,count:0,max:0,sum:0};o.count++;o.max=Math.max(o.max,p);o.sum+=p;m.set(k,o)}
    return [...m.values()].map(x=>({...x,avg:Math.round(x.sum/x.count)})).sort((a,b)=>b.max-a.max||b.count-a.count);
  }

  function metricTile(key,label,value,help){const [state,klass]=metricState(key,value);return `<div class="metric-tile"><div class="metric-top"><span class="metric-name">${label}</span><span class="metric-status ${klass}">${state}</span></div><strong class="metric-value">${metricValue(key,value)}</strong><span class="metric-help">${help}</span></div>`}

  function actionCard(x){
    const p=Math.max(0,Math.min(100,Number(x.priority)||0));
    return `<article class="action-card"><div class="action-score"><strong>${p}</strong><span>PRIORITY</span></div><div class="action-body"><div class="action-meta"><span class="tag ${priorityClass(x)}">${priorityLabel(x)}</span><span class="tag category">${esc(x.category)}</span><span class="tag confidence">${esc(x.confidence)}</span></div><h3>${esc(x.title)}</h3><p>${esc(x.userImpact)}</p><div class="action-evidence"><div><b>Evidence</b>${esc(x.evidence)}</div><div><b>Recommended fix</b>${esc(x.improvement)}</div></div>${locations(x)}<div class="difficulty-line"><span>수정 난이도</span><b>${esc(difficulty(x))}</b><span>· 시간은 원인/코드 범위 확인 후 산정</span></div></div></article>`;
  }

  function render(d){
    const top=d.top_issues||[],all=d.findings||[],shots=d.screenshots||{},summary=d.summary?.conclusion||'공개 페이지 검사 결과를 정리했습니다.',m=d.metrics||{},lh=m.lighthouse||{},warnings=m.warnings||[],cats=categoryRows(all);
    const perf=score(lh.performance),seo=score(lh.seo),a11y=score(lh.accessibility),immediate=all.filter(x=>Number(x.priority)>=85).length,recommended=all.filter(x=>Number(x.priority)>=65&&Number(x.priority)<85).length,runtimeErrors=(Number(m.runtime?.consoleErrors)||0)+(Number(m.runtime?.requestErrors)||0),processing=d.processing_time_ms?Math.round(Number(d.processing_time_ms)/100)/10:null;
    const categoryOptions=['전체',...cats.map(x=>x.category)];
    main.innerHTML=`
      <section class="result-head"><div><div class="eyebrow">DIAGNOSIS RESULT · EVIDENCE-BASED</div><h1>${esc(d.site_title||d.hostname)}</h1><p class="result-url"><span>${esc(d.normalized_url)}</span>${processing!==null?`<span class="dot">•</span><span>완료 ${processing}초</span>`:''}<span class="dot">•</span><span>#${esc(id.slice(0,8))}</span></p></div><div class="result-head-side"><b>${all.length}</b><span>발견 항목</span></div></section>
      <section class="executive"><div class="executive-inner"><div class="executive-copy"><div class="eyebrow">EXECUTIVE SUMMARY</div><h2>${esc(summary)}</h2><p>우선순위 숫자는 진단 규칙의 실제 priority 값이며, 시간 견적은 임의 상수로 표시하지 않습니다. 먼저 영향도와 증거를 보고 수정 순서를 결정합니다.</p></div><div class="executive-stats"><div class="executive-stat is-alert"><b>${immediate}</b><span>Immediate</span></div><div class="executive-stat"><b>${recommended}</b><span>Recommended</span></div><div class="executive-stat ${runtimeErrors?'is-alert':'is-ok'}"><b>${runtimeErrors}</b><span>Runtime errors</span></div><div class="executive-stat"><b>${m.performance?.resourceCount??'—'}</b><span>Resources</span></div><div class="executive-stat"><b>${bytes(m.performance?.transferSize)}</b><span>Transfer</span></div><div class="executive-stat ${m.security?.mixedContent?'is-alert':'is-ok'}"><b>${m.security?.mixedContent??'—'}</b><span>Mixed content</span></div></div></div></section>
      <nav class="report-nav" aria-label="진단 결과 바로가기"><a href="#scores">핵심 지표</a><a href="#priority">우선순위</a><a href="#matrix">분야별 현황</a>${Object.keys(shots).length?'<a href="#evidence">화면 증거</a>':''}<a href="#details">상세 진단</a><a href="#next">다음 단계</a></nav>
      ${warnings.length?`<section class="warning-strip"><b>일부 보조 검사에 경고가 있습니다.</b>${warnings.map(w=>`<p><strong>${esc(w.stage||'검사')}</strong> · ${esc(w.code||'WARNING')} · ${esc(w.message||'원인 미상')}</p>`).join('')}</section>`:''}
      <section class="report-section" id="scores"><div class="section-head"><div><div class="section-kicker">01 · Metrics</div><h2>한눈에 보는 핵심 지표</h2></div><p>PageSpeed/Lighthouse식 점수 개요와 Web Vitals형 핵심 수치를 분리해, “몇 점인가”와 “무엇이 느린가”를 동시에 읽게 구성했습니다.</p></div><div class="score-layout"><div class="score-panel"><div class="score-grid">${[['Performance',perf],['SEO',seo],['Accessibility',a11y]].map(([label,v])=>{const [s]=scoreState(v);return `<div class="score-item"><div class="score-gauge" data-label="${label}" data-score="${v===null?'':v}"></div><b>${label}</b><small>${s}</small></div>`}).join('')}</div></div><div class="metric-panel">${metricTile('lcp','LCP',lh.lcp,'가장 큰 콘텐츠 표시')}${metricTile('tbt','TBT',lh.tbt,'메인 스레드 차단 시간')}${metricTile('cls','CLS',lh.cls,'레이아웃 흔들림')}${metricTile('fcp','FCP',lh.fcp,'첫 콘텐츠 표시')}</div></div></section>
      <section class="report-section" id="priority"><div class="section-head"><div><div class="section-kicker">02 · Action priority</div><h2>먼저 고칠 것부터</h2></div><p>GTmetrix Top Issues와 Semrush severity 정렬 패턴처럼 “가장 영향 큰 것 → 바로 수정 행동” 순서로 읽히게 했습니다.</p></div><div class="chart-grid"><div class="chart-card"><div class="chart-card-head"><div><h3>우선순위 랭킹</h3><p>상위 ${Math.min(8,all.length)}개 · 진단 규칙 priority 0–100</p></div></div><div class="chart" id="priorityChart"></div></div><div class="chart-card"><div class="chart-card-head"><div><h3>문제 분야 구성</h3><p>현재 발견 항목을 카테고리별로 집계</p></div></div><div class="chart" id="categoryChart"></div></div></div><div class="action-list" style="margin-top:14px">${top.length?top.map(actionCard).join(''):'<article class="action-card"><div class="action-score"><strong>0</strong><span>PRIORITY</span></div><div class="action-body"><h3>즉시 우선순위로 분류된 문제가 많지 않습니다.</h3><p>상세 진단과 공개 검사 범위를 확인해 주세요.</p></div></article>'}</div></section>
      <section class="report-section" id="matrix"><div class="section-head"><div><div class="section-kicker">03 · Thematic overview</div><h2>분야별 상태표</h2></div><p>문제 개수만 세지 않고 해당 분야의 최고 우선순위와 평균 우선순위를 같이 보여줍니다.</p></div><div class="matrix-card"><table class="matrix-table"><thead><tr><th>분야</th><th>발견</th><th>최고 우선순위</th><th>평균</th><th>상태</th></tr></thead><tbody>${cats.length?cats.map(x=>`<tr><td>${esc(x.category)}</td><td class="matrix-count">${x.count}</td><td><div class="matrix-bar" aria-label="최고 우선순위 ${x.max}"><i style="width:${Math.max(2,x.max)}%"></i></div></td><td>${x.avg}</td><td><span class="tag ${x.max>=85?'immediate':x.max>=65?'recommended':'reference'}">${x.max>=85?'즉시 수정':x.max>=65?'권장 수정':'참고'}</span></td></tr>`).join(''):'<tr><td colspan="5">발견 항목 없음</td></tr>'}</tbody></table></div></section>
      ${Object.keys(shots).length?`<section class="report-section" id="evidence"><div class="section-head"><div><div class="section-kicker">04 · Visual evidence</div><h2>실제 화면과 문제 위치</h2></div><p>요약보다 원본 화면을 먼저 검증할 수 있게 데스크톱을 크게, 모바일·주석 캡처를 나란히 배치했습니다.</p></div><div class="shots">${[['desktop','데스크톱 전체 캡처'],['mobile','모바일 전체 캡처'],['annotated','문제 위치 표시'],['improvement','개선 예시']].filter(([k])=>shots[k]).map(([k,l])=>`<a href="${esc(shots[k])}" target="_blank" rel="noopener"><img src="${esc(shots[k])}" alt="${l}" loading="lazy"><span>${l}</span></a>`).join('')}</div></section>`:''}
      <section class="report-section" id="details"><div class="section-head"><div><div class="section-kicker">05 · Findings</div><h2>상세 진단</h2></div><p>반복되는 설명을 접고 필요한 분야만 필터링할 수 있습니다. 각 항목은 근거 → 영향 → 수정 순서로 구성했습니다.</p></div><div class="detail-tools">${categoryOptions.map((c,i)=>`<button type="button" class="filter-chip ${i===0?'active':''}" data-filter="${esc(c)}">${esc(c)}</button>`).join('')}</div><div class="details">${all.map((x,i)=>`<details class="detail" data-category="${esc(x.category||'기타')}" ${i<3?'open':''}><summary><span class="detail-priority">${Math.round(Number(x.priority)||0)}</span><span class="detail-title"><b>${esc(x.title)}</b><small>${esc(x.category)} · ${priorityLabel(x)} · ${esc(x.confidence)}</small></span></summary><div class="detail-grid"><div><b>실제 근거</b>${esc(x.evidence)}</div><div><b>사용자 영향</b>${esc(x.userImpact)}</div><div><b>사업 영향</b>${esc(x.businessImpact)}</div><div><b>개선 방법</b>${esc(x.improvement)}</div><div><b>수정 난이도</b>${esc(difficulty(x))}</div><div><b>재개발 판단</b>${esc(x.redevelopment)}</div>${Array.isArray(x.locations)&&x.locations.length?`<div class="detail-locations"><b>문제 위치</b>${x.locations.slice(0,12).map(v=>`<code>${esc(v)}</code>`).join('')}</div>`:''}</div></details>`).join('')}</div></section>
      <section class="report-section" id="next"><div class="section-head"><div><div class="section-kicker">06 · Next step</div><h2>결과를 이어서 확인하기</h2></div><p>진단 결과를 보존하거나 공개 페이지 밖의 실제 사용자 흐름까지 직접 확인합니다.</p></div><div class="forms"><form class="formbox" id="mailForm"><h3>이메일로 결과 받기</h3><p>현재 결과 링크와 핵심 문제를 이메일로 보내드립니다.</p><input type="email" name="email" required placeholder="you@example.com" aria-label="결과를 받을 이메일"><label class="check"><input type="checkbox" name="marketing"> SuaveForge 개선 사례 및 서비스 안내도 이메일로 받겠습니다.</label><button type="submit">리포트 받기</button><p class="status"></p></form><form class="formbox" id="consultForm"><h3>무료로 직접 봐달라고 하기</h3><p>로그인·예약·결제·관리자처럼 외부에서 확인할 수 없는 영역은 직접 사용해보고 가장 큰 문제를 찾습니다.</p><input name="name" placeholder="이름 / 회사명" aria-label="이름 또는 회사명"><input name="email" type="email" placeholder="이메일" aria-label="이메일"><input name="phone" placeholder="연락처" aria-label="연락처"><textarea name="message" rows="4" placeholder="특히 확인했으면 하는 흐름이 있다면 적어주세요." aria-label="확인 요청 내용"></textarea><button type="submit">무료 컨설팅 요청</button><p class="status"></p></form></div></section>`;
    wire();wireFilters();initCharts(all,cats,[['Performance',perf],['SEO',seo],['Accessibility',a11y]]);
  }

  function wireFilters(){
    const chips=[...document.querySelectorAll('.filter-chip')],rows=[...document.querySelectorAll('.detail')];
    chips.forEach(chip=>chip.addEventListener('click',()=>{chips.forEach(x=>x.classList.toggle('active',x===chip));const f=chip.dataset.filter;rows.forEach(row=>{row.hidden=f!=='전체'&&row.dataset.category!==f})}));
  }

  function disposeCharts(){for(const c of charts){try{c.dispose()}catch{}}charts=[]}
  function waitEcharts(limit=30){return new Promise(resolve=>{let n=0;const tick=()=>{if(window.echarts)return resolve(window.echarts);if(++n>=limit)return resolve(null);setTimeout(tick,100)};tick()})}
  async function initCharts(all,cats,scores){
    disposeCharts();const ech=await waitEcharts();
    if(!ech){document.querySelectorAll('.score-gauge').forEach(el=>{el.textContent=el.dataset.score?`${Math.round(Number(el.dataset.score))}`:'N/A'});document.querySelectorAll('.chart').forEach(el=>el.innerHTML='<div class="chart-empty">차트 라이브러리를 불러오지 못했습니다. 아래 표와 상세 결과는 그대로 확인할 수 있습니다.</div>');return}
    const gaugeColor=v=>v===null?'#c9c5bd':v>=90?'#14804a':v>=50?'#d58a13':'#e43f3a';
    document.querySelectorAll('.score-gauge').forEach((el,i)=>{const v=scores[i][1],chart=ech.init(el);charts.push(chart);chart.setOption({animationDuration:700,series:[{type:'gauge',startAngle:220,endAngle:-40,min:0,max:100,radius:'94%',center:['50%','54%'],pointer:{show:false},progress:{show:true,roundCap:true,width:9,itemStyle:{color:gaugeColor(v)}},axisLine:{lineStyle:{width:9,color:[[1,'#ece8e1']]}},axisTick:{show:false},splitLine:{show:false},axisLabel:{show:false},anchor:{show:false},detail:{valueAnimation:true,offsetCenter:[0,'5%'],fontSize:29,fontWeight:900,color:'#111318',formatter:()=>v===null?'N/A':Math.round(v)},title:{show:false},data:[{value:v??0}]}]})});
    const ranked=[...all].sort((a,b)=>(Number(b.priority)||0)-(Number(a.priority)||0)).slice(0,8).reverse(),pc=document.getElementById('priorityChart');
    if(pc){const chart=ech.init(pc);charts.push(chart);chart.setOption({animationDuration:750,grid:{left:8,right:28,top:14,bottom:8,containLabel:true},tooltip:{trigger:'axis',axisPointer:{type:'shadow'},backgroundColor:'#111318',borderWidth:0,textStyle:{color:'#fff',fontSize:11},formatter:p=>{const x=p?.[0];return x?`<b>${esc(ranked[x.dataIndex]?.title||'')}</b><br/>우선순위 ${x.value}`:''}},xAxis:{type:'value',min:0,max:100,splitNumber:4,axisLabel:{color:'#8a8f98',fontSize:9},splitLine:{lineStyle:{color:'#ece9e3'}}},yAxis:{type:'category',data:ranked.map(x=>short(x.title)),axisTick:{show:false},axisLine:{show:false},axisLabel:{color:'#3d434c',fontSize:10,width:190,overflow:'truncate'}},series:[{type:'bar',data:ranked.map(x=>Number(x.priority)||0),barWidth:12,itemStyle:{borderRadius:[0,6,6,0],color:p=>p.value>=85?'#e43f3a':p.value>=65?'#d58a13':'#2764d7'},label:{show:true,position:'right',fontSize:9,fontWeight:800,color:'#555b65'}}]})}
    const cc=document.getElementById('categoryChart');if(cc){const chart=ech.init(cc);charts.push(chart);chart.setOption({animationDuration:800,tooltip:{trigger:'item',backgroundColor:'#111318',borderWidth:0,textStyle:{color:'#fff',fontSize:11},formatter:'{b}<br/>{c}건 · {d}%'},legend:{bottom:0,left:'center',itemWidth:8,itemHeight:8,textStyle:{color:'#626873',fontSize:9}},series:[{type:'pie',radius:['48%','72%'],center:['50%','43%'],avoidLabelOverlap:true,itemStyle:{borderColor:'#fff',borderWidth:3,borderRadius:5},label:{show:false},emphasis:{scale:true,scaleSize:5},data:cats.map(x=>({name:x.category,value:x.count}))}]})}
    const resize=()=>charts.forEach(c=>{try{c.resize()}catch{}});window.addEventListener('resize',resize,{passive:true});
  }

  function wire(){
    const cf=document.getElementById('consultForm');let ctaTracked=false;const trackConsult=()=>{if(ctaTracked)return;ctaTracked=true;a.event('consultation_cta_clicked',{diagnosisId:id})};cf.addEventListener('focusin',trackConsult,{once:true});cf.addEventListener('click',trackConsult,{once:true});
    document.getElementById('mailForm').addEventListener('submit',async e=>{e.preventDefault();const f=e.currentTarget,s=f.querySelector('.status'),email=f.email.value.trim();s.textContent='발송 중…';const r=await fetch(a.API+'/api/v1/diagnoses/'+id+'/email',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'include',body:JSON.stringify({email,marketingConsent:f.marketing.checked})}),b=await r.json();s.textContent=b.status==='sent'?'이메일을 발송했습니다.':b.status==='pending'?'진단 완료 후 자동 발송합니다.':b.message||b.error||'메일 발송 상태를 확인해 주세요.'});
    document.getElementById('consultForm').addEventListener('submit',async e=>{e.preventDefault();const f=e.currentTarget,s=f.querySelector('.status'),data=Object.fromEntries(new FormData(f));if(!data.email&&!data.phone){s.textContent='이메일 또는 연락처 중 하나는 입력해 주세요.';return}s.textContent='접수 중…';const r=await fetch(a.API+'/api/v1/consultations',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'include',body:JSON.stringify({...a.touch,...data,diagnosisId:id})});s.textContent=r.ok?'접수했습니다. 확인 후 직접 연락드리겠습니다.':'접수하지 못했습니다. 잠시 후 다시 시도해 주세요.'})
  }
  load();
})();
