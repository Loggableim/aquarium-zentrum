#!/usr/bin/env python3
import argparse, json, math, random, textwrap
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
META_PATH = ROOT / 'data' / 'long-content-articles.json'
IMG_DIR = ROOT / 'images'
W, H = 1200, 630

PALETTE = {
    'Einsteiger': ('#06b6d4', '#0ea5e9', '#ecfeff'),
    'Pflege & Gesundheit': ('#ffd93d', '#f59e0b', '#0a0a0f'),
    'Garnelen & Fische': ('#ec4899', '#ff6b6b', '#fff1f2'),
    'Technik': ('#8b5cf6', '#60a5fa', '#f5f3ff'),
    'Pflanzen & Aquascaping': ('#10b981', '#0d9488', '#ecfdf5'),
}


def hex_to_rgb(h):
    h = h.strip('#')
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))


def blend(a, b, t):
    return tuple(int(a[i] * (1 - t) + b[i] * t) for i in range(3))


def font(size, bold=False):
    from PIL import ImageFont
    candidates = [
        'C:/Windows/Fonts/arialbd.ttf' if bold else 'C:/Windows/Fonts/arial.ttf',
        'C:/Windows/Fonts/segoeuib.ttf' if bold else 'C:/Windows/Fonts/segoeui.ttf',
        '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf' if bold else '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
    ]
    for c in candidates:
        try:
            return ImageFont.truetype(c, size)
        except Exception:
            pass
    return ImageFont.load_default()


def draw_wrapped(draw, text, xy, max_width, font_obj, fill, line_gap=10):
    x, y = xy
    words = text.split()
    lines = []
    line = ''
    for word in words:
        test = (line + ' ' + word).strip()
        bbox = draw.textbbox((0, 0), test, font=font_obj)
        if bbox[2] - bbox[0] <= max_width or not line:
            line = test
        else:
            lines.append(line)
            line = word
    if line:
        lines.append(line)
    for line in lines:
        draw.text((x, y), line, font=font_obj, fill=fill)
        y += (draw.textbbox((0, 0), line, font=font_obj)[3] - draw.textbbox((0, 0), line, font=font_obj)[1]) + line_gap
    return y


def generate(meta):
    from PIL import Image, ImageDraw, ImageFilter
    c1, c2, text_color = PALETTE.get(meta['categoryGroup'], (meta['catColor'], '#0ea5e9', '#ffffff'))
    a, b = hex_to_rgb(c1), hex_to_rgb(c2)
    img = Image.new('RGB', (W, H), a)
    pix = img.load()
    for y in range(H):
        for x in range(W):
            t = (x / W * 0.65) + (y / H * 0.35)
            wave = (math.sin((x + y) / 85.0) + 1) * 0.035
            pix[x, y] = blend(a, b, min(1, max(0, t + wave)))
    overlay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    random.seed(meta['slug'])
    for i in range(22):
        x = random.randint(-120, W)
        y = random.randint(-90, H)
        r = random.randint(45, 180)
        col = (*blend(a, b, random.random()), random.randint(45, 110))
        d.ellipse((x, y, x + r, y + r), outline=col, width=random.randint(2, 6))
    for i in range(10):
        x1 = random.randint(0, W)
        y1 = random.randint(0, H)
        x2 = x1 + random.randint(-260, 260)
        y2 = y1 + random.randint(-180, 180)
        d.line((x1, y1, x2, y2), fill=(255, 255, 255, random.randint(35, 95)), width=random.randint(3, 8))
    d.rounded_rectangle((62, 62, W - 62, H - 62), radius=44, fill=(5, 10, 25, 150), outline=(255, 255, 255, 80), width=3)
    img = Image.alpha_composite(img.convert('RGBA'), overlay).filter(ImageFilter.UnsharpMask(radius=1.2, percent=120, threshold=3))
    d = ImageDraw.Draw(img)
    badge_font = font(30, True)
    title_font = font(58, True)
    small_font = font(28, False)
    badge = f"{meta['catEmoji']} {meta['topic']}"
    d.rounded_rectangle((96, 96, 96 + d.textbbox((0, 0), badge, font=badge_font)[2] + 42, 154), radius=22, fill=hex_to_rgb(c1) + (235,))
    d.text((117, 111), badge, font=badge_font, fill=(255, 255, 255, 255) if meta['categoryGroup'] != 'Pflege & Gesundheit' else (10, 10, 15, 255))
    y = draw_wrapped(d, meta['title'], (96, 205), 860, title_font, (255, 255, 255, 255), 14)
    y += 16
    draw_wrapped(d, meta['excerpt'], (100, min(y, 440)), 900, small_font, (235, 245, 255, 235), 8)
    d.text((96, H - 105), 'aquaristik-zentrum.com · Longform Guide', font=small_font, fill=(255, 255, 255, 210))
    IMG_DIR.mkdir(exist_ok=True)
    out = IMG_DIR / meta['img']
    img.convert('RGB').save(out, 'PNG', optimize=True)
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--slug', required=True)
    args = ap.parse_args()
    metas = json.loads(META_PATH.read_text(encoding='utf-8'))
    meta = next((m for m in metas if m['slug'] == args.slug), None)
    if not meta:
        raise SystemExit(f'Unknown slug: {args.slug}')
    out = generate(meta)
    print(out)


if __name__ == '__main__':
    main()
