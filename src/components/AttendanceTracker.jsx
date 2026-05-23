import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, Calendar, TrendingUp, AlertTriangle, 
  ChevronRight, Sparkles, BookOpen, Clock 
} from 'lucide-react';

export default function AttendanceTracker({
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
  missImpactPlan
}) {
  const [activeSubTab, setActiveSubTab] = useState('overview');

  const subTabs = [
    { id: 'overview', label: 'Overview', icon: CheckCircle2 },
    { id: 'left', label: 'Classes Left', icon: Clock },
    { id: 'semester', label: 'Semester Plan', icon: Calendar },
    { id: 'weekly', label: 'Weekly Plan', icon: TrendingUp },
    { id: 'miss', label: 'Miss Impact', icon: AlertTriangle }
  ];

  // Radial configurations for the big attendance progress circle
  const ringRadius = 55;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const currentPct = statusStats.ready ? statusStats.currentPercentage : 0;
  const ringStrokeOffset = ringCircumference - (Math.min(currentPct, 100) / 100) * ringCircumference;

  return (
    <div className="space-y-6">
      {/* Attendance tracker header summary */}
      <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/[0.04] blur-2xl rounded-full pointer-events-none" />
        <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-400" /> Attendance Suite
        </h2>
        <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
          Maintain the mandatory <strong>75% attendance threshold</strong>. Enter your current attendance baseline below, and switch between planners to map out your semester.
        </p>
      </div>

      {/* Segmented Sub-Tab Navigator (Floating glass pills) */}
      <div className="bg-black/30 border border-white/[0.04] rounded-xl p-1 flex overflow-x-auto gap-1">
        {subTabs.map((tab) => {
          const IconComponent = tab.icon;
          const isSelected = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`relative flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-200 whitespace-nowrap flex-1 ${
                isSelected 
                  ? 'bg-white/[0.08] text-white shadow-sm' 
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]'
              }`}
            >
              <IconComponent className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {isSelected && (
                <motion.div 
                  layoutId="activeSubTabIndicator" 
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" 
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Dynamic Tab Renderer */}
      <div className="space-y-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSubTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* OVERVIEW SUB-TAB */}
            {activeSubTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  {/* Left: Input parameters */}
                  <div className="md:col-span-5 space-y-4">
                    <div className="glass-panel p-5 rounded-2xl space-y-4">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-extrabold block mb-1">Baseline Inputs</span>
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] text-zinc-400 font-bold block mb-1">Total Classes Held So Far</label>
                          <input
                            type="number"
                            value={attendanceStatusMode.total}
                            onChange={(e) => setAttendanceStatusMode(prev => ({ ...prev, total: e.target.value }))}
                            placeholder="e.g. 48"
                            className="w-full glass-input px-3 py-2 text-sm font-extrabold focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-zinc-400 font-bold block mb-1">Classes Attended So Far</label>
                          <input
                            type="number"
                            value={attendanceStatusMode.attended}
                            onChange={(e) => setAttendanceStatusMode(prev => ({ ...prev, attended: e.target.value }))}
                            placeholder="e.g. 42"
                            className="w-full glass-input px-3 py-2 text-sm font-extrabold focus:outline-none"
                          />
                        </div>
                      </div>
                      
                      {statusStats.invalid && (
                        <div className="text-[10px] text-red-400 flex items-center gap-1 font-bold">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Attended cannot exceed total classes held.</span>
                        </div>
                      )}
                    </div>

                    {/* Target buffer slider input */}
                    <div className="glass-panel p-5 rounded-2xl space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Safety Target (Buffer)</label>
                        <span className="text-xs font-bold text-emerald-400">{attendanceStatusMode.bufferPercent || 80}%</span>
                      </div>
                      <input
                        type="range"
                        min="75"
                        max="98"
                        step="1"
                        value={attendanceStatusMode.bufferPercent || 80}
                        onChange={(e) => setAttendanceStatusMode(prev => ({ ...prev, bufferPercent: e.target.value }))}
                        className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Right: Beautiful Percentage Dial Indicator */}
                  <div className="md:col-span-7 flex flex-col items-center justify-center text-center">
                    {statusStats.ready ? (
                      <div className="space-y-4 w-full">
                        {/* Circular attendance display */}
                        <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle cx="88" cy="88" r={ringRadius} className="stroke-zinc-800/40" strokeWidth="10" fill="transparent" />
                            <motion.circle
                              cx="88"
                              cy="88"
                              r={ringRadius}
                              className={statusStats.isAboveMinimum ? "stroke-emerald-500" : "stroke-red-500"}
                              strokeWidth="10"
                              fill="transparent"
                              strokeDasharray={ringCircumference}
                              initial={{ strokeDashoffset: ringCircumference }}
                              animate={{ strokeDashoffset: ringStrokeOffset }}
                              transition={{ duration: 0.6, ease: "easeOut" }}
                              strokeLinecap="round"
                              style={{ 
                                filter: `drop-shadow(0 0 8px ${
                                  statusStats.isAboveMinimum 
                                    ? 'rgba(16, 185, 129, 0.45)' 
                                    : 'rgba(239, 68, 68, 0.45)'
                                })` 
                              }}
                            />
                          </svg>
                          
                          <div className="absolute flex flex-col items-center justify-center">
                            <span className={`text-3xl font-black tabular-nums tracking-tight ${statusStats.isAboveMinimum ? 'text-emerald-400 text-glow-emerald' : 'text-red-400'}`}>
                              {statusStats.currentPercentage.toFixed(1)}%
                            </span>
                            <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-semibold mt-1">
                              Current Ratio
                            </span>
                          </div>
                        </div>

                        {/* Status Message Badges */}
                        <div className="max-w-xs mx-auto">
                          {statusStats.isAboveMinimum ? (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl px-4 py-2.5 text-xs font-semibold">
                              🎉 Safe Standing! You can safely miss up to <strong>{statusStats.maxConsecutiveSkipsNow}</strong> consecutive classes.
                            </div>
                          ) : (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl px-4 py-2.5 text-xs font-semibold">
                              ⚠️ Warning! You are below 75%. You must attend the next <strong>{statusStats.classesToAttendNow}</strong> classes consecutively to recover.
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="glass-panel p-8 rounded-2xl text-center flex flex-col items-center justify-center max-w-sm mx-auto">
                        <Sparkles className="w-8 h-8 text-zinc-600 mb-2.5 animate-pulse" />
                        <span className="text-sm font-bold text-white mb-1">Baseline Awaiting</span>
                        <p className="text-xs text-zinc-500">
                          Please enter the total classes held and attended to activate the tracking calculators.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dashboard grid outputs (Ready state only) */}
                {statusStats.ready && (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="glass-panel p-4 rounded-xl space-y-1">
                      <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Secured Ratio</span>
                      <span className="text-base font-extrabold text-white">{statusStats.attended} / {statusStats.total}</span>
                      <p className="text-[9px] text-zinc-400">Attended classes out of held</p>
                    </div>
                    <div className="glass-panel p-4 rounded-xl space-y-1">
                      <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Allowed Skips Now</span>
                      <span className="text-base font-extrabold text-emerald-400">{statusStats.maxConsecutiveSkipsNow}</span>
                      <p className="text-[9px] text-zinc-400">Keep attendance &ge; 75%</p>
                    </div>
                    <div className="glass-panel p-4 rounded-xl space-y-1">
                      <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Margin from 75%</span>
                      <span className={`text-base font-extrabold ${statusStats.currentPercentage >= 75 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {statusStats.currentPercentage >= 75 ? '+' : ''}{(statusStats.currentPercentage - 75).toFixed(2)}%
                      </span>
                      <p className="text-[9px] text-zinc-400">Difference from base limit</p>
                    </div>
                    <div className="glass-panel p-4 rounded-xl space-y-1">
                      <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Target skips ({sharedBufferPercent}%)</span>
                      <span className="text-base font-extrabold text-indigo-400">
                        {targetStatusStats ? targetStatusStats.maxConsecutiveSkipsForTarget : 0}
                      </span>
                      <p className="text-[9px] text-zinc-400">Maximum skips allowed for buffer</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CLASSES LEFT PLANNER TAB */}
            {activeSubTab === 'left' && (
              <div className="space-y-4">
                <div className="glass-panel p-5 rounded-2xl space-y-4">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-extrabold block mb-1">Inputs</span>
                  <div>
                    <label className="text-[10px] text-zinc-400 font-bold block mb-1">Remaining Classes left in Syllabus</label>
                    <input
                      type="number"
                      value={attendanceClassesLeftMode.classesLeft}
                      onChange={(e) => setAttendanceClassesLeftMode(prev => ({ ...prev, classesLeft: e.target.value }))}
                      placeholder="e.g. 24"
                      className="w-full max-w-[200px] glass-input px-3 py-2 text-sm font-extrabold focus:outline-none"
                    />
                  </div>
                </div>

                {classesLeftPlan && statusStats.ready ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="glass-panel p-4 rounded-xl space-y-1 border-l-2 border-l-emerald-500/40">
                      <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Safe Misses (75%)</span>
                      <span className="text-lg font-black text-white">{classesLeftPlan.safeMisses75}</span>
                      <p className="text-[9px] text-zinc-400">You can safely skip this many from now</p>
                    </div>
                    <div className="glass-panel p-4 rounded-xl space-y-1 border-l-2 border-l-blue-500/40">
                      <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Must Attend (75%)</span>
                      <span className="text-lg font-black text-white">{classesLeftPlan.mustAttendFor75}</span>
                      <p className="text-[9px] text-zinc-400">Minimum classes you must sit in from now</p>
                    </div>
                    <div className="glass-panel p-4 rounded-xl space-y-1 border-l-2 border-l-indigo-500/40">
                      <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Target Skips ({sharedBufferPercent}%)</span>
                      <span className="text-lg font-black text-white">{classesLeftPlan.safeMissesBuffer}</span>
                      <p className="text-[9px] text-zinc-400">Skips allowed for custom safety target</p>
                    </div>
                    <div className="glass-panel p-4 rounded-xl space-y-1 border-l-2 border-l-purple-500/40">
                      <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Est. Final Span</span>
                      <span className="text-sm font-black text-white">{classesLeftPlan.worstFinalPercentage.toFixed(1)}% - {classesLeftPlan.bestFinalPercentage.toFixed(1)}%</span>
                      <p className="text-[9px] text-zinc-400">Best vs Worst potential outcomes</p>
                    </div>
                  </div>
                ) : (
                  <div className="glass-panel p-6 rounded-2xl text-center text-xs text-zinc-500">
                    {!statusStats.ready ? 'Complete the Overview baseline settings first.' : 'Enter remaining classes left above to compute results.'}
                  </div>
                )}
              </div>
            )}

            {/* SEMESTER PLANNER TAB */}
            {activeSubTab === 'semester' && (
              <div className="space-y-4">
                <div className="glass-panel p-5 rounded-2xl space-y-4">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-extrabold block mb-1">Inputs</span>
                  <div>
                    <label className="text-[10px] text-zinc-400 font-bold block mb-1">Total Classes Prescribed for the Whole Semester</label>
                    <input
                      type="number"
                      value={attendanceSemesterMode.semesterTotal}
                      onChange={(e) => setAttendanceSemesterMode(prev => ({ ...prev, semesterTotal: e.target.value }))}
                      placeholder="e.g. 90"
                      className="w-full max-w-[200px] glass-input px-3 py-2 text-sm font-extrabold focus:outline-none"
                    />
                  </div>
                </div>

                {semesterPlan?.invalid ? (
                  <div className="text-xs text-red-400 font-bold">
                    Semester total classes cannot be smaller than classes already held ({statusStats.total}).
                  </div>
                ) : semesterPlan && statusStats.ready ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="glass-panel p-5 rounded-xl space-y-1">
                      <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Semester Remaining Classes</span>
                      <span className="text-lg font-black text-white">{semesterPlan.classesLeft}</span>
                      <p className="text-[9px] text-zinc-400">Total lectures remaining this term</p>
                    </div>
                    <div className="glass-panel p-5 rounded-xl space-y-1">
                      <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Max Allowed Skips in Term</span>
                      <span className="text-lg font-black text-white">{semesterPlan.maxTotalMissesWhole75}</span>
                      <p className="text-[9px] text-zinc-400">Total skips allowed *across the whole semester* to stay &ge; 75%</p>
                    </div>
                    <div className="glass-panel p-5 rounded-xl space-y-1">
                      <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Skips Remaining From Now (75%)</span>
                      <span className="text-lg font-black text-emerald-400">{semesterPlan.safeMisses75}</span>
                      <p className="text-[9px] text-zinc-400">Skips you have left starting *from today*</p>
                    </div>
                  </div>
                ) : (
                  <div className="glass-panel p-6 rounded-2xl text-center text-xs text-zinc-500">
                    {!statusStats.ready ? 'Complete the Overview baseline settings first.' : 'Enter total semester classes above to compute results.'}
                  </div>
                )}
              </div>
            )}

            {/* WEEKLY PLANNER TAB */}
            {activeSubTab === 'weekly' && (
              <div className="space-y-4">
                <div className="glass-panel p-5 rounded-2xl space-y-4">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-extrabold block mb-1">Inputs</span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] text-zinc-400 font-bold block mb-1">Weeks Left</label>
                      <input
                        type="number"
                        value={attendanceWeeklyMode.weeksLeft}
                        onChange={(e) => setAttendanceWeeklyMode(prev => ({ ...prev, weeksLeft: e.target.value }))}
                        placeholder="e.g. 6"
                        className="w-full glass-input px-3 py-2 text-sm font-extrabold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-400 font-bold block mb-1">Min classes/week</label>
                      <input
                        type="number"
                        value={attendanceWeeklyMode.minPerWeek}
                        onChange={(e) => setAttendanceWeeklyMode(prev => ({ ...prev, minPerWeek: e.target.value }))}
                        placeholder="e.g. 4"
                        className="w-full glass-input px-3 py-2 text-sm font-extrabold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-400 font-bold block mb-1">Max classes/week</label>
                      <input
                        type="number"
                        value={attendanceWeeklyMode.maxPerWeek}
                        onChange={(e) => setAttendanceWeeklyMode(prev => ({ ...prev, maxPerWeek: e.target.value }))}
                        placeholder="e.g. 5"
                        className="w-full glass-input px-3 py-2 text-sm font-extrabold focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {weeklyPlan && statusStats.ready ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Minimum classes scenario */}
                    <div className="glass-panel p-5 rounded-2xl space-y-3 relative overflow-hidden border-t-2 border-t-indigo-500">
                      <div className="absolute top-0 right-0 p-3 opacity-5"><BookOpen className="w-12 h-12" /></div>
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Conservative (Min classes: {weeklyPlan.minPerWeek * weeklyPlan.weeksLeft} total)</span>
                      
                      <div className="grid grid-cols-2 gap-2 text-center pt-2">
                        <div className="bg-black/30 p-2.5 rounded-xl">
                          <span className="text-[9px] text-zinc-500 font-bold block">Safe Skips</span>
                          <span className="text-base font-extrabold text-white">{weeklyPlan.minPlan?.safeMisses75}</span>
                        </div>
                        <div className="bg-black/30 p-2.5 rounded-xl">
                          <span className="text-[9px] text-zinc-500 font-bold block">Must Attend</span>
                          <span className="text-base font-extrabold text-white">{weeklyPlan.minPlan?.mustAttendFor75}</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-zinc-500 text-center">
                        Slightly shorter term. Est. final range: {weeklyPlan.minPlan?.worstFinalPercentage.toFixed(1)}% to {weeklyPlan.minPlan?.bestFinalPercentage.toFixed(1)}%
                      </p>
                    </div>

                    {/* Maximum classes scenario */}
                    <div className="glass-panel p-5 rounded-2xl space-y-3 relative overflow-hidden border-t-2 border-t-purple-500">
                      <div className="absolute top-0 right-0 p-3 opacity-5"><BookOpen className="w-12 h-12" /></div>
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Aggressive (Max classes: {weeklyPlan.maxPerWeek * weeklyPlan.weeksLeft} total)</span>
                      
                      <div className="grid grid-cols-2 gap-2 text-center pt-2">
                        <div className="bg-black/30 p-2.5 rounded-xl">
                          <span className="text-[9px] text-zinc-500 font-bold block">Safe Skips</span>
                          <span className="text-base font-extrabold text-white">{weeklyPlan.maxPlan?.safeMisses75}</span>
                        </div>
                        <div className="bg-black/30 p-2.5 rounded-xl">
                          <span className="text-[9px] text-zinc-500 font-bold block">Must Attend</span>
                          <span className="text-base font-extrabold text-white">{weeklyPlan.maxPlan?.mustAttendFor75}</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-zinc-500 text-center">
                        Heavier lecture density. Est. final range: {weeklyPlan.maxPlan?.worstFinalPercentage.toFixed(1)}% to {weeklyPlan.maxPlan?.bestFinalPercentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="glass-panel p-6 rounded-2xl text-center text-xs text-zinc-500">
                    {!statusStats.ready ? 'Complete the Overview baseline settings first.' : 'Enter weekly variables above to compute results.'}
                  </div>
                )}
              </div>
            )}

            {/* PLANNED MISSES TAB */}
            {activeSubTab === 'miss' && (
              <div className="space-y-4">
                <div className="glass-panel p-5 rounded-2xl space-y-4">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-extrabold block mb-1">Inputs</span>
                  <div>
                    <label className="text-[10px] text-zinc-400 font-bold block mb-1">Number of planned classes you intend to skip</label>
                    <input
                      type="number"
                      value={attendanceMissPlannerMode.misses}
                      onChange={(e) => setAttendanceMissPlannerMode(prev => ({ ...prev, misses: e.target.value }))}
                      placeholder="e.g. 5"
                      className="w-full max-w-[200px] glass-input px-3 py-2 text-sm font-extrabold focus:outline-none"
                    />
                  </div>
                </div>

                {missImpactPlan && statusStats.ready ? (
                  <div className="glass-panel p-5 rounded-2xl space-y-4 relative overflow-hidden border-l-4 border-l-indigo-500">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white">Impact Analysis</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        missImpactPlan.isBelowAfterMisses 
                          ? 'bg-red-500/10 text-red-400' 
                          : 'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {missImpactPlan.isBelowAfterMisses ? 'DANGER: Drop below 75%' : 'STILL SAFE'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
                      <div className="bg-black/30 p-3 rounded-xl">
                        <span className="text-[9px] text-zinc-500 font-bold block">Current Attendance</span>
                        <span className="text-lg font-black text-white">{statusStats.currentPercentage.toFixed(1)}%</span>
                      </div>
                      <div className="bg-black/30 p-3 rounded-xl">
                        <span className="text-[9px] text-zinc-500 font-bold block">Attendance After Misses</span>
                        <span className={`text-lg font-black ${
                          missImpactPlan.isBelowAfterMisses ? 'text-red-400' : 'text-emerald-400'
                        }`}>
                          {missImpactPlan.attendanceAfterPlannedMisses.toFixed(1)}%
                        </span>
                      </div>
                      <div className="bg-black/30 p-3 rounded-xl col-span-2 sm:col-span-1">
                        <span className="text-[9px] text-zinc-500 font-bold block">Recovery Classes Needed</span>
                        <span className="text-lg font-black text-white">{missImpactPlan.classesToRecoverAfterMisses}</span>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-400">
                      {missImpactPlan.isBelowAfterMisses 
                        ? `⚠️ Skpping ${missImpactPlan.plannedMisses} classes will drop your attendance to ${missImpactPlan.attendanceAfterPlannedMisses.toFixed(1)}%. You will need to sit through ${missImpactPlan.classesToRecoverAfterMisses} consecutive classes with zero absences to get back above the 75% limit!` 
                        : `✅ You can afford these skips. Your attendance will sit at ${missImpactPlan.attendanceAfterPlannedMisses.toFixed(1)}%, which safely clears the 75% threshold.`
                      }
                    </p>
                  </div>
                ) : (
                  <div className="glass-panel p-6 rounded-2xl text-center text-xs text-zinc-500">
                    {!statusStats.ready ? 'Complete the Overview baseline settings first.' : 'Enter planned skips above to compute results.'}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
