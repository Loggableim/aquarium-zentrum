const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');
test('transport guide has no drafting residue or universal unsafe recipes',()=>{
 for(const dir of ['content/artikel','artikel']){
  const s=fs.readFileSync(`${dir}/aquarium-umzug-transport-guide.html`,'utf8');
  assert.doesNotMatch(s,/First line:|First paragraph:|Next heading:|Next h3|=> words:|ignore tags|Salz.oder Kalkzugabe|Sauerstofftabletten|mindestens 70|Wasserstand nicht unter 30/);
  assert.match(s,/Aquarium leer transportieren/);assert.match(s,/aqueon\.com/);assert.match(s,/FA119/);assert.match(s,/FA120/);
  const heads=[...s.matchAll(/<h2[^>]*>(.*?)<\/h2>/g)].map(m=>m[1]);assert.equal(new Set(heads).size,heads.length);
 }
});
