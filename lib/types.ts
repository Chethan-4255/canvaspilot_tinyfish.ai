export type Settings={canvasUrl:string;feedUrl:string;profileId:string;days:number;tasks:{todo:boolean;grades:boolean;announcements:boolean;inbox:boolean}};
export type Deadline={id:string;title:string;course:string;due:string;url:string;source:"calendar"|"canvas";kind:string;status:"due"|"submitted"|"missing"|"unknown";points?:string};
export type Grade={course:string;assignment:string;score:string;outOf:string;feedback:string;gradedAt:string;url:string};
export type Announcement={course:string;title:string;summary:string;postedAt:string;url:string};
export type InboxItem={from:string;subject:string;preview:string;receivedAt:string};
export type Digest={generatedAt:string;canvasUrl:string;student:string;deadlines:Deadline[];grades:Grade[];announcements:Announcement[];inbox:InboxItem[];calls:{fetch:number;agent:number;monitor:number};sources:string[];warnings:string[];agentSteps:string[];runId:string};
export type MonitorInfo={id:string;name:string;status:string;schedule_cron:string;webhook_url:string|null;created_at:string;config?:{url?:string}};
