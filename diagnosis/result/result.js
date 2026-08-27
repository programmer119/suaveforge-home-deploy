(()=>{
  const main=document.getElementById('main'),id=new URLSearchParams(location.search).get('id'),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),a=window.SF_ANALYTICS;
  if(!id){main.innerHTML='<div class="loading">진단 ID가 없습니다.</div>';return}

  const stages=[
    {key:'prepare',label:'검사 환경 준비',sub:'URL 안전 확인 · Chromium 준비',match:['queued','prepare','browser']},
    {key:'desktop',label:'데스크톱 실제 로딩',sub:'1440px 렌더링 · 실행 오류 감지',match:['desktop']},
    {key:'seo',label:'SEO · AEO · GEO 확인',sub:'메타 · 답변 구조 · 엔티티 · AI 접근성',match:['seo']},
    {key:'accessibility',label:'접근성 검사',sub:'axe-core 자동 규칙 검사',match:['accessibility']},
    {key:'performance',label:'성능·리소스 수집',sub:'로딩 타이밍 · 전송량 · 화면 증거',match:['performance','desktop_capture']},
    {key:'mobile',label:'모바일 UX 재현',sub:'390×844 · 터치 · 폼 · CTA · 넘침',match:['mobile','mobile_ux','evidence']},
    {key:'security',label:'기본 보안 신호',sub:'HTTPS · 헤더 · 혼합 콘텐츠',match:['security']},
    {key:'lighthouse',label:'Lighthouse 교차 측정',sub:'Performance · SEO · Accessibility',match:['lighthouse']},
    {key:'finalize',label:'결과 우선순위 정리',sub:'근거 기반 Top 3 구성',match:['finalize','completed']}
  ];
  const signalDefs=[['desktop','DESKTOP','1440px'],['mobile','MOBILE','390×844'],['seo','SEO','STRUCTURE'],['accessibility','A11Y','AXE'],['security','SECURITY','HEADERS'],['lighthouse','LIGHTHOUSE','LAB']];
  const stageOrder={queued:0,prepare:0,browser:0,desktop:1,seo:2,accessibility:3,performance:4,desktop_capture:4,mobile:5,mobile_ux:5,evidence:5,security:6,lighthouse:7,finalize:8,completed:9,failed:9};
  let viewed=false,lastData=null,ticker=null,charts=[],liveProgressChart=null,liveTraceChart=null,liveSamples=[],liveStageKey='',liveMotionReady=false,findingState=[];

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
      <div class="audit-kicker"><span class="live-dot"></span><span>LIVE DIAGNOSIS</span><span class="audit-id">#${esc(id.slice(0,8))}</span></div>
      <div class="audit-grid">
        <div class="audit-visual">
          <div class="audit-command">
            <div class="audit-copy">
              <div class="audit-state-line"><span class="state-pulse"></span><b id="stageBadge">ENGINE START</b><span id="stageCounter">01 / ${String(stages.length).padStart(2,'0')}</span></div>
              <h1 id="progressTitle">진단 엔진을 준비하고 있습니다.</h1>
              <p id="progressDetail">실제 브라우저 검사 상태를 불러오는 중입니다.</p>
              <div class="audit-meta"><span id="elapsedText">경과 0초</span><span id="estimateText">서버 활동 확인 중</span></div>
            </div>
            <div class="audit-progress-stack">
              <div class="audit-orbit" aria-hidden="true"><div id="liveProgressChart" class="live-progress-chart"></div><div class="orbit-core"><strong id="progressNumber">0</strong><span>%</span></div></div>
              <span>OVERALL PROGRESS</span>
            </div>
          </div>

          <div class="audit-telemetry">
            <div class="telemetry-head"><div><span class="telemetry-kicker">LIVE TRACE</span><b>실시간 진단 진행 신호</b></div><code id="targetHost">target</code></div>
            <div class="telemetry-grid">
              <div class="trace-panel"><div id="liveTraceChart" class="live-trace-chart" aria-label="진단 진행률 실시간 추적 차트"></div></div>
              <div class="scan-stage" aria-hidden="true">
                <div class="browser-frame">
                  <div class="browser-top"><i></i><i></i><i></i><span id="browserTarget">target</span><em>HEADLESS CHROMIUM</em></div>
                  <div class="browser-body">
                    <div class="scan-beam"></div>
                    <div class="scan-cursor"></div>
                    <div class="skeleton s1"></div><div class="skeleton s2"></div><div class="skeleton s3"></div><div class="skeleton s4"></div>
                    <svg class="packet-map" viewBox="0 0 420 160" preserveAspectRatio="none"><path id="packetPath" d="M18,122 C72,30 142,150 205,70 C268,-8 324,108 402,30"/><circle class="data-packet packet-a" r="4"/><circle class="data-packet packet-b" r="3.5"/><circle class="data-packet packet-c" r="3"/></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="signal-row signal-row--dark">${signalDefs.map(([k,l,v])=>`<div class="signal" data-signal="${k}"><span></span><div><b>${l}</b><small>${v}</small></div><em>대기</em></div>`).join('')}</div>
        </div>

        <aside class="audit-pipeline">
          <div class="pipeline-head"><div><span>PIPELINE</span><b>검사 실행 흐름</b></div><strong><span id="currentStepNo">01</span><small>/${String(stages.length).padStart(2,'0')}</small></strong></div>
          <div class="audit-steps">${stages.map((s,i)=>`<div class="audit-step" data-step="${i}"><span class="step-no">${String(i+1).padStart(2,'0')}</span><span class="step-mark"></span><div><b>${s.label}</b><small>${s.sub}</small></div><em></em></div>`).join('')}</div>
          <div class="pipeline-foot"><span class="pipeline-led"></span><div><b id="pipelineState">대기열 확인 중</b><small>실제 서버 상태 기반 · 가짜 타이머 없음</small></div></div>
        </aside>
      </div>
      <div class="audit-rail"><div id="progressBar"></div></div>
      <p class="audit-note">실제 서버 단계·진행률·마지막 활동 신호를 반영합니다. 화면을 새로고침하지 않아도 자동으로 갱신됩니다.</p>
    </section>`;
    initLiveMotion();
  }

  function initLiveMotion(){
    if(liveMotionReady)return;liveMotionReady=true;
    if(window.gsap){
      try{
        if(window.MotionPathPlugin)window.gsap.registerPlugin(window.MotionPathPlugin);
        window.gsap.from('.audit-grid',{opacity:0,y:14,scale:.995,duration:.72,ease:'power3.out'});
        window.gsap.from('.signal-row .signal',{opacity:0,y:8,duration:.5,ease:'power2.out',stagger:.045,delay:.18});
        if(window.MotionPathPlugin){
          [['.packet-a',4.6,0],['.packet-b',5.8,.9],['.packet-c',7.2,1.8]].forEach(([sel,dur,delay])=>window.gsap.to(sel,{duration:dur,repeat:-1,ease:'none',delay,motionPath:{path:'#packetPath',align:'#packetPath',alignOrigin:[.5,.5]}}));
        }
        window.gsap.to('.scan-cursor',{x:'+=22',opacity:.35,duration:1.1,yoyo:true,repeat:-1,ease:'sine.inOut'});
      }catch{}
    }
  }

  function animateStageTitle(stageKey){
    if(stageKey===liveStageKey)return;liveStageKey=stageKey;
    const title=document.getElementById('progressTitle'),detail=document.getElementById('progressDetail');
    if(!title||!window.gsap)return;
    try{
      if(window.SplitType){
        const split=new window.SplitType(title,{types:'words'});
        window.gsap.from(split.words,{opacity:0,y:14,filter:'blur(5px)',duration:.48,stagger:.035,ease:'power3.out',onComplete:()=>split.revert()});
      }else window.gsap.fromTo(title,{opacity:.35,y:8},{opacity:1,y:0,duration:.42,ease:'power3.out'});
      if(detail)window.gsap.fromTo(detail,{opacity:.35,y:5},{opacity:1,y:0,duration:.48,ease:'power2.out'});
      const active=main.querySelector('.audit-step.active');if(active)window.gsap.fromTo(active,{x:4},{x:0,duration:.38,ease:'power2.out'});
    }catch{}
  }

  function renderLiveTelemetry(pct,current,d){
    const ech=window.echarts,progressEl=document.getElementById('liveProgressChart'),traceEl=document.getElementById('liveTraceChart');
    if(ech&&progressEl){
      try{
        if(!liveProgressChart){liveProgressChart=ech.init(progressEl);main.querySelector('.audit-orbit')?.classList.add('echarts-ready')}
        liveProgressChart.setOption({animationDurationUpdate:520,series:[{type:'gauge',startAngle:220,endAngle:-40,min:0,max:100,center:['50%','50%'],radius:'96%',progress:{show:true,width:7,roundCap:true,itemStyle:{color:'#ff4f47',shadowBlur:16,shadowColor:'rgba(255,79,71,.42)'}},axisLine:{lineStyle:{width:7,color:[[1,'#29303a']]}},pointer:{show:false},axisTick:{show:false},splitLine:{show:false},axisLabel:{show:false},anchor:{show:false},title:{show:false},detail:{show:false},data:[{value:pct}]}]},{lazyUpdate:true});
      }catch{}
    }
    const started=Date.parse(d.started_at||d.created_at||Date.now()),elapsed=Math.max(0,Math.round((Date.now()-started)/1000)),last=liveSamples[liveSamples.length-1];
    if(!last||last.pct!==pct||elapsed-last.t>=2){liveSamples.push({t:elapsed,pct,stage:current});if(liveSamples.length>72)liveSamples.shift()}
    if(ech&&traceEl){
      try{
        if(!liveTraceChart)liveTraceChart=ech.init(traceEl);
        const data=liveSamples.map(x=>[x.t,x.pct]);
        liveTraceChart.setOption({animationDurationUpdate:420,grid:{left:6,right:8,top:15,bottom:18,containLabel:true},tooltip:{trigger:'axis',backgroundColor:'rgba(8,11,16,.96)',borderColor:'#394352',borderWidth:1,textStyle:{color:'#fff',fontSize:12},formatter:p=>p?.[0]?`경과 ${p[0].value[0]}초 · 진행 ${p[0].value[1]}%`:''},xAxis:{type:'value',min:Math.max(0,(data.at(-1)?.[0]||0)-90),max:Math.max(30,data.at(-1)?.[0]||30),axisLabel:{color:'#647080',fontSize:11,formatter:v=>`${v}s`},axisLine:{show:false},axisTick:{show:false},splitLine:{show:false}},yAxis:{type:'value',min:0,max:100,interval:25,axisLabel:{color:'#596473',fontSize:11,formatter:v=>`${v}%`},axisLine:{show:false},axisTick:{show:false},splitLine:{lineStyle:{color:'rgba(255,255,255,.055)'}}},series:[{type:'line',data,smooth:.28,showSymbol:false,lineStyle:{width:2,color:'#ff5a51',shadowBlur:12,shadowColor:'rgba(255,90,81,.35)'},areaStyle:{color:new ech.graphic.LinearGradient(0,0,0,1,[{offset:0,color:'rgba(255,82,74,.22)'},{offset:1,color:'rgba(255,82,74,0)'}])},markPoint:{symbol:'circle',symbolSize:9,label:{show:false},itemStyle:{color:'#fff',borderColor:'#ff5a51',borderWidth:3},data:data.length?[{coord:data.at(-1)}]:[]}}]},{lazyUpdate:true});
      }catch{}
    }
  }

  function disposeLiveTelemetry(){
    try{liveProgressChart?.dispose()}catch{};try{liveTraceChart?.dispose()}catch{};
    liveProgressChart=null;liveTraceChart=null;liveSamples=[];liveStageKey='';liveMotionReady=false;
  }

  function updateClock(){
    if(!lastData||!main.querySelector('.audit-live'))return;
    const start=Date.parse(lastData.started_at||lastData.created_at||Date.now()),elapsed=Date.now()-start,el=document.getElementById('elapsedText'),et=document.getElementById('estimateText');
    if(el)el.textContent=`경과 ${fmtSec(elapsed)}초`;
    if(et){const last=Date.parse(lastData.last_progress_at||lastData.started_at||Date.now()),idle=Math.max(0,Date.now()-last);if(idle<5000)et.textContent='서버 활동 정상 · 방금 진행 신호 수신';else if(idle<30000)et.textContent=`현재 단계 처리 중 · 마지막 활동 ${fmtSec(idle)}초 전`;else et.textContent=`현재 단계 장기 처리 중 · 마지막 활동 ${fmtSec(idle)}초 전`}
  }

  function renderProgress(d){
    lastData=d;progressShell();const current=d.progress_stage||d.status||'queued',cur=stageOrder[current]??0,pct=Math.max(2,Math.min(99,Number(d.progress_percent)||2)),idx=Math.min(stages.length-1,cur),stage=stages[idx];
    const numEl=document.getElementById('progressNumber'),oldPct=Number(numEl?.textContent)||0;
    if(numEl&&window.gsap){try{const state={v:oldPct};window.gsap.to(state,{v:pct,duration:.55,ease:'power2.out',onUpdate:()=>{numEl.textContent=String(Math.round(state.v))}})}catch{numEl.textContent=String(pct)}}else if(numEl)numEl.textContent=String(pct);
    const orbit=main.querySelector('.audit-orbit');if(orbit)orbit.style.setProperty('--angle',(pct*3.6)+'deg');
    const title=document.getElementById('progressTitle'),detail=document.getElementById('progressDetail');
    if(title)title.textContent=d.status==='queued'?'진단 대기열에 등록되었습니다.':stage.label+' 중입니다.';if(detail)detail.textContent=d.progress_detail||stage.sub;
    const bar=document.getElementById('progressBar');if(bar)bar.style.width=pct+'%';
    const host=d.hostname||'대상 사이트';document.getElementById('targetHost').textContent=host;document.getElementById('browserTarget').textContent=host;
    document.getElementById('stageBadge').textContent=stage.key.toUpperCase().replaceAll('_',' ');document.getElementById('stageCounter').textContent=`${String(idx+1).padStart(2,'0')} / ${String(stages.length).padStart(2,'0')}`;document.getElementById('currentStepNo').textContent=String(idx+1).padStart(2,'0');
    main.querySelectorAll('.audit-step').forEach((el,i)=>{el.classList.toggle('done',i<cur);el.classList.toggle('active',i===idx&&d.status!=='queued');const em=el.querySelector('em');if(em)em.textContent=i<cur?'완료':i===idx?(d.status==='queued'?'대기':'진행 중'):'대기'});
    main.querySelectorAll('.signal').forEach(el=>{const s=statusFor(el.dataset.signal,current,d.status),em=el.querySelector('em');el.className='signal '+s;if(em)em.textContent=s==='done'?'완료':s==='active'?'검사 중':'대기'});
    const state=document.getElementById('pipelineState');if(state)state.textContent=d.status==='queued'?'실행 슬롯 대기 중':`${stage.label} · 서버 처리 중`;
    renderLiveTelemetry(pct,current,d);animateStageTitle(current);updateClock();if(!ticker)ticker=setInterval(updateClock,1000);
  }

  async function load(){
    try{
      const r=await fetch(a.API+'/api/v1/diagnoses/'+encodeURIComponent(id),{credentials:'include'}),d=await r.json();if(!r.ok)throw new Error(d.error||'결과를 찾지 못했습니다.');
      if(['queued','running'].includes(d.status)){renderProgress(d);setTimeout(load,1200);return}if(ticker){clearInterval(ticker);ticker=null}
      if(d.status==='failed'){disposeLiveTelemetry();
        const stageKey=d.error_stage||'unknown',stageInfo=stages.find(x=>x.match.includes(stageKey)||x.key===stageKey),stageLabel=stageInfo?.label||stageKey;
        main.innerHTML=`<section class="failure-view"><div class="eyebrow">DIAGNOSIS FAILED</div><h1>진단이 ${esc(stageLabel)} 단계에서 중단됐습니다.</h1><p class="failure-message">${esc(d.error_message||'대상 사이트 응답 또는 검사 환경을 확인해 주세요.')}</p><div class="failure-meta"><span><b>단계</b>${esc(stageKey)}</span><span><b>오류 코드</b>${esc(d.error_code||'DIAGNOSIS_FAILED')}</span><span><b>진단 ID</b>${esc(id)}</span></div><p class="failure-help">이 화면의 단계·오류 코드·진단 ID를 그대로 전달하면 서버 로그와 바로 대조할 수 있습니다.</p><a class="btn" href="../">다시 진단하기</a></section>`;return
      }
      disposeLiveTelemetry();render(d);if(!viewed){viewed=true;a.event('result_viewed',{diagnosisId:id})}
    }catch(e){main.innerHTML='<div class="loading">'+esc(e.message||e)+'</div>'}
  }

  function categoryRows(all){
    const m=new Map();for(const x of all){const k=String(x.category||'기타'),p=Number(x.priority)||0,o=m.get(k)||{category:k,count:0,max:0,sum:0};o.count++;o.max=Math.max(o.max,p);o.sum+=p;m.set(k,o)}
    return [...m.values()].map(x=>({...x,avg:Math.round(x.sum/x.count)})).sort((a,b)=>b.max-a.max||b.count-a.count);
  }

  function metricTile(key,label,value,help){const [state,klass]=metricState(key,value);return `<div class="metric-tile"><div class="metric-top"><span class="metric-name">${label}</span><span class="metric-status ${klass}">${state}</span></div><strong class="metric-value">${metricValue(key,value)}</strong><span class="metric-help">${help}</span></div>`}

  function actionCard(x){
    const p=Math.max(0,Math.min(100,Number(x.priority)||0));
    return `<article class="action-card" ${Number.isInteger(x._index)&&x._index>=0?`data-jump-finding="${x._index}"`:``}><div class="action-score"><strong>${p}</strong><span>PRIORITY</span></div><div class="action-body"><div class="action-meta"><span class="tag ${priorityClass(x)}">${priorityLabel(x)}</span><span class="tag category">${esc(x.category)}</span><span class="tag confidence">${esc(x.confidence)}</span></div><h3>${esc(x.title)}</h3><p>${esc(x.userImpact)}</p><div class="action-evidence"><div><b>Evidence</b>${esc(x.evidence)}</div><div><b>Recommended fix</b>${esc(x.improvement)}</div></div>${locations(x)}<div class="difficulty-line"><span>수정 난이도</span><b>${esc(difficulty(x))}</b><span>· 시간은 원인/코드 범위 확인 후 산정</span></div></div></article>`;
  }

  function render(d){
    const top=d.top_issues||[],all=d.findings||[],shots=d.screenshots||{},summary=d.summary?.conclusion||'공개 페이지 검사 결과를 정리했습니다.',m=d.metrics||{},lh=m.lighthouse||{},warnings=m.warnings||[],cats=categoryRows(all);
    const perf=score(lh.performance),seo=score(lh.seo),a11y=score(lh.accessibility),immediate=all.filter(x=>Number(x.priority)>=85).length,recommended=all.filter(x=>Number(x.priority)>=65&&Number(x.priority)<85).length,runtimeErrors=(Number(m.runtime?.consoleErrors)||0)+(Number(m.runtime?.requestErrors)||0),processing=d.processing_time_ms?Math.round(Number(d.processing_time_ms)/100)/10:null;
    const aeo=m.aeo||{},geo=m.geo||{},seoFacts=m.seo||{};
    const categoryOptions=['전체',...cats.map(x=>x.category)];
    const signalRow=(label,value,state='neutral')=>`<div class="discovery-signal ${state}"><span>${esc(label)}</span><b>${esc(value)}</b><i></i></div>`;
    const discoveryCard=(kind,title,lead,rows,badge)=>`<article class="discovery-card discovery-${kind}"><div class="discovery-card-head"><div><span>${kind.toUpperCase()}</span><h3>${esc(title)}</h3></div><strong>${esc(badge)}</strong></div><p>${esc(lead)}</p><div class="discovery-signals">${rows.join('')}</div></article>`;
    const seoRows=[
      signalRow('Title',seoFacts.title?'있음':'없음',seoFacts.title?'pass':'warn'),
      signalRow('Description',seoFacts.description?'있음':'없음',seoFacts.description?'pass':'warn'),
      signalRow('Canonical',seoFacts.canonical?'있음':'없음',seoFacts.canonical?'pass':'warn'),
      signalRow('Indexability',seoFacts.indexBlocked?'차단':'허용',seoFacts.indexBlocked?'bad':'pass'),
      signalRow('Sitemap',seoFacts.sitemap?.exists?'확인':'없음',seoFacts.sitemap?.exists?'pass':'neutral'),
      signalRow('H1 / lang',`${seoFacts.h1??0} / ${seoFacts.lang||'없음'}`,(seoFacts.h1??0)>0&&seoFacts.lang?'pass':'warn')
    ];
    const aeoQuestionCount=Number(aeo.questionHeadings)||0,aeoAnswerCount=Number(aeo.answerReadyPairs)||0;
    const aeoRows=[
      signalRow('질문 → 직접답변',`${aeoAnswerCount}/${aeoQuestionCount}`,aeoQuestionCount===0?'neutral':aeoAnswerCount===aeoQuestionCount?'pass':'warn'),
      signalRow('FAQ / QA / HowTo schema',[aeo.faqSchema?'FAQ':'',aeo.qaSchema?'QA':'',aeo.howToSchema?'HowTo':''].filter(Boolean).join(' · ')||'선택 신호',[aeo.faqSchema,aeo.qaSchema,aeo.howToSchema].some(Boolean)?'pass':'neutral'),
      signalRow('간결 답변 문단',`${Number(aeo.conciseParagraphs)||0}개`,Number(aeo.conciseParagraphs)>0?'pass':'neutral'),
      signalRow('목록 / 표',`${Number(aeo.listCount)||0} / ${Number(aeo.tableCount)||0}`,(Number(aeo.listCount)||0)+(Number(aeo.tableCount)||0)>0?'pass':'neutral')
    ];
    const geoRows=[
      signalRow('엔티티 schema',`${Number(geo.entitySchemaCount)||0}개`,Number(geo.entitySchemaCount)>0?'pass':'warn'),
      signalRow('AI crawler 차단',Array.isArray(geo.aiCrawlerBlocks)&&geo.aiCrawlerBlocks.length?geo.aiCrawlerBlocks.join(', '):'감지 없음',Array.isArray(geo.aiCrawlerBlocks)&&geo.aiCrawlerBlocks.length?'bad':'pass'),
      signalRow('출처 / 발행 신호',geo.articleSchema?`${geo.authorSignal?'author ✓':'author —'} · ${geo.publisherSignal?'publisher ✓':'publisher —'} · ${geo.dateSignal?'date ✓':'date —'}`:'현재 페이지 유형상 비필수',geo.articleSchema?(geo.authorSignal&&geo.publisherSignal&&geo.dateSignal?'pass':'warn'):'neutral'),
      signalRow('sameAs / 외부 근거',`${Number(geo.sameAsCount)||0} / ${Number(geo.citationLinks)||0}`,Number(geo.sameAsCount)>0||Number(geo.citationLinks)>0?'pass':'neutral'),
      signalRow('llms.txt',geo.llmsTxt?.exists?'제공됨':'선택 신호 · 없음',geo.llmsTxt?.exists?'pass':'neutral')
    ];
    const scoreLegend=(label,value,color)=>{const [state]=scoreState(value);return `<div class="score-key"><div><i style="background:${color}"></i><b>${label}</b></div><small>${value===null?'N/A':Math.round(value)} · ${state}</small></div>`};
    const vital=(key,label,value,help,good,needs,poor)=>{const [state,klass]=metricState(key,value);return `<article class="vital-card" data-vital="${key}" data-tippy-content="${esc(help)} · 기준: 좋음 ${esc(good)}, 개선 필요 ${esc(needs)}, 나쁨 ${esc(poor)}"><div class="vital-top"><span class="vital-name metric-help-tip">${label}</span><strong class="vital-value">${metricValue(key,value)}</strong><span class="vital-state ${klass}">${state}</span></div><div class="vital-chart" id="vital-${key}"></div><div class="vital-foot"><span>GOOD</span><span>NEEDS IMPROVEMENT</span><span>POOR</span></div></article>`};
    main.innerHTML=`
      <section class="result-head report-reveal"><div><div class="eyebrow">DIAGNOSIS RESULT · EVIDENCE-BASED</div><h1>${esc(d.site_title||d.hostname)}</h1><p class="result-url"><span>${esc(d.normalized_url)}</span>${processing!==null?`<span class="dot">•</span><span>완료 ${processing}초</span>`:''}<span class="dot">•</span><span>#${esc(id.slice(0,8))}</span></p></div><div class="result-head-side"><b class="count-up" data-value="${all.length}">${all.length}</b><span>발견 항목</span></div></section>
      <section class="executive report-reveal"><div class="executive-inner"><div class="executive-copy"><div class="eyebrow">EXECUTIVE SUMMARY</div><h2>${esc(summary)}</h2><p>점수보다 먼저 실제 증거와 영향도를 봅니다. 아래 시각화는 진단에서 수집된 값만 사용하며, 임의 점수나 고정 시간 견적을 만들지 않습니다.</p></div><div class="executive-stats"><div class="executive-stat is-alert"><b class="count-up" data-value="${immediate}">${immediate}</b><span>Immediate</span></div><div class="executive-stat"><b class="count-up" data-value="${recommended}">${recommended}</b><span>Recommended</span></div><div class="executive-stat ${runtimeErrors?'is-alert':'is-ok'}"><b class="count-up" data-value="${runtimeErrors}">${runtimeErrors}</b><span>Runtime errors</span></div><div class="executive-stat"><b>${m.performance?.resourceCount??'—'}</b><span>Resources</span></div><div class="executive-stat"><b>${bytes(m.performance?.transferSize)}</b><span>Transfer</span></div><div class="executive-stat ${m.security?.mixedContent?'is-alert':'is-ok'}"><b>${m.security?.mixedContent??'—'}</b><span>Mixed content</span></div></div></div></section>
      <div class="report-nav-wrap"><nav class="report-nav" aria-label="진단 결과 바로가기"><a href="#scores">핵심 지표</a><a href="#discovery">SEO·AEO·GEO</a><a href="#priority">영향도 지도</a><a href="#matrix">분야별 상태</a>${Object.keys(shots).length?'<a href="#evidence">화면 증거</a>':''}<a href="#details">상세 진단</a><a href="#next">다음 단계</a></nav></div>
      ${warnings.length?`<section class="warning-strip report-reveal"><b>일부 보조 검사에 경고가 있습니다.</b>${warnings.map(w=>`<p><strong>${esc(w.stage||'검사')}</strong> · ${esc(w.code||'WARNING')} · ${esc(w.message||'원인 미상')}</p>`).join('')}</section>`:''}
      <section class="report-section report-reveal" id="scores"><div class="section-head"><div><div class="section-kicker">01 · Performance cockpit</div><h2>점수가 아니라 상태를 읽는 계기판</h2></div><p>GTmetrix의 Summary/Performance 구조처럼 점수와 Web Vitals를 한 화면에서 연결합니다. 각 수치는 hover하면 기준을 확인할 수 있습니다.</p></div><div class="metric-cockpit"><div class="score-orbit-panel"><div class="panel-label"><h3>Lighthouse score orbit</h3><span>0—100 / LAB</span></div><div id="scoreOrbitChart" class="score-orbit-chart"></div><div class="score-legend">${scoreLegend('Performance',perf,'#f2a01d')}${scoreLegend('SEO',seo,'#24b978')}${scoreLegend('Accessibility',a11y,'#54d7a2')}</div></div><div class="vitals-panel"><div class="vitals-head"><div><h3>Web Vitals lens</h3><p>각 값이 기준선의 어느 구간에 있는지 실제 측정 위치로 표시합니다.</p></div><span class="report-version">LAB METRICS</span></div><div class="vital-stack">${vital('lcp','LCP',lh.lcp,'가장 큰 콘텐츠가 보이는 시점','≤ 2.5s','2.5–4.0s','> 4.0s')}${vital('tbt','TBT',lh.tbt,'메인 스레드가 입력을 막은 누적 시간','≤ 200ms','200–600ms','> 600ms')}${vital('cls','CLS',lh.cls,'예상치 못한 레이아웃 이동량','≤ 0.10','0.10–0.25','> 0.25')}${vital('fcp','FCP',lh.fcp,'첫 콘텐츠가 화면에 그려지는 시점','≤ 1.8s','1.8–3.0s','> 3.0s')}</div></div></div></section>
      <section class="report-section report-reveal" id="discovery"><div class="section-head"><div><div class="section-kicker">02 · Search & answer visibility</div><h2>SEO · AEO · GEO를 따로 봅니다</h2></div><p>SEO의 Lighthouse 점수를 AEO/GEO 점수처럼 재활용하지 않습니다. 각 영역에서 실제로 확인한 신호만 보여주고, 미확인 항목은 억지 점수로 만들지 않습니다.</p></div><div class="discovery-grid">${discoveryCard('seo','검색 노출 기반','색인·문서 구조·검색 결과 메타데이터를 확인합니다.',seoRows,seo===null?'N/A':`${Math.round(seo)} / 100`)}${discoveryCard('aeo','답변 추출 준비도','질문과 직접 답변, 구조화된 설명 단위를 확인합니다.',aeoRows,`${aeoAnswerCount}/${aeoQuestionCount||'—'} DIRECT`)}${discoveryCard('geo','생성형 검색 해석 신호','엔티티·출처·AI 접근 정책을 확인합니다.',geoRows,`${Number(geo.entitySchemaCount)||0} ENTITY`)}</div></section>
      <section class="report-section report-reveal" id="priority"><div class="section-head"><div><div class="section-kicker">03 · Impact intelligence</div><h2>어디부터 고쳐야 하는지 한 번에</h2></div><p>단순 막대/도넛 대신 우선순위 랭킹과 문제 분포를 서로 연결했습니다. 차트의 항목을 클릭하면 해당 상세 진단으로 이동합니다.</p></div><div class="insight-grid"><div class="insight-card dark"><div class="insight-card-head"><div><h3>Priority impact rail</h3><p>상위 ${Math.min(8,all.length)}개 · 실제 rule priority · 고위험 항목은 pulse로 강조</p></div><span class="report-version">CLICK TO INSPECT</span></div><div class="impact-chart" id="impactChart"></div></div><div class="insight-card dark"><div class="insight-card-head"><div><h3>Issue constellation</h3><p>분야 × 우선순위 · 점 크기는 실제 문제 위치/증거 수에 따라 변합니다.</p></div><span class="report-version">HOVER · LINKED</span></div><div class="category-chart" id="issueMapChart"></div></div></div><aside class="issue-spotlight" id="issueSpotlight" aria-live="polite"><div class="issue-spotlight__pulse"></div><div><span>LINKED TRACE</span><strong>${esc(top[0]?.title||all[0]?.title||'진단 항목을 선택하세요')}</strong><p>${esc(top[0]?.evidence||all[0]?.evidence||'차트의 점·막대·노드를 hover하면 관련 근거와 상세 진단이 연결됩니다.')}</p></div><b>${Math.round(Number(top[0]?.priority||all[0]?.priority)||0)}</b></aside><div class="action-list">${top.length?top.map(x=>actionCard({...x,_index:all.findIndex(y=>y.title===x.title&&y.category===x.category)})).join(''):'<article class="action-card"><div class="action-score"><strong>0</strong><span>PRIORITY</span></div><div class="action-body"><h3>즉시 우선순위로 분류된 문제가 많지 않습니다.</h3><p>상세 진단과 공개 검사 범위를 확인해 주세요.</p></div></article>'}</div></section>
      <section class="report-section report-reveal" id="matrix"><div class="section-head"><div><div class="section-kicker">04 · Thematic topology</div><h2>분야별 상태와 영향 밀도</h2></div><p>카테고리별 건수·최고 우선순위·평균 우선순위를 동시에 읽습니다. 발견 수가 적으면 억지 force graph 대신 탐지 → 영향 → 수정 계층 trace로 전환합니다.</p></div><div class="insight-card dark" style="margin-bottom:14px"><div class="insight-card-head"><div><h3>${all.length<=3?'Impact trace route':'Category signal galaxy'}</h3><p>${all.length<=3?'발견 1~3건 · 탐지 → 영향 → 실제 수정 계층을 하나의 경로로 연결합니다.':'중심=분야 · 바깥 링=대표 이슈 · 크기와 색으로 영향 강도를 동시에 보여줍니다.'}</p></div><span class="report-version">${all.length<=3?'HOVER · TRACE · CLICK':'DRAG · HOVER · CLICK'}</span></div><div class="chart" id="categoryTreemap"></div></div><div class="matrix-card"><table class="matrix-table"><thead><tr><th>분야</th><th>발견</th><th>최고 우선순위</th><th>평균</th><th>상태</th></tr></thead><tbody>${cats.length?cats.map(x=>`<tr data-category-row="${esc(x.category)}"><td>${esc(x.category)}</td><td class="matrix-count">${x.count}</td><td><div class="matrix-bar" aria-label="최고 우선순위 ${x.max}"><i style="width:${Math.max(2,x.max)}%"></i></div></td><td>${x.avg}</td><td><span class="tag ${x.max>=85?'immediate':x.max>=65?'recommended':'reference'}">${x.max>=85?'즉시 수정':x.max>=65?'권장 수정':'참고'}</span></td></tr>`).join(''):'<tr><td colspan="5">발견 항목 없음</td></tr>'}</tbody></table></div></section>
      ${Object.keys(shots).length?`<section class="report-section report-reveal" id="evidence"><div class="section-head"><div><div class="section-kicker">05 · Visual evidence</div><h2>실제 화면을 filmstrip처럼 검증</h2></div><p>정적인 썸네일 나열이 아니라 drag·wheel·keyboard로 탐색하는 증거 스트립입니다. 각 프레임은 원본으로 바로 열립니다.</p></div><div class="evidence-shell"><div class="evidence-toolbar"><h3>Captured evidence</h3><span>DRAG · WHEEL · KEYBOARD · OPEN ORIGINAL</span></div><div class="swiper evidence-swiper"><div class="swiper-wrapper">${[['desktop','데스크톱 전체 캡처'],['mobile','모바일 전체 캡처'],['annotated','문제 위치 표시'],['improvement','개선 예시']].filter(([k])=>shots[k]).map(([k,l],i)=>`<div class="swiper-slide"><a href="${esc(shots[k])}" target="_blank" rel="noopener" class="evidence-shot" data-evidence-index="${i}"><img src="${esc(shots[k])}" alt="${l}" loading="lazy"><span>${l}</span></a></div>`).join('')}</div><div class="swiper-scrollbar"></div></div></div></section>`:''}
      <section class="report-section report-reveal" id="details"><div class="section-head"><div><div class="section-kicker">06 · Findings explorer</div><h2>상세 진단</h2></div><p>차트·분야 필터와 상세 항목을 연결했습니다. 각 항목은 근거 → 사용자/사업 영향 → 수정 방법 순서로 읽힙니다.</p></div><div class="detail-tools">${categoryOptions.map((c,i)=>`<button type="button" class="filter-chip ${i===0?'active':''}" data-filter="${esc(c)}">${esc(c)}</button>`).join('')}</div><div class="details">${all.map((x,i)=>`<details class="detail" id="finding-${i}" data-finding-index="${i}" data-category="${esc(x.category||'기타')}" ${i<3?'open':''}><summary><span class="detail-priority">${Math.round(Number(x.priority)||0)}</span><span class="detail-title"><b>${esc(x.title)}</b><small>${esc(x.category)} · ${priorityLabel(x)} · ${esc(x.confidence)}</small></span></summary><div class="detail-grid"><div><b>실제 근거</b>${esc(x.evidence)}</div><div><b>사용자 영향</b>${esc(x.userImpact)}</div><div><b>사업 영향</b>${esc(x.businessImpact)}</div><div><b>개선 방법</b>${esc(x.improvement)}</div><div><b>수정 난이도</b>${esc(difficulty(x))}</div><div><b>재개발 판단</b>${esc(x.redevelopment)}</div>${Array.isArray(x.locations)&&x.locations.length?`<div class="detail-locations"><b>문제 위치</b>${x.locations.slice(0,12).map(v=>`<code>${esc(v)}</code>`).join('')}</div>`:''}</div></details>`).join('')}</div></section>
      <section class="report-section next-contact" id="next"><div class="section-head"><div><div class="section-kicker">07 · Next step</div><h2>결과를 이어서 확인하기</h2></div><p>진단 결과를 보존하거나 공개 페이지 밖의 실제 사용자 흐름까지 직접 확인합니다.</p></div><div class="forms"><form class="formbox" id="mailForm"><h3>이메일로 결과 받기</h3><p>현재 결과 링크와 핵심 문제를 이메일로 보내드립니다.</p><input type="email" name="email" required placeholder="you@example.com" aria-label="결과를 받을 이메일"><label class="check"><input type="checkbox" name="marketing"> SuaveForge 개선 사례 및 서비스 안내도 이메일로 받겠습니다.</label><button type="submit">리포트 받기</button><p class="status"></p></form><form class="formbox" id="consultForm"><h3>무료로 직접 봐달라고 하기</h3><p>로그인·예약·결제·관리자처럼 외부에서 확인할 수 없는 영역은 직접 사용해보고 가장 큰 문제를 찾습니다.</p><input name="name" placeholder="이름 / 회사명" aria-label="이름 또는 회사명"><input name="email" type="email" placeholder="이메일" aria-label="이메일"><input name="phone" placeholder="연락처" aria-label="연락처"><textarea name="message" rows="4" placeholder="특히 확인했으면 하는 흐름이 있다면 적어주세요." aria-label="확인 요청 내용"></textarea><button type="submit">무료 컨설팅 요청</button><p class="status"></p></form></div></section>`;
    wire();wireFilters();initCharts(all,cats,[['Performance',perf],['SEO',seo],['Accessibility',a11y]],lh);initPremiumMotion();initTooltips();
  }

  function scrollToFinding(index){
    const row=document.getElementById(`finding-${index}`);if(!row)return;row.hidden=false;row.open=true;row.scrollIntoView({behavior:'smooth',block:'center'});row.animate?.([{boxShadow:'0 0 0 0 rgba(237,75,67,0)'},{boxShadow:'0 0 0 5px rgba(237,75,67,.16)'},{boxShadow:'0 0 0 0 rgba(237,75,67,0)'}],{duration:1100,easing:'ease-out'});
  }

  function activateCategory(category){
    const chip=[...document.querySelectorAll('.filter-chip')].find(x=>x.dataset.filter===category);if(chip)chip.click();document.getElementById('details')?.scrollIntoView({behavior:'smooth',block:'start'});
  }


  function updateSpotlight(index){
    const item=findingState[index],box=document.getElementById('issueSpotlight');
    if(!item||!box)return;
    const title=box.querySelector('strong'),copy=box.querySelector('p'),scoreEl=box.querySelector(':scope > b');
    const apply=()=>{if(title)title.textContent=item.title||'진단 항목';if(copy)copy.textContent=item.evidence||'근거 확인 필요';if(scoreEl)scoreEl.textContent=String(Math.round(Number(item.priority)||0));box.style.setProperty('--spot',priorityColor(Number(item.priority)||0));box.dataset.active=String(index)};
    if(window.gsap){
      const target=box.querySelector('div:nth-child(2)');
      window.gsap.killTweensOf(target);
      window.gsap.to(target,{opacity:0,y:8,duration:.12,ease:'power2.in',onComplete:()=>{apply();window.gsap.fromTo(target,{opacity:0,y:-8},{opacity:1,y:0,duration:.28,ease:'power3.out'})}});
    }else apply();
  }

  function initEvidenceSwiper(){
    const el=document.querySelector('.evidence-swiper');if(!el||!window.Swiper)return;
    new window.Swiper(el,{slidesPerView:1.08,spaceBetween:12,grabCursor:true,keyboard:{enabled:true},mousewheel:{forceToAxis:true},freeMode:{enabled:true,sticky:false,momentum:true},scrollbar:{el:el.querySelector('.swiper-scrollbar'),draggable:true},breakpoints:{700:{slidesPerView:2.05,spaceBetween:14},1050:{slidesPerView:2.65,spaceBetween:16}}});
  }
  function wireFilters(){
    const chips=[...document.querySelectorAll('.filter-chip')],rows=[...document.querySelectorAll('.detail')];
    chips.forEach(chip=>chip.addEventListener('click',()=>{chips.forEach(x=>x.classList.toggle('active',x===chip));const f=chip.dataset.filter;rows.forEach(row=>{row.hidden=f!=='전체'&&row.dataset.category!==f})}));
    document.querySelectorAll('[data-category-row]').forEach(row=>row.addEventListener('click',()=>activateCategory(row.dataset.categoryRow)));
  }

  function disposeCharts(){for(const c of charts){try{c.dispose()}catch{}}charts=[]}
  function waitEcharts(limit=50){return new Promise(resolve=>{let n=0;const tick=()=>{if(window.echarts)return resolve(window.echarts);if(++n>=limit)return resolve(null);setTimeout(tick,100)};tick()})}
  function priorityColor(v){return v>=85?'#ed4b43':v>=65?'#d58a13':'#3f6df6'}
  function scoreColor(v){return v===null?'#5e6877':v>=90?'#24b978':v>=50?'#f2a01d':'#ed4b43'}
  function evidenceWeight(x){return Math.max(1,Math.min(8,(Array.isArray(x.locations)?x.locations.length:0)+(x.evidence?1:0)))}

  function armChartEntrance(chart,index=0){
    const el=chart?.getDom?.();
    if(!el||el.dataset.viewportMotion==='armed')return;
    el.dataset.viewportMotion='armed';
    const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    let option;
    try{option=chart.getOption();chart.clear()}catch{return}
    el.classList.add('chart-awaiting');
    let started=false;
    const start=()=>{
      if(started)return;started=true;
      el.classList.remove('chart-awaiting');
      el.classList.add('chart-entering');
      const delay=Math.min(index*55,260);
      setTimeout(()=>{
        try{chart.setOption(option,{notMerge:true,lazyUpdate:false})}catch{}
        if(window.gsap&&!reduced){
          try{window.gsap.fromTo(el,{opacity:.18,y:18,scale:.965,filter:'blur(7px)'},{opacity:1,y:0,scale:1,filter:'blur(0px)',duration:.78,ease:'power3.out',clearProps:'filter,transform',onComplete:()=>el.classList.remove('chart-entering')})}catch{}
        }else{el.style.opacity='1';el.classList.remove('chart-entering')}
      },delay)
    };
    if(reduced||!('IntersectionObserver'in window)){start();return}
    const io=new IntersectionObserver(entries=>{
      if(entries.some(e=>e.isIntersecting&&e.intersectionRatio>=.12)){io.disconnect();start()}
    },{rootMargin:'0px 0px -8% 0px',threshold:[.12,.25,.5]});
    io.observe(el);
  }

  function vitalSpec(key,value){
    const n=num(value);if(n===null)return null;
    const cfg={lcp:{good:2500,needs:4000,base:6000},tbt:{good:200,needs:600,base:1200},cls:{good:.1,needs:.25,base:.4},fcp:{good:1800,needs:3000,base:4500}}[key];
    const max=Math.max(cfg.base,n*1.18),color=n<=cfg.good?'#20bd75':n<=cfg.needs?'#f0a126':'#ef554d';
    return {n,cfg,max,color};
  }

  async function initCharts(all,cats,scores,lh){
    findingState=all;
    disposeCharts();const ech=await waitEcharts();
    if(!ech){document.querySelectorAll('.score-orbit-chart,.vital-chart,.impact-chart,.category-chart,.chart').forEach(el=>el.innerHTML='<div class="chart-empty">차트 라이브러리를 불러오지 못했습니다. 아래 수치와 상세 결과는 그대로 확인할 수 있습니다.</div>');return}
    const orbit=document.getElementById('scoreOrbitChart');
    if(orbit){const chart=ech.init(orbit);charts.push(chart);const radii=['88%','66%','44%'],widths=[15,13,11];chart.setOption({animationDuration:1400,animationEasing:'cubicOut',tooltip:{trigger:'item',backgroundColor:'rgba(7,10,14,.96)',borderColor:'#2a3340',borderWidth:1,textStyle:{color:'#fff',fontSize:11},formatter:p=>`${esc(p.seriesName)}<br/><b>${Math.round(p.value)} / 100</b>`},graphic:[{type:'text',left:'center',top:'44%',style:{text:'LAB',fill:'#6f7a89',font:'800 10px ui-monospace',textAlign:'center'}},{type:'text',left:'center',top:'50%',style:{text:'SCORES',fill:'#dbe1e9',font:'900 18px sans-serif',textAlign:'center'}}],series:scores.map(([label,v],i)=>({name:label,type:'gauge',startAngle:90,endAngle:-269.999,min:0,max:100,radius:radii[i],center:['50%','49%'],pointer:{show:false},progress:{show:true,roundCap:true,width:widths[i],itemStyle:{color:new ech.graphic.LinearGradient(0,0,1,1,[{offset:0,color:scoreColor(v)},{offset:1,color:i===0?'#ffcc62':i===1?'#5ee3a5':'#8ef0c4'}])}},axisLine:{lineStyle:{width:widths[i],color:[[1,'#252d38']]}},axisTick:{show:false},splitLine:{show:false},axisLabel:{show:false},detail:{show:false},title:{show:false},data:[{value:v??0}]}))});chart.on('mouseover',p=>{orbit.style.filter='brightness(1.08)'});chart.on('mouseout',()=>{orbit.style.filter=''})}
    for(const key of ['lcp','tbt','cls','fcp']){const el=document.getElementById(`vital-${key}`),spec=vitalSpec(key,lh[key]);if(!el)continue;if(!spec){el.innerHTML='<div class="chart-empty" style="height:42px">측정 없음</div>';continue}const chart=ech.init(el);charts.push(chart);const {n,cfg,max,color}=spec;chart.setOption({animationDuration:1200,grid:{left:0,right:0,top:9,bottom:3},tooltip:{trigger:'item',backgroundColor:'#080b10',borderWidth:0,textStyle:{color:'#fff',fontSize:12},formatter:()=>`${key.toUpperCase()} · ${metricValue(key,n)}`},xAxis:{type:'value',min:0,max,show:false},yAxis:{type:'category',data:['metric'],show:false},series:[{type:'bar',data:[max],barWidth:8,silent:true,itemStyle:{color:'#232b36',borderRadius:10},z:1,markArea:{silent:true,itemStyle:{opacity:.24},data:[[{xAxis:0,itemStyle:{color:'#20bd75'}},{xAxis:cfg.good}],[{xAxis:cfg.good,itemStyle:{color:'#f0a126'}},{xAxis:cfg.needs}],[{xAxis:cfg.needs,itemStyle:{color:'#ef554d'}},{xAxis:max}]]}},{type:'bar',data:[n],barWidth:4,barGap:'-75%',itemStyle:{color,borderRadius:10,shadowBlur:12,shadowColor:color},z:3},{type:'effectScatter',coordinateSystem:'cartesian2d',data:[[n,'metric']],symbolSize:10,rippleEffect:{scale:2.4,brushType:'stroke'},itemStyle:{color},z:5}]})}
    const ranked=[...all].map((x,i)=>({...x,_index:i})).sort((a,b)=>(Number(b.priority)||0)-(Number(a.priority)||0)).slice(0,8).reverse(),impact=document.getElementById('impactChart');
    if(impact){const chart=ech.init(impact);charts.push(chart);const vals=ranked.map(x=>Number(x.priority)||0);chart.setOption({animationDuration:1200,animationDelay:i=>i*70,grid:{left:14,right:36,top:22,bottom:25,containLabel:true},tooltip:{trigger:'axis',axisPointer:{type:'shadow'},backgroundColor:'rgba(7,10,14,.96)',borderColor:'#293341',borderWidth:1,textStyle:{color:'#fff',fontSize:12},formatter:p=>{const x=ranked[p?.[0]?.dataIndex];return x?`<b>${esc(x.title)}</b><br/>Priority ${Math.round(Number(x.priority)||0)} · ${esc(x.category)}<br/><span style="color:#9aa5b3">클릭하여 상세 진단 보기</span>`:''}},xAxis:{type:'value',min:0,max:100,splitNumber:4,axisLabel:{color:'#667180',fontSize:11},axisLine:{show:false},axisTick:{show:false},splitLine:{lineStyle:{color:'#232b35'}},markArea:{silent:true,data:[[{xAxis:0,itemStyle:{color:'rgba(63,109,246,.04)'}},{xAxis:65}],[{xAxis:65,itemStyle:{color:'rgba(213,138,19,.05)'}},{xAxis:85}],[{xAxis:85,itemStyle:{color:'rgba(237,75,67,.07)'}},{xAxis:100}]]}},yAxis:{type:'category',data:ranked.map(x=>short(x.title)),axisTick:{show:false},axisLine:{show:false},axisLabel:{color:'#c6ced8',fontSize:11,width:190,overflow:'truncate'}},series:[{type:'bar',data:vals,barWidth:7,showBackground:true,backgroundStyle:{color:'#242c36',borderRadius:9},itemStyle:{borderRadius:9,color:p=>new ech.graphic.LinearGradient(0,0,1,0,[{offset:0,color:'#334155'},{offset:1,color:priorityColor(p.value)}])},z:2},{type:'scatter',data:ranked.map((x,i)=>[Number(x.priority)||0,i,x._index]),symbolSize:11,itemStyle:{color:p=>priorityColor(p.value[0]),borderColor:'#fff',borderWidth:1,shadowBlur:13,shadowColor:'rgba(255,255,255,.18)'},z:4},{type:'effectScatter',data:ranked.map((x,i)=>[Number(x.priority)||0,i,x._index]).filter(v=>v[0]>=85),symbolSize:9,rippleEffect:{scale:3,brushType:'stroke'},itemStyle:{color:'#ff685f'},z:5}]});chart.on('mouseover',p=>{const findingIndex=Array.isArray(p.value)&&Number.isInteger(p.value[2])?p.value[2]:(ranked[p.dataIndex]?._index);if(Number.isInteger(findingIndex)&&findingIndex>=0)updateSpotlight(findingIndex)});chart.on('click',p=>{const findingIndex=Array.isArray(p.value)&&Number.isInteger(p.value[2])?p.value[2]:(ranked[p.dataIndex]?._index);if(Number.isInteger(findingIndex)&&findingIndex>=0)scrollToFinding(findingIndex)})}
    const map=document.getElementById('issueMapChart');
    if(map){const chart=ech.init(map);charts.push(chart);const categories=cats.map(x=>x.category),points=all.map((x,i)=>[Number(x.priority)||0,categories.indexOf(String(x.category||'기타')),evidenceWeight(x),i,x.title,x.category]);chart.setOption({animationDuration:1300,animationDelay:i=>i*55,grid:{left:20,right:20,top:30,bottom:35,containLabel:true},tooltip:{trigger:'item',backgroundColor:'#11151c',borderWidth:0,textStyle:{color:'#fff',fontSize:12},formatter:p=>{const v=p.value;return `<b>${esc(v[4])}</b><br/>${esc(v[5])} · Priority ${v[0]}<br/>증거 밀도 ${v[2]}`}},xAxis:{type:'value',min:0,max:100,axisLabel:{fontSize:11,color:'#768294'},splitLine:{lineStyle:{color:'#27313c'}},axisLine:{show:false},axisTick:{show:false},markArea:{silent:true,data:[[{xAxis:65,itemStyle:{color:'rgba(213,138,19,.05)'}},{xAxis:85}],[{xAxis:85,itemStyle:{color:'rgba(237,75,67,.06)'}},{xAxis:100}]]}},yAxis:{type:'category',data:categories,axisLabel:{fontSize:11,color:'#8b96a6'},axisLine:{show:false},axisTick:{show:false},splitLine:{lineStyle:{color:'#27313c'}}},series:[{type:'scatter',data:points,symbolSize:v=>Math.min(30,10+v[2]*2.4),itemStyle:{color:p=>priorityColor(p.value[0]),opacity:.82,borderColor:'#fff',borderWidth:2,shadowBlur:14,shadowColor:'rgba(0,0,0,.35)'},emphasis:{scale:1.35},z:3},{type:'effectScatter',data:points.filter(v=>v[0]>=85),symbolSize:v=>Math.min(24,8+v[2]*2),rippleEffect:{scale:2.8,brushType:'stroke'},itemStyle:{color:'#ed4b43'},z:4}]});chart.on('mouseover',p=>{const idx=p.value?.[3];if(Number.isInteger(idx))updateSpotlight(idx)});chart.on('click',p=>{const idx=p.value?.[3];if(Number.isInteger(idx))scrollToFinding(idx)})}
    const tree=document.getElementById('categoryTreemap');
    if(tree){
      const chart=ech.init(tree);charts.push(chart);
      if(all.length<=3){
        const layerFor=x=>x.id==='security-headers'?'HOSTING / EDGE':String(x.category||'')==='동작'?'APP / RUNTIME':String(x.category||'')==='SEO'?'DOCUMENT / SEARCH':String(x.category||'')==='접근성'?'DOM / A11Y':'UI / SERVICE';
        const traceItems=[...all].map((x,i)=>({...x,_index:i,_p:Math.max(0,Math.min(100,Number(x.priority)||0)),_layer:layerFor(x)})).sort((a,b)=>b._p-a._p);
        const stageLabels=['DETECT','IMPACT','FIX LAYER'];
        const lineSeries=traceItems.map((x,i)=>({
          name:x.title,type:'line',smooth:.38,showSymbol:true,symbol:'circle',symbolSize:(v,p)=>p.dataIndex===1?13:8,
          data:[Math.max(4,x._p-8),x._p,Math.min(98,x._p+4)],
          lineStyle:{width:2.4,color:priorityColor(x._p),shadowBlur:12,shadowColor:priorityColor(x._p),opacity:.78},
          itemStyle:{color:priorityColor(x._p),borderColor:'#fff',borderWidth:1.5,shadowBlur:12,shadowColor:priorityColor(x._p)},
          emphasis:{focus:'series',lineStyle:{width:4,opacity:1}},
          animationDuration:1050,animationDelay:i*150,
          findingIndex:x._index,
          endLabel:{show:true,formatter:x._layer,color:'#dbe4ef',fontSize:11,fontWeight:800,distance:10},
          label:{show:true,position:'top',formatter:p=>p.dataIndex===1?`P${x._p}`:'',color:'#fff',fontSize:11,fontWeight:900}
        }));
        chart.setOption({
          animationDuration:1200,animationEasing:'cubicOut',
          grid:{left:34,right:118,top:40,bottom:38,containLabel:true},
          tooltip:{trigger:'item',backgroundColor:'rgba(8,11,16,.96)',borderColor:'#2b3442',borderWidth:1,textStyle:{color:'#fff',fontSize:12},formatter:p=>{const x=traceItems[p.seriesIndex];return x?`<b>${esc(x.title)}</b><br/>${esc(x.category)} · Priority ${x._p}<br/>수정 계층 ${esc(x._layer)}<br/><span style="color:#9aa5b3">hover · trace · click</span>`:''}},
          xAxis:{type:'category',boundaryGap:false,data:stageLabels,axisLine:{lineStyle:{color:'#35404d'}},axisTick:{show:false},axisLabel:{color:'#8b98a8',fontSize:11,fontWeight:800,margin:14},splitLine:{show:true,lineStyle:{color:'rgba(255,255,255,.055)',type:'dashed'}}},
          yAxis:{type:'value',min:0,max:100,interval:25,axisLine:{show:false},axisTick:{show:false},axisLabel:{color:'#697687',fontSize:11,formatter:v=>v===0?'':v},splitLine:{lineStyle:{color:'rgba(255,255,255,.055)'}}},
          series:[...lineSeries,...traceItems.map((x,i)=>({type:'effectScatter',name:`pulse-${i}`,data:[[1,x._p]],symbolSize:10,rippleEffect:{scale:3.4,brushType:'stroke',period:2.8+i*.35},itemStyle:{color:priorityColor(x._p)},silent:true,z:8,animationDelay:i*150}))]
        });
        chart.on('mouseover',p=>{const x=traceItems[p.seriesIndex];if(x&&Number.isInteger(x._index))updateSpotlight(x._index)});
        chart.on('click',p=>{const x=traceItems[p.seriesIndex];if(x&&Number.isInteger(x._index))scrollToFinding(x._index)});
      }else{
        const catNodes=cats.map((x,i)=>({
          id:`cat-${i}`,name:x.category,category:i,value:x.max,symbolSize:Math.max(50,Math.min(82,44+x.count*8)),
          itemStyle:{color:x.max>=85?'#ff6258':x.max>=65?'#f1aa35':'#597dff',shadowBlur:24,shadowColor:'rgba(0,0,0,.28)'},
          label:{show:true,color:'#fff',fontSize:11,fontWeight:900},meta:x
        }));
        const issueNodes=[];const links=[];
        cats.forEach((cat,ci)=>{
          all.filter(x=>String(x.category||'기타')===cat.category).sort((a,b)=>(Number(b.priority)||0)-(Number(a.priority)||0)).slice(0,5).forEach((f,fi)=>{
            const idx=all.findIndex(y=>y===f),nid=`issue-${ci}-${fi}`;
            issueNodes.push({id:nid,name:short(f.title,27),category:ci,value:Number(f.priority)||0,findingIndex:idx,symbolSize:Math.max(18,Math.min(34,14+(Number(f.priority)||0)/5)),itemStyle:{color:priorityColor(Number(f.priority)||0),borderColor:'#0f1218',borderWidth:2,shadowBlur:16,shadowColor:priorityColor(Number(f.priority)||0)},label:{show:false}});
            links.push({source:`cat-${ci}`,target:nid,lineStyle:{color:priorityColor(Number(f.priority)||0),opacity:.36,width:1.4,curveness:.16}});
          });
        });
        chart.setOption({
          animationDuration:1000,animationDurationUpdate:800,animationEasingUpdate:'cubicOut',
          tooltip:{trigger:'item',backgroundColor:'rgba(8,11,16,.96)',borderColor:'#2b3442',borderWidth:1,textStyle:{color:'#fff',fontSize:12},formatter:p=>{const d=p.data||{};if(Number.isInteger(d.findingIndex))return `<b>${esc(findingState[d.findingIndex]?.title||p.name)}</b><br/>${esc(findingState[d.findingIndex]?.category||'')} · Priority ${Math.round(Number(d.value)||0)}<br/><span style="color:#9aa5b3">drag · hover · click</span>`;return `<b>${esc(p.name)}</b><br/>발견 ${d.meta?.count??''}건 · 최고 ${d.meta?.max??''} · 평균 ${d.meta?.avg??''}`}},
          series:[{type:'graph',layout:'force',data:[...catNodes,...issueNodes],links,categories:cats.map(x=>({name:x.category})),roam:true,draggable:true,edgeSymbol:['none','circle'],edgeSymbolSize:[0,3],focusNodeAdjacency:true,label:{position:'right'},lineStyle:{opacity:.32,curveness:.12},emphasis:{focus:'adjacency',lineStyle:{opacity:.95,width:2.4}},force:{repulsion:250,edgeLength:[70,130],gravity:.08,friction:.72,layoutAnimation:true}}]
        });
        chart.on('mouseover',p=>{const d=p.data||{};if(Number.isInteger(d.findingIndex))updateSpotlight(d.findingIndex)});
        chart.on('click',p=>{const d=p.data||{};if(Number.isInteger(d.findingIndex)&&d.findingIndex>=0)return scrollToFinding(d.findingIndex);if(d.meta?.category||p.name)activateCategory(d.meta?.category||p.name)});
      }
    }
    charts.forEach((chart,i)=>armChartEntrance(chart,i));
    const resize=()=>charts.forEach(c=>{try{c.resize()}catch{}});window.addEventListener('resize',resize,{passive:true});
  }

  function initTooltips(){
    if(window.tippy)window.tippy('[data-tippy-content]',{theme:'dark',animation:'shift-away-subtle',delay:[120,0],maxWidth:310,placement:'top'});
  }

  function initPremiumMotion(){
    const navLinks=[...document.querySelectorAll('.report-nav a')],sections=[...document.querySelectorAll('.report-section')];
    if('IntersectionObserver'in window){const obs=new IntersectionObserver(entries=>{const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(!visible)return;navLinks.forEach(a=>a.classList.toggle('active',a.getAttribute('href')===`#${visible.target.id}`))},{rootMargin:'-25% 0px -62% 0px',threshold:[0,.2,.5]});sections.forEach(s=>obs.observe(s))}
    const reveal=[...document.querySelectorAll('.report-reveal')];
    if(window.gsap){try{window.gsap.registerPlugin(window.ScrollTrigger);window.gsap.set(reveal,{opacity:0,y:24});reveal.forEach((el,i)=>window.gsap.to(el,{opacity:1,y:0,duration:.8,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 88%',once:true},delay:i<2?i*.05:0}));document.querySelectorAll('.count-up').forEach(el=>{const value=Number(el.dataset.value)||0;window.gsap.fromTo(el,{textContent:0},{textContent:value,duration:1.1,ease:'power2.out',snap:{textContent:1}})})}catch{reveal.forEach(el=>{el.style.opacity=1;el.style.transform='none'})}}
    else reveal.forEach(el=>{el.style.opacity=1;el.style.transform='none'});
    initEvidenceSwiper();
    document.querySelectorAll('.evidence-shot').forEach(card=>{const reset=()=>{card.style.transform='rotateX(0deg) rotateY(0deg) translateY(0)'};card.addEventListener('mousemove',e=>{const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;card.style.transform=`rotateX(${(-y*5).toFixed(2)}deg) rotateY(${(x*7).toFixed(2)}deg) translateY(-3px)`});card.addEventListener('mouseleave',reset)});
    document.querySelectorAll('.metric-cockpit,.insight-card.dark,.evidence-shell').forEach(panel=>{panel.addEventListener('pointermove',e=>{const r=panel.getBoundingClientRect(),x=((e.clientX-r.left)/r.width)*100,y=((e.clientY-r.top)/r.height)*100;panel.style.setProperty('--mx',x+'%');panel.style.setProperty('--my',y+'%')},{passive:true})});
    if(window.gsap&&window.ScrollTrigger&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
      document.querySelectorAll('.metric-cockpit,.insight-grid,.evidence-shell').forEach(panel=>window.gsap.fromTo(panel,{y:16},{y:-10,ease:'none',scrollTrigger:{trigger:panel,start:'top bottom',end:'bottom top',scrub:.55}}));
      document.querySelectorAll('.matrix-bar i').forEach((bar,i)=>{const width=bar.style.width||'0%';window.gsap.fromTo(bar,{width:'0%'},{width,duration:.95,delay:(i%6)*.06,ease:'power3.out',scrollTrigger:{trigger:bar,start:'top 90%',once:true}})});
      const next=document.querySelector('.next-contact');
      if(next){const cards=next.querySelectorAll('.formbox');window.gsap.fromTo(cards,{opacity:0,y:26,scale:.985},{opacity:1,y:0,scale:1,duration:.72,stagger:.12,ease:'power3.out',scrollTrigger:{trigger:next,start:'top 86%',once:true}})}
      document.querySelectorAll('.action-card').forEach((card,i)=>window.gsap.fromTo(card,{opacity:.25,x:-14},{opacity:1,x:0,duration:.62,delay:(i%4)*.05,ease:'power3.out',scrollTrigger:{trigger:card,start:'top 92%',once:true}}));
    }
  }

  function wire(){
    document.querySelectorAll('[data-jump-finding]').forEach(card=>{card.style.cursor='pointer';card.addEventListener('mouseenter',()=>updateSpotlight(Number(card.dataset.jumpFinding)));card.addEventListener('focusin',()=>updateSpotlight(Number(card.dataset.jumpFinding)));card.addEventListener('click',e=>{if(e.target.closest('a,button,code'))return;scrollToFinding(Number(card.dataset.jumpFinding))})});document.querySelectorAll('.detail[data-finding-index]').forEach(row=>row.addEventListener('mouseenter',()=>updateSpotlight(Number(row.dataset.findingIndex))));
    const cf=document.getElementById('consultForm');let ctaTracked=false;const trackConsult=()=>{if(ctaTracked)return;ctaTracked=true;a.event('consultation_cta_clicked',{diagnosisId:id})};cf.addEventListener('focusin',trackConsult,{once:true});cf.addEventListener('click',trackConsult,{once:true});
    document.getElementById('mailForm').addEventListener('submit',async e=>{e.preventDefault();const f=e.currentTarget,s=f.querySelector('.status'),email=f.email.value.trim();s.textContent='발송 중…';const r=await fetch(a.API+'/api/v1/diagnoses/'+id+'/email',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'include',body:JSON.stringify({email,marketingConsent:f.marketing.checked})}),b=await r.json();s.textContent=b.status==='sent'?'이메일을 발송했습니다.':b.status==='pending'?'진단 완료 후 자동 발송합니다.':b.message||b.error||'메일 발송 상태를 확인해 주세요.'});
    document.getElementById('consultForm').addEventListener('submit',async e=>{e.preventDefault();const f=e.currentTarget,s=f.querySelector('.status'),data=Object.fromEntries(new FormData(f));if(!data.email&&!data.phone){s.textContent='이메일 또는 연락처 중 하나는 입력해 주세요.';return}s.textContent='접수 중…';const r=await fetch(a.API+'/api/v1/consultations',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'include',body:JSON.stringify({...a.touch,...data,diagnosisId:id})});s.textContent=r.ok?'접수했습니다. 확인 후 직접 연락드리겠습니다.':'접수하지 못했습니다. 잠시 후 다시 시도해 주세요.'})
  }
  load();
})();
