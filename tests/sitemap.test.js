const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { generateSitemap } = require('../scripts/generate-sitemap.js');

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'aqua-sitemap-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  function page(name, extra = '') {
    fs.mkdirSync(path.dirname(path.join(root, name)), { recursive: true });
    fs.writeFileSync(path.join(root, name), `<html><head>${extra}</head><body>Content</body></html>`);
  }
  return { root, page };
}

test('includes only public pages, never source fragments, templates or the error page', t => {
  const { root, page } = fixture(t);
  for (const name of ['index.html','about.html','artikel/fish.html','content/artikel/fish.html','_templates/nav.html','404.html']) page(name);
  const xml = generateSitemap(root);
  assert.deepEqual([...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]), [
    'https://aquaristik-zentrum.com/', 'https://aquaristik-zentrum.com/about/', 'https://aquaristik-zentrum.com/artikel/fish/'
  ]);
});

test('excludes noindex pages regardless of attribute order or case', t => {
  const { root, page } = fixture(t);
  page('index.html');
  page('artikel/private.html', '<META content="nofollow, NOINDEX" name="robots">');
  assert.doesNotMatch(generateSitemap(root), /private/);
});

test('keeps existing valid lastmod but never invents dates from checkout time', t => {
  const { root, page } = fixture(t);
  page('index.html'); page('artikel/new.html');
  fs.writeFileSync(path.join(root, 'sitemap.xml'), '<urlset><url><loc>https://aquaristik-zentrum.com/</loc><lastmod>2026-07-07T08:30:11+00:00</lastmod></url></urlset>');
  const xml = generateSitemap(root);
  assert.match(xml, /<lastmod>2026-07-07T08:30:11\+00:00<\/lastmod>/);
  assert.equal([...xml.matchAll(/<lastmod>/g)].length, 1);
});

test('uses same-site canonical URLs and rejects off-site canonicals', t => {
  const { root, page } = fixture(t);
  page('index.html');
  page('artikel/fish.html', '<link href="https://aquaristik-zentrum.com/artikel/fish/" rel="canonical">');
  assert.match(generateSitemap(root), /artikel\/fish\//);
  page('artikel/fish.html', '<link rel="canonical" href="https://example.com/">');
  assert.throws(() => generateSitemap(root), /canonical/i);
});

test('matches existing .html canonicals rather than inventing a competing URL', t => {
  const { root, page } = fixture(t);
  page('index.html'); page('artikel/fish.html', '<link rel="canonical" href="https://aquaristik-zentrum.com/artikel/fish.html">');
  assert.match(generateSitemap(root), /<loc>https:\/\/aquaristik-zentrum.com\/artikel\/fish.html<\/loc>/);
});

test('only the exact index.html basename represents a directory homepage', t => {
  const { root, page } = fixture(t);
  page('index.html'); page('artikel/index.html'); page('artikel/fish-index.html');
  const xml = generateSitemap(root);
  assert.match(xml, /<loc>https:\/\/aquaristik-zentrum.com\/artikel\/<\/loc>/);
  assert.match(xml, /<loc>https:\/\/aquaristik-zentrum.com\/artikel\/fish-index\/<\/loc>/);
});
