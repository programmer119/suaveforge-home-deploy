(()=>{
  const BOARD={
    insights:{label:'Insights',title:'여러 서비스에서 반복되는 문제',lead:'서로 다른 사용자 문의와 장애 사례를 묶어, 반복해서 나타나는 문제와 그 원인을 정리합니다.'},
    cases:{label:'Cases',title:'실제 문제를 끝까지 따라간 기록',lead:'한 서비스에서 실제로 막힌 흐름을 따라가며, 어디서 문제가 생겼고 무엇을 확인해야 하는지 정리합니다.'},
    guides:{label:'Guides',title:'반복 사례에서 뽑은 실무 가이드',lead:'여러 실제 사례에서 반복된 문제를 바탕으로, 설계·운영·검수 때 바로 확인할 기준을 정리합니다.'}
  };
  const MANIFEST='/content/content-manifest.json?v=2026-09-04-canonical-21-r2';
  const root=document.querySelector('[data-content-root]');if(!root)return;
  const path=location.pathname.replace(/\/+$/,'')||'/';
  const parts=path.split('/').filter(Boolean);
  const type=parts[0];
  if(!Object.prototype.hasOwnProperty.call(BOARD,type))return;
  const fmt=(v)=>{if(!v)return '';const d=new Date(v);return Number.isFinite(d.getTime())?new Intl.DateTimeFormat('ko-KR',{year:'numeric',month:'long',day:'numeric'}).format(d):''};
  const clear=()=>{while(root.firstChild)root.removeChild(root.firstChild)};
  const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n};
  const fail=()=>{if(root.querySelector('.content-list'))return;clear();const box=el('section','content-error');box.append(el('h1','','콘텐츠 목록을 불러오지 못했습니다.'),el('p','','잠시 후 다시 시도해주세요.'));root.appendChild(box)};
  const render=(items)=>{
    clear();const b=BOARD[type];
    root.append(el('div','content-kicker',b.label),el('h1','content-title',b.title),el('p','content-lead',b.lead));
    if(!items.length){root.append(el('div','content-empty',type==='guides'?'현재 공개 기준을 통과한 가이드가 없습니다.':'아직 공개된 글이 없습니다.'));return}
    const grid=el('div','content-list');
    items.forEach(item=>{const a=el('a','content-card');a.href=`/${type}/${encodeURIComponent(item.slug)}/`;a.append(el('div','content-card__meta',fmt(item.published_at)),el('h2','',item.title),el('p','',item.summary||''));grid.appendChild(a)});
    root.appendChild(grid);
  };
  fetch(MANIFEST,{headers:{Accept:'application/json'}}).then(r=>{if(!r.ok)throw new Error('manifest');return r.json()}).then(j=>render(Array.isArray(j[type])?j[type]:[])).catch(fail);
})();
