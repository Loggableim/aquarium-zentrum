import os
import sys
from PIL import Image, ImageDraw, ImageFont

OUTPUT_DIR = "C:/HermesPortable/home/spaces/aquarium-zentrum/images"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def create_hero(slug, title, bg_color, accent_color):
    W, H = 1024, 768
    img = Image.new("RGB", (W, H), bg_color)
    draw = ImageDraw.Draw(img)
    
    # Gradient overlay
    for y in range(H):
        factor = (y / H) * 0.3
        r = int(bg_color[0] + (accent_color[0] - bg_color[0]) * factor)
        g = int(bg_color[1] + (accent_color[1] - bg_color[1]) * factor)
        b = int(bg_color[2] + (accent_color[2] - bg_color[2]) * factor)
        draw.line([(0, y), (W, y)], fill=(min(255,r), min(255,g), min(255,b)))
    
    # Decorative elements
    draw.ellipse([(100, 80), (350, 300)], outline=accent_color + (60,), width=3)
    draw.ellipse([(680, 420), (900, 650)], outline=accent_color + (80,), width=3)
    draw.ellipse([(550, 120), (750, 320)], outline=accent_color + (40,), width=2)
    
    # Try to use a font
    try:
        font = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 48)
        font_small = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 22)
    except:
        try:
            font = ImageFont.truetype("arial.ttf", 48)
            font_small = ImageFont.truetype("arial.ttf", 22)
        except:
            font = font_small = ImageFont.load_default()
    
    # Title
    bbox = draw.textbbox((0, 0), title, font=font)
    tw = bbox[2] - bbox[0]
    draw.text(((W - tw) // 2, 350), title, fill=(255, 255, 255), font=font)
    
    # Subtitle
    bbox = draw.textbbox((0, 0), "aquaristik-zentrum.com", font=font_small)
    sw = bbox[2] - bbox[0]
    draw.text(((W - sw) // 2, 430), "aquaristik-zentrum.com", fill=accent_color, font=font_small)
    
    # Bottom accent bar
    draw.rectangle([(0, H-6), (W, H)], fill=accent_color)
    
    # Save PNG
    path = os.path.join(OUTPUT_DIR, f"{slug}.png")
    img.save(path, "PNG")
    size_kb = os.path.getsize(path) / 1024
    print(f"✅ {slug}.png - {size_kb:.0f} KB")
    
    # Also generate .webp
    webp_path = os.path.join(OUTPUT_DIR, f"{slug}.webp")
    if img.mode == "RGBA":
        bg = Image.new("RGB", img.size, (255, 255, 255))
        bg.paste(img, mask=img.split()[3])
        img = bg
    img.save(webp_path, "WEBP", quality=82)
    size_kb = os.path.getsize(webp_path) / 1024
    print(f"✅ {slug}.webp - {size_kb:.0f} KB")

# 1. Futtertiere selbst züchten — Fische
create_hero("futtertiere-selbst-zuechten", 
            "Futtertiere selbst züchten",
            (236, 72, 153),   # #ec4899
            (255, 182, 193))

# 2. Garnelen-Krankheiten — Garnelen
create_hero("garnelen-krankheiten",
            "Garnelen-Krankheiten",
            (255, 107, 107),  # #ff6b6b
            (255, 200, 200))

# 3. Biotop-Aquarium Südamerika — Einsteiger
create_hero("biotop-aquarium-suedamerika",
            "Biotop-Aquarium Südamerika",
            (6, 182, 212),    # #06b6d4
            (100, 200, 255))

print("\n✅ Alle 3 Hero-Bilder generiert!")
