const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const slug='aquarium-tagebuch-vorlage';
test('observation guide has useful template, valid links and truthful schema',()=>{
 const s=fs.readFileSync(path.join(root,'artikel',slug+'.html'),'utf8');
 assert.match(s,/Messung \| Ergebnis \| Einheit/);
 assert.match(s,/Fiktives Beispiel/);
 assert.match(s,/Diese Seite speichert keine Einträge/);
 assert.doesNotMatch(fs.readFileSync(path.join(root,'content/artikel',slug+'.html'),'utf8'),/<form\b|<input\b/);
 assert.doesNotMatch(s,/amazon\.de|product-card/);
 for(const [,id] of s.matchAll(/class="toc-item"><a href="#([^"]+)"/g))assert.ok(s.includes(`id="${id}"`));
 for(const [,url] of s.matchAll(/href="(\/artikel\/[^"#?]+)"/g)){
  const f=url.replace(/\/$/,'').replace(/\.html$/,'')+'.html';
  assert.ok(fs.existsSync(path.join(root,f)),f);
 }
 const data=[...s.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap(m=>JSON.parse(m[1]));
 assert.equal(data.filter(x=>x['@type']==='Article').length,1);
 assert.equal(data.find(x=>x['@type']==='Article').datePublished,'2026-11-13');
 assert.equal((s.match(/<h1\b/g)||[]).length,1);
 assert.ok(fs.readFileSync(path.join(root,'sitemap.xml'),'utf8').includes(slug));
 for(const other of ['fischkrankheiten-aquarium-guide','quarantaene-medikamente']) assert.ok(fs.readFileSync(path.join(root,'artikel',other+'.html'),'utf8').includes('/artikel/'+slug+'/'));
});
