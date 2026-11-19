// Shared Gemini helper (files starting with _ are not exposed as Vercel routes).
const MODELS = [process.env.GEMINI_VISION_MODEL, 'gemini-flash-latest', 'gemini-2.5-flash', 'gemini-flash-lite-latest']
  .filter((m, i, a) => m && a.indexOf(m) === i);

function getKey(){ return String(process.env.GEMINI_API_KEY||'').trim().replace(/^["']|["']$/g,''); }

function explain(status, body){
  let msg='', reason='';
  try{ const e=JSON.parse(body).error||{}; msg=e.message||''; reason=(e.details||[]).map(d=>d.reason).filter(Boolean).join(','); }catch(_){ msg=String(body||'').slice(0,200); }
  const all=(msg+' '+reason).toLowerCase();
  if(all.includes('api_key_invalid')||all.includes('api key not valid')||all.includes('api key expired'))
    return {code:401,error:'Your Gemini API key was rejected. Re-copy it from aistudio.google.com/apikey into Vercel → Settings → Environment Variables (no quotes or spaces), then Redeploy.'};
  if(all.includes('location is not supported'))
    return {code:403,error:'Gemini is not available from this server region. In Vercel → Settings → Functions, set the region to Mumbai (bom1) or a US region, then redeploy.'};
  if(status===403)
    return {code:403,error:'This API key is not allowed to use Gemini (permission denied). Create a fresh key in Google AI Studio, or remove API restrictions on the key.'};
  if(status===429)
    return {code:429,error:'Gemini quota or rate limit reached. Wait a minute and try again; if it keeps happening, check your quota in Google AI Studio.'};
  if(status>=500)
    return {code:502,error:'Gemini is having trouble right now. Please try again in a moment.'};
  return {code:502,error:`Gemini error ${status}${msg?': '+msg.slice(0,220):''}`};
}

function extractJson(text){
  const cleaned=String(text||'').trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'');
  const start=cleaned.indexOf('{'), end=cleaned.lastIndexOf('}');
  if(start<0||end<=start) throw new Error('Model returned no JSON object');
  return JSON.parse(cleaned.slice(start,end+1));
}

// Returns {ok:true,data,model} or {ok:false,code,error}
async function generateJson(parts,{timeoutMs=45000,maxOutputTokens=8192,perModelMs=22000}={}){
  const deadline=Date.now()+timeoutMs;
  const key=getKey();
  if(!key) return {ok:false,code:503,error:'AI features are not set up yet. Add GEMINI_API_KEY in Vercel → Settings → Environment Variables, then redeploy.'};
  // Low thinking keeps answers fast (the default 'latest' Flash thinks a lot and can take 25 s+).
  const reqBody=thinking=>JSON.stringify({contents:[{role:'user',parts}],generationConfig:{temperature:0.15,maxOutputTokens,responseMimeType:'application/json',...(thinking?{thinkingConfig:{thinkingLevel:'low'}}:{})}});
  let lastErr=null;
  try{
    for(const model of MODELS){
      const url=`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
      const left=deadline-Date.now();if(left<4000)break;
      const call=thinking=>fetch(url,{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},body:reqBody(thinking),signal:AbortSignal.timeout(Math.min(perModelMs,deadline-Date.now()))});
      let r;
      try{r=await call(true);}catch(e){
        const timeout=e&&(e.name==='TimeoutError'||e.name==='AbortError');
        console.error('Gemini',model,timeout?'timed out':'request error',e.message);
        lastErr={status:timeout?504:502,body:JSON.stringify({error:{message:timeout?'timeout':e.message}})};continue;
      }
      if(r.status===400){const t=await r.clone().text();if(/thinking/i.test(t)){console.warn('Model rejected thinkingLevel, retrying without',model);r=await call(false);}}
      if(r.ok){
        const result=await r.json();
        const cand=result.candidates?.[0];
        const text=cand?.content?.parts?.filter(p=>!p.thought).map(p=>p.text||'').join('')||'';
        if(!text){console.error('Gemini empty response',model,cand?.finishReason,JSON.stringify(result.promptFeedback||{}));
          return {ok:false,code:502,error:cand?.finishReason==='SAFETY'||result.promptFeedback?.blockReason?'Gemini declined this request. Try a different photo or wording.':'Gemini returned no answer'+(cand?.finishReason?' ('+cand.finishReason+')':'')+'. Please try again.'};}
        try{ return {ok:true,data:extractJson(text),model}; }
        catch(e){ console.error('Bad JSON from Gemini',text.slice(0,800)); return {ok:false,code:502,error:'Gemini gave an unreadable answer. Please try again.'}; }
      }
      const body=await r.text();
      console.error('Gemini call failed',model,r.status,body.slice(0,1200));
      lastErr={status:r.status,body};
      // try the next model when this one doesn't exist, is overloaded (5xx) or rate-limited (429)
      const modelProblem=r.status===404||r.status===429||r.status>=500||(r.status===400&&/model|not found|not supported for generatecontent/i.test(body)&&!/api key/i.test(body));
      if(!modelProblem) break;
    }
  }catch(e){
    console.error('Gemini request error',e);
    const timeout=e&&(e.name==='TimeoutError'||e.name==='AbortError');
    return {ok:false,code:timeout?504:502,error:timeout?'Gemini took too long to answer. Please try again.':'Could not reach Gemini. Please try again.'};
  }
  if(!lastErr)return {ok:false,code:504,error:'Gemini took too long to answer. Please try again.'};
  if(lastErr.status===504)return {ok:false,code:504,error:'Gemini is responding very slowly right now. Please try again in a minute.'};
  const e=explain(lastErr.status,lastErr.body);
  return {ok:false,...e};
}

// Real end-to-end test: tiny generateContent per model, reports status + latency (used by /api/health?check=1)
async function deepCheck(){
  const key=getKey(); if(!key) return {ok:false,error:'GEMINI_API_KEY not set'};
  const results=await Promise.all(MODELS.map(async model=>{
    const t=Date.now();
    try{
      const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},
        body:JSON.stringify({contents:[{role:'user',parts:[{text:'Reply with exactly {"ok":true}'}]}],generationConfig:{maxOutputTokens:512,responseMimeType:'application/json',thinkingConfig:{thinkingLevel:'low'}}}),signal:AbortSignal.timeout(20000)});
      const body=await r.text();let msg='';try{msg=JSON.parse(body).error?.message||''}catch(_){}
      return {model,status:r.status,ms:Date.now()-t,ok:r.ok,error:r.ok?undefined:(msg||body).slice(0,300)};
    }catch(e){return {model,ok:false,ms:Date.now()-t,error:e.name==='TimeoutError'?'timed out after 20 s':e.message}}
  }));
  return {ok:results.some(r=>r.ok),results};
}

// Lightweight check
async function checkModels(){
  const key=getKey(); if(!key) return {ok:false,error:'GEMINI_API_KEY not set'};
  const out=[];
  for(const model of MODELS){
    try{
      const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}`,{headers:{'x-goog-api-key':key},signal:AbortSignal.timeout(8000)});
      if(r.ok){out.push({model,ok:true});return {ok:true,model,tried:out};}
      const body=await r.text();out.push({model,ok:false,status:r.status});
      if(r.status!==404){return {ok:false,tried:out,error:explain(r.status,body).error};}
    }catch(e){out.push({model,ok:false,error:e.message});}
  }
  return {ok:false,tried:out,error:'None of the Gemini models are available to this key.'};
}

module.exports={generateJson,checkModels,deepCheck,getKey,MODELS};
