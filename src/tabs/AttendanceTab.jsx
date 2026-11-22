import React from 'react';
import { ChevronDown } from 'lucide-react';
import { CalendarView } from '../components/PesuPortalData';
import InteractiveAttendancePlanner from '../components/InteractiveAttendancePlanner';
import {
  filterAttendanceCalendar,
  filterAttendanceCalendarForDisplay,
} from '../utils/attendanceProjection';

function Chevron() {
  return <ChevronDown className="chev" />;
}

function Stat({ label, value, tone }) {
  return (
    <div className="inset p-3">
      <div className="text-xs text-ink-3">{label}</div>
      <div className={`num mt-1 text-lg font-semibold ${tone === 'bad' ? 'text-bad' : tone === 'good' ? 'text-good' : 'text-ink'}`}>{value}</div>
    </div>
  );
}

function NumberField({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <input
        type="number"
        inputMode="numeric"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="input num font-semibold"
      />
    </label>
  );
}

function Section({ id, title, hint, children, open }) {
  return (
    <details id={id} className="disclosure panel" open={open}>
      <summary className="p-4">
        <span className="text-left">
          <span className="block text-sm font-semibold text-ink">{title}</span>
          {hint && <span className="block text-xs font-normal text-ink-3">{hint}</span>}
        </span>
        <Chevron />
      </summary>
      <div className="space-y-4 border-t border-line p-4">{children}</div>
    </details>
  );
}

export default function AttendanceTab({
  attendanceStatusMode,
  setAttendanceStatusMode,
  attendanceClassesLeftMode,
  setAttendanceClassesLeftMode,
  attendanceSemesterMode,
  setAttendanceSemesterMode,
  attendanceWeeklyMode,
  setAttendanceWeeklyMode,
  attendanceMissPlannerMode,
  setAttendanceMissPlannerMode,
  statusStats,
  sharedBufferPercent,
  targetStatusStats,
  classesLeftPlan,
  semesterPlan,
  weeklyPlan,
  missImpactPlan,
  ATTENDANCE_MIN_PERCENT,
  pesuProfile,
  portalData,
  setPortalData,
  lastSynced,
  setActiveTab,
  subjects,
  marks,
}) {
  const isLoggedIn = !!pesuProfile;
  const activeAttendanceSemester = portalData?.attendance?.[0]?.semester;
  const attendanceCalendar = filterAttendanceCalendar(portalData?.calendar, activeAttendanceSemester);
  const displayAttendanceCalendar = filterAttendanceCalendarForDisplay(
    portalData?.calendar,
    activeAttendanceSemester,
  );
  const formattedLastSynced = lastSynced
    ? new Date(lastSynced).toLocaleString([], {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
    : '';

  const sendToAttendancePlanner = ({ total, attended, classesLeft }) => {
    setAttendanceStatusMode((prev) => ({
      ...prev,
      total: total != null ? String(total) : prev.total,
      attended: attended != null ? String(attended) : prev.attended,
    }));
    if (classesLeft != null) {
      setAttendanceClassesLeftMode({ classesLeft: String(classesLeft) });
    }

    // Auto-open the first two sections, then scroll to the first
    const mode1 = document.getElementById('mode-1-details');
    const mode2 = document.getElementById('mode-2-details');
    if (mode1) {
      mode1.open = true;
      setTimeout(() => mode1.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
    if (mode2) mode2.open = true;

    setActiveTab('attendance');
  };

  const baseline = statusStats.ready
    ? `Based on your current attendance: ${statusStats.attended}/${statusStats.total} (${statusStats.currentPercentage.toFixed(2)}%).`
    : 'Fill in your current attendance first to unlock this.';
  const baselineWithBuffer = statusStats.ready
    ? `${baseline} Buffer target: ${sharedBufferPercent.toFixed(2)}%.`
    : baseline;

  return (
    <div className="space-y-4">
      {!isLoggedIn && (
        <div className="notice notice-info flex items-center justify-between gap-3">
          <span>Sign in to PESU Academy to track attendance from your own timetable and calendar.</span>
          <button type="button" onClick={() => setActiveTab('pesu')} className="btn btn-secondary btn-sm shrink-0">Sign in</button>
        </div>
      )}

      {isLoggedIn && portalData && (
        <div className="notice notice-info">
          <p>PESU data found. The interactive planner and calendar below are active, so you can mark days you plan to skip.</p>
          {formattedLastSynced && <p className="mt-1 text-xs text-ink-3">Last synced {formattedLastSynced}</p>}
        </div>
      )}

      <InteractiveAttendancePlanner
        portalData={portalData && { ...portalData, calendar: attendanceCalendar }}
        portalDataIdentity={portalData}
        setPortalData={setPortalData}
        pesuProfile={pesuProfile}
        username={pesuProfile?.srn || pesuProfile?.prn || ''}
        calcSubjects={subjects}
        calcMarks={marks}
        setActiveTab={setActiveTab}
        onSendToPlanner={sendToAttendancePlanner}
        bufferPercent={attendanceStatusMode.bufferPercent}
        setBufferPercent={(val) => setAttendanceStatusMode((prev) => ({ ...prev, bufferPercent: val }))}
      />

      {/* Current attendance */}
      <Section id="mode-1-details" title="Current attendance" hint="Your attendance now, and how many classes you can miss in a row" open={!isLoggedIn}>
        <div className="grid grid-cols-2 gap-3">
          <NumberField
            label="Classes held so far"
            value={attendanceStatusMode.total}
            onChange={(e) => setAttendanceStatusMode((prev) => ({ ...prev, total: e.target.value }))}
            placeholder="e.g. 51"
          />
          <NumberField
            label="Classes you attended"
            value={attendanceStatusMode.attended}
            onChange={(e) => setAttendanceStatusMode((prev) => ({ ...prev, attended: e.target.value }))}
            placeholder="e.g. 48"
          />
        </div>

        {statusStats.invalid && (
          <p className="text-sm text-bad">Attended classes can&apos;t be more than classes held.</p>
        )}

        {statusStats.ready ? (
          <div className="space-y-3">
            <div className={`notice ${statusStats.isAboveMinimum ? 'notice-good' : 'notice-bad'}`}>
              <div className="flex items-baseline justify-between">
                <span className="font-medium">Current attendance</span>
                <span className="num text-2xl font-semibold">{statusStats.currentPercentage.toFixed(2)}%</span>
              </div>
              <div className="relative mt-3 h-2 rounded-full bg-canvas/60">
                <div
                  className={`h-full rounded-full ${statusStats.isAboveMinimum ? 'bg-good' : 'bg-bad'}`}
                  style={{ width: `${Math.min(100, statusStats.currentPercentage)}%` }}
                />
                <div className="absolute -top-1 h-4 w-0.5 bg-ink" style={{ left: `${ATTENDANCE_MIN_PERCENT}%` }} title={`${ATTENDANCE_MIN_PERCENT}% minimum`} />
              </div>
              <div className="num mt-1 flex justify-between text-xs opacity-80">
                <span>0%</span>
                <span>{ATTENDANCE_MIN_PERCENT}% minimum</span>
                <span>100%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Stat label="Attended / held" value={`${statusStats.attended}/${statusStats.total}`} />
              <Stat label="Classes you can miss in a row, right now" value={statusStats.maxConsecutiveSkipsNow} />
              {!statusStats.isAboveMinimum && (
                <Stat label="Classes you must attend in a row to reach 75%" value={statusStats.classesToAttendNow} tone="bad" />
              )}
              <Stat
                label="Distance from the 75% minimum"
                value={`${statusStats.currentPercentage >= ATTENDANCE_MIN_PERCENT ? '+' : ''}${(statusStats.currentPercentage - ATTENDANCE_MIN_PERCENT).toFixed(2)}%`}
              />
              {statusStats.isAboveMinimum && statusStats.maxConsecutiveSkipsNow > 0 && (
                <Stat
                  label="Attendance after missing that many"
                  value={`${((statusStats.attended / (statusStats.total + statusStats.maxConsecutiveSkipsNow)) * 100).toFixed(2)}%`}
                />
              )}
            </div>

            <p className="text-sm text-ink-2">
              {statusStats.isAboveMinimum
                ? `You're above ${ATTENDANCE_MIN_PERCENT}%. You can miss ${statusStats.maxConsecutiveSkipsNow} classes in a row before you need to start attending again.`
                : `You're below ${ATTENDANCE_MIN_PERCENT}%. Attend the next ${statusStats.classesToAttendNow} classes in a row to get back above the minimum.`}
            </p>
          </div>
        ) : statusStats.invalid ? null : (
          <p className="py-2 text-center text-sm text-ink-3">Enter classes held and attended to see your numbers.</p>
        )}

        <div className="inset space-y-3 p-3">
          <div className="flex items-baseline justify-between gap-3">
            <div className="text-sm font-medium text-ink">Aim higher than 75%</div>
            <div className="text-xs text-ink-3">Used by the planners below</div>
          </div>
          <div className="max-w-[220px]">
            <NumberField
              label="Target attendance %"
              value={attendanceStatusMode.bufferPercent}
              onChange={(e) => setAttendanceStatusMode((prev) => ({ ...prev, bufferPercent: e.target.value }))}
              placeholder="e.g. 80"
            />
          </div>

          {targetStatusStats ? (
            <div className="space-y-2">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Stat
                  label={`Classes you can miss in a row (target ${targetStatusStats.targetPercent.toFixed(2)}%)`}
                  value={targetStatusStats.maxConsecutiveSkipsForTarget}
                />
                {!targetStatusStats.isAboveTarget && (
                  <Stat
                    label={`Classes you must attend in a row to reach ${targetStatusStats.targetPercent.toFixed(2)}%`}
                    value={targetStatusStats.classesToAttendForTarget}
                    tone="bad"
                  />
                )}
              </div>
              <p className="text-sm text-ink-2">
                {targetStatusStats.isAboveTarget
                  ? `You're already above ${targetStatusStats.targetPercent.toFixed(2)}%.`
                  : `You're below ${targetStatusStats.targetPercent.toFixed(2)}%. Attend ${targetStatusStats.classesToAttendForTarget} classes in a row to recover.`}
              </p>
            </div>
          ) : (
            <p className="text-sm text-ink-3">Fill in classes held and attended above to see this.</p>
          )}
        </div>
      </Section>

      {/* Classes left */}
      <Section id="mode-2-details" title="Classes left" hint="Enter the classes remaining to see how many you can still miss">
        <p className="text-xs text-ink-3">{baselineWithBuffer}</p>
        <div className="max-w-[220px]">
          <NumberField
            label="Classes left"
            value={attendanceClassesLeftMode.classesLeft}
            onChange={(e) => setAttendanceClassesLeftMode((prev) => ({ ...prev, classesLeft: e.target.value }))}
            placeholder="e.g. 24"
          />
        </div>

        {classesLeftPlan && statusStats.ready ? (
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            <Stat label="Can still miss (75% target)" value={classesLeftPlan.safeMisses75} />
            <Stat label="Must attend (75% target)" value={classesLeftPlan.mustAttendFor75} />
            <Stat label={`Can miss (buffer ${sharedBufferPercent.toFixed(2)}%)`} value={classesLeftPlan.safeMissesBuffer} />
            <Stat label="Possible final attendance" value={`${classesLeftPlan.worstFinalPercentage.toFixed(2)}% to ${classesLeftPlan.bestFinalPercentage.toFixed(2)}%`} />
          </div>
        ) : (
          <p className="py-2 text-center text-sm text-ink-3">
            {statusStats.ready ? 'Enter classes left to see the result.' : 'Fill in your current attendance first.'}
          </p>
        )}
      </Section>

      {/* Miss impact */}
      <Section title="Effect of missing classes" hint="Enter how many you'll miss to see your new percentage">
        <p className="text-xs text-ink-3">{baseline}</p>
        <div className="max-w-[260px]">
          <NumberField
            label="How many classes will you miss?"
            value={attendanceMissPlannerMode.misses}
            onChange={(e) => setAttendanceMissPlannerMode((prev) => ({ ...prev, misses: e.target.value }))}
            placeholder="e.g. 3"
          />
        </div>

        {missImpactPlan && statusStats.ready ? (
          <div className="space-y-2">
            <div className={`grid gap-2 ${missImpactPlan.isBelowAfterMisses ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
              <Stat
                label={`Attendance after missing ${missImpactPlan.plannedMisses} class(es)`}
                value={`${missImpactPlan.attendanceAfterPlannedMisses.toFixed(2)}%`}
                tone={missImpactPlan.isBelowAfterMisses ? 'bad' : undefined}
              />
              {missImpactPlan.isBelowAfterMisses && (
                <Stat label="Classes you'd then need to attend to get back to 75%" value={missImpactPlan.classesToRecoverAfterMisses} tone="bad" />
              )}
            </div>
            {missImpactPlan.isBelowAfterMisses && (
              <p className="text-sm text-bad">
                Missing {missImpactPlan.plannedMisses} class(es) drops you below 75%. You would then need to attend {missImpactPlan.classesToRecoverAfterMisses} in a row to recover.
              </p>
            )}
          </div>
        ) : (
          <p className="py-2 text-center text-sm text-ink-3">
            {statusStats.ready ? 'Enter how many classes you plan to miss.' : 'Fill in your current attendance first.'}
          </p>
        )}
      </Section>

      {/* Semester total */}
      <Section title="Semester total" hint="Enter the total classes in the semester to plan your misses">
        <p className="text-xs text-ink-3">{baselineWithBuffer}</p>
        <div className="max-w-[260px]">
          <NumberField
            label="Total classes in the semester"
            value={attendanceSemesterMode.semesterTotal}
            onChange={(e) => setAttendanceSemesterMode((prev) => ({ ...prev, semesterTotal: e.target.value }))}
            placeholder="e.g. 90"
          />
        </div>

        {semesterPlan?.invalid ? (
          <p className="text-sm text-bad">The semester total can&apos;t be less than the classes already held.</p>
        ) : semesterPlan && statusStats.ready ? (
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
            <Stat label="Classes remaining" value={semesterPlan.classesLeft} />
            <Stat label="Most you can miss in the whole semester (75%)" value={semesterPlan.maxTotalMissesWhole75} />
            <Stat label="More you can miss from now (75%)" value={semesterPlan.safeMisses75} />
            <Stat label="Must attend from now (75%)" value={semesterPlan.mustAttendFor75} />
            <Stat label={`Can miss from now (buffer ${sharedBufferPercent.toFixed(2)}%)`} value={semesterPlan.safeMissesBuffer} />
            <Stat label="Possible final attendance" value={`${semesterPlan.worstFinalPercentage.toFixed(2)}% to ${semesterPlan.bestFinalPercentage.toFixed(2)}%`} />
          </div>
        ) : (
          <p className="py-2 text-center text-sm text-ink-3">
            {statusStats.ready ? 'Enter the total classes in the semester.' : 'Fill in your current attendance first.'}
          </p>
        )}
      </Section>

      {/* Weekly */}
      <Section title="Classes per week" hint="Enter weeks left and classes per week to plan your misses">
        <p className="text-xs text-ink-3">{baselineWithBuffer}</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <NumberField
            label="Weeks left"
            value={attendanceWeeklyMode.weeksLeft}
            onChange={(e) => setAttendanceWeeklyMode((prev) => ({ ...prev, weeksLeft: e.target.value }))}
            placeholder="e.g. 6"
          />
          <NumberField
            label="Fewest classes a week"
            value={attendanceWeeklyMode.minPerWeek}
            onChange={(e) => setAttendanceWeeklyMode((prev) => ({ ...prev, minPerWeek: e.target.value }))}
            placeholder="e.g. 4"
          />
          <NumberField
            label="Most classes a week"
            value={attendanceWeeklyMode.maxPerWeek}
            onChange={(e) => setAttendanceWeeklyMode((prev) => ({ ...prev, maxPerWeek: e.target.value }))}
            placeholder="e.g. 6"
          />
        </div>
        <p className="text-xs text-ink-3">If every week has the same number of classes, use the same number in both boxes.</p>

        {weeklyPlan?.minPlan && weeklyPlan?.maxPlan && statusStats.ready ? (
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            <Stat
              label="Estimated classes remaining"
              value={<>{weeklyPlan.minPlan.remaining}{weeklyPlan.maxPlan.remaining !== weeklyPlan.minPlan.remaining && <span className="text-ink-3"> to {weeklyPlan.maxPlan.remaining}</span>}</>}
            />
            <Stat
              label="Can still miss (75% target)"
              value={<>{weeklyPlan.minPlan.safeMisses75}{weeklyPlan.maxPlan.safeMisses75 !== weeklyPlan.minPlan.safeMisses75 && <span className="text-ink-3"> to {weeklyPlan.maxPlan.safeMisses75}</span>}</>}
            />
            <Stat
              label={`Can miss (buffer ${sharedBufferPercent.toFixed(2)}%)`}
              value={<>{weeklyPlan.minPlan.safeMissesBuffer}{weeklyPlan.maxPlan.safeMissesBuffer !== weeklyPlan.minPlan.safeMissesBuffer && <span className="text-ink-3"> to {weeklyPlan.maxPlan.safeMissesBuffer}</span>}</>}
            />
            <Stat label="Possible final attendance" value={`${weeklyPlan.minPlan.worstFinalPercentage.toFixed(2)}% to ${weeklyPlan.maxPlan.bestFinalPercentage.toFixed(2)}%`} />
          </div>
        ) : (
          <p className="py-2 text-center text-sm text-ink-3">
            {statusStats.ready ? 'Enter the weekly range to see the result.' : 'Fill in your current attendance first.'}
          </p>
        )}
      </Section>

      {isLoggedIn && portalData?.calendar && (
        <Section title="Academic calendar" hint="Events and holidays from PESU Academy">
          <CalendarView calendar={displayAttendanceCalendar} />
        </Section>
      )}
    </div>
  );
}
