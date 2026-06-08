#!/usr/bin/env python3
"""
Fix missing hero images in all aquarium-zentrum articles.
Maps slug → best available image file from images/ directory.
"""
import os, re

ARTIKEL_DIR = r"C:\HermesPortable\home\scripts\blog-automation\aquarium-zentrum\content\artikel"
IMAGES_DIR = r"C:\HermesPortable\home\scripts\blog-automation\aquarium-zentrum\images"

# Get all image filenames
all_images = set(os.listdir(IMAGES_DIR))

# SLUG → BEST IMAGE MAPPING (manually curated based on files in images/)
# Format: slug -> (primary_img, is_hero) where is_hero means use hero- prefix
IMAGE_MAP = {
    "antennenwels-l-welse-haltung": "antennenwels-l-welse-haltung.webp",
    "aquarium-beleuchtung-guide": "beleuchtung.webp",
    "aquarium-duengung-guide": "duengung-pflanzen.webp",
    "aquarium-filter-guide": "filter-guide.webp",
    "aquarium-kamera-livestream": "hero-aquarium-kamera-livestream.webp",
    "aquarium-luftpumpe-sauerstoff": "technik.png",  # best match available
    "aquarium-schaedlinge": "aquarium-schaedlinge.webp",
    "aquarium-technik-ueberblick": "technik.webp",
    "aquarium-umzug-transport-guide": "aquarium-umzug-transport-guide.webp",
    "aquascaping-anfaenger": "aquascaping.webp",
    "artemia-grindal-futtertiere-zuechten": "hero-artemia-grindal-futtertiere-zuechten.webp",
    "biotop-aquarium-amazonas-asien": "biotop-aquarium-suedamerika.webp",
    "bodendecker-teppichpflanzen": "bodendecker-teppichpflanzen_00001_.png",
    "bucephalandra-anubias-javafarn": "aquarienpflanzen.webp",
    "co2-im-aquarium": "co2-anlage.webp",
    "fischbesatz-nach-beckengroesse": "gesellschaft-fische.webp",
    "garnelen-im-aquarium": "garnelen.webp",
    "iwagumi-aquascape-guide": "aquascaping.webp",
    "kampffisch-haltung-betta": "kampffisch-haltung.webp",
    "meerwasser-aquarium-einstieg": "meerwasser-aquarium-einstieg.webp",
    "nachzucht-fische": "nachzucht-becken.webp",
    "nano-aquarium-guide": "nano-aquarium-guide.webp",
    "osmoseanlage-wasseraufbereitung": "osmose-anlage.webp",
    "panzerwelse-aquarium": "panzerwelse.webp",
    "pflanzenvermehrung-aquarium": "pflanzen-vermehrung.webp",
    "quarantaene-medikamente": "quarantaene-becken.webp",
    "rote-aquarienpflanzen": "rote-pflanzen-arten.webp",
    "salmler-aquarium": "salmler.webp",
    "schnecken-im-aquarium": "schnecken-im-aquarium.webp",
    "schwimmpflanzen-aquarium-guide": "schwimmpflanzen-aquarium-guide.webp",
    "steinarten-hardscape": "stein-arten.webp",
    "stroemung-im-aquarium": "stroemung-einrichtung.webp",
    "stromausfall-aquarium-notfallplan": "technik.webp",
    "truebes-wasser-schaum-geruch-aquarium": "truebes-wasser-schaum-geruch-aquarium.webp",
    "urlaub-aquarium-futterautomat": "urlaub-aquarium-futterautomat.webp",
    "uv-klaerer-aquarium-guide": "aquarium-schaedlinge.webp",
    "vergesellschaftung-aquarienfische": "vergesellschaftung-revier.webp",
    "wasseraufbereiter-aquarium-vergleich": "wasserpflege-produkte.webp",
    "wassertest-wasserpflege": "wassertest-set.webp",
    "wasserwerte-aquarium-guide": "wassertest-set.webp",
    "welse-harnischwelse": "welse-antennenwels.webp",
    "wurzeln-holz-aquarium": "holz-arten.webp",
}

# Existing WRONG references -> CORRECT filename
WRONG_REF_FIXES = {
    "algen-aquarium.webp": "algen.webp",
    "aquarienpflanzen-anfaenger.webp": "aquarienpflanzen.webp",
    "aquarium-einfahren-nitritpeak.webp": "aquarium-einfahren.webp",
    "technik-ueberblick.webp": "technik.webp",
    "biotop-aquarium-amazonas-asien.webp": "biotop-aquarium-suedamerika.webp",
    "co2-im-aquarium.webp": "co2-anlage.webp",
    "fischbesatz-nach-beckengroesse.webp": "gesellschaft-fische.webp",
    "garnelen-aquarium.webp": "garnelen.webp",
    "iwagumi-aquascape-guide.webp": "aquascaping.webp",
    "kampffisch-haltung-betta-png.webp": "kampffisch-haltung.webp",
    "aquarium-luftpumpe-sauerstoff.webp": "technik.webp",
    "bucephalandra-anubias-javafarn.webp": "aquarienpflanzen.webp",
    "bodendecker-teppichpflanzen.webp": "bodendecker-teppichpflanzen_00001_.png",
}

def add_hero_image(content, slug, img_file):
    """Add hero <img> tag right after GENERATED_BY comment or at the very beginning."""
    img_tag = f'<img src="../../images/{img_file}" alt="{slug.replace("-", " ").title()}" class="article-hero" />\n'
    
    # Check if already has images/ reference
    if f'images/' in content:
        return content, False  # Already has some image
    
    # Insert after <!-- GENERATED_BY --> or at the start
    m = re.search(r'<!-- GENERATED_BY_[^>]+-->\s*', content)
    if m:
        insert_at = m.end()
        content = content[:insert_at] + '\n' + img_tag + content[insert_at:]
    else:
        content = img_tag + content.lstrip()
    
    return content, True

def fix_wrong_image_refs(content):
    """Fix wrong image filenames in existing references."""
    modified = False
    for wrong, correct in WRONG_REF_FIXES.items():
        old = f'images/{wrong}'
        new = f'images/{correct}'
        if old in content:
            content = content.replace(old, new)
            modified = True
    return content, modified

fixed_count = 0
for fname in sorted(os.listdir(ARTIKEL_DIR)):
    if not fname.endswith('.html'):
        continue
    slug = fname.replace('.html', '')
    fpath = os.path.join(ARTIKEL_DIR, fname)
    
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    changes = []
    
    # 1. Fix wrong image references
    content, ref_fixed = fix_wrong_image_refs(content)
    if ref_fixed:
        changes.append("fixed refs")
    
    # 2. Add hero image if none exists
    if 'images/' not in content:
        if slug in IMAGE_MAP:
            img_file = IMAGE_MAP[slug]
            if img_file in all_images:
                content, img_added = add_hero_image(content, slug, img_file)
                if img_added:
                    changes.append(f"+{img_file}")
    
    if changes:
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(content)
        fixed_count += 1
        print(f"  {slug}: {', '.join(changes)}")

print(f"\nTotal: {fixed_count} files updated")