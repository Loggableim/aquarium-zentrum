#!/usr/bin/env python3
# Generate one long German aquaristik article via NVIDIA NIM free model.
import argparse, html, json, os, re, time, urllib.request, urllib.error
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
META_PATH = ROOT / 'data' / 'long-content-articles.json'
OUT_DIR = ROOT / 'content' / 'artikel'
API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions'
DEFAULT_MODEL = 'deepseek-ai/deepseek-v4-flash'
MIN_WORDS = 4000
TARGET_WORDS = 4300


def load_key():
    for name in ('NVIDIA_API_KEY', 'NGC_API_KEY'):
        val = os.environ.get(name)
        if val:
            return val.strip()
    cfg = Path('C:/HermesPortable/home/config.yaml')
    if cfg.exists():
        text = cfg.read_text(encoding='utf-8', errors='ignore')
        m = re.search(r'(?ms)^  nvidia:\n(.*?)(?=^  \S|^\S|\Z)', text)
        if m:
            key = re.search(r'api_key:\s*([^\n\r]+)', m.group(1))
            if key:
                return key.group(1).strip().strip('"').strip("'")
    raise RuntimeError('NVIDIA API key not found')


def clean_html(text):
    text = text.strip()
    text = re.sub(r'^```(?:html)?\s*', '', text, flags=re.I)
    text = re.sub(r'\s*```$', '', text)
    text = re.sub(r'(?is)<!doctype.*?</head>\s*<body[^>]*>', '', text)
    text = re.sub(r'(?is)</body>.*$', '', text)
    text = re.sub(r'(?is)</?html[^>]*>|</?body[^>]*>|<head[\s\S]*?</head>', '', text)
    return text.replace('```', '').strip()


def word_count(text):
    stripped = html.unescape(re.sub(r'<[^>]+>', ' ', text))
    return len(re.findall(r"[A-Za-zÄÖÜäöüß0-9][A-Za-zÄÖÜäöüß0-9\-]{1,}", stripped))


def chat(key, model, messages, max_tokens=1700, temperature=0.72):
    body = {
        'model': model,
        'messages': messages,
        'temperature': temperature,
        'top_p': 0.9,
        'max_tokens': max_tokens,
        'stream': False,
    }
    headers = {
        'Authorization': 'Bearer ' + key,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'aquaristik-zentrum-content-worker/1.0',
    }
    last = None
    for attempt in range(1, 6):
        try:
            req = urllib.request.Request(API_URL, data=json.dumps(body).encode('utf-8'), headers=headers)
            with urllib.request.urlopen(req, timeout=180) as r:
                return json.loads(r.read().decode('utf-8', errors='replace'))['choices'][0]['message'].get('content', '')
        except urllib.error.HTTPError as e:
            err = e.read().decode('utf-8', errors='replace')[:800]
            last = f'HTTP {e.code}: {err}'
            if e.code in (429, 500, 502, 503, 504):
                time.sleep(min(45, 5 * attempt))
                continue
            raise RuntimeError(last)
        except Exception as e:
            last = f'{type(e).__name__}: {e}'
            time.sleep(min(30, 4 * attempt))
    raise RuntimeError(last or 'NVIDIA request failed')


def affiliate_box(meta):
    pname, pdesc, ref, _c1, _c2 = meta['prod']
    if ref.startswith('search:'):
        from urllib.parse import quote_plus
        url = 'https://www.amazon.de/s?k=' + quote_plus(ref.replace('search:', '').strip()) + '&amp;tag=nova079-20'
    else:
        url = f'https://www.amazon.de/dp/{ref}?tag=nova079-20'
    return f'''<div class="affiliate-box">
  <strong>🛒 Praktisches Zubehör: {html.escape(pname)}</strong>
  <p>{html.escape(pdesc)}. Prüfe vor dem Kauf immer Größe, Anschluss, Material und ob das Produkt zu deinem Becken passt.</p>
  <ul><li><a href="{url}" target="_blank" rel="nofollow sponsored noopener">Passendes Zubehör bei Amazon ansehen</a></li></ul>
  <p><small>Werbelink: Als Amazon-Partner kann Aquaristik Zentrum an qualifizierten Käufen verdienen.</small></p>
</div>'''


def internal_links(meta):
    items = [f'<li><a href="/artikel/{html.escape(r[0])}.html">{html.escape(r[1])}</a> – {html.escape(r[2])}</li>' for r in meta.get('related', [])[:3]]
    return '<h2>Weiterlesen auf Aquaristik Zentrum</h2>\n<p>Wenn du tiefer einsteigen willst, passen diese Guides direkt zu diesem Thema:</p>\n<ul>\n' + '\n'.join(items) + '\n</ul>'


def generate_article(meta, key, model):
    title = meta['title']
    system = (
        'Du bist ein erfahrener deutschsprachiger Aquaristik-Redakteur. Schreibe direkt, bodenständig, praktisch und SEO-stark. '
        'Keine Floskeln, keine erfundenen Quellen, keine medizinischen Heilversprechen. '
        'Gib ausschließlich sauberes HTML für den Body zurück: h2, h3, p, ul, ol, table, strong. Kein h1, kein head, kein body.'
    )
    article = []
    intro = f'''Schreibe den Einstieg für einen Longform-Ratgeber auf Deutsch.
Titel: {title}
Suchintention: {meta['intent']}
Umfang: 420-520 Wörter. Starte exakt mit <h2>Worum es in diesem Guide geht</h2>, dann 4-6 Absätze und eine kurze Bullet-Liste "Auf einen Blick". HTML-only.'''
    article.append(clean_html(chat(key, model, [{'role': 'system', 'content': system}, {'role': 'user', 'content': intro}], max_tokens=1700)))

    for idx, heading in enumerate(meta['toc'], 1):
        if heading.lower() == 'faq':
            continue
        prompt = f'''Schreibe Abschnitt {idx} für den Artikel "{title}".
Exakte H2-Überschrift: {heading}
Suchintention: {meta['intent']}
Geplante Gliederung: {', '.join(meta['toc'])}
Umfang: 380-520 Wörter. Konkret, mit Zahlenbereichen, Checklisten, Beispielen und Warnhinweisen, aber ohne erfundene Studien.
Format: <h2>{html.escape(heading)}</h2>, mehrere <p>, optional <h3>, <ul> oder eine kleine Tabelle. Kein h1. HTML-only.'''
        article.append(clean_html(chat(key, model, [{'role': 'system', 'content': system}, {'role': 'user', 'content': prompt}], max_tokens=1800)))
        if idx == 4:
            article.append(affiliate_box(meta))

    faq = f'''Schreibe eine FAQ-Sektion für den Artikel "{title}". Umfang: 650-850 Wörter. Format: <h2>Häufige Fragen</h2> und danach 7 Fragen als <h3>Frage?</h3><p>Antwort...</p>. HTML-only.'''
    article.append(clean_html(chat(key, model, [{'role': 'system', 'content': system}, {'role': 'user', 'content': faq}], max_tokens=2400)))
    article.append(internal_links(meta))
    article.append('<h2>Fazit</h2>')
    article.append(clean_html(chat(key, model, [{'role': 'system', 'content': system}, {'role': 'user', 'content': f"Schreibe ein bodenständiges Fazit für den Artikel '{title}' mit 300-420 Wörtern. Nur <p> und optional <ul>. HTML-only."}], max_tokens=1200)))

    content = '\n\n'.join(article).strip()
    extra_no = 1
    while word_count(content) < MIN_WORDS and extra_no <= 6:
        wc = word_count(content)
        extra_heading = 'Praxisbeispiel: So setzt du den Guide im Alltag um' if extra_no == 1 else f'Praxisbeispiel und Kontrollplan {extra_no}'
        prompt = f'''Der Artikel "{title}" hat aktuell {wc} Wörter und braucht noch mindestens {MIN_WORDS} Wörter.
Schreibe einen zusätzlichen, neuen Abschnitt mit der H2-Überschrift "{extra_heading}". Umfang: 650-900 Wörter. Keine Wiederholung, sondern konkrete Praxis: Tagesplan, Wochenplan, typische Beobachtungen, Entscheidungskriterien, Fehlerkorrektur. HTML-only.'''
        content += '\n\n' + clean_html(chat(key, model, [{'role': 'system', 'content': system}, {'role': 'user', 'content': prompt}], max_tokens=2600, temperature=0.75))
        extra_no += 1

    return '<!-- GENERATED_BY_NVIDIA_FREE_MODEL: deepseek-ai/deepseek-v4-flash -->\n' + content.strip() + '\n'


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--slug', required=True)
    ap.add_argument('--model', default=DEFAULT_MODEL)
    ap.add_argument('--force', action='store_true')
    args = ap.parse_args()

    metas = json.loads(META_PATH.read_text(encoding='utf-8'))
    by_slug = {m['slug']: m for m in metas}
    if args.slug not in by_slug:
        raise SystemExit(f'Unknown slug: {args.slug}')

    out = OUT_DIR / f'{args.slug}.html'
    if out.exists() and not args.force:
        existing = out.read_text(encoding='utf-8', errors='ignore')
        wc = word_count(existing)
        if wc >= MIN_WORDS and 'GENERATED_BY_NVIDIA_FREE_MODEL' in existing:
            print(json.dumps({'slug': args.slug, 'status': 'skip_existing', 'word_count': wc, 'path': str(out)}, ensure_ascii=False))
            return

    key = load_key()
    started = time.time()
    html_body = generate_article(by_slug[args.slug], key, args.model)
    wc = word_count(html_body)
    if wc < MIN_WORDS:
        raise RuntimeError(f'{args.slug}: only {wc} words generated, need {MIN_WORDS}')
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    out.write_text(html_body, encoding='utf-8')
    print(json.dumps({'slug': args.slug, 'status': 'written', 'word_count': wc, 'seconds': round(time.time() - started, 1), 'path': str(out)}, ensure_ascii=False))


if __name__ == '__main__':
    main()
