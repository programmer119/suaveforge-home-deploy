import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const alternatesHome=`<link rel="alternate" hreflang="ko" href="https://suaveforge.com/"><link rel="alternate" hreflang="en" href="https://suaveforge.com/en/"><link rel="alternate" hreflang="ja" href="https://suaveforge.com/ja/"><link rel="alternate" hreflang="es" href="https://suaveforge.com/es/"><link rel="alternate" hreflang="x-default" href="https://suaveforge.com/">`;
const alternatesRebuild=`<link rel="alternate" hreflang="ko" href="https://suaveforge.com/services/software-rebuild/"><link rel="alternate" hreflang="en" href="https://suaveforge.com/en/services/software-rebuild/"><link rel="alternate" hreflang="ja" href="https://suaveforge.com/ja/services/software-rebuild/"><link rel="alternate" hreflang="es" href="https://suaveforge.com/es/services/software-rebuild/"><link rel="alternate" hreflang="x-default" href="https://suaveforge.com/services/software-rebuild/">`;

function patchHtml(rel,canonical,alternates){
  const file=path.join(root,rel);
  let html=fs.readFileSync(file,'utf8');
  if(html.includes('hreflang="en"')) return false;
  const needle=`<link href="${canonical}" rel="canonical"/>`;
  const needle2=`<link rel="canonical" href="${canonical}">`;
  if(html.includes(needle)) html=html.replace(needle,needle+alternates);
  else if(html.includes(needle2)) html=html.replace(needle2,needle2+alternates);
  else throw new Error(`Canonical not found in ${rel}`);
  fs.writeFileSync(file,html,'utf8');
  console.log(`LANG_SEO_HTML_UPDATED=${rel}`);
  return true;
}

function addUrls(rel,urls){
  const file=path.join(root,rel);
  let xml=fs.readFileSync(file,'utf8');
  let changed=false;
  for(const {url,priority} of urls){
    if(xml.includes(`<loc>${url}</loc>`)) continue;
    const row=`<url><loc>${url}</loc><lastmod>2026-09-04</lastmod><changefreq>monthly</changefreq><priority>${priority}</priority></url>`;
    xml=xml.replace('</urlset>',`${row}\n</urlset>`);
    changed=true;
  }
  if(changed){fs.writeFileSync(file,xml,'utf8');console.log(`LANG_SEO_SITEMAP_UPDATED=${rel}`)}
  return changed;
}

patchHtml('index.html','https://suaveforge.com/',alternatesHome);
patchHtml('services/software-rebuild/index.html','https://suaveforge.com/services/software-rebuild/',alternatesRebuild);
const all=[
  {url:'https://suaveforge.com/en/',priority:'0.8'},
  {url:'https://suaveforge.com/ja/',priority:'0.8'},
  {url:'https://suaveforge.com/es/',priority:'0.8'},
  {url:'https://suaveforge.com/en/services/software-rebuild/',priority:'0.8'},
  {url:'https://suaveforge.com/ja/services/software-rebuild/',priority:'0.8'},
  {url:'https://suaveforge.com/es/services/software-rebuild/',priority:'0.8'}
];
addUrls('sitemap.xml',all);
if(fs.existsSync(path.join(root,'sitemap-services.xml'))) addUrls('sitemap-services.xml',all.filter(x=>x.url.includes('/services/')));
console.log('GLOBAL_LANGUAGE_SEO_OK=yes');
