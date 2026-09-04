import fs from 'node:fs';

const HOST='suaveforge.com';
const KEY_FILE='4e73be19cbf60457fd6816a200d4aa2c.txt';
const key=fs.readFileSync(new URL(`../${KEY_FILE}`,import.meta.url),'utf8').trim();
const keyUrl=`https://${HOST}/${KEY_FILE}`;
const keyRes=await fetch(keyUrl,{redirect:'follow',headers:{'Cache-Control':'no-cache'}});
const publicKey=(await keyRes.text()).trim();
console.log(`INDEXNOW_KEY_STATUS=${keyRes.status}`);
console.log(`INDEXNOW_KEY_FINAL_HOST=${new URL(keyRes.url).host}`);
console.log(`INDEXNOW_KEY_MATCH=${publicKey===key?'yes':'no'}`);
if(!keyRes.ok||publicKey!==key)throw new Error('INDEXNOW_PUBLIC_KEY_NOT_READY');

const files=['sitemap.xml','sitemap-services.xml'];
const urls=[];
for(const file of files){
  const path=new URL(`../${file}`,import.meta.url);
  if(!fs.existsSync(path))continue;
  const xml=fs.readFileSync(path,'utf8');
  for(const m of xml.matchAll(/<loc>(https:\/\/suaveforge\.com\/[^<]*)<\/loc>/g))urls.push(m[1]);
}
const urlList=[...new Set(urls)];
if(!urlList.length)throw new Error('INDEXNOW_URLS_EMPTY');
const required=[
  'https://suaveforge.com/en/',
  'https://suaveforge.com/ja/',
  'https://suaveforge.com/es/',
  'https://suaveforge.com/en/services/software-rebuild/',
  'https://suaveforge.com/ja/services/software-rebuild/',
  'https://suaveforge.com/es/services/software-rebuild/'
];
const missing=required.filter(url=>!urlList.includes(url));
console.log(`INDEXNOW_MULTILINGUAL_URLS=${required.length-missing.length}/${required.length}`);
if(missing.length)throw new Error(`INDEXNOW_MULTILINGUAL_URLS_MISSING:${missing.join(',')}`);
const body={host:HOST,key,urlList};
const endpoints=[
  ['BING_INDEXNOW','https://www.bing.com/indexnow'],
  ['NAVER_INDEXNOW','https://searchadvisor.naver.com/indexnow']
];
let accepted=0;
for(const [name,endpoint] of endpoints){
  try{
    const res=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json; charset=utf-8'},body:JSON.stringify(body)});
    console.log(`${name}_STATUS=${res.status}`);
    if([200,202].includes(res.status))accepted++;
    else console.warn(`${name}_NOT_ACCEPTED=${res.status}:${(await res.text()).slice(0,300)}`);
  }catch(e){console.warn(`${name}_ERROR=${String(e?.message||e).slice(0,300)}`)}
}
console.log(`INDEXNOW_URLS=${urlList.length}`);
console.log(`INDEXNOW_ACCEPTED_ENGINES=${accepted}`);
if(accepted<1)throw new Error('INDEXNOW_NO_ENGINE_ACCEPTED');
