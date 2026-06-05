#!/usr/bin/env python3
"""Regenerate all article images with CORRECT Pop Art Comic style via Queue."""
import json, urllib.request, time, os, re, shutil
from PIL import Image

QUEUE = "http://127.0.0.1:8283"
IMG_DIR = "C:/HermesPortable/home/spaces/aquarium-zentrum/images"

STYLE_PREFIX = "comic pop art, bold thick black outlines, halftone dots, Ben-Day dots, vibrant flat colors, high contrast, retro comic book style, graphic illustration"

articles = [
    ("aquarium-umzug-transport-guide", f"aquarium scene with fish in a moving box being transported, underwater moving day, {STYLE_PREFIX}"),
    ("antennenwels-l-welse-haltung", f"aquarium scene with a cute catfish with long whiskers, swimming near driftwood, {STYLE_PREFIX}"),
    ("truebes-wasser-schaum-geruch-aquarium", f"aquarium scene with murky cloudy green water, worried fish, water quality problem underwater, {STYLE_PREFIX}"),
    ("lebendgebaerende-zahnkarpfen", f"aquarium scene with colorful guppy fish with big tails, livebearers swimming, {STYLE_PREFIX}"),
    ("aquarium-standort-unterschrank", f"aquarium scene with fish tank on a wooden cabinet stand, room setting, {STYLE_PREFIX}"),
    ("krebse-krabben-aquarium-guide-2026", f"aquarium scene with a small red crab and crayfish on gravel, crustaceans underwater, {STYLE_PREFIX}"),
    ("skalare-haltung-pflege", f"aquarium scene with elegant angelfish with long fins, swimming in planted tank, {STYLE_PREFIX}"),
    ("fadenfische-guramis-haltung", f"aquarium scene with gourami fish with long flowing thread fins, colorful tropical fish, {STYLE_PREFIX}"),
    ("buntbarsche-cichliden-aquarium", f"aquarium scene with colorful cichlid fish, bright blue and orange tropical fish, {STYLE_PREFIX}"),
    ("schwimmpflanzen-aquarium", f"aquarium scene with floating plants on water surface, frogbit duckweed, green leaves, {STYLE_PREFIX}"),
    ("aquarium-schaedlinge", f"aquarium scene with tiny planaria and hydra on glass, microscopic pests underwater, {STYLE_PREFIX}"),
    ("beliebteste-aquarienfische", f"aquarium scene with many colorful popular fish together, neon tetra guppy molly, community tank, {STYLE_PREFIX}"),
    ("nano-aquarium-guide", f"aquarium scene with a tiny mini nano aquarium bowl, small fish and miniature plants, {STYLE_PREFIX}"),
    ("aquarium-automation", f"aquarium scene with smart technology gadgets, automatic fish feeder and wifi controller, {STYLE_PREFIX}"),
]

def submit(slug, prompt):
    data = json.dumps({"model": "sdxl-realvis", "prompt": prompt, "steps": 25}).encode()
    req = urllib.request.Request(f"{QUEUE}/generate", data=data, headers={"Content-Type": "application/json"})
    try:
        resp = json.loads(urllib.request.urlopen(req, timeout=30).read())
        return resp.get("job_id")
    except Exception as e:
        print(f"  ❌ {slug}: submit failed - {e}")
        return None

def wait_for(job_id, timeout=600):
    for i in range(timeout):
        time.sleep(2)
        try:
            resp = json.loads(urllib.request.urlopen(f"{QUEUE}/status/{job_id}", timeout=10).read())
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
print(f"🎨 Generating {len(articles)} images with POP ART COMIC style via RealVisXL (25 steps)...\n")

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
        img.save(webp_dst, 'WEBP', quality=85)
        
        kb_png = os.path.getsize(png_dst) // 1024
        kb_webp = os.path.getsize(webp_dst) // 1024
        print(f"  ✅ {slug}: {kb_png}KB PNG / {kb_webp}KB WEBP ← POP ART COMIC ✓")
    else:
        print(f"  ❌ {slug}: TIMEOUT")

print("\n🎉 ALL DONE!")
