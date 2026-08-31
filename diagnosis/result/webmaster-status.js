(()=>{
  const cards=[
    ['Google Search Console','노출·클릭·CTR·평균순위·색인 상태','소유자 연결 필요'],
    ['Bing Webmaster','검색 트래픽·키워드·크롤·색인·IndexNow 수신','소유자 연결 필요'],
    ['네이버 서치어드바이저','수집·색인·색인 제외·SEO 진단·노출 현황','소유자 연결 필요']
  ];
  function mount(){
    if(document.getElementById('webmaster-console-status'))return true;
    const discovery=document.getElementById('discovery');
    if(!discovery)return false;
    const s=document.createElement('section');
    s.id='webmaster-console-status';
    s.className='report-section report-reveal';
    s.innerHTML=`<div class="section-head"><div><div class="section-kicker">02-B · 검색엔진 실측 데이터</div><h2>Search Console · Bing · 네이버 실측 데이터</h2></div><p>검색 노출·클릭·순위·실제 색인 수는 사이트 소유자 계정에 연결해야 확인할 수 있습니다. 연결 전에는 임의 점수로 만들지 않습니다.</p></div><div class="wm-console-grid">${cards.map(([name,metrics,state])=>`<article class="wm-console-card"><div><span>OWNER DATA</span><h3>${name}</h3></div><p>${metrics}</p><strong>${state}</strong></article>`).join('')}</div><div class="wm-console-note"><b>기술 SEO 점수와 검색 실적은 별도입니다.</b><span>현재 0–100 SEO 점수는 공개 페이지의 기술 상태를 측정합니다. 실제 노출·클릭·평균순위·색인 현황은 각 검색엔진 소유자 데이터를 연결한 뒤 이 영역에서 따로 표시합니다.</span></div>`;
    discovery.insertAdjacentElement('afterend',s);
    const style=document.createElement('style');
    style.textContent=`.wm-console-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.wm-console-card{background:#fff;border:1px solid #e7e1d7;border-radius:16px;padding:20px;min-height:170px}.wm-console-card span{font-size:10px;font-weight:900;letter-spacing:.12em;color:#ef5147}.wm-console-card h3{margin:7px 0 12px;font-size:20px}.wm-console-card p{margin:0 0 18px;color:#62656b;line-height:1.55}.wm-console-card strong{font-size:12px;background:#f2eee7;border-radius:999px;padding:7px 10px;display:inline-block}.wm-console-note{margin-top:16px;padding:18px 20px;border-radius:14px;background:#111722;color:#fff;display:grid;gap:7px}.wm-console-note b{font-size:14px}.wm-console-note span{color:#b9c2cf;line-height:1.55;font-size:12px}@media(max-width:800px){.wm-console-grid{grid-template-columns:1fr}}`;
    document.head.appendChild(style);
    return true;
  }
  let n=0;const timer=setInterval(()=>{if(mount()||++n>120)clearInterval(timer)},100);
})();
