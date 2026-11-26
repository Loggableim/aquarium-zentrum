# URL-Konsolidierung: Trailing-Slash als kanonische Form

Entscheidung D7 (25.11.). Ziel: `.html`- und extensionslose URL-Varianten
antworten mit 301 auf die kanonische Trailing-Slash-URL; interne Links
und die Sitemap zeigen ausschliesslich auf die kanonische Form.
Es werden KEINE Inhalte geaendert und KEINE Monetarisierungs-Komponenten
angefasst (ads.txt, AdSense-Meta-Tags, Amazon-Links bleiben unberuehrt).

## Was sich aendert

1. **Server-Redirects (functions/_middleware.js)** — Cloudflare Pages
   Functions-Middleware leitet jede seitenartige URL ohne Trailing Slash
   (`.html`-Variante und extensionslose Variante) per 301 auf die
   Trailing-Slash-Form weiter. Query-Strings (z. B. `?q=`) bleiben erhalten.
   Assets (Bilder, CSS, JS, Fonts, sitemap.xml, robots.txt, ads.txt,
   IndexNow-Verifikationsdatei) werden nicht angefasst.
   Betroffene Beispiele:
   - `/artikel/nano-aquarium-guide.html` → `/artikel/nano-aquarium-guide/`
   - `/artikel/nano-aquarium-guide` → `/artikel/nano-aquarium-guide/`
   - `/about.html` → `/about/`, `/impressum.html` → `/impressum/`
   - `/artikel` → `/artikel/`

2. **_redirects (Cloudflare Pages-Redirects-Datei)** — 27 historische
   Artikel, die nicht unter `content/` liegen und damit von der Middleware
   nicht erfasst werden, erhalten eigene 301-Regeln auf die kanonische
   Trailing-Slash-URL (`/artikel/<slug>` und `/artikel/<slug>.html` →
   `/artikel/<slug>/`). Erzeugt von `scripts/write-redirects.js`.

3. **Interne Links sitzweit** — `build.js` generiert alle internen Links
   in der kanonischen Trailing-Slash-Form (`/artikel/<slug>/`, `/about/`,
   `/impressum/`). Die verbleibenden Legacy-Artikel-HTML-Dateien werden
   beim Build mit denselben Regeln kanonisiert. Effekt: die Site linkt
   nie mehr auf `.html`- oder extensionslose Varianten.

4. **Sitemap** — `scripts/generate-sitemap.js` listet nur noch kanonische
   Trailing-Slash-URLs; die 27 Legacy-Artikel mit `.html`-Canonical
   scheinen nicht mehr in der Sitemap auf (sie leiten 301 um und sind
   damit keine indexierbaren Seiten). Ergebnis: 84 statt 111 URLs, alle
   mit Trailing Slash.

5. **Content-Redirect-Map** — `scripts/generate-content-routes.js`
   erzeugt ausschliesslich Trailing-Slash-Ziele; die Middleware
   kanonisiert die Ziel-URL beim Redirect.

## Verifikation (nach Deployment auf main)

- `https://aquaristik-zentrum.com/artikel/nano-aquarium-guide.html` → 301 → `https://aquaristik-zentrum.com/artikel/nano-aquarium-guide/`
- `https://aquaristik-zentrum.com/artikel/nano-aquarium-guide` → 301 → `https://aquaristik-zentrum.com/artikel/nano-aquarium-guide/`
- `https://aquaristik-zentrum.com/artikel/3d-rueckwand-aquarium-bauen.html` → 301 → `https://aquaristik-zentrum.com/artikel/3d-rueckwand-aquarium-bauen/`
- `https://aquaristik-zentrum.com/about.html` → 301 → `https://aquaristik-zentrum.com/about/`
- `https://aquaristik-zentrum.com/artikel/nano-aquarium-guide.html?q=test` → 301 mit erhaltenem Query
- `https://aquaristik-zentrum.com/images/nano-aquarium-guide.webp` → 200 (Assets unveraendert)
- `https://aquaristik-zentrum.com/sitemap.xml` → enthaelt nur Trailing-Slash-URLs

## Tests

`node --test tests/*.test.js` — 82 Subtests, alle gruen. Neue Tests:
- `/artikel/<slug>` → 301 auf Trailing-Slash
- `/artikel/<slug>.html` → 301 auf Trailing-Slash
- `/about.html`, `/impressum.html`, `/artikel` → 301 auf Trailing-Slash
- Assets bleiben unveraendert (200)
- Sitemap enthaelt nur Trailing-Slash-URLs
