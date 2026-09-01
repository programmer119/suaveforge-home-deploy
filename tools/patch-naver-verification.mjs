import fs from 'node:fs';

const path='index.html';
const marker='name="naver-site-verification"';
const meta='<meta name="naver-site-verification" content="db0ab31e16a95d6bfa0cda0dfdd9c80b028f6dba" />';
let html=fs.readFileSync(path,'utf8');
if(html.includes(marker)){
  console.log('NAVER_VERIFICATION=already-present');
  process.exit(0);
}
if(!html.includes('<head>'))throw new Error('HEAD_NOT_FOUND');
html=html.replace('<head>','<head>\n'+meta);
fs.writeFileSync(path,html,'utf8');
console.log('NAVER_VERIFICATION=inserted');
