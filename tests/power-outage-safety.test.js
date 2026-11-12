const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
test('power outage source and public guide prohibit indoor combustion heaters', () => {
  for (const folder of ['content/artikel', 'artikel']) {
    const html = fs.readFileSync(path.join(__dirname, '..', folder, 'stromausfall-aquarium-notfallplan.html'), 'utf8');
    assert.ok(html.includes('Niemals Campingkocher, Grills oder andere brennstoffbetriebene Campinggeräte in Innenräumen verwenden.'));
    assert.ok(html.includes('Kohlenmonoxid'));
    assert.ok(html.includes('https://www.cdc.gov/carbon-monoxide/about/index.html'));
    assert.ok(!html.includes('Campingkocher im Raum'));
    assert.ok(!html.includes('Kochplatte oder Campingkocher'));
  }
});
