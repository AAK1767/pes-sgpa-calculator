import { describe, expect, it } from 'vitest';
import {
  extractCsrf,
  parseSemesterOptions,
  parseTimetable,
  parseAttendance,
  parseResultsFinal,
  parseResultsProvisional,
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
