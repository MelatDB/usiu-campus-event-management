const puppeteer = require('puppeteer-core');
const fs = require('fs');
const os = require('os');
const { execFileSync } = require('child_process');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE = 'http://localhost:3000';
const API = 'http://localhost:8080/api/v1';
const results = [];
const log = (msg) => { console.log(msg); results.push(msg); };

function step(name, ok, detail) {
  const line = `${ok ? 'PASS' : 'FAIL'} - ${name}${detail ? ' :: ' + detail : ''}`;
  log(line);
  if (!ok) process.exitCode = 1;
}

async function api(uri, options = {}) {
  const res = await fetch(API + uri, {
    headers: { 'Content-Type': 'application/json', ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}) },
    ...options,
  });
  if (!res.ok) throw new Error(`${options.method || 'GET'} ${uri} -> ${res.status} ${await res.text()}`);
  return res.status === 204 ? null : res.json();
}

const loginApi = (email, password) => api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });

const registerStudent = (firstName, lastName, regNum, email) =>
  api('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      firstName, lastName, registrationNumber: regNum, email, password: 'Test@12345',
      phoneNumber: '+254700000099', schoolId: 1, programId: 1, yearOfStudy: 2,
    }),
  });

async function applyApi(token, fields) {
  const fd = new FormData();
  fd.append('motivation', fields.motivation);
  fd.append('experience', fields.experience);
  fd.append('eventIdea', fields.eventIdea);
  const res = await fetch(API + '/organizer-applications', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });
  if (!res.ok) throw new Error('apply -> ' + res.status + ' ' + await res.text());
  return res.json();
}

let browser;
(async () => {
  const stamp = new Date().toTimeString().slice(0, 8).replace(/:/g, '');
  const pEmail = `orgpending${stamp}@student.usiu.ac.ke`;
  const rEmail = `orgreject${stamp}@student.usiu.ac.ke`;

  log('\n=== SEED via API ===');
  const admin = await loginApi('admin@usiu.ac.ke', 'Admin@12345');
  log('Admin login OK');

  const p = await registerStudent('Pending', 'Test', `PND-${stamp}`, pEmail);
  const r = await registerStudent('Reject', 'Test', `REJ-${stamp}`, rEmail);
  log(`Registered Pending Test (${p.user.id}) and Reject Test (${r.user.id})`);

  const appP = await applyApi(p.accessToken, {
    motivation: 'I want to organize a networking mixer for students.',
    experience: 'I helped run a club event last semester.',
    eventIdea: 'A networking mixer for students across schools.',
  });
  step('Seed: pending application created', appP.status === 'PENDING', 'id=' + appP.id);

  const appR = await applyApi(r.accessToken, {
    motivation: 'I would like to host a hackathon.',
    experience: 'I co-hosted a mini hackathon in my program.',
    eventIdea: 'A 24-hour campus hackathon with prizes.',
  });
  const rejected = await api(`/organizer-applications/${appR.id}/reject`, {
    method: 'POST', token: admin.accessToken,
    body: JSON.stringify({ reason: 'We currently have enough organizers this semester. Please reapply next semester.' }),
  });
  step('Seed: rejected application created', rejected.status === 'REJECTED', 'id=' + rejected.id);

  browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  page.on('console', (m) => { if (m.type() === 'error') console.log('[browser console error]', m.text()); });
  page.on('dialog', (d) => d.accept());

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const clickNav = async (label) => {
    await page.evaluate((lbl) => {
      const btn = [...document.querySelectorAll('.nav-link')].find((b) => b.innerText.includes(lbl));
      if (btn) btn.click();
    }, label);
    await sleep(1500);
  };
  const logout = async () => {
    await page.evaluate(() => { const btn = document.querySelector('.logout-btn'); if (btn) btn.click(); });
    await page.waitForFunction(() => location.pathname === '/', { timeout: 20000 }).catch(() => {});
    await sleep(1500);
  };
  const login = async (email, password) => {
    await page.goto(BASE + '/', { waitUntil: 'networkidle2', timeout: 60000 });
    await page.waitForSelector('input[type="password"]', { timeout: 20000 }).catch(() => {});
    const inputs = await page.$$('input');
    let emailInput = null, passInput = null;
    for (const inp of inputs) {
      const type = await inp.evaluate((el) => el.type);
      if (type === 'email' || type === 'text') emailInput = emailInput || inp;
      if (type === 'password') passInput = passInput || inp;
    }
    if (!emailInput || !passInput) throw new Error('Login inputs not found');
    await emailInput.type(email);
    await passInput.type(password);
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }).catch(() => {}),
      passInput.evaluate((el) => el.closest('form').requestSubmit()),
    ]);
    await page.waitForFunction(() => location.pathname.includes('dashboard'), { timeout: 30000 }).catch(() => {});
    await sleep(2000);
  };
  const waitForCard = (email, timeout) =>
    page.waitForFunction((em) => [...document.querySelectorAll('.oa-card')].some((c) => c.innerText.includes(em)), { timeout }, email);
  const waitForCardGone = (email, timeout) =>
    page.waitForFunction((em) => ![...document.querySelectorAll('.oa-card')].some((c) => c.innerText.includes(em)), { timeout }, email);
  const cardHas = (email, sel) =>
    page.evaluate(({ em, s }) => {
      const card = [...document.querySelectorAll('.oa-card')].find((c) => c.innerText.includes(em));
      return !!(card && card.querySelector(s));
    }, { em: email, s: sel });
  const clickCardBtn = (email, sel) =>
    page.evaluate(({ em, s }) => {
      const card = [...document.querySelectorAll('.oa-card')].find((c) => c.innerText.includes(em));
      const btn = card && card.querySelector(s);
      if (btn) btn.click();
      return !!btn;
    }, { em: email, s: sel });

  // ---- UI 1: Admin approves Pending Test via UI ----
  log('\n=== ADMIN: Approve Pending Test via UI ===');
  await login('admin@usiu.ac.ke', 'Admin@12345');
  await clickNav('Organizer Requests');
  await waitForCard(pEmail, 25000);
  const orText = await page.evaluate(() => document.body.innerText);
  step('Page header renders', orText.includes('Review students who want to become club organizers'));
  step('Pending tab lists this run\'s application', await cardHas(pEmail, '.oa-status.pending'));
  step('Approve button present on card', await cardHas(pEmail, '.btn-approve'));

  await clickCardBtn(pEmail, '.btn-approve');
  await page.waitForFunction(() => !!document.querySelector('.oa-modal'), { timeout: 10000 });
  const apprModalText = await page.evaluate(() => document.querySelector('.oa-modal').innerText);
  step('Approve modal opens', apprModalText.includes('Approve Application'));
  await page.type('.oa-modal textarea', 'Welcome to the team! We look forward to your mixer.');
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('.oa-modal button')].find((b) => b.innerText.includes('Confirm Approval'));
    if (btn) btn.click();
  });
  await waitForCardGone(pEmail, 20000);
  step('Approved card removed from pending list', true);

  const pApproved = await api(`/users/${p.user.id}`, { token: admin.accessToken });
  step('Student account untouched (still STUDENT)', pApproved.role === 'STUDENT', pApproved.role);

  // ---- UI 2: Reject Test student sees rejection card + Apply Again ----
  log('\n=== STUDENT (rejected): rejection card + reapply ===');
  await logout();
  await login(rEmail, 'Test@12345');
  step('Rejected student landed on dashboard', page.url().includes('/dashboard'), page.url());
  const dashText = await page.evaluate(() => document.body.innerText);
  step('Dashboard shows Become an Organizer button', dashText.includes('Become an Organizer'));

  await clickNav('Become Organizer');
  await page.waitForFunction(() => document.body.innerText.includes('Become a Club Organizer'), { timeout: 20000 });
  let sText = await page.evaluate(() => document.body.innerText);
  step('Rejection card shown', sText.includes('Application Not Approved'));
  step('Rejection reason shown', sText.includes('enough organizers'));

  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((b) => b.innerText.includes('Apply Again'));
    if (btn) btn.click();
  });
  await page.waitForFunction(() => document.body.innerText.includes('Ready to organize events?'), { timeout: 15000 });
  log('PASS - Apply Again reveals the form');

  const ta = await page.$$('textarea');
  await ta[0].type('I want to organize a career fair for STEM students.');
  await ta[1].type('I coordinated a student society event last year.');
  await ta[2].type('A career fair connecting students with employers.');
  const fileInput = await page.$('input[type="file"]');
  const filePath = os.tmpdir() + '/browser-apply.txt';
  fs.writeFileSync(filePath, 'Browser submission test document');
  await fileInput.uploadFile(filePath);
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((b) => b.innerText.includes('Submit Application'));
    if (btn) btn.click();
  });
  await page.waitForFunction(() => document.body.innerText.includes('Application Under Review'), { timeout: 30000 });
  step('Reapply submitted from UI, shows Under Review', true);

  // ---- UI 3: Admin rejects the reapplication via UI ----
  log('\n=== ADMIN: Reject Reject Test reapplication via UI ===');
  await logout();
  await login('admin@usiu.ac.ke', 'Admin@12345');
  await clickNav('Organizer Requests');
  await waitForCard(rEmail, 25000);
  step('New reapplication listed as pending', await cardHas(rEmail, '.oa-status.pending'));

  await clickCardBtn(rEmail, '.btn-reject');
  await page.waitForFunction(() => !!document.querySelector('.oa-modal'), { timeout: 10000 });
  const modalText = await page.evaluate(() => document.querySelector('.oa-modal').innerText);
  step('Reject modal opens', modalText.includes('Reject Application'));

  const newReason = 'We already have enough organizers this semester. Please reapply next semester.';
  await page.type('.oa-modal textarea', newReason);
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('.oa-modal button')].find((b) => b.innerText.includes('Confirm Rejection'));
    if (btn) btn.click();
  });
  await waitForCardGone(rEmail, 20000);
  step('Rejected card removed from pending list', true);

  // ---- UI 4: Student sees the new rejection reason ----
  log('\n=== STUDENT (rejected again): new reason ===');
  await logout();
  await login(rEmail, 'Test@12345');
  await clickNav('Become Organizer');
  await page.waitForFunction(() => document.body.innerText.includes('Become a Club Organizer'), { timeout: 20000 });
  sText = await page.evaluate(() => document.body.innerText);
  step('Rejection card shown again', sText.includes('Application Not Approved'));
  step('New rejection reason shown', sText.includes('already have enough organizers'));

  // ---- API: notifications + new organizer account ----
  log('\n=== API: notifications + new organizer account ===');
  const pNotifs = await api('/notifications?type=ORGANIZER_APPROVED&size=5', { token: p.accessToken });
  const pMsg = pNotifs.content[0] && pNotifs.content[0].message;
  const em = pMsg && pMsg.match(/Email: ([^\n]+)/);
  const m = pMsg && pMsg.match(/Temporary password: ([^\n]+)/);
  let pOrgLogin = null;
  step('Approved student got credentials notification', !!(em && m), em && em[1]);
  step('Notification includes admin message', !!(pMsg && pMsg.includes('Welcome to the team!')));

  const pStudentLogin = await loginApi(pEmail, 'Test@12345');
  step('Original student account still logs in as STUDENT', pStudentLogin.user.role === 'STUDENT', pStudentLogin.user.role);

  if (em && m) {
    pOrgLogin = await loginApi(em[1].trim(), m[1].trim());
    step(
      'New organizer account logs in with temp password as CLUB_ORGANIZER',
      pOrgLogin.user.role === 'CLUB_ORGANIZER',
      pOrgLogin.user.role + ' / ' + em[1].trim()
    );
    const expDays = pOrgLogin.user.expiresAt
      ? Math.round((new Date(pOrgLogin.user.expiresAt) - Date.now()) / 86400000)
      : 0;
    step('New organizer account has default 1-year expiry', expDays >= 360 && expDays <= 370, pOrgLogin.user.expiresAt + ' (~' + expDays + 'd)');
  }

  // ---- API: custom expiry + expiry enforcement ----
  log('\n=== API: custom expiry + expiry enforcement ===');
  const orgId = (await api('/users?role=CLUB_ORGANIZER&size=100', { token: admin.accessToken })).content
    .find((u) => u.email === (em ? em[1].trim() : '__missing__'));
  if (orgId) {
    const putUser = (expiresAt) =>
      api(`/users/${orgId.id}`, {
        method: 'PUT',
        token: admin.accessToken,
        body: JSON.stringify({
          firstName: orgId.firstName, lastName: orgId.lastName, email: orgId.email,
          role: 'CLUB_ORGANIZER', status: 'ACTIVE', expiresAt,
        }),
      });
    const localIso = (d) => {
      const pad = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    };
    const custom = localIso(new Date(Date.now() + 180 * 86400000));
    const updated = await putUser(custom);
    step('Admin can set a custom expiry', !!(updated.expiresAt && updated.expiresAt.startsWith(custom)), updated.expiresAt);

    const past = localIso(new Date(Date.now() - 2 * 3600000));
    await putUser(past);
    let lockMsg = '';
    try {
      await loginApi(em[1].trim(), m[1].trim());
    } catch (e) {
      lockMsg = e.message;
    }
    step('Expired organizer is blocked from logging in', lockMsg.includes('expired'), lockMsg.slice(0, 120));

    await putUser(localIso(new Date(Date.now() + 365 * 86400000)));
    log('Restored organizer expiry for later checks');
  } else {
    step('Found new organizer for expiry checks', false, 'organizer not found');
  }

  const rNotifs = await api('/notifications?type=ORGANIZER_REJECTED&size=5', { token: r.accessToken });
  const rMsg = rNotifs.content[0] && rNotifs.content[0].message;
  step('Rejected student got rejection notification', !!(rMsg && rMsg.includes('already have enough organizers')));

  // ---- UI 5: Approved student sees credentials in Become an Organizer tab ----
  log('\n=== STUDENT (approved): credentials shown in Become Organizer tab ===');
  await logout();
  await login(pEmail, 'Test@12345');
  await clickNav('Become Organizer');
  await page.waitForFunction(() => document.body.innerText.includes('Welcome to the Organizer Team'), { timeout: 20000 });
  const aText = await page.evaluate(() => document.body.innerText);
  const newEmail = em ? em[1].trim() : '---';
  step('Approved card shows new organizer email', aText.includes(newEmail), newEmail);
  step('Approved card shows temp password', !!(m && aText.includes(m[1].trim())));
  step('Approved card shows admin message', aText.includes('Welcome to the team!'));
  step('Approved card offers Sign Out & Log In as Organizer', aText.includes('Sign Out & Log In as Organizer'));

  // ---- FEEDBACK: seed an ended event + registration, then UI prompt ----
  log('\n=== FEEDBACK: seed ended event + UI prompt ===');
  if (!pOrgLogin || !em) {
    step('Organizer account available for feedback seed', false, 'organizer login missing');
  } else {
  const [clubs, cats, vens] = await Promise.all([
    api('/clubs?size=5', { token: admin.accessToken }),
    api('/categories?size=5', { token: admin.accessToken }),
    api('/venues?size=20', { token: admin.accessToken }),
  ]);
  const clubId = clubs.content[0].id, categoryId = cats.content[0].id, venueId = vens.content[0].id;
  const localIso = (d) => {
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };
  const pastStart = new Date(Date.now() - 5 * 86400000);
  const evSql =
    'INSERT INTO events (created_at, updated_at, title, description, event_image, start_date_time, end_date_time, registration_deadline, maximum_capacity, current_participants, event_status, approval_status, open_to_all_students, deadline_reminder_sent, one_day_reminder_sent, one_hour_reminder_sent, club_id, organizer_id, category_id, venue_id) VALUES (NOW(6), NOW(6), ' +
    `'Feedback Mixer ${stamp}', 'A test event that already ended, used for feedback testing.', NULL, ` +
    `'${localIso(pastStart)}', '${localIso(new Date(pastStart.getTime() + 2 * 3600000))}', '${localIso(new Date(pastStart.getTime() - 24 * 3600000))}', 50, 1, 'PUBLISHED', 'APPROVED', 1, 0, 0, 0, ${clubId}, ${pOrgLogin.user.id}, ${categoryId}, ${venueId}); SELECT LAST_INSERT_ID();`;
  const evtIdRaw = execFileSync(
    'mysql',
    ['--host=127.0.0.1', '-u', 'root', '--batch', '--skip-column-names', 'usiu_events', '-e', evSql],
    { encoding: 'utf8' }
  );
  const eventId = Number(evtIdRaw.trim().split('\n').pop());
  step('Ended event seeded directly in DB', Number.isInteger(eventId) && eventId > 0, 'event id=' + eventId);

  execFileSync(
    'mysql',
    [
      '--host=127.0.0.1', '-u', 'root',
      'usiu_events',
      '-e',
      `INSERT INTO registrations (created_at, updated_at, registration_date, registration_status, attendance_status, student_id, event_id) ` +
        `VALUES (NOW(6), NOW(6), NOW(6), 'REGISTERED', 'NOT_MARKED', ${r.user.id}, ${eventId});`,
    ],
    { stdio: 'ignore' }
  );
  log('Direct DB insert: registration for ended event');

  const pendingBefore = await api('/feedback/pending', { token: r.accessToken });
  step('Feedback pending lists the ended event', pendingBefore.some((e) => e.id === eventId), 'pending=' + pendingBefore.length);

  log('\n=== STUDENT (reject test): give feedback via UI ===');
  await logout();
  await login(rEmail, 'Test@12345');
  await clickNav('My Registrations');
  await page.waitForFunction(() => document.body.innerText.includes('How were your recent events?'), { timeout: 20000 });
  const fbText = await page.evaluate(() => document.body.innerText);
  step('Feedback prompt section shows on My Registrations', fbText.includes('How were your recent events?'));
  step('Feedback card lists the ended event', fbText.includes('Feedback Mixer ' + stamp));

  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('.feedback-card button')].find((b) => b.innerText.includes('Give Feedback'));
    if (btn) btn.click();
  });
  await page.waitForFunction(() => !!document.querySelector('.feedback-form'), { timeout: 10000 });
  step('Feedback form opens', true);

  const stars = await page.$$('.star-rating .star-btn');
  await stars[3].click();
  await page.evaluate(() => {
    const chips = [...document.querySelectorAll('.response-chip')];
    ['Great event', 'Good venue'].forEach((t) => {
      const c = chips.find((x) => x.innerText.includes(t));
      if (c) c.click();
    });
  });
  await page.type('.feedback-form textarea', 'The organizers did a fantastic job with timing and the venue.');
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('.feedback-form button')].find((b) => b.innerText.includes('Submit Feedback'));
    if (btn) btn.click();
  });
  await page.waitForFunction(
    () => ![...document.querySelectorAll('.feedback-card')].some((c) => c.innerText.includes('Feedback Mixer ')),
    { timeout: 20000 }
  );
  step('Feedback submitted and prompt card disappears', true);

  const pendingAfter = await api('/feedback/pending', { token: r.accessToken });
  step('Feedback pending no longer lists the event', !pendingAfter.some((e) => e.id === eventId));

  const mine = await api('/feedback/mine', { token: r.accessToken });
  const mineEvt = mine.find((f) => f.eventId === eventId);
  step('Student feedback recorded via API', !!mineEvt && mineEvt.rating === 4, mineEvt ? 'rating=' + mineEvt.rating + ' tags=' + mineEvt.tags.join(',') : 'none');

  const summary = await api(`/feedback/events/${eventId}`, { token: pOrgLogin.accessToken });
  step('Organizer can view event feedback summary', summary.feedbackCount === 1 && summary.feedback[0].rating === 4, 'avg=' + summary.averageRating);

  log('\n=== ORGANIZER: Feedback & Reviews page via UI ===');
  await logout();
  await login(em[1].trim(), m[1].trim());
  await clickNav('Feedback');
  await page.waitForFunction(() => location.pathname.includes('feedback-reviews'), { timeout: 20000 });
  const fbPageText = await page.evaluate(() => document.body.innerText);
  step('Feedback & Reviews page renders', fbPageText.includes('Feedback & Reviews'));
  step('Page copy addresses the organizer', fbPageText.includes('events you organized'));

  await page.waitForFunction(() => !!document.querySelector('#feedback-event-select option'), { timeout: 20000 });
  const options = await page.$$eval('#feedback-event-select option', (opts) => opts.map((o) => o.textContent));
  step('Event dropdown lists the feedback event', options.some((o) => o.includes('Feedback Mixer ')), options.join(' | '));

  await page.waitForFunction(
    () => /average rating/i.test(document.body.innerText) && /total reviews/i.test(document.body.innerText),
    { timeout: 20000 }
  );
  const fbMetricsText = await page.evaluate(() => document.body.innerText);
  step('Average Rating metric shows 4.0', fbMetricsText.includes('4.0'));
  step('Total Reviews metric shows 1', fbMetricsText.includes('1\nstudent submission'));
  step('Positive Reviews metric shows 100%', fbMetricsText.includes('100%\nrated 4 or 5 stars'));
  step('Rating Distribution panel renders', /rating distribution/i.test(fbMetricsText));
  step('4-star distribution row shows 1 (100%)', fbMetricsText.includes('4 star') && fbMetricsText.includes('1 (100%)'));
  step('Student review card shows comment', fbMetricsText.includes('fantastic job with timing'));
  step('Review shows Great event tag', fbMetricsText.includes('Great event'));
  step('Review shows Good venue tag', fbMetricsText.includes('Good venue'));
  step('Review author is Reject Test', fbMetricsText.includes('Reject Test'));

  log('\n=== ADMIN: reach Feedback & Reviews via Analytics ===');
  await logout();
  await login('admin@usiu.ac.ke', 'Admin@12345');
  await clickNav('Analytics');
  await page.waitForFunction(() => document.body.innerText.includes('Event Feedback'), { timeout: 20000 });
  const analyticsText = await page.evaluate(() => document.body.innerText);
  step('Analytics shows Event Feedback section', analyticsText.includes('Event Feedback'));
  step('Analytics lists the feedback event', analyticsText.includes('Feedback Mixer '));
  step('Analytics lists organizer name', analyticsText.includes('Pending Test'));

  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('.btn-action')].find((b) => b.innerText.includes('View all feedback'));
    if (btn) btn.click();
  });
  await page.waitForFunction(() => location.pathname.includes('feedback-reviews'), { timeout: 20000 });
  await page.waitForFunction(
    () => /average rating/i.test(document.body.innerText) && document.body.innerText.includes('4.0'),
    { timeout: 20000 }
  );
  const adminFbText = await page.evaluate(() => document.body.innerText);
  step('Admin Feedback page renders metrics', adminFbText.includes('4.0'));
  step('Admin copy covers any event', adminFbText.includes('any event on campus'));

  await logout();
  }

  await browser.close();
  console.log('\n=== BROWSER TEST SUMMARY ===');
  results.filter((r) => r.startsWith('FAIL')).forEach((r) => console.log(r));
  const fails = results.filter((r) => r.startsWith('FAIL')).length;
  console.log(fails === 0 ? 'ALL BROWSER CHECKS PASSED' : fails + ' CHECK(S) FAILED');
})().catch((e) => {
  console.error('FATAL:', e.message);
  if (browser) browser.close().finally(() => process.exit(process.exitCode || 1));
  else process.exit(process.exitCode || 1);
});
