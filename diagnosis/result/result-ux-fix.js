(()=>{
  const main=document.getElementById('main');
  if(!main)return;

  const priorityState=n=>n>=85?['즉시 수정','immediate']:n>=65?['권장 수정','recommended']:['우선순위 낮음','reference'];
  const readNumber=el=>{
    const m=String(el?.textContent||'').trim().match(/^(?:P\s*)?(\d{1,3})(?:\D|$)/i);
    if(!m)return null;
    const n=Number(m[1]);
    return Number.isFinite(n)&&n>=0&&n<=100?n:null;
  };
  const setText=(el,text)=>{if(el&&el.textContent!==text)el.textContent=text};
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

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
      #priority .sf-severity-tabs{display:flex!important;gap:8px!important;flex-wrap:wrap!important;margin:14px 0!important}
      #priority .sf-severity-tabs button{display:inline-flex!important;align-items:center!important;justify-content:center!important;min-width:0!important;width:auto!important;height:auto!important;padding:9px 14px!important;border:1px solid #ddd8cf!important;border-radius:999px!important;background:#fff!important;color:#343a43!important;font-size:12px!important;font-weight:900!important;line-height:1!important;opacity:1!important;visibility:visible!important}
      #priority .sf-severity-tabs button.active{background:#11151c!important;border-color:#11151c!important;color:#fff!important}
      .sf-detail-scope{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:14px 0 8px;padding:0 2px;color:#68717d;font-size:11px}
      .sf-detail-scope b{color:#1f252d;font-size:12px}
      #priority .action-card .action-evidence{margin-top:10px}
      .discovery-signal.pass{box-shadow:inset 3px 0 0 #24ad78}
      .discovery-signal.warn{box-shadow:inset 3px 0 0 #d39424}
      .discovery-signal.bad{box-shadow:inset 3px 0 0 #d9534f}
      @media(max-width:720px){.sf-single-finding-summary{align-items:flex-start;flex-direction:column}.sf-single-priority{text-align:left}.sf-detail-scope{align-items:flex-start;flex-direction:column}}
    `;
    document.head.appendChild(style);
  }

  function detectTotalFindings(section,cards){
    const nums=[];
    const texts=[
      section.querySelector('.section-head p')?.textContent,
      document.querySelector('#matrix .section-head p')?.textContent,
      document.querySelector('.executive')?.textContent
    ].filter(Boolean);
    texts.forEach(t=>{
      const patterns=[/상위\s*(\d+)\s*개/i,/발견(?:된)?\s*문제(?:는)?\s*(\d+)\s*건/i,/문제\s*(\d+)\s*건/i];
      patterns.forEach(r=>{const m=String(t).match(r);if(m)nums.push(Number(m[1]))});
    });
    const matrixCounts=[...document.querySelectorAll('#matrix .matrix-count')].map(readNumber).filter(n=>n!==null);
    if(matrixCounts.length)nums.push(matrixCounts.reduce((a,b)=>a+b,0));
    nums.push(cards.length);
    return Math.max(...nums.filter(Number.isFinite),0);
  }

  function normalizePriorityCards(cards){
    cards.forEach(card=>{
      const scoreBox=card.querySelector('.action-score');
      const strong=scoreBox?.querySelector('strong');
      const n=Number(card.dataset.sfPriority||readNumber(strong));
      if(!Number.isFinite(n))return;
      card.dataset.sfPriority=String(n);
      const [label,severity]=priorityState(n);
      card.dataset.sfSeverity=severity;
      scoreBox?.classList.add('sf-priority-score');
      setText(strong,`${Math.round(n)}/100`);
      setText(scoreBox?.querySelector('span'),`수정 우선순위 · ${label}`);
    });
  }

  function normalizeDetailScores(){
    [...document.querySelectorAll('#details .detail-priority, #details .sf-detail-priority')].forEach(el=>{
      const saved=Number(el.dataset.sfPriority);
      const n=Number.isFinite(saved)?saved:readNumber(el);
      if(n===null||!Number.isFinite(n))return;
      el.dataset.sfPriority=String(n);
      const [label]=priorityState(n);
      setText(el,`${Math.round(n)}/100`);
      el.classList.remove('detail-priority');
      el.classList.add('sf-detail-priority');
      el.title=`수정 우선순위 ${Math.round(n)}/100 · ${label}`;
    });
  }

  function normalizeHelp(section){
    const help=section.querySelector('.sf-priority-help');
    if(!help)return;
    [...help.querySelectorAll('span')].forEach(span=>{
      const t=(span.textContent||'').trim();
      if(t.includes('0–64')||t.includes('0-64'))setText(span,'0–64 우선순위 낮음');
    });
    setText(help.querySelector('em'),'사이트 점수가 아니라, 발견된 문제를 먼저 고칠 순서를 0–100으로 나타낸 값입니다.');
  }

  function rebuildFilters(section,cards,totalFindings){
    let tabs=section.querySelector('.sf-severity-tabs');
    if(cards.length<=1){tabs?.remove();return}
    if(!tabs){
      tabs=document.createElement('div');
      tabs.className='sf-severity-tabs';
      section.querySelector('.action-list')?.insertAdjacentElement('beforebegin',tabs);
    }
    const counts={immediate:0,recommended:0,reference:0};
    cards.forEach(c=>{if(counts[c.dataset.sfSeverity]!==undefined)counts[c.dataset.sfSeverity]++});
    const defs=[['all',`상세 전체 ${cards.length}`]];
    if(counts.immediate)defs.push(['immediate',`즉시 수정 ${counts.immediate}`]);
    if(counts.recommended)defs.push(['recommended',`권장 수정 ${counts.recommended}`]);
    if(counts.reference)defs.push(['reference',`우선순위 낮음 ${counts.reference}`]);
    tabs.innerHTML=defs.map(([k,l],i)=>`<button type="button" class="${i===0?'active':''}" data-sf-filter="${k}">${l}</button>`).join('');
    tabs.onclick=e=>{
      const btn=e.target.closest('button');if(!btn)return;
      tabs.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===btn));
      const f=btn.dataset.sfFilter;
      cards.forEach(card=>card.hidden=f!=='all'&&card.dataset.sfSeverity!==f);
    };

    let scope=section.querySelector('.sf-detail-scope');
    if(!scope){scope=document.createElement('div');scope.className='sf-detail-scope';tabs.insertAdjacentElement('beforebegin',scope)}
    if(totalFindings>cards.length)scope.innerHTML=`<b>전체 발견 ${totalFindings}건</b><span>아래 상세카드는 우선순위 상위 ${cards.length}건입니다.</span>`;
    else scope.innerHTML=`<b>전체 발견 ${totalFindings}건</b><span>발견된 문제를 수정 우선순위 순으로 표시합니다.</span>`;
  }

  function setMode(section,cards,totalFindings){
    const matrix=document.getElementById('matrix');
    section.dataset.sfTotal=String(totalFindings);
    section.querySelector('.issue-spotlight')?.remove();

    if(totalFindings===1){
      section.dataset.sfMode='single';
      if(matrix)matrix.dataset.sfMode='single';
      section.querySelector('.sf-severity-tabs')?.remove();
      section.querySelector('.sf-detail-scope')?.remove();
      const card=cards[0];
      if(!card)return;
      const n=Number(card.dataset.sfPriority||0),[label]=priorityState(n);
      const title=(card.querySelector('h3')?.textContent||'발견된 문제').trim();
      let summary=section.querySelector('.sf-single-finding-summary');
      if(!summary){summary=document.createElement('div');summary.className='sf-single-finding-summary';section.querySelector('.action-list')?.insertAdjacentElement('beforebegin',summary)}
      summary.innerHTML=`<div><small>현재 발견 1건</small><strong>${esc(title)}</strong><p>현재 진단에서 발견된 문제는 이 1건뿐입니다. 아래에서 근거와 수정 방법을 확인할 수 있습니다.</p></div><div class="sf-single-priority"><b>${Math.round(n)}/100</b><span>수정 우선순위 · ${label}</span></div>`;
      const head=section.querySelector('.section-head');
      if(head){setText(head.querySelector('h2'),'발견된 문제 1건');setText(head.querySelector('p'),`수정 우선순위 ${Math.round(n)}/100 · ${label}. 비교할 문제가 없어 그래프는 표시하지 않습니다.`)}
      if(matrix){const mhead=matrix.querySelector('.section-head');if(mhead)setText(mhead.querySelector('p'),'발견된 문제 1건의 분야와 상태만 표시합니다. 비교할 항목이 없어 관계 그래프는 생략합니다.')}
    }else{
      section.dataset.sfMode='multi';
      if(matrix)matrix.dataset.sfMode='multi';
      section.querySelector('.sf-single-finding-summary')?.remove();
      const head=section.querySelector('.section-head');
      if(head){
        setText(head.querySelector('h2'),'수정 우선순위');
        const shown=cards.length;
        setText(head.querySelector('p'),totalFindings>shown?`전체 ${totalFindings}건을 비교하고, 상세 내용은 우선순위 상위 ${shown}건을 표시합니다.`:`발견된 ${totalFindings}건을 진단 근거와 영향도를 기준으로 비교합니다.`);
      }
      rebuildFilters(section,cards,totalFindings);
    }
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
    const section=document.getElementById('priority');
    if(!section)return false;
    const cards=[...section.querySelectorAll('.action-list .action-card')];
    if(!cards.length)return false;
    normalizePriorityCards(cards);
    normalizeDetailScores();
    normalizeHelp(section);
    const totalFindings=detectTotalFindings(section,cards);
    setMode(section,cards,totalFindings);
    fixDiscoveryRows();
    return !!document.querySelector('#details .detail, #details details');
  }

  if(apply())return;
  const observer=new MutationObserver(()=>{if(apply())observer.disconnect()});
  observer.observe(main,{childList:true,subtree:true});
})();
