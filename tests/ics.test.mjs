import test from "node:test";
import assert from "node:assert/strict";
import {parseCalendar,buildIcs,inWindow} from "../lib/ics.ts";

const sample=`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Instructure Inc//Canvas Calendar//EN
BEGIN:VEVENT
DTSTAMP:20261001T000000Z
UID:event-assignment-123456
DTSTART:20261012T105900Z
SUMMARY:Assignment 2 - Agents and Planning [COMPSCI 367]
URL:https://canvas.auckland.ac.nz/courses/1/assignments/123456
END:VEVENT
BEGIN:VEVENT
UID:event-calendar-event-77
DTSTART;VALUE=DATE:20261015
DTEND;VALUE=DATE:20261016
SUMMARY:Mid-semester break starts
END:VEVENT
BEGIN:VEVENT
UID:event-assignment-999
DTSTART;TZID=Pacific/Auckland:20261020T235900
SUMMARY:Quiz 3\\, chapters 5-6 [STATS 101]
URL:https://canvas.auckland.ac.nz/courses/2/quizzes/9
END:VEVENT
END:VCALENDAR`;

test("parses Canvas events with course codes and kinds",()=>{
 const items=parseCalendar(sample,"https://canvas.auckland.ac.nz");
 assert.equal(items.length,3);
 assert.equal(items[0].title,"Assignment 2 - Agents and Planning");
 assert.equal(items[0].course,"COMPSCI 367");
 assert.equal(items[0].kind,"assignment");
 assert.equal(items[0].due,"2026-10-12T10:59:00.000Z");
 assert.equal(items[1].course,"");
 assert.equal(items[1].url,"https://canvas.auckland.ac.nz/calendar");
 assert.equal(items[2].title,"Quiz 3, chapters 5-6");
 assert.equal(items[2].kind,"quiz");
});
test("floating Auckland times convert to UTC",()=>{
 const items=parseCalendar(sample,"https://canvas.auckland.ac.nz");
 // 23:59 NZDT (UTC+13 in October) is 10:59 UTC.
 assert.equal(items[2].due,"2026-10-20T10:59:00.000Z");
});
test("window filter keeps near deadlines only",()=>{
 const items=parseCalendar(sample,"https://canvas.auckland.ac.nz");
 const now=new Date("2026-10-11T00:00:00Z");
 assert.deepEqual(items.filter(i=>inWindow(i,7,now)).map(i=>i.title),["Assignment 2 - Agents and Planning","Mid-semester break starts"]);
});
test("exports a valid calendar with alarms",()=>{
 const ics=buildIcs(parseCalendar(sample,"https://canvas.auckland.ac.nz"));
 assert.match(ics,/BEGIN:VCALENDAR\r\n/);
 assert.equal((ics.match(/BEGIN:VEVENT/g)||[]).length,3);
 assert.match(ics,/SUMMARY:Quiz 3\\, chapters 5-6 \[STATS 101\]/);
 assert.match(ics,/TRIGGER:-P1D/);
});
