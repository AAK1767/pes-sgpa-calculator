import { describe, expect, it } from 'vitest';
import {
  extractCsrf,
  parseSemesterOptions,
  parseTimetable,
  parseAttendance,
  parseResultsFinal,
  parseResultsProvisional,
  parseCalendarEvents,
  toIsoDate,
  addDaysIso,
} from './pesuPortal.js';

// NOTE: all fixtures below are synthetic — they mirror the real PESU portal HTML shapes
// (decoded from a captured session) but contain only fake courses/marks, never real data.

describe('extractCsrf', () => {
  it('reads the token from a meta tag regardless of attribute order', () => {
    expect(extractCsrf('<meta name="_csrf" content="abc-123">')).toBe('abc-123');
    expect(extractCsrf('<meta content="xyz-9" name="csrf-token">')).toBe('xyz-9');
    expect(extractCsrf('<input type="hidden" name="_csrf" value="tok-7"/>')).toBe('tok-7');
    expect(extractCsrf('<div>no token here</div>')).toBeNull();
  });
});

describe('parseSemesterOptions', () => {
  it('extracts value/label pairs and drops the placeholder 0', () => {
    const html = `<option value="0">Select</option><option value='3523'>Sem-3</option><option value="3207">Sem-2</option>`;
    expect(parseSemesterOptions(html)).toEqual([
      { value: '3523', label: 'Sem-3' },
      { value: '3207', label: 'Sem-2' },
    ]);
  });

  it('unwraps a JSON-encoded string with escaped double quotes (getStudentSemestersPESU)', () => {
    // Real shape: the body is a JSON string, so inner double quotes arrive escaped.
    const body = JSON.stringify('<option value="3523">Sem-3</option><option value="3207">Sem-2</option>');
    expect(parseSemesterOptions(body)).toEqual([
      { value: '3523', label: 'Sem-3' },
      { value: '3207', label: 'Sem-2' },
    ]);
  });

  it('unwraps a JSON-encoded string with single-quoted values (getEsaAndIsaResultSemBySRN)', () => {
    const body = `"<option value='3207'>Sem-2</option><option value='2929'>Sem-1</option>"`;
    expect(parseSemesterOptions(body)).toEqual([
      { value: '3207', label: 'Sem-2' },
      { value: '2929', label: 'Sem-1' },
    ]);
  });
});

describe('parseTimetable', () => {
  const html = `
    <script>
    var days=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    var noOfDays=6;
    var timeTableTemplateDetailsJson=[
      {"day":0,"orderedBy":1,"startTime":"08:00:16 AM","endTime":"09:00:16 AM"},
      {"day":0,"orderedBy":2,"startTime":"09:00:16 AM","endTime":"10:00:16 AM"}
    ];
    var timeTableJson={
      "ttDivText_1_1_1":["ttSubject_\\u0026\\u0026UE99XX101A-INTRO TO THINGS","ttFaculty_1_\\u0026\\u0026PROF A"],
      "ttDivText_2_2_1":["ttSubject_\\u0026\\u0026UE99XX102A-MORE THINGS","ttFaculty_1_\\u0026\\u0026PROF B","ttFaculty_2_\\u0026\\u0026PROF C"],
      "ttMngRow_1_1_1":["ignore me"]
    };
    </script>`;

  it('builds a day/slot grid with subject, name and faculty', () => {
    const tt = parseTimetable(html);
    expect(tt.days[0]).toBe('Monday');
    expect(tt.entries).toHaveLength(2); // ttMngRow_* ignored
    const mon = tt.entries.find((e) => e.day === 1 && e.slot === 1);
    expect(mon).toMatchObject({ code: 'UE99XX101A', name: 'INTRO TO THINGS', dayName: 'Monday' });
    expect(mon.faculty).toEqual(['PROF A']);
    const tue = tt.entries.find((e) => e.day === 2 && e.slot === 2);
    expect(tue.faculty).toEqual(['PROF B', 'PROF C']);
  });

  it('maps slots to template times', () => {
    const tt = parseTimetable(html);
    expect(tt.slots.find((s) => s.slot === 1)).toEqual({ slot: 1, start: '08:00:16 AM', end: '09:00:16 AM' });
  });
});

describe('parseAttendance', () => {
  const html = `<tbody id="subjetInfo">
    <tr><td>UE99XX101A</td><td>Intro To Things</td><td>11/12</td><td>92</td></tr>
    <tr><td>UE99XX102A</td><td>More Things</td><td>NA</td><td>NA</td></tr>
  </tbody>`;

  it('parses attended/total and percentage, handling NA', () => {
    const rows = parseAttendance(html);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ code: 'UE99XX101A', attended: 11, total: 12, percentage: '92' });
    expect(rows[1]).toMatchObject({ code: 'UE99XX102A', attendedTotal: 'NA', attended: null, total: null });
  });
});

describe('parseResultsFinal', () => {
  const html = `
    <label><span class="lbl-title-light">Semester: </span>2 </label>
    <label><span class="lbl-title-light">ESA Description: </span>ESA JUN 2026</label>
    <div class="dashboard-info-bar">
      <div><h6>Earned Credits</h6>8.0/8.0</div>
      <div><h6>SGPA</h6>9.10</div>
      <div><h6>CGPA</h6>8.88</div>
    </div>
    <div class="header-info">
      <h6><span class="lbl-title-light">UE99XX101A - </span>Intro To Things</h6>
      <h6 class="text-right"><span class="lbl-title-light">Credits:</span> <span>4</span> / 4</h6>
      <div><h6>ISA 1</h6><span class="dark-text">31</span>/40.0</div>
      <div><h6>ISA 2</h6><span class="dark-text">28</span>/40.0</div>
      <div><h6>FINAL ISA</h6><span class="dark-text">35</span></div>
      <div><h6>ESA</h6><span class="f-size-2x-big">A</span></div>
    </div>`;

  it('extracts header SGPA/CGPA and per-subject components', () => {
    const r = parseResultsFinal(html);
    expect(r.semester).toBe('2');
    expect(r.sgpa).toBe('9.10');
    expect(r.cgpa).toBe('8.88');
    expect(r.subjects).toHaveLength(1);
    const s = r.subjects[0];
    expect(s).toMatchObject({ code: 'UE99XX101A', name: 'Intro To Things', esaGrade: 'A' });
    expect(s.credits).toEqual({ earned: 4, total: 4 });
    expect(s.components.find((c) => c.label === 'ISA 1')).toEqual({ label: 'ISA 1', score: 31, max: 40 });
    expect(s.components.find((c) => c.label === 'ESA')).toEqual({ label: 'ESA', grade: 'A' });
  });
});

describe('parseResultsProvisional', () => {
  const html = `
    <label><span class="lbl-title-light">Semester:</span> 2 Sem</label>
    <label><span class="lbl-title-light">ESA Description: </span>Provisional Results Of B.Tech - : 2 Semester (Assessment - FEB-JUNE 2026)</label>
    <div class="dashboard-info-bar"><div><h6>EARNED</h6>8</div><div><h6>SGPA</h6>9.10</div><div><h6>TAKEN</h6>8</div></div>
    <tbody id="subjetInfo">
      <tr><td data-name='1'><input></td><td>UE99XX101A</td><td>Intro To Things</td><td>A<a onclick=getProvisionalResultGraph('UE99XX101A','A','1')></a></td><td>Verified</td><td> </td></tr>
      <tr><td data-name='2'><input></td><td>UE99XX102A</td><td>More Things</td><td>B<a onclick=getProvisionalResultGraph('UE99XX102A','B','2')></a></td><td> </td><td> </td></tr>
    </tbody>
    <label><span class="lbl-title-light">Semester:</span> 1 Sem</label>
    <div class="dashboard-info-bar"><div><h6>EARNED</h6>4</div><div><h6>SGPA</h6>8.50</div><div><h6>TAKEN</h6>4</div></div>
    <tbody id="subjetInfo">
      <tr><td data-name='3'><input></td><td>UE99XX001A</td><td>Old Thing</td><td>S<a onclick=getProvisionalResultGraph('UE99XX001A','S','3')></a></td><td> </td><td> </td></tr>
    </tbody>`;

  it('returns one block per semester with grades and review status', () => {
    const blocks = parseResultsProvisional(html);
    expect(blocks).toHaveLength(2);
    expect(blocks[0]).toMatchObject({ sgpa: '9.10', earned: '8', taken: '8' });
    expect(blocks[0].semester).toMatch(/2/);
    expect(blocks[0].subjects).toHaveLength(2);
    expect(blocks[0].subjects[0]).toMatchObject({ code: 'UE99XX101A', grade: 'A', reviewStatus: 'Verified' });
    expect(blocks[1].subjects[0]).toMatchObject({ code: 'UE99XX001A', grade: 'S' });
  });
});

describe('toIsoDate / addDaysIso', () => {
  it('parses the portal date format to ISO without timezone drift', () => {
    expect(toIsoDate('Aug 3, 2026, 12:00:00 AM')).toBe('2026-08-03');
    expect(toIsoDate('Dec 25, 2026, 12:00:00 AM')).toBe('2026-12-25');
    expect(toIsoDate('')).toBeNull();
    expect(toIsoDate('not a date')).toBeNull();
  });

  it('adds/subtracts days across month boundaries', () => {
    expect(addDaysIso('2026-08-16', -1)).toBe('2026-08-15');
    expect(addDaysIso('2026-09-01', -1)).toBe('2026-08-31');
    expect(addDaysIso('2026-12-31', 1)).toBe('2027-01-01');
  });
});

describe('parseCalendarEvents', () => {
  // Mirrors the real shape: events embedded in a <script> as
  // var obj = JSON.parse(JSON.stringify([ ...events... ])). endDate is EXCLUSIVE.
  const evt = (o) => ({
    calendarEventDetailId: 1, calendarEventId: 1, calendarOfEventId: 54,
    eventTypeId: 25, isHolidayNull: false, isClassNull: false, status: 0,
    batchId: 98, instId: 1, calendarOfEventName: 'Aug 2026 - Dec 2026',
    coestartdate: 'Jul 30, 2026, 12:00:00 AM', coeenddate: 'Dec 31, 2026, 12:00:00 AM',
    istoday: 0, ...o,
  });
  const events = [
    evt({ name: 'FAM 1', description: 'FAM 1', eventType: 'University Events', color: '#257e4a',
      startDate: 'Aug 19, 2026, 12:00:00 AM', endDate: 'Aug 20, 2026, 12:00:00 AM', isHoliday: 0, isClass: 1 }),
    evt({ name: 'Independence Day', description: 'Independence Day', eventType: 'National Festival', color: '#b12000',
      startDate: 'Aug 15, 2026, 12:00:00 AM', endDate: 'Aug 16, 2026, 12:00:00 AM', isHoliday: 1, isClass: 0 }),
    evt({ name: 'ISA 1', description: 'ISA 1', eventType: 'Test Schedule', color: '#333',
      startDate: 'Sep 19, 2026, 12:00:00 AM', endDate: 'Sep 20, 2026, 12:00:00 AM', isHoliday: 0, isClass: 1 }),
  ];
  const html = `<div id="studentpesucalendar_wrap"></div>
    <script> var obj = JSON.parse(JSON.stringify(${JSON.stringify(events)})); renderCal(obj); </script>`;

  it('extracts events, converts dates to ISO and rolls the exclusive end back one day', () => {
    const { events: out } = parseCalendarEvents(html);
    expect(out).toHaveLength(3);
    // Sorted chronologically — Independence Day (Aug 15) comes before FAM 1 (Aug 19).
    const ind = out.find((e) => e.name === 'Independence Day');
    expect(ind).toMatchObject({ start: '2026-08-15', end: '2026-08-15', isHoliday: true, isClass: false });
    const fam = out.find((e) => e.name === 'FAM 1');
    expect(fam).toMatchObject({ start: '2026-08-19', end: '2026-08-19', type: 'University Events', color: '#257e4a' });
  });

  it('exposes the calendar-period metadata', () => {
    const { calendar } = parseCalendarEvents(html);
    expect(calendar).toEqual({ name: 'Aug 2026 - Dec 2026', start: '2026-07-30', end: '2026-12-31' });
  });

  it('keeps isClass:1 on exam blocks (the flag is unreliable for attendance)', () => {
    // Documents the known quirk: ISA is flagged isClass:1 even though no classes run.
    const { events: out } = parseCalendarEvents(html);
    const isa = out.find((e) => e.name === 'ISA 1');
    expect(isa.isClass).toBe(true);
    expect(isa.isHoliday).toBe(false);
  });

  it('returns an empty shape when no calendar script is present', () => {
    expect(parseCalendarEvents('<div>nothing here</div>')).toEqual({ calendar: null, events: [] });
    expect(parseCalendarEvents('')).toEqual({ calendar: null, events: [] });
  });
});
