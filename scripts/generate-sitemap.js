#!/usr/bin/env node
// Only publish the public HTML output, never templates or content fragments.
const fs = require('node:fs');
const path = require('node:path');
const SITE = 'https://aquaristik-zentrum.com';
const ROOT = path.resolve(__dirname, '..');

function attributes(tag) {
  return Object.fromEntries([...tag.matchAll(/([\w-]+)\s*=\s*(["'])(.*?)\2/gs)]
    .map(([, name, , value]) => [name.toLowerCase(), value]));
}
function escapeXML(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}
function generateSitemap(root = ROOT) {
  const previous = path.join(root, 'sitemap.xml');
  const dates = new Map();
  if (fs.existsSync(previous)) {
    for (const [, block] of fs.readFileSync(previous, 'utf8').matchAll(/<url>([\s\S]*?)<\/url>/g)) {
      const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1];
      const date = block.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1];
      if (loc && date && /^\d{4}-\d{2}-\d{2}(?:T[\d:.]+(?:Z|[+-]\d{2}:\d{2}))?$/.test(date) && Number.isFinite(Date.parse(date))) dates.set(loc, date);
    }
  }
  const files = fs.readdirSync(root, { withFileTypes: true })
    .filter(f => f.isFile() && f.name.endsWith('.html') && f.name !== '404.html').map(f => f.name);
  const articles = path.join(root, 'artikel');
  if (fs.existsSync(articles)) files.push(...fs.readdirSync(articles, { withFileTypes: true })
    .filter(f => f.isFile() && f.name.endsWith('.html')).map(f => `artikel/${f.name}`));
  const urls = new Set();
  for (const file of files) {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    const meta = [...html.matchAll(/<meta\b[^>]*>/gi)].map(m => attributes(m[0]));
    if (meta.some(a => /^(robots|googlebot)$/i.test(a.name || '') && /\bnoindex\b/i.test(a.content || ''))) continue;
    const expected = `${SITE}/${path.basename(file) === 'index.html' ? file.slice(0, -10) : file.slice(0, -5) + '/'}`;
    const canonical = [...html.matchAll(/<link\b[^>]*>/gi)].map(m => attributes(m[0])).filter(a => /\bcanonical\b/i.test(a.rel || ''));
    // Do not silently submit pages that canonicalize away from their public URL.
    const url = canonical[0]?.href || expected;
    const variants = new Set([expected, `${SITE}/${file}`, expected.replace(/\/$/, '')]);
    if (canonical.length > 1 || !variants.has(url)) throw new Error(`Unexpected canonical in ${file}`);
    if (!dates.has(url) && dates.has(expected)) dates.set(url, dates.get(expected));
    urls.add(url);
  }
  if (!urls.has(`${SITE}/`)) throw new Error('Sitemap must include the homepage');
  const lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'];
  for (const url of [...urls].sort()) {
    lines.push('  <url>', `    <loc>${escapeXML(url)}</loc>`);
    // Keep known dates; filesystem mtimes only describe checkout/build time.
    if (dates.has(url)) lines.push(`    <lastmod>${escapeXML(dates.get(url))}</lastmod>`);
    lines.push('  </url>');
  }
  return [...lines, '</urlset>', ''].join('\n');
}
function writeSitemap(root = ROOT) {
  const xml = generateSitemap(root);
  fs.writeFileSync(path.join(root, 'sitemap.xml'), xml);
  console.log(`Sitemap: ${(xml.match(/<loc>/g) || []).length} public URLs`);
}
if (require.main === module) writeSitemap();
module.exports = { generateSitemap, writeSitemap };
