"""Convert the Indian Nutrient Databank (INDB) into FitFirst's search JSON.

Source: https://github.com/lindsayjaacks/Indian-Nutrient-Databank-INDB-  (file: INDB.xlsx)
Paper:  Vijayakumar et al., Current Developments in Nutrition 2024 (PMC11277795)
Usage:  pip install openpyxl && python scripts/import-indb.py path/to/INDB.xlsx
Writes: data/indb-foods.json
"""
import json, re, sys, pathlib, openpyxl

src = sys.argv[1] if len(sys.argv) > 1 else 'INDB.xlsx'
rows = list(openpyxl.load_workbook(src, read_only=True).worksheets[0].iter_rows(values_only=True))
H = {h: i for i, h in enumerate(rows[0])}
def v(r, k):
    x = r[H[k]]
    try: return float(x)
    except (TypeError, ValueError): return 0.0
def rnd(x, d=1): return round(x, d)

out = []
for r in rows[1:]:
    code, name = r[H['food_code']], (r[H['food_name']] or '').strip()
    kcal100 = v(r, 'energy_kcal')
    if not code or not name or kcal100 <= 0 or kcal100 > 900: continue  # >900 kcal/100 g is physically impossible → bad row
    unit = (r[H['servings_unit']] or '').strip()
    ukcal = v(r, 'unit_serving_energy_kcal')
    grams = round(ukcal / kcal100 * 100) if unit and ukcal > 0 else 0
    item = {'id': 'indb-' + code, 'name': re.sub(r'\s+', ' ', name), 'n': {  # per 100 g
        'kcal': rnd(kcal100), 'protein': rnd(v(r, 'protein_g')), 'carbs': rnd(v(r, 'carb_g')), 'fat': rnd(v(r, 'fat_g')),
        'fiber': rnd(v(r, 'fibre_g')), 'sugar': rnd(v(r, 'freesugar_g')), 'sodium': rnd(v(r, 'sodium_mg'), 0)}}
    if 5 <= grams <= 1000 and ukcal <= 1200: item['unit'], item['g'] = unit, grams  # skip implausible serving sizes
    out.append(item)

dest = pathlib.Path(__file__).resolve().parent.parent / 'data' / 'indb-foods.json'
dest.write_text(json.dumps(out, separators=(',', ':'), ensure_ascii=False))
print(f'Wrote {len(out)} INDB recipes to {dest} ({dest.stat().st_size//1024} KB)')
