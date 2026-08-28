import React from 'react';
import {
  CheckCircle2, ChevronDown, TrendingUp, Activity, AlertCircle, RefreshCw, CalendarRange, Layers
} from 'lucide-react';
import { CalendarView } from '../components/PesuPortalData';
import InteractiveAttendancePlanner from '../components/InteractiveAttendancePlanner';

export default function AttendanceTab({
  themeClasses,
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
  setActiveTab,
  subjects,
  marks
}) {
  const isLoggedIn = !!pesuProfile;

  return (
    <div className="space-y-6">
      {!isLoggedIn && (
        <div className="flex items-center gap-2 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20 text-xs shadow-sm">
          <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <span className="text-blue-200">Connect to PESU Academy to automatically track attendance with your own timetable and calendar data.</span>
          <button onClick={() => setActiveTab('pesu')} className="ml-auto text-blue-400 font-bold hover:underline cursor-pointer">Login</button>
        </div>
      )}

      <div className="bg-[#0c0c14]/90 backdrop-blur-sm border border-white/[0.06] rounded-xl shadow-2xl shadow-black/20 p-6 text-zinc-200">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Overall Attendance
        </h2>
        <p className={`text-xs ${themeClasses.muted} mt-1`}>
          One subject at a time. Mode 1 is the base, and all planning modes use it automatically.
        </p>
      </div>

      {isLoggedIn && portalData && (
        <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-4 text-xs text-amber-200/80">
          PESU data detected: Interactive Planner & Calendar view is active. Adjust attendance projections with bunked days!
        </div>
      )}

      {/* NEW PLANNER SECTION */}
      <InteractiveAttendancePlanner
         portalData={portalData}
         pesuProfile={pesuProfile}
         calcSubjects={subjects}
         calcMarks={marks}
         setActiveTab={setActiveTab}
         themeClasses={themeClasses}
      />

      <details className={`${themeClasses.card} border rounded-xl group`} open={!isLoggedIn}>
        <summary className="flex items-center justify-between p-4 cursor-pointer list-none select-none hover:bg-white/[0.03] transition-colors">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-bold">Mode 1 — Current Attendance and Shared Baseline</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] ${themeClasses.muted}`}>Saved locally</span>
            <ChevronDown className="w-4 h-4 opacity-60 transition-transform group-open:rotate-180" />
          </div>
        </summary>

        <div className="p-4 pt-0 space-y-4">

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={`text-[10px] ${themeClasses.muted} block mb-1`}>Classes Held So Far</label>
              <input
                type="number"
                value={attendanceStatusMode.total}
                onChange={(e) => setAttendanceStatusMode(prev => ({ ...prev, total: e.target.value }))}
                placeholder="e.g. 51"
                className={`w-full max-w-[180px] sm:max-w-none p-2 border rounded-lg text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none ${themeClasses.input}`}
              />
            </div>
            <div>
              <label className={`text-[10px] ${themeClasses.muted} block mb-1`}>Attended</label>
              <input
                type="number"
                value={attendanceStatusMode.attended}
                onChange={(e) => setAttendanceStatusMode(prev => ({ ...prev, attended: e.target.value }))}
                placeholder="e.g. 48"
                className={`w-full max-w-[180px] sm:max-w-none p-2 border rounded-lg text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none ${themeClasses.input}`}
              />
            </div>
          </div>

          {statusStats.invalid && (
            <div className="text-xs text-red-400">
              Attended classes cannot be greater than classes held.
            </div>
          )}

          {statusStats.ready ? (
            <div className="space-y-3">
              <div className={`p-3 rounded-lg ${statusStats.isAboveMinimum ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-xs font-bold ${statusStats.isAboveMinimum ? 'text-green-300' : 'text-red-300'}`}>
                    Current Attendance
                  </span>
                  <span className={`text-lg font-bold ${statusStats.isAboveMinimum ? 'text-green-400' : 'text-red-400'}`}>
                    {statusStats.currentPercentage.toFixed(2)}%
                  </span>
                </div>
                <div className="w-full bg-white/[0.06] h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${statusStats.isAboveMinimum ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.min(100, statusStats.currentPercentage)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] mt-1">
                  <span className={themeClasses.muted}>0%</span>
                  <span className={`font-bold ${statusStats.isAboveMinimum ? 'text-green-400' : 'text-red-400'}`}>{ATTENDANCE_MIN_PERCENT}% Minimum</span>
                  <span className={themeClasses.muted}>100%</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="bg-white/[0.04] rounded-lg p-2 sm:p-3">
                  <div className="text-[10px] uppercase font-bold opacity-60">Attendance Entered (Attended / Held)</div>
                  <div className="text-sm font-bold mt-1">{statusStats.attended}/{statusStats.total}</div>
                </div>
                {isLoggedIn && (
                  <button
                    onClick={() => setActiveTab('pesu')}
                    className="bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 rounded-lg p-2 sm:p-3 flex flex-col justify-center items-center text-blue-300 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4 mb-1" />
                    <span className="text-[10px] font-bold uppercase">Sync Data</span>
                  </button>
                )}
                <div className="bg-white/[0.04] rounded-lg p-2 sm:p-3">
                  <div className="text-[10px] uppercase font-bold opacity-60">Maximum Consecutive Classes You Can Miss Right Now</div>
                  <div className="text-sm font-bold mt-1">{statusStats.maxConsecutiveSkipsNow}</div>
                </div>
                {!statusStats.isAboveMinimum && (
                  <div className="bg-white/[0.04] rounded-lg p-2 sm:p-3">
                    <div className="text-[10px] uppercase font-bold opacity-60">Consecutive Classes You Must Attend to Reach 75%</div>
                    <div className="text-sm font-bold mt-1">{statusStats.classesToAttendNow}</div>
                  </div>
                )}
                <div className="bg-white/[0.04] rounded-lg p-2 sm:p-3">
                  <div className="text-[10px] uppercase font-bold opacity-60">Difference From the 75% Minimum</div>
                  <div className="text-sm font-bold mt-1">
                    {(statusStats.currentPercentage >= ATTENDANCE_MIN_PERCENT ? '+' : '')}
                    {(statusStats.currentPercentage - ATTENDANCE_MIN_PERCENT).toFixed(2)}%
                  </div>
                </div>
                {statusStats.isAboveMinimum && statusStats.maxConsecutiveSkipsNow > 0 && (
                  <div className="bg-white/[0.04] rounded-lg p-2 sm:p-3">
                    <div className="text-[10px] uppercase font-bold opacity-60">Attendance After Missing Max Allowed (75%)</div>
                    <div className="text-sm font-bold mt-1">
                      {((statusStats.attended / (statusStats.total + statusStats.maxConsecutiveSkipsNow)) * 100).toFixed(2)}%
                    </div>
                  </div>
                )}
              </div>

              <div className={`text-xs ${themeClasses.muted}`}>
                {statusStats.isAboveMinimum
                  ? `You are above ${ATTENDANCE_MIN_PERCENT}%. You can miss ${statusStats.maxConsecutiveSkipsNow} consecutive classes before you need to attend again.`
                  : `You are below ${ATTENDANCE_MIN_PERCENT}%. Attend the next ${statusStats.classesToAttendNow} classes continuously to recover above the minimum.`}
              </div>
            </div>
          ) : statusStats.invalid ? null : (
            <div className={`text-center py-4 ${themeClasses.muted} text-xs`}>
              Enter classes held and attended to view this mode.
            </div>
          )}

          <div className="bg-white/[0.03] rounded-lg p-3 border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold">Separate Target Planner (Buffer)</div>
              <div className={`text-[10px] ${themeClasses.muted}`}>Used in Mode 2/3/4</div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className={`text-[10px] ${themeClasses.muted} block mb-1`}>Target Attendance %</label>
                <input
                  type="number"
                  value={attendanceStatusMode.bufferPercent}
                  onChange={(e) => setAttendanceStatusMode(prev => ({ ...prev, bufferPercent: e.target.value }))}
                  placeholder="e.g. 80"
                  className={`w-full max-w-[180px] sm:max-w-none p-2 border rounded-lg text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none ${themeClasses.input}`}
                />
              </div>
            </div>

            {targetStatusStats ? (
              <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="bg-white/[0.04] rounded-lg p-2 sm:p-3">
                    <div className="text-[10px] uppercase font-bold opacity-60">
                      Maximum Consecutive Classes You Can Miss (Target {targetStatusStats.targetPercent.toFixed(2)}%)
                    </div>
                    <div className="text-sm font-bold mt-1">{targetStatusStats.maxConsecutiveSkipsForTarget}</div>
                  </div>
                  {!targetStatusStats.isAboveTarget && (
                    <div className="bg-white/[0.04] rounded-lg p-2 sm:p-3">
                      <div className="text-[10px] uppercase font-bold opacity-60">
                        Consecutive Classes You Must Attend to Reach {targetStatusStats.targetPercent.toFixed(2)}%
                      </div>
                      <div className="text-sm font-bold mt-1">{targetStatusStats.classesToAttendForTarget}</div>
                    </div>
                  )}
                </div>
                <div className={`text-xs ${themeClasses.muted}`}>
                  {targetStatusStats.isAboveTarget
                    ? `You are already above ${targetStatusStats.targetPercent.toFixed(2)}%.`
                    : `You are below ${targetStatusStats.targetPercent.toFixed(2)}%. Attend ${targetStatusStats.classesToAttendForTarget} consecutive classes to recover.`}
                </div>
              </div>
            ) : (
              <div className={`text-xs ${themeClasses.muted}`}>
                Fill classes held and attended above to activate this target planner.
              </div>
            )}
          </div>
        </div>
      </details>

      <details className={`${themeClasses.card} border rounded-xl group`}>
        <summary className="flex items-center justify-between p-4 cursor-pointer list-none select-none hover:bg-white/[0.03] transition-colors">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-bold">Mode 2 — Plan Using Classes Remaining</span>
          </div>
          <ChevronDown className="w-4 h-4 opacity-60 transition-transform group-open:rotate-180" />
        </summary>

        <div className="p-4 pt-0 space-y-4">
          <div className={`text-[10px] ${themeClasses.muted}`}>
            {statusStats.ready
              ? `Using Mode 1 baseline: ${statusStats.attended}/${statusStats.total} (${statusStats.currentPercentage.toFixed(2)}%). Buffer target: ${sharedBufferPercent.toFixed(2)}%.`
              : 'Fill Mode 1 first to unlock this planner.'}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className={`text-[10px] ${themeClasses.muted} block mb-1`}>Classes Left</label>
              <input
                type="number"
                value={attendanceClassesLeftMode.classesLeft}
                onChange={(e) => setAttendanceClassesLeftMode(prev => ({ ...prev, classesLeft: e.target.value }))}
                placeholder="e.g. 24"
                className={`w-full max-w-[180px] sm:max-w-none p-2 border rounded-lg text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none ${themeClasses.input}`}
              />
            </div>
          </div>

          {classesLeftPlan && statusStats.ready ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              <div className="bg-white/[0.04] rounded-lg p-2 sm:p-3">
                <div className="text-[10px] uppercase font-bold opacity-60">Can Still Miss From Now (75% Target)</div>
                <div className="text-sm font-bold mt-1">{classesLeftPlan.safeMisses75}</div>
              </div>
              <div className="bg-white/[0.04] rounded-lg p-2 sm:p-3">
                <div className="text-[10px] uppercase font-bold opacity-60">Must Attend From Now (75% Target)</div>
                <div className="text-sm font-bold mt-1">{classesLeftPlan.mustAttendFor75}</div>
              </div>
              <div className="bg-white/[0.04] rounded-lg p-2 sm:p-3">
                <div className="text-[10px] uppercase font-bold opacity-60">Can Miss From Now (Buffer {sharedBufferPercent.toFixed(2)}%)</div>
                <div className="text-sm font-bold mt-1">{classesLeftPlan.safeMissesBuffer}</div>
              </div>
              <div className="bg-white/[0.04] rounded-lg p-2 sm:p-3">
                <div className="text-[10px] uppercase font-bold opacity-60">Possible Final Attendance Percentage Range</div>
                <div className="text-sm font-bold mt-1">{classesLeftPlan.worstFinalPercentage.toFixed(2)}% - {classesLeftPlan.bestFinalPercentage.toFixed(2)}%</div>
              </div>
            </div>
          ) : (
            <div className={`text-center py-4 ${themeClasses.muted} text-xs`}>
              {statusStats.ready ? 'Enter classes left to see the result.' : 'Complete Mode 1 first to use this planner.'}
            </div>
          )}
        </div>
      </details>

      <details className={`${themeClasses.card} border rounded-xl group`}>
        <summary className="flex items-center justify-between p-4 cursor-pointer list-none select-none hover:bg-white/[0.03] transition-colors">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-bold">Mode 3 — Plan Using Total Semester Classes</span>
          </div>
          <ChevronDown className="w-4 h-4 opacity-60 transition-transform group-open:rotate-180" />
        </summary>

        <div className="p-4 pt-0 space-y-4">
          <div className={`text-[10px] ${themeClasses.muted}`}>
            {statusStats.ready
              ? `Using Mode 1 baseline: ${statusStats.attended}/${statusStats.total} (${statusStats.currentPercentage.toFixed(2)}%). Buffer target: ${sharedBufferPercent.toFixed(2)}%.`
              : 'Fill Mode 1 first to unlock this planner.'}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className={`text-[10px] ${themeClasses.muted} block mb-1`}>Total Classes in Semester</label>
              <input
                type="number"
                value={attendanceSemesterMode.semesterTotal}
                onChange={(e) => setAttendanceSemesterMode(prev => ({ ...prev, semesterTotal: e.target.value }))}
                placeholder="e.g. 90"
                className={`w-full max-w-[180px] sm:max-w-none p-2 border rounded-lg text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none ${themeClasses.input}`}
              />
            </div>
          </div>

          {semesterPlan?.invalid ? (
            <div className="text-xs text-red-400">
              Semester total cannot be less than classes already held.
            </div>
          ) : semesterPlan && statusStats.ready ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
              <div className="bg-white/[0.04] rounded-lg p-2 sm:p-3">
                <div className="text-[10px] uppercase font-bold opacity-60">Classes Remaining in Semester</div>
                <div className="text-sm font-bold mt-1">{semesterPlan.classesLeft}</div>
              </div>
              <div className="bg-white/[0.04] rounded-lg p-2 sm:p-3">
                <div className="text-[10px] uppercase font-bold opacity-60">Total Semester Miss Limit (75%)</div>
                <div className="text-sm font-bold mt-1">{semesterPlan.maxTotalMissesWhole75}</div>
              </div>
              <div className="bg-white/[0.04] rounded-lg p-2 sm:p-3">
                <div className="text-[10px] uppercase font-bold opacity-60">Additional Misses Allowed From Now (75%)</div>
                <div className="text-sm font-bold mt-1">{semesterPlan.safeMisses75}</div>
              </div>
              <div className="bg-white/[0.04] rounded-lg p-2 sm:p-3">
                <div className="text-[10px] uppercase font-bold opacity-60">Must Attend From Now (75% Target)</div>
                <div className="text-sm font-bold mt-1">{semesterPlan.mustAttendFor75}</div>
              </div>
              <div className="bg-white/[0.04] rounded-lg p-2 sm:p-3">
                <div className="text-[10px] uppercase font-bold opacity-60">Can Miss From Now (Buffer {sharedBufferPercent.toFixed(2)}%)</div>
                <div className="text-sm font-bold mt-1">{semesterPlan.safeMissesBuffer}</div>
              </div>
              <div className="bg-white/[0.04] rounded-lg p-2 sm:p-3">
                <div className="text-[10px] uppercase font-bold opacity-60">Possible Final Attendance Percentage Range</div>
                <div className="text-sm font-bold mt-1">{semesterPlan.worstFinalPercentage.toFixed(2)}% - {semesterPlan.bestFinalPercentage.toFixed(2)}%</div>
              </div>
            </div>
          ) : (
            <div className={`text-center py-4 ${themeClasses.muted} text-xs`}>
              {statusStats.ready ? 'Enter total semester classes to see the result.' : 'Complete Mode 1 first to use this planner.'}
            </div>
          )}
        </div>
      </details>

      <details className={`${themeClasses.card} border rounded-xl group`}>
        <summary className="flex items-center justify-between p-4 cursor-pointer list-none select-none hover:bg-white/[0.03] transition-colors">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-bold">Mode 4 — Weekly Class Range Planner</span>
          </div>
          <ChevronDown className="w-4 h-4 opacity-60 transition-transform group-open:rotate-180" />
        </summary>

        <div className="p-4 pt-0 space-y-4">

          <div className={`text-[10px] ${themeClasses.muted}`}>
            {statusStats.ready
              ? `Using Mode 1 baseline: ${statusStats.attended}/${statusStats.total} (${statusStats.currentPercentage.toFixed(2)}%). Buffer target: ${sharedBufferPercent.toFixed(2)}%.`
              : 'Fill Mode 1 first to unlock this planner.'}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
            <div>
              <label className={`text-[10px] ${themeClasses.muted} block mb-1`}>Weeks Left</label>
              <input
                type="number"
                value={attendanceWeeklyMode.weeksLeft}
                onChange={(e) => setAttendanceWeeklyMode(prev => ({ ...prev, weeksLeft: e.target.value }))}
                placeholder="e.g. 6"
                className={`w-full max-w-[180px] sm:max-w-none p-2 border rounded-lg text-sm font-semibold focus:ring-2 focus:ring-violet-500 focus:outline-none ${themeClasses.input}`}
              />
            </div>
            <div>
              <label className={`text-[10px] ${themeClasses.muted} block mb-1`}>Min Classes / Week</label>
              <input
                type="number"
                value={attendanceWeeklyMode.minPerWeek}
                onChange={(e) => setAttendanceWeeklyMode(prev => ({ ...prev, minPerWeek: e.target.value }))}
                placeholder="e.g. 4"
                className={`w-full max-w-[180px] sm:max-w-none p-2 border rounded-lg text-sm font-semibold focus:ring-2 focus:ring-violet-500 focus:outline-none ${themeClasses.input}`}
              />
            </div>
            <div className="col-span-2 lg:col-span-1">
              <label className={`text-[10px] ${themeClasses.muted} block mb-1`}>Max Classes / Week</label>
              <input
                type="number"
                value={attendanceWeeklyMode.maxPerWeek}
                onChange={(e) => setAttendanceWeeklyMode(prev => ({ ...prev, maxPerWeek: e.target.value }))}
                placeholder="e.g. 6"
                className={`w-full max-w-[180px] sm:max-w-none p-2 border rounded-lg text-sm font-semibold focus:ring-2 focus:ring-violet-500 focus:outline-none ${themeClasses.input}`}
              />
            </div>
          </div>

          <div className={`text-[10px] ${themeClasses.muted}`}>
            Use the same number for minimum and maximum if every week has the same class count.
          </div>

          {weeklyPlan?.minPlan && weeklyPlan?.maxPlan && statusStats.ready ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              <div className="bg-white/[0.04] rounded-lg p-2 sm:p-3">
                <div className="text-[10px] uppercase font-bold opacity-60">Estimated Remaining Classes</div>
                <div className="text-sm font-bold mt-1">{weeklyPlan.minPlan.remaining}{weeklyPlan.maxPlan.remaining !== weeklyPlan.minPlan.remaining && <span className="opacity-60"> - {weeklyPlan.maxPlan.remaining}</span>}</div>
              </div>
              <div className="bg-white/[0.04] rounded-lg p-2 sm:p-3">
                <div className="text-[10px] uppercase font-bold opacity-60">Can Still Miss From Now (75% Target)</div>
                <div className="text-sm font-bold mt-1">{weeklyPlan.minPlan.safeMisses75}{weeklyPlan.maxPlan.safeMisses75 !== weeklyPlan.minPlan.safeMisses75 && <span className="opacity-60"> - {weeklyPlan.maxPlan.safeMisses75}</span>}</div>
              </div>
              <div className="bg-white/[0.04] rounded-lg p-2 sm:p-3">
                <div className="text-[10px] uppercase font-bold opacity-60">Can Miss From Now (Buffer {sharedBufferPercent.toFixed(2)}%)</div>
                <div className="text-sm font-bold mt-1">{weeklyPlan.minPlan.safeMissesBuffer}{weeklyPlan.maxPlan.safeMissesBuffer !== weeklyPlan.minPlan.safeMissesBuffer && <span className="opacity-60"> - {weeklyPlan.maxPlan.safeMissesBuffer}</span>}</div>
              </div>
              <div className="bg-white/[0.04] rounded-lg p-2 sm:p-3">
                <div className="text-[10px] uppercase font-bold opacity-60">Possible Final Attendance Percentage Range</div>
                <div className="text-sm font-bold mt-1">{weeklyPlan.minPlan.worstFinalPercentage.toFixed(2)}% - {weeklyPlan.maxPlan.bestFinalPercentage.toFixed(2)}%</div>
              </div>
            </div>
          ) : (
            <div className={`text-center py-4 ${themeClasses.muted} text-xs`}>
              {statusStats.ready ? 'Enter weekly range values to see the result.' : 'Complete Mode 1 first to use this planner.'}
            </div>
          )}
        </div>
      </details>

      <details className={`${themeClasses.card} border rounded-xl group`}>
        <summary className="flex items-center justify-between p-4 cursor-pointer list-none select-none hover:bg-white/[0.03] transition-colors">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-bold">Mode 5 — Miss Impact Planner</span>
          </div>
          <ChevronDown className="w-4 h-4 opacity-60 transition-transform group-open:rotate-180" />
        </summary>

        <div className="p-4 pt-0 space-y-4">
          <div className={`text-[10px] ${themeClasses.muted}`}>
            {statusStats.ready
              ? `Using Mode 1 baseline: ${statusStats.attended}/${statusStats.total} (${statusStats.currentPercentage.toFixed(2)}%).`
              : 'Fill Mode 1 first to unlock this planner.'}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className={`text-[10px] ${themeClasses.muted} block mb-1`}>How many classes do you want to miss?</label>
              <input
                type="number"
                value={attendanceMissPlannerMode.misses}
                onChange={(e) => setAttendanceMissPlannerMode(prev => ({ ...prev, misses: e.target.value }))}
                placeholder="e.g. 3"
                className={`w-full max-w-[180px] sm:max-w-none p-2 border rounded-lg text-sm font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none ${themeClasses.input}`}
              />
            </div>
          </div>

          {missImpactPlan && statusStats.ready ? (
            <div className="space-y-2">
              <div className={`grid ${missImpactPlan.isBelowAfterMisses ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'} gap-2`}>
                <div className="bg-white/[0.04] rounded-lg p-2 sm:p-3">
                  <div className="text-[10px] uppercase font-bold opacity-60">Attendance After Missing {missImpactPlan.plannedMisses} Class(es)</div>
                  <div className={`text-sm font-bold mt-1 ${missImpactPlan.isBelowAfterMisses ? 'text-red-400' : ''}`}>{missImpactPlan.attendanceAfterPlannedMisses.toFixed(2)}%</div>
                </div>
                {missImpactPlan.isBelowAfterMisses && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2 sm:p-3">
                    <div className="text-[10px] uppercase font-bold opacity-60 text-red-300">Classes You Must Then Attend to Recover 75%</div>
                    <div className="text-sm font-bold mt-1 text-red-400">{missImpactPlan.classesToRecoverAfterMisses}</div>
                  </div>
                )}
              </div>
              {missImpactPlan.isBelowAfterMisses && (
                <div className="text-xs text-red-400/80">
                  Missing {missImpactPlan.plannedMisses} class(es) will drop you below 75%. You would need to attend {missImpactPlan.classesToRecoverAfterMisses} consecutive classes after that to recover.
                </div>
              )}
            </div>
          ) : (
            <div className={`text-center py-4 ${themeClasses.muted} text-xs`}>
              {statusStats.ready ? 'Enter planned missed classes to see the result.' : 'Complete Mode 1 first to use this planner.'}
            </div>
          )}
        </div>
      </details>
      
      {isLoggedIn && portalData?.calendar && (
        <details className={`${themeClasses.card} border rounded-xl group`}>
          <summary className="flex items-center justify-between p-4 cursor-pointer list-none select-none hover:bg-white/[0.03] transition-colors">
            <div className="flex items-center gap-2">
              <CalendarRange className="w-4 h-4 text-zinc-400" />
              <span className="text-sm font-bold text-zinc-400">Calendar of Events</span>
            </div>
            <ChevronDown className="w-4 h-4 opacity-60 transition-transform group-open:rotate-180" />
          </summary>
          <div className="p-4 pt-0">
            <CalendarView calendar={portalData.calendar} />
          </div>
        </details>
      )}
    </div>
  );
}
