import {z} from "zod";
import {createMonitor,deleteMonitor,listMonitors,runMonitorNow,safeFeedUrl} from "@/lib/tinyfish";
export const dynamic="force-dynamic";
function keyFrom(request:Request){return request.headers.get("x-tinyfish-api-key")||process.env.TINYFISH_API_KEY||""}
function sameOrigin(request:Request){const origin=request.headers.get("origin");return !origin||new URL(origin).host===new URL(request.url).host}
function fail(e:unknown,status=502){return Response.json({error:e instanceof Error?e.message:"Monitor request failed."},{status})}
export async function GET(request:Request){const key=keyFrom(request);if(!key)return Response.json({error:"TinyFish API key is missing."},{status:503});try{return Response.json({monitors:await listMonitors(key)})}catch(e){return fail(e)}}
const createSchema=z.object({feedUrl:z.string().trim().max(600),cron:z.string().trim().regex(/^(CRON_TZ=[\w/+-]+ )?(\S+\s+){4}\S+$/,"Use a five-field cron expression."),webhook:z.string().trim().max(400).optional()}).strict();
export async function POST(request:Request){
 if(!sameOrigin(request))return Response.json({error:"Cross-origin requests are not allowed."},{status:403});
 const key=keyFrom(request);if(!key)return Response.json({error:"TinyFish API key is missing."},{status:503});
 let body;try{body=createSchema.parse(await request.json())}catch{return Response.json({error:"Check the feed URL and schedule."},{status:400})}
 const feed=safeFeedUrl(body.feedUrl||process.env.CANVAS_CALENDAR_FEED_URL||"");if(!feed)return Response.json({error:"A public https calendar feed URL is required to create a monitor."},{status:400});
 const webhook=body.webhook?safeFeedUrl(body.webhook):null;if(body.webhook&&(!webhook||!webhook.startsWith("https://")))return Response.json({error:"Webhook must be a public https URL."},{status:400});
 try{return Response.json({monitor:await createMonitor(feed,body.cron,webhook||undefined,key)},{status:201})}catch(e){return fail(e)}
}
export async function PUT(request:Request){
 if(!sameOrigin(request))return Response.json({error:"Cross-origin requests are not allowed."},{status:403});
 const key=keyFrom(request);if(!key)return Response.json({error:"TinyFish API key is missing."},{status:503});
 const id=new URL(request.url).searchParams.get("id")||"";if(!/^[\w-]{4,80}$/.test(id))return Response.json({error:"Invalid monitor id."},{status:400});
 try{return Response.json({run:await runMonitorNow(id,key)})}catch(e){return fail(e)}
}
export async function DELETE(request:Request){
 if(!sameOrigin(request))return Response.json({error:"Cross-origin requests are not allowed."},{status:403});
 const key=keyFrom(request);if(!key)return Response.json({error:"TinyFish API key is missing."},{status:503});
 const id=new URL(request.url).searchParams.get("id")||"";if(!/^[\w-]{4,80}$/.test(id))return Response.json({error:"Invalid monitor id."},{status:400});
 try{return Response.json(await deleteMonitor(id,key))}catch(e){return fail(e)}
}
