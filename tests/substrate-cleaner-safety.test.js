const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
test('maintenance advice stops disturbed sulfide sediment and avoids unspecified bleach recipes',()=>{
 for(const dir of ['content/artikel','artikel']){
  const s=fs.readFileSync(`${dir}/aquarium-pflegeroutine-guide.html`,'utf8');
  assert.doesNotMatch(s,/gründlichere Auflockerung notwendig|Partielle Bodengrundauflockerung|Eine Reinigung mit einer milden Chlorlösung|20 bis 30 bar/);
  for(const p of [/Bodenbearbeitung sofort stoppen/,/nicht weiter auflockern/,/Chlorreiniger niemals mit Essig/,/porösem Material/,/keine Entgiftung/,/merckvetmanual\.com/,/jbl\.de/,/cdc\.gov/])assert.match(s,p);
  const substrate=fs.readFileSync(`${dir}/bodengrund-aquarium-guide.html`,'utf8');
  assert.doesNotMatch(substrate,/gute Besatzdichte an Bodengrundwühlern verhindern/);assert.match(substrate,/nicht weiter aufwühlen/);
 }
});
