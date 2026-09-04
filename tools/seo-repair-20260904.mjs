import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const TRACKING_VERSION = '20260904-01';
const BOOTSTRAP_VERSION = '20260904-02';
const CONTENT_CSS_VERSION = '20260904-1';
const RUN_AT = new Date().toISOString();
const TODAY = RUN_AT.slice(0, 10);
const manifestPath = path.join(ROOT, 'content', 'content-manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const CONTENT_VERSION = String(manifest.version || TODAY).replace(/[^a-zA-Z0-9._-]+/g, '-');

const BOARD = {
  insights: { label: 'Insights', title: '여러 서비스에서 반복되는 문제', lead: '서로 다른 사용자 문의와 장애 사례를 묶어, 반복해서 나타나는 문제와 그 원인을 정리합니다.' },
  cases: { label: 'Cases', title: '실제 문제를 끝까지 따라간 기록', lead: '한 서비스에서 실제로 막힌 흐름을 따라가며, 어디서 문제가 생겼고 무엇을 확인해야 하는지 정리합니다.' },
  guides: { label: 'Guides', title: '반복 사례에서 뽑은 실무 가이드', lead: '여러 실제 사례에서 반복된 문제를 바탕으로, 설계·운영·검수 때 바로 확인할 기준을 정리합니다.' }
};

const htmlEscape = (v = '') => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmtDate = v => { const d = new Date(v); return Number.isFinite(d.getTime()) ? `${d.getUTCFullYear()}년 ${d.getUTCMonth()+1}월 ${d.getUTCDate()}일` : ''; };
const rel = p => path.relative(ROOT,p).replaceAll('\\','/');
function writeIfChanged(file,next){ const prev=fs.readFileSync(file,'utf8'); if(prev===next)return false; fs.writeFileSync(file,next,'utf8'); console.log(`UPDATED ${rel(file)}`); return true; }
function walk(dir,out=[]){ for(const ent of fs.readdirSync(dir,{withFileTypes:true})){ if(['.git','node_modules'].includes(ent.name))continue; const p=path.join(dir,ent.name); if(ent.isDirectory())walk(p,out); else if(ent.isFile()&&ent.name.endsWith('.html'))out.push(p); } return out; }
function relatedServicesFor(fileRel){
  const s=fileRel.toLowerCase();
  if(/deploy|api|callback/.test(s)) return [['/services/web-app-development/','웹·앱 개발'],['/solutions/api-integration-development/','API 연동 개발']];
  if(/signup|login|account|state|list|pagination/.test(s)) return [['/services/web-app-development/','웹·앱 개발'],['/solutions/admin-system-development/','관리자 시스템 개발']];
  if(/delete|recovery|recover/.test(s)) return [['/services/software-rebuild/','기존 소프트웨어 개선·재구축'],['/solutions/admin-system-development/','관리자 시스템 개발']];
  return [['/services/web-app-development/','웹·앱 개발'],['/services/software-rebuild/','기존 소프트웨어 개선·재구축']];
}
function newestDate(items){
  let best='';
  for(const item of items||[]){ const d=String(item.updated_at||item.published_at||'').slice(0,10); if(d>best)best=d; }
  return best||TODAY;
}
function setLastmod(xml,url,date){ const escaped=url.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); return xml.replace(new RegExp(`(<url><loc>${escaped}<\\/loc><lastmod>)[^<]+(<\\/lastmod>)`),`$1${date}$2`); }

let changed=0;
const changedArticleUrls=new Set();

for(const file of walk(ROOT)){
  const fileRel=rel(file);
  const html=fs.readFileSync(file,'utf8');
  let next=html
    .replace(/pageview\.js\?v=[^"'\s>]+/g,`pageview.js?v=${TRACKING_VERSION}`)
    .replace(/bootstrap\.js\?v=[^"'\s>]+/g,`bootstrap.js?v=${BOOTSTRAP_VERSION}`)
    .replace(/content\.css\?v=[^"'\s>]+/g,`content.css?v=${CONTENT_CSS_VERSION}`)
    .replace(/content\.js\?v=[^"'\s>]+/g,`content.js?v=${CONTENT_VERSION}`);

  const m=/^(insights|cases|guides)\/([^/]+)\/index\.html$/.exec(fileRel);
  if(m){
    if(!next.includes('data-related-services')){
      const links=relatedServicesFor(fileRel).map(([href,label])=>`<a href="${href}">${htmlEscape(label)}</a>`).join(' · ');
      next=next.replace('</article>',`<section data-related-services><h2>관련 개발 범위</h2><p>${links}</p></section></article>`);
    }
    if(next!==html){
      next=next.replace(/"dateModified":"[^"]+"/,`"dateModified":"${RUN_AT}"`);
      changedArticleUrls.add(`https://suaveforge.com/${m[1]}/${m[2]}/`);
    }
  }
  if(next!==html){ fs.writeFileSync(file,next,'utf8'); console.log(`UPDATED ${fileRel}`); changed++; }
}

const hubDates={};
for(const type of Object.keys(BOARD)){
  const file=path.join(ROOT,type,'index.html');
  if(!fs.existsSync(file))continue;
  let html=fs.readFileSync(file,'utf8');
  const items=Array.isArray(manifest[type])?manifest[type]:[];
  const b=BOARD[type];
  const cards=items.map(item=>`<a class="content-card" href="/${type}/${encodeURIComponent(item.slug)}/"><div class="content-card__meta">${fmtDate(item.published_at)}</div><h2>${htmlEscape(item.title)}</h2><p>${htmlEscape(item.summary||'')}</p></a>`).join('');
  const main=`<main data-content-root data-static-content><div class="content-kicker">${b.label}</div><h1 class="content-title">${htmlEscape(b.title)}</h1><p class="content-lead">${htmlEscape(b.lead)}</p><div class="content-list">${cards}</div></main>`;
  html=html.replace(/<main data-content-root[^>]*>[\s\S]*?<\/main>/,main);
  const schema={'@context':'https://schema.org','@type':'CollectionPage',name:`${b.label} | SuaveForge`,url:`https://suaveforge.com/${type}/`,description:b.lead,mainEntity:{'@type':'ItemList',itemListElement:items.map((item,i)=>({'@type':'ListItem',position:i+1,name:item.title,url:`https://suaveforge.com/${type}/${item.slug}/`}))}};
  const tag=`<script id="content-collection-schema" type="application/ld+json">${JSON.stringify(schema)}</script>`;
  if(/<script id="content-collection-schema"[\s\S]*?<\/script>/.test(html)) html=html.replace(/<script id="content-collection-schema"[\s\S]*?<\/script>/,tag); else html=html.replace('</head>',`${tag}</head>`);
  html=html
    .replace(/pageview\.js\?v=[^"'\s>]+/g,`pageview.js?v=${TRACKING_VERSION}`)
    .replace(/content\.css\?v=[^"'\s>]+/g,`content.css?v=${CONTENT_CSS_VERSION}`)
    .replace(/content\.js\?v=[^"'\s>]+/g,`content.js?v=${CONTENT_VERSION}`);
  if(writeIfChanged(file,html))changed++;
  hubDates[type]=newestDate(items);
}

const contentJs=path.join(ROOT,'content','content.js');
if(fs.existsSync(contentJs)){
  let js=fs.readFileSync(contentJs,'utf8');
  js=js.replace(/const MANIFEST='[^']+';/,`const MANIFEST='/content/content-manifest.json?v=${CONTENT_VERSION}';`);
  if(!js.includes("if(root.querySelector('.content-list'))return;")) js=js.replace('const fail=()=>{clear();',"const fail=()=>{if(root.querySelector('.content-list'))return;clear();");
  if(writeIfChanged(contentJs,js))changed++;
}

for(const name of ['sitemap.xml','sitemap-services.xml']){
  const file=path.join(ROOT,name); if(!fs.existsSync(file))continue;
  let xml=fs.readFileSync(file,'utf8');
  for(const [type,date] of Object.entries(hubDates)) xml=setLastmod(xml,`https://suaveforge.com/${type}/`,date);
  for(const url of changedArticleUrls) xml=setLastmod(xml,url,TODAY);
  if(writeIfChanged(file,xml))changed++;
}

console.log(`SEO_REPAIR_CONTENT_VERSION=${CONTENT_VERSION}`);
console.log(`SEO_REPAIR_ARTICLES_CHANGED=${changedArticleUrls.size}`);
console.log(`SEO_REPAIR_CHANGED_FILES=${changed}`);
