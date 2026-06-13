#!/usr/bin/env python3
"""
Generate all aquarium-zentrum article card images via local gen queue.
Style: Vibrant Pop Art Vector Illustration, bold black outlines, comic book style
"""
import os, sys, json, time, urllib.request, urllib.error

QUEUE = "http://127.0.0.1:8283"
IMG_DIR = r"C:\hermesportable\home\spaces\aquarium-zentrum\images"

POSITIVE_TEMPLATE = (
    "Vibrant Pop Art Vector Illustration of {subject}, "
    "bold black outlines, comic book style, highly saturated colors, "
    "clean vector shading, contemporary editorial illustration, "
    "graphic novel aesthetic, halftone details, retro-modern design"
)
NEGATIVE = "photorealistic, 3d render, blurry, low quality, watercolor, pastel, soft, dark, muddy"

# Slug -> English subject description
SUBJECTS = {
    "algen-im-aquarium": "algae growing in a freshwater aquarium, green spots on glass and plants",
    "algenfresser-portrait": "algae-eating fish and shrimp in a planted aquarium, siamese algae eater and otocinclus",
    "antennenwels-l-welse-haltung": "bristlenose pleco catfish on a piece of driftwood in an aquarium",
    "aquarienpflanzen-anfaenger": "lush green aquarium plants for beginners, easy low-light species",
    "aquarium-automation": "smart automated aquarium with high-tech filter, LED lights, and digital controller",
    "aquarium-beleuchtung-guide": "bright LED aquarium lighting over a planted tank, colorful light spectrum",
    "aquarium-duengung-guide": "aquarium plant fertilizers bottles and lush green aquatic plants",
    "aquarium-einfahren-nitritpeak": "cycling a new aquarium with test kits, nitrite spike measurement",
    "aquarium-filter-guide": "external canister filter and internal filter next to a glass aquarium",
    "aquarium-futter-ernaehrung": "various fish food types, flakes, pellets, frozen food for aquarium fish",
    "aquarium-futterautomat-guide-2026": "automatic fish feeder mounted on an aquarium, scheduled feeding device",
    "aquarium-kamera-livestream": "camera and livestream setup pointing at an aquarium, underwater view on screen",
    "aquarium-luftpumpe-sauerstoff": "aquarium air pump with airstone producing bubbles in the water",
    "aquarium-moosarten": "various aquarium moss species on driftwood and rocks, green moss carpet",
    "aquarium-pflegeroutine-guide": "aquarium maintenance tools, algae scraper, gravel vacuum, bucket",
    "aquarium-schaedlinge": "aquarium pests, planaria flatworms and hydra on aquarium glass",
    "aquarium-technik-ueberblick": "aquarium technical equipment overview, filter, heater, light, CO2 system",
    "aquarium-umzug-transport-guide": "transporting an aquarium, moving tank with fish in plastic bags",
    "aquascaping-anfaenger": "aquascaped aquarium with rocks, driftwood, and carpet plants, nature style",
    "artemia-grindal-futtertiere-zuechten": "brine shrimp and microworms cultures, live food cultures for fish",
    "aussenfilter-vs-innenfilter": "external canister filter vs internal power filter comparison for aquariums",
    "beckenformen-groessen": "different aquarium shapes and sizes, cube, long, corner tank styles",
    "beliebteste-aquarienfische": "popular community aquarium fish species, neon tetras, guppies, mollies",
    "biotop-aquarium-amazonas-asien": "Amazon river biotope aquarium with sand, roots, and tetras",
    "biotop-aquarium-suedamerika": "South American biotope aquarium with amazon sword plants and angelfish",
    "bodendecker-teppichpflanzen": "carpet plants in aquarium, dense green foreground plant carpet",
    "bodengrund-aquarium-guide": "aquarium substrate types, gravel, sand, aquasoil, planted tank substrate",
    "brackwasser-aquarium-guide": "brackish water aquarium with mangrove roots and archerfish",
    "co2-einsteiger-guide": "CO2 injection system for planted aquarium, diffuser and bubble counter",
    "co2-im-aquarium": "CO2 bubbles rising in a planted aquarium through glass diffuser",
    "diskushaltung-pflege": "discus fish in a planted aquarium, colorful discus swimming gracefully",
    "diy-aquarium-bauen": "building a DIY aquarium from glass panels with silicone seals",
    "einsteiger-aquarium-guide": "beginner aquarium setup with fish, plants, and basic equipment",
    "fischbesatz-nach-beckengroesse": "fish stocking chart for different aquarium sizes, 60L 100L 200L",
    "fische-fortgeschrittene": "advanced aquarium fish species, angelfish, discus, and dwarf cichlids",
    "fischkrankheiten-aquarium-guide": "aquarium fish showing disease symptoms, white spots and fin rot",
    "futtertiere-selbst-zuechten": "culturing live food for aquarium fish, brine shrimp hatchery",
    "garnelen-im-aquarium": "red cherry shrimp on green moss in a planted aquarium",
    "garnelen-krankheiten": "dwarf shrimp with disease symptoms, bacterial and parasitic infections",
    "garnelen-nachzucht": "breeding dwarf shrimp, baby shrimplets on moss in aquarium",
    "gesellschaftsbecken-einrichten": "community aquarium with mixed peaceful fish species and plants",
    "heizung-temperatur-aquarium": "aquarium heater and thermometer, proper water temperature setup",
    "kaltwasser-aquarium-guide": "coldwater aquarium without heater, goldfish and temperate species",
    "kampffisch-haltung-betta": "beautiful male betta fish with flowing fins in planted aquarium",
    "lebendgebärende-zahnkarpfen": "livebearer fish, guppies and platys with colorful tails in aquarium",
    "low-tech-aquarium-ohne-co2": "low-tech planted aquarium without CO2 injection, easy plants",
    "meerwasser-aquarium-einstieg": "saltwater reef aquarium with colorful corals and clownfish",
    "nachzucht-fische": "breeding aquarium fish, fry in a breeding box, baby fish",
    "nano-aquarium-guide": "tiny nano aquarium on desk, 20-30 liters with mini fish and plants",
    "osmoseanlage-wasseraufbereitung": "RO reverse osmosis water filter system for aquarium water",
    "panzerwelse-aquarium": "corydoras catfish on aquarium gravel bottom, cute armored catfish",
    "pflanzenvermehrung-aquarium": "propagating aquarium plants, cutting stems and replanting",
    "quarantaene-medikamente": "quarantine tank with medications for treating sick aquarium fish",
    "rote-aquarienpflanzen": "red aquarium plants, alternanthera reineckii and rotala wallichii",
    "salmler-aquarium": "tetras and schooling fish swimming in planted aquarium display",
    "schnecken-im-aquarium": "aquarium snails on glass and plants, nerite and mystery snails",
    "steinarten-hardscape": "aquarium rocks and hardscape stones, dragon stone and seiryu stone",
    "stroemung-im-aquarium": "water flow in aquarium, wavemaker and circulation pump setup",
    "stromausfall-aquarium-notfallplan": "power outage in aquarium, emergency battery air pump backup",
    "truebes-wasser-schaum-geruch-aquarium": "cloudy aquarium water with foam, poor water quality issues",
    "urlaub-aquarium-futterautomat": "vacation preparation for aquarium, automatic feeder and timer",
    "uv-klaerer-aquarium-guide": "UV clarifier sterilizer unit for clear aquarium water",
    "vergesellschaftung-aquarienfische": "community tank with compatible fish species swimming together",
    "wasseraufbereiter-aquarium-vergleich": "water conditioner bottles for aquarium, dechlorinator products",
    "wassertest-wasserpflege": "water test kits for aquarium, testing pH, ammonia, nitrite, nitrate",
    "wasserwerte-aquarium-guide": "aquarium water parameters chart, pH GH KH measurement tools",
    "welse-harnischwelse": "loricariid catfish, plecos and suckermouth catfish in aquarium",
    "wurzeln-holz-aquarium": "driftwood and roots in aquarium, natural wood decoration",
    "aquarium-umzug-transport-guide": "transporting an aquarium, moving tank with fish in plastic bags",
    "bucephalandra-anubias-javafarn": "bucephalandra, anubias and java fern plants on driftwood",
    "iwagumi-aquascape-guide": "iwagumi style aquascape with arranged stones and green carpet plants",
}

def submit_job(slug, subject):
    """Submit a single image generation job to the queue."""
    prompt = POSITIVE_TEMPLATE.replace("{subject}", subject)
    data = json.dumps({
        "model": "sdxl-lightning",
        "prompt": prompt,
        "negative": NEGATIVE,
        "steps": 8,
        "cfg": 2.0,
        "width": 1216,
        "height": 832,
        "seed": -1,
    }).encode()
    req = urllib.request.Request(f"{QUEUE}/generate", data=data,
        headers={"Content-Type": "application/json"})
    try:
        resp = json.loads(urllib.request.urlopen(req, timeout=30).read())
        return resp.get("job_id")
    except Exception as e:
        print(f"  ❌ Submit failed: {e}")
        return None

def wait_for(job_id, slug, timeout=300):
    """Wait for job completion and return output path."""
    for i in range(timeout // 3):
        time.sleep(3)
        try:
            resp = json.loads(
                urllib.request.urlopen(f"{QUEUE}/status/{job_id}", timeout=10).read())
        except Exception as e:
            print(f"  ⚠️  Status error for {slug}: {e}")
            continue
        st = resp.get("status")
        if st == "done" and resp.get("output_path"):
            return resp["output_path"], resp.get("seed")
        if st == "failed":
            print(f"  ❌ Job {job_id} ({slug}) failed: {resp.get('error', 'unknown')}")
            return None, None
    print(f"  ⏰ Timeout for {slug}")
    return None, None

def process_output(src_path, slug):
    """Copy, resize to 1216x832 and save as PNG and WEBP."""
    try:
        from PIL import Image
        img = Image.open(src_path)
        if img.mode == "RGBA":
            bg = Image.new("RGB", img.size, (255, 255, 255))
            bg.paste(img, mask=img.split()[3])
            img = bg
        img = img.resize((1216, 832), Image.LANCZOS)
        # Save as PNG
        png_path = os.path.join(IMG_DIR, f"{slug}.png")
        img.save(png_path, "PNG")
        # Save as WEBP
        webp_path = os.path.join(IMG_DIR, f"{slug}.webp")
        img.save(webp_path, "WEBP", quality=92)
        return True
    except Exception as e:
        print(f"  ❌ Processing failed for {slug}: {e}")
        return False

def main():
    print(f"=== Aquarium-Zentrum Batch Image Generation ===")
    print(f"Style: Vibrant Pop Art Vector / Comic")
    print(f"Total jobs: {len(SUBJECTS)}\n")
    
    # Check queue health
    try:
        health = json.loads(urllib.request.urlopen(f"{QUEUE}/health", timeout=5).read())
        print(f"Queue: {health.get('pending', 0)} pending, "
              f"{health.get('completed', 0)} completed, "
              f"VRAM: {health.get('vram_mb', '?')} MB\n")
    except Exception as e:
        print(f"❌ Queue unreachable: {e}")
        return
    
    results = {}
    completed = 0
    failed = 0
    
    for s, subject in sorted(SUBJECTS.items()):
        print(f"[{completed+1}/{len(SUBJECTS)}] {s}...", end=" ", flush=True)
        
        job_id = submit_job(s, subject)
        if not job_id:
            failed += 1
            results[s] = "submit_failed"
            print("❌ submit failed")
            continue
        
        print(f"job={job_id}", end=" ", flush=True)
        output_path, seed = wait_for(job_id, s)
        if not output_path:
            failed += 1
            results[s] = "generation_failed"
            print("❌ generation failed")
            continue
        
        ok = process_output(output_path, s)
        if ok:
            completed += 1
            results[s] = f"done (seed={seed})"
            print(f"✅ seed={seed}")
        else:
            failed += 1
            results[s] = "processing_failed"
            print("❌ processing failed")
    
    print(f"\n=== Summary ===")
    print(f"Completed: {completed}/{len(SUBJECTS)}")
    print(f"Failed: {failed}")
    
    # Save results
    result_path = os.path.join(IMG_DIR, "..", "data", "image_gen_results.json")
    with open(result_path, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    print(f"Results saved to {result_path}")

if __name__ == "__main__":
    main()
