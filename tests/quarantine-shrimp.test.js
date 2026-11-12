const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
for (const slug of ['quarantaene-medikamente', 'garnelen-krankheiten']) {
  test(`${slug} offers sourced observation, not treatment recipes or sales`, () => {
    for (const dir of ['content/artikel', 'artikel']) {
      const html = fs.readFileSync(path.join(__dirname, '..', dir, slug + '.html'), 'utf8');
      assert.doesNotMatch(html, /1 Teelöffel|5 mg\/l|Breitband-Antibiotika aus|gegen Bakterien, Viren und Pilze|amazon\.de|affiliate-box|product-card/);
      assert.match(html, /merckvetmanual\.com/);
      assert.match(html, /tierärzt|Tierarzt/);
    }
    const html = fs.readFileSync(path.join(__dirname, '..', 'artikel', slug + '.html'), 'utf8');
    for (const [, id] of html.matchAll(/href="#(abschnitt-\d+)"/g)) assert.ok(html.includes(`id="${id}"`));
    const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap(m => JSON.parse(m[1]));
    const articles = blocks.filter(x => x['@type'] === 'Article');
    assert.equal(articles.length, 1);
    assert.equal(articles[0].dateModified, '2026-11-12');
    assert.equal(articles[0].author['@type'], 'Organization');
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
  });
}
