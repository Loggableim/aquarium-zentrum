const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');
test('cloudy-water guide removes drafts and preserves evidence-based triage',()=>{
 for(const dir of ['content/artikel','artikel']){
  const s=fs.readFileSync(`${dir}/truebes-wasser-schaum-geruch-aquarium.html`,'utf8');
  assert.doesNotMatch(s,/OUTPUT TRUNCATED|Intro paragraph:|End with concluding|Answer: Provide|Write answer|words\. Need|First li:|List items:|1\s*cm Fisch pro Liter/);
  assert.match(s,/Atemnot/);assert.match(s,/nicht tief im Bodengrund/);assert.match(s,/merckvetmanual\.com/);assert.match(s,/aqueon\.com/);
  const heads=[...s.matchAll(/<h2[^>]*>(.*?)<\/h2>/g)].map(m=>m[1]);assert.equal(new Set(heads).size,heads.length);
 }
});
