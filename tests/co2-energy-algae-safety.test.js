const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
test('energy guide separates real electrical loads from gas flow and verifies example arithmetic',()=>{
 const s=fs.readFileSync('artikel/aquarium-stromkosten-berechnen.html','utf8');
 assert.doesNotMatch(s,/amortisieren sich in unter 5 Jahren|CO<sub>2<\/sub>-Pumpenlaufzeit|1 °C weniger Raumtemperatur spart|im Auftrag vorgegebenen|Elektriker-Skills/);
 for(const x of ['361,35','115,63','keine elektrische Pumpe','zusätzlichen Stromverbrauch','8,76','Elektrofachkraft','25000389'])assert.ok(s.includes(x),x);
 assert.equal((50*12+8*24+18*9+3*12)*365/1000,361.35);
 assert.equal(((50*12+8*24+18*9+3*12)*365/1000*.32).toFixed(2),'115.63');
});
test('CO2 and algae safety guidance persists in source and generated output',()=>{
 for(const dir of ['content/artikel','artikel']){
  for(const slug of ['co2-einsteiger-guide','co2-im-aquarium']){
   const s=fs.readFileSync(`${dir}/${slug}.html`,'utf8');
   assert.doesNotMatch(s,/für alle Aquarienbewohner unbedenklich|für viele Fische und Garnelen gut verträglich|Problematisch ist nicht CO₂ an sich/);
   assert.match(s,/sofort sicher stoppen/);assert.match(s,/merckvetmanual/);assert.match(s,/kein.*(?:universell|garantierten)/);
  }
  const b=fs.readFileSync(`${dir}/bucephalandra-anubias-javafarn.html`,'utf8');
  assert.doesNotMatch(b,/Gegen Pinselalgen hilft nur|punktuelle Dosierung|CO₂-Konzentration im Wasser über 5/);
  assert.match(b,/FA157/);assert.match(b,/Keine pauschale Peroxid-Punktbehandlung/);
  const f=fs.readFileSync(`${dir}/algenfresser-portrait.html`,'utf8');
  assert.doesNotMatch(f,/macht die SAE kurzen Prozess|ergänzt du das Team um 3 bis 5/);assert.match(f,/Namensverwechslungen/);
 }
});
