"""Convert the Indian Nutrient Databank (INDB) into FitFirst's search JSON, correcting known errors.

Source: https://github.com/lindsayjaacks/Indian-Nutrient-Databank-INDB-
Paper:  Vijayakumar et al., Current Developments in Nutrition 2024 (PMC11277795)
Usage:  pip install openpyxl
        python scripts/import-indb.py path/to/Indian-Nutrient-Databank-INDB-
Writes: data/indb-foods.json

Corrections (nothing is dropped unless it can't be repaired):
1. Deep-fried recipes: INDB counts ALL the frying oil in the pan as eaten (e.g. 480 ml oil
   for 6 samosas). We remove that oil and add back a realistic absorbed amount
   (ABSORPTION x weight of the food), then recompute per-100 g and serving size.
2. Rows whose protein/fat don't match their energy (mostly soups): energy matches INDB's own
   kJ figure and is plausible, so we keep it and scale protein + fat down to fit it.
Adjusted items carry "adj" so the app can label them.
"""
import json, re, sys, pathlib, openpyxl

ABSORPTION = 0.12          # oil absorbed ≈ 12% of the fried food's weight (typical 8–15%)
OIL_DENSITY = 0.92         # g per ml
UNIT_G = {'c': 240, 'glass': 250, 'g': 1, 'gm': 1, 'kg': 1000, 'ml': 1, 'l': 1000, 'litre': 1000, 'tsp': 5, 'teaspoon': 5,
          'tbsp': 15, 'tablespoon': 15, 'cup': 240, 'cups': 240}
UNIT_MAX = {'piece': 200, 'egg': 120, 'idli': 80, 'biscuit': 40, 'cookie': 80, 'ladoo': 80, 'vada': 120,
            'samosa': 150, 'poori': 80, 'slice': 200, 'triangle': 120, 'cutlet': 150, 'tea cup': 250, 'cup': 300,
            'tablespoon': 30, 'glass': 400, 'tall glass': 450, 'small bowl': 250, 'bowl': 450, 'soup bowl': 400,
            'plate': 600, 'parantha': 150, 'dosa': 250, 'pancake': 150, 'sandwich': 250, 'kofta': 80, 'pakora': 60}

root = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else '.')
def sheet(name): return list(openpyxl.load_workbook(root / name, read_only=True).worksheets[0].iter_rows(values_only=True))
ind = sheet('INDB.xlsx'); H = {h: i for i, h in enumerate(ind[0])}
servings = {r[1]: r for r in sheet('recipes_servingsize.xlsx')[1:] if r and r[1]}
recipes = {}
for r in sheet('recipes.xlsx')[1:]:
    if r and r[1]: recipes.setdefault(r[1], []).append(r)

def num(x):
    try: return float(x)
    except (TypeError, ValueError): return 0.0
def grams(amount, unit, is_oil=False):
    u = str(unit or '').strip().lower()
    g = num(amount) * UNIT_G.get(u, 0)
    return g * OIL_DENSITY if is_oil and u in ('ml', 'l', 'litre', 'cup', 'cups', 'tbsp', 'tsp', 'tablespoon', 'teaspoon') else g
OIL = re.compile(r'\b(oil|ghee|vanaspati|fat|dalda|butter)\b', re.I)
FRY = re.compile(r'fry|frying', re.I)

def frying_oil_g(code):
    """Grams of deep-frying oil listed for a recipe (0 if none)."""
    total = 0.0
    for r in recipes.get(code, []):
        ing, amt_org, food = str(r[4] or ''), str(r[5] or ''), str(r[10] or '')
        if OIL.search(food + ' ' + ing) and FRY.search(amt_org + ' ' + ing):
            total += grams(r[11], r[12], is_oil=True)
    return total

def ingredient_weight(code):
    """Sum of ingredient weights in grams (units we can't convert, like 'sprig', are ignored)."""
    return sum(grams(r[11], r[12], is_oil=bool(OIL.search(str(r[10] or '')))) for r in recipes.get(code, []))

out, stats = [], {'oil_fixed': 0, 'macros_fixed': 0, 'serving_dropped': 0, 'skipped': 0}
for r in ind[1:]:
    code, name = r[H['food_code']], re.sub(r'\s+', ' ', (r[H['food_name']] or '').strip())
    v = lambda k: num(r[H[k]])
    kcal, p, c, f = v('energy_kcal'), v('protein_g'), v('carb_g'), v('fat_g')
    fib, sug, sod = v('fibre_g'), v('freesugar_g'), v('sodium_mg')
    if not code or not name or kcal <= 0: stats['skipped'] += 1; continue
    unit = (r[H['servings_unit']] or '').strip()
    ukcal = v('unit_serving_energy_kcal')
    unit_g = ukcal / kcal * 100 if unit and ukcal > 0 else 0
    adj = None

    # 1) frying-oil correction
    oil = frying_oil_g(code)
    W = ingredient_weight(code)
    # only correct when the listed oil is more than the food could absorb (deep frying, not a tawa/shallow fry)
    if oil > 0 and W > oil * 1.1 and oil > ABSORPTION * (W - oil) * 1.25:
        tk, tp, tc, tf = kcal * W / 100, p * W / 100, c * W / 100, f * W / 100
        food_w = W - oil
        fat_wo = max(tf - oil, 0.0)
        kcal_wo = max(tk - oil * 8.84, 4 * (tp + tc) + 9 * fat_wo)
        absorbed = ABSORPTION * food_w
        W2 = food_w + absorbed
        kcal, p, c, f = (kcal_wo + absorbed * 8.84) / W2 * 100, tp / W2 * 100, tc / W2 * 100, (fat_wo + absorbed) / W2 * 100
        fib, sug, sod = fib * W / W2, sug * W / W2, sod * W / W2
        unit_g = unit_g * W2 / W
        kcal = 4 * p + 4 * c + 9 * f + 2 * fib   # keep energy consistent with corrected macros
        adj = 'frying oil'; stats['oil_fixed'] += 1

    # 2) protein/fat inconsistent with energy → keep energy, scale protein + fat
    calc = 4 * p + 4 * c + 9 * f
    if abs(calc - kcal) / max(kcal, calc) > 0.3 and abs(calc - kcal) > 40:
        rest = kcal - 4 * c
        if rest > 0 and (4 * p + 9 * f) > 0:
            s_ = rest / (4 * p + 9 * f); p, f = p * s_, f * s_
        else:
            s_ = kcal / calc; p, c, f = p * s_, c * s_, f * s_
        adj = (adj + ', macros') if adj else 'macros'; stats['macros_fixed'] += 1

    rd = lambda x, d=1: round(x, d)
    item = {'id': 'indb-' + code, 'name': name,
            'n': {'kcal': rd(kcal), 'protein': rd(p), 'carbs': rd(c), 'fat': rd(f), 'fiber': rd(fib), 'sugar': rd(sug), 'sodium': rd(sod, 0)}}
    g = round(unit_g)
    if g and 5 <= g <= UNIT_MAX.get(unit.lower(), 600) and kcal * g / 100 <= 1200: item['unit'], item['g'] = unit, g
    elif g: stats['serving_dropped'] += 1
    if adj: item['adj'] = adj
    out.append(item)

dest = pathlib.Path(__file__).resolve().parent.parent / 'data' / 'indb-foods.json'
dest.write_text(json.dumps(out, separators=(',', ':'), ensure_ascii=False))
print(f'Wrote {len(out)} INDB recipes to {dest} ({dest.stat().st_size // 1024} KB); {stats}')
