with open('/c/hermesportable/aquarium-zentrum/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

old = 'Fish Neu: Barben, Tetras & Kaufberatung – Fische und Pflanzen ohne Heizer'
new_text = '🐟 Neu: Barben, Tetras & Kaufberatung – 3 neue Guides'

if old in content:
    content = content.replace(old, new_text)
    with open('/c/hermesportable/aquarium-zentrum/index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print('OK: Promo bar text updated')
else:
    print('WARN: Old text not found')
    for i, line in enumerate(content.split('\n')):
        if 'Neu:' in line and 'promo' not in line:
            print(f'  Line {i}: {line.strip()[:100]}')
