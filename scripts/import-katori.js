// Converts Katori's CSV (https://getkatori.com/data, CC BY 4.0) into data/katori-foods.json.
// Usage: node scripts/import-katori.js ./katori-indian-food-dataset.csv
// Credit: "Data: Katori Indian food nutrition dataset, getkatori.com/data (CC BY 4.0)"
const fs=require('fs'),path=require('path');
const input=process.argv[2];
if(!input){console.error('Usage: node scripts/import-katori.js <Katori CSV path>');process.exit(1);}
function parseCsv(t){const rows=[];let row=[],cell='',q=false;for(let i=0;i<t.length;i++){const c=t[i];if(q){if(c==='"'&&t[i+1]==='"'){cell+='"';i++}else if(c==='"')q=false;else cell+=c}else if(c==='"')q=true;else if(c===','){row.push(cell);cell=''}else if(c==='\n'){row.push(cell);if(row.some(v=>v!==''))rows.push(row);row=[];cell=''}else if(c!=='\r')cell+=c}if(cell||row.length){row.push(cell);rows.push(row)}const h=rows.shift().map(x=>x.trim());return rows.map(r=>Object.fromEntries(h.map((k,i)=>[k,(r[i]||'').trim()])))}
const n=v=>Number(v)||0,r1=v=>Math.round(v*10)/10;
const out=parseCsv(fs.readFileSync(input,'utf8')).filter(r=>r.dish&&n(r.kcal_per_100g)>0).map(r=>{
  const g=n(r.serving_g)||100,s=g/100,prep=r.preparation||'home';
  return {id:`katori-${r.slug}-${prep}`,name:r.dish+(prep==='home'?'':` (${prep})`),category:r.family||'Indian dish',source:'Katori dataset (CC BY 4.0)',
    basis:r.serving||`${g} g`,grams:g,kcal:Math.round(n(r.kcal_per_100g)*s),protein:r1(n(r.protein_g_per_100g)*s),carbs:r1(n(r.carbs_g_per_100g)*s),fat:r1(n(r.fat_g_per_100g)*s),
    fiber:0,sugar:0,sodium:0,confidence:r.confidence||'',url:r.url||'https://getkatori.com/data'};
});
fs.writeFileSync(path.join(__dirname,'..','data','katori-foods.json'),JSON.stringify(out,null,1));
console.log(`Imported ${out.length} Katori rows (per serving) into data/katori-foods.json.`);
