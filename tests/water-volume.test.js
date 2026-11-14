const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
test('water-change volume and conditioner advice avoids blanket rules', () => {
  for (const dir of ['content/artikel', 'artikel']) {
    const s = fs.readFileSync(`${dir}/aquarium-wasserwechsel-richtig-machen.html`, 'utf8');
    assert.doesNotMatch(s, /warte 2–3 Minuten|Warte 5 Minuten, dann ins Becken|niemals direkt ins Aquarium|Wechsle nie mehr als 50|Maximal 50|killt die (?:nützlichen Bakterien|Bakterienkultur)|sofort Bakterienstarter|Zusammenbruch der Bakterienkultur/);
    assert.match(s, /aquatic-life-support-system-components/);
    assert.match(s, /Anwendungsort/);
    assert.match(s, /keine allgemeine 50/);
  }
});
