const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
test('UV guidance requires isolation and exact-model maintenance without exposed lamp checks',()=>{
 for(const dir of ['content/artikel','artikel']){
  const s=fs.readFileSync(`${dir}/uv-klaerer-aquarium-guide.html`,'utf8');
  for(const p of [/vom Stromnetz trennen/,/niemals außerhalb/,/Keine Schutzschalter überbrücken/,/nicht geöffnet werden/,/keine Prüfung von Laufzeit/,/eheim\.com/,/jbl\.de/])assert.match(s,p);
  assert.doesNotMatch(s,/30–50 Prozent|Essigessenz \(1:3|90 bis 99 Prozent|Dennerle UV|geringerer Quarzhülsenqualität|maximal 7 Tage/);
  assert.match(fs.readFileSync(`${dir}/aquarium-pflegeroutine-guide.html`,'utf8'),/nicht jedes Gerät darf geöffnet/);
 }
});
test('UV product page does not publish unverified models, ASINs or a fictional test',()=>{
 const s=fs.readFileSync('artikel/uv-c-klaerer-aquarium-entkeimung.html','utf8');
 assert.doesNotMatch(s,/B081J9XYZ9|B098ABCDEF|B07XYZ1234|UV.Clarifier 150|UV.Crystal 300|UV.Clarifier Pro|Modelle im Test|B00CIF8TCS/);
 assert.match(s,/Stromnetz/);assert.match(s,/2026-11-15/);
});
