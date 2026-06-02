#!/usr/bin/env node
/**
 * build.js — Aquaristik Zentrum Static Site Builder
 * Reads templates/ + page data → generates all HTML files.
 * 
 * Usage: node build.js
 * Cloudflare Pages build command: node build.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const TEMPLATES = path.join(ROOT, '_templates');
const CONTENT = path.join(ROOT, 'content');
const OUTPUT = ROOT; // output to root

// ── Read templates ──
function readTemplate(name) {
  return fs.readFileSync(path.join(TEMPLATES, name), 'utf-8');
}

const T = {
  head: readTemplate('head.html'),
  nav: readTemplate('nav.html'),
  footer: readTemplate('footer.html'),
  cookie: readTemplate('cookie.html'),
  pageHero: readTemplate('page-hero.html'),
  categorySection: readTemplate('category-section.html'),
};

// ── Helpers ──
function cardHTML(slug, title, excerpt, img, cat, catColor, date) {
  const imgStyle = img.startsWith('linear-gradient')
    ? `background:${img}`
    : `background-image:url('/images/${img}')`;
  const catBg = catColor || 'rgba(0,0,0,0.5)';
  const catStyle = catColor && catColor.startsWith('#ffd93d')
    ? `background:${catColor};color:#0a0a0f;`
    : `background:${catBg};`;
  return `<a href="/artikel/${slug}" class="card-modern">
    <div class="art-img" style="${imgStyle}">
      <span class="cat-badge" style="${catStyle}">${cat}</span>
    </div>
    <div class="art-body">
      <span class="date">${date}</span>
      <h4>${title}</h4>
      <p>${excerpt}</p>
      <span class="read-link">Weiterlesen →</span>
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
};

// ── CATEGORY DATA for index page ──
const CATEGORIES = [
  {
    emoji: '🐟', name: 'Einsteiger', count: 4,
    gridStyle: '',
    cards: ['einsteiger-aquarium-guide', 'bodengrund-aquarium-guide', 'aquarium-einfahren-nitritpeak', 'wasserwerte-aquarium-guide']
  },
  {
    emoji: '🌿', name: 'Pflanzen & Aquascaping', count: 3,
    gridStyle: '',
    cards: ['aquarienpflanzen-anfaenger', 'co2-im-aquarium', 'aquascaping-anfaenger']
  },
  {
    emoji: '⚙️', name: 'Technik', count: 2,
    gridStyle: ' style="grid-template-columns:repeat(2,1fr);"',
    cards: ['aquarium-technik-ueberblick', 'co2-im-aquarium']
  },
  {
    emoji: '🦐', name: 'Garnelen & Fische', count: 3,
    gridStyle: '',
    cards: ['garnelen-im-aquarium', 'kampffisch-haltung-betta', 'beliebteste-aquarienfische']
  },
  {
    emoji: '💊', name: 'Pflege & Gesundheit', count: 3,
    gridStyle: '',
    cards: ['algen-im-aquarium', 'fischkrankheiten-aquarium-guide', 'aquarium-pflegeroutine-guide']
  },
];

// ── GENERATE INDEX ──
function buildIndex() {
  let heroSide = '';
  const heroLinks = [
    ['bodengrund-aquarium-guide', 'Bodengrund-Guide', 'Kies, Sand oder Soil?', 'bodengrund-arten.png'],
    ['fischkrankheiten-aquarium-guide', 'Fischkrankheiten', 'Ich, Flossenfäule & Co.', 'krankheiten-symptome.png'],
    ['co2-im-aquarium', 'CO₂-Anlage', 'Diffusor, Dauertest, Düngung', 'co2-anlage.png'],
  ];
  for (const [slug, title, desc, img] of heroLinks) {
    const imgStyle = img.startsWith('linear-gradient')
      ? `background:${img}`
      : `background-image:url('/images/${img}')`;
    heroSide += `<a href="/artikel/${slug}" class="side-item">
      <div class="thumb" style="${imgStyle}"></div>
      <div class="info"><h5>${title}</h5><small>${desc}</small></div>
    </a>\n`;
  }

  let catSections = '';
  for (const cat of CATEGORIES) {
    let cardsHTML = '';
    for (const slug of cat.cards) {
      const a = ARTICLES[slug];
      if (!a) continue;
      cardsHTML += cardHTML(slug, a.title, a.excerpt, a.img, a.cat, a.catColor, a.date);
    }
    catSections += T.categorySection
      .replace('{{CAT_EMOJI}}', cat.emoji)
      .replace('{{CAT_NAME}}', cat.name)
      .replace('{{CAT_COUNT}}', cat.count)
      .replace('{{GRID_STYLE}}', cat.gridStyle)
      .replace('{{CAT_CARDS}}', cardsHTML) + '\n';
  }

  const heroHTML = `<div class="hero-modern">
    <div class="hero-feat">
      <div class="bg-img" style="background-image:url('/images/hero.png')"></div>
      <div class="content">
        <span class="tag">⭐ Neu</span>
        <h2>Aquarium Pflegeroutine<br>Der große Wartungsplan</h2>
        <p>Wasserwechsel, Filterreinigung, Algenentfernung — Schritt f\u00fcr Schritt zur perfekten Routine. Inklusive Checkliste.</p>
      </div>
    </div>
    <div class="hero-side">
      ${heroSide}
    </div>
  </div>`;

  const nlGlow = `<div class="newsletter-glow">
    <div class="nl-inner">
      <div class="nl-text">
        <h3>📬 Keinen Artikel mehr verpassen</h3>
        <p>Unser Newsletter liefert dir jede Woche die besten Aquaristik-Tipps – kostenlos und jederzeit k\u00fcndbar.</p>
      </div>
      <div class="nl-cta">
        <a href="#" class="btn-ghost">Instagram</a>
        <a href="#" class="btn-glow">Newsletter abonnieren →</a>
      </div>
    </div>
  </div>`;

  const nlGlow2 = `<div class="newsletter-glow">
    <div class="nl-inner">
      <div class="nl-text">
        <h3>🐟 Bereit f\u00fcr dein Traum-Aquarium?</h3>
        <p>Melde dich an und erhalte die besten Tipps, Tricks und Guides direkt in dein Postfach.</p>
      </div>
      <div class="nl-cta">
        <a href="#" class="btn-glow">Newsletter abonnieren →</a>
      </div>
    </div>
  </div>`;

  const body = `<main class="megapage">\n${heroHTML}\n${catSections}\n${nlGlow}\n${nlGlow2}\n</main>`;
  return wrapPage('Aquaristik Zentrum – Alles rund ums Aquarium | Megapage', 'Aquaristik Zentrum – Dein Ratgeber mit 5000+ Wort Guides, Pop Art Comic Illustrationen und praktischen Tipps.', '/images/hero.png', body);
}

// ── GENERATE ARTICLE ──
function buildArticle(slug) {
  const a = ARTICLES[slug];
  if (!a) { console.error(`Article not found: ${slug}`); return; }

  // Build related articles
  let relatedHTML = '';
  for (const [rslug, rtitle, rdesc, rimg] of a.related) {
    relatedHTML += recCardHTML(rslug, rtitle, rdesc, rimg);
  }
  // Build TOC
  let tocHTML = '';
  for (const item of a.toc) {
    tocHTML += tocItem(item);
  }
  // Build product
  const [pname, pdesc, pasin, pc1, pc2] = a.prod;

  // Read existing content from content/artikel/
  const contentPath = path.join(CONTENT, 'artikel', `${slug}.html`);
  let bodyContent = '';
  if (fs.existsSync(contentPath)) {
    bodyContent = fs.readFileSync(contentPath, 'utf-8').trim();
  } else {
    // Fallback: try to extract from existing article
    const existingPath = path.join(ROOT, 'artikel', `${slug}.html`);
    if (fs.existsSync(existingPath)) {
      const existing = fs.readFileSync(existingPath, 'utf-8');
      const match = existing.match(/<div class="body-text">([\s\S]*?)<\/div>\s*<\/div>/);
      if (match) {
        bodyContent = match[1].trim();
      } else {
        // Try to find article content more broadly
        const m2 = existing.match(/<div class="article-content">([\s\S]*?)<\/div>\s*<\/div>\s*<div class="article-sidebar"/);
        if (m2) {
          bodyContent = m2[1].trim();
        } else {
          console.error(`Cannot extract content from existing file: ${slug}`);
          return;
        }
      }
    } else {
      console.error(`Missing content file: ${slug}`);
      return;
    }
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

  return wrapPage(`${a.title} | Aquaristik Zentrum`, a.excerpt, `/images/${a.img}`, body);
}

// ── GENERATE PAGE (about, impressum) ──
function buildPage(title, desc, bodyContent) {
  const hero = T.pageHero.replace('{{PAGE_TITLE}}', title);
  const body = `${hero}\n<main>\n  <div class="page-content">\n    ${bodyContent}\n  </div>\n</main>`;
  return wrapPage(`${title} – Aquaristik Zentrum`, desc, '', body);
}

// ── WRAPPER ──
function wrapPage(title, desc, ogImage, body) {
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
${T.head}`;

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
  console.log('🔨 Building aquaristik-zentrum.com...\n');

  // 1. Index
  fs.writeFileSync(path.join(OUTPUT, 'index.html'), buildIndex());
  console.log('  ✓ index.html');

  // 2. Articles
  for (const slug of Object.keys(ARTICLES)) {
    buildArticle(slug);
    const outPath = path.join(OUTPUT, 'artikel', `${slug}.html`);
    const html = buildArticle(slug);
    if (html) {
      fs.writeFileSync(outPath, html);
      console.log(`  ✓ artikel/${slug}.html`);
    }
  }

  // 3. About page
  const aboutPath = path.join(CONTENT, 'about.html');
  if (fs.existsSync(aboutPath)) {
    const content = fs.readFileSync(aboutPath, 'utf-8').trim();
    fs.writeFileSync(path.join(OUTPUT, 'about.html'), buildPage('Über Aquaristik Zentrum', 'Erfahre mehr über Aquaristik Zentrum – unseren Blog, unsere Mission und das Team.', content));
    console.log('  ✓ about.html');
  }

  // 4. Impressum
  const imprPath = path.join(CONTENT, 'impressum.html');
  if (fs.existsSync(imprPath)) {
    const content = fs.readFileSync(imprPath, 'utf-8').trim();
    fs.writeFileSync(path.join(OUTPUT, 'impressum.html'), buildPage('Impressum', 'Impressum der Webseite Aquaristik Zentrum.', content));
    console.log('  ✓ impressum.html');
  }

  console.log('\n✨ Build complete! All pages generated.');
}

main();
