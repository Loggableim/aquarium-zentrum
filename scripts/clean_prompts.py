#!/usr/bin/env python3
"""Clean prompt leakage artifacts from HTML files."""
import re
import sys

def clean_prompts(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    kept = []
    removed = 0
    
    for line in lines:
        stripped = line.rstrip('\n')
        s = stripped.strip()
        
        # Always keep HTML comments
        if s.startswith('<!--'):
            kept.append(stripped)
            continue
        
        # Always keep HTML tags (on their own line)
        if s.startswith('<'):
            kept.append(stripped)
            continue
        
        # Skip empty lines
        if not s:
            kept.append(stripped)
            continue
        
        # === REMOVE PATTERNS ===
        
        # 1. "Count." standalone
        if re.match(r'^Count\.?\s*$', s, re.IGNORECASE):
            removed += 1
            continue
        
        # 2. Word-numbering lines (>30% words have numbers)
        words = s.split()
        numbered = sum(1 for w in words if re.search(r'\d', w))
        if len(words) >= 3 and (numbered / max(len(words), 1) > 0.3):
            removed += 1
            continue
        if len(words) >= 2 and all(re.search(r'\d', w) for w in words):
            removed += 1
            continue
        
        # 3. Running total lines
        if re.match(r'^Running total', s, re.IGNORECASE):
            removed += 1
            continue
        
        # 4. Template placeholders
        if re.match(r'^<p>\.\.\.</p>', s) or re.match(r'^<h3>\.\.\.</h3>', s):
            removed += 1
            continue
        if re.match(r'^<h2>[^<]*</h2>\s*$', s) and '?' in s:  # template h2 with prompt
            if len(s) < 30:
                removed += 1
                continue
        
        # 5. Prompt starter patterns
        prompt_starters = [
            r'^We need', r'^Let\'?s\s', r'^I\'ll ', r'^I will ',
            r'^Now let', r'^Now we', r'^Now I', r'^Then we', r'^Then I',
            r'^Also we', r'^Also,? I', r'^Also,? use',
            r'^Provide ', r'^Use only', r'^Must be',
            r'^We can', r'^We should', r'^We could',
            r'^We are ', r'^We have ', r'^We must',
            r'^We\'ll ', r'^I think', r'^I should',
            r'^I need ', r'^Let me ', r'^The instruction',
            r'^The model', r'^The user', r'^The task',
            r'^Output ', r'^Using ', r'^Selected ',
            r'^We are asked', r'^We can use',
            r'^We need to', r'^We should ensure',
            r'^Make sure', r'^This is a',
            r'^It should', r'^It is important',
            r'^We produce', r'^We create',
            r'^We are creating', r'^We need to output',
            r'^First,? we', r'^Second,? we', r'^Finally,? we',
            r'^Let us', r'^Let me count', r'^Now count',
            r'^Going to', r'^I am going',
            r'^We are going', r'^Structure:',
            r'^We want', r'^I want',
            r'^We aim', r'^I aim',
            r'^I have written', r'^We have been',
            r'^We are instructed', r'^We have been asked',
            r'^I shall', r'^Let us write',
            r'^We need to ensure', r'^We must not',
            r'^I need to', r'^I need a',
            r'^Running total', r'^Total words',
            r'^Word count', r'^Words:',
            r'^Note:', r'^Wait,', r'^Actually,',
            r'^Alright,', r'^Okay,', r'^Ok,',
            r'^Great,', r'^Perfect,',
            r'^Hmm,', r'^So,?\s',
            r'^First,', r'^Second,', r'^Finally,',
            r'^Paragraph \d', r'^Paragraph\d',
            r'^Draft:', r'^Text:',
        ]
        
        is_prompt = False
        for pat in prompt_starters:
            if re.match(pat, s, re.IGNORECASE):
                is_prompt = True
                break
        
        if is_prompt:
            removed += 1
            continue
        
        # 6. Lines with just the word "words" or similar
        if re.match(r'^(~?\d+\s*words?\.?\s*|words?\s*)$', s, re.IGNORECASE):
            removed += 1
            continue
        
        # 7. Quoted content where the whole line is just a quoted string with no HTML
        if s.startswith('"') and s.count('"') == 2 and s.endswith('"'):
            inner = s[1:-1]
            # Only keep if it's substantial German text
            if len(inner) < 20:
                removed += 1
                continue
            # Check if inner has word-dipping artifacts (word followed by number)
            inner_words = inner.split()
            numbered_inner = sum(1 for w in inner_words if re.search(r'\d', w))
            if len(inner_words) > 0 and numbered_inner / len(inner_words) > 0.3:
                removed += 1
                continue
            # The content is likely real German text in quotes - convert to unwrapped text
            kept.append(inner)
            removed += 1  # Count as "fixed" since we removed quotes but kept content
            continue
        
        # 8. Lines that start with a quote mark and contain word numbering
        if s.startswith('"') and s.count('"') >= 1:
            # Extract the inner content
            inner = s
            if s.count('"') >= 2:
                inner = s.split('"')[1]
            inner_words = inner.split()
            numbered_inner = sum(1 for w in inner_words if re.search(r'\d', w))
            if len(inner_words) > 0 and numbered_inner / len(inner_words) > 0.3:
                removed += 1
                continue
        
        # 9. Lines with just parentheses containing numbers: "(92)" or "(about 470 words)"
        if re.match(r'^\([^)]*\d[^)]*\)\s*$', s):
            if 'word' in s.lower() or len(s) < 20:
                removed += 1
                continue
        
        kept.append(stripped)
    
    # Clean up blank lines
    result = '\n'.join(kept)
    result = re.sub(r'\n{3,}', '\n\n', result)
    result = result.strip() + '\n'
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(result)
    
    print(f"{filepath.split('/')[-1].split('\\\\')[-1]}: {len(lines)} → {len(kept)} lines ({removed} removed)")
    return len(lines) - len(kept)

if __name__ == '__main__':
    total = 0
    for f in sys.argv[1:]:
        total += clean_prompts(f)
    print(f"\nTotal removed: {total}")