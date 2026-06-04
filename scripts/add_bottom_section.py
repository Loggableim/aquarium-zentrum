#!/usr/bin/env python3
"""Add 'Weiterführende Artikel' bottom section to orphan articles."""
import re
import os

base = 'C:/HermesPortable/home/spaces/aquarium-zentrum/artikel'

# Mapping: slug -> list of (slug, title) from sidebar links
orphan_data = {
    '3d-rueckwand-aquarium-bauen': [
        ('diy-aquarium-bauen', 'DIY Aquarium bauen'),
        ('aquascaping-anfaenger', 'Aquascaping für Anfänger'),
        ('bodengrund-aquarium-guide', 'Bodengrund-Guide'),
        ('wurzeln-holz-aquarium', 'Wurzeln und Holz im Aquarium'),
    ],
    'aquarium-fotografie-guide': [
        ('aquarium-beleuchtung-guide', 'Aquarium Beleuchtung Guide'),
        ('aquarium-technik-ueberblick', 'Aquarium Technik Überblick'),
        ('aquascaping-anfaenger', 'Aquascaping für Anfänger'),
        ('einsteiger-aquarium-guide', 'Einsteiger-Aquarium Guide'),
    ],
    'aquarium-standort-unterschrank': [
        ('einsteiger-aquarium-guide', 'Einsteiger-Aquarium Guide'),
        ('diy-aquarium-bauen', 'DIY Aquarium bauen'),
        ('beckenformen-groessen', 'Beckenformen und Größen'),
        ('aquarium-technik-ueberblick', 'Aquarium Technik Überblick'),
    ],
    'aquarium-urlaubsbetreuung-guide': [
        ('aquarium-pflegeroutine-guide', 'Aquarium Pflegeroutine'),
        ('aquarium-automation', 'Aquarium Automation'),
        ('aquarium-technik-ueberblick', 'Aquarium Technik Überblick'),
        ('heizung-temperatur-aquarium', 'Heizung und Temperatur'),
    ],
    'buero-aquarium-guide': [
        ('nano-aquarium-guide', 'Nano Aquarium Guide'),
        ('einsteiger-aquarium-guide', 'Einsteiger-Aquarium Guide'),
        ('aquarium-pflegeroutine-guide', 'Aquarium Pflegeroutine'),
        ('garnelen-im-aquarium', 'Garnelen im Aquarium'),
    ],
    'buntbarsche-cichliden-aquarium': [
        ('fische-fortgeschrittene', 'Fische für Fortgeschrittene'),
        ('wasserwerte-aquarium-guide', 'Wasserwerte-Guide'),
        ('vergesellschaftung-aquarienfische', 'Vergesellschaftung'),
        ('aquarium-einfahren-nitritpeak', 'Aquarium einfahren'),
        ('fischkrankheiten-aquarium-guide', 'Fischkrankheiten Guide'),
    ],
    'fadenfische-guramis-haltung': [
        ('vergesellschaftung-aquarienfische', 'Vergesellschaftung'),
        ('panzerwelse-aquarium', 'Panzerwelse im Aquarium'),
        ('aquarium-futter-ernaehrung', 'Aquarium Futter und Ernährung'),
        ('nachzucht-fische', 'Nachzucht von Fischen'),
    ],
    'krebse-krabben-aquarium-guide-2026': [
        ('garnelen-im-aquarium', 'Garnelen im Aquarium'),
        ('aquarium-einfahren-nitritpeak', 'Aquarium einfahren'),
        ('gesellschaftsbecken-einrichten', 'Gesellschaftsbecken einrichten'),
        ('algenfresser-portrait', 'Algenfresser Porträt'),
    ],
    'schwimmpflanzen-aquarium': [
        ('aquarienpflanzen-anfaenger', 'Aquarienpflanzen für Anfänger'),
        ('rote-aquarienpflanzen', 'Rote Aquarienpflanzen'),
        ('pflanzenvermehrung-aquarium', 'Pflanzenvermehrung'),
        ('aquascaping-anfaenger', 'Aquascaping für Anfänger'),
    ],
    'skalare-haltung-pflege': [
        ('fische-fortgeschrittene', 'Fische für Fortgeschrittene'),
        ('vergesellschaftung-aquarienfische', 'Vergesellschaftung'),
        ('buntbarsche-cichliden-aquarium', 'Buntbarsche und Cichliden'),
        ('nachzucht-fische', 'Nachzucht von Fischen'),
    ],
}

def build_bottom_section(links):
    """Generate the Weiterführende Artikel HTML."""
    cards = ''
    for slug, title in links:
        cards += f"""      <a href="/artikel/{slug}.html" class="related-bottom-card">
        <h4>{title}</h4>
        <p>Weitere Informationen und Tipps zu diesem Thema</p>
        <span class="read-link-sm">Weiterlesen →</span>
      </a>
"""
    return f"""    <div class="related-bottom">
      <h3>📖 Weiterführende Artikel</h3>
      <div class="related-bottom-grid">
{cards}      </div>
    </div>
"""

for slug, links in orphan_data.items():
    path = os.path.join(base, f'{slug}.html')
    if not os.path.exists(path):
        print(f"  SKIP (not found): {slug}")
        continue
    
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if already has the section
    if 'Weiterführende' in content:
        print(f"  SKIP (already has): {slug}")
        continue
    
    # Find the closing </div> of body-text
    # Pattern: </div>\n    </div>\n    <div class="article-sidebar">
    # We want to insert before the last </div> of body-text
    
    bottom_section = build_bottom_section(links)
    
    # Insert before: </div>\n    </div>\n    <div class="article-sidebar">
    target = '</div>\n    </div>\n    <div class="article-sidebar">'
    replacement = bottom_section + target
    
    if target not in content:
        print(f"  ERROR: pattern not found in {slug}")
        continue
    
    content = content.replace(target, replacement)
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"  DONE: {slug}")

print("\nAll orphan articles processed!")
