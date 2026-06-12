#!/usr/bin/env python3
"""
Generate all aquarium-zentrum article images via MiniMax API.
Style: Vibrant Pop Art Vector Illustration, bold black outlines, comic book style
"""
import os, sys, json, time, base64, requests as req
from PIL import Image
import io

API_KEY = "sk-cp-jJtHtO3tIl5hw2BmkFV1n7gVJisOCBfxD5_x80vTrIMzt78NPj-5qdpAUSsYaij0DiiYRWS5ZsOuMEGBapj1h1fpkwyELb840I70JW5e8NGIuSsPrk41VIg"
ENDPOINT = "https://api.minimax.io/v1/image_generation"
IMG_DIR = r"C:\hermesportable\home\spaces\aquarium-zentrum\images"

HEADERS = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}

POSITIVE_TEMPLATE = (
    "Vibrant Pop Art Vector Illustration of {subject}, "
    "bold black outlines, comic book style, highly saturated colors, "
    "clean vector shading, contemporary editorial illustration, "
    "graphic novel aesthetic, halftone details, retro-modern design"
)

SUBJECTS = {
    "algen-im-aquarium": "algae growing in a freshwater aquarium, green spots on glass and plants",
    "algenfresser-portrait": "algae-eating fish and shrimp in a planted aquarium",
    "antennenwels-l-welse-haltung": "bristlenose pleco catfish on driftwood in an aquarium",
    "aquarienpflanzen-anfaenger": "lush green aquarium plants for beginners, easy low-light species",
    "aquarium-automation": "smart automated aquarium with high-tech filter, LED lights, digital controller",
    "aquarium-beleuchtung-guide": "bright LED aquarium lighting over a planted tank, colorful light spectrum",
    "aquarium-duengung-guide": "aquarium plant fertilizers bottles and lush green aquatic plants",
    "aquarium-einfahren-nitritpeak": "cycling a new aquarium with test kits, nitrite spike measurement",
    "aquarium-filter-guide": "external canister filter and internal filter next to a glass aquarium",
    "aquarium-futter-ernaehrung": "various fish food types, flakes, pellets, frozen food",
    "aquarium-futterautomat-guide-2026": "automatic fish feeder mounted on an aquarium, scheduled feeding device",
    "aquarium-kamera-livestream": "camera and livestream setup pointing at an aquarium, underwater view on screen",
    "aquarium-luftpumpe-sauerstoff": "aquarium air pump with airstone producing bubbles in the water",
    "aquarium-moosarten": "various aquarium moss species on driftwood and rocks, green moss carpet",
    "aquarium-pflegeroutine-guide": "aquarium maintenance tools, algae scraper, gravel vacuum, bucket",
    "aquarium-schaedlinge": "aquarium pests, planaria flatworms and hydra on aquarium glass",
    "aquarium-technik-ueberblick": "technical equipment overview, filter, heater, light, CO2 system",
    "aquarium-umzug-transport-guide": "transporting an aquarium, moving tank with fish in plastic bags",
    "aquascaping-anfaenger": "aquascaped aquarium with rocks, driftwood, and carpet plants",
    "artemia-grindal-futtertiere-zuechten": "brine shrimp and microworms cultures, live food cultures",
    "aussenfilter-vs-innenfilter": "external canister filter vs internal power filter comparison",
    "beckenformen-groessen": "different aquarium shapes and sizes, cube, long, corner tank styles",
    "beliebteste-aquarienfische": "popular community aquarium fish species, neon tetras, guppies, mollies",
    "biotop-aquarium-amazonas-asien": "Amazon river biotope aquarium with sand, roots, and tetras",
    "biotop-aquarium-suedamerika": "South American biotope aquarium with amazon sword plants",
    "bodendecker-teppichpflanzen": "carpet plants in aquarium, dense green foreground plant carpet",
    "bodengrund-aquarium-guide": "aquarium substrate types, gravel, sand, aquasoil",
    "brackwasser-aquarium-guide": "brackish water aquarium with mangrove roots and archerfish",
    "co2-einsteiger-guide": "CO2 injection system for planted aquarium, diffuser and bubble counter",
    "co2-im-aquarium": "CO2 bubbles rising in a planted aquarium through glass diffuser",
    "diskushaltung-pflege": "discus fish in a planted aquarium, colorful discus swimming gracefully",
    "diy-aquarium-bauen": "building a DIY aquarium from glass panels with silicone seals",
    "einsteiger-aquarium-guide": "beginner aquarium setup with fish, plants, and basic equipment",
    "fischbesatz-nach-beckengroesse": "fish stocking chart for different aquarium sizes",
    "fische-fortgeschrittene": "advanced aquarium fish species, angelfish, discus",
    "fischkrankheiten-aquarium-guide": "aquarium fish showing disease symptoms, white spots",
    "futtertiere-selbst-zuechten": "culturing live food for aquarium fish, brine shrimp hatchery",
    "garnelen-im-aquarium": "red cherry shrimp on green moss in a planted aquarium",
    "garnelen-krankheiten": "dwarf shrimp with disease symptoms, bacterial infections",
    "garnelen-nachzucht": "breeding dwarf shrimp, baby shrimplets on moss in aquarium",
    "gesellschaftsbecken-einrichten": "community aquarium with mixed peaceful fish species",
    "heizung-temperatur-aquarium": "aquarium heater and thermometer, proper water temperature",
    "kaltwasser-aquarium-guide": "coldwater aquarium without heater, goldfish and temperate species",
    "kampffisch-haltung-betta": "beautiful male betta fish with flowing fins in planted aquarium",
    "lebendgebärende-zahnkarpfen": "livebearer fish, guppies and platys with colorful tails",
    "low-tech-aquarium-ohne-co2": "low-tech planted aquarium without CO2 injection",
    "meerwasser-aquarium-einstieg": "saltwater reef aquarium with colorful corals and clownfish",
    "nachzucht-fische": "breeding aquarium fish, fry in a breeding box, baby fish",
    "nano-aquarium-guide": "tiny nano aquarium on desk, 20-30 liters with mini fish",
    "osmoseanlage-wasseraufbereitung": "RO reverse osmosis water filter system for aquarium",
    "panzerwelse-aquarium": "corydoras catfish on aquarium gravel bottom, cute armored catfish",
    "pflanzenvermehrung-aquarium": "propagating aquarium plants, cutting stems and replanting",
    "quarantaene-medikamente": "quarantine tank with medications for treating sick fish",
    "rote-aquarienpflanzen": "red aquarium plants, alternanthera reineckii and rotala",
    "salmler-aquarium": "tetras and schooling fish swimming in planted aquarium display",
    "schnecken-im-aquarium": "aquarium snails on glass and plants, nerite and mystery snails",
    "steinarten-hardscape": "aquarium rocks and hardscape stones, dragon stone",
    "stroemung-im-aquarium": "water flow in aquarium, wavemaker and circulation pump",
    "stromausfall-aquarium-notfallplan": "power outage in aquarium, emergency battery air pump",
    "truebes-wasser-schaum-geruch-aquarium": "cloudy aquarium water with foam, poor water quality",
    "urlaub-aquarium-futterautomat": "vacation preparation for aquarium, automatic feeder",
    "uv-klaerer-aquarium-guide": "UV clarifier sterilizer unit for clear aquarium water",
    "vergesellschaftung-aquarienfische": "community tank with compatible fish species together",
    "wasseraufbereiter-aquarium-vergleich": "water conditioner bottles for aquarium, dechlorinator",
    "wassertest-wasserpflege": "water test kits for aquarium, testing pH, ammonia, nitrite",
    "wasserwerte-aquarium-guide": "aquarium water parameters chart, pH GH KH measurement tools",
    "welse-harnischwelse": "loricariid catfish, plecos and suckermouth catfish in aquarium",
    "wurzeln-holz-aquarium": "driftwood and roots in aquarium, natural wood decoration",
    "aquarium-urlaubsbetreuung-guide": "vacation care for aquarium, automatic feeder and timer",
}

def generate_one(slug, subject):
    """Generate one image via MiniMax and save as PNG + WEBP."""
    prompt = POSITIVE_TEMPLATE.replace("{subject}", subject)
    
    payload = {
        "model": "image-01",
        "prompt": prompt,
        "aspect_ratio": "16:9",
        "response_format": "base64"
    }
    
    try:
        resp = req.post(ENDPOINT, headers=HEADERS, json=payload, timeout=120)
        result = resp.json()
        
        if result.get('base_resp', {}).get('status_code') != 0:
            return False, f"API error: {result.get('base_resp', {}).get('status_msg')}"
        
        b64_list = result['data']['image_base64']
        img_bytes = base64.b64decode(b64_list[0])
        
        # Open with PIL
        img = Image.open(io.BytesIO(img_bytes))
        
        # Ensure RGB
        if img.mode == "RGBA":
            bg = Image.new("RGB", img.size, (255, 255, 255))
            bg.paste(img, mask=img.split()[3])
            img = bg
        
        # Resize to 1216x832 (same as before for consistency)
        img = img.resize((1216, 832), Image.LANCZOS)
        
        # Save as PNG
        png_path = os.path.join(IMG_DIR, f"{slug}.png")
        img.save(png_path, "PNG")
        
        # Save as WEBP (for artikel/index.html)
        webp_path = os.path.join(IMG_DIR, f"{slug}.webp")
        img.save(webp_path, "WEBP", quality=92)
        
        return True, f"PNG {os.path.getsize(png_path)//1024}KB / WEBP {os.path.getsize(webp_path)//1024}KB"
        
    except Exception as e:
        return False, str(e)

def main():
    os.makedirs(IMG_DIR, exist_ok=True)
    
    total = len(SUBJECTS)
    completed = 0
    failed = 0
    
    print(f"=== MiniMax Batch: {total} images ===\n")
    
    for i, (slug, subject) in enumerate(sorted(SUBJECTS.items()), 1):
        print(f"[{i}/{total}] {slug}...", end=" ", flush=True)
        
        ok, msg = generate_one(slug, subject)
        if ok:
            completed += 1
            print(f"✅ {msg}")
        else:
            failed += 1
            print(f"❌ {msg}")
        
        # Small delay between requests to avoid rate limits
        time.sleep(0.5)
    
    print(f"\n=== Done: {completed} success, {failed} failed ===")

if __name__ == "__main__":
    main()
