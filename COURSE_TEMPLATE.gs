// ============================================================
// EXPERT COURSE SYSTEM — Google Apps Script Template
// ============================================================
// INSTRUCTIONS:
// 1. Copy this file and rename it (e.g. oil_painting_course.gs)
// 2. Update RECIPIENT and COURSE_TITLE below
// 3. Replace the CHAPTERS array with your course content
// 4. Run setup() once to install the 7am daily trigger
// 5. Deploy as Web App (Execute as: Me | Access: Anyone)
// 6. Paste the Web App URL into the PWA dashboard
// ============================================================

const RECIPIENT = "tomrmulliner@gmail.com";
const COURSE_TITLE = "YOUR COURSE TITLE HERE";

// ── Utility ──────────────────────────────────────────────────

function getProps() { return PropertiesService.getScriptProperties(); }

function getState() {
  const p = getProps();
  return {
    currentChapter: parseInt(p.getProperty('currentChapter') || '0'),
    paused:         p.getProperty('paused') === 'true',
    startDate:      p.getProperty('startDate') || '',
    lastSent:       p.getProperty('lastSent') || 'Never'
  };
}

function setState(updates) {
  const p = getProps();
  Object.keys(updates).forEach(k => p.setProperty(k, String(updates[k])));
}

// ── Setup ────────────────────────────────────────────────────

function setup() {
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('sendDailyChapter')
    .timeBased()
    .everyDays(1)
    .atHour(7)
    .create();
  setState({ currentChapter: 0, paused: false, startDate: new Date().toISOString() });
  Logger.log('✅ Setup complete. Daily trigger set for 7am. Run sendDailyChapter() to test.');
}

// ── Main send function ────────────────────────────────────────

function sendDailyChapter() {
  const state = getState();
  if (state.paused) { Logger.log('⏸ Course paused.'); return; }
  const idx = state.currentChapter;
  if (idx >= CHAPTERS.length) {
    Logger.log('🎓 Course complete!');
    sendCompletionEmail();
    return;
  }
  const ch = CHAPTERS[idx];
  const subject = `📜 ${COURSE_TITLE} | Chapter ${idx + 1} of ${CHAPTERS.length}: ${ch.title}`;
  GmailApp.sendEmail(RECIPIENT, subject, '', {
    htmlBody: wrapEmail(ch, idx + 1, CHAPTERS.length),
    name: COURSE_TITLE
  });
  setState({ currentChapter: idx + 1, lastSent: new Date().toISOString() });
  Logger.log(`✅ Sent Chapter ${idx + 1}: ${ch.title}`);
}

function sendCompletionEmail() {
  GmailApp.sendEmail(RECIPIENT, `🎓 ${COURSE_TITLE} — Complete!`, '',
    { htmlBody: `<div style="font-family:Georgia,serif;padding:40px;text-align:center;"><h1>🎓 Course Complete!</h1><p>You have completed <em>${COURSE_TITLE}</em>.</p></div>`, name: COURSE_TITLE });
}

// ── Web App endpoint ──────────────────────────────────────────

function doGet(e) {
  const action = e && e.parameter && e.parameter.action ? e.parameter.action : 'status';
  let result = {};
  switch(action) {
    case 'status':
      result = getState();
      result.totalChapters = CHAPTERS.length;
      result.chapters = CHAPTERS.map((c,i) => ({ index: i, title: c.title, subtitle: c.subtitle || '' }));
      break;
    case 'pause':   setState({ paused: true });  result = { success: true, message: 'Paused.' }; break;
    case 'resume':  setState({ paused: false }); result = { success: true, message: 'Resumed.' }; break;
    case 'sendNow': sendDailyChapter();           result = { success: true, message: 'Chapter sent.' }; break;
    case 'reset':   setState({ currentChapter: 0, paused: false }); result = { success: true, message: 'Reset to Chapter 1.' }; break;
    case 'skip':
      const s = getState();
      if (s.currentChapter < CHAPTERS.length) setState({ currentChapter: s.currentChapter + 1 });
      result = { success: true, message: 'Skipped.' }; break;
    case 'preview':
      const pi = parseInt(e.parameter.index || '0');
      result = (pi >= 0 && pi < CHAPTERS.length)
        ? { success: true, html: wrapEmail(CHAPTERS[pi], pi + 1, CHAPTERS.length) }
        : { success: false, message: 'Invalid index.' };
      break;
    default: result = { error: 'Unknown action' };
  }
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── Email wrapper ─────────────────────────────────────────────
// Edit the CSS here to restyle all emails for your course theme

function wrapEmail(ch, num, total) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body{margin:0;padding:0;background:#f5f0e8;font-family:Georgia,'Times New Roman',serif;}
  .wrap{max-width:680px;margin:0 auto;background:#fffdf7;border:1px solid #d4c5a0;}
  .header{background:linear-gradient(135deg,#2c1810 0%,#5c3a1e 50%,#8b5e3c 100%);padding:40px 30px;text-align:center;}
  .header h1{color:#f0d080;font-size:13px;letter-spacing:4px;text-transform:uppercase;margin:0 0 10px;}
  .header h2{color:#fff8e8;font-size:26px;margin:0 0 8px;line-height:1.3;}
  .header p{color:#d4b896;font-size:14px;margin:0;font-style:italic;}
  .progress{background:#2c1810;padding:12px 30px;display:flex;align-items:center;gap:12px;}
  .prog-bar{flex:1;height:6px;background:#5c3a1e;border-radius:3px;}
  .prog-fill{height:6px;background:#f0d080;border-radius:3px;width:${Math.round((num/total)*100)}%;}
  .prog-label{color:#d4b896;font-size:12px;white-space:nowrap;}
  .body{padding:36px 40px;}
  .lead{font-size:18px;color:#5c3a1e;line-height:1.7;font-style:italic;margin:0 0 24px;padding:0 0 24px;border-bottom:1px solid #e8dcc0;}
  h3{color:#2c1810;font-size:20px;margin:32px 0 12px;border-left:4px solid #f0d080;padding-left:12px;}
  p{color:#3a2a1a;line-height:1.8;margin:0 0 16px;font-size:16px;}
  .img-block{margin:28px 0;text-align:center;}
  .img-block img{max-width:100%;border:3px solid #d4c5a0;box-shadow:0 4px 16px rgba(0,0,0,0.15);}
  .img-caption{font-size:13px;color:#7a6a5a;font-style:italic;margin-top:10px;}
  .callout{background:#fdf6e8;border:1px solid #d4c5a0;border-left:4px solid #f0d080;padding:20px 24px;margin:28px 0;}
  .callout strong{color:#5c3a1e;display:block;margin-bottom:6px;font-size:14px;letter-spacing:1px;text-transform:uppercase;}
  table{width:100%;border-collapse:collapse;margin:24px 0;}
  th{background:#2c1810;color:#f0d080;padding:10px 14px;text-align:left;font-size:14px;}
  td{padding:10px 14px;border-bottom:1px solid #e8dcc0;font-size:14px;color:#3a2a1a;}
  tr:nth-child(even) td{background:#fdf6e8;}
  .quiz{background:#f0ede6;border:1px solid #d4c5a0;padding:24px;margin:32px 0;}
  .quiz h4{color:#2c1810;margin:0 0 16px;font-size:16px;}
  .quiz ol{margin:0;padding-left:20px;}
  .quiz li{color:#3a2a1a;margin-bottom:10px;font-size:15px;line-height:1.6;}
  .experts-edge{background:linear-gradient(135deg,#2c1810,#5c3a1e);padding:24px;margin:32px 0;border-radius:4px;}
  .experts-edge h4{color:#f0d080;margin:0 0 12px;font-size:14px;letter-spacing:2px;text-transform:uppercase;}
  .experts-edge p{color:#f5ead0;margin:0;font-size:15px;line-height:1.7;}
  .footer{background:#2c1810;padding:20px 30px;text-align:center;}
  .footer p{color:#d4b896;font-size:12px;margin:0;}
  a{color:#8b5e3c;}
  .key-terms{background:#fff;border:1px solid #d4c5a0;padding:20px 24px;margin:24px 0;}
  .key-terms h4{color:#2c1810;margin:0 0 12px;font-size:14px;letter-spacing:1px;text-transform:uppercase;}
  .term{display:inline-block;background:#f0d080;color:#2c1810;padding:4px 10px;border-radius:12px;font-size:13px;margin:4px;}
</style></head>
<body>
<div class="wrap">
  <div class="header">
    <h1>${COURSE_TITLE}</h1>
    <h2>Chapter ${num}: ${ch.title}</h2>
    <p>${ch.subtitle || ''}</p>
  </div>
  <div class="progress">
    <span class="prog-label">Chapter ${num} of ${total}</span>
    <div class="prog-bar"><div class="prog-fill"></div></div>
    <span class="prog-label">${Math.round((num/total)*100)}%</span>
  </div>
  <div class="body">${ch.body}</div>
  <div class="footer">
    <p>${COURSE_TITLE} · Chapter ${num} of ${total}</p>
  </div>
</div>
</body></html>`;
}

// ══════════════════════════════════════════════════════════════
// CHAPTERS — replace this array with your course content
// Each chapter follows this structure:
//
// {
//   title: "Chapter Title",
//   subtitle: "Descriptive subtitle",
//   body: `
//     <p class="lead">Opening hook paragraph.</p>
//     <h3>Section Heading</h3>
//     <p>Body text.</p>
//     <div class="img-block">
//       <img src="PUBLIC_DOMAIN_URL" alt="description">
//       <div class="img-caption">Caption. <a href="source">Source</a></div>
//     </div>
//     <div class="callout"><strong>Label</strong>Key insight.</div>
//     <table><tr><th>Col 1</th><th>Col 2</th></tr><tr><td>data</td><td>data</td></tr></table>
//     <div class="key-terms">
//       <h4>Key Terms</h4>
//       <span class="term">Term</span>
//     </div>
//     <div class="quiz">
//       <h4>📝 Self-Test</h4>
//       <ol><li>Question?</li></ol>
//     </div>
//     <div class="experts-edge">
//       <h4>🎯 The Expert's Edge</h4>
//       <p>Key talking point.</p>
//     </div>
//   `
// }
// ══════════════════════════════════════════════════════════════

const CHAPTERS = [

  {
    title: "Chapter 1 Title",
    subtitle: "Chapter 1 subtitle",
    body: `
      <p class="lead">Replace this with your chapter content.</p>
      <h3>First Section</h3>
      <p>Body text goes here.</p>
      <div class="experts-edge">
        <h4>🎯 The Expert's Edge</h4>
        <p>Your key expert insight for this chapter.</p>
      </div>
    `
  },

  // Add more chapters here...
  // Copy the structure above for each chapter

];
