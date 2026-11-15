const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');
test('brackish guide distinguishes salt composition and species life stages',()=>{
 for(const dir of ['content/artikel','artikel']){
  const s=fs.readFileSync(`${dir}/brackwasser-aquarium-guide.html`,'utf8');
  assert.doesNotMatch(s,/ohne Jod|Kein Jod|Backwater 200|1:1 umsetzen|robust bis 10 PSU|Brackwasser-liebende Linie|5–18 PSU|7–10 g pro Liter/);
  for(const pattern of [/kein allgemeines Auswahlkriterium/,/45 cm TL/,/4,2 cm TL/,/Larvenbedingungen/,/Verdunstung/,/Chloramin/,/tropic-marin-smartinfo/,/fishbase\.se/,/jstage\.jst/,/usgs\.gov/])assert.match(s,pattern);
 }
});
