const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');
test('hardscape advice does not equate acid-test silence or dense rock with safety',()=>{
 for(const dir of ['content/artikel','artikel']){
 const s=fs.readFileSync(`${dir}/steinarten-hardscape.html`,'utf8');
 assert.doesNotMatch(s,/Kochen ist daher nur|können bedenkenlos eingesetzt|vollständig inerte Steine|So prüfst du, ob ein Stein geeignet ist/);
 for(const p of [/Steine nicht abkochen/,/Keine sichtbare Reaktion bedeutet nicht/,/Palytoxin/,/früher besiedelte/,/nicht eigenständig schrubben/,/cdc\.gov/,/ornamentalfish\.org/,/commonminerals\.esci\.umn/])assert.match(s,p);
 assert.doesNotMatch(fs.readFileSync(`${dir}/aquarium-schaedlinge.html`,'utf8'),/hilft ein kurzes Abkochen/);
 for(const slug of ['iwagumi-aquascape-guide','biotop-aquarium-amazonas-asien'])assert.match(fs.readFileSync(`${dir}/${slug}.html`,'utf8'),/negativer Essigtest beweist weder/);
 }
});
