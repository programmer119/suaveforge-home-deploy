(()=>{
  'use strict';
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const num=v=>Number(v||0).toLocaleString();
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));

  function sparkline(data,key){
    const values=(data||[]).map(x=>Number(x[key]||0));
    if(!values.length)return '<div class="chart-empty">데이터 없음</div>';
    const max=Math.max(1,...values), w=720, h=180, pad=16;
    const step=values.length>1?(w-pad*2)/(values.length-1):0;
    const points=values.map((v,i)=>`${pad+i*step},${h-pad-(v/max)*(h-pad*2)}`).join(' ');
    const area=`${pad},${h-pad} ${points} ${pad+(values.length-1)*step},${h-pad}`;
    return `<div class="line-chart"><svg viewBox="0 0 ${w} ${h}" role="img" aria-label="방문자 추이"><polygon class="chart-area" points="${area}"></polygon><polyline class="chart-line" points="${points}"></polyline>${values.map((v,i)=>`<circle class="chart-dot" cx="${pad+i*step}" cy="${h-pad-(v/max)*(h-pad*2)}" r="3"><title>${esc(data[i]?.label||'')} ${num(v)}</title></circle>`).join('')}</svg><div class="chart-axis">${(data||[]).map((x,i)=>i===0||i===data.length-1||i%Math.max(1,Math.floor(data.length/6))===0?`<span>${esc(x.label)}</span>`:'<span></span>').join('')}</div></div>`;
  }

  function bars(rows,labelKey,valueKey,{suffix='',maxValue}={}){
    const list=(rows||[]).filter(Boolean);
    if(!list.length)return '<div class="chart-empty">데이터 없음</div>';
    const max=Math.max(1,Number(maxValue||0),...list.map(x=>Number(x[valueKey]||0)));
    return `<div class="bar-chart">${list.map(x=>{const v=Number(x[valueKey]||0),p=clamp(v/max*100,0,100);return `<div class="bar-row"><div class="bar-meta"><b>${esc(x[labelKey])}</b><span>${num(v)}${suffix}</span></div><div class="bar-track"><i style="width:${p}%"></i></div></div>`}).join('')}</div>`;
  }

  function funnel(stages,labels){
    const list=(stages||[]).filter(Boolean);
    if(!list.length)return '<div class="chart-empty">데이터 없음</div>';
    const max=Math.max(1,...list.map(x=>Number(x.count||0)));
    return `<div class="funnel-visual">${list.map((x,i)=>{const width=Math.max(12,Number(x.count||0)/max*100);return `<div class="funnel-row"><div class="funnel-label"><span>${String(i+1).padStart(2,'0')}</span><b>${esc(labels[x.name]||x.name)}</b></div><div class="funnel-track"><i style="width:${width}%"></i></div><div class="funnel-value"><b>${num(x.count)}</b><small>${i===0?'기준':`${x.fromPrevious}%`}</small></div></div>`}).join('')}</div>`;
  }

  window.SF_ADMIN_VISUALS={sparkline,bars,funnel};
})();
