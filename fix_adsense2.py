#!/usr/bin/env python3
"""Fix remaining AdSense placeholders with non-standard formats."""
import os, re

BASE = "C:/HermesPortable/home/spaces/aquarium-zentrum/artikel"
files = [
    "buntbarsche-cichliden-aquarium.html",
    "krebse-krabben-aquarium-guide-2026.html",
    "schwimmpflanzen-aquarium.html",
    "aquarium-duengung-guide.html",
    "beckenformen-groessen.html",
    "fadenfische-guramis-haltung.html",
    "fische-fortgeschrittene.html",
    "fischkrankheiten-aquarium-guide.html",
    "garnelen-nachzucht.html",
    "heizung-temperatur-aquarium.html",
    "lebendgebärende-zahnkarpfen.html",
    "skalare-haltung-pflege.html",
    "stroemung-im-aquarium.html",
    "truebes-wasser-schaum-geruch-aquarium.html",
    "vergesellschaftung-aquarienfische.html",
    "welse-harnischwelse.html",
    "wurzeln-holz-aquarium.html",
]

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
for fn in files:
    fp = os.path.join(BASE, fn)
    if not os.path.exists(fp):
        continue
    with open(fp, 'r', encoding='utf-8') as f:
        content = f.read()
    
    orig = content
    
    # Pattern 1: Standard adsense-placeholder with various texts
    content = re.sub(
        r'<div\s+class="adsense-placeholder">\s*\[Google AdSense[^\]]*\]\s*</div>',
        ad_code,
        content,
        flags=re.DOTALL
    )
    
    # Pattern 2: "Hier könnte Ihre Google AdSense Anzeige erscheinen/stehen" in div/p
    content = re.sub(
        r'<(?:div|p)[^>]*>\s*📢\s*Anzeige\s*–\s*Hier\s+könnte\s+Ihre\s+Google\s+AdSense\s+Anzeige\s+(?:erscheinen|stehen)\s*</(?:div|p)>',
        ad_code,
        content,
        flags=re.DOTALL|re.IGNORECASE
    )
    
    if content != orig:
        with open(fp, 'w', encoding='utf-8') as f:
            f.write(content)
        count += 1
        print(f"  ✅ {fn}")

print(f"\n✅ {count} Dateien gefixt")

# Final check
remaining = 0
for fp in [os.path.join(BASE, f) for f in os.listdir(BASE) if f.endswith('.html')]:
    fp = os.path.join(BASE, f) if not os.path.isabs(f) else f
    with open(fp, 'r', encoding='utf-8') as f:
        if 'Google AdSense' in f.read():
            remaining += 1
            print(f"  ⚠️  noch: {os.path.basename(fp)}")

if remaining:
    print(f"\n⚠️  {remaining} Dateien haben noch Platzhalter")
else:
    print(f"\n✅ ALLE {count + 26} Platzhalter ersetzt!")
