const {generateJson}=require('./_gemini');
const ALLOWED=new Set(['image/jpeg','image/png','image/webp']);
const clean=(v,max=5000)=>Math.min(max,Math.max(0,Number(v)||0));

// Standard edible weights the model multiplies counts by. Counting pieces is far more reliable
// for a vision model than guessing grams directly.
const REFERENCE=`Reference edible weights (use these, adjust only for clearly bigger/smaller items):
egg (whole, shelled) 50 g; idli 40 g; plain dosa 55 g; masala dosa 140 g; uttapam 120 g; roti/chapati/phulka 40 g; plain paratha 60 g; stuffed paratha 120 g; poori 25 g; bhatura 70 g; naan 90 g; slice of bread 25 g; pav 35 g;
medu vada 50 g; samosa 90 g; pakora 25 g; kachori 60 g; pani puri (1 puri with filling) 30 g; dhokla piece 30 g; momo 25 g;
gulab jamun 35 g; rasgulla 50 g; ladoo 30 g; barfi piece 30 g; jalebi 30 g; biscuit 7 g; cookie 15 g;
banana 120 g; apple 180 g; orange 130 g; mango 200 g; chicken leg piece 140 g; chicken tikka piece 25 g; fish fry piece 100 g; paneer tikka cube 25 g;
katori (small bowl ~150 ml) of dal/sambar/curry/sabzi 150 g; katori of rice/biryani/pulao 120 g; katori of curd 150 g; full plate of rice/biryani 300 g;
cup of chai/coffee (small Indian cup or mug, ~120 ml) 120 g; large mug 250 g; glass 250 g; tablespoon 15 g; teaspoon 5 g; chutney (1 tbsp) 15 g.`;

function buildPrompt(notes){
  return `You are the food-vision component of FitFirst, a calorie-tracking app used mostly in India.
Identify each distinct edible item in the photo (rice, curries, chutneys, sides, drinks, toppings…). Use specific everyday Indian names where they apply ("masala dosa", "sambar", "coconut chutney", "egg maggi", "chicken biryani", "boiled egg").

PORTIONS — work them out, don't guess a round number:
1. COUNT what you see. Pick a natural unit for each item (egg, idli, roti, piece, katori, cup, glass, tbsp, plate) and count units, using decimals for partial amounts (0.5 katori, 1.5 roti).
2. Pieces of one thing are ONE item: two matching halves side by side (e.g. a boiled egg cut in half) = count 1, not 2. A sliced fruit = 1 fruit.
3. grams_per_unit: take it from the reference list, adjusted only if the item is clearly larger/smaller than standard (judge against the plate ~26 cm, katori ~10 cm, spoon, hand, glass).
4. estimated_grams = count x grams_per_unit. Never default to 100 g.
5. If there is no size cue at all, assume one typical single serving.
${REFERENCE}

LOOK-ALIKES — decide carefully, and when you are not sure list the next most likely identities in "alternatives":
- Milk coffee / filter coffee: darker brown, dense ring of fine bubbles or foam, often a steel tumbler/dabara or mug. Chai: lighter tan/orange-beige, often a milk skin, tea-leaf or spice specks, little foam. Black coffee/tea: no milk colour.
- Dosa vs uttapam vs appam; idli vs dhokla; curd vs raita vs buttermilk; sambar vs rasam vs dal; pulao vs biryani vs fried rice; roti vs paratha vs naan; paneer vs tofu; fried chicken vs chicken 65 vs pakora.
Give 0–2 alternatives per item (none when you are certain), each with its own per-100 g nutrition.

NUTRITION: approximate values PER 100 GRAMS (kcal, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg); kcal ≈ 4*protein + 4*carbs + 9*fat (±15%). Account for visible oil/ghee/butter. For packaged items do not guess a brand label.

Return ONLY JSON:
{"items":[{"name":"boiled egg","count":1,"unit":"egg","grams_per_unit":50,"estimated_grams":50,"portion":"1 egg, halved","confidence":"high","notes":"short assumption","estimated_nutrition":{"kcal":155,"protein_g":12.6,"carbs_g":1.1,"fat_g":10.6,"fiber_g":0,"sugar_g":1.1,"sodium_mg":124},"alternatives":[]}],"meal_notes":"one short sentence","uncertainty":"main uncertainty, short"}
"alternatives" items look like {"name":"<other likely food>","estimated_nutrition":{"kcal":0,"protein_g":0,"carbs_g":0,"fat_g":0}} (per 100 g). The example above only shows the format; describe what is actually in the photo.
If no food is visible, return an empty items array and explain in meal_notes.
User notes (trust these over the photo for quantities and ingredients): ${String(notes||'none').slice(0,400)}`;
}

module.exports=async(req,res)=>{
  if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({error:'POST only'});}
  const {imageBase64,mimeType='image/jpeg',notes=''}=req.body||{};
  if(!imageBase64||typeof imageBase64!=='string'||imageBase64.length>6000000)return res.status(400).json({error:'Image is missing or too large.'});
  if(!ALLOWED.has(mimeType))return res.status(400).json({error:'Unsupported image format. Use JPEG, PNG or WebP.'});
  const raw=imageBase64.replace(/^data:[^,]+,/,'').replace(/\s/g,'');
  if(!/^[A-Za-z0-9+/]*={0,2}$/.test(raw))return res.status(400).json({error:'Image data is invalid.'});
  const r=await generateJson([{text:buildPrompt(notes)},{inline_data:{mime_type:mimeType,data:raw}}],{timeoutMs:55000,perModelMs:28000});
  if(!r.ok)return res.status(r.code).json({error:r.error});
  const parsed=r.data;
  const items=(Array.isArray(parsed.items)?parsed.items:[]).slice(0,15).map(x=>{
    const n=x.estimated_nutrition||{};
    const count=Math.round(clean(x.count,100)*4)/4;          // to the nearest quarter
    const unitG=clean(x.grams_per_unit,2000);
    let unit=String(x.unit||'').trim().toLowerCase().replace(/^(small |large |big )/,'').replace(/^(tea|coffee|tea\/coffee|chai) ?(cup|mug)$/,'$2').replace(/\s*\(.*\)$/,'');
    if(unit.length>12)unit='serving';
    // trust count x weight-per-unit over a free-form gram guess
    const grams=count>0&&unitG>0?Math.round(count*unitG):(clean(x.estimated_grams,3000)||100);
    return {name:String(x.name||'Unidentified food').slice(0,100),portion:String(x.portion||'').slice(0,60),
      count:count>0&&unitG>0?count:null,unit:count>0&&unitG>0&&unit?unit:null,grams_per_unit:count>0&&unitG>0?unitG:null,
      estimated_grams:grams,confidence:['low','medium','high'].includes(x.confidence)?x.confidence:'low',notes:String(x.notes||'').slice(0,250),
      estimated_nutrition:{kcal:clean(n.kcal,1000),protein_g:clean(n.protein_g,100),carbs_g:clean(n.carbs_g,100),fat_g:clean(n.fat_g,100),fiber_g:clean(n.fiber_g,100),sugar_g:clean(n.sugar_g,100),sodium_mg:clean(n.sodium_mg,10000)},
      alternatives:(Array.isArray(x.alternatives)?x.alternatives:[]).slice(0,2).map(a=>{const m=a&&a.estimated_nutrition||{};return {name:String(a&&a.name||'').slice(0,80),
        estimated_nutrition:{kcal:clean(m.kcal,1000),protein_g:clean(m.protein_g,100),carbs_g:clean(m.carbs_g,100),fat_g:clean(m.fat_g,100)}}}).filter(a=>a.name&&a.estimated_nutrition.kcal>0&&a.name.toLowerCase()!==String(x.name||'').toLowerCase())};
  });
  res.status(200).json({items,meal_notes:String(parsed.meal_notes||''),uncertainty:String(parsed.uncertainty||''),model:r.model,notice:'Foods, portions and nutrition are AI estimates. Review before saving.'});
};
