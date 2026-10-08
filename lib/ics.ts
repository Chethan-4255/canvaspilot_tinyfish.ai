import type {Deadline} from "./types";
// Canvas calendar feeds are plain iCalendar. We only need VEVENT summaries, dates, urls and the course name Canvas appends in brackets.
function unfold(text:string){return text.replace(/\r?\n[ \t]/g,"")}
function unescapeText(v:string){return v.replace(/\\n/g,"\n").replace(/\\,/g,",").replace(/\\;/g,";").replace(/\\\\/g,"\\")}
export function parseIcsDate(v:string,params:string){
 const m=v.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?$/);if(!m)return null;
 const [,y,mo,d,h="0",mi="0",s="0",z]=m;
 if(z||!h)return new Date(Date.UTC(+y,+mo-1,+d,+h,+mi,+s));
 // Canvas emits floating local times with TZID; treat them as Pacific/Auckland by default so the digest matches the student's clock.
 const tz=/TZID=([^;:]+)/.exec(params)?.[1]||"Pacific/Auckland";
 const guess=new Date(Date.UTC(+y,+mo-1,+d,+h,+mi,+s));
 try{const parts=new Intl.DateTimeFormat("en-US",{timeZone:tz,hour12:false,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit"}).formatToParts(guess);const g=(t:string)=>+(parts.find(p=>p.type===t)?.value||0);const asTz=Date.UTC(g("year"),g("month")-1,g("day"),g("hour")%24,g("minute"),g("second"));return new Date(guess.getTime()-(asTz-guess.getTime()))}catch{return guess}
}
export function parseCalendar(ics:string,canvasUrl:string):Deadline[]{
 const out:Deadline[]=[];const blocks=unfold(ics).split(/BEGIN:VEVENT/).slice(1);
 for(const block of blocks){
  const get=(name:string)=>{const m=new RegExp(`^${name}([^:\\n]*):(.*)$`,"m").exec(block);return m?{params:m[1],value:unescapeText(m[2].trim())}:null};
  const summary=get("SUMMARY")?.value||"Untitled";const start=get("DTSTART");const end=get("DTEND");const url=get("URL")?.value||get("X-ALT-DESC")?.value||"";const uid=get("UID")?.value||summary+start?.value;
  const when=start?parseIcsDate(start.value,start.params):null;const endWhen=end?parseIcsDate(end.value,end.params):null;if(!when)continue;
  // Canvas formats summaries as "Assignment name [COURSE CODE]".
  const courseMatch=/\[([^\]]+)\]\s*$/.exec(summary);const course=courseMatch?.[1]||"";const title=courseMatch?summary.slice(0,courseMatch.index).trim():summary;
  const kind=/quiz/i.test(url)||/\bquiz\b/i.test(title)?"quiz":/discussion/i.test(url)?"discussion":/assignment/i.test(uid)||/assignment/i.test(url)?"assignment":"event";
  const due=(kind==="event"&&endWhen&&endWhen.getTime()-when.getTime()>0?when:when).toISOString();
  const link=url&&/^https?:/i.test(url)?url:canvasUrl.replace(/\/$/,"")+"/calendar";
  out.push({id:uid.slice(0,120),title,course,due,url:link,source:"calendar",kind,status:"unknown"});
 }
 return out.sort((a,b)=>a.due.localeCompare(b.due));
}
export function inWindow(d:Deadline,days:number,now=new Date()){const t=new Date(d.due).getTime();return t>=now.getTime()-6*3600e3&&t<=now.getTime()+days*86400e3}
function icsEscape(v:string){return v.replace(/\\/g,"\\\\").replace(/;/g,"\\;").replace(/,/g,"\\,").replace(/\r?\n/g,"\\n")}
function stamp(d:Date){return d.toISOString().replace(/[-:]/g,"").replace(/\.\d{3}/,"")}
export function buildIcs(deadlines:Deadline[]){
 const lines=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//CanvasPilot//Deadlines//EN","CALSCALE:GREGORIAN","X-WR-CALNAME:CanvasPilot deadlines"];
 for(const d of deadlines){const due=new Date(d.due);lines.push("BEGIN:VEVENT",`UID:canvaspilot-${d.id.replace(/[^a-z0-9@.-]/gi,"")}`,`DTSTAMP:${stamp(new Date())}`,`DTSTART:${stamp(due)}`,`DTEND:${stamp(new Date(due.getTime()+30*60e3))}`,`SUMMARY:${icsEscape(`${d.title}${d.course?` [${d.course}]`:""}`)}`,`DESCRIPTION:${icsEscape(`${d.kind} · ${d.status}${d.points?` · ${d.points}`:""}\n${d.url}`)}`,`URL:${d.url}`,"BEGIN:VALARM","TRIGGER:-P1D","ACTION:DISPLAY",`DESCRIPTION:${icsEscape(d.title+" is due tomorrow")}`,"END:VALARM","END:VEVENT")}
 lines.push("END:VCALENDAR");return lines.join("\r\n")+"\r\n";
}
