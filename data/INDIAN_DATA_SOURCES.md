# Food data sources and attribution

FitFirst searches all of these at once (`api/foods/search.js`). Each result is labelled with its source in the app.

| Source | What it covers | How it's used | Terms |
|---|---|---|---|
| **Katori** | 63 common dishes × home / restaurant / dhaba (128 rows) with real serving sizes | Bundled `data/katori-foods.json` (`scripts/import-katori.js`). Ranked first on equal matches | CC BY 4.0. Credit: "Data: Katori Indian food nutrition dataset, getkatori.com/data (CC BY 4.0)" |
| **INDB – Indian Nutrient Databank** | 1,014 Indian recipes, per 100 g and per serving | Bundled `data/indb-foods.json` (`scripts/import-indb.py`), with corrections below | Open access, no explicit licence: fine for personal use; ask the authors before a commercial launch |
| **IFCT 2017 – Indian Food Composition Tables (ICMR-NIN)** | 528 core foods (grains, dals, vegetables, fruit, meat, fish, dairy), mostly raw, with local names in Indian languages | Bundled `data/ifct-foods.json` (`scripts/import-ifct.py` from npm `@ifct2017/compositions`) | Government data; machine-readable package is MIT. Cite: Longvah T. et al., IFCT 2017, NIN Hyderabad |
| **Open Food Facts** | Packaged foods (Maggi, Parle-G, Haldiram's, Amul…) | Live, no key. India-sold products first; must contain the typed words and pass a calories-vs-macros check | ODbL: attribute "Data from Open Food Facts" |
| **USDA FoodData Central** | Generic and raw foods | Live. `USDA_API_KEY` recommended (shared `DEMO_KEY` runs out fast) | Public domain |
| **FitFirst quick list** | ~145 estimates for combos no database has (egg maggi, bread omelette…) | `CURATED` in `api/foods/search.js` | Ours |
| **Supabase** (optional) | Your own foods table | When configured | Yours |

Search also understands common Indian spelling variants (toor/tur/arhar, moong/mung, dahi/curd, bhindi/okra, mamra/murmura…).

## INDB citation
Vijayakumar A, et al. *Development of an Indian Food Composition Database (Indian Nutrient Databank, INDB).* Current Developments in Nutrition, 2024. https://pmc.ncbi.nlm.nih.gov/articles/PMC11277795/ — data: https://github.com/lindsayjaacks/Indian-Nutrient-Databank-INDB-

INDB recipes are built from ICMR-NIN IFCT 2017/2004, UK CoFID and USDA ingredient values.

### Corrections applied to INDB (nothing removed)
- **Deep-fried recipes (126):** INDB counts all the oil in the frying pan as eaten (e.g. 480 ml for 6 samosas → 814 kcal per samosa). Using each recipe's ingredient list, the frying oil is removed and a realistic absorbed amount (12% of the food's weight, never more than the oil listed) is added back; calories are recomputed from the corrected macros. Example: potato samosa 814 → 196 kcal. Labelled "INDB (adjusted: frying oil)".
- **Inflated protein/fat (32, mostly soups):** energy matches INDB's own kJ value and is plausible, so it is kept and protein + fat are scaled to fit. Labelled "INDB (adjusted: macros)".
- **Implausible serving sizes (112):** e.g. 1 boiled egg = 151 g; these items are shown per 100 g instead.

## Refreshing INDB
```
pip install openpyxl
git clone https://github.com/lindsayjaacks/Indian-Nutrient-Databank-INDB-
python scripts/import-indb.py Indian-Nutrient-Databank-INDB-
```

## Refreshing IFCT and Katori
```
npm i @ifct2017/compositions && python scripts/import-ifct.py node_modules/@ifct2017/compositions/index.csv
node scripts/import-katori.js katori-indian-food-dataset.csv   # download from getkatori.com/data
```
