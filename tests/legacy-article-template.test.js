const assert = require('node:assert/strict');
const { readdirSync, readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const articles = path.join(__dirname, '..', 'artikel');
test('public articles use the shared stylesheet and article shell', () => {
  const missing = [];
  for (const filename of readdirSync(articles)) {
    if (!filename.endsWith('.html') || filename === 'index.html') continue;
    const html = readFileSync(path.join(articles, filename), 'utf8');
    if (!html.includes('rel="stylesheet" href="/style.css"') || !html.includes('class="article-layout"')) {
      missing.push(filename);
    }
  }
  assert.deepEqual(missing, []);
});

test('legacy wrapper renders one title and hero without adding ads', () => {
  for (const slug of ['aquarium-fuer-anfaenger-schritt-anleitung', 'garnelen-aquarium-haltung-zucht-arten']) {
    const html = readFileSync(path.join(articles, `${slug}.html`), 'utf8');
    assert.match(html, /<main class="article-layout">/);
    assert.match(html, /<article class="article-main">/);
    assert.match(html, /class="article-content body-text"[^>]*>\s*<img[^>]*class="article-hero"/);
    assert.equal([...html.matchAll(/<h1\b/g)].length, 1);
    assert.equal([...html.matchAll(/<img\b[^>]*class="article-hero"/g)].length, 1);
    assert.match(html, /<footer class="site-footer">/);
    assert.match(html, /<meta http-equiv="Content-Security-Policy" content="style-src 'self' 'unsafe-inline'; font-src 'self'">\s*<link rel="stylesheet"/);
    assert.match(html, /@media \(max-width:768px\)\{\.article-layout > \.legacy-article-sidebar\{display:block/);
    assert.match(html, /class="search" href="\/artikel\/" aria-label="Artikelübersicht"/);
    assert.doesNotMatch(html, /id="searchInput"/);
    assert.doesNotMatch(html, /adsense|googletag|affiliate-hinweis|google-analytics/);
  }
});

test('legacy formatting closes inside the low-tech article instead of swallowing the sidebar', () => {
  const file = 'low-tech-aquarium-2026-pflanzenvielfalt-ohne-co2-so-gelingt-der-balance-akt-zwis.html';
  const html = readFileSync(path.join(articles, file), 'utf8');
  assert.match(html, /<em>Anubias congensis<\/em>/);
  assert.doesNotMatch(html, /<em>Anubias congensis<\/strong>/);
});

test('wrapped legacy titles use distinct site-local illustrations, not generated title cards', () => {
  const files = readdirSync(articles).filter(name => name.endsWith('.html')).map(name => readFileSync(path.join(articles, name), 'utf8'))
    .filter(html => html.includes('class="article-sidebar legacy-article-sidebar"'));
  assert.ok(files.length >= 12);
  const covers = new Set();
  for (const html of files) {
    const hero = html.match(/<img src="\/images\/([^"/]+\.webp)" alt="[^"]+" class="article-hero"/);
    assert.ok(hero, 'expected a reviewed local illustration');
    assert.doesNotMatch(hero[1], /^hero-/);
    covers.add(hero[1]);
  }
  assert.equal(covers.size, files.length);
});
