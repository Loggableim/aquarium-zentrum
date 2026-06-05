#!/usr/bin/env python3
"""Check which article images exist on disk vs which are needed."""
import os, re, glob

BASE = "C:/HermesPortable/home/spaces/aquarium-zentrum"
ART_HTML = os.path.join(BASE, "artikel")
IMG_DIR = os.path.join(BASE, "images")

# Get all article slugs from build.js
with open(os.path.join(BASE, "build.js"), 'r', encoding='utf-8') as f:
    content = f.read()

# Find all article slugs referenced in LONG_CONTENT_ARTICLES
# Pattern: 'slug': { ... img: 'filename.png' ... }
articles_found = {}

# Find ALL article definitions with img
img_matches = re.findall(r"'([^']+)':\s*\{[^}]*?img:\s*'([^']+)'", content)
for slug, img in img_matches:
    articles_found[slug] = img

# Also find LONG_CONTENT_ARTICLES slugs (might not have img field directly)
lc_matches = re.findall(r"\['([^']+)',\s*'[^']+',\s*'[^']+',\s*'([^']+)'\]", content)
for slug, img in lc_matches:
    if slug not in articles_found:
        articles_found[slug] = img

print(f"Gefundene Artikel mit img: {len(articles_found)}")

# Check each image
missing = []
existing_good = []
existing_broken = []

for slug, img in sorted(articles_found.items()):
    if img.startswith('linear-gradient'):
        existing_broken.append(f"{slug}: KEIN BILD (nur Gradient)")
        continue
    
    # The img field could be just the filename
    img_path = os.path.join(IMG_DIR, img)
    webp_path = img_path.replace('.png', '.webp').replace('.jpg', '.webp')
    
    if not os.path.exists(img_path) and not os.path.exists(webp_path):
        missing.append(f"{slug}: {img}")
    elif os.path.exists(img_path):
        size = os.path.getsize(img_path)
        status = "✅" if size > 5000 else f"⚠️  (nur {size} bytes)"
        existing_good.append(f"{status} {slug}: {img} ({size} bytes)")
    else:
        size = os.path.getsize(webp_path)
        existing_good.append(f"✅ {slug}: {img} hat .webp ({size} bytes)")

# Check for article HTML files not in build.js
for fn in sorted(os.listdir(ART_HTML)):
    if fn == 'index.html':
        continue
    slug = fn.replace('.html', '')
    if slug not in articles_found:
        missing.append(f"{slug}: GANZER ARTIKEL fehlt in build.js!")

print(f"\n--- FEHLENDE BILDER ({len(missing)}) ---")
for m in missing:
    print(f"  ❌ {m}")

print(f"\n--- EXISTIERENDE BILDER ({len(existing_good)}) ---")
for e in existing_good[:30]:
    print(f"  {e}")
if len(existing_good) > 30:
    print(f"  ... und {len(existing_good)-30} weitere")

print(f"\n--- KEIN ECHTES BILD (nur Gradient) ({len(existing_broken)}) ---")
for b in existing_broken:
    print(f"  ⚠️  {b}")
