// Per-subject "classes remaining" projection from the PESU timetable + calendar
// of events. This feeds the existing Attendance planner (see
// src/utils/attendanceCalculations.js) — it does NOT re-implement any of the
// planning math, it only estimates how many sessions of each subject are still
// left before teaching ends.
//
// Rules (confirmed by the user, 2026-08-23):
//   • Teaching ends at ISA 2 — count only the window [today, ISA 2 start).
//     ISA 2 itself and everything after it (LWD, project days, ESA, …) is ignored.
//   • Saturdays and Sundays are always off.
//   • Holidays (isHoliday) and ISA 1 / ESA exam windows (matched by NAME, because
//     the portal's isClass / eventType flags are unreliable) are excluded.
//   • FAM / CCM / PTM are NORMAL class days (they aren't holidays and don't match
//     the exam name pattern, so they're counted automatically).
//
// The result is always an EDITABLE ESTIMATE: first-year calendars differ and
// off-timetable classes happen, so the UI lets the student adjust the number.

/* ------------------------------ date helpers ----------------------------- */
// Work purely on ISO "YYYY-MM-DD" strings. Date(UTC) is only used for weekday /
// arithmetic, which is timezone-neutral when built from explicit parts.

function isoToUtc(iso) {
  const [y, m, d] = String(iso || '').split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(Date.UTC(y, m - 1, d));
}

export function addDaysIso(iso, delta) {
  const dt = isoToUtc(iso);
  if (!dt) return iso;
  dt.setUTCDate(dt.getUTCDate() + delta);
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}-${String(dt.getUTCDate()).padStart(2, '0')}`;
}

// 0 = Sunday … 6 = Saturday (matches JS getUTCDay). The timetable stores day
// 1 = Monday … 6 = Saturday, so for Mon–Fri the weekday number equals the
// timetable day directly.
export function isoWeekday(iso) {
  const dt = isoToUtc(iso);
  return dt ? dt.getUTCDay() : null;
}

// Today's date as a local ISO string (student's own timezone), avoiding the
// UTC-shift you'd get from new Date().toISOString().
export function todayIsoLocal(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

/* ------------------------------ event matching ---------------------------- */
const EXAM_NAME_RE = /\b(ISA|ESA)\b/i;      // any internal/end-semester exam window
const ISA2_NAME_RE = /\bISA\s*-?\s*2\b/i;   // ISA 2 / ISA-2 / ISA2
const ESA_NAME_RE = /\bESA\b/i;

// Start ISO of the first event whose name matches `re` (chronologically).
function firstStartMatching(events, re) {
  let best = null;
  for (const e of events) {
    if (!e || !e.start || !re.test(e.name || '')) continue;
    if (best === null || e.start < best) best = e.start;
  }
  return best;
}

export function findIsa2Start(events) {
  if (!Array.isArray(events)) return null;
  return firstStartMatching(events, ISA2_NAME_RE);
}

// Inclusive list of ISO dates spanning an event (start..end).
function eachIso(startIso, endIso) {
  const out = [];
  if (!startIso) return out;
  const end = endIso && endIso >= startIso ? endIso : startIso;
  let cur = startIso;
  for (let guard = 0; cur <= end && guard < 400; guard++) {
    out.push(cur);
    cur = addDaysIso(cur, 1);
  }
  return out;
}

// The set of dates with no regular classes: holidays + ISA/ESA exam windows.
export function excludedDateSet(events) {
  const set = new Set();
  if (!Array.isArray(events)) return set;
  for (const e of events) {
    if (!e || !e.start) continue;
    const isExam = EXAM_NAME_RE.test(e.name || '');
    if (e.isHoliday || isExam) {
      for (const d of eachIso(e.start, e.end)) set.add(d);
    }
  }
  return set;
}

/* --------------------------- teaching-day window -------------------------- */
// ISO dates in [fromIso, capIso) that are actual teaching days:
//   Mon–Fri, not a holiday, not inside an ISA/ESA window.
export function computeTeachingDates({ events, fromIso, capIso }) {
  const out = [];
  if (!fromIso || !capIso || fromIso >= capIso) return out;
  const excluded = excludedDateSet(events);
  let cur = fromIso;
  for (let guard = 0; cur < capIso && guard < 400; guard++) {
    const wd = isoWeekday(cur);
    if (wd !== 0 && wd !== 6 && !excluded.has(cur)) out.push(cur);
    cur = addDaysIso(cur, 1);
  }
  return out;
}

// For each teaching date, add up how many timetable slots each subject has that
// weekday. Keyed by course code (falling back to name).
export function projectPerSubjectSessions(timetable, teachingDates) {
  const entriesByDay = new Map();
  for (const e of (timetable?.entries || [])) {
    if (!entriesByDay.has(e.day)) entriesByDay.set(e.day, []);
    entriesByDay.get(e.day).push(e);
  }
  const counts = new Map(); // key -> { code, name, remaining }
  for (const date of teachingDates) {
    const ttDay = isoWeekday(date); // Mon(1)…Fri(5) — weekends already filtered
    for (const e of (entriesByDay.get(ttDay) || [])) {
      const key = e.code || e.name;
      if (!key) continue;
      if (!counts.has(key)) counts.set(key, { code: e.code || '', name: e.name || '', remaining: 0 });
      counts.get(key).remaining += 1;
    }
  }
  return counts;
}

/* -------------------------------- orchestrator ---------------------------- */
// Returns:
//   { available, reason, windowStart, windowEnd (exclusive), isa2Start,
//     teachingDayCount, totalSessions, perSubject: [{code,name,remaining}],
//     byCode: { [code]: remaining } }
// `reason` explains why a projection couldn't be made ('no-timetable',
// 'no-calendar', 'no-cap', 'past-window').
export function buildAttendanceProjection({ timetable, calendar, todayIso } = {}) {
  const result = {
    available: false, reason: '', windowStart: null, windowEnd: null,
    isa2Start: null, teachingDayCount: 0, totalSessions: 0,
    perSubject: [], byCode: {},
  };

  if (!timetable || !Array.isArray(timetable.entries) || timetable.entries.length === 0) {
    result.reason = 'no-timetable';
    return result;
  }
  if (!calendar || !Array.isArray(calendar.events) || calendar.events.length === 0) {
    result.reason = 'no-calendar';
    return result;
  }

  const events = calendar.events;
  const isa2Start = findIsa2Start(events);
  result.isa2Start = isa2Start;

  // Cap teaching at ISA 2. If the calendar doesn't publish ISA 2 (e.g. some
  // first-year calendars), fall back to ESA start, then to the day after the
  // calendar's own end date.
  const esaStart = firstStartMatching(events, ESA_NAME_RE);
  const calEndExcl = calendar.calendar?.end ? addDaysIso(calendar.calendar.end, 1) : null;
  const capExclusive = isa2Start || esaStart || calEndExcl;
  if (!capExclusive) {
    result.reason = 'no-cap';
    return result;
  }

  // Count from today (or the semester start if we're somehow before it).
  const calStart = calendar.calendar?.start || null;
  const baseToday = todayIso || todayIsoLocal();
  const fromIso = (calStart && baseToday < calStart) ? calStart : baseToday;
  if (fromIso >= capExclusive) {
    result.reason = 'past-window';
    result.windowStart = fromIso;
    result.windowEnd = capExclusive;
    return result;
  }

  const teachingDates = computeTeachingDates({ events, fromIso, capIso: capExclusive });
  const counts = projectPerSubjectSessions(timetable, teachingDates);
  const perSubject = [...counts.values()];

  result.available = true;
  result.windowStart = fromIso;
  result.windowEnd = capExclusive; // exclusive
  result.teachingDayCount = teachingDates.length;
  result.totalSessions = perSubject.reduce((a, s) => a + s.remaining, 0);
  result.perSubject = perSubject;
  result.byCode = Object.fromEntries(perSubject.map((s) => [s.code || s.name, s.remaining]));
  return result;
}
