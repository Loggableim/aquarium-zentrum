const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const slugs = ['stromausfall-aquarium-notfallplan','wasseraufbereiter-aquarium-vergleich','gesellschaftsbecken-einrichten','fischbesatz-nach-beckengroesse'];
for (const slug of slugs) test(`${slug}: corrected claims persist in source and output`, () => {
 for (const dir of ['content/artikel','artikel']) {
  const html = fs.readFileSync(path.join(root,dir,slug+'.html'),'utf8');
  assert.doesNotMatch(html, /Ohne Oberflächenbewegung diffundiert kein|30–50 % Bakterien|50–80 % Bakterien|3 g Ascorbinsäure pro 100 Liter|Entfernt komplett|garantiert auf unter 2 mg\/L|6 bis 8 Prachtschmerlen|240 Litern \(120×50×40 cm oder 150×50×50 cm\)/);
  assert.match(html, /Quelle:/);
  if (slug === "fischbesatz-nach-beckengroesse") assert.match(html, /Empfehlung eines 60-Liter-Cubes für Skalare wird ausdrücklich zurückgenommen/);
 }
 const html = fs.readFileSync(path.join(root,'artikel',slug+'.html'),'utf8');
 const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap(m=>JSON.parse(m[1]));
 assert.equal(blocks.filter(x=>['Article','BlogPosting'].includes(x['@type'])).length,1);
 assert.equal(blocks.find(x=>x['@type']==='Article').dateModified,slug === 'fischbesatz-nach-beckengroesse' ? '2026-11-13' : '2026-11-12');
 assert.equal((html.match(/<h1\b/g)||[]).length,1);
});
test('power and water guides do not sell products or offer unsupported recipes', () => {
 for (const slug of slugs.slice(0,2)) {
  const html = fs.readFileSync(path.join(root,'artikel',slug+'.html'),'utf8');
  assert.doesNotMatch(html,/amazon\.de|affiliate-box|product-card/);
  for (const [, id] of html.matchAll(/class="toc-item"><a href="#([^"]+)"/g)) assert.ok(html.includes(`id="${id}"`));
 }
});
