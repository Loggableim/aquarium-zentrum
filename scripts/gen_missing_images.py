#!/usr/bin/env python3
"""Generate the 3 missing hero images for aquarium-zentrum via local SDXL queue."""
import os, sys, json, time, urllib.request, urllib.error
from PIL import Image
import io

QUEUE = "http://127.0.0.1:8283"
IMG_DIR = r"C:\hermesportable\home\spaces\aquarium-zentrum\images"

POSITIVE = (
    "Vibrant Pop Art Vector Illustration of {subject}, "
    "bold black outlines, comic book style, highly saturated colors, "
    "clean vector shading, contemporary editorial illustration, "
    "graphic novel aesthetic, halftone details, retro-modern design"
)
NEGATIVE = "photorealistic, 3d render, blurry, low quality, watercolor, pastel, soft, dark, muddy"

SUBJECTS = {
    "aquarium-umzug-transport-guide": "transporting an aquarium, moving tank with fish in plastic bags",
    "bucephalandra-anubias-javafarn": "bucephalandra, anubias and java fern plants growing on driftwood in an aquarium",
    "iwagumi-aquascape-guide": "iwagumi style aquascape with arranged stones, minimalistic layout, green carpet plants",
}

def submit(slug, subject):
    prompt = POSITIVE.replace("{subject}", subject)
    payload = json.dumps({
        "model": "sdxl-lightning",
        "prompt": prompt,
        "negative": NEGATIVE,
        "steps": 8,
        "cfg": 2.0,
        "width": 1216,
        "height": 832,
    }).encode()
    req = urllib.request.Request(
        f"{QUEUE}/generate",
        data=payload,
        headers={"Content-Type": "application/json"}
    )
    resp = json.loads(urllib.request.urlopen(req, timeout=30).read())
    job_id = resp.get("job_id")
    if not job_id:
        raise RuntimeError(f"No job_id: {resp}")
    return job_id

def wait_for(job_id, timeout=300):
    for i in range(timeout // 3):
        time.sleep(3)
        try:
            resp = json.loads(
                urllib.request.urlopen(f"{QUEUE}/status/{job_id}", timeout=10).read()
            )
            st = resp.get("status")
            if st == "done" and resp.get("output_path"):
                return resp["output_path"]
            if st == "failed":
                return None
        except Exception:
            continue
    return None

def process(slug, src_path):
    img = Image.open(src_path)
    if img.mode == "RGBA":
        bg = Image.new("RGB", img.size, (255, 255, 255))
        bg.paste(img, mask=img.split()[3])
        img = bg
    img = img.resize((1216, 832), Image.LANCZOS)
    png_path = os.path.join(IMG_DIR, f"{slug}.png")
    webp_path = os.path.join(IMG_DIR, f"{slug}.webp")
    img.save(png_path, "PNG")
    img.save(webp_path, "WEBP", quality=92)
    return png_path, webp_path

def main():
    print(f"=== Generating {len(SUBJECTS)} images via SDXL Queue ===\n")
    for slug, subject in sorted(SUBJECTS.items()):
        print(f"[→] {slug}...", end=" ", flush=True)
        try:
            job_id = submit(slug, subject)
            out_path = wait_for(job_id)
            if out_path:
                png, webp = process(slug, out_path)
                png_size = os.path.getsize(png) // 1024
                webp_size = os.path.getsize(webp) // 1024
                print(f"✅ PNG {png_size}KB / WEBP {webp_size}KB")
            else:
                print(f"❌ Queue failed")
        except Exception as e:
            print(f"❌ {e}")
        # cooldown between jobs
        if slug != list(SUBJECTS.keys())[-1]:
            time.sleep(1)
    print("\n=== Done ===")

if __name__ == "__main__":
    main()
