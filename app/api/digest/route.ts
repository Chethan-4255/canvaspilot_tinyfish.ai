import {z} from "zod";
import {buildDigest,safeCanvasUrl,safeFeedUrl} from "@/lib/tinyfish";
export const dynamic="force-dynamic";
export const maxDuration=300;
const schema=z.object({canvasUrl:z.string().trim().url().max(200),feedUrl:z.string().trim().max(600),profileId:z.string().trim().max(120),days:z.number().int().min(1).max(30),tasks:z.object({todo:z.boolean(),grades:z.boolean(),announcements:z.boolean(),inbox:z.boolean()}).strict()}).strict();
export async function POST(request:Request){
 const origin=request.headers.get("origin");if(origin&&new URL(origin).host!==new URL(request.url).host)return Response.json({error:"Cross-origin requests are not allowed."},{status:403});
 let raw;try{const text=await request.text();if(text.length>4000)return Response.json({error:"Request is too large."},{status:413});raw=JSON.parse(text)}catch{return Response.json({error:"Invalid request."},{status:400})}
 const parsed=schema.safeParse(raw);if(!parsed.success)return Response.json({error:"Please check your Canvas URL and settings."},{status:400});
 const canvasUrl=safeCanvasUrl(parsed.data.canvasUrl);if(!canvasUrl)return Response.json({error:"Canvas URL must be a public https address."},{status:400});
 if(parsed.data.feedUrl&&!safeFeedUrl(parsed.data.feedUrl))return Response.json({error:"Calendar feed URL must be a public https address."},{status:400});
 const key=request.headers.get("x-tinyfish-api-key")||process.env.TINYFISH_API_KEY;if(!key)return Response.json({error:"TinyFish API key is missing. Add it in Settings or configure it on the server."},{status:503});
 const settings={...parsed.data,canvasUrl,feedUrl:parsed.data.feedUrl||process.env.CANVAS_CALENDAR_FEED_URL||"",profileId:parsed.data.profileId||process.env.TINYFISH_PROFILE_ID||""};
 const encoder=new TextEncoder();const controller=new AbortController();request.signal.addEventListener("abort",()=>controller.abort(),{once:true});
 const stream=new ReadableStream({async start(c){let open=true;const send=(value:unknown)=>{if(open)try{c.enqueue(encoder.encode(JSON.stringify(value)+"\n"))}catch{open=false;controller.abort()}};const heartbeat=setInterval(()=>send({type:"heartbeat"}),12000);
  try{const digest=await buildDigest(settings,key,message=>send({type:"progress",message}),controller.signal);send({type:"result",data:digest})}catch(e){send({type:"error",message:e instanceof Error?e.message:"The digest could not be built."})}finally{clearInterval(heartbeat);if(open){open=false;c.close()}}},cancel(){controller.abort()}});
 return new Response(stream,{headers:{"Content-Type":"application/x-ndjson","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
}
