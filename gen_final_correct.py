#!/usr/bin/env python3
"""Generate ALL missing/wrong-style images with CORRECT Furry Pop Art Comic × Warhol style.
   Uses sdxl-realvis, 25 steps, 1216x832, proper style prefix."""

import json, urllib.request, time, os, re, shutil
from PIL import Image

QUEUE = "http://127.0.0.1:8283"
IMG_DIR = "C:/HermesPortable/home/spaces/aquarium-zentrum/images"

STYLE = ("POP ART COMIC STYLE, WARHOL STYLE, bold thick black outlines, "
         "halftone dots, Ben-Day dots effect, vibrant flat colors, graphic pop art, "
         "high contrast, saturated pop colors, retro comic, "
         "cute furry expressive cartoon animal style, big cute eyes, "
         "white background, simple centered composition")

articles = [
    # 14 wrong-style images (were generated with sdxl-lightning 4 steps)
    ("aquarium-umzug-transport-guide",
     f"Aquarium move scene with fish in a plastic bag being carried, underwater moving day, {STYLE}"),
    ("antennenwels-l-welse-haltung",
     f"Aquarium scene with a cute catfish with long whiskers, swimming near driftwood, {STYLE}"),
    ("truebes-wasser-schaum-geruch-aquarium",
     f"Aquarium scene with murky cloudy green water, worried fish peeking through, {STYLE}"),
    ("lebendgebaerende-zahnkarpfen",
     f"Aquarium scene with colorful guppy fish with big fan tails, livebearers swimming happily, {STYLE}"),
    ("aquarium-standort-unterschrank",
     f"Aquarium on a wooden cabinet stand, room setting with tank and stand furniture, {STYLE}"),
    ("krebse-krabben-aquarium-guide-2026",
     f"Aquarium scene with a small red crab and crayfish on gravel, crustaceans underwater, {STYLE}"),
    ("skalare-haltung-pflege",
     f"Aquarium scene with elegant angelfish with tall fins, swimming in planted tank, {STYLE}"),
    ("fadenfische-guramis-haltung",
     f"Aquarium scene with gourami fish with long flowing thread-like fins, colorful, {STYLE}"),
    ("buntbarsche-cichliden-aquarium",
     f"Aquarium scene with colorful cichlid fish, bright blue and orange, tropical aquarium, {STYLE}"),
    ("schwimmpflanzen-aquarium",
     f"Aquarium scene with floating plants on water surface, frogbit duckweed, green leaves, {STYLE}"),
    ("aquarium-schaedlinge",
     f"Aquarium scene with tiny planaria and hydra on glass, microscopic pests underwater, {STYLE}"),
    ("beliebteste-aquarienfische",
     f"Aquarium scene with group of colorful popular fish together, neon tetra guppy molly, community tank, {STYLE}"),
    ("nano-aquarium-guide",
     f"Aquarium scene with a tiny mini nano aquarium bowl, small fish and miniature plants, {STYLE}"),
    ("aquarium-automation",
     f"Aquarium scene with smart technology gadgets, automatic fish feeder, wifi controller, {STYLE}"),

    # 3 broken/corrupt images (tiny files)
    ("biotop-aquarium-suedamerika",
     f"Aquarium scene with Amazon rainforest biotop, amazon river, tropical fish, dense underwater plants, {STYLE}"),
    ("futtertiere-selbst-zuechten",
     f"Aquarium scene with tiny brine shrimp artemia, microworms, daphnia, live food culture jars, {STYLE}"),
    ("garnelen-krankheiten",
     f"Aquarium scene with sick shrimp, shrimp with white spots, diseases, tiny shrimp underwater, {STYLE}"),
]

def submit(slug, prompt):
    data = json.dumps({
        "model": "sdxl-realvis",
        "prompt": prompt,
        "steps": 25,
        "width": 1216,
        "height": 832
    }).encode()
    req = urllib.request.Request(f"{QUEUE}/generate", data=data,
                                 headers={"Content-Type": "application/json"})
    resp = json.loads(urllib.request.urlopen(req, timeout=30).read())
    return resp.get("job_id")

def wait_for(job_id, timeout=600):
    for i in range(timeout):
        time.sleep(2)
        try:
            resp = json.loads(
                urllib.request.urlopen(f"{QUEUE}/status/{job_id}", timeout=10).read())
            st = resp.get("status")
            if st == "done" and resp.get("output_path"):
                return resp["output_path"]
            if st == "failed":
                err = resp.get("error", "")
                m = re.search(r'"output_path": "([^"]+)"', err)
                if m:
                    return m.group(1)
        except:
            pass
        if i % 30 == 0:
            print(f"     ⏳ still waiting ({i*2}s)...")
    return None

# Submit all
print(f"🎨 Generating {len(articles)} images with POP ART COMIC × WARHOL via RealVisXL (25 steps, 1216x832)...\n")

jobs = []
for slug, prompt in articles:
    jid = submit(slug, prompt)
    if jid:
        jobs.append((slug, jid))
        print(f"  ⏳ {slug} → {jid}")
    time.sleep(0.5)

print(f"\n📋 {len(jobs)} jobs submitted. Waiting for completion...\n")

# Wait for each and process
for slug, jid in jobs:
    print(f"  🔄 Waiting for {slug}...")
    path = wait_for(jid)
    if path:
        path = path.replace("\\", "/")
        png_dst = os.path.join(IMG_DIR, f"{slug}.png")
        webp_dst = os.path.join(IMG_DIR, f"{slug}.webp")

        shutil.copy2(path, png_dst)

        # WebP conversion
        img = Image.open(png_dst)
        if img.mode == 'RGBA':
            bg = Image.new('RGB', img.size, (255, 255, 255))
            bg.paste(img, mask=img.split()[3])
            img = bg
        # If not 1216x832, resize
        if img.size != (1216, 832):
            print(f"     ↻ Resizing from {img.size} to 1216x832")
            img = img.resize((1216, 832), Image.LANCZOS)
            img.save(png_dst, 'PNG')
        img.save(webp_dst, 'WEBP', quality=85)

        kb_png = os.path.getsize(png_dst) // 1024
        kb_webp = os.path.getsize(webp_dst) // 1024
        final_sz = f"{img.size[0]}x{img.size[1]}"
        print(f"  ✅ {slug}: {kb_png}KB PNG / {kb_webp}KB WEBP @ {final_sz} ← POP ART COMIC ✓")
    else:
        print(f"  ❌ {slug}: TIMEOUT")

print("\n🎉 ALL DONE!")
