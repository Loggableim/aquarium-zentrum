const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const article=()=>fs.readFileSync(path.join(root,'artikel/fischkrankheiten-aquarium-guide.html'),'utf8');
test('fish disease guide is supportive triage, not a medication sales or dosing guide',()=>{
 const html=article();
 assert.match(html,/<h1>Fischkrankheiten erkennen: Warnzeichen, Wasserchecks und tierärztliche Hilfe<\/h1>/);
 assert.match(html,/umgehend eine fischkundige Tierarztpraxis/);
 assert.match(html,/merckvetmanual.com/);
 assert.doesNotMatch(html,/class="side-product-card"|Medikamenten Set|Aquarium-Medizinset|1–3 g|30–32°C/);
});
test('fish article has valid, nonduplicated structured data and truthful dates',()=>{
 const blocks=[...article().matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1])).flat();
 const articles=blocks.filter(x=>['Article','BlogPosting'].includes(x['@type']));
 assert.equal(articles.length,1);
 assert.equal(articles[0].datePublished,'2026-06-07');
 assert.equal(articles[0].dateModified,'2026-11-12');
 assert.equal(articles[0].author['@type'],'Organization');
});

test('health contents links resolve and source text has no hidden advertising or duplicate schema',()=>{
 const html=article();
 for(const [,id] of html.matchAll(/class="toc-item"><a href="#([^"]+)"/g)) assert.ok(html.includes(`id="${id}"`),id);
 assert.equal([...html.matchAll(/class="toc-item"><a href="#/g)].length,6);
 const source=fs.readFileSync(path.join(root,'content/artikel/fischkrankheiten-aquarium-guide.html'),'utf8');
 assert.doesNotMatch(source,/<script|amazon\.|\/content\//i);
 assert.doesNotMatch(html,/ärztlich geprüft|tierärztlich geprüft|Dr\./);
});

test('urgent advice follows its heading without promotional or related-link interruptions',()=>{
 assert.match(article(),/<h2 id="wann-du-sofort-hilfe-brauchst">Wann du sofort Hilfe brauchst<\/h2>\s*<p>Bei deutlicher Atemnot/);
});
