const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
for(const dir of ['content/artikel','artikel']) {
 test(`${dir}: water chemistry avoids baking powder and universal pH crash`,()=>{
 const s=fs.readFileSync(`${dir}/wassertest-wasserpflege.html`,'utf8');
 assert.doesNotMatch(s,/Natriumbikarbonat \(Backpulver|PH-Absturz \(pH unter 6,0\)|da dann die biologische Filterung|Für die meisten Fische kein Problem, solange/);
 for(const phrase of ['kein Beweis für einen pH-Sturz','Ammoniak','Backpulver ist kein Ersatz','Art und System']) assert.ok(s.includes(phrase),phrase);
 });
 test(`${dir}: Artemia has no spoon-based baking-powder recipe`,()=>{
 const s=fs.readFileSync(`${dir}/artemia-grindal-futtertiere-zuechten.html`,'utf8');
 assert.doesNotMatch(s,/halben Teelöffel Backpulver|unter 25 g führt zu missgebildeten/);
 assert.ok(s.includes('Backpulver nicht als Puffer'));assert.ok(s.includes('pubs.ext.vt.edu'));assert.ok(s.includes('keine pauschale Ersatzdosierung'));
 });
}
