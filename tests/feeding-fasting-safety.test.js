const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
for(const dir of ['content/artikel','artikel']) {
 test(`${dir}: betta swelling is not treated with scheduled fasting`,()=>{
  const s=fs.readFileSync(`${dir}/kampffisch-haltung-betta.html`,'utf8');
  assert.doesNotMatch(s,/besonders bei Tieren, die zu Verstopfung|Überfütterung ist riskanter als ein kurzer Fastenzeitraum/);
  for(const phrase of ['kein Beweis für Verstopfung','fischkundige Tierarztpraxis','Jungfische','common-signs-of-illness-in-fish']) assert.ok(s.includes(phrase),phrase);
 });
 for(const slug of ['aquarium-futter-ernaehrung','salmler-aquarium']) test(`${dir}/${slug}: no universal metabolic fasting promise`,()=>{
  const s=fs.readFileSync(`${dir}/${slug}.html`,'utf8');
  assert.doesNotMatch(s,/um den Stoffwechsel der Fische zu entlasten|Ein Fastentag pro Woche entlastet/);
  for(const phrase of ['Art, Alter','Jungfische','FA096']) assert.ok(s.includes(phrase),phrase);
 });
}
