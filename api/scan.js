const {generateJson}=require('./_gemini');
const ALLOWED=new Set(['image/jpeg','image/png','image/webp']);
const clean=(v,max=5000)=>Math.min(max,Math.max(0,Number(v)||0));

function buildPrompt(notes){
  return `You are the food-vision component of FitFirst, a calorie-tracking app used mostly in India. Inspect the photo and identify each distinct edible item, including rice, curries, chutneys, sides, drinks, sauces and toppings when visible. Use specific everyday Indian names where they apply (e.g. "masala dosa", "sambar", "coconut chutney", "egg maggi", "chicken biryani", "bread omelette").
For each item estimate the edible amount in grams using plate/bowl/hand size cues, and describe it as a household portion (e.g. "2 idlis", "1 katori", "1 pack"). Estimates are uncertain: never imply scale-level accuracy.
Give approximate nutrition PER 100 GRAMS (kcal, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg). kcal must be consistent with 4*protein + 4*carbs + 9*fat (±15%). Account for visible oil/ghee/butter. For packaged items do not guess a brand label.
Return ONLY JSON: {"items":[{"name":"string","portion":"2 idlis","estimated_grams":150,"confidence":"low|medium|high","notes":"short assumptions","estimated_nutrition":{"kcal":0,"protein_g":0,"carbs_g":0,"fat_g":0,"fiber_g":0,"sugar_g":0,"sodium_mg":0}}],"meal_notes":"one short sentence describing the meal","uncertainty":"main uncertainty, short"}.
If no food is visible, return an empty items array and explain in meal_notes.
User notes (trust these over the photo for quantities/ingredients): ${String(notes||'none').slice(0,400)}`;
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
  const items=(Array.isArray(parsed.items)?parsed.items:[]).slice(0,15).map(x=>{const n=x.estimated_nutrition||{};
    return {name:String(x.name||'Unidentified food').slice(0,100),portion:String(x.portion||'').slice(0,60),estimated_grams:clean(x.estimated_grams,3000)||100,confidence:['low','medium','high'].includes(x.confidence)?x.confidence:'low',notes:String(x.notes||'').slice(0,250),
      estimated_nutrition:{kcal:clean(n.kcal,1000),protein_g:clean(n.protein_g,100),carbs_g:clean(n.carbs_g,100),fat_g:clean(n.fat_g,100),fiber_g:clean(n.fiber_g,100),sugar_g:clean(n.sugar_g,100),sodium_mg:clean(n.sodium_mg,10000)}};});
  res.status(200).json({items,meal_notes:String(parsed.meal_notes||''),uncertainty:String(parsed.uncertainty||''),model:r.model,notice:'Foods, portions and nutrition are AI estimates. Review before saving.'});
};
