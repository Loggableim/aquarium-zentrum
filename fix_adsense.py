#!/usr/bin/env python3
"""Replace all AdSense placeholders with real AdSense code in generated HTML files."""
import os, re, glob

BASE = "C:/HermesPortable/home/spaces/aquarium-zentrum"
files = glob.glob(os.path.join(BASE, "artikel", "*.html")) + [os.path.join(BASE, "about.html")]

ad_code = '''<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9094916118868532" crossorigin="anonymous"></script>
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-9094916118868532"
     data-ad-slot="1234567890"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>'''

count = 0
for fp in files:
    if not os.path.exists(fp):
        continue
    with open(fp, 'r', encoding='utf-8') as f:
        content = f.read()
    
    orig = content
    
    # Match ANY variant of the AdSense placeholder
    # Pattern: <div class="adsense-placeholder"> whitespace [Google AdSense – ...] whitespace </div>
    content = re.sub(
        r'<div\s+class="adsense-placeholder">\s*\[Google AdSense\s*–\s*(?:In-Article\s+)?Anzeige(?:nplatzhalter)?\]\s*</div>',
        ad_code,
        content,
        flags=re.DOTALL
    )
    
    if content != orig:
        with open(fp, 'w', encoding='utf-8') as f:
            f.write(content)
        count += 1
        print(f"  ✅ {os.path.basename(fp)}")

print(f"\n✅ {count} Dateien aktualisiert")

# Verify
remaining = 0
for fp in files:
    if os.path.exists(fp):
        with open(fp, 'r', encoding='utf-8') as f:
            if 'Google AdSense' in f.read():
                remaining += 1
                print(f"  ⚠️  noch Platzhalter in: {os.path.basename(fp)}")

if remaining:
    print(f"\n⚠️  {remaining} Dateien haben noch Platzhalter")
else:
    print(f"\n✅ ALLE Platzhalter ersetzt!")
