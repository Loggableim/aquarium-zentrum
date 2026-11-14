const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
test('Amazon biotope uses measured water and verified biofiltration, not stocking shortcuts', () => {
  for (const dir of ['content/artikel','artikel']) {
    const s = fs.readFileSync(`${dir}/biotop-aquarium-suedamerika.html`, 'utf8');
    assert.doesNotMatch(s, /70–80 % Osmosewasser|Osmosewasser \(ca\. 70–80 %\)|1 cm Fisch pro Liter|sobald Nitrit nicht mehr nachweisbar|Osmoseanlage ist .*unverzichtbar/);
    assert.match(s, /Ammonium\/Ammoniak/);
    assert.match(s, /kein festes Mischungsverhältnis/);
    assert.match(s, /UF\/IFAS/);
    assert.match(s, /merckvetmanual\.com/);
  }
});
