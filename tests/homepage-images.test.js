const { readFileSync } = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const test = require('node:test');

const root = path.join(__dirname, '..');
const html = readFileSync(path.join(root, 'index.html'), 'utf8');

test('homepage backgrounds and preview images point to actual image assets', () => {
  const urls = new Set(html.match(/\/images\/[\w.-]+\.(?:png|webp|jpe?g|avif|svg)\b/g));
  assert.ok(urls.size > 30, 'retain the homepage image collection');
  const problems = [];
  for (const url of urls) {
    try {
      const image = readFileSync(path.join(root, url));
      if (url.endsWith('.webp')) {
        assert.equal(image.toString('ascii', 0, 4), 'RIFF');
        assert.equal(image.toString('ascii', 8, 12), 'WEBP');
      }
    } catch (err) {
      problems.push(`${url}: ${err.code || err.message}`);
    }
  }
  assert.deepEqual(problems, []);
});

test('the featured guide, water-change card and sharing metadata use their intended images', () => {
  assert.match(html, /class="mag-feature"[^>]*url\('\/images\/nano-aquarium-guide\.webp'\)/);
  assert.match(html, /href="\/artikel\/aquarium-wasserwechsel-richtig-machen(?:\.html|\/)?"[^>]*>\s*<div class="art-img"[^>]*url\('\/images\/hero-aquarium-wasserwechsel-richtig-machen\.webp'\)/);
  for (const attribute of ['property="og:image"', 'name="twitter:image"']) {
    assert.ok(html.includes(`<meta ${attribute} content="https://aquaristik-zentrum.com/images/hero.webp">`));
  }
});
