const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
test('quarantine guidance avoids short-period guarantees and unsafe plant baths',()=>{
 for(const dir of ['content/artikel','artikel']){
  const s=fs.readFileSync(`${dir}/aquarium-pflegeroutine-guide.html`,'utf8');
  assert.doesNotMatch(s,/für einige Tage beobachtet|So verhinderst du die Einschleppung/);
  for(const p of [/garantiert aber keine Erregerfreiheit/,/mindestens 30 Tage/,/eigene Netze/,/nicht pauschal auf Pflanzen/])assert.match(s,p);
  const plants=fs.readFileSync(`${dir}/schnecken-im-aquarium.html`,'utf8');
  assert.doesNotMatch(plants,/innerhalb dieser Zeit alle versteckten Schneckeneier|bewährte Methode ist das Baden/);
  assert.match(plants,/garantiert Schneckenfreiheit/);
 }
 for(const slug of ['salmler-aquarium','meerwasser-aquarium-einstieg','fische-fortgeschrittene','tetras-aquarium','skalare-haltung-pflege']){
  const s=fs.readFileSync(`artikel/${slug}.html`,'utf8');assert.doesNotMatch(s,/mindestens 2–3 Wochen|Neue Tiere idealerweise 2–4 Wochen|Fische sollten immer 2–4 Wochen|Neue Fische 2–3 Wochen|Mindestens 2 Wochen Quarantäne|Fische für mindestens zwei Wochen/);assert.match(s,/risikogerechter Dauer/);
 }
});
