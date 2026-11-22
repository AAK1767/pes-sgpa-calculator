import React, { useState, useMemo } from 'react';
import {
  CalendarDays, CalendarRange, ClipboardList, Award, Clock, RefreshCw,
  Loader2, Users, Send, Download, ChevronDown, ChevronRight, Check, AlertTriangle,
} from 'lucide-react';
import {
  buildCurrentAttendanceStats, buildAttendancePlan, parseNonNegativeInt,
} from '../utils/attendanceCalculations';
import { buildAttendanceProjection } from '../utils/attendanceProjection';
import { buildImportPlan, summarizeGrades } from '../utils/resultsImport';

function fmtTime(t) {
  if (!t) return '';
  const m = String(t).match(/(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)/i);
  if (!m) return t;
  return `${Number(m[1])}:${m[2]} ${m[3].toUpperCase()}`;
}

// Grade chips use the same ordered scale as the rest of the app.
function gradeChip(g) {
  const grade = String(g || '').trim().toUpperCase();
  if (grade === 'S') return 'border-grade-s/40 bg-grade-s/10 text-grade-s';
  if (grade === 'A') return 'border-grade-a/40 bg-grade-a/10 text-grade-a';
  if (grade === 'B') return 'border-grade-b/40 bg-grade-b/10 text-grade-b';
  if (grade === 'C') return 'border-grade-c/40 bg-grade-c/10 text-grade-c';
  if (grade === 'D') return 'border-grade-d/40 bg-grade-d/10 text-grade-d';
  if (grade === 'E') return 'border-grade-e/40 bg-grade-e/10 text-grade-e';
  if (grade === 'F' || grade === 'W') return 'border-grade-f/40 bg-grade-f/10 text-grade-f';
  return 'border-line bg-raised text-ink-2';
}

// Solid fill used for the grade-distribution bar segments.
function gradeBar(g) {
  const grade = String(g || '').trim().toUpperCase();
  if (grade === 'S') return 'bg-grade-s';
  if (grade === 'A') return 'bg-grade-a';
  if (grade === 'B') return 'bg-grade-b';
  if (grade === 'C') return 'bg-grade-c';
  if (grade === 'D') return 'bg-grade-d';
  if (grade === 'E') return 'bg-grade-e';
  if (grade === 'F' || grade === 'W') return 'bg-grade-f';
  return 'bg-ink-3';
}

function pctColor(p) {
  const n = Number(p);
  if (Number.isNaN(n)) return 'text-ink-3';
  if (n >= 85) return 'text-good';
  if (n >= 75) return 'text-ink';
  if (n >= 65) return 'text-warn';
  return 'text-bad';
}

/* ------------------------- Calendar date helpers ------------------------- */
// All work on ISO "YYYY-MM-DD" strings the parser produced. We deliberately
// avoid `new Date(isoString)` for formatting (it parses as UTC and can shift a
// day in local time); we split the parts by hand and only use Date(UTC) for the
// weekday, which is timezone-neutral.
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function isoParts(iso) {
  const [y, m, d] = String(iso || '').split('-').map(Number);
  return { y, m, d };
}
function monthKey(iso) {
  const { y, m } = isoParts(iso);
  return `${y}-${String(m).padStart(2, '0')}`;
}
function monthTitle(iso) {
  const { y, m } = isoParts(iso);
  return `${MONTH_NAMES[m - 1]} ${y}`;
}
function dayLabel(iso) {
  const { m, d } = isoParts(iso);
  return `${MONTH_ABBR[m - 1]} ${d}`;
}
function weekdayAbbr(iso) {
  const { y, m, d } = isoParts(iso);
  if (!y || !m || !d) return '';
  return WEEKDAY_ABBR[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
}

// Display category for an event. isClass/eventType are unreliable for exams, so
// we key off isHoliday and the event NAME (ISA/ESA) + the Test Schedule type.
function eventKind(e) {
  if (e.isHoliday) return 'holiday';
  if (/\b(ISA|ESA)\b/i.test(e.name || '') || /test\s*schedule/i.test(e.type || '')) return 'exam';
  return 'event';
}

const KIND_STYLE = {
  holiday: { label: 'Holiday', bar: 'border-l-bad', badge: 'border-bad/30 bg-bad/10 text-bad' },
  exam: { label: 'Exam', bar: 'border-l-warn', badge: 'border-warn/30 bg-warn/10 text-warn' },
  event: { label: 'Event', bar: 'border-l-line-strong', badge: 'border-line bg-raised text-ink-2' },
};

// Collapse consecutive same-named events (e.g. the six "ISA 1" day-rows) into
// one entry spanning first to last, so the list reads as logical events not days.
function groupEvents(events) {
  const groups = [];
  for (const e of events) {
    const last = groups[groups.length - 1];
    if (last && last.name === e.name && last.kind === eventKind(e)) {
      last.end = e.end > last.end ? e.end : last.end;
      last.days += 1;
    } else {
      groups.push({ ...e, kind: eventKind(e), days: 1 });
    }
  }
  return groups;
}

function SemesterPills({ items, selected, onSelect, labelOf }) {
  if (!items || items.length <= 1) return null;
  return (
    <div className="seg mb-4" role="tablist">
      {items.map((it, i) => (
        <button
          key={i}
          type="button"
          role="tab"
          aria-selected={i === selected}
          onClick={() => onSelect(i)}
          className="seg-item"
        >
          {labelOf(it)}
        </button>
      ))}
    </div>
  );
}

function EmptyNote({ children }) {
  return <p className="py-6 text-center text-sm text-ink-3">{children}</p>;
}

function Stat({ label, value }) {
  return (
    <div className="inset px-3 py-2">
      <div className="text-xs text-ink-3">{label}</div>
      <div className="num text-lg font-semibold leading-tight text-ink">{value}</div>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="inset px-2 py-1.5 text-center">
      <div className="num text-sm font-semibold leading-none text-ink">{value}</div>
      <div className="mt-1 text-xs leading-tight text-ink-3">{label}</div>
    </div>
  );
}

/* ------------------------------- Timetable ------------------------------- */
function TimetableView({ tt }) {
  if (!tt || tt.error || !tt.entries || tt.entries.length === 0) {
    return <EmptyNote>No timetable was found for your account.</EmptyNote>;
  }
  const slotTime = Object.fromEntries((tt.slots || []).map((s) => [s.slot, s]));
  const days = [];
  for (let d = 1; d <= (tt.days?.length || 6); d++) {
    const rows = tt.entries.filter((e) => e.day === d).sort((a, b) => a.slot - b.slot);
    if (rows.length) days.push({ name: tt.days?.[d - 1] || `Day ${d}`, rows });
  }
  return (
    <div className="space-y-5">
      {days.map((day) => (
        <div key={day.name}>
          <h4 className="mb-2 text-sm font-semibold text-ink">{day.name}</h4>
          <div className="space-y-1.5">
            {day.rows.map((r, i) => {
              const st = slotTime[r.slot];
              return (
                <div key={i} className="flex items-start gap-3 rounded-md border border-line p-2.5">
                  <div className="num flex w-[92px] shrink-0 items-center gap-1 pt-0.5 text-xs text-ink-3">
                    <Clock className="h-3 w-3" />
                    {st ? `${fmtTime(st.start)}` : `Slot ${r.slot}`}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-ink">{r.name || r.code}</div>
                    <div className="text-xs text-ink-3">
                      {r.code}
                      {r.faculty && r.faculty.length > 0 && (
                        <span className="ml-2 inline-flex items-center gap-1">
                          <Users className="h-3 w-3" /> {r.faculty.join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------- Attendance ------------------------------ */
// One subject: its current attendance, an editable "classes left" estimate
// (auto-filled from the timetable + calendar projection), a quick 75% outlook,
// and a button that loads it straight into the main Attendance planner.
function AttendanceSubjectCard({ s, projectedLeft, onSendToPlanner }) {
  const hasNumbers = Number.isFinite(s.attended) && Number.isFinite(s.total) && s.total > 0;
  const defaultLeft = Number.isFinite(projectedLeft) ? projectedLeft : null;
  const [leftInput, setLeftInput] = useState(defaultLeft != null ? String(defaultLeft) : '');

  const stats = hasNumbers ? buildCurrentAttendanceStats(s.total, s.attended) : { ready: false };
  const remaining = parseNonNegativeInt(leftInput);
  const plan = stats.ready && remaining !== null
    ? buildAttendancePlan(stats.total, stats.attended, remaining, 75)
    : null;

  return (
    <div className="rounded-lg border border-line p-3">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-sm font-semibold leading-tight text-ink">{s.name || s.code}</div>
          <div className="text-xs text-ink-3">{s.code}</div>
        </div>
        <div className="shrink-0 text-right">
          <div className={`num text-lg font-semibold leading-none ${pctColor(s.percentage)}`}>
            {s.percentage === 'NA' ? '-' : `${s.percentage}%`}
          </div>
          <div className="num mt-0.5 text-xs text-ink-3">{s.attendedTotal} classes</div>
        </div>
      </div>

      {hasNumbers ? (
        <>
          <div className="flex flex-wrap items-end gap-2">
            <label>
              <span className="label">
                Classes left {defaultLeft != null && <span className="font-normal text-ink-3">(estimated {defaultLeft})</span>}
              </span>
              <input
                type="number"
                min="0"
                inputMode="numeric"
                value={leftInput}
                onChange={(e) => setLeftInput(e.target.value)}
                placeholder="est."
                className="input num w-24 font-semibold"
              />
            </label>
            <button
              type="button"
              onClick={() => onSendToPlanner && onSendToPlanner({
                total: stats.total,
                attended: stats.attended,
                classesLeft: remaining,
                name: s.name || s.code,
              })}
              className="btn btn-secondary btn-sm"
            >
              <Send className="h-3.5 w-3.5" /> Use in calculators
            </button>
          </div>

          {plan && remaining > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-1.5">
              <MiniStat label="Can miss (75%)" value={plan.safeMisses75} />
              <MiniStat label="Must attend (75%)" value={plan.mustAttendFor75} />
              <MiniStat
                label="Final % range"
                value={`${plan.worstFinalPercentage.toFixed(0)} to ${plan.bestFinalPercentage.toFixed(0)}%`}
              />
            </div>
          )}
        </>
      ) : (
        <p className="text-xs text-ink-3">Attendance hasn&apos;t been recorded for this subject yet.</p>
      )}
    </div>
  );
}

function AttendanceView({ att, timetable, calendar, onSendToPlanner }) {
  const [sel, setSel] = useState(0);

  const projection = useMemo(
    () => buildAttendanceProjection({ timetable, calendar }),
    [timetable, calendar]
  );

  if (!att || att.error || att.length === 0) {
    return <EmptyNote>No attendance data was found for your account.</EmptyNote>;
  }
  const cur = att[sel] || att[0];

  return (
    <div>
      <SemesterPills items={att} selected={sel} onSelect={setSel} labelOf={(s) => s.semester} />

      {projection.available ? (
        <div className="notice notice-info mb-3 text-xs leading-relaxed">
          About <strong className="num font-medium text-ink">{projection.teachingDayCount}</strong> teaching days left
          {projection.isa2Start ? ' before ISA 2' : ' this semester'}
          {' '}(weekends, holidays and exam windows removed). The estimates below are filled in from your timetable. Change any number, then use it in the calculators.
        </div>
      ) : (
        <div className="notice notice-info mb-3 text-xs leading-relaxed">
          Couldn&apos;t estimate the remaining classes automatically (timetable or calendar unavailable). Type a &ldquo;classes left&rdquo; number for a subject and use it in the calculators.
        </div>
      )}

      <div className="space-y-2">
        {cur.subjects.map((s, i) => (
          <AttendanceSubjectCard
            key={`${s.code || i}:${projection.byCode[s.code] ?? projection.byCode[s.name] ?? 'none'}`}
            s={s}
            projectedLeft={projection.byCode[s.code] ?? projection.byCode[s.name]}
            onSendToPlanner={onSendToPlanner}
          />
        ))}
      </div>
    </div>
  );
}

/* --------------------------------- Results -------------------------------- */

// Human labels for the importable calculator fields.
const FIELD_LABEL = { isa1: 'ISA 1', isa2: 'ISA 2', assignment: 'Assignment', lab: 'Lab' };

// Read-only analytics: a proportional strip + chips of the grade spread for a
// semester's subjects.
function GradeDistribution({ subjects }) {
  const { counts, total } = summarizeGrades(subjects || []);
  if (!total) return null;
  return (
    <div className="inset mb-4 p-3">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-ink">Grade distribution</span>
        <span className="num text-xs text-ink-3">{total} graded</span>
      </div>
      <div className="mb-2.5 flex h-2 gap-0.5 overflow-hidden rounded-full bg-raised">
        {counts.map(({ grade, count }) => (
          <div
            key={grade}
            className={gradeBar(grade)}
            style={{ width: `${(count / total) * 100}%` }}
            title={`${grade}: ${count}`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {counts.map(({ grade, count }) => (
          <span key={grade} className={`num rounded border px-1.5 py-0.5 text-xs font-semibold ${gradeChip(grade)}`}>
            {grade} <span className="font-normal opacity-75">x{count}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function ConfidenceBadge({ confidence }) {
  const map = {
    high: 'border-good/30 bg-good/10 text-good',
    medium: 'border-line bg-raised text-ink-2',
    low: 'border-warn/30 bg-warn/10 text-warn',
  };
  return (
    <span className={`rounded border px-1.5 py-0.5 text-xs font-medium ${map[confidence] || map.low}`}>
      {confidence} match
    </span>
  );
}

// One matched portal-to-calculator row in the import preview: a checkbox, the
// name mapping, the exact fields (with /max) that will be set, and any caveats.
function MatchRow({ m, checked, onToggle }) {
  const fieldKeys = ['isa1', 'isa2', 'assignment', 'lab'].filter((k) => m.fields[k] != null);
  const labNotImported = m.labParts.length > 0 && m.fields.lab == null;
  return (
    <div className={`rounded-md border p-2.5 transition-colors ${checked ? 'border-line-strong' : 'border-line opacity-60'}`}>
      <label className="flex cursor-pointer items-start gap-2.5">
        <input type="checkbox" checked={checked} onChange={onToggle} className="mt-0.5 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-sm font-medium leading-tight text-ink">{m.portalName}</span>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-ink-3" />
            <span className="text-sm leading-tight text-ink-2">{m.calcName}</span>
            <ConfidenceBadge confidence={m.confidence} />
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {fieldKeys.map((k) => {
              const willOverwrite = m.overwrites.includes(k);
              return (
                <span
                  key={k}
                  className={`rounded border px-1.5 py-0.5 text-xs ${willOverwrite ? 'border-warn/30 bg-warn/10 text-warn' : 'border-line bg-raised text-ink-2'}`}
                >
                  {FIELD_LABEL[k]}: <span className="num font-semibold text-ink">
                    {m.fields[k]}{m.fields[k + 'Max'] ? `/${m.fields[k + 'Max']}` : ''}
                  </span>
                  {willOverwrite && <span className="ml-1">(replaces)</span>}
                </span>
              );
            })}
          </div>
          {m.esaGrade && (
            <div className="mt-1 text-xs text-ink-3">
              ESA grade <span className="font-semibold text-ink-2">{m.esaGrade}</span> is kept as a letter and not imported.
            </div>
          )}
          {m.review && (
            <div className="mt-1 inline-flex items-center gap-1 text-xs text-warn">
              <AlertTriangle className="h-3 w-3 shrink-0" /> Lab is a sum of {m.labParts.join(' + ')}. Double-check it.
            </div>
          )}
          {labNotImported && (
            <div className="mt-1 text-xs text-ink-3">
              {m.labParts.join(', ')} found on the portal, but this subject has no lab slot. Turn on a lab component for it on the Subjects page to include {m.labParts.length > 1 ? 'them' : 'it'}.
            </div>
          )}
        </div>
      </label>
    </div>
  );
}

// A collapsible "these didn't match" list for portal-only or calculator-only subjects.
function UnmatchedNote({ title, items, tone }) {
  const [show, setShow] = useState(false);
  const toneCls = tone === 'amber' ? 'text-warn' : 'text-ink-3';
  if (!items.length) return null;
  return (
    <div>
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className={`inline-flex items-center gap-1 text-xs font-medium ${toneCls} hover:opacity-80`}
      >
        {show ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        {title} ({items.length})
      </button>
      {show && (
        <ul className="ml-4 mt-1 space-y-0.5">
          {items.map((it, i) => <li key={i} className="text-xs text-ink-3">&bull; {it}</li>)}
        </ul>
      )}
    </div>
  );
}

function ImportDefinitionRow({ item }) {
  const fieldKeys = ['isa1', 'isa2', 'assignment', 'lab'].filter((k) => item.fields[k] != null);
  const structure = item.subject.hasLab ? 'theory + lab' : 'theory';
  return (
    <div className="rounded-md border border-line p-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-sm font-medium leading-tight text-ink">{item.name || item.code}</div>
          <div className="text-xs text-ink-3">{item.code || 'No course code'} &middot; {item.credits} credits &middot; {structure}</div>
        </div>
        {item.esaGrade && (
          <span className={`shrink-0 rounded border px-1.5 py-0.5 text-xs font-semibold ${gradeChip(item.esaGrade)}`}>
            ESA {item.esaGrade}
          </span>
        )}
      </div>
      {fieldKeys.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {fieldKeys.map((key) => (
            <span key={key} className="rounded border border-line bg-raised px-1.5 py-0.5 text-xs text-ink-2">
              {FIELD_LABEL[key]}: <span className="num font-semibold text-ink">{item.fields[key]}{item.fields[`${key}Max`] ? `/${item.fields[`${key}Max`]}` : ''}</span>
            </span>
          ))}
        </div>
      )}
      {item.labParts?.length > 0 && item.fields.lab == null && (
        <div className="mt-1 text-xs text-ink-3">Lab marks found ({item.labParts.join(' + ')}) but no lab slot was created.</div>
      )}
    </div>
  );
}

// Imports this semester's results into the calculator's Subjects page in one click.
// A preview of what gets imported is available underneath; the import is undoable.
function ResultsImportPanel({ finalSem, provisionalSem, subjects, marks, onImportResults }) {
  const [done, setDone] = useState(0);

  const plan = useMemo(
    () => buildImportPlan({
      calcSubjects: subjects || [],
      finalSem,
      provisionalSem,
      marks: marks || {},
    }),
    [subjects, finalSem, provisionalSem, marks]
  );

  if (!subjects || !onImportResults) return null;

  const rebuildCreates = plan.rebuild;

  const doImport = () => {
    if (!rebuildCreates.length) return;
    const n = onImportResults({ mode: 'rebuild', fills: [], creates: rebuildCreates });
    const expected = rebuildCreates.length;
    setDone(typeof n === 'number' ? n : expected);
  };

  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={doImport}
        disabled={rebuildCreates.length === 0}
        className="btn btn-primary"
      >
        <Download className="h-4 w-4" />
        Import marks to calculator
        {plan.matched.length > 0 && (
          <span className="num rounded-full bg-accent-ink/20 px-1.5 py-0.5 text-xs leading-none">
            {plan.matched.length}
          </span>
        )}
      </button>

      {done > 0 ? (
        <p className="mt-2 inline-flex items-center gap-1 text-sm text-good">
          <Check className="h-4 w-4" /> Imported {done} subject{done === 1 ? '' : 's'}. Check the Subjects page; you can undo it there.
        </p>
      ) : (
        <p className="mt-2 flex items-center gap-1 text-xs text-ink-3">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          Replaces your Subjects list with this semester&apos;s portal subjects. You can undo it from the Subjects page.
        </p>
      )}

      <details className="disclosure mt-2">
        <summary>
          <span>See what gets imported</span>
          <ChevronDown className="chev" />
        </summary>
        <div className="inset mt-2 space-y-3 p-3">
          <p className="text-xs leading-relaxed text-ink-3">
            Subjects are matched by name. ISA and assignment numbers come from your results; the ESA stays a letter grade and isn&apos;t imported.
          </p>

          {plan.preset && plan.preset.matched * 2 >= plan.rebuild.length && (
            <p className="text-xs text-good">
              Detected semester template: {plan.preset.name}. The current Subjects list will be replaced with these portal subjects.
            </p>
          )}

          <div className="text-sm font-medium text-ink">Replace current subjects with {rebuildCreates.length} from {finalSem.semesterLabel || `semester ${finalSem.semester}`}</div>
          <div className="space-y-2">{rebuildCreates.map((item) => <ImportDefinitionRow key={item.code || item.name} item={item} />)}</div>

          <div className="space-y-1.5">
            <UnmatchedNote title="On the portal, no calculator match" items={plan.unmatchedPortal.map((u) => u.name)} tone="amber" />
            <UnmatchedNote title="In your calculator, no portal match this semester" items={plan.unmatchedCalc.map((u) => u.name)} tone="zinc" />
          </div>

        </div>
      </details>
    </div>
  );
}

function FinalResults({ final, provisional, subjects, marks, onImportResults }) {
  const [sel, setSel] = useState(0);
  if (!final || final.length === 0) return <EmptyNote>No final results available yet.</EmptyNote>;
  const cur = final[sel] || final[0];
  // The provisional semester with the same number, so any numbers the portal
  // might expose there are merged into the import as well.
  const provSem = (provisional || []).find((p) => String(p.semester) === String(cur.semester)) || null;
  return (
    <div>
      <SemesterPills items={final} selected={sel} onSelect={setSel} labelOf={(s) => s.semesterLabel || `Sem ${s.semester}`} />
      <div className="mb-4 flex flex-wrap gap-2">
        {cur.sgpa && <Stat label="SGPA" value={cur.sgpa} />}
        {cur.cgpa && <Stat label="CGPA" value={cur.cgpa} />}
        {cur.earnedCredits && <Stat label="Credits" value={cur.earnedCredits} />}
      </div>
      {cur.esaDescription && <p className="mb-3 text-xs text-ink-3">{cur.esaDescription}</p>}
      <GradeDistribution subjects={cur.subjects} />
      <ResultsImportPanel
        finalSem={cur}
        provisionalSem={provSem}
        subjects={subjects}
        marks={marks}
        onImportResults={onImportResults}
      />
      <div className="space-y-2.5">
        {cur.subjects.map((s, i) => (
          <div key={i} className="rounded-lg border border-line p-3">
            <div className="mb-2 flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-sm font-semibold leading-tight text-ink">{s.name || s.code}</div>
                <div className="num text-xs text-ink-3">
                  {s.code}{s.credits ? ` \u00b7 ${s.credits.earned}/${s.credits.total} credits` : ''}
                </div>
              </div>
              {s.esaGrade && (
                <span className={`shrink-0 rounded border px-2 py-0.5 text-sm font-semibold ${gradeChip(s.esaGrade)}`}>
                  {s.esaGrade}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {s.components.filter((c) => c.label !== 'ESA').map((c, j) => (
                <span key={j} className="rounded border border-line bg-raised px-1.5 py-0.5 text-xs text-ink-2">
                  {c.label}: <span className="num font-medium text-ink">{c.grade ?? c.score}{c.max ? `/${c.max}` : ''}</span>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProvisionalResults({ provisional }) {
  const [sel, setSel] = useState(0);
  if (!provisional || provisional.length === 0) return <EmptyNote>No provisional results available.</EmptyNote>;
  const cur = provisional[sel] || provisional[0];
  return (
    <div>
      <SemesterPills items={provisional} selected={sel} onSelect={setSel} labelOf={(s) => s.semester} />
      <div className="mb-3 flex flex-wrap gap-2">
        {cur.sgpa && <Stat label="SGPA" value={cur.sgpa} />}
        {cur.earned && <Stat label="Earned" value={cur.earned} />}
        {cur.taken && <Stat label="Taken" value={cur.taken} />}
      </div>
      {cur.assessment && <p className="mb-3 text-xs text-ink-3">{cur.assessment}</p>}
      <GradeDistribution subjects={cur.subjects} />
      <div className="space-y-1.5">
        {cur.subjects.map((s, i) => (
          <div key={i} className="flex items-center justify-between gap-2 rounded-md border border-line p-2.5">
            <div className="min-w-0">
              <div className="text-sm font-medium leading-tight text-ink">{s.name || s.code}</div>
              <div className="text-xs text-ink-3">
                {s.code}
                {s.reviewStatus && <span className="ml-1.5 text-good">&middot; {s.reviewStatus}</span>}
              </div>
            </div>
            <span className={`shrink-0 rounded border px-2 py-0.5 text-sm font-semibold ${gradeChip(s.grade)}`}>
              {s.grade || '-'}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-ink-3">
        Provisional results are for immediate information only and may change. The final result is confirmed on the grade card.
      </p>
    </div>
  );
}

function ResultsView({ results, subjects, marks, onImportResults }) {
  const [mode, setMode] = useState('final');
  if (!results || results.error) return <EmptyNote>No results were found for your account.</EmptyNote>;
  return (
    <div>
      <div className="seg mb-4" role="group" aria-label="Result type">
        {['final', 'provisional'].map((m) => (
          <button key={m} type="button" aria-pressed={mode === m} onClick={() => setMode(m)} className="seg-item capitalize">
            {m} results
          </button>
        ))}
      </div>
      {mode === 'final'
        ? (
          <FinalResults
            final={results.final}
            provisional={results.provisional}
            subjects={subjects}
            marks={marks}
            onImportResults={onImportResults}
          />
        )
        : <ProvisionalResults provisional={results.provisional} />}
    </div>
  );
}

/* -------------------------------- Calendar -------------------------------- */
function CalSummaryChip({ value, label }) {
  return (
    <div className="inset min-w-[76px] px-3 py-2">
      <div className="num text-lg font-semibold leading-tight text-ink">{value}</div>
      <div className="text-xs text-ink-3">{label}</div>
    </div>
  );
}

export function CalendarView({ calendar }) {
  if (!calendar || calendar.error || !calendar.events || calendar.events.length === 0) {
    return <EmptyNote>No calendar of events was found for your account.</EmptyNote>;
  }

  const events = calendar.events;
  const meta = calendar.calendar;
  const grouped = groupEvents(events);

  // Summary counts (raw days for holidays/exams; grouped count for other events).
  const holidayDays = events.filter((e) => eventKind(e) === 'holiday').length;
  const examDays = events.filter((e) => eventKind(e) === 'exam').length;
  const otherEvents = grouped.filter((g) => g.kind === 'event').length;

  // Group the collapsed events by calendar month for section headers.
  const months = [];
  const seen = {};
  for (const g of grouped) {
    const key = monthKey(g.start);
    if (!seen[key]) {
      seen[key] = { key, title: monthTitle(g.start), rows: [] };
      months.push(seen[key]);
    }
    seen[key].rows.push(g);
  }

  return (
    <div>
      {meta?.name && (
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
          <CalendarRange className="h-4 w-4 text-ink-3" />
          {meta.name}
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        <CalSummaryChip value={holidayDays} label="Holidays" />
        <CalSummaryChip value={examDays} label="Exam days" />
        <CalSummaryChip value={otherEvents} label="Events" />
      </div>

      <div className="space-y-5">
        {months.map((mo) => (
          <div key={mo.key}>
            <h4 className="mb-2 text-sm font-semibold text-ink">{mo.title}</h4>
            <div className="space-y-1.5">
              {mo.rows.map((g, i) => {
                const style = KIND_STYLE[g.kind] || KIND_STYLE.event;
                const multiDay = g.end && g.end !== g.start;
                return (
                  <div key={i} className={`flex items-start gap-3 rounded-md border border-l-2 border-line ${style.bar} p-2.5`}>
                    <div className="w-[74px] shrink-0 pt-0.5">
                      <div className="text-sm font-medium leading-tight text-ink">{dayLabel(g.start)}</div>
                      <div className="text-xs text-ink-3">
                        {multiDay ? `to ${dayLabel(g.end)}` : weekdayAbbr(g.start)}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium leading-tight text-ink">{g.name}</div>
                      {g.type && <div className="text-xs text-ink-3">{g.type}</div>}
                    </div>
                    <span className={`shrink-0 rounded border px-1.5 py-0.5 text-xs font-medium ${style.badge}`}>
                      {style.label}{multiDay ? ` \u00b7 ${g.days}d` : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs leading-relaxed text-ink-3">
        Holidays and exam windows (ISA/ESA) have no regular classes. Saturdays are also off, while FAM, CCM and PTM are normal class days. First-year calendars can differ, and extra or cancelled classes aren&apos;t always shown here, so adjust totals manually on the Attendance page if needed.
      </p>
    </div>
  );
}

/* -------------------------------- Container ------------------------------- */
const TABS = [
  { key: 'results', label: 'Results', Icon: Award },
  { key: 'attendance', label: 'Attendance', Icon: ClipboardList },
  { key: 'timetable', label: 'Timetable', Icon: CalendarDays },
  { key: 'calendar', label: 'Calendar', Icon: CalendarRange },
];

export function PortalData({ status, data, error, onRetry, canRetry, onSendToPlanner, subjects, marks, onImportResults }) {
  const [view, setView] = useState('results');

  if (status === 'idle') return null;

  if (status === 'loading') {
    return (
      <div className="panel panel-pad">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-accent" />
          <div>
            <div className="text-sm font-medium text-ink">Loading your timetable, attendance and results…</div>
            <div className="text-xs text-ink-3">Signing in to the portal. This can take a few seconds.</div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="panel panel-pad">
        <div className="text-sm font-medium text-ink">Couldn&apos;t load your academic data</div>
        <p className="mb-3 mt-1 text-xs leading-relaxed text-ink-3">
          {error || 'Something went wrong fetching your timetable, attendance and results.'}
          {' '}Your profile and the preset detection above still work.
        </p>
        {canRetry ? (
          <button type="button" onClick={onRetry} className="btn btn-secondary btn-sm">
            <RefreshCw className="h-3.5 w-3.5" /> Try again
          </button>
        ) : (
          <p className="text-xs text-ink-3">Sign out and sign in again to retry.</p>
        )}
      </div>
    );
  }

  // success
  return (
    <div className="panel panel-pad">
      <div className="-mt-1 mb-5 flex gap-1 overflow-x-auto border-b border-line" role="tablist">
        {TABS.map((tab) => {
          const Icon = tab.Icon;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={view === tab.key}
              onClick={() => setView(tab.key)}
              className={`-mb-px inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${view === tab.key
                ? 'border-accent text-ink'
                : 'border-transparent text-ink-3 hover:text-ink'}`}
            >
              <Icon className="h-4 w-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {view === 'timetable' && <TimetableView tt={data?.timetable} />}
      {view === 'calendar' && <CalendarView calendar={data?.calendar} />}
      {view === 'attendance' && (
        <AttendanceView
          att={data?.attendance}
          timetable={data?.timetable}
          calendar={data?.calendar}
          onSendToPlanner={onSendToPlanner}
        />
      )}
      {view === 'results' && (
        <div id="results-section">
          <ResultsView
            results={data?.results}
            subjects={subjects}
            marks={marks}
            onImportResults={onImportResults}
          />
        </div>
      )}
    </div>
  );
}
