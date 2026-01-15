#!/usr/bin/env python3
import json
import requests
import sys

# Load Spanish JSON
with open('locales/es.json', 'r', encoding='utf-8') as f:
    es_data = json.load(f)

# Convert to flat key-value pairs for translation
def flatten_dict(d, parent_key='', sep='.'):
    items = []
    for k, v in d.items():
        new_key = f"{parent_key}{sep}{k}" if parent_key else k
        if isinstance(v, dict):
            items.extend(flatten_dict(v, new_key, sep=sep).items())
        else:
            items.append((new_key, v))
    return dict(items)

flat_es = flatten_dict(es_data)

# Prepare translation request (batch of 50 keys at a time)
keys = list(flat_es.keys())
batch_size = 50

en_flat = {}

for i in range(0, len(keys), batch_size):
    batch_keys = keys[i:i+batch_size]
    batch_data = {k: flat_es[k] for k in batch_keys}
    
    prompt = f"""Translate the following JSON key-value pairs from Spanish to English.
Keep the keys unchanged, only translate the values.
Maintain technical terms like VID, PID, EEPROM, USB, Telnet, MIB2, FEC, etc.
Return ONLY valid JSON with the same structure.

Input JSON:
{json.dumps(batch_data, ensure_ascii=False, indent=2)}

Output JSON (English values):"""
    
    try:
        response = requests.post(
            'http://localhost:3000/trpc/ai.chat',
            json={
                "messages": [{"role": "user", "content": prompt}],
                "model": "gpt-4o-mini"
            },
            timeout=60
        )
        
        if response.status_code == 200:
            result = response.json()
            translated_text = result.get('result', {}).get('data', {}).get('content', '')
            
            # Extract JSON from response
            import re
            json_match = re.search(r'\{[\s\S]*\}', translated_text)
            if json_match:
                translated_batch = json.loads(json_match.group())
                en_flat.update(translated_batch)
                print(f"✅ Translated batch {i//batch_size + 1}/{(len(keys)-1)//batch_size + 1}")
            else:
                print(f"❌ Failed to extract JSON from batch {i//batch_size + 1}")
                en_flat.update(batch_data)  # Fallback to original
        else:
            print(f"❌ API error for batch {i//batch_size + 1}: {response.status_code}")
            en_flat.update(batch_data)  # Fallback to original
    except Exception as e:
        print(f"❌ Exception for batch {i//batch_size + 1}: {e}")
        en_flat.update(batch_data)  # Fallback to original

# Unflatten back to nested structure
def unflatten_dict(flat_dict, sep='.'):
    result = {}
    for key, value in flat_dict.items():
        parts = key.split(sep)
        d = result
        for part in parts[:-1]:
            if part not in d:
                d[part] = {}
            d = d[part]
        d[parts[-1]] = value
    return result

en_data = unflatten_dict(en_flat)

# Save
with open('locales/en.json', 'w', encoding='utf-8') as f:
    json.dump(en_data, f, ensure_ascii=False, indent=2)

print("\n✅ en.json generated successfully")
