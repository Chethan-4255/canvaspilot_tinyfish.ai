export const dynamic="force-dynamic";
export function GET(){return Response.json({serverKey:!!process.env.TINYFISH_API_KEY,canvasUrl:process.env.CANVAS_BASE_URL||"",feedConfigured:!!process.env.CANVAS_CALENDAR_FEED_URL,profileConfigured:!!process.env.TINYFISH_PROFILE_ID})}
