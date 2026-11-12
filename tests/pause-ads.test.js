const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('public pages contain no automatic advertising loaders while consent is unconfigured', () => {
  const root = path.resolve(__dirname, '..');
  const files = fs.readdirSync(root).filter(n => n.endsWith('.html')).map(n => path.join(root,n));
  files.push(...fs.readdirSync(path.join(root,'artikel')).filter(n => n.endsWith('.html')).map(n => path.join(root,'artikel',n)));
  const failures = files.filter(file => {
    const html=fs.readFileSync(file,'utf8');
    return [...html.matchAll(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi)].some(m => /adsbygoogle|googlesyndication|googletagservices/i.test(m[0])) || /<ins\b[^>]*class=["'][^"']*adsbygoogle/i.test(html);
  });
  assert.deepEqual(failures.map(f => path.relative(root,f)), []);
});

test('removes only advertising scripts and slots, keeping content, analytics-free behavior and verification', () => {
  const { withoutAdvertising } = require('../scripts/pause-advertising.js');
  const good='<meta name="google-adsense-account" content="ca-pub-123"><h1>Fish</h1><script>openMenu()</script><script type="application/ld+json">{"name":"Fish"}</script>';
  assert.equal(withoutAdvertising(good + '<script src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script><ins class="adsbygoogle" data-ad-slot="123"></ins><script>(adsbygoogle=[]).push({})</script>'),good);
});
