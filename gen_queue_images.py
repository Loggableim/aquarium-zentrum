#!/usr/bin/env python3
"""Generate proper SDXL images for all missing/broken aquarium article images via queue server."""
import json, urllib.request, time, os, re, sys
from PIL import Image

QUEUE_URL = "http://127.0.0.1:8283/generate"
STATUS_URL = "http://127.0.0.1:8283/status/"
IMG_DIR = "C:/HermesPortable/home/spaces/aquarium-zentrum/images"
OUTPUT_DIR = "C:/Users/logga/gen_queue_outputs"

def queue(prompt):
    data = json.dumps({"model": "sdxl-lightning", "prompt": prompt, "steps": 4}).encode()
    req = urllib.request.Request(QUEUE_URL, data=data, headers={"Content-Type": "application/json"})
    resp = json.loads(urllib.request.urlopen(req, timeout=30).read())
    return resp.get("job_id")

def wait_for(job_id, timeout=300):
    for _ in range(timeout):
        time.sleep(3)
        try:
            resp = json.loads(urllib.request.urlopen(STATUS_URL + job_id, timeout=10).read())
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
    return None

articles = [
    ("aquarium-umzug-transport-guide", "cute aquarium cartoon illustration, fish inside plastic bag being carried during aquarium move, cheerful underwater scene, bold colorful digital art, bright vibrant colors, clean white background, flat vector style, cute character design, playful aquatic theme"),
    ("antennenwels-l-welse-haltung", "cute cartoon aquarium illustration, funny catfish with long whiskers (antennenwels) swimming in planted aquarium, colorful bold digital art, bright colors, clean white background, flat vector illustration style"),
    ("truebes-wasser-schaum-geruch-aquarium", "cute cartoon aquarium illustration, cloudy green murky water with worried fish peeking through, funny water quality problem scene, bold digital art, bright colors, clean white background"),
    ("lebendgebaerende-zahnkarpfen", "cute cartoon aquarium illustration, colorful guppy fish with big tails swimming happily, livebearer fish family, bold bright digital art, white background, flat vector style"),
    ("aquarium-standort-unterschrank", "cute cartoon illustration, wooden aquarium stand cabinet with fish tank on top, stable furniture, room setting, bold colorful digital art, white background"),
    ("krebse-krabben-aquarium-guide-2026", "cute cartoon aquarium illustration, funny little red crab and crayfish on aquarium gravel, crustacean characters, bold colorful digital art, white background, flat vector style"),
    ("skalare-haltung-pflege", "cute cartoon aquarium illustration, elegant angelfish with long flowing fins swimming in planted aquarium, beautiful tropical fish, bold digital art, bright colors, white background"),
    ("fadenfische-guramis-haltung", "cute cartoon aquarium illustration, colorful gourami fish with long thread-like fins, swimming gracefully, tropical fish, bold digital art, bright colors, white background"),
    ("buntbarsche-cichliden-aquarium", "cute cartoon aquarium illustration, colorful cichlid fish with bright blue and orange colors, tropical fish scene, bold digital art, bright vibrant colors, white background"),
    ("schwimmpflanzen-aquarium", "cute cartoon aquarium illustration, floating plants on water surface like frogbit and duckweed, green leaves, underwater roots visible, bold digital art, white background"),
    ("aquarium-schaedlinge", "cute cartoon aquarium illustration, tiny planaria and hydra on aquarium glass, microscopic pests, funny small creatures, bold colorful digital art, white background"),
    ("beliebteste-aquarienfische", "cute cartoon aquarium illustration, group of colorful popular aquarium fish together, neon tetra, guppy, molly, platy, corydoras, bold digital art, bright vibrant colors, white background"),
    ("nano-aquarium-guide", "cute cartoon aquarium illustration, tiny mini nano aquarium bowl with small fish and tiny plants, miniature underwater world, bold digital art, bright colors, white background"),
    ("aquarium-automation", "cute cartoon aquarium illustration, smart aquarium technology, automatic fish feeder with timer, wifi controller, filter pump, modern gadgets, bold digital art, white background"),
]

print(f"Generating {len(articles)} images via SDXL Queue...\n")

for slug, prompt in articles:
    try:
        jid = queue(prompt)
        print(f"  ⏳ {slug} → {jid}")
        path = wait_for(jid)
        if path:
            path = path.replace("\\", "/")
            print(f"  ✅ {slug} → {os.path.basename(path)}")
            
            # Copy to project
            png_src = path
            png_dst = os.path.join(IMG_DIR, f"{slug}.png")
            webp_dst = os.path.join(IMG_DIR, f"{slug}.webp")
            
            import shutil
            shutil.copy2(png_src, png_dst)
            
            # Convert to webp
            img = Image.open(png_dst)
            if img.mode == 'RGBA':
                bg = Image.new('RGB', img.size, (255, 255, 255))
                bg.paste(img, mask=img.split()[3])
                img = bg
            img.save(webp_dst, 'WEBP', quality=85)
            
            sz_png = os.path.getsize(png_dst) // 1024
            sz_webp = os.path.getsize(webp_dst) // 1024
            print(f"     → {sz_png}KB PNG / {sz_webp}KB WEBP ✓")
        else:
            print(f"  ⚠️  {slug}: timeout / kein output")
    except Exception as e:
        print(f"  ❌ {slug}: {e}")

print("\n✅ ALL DONE")
