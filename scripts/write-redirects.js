#!/usr/bin/env node
// Adds URL-consolidation redirects (.html / no-extension → trailing slash) for
// legacy articles that do not live under content/ and are therefore invisible
// to the Pages Functions middleware. Everything else is 301-redirected by
// functions/_middleware.js.
const fs = require('node:fs');
const path = require('node:path');

function writeRedirects(root = ROOT) {
  const file = path.join(root, '_redirects');
  const articles = path.join(root, 'artikel');
  const routes = fs.existsSync(path.join(root, 'data', 'public-content-routes.mjs'))
    ? fs.readFileSync(path.join(root, 'data', 'public-content-routes.mjs'), 'utf8')
    : '';
  const slugs = fs.existsSync(articles)
    ? fs.readdirSync(articles, { withFileTypes: true })
        .filter(f => f.isFile() && f.name.endsWith('.html') && f.name !== 'index.html')
        .map(f => f.name.slice(0, -5))
        .sort()
    : [];
  const lines = [
    '# Legacy-/umbenannte Artikel-Pfade (Domain- und Trailing-Slash-Redirects',
    '# laufen ueber functions/_middleware.js). Die folgenden Artikel existieren',
    '# nicht unter content/ und brauchen daher eigene Cloudflare-Pages-Redirects',
    '# auf die kanonische Trailing-Slash-URL (301):',
    '',
  ];
  for (const slug of slugs) {
    // Artikel mit eigener Public-Route werden bereits von der Middleware bedient.
    if (routes.includes(`"/content/artikel/${slug}"`)) continue;
    lines.push(`/artikel/${slug}      /artikel/${slug}/      301`);
    lines.push(`/artikel/${slug}.html  /artikel/${slug}/      301`);
  }
  lines.push('');
  fs.writeFileSync(file, lines.join('\n'), 'utf8');
  console.log(`Redirects: ${slugs.length} article slugs checked, file written`);
}

if (require.main === module) writeRedirects();
module.exports = { writeRedirects };
