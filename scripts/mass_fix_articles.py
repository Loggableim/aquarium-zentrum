#!/usr/bin/env python3
"""
Mass fix for all 71 articles on aquaristik-zentrum.com:
- Add Schema.org JSON-LD (BlogPosting)
- Add GENERATED_BY markers
- Add AdSense placeholder (if missing)
- Add Amazon affiliate links (if missing)
"""
import re
import os
import json
from datetime import datetime

ARTIKEL_DIR = r"C:\HermesPortable\home\scripts\blog-automation\aquarium-zentrum\content\artikel"
DOMAIN = "https://aquaristik-zentrum.com"
AFFILIATE_TAG = "tag=nova079-20"
TODAY = "2026-06-07"

# Schema.org template
def make_schema(slug, title, desc=""):
    schema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": f"{DOMAIN}/artikel/{slug}/"
        },
        "headline": title,
        "description": desc or f"Ratgeber und Guide zu: {title}",
        "author": {"@type": "Organization", "name": "Aquaristik Zentrum"},
        "publisher": {"@type": "Organization", "name": "Aquaristik Zentrum"},
        "datePublished": TODAY,
        "dateModified": TODAY,
    }
    return f'<script type="application/ld+json">\n{json.dumps(schema, ensure_ascii=False, indent=2)}\n</script>'

# AdSense placeholder
ADSENSE = '\n\n<hr style="margin:2rem 0;">\n<!-- AdSense-Placeholder -->\n<div style="background:#f9fafb;border:1px dashed #d1d5db;padding:1rem;text-align:center;border-radius:8px;margin:1.5rem 0;">\n<p style="color:#9ca3af;font-size:0.875rem;margin:0;">[ AdSense-Werbefläche ]</p>\n</div>'

# Standard affiliate links by category
AFFILIATE_LINKS = {
    "Fische": '<p><a href="https://www.amazon.de/s?k=Aquarium+Fischfutter&tag=nova079-20" target="_blank" rel="sponsored noopener nofollow">▶ Hochwertiges Fischfutter bei Amazon entdecken</a></p>',
    "Einsteiger": '<p><a href="https://www.amazon.de/s?k=Aquarium+Einsteiger+Set&tag=nova079-20" target="_blank" rel="sponsored noopener nofollow">▶ Aquarium-Einsteiger-Sets bei Amazon vergleichen</a></p>',
    "Technik": '<p><a href="https://www.amazon.de/s?k=Aquarium+Technik+Filter+Lampe&tag=nova079-20" target="_blank" rel="sponsored noopener nofollow">▶ Aquarium-Technik bei Amazon ansehen</a></p>',
    "Pflanzen": '<p><a href="https://www.amazon.de/s?k=Aquarium+Pflanzen+Dünger&tag=nova079-20" target="_blank" rel="sponsored noopener nofollow">▶ Aquarienpflanzen und Dünger bei Amazon finden</a></p>',
    "default": '<p><a href="https://www.amazon.de/s?k=Aquarium+Zubehör&tag=nova079-20" target="_blank" rel="sponsored noopener nofollow">▶ Aquarium-Zubehör bei Amazon ansehen</a></p>',
}

# Article metadata for slugs (title, category)
# Auto-detected from files
ARTICLE_META = {}

def detect_category(content, slug):
    """Try to determine category from content keywords."""
    if not content:
        return "default"
    content_lower = content.lower()
    if any(w in content_lower for w in ["meerwasser", "salz", "riff", "koralle", "osmose"]):
        return "Einsteiger"
    elif any(w in content_lower for w in ["wels", "antennenwels", "panzerwels", "harnischwels"]):
        return "Fische"
    elif any(w in content_lower for w in ["garnelen", "zwerggarnelen", "caridina", "neocaridina"]):
        return "Fische"
    elif any(w in content_lower for w in ["pflanze", "dünger", "co2", "aquascaping", "moos", "bodendecker"]):
        return "Pflanzen"
    elif any(w in content_lower for w in ["filter", "beleuchtung", "heizung", "pumpe", "technik", "automation", "kamera", "futterautomat", "uv"]):
        return "Technik"
    elif any(w in content_lower for w in ["wasserwechsel", "pflege", "krankheit", "alge", "trübung", "quarantäne"]):
        return "Pflege"
    elif any(w in content_lower for w in ["umzug", "transport", "einfahren", "nitrit", "leitfaden", "anfänger", "einstieg", "guide"]):
        return "Einsteiger"
    return "default"

def get_title_from_content(content, slug):
    """Extract title from h2 tag in content."""
    m = re.search(r'<h2>(.*?)</h2>', content)
    if m:
        return m.group(1).strip()
    return slug.replace("-", " ").title()

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    slug = os.path.splitext(os.path.basename(filepath))[0]
    modified = False
    changes = []
    
    # 1. Add GENERATED_BY marker if missing
    if 'GENERATED_BY_' not in content:
        content = f'<!-- GENERATED_BY_NOVA_BATCH_FIX -->\n{content}'
        modified = True
        changes.append("+GENERATED_BY")
    
    # 2. Add Amazon affiliate link if missing
    cat = detect_category(content, slug)
    aff_link = AFFILIATE_LINKS.get(cat, AFFILIATE_LINKS["default"])
    if AFFILIATE_TAG not in content:
        # Find the last h2 heading and insert before it
        h2_positions = [m.start() for m in re.finditer(r'<h2>', content)]
        if h2_positions:
            # Insert before the last h2
            insert_pos = h2_positions[-1]
            content = content[:insert_pos] + aff_link + '\n\n' + content[insert_pos:]
            modified = True
            changes.append("+Affiliate")
    
    # 3. Fix rel attribute order if wrong
    if 'rel="nofollow sponsored noopener"' in content:
        content = content.replace('rel="nofollow sponsored noopener"', 'rel="sponsored noopener nofollow"')
        modified = True
        changes.append("fixed rel order")
    
    # 4. Add AdSense placeholder if missing
    if 'AdSense' not in content and 'adsense' not in content.lower():
        # Find the end of content (last </script> or </div> or last paragraph)
        end_match = list(re.finditer(r'</(script|div|p|ul)>', content))
        if end_match:
            insert_pos = end_match[-1].end()
            content = content[:insert_pos] + ADSENSE + content[insert_pos:]
            modified = True
            changes.append("+AdSense")
    
    # 5. Add Schema.org if missing
    if '"@type": "BlogPosting"' not in content:
        title = get_title_from_content(content, slug)
        schema = make_schema(slug, title)
        content = content.rstrip() + '\n\n' + schema + '\n'
        modified = True
        changes.append("+Schema.org")
    
    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True, changes
    return False, ["unchanged"]

# Process all files
results = {"fixed": 0, "unchanged": 0, "changes": {}}
for f in sorted(os.listdir(ARTIKEL_DIR)):
    if f.endswith('.html'):
        fpath = os.path.join(ARTIKEL_DIR, f)
        was_fixed, changes = fix_file(fpath)
        if was_fixed:
            results["fixed"] += 1
            results["changes"][f] = changes
        else:
            results["unchanged"] += 1

print(f"Fixed: {results['fixed']} files")
print(f"Unchanged: {results['unchanged']} files")
print(f"Total: {results['fixed'] + results['unchanged']} files")
print()
print("Changes by file:")
for slug, changes in sorted(results["changes"].items()):
    print(f"  {slug}: {', '.join(changes)}")