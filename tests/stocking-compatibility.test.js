const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
for (const dir of ['content/artikel', 'artikel']) test(`stocking compatibility corrections persist: ${dir}`, () => {
 const html = fs.readFileSync(`${dir}/fischbesatz-nach-beckengroesse.html`, 'utf8');
 assert.doesNotMatch(html, /friedliche Garnelen als Beibesatz|1 Kampffisch-Männchen \+ 8 Microdevario|3–4 Skalare|2–3 Paare Skalare|20–25 cm Gesamtfischlänge|mindestens 100–150 cm|Skalare \(mindestens 150 cm/);
 assert.match(html, /kleine Garnelen gefressen werden/);
 assert.match(html, /80×35×40 cm ergeben rechnerisch 112 Liter/);
 assert.match(html, /Keine pauschale Skalar-Kombination/);
 assert.match(html, /rspca\.org\.au/);
 assert.match(html, /aqueon\.com\/resources\/care-guides\/angelfish/);
});
