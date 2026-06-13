#!/usr/bin/env python3
"""Regenerate sitemap.xml for aquarium-zentrum, excluding templates/content."""
import os, sys, datetime

ROOT = r"C:\hermesportable\home\spaces\aquarium-zentrum"
DOMAIN = "aquaristik-zentrum.com"
EXCLUDE_DIRS = {"_templates", "content", ".git", "node_modules", "__pycache__", "scripts", "venv"}
EXCLUDE_FILES = {"404.html"}
now = datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S+00:00")

urls = []

for dirpath, dirnames, fnames in os.walk(ROOT):
    dirnames[:] = [d for d in dirnames if not d.startswith(".") and d not in EXCLUDE_DIRS]
    for fname in fnames:
        if not fname.endswith(".html") or fname in EXCLUDE_FILES:
            continue
        fpath = os.path.join(dirpath, fname)
        rel = os.path.relpath(fpath, ROOT).replace("\\", "/")
        
        if fname == "index.html":
            url_path = rel[: -len("index.html")]
        else:
            url_path = rel[: -len(".html")] + "/"
        
        if not url_path:
            url_path = "/"
        elif not url_path.startswith("/"):
            url_path = "/" + url_path
        
        full_url = f"https://{DOMAIN}{url_path}"
        
        try:
            mtime = os.path.getmtime(fpath)
            lastmod = datetime.datetime.utcfromtimestamp(mtime).strftime("%Y-%m-%dT%H:%M:%S+00:00")
        except:
            lastmod = now
        
        depth = url_path.count("/") - 1
        if depth <= 1:
            priority = "0.9"
            changefreq = "weekly"
        elif depth <= 3:
            priority = "0.7"
            changefreq = "monthly"
        else:
            priority = "0.5"
            changefreq = "monthly"
        
        if url_path == "/":
            priority = "1.0"
            changefreq = "daily"
        
        urls.append((full_url, lastmod, changefreq, priority))

xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
]
for u, lm, cf, pr in urls:
    xml.append("  <url>")
    xml.append(f"    <loc>{u}</loc>")
    xml.append(f"    <lastmod>{lm}</lastmod>")
    xml.append(f"    <changefreq>{cf}</changefreq>")
    xml.append(f"    <priority>{pr}</priority>")
    xml.append("  </url>")
xml.append("</urlset>")

sitemap_path = os.path.join(ROOT, "sitemap.xml")
with open(sitemap_path, "w", encoding="utf-8") as f:
    f.write("\n".join(xml))

print(f"Sitemap: {len(urls)} URLs -> {sitemap_path}")
pages = [u for u in urls if u[3] == "1.0"]
print(f"  Pages: {[u[0] for u in pages]}")
articles = [u for u in urls if "/artikel/" in u[0]]
print(f"  Article URLs: {len(articles)}")
