import type {Digest} from "./types";
function fmt(iso:string){const d=new Date(iso);return isNaN(d.getTime())?iso:d.toLocaleString("en-NZ",{weekday:"short",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}
export function digestMarkdown(d:Digest){
 const lines=[`# Canvas digest · ${new Date(d.generatedAt).toLocaleString("en-NZ")}`,"",`Source: ${d.canvasUrl} · ${d.sources.join(" + ")||"no sources"}`,"","## Due soon"];
 if(!d.deadlines.length)lines.push("_Nothing due in this window._");
 for(const x of d.deadlines)lines.push(`- **${fmt(x.due)}** · ${x.title}${x.course?` _(${x.course})_`:""} · ${x.status}${x.points?` · ${x.points}`:""} · [open](${x.url})`);
 lines.push("","## New grades & feedback");if(!d.grades.length)lines.push("_No new grades._");
 for(const g of d.grades){lines.push(`- **${g.assignment}** (${g.course}): ${g.score}${g.outOf?` / ${g.outOf}`:""}${g.gradedAt?` · ${g.gradedAt}`:""}`);if(g.feedback)lines.push(`  > ${g.feedback.replace(/\n+/g," ")}`)}
 lines.push("","## Announcements");if(!d.announcements.length)lines.push("_No new announcements._");
 for(const a of d.announcements)lines.push(`- **${a.title}** (${a.course})${a.postedAt?` · ${a.postedAt}`:""}\n  ${a.summary}${a.url?` · [open](${a.url})`:""}`);
 if(d.inbox.length){lines.push("","## Inbox");for(const m of d.inbox)lines.push(`- **${m.subject}** from ${m.from}${m.receivedAt?` · ${m.receivedAt}`:""}\n  ${m.preview}`)}
 lines.push("",`_Built with TinyFish · Fetch ${d.calls.fetch} · Agent ${d.calls.agent}${d.warnings.length?` · notes: ${d.warnings.join(" | ")}`:""}_`);
 return lines.join("\n");
}
