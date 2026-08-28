import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle2,
  AlertCircle, RefreshCw, Send, Plus, Trash2, Edit2, RotateCcw,
  Sparkles, Download, Layers, ShieldCheck, Check, AlertTriangle, BookOpen
} from 'lucide-react';
import {
  buildCurrentAttendanceStats, buildAttendancePlan, parseNonNegativeInt, parseTargetPercent
} from '../utils/attendanceCalculations';
import {
  buildAttendanceProjection, todayIsoLocal, isoWeekday, addDaysIso, excludedDateSet, findIsa2Start
} from '../utils/attendanceProjection';

/* ------------------------------- Date Helpers ------------------------------- */
function getMonthDays(year, month) {
  // month is 0-indexed (0 = Jan, 11 = Dec)
  const firstDay = new Date(Date.UTC(year, month, 1));
  const lastDay = new Date(Date.UTC(year, month + 1, 0));
  const days = [];

  // Pad starting day (0 = Sun, 1 = Mon, ..., 6 = Sat)
  const startDayOfWeek = firstDay.getUTCDay();
  // We want Monday = 0, ..., Sunday = 6 in grid if we start on Monday, or standard Sunday = 0
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(null);
  }

  for (let d = 1; d <= lastDay.getUTCDate(); d++) {
    const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({
      date: iso,
      dayNumber: d,
      weekday: (startDayOfWeek + d - 1) % 7,
    });
  }
  return days;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function statusColor(pct) {
  if (pct >= 85) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  if (pct >= 75) return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
  if (pct >= 65) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
  return 'text-red-400 bg-red-500/10 border-red-500/20';
}

export default function InteractiveAttendancePlanner({
  portalData,
  pesuProfile,
  calcSubjects,
  calcMarks,
  onSendToPlanner,
  setActiveTab,
  themeClasses,
  onImportResults
}) {
  const isLoggedIn = !!pesuProfile;

  // --- Bunked Dates State ---
  const [bunkedDates, setBunkedDates] = useState(() => {
    try {
      const saved = localStorage.getItem('pes_bunked_dates');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('pes_bunked_dates', JSON.stringify(bunkedDates));
  }, [bunkedDates]);

  const toggleBunkDate = (iso) => {
    setBunkedDates((prev) =>
      prev.includes(iso) ? prev.filter((d) => d !== iso) : [...prev, iso]
    );
  };

  const clearAllBunks = () => {
    if (window.confirm('Clear all selected bunk dates?')) {
      setBunkedDates([]);
    }
  };

  // --- Active Month Navigation ---
  const todayStr = todayIsoLocal();
  const [currentYear, setCurrentYear] = useState(() => parseInt(todayStr.split('-')[0], 10));
  const [currentMonth, setCurrentMonth] = useState(() => parseInt(todayStr.split('-')[1], 10) - 1);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // --- Target Buffer % State ---
  const [targetBuffer, setTargetBuffer] = useState(80);

  // --- Timetable & Calendar Projection ---
  const timetable = portalData?.timetable;
  const calendar = portalData?.calendar;

  // --- ISA2 Constraint (Teaching end cap) ---
  const isa2Start = useMemo(() => findIsa2Start(calendar?.events), [calendar?.events]);

  const projection = useMemo(
    () => buildAttendanceProjection({ timetable, calendar }),
    [timetable, calendar]
  );

  // Event lookup map by date
  const eventsByDate = useMemo(() => {
    const map = {};
    if (!calendar?.events) return map;
    for (const e of calendar.events) {
      if (!e || !e.start) continue;
      const startIso = e.start;
      const endIso = e.end && e.end >= startIso ? e.end : startIso;
      let cur = startIso;
      for (let guard = 0; cur <= endIso && guard < 400; guard++) {
        if (!map[cur]) map[cur] = [];
        map[cur].push(e);
        cur = addDaysIso(cur, 1);
      }
    }
    return map;
  }, [calendar]);

  // Timetable slots per day of week (1 = Mon ... 6 = Sat)
  const ttByDay = useMemo(() => {
    const map = {};
    if (!timetable?.entries) return map;
    for (const entry of timetable.entries) {
      if (!map[entry.day]) map[entry.day] = [];
      map[entry.day].push(entry);
    }
    return map;
  }, [timetable]);

  // --- Subjects Data state (Supports portal attendance OR calculator subjects OR custom) ---
  const [manualOverrides, setManualOverrides] = useState(() => {
    try {
      const saved = localStorage.getItem('pes_attendance_manual_overrides');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem('pes_attendance_manual_overrides', JSON.stringify(manualOverrides));
  }, [manualOverrides]);

  const updateSubjectOverride = (key, field, value) => {
    setManualOverrides((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || {}),
        [field]: value,
      },
    }));
  };

  const resetOverrides = () => {
    if (window.confirm('Reset all manual attendance overrides to defaults?')) {
      setManualOverrides({});
    }
  };

  // Build subject list for the table
  const subjectsList = useMemo(() => {
    // 1. Try PESU portal attendance subjects
    if (portalData?.attendance && Array.isArray(portalData.attendance) && portalData.attendance.length > 0) {
      const latestSem = portalData.attendance[0];
      if (latestSem?.subjects) {
        return latestSem.subjects.map((s) => {
          const key = s.code || s.name;
          const override = manualOverrides[key] || {};
          const attended = override.attended !== undefined ? parseNonNegativeInt(override.attended) : (s.attended ?? 0);
          const total = override.total !== undefined ? parseNonNegativeInt(override.total) : (s.total ?? 0);
          const projectedLeft = projection.byCode[s.code] ?? projection.byCode[s.name] ?? 0;
          const classesLeft = override.classesLeft !== undefined ? parseNonNegativeInt(override.classesLeft) : projectedLeft;

          return {
            key,
            code: s.code || '',
            name: s.name || key,
            attended: attended ?? 0,
            total: total ?? 0,
            classesLeft: classesLeft ?? 0,
            rawPercentage: s.percentage,
          };
        });
      }
    }

    // 2. Fallback to Calculator subjects
    if (calcSubjects && Array.isArray(calcSubjects) && calcSubjects.length > 0) {
      return calcSubjects.map((s) => {
        const key = s.name;
        const override = manualOverrides[key] || {};
        const attended = override.attended !== undefined ? parseNonNegativeInt(override.attended) : 0;
        const total = override.total !== undefined ? parseNonNegativeInt(override.total) : 0;
        const classesLeft = override.classesLeft !== undefined ? parseNonNegativeInt(override.classesLeft) : 20;

        return {
          key,
          code: '',
          name: s.name,
          attended: attended ?? 0,
          total: total ?? 0,
          classesLeft: classesLeft ?? 0,
          rawPercentage: total > 0 ? ((attended / total) * 100).toFixed(2) : 'NA',
        };
      });
    }

    return [];
  }, [portalData, calcSubjects, manualOverrides, projection]);

  // Calculate missed classes per subject from bunkedDates based on timetable
  const bunksPerSubject = useMemo(() => {
    const map = {};
    for (const iso of bunkedDates) {
      const dayOfWeek = isoWeekday(iso);
      if (dayOfWeek === 0 || dayOfWeek === 6) continue; // Weekends have no classes
      const entries = ttByDay[dayOfWeek] || [];
      for (const entry of entries) {
        const key = entry.code || entry.name;
        if (key) {
          map[key] = (map[key] || 0) + 1;
        }
      }
    }
    return map;
  }, [bunkedDates, ttByDay]);

  // Compute final analytics table data
  const tableRows = useMemo(() => {
    return subjectsList.map((sub) => {
      const key = sub.key;
      const attended = sub.attended;
      const total = sub.total;
      const classesLeft = sub.classesLeft;
      const selectedBunks = bunksPerSubject[key] || 0;

      // Effective classes attended and total if bunks are applied to remaining classes
      const actualRemaining = Math.max(0, classesLeft - selectedBunks);
      const projectedFinalAttended = attended + actualRemaining;
      const projectedFinalTotal = total + classesLeft;

      const currentPct = total > 0 ? (attended / total) * 100 : 0;
      const projectedPct = projectedFinalTotal > 0 ? (projectedFinalAttended / projectedFinalTotal) * 100 : 0;

      // Safe misses allowed for 75% target from currently remaining classes
      const plan75 = buildAttendancePlan(total, attended, classesLeft, 75);
      const planBuffer = buildAttendancePlan(total, attended, classesLeft, targetBuffer);

      return {
        ...sub,
        selectedBunks,
        actualRemaining,
        currentPct,
        projectedPct,
        safeMisses75: plan75?.safeMisses75 ?? 0,
        mustAttend75: plan75?.mustAttendFor75 ?? 0,
        safeMissesBuffer: planBuffer?.safeMissesBuffer ?? 0,
        mustAttendBuffer: planBuffer?.mustAttendForBuffer ?? 0,
      };
    });
  }, [subjectsList, bunksPerSubject, targetBuffer]);

  // Grid Days for calendar rendering
  const gridDays = useMemo(() => {
    return getMonthDays(currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  return (
    <div className="space-y-6">
      {/* ================= HEADER & OVERVIEW ================= */}
      <div className="bg-[#0e0e18] border border-white/[0.06] rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-blue-400" />
              All-Subject Attendance & Bunk Planner
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Select dates on the calendar to simulate bunking. See updated attendance, remaining safe misses, and 75% target impact for all subjects at once.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {isLoggedIn && (
              <button
                onClick={() => onImportResults && onImportResults({ mode: 'rebuild', fills: [], creates: [] })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/20 transition-all cursor-pointer"
                title="Import portal subjects to calculator"
              >
                <Download className="w-3.5 h-3.5" />
                Import All Subjects
              </button>
            )}

            {(bunkedDates.length > 0 || Object.keys(manualOverrides).length > 0) && (
              <button
                onClick={() => { clearAllBunks(); resetOverrides(); }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-zinc-200 border border-white/[0.06] transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            )}
          </div>
        </div>

        {/* Target buffer selector */}
        <div className="flex items-center gap-3 pt-2 border-t border-white/[0.06] text-xs">
          <span className="font-semibold text-zinc-300">Custom Target Buffer:</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="75"
              max="99"
              value={targetBuffer}
              onChange={(e) => setTargetBuffer(parseTargetPercent(e.target.value, 80))}
              className="w-16 p-1.5 font-bold rounded-lg bg-white/[0.04] border border-white/[0.08] text-center text-blue-400 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
            <span className="text-zinc-500 font-semibold">%</span>
          </div>
        </div>
      </div>

      {/* ================= ALL SUBJECTS TABULAR PLANNER ================= */}
      <div className="bg-[#0e0e18] border border-white/[0.06] rounded-xl p-4 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            Subject Attendance Overview
          </h4>
          <span className="text-[11px] text-zinc-500">
            {tableRows.length} subjects loaded
          </span>
        </div>

        {tableRows.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 text-xs">
            No subjects found. Connect PESU Academy or add subjects in the Subjects tab.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/[0.08] text-zinc-400 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Subject</th>
                  <th className="py-2.5 px-3 text-center">Current</th>
                  <th className="py-2.5 px-3 text-center">Classes Left</th>
                  <th className="py-2.5 px-3 text-center">Bunked</th>
                  <th className="py-2.5 px-3 text-center">Projected %</th>
                  <th className="py-2.5 px-3 text-center">75% Skips Left</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {tableRows.map((row) => {
                  const key = row.key;
                  return (
                    <tr key={key} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-semibold text-zinc-200">{row.name}</div>
                        {row.code && <div className="text-[10px] text-zinc-500">{row.code}</div>}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <div className="font-bold text-zinc-200">{row.attended}/{row.total}</div>
                        <div className="text-[10px] text-zinc-500">{row.currentPct.toFixed(1)}%</div>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <input
                          type="number"
                          min="0"
                          value={manualOverrides[key]?.classesLeft !== undefined ? manualOverrides[key].classesLeft : row.classesLeft}
                          onChange={(e) => updateSubjectOverride(key, 'classesLeft', e.target.value)}
                          className="w-16 p-1 text-center font-semibold rounded bg-white/[0.04] border border-white/[0.08] text-zinc-200 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                          title="Edit estimated classes left"
                        />
                      </td>

                      <td className="py-3 px-3 text-center font-bold text-purple-400">
                        {row.selectedBunks > 0 ? `-${row.selectedBunks}` : '0'}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded border font-bold ${statusColor(row.projectedPct)}`}>
                          {row.projectedPct.toFixed(1)}%
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        {row.safeMisses75 > 0 ? (
                          <span className="text-emerald-400 font-bold">+{row.safeMisses75} safe</span>
                        ) : (
                          <span className="text-red-400 font-bold">Must attend {row.mustAttend75}</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => onSendToPlanner && onSendToPlanner({
                            total: row.total,
                            attended: row.attended,
                            classesLeft: row.classesLeft,
                            name: row.name
                          })}
                          className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-all cursor-pointer"
                          title="Open detailed single-subject planner"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================= INTERACTIVE GRID CALENDAR ================= */}
      <div className="bg-[#0e0e18] border border-white/[0.06] rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h4 className="text-sm font-bold text-zinc-200 min-w-[140px] text-center">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </h4>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1 text-zinc-400">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-600 inline-block" /> Weekend
            </span>
            <span className="flex items-center gap-1 text-red-300/60">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/30 inline-block" /> Holiday
            </span>
            <span className="flex items-center gap-1 text-red-300/60">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/30 inline-block" /> After ISA2
            </span>
            <span className="flex items-center gap-1 text-amber-300">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> Exam
            </span>
            <span className="flex items-center gap-1 text-purple-300">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" /> Bunked
            </span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1.5 text-center">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 py-1">
              {d}
            </div>
          ))}

          {gridDays.map((cell, idx) => {
            if (!cell) {
              return <div key={`empty-${idx}`} className="h-14 rounded-lg bg-white/[0.01]" />;
            }

            const iso = cell.date;
            const dayEvents = eventsByDate[iso] || [];
            const isWeekend = cell.weekday === 0 || cell.weekday === 6;
            const isHoliday = dayEvents.some((e) => e.isHoliday);
            const isExam = dayEvents.some((e) => /\b(ISA|ESA)\b/i.test(e.name || ''));
            const isAfterISA2 = isa2Start && iso >= isa2Start;
            const isBunked = bunkedDates.includes(iso);

            let bgClass = 'bg-white/[0.03] border-white/[0.06] text-zinc-200 hover:bg-white/[0.06]';
            if (isWeekend) {
              bgClass = 'bg-white/[0.01] border-white/[0.03] text-zinc-600 opacity-50 cursor-not-allowed';
            } else if (isHoliday || isAfterISA2) {
              bgClass = 'bg-red-500/5 border-red-500/10 text-red-300 opacity-60 cursor-not-allowed';
            } else if (isExam) {
              bgClass = 'bg-amber-500/10 border-amber-500/20 text-amber-300 cursor-not-allowed';
            } else if (isBunked) {
              bgClass = 'bg-purple-500/20 border-purple-500/40 text-purple-200 font-bold ring-1 ring-purple-400';
            }

            const canBunk = !isWeekend && !isHoliday && !isExam && !isAfterISA2;

            return (
              <button
                key={iso}
                disabled={!canBunk}
                onClick={() => canBunk && toggleBunkDate(iso)}
                className={`h-14 p-1 rounded-lg border flex flex-col justify-between transition-all text-left ${bgClass} ${canBunk ? 'cursor-pointer' : ''}`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-semibold">{cell.dayNumber}</span>
                  {isBunked && <span className="text-[9px] bg-purple-500 text-white font-bold px-1 rounded">BUNK</span>}
                </div>

                <div className="text-[9px] truncate opacity-80 leading-tight">
                  {isHoliday ? (dayEvents.find(e=>e.isHoliday)?.name || 'Holiday') :
                   isExam ? (dayEvents.find(e=>/\b(ISA|ESA)\b/i.test(e.name||''))?.name || 'Exam') :
                   isAfterISA2 ? 'Teaching Ends' :
                   isWeekend ? 'Off' : ''}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
