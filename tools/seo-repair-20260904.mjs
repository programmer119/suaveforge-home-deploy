import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const TRACKING_VERSION = '20260904-01';
const BOOTSTRAP_VERSION = '20260904-02';
const CONTENT_VERSION = '20260904-1';
const TODAY = '2026-09-04';
const MODIFIED_AT = '2026-09-04T02:49:00Z';
const manifestPath = path.join(ROOT, 'content', 'content-manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

const BOARD = {
  insights: { label: 'Insights', title: '여러 서비스에서 반복되는 문제', lead: '서로 다른 사용자 문의와 장애 사례를 묶어, 반복해서 나타나는 문제와 그 원인을 정리합니다.' },
  cases: { label: 'Cases', title: '실제 문제를 끝까지 따라간 기록', lead: '한 서비스에서 실제로 막힌 흐름을 따라가며, 어디서 문제가 생겼고 무엇을 확인해야 하는지 정리합니다.' },
  guides: { label: 'Guides', title: '반복 사례에서 뽑은 실무 가이드', lead: '여러 실제 사례에서 반복된 문제를 바탕으로, 설계·운영·검수 때 바로 확인할 기준을 정리합니다.' }
};

const htmlEscape = (v = '') => String(v).replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
const fmtDate = (v) => { const d = new Date(v); return Number.isFinite(d.getTime()) ? `${d.getUTCFullYear()}년 ${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일` : ''; };
function writeIfChanged(file, next) { const prev = fs.readFileSync(file, 'utf8'); if (prev === next) return false; fs.writeFileSync(file, next, 'utf8'); console.log(`UPDATED ${path.relative(ROOT, file)}`); return true; }
function walk(dir, out = []) { for (const ent of fs.readdirSync(dir, { withFileTypes: true })) { if (['.git', 'node_modules'].includes(ent.name)) continue; const p = path.join(dir, ent.name); if (ent.isDirectory()) walk(p, out); else if (ent.isFile() && ent.name.endsWith('.html')) out.push(p); } return out; }
function relatedServicesFor(rel) {
  const s = rel.toLowerCase();
  if (/deploy|api|callback/.test(s)) return [['/services/web-app-development/', '웹·앱 개발'], ['/solutions/api-integration-development/', 'API 연동 개발']];
  if (/signup|login|account|state|list|pagination/.test(s)) return [['/services/web-app-development/', '웹·앱 개발'], ['/solutions/admin-system-development/', '관리자 시스템 개발']];
  if (/delete|recovery|recover/.test(s)) return [['/services/software-rebuild/', '기존 소프트웨어 개선·재구축'], ['/solutions/admin-system-development/', '관리자 시스템 개발']];
  return [['/services/web-app-development/', '웹·앱 개발'], ['/services/software-rebuild/', '기존 소프트웨어 개선·재구축']];
}

let changed = 0;
for (const file of walk(ROOT)) {
  let html = fs.readFileSync(file, 'utf8');
  const rel = path.relative(ROOT, file).replaceAll('\\', '/');
  let next = html
    .replace(/pageview\.js\?v=[^"'\s>]+/g, `pageview.js?v=${TRACKING_VERSION}`)
    .replace(/bootstrap\.js\?v=[^"'\s>]+/g, `bootstrap.js?v=${BOOTSTRAP_VERSION}`)
    .replace(/content\.js\?v=[^"'\s>]+/g, `content.js?v=${CONTENT_VERSION}`);
  if (/^(insights|cases|guides)\/[^/]+\/index\.html$/.test(rel)) {
    if (!next.includes('data-related-services')) {
      const links = relatedServicesFor(rel).map(([href, label]) => `<a href="${href}">${htmlEscape(label)}</a>`).join(' · ');
      next = next.replace('</article>', `<section data-related-services><h2>관련 개발 범위</h2><p>${links}</p></section></article>`);
    }
    next = next.replace(/"dateModified":"[^"]+"/, `"dateModified":"${MODIFIED_AT}"`);
  }
  if (next !== html) { fs.writeFileSync(file, next, 'utf8'); console.log(`UPDATED ${rel}`); changed++; }
}

for (const type of Object.keys(BOARD)) {
  const file = path.join(ROOT, type, 'index.html');
  let html = fs.readFileSync(file, 'utf8');
  const items = Array.isArray(manifest[type]) ? manifest[type] : [];
  const b = BOARD[type];
  const cards = items.map((item) => `<a class="content-card" href="/${type}/${encodeURIComponent(item.slug)}/"><div class="content-card__meta">${fmtDate(item.published_at)}</div><h2>${htmlEscape(item.title)}</h2><p>${htmlEscape(item.summary || '')}</p></a>`).join('');
  const main = `<main data-content-root data-static-content><div class="content-kicker">${b.label}</div><h1 class="content-title">${htmlEscape(b.title)}</h1><p class="content-lead">${htmlEscape(b.lead)}</p><div class="content-list">${cards}</div></main>`;
  html = html.replace(/<main data-content-root[^>]*>[\s\S]*?<\/main>/, main);
  const schema = { '@context':'https://schema.org', '@type':'CollectionPage', name:`${b.label} | SuaveForge`, url:`https://suaveforge.com/${type}/`, description:b.lead, mainEntity:{ '@type':'ItemList', itemListElement:items.map((item,i)=>({ '@type':'ListItem', position:i+1, name:item.title, url:`https://suaveforge.com/${type}/${item.slug}/` })) } };
  const schemaTag = `<script id="content-collection-schema" type="application/ld+json">${JSON.stringify(schema)}</script>`;
  if (/<script id="content-collection-schema"[\s\S]*?<\/script>/.test(html)) html = html.replace(/<script id="content-collection-schema"[\s\S]*?<\/script>/, schemaTag); else html = html.replace('</head>', `${schemaTag}</head>`);
  html = html.replace(/pageview\.js\?v=[^"'\s>]+/g, `pageview.js?v=${TRACKING_VERSION}`).replace(/content\.js\?v=[^"'\s>]+/g, `content.js?v=${CONTENT_VERSION}`);
  if (writeIfChanged(file, html)) changed++;
}

const contentJs = path.join(ROOT, 'content', 'content.js');
if (fs.existsSync(contentJs)) {
  let js = fs.readFileSync(contentJs, 'utf8');
  js = js.replace(/const MANIFEST='[^']+';/, `const MANIFEST='/content/content-manifest.json?v=${CONTENT_VERSION}';`);
  js = js.replace('const fail=()=>{clear();', "const fail=()=>{if(root.querySelector('.content-list'))return;clear();");
  if (writeIfChanged(contentJs, js)) changed++;
}
function setLastmod(xml, url, date) { const escaped = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); return xml.replace(new RegExp(`(<url><loc>${escaped}<\\/loc><lastmod>)[^<]+(<\\/lastmod>)`), `$1${date}$2`); }
for (const name of ['sitemap.xml', 'sitemap-services.xml']) {
  const file = path.join(ROOT, name); if (!fs.existsSync(file)) continue; let xml = fs.readFileSync(file, 'utf8');
  for (const url of ['https://suaveforge.com/','https://suaveforge.com/services/automation-development/','https://suaveforge.com/services/software-rebuild/','https://suaveforge.com/insights/','https://suaveforge.com/cases/','https://suaveforge.com/guides/']) xml = setLastmod(xml, url, TODAY);
  for (const type of ['insights','cases','guides']) for (const item of manifest[type] || []) xml = setLastmod(xml, `https://suaveforge.com/${type}/${item.slug}/`, TODAY);
  if (writeIfChanged(file, xml)) changed++;
}
console.log(`SEO_REPAIR_CHANGED_FILES=${changed}`);
