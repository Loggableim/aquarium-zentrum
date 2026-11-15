const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
test('plant and wood guidance avoids unverified chemical and mold salvage recipes',()=>{
 for(const dir of ['content/artikel','artikel']){
  const pest=fs.readFileSync(`${dir}/aquarium-schaedlinge.html`,'utf8');
  assert.doesNotMatch(pest,/5 mg\/l für 10 Minuten|1–2 ml pro 10 Liter|2–4 mg\/l|Kaliumpermanganat 99%|Sera Planaria Stop|Sera Pond Hydra|Dunkelkur<\/strong>|0,1–0,2 mg pro Liter|0,2 mg\/l|Wasserstoffperoxid 3% – 1000/);
  assert.match(pest,/keine garantierte Abtötung/);assert.match(pest,/merckvetmanual\.com/);
  const wood=fs.readFileSync(`${dir}/wurzeln-holz-aquarium.html`,'utf8');
  assert.doesNotMatch(wood,/großzügig abschneiden|völlig harmlos|verschwindet nach 1–3 Wochen|Auskochen oder Wässern\?/);
  assert.match(wood,/Bis zur Klärung/);assert.match(wood,/aqueon\.com/);
 }
 const snail=fs.readFileSync('artikel/aquarium-schnecken-bekaempfung.html','utf8');
 assert.doesNotMatch(snail,/Bad in verdünnter Essiglösung|Behandlung tötet viele Eigelege|Dip-Verfahren/);assert.match(snail,/keine pauschalen/);
});
