import React from 'react';
import {
  Target, AlertTriangle, ChevronDown, Lock, Unlock,
  Dice5, Scale, HelpCircle, AlertCircle, CheckCircle2,
  Calculator, Zap, Lightbulb
} from 'lucide-react';

export default function ReverseTab({
  themeClasses,
  subjects,
  marks,
  lockedSubjects,
  setLockedSubjects,
  reverseTargetSgpa,
  setReverseTargetSgpa,
  reverseEsaMode,
  setReverseEsaMode,
  shuffledResults,
  setShuffledResults,
  reverseResults,
  minimumPassingTable,
  calculateRandomPath,
  calculateBalancedPath,
  setActiveTab,
  getSubjectMetrics,
  getRequiredESAForGrade,
  getRequiredISA2ForGrade,
  GradeMap
}) {
  return (
    <div className="space-y-4">
      <div className="bg-[#0c0c14]/90 backdrop-blur-sm border border-emerald-500/10 rounded-xl shadow-2xl shadow-black/20 p-4 text-zinc-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/[0.07] blur-[60px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/[0.04] blur-[50px] rounded-full pointer-events-none"></div>
        <h2 className="text-lg font-bold flex items-center gap-2 mb-2">
          <Target className="w-5 h-5" /> Reverse Calculator
        </h2>

        {/* ESA Marks Detected Warning (Collapsible) */}
        {subjects.some(sub => (marks[sub.id]?.esa && parseFloat(marks[sub.id]?.esa) > 0)) && (
          <div className="rounded-xl border border-amber-200 bg-amber-500/10 border-amber-500/20 overflow-hidden mb-6">
            <details className="group">
              <summary className="flex items-center justify-between p-4 cursor-pointer list-none select-none hover:bg-amber-500/10 hover:bg-amber-500/15 transition-colors">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                  <h4 className="font-bold text-sm text-amber-300">
                    ESA Marks Detected (Subject Locked)
                  </h4>
                </div>
                <ChevronDown className="w-5 h-5 text-amber-400 opacity-70 transition-transform group-open:rotate-180" />
              </summary>

              <div className="px-4 pb-4 pt-0">
                <div className="text-xs text-amber-400 mt-1 space-y-2 border-t border-amber-500/20 pt-3">
                  <p>
                    You have entered ESA marks for some subjects. These subjects will be treated as <strong>Fixed/Locked</strong> and will NOT be reverse-calculated.
                  </p>
                  <p>
                    If you want to <strong>predict</strong> marks for a specific subject, please go back and <strong>clear its ESA score</strong>.
                  </p>
                  <button
                    onClick={() => setActiveTab('subjects')}
                    className="mt-2 text-xs bg-amber-600 hover:bg-amber-700 text-zinc-200 px-3 py-1.5 rounded-lg font-bold transition-colors"
                  >
                    Manage Subjects
                  </button>
                </div>
              </div>
            </details>
          </div>
        )}

        {/* Description */}
        <p className="text-emerald-100 text-sm mb-4 leading-relaxed">
          Set your desired SGPA and see exactly what you need to score in each ESA. Lock subjects where you're confident about your score.
        </p>

        {/* Controls: Input & Buttons */}
        <div className="flex flex-col gap-3 mb-4">
          <div className="flex items-center gap-3 bg-white/[0.08] px-3 py-2 rounded-lg w-full sm:w-auto">
            <label className="text-sm font-semibold whitespace-nowrap">I want SGPA: </label>
            <input
              type="number"
              step="0.1"
              min="5"
              max="10"
              value={reverseTargetSgpa}
              onChange={(e) => {
                const val = e.target.value;
                setReverseTargetSgpa(val === '' ? '' : parseFloat(val));
              }}
              className="w-full bg-white/[0.08] border border-white/[0.12] rounded-lg px-2 py-1 text-zinc-200 font-bold text-center text-lg focus:outline-none focus:border-white"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex items-center gap-2 bg-white/[0.08] px-3 py-2 rounded-lg w-full sm:w-auto">
              <span className="text-[10px] text-zinc-400 uppercase font-bold">ESA Mode</span>
              <div className="flex bg-white/[0.06] rounded-lg p-1">
                <button
                  onClick={() => setReverseEsaMode('safe')}
                  className={`px-2 py-1 text-[10px] font-bold rounded ${reverseEsaMode === 'safe'
                    ? 'bg-white/[0.15] text-zinc-200'
                    : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                >
                  Safe
                </button>
                <button
                  onClick={() => setReverseEsaMode('min')}
                  className={`px-2 py-1 text-[10px] font-bold rounded ${reverseEsaMode === 'min'
                    ? 'bg-white/[0.15] text-zinc-200'
                    : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                >
                  Min
                </button>
              </div>
            </div>
            <span className="text-[10px] text-zinc-500">Min relies on rounding luck.</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShuffledResults(calculateRandomPath())}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-zinc-200 p-2 rounded-lg transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 text-xs font-bold"
              title="Shuffle: Find a different combination of grades"
            >
              <Dice5 className="w-4 h-4" /> Shuffle
            </button>

            <button
              onClick={() => setShuffledResults(calculateBalancedPath())}
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-zinc-200 p-2 rounded-lg transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 text-xs font-bold"
              title="Balanced: Keeps scores even across subjects"
            >
              <Scale className="w-4 h-4" /> Balanced
            </button>

            {shuffledResults && (
              <button
                onClick={() => setShuffledResults(null)}
                className="px-3 text-xs text-zinc-200/70 hover:text-zinc-200 underline"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Blue Help Box */}
        <div className="bg-blue-900/30 border-l-4 border-blue-400 rounded-r shadow-md">
          <details className="group p-3">
            <summary className="flex items-center gap-2 cursor-pointer list-none text-sm font-bold text-blue-100 select-none">
              <HelpCircle className="w-5 h-5 text-blue-400" />
              <span>Why are some scores high/low?(and fix)</span>
              <ChevronDown className="w-4 h-4 ml-auto opacity-70 transition-transform group-open:rotate-180" />
            </summary>
            <div className="mt-3 text-sm text-blue-100 space-y-2 border-t border-blue-400/30 pt-2">
              <p className="opacity-80">
                This calculator finds the <strong>absolute cheapest path</strong>.
                It prioritizes subjects where you need fewer marks to jump a grade, even if that means pushing a score to 98 or 99.
              </p>
              <p className="text-yellow-300 font-bold text-xs">
                💡 Fix: If a score is unrealistically high/low, click the <Lock className="w-3 h-3 inline" /> icon
                to set a limit (e.g., 85 that you are confident that you will score at least that much).
                The app will recalculate the rest!
              </p>
              <p className="font-medium text-zinc-200/90 text-xs">
                Alternatively you can Click <span className="font-bold text-zinc-200">Balanced</span> for a realistic, balanced path.
              </p>
              <p className="font-medium text-zinc-200/90 text-xs">
                Scores look unrealistic? Click <span className="font-bold text-zinc-200">Shuffle</span> for a different path. Click <span className="font-bold text-zinc-200">Reset</span> to go back to the most efficient way.
              </p>
            </div>
          </details>
        </div>

        {!reverseResults.isTargetAchievable && (
          <div className="flex items-center gap-2 bg-red-500/30 px-3 py-2 rounded-lg text-sm mt-3 border border-red-500/30">
            <AlertCircle className="w-4 h-4" />
            <span>Max achievable: <strong>{reverseResults.achievableSGPA}</strong></span>
          </div>
        )}
      </div>

      {/* Subject List - COMPACT ROW LAYOUT */}
      <div className="space-y-2">
        {(shuffledResults || reverseResults.results).map((sub, i) => {
          const baseSubject = subjects.find(s => s.id === sub.id);
          const baseMetrics = baseSubject ? getSubjectMetrics(baseSubject) : null;
          const m = marks[sub.id] || {};
          const hasEsa = m.esa !== '' && m.esa !== undefined && !isNaN(parseFloat(m.esa));
          const isManualLock = lockedSubjects[sub.id] !== undefined && !sub.isHardLocked;

          const isa2Label = baseSubject?.customConfig?.labels?.isa2 || 'ISA 2';
          const assignmentLabel = baseSubject?.customConfig?.labels?.assignment || 'Assignment';
          const assignmentLabelShort = assignmentLabel === 'Assignment' ? 'Asg' : assignmentLabel;
          const labLabel = baseSubject?.customConfig?.labels?.lab || 'Lab';

          const assumptions = [];
          if (!hasEsa && !isManualLock) assumptions.push('ESA est');
          if (baseMetrics?.momentumIsa2Marks !== null) assumptions.push(`${isa2Label} proj`);
          if (baseMetrics?.momentumAssignmentMarks !== null) assumptions.push(`${assignmentLabelShort} full`);
          if (baseMetrics?.momentumLabMarks !== null) assumptions.push(`${labLabel} full`);

          const activeMap = baseSubject?.customGradeMap || GradeMap;
          const targetScore = sub.projectedScore ?? activeMap.find(g => g.grade === sub.projectedGrade)?.min ?? null;
          const esaInfo = baseSubject && targetScore !== null
            ? getRequiredESAForGrade(baseSubject, targetScore, true, { useMomentumIsa2: true, useMomentumInternals: true })
            : null;
          const isa2TargetInfo = baseSubject && targetScore !== null
            ? getRequiredISA2ForGrade(baseSubject, targetScore, { assumeFullForEmptyInternals: true })
            : null;
          const safeEsa = esaInfo?.safe ?? null;
          const minEsa = esaInfo?.minimum ?? null;
          const minDiffers = safeEsa !== null && minEsa !== null && minEsa < safeEsa;
          const useMin = reverseEsaMode === 'min' && minEsa !== null;
          const primaryEsa = useMin ? minEsa : safeEsa;
          const secondaryEsa = useMin ? safeEsa : minEsa;
          const secondaryLabel = useMin ? 'safe' : 'min';
          const showSecondary = secondaryEsa !== null && primaryEsa !== null && secondaryEsa !== primaryEsa;
          const showRounding = useMin && minDiffers;

          return (
            <div
              key={i}
              className={`relative flex items-center justify-between p-3 rounded-lg border transition-all gap-2 ${sub.isImpossible ? 'bg-red-500/10 border-red-500/30' :
                sub.alreadyAchieved ? 'bg-green-500/10 border-green-500/30' :
                  sub.locked ? 'bg-yellow-500/10 border-yellow-500/30' :
                    `${themeClasses.card} shadow-sm`
                }`}
            >
              {/* Left Side: Name & Info */}
              <div className="flex-1 min-w-0 pr-2">
                <div className="flex items-center gap-1.5 mb-1">
                  {sub.locked && <Lock className="w-3 h-3 text-yellow-500 flex-shrink-0" />}
                  <span className="text-sm font-bold truncate block">
                    {sub.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] opacity-70">
                  <span className={`px-1.5 rounded bg-white/[0.08]`}>{sub.credits} Cr</span>
                  {sub.isImpossible ? (
                    <span className="text-red-500 font-bold">Impossible</span>
                  ) : (
                    <span>Target: <strong className="opacity-100">{sub.projectedGrade}</strong></span>
                  )}
                </div>
                {assumptions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="text-[8px] px-1.5 py-0.5 rounded bg-white/[0.06] text-zinc-500 uppercase tracking-wider">
                      Assumptions used
                    </span>
                    {assumptions.map((item, idx) => (
                      <span key={idx} className="text-[8px] px-1.5 py-0.5 rounded bg-white/[0.04] text-zinc-400">
                        {item}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Side: Score & Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="text-right">
                  {sub.locked ? (
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          max={sub.esaMax}
                          disabled={sub.isHardLocked}
                          value={sub.isHardLocked ? (marks[sub.id]?.esa || 0) : lockedSubjects[sub.id]}
                          onChange={(e) => {
                            if (sub.isHardLocked) return;
                            const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                            setLockedSubjects(prev => ({ ...prev, [sub.id]: val }));
                          }}
                          className={`w-12 p-1 text-center text-sm font-bold border rounded focus:outline-none ${sub.isHardLocked
                            ? 'bg-white/[0.04] text-zinc-500 cursor-not-allowed border-transparent'
                            : 'bg-yellow-500/10 border-yellow-400 text-yellow-300'
                            }`}
                        />
                        <span className="text-[10px] opacity-50">/{sub.esaMax}</span>
                      </div>
                      <span className="text-[9px] text-yellow-500 mt-0.5">
                        {sub.isHardLocked ? 'Set in subjects tab' : 'Manual'}
                      </span>
                    </div>
                  ) : sub.alreadyAchieved ? (
                    <div className="flex flex-col items-end">
                      <span className="text-lg font-bold text-green-500">0</span>
                      <span className="text-[9px] text-green-500/70">Safe</span>
                    </div>
                  ) : sub.isImpossible ? (
                    <span className="text-xs font-bold text-red-500">---</span>
                  ) : (
                    <div className="flex flex-col items-end">
                      <span className="text-lg font-bold">
                        {primaryEsa !== null ? primaryEsa : sub.requiredEsa}<span className="text-xs font-normal opacity-50">/{sub.esaMax}</span>
                      </span>
                      {showSecondary && (
                        <span className="text-[9px] opacity-60">{secondaryLabel}: {secondaryEsa}</span>
                      )}
                      {showRounding && (
                        <span className="text-[9px] text-orange-400">*rounding</span>
                      )}
                      <span className="text-[9px] opacity-50">Needed</span>
                    </div>
                  )}
                  {isa2TargetInfo && (
                    <div className={`text-[9px] leading-none mt-1 text-right ${isa2TargetInfo.needed === null ? 'text-red-400' : 'text-zinc-500'}`}>
                      {isa2Label} {sub.projectedGrade || 'target'}: {isa2TargetInfo.needed === null ? 'impossible' : `${isa2TargetInfo.needed}/${isa2TargetInfo.max}`}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    if (sub.isHardLocked) return;
                    if (lockedSubjects[sub.id] !== undefined) {
                      const newLocked = { ...lockedSubjects };
                      delete newLocked[sub.id];
                      setLockedSubjects(newLocked);
                    } else {
                      setLockedSubjects({ ...lockedSubjects, [sub.id]: sub.requiredEsa });
                    }
                  }}
                  disabled={sub.isHardLocked}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-all ${sub.isHardLocked ? 'opacity-20 cursor-not-allowed border-transparent' :
                    sub.locked
                      ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                      : 'bg-white/[0.03] border-white/[0.08] text-zinc-400 hover:text-blue-500 hover:border-blue-300'
                    }`}
                >
                  {sub.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Info */}
      <div className="mt-6 p-4 bg-white/[0.03] rounded-lg border border-white/[0.06]">
        <div className="flex items-start gap-2 text-sm">
          <Lightbulb className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p>
              <strong>How to use:</strong> Lock subjects where you're confident about your ESA score.
              The calculator will then adjust the requirements for other subjects to compensate.
            </p>
            <p className="opacity-60 text-xs italic border-t border-white/[0.08] pt-2">
              <strong>Note:</strong> There are many combinations of grades that can achieve your target.
              This result is just the most efficient path (requiring the least amount of total marks).
            </p>
          </div>
        </div>
      </div>

      {/* Momentum Warning */}
      {reverseResults.usingMomentum && (
        <div className="mt-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3 flex items-start gap-3">
          <Zap className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <strong className="text-yellow-200">Using Momentum Scores</strong>
            <p className="text-yellow-105 text-yellow-100/70 text-xs mt-1 leading-relaxed">
              Some internals (like Lab, ISA2, or Assignment) are empty. We project ISA2 from ISA1, assume full marks for empty Assignment or Lab, and estimate ESA using your current internal ratio so the calculator does not crash early in the semester. This is optimistic, so the max achievable SGPA can be higher than reality until you enter actual marks.
            </p>
          </div>
        </div>
      )}

      {/* Minimum Passing Table */}
      <div className="bg-[#0c0c14]/90 backdrop-blur-sm border border-white/[0.06] rounded-xl shadow-2xl shadow-black/20 p-6 mt-8">
        <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
          <Calculator className="w-5 h-5 text-blue-500" /> Minimum ESA Scores Needed
        </h2>
        <p className={`${themeClasses.muted} text-sm mb-4`}>
          Quick reference: minimum ESA marks required for each grade in each subject.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={`border-b ${themeClasses.border}`}>
                <th className="text-left py-3 px-2 font-bold whitespace-nowrap">Subject</th>
                <th className="text-center py-3 px-2 font-bold text-red-400">E (40)</th>
                <th className="text-center py-3 px-2 font-bold text-orange-400">D (50)</th>
                <th className="text-center py-3 px-2 font-bold text-yellow-500">C (60)</th>
                <th className="text-center py-3 px-2 font-bold text-indigo-400">B (70)</th>
                <th className="text-center py-3 px-2 font-bold text-blue-400">A (80)</th>
                <th className="text-center py-3 px-2 font-bold text-green-400">S (90)</th>
              </tr>
            </thead>
            <tbody>
              {minimumPassingTable.map(sub => (
                <tr key={sub.id} className={`border-b ${themeClasses.border} hover:bg-white/[0.04]`}>
                  <td className="py-3 px-2 font-medium max-w-[150px] sm:max-w-none">
                    <div className="truncate font-bold text-zinc-200" title={sub.name}>
                      {sub.name}
                    </div>
                    <div className={`text-[10px] ${themeClasses.muted}`}>{sub.credits} Cr • Max: {sub.esaMax}</div>
                  </td>

                  {['E', 'D', 'C', 'B', 'A', 'S'].map(grade => {
                    const req = sub.gradeRequirements.find(g => g.grade === grade);
                    const isa2MiniLine = req?.showIsa2Needed ? (
                      req.isa2Needed === null ? (
                        <div className="text-[9px] text-red-400 leading-none mt-0.5">I2: ✗</div>
                      ) : (
                        <div className="text-[9px] text-zinc-500 leading-none mt-0.5">I2: {req.isa2Needed}/{req.isa2Max}</div>
                      )
                    ) : null;
                    return (
                      <td key={grade} className="text-center py-3 px-2">
                        {!req?.possible ? (
                          <div>
                            <span className="text-red-500 text-xs font-bold">✗</span>
                            {isa2MiniLine}
                          </div>
                        ) : req.alreadyAchieved ? (
                          <div>
                            <span className="text-green-400 font-bold">✓</span>
                            {isa2MiniLine}
                          </div>
                        ) : (
                          <div>
                            <span className={`font-mono font-bold ${req.requiresRounding ? 'text-orange-400' :
                              req.easy ? 'text-green-400' :
                                req.moderate ? 'text-blue-400' :
                                  'text-orange-400'
                              }`}>
                              {req.requiredEsa}
                              {req.requiresRounding && '*'}
                            </span>
                            {req.minimumEsa !== null && req.minimumEsa < req.requiredEsa && (
                              <div className={`text-[9px] ${themeClasses.muted}`}>
                                ({req.minimumEsa})
                              </div>
                            )}
                            {isa2MiniLine}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={`flex flex-wrap gap-4 mt-4 text-xs ${themeClasses.muted} pt-4 border-t ${themeClasses.border}`}>
          <span><span className="text-green-400 font-bold">✓</span> Already achieved</span>
          <span><span className="text-green-400">Green</span> Easy (≤50)</span>
          <span><span className="text-blue-400">Blue</span> Moderate (51-75)</span>
          <span><span className="text-orange-400">Orange</span> Hard (&gt;75)</span>
          <span><span className="text-red-500 font-bold">✗</span> Not possible</span>
          <span><span className={themeClasses.muted}>(xx)</span> Best case (with rounding)</span>
          <span><span className="text-orange-400">*</span> Requires rounding luck</span>
        </div>
      </div>
    </div>
  );
}
