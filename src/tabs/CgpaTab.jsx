import React, { useState, useEffect } from 'react';
import {
  Info, Trash2, ChevronDown, Target, AlertTriangle, CheckCircle2
} from 'lucide-react';

export default function CgpaTab({
  themeClasses,
  semesterData,
  updateSemester,
  resetCGPA,
  simpleCgpa,
  setSimpleCgpa
}) {
  const [targetCgpa, setTargetCgpa] = useState(() => {
    const saved = localStorage.getItem('pes_cgpa_target');
    return saved ? parseFloat(saved) : 8.5;
  });

  const [excludedSemesters, setExcludedSemesters] = useState(() => {
    const saved = localStorage.getItem('pes_cgpa_excluded_sems');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('pes_cgpa_target', targetCgpa.toString());
  }, [targetCgpa]);

  useEffect(() => {
    localStorage.setItem('pes_cgpa_excluded_sems', JSON.stringify(excludedSemesters));
  }, [excludedSemesters]);

  // --- Calculations for Reverse CGPA Calculator ---
  const completedSems = semesterData.filter(s => s.sgpa && s.credits);
  const totalCompletedCredits = completedSems.reduce((sum, s) => sum + parseFloat(s.credits), 0);
  const totalCompletedPoints = completedSems.reduce((sum, s) => sum + (parseFloat(s.sgpa) * parseFloat(s.credits)), 0);
  const currentCgpa = totalCompletedCredits > 0 ? totalCompletedPoints / totalCompletedCredits : 0;

  const processedSemesters = semesterData.map(sem => {
    const isCompleted = sem.sgpa !== '' && sem.credits !== '';
    let credits = parseFloat(sem.credits);
    if (isNaN(credits) || sem.credits === '') {
      if (sem.id === 7) {
        credits = 6;
      } else if (sem.id === 8) {
        credits = 10;
      } else {
        credits = 24;
      }
    }
    return {
      ...sem,
      isCompleted,
      credits,
    };
  });

  const futureActiveSems = processedSemesters.filter(sem => !sem.isCompleted && !excludedSemesters[sem.id]);
  const totalFutureCredits = futureActiveSems.reduce((sum, s) => sum + s.credits, 0);
  const totalCreditsPlanned = totalCompletedCredits + totalFutureCredits;

  let requiredAverageSgpa = null;
  let maxAchievableCgpa = 10.0;

  if (totalFutureCredits > 0) {
    const targetTotalPoints = targetCgpa * totalCreditsPlanned;
    const requiredFuturePoints = targetTotalPoints - totalCompletedPoints;
    requiredAverageSgpa = requiredFuturePoints / totalFutureCredits;
    
    const maxFuturePoints = 10.0 * totalFutureCredits;
    maxAchievableCgpa = totalCreditsPlanned > 0 
      ? (totalCompletedPoints + maxFuturePoints) / totalCreditsPlanned 
      : 10.0;
  }

  // Calculate max achievable CGPA until Sem 6 (for placement readiness)
  const uncompletedSem1to6 = processedSemesters.filter(sem => sem.id <= 6 && !sem.isCompleted);
  const showMax6 = uncompletedSem1to6.length > 0;
  let maxAchievableCgpa6 = null;

  if (showMax6) {
    const sems1to6 = processedSemesters.filter(sem => sem.id <= 6);
    const totalCredits6 = sems1to6.reduce((sum, s) => sum + s.credits, 0);
    const totalPoints6Max = sems1to6.reduce((sum, s) => {
      if (s.isCompleted) {
        return sum + (parseFloat(s.sgpa) * s.credits);
      } else {
        return sum + (10.0 * s.credits);
      }
    }, 0);
    
    if (totalCredits6 > 0) {
      maxAchievableCgpa6 = totalPoints6Max / totalCredits6;
    }
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">

      {/* Header & Result Card */}
      <div className={`${themeClasses.card} p-6 rounded-2xl shadow-2xl border ${themeClasses.border} text-center relative overflow-hidden`}>
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-teal-400 via-blue-500 to-violet-500"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-20 bg-teal-500/[0.06] blur-[40px] pointer-events-none"></div>

        <h2 className={`text-sm font-bold uppercase tracking-wider ${themeClasses.muted} mb-2`}>Cumulative GPA</h2>

        <div className="flex items-center justify-center gap-1">
          <span className="text-5xl md:text-6xl font-black text-teal-400">
            {(() => {
              const filledSems = semesterData.filter(s => s.sgpa && s.credits);
              if (filledSems.length === 0) return "0.00";

              const totalPoints = filledSems.reduce((sum, s) => sum + (parseFloat(s.sgpa) * parseFloat(s.credits)), 0);
              const totalCredits = filledSems.reduce((sum, s) => sum + parseFloat(s.credits), 0);

              return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";
            })()}
          </span>
        </div>

        <p className={`text-xs ${themeClasses.muted} mt-2`}>
          Based on {semesterData.filter(s => s.sgpa && s.credits).length} semesters of data
        </p>
      </div>

      {/* Helper Info */}
      <div className="flex items-center gap-2 text-xs opacity-70 px-2">
        <Info className="w-4 h-4" />
        <span>Enter SGPA and Credits for completed semesters. Leave future ones blank.</span>
      </div>

      {/* Semesters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {semesterData.map((sem) => (
          <div
            key={sem.id}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${(sem.sgpa && sem.credits)
              ? `${themeClasses.card} border-teal-500/30 shadow-sm`
              : 'bg-white/[0.03] border-transparent opacity-75 hover:opacity-100'
              }`}
          >
            {/* Semester Label */}
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm ${(sem.sgpa && sem.credits)
              ? 'bg-teal-500/10 text-teal-300'
              : 'bg-white/[0.06] text-zinc-500'
              }`}>
              S{sem.id}
            </div>

            {/* Inputs */}
            <div className="flex-1 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold opacity-50 mb-1 ml-1">SGPA</label>
                <input
                  type="number"
                  value={sem.sgpa}
                  onChange={(e) => updateSemester(sem.id, 'sgpa', e.target.value)}
                  placeholder="-"
                  className={`w-full p-2 text-sm font-bold text-center border rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none ${themeClasses.input}`}
                  min="0" max="10" step="0.01"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold opacity-50 mb-1 ml-1">Credits</label>
                <input
                  type="number"
                  value={sem.credits}
                  onChange={(e) => updateSemester(sem.id, 'credits', e.target.value)}
                  placeholder="-"
                  className={`w-full p-2 text-sm text-center border rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none ${themeClasses.input}`}
                  min="0" max="30"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-end pt-4">
        <button
          onClick={resetCGPA}
          className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" /> Clear History
        </button>
      </div>

      {/* ==================== CGPA TARGET PLANNER (Reverse Calculator) ==================== */}
      <div className={`${themeClasses.card} border rounded-xl overflow-hidden mt-6 relative`}>
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        <details className="group">
          <summary className="flex items-center justify-between p-4 cursor-pointer list-none select-none hover:bg-white/[0.03] transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center shadow-sm">
                <Target className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-zinc-200">CGPA Target Planner (Reverse Calc)</h3>
                  <span className={`text-[10px] ${themeClasses.muted} font-normal px-1.5 rounded bg-white/[0.04] border`}>Reverse</span>
                </div>
                <p className={`text-xs ${themeClasses.muted} mt-0.5`}>
                  Find what SGPA you need in future semesters to reach your target CGPA
                </p>
              </div>
            </div>
            <ChevronDown className="w-5 h-5 opacity-50 transition-transform group-open:rotate-180" />
          </summary>

          <div className={`p-4 border-t ${themeClasses.border} bg-black/20 space-y-6 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/[0.04] blur-[40px] pointer-events-none"></div>

            {/* Input for Desired CGPA and Credit Instruction */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white/[0.02] p-4 rounded-xl border border-white/[0.04] flex flex-col justify-center">
                <label className="text-xs text-zinc-400 font-bold mb-2 block uppercase tracking-wider">Desired Target CGPA</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max="10"
                    step="0.05"
                    value={targetCgpa}
                    onChange={(e) => {
                      let val = parseFloat(e.target.value);
                      if (isNaN(val)) val = '';
                      setTargetCgpa(val);
                    }}
                    className={`w-28 p-2 text-xl font-black text-center border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none ${themeClasses.input}`}
                  />
                  <div className="flex-1">
                    <input
                      type="range"
                      min="4.0"
                      max="10.0"
                      step="0.1"
                      value={targetCgpa || 8.5}
                      onChange={(e) => setTargetCgpa(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                    <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                      <span>4.0</span>
                      <span>7.0</span>
                      <span>8.5</span>
                      <span>10.0</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-950/20 border-l-4 border-blue-500/35 p-4 rounded-r-xl flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-300 leading-relaxed">
                  <span className="font-bold block mb-1">Set Your Credits First!</span>
                  Set the number of credits you need for future semesters in the semesters grid above. The calculator uses these credits to weight your target SGPA correctly.
                </div>
              </div>
            </div>

            {/* Calculation Outputs */}
            {(() => {
              if (completedSems.length === 0) {
                return (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-300">
                      <span className="font-bold block mb-1">Starting Fresh</span>
                      Enter your SGPA and Credits in the grid above for completed semesters. Currently assuming you are starting fresh with {totalFutureCredits} credits.
                    </div>
                  </div>
                );
              }

              if (totalFutureCredits === 0) {
                if (completedSems.length === 8) {
                  return (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <div className="text-sm text-emerald-300">
                        <span className="font-bold block mb-1">All Semesters Completed!</span>
                        You have entered data for all 8 semesters. Your final cumulative GPA is <strong className="text-emerald-400 text-lg">{currentCgpa.toFixed(2)}</strong>.
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-300">
                      <span className="font-bold block mb-1">No Active Future Semesters</span>
                      There are no future semesters included in the calculation. Ensure you have empty semesters in the grid above and at least one is checked in the checklist below.
                    </div>
                  </div>
                );
              }

              const isImpossible = requiredAverageSgpa > 10.0;
              const isTooEasy = requiredAverageSgpa < 0;
              const roundedReqSgpa = isTooEasy ? "0.00" : requiredAverageSgpa.toFixed(2);

              const completedPercent = Math.min(100, (totalCompletedCredits / 160) * 100);
              const futurePercent = Math.min(100 - completedPercent, (totalFutureCredits / 160) * 100);

              return (
                <div className="space-y-6">
                  {/* Giant Target Card */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    
                    {/* Result Block */}
                    <div className={`p-4 rounded-xl border flex flex-col justify-between ${
                      isImpossible ? 'bg-red-950/20 border-red-500/30' :
                      parseFloat(roundedReqSgpa) > 9.0 ? 'bg-orange-950/20 border-orange-500/30' :
                      'bg-emerald-950/20 border-emerald-500/30'
                    }`}>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Required Avg SGPA</span>
                        <div className={`text-3xl font-black mt-1 ${
                          isImpossible ? 'text-red-400' :
                          parseFloat(roundedReqSgpa) > 9.0 ? 'text-orange-400' :
                          'text-emerald-400'
                        }`}>
                          {isImpossible ? "Impossible" : roundedReqSgpa}
                        </div>
                      </div>
                      <div className="text-[10px] opacity-70 mt-2">
                        {isImpossible 
                          ? "Target exceeds max achievable" 
                          : `Average needed in each of the ${futureActiveSems.length} active semesters`
                        }
                      </div>
                    </div>

                    {/* Max Achievable Block */}
                    <div className="bg-white/[0.02] p-4 rounded-xl border border-white/[0.04] flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Max Achievable CGPA</span>
                        <div className="text-3xl font-black text-blue-400 mt-1">
                          {maxAchievableCgpa.toFixed(2)}
                        </div>
                        {showMax6 && maxAchievableCgpa6 !== null && (
                          <div className="mt-2 pt-2 border-t border-white/[0.04] flex justify-between items-center">
                            <span className="text-[10px] font-bold opacity-60 uppercase">Max by Sem 6</span>
                            <span className="text-xs font-extrabold text-indigo-400">{maxAchievableCgpa6.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-[10px] opacity-70 mt-2">
                        Assuming a perfect 10.0 SGPA in all remaining active semesters
                      </div>
                    </div>

                    {/* Credits Info Block */}
                    <div className="bg-white/[0.02] p-4 rounded-xl border border-white/[0.04] flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Credits Breakdown</span>
                        <div className="text-sm font-bold text-zinc-300 mt-2 flex justify-between gap-1">
                          <span>Done: <strong className="text-zinc-100">{totalCompletedCredits}</strong></span>
                          <span>Plan: <strong className="text-zinc-100">{totalFutureCredits}</strong></span>
                          <span>Total: <strong className="text-zinc-100">{totalCreditsPlanned}</strong></span>
                        </div>
                      </div>
                      <div className="text-[10px] opacity-70 mt-2">
                        Default credits: 24 Cr (except Sem 7: 6 Cr, Sem 8: 10 Cr)
                      </div>
                    </div>
                  </div>

                  {/* Degree Graduation Progress */}
                  <div className="bg-white/[0.02] p-4 rounded-xl border border-white/[0.04]">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-1">
                      <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Degree Graduation Progress</span>
                      <span className="text-xs text-zinc-400">
                        <strong>{totalCompletedCredits}</strong> completed + <strong>{totalFutureCredits}</strong> planned = <strong className={totalCreditsPlanned >= 160 ? "text-emerald-400" : "text-amber-400"}>{totalCreditsPlanned}</strong> / 160 credits
                      </span>
                    </div>
                    
                    <div className="w-full h-3 bg-zinc-900 rounded-full overflow-hidden flex border border-white/[0.04] p-0.5">
                      <div 
                        style={{ width: `${completedPercent}%` }} 
                        className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                        title={`${totalCompletedCredits} completed credits`}
                      />
                      <div 
                        style={{ width: `${futurePercent}%` }} 
                        className="bg-indigo-400/40 h-full rounded-full transition-all duration-500 border-l border-dashed border-indigo-400/30"
                        title={`${totalFutureCredits} planned credits`}
                      />
                    </div>

                    {totalCreditsPlanned < 160 && (
                      <div className="text-[10px] text-amber-400/80 mt-1.5 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>Your current plan has {160 - totalCreditsPlanned} credits less than the 160 credit requirement to graduate. Add more semesters or increase credits.</span>
                      </div>
                    )}
                    {totalCreditsPlanned >= 160 && totalCompletedCredits < 160 && (
                      <div className="text-[10px] text-emerald-400/80 mt-1.5 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>On track! Your plan satisfies the 160 credits requirement for graduation.</span>
                      </div>
                    )}
                    {totalCompletedCredits >= 160 && (
                      <div className="text-[10px] text-emerald-400 font-bold mt-1.5 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>Graduation requirement achieved! You have completed all 160 required credits.</span>
                      </div>
                    )}
                  </div>

                  {/* Status Alert Banners */}
                  {isImpossible && (
                    <div className="bg-red-500/15 border border-red-500/20 rounded-xl p-3 flex items-start gap-2.5">
                      <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                      <div className="text-xs text-red-300 leading-normal">
                        <strong className="block mb-0.5 text-red-400">Target CGPA ({parseFloat(targetCgpa).toFixed(2)}) is unreachable</strong>
                        Even with a 10.00 SGPA in all remaining semesters, the highest CGPA you can achieve is <strong>{maxAchievableCgpa.toFixed(2)}</strong>. Please adjust your target CGPA or activate more future semesters to distribute the load.
                      </div>
                    </div>
                  )}

                  {!isImpossible && parseFloat(roundedReqSgpa) > 9.0 && (
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 flex items-start gap-2.5">
                      <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                      <div className="text-xs text-orange-300 leading-normal">
                        <strong className="block mb-0.5 text-orange-400">High SGPA required ({roundedReqSgpa})</strong>
                        To achieve your target CGPA, you will need to perform exceptionally well. You can toggle on more semesters (like Semesters 7 & 8) to reduce the required average SGPA per semester.
                      </div>
                    </div>
                  )}

                  {!isImpossible && !isTooEasy && parseFloat(roundedReqSgpa) <= 9.0 && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-start gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <div className="text-xs text-emerald-300 leading-normal">
                        <strong className="block mb-0.5 text-emerald-400">Very Achievable Target!</strong>
                        You need to maintain an average of <strong>{roundedReqSgpa}</strong> SGPA in your active remaining semesters to reach your target CGPA of <strong>{parseFloat(targetCgpa).toFixed(2)}</strong>.
                      </div>
                    </div>
                  )}

                  {isTooEasy && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-start gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <div className="text-xs text-emerald-300 leading-normal">
                        <strong className="block mb-0.5 text-emerald-400">Target Already Met!</strong>
                        Your current CGPA is <strong>{currentCgpa.toFixed(2)}</strong>, which is already above your target of <strong>{parseFloat(targetCgpa).toFixed(2)}</strong>. You can easily maintain this!
                      </div>
                    </div>
                  )}

                  {/* Semesters Checklist grid */}
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Remaining Semesters Schedule</h4>
                      <span className="text-[10px] text-zinc-500 italic">Sem 7 & 8 default to 6 & 10 credits respectively. Toggle any semester off if needed.</span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {processedSemesters.filter(sem => !sem.isCompleted).map((sem) => {
                        const isExcluded = !!excludedSemesters[sem.id];
                        return (
                          <div
                            key={sem.id}
                            onClick={() => {
                              setExcludedSemesters(prev => ({
                                ...prev,
                                [sem.id]: !prev[sem.id]
                              }));
                            }}
                            className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                              isExcluded
                                ? 'bg-white/[0.01] border-white/[0.04] opacity-50 hover:opacity-75'
                                : 'bg-[#0e0e18] border-indigo-500/20 shadow-md hover:border-indigo-500/40'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={!isExcluded}
                                onChange={() => {}} // handled by parent div onClick
                                className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-zinc-900 pointer-events-none"
                              />
                              <div>
                                <div className="text-sm font-bold text-zinc-200">Semester {sem.id}</div>
                                <div className="text-[10px] text-zinc-500">Credits: <strong className="text-zinc-400">{sem.credits}</strong></div>
                              </div>
                            </div>

                            {!isExcluded && (
                              <div className="text-right">
                                <div className="text-[9px] uppercase tracking-wider text-zinc-500">Target SGPA</div>
                                <div className={`text-sm font-black ${
                                  isImpossible ? 'text-red-400' :
                                  parseFloat(roundedReqSgpa) > 9.0 ? 'text-orange-400' :
                                  'text-emerald-400'
                                }`}>
                                  {isImpossible ? "✗" : roundedReqSgpa}
                                </div>
                              </div>
                            )}
                            {isExcluded && (
                              <span className="text-xs text-zinc-500 font-medium italic">Excluded</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tip */}
                  <div className="text-xs text-zinc-400 bg-white/[0.01] border border-white/[0.04] rounded-xl p-3 leading-relaxed">
                    💡 <strong>Tip:</strong> Want to aim for different SGPAs in different semesters? Just enter a predicted SGPA for any semester in the grid above. The calculator will automatically adjust the required SGPA for the remaining unfilled semesters!
                  </div>

                </div>
              );
            })()}
          </div>
        </details>
      </div>

      {/* Disclaimer */}
      <div className="text-center text-[10px] opacity-40 mt-8">
        Calculated using: Σ (SGPA × Credits) / Σ Credits
      </div>

      {/* ==================== QUICK PREVIOUS CGPA CALCULATOR (Fully Manual) ==================== */}
      <div className={`${themeClasses.card} border rounded-xl overflow-hidden mt-6`}>
        <details className="group">
          <summary className="flex items-center justify-between p-4 cursor-pointer list-none select-none hover:bg-white/[0.03] transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center shadow-sm">
                <span className="text-lg">⚡</span>
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-zinc-200">Quick CGPA Estimator</h3>
                  <span className={`text-[10px] ${themeClasses.muted} font-normal px-1.5 rounded bg-white/[0.04] border`}>Isolated</span>
                </div>
                <p className={`text-xs ${themeClasses.muted} mt-0.5`}>
                  Calculate new CGPA by combining previous history + current sem results
                </p>
              </div>
            </div>
            <ChevronDown className="w-5 h-5 opacity-50 transition-transform group-open:rotate-180" />
          </summary>

          <div className={`p-4 border-t ${themeClasses.border} bg-black/20`}>

            {/* Row 1: Previous Stats */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className={`text-xs ${themeClasses.muted} block mb-1 font-bold`}>Previous CGPA</label>
                <input
                  type="number"
                  placeholder="e.g. 8.5"
                  value={simpleCgpa.prevCgpa}
                  onChange={(e) => setSimpleCgpa(prev => ({ ...prev, prevCgpa: e.target.value }))}
                  className={`w-full p-2 border rounded-lg text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none ${themeClasses.input}`}
                />
              </div>
              <div>
                <label className={`text-xs ${themeClasses.muted} block mb-1 font-bold`}>Prev Credits</label>
                <input
                  type="number"
                  placeholder="e.g. 80"
                  value={simpleCgpa.prevCredits}
                  onChange={(e) => setSimpleCgpa(prev => ({ ...prev, prevCredits: e.target.value }))}
                  className={`w-full p-2 border rounded-lg text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none ${themeClasses.input}`}
                />
              </div>
            </div>

            {/* Row 2: Current Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className={`text-xs ${themeClasses.muted} block mb-1 font-bold text-teal-400`}>Current Sem SGPA</label>
                <input
                  type="number"
                  placeholder="e.g. 9.2"
                  value={simpleCgpa.currSgpa}
                  onChange={(e) => setSimpleCgpa(prev => ({ ...prev, currSgpa: e.target.value }))}
                  className={`w-full p-2 border rounded-lg text-sm font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none ${themeClasses.input} border-teal-500/20 bg-teal-500/5`}
                />
              </div>
              <div>
                <label className={`text-xs ${themeClasses.muted} block mb-1 font-bold text-teal-400`}>Sem Credits</label>
                <input
                  type="number"
                  placeholder="e.g. 24"
                  value={simpleCgpa.currCredits}
                  onChange={(e) => setSimpleCgpa(prev => ({ ...prev, currCredits: e.target.value }))}
                  className={`w-full p-2 border rounded-lg text-sm font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none ${themeClasses.input} border-teal-500/20 bg-teal-500/5`}
                />
              </div>
            </div>

            {/* Calculation Result */}
            <div className="bg-[#0e0e18] rounded-lg p-3 border shadow-sm flex items-center justify-between">
              {(() => {
                const pCgpa = parseFloat(simpleCgpa.prevCgpa) || 0;
                const pCreds = parseFloat(simpleCgpa.prevCredits) || 0;
                const cSgpa = parseFloat(simpleCgpa.currSgpa) || 0;
                const cCreds = parseFloat(simpleCgpa.currCredits) || 0;

                let newCGPA = "0.00";
                if (pCreds + cCreds > 0) {
                  const totalPoints = (pCgpa * pCreds) + (cSgpa * cCreds);
                  const totalCreds = pCreds + cCreds;
                  newCGPA = (totalPoints / totalCreds).toFixed(2);
                }

                return (
                  <>
                    <div className="text-xs opacity-70">
                      <div>Total Credits: <strong>{pCreds + cCreds}</strong></div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold opacity-50">Predicted CGPA</div>
                      <div className="text-3xl font-black text-indigo-400">{newCGPA}</div>
                    </div>
                  </>
                );
              })()}
            </div>

          </div>
        </details>
      </div>

    </div>
  );
}
