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
    ['검색 노출 기반','SEO 검색 노출 상태'],
    ['답변 추출 준비도','AEO 답변 구조'],
    ['생성형 검색 해석 신호','GEO 생성형 검색 신호'],
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
  function apply(){
    document.querySelectorAll('#main h2,#main h3').forEach(el=>{
      const t=(el.textContent||'').trim();
      if(replacements.has(t))el.textContent=replacements.get(t);
    });
    document.querySelectorAll('#main .vital-name').forEach(el=>{
      const t=(el.textContent||'').trim();
      if(vitalLabels.has(t))el.textContent=vitalLabels.get(t);
    });
    document.querySelectorAll('#main .report-nav a').forEach(el=>{
      const t=(el.textContent||'').trim();
      if(navLabels.has(t))el.textContent=navLabels.get(t);
    });
  }
  const root=document.getElementById('main');
  if(!root)return;
  apply();
  new MutationObserver(apply).observe(root,{childList:true,subtree:true});
})();
