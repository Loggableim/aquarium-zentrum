const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
for (const slug of ['wasserwerte-aquarium-guide','aquarium-wasserwechsel-richtig-machen']) {
 test(`${slug}: treatment guidance persists in source and output`, () => {
  for (const dir of ['content/artikel','artikel']) {
   const s=fs.readFileSync(`${dir}/${slug}.html`,'utf8');
   assert.doesNotMatch(s,/Abstehenlassen \(24 Stunden\)|macht es in Sekunden sicher|meist 5 ml auf 100 Liter|die doppelte Dosis verwenden|reichen 1,5 ml|oft auch Nitrat bindet/);
   assert.match(s,/Chloramin/); assert.match(s,/cdc\.gov\/drinking-water/);
   assert.match(s,/Hersteller/);
  }
  const s=fs.readFileSync(`artikel/${slug}.html`,'utf8');
  const blocks=[...s.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap(m=>JSON.parse(m[1]));
  assert.equal(blocks.filter(x=>x['@type']==='Article').length,1);
  assert.equal(blocks.find(x=>x['@type']==='Article').dateModified,'2026-11-13');
 });
}
