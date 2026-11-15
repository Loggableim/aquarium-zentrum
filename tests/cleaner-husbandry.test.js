const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
test('cleaner species claims remain specific and avoid blanket tank/feeding promises',()=>{
 for(const dir of ['content/artikel','artikel']){
  const s=fs.readFileSync(`${dir}/algenfresser-portrait.html`,'utf8');
  assert.doesNotMatch(s,/ab 100 Litern für ein Paar|Sie brauchen ein Becken ab 400|max\. 3 Zentimeter|Eine Gruppe von 10 bis 20 Red Cherrys hält|nach 24 Stunden aus dem Becken|In gut eingefahrenen Becken mit moderatem Algenbesatz finden sie meist ausreichend Nahrung/);
  for(const x of ['50 cm Gesamtlänge','3–4 cm','Gattung, keine einzelne Art','Fisch-Prädationsrisiko','IN1301','Ernährungszustand'])assert.ok(s.includes(x),x);
 }
});
