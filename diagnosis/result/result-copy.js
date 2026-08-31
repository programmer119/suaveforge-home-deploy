(()=>{
  const replacements=new Map([
    ['점수가 아니라 상태를 읽는 계기판','성능 점수와 핵심 지표'],
    ['SEO · AEO · GEO를 따로 봅니다','SEO · AEO · GEO 진단'],
    ['어디부터 고쳐야 하는지 한 번에','수정 우선순위'],
    ['분야별 상태와 영향 밀도','분야별 문제 현황'],
    ['실제 화면으로 확인','진단 화면 캡처'],
    ['상세 진단','문제별 상세 진단'],
    ['결과를 이어서 확인하기','결과 저장 및 추가 진단'],
    ['성능·검색·접근성 점수','진단 점수'],
    ['핵심 성능 지표','웹 성능 지표'],
    ['검색 노출 기반','기술 SEO'],
    ['답변 추출 준비도','AEO · 답변 구조'],
    ['생성형 검색 해석 신호','GEO · 생성형 검색 신뢰 신호'],
    ['우선순위','수정 우선순위'],
    ['문제 분포','분야별 문제 분포'],
    ['문제 해결 경로','문제별 수정 위치'],
    ['분야별 문제 관계','분야별 문제 연결'],
    ['무료로 직접 봐달라고 하기','무료 추가 진단 요청']
  ]);
  const vitalLabels=new Map([
    ['LCP','LCP · 최대 콘텐츠 표시 시간'],
    ['TBT','TBT · 입력 차단 시간'],
    ['CLS','CLS · 화면 흔들림'],
    ['FCP','FCP · 첫 콘텐츠 표시 시간']
  ]);
  const navLabels=new Map([
    ['핵심 지표','성능 지표'],
    ['영향도 지도','수정 우선순위'],
    ['분야별 상태','분야별 문제'],
    ['화면 증거','화면 캡처'],
    ['상세 진단','상세 결과'],
    ['다음 단계','결과 저장']
  ]);
  const rowLabels=new Map([
    ['Title','페이지 제목'],
    ['Description','검색 설명'],
    ['Canonical','대표 URL'],
    ['Indexability','검색 색인 허용'],
    ['Sitemap','사이트맵'],
    ['H1 / lang','대표 제목 / 언어'],
    ['질문 → 직접답변','질문과 직접 답변'],
    ['FAQ / QA / HowTo schema','구조화 답변 스키마'],
    ['간결 답변 문단','간결한 답변 문단'],
    ['엔티티 schema','엔티티 구조화 데이터'],
    ['AI crawler 차단','AI 크롤러 접근'],
    ['출처 / 발행 신호','작성자·발행·날짜'],
    ['sameAs / 제3자 근거','외부 동일성 / 제3자 근거']
  ]);
  const setText=(el,text)=>{if(el&&el.textContent!==text)el.textContent=text};
  const badge=(card,text,state)=>{
    const el=card?.querySelector('.discovery-card-head strong');
    if(!el)return;
    setText(el,text);
    el.classList.add('sf-status-badge');
    el.classList.remove('sf-good','sf-warn','sf-bad','sf-neutral');
    el.classList.add(`sf-${state}`);
  };
  const signal=(card,label)=>[...card.querySelectorAll('.discovery-signal')].find(row=>(row.querySelector('span')?.textContent||'').trim()===label);
  const signalValue=(card,label)=>(signal(card,label)?.querySelector('b')?.textContent||'').trim();
  const relabelSignals=card=>card?.querySelectorAll('.discovery-signal span').forEach(el=>{const t=(el.textContent||'').trim();if(rowLabels.has(t))setText(el,rowLabels.get(t))});

  function discovery(){
    const seo=document.querySelector('#discovery .discovery-seo');
    const aeo=document.querySelector('#discovery .discovery-aeo');
    const geo=document.querySelector('#discovery .discovery-geo');
    if(seo){
      setText(seo.querySelector('h3'),'기술 SEO');
      setText(seo.querySelector(':scope > p'),'검색엔진이 페이지를 수집·색인하고 검색 결과에 표시하는 기본 기술 상태입니다.');
      const raw=(seo.querySelector('.discovery-card-head strong')?.textContent||'').trim();
      const m=raw.match(/(\d+)\s*\/\s*100/);
      const n=m?Number(m[1]):null;
      badge(seo,n===null?'기술 SEO · 측정 없음':`기술 SEO ${n}/100`,n===null?'neutral':n>=90?'good':n>=50?'warn':'bad');
      relabelSignals(seo);
    }
    if(aeo){
      setText(aeo.querySelector('h3'),'AEO · 답변 구조');
      setText(aeo.querySelector(':scope > p'),'검색엔진과 AI가 질문에 대한 답을 바로 추출할 수 있는 구조인지 확인합니다.');
      const raw=(aeo.querySelector('.discovery-card-head strong')?.textContent||'').trim();
      const m=raw.match(/(\d+)\s*\/\s*(\d+)/);
      if(m){
        const yes=Number(m[1]),total=Number(m[2]);
        if(total>0&&yes===total)badge(aeo,`직접답변 구조 양호 · ${yes}/${total}`,'good');
        else if(yes>0)badge(aeo,`직접답변 일부 준비 · ${yes}/${total}`,'warn');
        else badge(aeo,`직접답변 구조 부족 · ${yes}/${total}`,'bad');
      }else badge(aeo,'답변 구조 확인 필요','neutral');
      relabelSignals(aeo);
    }
    if(geo){
      const evidence=signalValue(geo,'sameAs / 제3자 근거')||signalValue(geo,'외부 동일성 / 제3자 근거');
      const ai=signalValue(geo,'AI crawler 차단')||signalValue(geo,'AI 크롤러 접근');
      const pair=evidence.match(/(\d+)\s*\/\s*(\d+)/);
      const sameAs=pair?Number(pair[1]):0,thirdParty=pair?Number(pair[2]):0;
      const aiAllowed=/감지 없음|허용|차단 없음/i.test(ai);
      setText(geo.querySelector('h3'),'GEO · 생성형 검색 신뢰 신호');
      setText(geo.querySelector(':scope > p'),'생성형 검색이 사이트의 주체·출처·외부 근거를 신뢰할 수 있는지 확인합니다.');
      if(sameAs>0&&thirdParty>0&&aiAllowed)badge(geo,'기본 GEO 신호 확보','good');
      else if(sameAs>0||thirdParty>0||aiAllowed)badge(geo,'외부 권위 보강 필요','warn');
      else badge(geo,'외부 근거 부족','bad');
      relabelSignals(geo);
    }
  }
  function styles(){
    if(document.getElementById('sf-copy-status-style'))return;
    const style=document.createElement('style');style.id='sf-copy-status-style';
    style.textContent=`.discovery-card-head strong.sf-status-badge{display:inline-flex;align-items:center;gap:7px;white-space:nowrap}.discovery-card-head strong.sf-status-badge:before{content:'';width:7px;height:7px;border-radius:50%;background:currentColor}.discovery-card-head strong.sf-good{color:#148255}.discovery-card-head strong.sf-warn{color:#9a6500}.discovery-card-head strong.sf-bad{color:#c13d35}.discovery-card-head strong.sf-neutral{color:#667180}`;
    document.head.appendChild(style);
  }
  function apply(){
    styles();
    document.querySelectorAll('#main h2,#main h3').forEach(el=>{const t=(el.textContent||'').trim();if(replacements.has(t))setText(el,replacements.get(t))});
    document.querySelectorAll('#main .vital-name').forEach(el=>{const t=(el.textContent||'').trim();if(vitalLabels.has(t))setText(el,vitalLabels.get(t))});
    document.querySelectorAll('#main .report-nav a').forEach(el=>{const t=(el.textContent||'').trim();if(navLabels.has(t))setText(el,navLabels.get(t))});
    discovery();
  }
  const root=document.getElementById('main');
  if(!root)return;
  apply();
  new MutationObserver(()=>requestAnimationFrame(apply)).observe(root,{childList:true,subtree:true});
})();
