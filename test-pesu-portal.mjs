#!/usr/bin/env node
// Standalone tester for the PESU Academy portal scraper (timetable / attendance / results).
//
// The in-sandbox environment can't reach pesuacademy.com, so run this on your own machine
// to confirm the login replication + parsing work end-to-end before trusting the in-app UI.
// It imports the SAME code the app uses (server/pesuPortal.js), so a pass here means the
// app will work too.
//
// Usage (any one):
//   node test-pesu-portal.mjs                      # prompts for SRN/PRN + password (hidden)
//   node test-pesu-portal.mjs PES1UG23CS001 mypass # positional args
//   PESU_USER=... PESU_PASS=... node test-pesu-portal.mjs
//
// Nothing is stored or logged to disk. Credentials are used once for the login request.

import readline from 'node:readline';
import {
  login,
  fetchTimetable, parseTimetable,
  fetchAttendanceSemesters, fetchAttendance, parseAttendance,
  fetchResultSemesters, fetchResultsFinal, fetchResultsProvisional,
  parseResultsFinal, parseResultsProvisional, parseSemesterOptions,
  fetchCalendarEvents, parseCalendarEvents,
} from './server/pesuPortal.js';

function ask(question, { hidden = false } = {}) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    if (hidden) {
      const stdout = process.stdout;
      const onData = (char) => {
        char = String(char);
        if (['\n', '\r', ''].includes(char)) process.stdin.removeListener('data', onData);
        else stdout.write('\x1b[2K\x1b[200D' + question + '*'.repeat(rl.line.length));
      };
      process.stdin.on('data', onData);
    }
    rl.question(question, (ans) => { rl.close(); resolve(ans); });
  });
}

async function main() {
  let username = process.env.PESU_USER || process.argv[2];
  let password = process.env.PESU_PASS || process.argv[3];
  if (!username) username = (await ask('SRN / PRN: ')).trim();
  if (!password) { password = await ask('Password (hidden): ', { hidden: true }); process.stdout.write('\n'); }
  if (!username || !password) { console.error('Need both username and password.'); process.exit(1); }

  console.log('\n── Step 1: logging in to PESU Academy ─────────────────────────');
  const session = await login(username, password);
  console.log('login debug:', JSON.stringify(session._debug, null, 2));
  if (!session.ok) {
    console.error('\n❌ Login did not succeed. Share the "login debug" block above (it contains');
    console.error('   NO credentials) so the extraction/flow can be adjusted.');
    process.exit(1);
  }
  console.log('✅ Logged in. AJAX csrf token acquired.');

  console.log('\n── Step 2: timetable ──────────────────────────────────────────');
  try {
    const tt = parseTimetable(await fetchTimetable(session));
    console.log(`days=${tt.days.join(', ')}`);
    console.log(`slots: ${tt.slots.map((s) => `${s.slot}(${s.start}-${s.end})`).join('  ')}`);
    for (let d = 1; d <= tt.days.length; d++) {
      const rows = tt.entries.filter((e) => e.day === d);
      if (rows.length) console.log(`  ${tt.days[d - 1]}: ` + rows.map((r) => `[${r.slot}] ${r.code} ${r.name}`).join(' | '));
    }
  } catch (e) { console.error('timetable error:', e.message); }

  console.log('\n── Step 3: attendance ─────────────────────────────────────────');
  try {
    const sems = parseSemesterOptions(await fetchAttendanceSemesters(session));
    console.log('semesters:', sems.map((s) => `${s.label}(${s.value})`).join(', '));
    for (const s of sems) {
      const rows = parseAttendance(await fetchAttendance(session, s.value));
      console.log(`  ${s.label}:`);
      rows.forEach((r) => console.log(`     ${r.code}  ${r.attendedTotal}  ${r.percentage}%  ${r.name}`));
    }
  } catch (e) { console.error('attendance error:', e.message); }

  console.log('\n── Step 4: results (final + provisional) ──────────────────────');
  try {
    const sems = parseSemesterOptions(await fetchResultSemesters(session));
    console.log('result semesters:', sems.map((s) => `${s.label}(${s.value})`).join(', '));
    for (const s of sems) {
      const f = parseResultsFinal(await fetchResultsFinal(session, s.value));
      console.log(`  FINAL ${s.label}: SGPA ${f.sgpa}  CGPA ${f.cgpa}  earned ${f.earnedCredits}`);
      f.subjects.forEach((sub) => {
        const comps = sub.components.map((c) => (c.grade ? `${c.label}:${c.grade}` : `${c.label}:${c.score}${c.max ? '/' + c.max : ''}`)).join(' ');
        console.log(`     ${sub.code} ${sub.name} — ${comps}`);
      });
    }
    const prov = parseResultsProvisional(await fetchResultsProvisional(session));
    prov.forEach((p) => {
      console.log(`  PROVISIONAL ${p.semester}: SGPA ${p.sgpa}  (earned ${p.earned}/${p.taken})`);
      p.subjects.forEach((sub) => console.log(`     ${sub.code} ${sub.name} — ${sub.grade}${sub.reviewStatus ? '  [' + sub.reviewStatus + ']' : ''}`));
    });
  } catch (e) { console.error('results error:', e.message); }

  console.log('\n── Step 5: calendar of events ─────────────────────────────────');
  try {
    const cal = parseCalendarEvents(await fetchCalendarEvents(session));
    if (cal.calendar) console.log(`period: ${cal.calendar.name}  (${cal.calendar.start} → ${cal.calendar.end})`);
    const holidays = cal.events.filter((e) => e.isHoliday).length;
    const exams = cal.events.filter((e) => /\b(ISA|ESA)\b/i.test(e.name)).length;
    console.log(`${cal.events.length} events  |  ${holidays} holidays, ${exams} ISA/ESA days`);
    cal.events.forEach((e) => {
      const tag = e.isHoliday ? 'HOLIDAY' : /\b(ISA|ESA)\b/i.test(e.name) ? 'EXAM   ' : 'event  ';
      const span = e.end && e.end !== e.start ? `${e.start}→${e.end}` : e.start;
      console.log(`     ${tag} ${span.padEnd(21)} ${e.name}${e.type ? '  (' + e.type + ')' : ''}`);
    });
  } catch (e) { console.error('calendar error:', e.message); }

  console.log('\n✅ Done.');
}

main().catch((e) => { console.error(e); process.exit(1); });
