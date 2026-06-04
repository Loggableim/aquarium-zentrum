#!/usr/bin/env python3
import argparse, html, json, re, subprocess, sys, time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
META_PATH = ROOT / 'data' / 'long-content-articles.json'


def run(cmd, check=True):
    print('$', ' '.join(cmd), flush=True)
    p = subprocess.run(cmd, cwd=ROOT, text=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    print(p.stdout, flush=True)
    if check and p.returncode != 0:
        raise SystemExit(p.returncode)
    return p


def word_count(path):
    text = Path(path).read_text(encoding='utf-8', errors='ignore')
    stripped = html.unescape(re.sub(r'<[^>]+>', ' ', text))
    return len(re.findall(r"[A-Za-zÄÖÜäöüß0-9][A-Za-zÄÖÜäöüß0-9\-]{1,}", stripped))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--slug', required=True)
    ap.add_argument('--model', default='nvidia/nemotron-3-super-120b-a12b')
    args = ap.parse_args()

    metas = json.loads(META_PATH.read_text(encoding='utf-8'))
    slugs = {m['slug'] for m in metas}
    if args.slug not in slugs:
        raise SystemExit(f'Unknown slug: {args.slug}')

    run(['git', 'pull', '--rebase', 'origin', 'main'], check=False)
    run([sys.executable, 'scripts/nvidia_long_article_worker.py', '--slug', args.slug, '--model', args.model])
    run([sys.executable, 'scripts/generate_long_article_image.py', '--slug', args.slug])
    run(['node', 'build.js'])

    content_file = ROOT / 'content' / 'artikel' / f'{args.slug}.html'
    output_file = ROOT / 'artikel' / f'{args.slug}.html'
    image_file = ROOT / 'images' / f'{args.slug}.png'
    wc = word_count(content_file)
    if wc < 4000:
        raise SystemExit(f'Word count too low for {args.slug}: {wc}')
    for path in (content_file, output_file, image_file):
        if not path.exists():
            raise SystemExit(f'Missing expected file: {path}')

    run(['git', 'add', 'build.js', 'data/long-content-articles.json', '_templates/nav.html', 'index.html', 'sitemap.xml', str(content_file.relative_to(ROOT)), str(output_file.relative_to(ROOT)), str(image_file.relative_to(ROOT))])
    status = run(['git', 'status', '--short'], check=False).stdout.strip()
    if not status:
        print(json.dumps({'slug': args.slug, 'status': 'no_changes', 'word_count': wc}, ensure_ascii=False))
        return
    msg = f'Add longform aquarium guide: {args.slug}'
    run(['git', 'commit', '-m', msg])
    run(['git', 'push', 'origin', 'main'])
    print(json.dumps({'slug': args.slug, 'status': 'published', 'word_count': wc}, ensure_ascii=False))


if __name__ == '__main__':
    main()
