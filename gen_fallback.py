#!/usr/bin/env python3
from PIL import Image, ImageDraw, ImageFont
import os

IMG_DIR = 'C:/HermesPortable/home/spaces/aquarium-zentrum/images'

articles = [
    ('aquarium-umzug-transport-guide', '#06b6d4', '#0891b2'),
    ('antennenwels-l-welse-haltung', '#ec4899', '#db2777'),
    ('truebes-wasser-schaum-geruch-aquarium', '#0ea5e9', '#0369a1'),
    ('aquarium-standort-unterschrank', '#78716c', '#57534e'),
    ('krebse-krabben-aquarium-guide-2026', '#ff6b6b', '#dc2626'),
    ('skalare-haltung-pflege', '#6366f1', '#4338ca'),
    ('fadenfische-guramis-haltung', '#0d9488', '#0f766e'),
    ('buntbarsche-cichliden-aquarium', '#f59e0b', '#d97706'),
    ('schwimmpflanzen-aquarium', '#10b981', '#059669'),
    ('aquarium-schaedlinge', '#f59e0b', '#d97706'),
    ('beliebteste-aquarienfische', '#ec4899', '#be185d'),
    ('nano-aquarium-guide', '#06b6d4', '#0891b2'),
    ('aquarium-automation', '#8b5cf6', '#7c3aed'),
]

for slug, c1, c2 in articles:
    sz = (1024, 768)
    img = Image.new('RGB', sz, '#0a0a0f')
    draw = ImageDraw.Draw(img)
    for y in range(sz[1]):
        t = y / sz[1]
        r = int(int(c1[1:3],16)*(1-t) + int(c2[1:3],16)*t)
        g = int(int(c1[3:5],16)*(1-t) + int(c2[3:5],16)*t)
        b = int(int(c1[5:7],16)*(1-t) + int(c2[5:7],16)*t)
        draw.line([(0,y), (sz[0],y)], fill=(r,g,b))
    draw.ellipse([150,120,450,420], fill=(255,255,255,10))
    draw.ellipse([650,300,920,600], fill=(255,255,255,8))
    draw.ellipse([sz[0]//2-60, sz[1]//2-120, sz[0]//2+60, sz[1]//2], fill=(255,255,255,18))
    try:
        fsm = ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf', 28)
        fxs = ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf', 18)
    except:
        fsm = fxs = ImageFont.load_default()
    png_path = os.path.join(IMG_DIR, f'{slug}.png')
    img.save(png_path, 'PNG')
    webp_path = os.path.join(IMG_DIR, f'{slug}.webp')
    img.save(webp_path, 'WEBP', quality=85)
    print(f'  OK {slug}: {os.path.getsize(png_path)//1024}KB')

print('ALL DONE')
