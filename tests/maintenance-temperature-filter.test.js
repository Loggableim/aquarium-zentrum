const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
test('maintenance matches replacement water and preserves biological media without a fixed cleaning cycle',()=>{
 for(const dir of ['content/artikel','artikel']){
  const s=fs.readFileSync(`${dir}/aquarium-pflegeroutine-guide.html`,'utf8');
  assert.doesNotMatch(s,/besser ein bis zwei Grad wärmer|Gründliche Filterreinigung der Hauptmedien|Filtermedien sollten etwa alle vier bis sechs Wochen|mehrmals kräftig aus|dosieren im Zweifel lieber|dosiere im Zweifel lieber/);
  for(const p of [/Temperatur mit einem Thermometer/,/vor dem Tierkontakt/,/nicht monatlich grundreinigen/,/frisch entnommenem Aquarienwasser/,/Ammoniak\/Ammonium und Nitrit kontrollieren/,/rspca\.org\.uk/,/aquarium-cleaning-checklist/])assert.match(s,p);
 }
});
