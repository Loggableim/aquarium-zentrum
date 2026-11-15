const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
test('beginner fish guide avoids universal stocking and salt guarantees',()=>{
 for(const dir of ['content/artikel','artikel']){
  const s=fs.readFileSync(`${dir}/beliebteste-aquarienfische.html`,'utf8');
  assert.doesNotMatch(s,/Kombinationen funktionieren garantiert|Alle genannten Arten sind friedlich|maximal 60 cm Gesamtfischlänge|leichte Salzzugabe .*tut ihnen gut|vertragen sich mit allen Fischen dieser Liste/);
  for(const p of [/Kein Salz auf Verdacht/,/keine sichere Besatzberechnung/,/54 Liter geometrisches Volumen/,/Hoplisoma paleatum/,/kein Erstbesatz/,/16 cm Standardlänge/,/Häutung/])assert.match(s,p);
  for(const slug of ['salmler-aquarium','vergesellschaftung-aquarienfische','gesellschaftsbecken-einrichten']){
   const x=fs.readFileSync(`${dir}/${slug}.html`,'utf8');assert.doesNotMatch(x,/gilt auch für Salmler|Moderne Faustregel|nach dieser Formel maximal|ist ein grober Richtwert/);assert.match(x,/keine sichere Besatzberechnung/);
  }
 }
});
