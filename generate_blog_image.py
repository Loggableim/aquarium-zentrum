#!/usr/bin/env python3
"""Generate hero image for ONE blog article.
   Usage: python generate_blog_image.py <slug> "<prompt>"

   Submits to the local image queue (http://127.0.0.1:8283),
   waits for completion, copies output to images/<slug>.png
   and creates a .webp version (1216x832).
"""
import json
import os
import re
import shutil
import sys
import time
import urllib.request
from PIL import Image

QUEUE = "http://127.0.0.1:8283"
IMG_DIR = "C:/aquarium-zentrum/images"

# Pop-Art / Warhole style as required by the project
STYLE_SUFFIX = (
    "POP ART COMIC STYLE, WARHOL STYLE, bold thick black outlines, "
    "halftone dots, Ben-Day dots effect, vibrant flat colors, graphic pop art, "
    "high contrast, saturated pop colors, retro comic, "
    "cute furry expressive cartoon animal style, big cute eyes, "
    "white background, simple centered composition"
)


def submit(slug, prompt):
    data = json.dumps({
        "model": "sdxl-realvis",
        "prompt": prompt,
        "steps": 25,
        "width": 1216,
        "height": 832,
    }).encode()
    req = urllib.request.Request(
        f"{QUEUE}/generate", data=data,
        headers={"Content-Type": "application/json"},
    )
    resp = json.loads(urllib.request.urlopen(req, timeout=30).read())
    return resp.get("job_id")


def wait_for(job_id, timeout=400):
    start = time.time()
    for i in range(timeout):
        time.sleep(2)
        try:
            resp = json.loads(
                urllib.request.urlopen(f"{QUEUE}/status/{job_id}", timeout=10).read()
            )
            st = resp.get("status")
            if st == "done" and resp.get("output_path"):
                return resp["output_path"]
            if st == "failed":
                err = resp.get("error", "")
                m = re.search(r'"output_path": "([^"]+)"', err)
                if m:
                    return m.group(1)
                print(f"  ❌ Job failed: {err[:200]}", file=sys.stderr)
                return None
        except Exception:
            pass
        if i % 10 == 0 and i > 0:
            elapsed = int(time.time() - start)
            print(f"  ⏳ {elapsed}s waiting...", file=sys.stderr)
    print("  ⏰ Timed out", file=sys.stderr)
    return None


def process_output(slug, path):
    path = path.replace("\\", "/")
    os.makedirs(IMG_DIR, exist_ok=True)
    png_dst = os.path.join(IMG_DIR, f"{slug}.png")
    webp_dst = os.path.join(IMG_DIR, f"{slug}.webp")
    shutil.copy2(path, png_dst)
    img = Image.open(png_dst)
    if img.mode == "RGBA":
        bg = Image.new("RGB", img.size, (255, 255, 255))
        bg.paste(img, mask=img.split()[3])
        img = bg
    if img.size != (1216, 832):
        img = img.resize((1216, 832), Image.LANCZOS)
        img.save(png_dst, "PNG")
    img.save(webp_dst, "WEBP", quality=85)
    kb_png = os.path.getsize(png_dst) // 1024
    kb_webp = os.path.getsize(webp_dst) // 1024
    print(f"✅ {slug}: {kb_png}KB PNG / {kb_webp}KB WEBP @ {img.size[0]}x{img.size[1]}")


def main():
    if len(sys.argv) < 3:
        print("Usage: python generate_blog_image.py <slug> \"<prompt>\"", file=sys.stderr)
        sys.exit(1)
    slug = sys.argv[1]
    prompt = sys.argv[2]
    # Append the project style suffix if not already included
    if "POP ART" not in prompt.upper():
        prompt = f"{prompt}, {STYLE_SUFFIX}"
    print(f"⏳ Submitting job for slug={slug}")
    job_id = submit(slug, prompt)
    if not job_id:
        print("❌ Failed to submit job", file=sys.stderr)
        sys.exit(1)
    print(f"  → job_id={job_id}")
    out = wait_for(job_id)
    if not out:
        print(f"❌ Image generation failed for {slug}", file=sys.stderr)
        sys.exit(2)
    process_output(slug, out)


if __name__ == "__main__":
    main()
