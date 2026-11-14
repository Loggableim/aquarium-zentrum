const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
test('water-change temperature guidance measures rather than promises fixed times or outcomes', () => {
  for (const dir of ['content/artikel', 'artikel']) {
    const s = fs.readFileSync(`${dir}/aquarium-wasserwechsel-richtig-machen.html`, 'utf8');
    assert.doesNotMatch(s, /lasse es 30–60 Minuten stehen|oft zur Weißpünktchenkrankheit|das ist tödlich für tropische Fische|tödlicher als ein ausgefallener|killt Fische schneller/);
    assert.match(s, /Ichthyophthirius multifiliis/);
    assert.match(s, /merckvetmanual\.com/);
    assert.match(s, /vcahospitals\.com/);
    assert.match(s, /keine feste Wartezeit/i);
  }
});
