const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
test('DIY aquarium planning does not substitute generic sizes or leak tests for structural assessment',()=>{
 for(const dir of ['content/artikel','artikel']){
  const s=fs.readFileSync(`${dir}/diy-aquarium-bauen.html`,'utf8');
  assert.doesNotMatch(s,/sind 6 mm Glas ausreichend|alle 30 bis 40 cm eines|endgültig für den Aquarienbetrieb freigeben|mindestens 48 Stunden, besser 72|B0BZ7XQ8J7/);
  for(const p of [/keine berechnete Bauanleitung/,/keine allgemeine Freigabe/,/nicht gleichbedeutend mit vollständiger Durchhärtung/,/keine statische Freigabe/,/otto-chemie\.de/,/juwel-aquarium\.de/])assert.match(s,p);
 }
 assert.doesNotMatch(fs.readFileSync('artikel/aquarium-kaufberatung-2026.html','utf8'),/bei 100 cm Länge sollten es 8 mm/);
 assert.doesNotMatch(fs.readFileSync('artikel/naturglas-aquarium-2026-so-planst-du-ein-artgerechtes-garnelen-biotop-mit-lebend.html','utf8'),/Ab 20 Litern 5 mm/);
 assert.doesNotMatch(fs.readFileSync('artikel/3d-rueckwand-aquarium-bauen.html','utf8'),/vollständig ausgehärtet ist \(24–48 Stunden\)|Wasserdruck hält sie meist zuverlässig/);
});
