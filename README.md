# CanvasPilot

**Live Demo:** [https://canvaspilottinyfishai.vercel.app/](https://canvaspilottinyfishai.vercel.app/) | **Video Demo:** [![YouTube](https://img.shields.io/badge/YouTube-%23FF0000.svg?style=flat&logo=YouTube&logoColor=white)](https://youtu.be/SY2ykzZFlPE)

so CanvasPilot is a TinyFish agent for Canvas LMS, it signs in to my own University of Auckland Canvas account using a browser session i saved, reads what is due, what got graded and what the lecturers announced, and gives me one digest plus a calendar file i can drop into Google Calendar. I built this because every Monday i was opening five courses one by one just to find out what was due this week and whether anything got marked, so this is the thing i set up once and run every week of the semester.

## Features

you pick what you want collected, for suppose you only care about due dates and grades, and it goes and gets just that, and everything is read only so nothing gets submitted or marked as read by accident.

* **Weekly digest:** Overdue / due today / coming up, new grades with the instructor's written feedback, announcements from the last 7 days, and unread inbox if you want it.
* **Signed-in, without passwords:** Uses a TinyFish Browser Context Profile, so you log in to Canvas yourself once (SSO and MFA are fine) and the agent reuses that session. The app never sees a password.
* **Exact due dates from your calendar feed:** TinyFish Fetch reads your private Canvas calendar feed (.ics) live, so times are exact and it works even when the agent is off.
* **Sync to your calendar:** One click exports an .ics with a reminder the day before for every deadline.
* **Deadline monitor:** TinyFish Monitor re-reads your feed on a cron schedule and posts to a webhook (Discord, Slack, Zapier) when something is added, moved or removed.
* **Recording friendly:** A blur toggle hides names, courses and scores for demo videos.
* **Bring Your Own Key:** Add your own TinyFish API key in the UI and it stays in your browser.

## Tech Stack

so the tech stack is the same as my other TinyFish projects, Next.js and Tailwind CSS for the app and the TinyFish API does all the actual work on the live Canvas site, you can check it out at [https://www.tinyfish.ai/](https://www.tinyfish.ai/).

* **Next.js** & **React**
* **Tailwind CSS**
* **TinyFish API** ([https://www.tinyfish.ai/](https://www.tinyfish.ai/)) — Agent, Fetch and Monitor
* **TypeScript**

## How TinyFish is Used

so how is TinyFish used in this project? three endpoints, and each one does something the others can't.

### 1. TinyFish Agent
this is the main one, the Agent opens Canvas inside the browser profile i saved (`use_profile: true`) so it is already signed in, then it walks the Dashboard to-do list and agenda, opens the Grades page for each course and reads the comment bubbles, goes through announcements and the inbox, and returns everything as structured JSON through an `output_schema`. the goal tells it to treat page content as untrusted data, stay on the Canvas domain, and never submit, upload, post or reply. if Canvas shows a login screen it stops and the app tells you to re-save your profile.

### 2. TinyFish Fetch
Canvas gives every student a private calendar feed URL (Calendar → Calendar Feed), and that is just an iCalendar document, so Fetch reads it live with `ttl: 0`, no login needed. i parse the VEVENTs for due dates, course codes and links, and then merge them with the agent's results so each deadline has the exact timestamp from the feed and the submitted / missing status from the signed-in session.

### 3. TinyFish Monitor
the Monitor is a `fetch` type page monitor on that same calendar feed with a cron schedule (default 7am Auckland time), so TinyFish takes a baseline, re-reads it every day, and sends the run to your webhook, which is how you find out a deadline moved without opening Canvas at all. you can create, run-now and delete monitors from the Monitor tab.

## Setup & Installation

so to run this on your machine you first need to install the dependencies and configure your environment.

### Prerequisites
* Node.js 22+ installed on your machine
* A TinyFish API key
* A Canvas account at your university

### One-time TinyFish setup
1. in the TinyFish dashboard open **Browser Context Profiles → Create Profile → Create and set up**, sign in to your Canvas in the setup browser, then save it. (you can mark it as default or copy the profile id into the app)
2. in Canvas open **Calendar → Calendar Feed** and copy the link, you paste that into the app sidebar.

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Chethan-4255/canvaspilot_tinyfish.ai.git
   cd canvaspilot_tinyfish.ai
   ```

2. **Install the dependencies:**
   ```bash
   npm install
   ```

3. **Configure your API key:**
   you need to create a `.env` file in the root folder and put your key in it.
   ```bash
   TINYFISH_API_KEY=your_api_key_here
   CANVAS_BASE_URL=https://canvas.auckland.ac.nz
   # optional, both can also be set in the app UI instead
   CANVAS_CALENDAR_FEED_URL=
   TINYFISH_PROFILE_ID=
   ```
   *(Note: You can also skip the key and enter it directly in the app's API Key Settings when it's running!)*

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   open the localhost link provided in the terminal to see the app working.

5. **Run the tests (optional):**
   ```bash
   npm test
   ```

## Which LMS and what gets handled

* **LMS:** Canvas at the University of Auckland (`canvas.auckland.ac.nz`), on my own student account. the Canvas address is a setting so it works for any Canvas instance.
* **Recurring task automated end to end:** the Monday digest, what is due in the next N days with submission status, new grades plus feedback, announcements, inbox, exported to a calendar file. plus the daily monitor on the feed.
* **Credentials and privacy:** no passwords in code or in the app, only a browser session i created myself in the TinyFish dashboard, read only instructions, and digests stay in the browser's local storage. the `demo/` folder has a sample run against a public .ics feed only, the app never reads those files.

## Links

* **Live Demo:** [https://canvaspilottinyfishai.vercel.app/](https://canvaspilottinyfishai.vercel.app/)
* **Video Demo:** [![YouTube](https://img.shields.io/badge/YouTube-%23FF0000.svg?style=flat&logo=YouTube&logoColor=white)](https://youtu.be/SY2ykzZFlPE)
* **Developer:** Chethan Vasthaw Tippani
* **LinkedIn:** [https://www.linkedin.com/in/chethan-vasthaw/](https://www.linkedin.com/in/chethan-vasthaw/)
* **Portfolio:** [https://chethan-4255.github.io/Portfolio/](https://chethan-4255.github.io/Portfolio/)
* **GitHub Repository:** [chethan-4255/canvaspilot_tinyfish.ai](https://github.com/Chethan-4255/canvaspilot_tinyfish.ai)
