const { readdirSync, readFileSync, statSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const assert = require('node:assert/strict');

const root = path.join(__dirname, '..');
const articleDir = path.join(root, 'artikel');
const localImage = /^(?:https:\/\/aquaristik-zentrum\.com)?(?:\.\.\/|\.\/|\/)*images\/([^?#]+)/;
const read = slug => readFileSync(path.join(articleDir, `${slug}.html`), 'utf8');

test('public articles have no missing local image files at any viewport', () => {
  const missing = new Set();
  let count = 0;
  for (const file of readdirSync(articleDir).filter(name => name.endsWith('.html'))) {
    const html = readFileSync(path.join(articleDir, file), 'utf8');
    for (const [tag] of html.matchAll(/<(?:img|source)\b[^>]*>/gi)) {
      const seen = new Set();
      for (const [, attr, , value] of tag.matchAll(/\s(src|srcset)=(["'])(.*?)\2/gsi)) {
        assert.ok(!seen.has(attr), `Duplicate ${attr} in ${file}: ${tag}`);
        seen.add(attr);
        for (const candidate of attr === 'srcset' ? value.split(',') : [value]) {
          const match = candidate.trim().split(/\s+/)[0].match(localImage);
          if (!match) continue;
          count++;
          if (!statSync(path.join(root, 'images', decodeURIComponent(match[1])), { throwIfNoEntry: false })?.isFile()) {
            missing.add(`${file} ${match[1]}`);
          }
        }
      }
    }
  }
  assert.ok(count > 100, 'article images and responsive variants are still present');
  assert.deepEqual([...missing], []);
});

test('repaired pictures use relevant art and do not claim exact fish identification', () => {
  assert.match(read('aquarium-kaufberatung-2026'), /src="\/images\/einsteiger-aquarium-guide\.webp"/);
  assert.match(read('tetras-aquarium'), /src="\/images\/salmler\.webp"[^>]*alt="Illustration eines Salmlerschwarms"/);
  assert.doesNotMatch(read('barben-aquarium'), /<img\b[^>]*\bbarben-aquarium\.webp/);
  assert.match(read('wasserwerte-aquarium-guide'), /src="\/images\/wasserwerte-aquarium-guide\.webp"/);
  assert.doesNotMatch(read('wasserwerte-aquarium-guide'), /<img\b[^>]*\bwasserwerte-guide(?:-640|-960)?\.webp/);
});
