(()=>{
  const API='https://api-suaveforge.suaveforge.com:18454';
  const TYPES={insights:'Insights',cases:'Cases',guides:'Guides'};
  const root=document.querySelector('[data-content-root]');
  if(!root)return;
  const path=location.pathname.replace(/\/+$/,'')||'/';
  const parts=path.split('/').filter(Boolean);
  const type=parts[0];
  const decode=(v)=>{try{return decodeURIComponent(v)}catch{return v}};
  const slug=decode(parts[1]||'');
  const valid=Object.prototype.hasOwnProperty.call(TYPES,type);
  const esc=(v)=>String(v??'');
  const fmt=(v)=>{if(!v)return '';const d=new Date(v);return Number.isFinite(d.getTime())?new Intl.DateTimeFormat('ko-KR',{year:'numeric',month:'long',day:'numeric'}).format(d):''};
  const clear=()=>{while(root.firstChild)root.removeChild(root.firstChild)};
  const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n};
  const setMeta=(item)=>{
    document.title=`${item.title} | SuaveForge`;
    let desc=document.querySelector('meta[name="description"]');if(!desc){desc=document.createElement('meta');desc.name='description';document.head.appendChild(desc)}desc.content=item.summary||item.title;
    let canon=document.querySelector('link[rel="canonical"]');if(!canon){canon=document.createElement('link');canon.rel='canonical';document.head.appendChild(canon)}canon.href=`https://suaveforge.com/${type}/${encodeURIComponent(item.slug)}`;
    const noindex=document.querySelector('meta[name="robots"][data-runtime-noindex]');if(noindex)noindex.remove();
  };
  const renderMarkdown=(text,host)=>{
    const lines=String(text||'').replace(/\r/g,'').split('\n');let i=0;let list=null;let listType='';
    const flush=()=>{list=null;listType=''};
    while(i<lines.length){let line=lines[i];
      if(line.startsWith('```')){flush();const pre=el('pre');const code=el('code');const buf=[];i++;while(i<lines.length&&!lines[i].startsWith('```'))buf.push(lines[i++]);code.textContent=buf.join('\n');pre.appendChild(code);host.appendChild(pre);i++;continue}
      const h=/^(#{2,3})\s+(.+)$/.exec(line);if(h){flush();host.appendChild(el(h[1].length===2?'h2':'h3','',h[2]));i++;continue}
      const quote=/^>\s?(.*)$/.exec(line);if(quote){flush();const q=[];while(i<lines.length&&/^>\s?/.test(lines[i]))q.push(lines[i++].replace(/^>\s?/,''));host.appendChild(el('blockquote','',q.join('\n')));continue}
      const ul=/^[-*]\s+(.+)$/.exec(line),ol=/^\d+\.\s+(.+)$/.exec(line);if(ul||ol){const t=ul?'ul':'ol';if(!list||listType!==t){flush();list=el(t);listType=t;host.appendChild(list)}list.appendChild(el('li','',(ul||ol)[1]));i++;continue}
      if(!line.trim()){flush();i++;continue}
      flush();const p=[];while(i<lines.length&&lines[i].trim()&&!/^(#{2,3})\s+/.test(lines[i])&&!/^[-*]\s+/.test(lines[i])&&!/^\d+\.\s+/.test(lines[i])&&!/^>\s?/.test(lines[i])&&!lines[i].startsWith('```'))p.push(lines[i++]);host.appendChild(el('p','',p.join('\n')));
    }
  };
  const renderList=(items)=>{clear();const kicker=el('div','content-kicker',TYPES[type]);const title=el('h1','content-title',type==='insights'?'제품과 기술을 함께 보는 관점':type==='cases'?'실제 문제를 어떻게 되살렸는가':'실무에서 바로 쓰는 개선 가이드');const lead=el('p','content-lead','기능 단위가 아니라 사용자 흐름, 운영, 기술 구조를 함께 보고 정리한 SuaveForge의 기록입니다.');root.append(kicker,title,lead);const grid=el('div','content-list');if(!items.length){root.append(el('div','content-empty','아직 공개된 글이 없습니다.'));return}items.forEach(item=>{const a=el('a','content-card');a.href=`/${type}/${encodeURIComponent(item.slug)}`;const m=el('div','content-card__meta',fmt(item.published_at||item.created_at));const h=el('h2','',item.title);const p=el('p','',item.summary||'');a.append(m,h,p);grid.appendChild(a)});root.appendChild(grid)};
  const renderArticle=(item)=>{clear();setMeta(item);const kicker=el('div','content-kicker',TYPES[type]);const title=el('h1','content-title',item.title);const lead=item.summary?el('p','content-lead',item.summary):null;const meta=el('div','content-meta');meta.appendChild(el('span','',fmt(item.published_at||item.created_at)));meta.appendChild(el('span','',TYPES[type]));root.append(kicker,title);if(lead)root.appendChild(lead);root.appendChild(meta);const shell=el('div','article-shell');const body=el('article','article-body');renderMarkdown(item.body,body);const aside=el('aside','article-aside');aside.appendChild(el('div','',`SuaveForge ${TYPES[type]}`));const back=el('a','',`← ${TYPES[type]} 전체 보기`);back.href=`/${type}/`;aside.append(document.createElement('br'),back);shell.append(body,aside);root.appendChild(shell)};
  const fail=(status)=>{clear();const box=el('section','content-error');box.appendChild(el('h1','',status===404?'글을 찾을 수 없습니다.':'콘텐츠를 불러오지 못했습니다.'));box.appendChild(el('p','',status===404?'주소가 바뀌었거나 아직 공개되지 않은 글입니다.':'잠시 후 다시 시도해주세요.'));const a=el('a','','SuaveForge 홈으로');a.href='/';box.appendChild(a);root.appendChild(box)};
  const run=async()=>{if(!valid){fail(404);return}try{const url=slug?`${API}/api/v1/content/${type}/${encodeURIComponent(slug)}`:`${API}/api/v1/content/${type}?limit=60`;const r=await fetch(url,{headers:{Accept:'application/json'}});if(!r.ok){fail(r.status);return}const j=await r.json();slug?renderArticle(j.item):renderList(j.items||[])}catch{fail(503)}};
  run();
})();
