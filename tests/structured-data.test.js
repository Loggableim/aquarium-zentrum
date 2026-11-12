const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { validateStructuredData } = require('../scripts/validate-structured-data');

test('all public pages have parseable JSON-LD', () => {
  const root = path.resolve(__dirname, '..');
  assert.ok(validateStructuredData(root) >= 110);
});

test('validator rejects malformed schema and names its source', () => {
  const os = require('node:os');
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'aqua-schema-'));
  try {
    fs.mkdirSync(path.join(root, 'artikel'));
    fs.writeFileSync(path.join(root, 'artikel', 'legacy.html'), '<script type="application/ld+json">{}, {}</script>');
    assert.throws(() => validateStructuredData(root), /legacy.html/);
    fs.writeFileSync(path.join(root, 'artikel', 'legacy.html'), '<script type="application/ld+json">[{"@type":"Article"},{"@type":"BreadcrumbList"}]</script>');
    assert.equal(validateStructuredData(root), 1);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
