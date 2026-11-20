# FitFirst Nutrition OS — mobile-first alpha

FitFirst is a phone-first calorie tracker built as a Vercel static app plus serverless API routes. It is intended to be used in portrait on Android; desktop is secondary.

## What's in this build
- Mobile-first responsive layout, large touch targets, bottom navigation and safe-area padding.
- Local diary/weight/profile persistence, export, calorie and macro targets.
- Food search across a 50-entry curated Indian/global starter list, optional Supabase foods table, and optional USDA FoodData Central API.
- Gemini vision meal scanner: food names, estimated edible grams, per-100-g fallback macro estimates; editable before logging.
- Food scan nutrition matching against the food search endpoint. Database-backed values and AI fallback values are separately labelled.
- Katori dataset importer (CC BY 4.0) for 128 dish/preparation rows, once the CSV is downloaded from the source.
- Supabase SQL schema and a seed script for FitFirst starter foods.

## v0.7 — Samsung Health activity
Steps, workouts, active calories, distance and weigh-ins flow in automatically:
Samsung Health → Health Connect (on the phone) → **HC Webhook** app (Play Store) → `POST /api/activity?key=…` → Upstash Redis → shown on Home (Activity card), Progress (average steps) and weight history.
- Setup in the app: Profile → Samsung Health → *Set up / show link* (step-by-step guide + your private webhook link).
- Server needs a free **Upstash for Redis** database (Vercel → Storage → Marketplace), connected to the project; it adds `KV_REST_API_URL` / `KV_REST_API_TOKEN` automatically.
- Calories burned are display-only (not added to the food budget). Records are de-duplicated by id; set Steps/Calories/Distance to "Daily" in HC Webhook to avoid phone + watch double counting.
- Photo scan: counts pieces × standard Indian portion weights, look-alike rules + "Or is it…" alternatives, retry on Gemini overload, your saved foods offered first.

## v0.6 — faster scans, cleaner data
- Photo scan ~5–8 s instead of 20–25 s: `gemini-flash-lite-latest` first (measured 3.6 s; `gemini-flash-latest` was timing out), 1024 px photos, low thinking, per-model time limits.
- `/api/health?check=1&models=a,b` tests any Gemini model end-to-end.
- Three bundled Indian databases: Katori (128 dish preparations, CC BY 4.0), INDB (1,014 recipes, frying-oil and macro errors corrected rather than removed) and IFCT 2017 (528 core foods with local-language names), plus live Open Food Facts (India-first) and USDA. Indian spelling variants (toor/arhar, dahi/curd…) and better ranking.
- Search screen fits phones: no auto keyboard, one-row actions, full-height list.

## v0.5 — real food databases
Food search now queries real databases in parallel instead of relying on a hand-made list:
- **INDB (Indian Nutrient Databank)** — 1,014 Indian recipes with real serving sizes (1 idli = 25 g, 1 dosa…), bundled.
- **Open Food Facts** — packaged foods with label nutrition (e.g. Maggi Masala Noodles 427 kcal/100 g), live, no key.
- **USDA FoodData Central** — raw ingredients, live. Works without a key via `DEMO_KEY`; add a free `USDA_API_KEY` (api.data.gov/signup) for higher limits.
- The old hand-entered list stays as a small "FitFirst quick list" for combos no database has (egg maggi, bread omelette).
- Search results are cached at Vercel's edge for a day. See `data/INDIAN_DATA_SOURCES.md` for attribution and licences.

## v0.4 — better photo logging, bigger food list
- **New photo scan flow**: big Take photo / From gallery buttons, optional notes for the AI ("2 rotis, cooked in ghee"), meal chips, automatic analysis with a progress animation, then a review screen with the photo, a live meal total, per-item gram steppers and ½× / ¾× / 1½× / 2× portion chips, include/exclude ticks, one-tap database matches, "Add something it missed", and a sticky "Log N items · X kcal" button. Diary entries show the meal photo as a thumbnail.
- **Clear Gemini errors**: the API now tells you *why* Gemini failed (invalid key, quota, region, permission) and falls back to other Flash models if the configured one is unavailable.
- **`/api/health?check=1`** asks Google whether your key and model work (no image, no cost).
- **`POST /api/estimate`**: "✦ Ask AI to estimate" at the bottom of food search, for anything not in the database.
- **145 starter foods** (was 50) incl. Maggi variants, egg dishes, poha, parotta, Indo-Chinese, chaat, sweets, fruits, drinks — with aliases (maggie, dahi, roti, chai, omelet…) and multi-word search ("maggi egg" finds Egg maggi).

## v0.3 — app completed (phone-only storage)
- **Per-day diary**: every entry is saved against its date. Old flat diaries are migrated to today automatically.
- **Date navigation**: tappable Mon–Sun week strip with ‹ › week arrows, a date picker, and a "Today" jump. Day rings turn green when on target (±10%) and pink when over.
- **Meals**: Breakfast / Lunch / Snacks / Dinner sections with subtotals, a ＋ on each, and "Copy from previous day".
- **Add/edit sheet** (replaces the old `prompt()`): servings or grams, ± stepper, live kcal/macro preview, meal picker. Tap any logged item to edit or delete it.
- **Quick add** (calories only) and **Create food** (saved to My foods, searchable). Recent foods show at the top of search.
- **Photo scan**: choose the meal, untick items you don't want, grams-based entries that stay editable later.
- **Progress**: real streak, 8 earned badges, 7-day calorie chart, weekly macro averages, weight trend chart, deletable weigh-ins (one per date).
- **Profile**: target calculator (Mifflin-St Jeor + activity + goal), input validation, backup import/export, clear selected day, full reset.
- API: USDA energy now read correctly (kcal or kJ), results ranked by relevance and capped at 40, edge-cached for 1 h. Service worker cache bumped to v2 so phones pick up the new app.

Next steps if you want them: Supabase Auth + cloud sync of `food_logs`/`weights` (schema already exists), barcode scanning, water tracking.

## Vercel API routes
- `GET /api/health` — reports provider configuration status without exposing secrets.
- `GET|POST /api/activity?key=…` — Health Connect activity sync (HC Webhook posts here; the app reads per-day totals).
- `GET /api/foods/search?q=...` — returns curated entries and optional Supabase, USDA and imported Katori data.
- `POST /api/scan` — accepts `{ imageBase64, mimeType, notes }` and uses Gemini `generateContent` with image data.
- `POST /api/estimate` — accepts `{ query }` and returns AI nutrition estimates for a typed food name.
- `GET /api/health?check=1` — also verifies the Gemini key/model with Google.

## Vercel environment variables
Set these only in Vercel Project Settings → Environment Variables. Never put API keys in `index.html` or other client files.
- `GEMINI_API_KEY` (required for vision scanning)
- `GEMINI_VISION_MODEL` (optional; defaults to `gemini-flash-latest`)
- `USDA_API_KEY` (optional; obtain at https://api.data.gov/signup/)
- `SUPABASE_URL` (optional)
- `SUPABASE_SERVICE_ROLE_KEY` (optional; server-side only, never expose to client)

## Indian food data
- FitFirst curated starter dataset: quick local lookup; values are estimates, not lab data.
- Katori Indian food nutrition dataset: CC BY 4.0; source page/download and attribution: https://getkatori.com/data. Katori CSV was not included in this alpha because the download could not be fetched in this environment. Download the full CSV yourself, then run:
  `node scripts/import-katori.js /path/to/katori-indian-food-dataset.csv`
  This writes `data/katori-foods.json`, which the food-search API loads automatically. The importer keeps the per-100-g figures and preparation names; missing nutrients remain zero and are not guessed.
- INDB (Indian Nutrient Databank): research/open-access resource with 1,014 recipes, but the dataset's redistribution terms are not clearly stated. Do not redistribute/import it into a public hosted app until permissions are confirmed. Reference: https://www.anuvaad.org.in/indian-nutrient-databank/
- USDA FoodData Central: live API search when `USDA_API_KEY` is configured.

## Supabase setup
1. Create a Supabase project.
2. Run `supabase-schema.sql` in SQL Editor.
3. Optionally run `data/curated-foods-seed.sql` to seed the 145 starter foods.
4. Configure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in Vercel.
5. Service-role key stays backend-only. Before implementing cloud user diaries, configure Auth and verify row-level security policies.


## Run locally
Install Node.js and Vercel CLI, then run `vercel dev` in this folder.


## Privacy and estimation
Photos are uploaded to Gemini only when the user takes or picks a photo in the scan screen. Portion weights and nutrition fallback values are AI estimates. Database matching is preferred when available. Review the results before saving.
