const {deepCheck,getKey}=require('./_gemini');
module.exports=async(req,res)=>{
  const out={service:'FitFirst nutrition API',status:'online',database:process.env.SUPABASE_URL&&process.env.SUPABASE_SERVICE_ROLE_KEY?'configured':'not-configured',usda:process.env.USDA_API_KEY?'configured':'not-configured',vision:getKey()?'configured':'not-configured',visionProvider:'Gemini',region:process.env.VERCEL_REGION||null,timestamp:new Date().toISOString()};
  // /api/health?check=1[&models=a,b] sends a tiny real request to each Gemini model and reports status + speed.
  if(req.query&&req.query.check)out.geminiCheck=await deepCheck(String(req.query.models||'').split(',').map(x=>x.trim()).filter(Boolean));
  res.setHeader('Cache-Control','no-store');
  res.status(200).json(out);
};
