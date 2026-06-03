#!/usr/bin/env node
/**
 * build.js — Aquaristik Zentrum Static Site Builder v3 (Megamagazin)
 * Reads templates/ + page data → generates all HTML files.
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const TEMPLATES = path.join(ROOT, '_templates');
const CONTENT = path.join(ROOT, 'content');
const OUTPUT = ROOT;

function readTemplate(name) {
  return fs.readFileSync(path.join(TEMPLATES, name), 'utf-8');
}

const T = {
  head: readTemplate('head.html'),
  nav: readTemplate('nav.html'),
  footer: readTemplate('footer.html'),
  cookie: readTemplate('cookie.html'),
  pageHero: readTemplate('page-hero.html'),
};

// ── Helpers ──
function cardHTML(slug, title, excerpt, img, cat, catColor, date, readingTime) {
  const imgStyle = img.startsWith('linear-gradient')
    ? `background:${img}`
    : `background-image:url('/images/${img}')`;
  const catStyle = catColor && catColor.startsWith('#ffd93d')
    ? `background:${catColor};color:#0a0a0f;`
    : `background:${catColor || 'rgba(0,0,0,0.5)'};`;
  return `<a href="/artikel/${slug}" class="card-modern">
    <div class="art-img" style="${imgStyle}">
      <span class="cat-badge" style="${catStyle}">${cat}</span>
      ${readingTime ? `<span class="read-badge">${readingTime} Min</span>` : ''}
    </div>
    <div class="art-body">
      <span class="date">${date}</span>
      <h4>${title}</h4>
      <p>${excerpt}</p>
      <span class="read-link">Weiterlesen →</span>
    </div>
  </a>`;
}

function heroCardHTML(slug, title, excerpt, img, cat, catColor, date, readingTime) {
  const imgStyle = img.startsWith('linear-gradient')
    ? `background:${img}`
    : `background-image:url('/images/${img}')`;
  const catStyle = catColor && catColor.startsWith('#ffd93d')
    ? `background:${catColor};color:#0a0a0f;`
    : `background:${catColor || 'rgba(0,0,0,0.5)'};`;
  return `<a href="/artikel/${slug}" class="hero-card">
    <div class="hero-card-bg" style="${imgStyle}"></div>
    <div class="hero-card-overlay"></div>
    <div class="hero-card-body">
      <span class="hero-card-tag" style="${catStyle}">${cat}</span>
      <h3>${title}</h3>
      <p>${excerpt}</p>
      <span class="hero-card-meta">${date} · ${readingTime} Min Lesezeit</span>
    </div>
  </a>`;
}

function recCardHTML(slug, title, desc, img) {
  const imgStyle = img.startsWith('linear-gradient')
    ? `background:${img}`
    : `background-image:url('/images/${img}')`;
  return `<a href="/artikel/${slug}" class="rec-card">
  <div class="rthumb" style="${imgStyle}"></div>
  <div class="rinfo"><h6>${title}</h6><small>${desc}</small></div>
</a>`;
}

function tocItem(text) {
  return `<div class="toc-item">→ ${text}</div>`;
}

function topicTag(name, color, url) {
  return `<a href="${url}" class="topic-tag" style="--topic-color:${color}">${name}</a>`;
}

// ── ARTICLE DATA ──
const ARTICLES = {
  'einsteiger-aquarium-guide': {
    title: 'Der ultimative Einsteiger-Guide für dein erstes Aquarium',
    excerpt: 'Von der Beckengröße über die Technik bis zum ersten Besatz – der komplette Start-Guide.',
    date: '1. Juni 2025',
    cat: 'Einsteiger', catColor: '#06b6d4', catEmoji: '🐟',
    img: 'einsteiger-guide.png', readingTime: 8,
    toc: ['Warum ein Aquarium?', 'Die richtige Beckengröße', 'Technik: Was du brauchst', 'Der richtige Standort', 'Einrichtung Schritt für Schritt', 'Erster Besatz', 'Regelmäßige Pflege', 'Fazit'],
    related: [
      ['bodengrund-aquarium-guide', 'Bodengrund-Guide', 'Die richtige Substratwahl', 'bodengrund-arten.png'],
      ['aquarium-einfahren-nitritpeak', 'Aquarium einfahren', 'Nitritpeak sicher meistern', 'aquarium-einfahren.png'],
      ['wasserwerte-aquarium-guide', 'Wasserwerte-Guide', 'pH, GH, KH einfach erklärt', 'linear-gradient(135deg,#06b6d4,#0891b2)'],
      ['kampffisch-haltung-betta', 'Kampffisch Haltung', 'Betta splendens Pflege', 'kampffisch-haltung.png'],
    ],
    prod: ['Aquarium Komplettset', 'Ideal für den Start in die Aquaristik', 'B00CIF8TCS', '#06b6d4', '#0891b2'],
  },
  'bodengrund-aquarium-guide': {
    title: 'Aquarium Bodengrund – Die richtige Substratwahl',
    excerpt: 'Kies, Sand, Nährboden oder Soil? Der große Ratgeber für den perfekten Bodengrund.',
    date: '3. Juni 2026',
    cat: 'Einsteiger', catColor: '#06b6d4', catEmoji: '🐟',
    img: 'bodengrund-arten.png', readingTime: 8,
    toc: ['Bodengrund-Arten', 'Kies & Sand', 'Nährboden & Soil', 'Schichtung', 'Pflege & Reinigung'],
    related: [
      ['einsteiger-aquarium-guide', 'Einsteiger-Guide', 'Kompletter Start-Guide', 'einsteiger-guide.png'],
      ['aquarium-einfahren-nitritpeak', 'Aquarium einfahren', 'Nitritpeak meistern', 'aquarium-einfahren.png'],
      ['aquarienpflanzen-anfaenger', 'Pflanzen-Guide', '15 Arten für den Start', 'aquarienpflanzen.png'],
      ['wasserwerte-aquarium-guide', 'Wasserwerte', 'pH, GH, KH verstehen', 'linear-gradient(135deg,#06b6d4,#0891b2)'],
    ],
    prod: ['Aquarium Bodengrund Set', 'Nährboden + Kies, 10kg', 'B07T8V5HZY', '#0d9488', '#06b6d4'],
  },
  'aquarienpflanzen-anfaenger': {
    title: 'Aquarienpflanzen für Anfänger – Pflegeleichte Arten',
    excerpt: 'Anubias, Javafarn, Vallisnerie & mehr – die 15 besten Pflanzen für den Start.',
    date: '2. Juni 2026',
    cat: 'Pflanzen', catColor: '#10b981', catEmoji: '🌿',
    img: 'aquarienpflanzen.png', readingTime: 7,
    toc: ['Warum Pflanzen?', 'Die 15 besten Arten', 'Pflanzung & Pflege', 'Düngung', 'CO₂ & Licht', 'Fazit'],
    related: [
      ['co2-im-aquarium', 'CO₂-Guide', 'Anlage, Diffusor, Test', 'co2-anlage.png'],
      ['aquascaping-anfaenger', 'Aquascaping', 'Hardscape & Gestaltung', 'aquascaping.png'],
      ['bodengrund-aquarium-guide', 'Bodengrund-Guide', 'Substrat für Pflanzen', 'bodengrund-arten.png'],
      ['aquarium-pflegeroutine-guide', 'Pflegeroutine', 'Wasserwechsel & mehr', 'wasserwechsel.png'],
    ],
    prod: ['Pflanzenset für Aquarien', '10 pflegeleichte Arten', 'B00DB3HGG4', '#10b981', '#059669'],
  },
  'aquascaping-anfaenger': {
    title: 'Aquascaping für Anfänger – Atemberaubende Unterwasserlandschaften',
    excerpt: 'Hardscape, Pflanzenarrangement und Gestaltungsregeln für dein Traum-Aquarium.',
    date: '25. Mai 2025',
    cat: 'Aquascaping', catColor: '#0d9488', catEmoji: '🪨',
    img: 'aquascaping.png', readingTime: 6,
    toc: ['Was ist Aquascaping?', 'Hardscape wählen', 'Gestaltungsregeln', 'Pflanzenarrangement', 'Pflege', 'Fazit'],
    related: [
      ['aquarienpflanzen-anfaenger', 'Pflanzen-Guide', '15 Arten im Porträt', 'aquarienpflanzen.png'],
      ['co2-im-aquarium', 'CO₂-Guide', 'Düngung für Aquascaper', 'co2-anlage.png'],
      ['garnelen-im-aquarium', 'Garnelen-Guide', 'Tiere fürs Aquascape', 'garnelen.png'],
      ['bodengrund-aquarium-guide', 'Bodengrund-Guide', 'Soil für Aquascaping', 'bodengrund-arten.png'],
    ],
    prod: ['Aquascaping Hardscape Set', 'Steine & Wurzeln', 'B0BZ7XQ8J7', '#0d9488', '#0f766e'],
  },
  'garnelen-im-aquarium': {
    title: 'Garnelen im Aquarium – Haltung, Pflege und Vermehrung',
    excerpt: 'Alles über Zwerggarnelen: artgerechte Haltung, Wasserwerte und erfolgreiche Nachzucht.',
    date: '18. Mai 2025',
    cat: 'Garnelen', catColor: '#ff6b6b', catEmoji: '🦐',
    img: 'garnelen.png', readingTime: 7,
    toc: ['Arten für Einsteiger', 'Aquarium einrichten', 'Wasserwerte', 'Ernährung', 'Vermehrung', 'Fazit'],
    related: [
      ['kampffisch-haltung-betta', 'Kampffisch', 'Betta splendens Pflege', 'kampffisch-haltung.png'],
      ['beliebteste-aquarienfische', 'Aquarienfische', 'Top 10 für Einsteiger', 'linear-gradient(135deg,#ec4899,#db2777)'],
      ['algen-im-aquarium', 'Algen-Guide', 'Erkennen & vorbeugen', 'algen.png'],
      ['einsteiger-aquarium-guide', 'Einsteiger-Guide', 'Kompletter Start', 'einsteiger-guide.png'],
    ],
    prod: ['Garnelen-Futter Set', 'Hochwertige Nahrung', 'B0D6FZWF5R', '#ff6b6b', '#e24545'],
  },
  'algen-im-aquarium': {
    title: 'Algen im Aquarium erkennen, bekämpfen und vorbeugen',
    excerpt: 'Der komplette Guide zu Fadenalgen, Bartalgen, Kieselalgen und Co.',
    date: '2. Juni 2026',
    cat: 'Pflege', catColor: '#ffd93d', catEmoji: '💊',
    img: 'algen.png', readingTime: 8,
    toc: ['Algen verstehen', 'Fadenalgen', 'Bartalgen', 'Kieselalgen', 'Blaualgen', 'Vorbeugung', 'Fazit'],
    related: [
      ['fischkrankheiten-aquarium-guide', 'Fischkrankheiten', 'Diagnose & Behandlung', 'krankheiten-symptome.png'],
      ['aquarium-pflegeroutine-guide', 'Pflegeroutine', 'Wartungsplan', 'wasserwechsel.png'],
      ['aquarium-technik-ueberblick', 'Technik-Guide', 'Filter, Licht, CO₂', 'technik.png'],
      ['aquarienpflanzen-anfaenger', 'Pflanzen-Guide', 'Gesunde Pflanzen', 'aquarienpflanzen.png'],
    ],
    prod: ['Algenbekämpfung Set', 'Effektiv gegen Algen', 'B0D6FZWF5R', '#ffd93d', '#f59e0b'],
  },
  'aquarium-technik-ueberblick': {
    title: 'Aquarium-Technik im Überblick – Filter, Beleuchtung, Heizung & CO₂',
    excerpt: 'Die richtige Technik ist das Herz jedes Aquariums. Alles zu Filtern, Licht und CO₂.',
    date: '2. Juni 2026',
    cat: 'Technik', catColor: '#8b5cf6', catEmoji: '⚙️',
    img: 'technik.png', readingTime: 6,
    toc: ['Filter', 'Beleuchtung', 'Heizung', 'CO₂-Anlage', 'Kaufberatung', 'Fazit'],
    related: [
      ['co2-im-aquarium', 'CO₂-Guide', 'Anlage, Diffusor', 'co2-anlage.png'],
      ['einsteiger-aquarium-guide', 'Einsteiger-Guide', 'Was brauche ich?', 'einsteiger-guide.png'],
      ['aquascaping-anfaenger', 'Aquascaping', 'Technik fürs Aquascape', 'aquascaping.png'],
      ['bodengrund-aquarium-guide', 'Bodengrund-Guide', 'Basis für Technik', 'bodengrund-arten.png'],
    ],
    prod: ['Aquarium Filter Set', 'Leistungsstark & leise', 'B0DDLNYNNL', '#8b5cf6', '#7c3aed'],
  },
  'wasserwerte-aquarium-guide': {
    title: 'Aquarium Wasserwerte: Der komplette Guide zu pH, GH, KH, NO₂ & NO₃',
    excerpt: 'Alle Wasserwerte verstehen und richtig messen – für gesunde Fische und Pflanzen.',
    date: '15. Juni 2025',
    cat: 'Einsteiger', catColor: '#06b6d4', catEmoji: '🐟',
    img: 'einsteiger-guide.png', readingTime: 7,
    toc: ['pH-Wert', 'Gesamthärte GH', 'Karbonathärte KH', 'Nitrit NO₂', 'Nitrat NO₃', 'Testkits', 'Fazit'],
    related: [
      ['einsteiger-aquarium-guide', 'Einsteiger-Guide', 'Kompletter Start', 'einsteiger-guide.png'],
      ['aquarium-einfahren-nitritpeak', 'Aquarium einfahren', 'Nitritpeak meistern', 'aquarium-einfahren.png'],
      ['garnelen-im-aquarium', 'Garnelen-Guide', 'Wasserwerte für Garnelen', 'garnelen.png'],
      ['fischkrankheiten-aquarium-guide', 'Fischkrankheiten', 'Wasser als Ursache', 'krankheiten-symptome.png'],
    ],
    prod: ['Wassertest Set', 'Alle wichtigen Tests', 'B0D6FZWF5R', '#06b6d4', '#0891b2'],
  },
  'beliebteste-aquarienfische': {
    title: 'Die 10 beliebtesten Aquarienfische für Einsteiger',
    excerpt: 'Arten, Haltung und Steckbriefe der beliebtesten Aquarienfische für den Start.',
    date: '15. Juni 2025',
    cat: 'Fische', catColor: '#ec4899', catEmoji: '🐟',
    img: 'linear-gradient(135deg,#ec4899,#db2777)', readingTime: 6,
    toc: ['Platz 1-3', 'Platz 4-6', 'Platz 7-10', 'Vergesellschaftung', 'Fazit'],
    related: [
      ['kampffisch-haltung-betta', 'Kampffisch', 'Betta splendens Pflege', 'kampffisch-haltung.png'],
      ['garnelen-im-aquarium', 'Garnelen-Guide', 'Wirbellose im Becken', 'garnelen.png'],
      ['einsteiger-aquarium-guide', 'Einsteiger-Guide', 'Starten mit Fischen', 'einsteiger-guide.png'],
      ['bodengrund-aquarium-guide', 'Bodengrund-Guide', 'Basis fürs Aquarium', 'bodengrund-arten.png'],
    ],
    prod: ['Aquarium Komplettset', 'Ideal für Einsteiger', 'B00CIF8TCS', '#ec4899', '#db2777'],
  },
  'aquarium-einfahren-nitritpeak': {
    title: 'Aquarium einfahren und Nitritpeak – Schritt-für-Schritt zum stabilen Becken',
    excerpt: 'Die Einlaufphase sicher meistern – Wasserwerte messen und ersten Besatz planen.',
    date: '2. Juni 2026',
    cat: 'Einsteiger', catColor: '#06b6d4', catEmoji: '🐟',
    img: 'aquarium-einfahren.png', readingTime: 7,
    toc: ['Was bedeutet Einfahren?', 'Der Stickstoffkreislauf', 'Phase 1: Ammoniak', 'Phase 2: Nitritpeak', 'Phase 3: Nitrat', 'Erster Besatz', 'Fazit'],
    related: [
      ['einsteiger-aquarium-guide', 'Einsteiger-Guide', 'Kompletter Start', 'einsteiger-guide.png'],
      ['bodengrund-aquarium-guide', 'Bodengrund-Guide', 'Basis fürs Becken', 'bodengrund-arten.png'],
      ['wasserwerte-aquarium-guide', 'Wasserwerte', 'Testen & verstehen', 'linear-gradient(135deg,#06b6d4,#0891b2)'],
      ['aquarium-pflegeroutine-guide', 'Pflegeroutine', 'Nach der Einfahrzeit', 'wasserwechsel.png'],
    ],
    prod: ['Wassertest Set', 'Für die Einfahrphase', 'B0D6FZWF5R', '#06b6d4', '#0891b2'],
  },
  'kampffisch-haltung-betta': {
    title: 'Kampffisch Haltung – Betta splendens artgerecht im Aquarium pflegen',
    excerpt: 'Aquariumgröße, Wasserwerte, Einrichtung und Vergesellschaftung für Kampffische.',
    date: '2. Juni 2026',
    cat: 'Fische', catColor: '#ec4899', catEmoji: '🐟',
    img: 'kampffisch-haltung.png', readingTime: 6,
    toc: ['Herkunft & Mythos', 'Beckengröße', 'Wasserwerte', 'Einrichtung', 'Vergesellschaftung', 'Ernährung', 'Fazit'],
    related: [
      ['beliebteste-aquarienfische', 'Aquarienfische', 'Top 10 für Einsteiger', 'linear-gradient(135deg,#ec4899,#db2777)'],
      ['garnelen-im-aquarium', 'Garnelen-Guide', 'Vergesellschaftung', 'garnelen.png'],
      ['aquarienpflanzen-anfaenger', 'Pflanzen-Guide', 'Bepflanzungsideen', 'aquarienpflanzen.png'],
      ['fischkrankheiten-aquarium-guide', 'Fischkrankheiten', 'Kampffisch typisch', 'krankheiten-symptome.png'],
    ],
    prod: ['Kampffisch Futter', 'Spezialnahrung', 'B0CBHFMY7H', '#ec4899', '#db2777'],
  },
  'co2-im-aquarium': {
    title: 'CO₂ im Aquarium – Anlage, Diffusor, Dauertest und Düngung',
    excerpt: 'Stabile CO₂-Werte für gesunde Pflanzen und weniger Algen – der Komplett-Guide.',
    date: '2. Juni 2026',
    cat: 'Technik', catColor: '#8b5cf6', catEmoji: '⚙️',
    img: 'co2-anlage.png', readingTime: 7,
    toc: ['Warum CO₂?', 'Anlagentypen', 'Diffusor & Reaktor', 'Dauertest', 'Düngung', 'Fazit'],
    related: [
      ['aquarium-technik-ueberblick', 'Technik-Guide', 'Filter, Licht, CO₂', 'technik.png'],
      ['aquarienpflanzen-anfaenger', 'Pflanzen-Guide', 'Pflanzen mit CO₂', 'aquarienpflanzen.png'],
      ['aquascaping-anfaenger', 'Aquascaping', 'CO₂ im Aquascape', 'aquascaping.png'],
      ['aquarium-pflegeroutine-guide', 'Pflegeroutine', 'CO₂ warten', 'wasserwechsel.png'],
    ],
    prod: ['CO₂-Anlage Set', 'Komplett mit Diffusor', 'B0DDLNYNNL', '#8b5cf6', '#7c3aed'],
  },
  'fischkrankheiten-aquarium-guide': {
    title: 'Fischkrankheiten erkennen, behandeln und vorbeugen – Der große Guide',
    excerpt: 'Ich, Flossenfäule, Bauchwassersucht & Co. – alle Krankheiten erkennen und behandeln.',
    date: '3. Juni 2026',
    cat: 'Pflege', catColor: '#ffd93d', catEmoji: '💊',
    img: 'krankheiten-symptome.png', readingTime: 10,
    toc: ['Warum werden Fische krank?', 'Symptome erkennen', 'Ich/Weißpünktchen', 'Flossenfäule', 'Bauchwassersucht', 'Pilzinfektionen', 'Quarantäne', 'Behandlung', 'Vorbeugung', 'Fazit'],
    related: [
      ['algen-im-aquarium', 'Algen-Guide', 'Erkennen & vorbeugen', 'algen.png'],
      ['aquarium-pflegeroutine-guide', 'Pflegeroutine', 'Krankheiten vermeiden', 'wasserwechsel.png'],
      ['kampffisch-haltung-betta', 'Kampffisch', 'Typische Krankheiten', 'kampffisch-haltung.png'],
      ['garnelen-im-aquarium', 'Garnelen-Guide', 'Krankheiten bei Garnelen', 'garnelen.png'],
    ],
    prod: ['Medikamenten Set', 'Für häufige Krankheiten', 'B0A0A0A0A0', '#ffd93d', '#f59e0b'],
  },
  'aquarium-pflegeroutine-guide': {
    title: 'Aquarium Pflegeroutine – Wasserwechsel, Filterreinigung und Wartungsplan',
    excerpt: 'Der ultimative Guide für die regelmäßige Pflege – mit Checkliste zum Ausdrucken.',
    date: '3. Juni 2026',
    cat: 'Pflege', catColor: '#ffd93d', catEmoji: '💊',
    img: 'wasserwechsel.png', readingTime: 8,
    toc: ['Warum regelmäßige Pflege?', 'Wasserwechsel Schritt für Schritt', 'Filterreinigung', 'Glasscheiben & Algen', 'Pflanzenschnitt', 'Wassertests', 'Monatliche Aufgaben', 'Der perfekte Wartungsplan', 'Häufige Fehler', 'Fazit'],
    related: [
      ['algen-im-aquarium', 'Algen-Guide', 'Algen vorbeugen', 'algen.png'],
      ['fischkrankheiten-aquarium-guide', 'Fischkrankheiten', 'Durch Pflege vermeiden', 'krankheiten-symptome.png'],
      ['aquarium-technik-ueberblick', 'Technik-Guide', 'Technik warten', 'technik.png'],
      ['bodengrund-aquarium-guide', 'Bodengrund-Guide', 'Bodengrund pflegen', 'bodengrund-arten.png'],
    ],
    prod: ['Mulmsauger Set', 'Für die wöchentliche Reinigung', 'B0BZ7XQ8J7', '#ffd93d', '#f59e0b'],
  },
  'aquarium-beleuchtung-guide': {
    title: 'Aquarium Beleuchtung – Licht für gesundes Pflanzenwachstum',
    excerpt: 'LED, T5, HQI: Alles über die richtige Aquarienbeleuchtung – Lichtmenge, Spektrum, Dauer und die besten Leisten für jedes Becken.',
    date: '3. Juni 2026',
    cat: 'Technik', catColor: '#8b5cf6', catEmoji: '⚙️',
    img: 'beleuchtung.png', readingTime: 6,
    toc: ['Warum Beleuchtung wichtig ist', 'LED vs T5 vs HQI', 'Lichtmenge: Lumen, Lux, Watt', 'Lichtfarbe und Spektrum', 'Beleuchtungsdauer', 'Becken-Typen', 'Häufige Fehler', 'Fazit'],
    related: [
      ['aquarium-technik-ueberblick', 'Technik-Guide', 'Filter, CO₂, Licht', 'technik.png'],
      ['aquarienpflanzen-anfaenger', 'Pflanzen-Guide', 'Pflanzen brauchen Licht', 'aquarienpflanzen.png'],
      ['co2-im-aquarium', 'CO₂-Guide', 'Licht + CO₂ kombinieren', 'co2-anlage.png'],
      ['aquarium-duengung-guide', 'Düngung-Guide', 'Nährstoffe für Pflanzen', 'duengung-pflanzen.png'],
    ],
    prod: ['LED Aquarium Leiste', 'Vollspektrum, dimmbar', 'B0DDLNYNNL', '#8b5cf6', '#7c3aed'],
  },
  'aquarium-filter-guide': {
    title: 'Aquarium Filter und Filtermedien – Der komplette Guide',
    excerpt: 'Außenfilter, Innenfilter, Hamburger Mattenfilter: Alles zu Filterarten, Medien, Reinigung und Wartung für klares Wasser.',
    date: '3. Juni 2026',
    cat: 'Technik', catColor: '#8b5cf6', catEmoji: '⚙️',
    img: 'filter-guide.png', readingTime: 7,
    toc: ['Warum filtern?', 'Außenfilter', 'Innenfilter', 'Hamburger Mattenfilter', 'Filtermedien', 'Reinigung & Wartung', 'Die Einfahrphase', 'Fazit'],
    related: [
      ['aquarium-technik-ueberblick', 'Technik-Guide', 'Equipment-Überblick', 'technik.png'],
      ['aquarium-beleuchtung-guide', 'Beleuchtung', 'Licht fürs Aquarium', 'beleuchtung.png'],
      ['co2-im-aquarium', 'CO₂-Guide', 'CO₂-Anlage & Filter', 'co2-anlage.png'],
      ['aquarium-pflegeroutine-guide', 'Pflegeroutine', 'Filter reinigen', 'wasserwechsel.png'],
    ],
    prod: ['Außenfilter Set', 'Leistungsstark & leise', 'B0DDLNYNNL', '#8b5cf6', '#7c3aed'],
  },
  'aquarium-duengung-guide': {
    title: 'Aquarium Düngung – Pflanzendünger für gesundes Wachstum',
    excerpt: 'Makro- und Mikronährstoffe, Flüssigdünger, Wurzeltabs: Der komplette Guide zur richtigen Düngung deiner Aquarienpflanzen.',
    date: '3. Juni 2026',
    cat: 'Pflanzen', catColor: '#10b981', catEmoji: '🌿',
    img: 'duengung-pflanzen.png', readingTime: 7,
    toc: ['Warum düngen?', 'Makronährstoffe NPK', 'Mikronährstoffe & Eisen', 'Flüssigdünger', 'Wurzeldünger', 'Düngeplan', 'Mangel erkennen', 'Fazit'],
    related: [
      ['aquarienpflanzen-anfaenger', 'Pflanzen-Guide', 'Arten für Anfänger', 'aquarienpflanzen.png'],
      ['co2-im-aquarium', 'CO₂-Guide', 'CO₂ + Düngung', 'co2-anlage.png'],
      ['aquarium-beleuchtung-guide', 'Beleuchtung', 'Licht für Pflanzen', 'beleuchtung.png'],
      ['bodengrund-aquarium-guide', 'Bodengrund', 'Nährboden für Pflanzen', 'bodengrund-arten.png'],
    ],
    prod: ['Pflanzendünger Set', 'Eisen + NPK + Spurenelemente', 'B00DB3HGG4', '#10b981', '#059669'],
  },
  'schnecken-im-aquarium': {
    title: 'Schnecken im Aquarium – Nützliche Helfer und ihre Pflege',
    excerpt: 'Turmschnecken, Posthornschnecken, Napfschnecken: Arten, Haltung, Vermehrung und warum Schnecken zu den besten Aquarienhelfern gehören.',
    date: '3. Juni 2026',
    cat: 'Pflege', catColor: '#ffd93d', catEmoji: '💊',
    img: 'schnecken-im-aquarium.png', readingTime: 6,
    toc: ['Warum Schnecken?', 'Turmschnecken', 'Posthornschnecken', 'Napfschnecken', 'Blasenschnecken', 'Haltung & Pflege', 'Vermehrung kontrollieren', 'Mythen & Fakten', 'Fazit'],
    related: [
      ['garnelen-im-aquarium', 'Garnelen-Guide', 'Mitbewohner im Becken', 'garnelen.png'],
      ['algen-im-aquarium', 'Algen-Guide', 'Schnecken gegen Algen', 'algen.png'],
      ['aquarium-pflegeroutine-guide', 'Pflegeroutine', 'Regelmäßige Pflege', 'wasserwechsel.png'],
      ['einsteiger-aquarium-guide', 'Einsteiger-Guide', 'Starten mit Schnecken', 'einsteiger-guide.png'],
    ],
    prod: ['Schnecken-Pflegeset', 'Futter & Kalk für Schnecken', 'B0CBHFMY7H', '#ffd93d', '#f59e0b'],
  },
  'wurzeln-holz-aquarium': {
    title: 'Wurzeln und Holz im Aquarium – Dekoration mit natürlichem Material',
    excerpt: 'Mangrovenwurzeln, Moorkienholz, Spider Wood: die besten Holzarten fürs Aquarium und wie sie Wasserwerte und Optik beeinflussen.',
    date: '4. Juni 2026', cat: 'Einsteiger', catColor: '#06b6d4', catEmoji: '🐟',
    img: 'holz-arten.png', readingTime: 5,
    toc: ['Warum Holz?', 'Mangrovenwurzel', 'Moorkienholz', 'Spider Wood', 'Holz vorbereiten', 'Gerbsäure & Wasserwerte', 'Fazit'],
    related: [['bodengrund-aquarium-guide','Bodengrund-Guide','Basis fürs Aquarium','bodengrund-arten.png'],['aquascaping-anfaenger','Aquascaping','Holz im Aquascape','aquascaping.png'],['garnelen-im-aquarium','Garnelen','Holz für Garnelen','garnelen.png'],['aquarium-pflegeroutine-guide','Pflegeroutine','Holz pflegen','wasserwechsel.png']],
    prod: ['Mangrovenwurzel Set', 'Naturbelassen, 2er Set', 'B07T8V5HZY', '#06b6d4', '#0891b2'],
  },
  'vergesellschaftung-aquarienfische': {
    title: 'Vergesellschaftung von Aquarienfischen – Wer verträgt sich?',
    excerpt: 'Der große Guide zur Fisch-Vergesellschaftung: welche Arten harmonieren, Revierverhalten, Schwimmzonen und die besten Kombinationen.',
    date: '4. Juni 2026', cat: 'Fische', catColor: '#ec4899', catEmoji: '🐟',
    img: 'vergesellschaftung-vertraeglich.png', readingTime: 6,
    toc: ['Grundregeln', 'Schwimmzonen', 'Verträgliche Kombos', 'Problematische Arten', 'Nachbesatz planen', 'Fazit'],
    related: [['einsteiger-aquarium-guide','Einsteiger-Guide','Erster Besatz','einsteiger-guide.png'],['kampffisch-haltung-betta','Kampffisch','Vergesellschaftung','kampffisch-haltung.png'],['beliebteste-aquarienfische','Aquarienfische','Top 10 Arten','linear-gradient(135deg,#ec4899,#db2777)'],['garnelen-im-aquarium','Garnelen','Mitbewohner','garnelen.png']],
    prod: ['Aquarium Komplettset', 'Ideal für Gesellschaftsbecken', 'B00CIF8TCS', '#ec4899', '#db2777'],
  },
  'osmoseanlage-wasseraufbereitung': {
    title: 'Osmoseanlage und Wasseraufbereitung fürs Aquarium',
    excerpt: 'RO/DI Anlagen, Vollentsalzung, Wasseraufbereitung: alles über Osmosewasser für empfindliche Fische und Garnelen.',
    date: '4. Juni 2026', cat: 'Technik', catColor: '#8b5cf6', catEmoji: '⚙️',
    img: 'osmose-anlage.png', readingTime: 6,
    toc: ['Was ist Osmose?', 'RO/DI Anlagen', 'Einbau & Installation', 'Mischen mit Leitungswasser', 'Lagerung', 'Fazit'],
    related: [['wasserwerte-aquarium-guide','Wasserwerte','GH, KH, pH verstehen','linear-gradient(135deg,#06b6d4,#0891b2)'],['aquarium-technik-ueberblick','Technik-Guide','Equipment','technik.png'],['garnelen-im-aquarium','Garnelen','Osmose für Garnelen','garnelen.png'],['fischkrankheiten-aquarium-guide','Fischkrankheiten','Wasserqualität','krankheiten-symptome.png']],
    prod: ['Osmoseanlage 4-stufig', 'RO/DI mit Filter', 'B0DDLNYNNL', '#8b5cf6', '#7c3aed'],
  },
  'fische-fortgeschrittene': {
    title: 'Aquarium Fische für Fortgeschrittene – Skalare, Diskus & Co.',
    excerpt: 'Anspruchsvolle Aquarienfische: Diskus, Skalare, Zwergbuntbarsche – Haltung, Wasserwerte und Pflege für erfahrene Aquarianer.',
    date: '4. Juni 2026', cat: 'Fische', catColor: '#ec4899', catEmoji: '🐟',
    img: 'fische-anspruchsvoll.png', readingTime: 7,
    toc: ['Diskusfische', 'Skalare', 'Zwergbuntbarsche', 'Prachtfische', 'Futter & Pflege', 'Fazit'],
    related: [['wasserwerte-aquarium-guide','Wasserwerte','Wichtig für Diskus','linear-gradient(135deg,#06b6d4,#0891b2)'],['einsteiger-aquarium-guide','Einsteiger-Guide','Vor dem Einstieg','einsteiger-guide.png'],['aquarium-technik-ueberblick','Technik-Guide','Technik für Profis','technik.png'],['fischkrankheiten-aquarium-guide','Fischkrankheiten','Empfindliche Fische','krankheiten-symptome.png']],
    prod: ['Diskusfutter Premium', 'Spezialnahrung', 'B0D6FZWF5R', '#ec4899', '#db2777'],
  },
  'heizung-temperatur-aquarium': {
    title: 'Heizung und Temperatur im Aquarium – Die richtige Wärme',
    excerpt: 'Aquarienheizung: Heizstäbe, Inline Heizer, Bodenerwärmung – Wattzahl, Platzierung und die optimale Temperatur für jedes Becken.',
    date: '4. Juni 2026', cat: 'Technik', catColor: '#8b5cf6', catEmoji: '⚙️',
    img: 'heizung-arten.png', readingTime: 5,
    toc: ['Warum Heizung?', 'Heizertypen', 'Wattzahl berechnen', 'Platzierung', 'Temperatur nach Fischart', 'Fazit'],
    related: [['aquarium-technik-ueberblick','Technik-Guide','Equipment-Überblick','technik.png'],['aquarium-filter-guide','Filter-Guide','Filter & Heizung','filter-guide.png'],['fischkrankheiten-aquarium-guide','Fischkrankheiten','Temperatur & Krankheiten','krankheiten-symptome.png'],['aquarium-beleuchtung-guide','Beleuchtung','Licht & Wärme','beleuchtung.png']],
    prod: ['Aquarium Heizstab 100W', 'Präzise Regelung', 'B0DDLNYNNL', '#8b5cf6', '#7c3aed'],
  },
  'stroemung-im-aquarium': {
    title: 'Strömung im Aquarium – Pumpen und Wasserbewegung',
    excerpt: 'Strömungspumpen, Wellenbauer, Durchströmung: Wie du die richtige Wasserbewegung für Fische, Pflanzen und Korallen schaffst.',
    date: '4. Juni 2026', cat: 'Technik', catColor: '#8b5cf6', catEmoji: '⚙️',
    img: 'stroemung-pumpe.png', readingTime: 5,
    toc: ['Warum Strömung?', 'Pumpenarten', 'Strömungstypen', 'Einrichtung', 'Strömung & Pflanzen', 'Fazit'],
    related: [['aquarium-technik-ueberblick','Technik-Guide','Equipment','technik.png'],['aquarium-filter-guide','Filter-Guide','Filter & Strömung','filter-guide.png'],['co2-im-aquarium','CO₂-Guide','CO₂ & Strömung','co2-anlage.png'],['aquascaping-anfaenger','Aquascaping','Strömung im Aquascape','aquascaping.png']],
    prod: ['Strömungspumpe Set', 'Einstellbare Leistung', 'B0DDLNYNNL', '#8b5cf6', '#7c3aed'],
  },
  'beckenformen-groessen': {
    title: 'Aquarium Beckenformen und Größen – Das richtige Becken wählen',
    excerpt: 'Standard, Cube, Eckbecken, Panorama: Welche Beckenform für welchen Zweck? Der Guide zur richtigen Aquariumgröße und -form.',
    date: '4. Juni 2026', cat: 'Einsteiger', catColor: '#06b6d4', catEmoji: '🐟',
    img: 'becken-formen.png', readingTime: 6,
    toc: ['Standard Rechteck', 'Cube Becken', 'Eck- und Panoramabecken', 'Nano Aquarien', 'Die richtige Größe', 'Fazit'],
    related: [['einsteiger-aquarium-guide','Einsteiger-Guide','Kompletter Start','einsteiger-guide.png'],['bodengrund-aquarium-guide','Bodengrund','Bodengrund je Becken','bodengrund-arten.png'],['aquarium-beleuchtung-guide','Beleuchtung','Licht je Beckenform','beleuchtung.png'],['aquarium-technik-ueberblick','Technik-Guide','Technik je Größe','technik.png']],
    prod: ['Aquarium 60x30x30', 'Standardmaße 54L', 'B00CIF8TCS', '#06b6d4', '#0891b2'],
  },
  'lebendgebärende-zahnkarpfen': {
    title: 'Lebendgebärende Zahnkarpfen – Guppys, Platys, Schwertträger',
    excerpt: 'Guppys, Platys, Mollys und Schwertträger: Haltung, Farbvarianten, Zucht und Vergesellschaftung der beliebtesten Lebendgebärenden.',
    date: '4. Juni 2026', cat: 'Fische', catColor: '#ec4899', catEmoji: '🐟',
    img: 'lebendgebarende-arten.png', readingTime: 6,
    toc: ['Guppys', 'Platys', 'Mollys', 'Schwertträger', 'Haltung & Pflege', 'Zucht', 'Fazit'],
    related: [['einsteiger-aquarium-guide','Einsteiger-Guide','Perfekt für Anfänger','einsteiger-guide.png'],['vergesellschaftung-aquarienfische','Vergesellschaftung','Verträglichkeit','vergesellschaftung-vertraeglich.png'],['aquarium-futter-ernaehrung','Futter-Guide','Ernährung','futter-arten.png'],['garnelen-im-aquarium','Garnelen','Mitbewohner','garnelen.png']],
    prod: ['Lebendgebärenden Futter', 'Spezialfutter', 'B0CBHFMY7H', '#ec4899', '#db2777'],
  },
  'aquarium-futter-ernaehrung': {
    title: 'Aquarium Futter und Ernährung – Gesund füttern leicht gemacht',
    excerpt: 'Flockenfutter, Granulat, Frostfutter, Lebendfutter: Der Guide zur richtigen Ernährung deiner Aquarienfische.',
    date: '4. Juni 2026', cat: 'Fische', catColor: '#ec4899', catEmoji: '🐟',
    img: 'futter-arten.png', readingTime: 6,
    toc: ['Futterarten', 'Flocken & Granulat', 'Frost- & Lebendfutter', 'Fütterungsplan', 'Überfütterung vermeiden', 'Fazit'],
    related: [['einsteiger-aquarium-guide','Einsteiger-Guide','Grundlagen','einsteiger-guide.png'],['kampffisch-haltung-betta','Kampffisch','Kampffisch Ernährung','kampffisch-haltung.png'],['garnelen-im-aquarium','Garnelen','Garnelen Futter','garnelen.png'],['fischkrankheiten-aquarium-guide','Fischkrankheiten','Futter & Gesundheit','krankheiten-symptome.png']],
    prod: ['Hochwertiges Futter-Set', 'Flocken + Granulat + Frost', 'B0D6FZWF5R', '#ec4899', '#db2777'],
  },
  'pflanzenvermehrung-aquarium': {
    title: 'Aquarium Pflanzenvermehrung – Nachzucht, Teilung und Stecklinge',
    excerpt: 'Pflanzen vermehren leicht gemacht: Stecklinge, Rhizomteilung, Ableger – die besten Methoden für mehr Pflanzen im Aquarium.',
    date: '4. Juni 2026', cat: 'Pflanzen', catColor: '#10b981', catEmoji: '🌿',
    img: 'pflanzen-vermehrung.png', readingTime: 5,
    toc: ['Stecklinge schneiden', 'Rhizomteilung', 'Ableger & Ausläufer', 'Tissue Culture', 'Vermehrungsbecken', 'Fazit'],
    related: [['aquarienpflanzen-anfaenger','Pflanzen-Guide','Arten für Anfänger','aquarienpflanzen.png'],['co2-im-aquarium','CO₂-Guide','CO₂ für Pflanzen','co2-anlage.png'],['bodendecker-teppichpflanzen','Teppichpflanzen','Bodendecker','teppich-pflanzen.png'],['aquarium-duengung-guide','Düngung','Nährstoffe','duengung-pflanzen.png']],
    prod: ['Pflanzenschere Set', 'Für saubere Schnitte', 'B00DB3HGG4', '#10b981', '#059669'],
  },
  'co2-einsteiger-guide': {
    title: 'CO₂-Düngung für Einsteiger – Einfach loslegen mit Pflanzen',
    excerpt: 'CO₂ im Aquarium für Anfänger: einfache Methoden, günstige Sets und die besten Tipps für prächtiges Pflanzenwachstum ohne Komplexität.',
    date: '4. Juni 2026', cat: 'Pflanzen', catColor: '#10b981', catEmoji: '🌿',
    img: 'co2-einsteiger-setup.png', readingTime: 5,
    toc: ['Warum CO₂?', 'Einfache CO₂-Sets', 'Liquid Carbon', 'DIY CO₂', 'CO₂ & Algen', 'Fazit'],
    related: [['co2-im-aquarium','CO₂-Guide','Komplett-Guide','co2-anlage.png'],['aquarienpflanzen-anfaenger','Pflanzen-Guide','Arten für CO₂','aquarienpflanzen.png'],['aquarium-duengung-guide','Düngung','Düngen mit CO₂','duengung-pflanzen.png'],['aquarium-beleuchtung-guide','Beleuchtung','Licht + CO₂','beleuchtung.png']],
    prod: ['CO₂ Einsteiger Set', 'Komplett mit Diffusor', 'B00DB3HGG4', '#10b981', '#059669'],
  },
  'bodendecker-teppichpflanzen': {
    title: 'Bodendecker und Teppichpflanzen fürs Aquarium – Der Guide',
    excerpt: 'Teppichpflanzen wie Cubahaar, Monte Carlo und Zwergnadelsimse: Arten, Pflanzung, Dry-Start-Methode und Pflege für grüne Teppiche.',
    date: '4. Juni 2026', cat: 'Pflanzen', catColor: '#10b981', catEmoji: '🌿',
    img: 'teppich-pflanzen.png', readingTime: 6,
    toc: ['Beliebte Arten', 'Dry Start Methode', 'Pflanzung', 'CO₂ & Licht', 'Pflege & Schnitt', 'Fazit'],
    related: [['aquarienpflanzen-anfaenger','Pflanzen-Guide','Arten für Anfänger','aquarienpflanzen.png'],['co2-einsteiger-guide','CO₂ Einsteiger','CO₂ für Bodendecker','co2-einsteiger-setup.png'],['aquarium-duengung-guide','Düngung','Nährstoffe','duengung-pflanzen.png'],['aquascaping-anfaenger','Aquascaping','Teppiche im Aquascape','aquascaping.png']],
    prod: ['Bodendecker Set', '5 Arten für den Teppich', 'B00DB3HGG4', '#10b981', '#059669'],
  },
  'gesellschaftsbecken-einrichten': {
    title: 'Gesellschaftsbecken richtig zusammenstellen – Der Komplett-Guide',
    excerpt: 'Das perfekte Gesellschaftsbecken planen: Fischkombinationen, Beckengröße, Einrichtung und die 3 besten Community-Aquarien.',
    date: '4. Juni 2026', cat: 'Einsteiger', catColor: '#06b6d4', catEmoji: '🐟',
    img: 'gesellschaft-fische.png', readingTime: 6,
    toc: ['Planung', 'Die 3 besten Kombos', 'Einrichtung', 'Besatz-Reihenfolge', 'Nachbesatz', 'Fazit'],
    related: [['einsteiger-aquarium-guide','Einsteiger-Guide','Grundlagen','einsteiger-guide.png'],['vergesellschaftung-aquarienfische','Vergesellschaftung','Fisch-Kombos','vergesellschaftung-vertraeglich.png'],['beckenformen-groessen','Beckenformen','Die richtige Größe','becken-formen.png'],['aquarium-technik-ueberblick','Technik-Guide','Technik fürs Becken','technik.png']],
    prod: ['Aquarium 100x40x40', 'Ideal für Gesellschaftsbecken', 'B00CIF8TCS', '#06b6d4', '#0891b2'],
  },
  'quarantaene-medikamente': {
    title: 'Aquarium Medikamente und Quarantäne – Krankheiten behandeln',
    excerpt: 'Quarantänebecken einrichten, Medikamente richtig einsetzen und Krankheiten vorbeugen – der Guide zur Fischgesundheit.',
    date: '4. Juni 2026', cat: 'Pflege', catColor: '#ffd93d', catEmoji: '💊',
    img: 'quarantaene-becken.png', readingTime: 6,
    toc: ['Warum Quarantäne?', 'Quarantänebecken einrichten', 'Medikamentenarten', 'Salzbäder', 'Vorbeugung', 'Fazit'],
    related: [['fischkrankheiten-aquarium-guide','Fischkrankheiten','Diagnose & Behandlung','krankheiten-symptome.png'],['algen-im-aquarium','Algen-Guide','Algen & Gesundheit','algen.png'],['aquarium-pflegeroutine-guide','Pflegeroutine','Sauberkeit','wasserwechsel.png'],['aquarium-futter-ernaehrung','Futter-Guide','Ernährung & Gesundheit','futter-arten.png']],
    prod: ['Quarantäne-Set', 'Becken + Filter + Medizin', 'B0D6FZWF5R', '#ffd93d', '#f59e0b'],
  },
  'rote-aquarienpflanzen': {
    title: 'Rote Aquarienpflanzen – Arten, Pflege und Düngung',
    excerpt: 'Rote Aquarienpflanzen für leuchtende Farbakzente: Alternanthera, Rotala rotundifolia, Ludwigia – Pflege, Licht und Düngung.',
    date: '4. Juni 2026', cat: 'Pflanzen', catColor: '#10b981', catEmoji: '🌿',
    img: 'rote-pflanzen-arten.png', readingTime: 5,
    toc: ['Warum rote Pflanzen?', 'Top 5 Arten', 'Licht für rote Farben', 'Eisen & Co.', 'Platzierung im Becken', 'Fazit'],
    related: [['aquarienpflanzen-anfaenger','Pflanzen-Guide','Arten für Anfänger','aquarienpflanzen.png'],['aquarium-beleuchtung-guide','Beleuchtung','Licht für Rot','beleuchtung.png'],['aquarium-duengung-guide','Düngung','Eisen & Nährstoffe','duengung-pflanzen.png'],['co2-im-aquarium','CO₂-Guide','CO₂ für rote Pflanzen','co2-anlage.png']],
    prod: ['Eisen-Dünger', 'Fördert Rotfärbung', 'B00DB3HGG4', '#10b981', '#059669'],
  },
  'steinarten-hardscape': {
    title: 'Aquarium Steinarten und Hardscape – Gestalten mit Stein',
    excerpt: 'Seiryu Stone, Dragon Stone, Lava Rock: Die besten Steinarten fürs Aquarium und wie du atemberaubende Hardscape-Layouts gestaltest.',
    date: '4. Juni 2026', cat: 'Aquascaping', catColor: '#0d9488', catEmoji: '🪨',
    img: 'stein-arten.png', readingTime: 5,
    toc: ['Steinarten im Überblick', 'Seiryu Stone', 'Dragon Stone', 'Lava Rock', 'Iwagumi-Layout', 'Fazit'],
    related: [['aquascaping-anfaenger','Aquascaping','Grundlagen','aquascaping.png'],['wurzeln-holz-aquarium','Wurzeln & Holz','Holz + Stein kombinieren','holz-arten.png'],['bodengrund-aquarium-guide','Bodengrund','Basis für Steine','bodengrund-arten.png'],['beckenformen-groessen','Beckenformen','Größe für Hardscape','becken-formen.png']],
    prod: ['Hardscape Steine Set', '5kg Seiryu + Dragon Stone', 'B0BZ7XQ8J7', '#0d9488', '#0f766e'],
  },
  'nachzucht-fische': {
    title: 'Nachzucht von Aquarienfischen – Zucht und Aufzucht',
    excerpt: 'Fische züchten im Aquarium: Zuchtbecken, Aufzuchtfutter, Laichpflege – der Guide zur erfolgreichen Nachzucht.',
    date: '4. Juni 2026', cat: 'Fische', catColor: '#ec4899', catEmoji: '🐟',
    img: 'nachzucht-becken.png', readingTime: 6,
    toc: ['Zuchtbecken einrichten', 'Laicharten', 'Aufzuchtfutter', 'Fry Aufzucht', 'Arten für Einsteiger', 'Fazit'],
    related: [['lebendgebärende-zahnkarpfen','Lebendgebärende','Einfache Zuchtfische','lebendgebarende-arten.png'],['aquarium-futter-ernaehrung','Futter-Guide','Ernährung','futter-arten.png'],['kampffisch-haltung-betta','Kampffisch','Kampffisch Zucht','kampffisch-haltung.png'],['garnelen-im-aquarium','Garnelen','Garnelenzucht','garnelen.png']],
    prod: ['Aufzuchtfutter Set', 'Für Fry & Jungfische', 'B0D6FZWF5R', '#ec4899', '#db2777'],
  },
  'algenfresser-portrait': {
    title: 'Aquarium Algenfresser im Porträt – Fische und Wirbellose',
    excerpt: 'Die besten Algenfresser fürs Aquarium: Otocinclus, Siamesische Rüsselbarbe, Amanogarnelen und Schnecken im Porträt mit Pflegetipps.',
    date: '4. Juni 2026', cat: 'Pflege', catColor: '#ffd93d', catEmoji: '💊',
    img: 'algenfresser-fische.png', readingTime: 6,
    toc: ['Algenfresser Fische', 'Otocinclus', 'Siamesische Rüsselbarbe', 'Amanogarnelen', 'Schnecken als Helfer', 'Kombinationen', 'Fazit'],
    related: [['algen-im-aquarium','Algen-Guide','Algen erkennen','algen.png'],['garnelen-im-aquarium','Garnelen-Guide','Garnelen pflegen','garnelen.png'],['schnecken-im-aquarium','Schnecken','Schnecken-Guide','schnecken-im-aquarium.png'],['aquarium-pflegeroutine-guide','Pflegeroutine','Sauberkeit','wasserwechsel.png']],
    prod: ['Algenfresser Kombi', 'Amanos + Schnecken', 'B0BZ7XQ8J7', '#ffd93d', '#f59e0b'],
  },
  'wassertest-wasserpflege': {
    title: 'Aquarium Wassertest und Wasserpflege – Alles im Griff',
    excerpt: 'Wassertests richtig durchführen: pH, GH, KH, NO₂, NO₃, PO₄ – welche Tests sind wichtig und wie reagierst du auf schlechte Werte.',
    date: '4. Juni 2026', cat: 'Technik', catColor: '#8b5cf6', catEmoji: '⚙️',
    img: 'wassertest-set.png', readingTime: 5,
    toc: ['Welche Tests?', 'pH-Wert', 'GH & KH', 'NO₂ & NO₃', 'Mess-Routine', 'Wasserpflege', 'Fazit'],
    related: [['wasserwerte-aquarium-guide','Wasserwerte','Werte verstehen','linear-gradient(135deg,#06b6d4,#0891b2)'],['aquarium-einfahren-nitritpeak','Aquarium einfahren','Nitritpeak meistern','aquarium-einfahren.png'],['aquarium-pflegeroutine-guide','Pflegeroutine','Wasserwechsel','wasserwechsel.png'],['osmoseanlage-wasseraufbereitung','Osmose','Wasseraufbereitung','osmose-anlage.png']],
    prod: ['Wassertest Set Profi', 'Flüssigtests für 6 Werte', 'B0D6FZWF5R', '#8b5cf6', '#7c3aed'],
  },
  'diy-aquarium-bauen': {
    title: 'Aquarium DIY – Selber bauen und individuell gestalten',
    excerpt: 'Dein Aquarium selbst bauen: vom Glasschnitt über die Silikonierung bis zur individuellen Gestaltung – der DIY-Guide für Selbermacher.',
    date: '4. Juni 2026', cat: 'Einsteiger', catColor: '#06b6d4', catEmoji: '🐟',
    img: 'diy-becken.png', readingTime: 6,
    toc: ['Planung & Material', 'Glasschneiden', 'Verkleben & Silikonieren', 'Trocknung & Test', 'DIY Einrichtung', 'Sicherheit', 'Fazit'],
    related: [['beckenformen-groessen','Beckenformen','Die richtige Größe','becken-formen.png'],['einsteiger-aquarium-guide','Einsteiger-Guide','Grundlagen','einsteiger-guide.png'],['aquarium-technik-ueberblick','Technik-Guide','Technik fürs DIY','technik.png'],['bodengrund-aquarium-guide','Bodengrund','Bodengrund einfüllen','bodengrund-arten.png']],
    prod: ['Aquariumsilikon Set', 'Für selbstgebaute Becken', 'B0DDLNYNNL', '#06b6d4', '#0891b2'],
  },
};

// ── TOPICS / TAGS ──
const TOPICS = [
  ['Einsteiger', '#06b6d4', '/artikel/einsteiger-aquarium-guide.html'],
  ['Aquarienpflanzen', '#10b981', '/artikel/aquarienpflanzen-anfaenger.html'],
  ['Aquascaping', '#0d9488', '/artikel/aquascaping-anfaenger.html'],
  ['Garnelen', '#ff6b6b', '/artikel/garnelen-im-aquarium.html'],
  ['Fischkrankheiten', '#ec4899', '/artikel/fischkrankheiten-aquarium-guide.html'],
  ['Algen', '#ffd93d', '/artikel/algen-im-aquarium.html'],
  ['Technik', '#8b5cf6', '/artikel/aquarium-technik-ueberblick.html'],
  ['CO₂', '#a78bfa', '/artikel/co2-im-aquarium.html'],
  ['Bodengrund', '#06b6d4', '/artikel/bodengrund-aquarium-guide.html'],
  ['Pflegeroutine', '#f59e0b', '/artikel/aquarium-pflegeroutine-guide.html'],
  ['Wasserwerte', '#0891b2', '/artikel/wasserwerte-aquarium-guide.html'],
  ['Kampffisch', '#db2777', '/artikel/kampffisch-haltung-betta.html'],
  ['Beleuchtung', '#a78bfa', '/artikel/aquarium-beleuchtung-guide.html'],
  ['Filter', '#6366f1', '/artikel/aquarium-filter-guide.html'],
  ['Düngung', '#34d399', '/artikel/aquarium-duengung-guide.html'],
  ['Schnecken', '#fbbf24', '/artikel/schnecken-im-aquarium.html'],
  ['Wurzeln & Holz', '#78716c', '/artikel/wurzeln-holz-aquarium.html'],
  ['Vergesellschaftung', '#f472b6', '/artikel/vergesellschaftung-aquarienfische.html'],
  ['Osmose', '#38bdf8', '/artikel/osmoseanlage-wasseraufbereitung.html'],
  ['Fische für Profis', '#d946ef', '/artikel/fische-fortgeschrittene.html'],
  ['Heizung', '#fb923c', '/artikel/heizung-temperatur-aquarium.html'],
  ['Strömung', '#60a5fa', '/artikel/stroemung-im-aquarium.html'],
  ['Beckenformen', '#06b6d4', '/artikel/beckenformen-groessen.html'],
  ['Lebendgebärende', '#f43f5e', '/artikel/lebendgebärende-zahnkarpfen.html'],
  ['Futter', '#a855f7', '/artikel/aquarium-futter-ernaehrung.html'],
  ['Pflanzenvermehrung', '#34d399', '/artikel/pflanzenvermehrung-aquarium.html'],
  ['CO₂ Einsteiger', '#2dd4bf', '/artikel/co2-einsteiger-guide.html'],
  ['Teppichpflanzen', '#10b981', '/artikel/bodendecker-teppichpflanzen.html'],
  ['Gesellschaftsbecken', '#0ea5e9', '/artikel/gesellschaftsbecken-einrichten.html'],
  ['Quarantäne', '#f59e0b', '/artikel/quarantaene-medikamente.html'],
  ['Rote Pflanzen', '#ef4444', '/artikel/rote-aquarienpflanzen.html'],
  ['Hardscape', '#78716c', '/artikel/steinarten-hardscape.html'],
  ['Nachzucht', '#f97316', '/artikel/nachzucht-fische.html'],
  ['Algenfresser', '#84cc16', '/artikel/algenfresser-portrait.html'],
  ['Wassertests', '#06b6d4', '/artikel/wassertest-wasserpflege.html'],
  ['DIY Aquarium', '#a8a29e', '/artikel/diy-aquarium-bauen.html'],
];

// ── CATEGORY DATA for index page ──
const CATEGORIES = [
  {
    emoji: '🐟', name: 'Einsteiger', count: 8, catColor: '#06b6d4',
    cards: ['einsteiger-aquarium-guide', 'bodengrund-aquarium-guide', 'aquarium-einfahren-nitritpeak', 'wasserwerte-aquarium-guide', 'wurzeln-holz-aquarium', 'beckenformen-groessen', 'gesellschaftsbecken-einrichten', 'diy-aquarium-bauen']
  },
  {
    emoji: '🌿', name: 'Pflanzen & Aquascaping', count: 8, catColor: '#10b981',
    cards: ['aquarienpflanzen-anfaenger', 'co2-im-aquarium', 'aquascaping-anfaenger', 'aquarium-duengung-guide', 'co2-einsteiger-guide', 'bodendecker-teppichpflanzen', 'rote-aquarienpflanzen', 'pflanzenvermehrung-aquarium']
  },
  {
    emoji: '⚙️', name: 'Technik', count: 8, catColor: '#8b5cf6',
    cards: ['aquarium-technik-ueberblick', 'co2-im-aquarium', 'aquarium-beleuchtung-guide', 'aquarium-filter-guide', 'osmoseanlage-wasseraufbereitung', 'heizung-temperatur-aquarium', 'stroemung-im-aquarium', 'wassertest-wasserpflege']
  },
  {
    emoji: '🦐', name: 'Garnelen & Fische', count: 8, catColor: '#ff6b6b',
    cards: ['garnelen-im-aquarium', 'kampffisch-haltung-betta', 'beliebteste-aquarienfische', 'vergesellschaftung-aquarienfische', 'fische-fortgeschrittene', 'lebendgebärende-zahnkarpfen', 'aquarium-futter-ernaehrung', 'nachzucht-fische']
  },
  {
    emoji: '💊', name: 'Pflege & Gesundheit', count: 8, catColor: '#ffd93d',
    cards: ['algen-im-aquarium', 'fischkrankheiten-aquarium-guide', 'aquarium-pflegeroutine-guide', 'schnecken-im-aquarium', 'quarantaene-medikamente', 'algenfresser-portrait', 'steinarten-hardscape', 'wurzeln-holz-aquarium']
  },
];

// ── STATS ──
const totalArticles = Object.keys(ARTICLES).length;
const totalMinutes = Object.values(ARTICLES).reduce((sum, a) => sum + (a.readingTime || 0), 0);
const totalCategories = new Set(Object.values(ARTICLES).map(a => a.cat)).size;

// ── GENERATE INDEX ──
function buildIndex() {
  // Hero: featured article + 3 side articles
  const featured = ARTICLES['aquarium-pflegeroutine-guide'];
  const heroSideSlugs = ['bodengrund-aquarium-guide', 'fischkrankheiten-aquarium-guide', 'co2-im-aquarium'];

  let heroSide = '';
  for (const slug of heroSideSlugs) {
    const a = ARTICLES[slug];
    if (!a) continue;
    const imgStyle = a.img.startsWith('linear-gradient')
      ? `background:${a.img}`
      : `background-image:url('/images/${a.img}')`;
    heroSide += `<a href="/artikel/${slug}" class="side-item">
      <div class="thumb" style="${imgStyle}"></div>
      <div class="info"><h5>${a.title}</h5><small>${a.cat} · ${a.readingTime} Min</small></div>
    </a>\n`;
  }

  const heroHTML = `<div class="hero-modern">
    <div class="hero-feat">
      <div class="bg-img" style="background-image:url('/images/hero.png')"></div>
      <div class="content">
        <span class="tag">⭐ Neu</span>
        <h2>${featured.title}</h2>
        <p>${featured.excerpt}</p>
        <div class="hero-feat-meta">
          <span>📅 ${featured.date}</span>
          <span>📖 ${featured.readingTime} Min Lesezeit</span>
          <a href="/artikel/aquarium-pflegeroutine-guide.html" class="hero-cta">Jetzt lesen →</a>
        </div>
      </div>
    </div>
    <div class="hero-side">
      ${heroSide}
    </div>
  </div>`;

  // Stats Bar
  const statsHTML = `<div class="stats-bar">
    <div class="stats-inner">
      <div class="stat-item"><span class="stat-num">${totalArticles}</span><span class="stat-label">Artikel</span></div>
      <div class="stat-dot"></div>
      <div class="stat-item"><span class="stat-num">${totalCategories}</span><span class="stat-label">Kategorien</span></div>
      <div class="stat-dot"></div>
      <div class="stat-item"><span class="stat-num">${totalMinutes}+</span><span class="stat-label">Min. Lesestoff</span></div>
      <div class="stat-dot"></div>
      <div class="stat-item"><span class="stat-num">${Object.keys(ARTICLES).filter(s => ARTICLES[s].img !== 'linear-gradient(135deg,#ec4899,#db2777)').length}</span><span class="stat-label">Pop Art Bilder</span></div>
    </div>
  </div>`;

  // Employees Pick (Editors Pick)
  const picks = ['bodengrund-aquarium-guide', 'fischkrankheiten-aquarium-guide', 'aquarienpflanzen-anfaenger', 'kampffisch-haltung-betta'];
  let picksHTML = '';
  for (const slug of picks) {
    const a = ARTICLES[slug];
    if (!a) continue;
    picksHTML += heroCardHTML(slug, a.title, a.excerpt, a.img, a.cat, a.catColor, a.date, a.readingTime);
  }

  const edsPickHTML = `<section class="mp-section">
    <div class="section-title">
      <h3><span class="emoji">⭐</span> Editors Picks</h3>
      <span class="count">Empfohlene Artikel</span>
      <span class="line"></span>
    </div>
    <div class="hero-grid-4">
      ${picksHTML}
    </div>
  </section>`;

  // Category sections
  let catSections = '';
  for (const cat of CATEGORIES) {
    let cardsHTML = '';
    for (const slug of cat.cards) {
      const a = ARTICLES[slug];
      if (!a) continue;
      cardsHTML += cardHTML(slug, a.title, a.excerpt, a.img, a.cat, a.catColor, a.date, a.readingTime);
    }
    const catGridStyle = cat.cards.length === 2 ? ' style="grid-template-columns:repeat(2,1fr);"' : '';
    catSections += `<section class="mp-section">
      <div class="section-title">
        <h3><span class="emoji">${cat.emoji}</span> ${cat.name}</h3>
        <span class="count">${cat.count} Artikel</span>
        <span class="line"></span>
      </div>
      <div class="card-grid"${catGridStyle}>
        ${cardsHTML}
      </div>
    </section>\n`;
  }

  // Newsletter
  const nlGlow = `<div class="newsletter-glow">
    <div class="nl-inner">
      <div class="nl-text">
        <h3>📬 Keinen Artikel mehr verpassen</h3>
        <p>Unser Newsletter liefert dir jede Woche die besten Aquaristik-Tipps – kostenlos und jederzeit kündbar.</p>
      </div>
      <div class="nl-cta">
        <a href="#" class="btn-ghost">Instagram</a>
        <a href="#" class="btn-glow">Newsletter abonnieren →</a>
      </div>
    </div>
  </div>`;

  // Topic Explorer
  let topicsHTML = '';
  for (const [name, color, url] of TOPICS) {
    topicsHTML += topicTag(name, color, url);
  }

  const topicsSection = `<section class="mp-section">
    <div class="section-title">
      <h3><span class="emoji">🏷️</span> Themen entdecken</h3>
      <span class="count">${TOPICS.length} Topics</span>
      <span class="line"></span>
    </div>
    <div class="topic-cloud">
      ${topicsHTML}
    </div>
  </section>`;

  // Newsletter 2
  const nlGlow2 = `<div class="newsletter-glow">
    <div class="nl-inner">
      <div class="nl-text">
        <h3>🐟 Bereit für dein Traum-Aquarium?</h3>
        <p>Melde dich an und erhalte die besten Tipps, Tricks und Guides direkt in dein Postfach.</p>
      </div>
      <div class="nl-cta">
        <a href="#" class="btn-glow">Newsletter abonnieren →</a>
      </div>
    </div>
  </div>`;

  const body = `<main class="megapage">
${heroHTML}
${statsHTML}
${nlGlow}
${edsPickHTML}
${catSections}
${topicsSection}
${nlGlow2}
</main>`;

  return wrapPage(
    'Aquaristik Zentrum – Alles rund ums Aquarium | Megapage',
    'Aquaristik Zentrum – Dein Magazin mit 5000+ Wort Guides, Pop Art Comic Illustrationen und praktischen Tipps für Einsteiger und Profis.',
    '/images/hero.png',
    body
  );
}

// ── GENERATE ARTICLE ──
function buildArticle(slug) {
  const a = ARTICLES[slug];
  if (!a) { console.error(`Article not found: ${slug}`); return; }

  let relatedHTML = '';
  for (const [rslug, rtitle, rdesc, rimg] of a.related) {
    relatedHTML += recCardHTML(rslug, rtitle, rdesc, rimg);
  }
  let tocHTML = '';
  for (const item of a.toc) {
    tocHTML += tocItem(item);
  }
  const [pname, pdesc, pasin, pc1, pc2] = a.prod;

  const contentPath = path.join(CONTENT, 'artikel', `${slug}.html`);
  let bodyContent = '';
  if (fs.existsSync(contentPath)) {
    bodyContent = fs.readFileSync(contentPath, 'utf-8').trim();
  } else {
    const existingPath = path.join(ROOT, 'artikel', `${slug}.html`);
    if (fs.existsSync(existingPath)) {
      const existing = fs.readFileSync(existingPath, 'utf-8');
      const match = existing.match(/<div class="body-text">([\s\S]*?)<\/div>\s*<\/div>/);
      if (match) {
        bodyContent = match[1].trim();
      } else {
        const m2 = existing.match(/<div class="article-content">([\s\S]*?)<\/div>\s*<\/div>\s*<div class="article-sidebar"/);
        if (m2) bodyContent = m2[1].trim();
        else { console.error(`Cannot extract content from: ${slug}`); return; }
      }
    } else { console.error(`Missing content file: ${slug}`); return; }
  }

  const sidebarHTML = `<div class="article-sidebar">
      <div class="side-section">
        <h5>📚 Verwandte Artikel</h5>${relatedHTML}
      </div>
      <div class="side-section">
        <h5>🛒 Empfohlenes Zubehör</h5>
        <div class="side-product-card">
          <div class="prod-thumb" style="background:linear-gradient(135deg,${pc1},${pc2})"></div>
          <p>${pname}</p>
          <p class="prod-sub">${pdesc}</p>
          <a href="https://www.amazon.de/dp/${pasin}?tag=nova079-20" target="_blank" class="prod-link">→ Bei Amazon ansehen</a>
        </div>
      </div>
      <div class="side-section">
        <h5>📋 Inhaltsverzeichnis</h5>
        <div>${tocHTML}</div>
      </div>
    </div>`;

  const style = a.catColor.startsWith('#ffd93d')
    ? `background:${a.catColor};color:#0a0a0f;`
    : `background:${a.catColor};color:#fff;`;

  const jsonLd = `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "${a.title}",
  "description": "${a.excerpt}",
  "image": "https://aquaristik-zentrum.com/images/${a.img}",
  "author": {
    "@type": "Person",
    "name": "Alexander"
  },
  "datePublished": "${a.date}",
  "publisher": {
    "@type": "Organization",
    "name": "Aquaristik Zentrum"
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://aquaristik-zentrum.com/artikel/${slug}.html"
  }
}
<\/script>`;

  const body = `<div class="article-layout">
    <div class="article-main">
      <span class="cat-head" style="${style}">${a.cat}</span>
      <h1>${a.title}</h1>
      <div class="meta">
        <span>👤 Alexander</span>
        <span class="sep">·</span>
        <span>${a.date}</span>
        <span class="sep">·</span>
        <span>${a.readingTime} Min. Lesezeit</span>
      </div>
      <div class="body-text">
        ${bodyContent}
      </div>
    </div>
    ${sidebarHTML}
  </div>`;

  return wrapPage(`${a.title} | Aquaristik Zentrum`, a.excerpt, `/images/${a.img}`, body, jsonLd);
}

function buildPage(title, desc, bodyContent) {
  const hero = T.pageHero.replace('{{PAGE_TITLE}}', title);
  const body = `${hero}\n<main>\n  <div class="page-content">\n    ${bodyContent}\n  </div>\n</main>`;
  return wrapPage(`${title} – Aquaristik Zentrum`, desc, '', body);
}

// ── WRAPPER ──
function wrapPage(title, desc, ogImage, body, jsonLd) {
  const jsonLdTag = jsonLd ? `\n${jsonLd}` : '';
  const head = `<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="${desc}">
<meta name="robots" content="index, follow">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:type" content="website">
<meta property="og:url" content="https://aquaristik-zentrum.com/">
<meta property="og:site_name" content="Aquaristik Zentrum">
${ogImage ? `<meta property="og:image" content="https://aquaristik-zentrum.com${ogImage}">` : ''}
${T.head}${jsonLdTag}`;
  return `<!DOCTYPE html>
<html lang="de">
<head>
  ${head}
</head>
<body>
${T.nav}
${body}
${T.footer}
${T.cookie}
</body>
</html>`;
}

// ── MAIN ──
function main() {
  console.log('🔨 Building aquaristik-zentrum.com (Megamagazin v3)...\n');

  fs.writeFileSync(path.join(OUTPUT, 'index.html'), buildIndex());
  console.log('  ✓ index.html');

  for (const slug of Object.keys(ARTICLES)) {
    const outPath = path.join(OUTPUT, 'artikel', `${slug}.html`);
    const html = buildArticle(slug);
    if (html) {
      fs.writeFileSync(outPath, html);
      console.log(`  ✓ artikel/${slug}.html`);
    }
  }

  const aboutPath = path.join(CONTENT, 'about.html');
  if (fs.existsSync(aboutPath)) {
    const content = fs.readFileSync(aboutPath, 'utf-8').trim();
    fs.writeFileSync(path.join(OUTPUT, 'about.html'), buildPage('Über Aquaristik Zentrum', 'Erfahre mehr über Aquaristik Zentrum – unseren Blog, unsere Mission und das Team.', content));
    console.log('  ✓ about.html');
  }

  const imprPath = path.join(CONTENT, 'impressum.html');
  if (fs.existsSync(imprPath)) {
    const content = fs.readFileSync(imprPath, 'utf-8').trim();
    fs.writeFileSync(path.join(OUTPUT, 'impressum.html'), buildPage('Impressum', 'Impressum der Webseite Aquaristik Zentrum.', content));
    console.log('  ✓ impressum.html');
  }

  console.log('\n✨ Build complete! All pages generated.');
}

main();
