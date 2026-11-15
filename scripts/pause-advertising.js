#!/usr/bin/env node
// Advertising is paused until an appropriate consent solution is configured.
// The publisher verification meta tag and ads.txt remain intact.
const fs = require('node:fs');
const path = require('node:path');
function withoutPlaceholders(html) {
  return html
    // Appended dashed boxes, including the decorative separator belonging to them.
    .replace(/(?:<hr\b[^>]*>\s*)?<!--\s*AdSense-Placeholder\s*-->\s*<div\b[^>]*>\s*(?:<p\b[^>]*>\s*\[\s*AdSense-Werbefläche\s*\]\s*<\/p>|)\s*<\/div>/gi, '')
    .replace(/<div\b[^>]*class=["'][^"']*\badsense-placeholder\b[^"']*["'][^>]*>\s*(?:\[Google AdSense[^\]]*\])?\s*<\/div>/gi, '')
    .replace(/<div\b[^>]*>\s*📢\s*Anzeige\s*\(AdSense\)\s*<\/div>/gi, '')
    .replace(/<div\b[^>]*class=["']adsense["'][^>]*>\s*<!--[^>]*-->\s*<\/div>/gi, '')
    .replace(/<!--[^>]*AdSense[^>]*(?:Platzhalter|Placeholder)[^>]*-->/gi, '')
    // A legacy wrapper contains real related links: keep children and balanced markup,
    // but remove its advertising label, background, border and empty-space styling.
    .replace(/<div\b[^>]*class=["'][^"']*\badsense-placeholder\b[^"']*["'][^>]*>/gi, '<div>');
}
function withoutAdvertising(html) {
  return withoutPlaceholders(html).replace(/[ \t]*<script\b[^>]*>[\s\S]*?<\/script\s*>(?:\r?\n)?/gi, script =>
    /adsbygoogle|googlesyndication|googletagservices/i.test(script) ? '' : script)
    .replace(/[ \t]*<ins\b[^>]*\bclass\s*=\s*(["'])[^"']*\badsbygoogle\b[^"']*\1[^>]*>[\s\S]*?<\/ins\s*>(?:\r?\n)?/gi, '');
}
function pauseAdvertising(root = path.resolve(__dirname, '..')) {
  let changed = 0;
  // Include source fragments so later article builds cannot restore old loaders.
  for (const directory of ['', 'artikel', 'content', 'content/artikel', '_templates']) {
    const folder = path.join(root, directory);
    if (!fs.existsSync(folder)) continue;
    for (const item of fs.readdirSync(folder, { withFileTypes: true })) {
      if (!item.isFile() || !item.name.endsWith('.html')) continue;
      const file = path.join(folder, item.name);
      const before = fs.readFileSync(file, 'utf8');
      const after = withoutAdvertising(before);
      if (before !== after) { fs.writeFileSync(file, after); changed++; }
    }
  }
  console.log(`Advertising pause: ${changed} HTML files cleaned`);
}
if (require.main === module) pauseAdvertising();
module.exports = { withoutAdvertising, withoutPlaceholders, pauseAdvertising };
