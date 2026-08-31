(()=>{
  const cards=[
    ['Google Search Console','검색 노출·클릭·CTR·평균순위·색인 상태','소유자 OAuth 연결 필요'],
    ['Bing Webmaster','검색 트래픽·키워드·크롤·색인·IndexNow 수신','소유자 인증/API 연결 필요'],
    ['네이버 서치어드바이저','수집·색인·색인제외·SEO 진단·노출 현황','사이트 소유확인 후 확인 가능']
  ];
  function mount(){
    if(document.getElementById('webmaster-console-status'))return true;
    const discovery=document.getElementById('discovery');
    if(!discovery)return false;
    const s=document.createElement('section');
    s.id='webmaster-console-status';
    s.className='report-section report-reveal';
    s.innerHTML=`<div class="section-head"><div><div class="section-kicker">02-B · 검색엔진 실측</div><h2>공개 페이지 점수와 실제 검색 유입은 다릅니다</h2></div><p>아래 데이터는 검색엔진의 소유자 콘솔 내부 정보라 URL만으로 읽을 수 없습니다. 연결하지 않은 상태에서 임의 점수로 환산하지 않습니다.</p></div><div class="wm-console-grid">${cards.map(([name,metrics,state])=>`<article class="wm-console-card"><div><span>OWNER DATA</span><h3>${name}</h3></div><p>${metrics}</p><strong>${state}</strong></article>`).join('')}</div><div class="wm-console-note"><b>현재 SEO 0–100 점수에는 포함하지 않습니다.</b><span>이유: 등록 여부는 DNS·HTML 파일·메타태그 등 여러 방식이라 공개 페이지에서 미검출됐다고 미등록으로 단정할 수 없고, 클릭·노출·평균순위·실제 색인 수는 소유자 인증 없이는 비공개입니다. 연결 기능이 추가되면 이 영역에서 실측값을 별도로 보여주는 구조가 맞습니다.</span></div>`;
    discovery.insertAdjacentElement('afterend',s);
    const style=document.createElement('style');
    style.textContent=`.wm-console-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.wm-console-card{background:#fff;border:1px solid #e7e1d7;border-radius:16px;padding:20px;min-height:170px}.wm-console-card span{font-size:10px;font-weight:900;letter-spacing:.12em;color:#ef5147}.wm-console-card h3{margin:7px 0 12px;font-size:20px}.wm-console-card p{margin:0 0 18px;color:#62656b;line-height:1.55}.wm-console-card strong{font-size:12px;background:#f2eee7;border-radius:999px;padding:7px 10px;display:inline-block}.wm-console-note{margin-top:16px;padding:18px 20px;border-radius:14px;background:#111722;color:#fff;display:grid;gap:7px}.wm-console-note b{font-size:14px}.wm-console-note span{color:#b9c2cf;line-height:1.55;font-size:12px}@media(max-width:800px){.wm-console-grid{grid-template-columns:1fr}}`;
    document.head.appendChild(style);
    return true;
  }
  let n=0;const timer=setInterval(()=>{if(mount()||++n>120)clearInterval(timer)},100);
})();
