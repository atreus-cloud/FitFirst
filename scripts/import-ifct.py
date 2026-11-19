"""Convert IFCT 2017 (Indian Food Composition Tables, ICMR-NIN) into FitFirst's search JSON.

Data: Longvah T. et al., Indian Food Composition Tables 2017, National Institute of Nutrition, Hyderabad.
Machine-readable copy: npm package @ifct2017/compositions (MIT), https://github.com/ifct2017
Usage:  npm i @ifct2017/compositions && python scripts/import-ifct.py node_modules/@ifct2017/compositions/index.csv
Writes: data/ifct-foods.json  (528 core foods, values per 100 g edible portion, mostly RAW)
"""
import csv, json, re, sys, pathlib

rows = list(csv.DictReader(open(sys.argv[1] if len(sys.argv) > 1 else 'index.csv', encoding='utf-8')))
col = {k.split('; ')[-1]: k for k in rows[0]}
def num(r, k):
    try: return float(r[col[k]])
    except (KeyError, ValueError, TypeError): return 0.0

def local_names(s):
    # "A. Moricha guti; H. Ramdana; Kan. Danthu beeja" -> "moricha guti ramdana danthu beeja"
    names = []
    for part in re.split(r'[;]', s or ''):
        part = re.sub(r'^\s*[A-Z][a-z]{0,3}\.\s*', '', part).strip()
        names += [n.strip() for n in part.split(',') if n.strip()]
    return ' '.join(dict.fromkeys(n.lower() for n in names))[:300]

out = []
for r in rows:
    code, name = r[col['code']].strip(), r[col['name']].strip()
    kcal = num(r, 'enerc') / 4.184          # IFCT energy is in kJ
    if not code or not name or kcal <= 0: continue
    item = {'id': 'ifct-' + code, 'name': name, 'group': r[col['grup']].strip(),
            'n': {'kcal': round(kcal, 1), 'protein': round(num(r, 'protcnt'), 1), 'carbs': round(num(r, 'choavldf'), 1),
                  'fat': round(num(r, 'fatce'), 1), 'fiber': round(num(r, 'fibtg'), 1), 'sugar': round(num(r, 'fsugar'), 1),
                  'sodium': round(num(r, 'na'))}}
    al = local_names(r[col['lang']])
    if al: item['local'] = al
    out.append(item)

dest = pathlib.Path(__file__).resolve().parent.parent / 'data' / 'ifct-foods.json'
dest.write_text(json.dumps(out, separators=(',', ':'), ensure_ascii=False))
print(f'Wrote {len(out)} IFCT foods to {dest} ({dest.stat().st_size // 1024} KB)')
