import React, { useState, useMemo } from 'react';
import {
  CalendarDays, CalendarRange, ClipboardList, Award, Clock, RefreshCw,
  Loader2, AlertCircle, GraduationCap, CheckCircle2, Users, Send,
  Download, ChevronDown, ChevronRight, Check, AlertTriangle, PieChart
} from 'lucide-react';
import {
  buildCurrentAttendanceStats, buildAttendancePlan, parseNonNegativeInt,
} from '../utils/attendanceCalculations';
import { buildAttendanceProjection } from '../utils/attendanceProjection';
import { buildImportPlan, summarizeGrades } from '../utils/resultsImport';

// Shared dark-palette helpers (matching the rest of the PESU Academy tab).
const CARD = 'bg-[#0e0e18] border border-white/[0.06] rounded-xl shadow-sm';

function fmtTime(t) {
  if (!t) return '';
  const m = String(t).match(/(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)/i);
  if (!m) return t;
  return `${Number(m[1])}:${m[2]} ${m[3].toUpperCase()}`;
}

function gradeColor(g) {
  const grade = String(g || '').trim().toUpperCase();
  if (grade === 'S') return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25';
  if (grade === 'A') return 'bg-green-500/15 text-green-300 border-green-500/25';
  if (grade === 'B') return 'bg-blue-500/15 text-blue-300 border-blue-500/25';
  if (grade === 'C') return 'bg-amber-500/15 text-amber-300 border-amber-500/25';
  if (grade === 'D') return 'bg-orange-500/15 text-orange-300 border-orange-500/25';
  if (grade === 'F' || grade === 'W') return 'bg-red-500/15 text-red-300 border-red-500/25';
  return 'bg-white/[0.06] text-zinc-300 border-white/[0.1]';
}

// Solid fill used for the grade-distribution bar segments.
function gradeBar(g) {
  const grade = String(g || '').trim().toUpperCase();
  if (grade === 'S') return 'bg-emerald-400';
  if (grade === 'A') return 'bg-green-400';
  if (grade === 'B') return 'bg-blue-400';
  if (grade === 'C') return 'bg-amber-400';
  if (grade === 'D') return 'bg-orange-400';
  if (grade === 'F' || grade === 'W') return 'bg-red-400';
  return 'bg-zinc-500';
}

function pctColor(p) {
  const n = Number(p);
  if (Number.isNaN(n)) return 'text-zinc-400';
  if (n >= 85) return 'text-emerald-400';
  if (n >= 75) return 'text-blue-400';
  if (n >= 65) return 'text-amber-400';
  return 'text-red-400';
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
  holiday: { label: 'Holiday', bar: 'border-l-red-500/60', dot: 'bg-red-400', badge: 'bg-red-500/10 text-red-300 border-red-500/20' },
  exam: { label: 'Exam', bar: 'border-l-amber-500/60', dot: 'bg-amber-400', badge: 'bg-amber-500/10 text-amber-300 border-amber-500/20' },
  event: { label: 'Event', bar: 'border-l-blue-500/60', dot: 'bg-blue-400', badge: 'bg-blue-500/10 text-blue-300 border-blue-500/20' },
};

// Collapse consecutive same-named events (e.g. the six "ISA 1" day-rows) into
// one entry spanning first→last, so the list reads as logical events not days.
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
    <div className="flex flex-wrap gap-1.5 mb-4">
      {items.map((it, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
            i === selected
              ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
              : 'bg-white/[0.03] text-zinc-400 border-white/[0.06] hover:bg-white/[0.06]'
          }`}
        >
          {labelOf(it)}
        </button>
      ))}
    </div>
  );
}

function EmptyNote({ children }) {
  return <p className="text-sm text-zinc-500 py-6 text-center">{children}</p>;
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
    <div className="space-y-4">
      {days.map((day) => (
        <div key={day.name}>
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">{day.name}</h4>
          <div className="space-y-1.5">
            {day.rows.map((r, i) => {
              const st = slotTime[r.slot];
              return (
                <div key={i} className="flex items-start gap-3 bg-white/[0.02] border border-white/[0.05] rounded-lg p-2.5">
                  <div className="flex items-center gap-1 text-[11px] font-medium text-zinc-500 w-[92px] flex-shrink-0 pt-0.5">
                    <Clock className="w-3 h-3" />
                    {st ? `${fmtTime(st.start)}` : `Slot ${r.slot}`}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-zinc-200">{r.name || r.code}</div>
                    <div className="text-[11px] text-zinc-500">
                      {r.code}
                      {r.faculty && r.faculty.length > 0 && (
                        <span className="inline-flex items-center gap-1 ml-2">
                          <Users className="w-3 h-3" /> {r.faculty.join(', ')}
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
// One subject → its current attendance, an editable "classes left" estimate
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
    <div className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-3">
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-zinc-200 leading-tight">{s.name || s.code}</div>
          <div className="text-[11px] text-zinc-500">{s.code}</div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className={`text-base font-bold leading-none ${pctColor(s.percentage)}`}>
            {s.percentage === 'NA' ? '—' : `${s.percentage}%`}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">{s.attendedTotal} classes</div>
        </div>
      </div>

      {hasNumbers ? (
        <>
          <div className="flex flex-wrap items-end gap-2">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold block mb-1">
                Classes left {defaultLeft != null && <span className="normal-case tracking-normal text-zinc-600">(est. {defaultLeft})</span>}
              </label>
              <input
                type="number"
                min="0"
                value={leftInput}
                onChange={(e) => setLeftInput(e.target.value)}
                placeholder="est."
                className="w-24 p-1.5 text-sm font-semibold rounded-lg bg-white/[0.04] border border-white/[0.08] text-zinc-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <button
              onClick={() => onSendToPlanner && onSendToPlanner({
                total: stats.total, attended: stats.attended,
                classesLeft: remaining, name: s.name || s.code,
              })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" /> Send to planner
            </button>
          </div>

          {plan && remaining > 0 && (
            <div className="grid grid-cols-3 gap-1.5 mt-2.5">
              <MiniStat label="Can miss (75%)" value={plan.safeMisses75} />
              <MiniStat label="Must attend (75%)" value={plan.mustAttendFor75} />
              <MiniStat
                label="Final % range"
                value={`${plan.worstFinalPercentage.toFixed(0)}–${plan.bestFinalPercentage.toFixed(0)}%`}
              />
            </div>
          )}
        </>
      ) : (
        <p className="text-[11px] text-zinc-500">Attendance not recorded yet for this subject.</p>
      )}
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.05] rounded-md px-2 py-1.5 text-center">
      <div className="text-sm font-bold text-zinc-200 leading-none">{value}</div>
      <div className="text-[9px] uppercase tracking-wide text-zinc-500 font-semibold mt-1 leading-tight">{label}</div>
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
        <div className="flex items-start gap-2 bg-blue-500/[0.06] border border-blue-500/15 rounded-lg p-2.5 mb-3">
          <CalendarRange className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-blue-200/80 leading-relaxed">
            About <strong>{projection.teachingDayCount}</strong> teaching days left
            {projection.isa2Start ? ' before ISA 2' : ' this semester'}
            {' '}(Sat/Sun, holidays and exam windows removed). Per-subject estimates below are
            pre-filled from your timetable — tweak any number, then send it to the planner.
          </p>
        </div>
      ) : (
        <div className="flex items-start gap-2 bg-white/[0.03] border border-white/[0.06] rounded-lg p-2.5 mb-3">
          <AlertCircle className="w-4 h-4 text-zinc-500 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            Couldn&apos;t auto-estimate remaining classes (timetable or calendar unavailable). Enter a
            &quot;classes left&quot; number for any subject and send it to the planner.
          </p>
        </div>
      )}

      <div className="space-y-2">
        {cur.subjects.map((s, i) => (
          <AttendanceSubjectCard
            key={s.code || i}
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
// semester's subjects. Grade comes from `.grade` (provisional) or `.esaGrade`
// (final); summarizeGrades skips blanks and orders S→A→B→…
function GradeDistribution({ subjects }) {
  const { counts, total } = summarizeGrades(subjects || []);
  if (!total) return null;
  return (
    <div className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-3 mb-4">
      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
        <PieChart className="w-3.5 h-3.5" /> Grade distribution
        <span className="ml-auto font-medium normal-case tracking-normal text-zinc-500">{total} graded</span>
      </div>
      <div className="flex h-2 rounded-full overflow-hidden mb-2.5 bg-white/[0.04]">
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
          <span key={grade} className={`text-[11px] font-bold px-1.5 py-0.5 rounded border ${gradeColor(grade)}`}>
            {grade} <span className="opacity-70 font-medium">×{count}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function ConfidenceBadge({ confidence }) {
  const map = {
    high: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    medium: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
    low: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  };
  return (
    <span className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border ${map[confidence] || map.low}`}>
      {confidence} match
    </span>
  );
}

// One matched portal→calculator row in the import preview: a checkbox, the
// name mapping, the exact fields (with /max) that will be set, and any caveats
// (overwrite, heuristic lab sum, or lab parts that can't be imported).
function MatchRow({ m, checked, onToggle }) {
  const fieldKeys = ['isa1', 'isa2', 'assignment', 'lab'].filter((k) => m.fields[k] != null);
  const labNotImported = m.labParts.length > 0 && m.fields.lab == null;
  return (
    <div className={`rounded-lg border p-2.5 transition-colors ${checked ? 'bg-white/[0.03] border-white/[0.08]' : 'border-white/[0.05] opacity-60'}`}>
      <label className="flex items-start gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          className="mt-0.5 w-4 h-4 flex-shrink-0 accent-blue-500 cursor-pointer"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-semibold text-zinc-200 leading-tight">{m.portalName}</span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />
            <span className="text-sm text-zinc-300 leading-tight">{m.calcName}</span>
            <ConfidenceBadge confidence={m.confidence} />
          </div>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {fieldKeys.map((k) => {
              const willOverwrite = m.overwrites.includes(k);
              return (
                <span
                  key={k}
                  className={`text-[11px] rounded px-1.5 py-0.5 border ${
                    willOverwrite
                      ? 'bg-amber-500/10 text-amber-200 border-amber-500/25'
                      : 'bg-white/[0.03] text-zinc-300 border-white/[0.06]'
                  }`}
                >
                  {FIELD_LABEL[k]}: <span className="font-semibold text-zinc-100">
                    {m.fields[k]}{m.fields[k + 'Max'] ? `/${m.fields[k + 'Max']}` : ''}
                  </span>
                  {willOverwrite && <span className="ml-1 opacity-80">(replaces)</span>}
                </span>
              );
            })}
          </div>
          {m.esaGrade && (
            <div className="text-[10px] text-zinc-500 mt-1">
              ESA grade <span className="font-semibold text-zinc-400">{m.esaGrade}</span> — kept as a letter, not imported.
            </div>
          )}
          {m.review && (
            <div className="text-[10px] text-amber-300/80 mt-1 inline-flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 flex-shrink-0" /> Lab is a sum of {m.labParts.join(' + ')} — double-check.
            </div>
          )}
          {labNotImported && (
            <div className="text-[10px] text-zinc-500 mt-1">
              {m.labParts.join(', ')} found on the portal, but this subject has no lab slot — turn on a lab
              component for it in the Subjects tab to include {m.labParts.length > 1 ? 'them' : 'it'}.
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
  const toneCls = tone === 'amber' ? 'text-amber-300/80' : 'text-zinc-500';
  if (!items.length) return null;
  return (
    <div>
      <button
        onClick={() => setShow((s) => !s)}
        className={`inline-flex items-center gap-1 text-[11px] font-semibold ${toneCls} hover:opacity-80 cursor-pointer`}
      >
        {show ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        {title} ({items.length})
      </button>
      {show && (
        <ul className="mt-1 ml-4 space-y-0.5">
          {items.map((it, i) => <li key={i} className="text-[11px] text-zinc-500">• {it}</li>)}
        </ul>
      )}
    </div>
  );
}

// Preview + confirm panel mapping this semester's results onto the calculator's
// Subjects tab. Numbers are read from the final results and merged with the
// matching provisional semester, so if the portal ever surfaces ISA numbers in
// provisional instead of final, they're still picked up. Nothing is written
// until the student ticks subjects and confirms; the import is undoable.
function ResultsImportPanel({ finalSem, provisionalSem, subjects, marks, onImportResults }) {
  const [open, setOpen] = useState(false);
  const [deselected, setDeselected] = useState(() => new Set());
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

  const isChecked = (id) => !deselected.has(id);
  const toggle = (id) => setDeselected((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const chosen = plan.matched.filter((m) => isChecked(m.calcId));
  const overwriteCount = chosen.filter((m) => m.overwrites.length > 0).length;

  const doImport = () => {
    if (!chosen.length) return;
    const n = onImportResults(chosen);
    setDone(typeof n === 'number' ? n : chosen.length);
    setOpen(false);
  };

  return (
    <div className="mb-4">
      <button
        onClick={() => { setOpen((o) => !o); setDone(0); }}
        className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-bold rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/25 transition-all cursor-pointer"
      >
        <Download className="w-4 h-4" />
        Import marks to calculator
        {plan.matched.length > 0 && (
          <span className="text-[11px] font-bold bg-blue-500/25 text-blue-200 rounded-full px-1.5 py-0.5 leading-none">
            {plan.matched.length}
          </span>
        )}
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {done > 0 && !open && (
        <p className="text-[11px] text-emerald-300/90 inline-flex items-center gap-1 mt-2">
          <CheckCircle2 className="w-3.5 h-3.5" /> Imported {done} subject{done === 1 ? '' : 's'} — check the Subjects tab.
        </p>
      )}

      {open && (
        <div className="mt-2 bg-white/[0.02] border border-white/[0.06] rounded-lg p-3 space-y-3">
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            Subjects are matched by name (your calculator subjects have no course code). ISA and assignment
            numbers come from your results; ESA stays a letter grade and isn&apos;t imported. Review below,
            then import — you can undo it from the Subjects tab.
          </p>

          {plan.matched.length === 0 ? (
            <p className="text-sm text-zinc-400">
              None of this semester&apos;s subjects could be matched to your current calculator subjects by name.
              Load the matching semester template in the Subjects tab first, then try again.
            </p>
          ) : (
            <div className="space-y-2">
              {plan.matched.map((m) => (
                <MatchRow key={m.calcId} m={m} checked={isChecked(m.calcId)} onToggle={() => toggle(m.calcId)} />
              ))}
            </div>
          )}

          <div className="space-y-1.5">
            <UnmatchedNote title="On the portal, no calculator match" items={plan.unmatchedPortal.map((u) => u.name)} tone="amber" />
            <UnmatchedNote title="In your calculator, no portal match this semester" items={plan.unmatchedCalc.map((u) => u.name)} tone="zinc" />
          </div>

          {plan.matched.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={doImport}
                disabled={chosen.length === 0}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4" />
                {overwriteCount > 0
                  ? `Overwrite & import ${chosen.length} subject${chosen.length === 1 ? '' : 's'}`
                  : `Import ${chosen.length} subject${chosen.length === 1 ? '' : 's'}`}
              </button>
              {overwriteCount > 0 && (
                <span className="inline-flex items-center gap-1 text-[11px] text-amber-300/90">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  {overwriteCount} will replace marks you already entered
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FinalResults({ final, provisional, subjects, marks, onImportResults }) {
  const [sel, setSel] = useState(0);
  if (!final || final.length === 0) return <EmptyNote>No final results available yet.</EmptyNote>;
  const cur = final[sel] || final[0];
  // The provisional semester with the same number, so any numbers the portal
  // might expose there (today it doesn't) are merged into the import as well.
  const provSem = (provisional || []).find((p) => String(p.semester) === String(cur.semester)) || null;
  return (
    <div>
      <SemesterPills items={final} selected={sel} onSelect={setSel} labelOf={(s) => s.semesterLabel || `Sem ${s.semester}`} />
      <div className="flex flex-wrap gap-2 mb-4">
        {cur.sgpa && <Stat label="SGPA" value={cur.sgpa} accent="emerald" />}
        {cur.cgpa && <Stat label="CGPA" value={cur.cgpa} accent="blue" />}
        {cur.earnedCredits && <Stat label="Credits" value={cur.earnedCredits} accent="zinc" />}
      </div>
      {cur.esaDescription && <p className="text-[11px] text-zinc-500 mb-3">{cur.esaDescription}</p>}
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
          <div key={i} className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-3">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-zinc-200 leading-tight">{s.name || s.code}</div>
                <div className="text-[11px] text-zinc-500">
                  {s.code}{s.credits ? ` · ${s.credits.earned}/${s.credits.total} credits` : ''}
                </div>
              </div>
              {s.esaGrade && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded border flex-shrink-0 ${gradeColor(s.esaGrade)}`}>
                  {s.esaGrade}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {s.components.filter((c) => c.label !== 'ESA').map((c, j) => (
                <span key={j} className="text-[11px] text-zinc-400 bg-white/[0.03] border border-white/[0.05] rounded px-1.5 py-0.5">
                  {c.label}: <span className="text-zinc-200 font-medium">{c.grade ?? c.score}{c.max ? `/${c.max}` : ''}</span>
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
      <div className="flex flex-wrap gap-2 mb-3">
        {cur.sgpa && <Stat label="SGPA" value={cur.sgpa} accent="emerald" />}
        {cur.earned && <Stat label="Earned" value={cur.earned} accent="blue" />}
        {cur.taken && <Stat label="Taken" value={cur.taken} accent="zinc" />}
      </div>
      {cur.assessment && <p className="text-[11px] text-zinc-500 mb-3">{cur.assessment}</p>}
      <GradeDistribution subjects={cur.subjects} />
      <div className="space-y-1.5">
        {cur.subjects.map((s, i) => (
          <div key={i} className="flex items-center justify-between gap-2 bg-white/[0.02] border border-white/[0.05] rounded-lg p-2.5">
            <div className="min-w-0">
              <div className="text-sm font-medium text-zinc-200 leading-tight">{s.name || s.code}</div>
              <div className="text-[11px] text-zinc-500">
                {s.code}
                {s.reviewStatus && <span className="ml-1.5 text-emerald-400/80">· {s.reviewStatus}</span>}
              </div>
            </div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded border flex-shrink-0 ${gradeColor(s.grade)}`}>
              {s.grade || '—'}
            </span>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-zinc-600 mt-3 leading-relaxed">
        Provisional results are for immediate information only and may change; the final result is confirmed on the grade card.
      </p>
    </div>
  );
}

function Stat({ label, value, accent }) {
  const accents = {
    emerald: 'text-emerald-400',
    blue: 'text-blue-400',
    zinc: 'text-zinc-300',
  };
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">{label}</div>
      <div className={`text-lg font-bold leading-tight ${accents[accent] || 'text-zinc-200'}`}>{value}</div>
    </div>
  );
}

function ResultsView({ results, subjects, marks, onImportResults }) {
  const [mode, setMode] = useState('final');
  if (!results || results.error) return <EmptyNote>No results were found for your account.</EmptyNote>;
  return (
    <div>
      <div className="inline-flex rounded-lg border border-white/[0.08] p-0.5 mb-4 bg-white/[0.02]">
        {['final', 'provisional'].map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-3 py-1.5 text-xs font-bold rounded-md capitalize transition-all cursor-pointer ${
              mode === m ? 'bg-blue-600 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
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
function CalSummaryChip({ value, label, accent }) {
  const accents = {
    red: 'text-red-400',
    amber: 'text-amber-400',
    blue: 'text-blue-400',
    zinc: 'text-zinc-300',
  };
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 min-w-[76px]">
      <div className={`text-lg font-bold leading-tight ${accents[accent] || 'text-zinc-200'}`}>{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">{label}</div>
    </div>
  );
}

function CalendarView({ calendar }) {
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
        <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-zinc-200">
          <CalendarRange className="w-4 h-4 text-blue-400" />
          {meta.name}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        <CalSummaryChip value={holidayDays} label="Holidays" accent="red" />
        <CalSummaryChip value={examDays} label="Exam days" accent="amber" />
        <CalSummaryChip value={otherEvents} label="Events" accent="blue" />
      </div>

      <div className="space-y-5">
        {months.map((mo) => (
          <div key={mo.key}>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">{mo.title}</h4>
            <div className="space-y-1.5">
              {mo.rows.map((g, i) => {
                const style = KIND_STYLE[g.kind] || KIND_STYLE.event;
                const multiDay = g.end && g.end !== g.start;
                return (
                  <div
                    key={i}
                    className={`flex items-start gap-3 bg-white/[0.02] border border-white/[0.05] border-l-2 ${style.bar} rounded-lg p-2.5`}
                  >
                    <div className="w-[74px] flex-shrink-0 pt-0.5">
                      <div className="text-sm font-semibold text-zinc-200 leading-tight">{dayLabel(g.start)}</div>
                      <div className="text-[10px] text-zinc-500">
                        {multiDay ? `– ${dayLabel(g.end)}` : weekdayAbbr(g.start)}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-zinc-200 leading-tight">{g.name}</div>
                      {g.type && <div className="text-[11px] text-zinc-500">{g.type}</div>}
                    </div>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border flex-shrink-0 ${style.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                      {style.label}
                      {multiDay ? ` · ${g.days}d` : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-zinc-600 mt-4 leading-relaxed">
        Holidays and exam windows (ISA/ESA) have no regular classes; Saturdays are also off, while FAM,
        CCM and PTM are normal class days. First-year calendars can differ, and extra or cancelled classes
        aren&apos;t always shown here — adjust totals manually in the Attendance tab if needed.
      </p>
    </div>
  );
}

/* -------------------------------- Container ------------------------------- */
const TABS = [
  { key: 'timetable', label: 'Timetable', Icon: CalendarDays },
  { key: 'calendar', label: 'Calendar', Icon: CalendarRange },
  { key: 'attendance', label: 'Attendance', Icon: ClipboardList },
  { key: 'results', label: 'Results', Icon: Award },
];

export function PortalData({ status, data, error, onRetry, canRetry, onSendToPlanner, subjects, marks, onImportResults }) {
  const [view, setView] = useState('timetable');

  if (status === 'idle') return null;

  if (status === 'loading') {
    return (
      <div className={`${CARD} p-6`}>
        <div className="flex items-center gap-3 text-zinc-300">
          <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
          <div>
            <div className="text-sm font-semibold">Loading your timetable, attendance &amp; results…</div>
            <div className="text-[11px] text-zinc-500">Signing in to the portal — this can take a few seconds.</div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className={`${CARD} p-5`}>
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="text-sm font-semibold text-zinc-200 mb-1">Couldn&apos;t load academic data</div>
            <p className="text-xs text-zinc-500 leading-relaxed mb-3">
              {error || 'Something went wrong fetching your timetable, attendance and results.'}
              {' '}Your profile and prefill above still work.
            </p>
            {canRetry ? (
              <button
                onClick={onRetry}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Try again
              </button>
            ) : (
              <p className="text-[11px] text-zinc-600">Sign out and sign in again to retry.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // success
  return (
    <div className={`${CARD} p-5`}>
      <div className="flex items-center gap-2 font-bold text-zinc-200 mb-4">
        <span className="bg-blue-500/10 text-blue-400 w-8 h-8 rounded-full flex items-center justify-center">
          <GraduationCap className="w-4 h-4" />
        </span>
        <span>Your academics</span>
        <CheckCircle2 className="w-4 h-4 text-emerald-400/70" />
      </div>

      <div className="flex gap-1 mb-5 border-b border-white/[0.06] overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.Icon;
          return (
            <button
              key={tab.key}
              onClick={() => setView(tab.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold border-b-2 -mb-px whitespace-nowrap flex-shrink-0 transition-all cursor-pointer ${
                view === tab.key
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
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
        <ResultsView
          results={data?.results}
          subjects={subjects}
          marks={marks}
          onImportResults={onImportResults}
        />
      )}
    </div>
  );
}
