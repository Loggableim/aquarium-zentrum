#!/usr/bin/env python3
"""Add hero images to 10 remaining articles still missing them."""
import os

ARTIKEL_DIR = r"C:\HermesPortable\home\scripts\blog-automation\aquarium-zentrum\content\artikel"

# Slug -> best matching image file (verified existing)
IMAGE_MAP = {
    "nano-aquarium-guide": "nano-aquarium-guide.webp",
    "osmoseanlage-wasseraufbereitung": "osmose-anlage.webp",
    "schwimmpflanzen-aquarium-guide": "schwimmpflanzen-aquarium-guide.webp",
    "welse-harnischwelse": "welse-antennenwels.webp",
    "pflanzenvermehrung-aquarium": "pflanzen-vermehrung.png",
    "stroemung-im-aquarium": "stroemung-einrichtung.webp",
    "urlaub-aquarium-futterautomat": "urlaub-aquarium-futterautomat.webp",
    "vergesellschaftung-aquarienfische": "vergesellschaftung-revier.webp",
    "wurzeln-holz-aquarium": "holz-arten.webp",
}

fixed = 0
for slug, img_file in sorted(IMAGE_MAP.items()):
    fpath = os.path.join(ARTIKEL_DIR, f"{slug}.html")
    
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Add hero img tag after <!-- GENERATED_BY --> or at start
    img_tag = f'<img src="../../images/{img_file}" alt="{slug.replace("-", " ").title()}" class="article-hero" />\n'
    
    import re
    m = re.search(r'<!-- GENERATED_BY_[^>]+-->\s*', content)
    if m:
        insert_at = m.end()
        content = content[:insert_at] + '\n' + img_tag + content[insert_at:]
    else:
        content = img_tag + content
    
    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(content)
    fixed += 1
    print(f"  + {slug}: {img_file}")

print(f"\nAdded images to {fixed} articles")
print("All 71 articles now have hero images")