import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown,
  RefreshCw, Send, Edit2, RotateCcw, LogIn, Eye, EyeOff,
} from 'lucide-react';
import {
  buildAttendancePlan, parseNonNegativeInt,
} from '../utils/attendanceCalculations';
import {
  buildAttendanceProjection, todayIsoLocal, addDaysIso, findIsa2Start,
} from '../utils/attendanceProjection';

/* ------------------------------- Date Helpers ------------------------------- */
function getMonthDays(year, month) {
  // month is 0-indexed (0 = Jan, 11 = Dec)
  const firstDay = new Date(Date.UTC(year, month, 1));
  const lastDay = new Date(Date.UTC(year, month + 1, 0));
  const days = [];

  // Pad starting day (0 = Sun, 1 = Mon, ..., 6 = Sat)
  const startDayOfWeek = firstDay.getUTCDay();
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
  'July', 'August', 'September', 'October', 'November', 'December',
];

// Attendance bands: one scale, green when safe, red when not.
function statusTone(pct) {
  if (pct >= 85) return 'text-good border-good/30 bg-good/10';
  if (pct >= 75) return 'text-ink border-line-strong bg-raised';
  if (pct >= 65) return 'text-warn border-warn/30 bg-warn/10';
  return 'text-bad border-bad/30 bg-bad/10';
}

function SkipCell({ safe, must }) {
  return safe > 0
    ? <span className="num font-medium text-good">can miss {safe}</span>
    : <span className="num font-medium text-bad">attend {must}</span>;
}

export default function InteractiveAttendancePlanner({
  portalData,
  portalDataIdentity = portalData,
  pesuProfile,
  username = '',
  calcSubjects,
  setPortalData,
  setActiveTab,
  bufferPercent,
  setBufferPercent,
  onSendToPlanner,
}) {
  const isLoggedIn = !!pesuProfile;

  // --- Resync Modal State ---
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncPassword, setSyncPassword] = useState('');
  const [showSyncPassword, setShowSyncPassword] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState('');
  const [showEndDateEditor, setShowEndDateEditor] = useState(false);
  const [customEndDate, setCustomEndDate] = useState(
    () => localStorage.getItem('pes_attendance_custom_end_date') || ''
  );

  // --- Active Month Navigation ---
  const todayStr = useMemo(() => todayIsoLocal(), []);
  const [currentYear, setCurrentYear] = useState(() => parseInt(todayStr.split('-')[0], 10));
  const [currentMonth, setCurrentMonth] = useState(() => parseInt(todayStr.split('-')[1], 10) - 1);
  const [excludeTodayClasses, setExcludeTodayClasses] = useState(() => {
    const shouldExclude = sessionStorage.getItem('pes_attendance_exclude_today_once') === 'true';
    sessionStorage.removeItem('pes_attendance_exclude_today_once');
    return shouldExclude;
  });

  const [manualOverrides, setManualOverrides] = useState(() => {
    try {
      const saved = localStorage.getItem('pes_attendance_manual_overrides');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const previousPortalDataRef = useRef(portalDataIdentity);
  useEffect(() => {
    if (previousPortalDataRef.current === portalDataIdentity) return;
    previousPortalDataRef.current = portalDataIdentity;
    setExcludeTodayClasses(true);

    setManualOverrides((prev) => {
      const refreshedOverrides = Object.fromEntries(
        Object.entries(prev)
          .map(([key, override]) => {
            const { classesLeft: _classesLeft, ...manualValues } = override || {};
            return [key, manualValues];
          })
          .filter(([, override]) => Object.keys(override).length > 0)
      );
      return refreshedOverrides;
    });
  }, [portalDataIdentity]);

  useEffect(() => {
    localStorage.setItem('pes_attendance_manual_overrides', JSON.stringify(manualOverrides));
  }, [manualOverrides]);

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

  const handleSyncSubmit = async (e) => {
    e.preventDefault();
    if (!syncPassword || isSyncing) return;
    setIsSyncing(true);
    setSyncError('');

    try {
      const pass = syncPassword;
      const user = username || localStorage.getItem('pesu_username') || '';
      if (!user) {
        setSyncError('Your SRN/PRN is unavailable. Sign in again from the PESU Academy tab.');
        return;
      }
      const res = await fetch('/api/pesu-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, password: pass }),
      });
      let data = {};
      try { data = await res.json(); } catch { data = {}; }
      if (res.ok && data.ok) {
        setPortalData?.(data);
        localStorage.setItem('pesu_saved_at', String(Date.now()));
        localStorage.setItem('pesu_portal_data', JSON.stringify(data));
        localStorage.setItem('pesu_last_synced', new Date().toISOString());
        try {
          const savedOverrides = JSON.parse(localStorage.getItem('pes_attendance_manual_overrides') || '{}');
          const refreshedOverrides = Object.fromEntries(
            Object.entries(savedOverrides)
              .map(([key, override]) => {
                const { classesLeft: _classesLeft, ...manualValues } = override || {};
                return [key, manualValues];
              })
              .filter(([, override]) => Object.keys(override).length > 0)
          );
          localStorage.setItem('pes_attendance_manual_overrides', JSON.stringify(refreshedOverrides));
        } catch {
          localStorage.removeItem('pes_attendance_manual_overrides');
        }
        setShowSyncModal(false);
        setSyncPassword('');
        sessionStorage.setItem('pes_attendance_exclude_today_once', 'true');
        window.location.reload();
      } else {
        setSyncError(data.error || 'Sync failed. Please check your password and try again.');
      }
    } catch {
      setSyncError('Network error. Could not reach the portal service.');
    } finally {
      setIsSyncing(false);
    }
  };

  const targetBuffer = bufferPercent;
  const setTargetBuffer = setBufferPercent;

  // --- Timetable & Calendar Projection ---
  const timetable = portalData?.timetable;
  const calendar = portalData?.calendar;

  useEffect(() => {
    localStorage.setItem('pes_attendance_custom_end_date', customEndDate);
  }, [customEndDate]);

  // --- ISA2 Constraint (Teaching end cap) ---
  const isa2Start = useMemo(() => findIsa2Start(calendar?.events), [calendar?.events]);

  const projection = useMemo(
    () => buildAttendanceProjection({
      timetable,
      calendar,
      endDate: customEndDate || undefined,
      excludeTodayClasses,
    }),
    [timetable, calendar, customEndDate, excludeTodayClasses]
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

  // --- Subjects Data state (Supports portal attendance OR calculator subjects OR custom) ---
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

  // Compute final analytics table data
  const tableRows = useMemo(() => {
    return subjectsList.map((sub) => {
      const attended = sub.attended;
      const total = sub.total;
      const classesLeft = sub.classesLeft;
      const projectedFinalAttended = attended + classesLeft;
      const projectedFinalTotal = total + classesLeft;

      const currentPct = total > 0 ? (attended / total) * 100 : 0;
      const projectedPct = projectedFinalTotal > 0 ? (projectedFinalAttended / projectedFinalTotal) * 100 : 0;

      // Safe misses allowed for 75% target from currently remaining classes
      const plan75 = buildAttendancePlan(total, attended, classesLeft, 75);
      const planBuffer = buildAttendancePlan(total, attended, classesLeft, targetBuffer);

      return {
        ...sub,
        currentPct,
        projectedPct,
        skipAllFinalPct: projectedFinalTotal > 0
          ? (attended / projectedFinalTotal) * 100
          : 0,
        safeMisses75: plan75?.safeMisses75 ?? 0,
        mustAttend75: plan75?.mustAttendFor75 ?? 0,
        safeMissesBuffer: planBuffer?.safeMissesBuffer ?? 0,
        mustAttendBuffer: planBuffer?.mustAttendForBuffer ?? 0,
      };
    });
  }, [subjectsList, targetBuffer]);

  // Grid Days for calendar rendering
  const gridDays = useMemo(() => {
    return getMonthDays(currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  const classesLeftFor = (row) => (manualOverrides[row.key]?.classesLeft !== undefined
    ? manualOverrides[row.key].classesLeft
    : row.classesLeft);

  const sendRow = (row) => onSendToPlanner && onSendToPlanner({
    total: row.total,
    attended: row.attended,
    classesLeft: parseNonNegativeInt(classesLeftFor(row)),
    name: row.name,
  });

  // --- Login prompt ---
  if (!isLoggedIn) {
    return (
      <section className="panel panel-pad text-center sm:text-left">
        <h2 className="text-base font-semibold text-ink">Get your attendance automatically</h2>
        <p className="mt-1 max-w-xl text-sm text-ink-2">
          Sign in with PESU Academy to see attendance for every subject, a semester calendar and projections from your own timetable. You can still use the calculators below without signing in.
        </p>
        <button type="button" onClick={() => setActiveTab('pesu')} className="btn btn-primary mt-4">
          <LogIn className="h-4 w-4" />
          Sign in to PESU Academy
        </button>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      {/* Overview */}
      <section className="panel panel-pad space-y-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div>
            <h2 className="text-base font-semibold text-ink">All subjects at a glance</h2>
            <p className="mt-0.5 text-sm text-ink-2">
              What your attendance ends up as if you attend every remaining class, and if you skip them all.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSyncModal(true)}
              className="btn btn-secondary btn-sm"
              title="Refresh data from PESU Academy"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              Refresh from PESU
            </button>

            {Object.keys(manualOverrides).length > 0 && (
              <button type="button" onClick={resetOverrides} className="btn btn-ghost btn-sm">
                <RotateCcw className="h-3.5 w-3.5" /> Undo my edits
              </button>
            )}
          </div>
        </div>

        <label className="inline-flex items-center gap-3 text-sm text-ink-2">
          Aim for attendance of
          <span className="flex items-center gap-1">
            <input
              type="number"
              min="0"
              max="100"
              inputMode="decimal"
              value={targetBuffer}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (Number.isFinite(val)) {
                  setTargetBuffer(Math.min(100, Math.max(0, val)));
                } else {
                  setTargetBuffer(''); // Allow temporary empty state for typing
                }
              }}
              className="input num w-20 text-center font-semibold"
            />
            <span className="text-ink-3">%</span>
          </span>
        </label>
      </section>

      {/* Resync modal */}
      {showSyncModal && (
        <div
          className="fixed inset-0 z-[999] flex items-end justify-center bg-black/60 sm:items-center sm:p-4"
          onClick={() => setShowSyncModal(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Refresh from PESU Academy"
            className="relative w-full max-w-sm rounded-t-xl border border-line bg-surface p-5 sm:rounded-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-ink">Refresh from PESU Academy</h3>
            <p className="mt-1 text-sm text-ink-2">Enter your password to reload your timetable, calendar and attendance.</p>
            <form onSubmit={handleSyncSubmit} className="mt-4 space-y-4">
              <div className="relative">
                <input
                  type={showSyncPassword ? 'text' : 'password'}
                  placeholder="PESU Academy password"
                  aria-label="PESU Academy password"
                  value={syncPassword}
                  onChange={(e) => setSyncPassword(e.target.value)}
                  className="input pr-10"
                  required
                  disabled={isSyncing}
                />
                <button
                  type="button"
                  onClick={() => setShowSyncPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink"
                  aria-label={showSyncPassword ? 'Hide password' : 'Show password'}
                >
                  {showSyncPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {syncError && <p className="text-sm text-bad">{syncError}</p>}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setShowSyncModal(false); setSyncPassword(''); setSyncError(''); }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" disabled={isSyncing} className="btn btn-primary">
                  {isSyncing ? (
                    <span className="flex items-center gap-1.5">
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      Syncing…
                    </span>
                  ) : (
                    'Refresh now'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subject table */}
      <details className="disclosure panel" open>
        <summary className="p-4">
          <span className="text-left">
            <span className="block text-sm font-semibold text-ink">Subject attendance</span>
            <span className="block text-xs font-normal text-ink-3">{tableRows.length} subjects</span>
          </span>
          <ChevronDown className="chev" />
        </summary>

        <div className="space-y-3 border-t border-line p-4">
          <p className="text-xs text-ink-3">
            Press <Send className="inline h-3 w-3" /> on a subject to copy its numbers into the calculators further down the page.
          </p>

          {tableRows.length === 0 ? (
            <div className="py-8 text-center text-sm text-ink-3">
              No subjects found. Sign in to PESU Academy or add subjects on the Subjects page.
            </div>
          ) : (
            <>
              {/* Phones: one card per subject */}
              <div className="space-y-2 md:hidden">
                {tableRows.map((row) => (
                  <article key={row.key} className="rounded-lg border border-line p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-ink">{row.name}</h3>
                        {row.code && <p className="text-xs text-ink-3">{row.code}</p>}
                      </div>
                      <button
                        type="button"
                        onClick={() => sendRow(row)}
                        className="btn btn-secondary btn-sm !px-2"
                        title="Copy to the calculators below"
                        aria-label={`Copy ${row.name} to the calculators below`}
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <div>
                        <span className="block text-xs text-ink-3">Now</span>
                        <span className="num mt-0.5 block text-lg font-semibold text-ink">{row.currentPct.toFixed(1)}%</span>
                        <span className="num text-xs text-ink-3">{row.attended}/{row.total}</span>
                      </div>
                      <div>
                        <span className="block text-xs text-ink-3">Skip all</span>
                        <span className="num mt-0.5 block text-lg font-semibold text-warn">{row.skipAllFinalPct.toFixed(1)}%</span>
                      </div>
                      <div>
                        <span className="block text-xs text-ink-3">Attend all</span>
                        <span className={`num mt-0.5 inline-block rounded border px-1.5 text-base font-semibold ${statusTone(row.projectedPct)}`}>
                          {row.projectedPct.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-end justify-between gap-3 border-t border-line pt-3">
                      <label className="flex items-center gap-2 text-xs text-ink-3">
                        Classes left
                        <input
                          type="number"
                          min="0"
                          inputMode="numeric"
                          value={classesLeftFor(row)}
                          onChange={(e) => updateSubjectOverride(row.key, 'classesLeft', e.target.value)}
                          className="input num w-16 px-1 py-1 text-center font-semibold"
                        />
                      </label>
                      <div className="text-right text-xs">
                        <div><span className="text-ink-3">75%: </span><SkipCell safe={row.safeMisses75} must={row.mustAttend75} /></div>
                        <div className="mt-0.5"><span className="text-ink-3">{targetBuffer}%: </span><SkipCell safe={row.safeMissesBuffer} must={row.mustAttendBuffer} /></div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* Desktop: table */}
              <div className="scrollbar-hide hidden overflow-x-auto md:block">
                <table className="table-clean">
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th className="text-center">Now</th>
                      <th className="text-center">Classes left</th>
                      <th className="text-center">If you skip all</th>
                      <th className="text-center">If you attend all</th>
                      <th className="text-center">For 75%</th>
                      <th className="text-center">For {targetBuffer}%</th>
                      <th className="text-right"><span className="sr-only">Copy</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows.map((row) => (
                      <tr key={row.key}>
                        <td className="min-w-[140px]">
                          <div className="font-medium">{row.name}</div>
                          {row.code && <div className="text-xs text-ink-3">{row.code}</div>}
                        </td>
                        <td className="text-center">
                          <div className="num font-medium">{row.attended}/{row.total}</div>
                          <div className="num text-xs text-ink-3">{row.currentPct.toFixed(1)}%</div>
                        </td>
                        <td className="text-center">
                          <input
                            type="number"
                            min="0"
                            inputMode="numeric"
                            aria-label={`Classes left for ${row.name}`}
                            value={classesLeftFor(row)}
                            onChange={(e) => updateSubjectOverride(row.key, 'classesLeft', e.target.value)}
                            className="input num mx-auto w-16 px-1 py-1 text-center font-semibold"
                            title="Edit the estimated classes left"
                          />
                        </td>
                        <td className="num text-center font-medium text-warn">{row.skipAllFinalPct.toFixed(1)}%</td>
                        <td className="text-center">
                          <span className={`num whitespace-nowrap rounded border px-2 py-0.5 font-medium ${statusTone(row.projectedPct)}`}>
                            {row.projectedPct.toFixed(1)}%
                          </span>
                        </td>
                        <td className="whitespace-nowrap text-center"><SkipCell safe={row.safeMisses75} must={row.mustAttend75} /></td>
                        <td className="whitespace-nowrap text-center"><SkipCell safe={row.safeMissesBuffer} must={row.mustAttendBuffer} /></td>
                        <td className="text-right">
                          <button
                            type="button"
                            onClick={() => sendRow(row)}
                            className="btn btn-secondary btn-sm !px-2"
                            title="Copy to the calculators below"
                            aria-label={`Copy ${row.name} to the calculators below`}
                          >
                            <Send className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </details>

      {/* Calendar */}
      <details className="disclosure panel" open>
        <summary className="p-4">
          <span className="flex items-center gap-2 text-sm font-semibold text-ink">
            <CalendarIcon className="h-4 w-4 text-ink-3" />
            Semester calendar
          </span>
          <span className="flex items-center gap-2">
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                if (!customEndDate) {
                  setCustomEndDate(projection.isa2Start || calendar?.calendar?.end || todayStr);
                }
                setShowEndDateEditor((open) => !open);
              }}
              className="btn btn-secondary btn-sm"
              title="Change when the semester ends"
            >
              <Edit2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Change end date</span>
            </button>
            <ChevronDown className="chev" />
          </span>
        </summary>

        <div className="space-y-4 border-t border-line p-3 sm:p-4">
          {showEndDateEditor && (
            <div className="notice notice-info flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <label htmlFor="attendance-custom-end-date" className="text-sm">
                Semester end date
                <span className="block text-xs text-ink-3">Projections count classes up to this date.</span>
              </label>
              <input
                id="attendance-custom-end-date"
                type="date"
                value={customEndDate}
                onChange={(event) => {
                  if (event.target.value) setCustomEndDate(event.target.value);
                }}
                className="input w-full sm:w-auto"
              />
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center justify-center gap-1 sm:justify-start">
              <button type="button" onClick={prevMonth} className="btn btn-ghost btn-sm !px-2" aria-label="Previous month">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <h3 className="w-[140px] text-center text-sm font-semibold text-ink">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </h3>
              <button type="button" onClick={nextMonth} className="btn btn-ghost btn-sm !px-2" aria-label="Next month">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-ink-2 sm:justify-end">
              <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-raised ring-1 ring-line-strong" /> Weekend</span>
              <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-bad/30" /> Holiday or after teaching ends</span>
              <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-warn/40" /> Exam</span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center sm:gap-1.5">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="py-1 text-xs font-medium text-ink-3">{d}</div>
            ))}

            {gridDays.map((cell, idx) => {
              if (!cell) {
                return <div key={`empty-${idx}`} className="h-12 sm:h-14" />;
              }

              const iso = cell.date;
              const dayEvents = eventsByDate[iso] || [];
              const isWeekend = cell.weekday === 0 || cell.weekday === 6;
              const isHoliday = dayEvents.some((e) => e.isHoliday);
              const isExam = dayEvents.some((e) => /\b(ISA|ESA)\b/i.test(e.name || ''));
              const teachingEndDate = customEndDate || isa2Start;
              const isAfterTeachingEnd = customEndDate
                ? iso > customEndDate
                : teachingEndDate && iso >= teachingEndDate;
              const isToday = iso === todayStr;

              let tone = 'border-line bg-surface text-ink';
              if (isWeekend) {
                tone = 'border-transparent bg-raised/60 text-ink-3';
              } else if (isHoliday || isAfterTeachingEnd) {
                tone = 'border-bad/20 bg-bad/10 text-bad';
              } else if (isExam) {
                tone = 'border-warn/30 bg-warn/15 text-warn';
              }

              return (
                <div
                  key={iso}
                  className={`flex h-12 flex-col justify-between rounded-md border p-1 text-left sm:h-14 ${tone} ${isToday ? 'ring-2 ring-accent' : ''}`}
                >
                  <span className="num text-xs font-medium">{cell.dayNumber}</span>
                  <span className="truncate text-[10px] leading-tight opacity-80">
                    {isHoliday ? (dayEvents.find((e) => e.isHoliday)?.name || 'Holiday')
                      : isExam ? (dayEvents.find((e) => /\b(ISA|ESA)\b/i.test(e.name || ''))?.name || 'Exam')
                        : isAfterTeachingEnd ? 'Teaching ends'
                          : isWeekend ? 'Off' : ''}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-ink-3">The calendar is for reference only. Holidays, exams, weekends and the teaching end date are marked.</p>

          <div className="notice notice-warn text-xs leading-relaxed">
            <strong className="font-medium">These are estimates.</strong> They come from the calendar and may be off, especially in semesters 1 and 2. Holidays can be followed by extra or half-day classes, and later weeks can change again. Check them against your real timetable, and use the copy button to enter your own classes held and attended if needed.
          </div>
        </div>
      </details>
    </div>
  );
}
