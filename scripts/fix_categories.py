#!/usr/bin/env python3
"""Fix category detection in JSON metadata — use filename-based slug matching."""
import json, os

JSON_PATH = r"C:\HermesPortable\home\scripts\blog-automation\aquarium-zentrum\data\long-content-articles.json"

with open(JSON_PATH, 'r', encoding='utf-8') as f:
    articles = json.load(f)

# Slug-based category mapping (more reliable than content-scanning)
SLUG_CATS = {
    # EINSTEIGER
    "einsteiger-aquarium-guide": "Einsteiger",
    "wasserwerte-aquarium-guide": "Einsteiger",
    "aquarium-einfahren-nitritpeak": "Einsteiger",
    "beckenformen-groessen": "Einsteiger",
    "nano-aquarium-guide": "Einsteiger",
    "kaltwasser-aquarium-guide": "Einsteiger",
    "brackwasser-aquarium-guide": "Einsteiger",
    "meerwasser-aquarium-einstieg": "Einsteiger",
    "low-tech-aquarium-ohne-co2": "Einsteiger",
    "aquascaping-anfaenger": "Einsteiger",
    "aquarium-umzug-transport-guide": "Einsteiger",
    "aquarium-standort-unterschrank": "Einsteiger",
    "kind-und-aquarium-familien-guide": "Einsteiger",
    "aquarium-fotografie-guide": "Einsteiger",
    "aquarium-geraeusche-ursachen-loesungen": "Einsteiger",
    "buero-aquarium-guide": "Einsteiger",
    "diy-aquarium-bauen": "Einsteiger",
    "fische-fortgeschrittene": "Einsteiger",
    "fischbesatz-nach-beckengroesse": "Einsteiger",
    "biotop-aquarium-amazonas-asien": "Einsteiger",
    "biotop-aquarium-suedamerika": "Einsteiger",
    
    # TECHNIK
    "aquarium-technik-ueberblick": "Technik",
    "aquarium-filter-guide": "Technik",
    "aussenfilter-vs-innenfilter": "Technik",
    "aquarium-beleuchtung-guide": "Technik",
    "heizung-temperatur-aquarium": "Technik",
    "co2-im-aquarium": "Technik",
    "co2-einsteiger-guide": "Technik",
    "aquarium-automation": "Technik",
    "aquarium-kamera-livestream": "Technik",
    "aquarium-futterautomat-guide-2026": "Technik",
    "uv-klaerer-aquarium-guide": "Technik",
    "aquarium-luftpumpe-sauerstoff": "Technik",
    "osmoselage-wasseraufbereitung": "Technik",
    "aquarium-duengung-guide": "Technik",
    "stroemung-im-aquarium": "Technik",
    "aquarium-mondlicht-beleuchtung": "Technik",
    "aquarium-stromkosten-berechnen": "Technik",
    "stromausfall-aquarium-notfallplan": "Technik",
    
    # PFLANZEN
    "aquarienpflanzen-anfaenger": "Pflanzen",
    "aquarium-moosarten": "Pflanzen",
    "bodendecker-teppichpflanzen": "Pflanzen",
    "bucephalandra-anubias-javafarn": "Pflanzen",
    "rote-aquarienpflanzen": "Pflanzen",
    "hintergrundpflanzen-aquarium-arten": "Pflanzen",
    "pflanzenvermehrung-aquarium": "Pflanzen",
    "schwimmpflanzen-aquarium-guide": "Pflanzen",
    "bodengrund-aquarium-guide": "Pflanzen",
    "iwagumi-aquascape-guide": "Pflanzen",
    "steinarten-hardscape": "Pflanzen",
    "wurzeln-holz-aquarium": "Pflanzen",
    
    # FISCHE
    "beliebteste-aquarienfische": "Fische",
    "vergesellschaftung-aquarienfische": "Fische",
    "salmler-aquarium": "Fische",
    "kampffisch-haltung-betta": "Fische",
    "panzerwelse-aquarium": "Fische",
    "antennenwels-l-welse-haltung": "Fische",
    "welse-harnischwelse": "Fische",
    "diskushaltung-pflege": "Fische",
    "skalare-haltung-pflege": "Fische",
    "buntbarsche-cichliden-aquarium": "Fische",
    "fadenfische-guramis-haltung": "Fische",
    "lebendgebärende-zahnkarpfen": "Fische",
    "nachzucht-fische": "Fische",
    "fischkrankheiten-aquarium-guide": "Fische",
    
    # GARNELEN
    "garnelen-im-aquarium": "Fische",
    "garnelen-krankheiten": "Fische",
    "garnelen-nachzucht": "Fische",
    
    # PFLEGE
    "aquarium-pflegeroutine-guide": "Pflege",
    "wassertest-wasserpflege": "Pflege",
    "wasseraufbereiter-aquarium-vergleich": "Pflege",
    "algen-im-aquarium": "Pflege",
    "aquarium-schaedlinge": "Pflege",
    "algenfresser-portrait": "Pflege",
    "schnecken-im-aquarium": "Pflege",
    "aquarium-schnecken-bekaempfung": "Pflege",
    "truebes-wasser-schaum-geruch-aquarium": "Pflege",
    "quarantaene-medikamente": "Pflege",
    "pflanzenkrankheiten-mangel-aquarium": "Pflege",
    "wassertemperatur-aquarium-sommer-hitze-kuehlung": "Pflege",
    "aquarium-urlaubsbetreuung-guide": "Pflege",
    "urlaub-aquarium-futterautomat": "Pflege",
    
    # FUTTER
    "aquarium-futter-ernaehrung": "Fische",
    "futtertiere-selbst-zuechten": "Fische",
    "artemia-grindal-futtertiere-zuechten": "Fische",
    
    # SONSTIGE
    "krebse-krabben-aquarium-guide-2026": "Fische",
    "3d-rueckwand-aquarium-bauen": "Technik",
    "gesellschaftsbecken-einrichten": "Einsteiger",
}

CAT_GROUP_MAP = {
    "Einsteiger": "Einsteiger",
    "Technik": "Technik",
    "Pflanzen": "Pflanzen",
    "Fische": "Garnelen & Fische",
    "Pflege": "Pflege & Gesundheit",
}

COLORS = {
    "Einsteiger": ("#06b6d4", "#0891b2"),
    "Technik": ("#8b5cf6", "#6d28d9"),
    "Pflanzen": ("#10b981", "#059669"),
    "Fische": ("#ec4899", "#db2777"),
    "Pflege": ("#ffd93d", "#f59e0b"),
}

EMOJIS = {
    "Einsteiger": "🐟",
    "Technik": "⚙️",
    "Pflanzen": "🌿",
    "Fische": "🐟",
    "Pflege": "💊",
}

fixed = 0
for a in articles:
    slug = a['slug']
    cat = SLUG_CATS.get(slug)
    if cat and cat != a.get('cat'):
        a['cat'] = cat
        a['categoryGroup'] = CAT_GROUP_MAP[cat]
        c = COLORS[cat]
        a['catColor'] = c[0]
        a['catEmoji'] = EMOJIS[cat]
        fixed += 1

with open(JSON_PATH, 'w', encoding='utf-8') as f:
    json.dump(articles, f, ensure_ascii=False, indent=2)

# Show distribution
from collections import Counter
cats = Counter(a['cat'] for a in articles)
print(f"Fixed categories for {fixed} articles")
print("New distribution:")
for cat, count in cats.most_common():
    print(f"  {cat}: {count}")