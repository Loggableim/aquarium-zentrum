#!/usr/bin/env python3
"""Generate article images via ComfyUI with correct RealVisXL + Pop Art Furry Comic style."""
import json, urllib.request, time, os, re, sys
from PIL import Image

COMFY = "http://127.0.0.1:8188"
IMG_DIR = "C:/HermesPortable/home/spaces/aquarium-zentrum/images"
OUT_DIR = "C:/HermesPortable/ComfyUI/output"

STYLE = "POP ART COMIC STYLE, WARHOL STYLE, bold thick black outlines, halftone dots, Ben-Day dots effect, vibrant flat colors, graphic pop art, high contrast, saturated pop colors, retro comic, cute furry expressive cartoon style"
NEG = "photorealistic, realistic, 3d render, photograph, shadow, gradient, blurry, low quality, grainy, dark, gloomy, oversaturated, ugly, deformed, text, watermark"

articles = [
    ("aquarium-umzug-transport-guide", "cute furry fish character with big eyes being moved in a transparent bag, moving truck background, anxious but hopeful expression, cartoon aquarium scene"),
    ("antennenwels-l-welse-haltung", "cute furry catfish character with long whiskers, big smiling eyes, swimming in planted aquarium, expressive cartoon face, aquatic plants"),
    ("truebes-wasser-schaum-geruch-aquarium", "cute furry fish characters looking worried in cloudy green aquarium water with bubbles, water quality problem, expressive cartoon faces"),
    ("lebendgebaerende-zahnkarpfen", "cute furry guppy fish family, colorful flowing tails like dresses, big eyes, daddy mommy and baby fish swimming together, vibrant pop colors"),
    ("aquarium-standort-unterschrank", "cute furry fish peeking from glass aquarium on wooden cabinet stand, cozy room setting, happy pet fish at home, expressive cartoon"),
    ("krebse-krabben-aquarium-guide-2026", "two cute furry crustacean characters, red crab with big claws and crayfish friend, big expressive eyes, on aquarium gravel, funny cartoon"),
    ("skalare-haltung-pflege", "cute furry angelfish character with elegant long fins like angel wings, big expressive eyes, swimming gracefully in planted aquarium"),
    ("fadenfische-guramis-haltung", "cute furry gourami fish character with long flowing thread-like fins, big smiling eyes, colorful tropical colors, swimming gracefully"),
    ("buntbarsche-cichliden-aquarium", "two cute furry cichlid fish characters with bright blue and orange colors, expressive faces facing each other, tropical aquarium scene"),
    ("schwimmpflanzen-aquarium", "cute furry tiny fish hiding under floating green plants on aquarium water surface, duckweed and frogbit, cartoon plants, expressive eyes"),
    ("aquarium-schaedlinge", "cute furry tiny planaria and hydra characters on aquarium glass, microscopic cute pests with big eyes, funny cartoon creatures"),
    ("beliebteste-aquarienfische", "cute furry fish character group portrait, neon tetra guppy molly betta corydoras together in row, big eyes colorful, family photo style, each distinct"),
    ("nano-aquarium-guide", "cute furry tiny fish in mini nano aquarium bowl, small scale underwater world with miniature plants, big adorable eyes, tiny scale"),
    ("aquarium-automation", "cute furry fish character using smartphone and tablet, smart aquarium gadgets around, automatic fish feeder, tech fish, funny cartoon"),
]

def queue_comfy(prompt_text):
    """Send prompt to ComfyUI via API and return job_id."""
    workflow = json.load(open(os.path.join(os.path.dirname(__file__) or '.', 'realvis_workflow_api.json')))
    workflow["6"]["inputs"]["text"] = prompt_text
    workflow["7"]["inputs"]["text"] = NEG
    workflow["3"]["inputs"]["seed"] = int(time.time()) % 1000000
    
    body = json.dumps({"prompt": workflow}).encode()
    req = urllib.request.Request(COMFY + "/prompt", data=body, headers={"Content-Type": "application/json"})
    resp = json.loads(urllib.request.urlopen(req, timeout=30).read())
    return resp.get("prompt_id")

def wait_comfy(prompt_id, timeout=300):
    """Wait for prompt to complete and return output filenames."""
    history_url = COMFY + "/history/" + prompt_id
    for _ in range(timeout):
        time.sleep(3)
        try:
            req = urllib.request.Request(history_url)
            history = json.loads(urllib.request.urlopen(req, timeout=10).read())
            if prompt_id in history:
                outputs = history[prompt_id].get("outputs", {})
                for node_id, node_out in outputs.items():
                    for img_data in node_out.get("images", []):
                        yield img_data["filename"], img_data.get("subfolder", "")
                return
        except:
            pass
    raise TimeoutError(f"Prompt {prompt_id} timed out")

for slug, subject in articles:
    prompt_text = f"{STYLE}, {subject}, clean white background, simple centered composition"
    
    try:
        # Wait for queue to be free
        for _ in range(60):
            q = json.loads(urllib.request.urlopen(COMFY + "/queue", timeout=5).read())
            if not q.get("queue_running"):
                break
            time.sleep(3)
        
        pid = queue_comfy(prompt_text)
        print(f"  ⏳ {slug} → {pid[:12]}...", end=" ", flush=True)
        
        for filename, subfolder in wait_comfy(pid):
            src = os.path.join(OUT_DIR, subfolder, filename)
            if os.path.exists(src):
                dst_png = os.path.join(IMG_DIR, f"{slug}.png")
                dst_webp = os.path.join(IMG_DIR, f"{slug}.webp")
                import shutil
                shutil.copy2(src, dst_png)
                img = Image.open(dst_png)
                if img.mode == 'RGBA':
                    bg = Image.new('RGB', img.size, (255, 255, 255))
                    bg.paste(img, mask=img.split()[3])
                    img = bg
                img.save(dst_webp, 'WEBP', quality=85)
                sz = os.path.getsize(dst_png)//1024
                print(f"✅ {sz}KB")
            else:
                print(f"❌ output not found: {src}")
    except Exception as e:
        print(f"❌ {e}")

print("\n✅ ALL DONE")
