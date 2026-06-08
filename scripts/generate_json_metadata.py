#!/usr/bin/env python3
"""
Generate complete long-content-articles.json from all HTML files.
"""
import os, re, json

ARTIKEL_DIR = r"C:\HermesPortable\home\scripts\blog-automation\aquarium-zentrum\content\artikel"
JSON_PATH = r"C:\HermesPortable\home\scripts\blog-automation\aquarium-zentrum\data\long-content-articles.json"

# Read existing JSON to preserve existing entries
existing = []
if os.path.exists(JSON_PATH):
    try:
        with open(JSON_PATH, 'r', encoding='utf-8') as f:
            existing = json.load(f)
    except:
        pass

existing_slugs = {e['slug'] for e in existing}

# Category detection
def detect_cat(content, slug):
    c = content.lower()
    cat_map = {
        "Technik": ["filter", "beleuchtung", "heizung", "pumpe", "luftpumpe", "technik", "automation", "kamera", "futterautomat", "uv-c", "uv-klaerer", "stroemung", "stromausfall"],
        "Fische": ["welse", "antennenwels", "panzerwels", "harnischwels", "garnelen", "salmler", "kampffisch", "betta", "diskus", "skalar", "cichlide", "buntbarsch", "lebendgebärend", "zahnkarpfen", "fischbesatz", "nachzucht"],
        "Pflanzen": ["pflanze", "aquascaping", "moos", "bucephalandra", "anubias", "javafarn", "teppichpflanze", "bodendecker", "co2", "dünger", "duengung", "roth", "hintergrundpflanze"],
        "Pflege": ["wasserwechsel", "pflege", "krankheit", "alge", "trübung", "trübes", "quarantäne", "wasserwert", "wassertest", "wasseraufbereiter", "schnecken", "schädling"],
        "Einsteiger": ["umzug", "transport", "einfahren", "nitritpeak", "anfänger", "einsteiger", "einstieg", "leitfaden", "kaltwasser", "brackwasser", "meerwasser", "beckenform", "nano", "low-tech"],
    }
    for cat, keywords in cat_map.items():
        if slug in c:
            pass
        for kw in keywords:
            if kw in c or kw in slug:
                return cat
    return "Einsteiger"

def extract_title(content):
    m = re.search(r'<h2>(.*?)</h2>', content)
    if m:
        t = m.group(1).strip()
        # Remove leading meta-text
        t = re.sub(r'^Worum es in diesem Guide geht\b', '', t).strip(' –:')
        if t:
            return t
    return ""

def extract_first_para(content):
    m = re.search(r'<p>(.*?)</p>', content)
    if m:
        text = re.sub(r'<[^>]+>', '', m.group(1))
        if len(text) > 40:
            return text[:200] + "…" if len(text) > 200 else text
    return ""

def word_count(content):
    text = re.sub(r'<[^>]+>', '', content)
    return len(text.split())

# Build complete list
articles = []
for fname in sorted(os.listdir(ARTIKEL_DIR)):
    if not fname.endswith('.html'):
        continue
    slug = fname.replace('.html', '')
    fpath = os.path.join(ARTIKEL_DIR, fname)
    
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    title = extract_title(content)
    if not title:
        title = slug.replace('-', ' ').title()
    
    wc = word_count(content)
    cat = detect_cat(content, slug)
    
    # Map to proper category groups
    cat_group_map = {
        "Technik": "Technik",
        "Einsteiger": "Einsteiger",
        "Fische": "Garnelen & Fische",
        "Pflanzen": "Pflanzen",
        "Pflege": "Pflege & Gesundheit",
    }
    cat_group = cat_group_map.get(cat, "Einsteiger")
    
    # Color map
    color_map = {
        "Technik": ("#8b5cf6", "#6d28d9"),
        "Einsteiger": ("#06b6d4", "#0891b2"),
        "Fische": ("#ec4899", "#db2777"),
        "Pflanzen": ("#10b981", "#059669"),
        "Pflege": ("#ffd93d", "#f59e0b"),
    }
    colors = color_map.get(cat, ("#06b6d4", "#0891b2"))
    
    # Emoji map
    emoji_map = {
        "Technik": "⚙️",
        "Einsteiger": "🐟",
        "Fische": "🐟",
        "Pflanzen": "🌿",
        "Pflege": "💊",
    }
    
    article = {
        "slug": slug,
        "title": title,
        "excerpt": extract_first_para(content),
        "topic": title.split(":")[0].split("–")[0].strip() if ":" in title or "–" in title else title[:40],
        "cat": cat,
        "categoryGroup": cat_group,
        "catColor": colors[0],
        "catEmoji": emoji_map.get(cat, "🐟"),
        "readingTime": max(3, wc // 200),
        "img": f"{slug}.png",
        "toc": [],
        "related": [],
        "prod": [],
        "intent": f"Ratgeber und Guide: {title}",
        "date": "7. Juni 2026",
        "generated": True,
        "_wordcount": wc
    }
    articles.append(article)

# Remove _wordcount before saving
for a in articles:
    a.pop('_wordcount', None)

with open(JSON_PATH, 'w', encoding='utf-8') as f:
    json.dump(articles, f, ensure_ascii=False, indent=2)

print(f"Written {len(articles)} articles to JSON metadata")
print(f"New articles added: {len(articles) - len(existing_slugs)}")