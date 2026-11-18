// POST {query} → AI nutrition estimate for a food typed by the user (used when the database has no match).
const {generateJson}=require('./_gemini');
const clean=(v,max=5000)=>Math.min(max,Math.max(0,Number(v)||0));
module.exports=async(req,res)=>{
  if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({error:'POST only'});}
  const q=String((req.body||{}).query||'').trim().slice(0,120);
  if(q.length<2)return res.status(400).json({error:'Type a food name first.'});
  const prompt=`You estimate nutrition for FitFirst, a calorie tracker used mostly in India. The user typed: "${q.replace(/"/g,"'")}".
Interpret it as the food most people in India would mean (e.g. "egg maggi" = Maggi masala noodles cooked with an egg). Return up to 3 common serving interpretations (e.g. 1 plate, 1 bowl, 1 piece), most likely first. Values are PER SERVING as described, typical home/restaurant preparation including oil.
kcal must be consistent with 4*protein + 4*carbs + 9*fat (±15%).
Return ONLY JSON: {"foods":[{"name":"Egg maggi","serving":"1 pack + 1 egg","grams":280,"kcal":0,"protein_g":0,"carbs_g":0,"fat_g":0,"fiber_g":0}],"note":"short assumption"}.
If the text is not a food or drink, return {"foods":[],"note":"why"}.`;
  const r=await generateJson([{text:prompt}],{timeoutMs:25000,maxOutputTokens:4096});
  if(!r.ok)return res.status(r.code).json({error:r.error});
  const foods=(Array.isArray(r.data.foods)?r.data.foods:[]).slice(0,3).map((f,i)=>{const g=clean(f.grams,3000)||null;const serving=String(f.serving||'1 serving').slice(0,60);
    return {id:'ai-'+Date.now()+'-'+i,name:String(f.name||q).slice(0,80),category:'AI estimate',source:'AI estimate (Gemini)',basis:g&&!/\d\s*g\b/.test(serving)?`${serving} (${Math.round(g)} g)`:serving,grams:g,
      kcal:clean(f.kcal,3000),protein:clean(f.protein_g,300),carbs:clean(f.carbs_g,500),fat:clean(f.fat_g,300),fiber:clean(f.fiber_g,100)};});
  res.status(200).json({foods,note:String(r.data.note||'').slice(0,200),model:r.model});
};
