const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
test('pleco guide has clean prose and species-specific size evidence', () => {
 for (const dir of ['content/artikel','artikel']) {
  const s=fs.readFileSync(`${dir}/antennenwels-l-welse-haltung.html`,'utf8');
  assert.doesNotMatch(s,/Answer text:|=>\s*words:|Antennenwelse\(1\)|Die1 meisten2|15\s*bis\s*25\s*cm²/);
  assert.match(s,/50 cm TL/); assert.match(s,/7 cm TL/); assert.match(s,/fishbase\.se/); assert.match(s,/fws\.gov/);
  const heads=[...s.matchAll(/<h2[^>]*>(.*?)<\/h2>/g)].map(m=>m[1]); assert.equal(new Set(heads).size, heads.length);
 }
 const meta=JSON.parse(fs.readFileSync('data/long-content-articles.json')).find(x=>x.slug==='antennenwels-l-welse-haltung');
 assert.equal(new Set(meta.toc).size,meta.toc.length);assert.equal(meta.prod,null);assert.equal(meta.dateModified,'2026-11-14');
});
