#!/usr/bin/env python3
"""Regenerate the 10 wrong-dims images in Pop Art Comic × Warhol style (cron paused)."""
import json, urllib.request, time, os, shutil, sys
from PIL import Image

QUEUE = "http://127.0.0.1:8283"
IMG_DIR = "C:/HermesPortable/home/spaces/aquarium-zentrum/images"

STYLE = ("POP ART COMIC STYLE, WARHOL STYLE, bold thick black outlines, "
         "halftone dots, Ben-Day dots effect, vibrant flat colors, graphic pop art, "
         "high contrast, saturated pop colors, retro comic, "
         "cute furry expressive cartoon animal style, big cute eyes, "
         "white background, simple centered composition")

articles = [
    ("aquarium-moos", f"Aquarium scene with green aquarium moss, java moss and christmas moss on driftwood, {STYLE}"),
    ("diskushaltung", f"Aquarium scene with a beautiful discus fish, colorful round flat disc-shaped tropical fish, {STYLE}"),
    ("garnelen-nachzucht", f"Aquarium scene with a female shrimp carrying eggs, baby shrimp swimming, breeding dwarf shrimp, {STYLE}"),
    ("panzerwelse", f"Aquarium scene with a cute corydoras catfish, armored catfish with whiskers on sandy bottom, {STYLE}"),
    ("quarantaene-becken", f"Aquarium scene with a small quarantine tank, isolation hospital tank, bare bottom with heater, {STYLE}"),
    ("salmler", f"Aquarium scene with a school of neon tetras, blue and red tropical fish swimming together, {STYLE}"),
    ("stein-arten", f"Aquarium scene with seiryu stone, dragon stone and lava rock hardscape, aquarium rocks arrangement, {STYLE}"),
    ("teppich-pflanzen", f"Aquarium scene with carpet plants, dwarf hairgrass, monte carlo forming green carpet, low foreground plants, {STYLE}"),
    ("wassertest-set", f"Aquarium scene with water test kit, liquid dropper test tubes for pH GH KH measurement, {STYLE}"),
    ("welse-antennenwels", f"Aquarium scene with a long-whiskered antenna catfish, ancistrus catfish on driftwood, {STYLE}"),
]

def submit(prompt):
    data = json.dumps({"model":"sdxl-realvis","prompt":prompt,"steps":25,"width":1216,"height":832}).encode()
    req = urllib.request.Request(f"{QUEUE}/generate", data=data, headers={"Content-Type":"application/json"})
    return json.loads(urllib.request.urlopen(req, timeout=30).read()).get("job_id")

def wait_for(job_id, timeout=540):
    start = time.time()
    for i in range(timeout // 3):
        time.sleep(3)
        try:
            r = json.loads(urllib.request.urlopen(f"{QUEUE}/status/{job_id}", timeout=10).read())
            if r.get("status") == "done" and r.get("output_path"):
                return r["output_path"]
            if r.get("status") in ("failed","timeout"):
                return None
        except: pass
        if i % 10 == 0 and i > 0:
            print(f"     ⏳ {int(time.time()-start)}s...", flush=True)
    return None

print(f"Regenerating {len(articles)} images (cron paused)...\n", flush=True)
done = 0
for i, (slug, prompt) in enumerate(articles, 1):
    print(f"[{i}/{len(articles)}] {slug}:", flush=True)
    jid = submit(prompt)
    print(f"  Job: {jid}", flush=True)
    path = wait_for(jid, timeout=540)
    if path:
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
        print(f"  OK {os.path.getsize(png)//1024}KB @ {img.size}", flush=True)
        done += 1
    else:
        print(f"  FAILED", flush=True)
    time.sleep(0.5)

print(f"\nFinished: {done}/{len(articles)}", flush=True)
