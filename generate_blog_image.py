#!/usr/bin/env python3
"""Generate simple SEO blog hero images for Aquaristik Zentrum."""
import argparse, os, re, math, random
from pathlib import Path
try:
    from PIL import Image, ImageDraw, ImageFont, ImageFilter
except ImportError:
    raise SystemExit('Pillow is required: pip install pillow')

def slugify(s):
    s = s.lower().strip()
    s = s.replace('ä','ae').replace('ö','oe').replace('ü','ue').replace('ß','ss')
    s = re.sub(r'[^a-z0-9]+','-',s).strip('-')
    return s or 'aquarium'

def font(size, bold=False):
    candidates = [
        'C:/Windows/Fonts/arialbd.ttf' if bold else 'C:/Windows/Fonts/arial.ttf',
        '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf' if bold else '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
    ]
    for p in candidates:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()

def wrap(draw, text, fnt, max_w):
    words, lines, cur = text.split(), [], ''
    for w in words:
        t = (cur + ' ' + w).strip()
        if draw.textbbox((0,0), t, font=fnt)[2] <= max_w:
            cur = t
        else:
            if cur: lines.append(cur)
            cur = w
    if cur: lines.append(cur)
    return lines

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('topic')
    ap.add_argument('--out-dir', default='images')
    ap.add_argument('--filename')
    args = ap.parse_args()
    Path(args.out_dir).mkdir(parents=True, exist_ok=True)
    slug = slugify(args.filename or args.topic)
    out = Path(args.out_dir) / f'{slug}_00001_.png'
    W,H = 1400, 850
    img = Image.new('RGB',(W,H),'#0b5f73')
    pix = img.load()
    for y in range(H):
        for x in range(W):
            r = int(8 + 22*y/H)
            g = int(88 + 78*(1-y/H) + 12*math.sin(x/120))
            b = int(112 + 80*(1-y/H))
            pix[x,y]=(r,g,b)
    d = ImageDraw.Draw(img, 'RGBA')
    rnd = random.Random(slug)
    # light rays and bubbles
    for i in range(9):
        x = rnd.randint(-200,W)
        d.polygon([(x,0),(x+90,0),(x+360,H),(x+210,H)], fill=(255,255,255,18))
    for i in range(120):
        x,y = rnd.randint(0,W), rnd.randint(0,H)
        rr = rnd.randint(3,18)
        d.ellipse((x-rr,y-rr,x+rr,y+rr), outline=(220,255,255,rnd.randint(35,95)), width=2)
    # aquatic plants
    for base in range(0,W,55):
        h = rnd.randint(120,310)
        color = rnd.choice([(64,190,116,180),(96,210,144,170),(41,150,104,180)])
        d.line((base,H,base+rnd.randint(-40,40),H-h), fill=color, width=rnd.randint(5,9))
        for j in range(4):
            yy=H-h*j/5-rnd.randint(0,30); xx=base+rnd.randint(-25,25)
            d.ellipse((xx-20,yy-8,xx+20,yy+8), fill=color)
    # fish silhouettes
    for i in range(8):
        cx,cy=rnd.randint(90,W-90), rnd.randint(130,H-230)
        sz=rnd.randint(28,58); col=rnd.choice([(255,184,77,180),(255,120,90,170),(140,230,255,160)])
        d.ellipse((cx-sz,cy-sz//2,cx+sz,cy+sz//2), fill=col)
        d.polygon([(cx-sz,cy),(cx-sz-35,cy-22),(cx-sz-35,cy+22)], fill=col)
        d.ellipse((cx+sz//2,cy-6,cx+sz//2+6,cy), fill=(0,40,50,190))
    # title panel
    d.rounded_rectangle((80,470,W-80,760), radius=36, fill=(0,42,58,175), outline=(255,255,255,55), width=2)
    title_font = font(62, True)
    sub_font = font(30, False)
    lines = wrap(d, args.topic, title_font, W-220)[:3]
    y = 515
    for line in lines:
        d.text((120,y), line, font=title_font, fill=(255,255,255,255))
        y += 72
    d.text((120,705), 'Aquaristik Zentrum Ratgeber', font=sub_font, fill=(184,239,232,255))
    img = img.filter(ImageFilter.UnsharpMask(radius=1.2, percent=125, threshold=3))
    img.save(out, quality=92)
    print(out.as_posix())
if __name__ == '__main__': main()
