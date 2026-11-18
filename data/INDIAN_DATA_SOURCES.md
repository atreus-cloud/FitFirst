# Food data sources and attribution

FitFirst searches all of these at once (`api/foods/search.js`). Each result is labelled with its source in the app.

| Source | What it covers | How it's used | Terms |
|---|---|---|---|
| **INDB – Indian Nutrient Databank** | 1,014 Indian recipes (home-style dishes, snacks, sweets, drinks) with per-100 g and per-serving nutrients | Bundled as `data/indb-foods.json`, built by `scripts/import-indb.py` from `INDB.xlsx` | Published as open access ("publicly and freely available") with no explicit licence. Fine for personal/learning use; contact the authors before a commercial launch. |
| **Open Food Facts** | Packaged foods (Maggi, biscuits, chips, drinks…) with label nutrition, strong India coverage | Live search via `search.openfoodfacts.org`, no key needed | Database: ODbL. Attribute "Data from Open Food Facts". |
| **USDA FoodData Central** | Raw ingredients and generic foods (eggs, chicken, fruit, grains) | Live API. Uses `USDA_API_KEY` if set, otherwise the shared `DEMO_KEY` (low limits) | Public domain (CC0) |
| **FitFirst quick list** | ~145 hand-entered estimates for common combos not in the databases (egg maggi, bread omelette…) | `CURATED` in `api/foods/search.js` | Ours; rough estimates |
| **Katori** (optional) | 128 Indian dish/preparation rows | Run `node scripts/import-katori.js <csv>` to create `data/katori-foods.json` | CC BY 4.0, getkatori.com/data |
| **Supabase** (optional) | Your own foods table | When `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` are set | Yours |

## INDB citation
Vijayakumar A, et al. *Development of an Indian Food Composition Database (Indian Nutrient Databank, INDB).* Current Developments in Nutrition, 2024. https://pmc.ncbi.nlm.nih.gov/articles/PMC11277795/ — data: https://github.com/lindsayjaacks/Indian-Nutrient-Databank-INDB-

INDB recipes are built from ICMR-NIN IFCT 2017/2004, UK CoFID and USDA ingredient values. During import, rows above 900 kcal/100 g and implausible serving sizes are dropped (those items fall back to per-100 g).

## Refreshing INDB
```
pip install openpyxl
git clone https://github.com/lindsayjaacks/Indian-Nutrient-Databank-INDB-
python scripts/import-indb.py Indian-Nutrient-Databank-INDB-/INDB.xlsx
```
