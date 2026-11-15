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

test('all source, template and public HTML is free of placeholder variants', () => {
  for (const dir of ['.', 'artikel', 'content', 'content/artikel', '_templates']) {
    for (const name of fs.readdirSync(path.join(__dirname,'..',dir)).filter(n=>n.endsWith('.html'))) {
      const s=fs.readFileSync(path.join(__dirname,'..',dir,name),'utf8');
      assert.doesNotMatch(s,/adsense-placeholder|adsense-inside|AdSense-Werbefläche|\[Google AdSense|📢\s*Anzeige\s*\(AdSense\)|AdSense[^>]*(?:Platzhalter|Placeholder)/i, `${dir}/${name}`);
    }
  }
});
test('placeholder cleaner preserves substantive links and is idempotent',()=>{
  const {withoutPlaceholders:clean}=require('../scripts/pause-advertising.js');
  const fixture='<h2>Fische</h2><div class="adsense-placeholder">[Google AdSense – In-Article Anzeige 5]</div><div style="padding:1rem">📢 Anzeige (AdSense)</div><div class="adsense-placeholder" style="padding:2rem"><a href="/fish">Related fish</a></div>';
  assert.equal(clean(fixture),'<h2>Fische</h2><div><a href="/fish">Related fish</a></div>');
  assert.equal(clean(clean(fixture)),clean(fixture));
});
test('every observed empty placeholder variant is removed without activating ads',()=>{
 const {withoutAdvertising:clean}=require('../scripts/pause-advertising.js');
 const variants=[
  '<hr style="margin:2rem 0;"><!-- AdSense-Placeholder --><div style="border:1px dashed"><p>[ AdSense-Werbefläche ]</p></div>',
  '<!-- AdSense Platzhalter --><div class="adsense-placeholder">[Google AdSense – In-Article Anzeige 1]</div>',
  '<div class="adsense"><!-- AdSense -- Platzhalter --></div>',
  '<!-- AdSense-Placeholder --><div class="adsense-inside"></div>',
  '<!-- AdSense-Platzhalter: Aquascaping -->'
 ];
 for(const v of variants) assert.equal(clean(v).trim(),'');
});
