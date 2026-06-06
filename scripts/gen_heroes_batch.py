"""Hero image batch generator — 3 articles for content factory run.

Uses Pillow to generate branded hero images matching the existing style
(see scripts/gen_heroes.py)."""
import os
from PIL import Image, ImageDraw, ImageFont

OUTPUT_DIR = "C:/HermesPortable/aquarium-zentrum/images"
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
        draw.line([(0, y), (W, y)], fill=(min(255, r), min(255, g), min(255, b)))

    # Decorative elements
    draw.ellipse([(100, 80), (350, 300)], outline=accent_color, width=3)
    draw.ellipse([(680, 420), (900, 650)], outline=accent_color, width=3)
    draw.ellipse([(550, 120), (750, 320)], outline=accent_color, width=2)

    # Font
    try:
        font = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 48)
        font_small = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 22)
    except Exception:
        font = font_small = ImageFont.load_default()

    # Title (wrap if needed)
    words = title.split()
    lines, current = [], ""
    for w in words:
        test = (current + " " + w).strip()
        bbox = draw.textbbox((0, 0), test, font=font)
        if (bbox[2] - bbox[0]) > W - 100 and current:
            lines.append(current)
            current = w
        else:
            current = test
    if current:
        lines.append(current)

    line_height = 60
    total_h = line_height * len(lines)
    y_start = (H - total_h) // 2 - 30
    for i, line in enumerate(lines):
        bbox = draw.textbbox((0, 0), line, font=font)
        tw = bbox[2] - bbox[0]
        draw.text(((W - tw) // 2, y_start + i * line_height), line,
                  fill=(255, 255, 255), font=font)

    # Subtitle
    subtitle = "aquaristik-zentrum.com"
    bbox = draw.textbbox((0, 0), subtitle, font=font_small)
    sw = bbox[2] - bbox[0]
    draw.text(((W - sw) // 2, y_start + total_h + 30), subtitle,
              fill=accent_color, font=font_small)

    # Bottom accent bar
    draw.rectangle([(0, H - 6), (W, H)], fill=accent_color)

    # Save PNG
    path = os.path.join(OUTPUT_DIR, f"{slug}.png")
    img.save(path, "PNG")
    print(f"OK {slug}.png - {os.path.getsize(path) // 1024} KB")

    # Save WebP
    webp_path = os.path.join(OUTPUT_DIR, f"{slug}.webp")
    if img.mode == "RGBA":
        bg = Image.new("RGB", img.size, (255, 255, 255))
        bg.paste(img, mask=img.split()[3])
        img = bg
    img.save(webp_path, "WEBP", quality=82)
    print(f"OK {slug}.webp - {os.path.getsize(webp_path) // 1024} KB")


# Article 1: Brackwasser — Einsteiger #06b6d4
create_hero(
    "brackwasser-aquarium-guide",
    "Brackwasser-Aquarium",
    (6, 182, 212),    # #06b6d4
    (100, 200, 255),
)

# Article 2: Schwimmpflanzen — Pflanzen #10b981
create_hero(
    "schwimmpflanzen-aquarium-guide",
    "Schwimmpflanzen im Aquarium",
    (16, 185, 129),   # #10b981
    (132, 204, 22),
)

# Article 3: Urlaub / Futterautomat — Pflege #ffd93d
create_hero(
    "urlaub-aquarium-futterautomat",
    "Aquarium im Urlaub",
    (255, 217, 61),   # #ffd93d
    (245, 158, 11),
)

print("\nOK Alle 3 Hero-Bilder generiert!")
