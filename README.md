# Expert — Daily Email Course System

A reusable system for generating expert-level daily email courses on any subject, delivered automatically via Gmail, with a PWA dashboard to manage delivery.

Built for Tom Mulliner, President, Royal Miniature Society.

---

## How It Works

1. **Google Apps Script** stores all course chapters as HTML and sends one per day to your Gmail at 7am via a time-driven trigger.
2. **A PWA dashboard** (installable web app) connects to the Apps Script backend to show progress, preview chapters, and control delivery (pause, resume, skip, reset).
3. **Claude** generates the course content — all chapters, illustrated with public domain images, with quizzes, key terms, and expert talking points.

---

## Repository Structure

```
/
├── README.md                          # This file
├── courses/
│   └── 01-miniature-painting/
│       ├── miniature_painting_course.gs   # Google Apps Script (all chapters + automation)
│       └── miniature_painting_pwa.html    # PWA dashboard
└── template/
    ├── COURSE_TEMPLATE.gs             # Blank Apps Script template for new courses
    └── pwa_template.html              # Reusable PWA (just change the title/config)
```

---

## Setup Instructions (One Time Per Course)

### Step 1 — Open Google Apps Script

1. Go to [https://script.google.com](https://script.google.com)
2. Click **New project** (top left)
3. Give the project a name (e.g. "Miniature Painting Course")

### Step 2 — Paste the Course Script

1. In the code editor, **select all existing code and delete it**
2. Open `miniature_painting_course.gs` from this repo
3. **Copy the entire contents** and paste into the editor
4. Press **Ctrl+S** (Windows) or **Cmd+S** (Mac) to save

### Step 3 — Run the Setup Function

1. In the toolbar, click the **function dropdown** (it may say "select function" or show a function name)
2. Select **`setup`** from the dropdown
3. Click the **▶ Run** button (play icon)
4. A permissions dialog will appear — click:
   - **Review permissions**
   - **Advanced**
   - **Go to [Project Name] (unsafe)** — this is Google's standard warning for any script accessing Gmail; it is safe to proceed
   - **Allow**
5. Check the **Execution log** at the bottom of the screen
6. You should see: `✅ Setup complete. Daily trigger set for 7am.`

> This installs a time-driven trigger that fires `sendDailyChapter()` every day at 7am. It only needs to be run once.

### Step 4 — Deploy as Web App

1. Click **Deploy** (top right) → **New deployment**
2. Click the gear icon next to "Select type" → choose **Web app**
3. Fill in the settings:
   - **Description:** (optional, e.g. "Miniature Course API")
   - **Execute as:** Me
   - **Who has access:** Anyone
4. Click **Deploy**
5. **Copy the Web App URL** — it looks like:
   `https://script.google.com/macros/s/AKfycbyZFeKTfH2-TcfNpmqS93sGQnJqGTFDyeGyfLD_rbSrueO7OYXANcBI9VJvjbcS67hUOg/exec`
6. Keep this URL — you'll need it for the PWA

> If you update the script later, you must create a **New deployment** (not edit existing) for changes to take effect.

### Step 5 — Set Up the PWA

1. Download `miniature_painting_pwa.html` from this repo
2. Open it in **Chrome** or **Safari**
3. At the top of the page, paste your **Web App URL** into the input field
4. Click **Save URL**
5. The PWA will connect and show live course status

### Step 6 — Install the PWA to Your Home Screen

**On iPhone/iPad (Safari):**
1. Tap the **Share** button (box with arrow)
2. Scroll down → tap **Add to Home Screen**
3. Tap **Add**

**On Android (Chrome):**
1. Tap the **three-dot menu**
2. Tap **Add to Home Screen** or **Install app**

**On Desktop (Chrome):**
1. Look for the **install icon** (⊕) in the address bar
2. Click it → **Install**

---

## Daily Operation

Once set up, the system runs automatically:

- **7am every day** → next chapter sent to `tomrmulliner@gmail.com`
- **PWA dashboard** shows which chapter is next, progress, and last sent date
- **Controls available:** Send Now / Pause / Resume / Skip Chapter / Reset / Preview any chapter

---

## Creating a New Course (Reuse for Subject 3, 4, 5…)

### Step 1 — Ask Claude to Generate the Course

Use this prompt template with Claude:

```
I want to become an expert in [SUBJECT].

Please build me the full Google Apps Script + PWA system using the same 
architecture as the miniature painting course in my Expert GitHub repo.

Recipient email: tomrmulliner@gmail.com
Subject: [SUBJECT]
Number of chapters: [NUMBER or "as many as needed for genuine expertise"]

Generate:
1. A complete [subject]_course.gs file with all chapters as illustrated HTML,
   public domain image URLs, quizzes, key terms, and expert talking points
2. A [subject]_pwa.html file adapted for this subject
```

### Step 2 — Replace Course Content in the .gs Template

The `COURSE_TEMPLATE.gs` file in `/template/` contains the full automation infrastructure (send logic, web app endpoint, email wrapper) with a blank `CHAPTERS` array. To create a new course:

1. Copy `COURSE_TEMPLATE.gs`
2. Rename it (e.g. `oil_painting_course.gs`)
3. Replace the `CHAPTERS` array with your new course content
4. Update these constants at the top:
   ```javascript
   const RECIPIENT = "tomrmulliner@gmail.com";  // already set
   const COURSE_TITLE = "Your New Course Title"; // change this
   ```

### Step 3 — Deploy the New Course

Follow Steps 1–5 from the Setup Instructions above. Each course is a **separate Apps Script project** with its own trigger and Web App URL.

### Step 4 — Update the PWA

The `pwa_template.html` file works with any course — just paste the new Web App URL when prompted. Alternatively, keep a separate PWA instance per course.

---

## Chapter Format (for Claude Prompt Engineering)

Each chapter in the `.gs` file follows this structure for consistency:

```javascript
{
  title: "Chapter Title",
  subtitle: "Descriptive subtitle",
  body: `
    <p class="lead">Opening paragraph — the hook.</p>
    
    <h3>Section Heading</h3>
    <p>Body text...</p>
    
    <div class="img-block">
      <img src="PUBLIC_DOMAIN_IMAGE_URL" alt="Description">
      <div class="img-caption">Artist, <em>Title</em> (year). Medium. Collection. <a href="URL">Source</a></div>
    </div>
    
    <div class="callout">
      <strong>Label</strong>
      Key insight or quote.
    </div>
    
    <table>...</table>
    
    <div class="key-terms">
      <h4>Key Terms</h4>
      <span class="term">Term 1</span>
      <span class="term">Term 2</span>
    </div>
    
    <div class="quiz">
      <h4>📝 Self-Test</h4>
      <ol>
        <li>Question 1</li>
      </ol>
    </div>
    
    <div class="presidents-edge">
      <h4>🎯 The Expert's Edge</h4>
      <p>Key insight or talking point for public use.</p>
    </div>
  `
}
```

> **Note:** The "President's Edge" section should be renamed to match the context of each course — e.g. "The Practitioner's Edge", "The Collector's Edge", etc.

---

## Troubleshooting

| Problem | Solution |
|---|---|
| `setup()` fails with auth error | Re-run it — sometimes the first auth attempt times out |
| Chapters not sending at 7am | Check Apps Script triggers: **Triggers** (clock icon, left sidebar) — confirm `sendDailyChapter` trigger exists |
| PWA shows "Connection error" | Your Web App URL may have changed after a redeployment. Always create a **New deployment** and update the URL in the PWA |
| Chapter sent twice | Check for duplicate triggers in Apps Script → delete extras, keeping only one `sendDailyChapter` trigger |
| Images not loading in email | Gmail blocks some external images by default. Click "Display images" in the email, or check that image URLs are from major public institutions (Wikimedia, Met, V&A, etc.) |
| "This app isn't verified" warning | Expected for personal Apps Script projects. Click Advanced → proceed. Safe for your own scripts. |

---

## Courses Completed

| # | Subject | Chapters | Status |
|---|---|---|---|
| 1 | History & Technique of Miniature Painting | 12 | ✅ Active |

---

## Notes

- Each Apps Script project has a **6-minute execution limit per run** — well within the needs of a single chapter send
- Google Apps Script free tier allows **20,000 email recipients/day** — far more than needed
- The time-driven trigger fires within a 1-hour window around 7am (Google's scheduling is approximate, not exact to the minute)
- All chapter HTML is self-contained within the `.gs` file — no external dependencies except public domain image URLs

---

*System designed and built with Claude (Anthropic) · May 2026*
