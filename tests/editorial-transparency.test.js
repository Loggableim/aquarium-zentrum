const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
test('public article attribution does not invent an Alexander biography', () => {
  for (const file of fs.readdirSync(path.join(root, 'artikel')).filter(x => x.endsWith('.html'))) {
    assert.doesNotMatch(fs.readFileSync(path.join(root, 'artikel', file), 'utf8'), /Alexander/);
  }
});
test('about page explains editorial limitations without fictional credentials', () => {
  for (const file of ['content/about.html', 'about.html']) {
    const s = fs.readFileSync(path.join(root, file), 'utf8');
    assert.match(s, /KI-Werkzeuge/);
    assert.match(s, /Affiliate-Links/);
    assert.doesNotMatch(s, /15 Jahren|eigenen Becken|mehrfach geprüft|100% unabhängig|Gründer und Chefredakteur/);
  }
});
test('feeder guide is a checklist, not an undocumented test or ranking', () => {
  for (const dir of ['content/artikel', 'artikel']) {
    const s = fs.readFileSync(path.join(root, dir, 'aquarium-futterautomat-guide-2026.html'), 'utf8');
    assert.match(s, /kein eigener Vergleichstest/);
    assert.doesNotMatch(s, /unser Testsieger|500 aktuellen Amazon|meistgekaufte Modell|ohne Elektronik|amazon\.de/);
    for (const id of ['auswahl','pruefen','probelauf','betreuung','entscheidung']) assert.ok(s.includes(`id="${id}"`));
  }
});
