#!/usr/bin/env python3
"""
IndexNow Submit — Pushed alle Sitemap-URLs an IndexNow (Bing, Yandex).
Wiederverwendbar nach jedem Content-Update oder Deploy.

Usage:
    python scripts/indexnow_submit.py              # Alle URLs aus sitemap.xml
    python scripts/indexnow_submit.py --url https://aquaristik-zentrum.com/artikel/neuer-artikel/  # Einzelne URL
"""
import os, re, json, sys, urllib.request, ssl

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONFIG_PATH = os.path.join(BASE_DIR, "indexnow.json")
SITEMAP_PATH = os.path.join(BASE_DIR, "sitemap.xml")

def load_config():
    if not os.path.exists(CONFIG_PATH):
        print("✗ Keine indexnow.json gefunden. Führe erstmalige Einrichtung durch.")
        sys.exit(1)
    with open(CONFIG_PATH, 'r') as f:
        return json.load(f)

def get_urls_from_sitemap():
    with open(SITEMAP_PATH, 'r', encoding='utf-8') as f:
        sitemap = f.read()
    return re.findall(r'<loc>([^<]+)</loc>', sitemap)

def submit_to_indexnow(urls, config):
    payload = {
        "host": config["host"],
        "key": config["key"],
        "keyLocation": f"https://{config['host']}/{config['key_file']}",
        "urlList": urls
    }
    payload_json = json.dumps(payload, indent=2)
    ctx = ssl.create_default_context()
    
    results = []
    for endpoint in config["endpoints"]:
        try:
            req = urllib.request.Request(
                endpoint,
                data=payload_json.encode('utf-8'),
                headers={
                    "Content-Type": "application/json; charset=utf-8",
                    "User-Agent": f"Mozilla/5.0 (compatible; {config['host']}/1.0)"
                },
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=15, context=ctx) as resp:
                results.append((endpoint, resp.status, "OK"))
                print(f"  ✓ {endpoint} → HTTP {resp.status}")
        except urllib.error.HTTPError as e:
            results.append((endpoint, e.code, str(e.reason)))
            print(f"  ⚠ {endpoint} → HTTP {e.code}: {e.reason}")
        except Exception as e:
            results.append((endpoint, 0, str(e)))
            print(f"  ✗ {endpoint} → ERROR: {e}")
    
    return results

def main():
    config = load_config()
    
    if '--url' in sys.argv:
        idx = sys.argv.index('--url')
        if idx + 1 < len(sys.argv):
            urls = [sys.argv[idx + 1]]
            print(f"IndexNow: 1 URL wird gepusht")
        else:
            print("✗ --url benötigt einen Wert")
            sys.exit(1)
    else:
        urls = get_urls_from_sitemap()
        print(f"IndexNow: {len(urls)} URLs aus sitemap.xml werden gepusst")
    
    print(f"Key: {config['key'][:8]}...")
    print(f"Key-Datei: {config['key_file']}")
    print()
    
    results = submit_to_indexnow(urls, config)
    
    # Config aktualisieren
    import datetime
    config["last_submission"] = {
        "urls": len(urls),
        "timestamp": datetime.datetime.now().isoformat(),
        "results": [{"endpoint": e, "status": s, "msg": m} for e, s, m in results]
    }
    with open(CONFIG_PATH, 'w') as f:
        json.dump(config, f, indent=2)
    
    success = sum(1 for _, s, _ in results if 200 <= s < 300)
    print(f"\n{'✅' if success > 0 else '⚠'} {success}/{len(results)} Endpoints akzeptiert")

if __name__ == "__main__":
    main()
