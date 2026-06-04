import re

with open('/c/HermesPortable/home/spaces/aquarium-zentrum/build.js', 'r') as f:
    content = f.read()

# Find all keys in the ARTICLES object
# Match patterns like: 'slug': {
keys = re.findall(r"'([a-z0-9_-]+)':\s*{", content)
for k in sorted(keys):
    print(k)

print(f"\nTotal: {len(keys)}")

# Check specific slugs
to_check = ['antennenwels-l-welse-haltung', 'aquarium-umzug-transport-guide', 'truebes-wasser-schaum-geruch-aquarium',
            '3d-rueckwand-aquarium-bauen', 'aquarium-fotografie-guide', 'aquarium-standort-unterschrank',
            'aquarium-urlaubsbetreuung-guide', 'buero-aquarium-guide', 'buntbarsche-cichliden-aquarium',
            'fadenfische-guramis-haltung', 'krebse-krabben-aquarium-guide-2026',
            'schwimmpflanzen-aquarium', 'skalare-haltung-pflege']
for s in to_check:
    print(f"  '{s}' in build.js: {s in keys}")
