#!/usr/bin/env python3
"""Ping an aquarium-zentrum space agent: new article request."""
import json
import urllib.request
import time

BASE = "http://localhost:8787"
SLUG = "aquarium-zentrum"
WS = f"C:/HermesPortable/home/spaces/{SLUG}"

# 1) Neue Session erstellen
req = urllib.request.Request(
    f"{BASE}/api/session/new",
    data=json.dumps({"workspace": WS, "model": "deepseek-v4-flash"}).encode(),
    headers={
        "Content-Type": "application/json",
        "X-Hermes-Workspace": SLUG,  # PFLICHT
    },
)
resp = json.loads(urllib.request.urlopen(req).read())
sid = resp["session"]["session_id"]
print(f"SESSION_ID={sid}")

# 2) Auftrag senden (PING)
AUFTRAG = (
    "Erstelle einen neuen hochwertigen deutschen Blog-Artikel für Aquaristik-Zentrum "
    "(aquaristik-zentrum.com) zum Thema:\n\n"
    "**\"Aquarium Futterautomat: Die besten Modelle 2026, Einrichtung und Futtertipps\"**\n\n"
    "Kontext/Anforderungen:\n"
    f"- Repo: C:/HermesPortable/home/scripts/blog-automation/{SLUG}\n"
    "- Prüfe zuerst bestehende Artikel in artikel/ (besonders aquarium-futter-ernaehrung.html) und "
    "kopiere Struktur/Design/Template von einem existierenden aktuellen Artikel (z.B. uv-c-klaerer-aquarium-entkeimung.html).\n"
    "- Neuer Artikel als saubere HTML-Datei unter artikel/ mit passendem Slug, z.B. "
    "aquarium-futterautomat-guide-2026.html\n"
    "- Ziel: SEO-starker Ratgeberartikel für Aquaristik-Einsteiger und Fortgeschrittene.\n"
    "- Inhalt: mindestens ca. 1.500 Wörter, klare H2/H3-Struktur, Vergleichstabelle "
    "(Futterautomaten-Modelle 2026: Eheim, JBL, Dennerle, Sera etc.), Praxis-Tipps, FAQ.\n"
    "- Muss enthalten: JSON-LD BlogPosting, Open Graph Tags, Canonical URL, Meta Description.\n"
    "- Monetarisierung: Amazon DE Affiliate-Links mit tag=nova079-20 wo passend (Futterautomaten, "
    "Futterdosen, Fischnahrung) plus AdSense-Placeholder im Stil bestehender Artikel.\n"
    "- Datum für neuen Artikel: 15. Juni 2026.\n"
    "- Sitemap/Index/Navigation aktualisieren, falls im Projekt üblich "
    "(nach build.js, in artikel/index.html eintragen).\n"
    "- Danach git status prüfen, git commit mit aussagekräftiger Message und git push ausführen.\n"
    "- Antworte am Ende mit kurzer Zusammenfassung: Datei, Thema, Commit-Hash, Push-Status.\n\n"
    "Verwende das Framework unter C:/HermesPortable/home/scripts/blog-automation/_framework/ wie in AGENTS.md beschrieben."
)

req2 = urllib.request.Request(
    f"{BASE}/api/chat/start",
    data=json.dumps({
        "session_id": sid,
        "message": AUFTRAG,
        "workspace": WS,
        "model": "deepseek-v4-flash",
    }).encode(),
    headers={
        "Content-Type": "application/json",
        "X-Hermes-Workspace": SLUG,  # PFLICHT
    },
)
try:
    resp2 = json.loads(urllib.request.urlopen(req2).read())
    print(f"PING_STATUS={resp2.get('status', 'unknown')}")
    print(f"STREAM_ID={resp2.get('stream_id', 'n/a')}")
except Exception as e:
    print(f"PING_ERROR={e}")

# Speichere session_id für nächsten Durchlauf
with open(f"C:/HermesPortable/home/scripts/blog-automation/{SLUG}/.last_ping_session", "w") as f:
    f.write(sid)
print(f"Saved session_id to .last_ping_session")
