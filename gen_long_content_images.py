#!/usr/bin/env python3
"""Generate all 18 missing/wrong-dims long-content images via queue."""
import json, urllib.request, time, os, shutil, sys
from PIL import Image

QUEUE = "http://127.0.0.1:8283"
IMG_DIR = "C:/HermesPortable/home/spaces/aquarium-zentrum/images"
LOG = "C:/HermesPortable/home/spaces/aquarium-zentrum/gen18.log"

STYLE = ("POP ART COMIC STYLE, WARHOL STYLE, bold thick black outlines, "
         "halftone dots, Ben-Day dots effect, vibrant flat colors, graphic pop art, "
         "high contrast, saturated pop colors, retro comic, "
         "cute furry expressive cartoon animal style, big cute eyes, "
         "white background, simple centered composition")

articles = [
    ("aquarium-futterautomat-guide-2026", f"Aquarium scene with automatic fish feeder on tank, timed food dispenser for vacation, {STYLE}"),
    ("meerwasser-aquarium-einstieg", f"Aquarium scene with saltwater tank, colorful clownfish and coral reef, marine aquarium, {STYLE}"),
    ("wasseraufbereiter-aquarium-vergleich", f"Aquarium scene with water conditioner bottles, tap water treatment, water preparation products, {STYLE}"),
    ("artemia-grindal-futtertiere-zuechten", f"Aquarium scene with tiny brine shrimp artemia, microworms, daphnia culture jars, live food cultivation, {STYLE}"),
    ("aquarium-kamera-livestream", f"Aquarium scene with underwater camera in tank, live streaming setup, aquarium monitoring, {STYLE}"),
    ("uv-klaerer-aquarium-guide", f"Aquarium scene with UV clarifier device, green water cleared by UV light, water sterilization, {STYLE}"),
    ("aquarium-luftpumpe-sauerstoff", f"Aquarium scene with air pump and airstones, oxygen bubbles in water, aquarium aeration, {STYLE}"),
    ("iwagumi-aquascape-guide", f"Aquarium scene with iwagumi layout, stone arrangement with pebbles and green plants, zen aquascaping, {STYLE}"),
    ("biotop-aquarium-amazonas-asien", f"Aquarium scene with asian biotope, asian freshwater habitat, tropical plants, jungle aquarium, {STYLE}"),
    ("bucephalandra-anubias-javafarn", f"Aquarium scene with bucephalandra anubias and java fern on driftwood, epiphyte aquarium plants, {STYLE}"),
    ("fischbesatz-nach-beckengroesse", f"Aquarium scene with ruler measuring tank size, several fish silhouettes showing stocking levels, {STYLE}"),
    ("stromausfall-aquarium-notfallplan", f"Aquarium scene with power outage emergency, battery air pump, fish in dark tank, emergency plan, {STYLE}"),
    ("brackwasser-aquarium-guide", f"Aquarium scene with brackish water tank, mangrove roots, low salinity fish and plants, {STYLE}"),
    ("kaltwasser-aquarium-guide", f"Aquarium scene with coldwater tank, goldfish, no heater, temperate fish and plants, {STYLE}"),
    ("aussenfilter-vs-innenfilter", f"Aquarium scene with external canister filter vs internal filter side by side, filtration comparison, {STYLE}"),
    ("low-tech-aquarium-ohne-co2", f"Aquarium scene with low tech natural planted tank, no CO2 injection, easy aquarium plants, {STYLE}"),
    ("schwimmpflanzen-aquarium-guide", f"Aquarium scene with floating plants on water surface, frogbit duckweed and salvinia, {STYLE}"),
    ("urlaub-aquarium-futterautomat", f"Aquarium scene with vacation mode, timer and auto feeder, holiday fish care prep, {STYLE}"),
]

def log(msg):
    with open(LOG, 'a') as f:
        f.write(f"{time.strftime('%H:%M:%S')} {msg}\n")
    print(msg, flush=True)

def submit(prompt):
    data = json.dumps({
        "model": "sdxl-realvis", "prompt": prompt,
        "steps": 25, "width": 1216, "height": 832
    }).encode()
    req = urllib.request.Request(f"{QUEUE}/generate", data=data, headers={"Content-Type":"application/json"})
    return json.loads(urllib.request.urlopen(req, timeout=30).read())["job_id"]

def wait_for(job_id, timeout=540):
    start = time.time()
    for i in range(timeout // 3):
        time.sleep(3)
        try:
            r = json.loads(urllib.request.urlopen(f"{QUEUE}/status/{job_id}", timeout=10).read())
            if r.get("status") == "done" and r.get("output_path"):
                return r["output_path"]
            if r.get("status") in ("failed", "timeout"):
                return None
        except: pass
        if i % 10 == 0 and i > 0:
            log(f"     ⏳ {int(time.time()-start)}s...")
    return None

def process(slug, path):
    path = path.replace("\\", "/")
    png = os.path.join(IMG_DIR, f"{slug}.png")
    webp = os.path.join(IMG_DIR, f"{slug}.webp")
    shutil.copy2(path, png)
    img = Image.open(png)
    if img.mode == 'RGBA':
        bg = Image.new('RGB', img.size, (255, 255, 255))
        bg.paste(img, mask=img.split()[3])
        img = bg
    if img.size != (1216, 832):
        img = img.resize((1216, 832), Image.LANCZOS)
        img.save(png, 'PNG')
    img.save(webp, 'WEBP', quality=85)
    return os.path.getsize(png)//1024, os.path.getsize(webp)//1024, img.size

log(f"=== Gen18 Start ===")
log(f"Queue may have pending jobs ahead. Submitting {len(articles)} jobs...")

# Submit in small batches to not overwhelm
jobs = []
for slug, prompt in articles:
    try:
        jid = submit(prompt)
        jobs.append((slug, jid))
        log(f"  ⏳ {slug} → {jid}")
    except Exception as e:
        log(f"  ❌ {slug}: {e}")
    time.sleep(0.3)

log(f"✅ All {len(jobs)} jobs submitted. Waiting...")

done = 0
for idx, (slug, jid) in enumerate(jobs, 1):
    log(f"[{idx}/{len(jobs)}] {slug}:")
    path = wait_for(jid, timeout=600)
    if path:
        kb_png, kb_webp, dims = process(slug, path)
        log(f"  ✅ {kb_png}KB PNG / {kb_webp}KB WEBP @ {dims[0]}x{dims[1]}")
        done += 1
    else:
        log(f"  ❌ FAILED")
    time.sleep(0.5)

log(f"\n🎉 Done: {done}/{len(articles)}")
