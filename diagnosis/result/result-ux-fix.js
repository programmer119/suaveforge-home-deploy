(()=>{
  const main=document.getElementById('main');
  if(!main)return;

  const priorityState=n=>n>=85?['즉시 수정','bad']:n>=65?['권장 수정','warn']:['우선순위 낮음','low'];
  const readNumber=el=>{
    const m=String(el?.textContent||'').trim().match(/^(?:P\s*)?(\d{1,3})(?:\D|$)/i);
    if(!m)return null;
    const n=Number(m[1]);
    return Number.isFinite(n)&&n>=0&&n<=100?n:null;
  };
  const setText=(el,text)=>{if(el&&el.textContent!==text)el.textContent=text};

  function ensureStyles(){
    if(document.getElementById('sf-result-ux-fix-style'))return;
    const style=document.createElement('style');
    style.id='sf-result-ux-fix-style';
    style.textContent=`
      #priority[data-sf-mode="single"] .insight-grid,
      #priority[data-sf-mode="single"] .sf-severity-tabs{display:none!important}
      #matrix[data-sf-mode="single"] .insight-card.dark{display:none!important}
      .sf-single-finding-summary{display:flex;align-items:center;justify-content:space-between;gap:18px;margin:14px 0 18px;padding:18px 20px;border-radius:16px;background:#111722;color:#fff;border:1px solid #252e3a}
      .sf-single-finding-summary>div{display:grid;gap:5px;min-width:0}
      .sf-single-finding-summary small{font-size:11px;font-weight:800;letter-spacing:.08em;color:#8995a5}
      .sf-single-finding-summary strong{font-size:18px;line-height:1.35;color:#fff;overflow-wrap:anywhere}
      .sf-single-finding-summary p{margin:0;color:#aeb8c7;font-size:13px;line-height:1.45}
      .sf-single-priority{flex:0 0 auto;text-align:right;display:grid;gap:3px}
      .sf-single-priority b{font-size:25px;line-height:1;color:#77a1ff}
      .sf-single-priority span{font-size:11px;font-weight:900;color:#c7d1df}
      #priority .sf-priority-score strong{white-space:nowrap}
      #priority .sf-priority-help{position:relative;z-index:2}
      #details .sf-detail-priority{font-size:13px;font-weight:950;letter-spacing:-.02em;min-width:74px;width:auto;padding-inline:8px;white-space:nowrap}
      .discovery-signal.pass{box-shadow:inset 3px 0 0 #24ad78}
      .discovery-signal.warn{box-shadow:inset 3px 0 0 #d39424}
      .discovery-signal.bad{box-shadow:inset 3px 0 0 #d9534f}
      @media(max-width:720px){.sf-single-finding-summary{align-items:flex-start;flex-direction:column}.sf-single-priority{text-align:left}}
    `;
    document.head.appendChild(style);
  }

  function fixPriority(){
    const section=document.getElementById('priority');
    if(!section)return false;
    const cards=[...section.querySelectorAll('.action-list .action-card')];
    if(!cards.length)return false;

    const priorities=cards.map(card=>{
      const scoreBox=card.querySelector('.action-score');
      const n=readNumber(scoreBox?.querySelector('strong'));
      if(n===null)return null;
      const [label]=priorityState(n);
      setText(scoreBox.querySelector('strong'),`${Math.round(n)}/100`);
      setText(scoreBox.querySelector('span'),`수정 우선순위 · ${label}`);
      scoreBox.classList.add('sf-priority-score');
      return n;
    });

    section.querySelector('.issue-spotlight')?.remove();

    [...document.querySelectorAll('#details .detail-priority, #details .sf-detail-priority')].forEach((el,i)=>{
      const n=priorities[i];
      if(n===null||n===undefined)return;
      const [label]=priorityState(n);
      setText(el,`${Math.round(n)}/100`);
      el.classList.remove('detail-priority');
      el.classList.add('sf-detail-priority');
      el.title=`수정 우선순위 ${Math.round(n)}/100 · ${label}`;
    });

    const help=section.querySelector('.sf-priority-help');
    if(help){
      [...help.querySelectorAll('span')].forEach(span=>{
        const t=(span.textContent||'').trim();
        if(t.includes('0–64')||t.includes('0-64'))setText(span,'0–64 우선순위 낮음');
      });
      setText(help.querySelector('em'),'사이트 점수가 아니라, 발견된 문제를 먼저 고칠 순서를 0–100으로 나타낸 값입니다.');
    }

    if(cards.length===1){
      section.dataset.sfMode='single';
      const matrix=document.getElementById('matrix');
      if(matrix)matrix.dataset.sfMode='single';
      section.querySelector('.sf-severity-tabs')?.remove();

      const card=cards[0],n=priorities[0]??0,[label]=priorityState(n);
      const title=(card.querySelector('h3')?.textContent||'발견된 문제').trim();
      let summary=section.querySelector('.sf-single-finding-summary');
      if(!summary){
        summary=document.createElement('div');
        summary.className='sf-single-finding-summary';
        section.querySelector('.action-list')?.insertAdjacentElement('beforebegin',summary);
      }
      const safeTitle=title.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
      summary.innerHTML=`<div><small>현재 발견 1건</small><strong>${safeTitle}</strong><p>현재 진단에서 발견된 문제는 이 1건뿐입니다. 아래에서 근거와 수정 방법을 확인할 수 있습니다.</p></div><div class="sf-single-priority"><b>${Math.round(n)}/100</b><span>수정 우선순위 · ${label}</span></div>`;

      const head=section.querySelector('.section-head');
      if(head){
        setText(head.querySelector('h2'),'발견된 문제 1건');
        setText(head.querySelector('p'),`현재 발견된 문제는 1건입니다. 수정 우선순위 ${Math.round(n)}/100 · ${label}. 비교할 문제가 없어 그래프는 표시하지 않습니다.`);
      }
      if(matrix){
        const mhead=matrix.querySelector('.section-head');
        if(mhead)setText(mhead.querySelector('p'),'발견된 문제 1건의 분야와 상태만 표시합니다. 비교할 항목이 없어 관계 그래프는 생략합니다.');
      }
    }else{
      section.dataset.sfMode='multi';
      const matrix=document.getElementById('matrix');
      if(matrix)matrix.dataset.sfMode='multi';
      section.querySelector('.sf-single-finding-summary')?.remove();
    }
    return !!document.querySelector('#details .detail, #details details');
  }

  function fixDiscoveryRows(){
    document.querySelectorAll('#discovery .discovery-signal').forEach(row=>{
      const label=(row.querySelector('span')?.textContent||'').trim();
      const value=(row.querySelector('b')?.textContent||'').trim();
      if(/AI 크롤러 접근/.test(label)&&/허용|감지 없음|차단 없음/.test(value))row.classList.add('pass');
      if(/외부 동일성|제3자 근거/.test(label)){
        const nums=value.match(/\d+/g)?.map(Number)||[];
        if(nums.length>=2){row.classList.remove('pass','warn','bad');row.classList.add(nums[1]>0?'pass':nums[0]>0?'warn':'bad')}
      }
    });
  }

  function apply(){
    ensureStyles();
    const finalReady=fixPriority();
    fixDiscoveryRows();
    return finalReady;
  }

  if(apply())return;
  const observer=new MutationObserver(()=>{
    if(apply())observer.disconnect();
  });
  observer.observe(main,{childList:true,subtree:true});
})();
