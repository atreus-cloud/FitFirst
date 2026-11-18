const {checkModels,getKey}=require('./_gemini');
module.exports=async(req,res)=>{
  const out={service:'FitFirst nutrition API',status:'online',database:process.env.SUPABASE_URL&&process.env.SUPABASE_SERVICE_ROLE_KEY?'configured':'not-configured',usda:process.env.USDA_API_KEY?'configured':'not-configured',vision:getKey()?'configured':'not-configured',visionProvider:'Gemini',region:process.env.VERCEL_REGION||null,timestamp:new Date().toISOString()};
  // /api/health?check=1 actually asks Google whether the key + model work (no image, no cost).
  if(req.query&&req.query.check)out.geminiCheck=await checkModels();
  res.setHeader('Cache-Control','no-store');
  res.status(200).json(out);
};
