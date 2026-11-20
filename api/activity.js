// Activity sync from Samsung Health → Health Connect → "HC Webhook" app → here.
//
//   POST /api/activity?key=<sync key>   HC Webhook sends its JSON payload (steps, exercise, calories, distance, weight)
//   GET  /api/activity?key=<sync key>&days=14   the FitFirst app reads per-day totals
//
// Storage: Upstash Redis (Vercel → Storage → Marketplace → Upstash for Redis, free tier).
// The sync key is a random secret generated on the phone; we only ever store a hash of it.
const crypto=require('crypto');

const REDIS_URL=process.env.KV_REST_API_URL||process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN=process.env.KV_REST_API_TOKEN||process.env.UPSTASH_REDIS_REST_TOKEN;
const TTL=60*60*24*120;               // keep 120 days
const SUM_TYPES={steps:'count',active_calories:'calories',total_calories:'calories',distance:'meters'};

async function redis(commands){
  const r=await fetch(REDIS_URL.replace(/\/$/,'')+'/pipeline',{method:'POST',headers:{Authorization:'Bearer '+REDIS_TOKEN,'Content-Type':'application/json'},body:JSON.stringify(commands),signal:AbortSignal.timeout(8000)});
  if(!r.ok)throw new Error('Redis '+r.status+' '+(await r.text()).slice(0,200));
  return (await r.json()).map(x=>{if(x.error)throw new Error('Redis: '+x.error);return x.result});
}

const userId=key=>crypto.createHash('sha256').update('fitfirst:'+key).digest('hex').slice(0,32);
const num=v=>{const n=Number(v);return Number.isFinite(n)?n:0};

// Local calendar date of a timestamp. Times with an offset ("…+05:30") already carry local time;
// UTC times are converted using the phone's timezone from the payload.
function localDate(ts,tz){
  const s=String(ts||'');
  if(/^\d{4}-\d{2}-\d{2}T.*[+-]\d{2}:?\d{2}$/.test(s))return s.slice(0,10);
  const d=new Date(s);if(isNaN(d))return null;
  try{return new Intl.DateTimeFormat('en-CA',{timeZone:tz||'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(d)}
  catch(_){return d.toISOString().slice(0,10)}
}
const recId=(r,type)=>String(r.metadata?.id||r.id||`${type}|${r.start_time||r.time}|${r.end_time||''}|${r.metadata?.data_origin||''}`).slice(0,120);
const hours=r=>(new Date(r.end_time)-new Date(r.start_time))/36e5;

function prettyExercise(t){
  const s=String(t||'workout').replace(/^EXERCISE_TYPE_/i,'').replace(/_/g,' ').toLowerCase();
  return s.charAt(0).toUpperCase()+s.slice(1);
}

async function ingest(uid,body){
  const tz=body.timezone,cmds=[],touched=new Set(),counts={};
  const key=(date,field)=>`ff:${uid}:${date}:${field}`;
  // steps / calories / distance: daily totals overwrite; raw records are stored by id so re-sent records never double count
  for(const [type,field] of Object.entries(SUM_TYPES)){
    for(const r of Array.isArray(body[type])?body[type]:[]){
      const date=localDate(r.start_time||r.time,tz);if(!date)continue;
      const v=num(r[field]);if(v<0)continue;
      if(r.start_time&&r.end_time&&hours(r)>=20)cmds.push(['HSET',key(date,type),'daily',v]);   // a whole-day total (HC Webhook "Daily" resolution)
      else cmds.push(['HSET',key(date,type),recId(r,type),v]);
      touched.add(key(date,type));counts[type]=(counts[type]||0)+1;
    }
  }
  for(const r of Array.isArray(body.exercise)?body.exercise:[]){
    const date=localDate(r.start_time,tz);if(!date)continue;
    const w={type:prettyExercise(r.type),start:r.start_time,end:r.end_time,minutes:Math.round(num(r.duration_seconds)/60)||Math.round(hours(r)*60),
      distanceM:num(r.distance_meters)||undefined,steps:num(r.steps)||undefined,title:r.title?String(r.title).slice(0,60):undefined};
    cmds.push(['HSET',key(date,'exercise'),recId(r,'exercise'),JSON.stringify(w)]);touched.add(key(date,'exercise'));counts.exercise=(counts.exercise||0)+1;
  }
  for(const r of Array.isArray(body.weight)?body.weight:[]){
    const date=localDate(r.time||r.start_time,tz);const kg=num(r.kilograms??r.weight);
    if(!date||kg<20||kg>400)continue;
    cmds.push(['HSET',key(date,'weight'),'kg',Math.round(kg*10)/10]);touched.add(key(date,'weight'));counts.weight=(counts.weight||0)+1;
  }
  // deletions reported by Health Connect
  for(const d of Array.isArray(body.deleted)?body.deleted:[]){
    if(!d||!d.id)continue;
    // we don't know the date of a deleted record, so remove it from the last 3 days' hashes of that type
    const type=String(d.type||'').toLowerCase();if(!SUM_TYPES[type]&&type!=='exercise')continue;
    for(let i=0;i<3;i++){const dt=new Date(Date.now()-i*864e5).toISOString().slice(0,10);cmds.push(['HDEL',key(dt,type),String(d.id)])}
  }
  touched.forEach(k=>cmds.push(['EXPIRE',k,TTL]));
  cmds.push(['SET',`ff:${uid}:lastSync`,JSON.stringify({at:new Date().toISOString(),app:body.app_version||null,counts})],['EXPIRE',`ff:${uid}:lastSync`,TTL]);
  for(let i=0;i<cmds.length;i+=400)await redis(cmds.slice(i,i+400));
  return counts;
}

async function read(uid,days,to){
  // the app sends its own local "today" (to=YYYY-MM-DD); fall back to India time
  const end=/^\d{4}-\d{2}-\d{2}$/.test(to||'')?new Date(to+'T12:00:00Z'):new Date(Date.now()+5.5*36e5);
  const dates=[...Array(days)].map((_,i)=>new Date(end.getTime()-i*864e5).toISOString().slice(0,10));
  const types=[...Object.keys(SUM_TYPES),'exercise','weight'];
  const cmds=[];dates.forEach(d=>types.forEach(t=>cmds.push(['HGETALL',`ff:${uid}:${d}:${t}`])));cmds.push(['GET',`ff:${uid}:lastSync`]);
  const res=await redis(cmds);
  const obj=a=>{const o={};if(Array.isArray(a))for(let i=0;i<a.length;i+=2)o[a[i]]=a[i+1];else if(a&&typeof a==='object')Object.assign(o,a);return o};
  const total=h=>{if(h.daily!==undefined)return num(h.daily);return Object.values(h).reduce((s,v)=>s+num(v),0)};
  const out={};let k=0;
  for(const d of dates){
    const day={};
    for(const t of types){
      const h=obj(res[k++]);if(!Object.keys(h).length)continue;
      if(t==='exercise')day.workouts=Object.values(h).map(v=>{try{return JSON.parse(v)}catch(_){return null}}).filter(Boolean).sort((a,b)=>String(a.start).localeCompare(String(b.start)));
      else if(t==='weight')day.weightKg=num(h.kg);
      else day[{steps:'steps',active_calories:'activeKcal',total_calories:'totalKcal',distance:'distanceM'}[t]]=Math.round(total(h));
    }
    if(Object.keys(day).length)out[d]=day;
  }
  let lastSync=null;try{lastSync=JSON.parse(res[k])}catch(_){}
  return {days:out,lastSync};
}

module.exports=async(req,res)=>{
  res.setHeader('Cache-Control','no-store');
  if(!REDIS_URL||!REDIS_TOKEN)return res.status(503).json({error:'Activity sync needs a database. In Vercel: Storage → Create → Upstash for Redis (free), connect it to this project, then redeploy.'});
  const key=String(req.query.key||req.headers['x-sync-key']||'').trim();
  if(!/^[a-f0-9]{24,64}$/i.test(key))return res.status(401).json({error:'Missing or invalid sync key. Copy the full webhook URL from FitFirst → Profile → Samsung Health.'});
  const uid=userId(key.toLowerCase());
  try{
    if(req.method==='POST'){
      let body=req.body;if(typeof body==='string'){try{body=JSON.parse(body)}catch(_){body=null}}
      if(!body||typeof body!=='object')return res.status(400).json({error:'Expected a JSON body from HC Webhook.'});
      const counts=await ingest(uid,body);
      return res.status(200).json({ok:true,received:counts});
    }
    if(req.method==='GET'){
      const days=Math.min(60,Math.max(1,parseInt(req.query.days)||14));
      return res.status(200).json(await read(uid,days,String(req.query.to||'')));
    }
    res.setHeader('Allow','GET, POST');return res.status(405).json({error:'GET or POST only'});
  }catch(e){console.error('activity error',e);return res.status(502).json({error:'Could not reach the activity database. Try again in a minute.'})}
};
