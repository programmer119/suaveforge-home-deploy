import fs from 'node:fs';

const HOST='suaveforge.com';
const KEY_FILE='4e73be19cbf60457fd6816a200d4aa2c.txt';
const key=fs.readFileSync(new URL(`../${KEY_FILE}`,import.meta.url),'utf8').trim();
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
const body={host:HOST,key,keyLocation:`https://${HOST}/${KEY_FILE}`,urlList};
const res=await fetch('https://api.indexnow.org/indexnow',{method:'POST',headers:{'Content-Type':'application/json; charset=utf-8'},body:JSON.stringify(body)});
console.log(`INDEXNOW_STATUS=${res.status}`);
console.log(`INDEXNOW_URLS=${urlList.length}`);
if(![200,202].includes(res.status)){
  const text=(await res.text()).slice(0,500);
  throw new Error(`INDEXNOW_FAILED_${res.status}:${text}`);
}
