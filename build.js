#!/usr/bin/env node
// Aquaristik Zentrum Static Site Builder v3 (Megamagazin)
// Reads templates/ + page data → generates all HTML files.
// URL-Konsolidierung: interne Links zeigen ausschliesslich auf kanonische
// Trailing-Slash-URLs (/artikel/<slug>/, /about/, /impressum/).
// (Original: build.js — erweitert, Inhalte unveraendert.)

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

// URL consolidation helper: internal article/section links use the canonical
// trailing-slash form everywhere. External links are left untouched.
const canonicalPath = href => {
  if (typeof href !== 'string') return href;
  // Only rewrite site-internal paths.
  if (!href.startsWith('/')) return href;
  // Static assets and special files keep their exact URL.
  if (/\/(?:images|style\.css|app\.js|favicon\.svg|ads\.txt|robots\.txt|sitemap\.xml|404\.html)(?:$|[/?#])/.test(href)) return href;
  // /artikel/<slug>.html → /artikel/<slug>/  ;  /about.html → /about/
  let out = href.replace(/^\/(.+)\.html(\?|#|$)/, '/$1$2');
  // Directory-style links (/artikel/) already end with a slash.
  if (!out.endsWith('/') && !/\.[a-z0-9]+(\?|#|$)/i.test(out) && !out.includes('/artikel/')) {
    out = `${out}/`;
  }
  return out;
};

const AMAZON_TAG = 'nova079-20';
function amazonAffiliateUrl(ref) {
  if (ref && ref.startsWith('search:')) {
    const query = encodeURIComponent(ref.replace(/^search:/, '').trim()).replace(/%20/g, '+');
    return `https://www.amazon.de/s?k=${query}&amp;tag=${AMAZON_TAG}`;
  }
  return `https://www.amazon.de/dp/${ref}?tag=${AMAZON_TAG}`;
}

// ── Helpers ──

// SEO: Title für SERPs truncaten (Google ~60 Zeichen)
function truncateSERP(s, max = 60) {
  if (s.length <= max) return s;
  const cut = s.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trim() + '…';
}

// SEO: Description für SERPs truncaten (Google ~155 Zeichen)
function truncateDesc(s, max = 155) {
  if (s.length <= max) return s;
  const cut = s.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trim() + '…';
}

// SEO: Deutsches Datum → ISO 8601 (Google benötigt YYYY-MM-DD für datePublished)
const DE_MONTHS = { 'Januar': '01', 'Februar': '02', 'März': '03', 'April': '04', 'Mai': '05', 'Juni': '06', 'Juli': '07', 'August': '08', 'September': '09', 'Oktober': '10', 'November': '11', 'Dezember': '12' };
function dateToISO(deDate) {
  if (!deDate) return new Date().toISOString().slice(0, 10);
  // Bereits ISO?
  if (/^\d{4}-\d{2}-\d{2}/.test(deDate)) return deDate.slice(0, 10);
  // Deutsches Format: "7. Juni 2026" → "2026-06-07"
  const m = deDate.match(/(\d{1,2})\.\s*(\w+)\s*(\d{4})/);
  if (m) {
    const day = m[1].padStart(2, '0');
    const month = DE_MONTHS[m[2]] || '01';
    return `${m[3]}-${month}-${day}`;
  }
  return new Date().toISOString().slice(0, 10);
}
function cardHTML(slug, title, excerpt, img, cat, catColor, readingTime) {
  const imgStyle = img.startsWith('linear-gradient')
    ? `background:${img}`
    : `background-image:url('/images/${img}')`;
  const catStyle = catColor && catColor.startsWith('#ffd93d')
    ? `background:${catColor};color:#0a0a0f;`
    : `background:${catColor || 'rgba(0,0,0,0.5)'};`;
  return `<a href="/artikel/${slug}/" class="card-modern">
    <div class="art-img" style="${imgStyle}">
      <span class="cat-badge" style="${catStyle}">${cat}</span>
      ${readingTime ? `<span class="read-badge">${readingTime} Min</span>` : ''}
    </div>
    <div class="art-body">
      <h4>${title}</h4>
      <p>${excerpt}</p>
      <span class="read-link">Weiterlesen →</span>
    </div>
  </a>`;
}

function heroCardHTML(slug, title, excerpt, img, cat, catColor, readingTime) {
  const imgStyle = img.startsWith('linear-gradient')
    ? `background:${img}`
    : `background-image:url('/images/${img}')`;
  const catStyle = catColor && catColor.startsWith('#ffd93d')
    ? `background:${catColor};color:#0a0a0f;`
    : `background:${catColor || 'rgba(0,0,0,0.5)'};`;
  return `<a href="/artikel/${slug}/" class="hero-card">
    <div class="hero-card-bg" style="${imgStyle}"></div>
    <div class="hero-card-overlay"></div>
    <div class="hero-card-body">
      <span class="hero-card-tag" style="${catStyle}">${cat}</span>
      <h3>${title}</h3>
      <p>${excerpt}</p>
      <span class="hero-card-meta">${readingTime} Min Lesezeit</span>
    </div>
  </a>`;
}

function recCardHTML(slug, title, desc, img) {
  const imgStyle = img.startsWith('linear-gradient')
    ? `background:${img}`
    : `background-image:url('/images/${img}')`;
  return `<a href="/artikel/${slug}/" class="rec-card">
  <div class="rthumb" style="${imgStyle}"></div>
  <div class="rinfo"><h6>${title}</h6><small>${desc}</small></div>
</a>`;
}

function relatedBottomHTML(related) {
  let html = '<div class="related-bottom"><h3>📖 Weiterführende Artikel</h3><div class="related-bottom-grid">';
  for (const [rslug, rtitle, rdesc] of related) {
    html += `<a href="/artikel/${rslug}/" class="related-bottom-card">
      <h4>${rtitle}</h4>
      <p>${rdesc}</p>
      <span class="read-link-sm">Weiterlesen →</span>
    </a>`;
  }
  html += '</div></div>';
  return html;
}

// ── INTERNAL CROSS-LINKING ──
function injectInternalLinks(bodyContent, related) {
  if (!related || related.length === 0) return bodyContent;
  // Inject after first </h2> if the body has any h2
  const h2Match = bodyContent.match(/<\/h2>/);
  if (!h2Match) return bodyContent;

  const idx = h2Match.index + 6; // after </h2>
  const linkBox = related.map(([rslug, rtitle]) =>
    `<a href="/artikel/${rslug}/" class="inline-related">→ ${rtitle}</a>`
  ).join('\n    ');

  const snippet = `\n  <div class="inline-related-box">
    <strong>📌 Passend dazu:</strong>
    ${linkBox}
  </div>\n  `;

  return bodyContent.slice(0, idx) + snippet + bodyContent.slice(idx);
}

function tocItem(text) {
  return `<div class="toc-item">→ ${text}</div>`;
}

function topicTag(name, color, url) {
  return `<a href="${canonicalPath(url)}" class="topic-tag" style="--topic-color:${color}">${name}</a>`;
}

// ── BREADCRUMB ──
function breadcrumbHTML(items) {
  const crumbs = items.map((item, i) => {
    if (i === items.length - 1) {
      return `<span class="crumb-last">${item.label}</span>`;
    }
    return `<a href="${canonicalPath(item.url)}" class="crumb-link">${item.label}</a><span class="crumb-sep">›</span>`;
  }).join('');
  return `<nav class="breadcrumb" aria-label="Breadcrumb">${crumbs}</nav>`;
}

function breadcrumbSchema(items) {
  const itemList = items.map((item, i) => ({
    "@type": "ListItem",
    "position": i + 1,
    "name": item.label,
    "item": item.url
  }));
  return `{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": ${JSON.stringify(itemList, null, 2)}
}`;
}

// ── LAZY LOAD + RESPONSIVE IMAGES HELPER ──
function addLazyLoading(html) {
  // These two articles already show the same working hero above the legacy duplicate.
  html = html.replace(
    /<div class="article-image-full"><img src="\.\.\/images\/(schwimmpflanzen-aquarium-guide|urlaub-aquarium-futterautomat)\.png"[^>]*><\/div>\r?\n/g,
    (tag, name) => html.includes(`src="../../images/${name}.webp"`) ? '' : tag,
  );
  return html.replace(/<img\b[^>]*>/g, tag => {
    if (!/\sloading=/.test(tag) && !/class="hero/.test(tag)) {
      tag = tag.replace(/^<img\s+/, '<img loading="lazy" ');
    }
    const source = tag.match(/\ssrc="((?:\.{1,2}\/|\/)*images\/([^"/]+))"/);
    if (!source) return tag;
    let [, src, filename] = source;
    const exists = name => fs.existsSync(path.join(ROOT, 'images', name));
    if (!exists(filename)) {
      const replacement = filename === 'wasserwerte-guide.webp'
        ? 'wasserwerte-aquarium-guide.webp'
        : filename.replace(/\.png$/, '.webp');
      if (replacement !== filename && exists(replacement)) {
        tag = tag.replace(`src="${src}"`, `src="/images/${replacement}"`);
        if (filename === 'wasserwerte-guide.webp') {
          tag = tag.replace('alt="Wasserwerte-Testkit und Messstreifen im Aquarium"',
            'alt="Illustration von Reagenzgläsern zum Messen der Wasserwerte"');
        }
        src = `/images/${replacement}`;
        filename = replacement;
      }
    }
    // Keep explicit responsive sets and never generate a URL for a nonexistent variant.
    if (filename.endsWith('.webp') && !/\ssrcset=/.test(tag)) {
      const base = filename.slice(0, -5);
      if (exists(`${base}-640.webp`) && exists(`${base}-960.webp`)) {
        const prefix = src.slice(0, src.lastIndexOf('/') + 1);
        tag = tag.replace(`src="${src}"`,
          `src="${src}" srcset="${prefix}${base}-640.webp 640w, ${prefix}${base}-960.webp 960w, ${src} 1216w" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 960px, 1216px"`);
      }
    }
    return tag;
  });
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
    img: 'beliebteste-aquarienfische.png', readingTime: 6,
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
      ['garnelen-im-aquarium', 'Garnelen', 'Vergesellschaftung', 'garnelen.png'],
      ['aquarienpflanzen-anfaenger', 'Pflanzen-Guide', 'Bepflanzungsideen', 'aquarienpflanzen.png'],
      ['fischkrankheiten-aquarium-guide', 'Kampffisch typisch', 'Krankheiten', 'krankheiten-symptome.png'],
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
    title: "Fischkrankheiten erkennen: Warnzeichen, Wasserchecks und tierärztliche Hilfe",
    excerpt: "Auffälligkeiten bei Süßwasserfischen einordnen, Wasserwerte dokumentieren und gezielt tierärztliche Hilfe suchen. Keine pauschalen Medikamentenrezepte.",
    date: '3. Juni 2026',
    cat: 'Pflege', catColor: '#ffd93d', catEmoji: '💊',
    img: 'krankheiten-symptome.png', readingTime: 10,
    toc: ["Wann du sofort Hilfe brauchst", "Erst beobachten und Wasser prüfen", "Symptome einordnen, nicht selbst diagnostizieren", "Warum es hier keine Salz- und Medikamentenrezepte gibt", "Quarantäne und Vorsorge sinnvoll planen", "Checkliste für das Gespräch mit der Tierarztpraxis"],
    related: [
      ['algen-im-aquarium', 'Algen-Guide', 'Erkennen & vorbeugen', 'algen.png'],
      ['aquarium-pflegeroutine-guide', 'Pflegeroutine', 'Krankheiten vermeiden', 'wasserwechsel.png'],
      ['kampffisch-haltung-betta', 'Kampffisch', 'Typische Krankheiten', 'kampffisch-haltung.png'],
      ['garnelen-im-aquarium', 'Garnelen-Guide', 'Krankheiten bei Garnelen', 'garnelen.png'],
    ],
    prod: null,
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
  'panzerwelse-aquarium': {
    title: 'Panzerwelse im Aquarium – Haltung, Arten und Pflege',
    excerpt: 'Corydoras im Porträt: die beliebtesten Panzerwelsarten, Beckeneinrichtung, Wasserwerte, Vergesellschaftung und Nachzucht.',
    date: '3. Juni 2026', cat: 'Fische', catColor: '#ec4899', catEmoji: '🐟',
    img: 'panzerwelse.png', readingTime: 8,
    toc: ['Warum Panzerwelse?', 'Beliebte Arten', 'Beckengröße & Einrichtung', 'Wasserwerte', 'Vergesellschaftung', 'Ernährung', 'Nachzucht', 'Fazit'],
    related: [['vergesellschaftung-aquarienfische','Vergesellschaftung','Fisch-Kombos','vergesellschaftung-vertraeglich.png'],['lebendgebärende-zahnkarpfen','Lebendgebärende','Guppys, Platys','lebendgebarende-arten.png'],['garnelen-im-aquarium','Garnelen','Mitbewohner','garnelen.png'],['aquarium-futter-ernaehrung','Futter-Guide','Ernährung','futter-arten.png']],
    prod: ['Panzerwelse Futter', 'Spezialfutter für Bodenfische', 'B0D6FZWF5R', '#ec4899', '#db2777'],
  },
  'salmler-aquarium': {
    title: 'Salmler im Aquarium – Neonsalmler, Rote von Rio & Co.',
    excerpt: 'Die schönsten Salmlerarten fürs Aquarium: Neonsalmler, Rote von Rio, Blauer Neon – Haltung, Wasserwerte und Schwarmverhalten.',
    date: '3. Juni 2026', cat: 'Fische', catColor: '#ec4899', catEmoji: '🐟',
    img: 'salmler.png', readingTime: 8,
    toc: ['Was sind Salmler?', 'Neonsalmler', 'Roter von Rio', 'Blauer Neon', 'Beckengröße & Haltung', 'Wasserwerte', 'Vergesellschaftung', 'Fazit'],
    related: [['beliebteste-aquarienfische','Aquarienfische','Top 10','linear-gradient(135deg,#ec4899,#db2777)'],['kampffisch-haltung-betta','Kampffisch','Betta Pflege','kampffisch-haltung.png'],['garnelen-im-aquarium','Garnelen','Vergesellschaftung','garnelen.png'],['aquarium-pflegeroutine-guide','Pflegeroutine','Wasserwechsel','wasserwechsel.png']],
    prod: ['Salmler Futter Set', 'Feines Granulat & Flocken', 'B0CBHFMY7H', '#ec4899', '#db2777'],
  },
  'aquarium-moosarten': {
    title: 'Moosarten im Aquarium – Javamoos, Christmas Moos und Mooskugeln',
    excerpt: 'Die besten Moosarten fürs Aquarium: Javamoos, Christmas Moos, Mooskugeln – Pflege, Befestigung und Einsatzmöglichkeiten.',
    date: '3. Juni 2026', cat: 'Pflanzen', catColor: '#10b981', catEmoji: '🌿',
    img: 'aquarium-moos.png', readingTime: 7,
    toc: ['Warum Moos?', 'Javamoos', 'Christmas Moos', 'Mooskugeln', 'Befestigung', 'Pflege & Schnitt', 'Fazit'],
    related: [['aquarienpflanzen-anfaenger','Pflanzen-Guide','Arten für Anfänger','aquarienpflanzen.png'],['bodendecker-teppichpflanzen','Teppichpflanzen','Bodendecker','teppich-pflanzen.png'],['pflanzenvermehrung-aquarium','Pflanzenvermehrung','Stecklinge','pflanzen-vermehrung.png'],['aquarium-duengung-guide','Düngung','Nährstoffe','duengung-pflanzen.png']],
    prod: ['Aquarium Moos Set', 'Javamoos + Christmas Moos', 'B00DB3HGG4', '#10b981', '#059669'],
  },
  'nano-aquarium-guide': {
    title: 'Nano Aquarium – Der komplette Guide für Mini-Becken bis 30 Liter',
    excerpt: 'Mini-Aquarien im Trend: Beckengrößen, Technik, Besatz und Pflege von Nano-Aquarien – der ultimative Guide für kleine Becken.',
    date: '4. Juni 2026', cat: 'Einsteiger', catColor: '#06b6d4', catEmoji: '🐟',
    img: 'nano-aquarium-guide.png', readingTime: 7,
    toc: ['Was ist ein Nano Aquarium?', 'Geeignete Beckengrößen', 'Technik für Nano-Becken', 'Geeignete Fische & Garnelen', 'Bepflanzung & Aquascaping', 'Pflegeroutine', 'Vor- und Nachteile', 'Fazit'],
    related: [['beckenformen-groessen','Beckenformen','Die richtige Form','becken-formen.png'],['einsteiger-aquarium-guide','Einsteiger-Guide','Grundlagen','einsteiger-guide.png'],['aquarium-technik-ueberblick','Technik-Guide','Technik-Überblick','technik.png'],['garnelen-im-aquarium','Garnelen','Perfekt für Nano','garnelen.png']],
    prod: ['Aquarium Komplettset 30L', 'Ideal für den Nano-Start', 'B00CIF8TCS', '#06b6d4', '#0891b2'],
  },
  'aquarium-schaedlinge': {
    title: 'Aquarium Schädlinge: Planarien, Hydra & Schneckenplage erkennen und bekämpfen',
    excerpt: 'Planarien, Hydra, Schneckenplage und Federwürmer – der große Guide zur Erkennung und Bekämpfung von Aquarien-Schädlingen.',
    date: '4. Juni 2026', cat: 'Pflege', catColor: '#ffd93d', catEmoji: '💊',
    img: 'aquarium-schaedlinge.png', readingTime: 8,
    toc: ['Übersicht', 'Planarien', 'Hydra', 'Schneckenplage', 'Feder- & Borstenwürmer', 'Sonstige Schädlinge', 'Vorbeugung', 'Chemisch vs. Biologisch', 'Fazit'],
    related: [['fischkrankheiten-aquarium-guide','Fischkrankheiten','Diagnose & Behandlung','krankheiten-symptome.png'],['garnelen-im-aquarium','Garnelen','Gefährdung durch Hydra','garnelen.png'],['quarantaene-medikamente','Quarantäne','Einschleppung verhindern','quarantaene-becken.png'],['aquarium-pflegeroutine-guide','Pflegeroutine','Sauberkeit','wasserwechsel.png']],
    prod: ['Wassertest Set Profi', 'Zur Kontrolle der Wasserwerte', 'B0D6FZWF5R', '#ffd93d', '#f59e0b'],
  },
  'aquarium-automation': {
    title: 'Aquarium Automation: Smarte Technik für die moderne Aquaristik',
    excerpt: 'Smarte Steckdosen, Futterautomaten, Aquarien-Controller und Dosierpumpen – der Guide zur Automatisierung deines Aquariums.',
    date: '4. Juni 2026', cat: 'Technik', catColor: '#8b5cf6', catEmoji: '⚙️',
    img: 'aquarium-automation.png', readingTime: 7,
    toc: ['Einleitung', 'Smarte Steckdosen', 'Automatische Fütterung', 'Automatischer Wasserwechsel', 'Smart-Home-Steuerung', 'Aquarien-Controller', 'Dosierpumpen', 'Kameras & Live-Stream', 'Kosten & Nutzen', 'Fazit'],
    related: [['aquarium-technik-ueberblick','Technik-Guide','Equipment-Überblick','technik.png'],['aquarium-pflegeroutine-guide','Pflegeroutine','Automatisierte Pflege','wasserwechsel.png'],['aquarium-filter-guide','Filter-Guide','Smarte Filtersteuerung','filter-guide.png'],['aquarium-beleuchtung-guide','Beleuchtung','Smarte Beleuchtung','beleuchtung.png']],
    prod: ['Smarte Steckdose WLAN', 'Für Licht & CO₂-Automatik', 'B0DDLNYNNL', '#8b5cf6', '#7c3aed'],
  },
  'diskushaltung-pflege': {
    title: 'Diskusfische – Haltung, Pflege und Zucht der Königsfische',
    excerpt: 'Diskusfische im Aquarium: Herkunft, Wasserwerte, Beckengröße, Ernährung, Vergesellschaftung und Zucht der anspruchsvollen Könige der Aquaristik.',
    date: '4. Juni 2026', cat: 'Fische', catColor: '#ec4899', catEmoji: '🐟',
    img: 'diskushaltung.png', readingTime: 10,
    toc: ['Herkunft & Lebensraum', 'Wildform vs. Zuchtform', 'Die richtige Aquariumgröße', 'Wasserwerte', 'Technik', 'Ernährung', 'Vergesellschaftung', 'Krankheiten', 'Zucht', 'Fazit'],
    related: [['fische-fortgeschrittene','Fische für Profis','Anspruchsvolle Fische','fische-anspruchsvoll.png'],['wasserwerte-aquarium-guide','Wasserwerte','pH, GH, KH verstehen','linear-gradient(135deg,#06b6d4,#0891b2)'],['aquarium-technik-ueberblick','Technik-Guide','Filter & Heizung','technik.png'],['garnelen-im-aquarium','Garnelen','Mitbewohner für Diskus','garnelen.png']],
    prod: ['Diskusfutter Granulat', 'Premium-Futter für Diskus', 'search:Diskusfutter Granulat Premium Aquarium', '#ec4899', '#db2777'],
  },
  'garnelen-nachzucht': {
    title: 'Garnelennachzucht – Zwerggarnelen erfolgreich vermehren',
    excerpt: 'Zwerggarnelen züchten: Neocaridina- und Caridina-Arten, Aquarium-Einrichtung, Wasserwerte, Aufzuchtfutter und der komplette Vermehrungszyklus.',
    date: '4. Juni 2026', cat: 'Garnelen', catColor: '#ff6b6b', catEmoji: '🦐',
    img: 'garnelen-nachzucht.png', readingTime: 8,
    toc: ['Geeignete Arten', 'Das richtige Aquarium', 'Vermehrungszyklus', 'Optimale Wasserwerte', 'Ernährung für die Nachzucht', 'Häufige Fehler', 'Schritt für Schritt zur Zucht', 'Fazit'],
    related: [['garnelen-im-aquarium','Garnelen-Guide','Grundlagen der Haltung','garnelen.png'],['nano-aquarium-guide','Nano Aquarium','Ideal für Garnelen','nano-aquarium-guide.png'],['pflanzenvermehrung-aquarium','Pflanzenvermehrung','Moos für Garnelen','pflanzen-vermehrung.png'],['aquarium-futter-ernaehrung','Futter-Guide','Ernährung','futter-arten.png']],
    prod: ['Staubfutter für Garnelen', 'Feinstfutter für Junggarnelen', 'search:Garnelenfutter Staubfutter Aufzucht Aquarium', '#ff6b6b', '#e24545'],
  },
  'welse-harnischwelse': {
    title: 'Welse im Aquarium – Antennenwelse, L-Welse und Harnischwelse',
    excerpt: 'Antennenwelse, L-Welse und Rhythmus-Nasenwelse: Arten, Haltung, Ernährung, Vergesellschaftung und Nachzucht der faszinierenden Harnischwelse.',
    date: '4. Juni 2026', cat: 'Fische', catColor: '#ec4899', catEmoji: '🐟',
    img: 'welse-antennenwels.png', readingTime: 9,
    toc: ['Antennenwelse', 'L-Welse im Überblick', 'Beliebte L-Welse', 'Rhythmus-Nasenwelse', 'Nachzucht', 'Kaufberatung', 'Häufige Fehler', 'Fazit'],
    related: [['panzerwelse-aquarium','Panzerwelse','Verwandte Wels-Gruppe','panzerwelse.png'],['wurzeln-holz-aquarium','Wurzeln & Holz','Wichtige Einrichtung für Welse','holz-arten.png'],['steinarten-hardscape','Hardscape','Höhlen für Welse','stein-arten.png'],['aquarium-futter-ernaehrung','Futter-Guide','Bodenfutter','futter-arten.png']],
    prod: ['Welsfutter Tabletten', 'Bodenfutter für Harnischwelse', 'search:Welsfutter Tabletten Bodenfutter Aquarium', '#ec4899', '#db2777'],
  },
  'futtertiere-selbst-zuechten': {
    title: 'Futtertiere selbst züchten – Artemia, Grindalwürmer, Daphnien & Mikrowürmchen',
    excerpt: 'Lebendfutter selbst ansetzen und ernten – Artemia, Grindalwürmer, Mikrowürmchen und Daphnien einfach gezüchtet für gesündere Fische.',
    date: '5. Juni 2026', cat: 'Fische', catColor: '#ec4899', catEmoji: '🐟',
    img: 'futtertiere-selbst-zuechten.webp', readingTime: 8,
    toc: ['Warum Futtertiere selbst züchten?', 'Artemia (Salzkrebschen)', 'Grindalwürmer', 'Mikrowürmchen', 'Daphnien (Wasserflöhe)', 'Futtertier-Arten im Vergleich', 'Ausrüstung und Starter-Sets', 'Häufige Fehler vermeiden', 'FAQ', 'Fazit'],
    related: [
      ['nachzucht-fische', 'Fisch-Nachzucht', 'Zuchtbecken & Aufzucht', 'nachzucht-becken.png'],
      ['aquarium-futter-ernaehrung', 'Futter-Guide', 'Ernährung für Fische', 'futter-arten.png'],
      ['garnelen-nachzucht', 'Garnelennachzucht', 'Aufzuchtfutter für Garnelen', 'garnelen-nachzucht.png'],
      ['kampffisch-haltung-betta', 'Kampffisch', 'Betta splendens Pflege', 'kampffisch-haltung.png'],
    ],
    prod: ['Artemia-Zucht Set', 'Komplettset für die Salmoniden- und Aufzuchtfutter-Produktion', 'search:Artemia Eier Zubehör Aquarium Lebendfutter Zucht', '#ec4899', '#db2777'],
  },
  'garnelen-krankheiten': {
    title: 'Garnelen-Krankheiten erkennen, behandeln und vorbeugen – Der große Guide',
    excerpt: 'Bakterielle Infektionen, Pilzerkrankungen, Häutungsprobleme und Vergiftungen bei Zwerggarnelen – Symptome, Behandlung und Vorbeugung.',
    date: '5. Juni 2026', cat: 'Garnelen', catColor: '#ff6b6b', catEmoji: '🦐',
    img: 'garnelen-krankheiten.webp', readingTime: 8,
    toc: ['Warum werden Garnelen krank?', 'Bakterielle Infektionen', 'Pilzerkrankungen', 'Häutungsprobleme', 'Parasitäre Erkrankungen', 'Vergiftungen', 'Übersichtstabelle', 'Vorbeugung', 'FAQ'],
    related: [
      ['garnelen-im-aquarium', 'Garnelen-Guide', 'Garnelen Haltung', 'garnelen.png'],
      ['garnelen-nachzucht', 'Garnelennachzucht', 'Vermehrung', 'garnelen-nachzucht.png'],
      ['fischkrankheiten-aquarium-guide', 'Fischkrankheiten', 'Diagnose & Behandlung', 'krankheiten-symptome.png'],
      ['quarantaene-medikamente', 'Quarantäne', 'Krankheiten vorbeugen', 'quarantaene-becken.png'],
    ],
    prod: ['Garnelen Wassertest Set', 'Präzise Tests für empfindliche Garnelen-Becken', 'search:Garnelen Wassertest Kupfer Aquarium', '#ff6b6b', '#e24545'],
  },
  'biotop-aquarium-suedamerika': {
    title: 'Biotop-Aquarium Südamerika – Ein Stück Amazonas im Wohnzimmer',
    excerpt: 'Ein Amazonas-Biotop einrichten: Wasserwerte, Pflanzen, typische Fische und Schritt-für-Schritt-Anleitung für ein naturnahes Aquarium.',
    date: '5. Juni 2026', cat: 'Einsteiger', catColor: '#06b6d4', catEmoji: '🐟',
    img: 'biotop-aquarium-suedamerika.webp', readingTime: 9,
    toc: ['Was ist ein Biotop-Aquarium?', 'Der Amazonas als Vorbild', 'Beckengröße & Einrichtung', 'Typische Amazonas-Pflanzen', 'Typische Fischbesätze', 'Wasserwerte', 'Pflege & Wartung', 'Einrichtungsbeispiel', 'FAQ', 'Fazit'],
    related: [
      ['einsteiger-aquarium-guide', 'Einsteiger-Guide', 'Grundlagen fürs erste Becken', 'einsteiger-guide.png'],
      ['wasserwerte-aquarium-guide', 'Wasserwerte', 'pH, GH, KH fürs Biotop', 'linear-gradient(135deg,#06b6d4,#0891b2)'],
      ['diskushaltung-pflege', 'Diskusfische', 'Amazonas-Königsfische', 'diskushaltung.png'],
      ['aquascaping-anfaenger', 'Aquascaping', 'Naturnahe Gestaltung', 'aquascaping.png'],
    ],
    prod: ['Wurzeln & Höhlen Set', 'Naturmaterialien für das Amazonas-Biotop', 'search:Aquarium Wurzeln Moorkienholz Naturdekoration', '#06b6d4', '#0891b2'],
  },
};

// ── LONG CONTENT DATA (loaded only after each scheduled article exists) ──
const LONG_CONTENT_PATH = path.join(ROOT, 'data', 'long-content-articles.json');
const LONG_CONTENT_ARTICLES = fs.existsSync(LONG_CONTENT_PATH)
  ? JSON.parse(fs.readFileSync(LONG_CONTENT_PATH, 'utf-8')).filter(item =>
      fs.existsSync(path.join(CONTENT, 'artikel', `${item.slug}.html`)))
  : [];
for (const item of LONG_CONTENT_ARTICLES) {
  const { slug, topic, categoryGroup, intent, ...article } = item;
  ARTICLES[slug] = article;
}

// ── TOPICS / TAGS ──
const TOPICS = [
  ['Einsteiger', '#06b6d4', '/artikel/einsteiger-aquarium-guide/'],
  ['Aquarienpflanzen', '#10b981', '/artikel/aquarienpflanzen-anfaenger/'],
  ['Aquascaping', '#0d9488', '/artikel/aquascaping-anfaenger/'],
  ['Garnelen', '#ff6b6b', '/artikel/garnelen-im-aquarium/'],
  ['Fischkrankheiten', '#ec4899', '/artikel/fischkrankheiten-aquarium-guide/'],
  ['Algen', '#ffd93d', '/artikel/algen-im-aquarium/'],
  ['Technik', '#8b5cf6', '/artikel/aquarium-technik-ueberblick/'],
  ['CO₂', '#a78bfa', '/artikel/co2-im-aquarium/'],
  ['Bodengrund', '#06b6d4', '/artikel/bodengrund-aquarium-guide/'],
  ['Pflegeroutine', '#f59e0b', '/artikel/aquarium-pflegeroutine-guide/'],
  ['Wasserwerte', '#0891b2', '/artikel/wasserwerte-aquarium-guide/'],
  ['Kampffisch', '#db2777', '/artikel/kampffisch-haltung-betta/'],
  ['Beleuchtung', '#a78bfa', '/artikel/aquarium-beleuchtung-guide/'],
  ['Filter', '#6366f1', '/artikel/aquarium-filter-guide/'],
  ['Düngung', '#34d399', '/artikel/aquarium-duengung-guide/'],
  ['Schnecken', '#fbbf24', '/artikel/schnecken-im-aquarium/'],
  ['Wurzeln & Holz', '#78716c', '/artikel/wurzeln-holz-aquarium/'],
  ['Vergesellschaftung', '#f472b6', '/artikel/vergesellschaftung-aquarienfische/'],
  ['Osmose', '#38bdf8', '/artikel/osmoseanlage-wasseraufbereitung/'],
  ['Fische für Profis', '#d946ef', '/artikel/fische-fortgeschrittene/'],
  ['Heizung', '#fb923c', '/artikel/heizung-temperatur-aquarium/'],
  ['Strömung', '#60a5fa', '/artikel/stroemung-im-aquarium/'],
  ['Beckenformen', '#06b6d4', '/artikel/beckenformen-groessen/'],
  ['Lebendgebärende', '#f43f5e', '/artikel/lebendgebärende-zahnkarpfen/'],
  ['Futter', '#a855f7', '/artikel/aquarium-futter-ernaehrung/'],
  ['Pflanzenvermehrung', '#34d399', '/artikel/pflanzenvermehrung-aquarium/'],
  ['CO₂ Einsteiger', '#2dd4bf', '/artikel/co2-einsteiger-guide/'],
  ['Teppichpflanzen', '#10b981', '/artikel/bodendecker-teppichpflanzen/'],
  ['Gesellschaftsbecken', '#0ea5e9', '/artikel/gesellschaftsbecken-einrichten/'],
  ['Quarantäne', '#f59e0b', '/artikel/quarantaene-medikamente/'],
  ['Rote Pflanzen', '#ef4444', '/artikel/rote-aquarienpflanzen/'],
  ['Hardscape', '#78716c', '/artikel/steinarten-hardscape/'],
  ['Nachzucht', '#f97316', '/artikel/nachzucht-fische/'],
  ['Algenfresser', '#84cc16', '/artikel/algenfresser-portrait/'],
  ['Wassertests', '#06b6d4', '/artikel/wassertest-wasserpflege/'],
  ['DIY Aquarium', '#a8a29e', '/artikel/diy-aquarium-bauen/'],
  ['Panzerwelse', '#ec4899', '/artikel/panzerwelse-aquarium/'],
  ['Salmler', '#ec4899', '/artikel/salmler-aquarium/'],
  ['Aquarium Moos', '#10b981', '/artikel/aquarium-moosarten/'],
  ['Nano Aquarium', '#06b6d4', '/artikel/nano-aquarium-guide/'],
  ['Schädlinge', '#f59e0b', '/artikel/aquarium-schaedlinge/'],
  ['Aquarium Automation', '#8b5cf6', '/artikel/aquarium-automation/'],
  ['Diskusfische', '#ec4899', '/artikel/diskushaltung-pflege/'],
  ['Garnelennachzucht', '#ff6b6b', '/artikel/garnelen-nachzucht/'],
  ['Antennenwelse & L-Welse', '#ec4899', '/artikel/welse-harnischwelse/'],
  ['Futtertiere züchten', '#ec4899', '/artikel/futtertiere-selbst-zuechten/'],
  ['Garnelen-Krankheiten', '#ff6b6b', '/artikel/garnelen-krankheiten/'],
  ['Biotop-Aquarium', '#06b6d4', '/artikel/biotop-aquarium-suedamerika/'],
];

// ── CATEGORY DATA for index page ──
const CATEGORIES = [
  {
    emoji: '🐟', name: 'Einsteiger', count: 9, catColor: '#06b6d4',
    cards: ['biotop-aquarium-suedamerika', 'nano-aquarium-guide', 'einsteiger-aquarium-guide', 'bodengrund-aquarium-guide', 'aquarium-einfahren-nitritpeak', 'wasserwerte-aquarium-guide', 'wurzeln-holz-aquarium', 'beckenformen-groessen', 'gesellschaftsbecken-einrichten', 'diy-aquarium-bauen']
  },
  {
    emoji: '🌿', name: 'Pflanzen & Aquascaping', count: 9, catColor: '#10b981',
    cards: ['aquarium-moosarten', 'aquarienpflanzen-anfaenger', 'co2-im-aquarium', 'aquascaping-anfaenger', 'aquarium-duengung-guide', 'co2-einsteiger-guide', 'bodendecker-teppichpflanzen', 'rote-aquarienpflanzen', 'pflanzenvermehrung-aquarium']
  },
  {
    emoji: '⚙️', name: 'Technik', count: 9, catColor: '#8b5cf6',
    cards: ['aquarium-automation', 'aquarium-technik-ueberblick', 'co2-im-aquarium', 'aquarium-beleuchtung-guide', 'aquarium-filter-guide', 'osmoseanlage-wasseraufbereitung', 'heizung-temperatur-aquarium', 'stroemung-im-aquarium', 'wassertest-wasserpflege']
  },
  {
    emoji: '🦐', name: 'Garnelen & Fische', count: 13, catColor: '#ff6b6b',
    cards: ['garnelen-krankheiten', 'futtertiere-selbst-zuechten', 'garnelen-nachzucht', 'diskushaltung-pflege', 'welse-harnischwelse', 'panzerwelse-aquarium', 'salmler-aquarium', 'garnelen-im-aquarium', 'kampffisch-haltung-betta', 'beliebteste-aquarienfische', 'vergesellschaftung-aquarienfische', 'fische-fortgeschrittene', 'lebendgebärende-zahnkarpfen', 'aquarium-futter-ernaehrung', 'nachzucht-fische']
  },
  {
    emoji: '💊', name: 'Pflege & Gesundheit', count: 9, catColor: '#ffd93d',
    cards: ['aquarium-schaedlinge', 'algen-im-aquarium', 'fischkrankheiten-aquarium-guide', 'aquarium-pflegeroutine-guide', 'schnecken-im-aquarium', 'quarantaene-medikamente', 'algenfresser-portrait', 'steinarten-hardscape', 'wurzeln-holz-aquarium']
  },
];

for (const item of LONG_CONTENT_ARTICLES) {
  TOPICS.push([item.topic || item.title, item.catColor, `/artikel/${item.slug}/`]);
  const group = CATEGORIES.find(cat => cat.name === item.categoryGroup);
  if (group && !group.cards.includes(item.slug)) group.cards.unshift(item.slug);
}
for (const group of CATEGORIES) group.count = group.cards.length;

// ── SIDEBAR CATEGORY NAV for article pages (5-6 main categories) ──
const SIDEBAR_CATS = [
  ['🐟 Einsteiger', '/artikel/einsteiger-aquarium-guide/', '#06b6d4'],
  ['🌿 Pflanzen', '/artikel/aquarienpflanzen-anfaenger/', '#10b981'],
  ['🪨 Aquascaping', '/artikel/aquascaping-anfaenger/', '#0d9488'],
  ['⚙️ Technik', '/artikel/aquarium-technik-ueberblick/', '#8b5cf6'],
  ['🦐 Garnelen & Fische', '/artikel/garnelen-im-aquarium/', '#ff6b6b'],
  ['💊 Pflege', '/artikel/algen-im-aquarium/', '#ffd93d'],
];

// ── TOPIC GROUPS for compact topic cloud ──
const TOPIC_GROUPS = [
  { label: '🐟 Einsteiger', topics: ['Einsteiger', 'Bodengrund', 'Wasserwerte', 'Beckenformen', 'Nano Aquarium'] },
  { label: '🌿 Pflanzen & Aquascaping', topics: ['Aquarienpflanzen', 'Aquascaping', 'CO₂', 'Düngung', 'Teppichpflanzen'] },
  { label: '⚙️ Technik', topics: ['Technik', 'Beleuchtung', 'Filter', 'Heizung', 'Automation'] },
  { label: '🦐 Garnelen & Fische', topics: ['Garnelen', 'Kampffisch', 'Lebendgebärende', 'Vergesellschaftung', 'Futter'] },
  { label: '💊 Pflege', topics: ['Algen', 'Pflegeroutine', 'Fischkrankheiten', 'Schnecken', 'Algenfresser'] },
];

function topicTagByName(name) {
  const t = TOPICS.find(t => t[0] === name);
  if (!t) return '';
  return `<a href="${canonicalPath(t[2])}" class="topic-tag" style="--topic-color:${t[1]}">${t[0]}</a>`;
}

// Resolve the legacy image names used by homepage cards, navigation and previews.
function resolveHomepageImages(html) {
  return html.replace(/\/images\/[\w.-]+\.(?:png|webp)\b/g, src => {
    if (fs.existsSync(path.join(ROOT, src))) return src;
    const fallback = src === '/images/wasserwechsel-guide.webp'
      ? '/images/hero-aquarium-wasserwechsel-richtig-machen.webp'
      : src.replace(/\.png$/, '.webp');
    return fs.existsSync(path.join(ROOT, fallback)) ? fallback : src;
  });
}

// ── GENERATE INDEX ──
function buildIndex() {
  // Hero: Magazine-style editorial layout with featured story + secondary grid + topic bar
  const heroHTML = buildMagazineHero();

  const intentSectionHTML = buildIntentSection();

  const shoppingHubHTML = `<section class="shopping-hub" aria-label="Amazon Shopping-Guide für Aquarium-Zubehör">
  <div class="shopping-panel">
    <div class="shopping-head">
      <span class="eyebrow">Amazon Shopping-Guide</span>
      <h2>Was brauchst du als Nächstes?</h2>
      <p>Direkte Einstiege zu typischen Aquarium-Käufen – bewusst als Suchlinks, damit du aktuelle Preise, Verfügbarkeit und Bewertungen selbst vergleichen kannst.</p>
      <span class="shopping-disclosure">Werbelinks: Als Amazon-Partner verdienen wir an qualifizierten Verkäufen.</span>
    </div>
    <div class="shopping-grid">
      <a class="shopping-card" href="${amazonAffiliateUrl('search:Aquarium Komplettset 60l')}" target="_blank" rel="nofollow sponsored noopener"><span>🐠</span><strong>Startersets</strong><em>Becken, Filter, Licht</em></a>
      <a class="shopping-card" href="${amazonAffiliateUrl('search:Aquarium Wassertest Koffer')}" target="_blank" rel="nofollow sponsored noopener"><span>💧</span><strong>Wassertests</strong><em>NO₂, NO₃, pH, GH/KH</em></a>
      <a class="shopping-card" href="${amazonAffiliateUrl('search:Aquarium Filter Heizstab LED')}" target="_blank" rel="nofollow sponsored noopener"><span>⚙️</span><strong>Technik</strong><em>Filter, Heizer, LED</em></a>
      <a class="shopping-card" href="${amazonAffiliateUrl('search:Aquarienpflanzen Set Dünger Soil')}" target="_blank" rel="nofollow sponsored noopener"><span>🌿</span><strong>Pflanzen</strong><em>Sets, Soil, Dünger</em></a>
      <a class="shopping-card" href="${amazonAffiliateUrl('search:Mulmsauger Algenmagnet Aquarium Pflege')}" target="_blank" rel="nofollow sponsored noopener"><span>🧽</span><strong>Pflege</strong><em>Mulmsauger & Tools</em></a>
      <a class="shopping-card" href="${amazonAffiliateUrl('search:Aquascaping Wurzeln Steine Hardscape')}" target="_blank" rel="nofollow sponsored noopener"><span>🪨</span><strong>Aquascaping</strong><em>Wurzeln, Steine, Hardscape</em></a>
    </div>
  </div>
</section>`;

  // Employees Pick (Editors Pick)
  const picks = ['bodengrund-aquarium-guide', 'fischkrankheiten-aquarium-guide', 'aquarienpflanzen-anfaenger', 'kampffisch-haltung-betta'];
  let picksHTML = '';
  for (const slug of picks) {
    const a = ARTICLES[slug];
    if (!a) continue;
    picksHTML += heroCardHTML(slug, a.title, a.excerpt, a.img, a.cat, a.catColor, a.readingTime);
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
  const MAX_VISIBLE = 6;
  for (const cat of CATEGORIES) {
    const visibleSlugs = cat.cards.slice(0, MAX_VISIBLE);
    const remainder = cat.cards.length - MAX_VISIBLE;
    let cardsHTML = '';
    for (const slug of visibleSlugs) {
      const a = ARTICLES[slug];
      if (!a) continue;
      cardsHTML += cardHTML(slug, a.title, a.excerpt, a.img, a.cat, a.catColor, a.readingTime);
    }
    const allLink = remainder > 0
      ? `<div class="show-all-wrapper"><a href="/artikel/" class="show-all-link">→ Alle ${cat.count} Artikel in "${cat.name}" anzeigen</a></div>`
      : '';
    const catGridStyle = visibleSlugs.length === 2 ? ' style="grid-template-columns:repeat(2,1fr);"' : '';
    catSections += `<section class="mp-section">
      <div class="section-title">
        <h3><span class="emoji">${cat.emoji}</span> ${cat.name}</h3>
        <span class="count">${cat.count} Artikel</span>
        <span class="line"></span>
      </div>
      <div class="card-grid"${catGridStyle}>
        ${cardsHTML}
      </div>
      ${allLink}
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
        <a href="https://www.instagram.com/aquaristik_zentrum" class="btn-ghost" target="_blank" rel="noopener">Instagram</a>
        <a href="mailto:hallo@aquaristik-zentrum.com?subject=Newsletter" class="btn-glow">Newsletter abonnieren →</a>
      </div>
    </div>
  </div>`;

  // Topic Explorer — grouped compact badge style
  let topicsHTML = '';
  for (const group of TOPIC_GROUPS) {
    topicsHTML += `<div class="topic-group">
      <span class="topic-group-label">${group.label}</span>
      <div class="topic-group-tags">
        ${group.topics.map(name => topicTagByName(name)).join('')}
      </div>
    </div>`;
  }

  const topicsSection = `<section class="mp-section">
    <div class="section-title">
      <h3><span class="emoji">🏷️</span> Themen entdecken</h3>
      <span class="count">${TOPIC_GROUPS.reduce((s,g) => s + g.topics.length, 0)} von ${TOPICS.length} Topics</span>
      <span class="line"></span>
    </div>
    <div class="topic-cloud topic-cloud-groups">
      ${topicsHTML}
      <a href="/artikel/" class="topic-show-all">→ Alle ${TOPICS.length} Themen im Überblick</a>
    </div>
  </section>`;

  const body = `<main class="megapage">
<h1 style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);border:0;white-space:nowrap;">Aquaristik Zentrum – Alles rund ums Aquarium</h1>
${heroHTML}
${intentSectionHTML}
${edsPickHTML}
${catSections}
${topicsSection}
${shoppingHubHTML}
${nlGlow}
</main>`;

  const indexJsonLd = `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Aquaristik Zentrum",
  "url": "https://aquaristik-zentrum.com/",
  "description": "Aquaristik Zentrum – Dein modernes Aquarium-Magazin mit praktischen Guides, klarer Themenführung und Tipps für Einsteiger und Profis.",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://aquaristik-zentrum.com/?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
</script>`;

  return resolveHomepageImages(wrapPage(
    'Aquaristik Zentrum – Alles rund ums Aquarium | Megapage',
    'Aquaristik Zentrum – Dein modernes Aquarium-Magazin mit praktischen Guides, klarer Themenführung und Tipps für Einsteiger und Profis.',
    'https://aquaristik-zentrum.com/',
    '/images/hero.png',
    body,
    indexJsonLd
  ));
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
  for (const [index, item] of a.toc.entries()) {
    tocHTML += a.tocAnchors ? `<div class="toc-item"><a href="#${a.tocAnchors[index]}">→ ${item}</a></div>` : tocItem(item);
  }
  const [pname, pdesc, pasin, pc1, pc2] = a.prod || [];

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
      <button class="sidebar-toggle" id="sidebarToggle" aria-label="Sidebar ein-/ausblenden">☰ Menü</button>
      <div class="side-section side-cat-nav">
        <h5>📂 Kategorien</h5>
        <div class="side-cat-list">
          ${SIDEBAR_CATS.map(([name, url, color]) => {
            const isActive = a.cat === name.split(' ').slice(1).join(' ') || a.catColor === color;
            // Match: check if article's category matches the category
            return `<a href="${canonicalPath(url)}" class="side-cat-item${isActive ? ' active' : ''}" style="--cat-color:${color}">${name}</a>`;
          }).join('')}
        </div>
      </div>
      <div class="side-section">
        <h5>📚 Verwandte Artikel</h5>${relatedHTML}
      </div>
${a.prod ? `      <div class="side-section">
        <h5>🛒 Empfohlenes Zubehör</h5>
        <div class="side-product-card">
          <div class="prod-thumb" style="background:linear-gradient(135deg,${pc1},${pc2})"></div>
          <p>${pname}</p>
          <p class="prod-sub">${pdesc}</p>
          <a href="${amazonAffiliateUrl(pasin)}" target="_blank" rel="nofollow sponsored noopener" class="prod-link">→ Bei Amazon ansehen</a>
        </div>
      </div>` : ''}
      <div class="side-section">
        <h5>📋 Inhaltsverzeichnis</h5>
        <div>${tocHTML}</div>
      </div>
    </div>`;

  const style = a.catColor.startsWith('#ffd93d')
    ? `background:${a.catColor};color:#0a0a0f;`
    : `background:${a.catColor};color:#fff;`;

  const crumbs = JSON.parse(breadcrumbSchema([
    { label: 'Startseite', url: 'https://aquaristik-zentrum.com/' },
    { label: a.cat, url: 'https://aquaristik-zentrum.com/artikel/einsteiger-aquarium-guide/' },
    { label: a.title, url: `https://aquaristik-zentrum.com/artikel/${slug}/` }
  ]).replace(/,\s*$/, ''));
  const articleSchema = {
    '@context': 'https://schema.org', '@type': 'Article',
    headline: a.title, description: a.excerpt,
    image: `https://aquaristik-zentrum.com/images/${a.img}`,
    author: { '@type': a.authorType || 'Organization', name: a.author || 'Redaktion Aquaristik Zentrum' },
    datePublished: dateToISO(a.date),
    ...(a.dateModified ? { dateModified: a.dateModified } : {}),
    publisher: { '@type': 'Organization', name: 'Aquaristik Zentrum' },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `https://aquaristik-zentrum.com/artikel/${slug}/` }
  };
  const jsonLd = `<script type="application/ld+json">\n${JSON.stringify([crumbs, articleSchema], null, 2).replace(/</g, '\\u003c')}\n<\/script>`;

  const body = `${breadcrumbHTML([
    { label: 'Startseite', url: 'https://aquaristik-zentrum.com/' },
    { label: a.cat, url: 'https://aquaristik-zentrum.com/artikel/einsteiger-aquarium-guide/' },
    { label: a.title, url: `https://aquaristik-zentrum.com/artikel/${slug}/` }
  ])}
<div class="article-layout">
    <div class="article-main">
      <span class="cat-head" style="${style}">${a.catEmoji} ${a.cat}</span>
      <h1>${a.title}</h1>
      <div class="meta">
        <span>👤 ${a.author || 'Redaktion Aquaristik Zentrum'}</span>
        ${a.dateModified ? `<span>Aktualisiert: ${a.dateModified}</span>` : ''}
        <span class="sep">·</span>
        <span>${a.readingTime} Min. Lesezeit</span>
      </div>
      <div class="body-text">
        ${addLazyLoading(a.skipInlineRelated ? bodyContent : injectInternalLinks(bodyContent, a.related))}
        ${relatedBottomHTML(a.related)}
      </div>
    </div>
    ${sidebarHTML}
  </div>`;

  return wrapPage(`${a.title} | Aquaristik Zentrum`, a.excerpt, `https://aquaristik-zentrum.com/artikel/${slug}/`, `/images/${a.img}`, body, jsonLd, 'article');
}

function buildPage(title, desc, canonical, bodyContent, breadcrumbItems) {
  const hero = T.pageHero.replaceAll('{{PAGE_TITLE}}', title);
  const bcHTML = breadcrumbItems ? breadcrumbHTML(breadcrumbItems) : '';
  const bcSchema = breadcrumbItems ? `<script type="application/ld+json">\n${breadcrumbSchema(breadcrumbItems)}</script>` : '';
  const body = `${bcHTML}${hero}\n<main>\n  <div class="page-content">\n    ${bodyContent}\n  </div>\n</main>`;
  return wrapPage(`${title} – Aquaristik Zentrum`, desc, canonical, '', body, bcSchema);
}

// ── WRAPPER ──
function wrapPage(title, desc, canonical, ogImage, body, jsonLd, ogType = 'website') {
  // SEO: Title auf 60 Zeichen truncaten für SERPs (Google truncatet sonst unkontrolliert)
  const serpTitle = truncateSERP(title, 60);
  // SEO: Description auf 155 Zeichen truncaten (Google truncatet bei ~160)
  const serpDesc = truncateDesc(desc, 155);
  const jsonLdTag = jsonLd ? `\n${jsonLd}` : '';
  const head = `<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${serpTitle}</title>
<meta name="description" content="${serpDesc}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="${canonical}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${serpDesc}">
<meta property="og:type" content="${ogType}">
<meta property="og:url" content="${canonical}">
<meta property="og:site_name" content="Aquaristik Zentrum">
<meta property="og:locale" content="de_DE">
${ogImage ? `<meta property="og:image" content="https://aquaristik-zentrum.com${ogImage}">` : ''}
${ogImage ? `<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${truncateSERP(title, 70)}">
<meta name="twitter:description" content="${truncateDesc(desc, 200)}">
<meta name="twitter:image" content="https://aquaristik-zentrum.com${ogImage}">` : ''}
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

// ════════════════════════════════════════════
// MAGAZINE HERO — Responsive Editorial Layout
// ════════════════════════════════════════════
function buildMagazineHero() {
  const slugs = ['nano-aquarium-guide', 'aquarium-automation', 'aquarium-schaedlinge', 'einsteiger-aquarium-guide'];
  const [featureSlug, ...cardSlugs] = slugs;
  const feature = ARTICLES[featureSlug];

  const cardsHTML = cardSlugs.map((slug, i) => {
    const a = ARTICLES[slug];
    if (!a) return '';
    const img = a.img && !a.img.startsWith('linear-gradient')
      ? `linear-gradient(180deg,transparent 20%,rgba(0,0,0,0.88)),url('/images/${a.img}')`
      : `linear-gradient(135deg,${a.catColor},#1a1a2e)`;
    return `<a href="/artikel/${slug}/" class="mag-card" style="--idx:${i};--cat-clr:${a.catColor};background-image:${img};">
      <span class="mag-card-cat" style="background:${a.catColor}">${a.cat}</span>
      <h3>${a.title}</h3>
      <span class="mag-card-meta">${a.readingTime} Min Lesezeit</span>
    </a>`;
  }).join('');

  const topics = ['Einsteiger', 'Aquarienpflanzen', 'Technik', 'Garnelen', 'Algen', 'CO₂', 'Filter', 'Aquascaping', 'Bodengrund', 'Wasserwerte'];
  const topicsHTML = topics.map(t => {
    const topic = TOPICS.find(x => x[0] === t);
    if (!topic) return '';
    return `<a href="${canonicalPath(topic[2])}" class="mag-topic" style="--topic-clr:${topic[1]}">${t}</a>`;
  }).join('');

  const featureImg = feature.img && !feature.img.startsWith('linear-gradient')
    ? `linear-gradient(180deg,transparent 25%,rgba(0,0,0,0.9)),url('/images/${feature.img}')`
    : `linear-gradient(135deg,${feature.catColor},#1a1a2e)`;

  return `<section class="mag-hero" aria-label="Magazin">
    <div class="mag-intro">
      <span class="mag-eyebrow">Aquaristik Zentrum Magazin</span>
      <h1 class="mag-title">Dein Leitfaden f&uuml;r<br><span>perfekte Aquarien</span></h1>
      <p class="mag-desc"><strong>${Object.keys(ARTICLES).length}+ praxisnahe Artikel</strong> &mdash; von der ersten Einrichtung bis zur Profi-Pflege</p>
    </div>
    <div class="mag-grid">
      <a href="/artikel/${featureSlug}/" class="mag-feature" style="--cat-clr:${feature.catColor};background-image:${featureImg};">
        <span class="mag-feature-badge" style="background:${feature.catColor}">${feature.cat}</span>
        <div class="mag-feature-body">
          <h2>${feature.title}</h2>
          <p>${feature.excerpt}</p>
          <div class="mag-feature-meta">
            <span>&#128214; ${feature.readingTime} Min Lesezeit</span>
          </div>
        </div>
      </a>
      ${cardsHTML}
    </div>
    <div class="mag-topics">
      <span class="mag-topics-label">Themen</span>
      <div class="mag-topics-list">
        ${topicsHTML}
      </div>
    </div>
  </section>`;
}

// ── INTENT SECTION (Schnelleinstieg – ersetzt Ticker) ──
function buildIntentSection() {
  const intents = [
    { emoji: '🐟', title: 'Ich bin Anfänger', desc: 'Erstes Aquarium einrichten', url: '/artikel/einsteiger-aquarium-guide/' },
    { emoji: '🌿', title: 'Ich will Pflanzen', desc: 'Arten, Pflege & Düngung', url: '/artikel/aquarienpflanzen-anfaenger/' },
    { emoji: '💧', title: 'Ich habe Algen', desc: 'Algen erkennen & bekämpfen', url: '/artikel/algen-im-aquarium/' },
    { emoji: '⚙️', title: 'Ich brauche Technik', desc: 'Filter, Licht, CO₂ & Co.', url: '/artikel/aquarium-technik-ueberblick/' },
    { emoji: '🪨', title: 'Ich will Aquascapen', desc: 'Hardscape & Gestaltung', url: '/artikel/aquascaping-anfaenger/' },
    { emoji: '🩺', title: 'Mein Fisch ist krank', desc: 'Symptome & Behandlung', url: '/artikel/fischkrankheiten-aquarium-guide/' },
  ];
  const cards = intents.map((intent, i) =>
    `<a href="${canonicalPath(intent.url)}" class="intent-card" style="--delay:${i * 0.06}s">
      <span class="intent-emoji">${intent.emoji}</span>
      <strong class="intent-title">${intent.title}</strong>
      <span class="intent-desc">${intent.desc}</span>
    </a>`
  ).join('');
  return `<section class="intent-section" aria-label="Schnelleinstieg">
    <div class="intent-inner">
      <div class="intent-head">
        <span class="mag-eyebrow">Schnelleinstieg</span>
        <h2>Was beschäftigt dich?</h2>
      </div>
      <div class="intent-grid">
        ${cards}
      </div>
    </div>
  </section>`;
}

// Historical MiniMax exports were written as complete HTML directly into artikel/.
// Wrap only that recognizable export shape; existing modern articles are untouched.
function wrapLegacyArticles() {
  const directory = path.join(OUTPUT, 'artikel');
  // Reviewed topic illustrations replace the branded legacy title cards.
  const covers = new Map([
    ["aquarium-fuer-anfaenger-schritt-anleitung", ["einsteiger-aquarium-guide.webp", "Illustration eines bepflanzten Aquariums mit Beleuchtung"]],
    ["biotop-aquarium-2026-amazonas-unterwasserwelt-mit-schwarzwasser-schwarmfischen-u", ["biotop-aquarium-suedamerika.webp", "Illustration einer dicht bewachsenen Unterwasserlandschaft"]],
    ["bodengrund-aquascape-2026-so-waehlst-du-soil-sand-und-kies-fuer-gesunde-wurzeln-", ["bodengrund-aquarium-guide.webp", "Illustration verschiedener Substrate für ein Aquarium"]],
    ["dschungel-aquascape-2026-tropische-unterwasserwelten-mit-grossblaettrigen-amazon", ["aquascaping-anfaenger.webp", "Illustration eines Aquascapes mit üppigen Pflanzen und Wurzeln"]],
    ["garnelen-aquarium-haltung-zucht-arten", ["garnelen-im-aquarium.webp", "Illustration einer roten Garnele zwischen Aquarienpflanzen"]],
    ["iwagumi-aquascape-2026-schritt-fuer-schritt-zum-minimalistischen-stein-layout-mi", ["steinarten-hardscape_00001_.webp", "Aquarium mit einer Gruppe dunkler Steine und niedrigem Pflanzenbewuchs"]],
    ["led-beleuchtung-2026-so-findest-du-das-perfekte-lichtspektrum-fuer-dein-pflanzen", ["aquarium-beleuchtung-guide.webp", "Beleuchtetes Pflanzenaquarium mit farbigen Lichtakzenten"]],
    ["low-tech-aquarium-2026-pflanzenvielfalt-ohne-co2-so-gelingt-der-balance-akt-zwis", ["low-tech-aquarium-ohne-co2.webp", "Illustration eines dicht bepflanzten Aquariums"]],
    ["nano-aquarium-2026-so-gelingt-der-perfekte-start-mit-zwerggarnelen-mooskugel-min", ["nano-aquarium-guide.webp", "Illustration eines kleinen Aquariums auf einem Tisch"]],
    ["naturglas-aquarium-2026-so-planst-du-ein-artgerechtes-garnelen-biotop-mit-lebend", ["nano-aquarium-guide_00001_.webp", "Kleines bepflanztes Glasaquarium mit grünen Moospolstern"]],
    ["wabi-kusa-aquascape-2026-natuerliche-unterwasserlandschaften-mit-schwimmpflanzen", ["schwimmpflanzen-aquarium-guide.webp", "Illustration schwimmender Blätter an der Wasseroberfläche"]],
    ["wurzelholz-aquascape-2026-so-inszenierst-du-treibende-hoelzer-mit-aufsitzerpflan", ["wurzeln-holz-aquarium.webp", "Illustration von verzweigtem Wurzelholz unter Wasser"]],
  ]);
  const nav = resolveHomepageImages(canonicalizeInternalLinks(T.nav)).replace(
    /<div class="search-wrapper">[\s\S]*?\r?\n      <\/div>/,
    '<a class="search" href="/artikel/" aria-label="Artikelübersicht">📚</a>',
  );
  const plainFooter = canonicalizeInternalLinks(T.footer).replace(/^ *<p class="affiliate-hinweis">.*<\/p>\r?\n/m, '');
  const sidebar = `<aside class="article-sidebar legacy-article-sidebar" aria-label="Artikelkategorien">
    <div class="side-section side-cat-nav">
      <h5>📂 Kategorien</h5>
      <div class="side-cat-list">${SIDEBAR_CATS.map(([name, url, color]) =>
        `<a href="${canonicalPath(url)}" class="side-cat-item" style="--cat-color:${color}">${name}</a>`).join('')}</div>
    </div>
  </aside>`;

  for (const name of fs.readdirSync(directory).filter(file => file.endsWith('.html'))) {
    const file = path.join(directory, name);
    const html = fs.readFileSync(file, 'utf8');
    if (html.includes('class="article-layout"') || html.includes('href="/style.css"')) continue;
    const legacy = html.match(/<body>\s*(<img\b[^>]*class="article-hero"[^>]*>)\s*<article>\s*(<h1>([\s\S]*?)<\/h1>)\s*<div class="article-meta">([\s\S]*?)<\/div>\s*<div class="article-content">([\s\S]*?)<\/article>\s*<\/body>/);
    if (!legacy) continue;
    const [, oldHero, heading, title, metadata, legacyProse] = legacy;
    const cover = covers.get(path.basename(name, '.html'));
    let hero = oldHero;
    if (cover) {
      const [asset, alt] = cover;
      if (!fs.existsSync(path.join(ROOT, 'images', asset))) throw new Error(`Missing legacy article illustration: ${asset}`);
      hero = oldHero.replace(/\bsrc="[^"]*"/, `src="/images/${asset}"`)
        .replace(/\balt="[^"]*"/, `alt="${alt}"`);
    }
    // Close a malformed legacy emphasis tag before the shared shell is parsed.
    const proseAndRelated = legacyProse.replace('<em>Anubias congensis</strong>', '<em>Anubias congensis</em>');
    const newline = html.includes('\r\n') ? '\r\n' : '\n';
    const normalize = part => part.replace(/\r?\n/g, newline);
    const crumbs = breadcrumbHTML([
      { label: 'Startseite', url: '/' },
      { label: 'Artikel', url: '/artikel/' },
      { label: title.replace(/<[^>]*>/g, '') },
    ]);
    const footer = /<a\b[^>]*href="https:\/\/(?:www\.)?amazon\.[^"]+[?&](?:amp;)?tag=/.test(proseAndRelated)
      ? canonicalizeInternalLinks(T.footer) : plainFooter;
    const body = normalize(`<body>
${nav}
${crumbs}
<main class="article-layout">
  <article class="article-main">
    ${heading}
    <div class="article-meta meta">${metadata}</div>
    <div class="article-content body-text">
${hero}
${proseAndRelated}</article>
${sidebar}
</main>
${footer}
<script src="/app.js" defer></script>
</body>`);
    const localStyles = normalize(`<meta http-equiv="Content-Security-Policy" content="style-src 'self' 'unsafe-inline'; font-src 'self'">
<link rel="stylesheet" href="/style.css">
<style>@media (max-width:768px){.article-layout > .legacy-article-sidebar{display:block}}</style>
`);
    const next = html.replace(legacy[0], () => body)
      .replace('</head>', () => `${localStyles}</head>`);
    fs.writeFileSync(file, next);
  }
}

// Legacy article files may still carry old-style internal links; canonicalize them.
function canonicalizeInternalLinks(html) {
  return html.replace(/href="(\/[^"]*)"/g, (m, href) => `href="${canonicalPath(href)}"`);
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

  wrapLegacyArticles();

  const aboutPath = path.join(CONTENT, 'about.html');
  if (fs.existsSync(aboutPath)) {
    const content = fs.readFileSync(aboutPath, 'utf-8').trim();
    fs.writeFileSync(path.join(OUTPUT, 'about.html'), buildPage('Über Aquaristik Zentrum', 'Informationen zu Aquaristik Zentrum, KI-Unterstützung, Quellen, Korrekturen und Affiliate-Links.', 'https://aquaristik-zentrum.com/about/', content, [
      { label: 'Startseite', url: 'https://aquaristik-zentrum.com/' },
      { label: 'Über uns', url: 'https://aquaristik-zentrum.com/about/' }
    ]));
    console.log('  ✓ about.html');
  }

  const imprPath = path.join(CONTENT, 'impressum.html');
  if (fs.existsSync(imprPath)) {
    const content = fs.readFileSync(imprPath, 'utf-8').trim();
    fs.writeFileSync(path.join(OUTPUT, 'impressum.html'), buildPage('Impressum', 'Impressum der Webseite Aquaristik Zentrum.', 'https://aquaristik-zentrum.com/impressum/', content, [
      { label: 'Startseite', url: 'https://aquaristik-zentrum.com/' },
      { label: 'Impressum', url: 'https://aquaristik-zentrum.com/impressum/' }
    ]));
    console.log('  ✓ impressum.html');
  }

  require('./scripts/pause-advertising.js').pauseAdvertising(ROOT);
  require('./scripts/generate-sitemap.js').writeSitemap(ROOT);
  require('./scripts/write-redirects.js').writeRedirects(ROOT);
  require('./scripts/generate-content-routes.js').writeContentRoutes(ROOT);
  require('./scripts/validate-structured-data.js').validateStructuredData(ROOT);
  console.log('\n✨ Build complete! All pages generated.');
}

main();
