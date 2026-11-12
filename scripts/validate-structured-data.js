'use strict';
const fs = require('node:fs');
const path = require('node:path');

// Legacy standalone pages are source files too: validate every public page,
// not only the subset generated from article metadata.
function validateStructuredData(root) {
  let count = 0;
  const errors = [];
  for (const dir of [root, path.join(root, 'artikel')]) {
    for (const name of fs.readdirSync(dir).filter(name => name.endsWith('.html'))) {
      const file = path.join(dir, name);
      const html = fs.readFileSync(file, 'utf8');
      for (const match of html.matchAll(/<script\b[^>]*\btype\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script\s*>/gi)) {
        try { JSON.parse(match[1]); count++; }
        catch (error) { errors.push(`${path.relative(root, file)}: ${error.message}`); }
      }
    }
  }
  if (errors.length) throw new Error(`Invalid JSON-LD:\n${errors.join('\n')}`);
  return count;
}
module.exports = { validateStructuredData };
if (require.main === module) console.log(`Validated ${validateStructuredData(path.resolve(__dirname, '..'))} JSON-LD blocks.`);
