// server/pesuPortal.js
//
// Server-side PESU Academy portal client. The public PESUAuth API (used for login on
// the PESU Academy tab) is auth-only: it verifies credentials and returns a profile, but
// does NOT expose the logged-in session — so it cannot read timetable, attendance, or
// results. To get those we replicate the portal login ourselves and call the same
// endpoints the portal's own frontend calls, then parse the HTML fragments it returns.
//
// This runs ONLY on the server (Vercel serverless function api/pesu-portal.js, and the
// Vite dev middleware). Credentials are used once to log in and are never stored or logged.
//
// No third-party dependencies: parsing is done with targeted regex over the (simple,
// stable) HTML fragments. Every parser is a pure function exported for unit testing
// against captured fixtures (see test/pesuPortal.parsers.test.mjs).

export const BASE = 'https://www.pesuacademy.com/Academy';

const COMMON_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
};

// ---------------------------------------------------------------------------
// Cookie jar helpers (Node's fetch does not manage cookies for us)
// ---------------------------------------------------------------------------

/** Read Set-Cookie headers from a fetch Response into a { name: value } object. */
function readSetCookies(res, jar) {
  let cookies = [];
  if (typeof res.headers.getSetCookie === 'function') {
    cookies = res.headers.getSetCookie(); // Node 18.14+ / undici
  } else {
    const raw = res.headers.get('set-cookie');
    if (raw) cookies = [raw];
  }
  for (const c of cookies) {
    const pair = c.split(';', 1)[0];
    const eq = pair.indexOf('=');
    if (eq > 0) {
      const name = pair.slice(0, eq).trim();
      const value = pair.slice(eq + 1).trim();
      if (name) jar[name] = value;
    }
  }
  return jar;
}

/** Serialise a cookie jar into a Cookie header string. */
function cookieHeader(jar) {
  return Object.entries(jar)
    .map(([k, v]) => `${k}=${v}`)
    .join('; ');
}

// ---------------------------------------------------------------------------
// Network wrapper. Node's fetch throws a generic `TypeError: fetch failed` on
// any transport-level problem (DNS, TLS chain, proxy, connection reset) and
// hides the real reason on `error.cause`. This surfaces which request failed
// and the underlying code/message, so a 502 is diagnosable instead of opaque.
// ---------------------------------------------------------------------------

async function netFetch(fetchImpl, url, init, step) {
  try {
    return await fetchImpl(url, init);
  } catch (err) {
    const cause = err?.cause || err || {};
    const code = cause.code || cause.errno || '';
    const detail = [code, cause.message].filter(Boolean).join(': ') || 'fetch failed';
    const wrapped = new Error(`PESU request failed at [${step}]: ${detail}`);
    wrapped.cause = err;
    wrapped.step = step;
    wrapped.code = code || undefined;
    throw wrapped;
  }
}

// ---------------------------------------------------------------------------
// Cookie-persisting redirect follower. Node's fetch follows redirects but does
// NOT carry cookies across them (it has no cookie store). PESU's Spring Security
// login bounces /s/studentProfilePESU -> login -> back, setting a session cookie
// mid-chain; with `redirect:'follow'` undici drops that cookie each hop and loops
// until it throws "redirect count exceeded". So we follow manually, reading
// Set-Cookie and re-sending the jar on every hop — the same thing requests.Session
// does (which is why the upstream Python PESUAuth works). Returns { res, chain }.
// On 301/302 of a POST (and any 303) we switch to GET and drop the body, per the
// Fetch spec / browser behaviour.
// ---------------------------------------------------------------------------

async function fetchFollow(fetchImpl, url, init, jar, step, maxHops = 10) {
  let current = url;
  let method = (init.method || 'GET').toUpperCase();
  let body = init.body;
  const chain = [];
  for (let hop = 0; hop <= maxHops; hop++) {
    const headers = { ...init.headers, Cookie: cookieHeader(jar) };
    const res = await netFetch(
      fetchImpl,
      current,
      { ...init, method, body, headers, redirect: 'manual' },
      `${step} (hop ${hop})`,
    );
    readSetCookies(res, jar);
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get('location');
      chain.push({ status: res.status, location: loc || '' });
      if (!loc) return { res, chain };
      current = new URL(loc, current).toString();
      if (res.status === 303 || ((res.status === 301 || res.status === 302) && method === 'POST')) {
        method = 'GET';
        body = undefined;
      }
      continue;
    }
    chain.push({ status: res.status, location: '' });
    return { res, chain };
  }
  // Hit the hop cap — for the login flow this means we kept getting bounced to the
  // login page, i.e. authentication did not take. Return the last response so the
  // caller can inspect it (login() treats a non-logged-in page as a failed sign-in).
  return { res: null, chain, tooManyRedirects: true };
}


// ---------------------------------------------------------------------------
// CSRF extraction — defensive: the token lives in a <meta> (or hidden input),
// and the exact attribute name has varied, so try the known variants in order.
// ---------------------------------------------------------------------------

export function extractCsrf(html) {
  if (!html) return null;
  const patterns = [
    /<meta[^>]+name=["']_csrf["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']_csrf["']/i,
    /<meta[^>]+name=["']csrf[-_]token["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']csrf[-_]token["']/i,
    /<input[^>]+name=["']_csrf["'][^>]+value=["']([^"']+)["']/i,
    /<input[^>]+value=["']([^"']+)["'][^>]+name=["']_csrf["']/i,
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m) return m[1];
  }
  return null;
}

/** Heuristic: does this HTML look like a logged-in portal page (vs the login screen)? */
function looksLoggedIn(html) {
  if (!html) return false;
  const hasLoginForm = /j_spring_security_check|j_username|j_password/i.test(html);
  const hasPortal = /studentProfilePESU|logout|Logout|menu-id|dashboard/i.test(html);
  return hasPortal && !hasLoginForm;
}

// ---------------------------------------------------------------------------
// Login — GET home (CSRF) -> POST j_spring_security_check -> GET profile page
// (fresh CSRF for AJAX). Returns a "session" { jar, csrf, ok, ... }.
// ---------------------------------------------------------------------------

export async function login(username, password, fetchImpl = fetch) {
  const jar = {};

  // 1. Prime the session and grab the login-page CSRF token.
  const { res: home } = await fetchFollow(
    fetchImpl,
    `${BASE}/`,
    { headers: COMMON_HEADERS },
    jar,
    'GET /',
  );
  const homeHtml = home ? await home.text() : '';
  const loginCsrf = extractCsrf(homeHtml);

  // 2. Submit credentials to Spring Security, following the post-login redirect
  //    chain with cookie persistence so the authenticated session cookie sticks.
  const form = new URLSearchParams();
  if (loginCsrf) form.set('_csrf', loginCsrf);
  form.set('j_username', username);
  form.set('j_password', password);

  const { res: authRes, chain: authChain } = await fetchFollow(
    fetchImpl,
    `${BASE}/j_spring_security_check`,
    {
      method: 'POST',
      headers: {
        ...COMMON_HEADERS,
        'Content-Type': 'application/x-www-form-urlencoded',
        Referer: `${BASE}/`,
      },
      body: form.toString(),
    },
    jar,
    'POST j_spring_security_check',
  );
  // Where did the login chain finally land? Spring sends rejected logins back to a
  // login/error URL; a good login lands on the dashboard/profile.
  const finalUrl = authChain.length ? (authChain.map((h) => h.location).filter(Boolean).pop() || '') : '';
  const landedOnError = /login\.error|authfail|error|denied/i.test(finalUrl);
  const authLandingHtml = authRes ? await authRes.text() : '';

  // 3. Load the profile page (cookie-persisting) to (a) confirm we're in and
  //    (b) get the fresh AJAX CSRF token used for the data endpoints.
  const { res: profPage, chain: profChain, tooManyRedirects } = await fetchFollow(
    fetchImpl,
    `${BASE}/s/studentProfilePESU`,
    { headers: COMMON_HEADERS },
    jar,
    'GET /s/studentProfilePESU',
  );
  const profHtml = profPage ? await profPage.text() : '';
  const ajaxCsrf = extractCsrf(profHtml) || extractCsrf(authLandingHtml);
  const loggedIn =
    !tooManyRedirects &&
    !landedOnError &&
    (looksLoggedIn(profHtml) || looksLoggedIn(authLandingHtml));

  return {
    jar,
    csrf: ajaxCsrf || loginCsrf || null,
    ok: loggedIn && !!(ajaxCsrf || loginCsrf),
    // Debug aids (safe: no credentials). The standalone tester prints these.
    _debug: {
      loginCsrfFound: !!loginCsrf,
      ajaxCsrfFound: !!ajaxCsrf,
      authChain,
      authFinalUrl: finalUrl,
      landedOnError,
      profileRedirectChain: profChain,
      profileTooManyRedirects: !!tooManyRedirects,
      looksLoggedIn: looksLoggedIn(profHtml) || looksLoggedIn(authLandingHtml),
      profilePageLen: profHtml.length,
      cookies: Object.keys(jar),
    },
  };
}

// ---------------------------------------------------------------------------
// Low-level call to the one controller that serves all this data.
// ---------------------------------------------------------------------------

async function controller(session, { method = 'POST', query = '', body = null }, fetchImpl = fetch) {
  const url = `${BASE}/s/studentProfilePESUAdmin${query ? `?${query}` : ''}`;
  const headers = {
    ...COMMON_HEADERS,
    'X-Requested-With': 'XMLHttpRequest',
    'x-csrf-token': session.csrf || '',
    Referer: `${BASE}/s/studentProfilePESU`,
  };
  const init = { method };
  if (body != null) {
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
    init.body = typeof body === 'string' ? body : new URLSearchParams(body).toString();
  }
  init.headers = headers;
  const { res } = await fetchFollow(fetchImpl, url, init, session.jar, `${method} studentProfilePESUAdmin`);
  return res ? res.text() : '';
}

/** GET a simple portal AJAX endpoint (semester dropdowns). */
async function getJson(session, path, fetchImpl = fetch) {
  const { res } = await fetchFollow(
    fetchImpl,
    `${BASE}/${path}`,
    {
      headers: {
        ...COMMON_HEADERS,
        'X-Requested-With': 'XMLHttpRequest',
        'x-csrf-token': session.csrf || '',
        Referer: `${BASE}/s/studentProfilePESU`,
      },
    },
    session.jar,
    `GET ${path}`,
  );
  return res ? res.text() : '';
}

// ---------------------------------------------------------------------------
// Fetchers (thin wrappers around the request shapes decoded from the HAR)
// ---------------------------------------------------------------------------

export function fetchTimetable(session, fetchImpl = fetch) {
  return controller(
    session,
    {
      method: 'GET',
      query:
        'menuId=669&url=studentProfilePESUAdmin&controllerMode=6415&actionType=5&id=0&selectedData=0',
    },
    fetchImpl,
  );
}

export function fetchAttendanceSemesters(session, fetchImpl = fetch) {
  return getJson(session, 's/studentProfile/getStudentSemestersPESU', fetchImpl);
}

export function fetchAttendance(session, batchClassId, fetchImpl = fetch) {
  return controller(
    session,
    { method: 'POST', body: { controllerMode: '6407', actionType: '8', batchClassId, menuId: '660' } },
    fetchImpl,
  );
}

export function fetchResultSemesters(session, fetchImpl = fetch) {
  return getJson(session, 's/studentProfile/getEsaAndIsaResultSemBySRN', fetchImpl);
}

export function fetchResultsFinal(session, semid, fetchImpl = fetch) {
  return controller(
    session,
    { method: 'POST', body: { controllerMode: '6402', actionType: '8', semid, menuId: '652' } },
    fetchImpl,
  );
}

export function fetchResultsProvisional(session, fetchImpl = fetch) {
  // No semid: this endpoint returns provisional results for ALL available semesters.
  return controller(
    session,
    {
      method: 'POST',
      body: { url: 'studentProfilePESUAdmin', controllerMode: '6402', actionType: '53', menuId: '652' },
    },
    fetchImpl,
  );
}

export function fetchCalendarEvents(session, fetchImpl = fetch) {
  // Calendar of Events for the active batch/semester (holidays, ISA/ESA windows,
  // FAM/CCM/PTM, festivals). One GET; the events come embedded in the HTML.
  return controller(
    session,
    {
      method: 'GET',
      query:
        'menuId=668&url=studentProfilePESUAdmin&controllerMode=6413&actionType=5&id=0&selectedData=0',
    },
    fetchImpl,
  );
}

// ---------------------------------------------------------------------------
// Parsers (pure). Each takes a raw HTML fragment and returns clean JSON.
// ---------------------------------------------------------------------------

const stripTags = (s) => (s || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ');
const clean = (s) => stripTags(s).replace(/\s+/g, ' ').trim();

// Date helpers for the Calendar of Events. The portal sends dates like
// "Aug 3, 2026, 12:00:00 AM"; we normalise to ISO "YYYY-MM-DD". Parsing the
// month/day/year by hand (rather than `new Date()`) keeps this timezone-safe —
// a naive Date at local midnight can round the wrong way to the previous day
// when serialised to a UTC ISO string.
const MONTHS = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

/** "Aug 3, 2026, 12:00:00 AM" -> "2026-08-03" (null if unparseable). */
export function toIsoDate(s) {
  if (!s) return null;
  const m = String(s).match(/([A-Za-z]{3,})\s+(\d{1,2}),\s*(\d{4})/);
  if (!m) return null;
  const mon = MONTHS[m[1].slice(0, 3)];
  if (mon == null) return null;
  const day = Number(m[2]);
  const year = Number(m[3]);
  if (!day || !year) return null;
  return `${year}-${String(mon + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** Add (possibly negative) days to an ISO date, via UTC so no local-TZ drift. */
export function addDaysIso(iso, delta) {
  if (!iso) return iso;
  const [y, mo, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, mo - 1, d));
  dt.setUTCDate(dt.getUTCDate() + delta);
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}-${String(dt.getUTCDate()).padStart(2, '0')}`;
}

/** `<option value="3523">Sem-3</option>` -> [{ value:'3523', label:'Sem-3' }] */
export function parseSemesterOptions(html) {
  let src = html || '';
  // The portal's semester-dropdown endpoints return the <option> markup as a
  // JSON-encoded *string*, e.g.  "\"<option value=\\\"3523\\\">Sem-3</option>\"".
  // (getStudentSemestersPESU double-quotes its values so they arrive backslash-
  // escaped; getEsaAndIsaResultSemBySRN single-quotes them.) Unwrap the JSON
  // string first so escaped quotes become real ones before we match.
  const trimmed = src.trim();
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (typeof parsed === 'string') src = parsed;
    } catch {
      /* not valid JSON — fall through and match the raw text */
    }
  }
  const out = [];
  const re = /<option[^>]*\svalue=['"]?(\d+)['"]?[^>]*>([^<]*)<\/option>/gi;
  let m;
  while ((m = re.exec(src))) {
    const value = m[1];
    const label = clean(m[2]);
    if (value && value !== '0' && label) out.push({ value, label });
  }
  return out;
}

/**
 * Timetable. The portal ships the week as JS vars in the HTML:
 *   var timeTableJson = { "ttDivText_<day>_<slot>_1": ["ttSubject_&&CODE-NAME","ttFaculty_1_&&NAME", ...], ... }
 *   var timeTableTemplateDetailsJson = [ { day:0, orderedBy:<slot>, startTime, endTime }, ... ]
 *   var days = ["Monday", ... ]
 * Returns { days, slots:[{slot,start,end}], entries:[{day,dayName,slot,code,name,faculty[]}] }.
 */
export function parseTimetable(html) {
  const result = { days: [], slots: [], entries: [] };
  if (!html) return result;

  const grab = (name) => {
    const m = html.match(new RegExp(`var\\s+${name}\\s*=\\s*([\\[{][\\s\\S]*?)(?:;\\s*\\n|;\\s*var\\s|;\\s*$)`));
    if (!m) return null;
    try {
      return JSON.parse(m[1]);
    } catch {
      return null;
    }
  };

  const days = grab('days');
  if (Array.isArray(days)) result.days = days;

  // Slot -> time map from the day:0 template rows.
  const tmpl = grab('timeTableTemplateDetailsJson');
  const slotTimes = {};
  if (Array.isArray(tmpl)) {
    for (const row of tmpl) {
      if (row && Number(row.day) === 0 && row.orderedBy != null) {
        slotTimes[Number(row.orderedBy)] = {
          start: (row.startTime || '').trim(),
          end: (row.endTime || '').trim(),
        };
      }
    }
  }

  const tt = grab('timeTableJson');
  const usedSlots = new Set();
  if (tt && typeof tt === 'object') {
    for (const [key, arr] of Object.entries(tt)) {
      const km = key.match(/^ttDivText_(\d+)_(\d+)_\d+$/);
      if (!km || !Array.isArray(arr)) continue;
      const day = Number(km[1]);
      const slot = Number(km[2]);
      const val = (prefix) =>
        arr
          .filter((x) => typeof x === 'string' && x.startsWith(prefix))
          .map((x) => x.split('&&')[1])
          .filter(Boolean);
      const subjRaw = val('ttSubject_')[0] || '';
      const dash = subjRaw.indexOf('-');
      const code = dash >= 0 ? subjRaw.slice(0, dash).trim() : subjRaw.trim();
      const name = dash >= 0 ? subjRaw.slice(dash + 1).trim() : '';
      const faculty = val('ttFaculty_');
      usedSlots.add(slot);
      result.entries.push({
        day,
        dayName: result.days[day - 1] || `Day ${day}`,
        slot,
        code,
        name,
        faculty,
      });
    }
  }

  result.slots = [...usedSlots]
    .sort((a, b) => a - b)
    .map((slot) => ({ slot, start: slotTimes[slot]?.start || '', end: slotTimes[slot]?.end || '' }));
  result.entries.sort((a, b) => a.day - b.day || a.slot - b.slot);
  return result;
}

/**
 * Attendance table: <tbody id="subjetInfo"> rows of
 *   <td>code</td><td>name</td><td>attended/total</td><td>percentage</td>
 * Returns [{ code, name, attended, total, attendedTotal, percentage }].
 */
export function parseAttendance(html) {
  const out = [];
  if (!html) return out;
  const body = html.match(/<tbody[^>]*id=["']subjetInfo["'][^>]*>([\s\S]*?)<\/tbody>/i);
  const scope = body ? body[1] : html;
  const rowRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let r;
  while ((r = rowRe.exec(scope))) {
    const cells = [...r[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((c) => clean(c[1]));
    if (cells.length < 4) continue;
    const [code, name, attendedTotal, percentage] = cells;
    if (!code) continue;
    let attended = null;
    let total = null;
    const at = attendedTotal.match(/(\d+)\s*\/\s*(\d+)/);
    if (at) {
      attended = Number(at[1]);
      total = Number(at[2]);
    }
    out.push({ code, name, attendedTotal, attended, total, percentage });
  }
  return out;
}

/**
 * Final (detailed) results for ONE semester.
 * Returns { semester, esaDescription, earnedCredits, sgpa, cgpa, subjects:[...] }
 * where each subject = { code, name, credits:{earned,total}, components:[{label,score,max}], esaGrade }.
 */
export function parseResultsFinal(html) {
  const res = { semester: null, esaDescription: null, earnedCredits: null, sgpa: null, cgpa: null, subjects: [] };
  if (!html) return res;

  const sem = html.match(/Semester:\s*<\/span>\s*([^<]+)/i);
  if (sem) res.semester = clean(sem[1]);
  const esa = html.match(/ESA Description:\s*<\/span>\s*([^<]+)/i);
  if (esa) res.esaDescription = clean(esa[1]);

  const headVal = (label) => {
    const m = html.match(new RegExp(`<h6>\\s*${label}\\s*</h6>\\s*([^<\\s][^<]*)`, 'i'));
    return m ? clean(m[1]) : null;
  };
  res.earnedCredits = headVal('Earned Credits');
  res.sgpa = headVal('SGPA');
  res.cgpa = headVal('CGPA');

  // Split into per-subject segments on the header-info blocks.
  const segments = html.split(/<div[^>]*class=["'][^"']*header-info[^"']*["']/i);
  for (let i = 1; i < segments.length; i++) {
    const seg = segments[i];
    const codeM = seg.match(/lbl-title-light">\s*([A-Z]{2}\d{2}[A-Z0-9]+)\s*/);
    if (!codeM) continue;
    const code = codeM[1];
    // Name: text after the code's closing </span> up to </h6>.
    let name = '';
    const nameM = seg.match(/lbl-title-light">[\s\S]*?<\/span>\s*([^<]+?)<\/h6>/);
    if (nameM) name = clean(nameM[1]);

    const credM = seg.match(/Credits:\s*<\/span>\s*<span[^>]*>\s*([\d.]+)\s*<\/span>\s*\/\s*([\d.]+)/i);
    const credits = credM ? { earned: Number(credM[1]), total: Number(credM[2]) } : null;

    // Components: each <h6>LABEL</h6> followed by a value span, with optional /max.
    const components = [];
    let esaGrade = null;
    const compRe = /<h6>\s*([^<]+?)\s*<\/h6>\s*(?:<span[^>]*>\s*([^<]+?)\s*<\/span>)?\s*(?:\/\s*([\d.]+))?/gi;
    let c;
    while ((c = compRe.exec(seg))) {
      const label = clean(c[1]);
      const value = c[2] != null ? clean(c[2]) : null;
      const max = c[3] != null ? Number(c[3]) : null;
      if (/^(Earned Credits|SGPA|CGPA)$/i.test(label)) continue;
      if (value == null) continue;
      if (/^ESA$/i.test(label)) {
        esaGrade = value;
        components.push({ label, grade: value });
      } else {
        const num = Number(value);
        components.push({ label, score: Number.isNaN(num) ? value : num, max });
      }
    }
    res.subjects.push({ code, name, credits, components, esaGrade });
  }
  return res;
}

/**
 * Provisional results — returns ALL available semesters in one response.
 * Returns [{ semester, assessment, earned, taken, sgpa, subjects:[{code,name,grade,reviewStatus,challengeStatus}] }].
 */
export function parseResultsProvisional(html) {
  const out = [];
  if (!html) return out;

  // Each semester block starts at a "Semester:</span> N Sem" label.
  const markerRe = /Semester:\s*<\/span>\s*([^<]+?)<\/label>/gi;
  const markers = [];
  let mm;
  while ((mm = markerRe.exec(html))) markers.push({ index: mm.index, semester: clean(mm[1]) });

  for (let i = 0; i < markers.length; i++) {
    const start = markers[i].index;
    const end = i + 1 < markers.length ? markers[i + 1].index : html.length;
    const block = html.slice(start, end);
    const sem = { semester: markers[i].semester, assessment: null, earned: null, taken: null, sgpa: null, subjects: [] };

    const assess = block.match(/ESA Description:\s*<\/span>\s*([^<]+)/i);
    if (assess) sem.assessment = clean(assess[1]);
    const head = (label) => {
      const m = block.match(new RegExp(`<h6>\\s*${label}\\s*</h6>\\s*([^<]+)`, 'i'));
      return m ? clean(m[1]) : null;
    };
    sem.earned = head('EARNED');
    sem.taken = head('TAKEN');
    sem.sgpa = head('SGPA');

    const bodyM = block.match(/<tbody[^>]*id=["']subjetInfo["'][^>]*>([\s\S]*?)<\/tbody>/i);
    const scope = bodyM ? bodyM[1] : '';
    const rowRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let r;
    while ((r = rowRe.exec(scope))) {
      const cells = [...r[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((c) => c[1]);
      if (cells.length < 4) continue;
      // Layout: [checkbox], code, name, grade(+graph link), review, challenge
      const code = clean(cells[1]);
      const name = clean(cells[2]);
      // Grade: prefer the value baked into the graph onclick, else the cell's leading text.
      let grade = '';
      const gm = cells[3].match(/getProvisionalResultGraph\([^,]*,\s*'([^']+)'/i);
      grade = gm ? gm[1] : clean(cells[3].replace(/<a[\s\S]*/i, ''));
      const reviewStatus = clean(cells[4] || '');
      const challengeStatus = clean(cells[5] || '');
      if (!code) continue;
      sem.subjects.push({ code, name, grade, reviewStatus, challengeStatus });
    }
    out.push(sem);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Calendar of Events. The portal embeds the events as a JS array inside a
// <script>:   var obj = JSON.parse(JSON.stringify([ {..event..}, ... ]))
// Each event carries FullCalendar-style fields. Two important quirks:
//   • endDate is EXCLUSIVE — it's the day AFTER the event (a single-day event
//     on Aug 15 comes through as start Aug 15, end Aug 16). We normalise the
//     end back by one day so it's an INCLUSIVE last-day.
//   • isClass / eventType are UNRELIABLE for attendance: ISA/ESA exam blocks
//     are flagged isClass:1 (and typed inconsistently — ISA 1 "Test Schedule",
//     ISA 2 "University Events"). Downstream attendance logic must key off
//     isHoliday + the event NAME (ISA/ESA/LWD) + weekday rules, not isClass.
//
// Returns { calendar: { name, start, end } | null,
//           events: [ { name, description, type, start, end, isHoliday,
//                        isClass, color } ] }  with ISO (YYYY-MM-DD) dates.
// ---------------------------------------------------------------------------

export function parseCalendarEvents(html) {
  const result = { calendar: null, events: [] };
  if (!html) return result;
  const m = html.match(/JSON\.parse\(JSON\.stringify\((\[[\s\S]*?\])\)\)/);
  if (!m) return result;
  let arr;
  try {
    arr = JSON.parse(m[1]);
  } catch {
    return result;
  }
  if (!Array.isArray(arr)) return result;

  for (const e of arr) {
    if (!e || !e.name) continue;
    const start = toIsoDate(e.startDate);
    const endExcl = toIsoDate(e.endDate);
    // Roll the exclusive end back to an inclusive last-day. Guard against a
    // missing/degenerate end so single-day events fall back to `start`.
    const end = start && endExcl && endExcl > start ? addDaysIso(endExcl, -1) : (endExcl || start);
    result.events.push({
      name: clean(e.name),
      description: clean(e.description || e.name),
      type: clean(e.eventType || ''),
      start,
      end,
      isHoliday: Number(e.isHoliday) === 1,
      isClass: Number(e.isClass) === 1,
      color: (e.color || '').trim(),
    });
    if (!result.calendar && e.calendarOfEventName) {
      result.calendar = {
        name: clean(e.calendarOfEventName),
        start: toIsoDate(e.coestartdate),
        end: toIsoDate(e.coeenddate),
      };
    }
  }

  // Chronological order (ISO dates sort lexicographically).
  result.events.sort((a, b) => {
    if (a.start && b.start && a.start !== b.start) return a.start < b.start ? -1 : 1;
    return 0;
  });
  return result;
}

// ---------------------------------------------------------------------------
// Orchestrator: log in, then fetch + parse everything.
// ---------------------------------------------------------------------------

export async function fetchAllPortalData({ username, password }, fetchImpl = fetch) {
  let session;
  try {
    session = await login(username, password, fetchImpl);
  } catch (e) {
    // Transport-level failure (DNS / TLS / proxy / reset) before we even authenticated.
    // netFetch has already enriched the message with the failing step + underlying code.
    return {
      ok: false,
      error: e?.message || 'Could not reach the PESU Academy portal.',
      _debug: {
        networkError: true,
        step: e?.step || null,
        code: e?.code || e?.cause?.code || e?.cause?.errno || null,
      },
    };
  }
  if (!session.ok) {
    return {
      ok: false,
      error: 'Could not sign in to the PESU Academy portal. Please check your credentials.',
      _debug: session._debug,
    };
  }

  const data = { ok: true, timetable: null, attendance: [], results: { final: [], provisional: [] }, calendar: null };

  // Timetable (single request).
  try {
    data.timetable = parseTimetable(await fetchTimetable(session, fetchImpl));
  } catch (e) {
    data.timetable = { error: String(e?.message || e) };
  }

  // Calendar of Events (single request — holidays, ISA/ESA windows, FAM/CCM/PTM).
  try {
    data.calendar = parseCalendarEvents(await fetchCalendarEvents(session, fetchImpl));
  } catch (e) {
    data.calendar = { error: String(e?.message || e) };
  }

  // Attendance — one table per available semester.
  try {
    const sems = parseSemesterOptions(await fetchAttendanceSemesters(session, fetchImpl));
    for (const s of sems) {
      const rows = parseAttendance(await fetchAttendance(session, s.value, fetchImpl));
      data.attendance.push({ semester: s.label, batchClassId: s.value, subjects: rows });
    }
  } catch (e) {
    data.attendance = { error: String(e?.message || e) };
  }

  // Results — final (per semester) + provisional (all at once).
  try {
    const sems = parseSemesterOptions(await fetchResultSemesters(session, fetchImpl));
    for (const s of sems) {
      const final = parseResultsFinal(await fetchResultsFinal(session, s.value, fetchImpl));
      data.results.final.push({ semesterLabel: s.label, semid: s.value, ...final });
    }
    data.results.provisional = parseResultsProvisional(await fetchResultsProvisional(session, fetchImpl))
      // The provisional endpoint stacks ALL semesters, but only the active one has
      // live rows; older semesters come back with an empty table. Drop those so the
      // UI doesn't show blank semester tabs.
      .filter((b) => b.subjects && b.subjects.length > 0);
  } catch (e) {
    data.results.error = String(e?.message || e);
  }

  return data;
}
