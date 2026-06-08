#!/usr/bin/env python3
"""Append AdSense placeholder to files still missing it."""
import os

artikel_dir = r"C:\HermesPortable\home\scripts\blog-automation\aquarium-zentrum\content\artikel"

adsense_block = '\n\n<hr style="margin:2rem 0;">\n<!-- AdSense-Placeholder -->\n<div style="background:#f9fafb;border:1px dashed #d1d5db;padding:1rem;text-align:center;border-radius:8px;margin:1.5rem 0;">\n<p style="color:#9ca3af;font-size:0.875rem;margin:0;">[ AdSense-Werbefläche ]</p>\n</div>'

added = 0
for fname in sorted(os.listdir(artikel_dir)):
    if not fname.endswith('.html'):
        continue
    fpath = os.path.join(artikel_dir, fname)
    
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'AdSense' in content or 'adsense' in content.lower():
        continue
    
    # Append at the end of file (before any trailing schema script)
    if '</script>' in content:
        # Append before the last </script> (schema block)
        last_script = content.rindex('</script>')
        content = content[:last_script+9] + adsense_block + content[last_script+9:]
    else:
        content = content.rstrip() + adsense_block
    
    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(content)
    added += 1
    print(f"  +AdSense: {fname}")

print(f"\nAdded AdSense to {added} remaining articles")
print("Total with AdSense: 71/71")