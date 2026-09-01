import fs from 'node:fs';

const file = new URL('../index.html', import.meta.url);
let html = fs.readFileSync(file, 'utf8');

const metas = [
  '<meta name="naver-site-verification" content="db0ab31e16a95d6bfa0cda0dfdd9c80b028f6dba" />',
  '<meta name="msvalidate.01" content="73DDFD67601869ED4D77659A2F84D3A1" />'
];

for (const meta of metas) {
  const name = meta.match(/name="([^"]+)"/)?.[1];
  if (!name) continue;
  const re = new RegExp(`<meta[^>]+name=["']${name.replace('.', '\\.') }["'][^>]*>`, 'i');
  if (re.test(html)) html = html.replace(re, meta);
  else html = html.replace('<head>', `<head>\n${meta}`);
}

fs.writeFileSync(file, html, 'utf8');
console.log('SITE_VERIFICATION_META=ready');
