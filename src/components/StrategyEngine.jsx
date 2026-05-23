import React from 'react';
import { motion } from 'framer-motion';
import { 
  Target, AlertTriangle, HelpCircle, Lock, Unlock, 
  Dice5, Scale, AlertCircle, ArrowRight, Check, X,
  Calculator, Zap, HelpCircle as HelpIcon, Activity,
  TrendingUp, CheckCircle2, Lightbulb, ChevronDown, ChevronUp
} from 'lucide-react';

export default function StrategyEngine({
  activeTab,
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
  calculateRandomPath,
  calculateBalancedPath,
  reverseResults,
  getMinimumPassingTable,
  getSubjectMetrics,
  getGradePoint,
  getGradeInfo,
  getRequiredESAForGrade,
  getRequiredISA2ForGrade,
  getRequiredISA2ForPass,
  metrics,
  strategy,
  setActiveTab,
  sgpa,
  sgpaRange,
  targetSgpa,
  setTargetSgpa
}) {
  
  const minPassingTable = getMinimumPassingTable();

  // Grade styling profile
  const gradeStyles = {
    S: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    A: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    B: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    C: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    D: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    E: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    F: 'text-red-500 bg-red-500/10 border-red-500/20'
  };

  const parsedSgpa = parseFloat(sgpa) || 0;

  return (
    <div className="space-y-6">
      {/* ================== TAB: ANALYSIS ================== */}
      {activeTab === 'analysis' && (
        <div className="space-y-6">
          {/* Target Analyzer (Allowable Loss, Momentum, Range Cards) */}
          <div className="glass-panel p-6 rounded-2xl space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/[0.04] pb-4">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-yellow-400 animate-pulse" /> Target Performance Analysis
                </h3>
                <p className="text-[10px] text-zinc-500 font-medium">Evaluate current standing against your academic targets</p>
              </div>
              <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.06] px-3 py-2 rounded-xl">
                <span className="text-[10px] text-zinc-400 uppercase font-bold">Target SGPA</span>
                <input
                  type="number"
                  step="0.1"
                  max="10"
                  min="5"
                  value={targetSgpa}
                  onChange={(e) => setTargetSgpa(parseFloat(e.target.value) || 9.0)}
                  className="w-14 bg-transparent text-right font-black text-white border-none focus:ring-0 text-sm p-0"
                />
              </div>
            </div>

            {/* Visual metrics cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {/* Range bar card */}
              <div className="bg-black/35 rounded-xl p-4 border border-white/[0.04] sm:col-span-2 relative overflow-hidden group">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold">Achievable SGPA Range</span>
                    <div className="text-xl font-black text-white flex items-baseline gap-2 mt-0.5">
                      {sgpaRange?.min || '0.00'} <span className="text-xs text-zinc-500 font-normal">to</span> {sgpaRange?.max || '0.00'}
                    </div>
                  </div>
                  <Activity className="w-8 h-8 text-zinc-800/80 group-hover:text-indigo-500/30 transition-colors" />
                </div>
                <div className="w-full bg-zinc-900 h-2 rounded-full mt-2.5 overflow-hidden relative">
                  <div 
                    className="absolute h-full bg-indigo-500/25" 
                    style={{ 
                      left: `${(parseFloat(sgpaRange?.min || 0) / 10) * 100}%`, 
                      right: `${100 - (parseFloat(sgpaRange?.max || 10) / 10) * 100}%` 
                    }} 
                  />
                  <div className="absolute h-full w-1.5 bg-yellow-400 top-0 z-10" style={{ left: `${(Math.min(Math.max(parsedSgpa, parseFloat(sgpaRange?.min || 0)), parseFloat(sgpaRange?.max || 10)) / 10) * 100}%` }} />
                </div>
                <div className="flex justify-between text-[8px] text-zinc-500 mt-1 font-mono">
                  <span>{sgpaRange?.min || '0.00'}</span>
                  <span className="text-yellow-400 font-bold">Current SGPA: {sgpa}</span>
                  <span>{sgpaRange?.max || '0.00'}</span>
                </div>
              </div>

              {/* Target GP budget */}
              <div className="bg-black/35 rounded-xl p-4 border border-white/[0.04] relative overflow-hidden flex flex-col justify-between group">
                <div className="absolute top-0 right-0 p-2 opacity-5"><Target className="w-10 h-10" /></div>
                <div className="text-xl font-black text-white">{metrics.allowableLoss.toFixed(1)}</div>
                <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold block mt-1">GP Loss Budget</span>
                <p className="text-[8px] text-zinc-500 mt-0.5 leading-normal">Grade Points you can afford to lose while still hitting {targetSgpa}</p>
              </div>

              {/* Momentum SGPA Card (RESTORED!) */}
              <div className="bg-indigo-950/20 rounded-xl p-4 border border-indigo-500/20 relative overflow-hidden flex flex-col justify-between group">
                <div className="absolute top-0 right-0 p-2 opacity-5"><TrendingUp className="w-10 h-10 text-indigo-400" /></div>
                <div className="text-xl font-black text-indigo-300">{metrics.momentumSGPA}</div>
                <span className="text-[9px] text-indigo-200/70 uppercase tracking-wider font-bold block mt-1">Momentum SGPA *</span>
                <p className="text-[8px] text-indigo-200/50 mt-0.5 leading-normal">Your projected SGPA if you maintain current ISA average in ESAs</p>
              </div>
            </div>
          </div>

          {/* Subject-Wise Analysis Table (RESTORED FEATURES!) */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-zinc-400" /> Subject-wise Target Metrics
            </h3>
            
            <div className="space-y-3.5 max-h-[60vh] md:max-h-96 overflow-y-auto pr-1">
              
              {/* Desktop Table Header */}
              <div className="hidden md:grid grid-cols-12 gap-2 text-[9px] text-zinc-500 uppercase font-extrabold pb-2 border-b border-white/[0.04] sticky top-0 bg-[#0c0c16] z-10">
                <div className="col-span-3">Subject</div>
                <div className="col-span-2 text-center">Momentum</div>
                <div className="col-span-2 text-center text-rose-400">Pass (40)</div>
                <div className="col-span-2 text-center text-blue-400">For A (80)</div>
                <div className="col-span-2 text-center text-emerald-400">For S (90)</div>
                <div className="col-span-1 text-center">GP</div>
              </div>

              {metrics.analysisData.map((d, idx) => {
                const sub = subjects.find(s => s.id === d.id);
                const reqPass = sub ? getRequiredESAForGrade(sub, 40, true, { useMomentumIsa2: true, useMomentumInternals: true }) : null;
                const isa2Label = sub?.customConfig?.labels?.isa2 || 'ISA2';
                const assignmentLabel = sub?.customConfig?.labels?.assignment || 'Assignment';
                const assignmentLabelShort = assignmentLabel === 'Assignment' ? 'Asg' : assignmentLabel;
                const labLabel = sub?.customConfig?.labels?.lab || 'Lab';

                const isa2PassInfo = sub ? getRequiredISA2ForPass(sub) : null;
                const isa2AInfo = sub ? getRequiredISA2ForGrade(sub, 80, { assumeFullForEmptyInternals: true }) : null;
                const isa2SInfo = sub ? getRequiredISA2ForGrade(sub, 90, { assumeFullForEmptyInternals: true }) : null;

                const buildIsa2Line = (targetLabel, info) => {
                  if (!info) return null;
                  if (info.needed === null) {
                    return <span className="text-[8px] text-red-500 font-bold block mt-0.5">{isa2Label} {targetLabel}: ✗</span>;
                  }
                  return <span className="text-[8px] text-zinc-500 block mt-0.5">{isa2Label} {targetLabel}: {info.needed}/{info.max}</span>;
                };

                const isa2PassLine = buildIsa2Line('pass', isa2PassInfo);
                const isa2ALine = buildIsa2Line('A', isa2AInfo);
                const isa2SLine = buildIsa2Line('S', isa2SInfo);

                return (
                  <div 
                    key={idx}
                    className="flex flex-col gap-3 p-3.5 bg-black/20 border border-white/[0.03] rounded-xl md:grid md:grid-cols-12 md:gap-2 md:items-center md:py-2 md:border-b md:border-t-0 md:border-x-0 md:border-white/[0.04] md:bg-transparent md:rounded-none md:hover:bg-white/[0.02]"
                  >
                    {/* Header mobile title / details */}
                    <div className="flex justify-between items-center md:contents">
                      <div className="md:col-span-3 truncate">
                        <span className="text-xs font-bold text-white block">{d.name}</span>
                        <span className="text-[9px] text-zinc-500 font-mono mt-0.5">{d.credits} Cr</span>
                      </div>
                      <div className="md:hidden flex items-center gap-1">
                        <span className="text-[9px] text-zinc-500 uppercase font-bold">GP:</span>
                        <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                          d.currentGP >= 9 ? 'bg-emerald-500/10 text-emerald-400' : d.currentGP >= 8 ? 'bg-blue-500/10 text-blue-400' : 'bg-white/[0.04] text-zinc-400'
                        }`}>
                          {d.currentGP}
                        </span>
                      </div>
                    </div>

                    {/* Projections statistics grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:contents">
                      
                      {/* Momentum projection */}
                      <div className="bg-black/30 md:bg-transparent p-2.5 md:p-0 rounded-xl text-center md:col-span-2 md:text-center flex flex-col justify-center">
                        <span className="md:hidden text-[8px] text-zinc-500 uppercase font-bold block mb-1">Momentum Score</span>
                        <span className={`font-black text-sm ${d.momentumScore >= 90 ? 'text-emerald-400' : d.momentumScore >= 80 ? 'text-blue-400' : d.momentumScore >= 40 ? 'text-zinc-300' : 'text-red-400'}`}>
                          {d.momentumScore}%
                        </span>
                        {d.momentumIsa2Marks !== null && <span className="text-[8px] text-zinc-500">{isa2Label} est: {d.momentumIsa2Marks}/{d.isa2Max}</span>}
                        {d.momentumAssignmentMarks !== null && <span className="text-[8px] text-zinc-500">{assignmentLabelShort} est: {d.momentumAssignmentMarks}/{d.assignmentMax}</span>}
                        {d.momentumLabMarks !== null && <span className="text-[8px] text-zinc-500">{labLabel} est: {d.momentumLabMarks}/{d.labMax}</span>}
                      </div>

                      {/* To Pass Requirement */}
                      <div className="bg-black/30 md:bg-transparent p-2.5 md:p-0 rounded-xl text-center md:col-span-2 md:text-center flex flex-col justify-center">
                        <span className="md:hidden text-[8px] text-rose-400 uppercase font-bold block mb-1">To Pass (E)</span>
                        {reqPass?.safe === null ? (
                          <div>
                            <span className="text-red-500 text-xs font-bold block">✗ Locked Out</span>
                            {isa2PassLine}
                          </div>
                        ) : reqPass?.safe === 0 ? (
                          <div>
                            <span className="text-emerald-400 font-extrabold text-glow-emerald block">✓ Secured</span>
                            {isa2PassLine}
                          </div>
                        ) : (
                          <div>
                            <span className="font-mono font-black text-white text-xs">{reqPass.safe}</span>
                            {reqPass.minimum !== null && reqPass.minimum < reqPass.safe && <span className="text-[8px] text-zinc-500 block">min: {reqPass.minimum}</span>}
                            {isa2PassLine}
                          </div>
                        )}
                      </div>

                      {/* For A Grade Requirement */}
                      <div className="bg-black/30 md:bg-transparent p-2.5 md:p-0 rounded-xl text-center md:col-span-2 md:text-center flex flex-col justify-center">
                        <span className="md:hidden text-[8px] text-blue-400 uppercase font-bold block mb-1">For A Grade</span>
                        {d.reqA === null ? (
                          <div>
                            <span className="text-red-500 text-xs font-bold block">✗ Impossible</span>
                            {isa2ALine}
                          </div>
                        ) : d.reqA === 0 ? (
                          <div>
                            <span className="text-emerald-400 font-extrabold text-glow-emerald block">✓ Secured</span>
                            {isa2ALine}
                          </div>
                        ) : (
                          <div>
                            <span className={`font-mono font-black text-xs ${d.reqARequiresRounding ? 'text-orange-400' : 'text-zinc-300'}`}>{d.reqA}</span>
                            {d.reqAMin !== null && d.reqAMin < d.reqA && <span className="text-[8px] text-zinc-500 block">min: {d.reqAMin}</span>}
                            {isa2ALine}
                          </div>
                        )}
                      </div>

                      {/* For S Grade Requirement */}
                      <div className="bg-black/30 md:bg-transparent p-2.5 md:p-0 rounded-xl text-center md:col-span-2 md:text-center flex flex-col justify-center">
                        <span className="md:hidden text-[8px] text-emerald-400 uppercase font-bold block mb-1">For S Grade</span>
                        {d.reqS === null ? (
                          <div>
                            <span className="text-red-500 text-xs font-bold block">✗ Impossible</span>
                            {isa2SLine}
                          </div>
                        ) : d.reqS === 0 ? (
                          <div>
                            <span className="text-emerald-400 font-extrabold text-glow-emerald block">✓ Secured</span>
                            {isa2SLine}
                          </div>
                        ) : (
                          <div>
                            <span className={`font-mono font-black text-xs ${d.reqSRequiresRounding ? 'text-orange-400' : 'text-zinc-300'}`}>{d.reqS}</span>
                            {d.reqSMin !== null && d.reqSMin < d.reqS && <span className="text-[8px] text-zinc-500 block">min: {d.reqSMin}</span>}
                            {isa2SLine}
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Desktop GP Badge */}
                    <div className="hidden md:block col-span-1 text-center">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                        d.currentGP >= 9 ? 'bg-emerald-500/10 text-emerald-400' : d.currentGP >= 8 ? 'bg-blue-500/10 text-blue-400' : 'bg-white/[0.04] text-zinc-400'
                      }`}>
                        {d.currentGP}
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Explanation box safe vs minimum */}
            <div className="p-3.5 bg-white/[0.02] border border-white/[0.04] rounded-xl flex gap-2 items-start text-[10px] text-zinc-500">
              <Lightbulb className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-zinc-300">Safe vs Minimum Scores:</strong> The primary number is the <strong>Safe ESA</strong> score which mathematically guarantees the grade. The "min" decimal option represents the absolute minimum that could work due to ceiling rounding logic.
              </div>
            </div>

            {/* Momentum collapsible disclaimer card */}
            <div className="bg-indigo-950/[0.08] border border-indigo-500/10 rounded-xl overflow-hidden">
              <details className="group">
                <summary className="p-3.5 flex items-center justify-between cursor-pointer list-none select-none text-[10px] font-bold text-indigo-300 hover:text-indigo-400 transition-all">
                  <span className="flex items-center gap-1.5">📢 *️⃣ Momentum Projections Disclaimer</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-55 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="p-4 pt-0 border-t border-indigo-500/10 text-[10px] text-indigo-200/50 leading-relaxed bg-black/10">
                  Momentum represents a simulated performance projection assuming you maintain your current average in remaining examinations. Decimals rounding and empty components are computed optimistically (assuming empty Assignments or Labs are full marks) so the calculators do not lock up. Projections will refine dynamically as you enter actual marks!
                </div>
              </details>
            </div>
          </div>

          {/* Target Feasibility Status Card */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400 animate-pulse" /> Target Feasibility Status
            </h3>

            {strategy.impossible ? (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex gap-3 items-start">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm text-red-300">Goal Out of Reach</h4>
                  <p className="text-xs text-red-400/80 leading-relaxed">
                    Based on your secured internals, a target of <strong>{targetSgpa.toFixed(2)}</strong> is mathematically impossible even with perfect ESA scores. Lower your target SGPA in this tab to find a realistic strategy.
                  </p>
                </div>
              </div>
            ) : parseFloat(metrics.momentumSGPA) >= targetSgpa ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex gap-3 items-start">
                <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5 bg-emerald-500/20 rounded-full p-0.5" />
                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm text-emerald-300">You're on track!</h4>
                  <p className="text-xs text-emerald-400/80 leading-relaxed">
                    Amazing! Your current form (momentum SGPA of <strong>{metrics.momentumSGPA}</strong>) already meets or exceeds your target SGPA goal of <strong>{targetSgpa.toFixed(2)}</strong>. No extra grade jumps are needed to hit your goal!
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex gap-3 items-start">
                <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5 bg-emerald-500/20 rounded-full p-0.5" />
                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm text-emerald-300">Target Achievable!</h4>
                  <p className="text-xs text-emerald-400/80 leading-relaxed">
                    Excellent! Your target SGPA is within reach. Below is your optimized roadmap showing grade jumps that require the least total marks.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Strategy Roadmap Timeline */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-zinc-400" /> Lazy Path Strategy Roadmap
              </h3>
              <span className="text-[10px] text-zinc-500 font-mono">
                {strategy.plan.length} Grade Jumps Needed
              </span>
            </div>

            {strategy.plan.length === 0 ? (
              <div className="text-center py-8 text-xs text-zinc-500">
                {strategy.impossible ? 'No strategy possible.' : 'Target already achieved with current momentum! No further grade jumps needed.'}
              </div>
            ) : (
              <div className="relative border-l border-zinc-800 ml-3 pl-6 space-y-5">
                {strategy.plan.map((step, idx) => {
                  const activeColor = gradeStyles[step.toGrade] || 'text-zinc-300';
                  return (
                    <motion.div 
                      key={idx}
                      className="relative space-y-1"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      {/* Interactive dot node */}
                      <span className="absolute -left-[30px] top-1 w-4.5 h-4.5 rounded-full bg-[#030307] border-2 border-indigo-500 flex items-center justify-center text-[8px] font-bold text-indigo-300 shadow-[0_0_8px_rgba(99,102,241,0.4)]">
                        {idx + 1}
                      </span>
                      
                      {/* Step roadmap card */}
                      <div className="glass-panel p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-white/[0.03]">
                        <div>
                          <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-extrabold block">Action Target</span>
                          <span className="text-sm font-bold text-white block mt-0.5">{step.name}</span>
                          <p className="text-xs text-zinc-400 mt-1">
                            Aim to secure a grade jump from <strong className="text-zinc-300">{step.fromGrade}</strong> to <span className={`font-extrabold ${activeColor.split(' ')[0]}`}>{step.toGrade}</span>.
                          </p>
                        </div>
                        
                        <div className="text-left sm:text-right border-t border-white/[0.04] pt-2.5 sm:pt-0 sm:border-none">
                          <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">ESA Marks Required</span>
                          <span className="text-lg font-black text-white">{step.esaNeeded}</span>
                          <span className="text-[10px] text-zinc-500"> / {step.esaMax}</span>
                          <span className="text-[9px] text-indigo-400 block font-mono font-bold">+{step.gpGain.toFixed(1)} Grade Points</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================== TAB: REVERSE CALCULATOR ================== */}
      {activeTab === 'reverse' && (
        <div className="space-y-6">
          {/* Controls Glass Card */}
          <div className="glass-panel rounded-2xl p-6 relative overflow-hidden space-y-4">
            <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/[0.04] blur-2xl rounded-full pointer-events-none" />
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-400" /> Dynamic Goal Planner
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Define a target SGPA and visually lock subjects to distribute remaining marks chronologically.
            </p>

            {/* Slider & Mode row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1 bg-black/20 p-3 rounded-xl border border-white/[0.04]">
                <label className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-widest block mb-1">Target SGPA Goal</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="5"
                    max="10"
                    step="0.05"
                    value={reverseTargetSgpa}
                    onChange={(e) => setReverseTargetSgpa(parseFloat(e.target.value) || 9.0)}
                    className="flex-1 h-1 bg-zinc-800 rounded-lg appearance-none accent-indigo-500"
                  />
                  <span className="text-base font-extrabold text-indigo-400 tabular-nums">{reverseTargetSgpa.toFixed(2)}</span>
                </div>
              </div>

              {/* ESA Mode Segmented Button */}
              <div className="space-y-1 bg-black/20 p-3 rounded-xl border border-white/[0.04] flex items-center justify-between">
                <div>
                  <label className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-widest block">ESA Predict Method</label>
                  <span className="text-[9px] text-zinc-500">Min relies on rounding luck.</span>
                </div>
                <div className="bg-zinc-900 border border-white/[0.06] rounded-xl p-1 flex">
                  <button
                    onClick={() => setReverseEsaMode('safe')}
                    className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${
                      reverseEsaMode === 'safe'
                        ? 'bg-white/[0.08] text-white shadow-sm'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    Safe
                  </button>
                  <button
                    onClick={() => setReverseEsaMode('min')}
                    className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${
                      reverseEsaMode === 'min'
                        ? 'bg-white/[0.08] text-white shadow-sm'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    Min
                  </button>
                </div>
              </div>
            </div>

            {/* Path Algorithms */}
            <div className="space-y-1 pt-2 border-t border-white/[0.04]">
              <label className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-widest block mb-1">Path Simulation Algorithms</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setShuffledResults(calculateRandomPath())}
                  className="flex-1 bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 text-purple-300 p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  <Dice5 className="w-4 h-4" /> Shuffle Combinations
                </button>
                <button
                  onClick={() => setShuffledResults(calculateBalancedPath())}
                  className="flex-1 bg-teal-500/10 border border-teal-500/20 hover:bg-teal-500/20 text-teal-300 p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  <Scale className="w-4 h-4" /> Balanced Effort Path
                </button>
                {shuffledResults && (
                  <button
                    onClick={() => setShuffledResults(null)}
                    className="text-xs text-zinc-400 hover:underline px-2"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Locking hint */}
            <div className="bg-indigo-500/5 p-3 rounded-xl border border-indigo-500/10 flex gap-2 items-start text-xs text-indigo-300/80 leading-normal">
              <HelpIcon className="w-4 h-4 shrink-0 mt-0.5 text-indigo-400" />
              <p>
                <strong>Tip:</strong> If a path is unrealistic, click the lock icon (<Lock className="w-3 h-3 inline" />) on that subject to clamp it to a manually defined score. The planner will balance the remaining credits!
              </p>
            </div>

            {!reverseResults.isTargetAchievable && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl px-4 py-2.5 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Goal exceeds mathematical maximum potential of <strong>{reverseResults.achievableSGPA}</strong> based on current internals.
              </div>
            )}
          </div>

          {/* Subjects planning items row grid */}
          <div className="space-y-3">
            {(shuffledResults || reverseResults.results).map((sub, i) => {
              const baseSubject = subjects.find(s => s.id === sub.id);
              const m = marks[sub.id] || {};
              const hasEsa = m.esa !== '' && m.esa !== undefined && !isNaN(parseFloat(m.esa));
              
              const activeColor = gradeStyles[sub.projectedGrade] || 'border-white/[0.04] bg-[#0c0c16]/50';
              
              const isa2Label = baseSubject?.customConfig?.labels?.isa2 || 'ISA2';
              const targetScore = sub.projectedScore ?? GradeMapPreset.find(g => g.grade === sub.projectedGrade)?.min ?? null;
              
              const esaInfo = baseSubject && targetScore !== null
                ? getRequiredESAForGrade(baseSubject, targetScore, true, { useMomentumIsa2: true, useMomentumInternals: true })
                : null;
              const isa2TargetInfo = baseSubject && targetScore !== null
                ? getRequiredISA2ForGrade(baseSubject, targetScore, { assumeFullForEmptyInternals: true })
                : null;

              const safeEsa = esaInfo?.safe ?? null;
              const minEsa = esaInfo?.minimum ?? null;
              const primaryEsa = reverseEsaMode === 'min' && minEsa !== null ? minEsa : safeEsa;

              return (
                <div
                  key={i}
                  className={`glass-panel rounded-xl p-4 flex items-center justify-between gap-4 border transition-all ${
                    sub.isImpossible 
                      ? 'border-red-500/25 bg-red-500/[0.02]' 
                      : sub.alreadyAchieved 
                        ? 'border-emerald-500/25 bg-emerald-500/[0.02]' 
                        : sub.locked 
                          ? 'border-yellow-500/25 bg-yellow-500/[0.02]'
                          : 'border-white/[0.04]'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {sub.locked && <Lock className="w-3.5 h-3.5 text-yellow-400 shrink-0" />}
                      <span className="text-sm font-extrabold text-white truncate block">{sub.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                      <span className="px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.04]">{sub.credits} Credits</span>
                      {sub.isImpossible ? (
                        <span className="text-red-400 font-extrabold">Impossible Target</span>
                      ) : (
                        <span>Predict Grade: <strong className={activeColor.split(' ')[0]}>{sub.projectedGrade}</strong></span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      {sub.locked ? (
                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-1.5">
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
                              className={`w-12 p-1 text-center text-xs font-black border rounded focus:outline-none ${
                                sub.isHardLocked
                                  ? 'bg-white/[0.04] border-transparent text-zinc-500'
                                  : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-300'
                              }`}
                            />
                            <span className="text-[10px] text-zinc-500">/{sub.esaMax}</span>
                          </div>
                          <span className="text-[8px] text-yellow-400 mt-0.5 font-bold uppercase tracking-wider">
                            {sub.isHardLocked ? 'Defined in main tab' : 'Clamped Limit'}
                          </span>
                        </div>
                      ) : sub.alreadyAchieved ? (
                        <div className="flex flex-col items-end">
                          <span className="text-lg font-black text-emerald-400 text-glow-emerald">0</span>
                          <span className="text-[8px] text-emerald-400 font-bold uppercase tracking-wider">Pass Secured</span>
                        </div>
                      ) : sub.isImpossible ? (
                        <span className="text-xs font-bold text-red-400 font-mono">N/A</span>
                      ) : (
                        <div className="flex flex-col items-end">
                          <span className="text-lg font-black text-white">
                            {primaryEsa !== null ? primaryEsa : sub.requiredEsa}
                            <span className="text-[10px] text-zinc-500 font-normal"> / {sub.esaMax}</span>
                          </span>
                          <span className="text-[8px] text-zinc-500 uppercase tracking-widest font-bold">ESA Goal</span>
                        </div>
                      )}
                      
                      {isa2TargetInfo && !sub.locked && !sub.alreadyAchieved && !sub.isImpossible && (
                        <div className={`text-[9px] font-mono leading-none mt-1 ${isa2TargetInfo.needed === null ? 'text-red-400' : 'text-zinc-500'}`}>
                          {isa2Label}: {isa2TargetInfo.needed === null ? 'impossible' : `${isa2TargetInfo.needed}/${isa2TargetInfo.max}`}
                        </div>
                      )}
                    </div>

                    {/* Clamping Lock Button */}
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
                      className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all ${
                        sub.isHardLocked 
                          ? 'opacity-20 cursor-not-allowed border-transparent' 
                          : sub.locked 
                            ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' 
                            : 'bg-white/[0.02] border-white/[0.04] text-zinc-500 hover:text-indigo-400 hover:border-indigo-500/20'
                      }`}
                    >
                      {sub.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Minimum ESA marks reference matrix grid */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-zinc-400" /> Minimum Passing Matrix Grid
            </h3>
            <p className="text-xs text-zinc-400">
              Quick reference: absolute minimum ESA scores needed to achieve specific letter grades.
            </p>

            <div className="overflow-x-auto rounded-xl border border-white/[0.04] bg-black/25">
              <table className="w-full text-xs text-zinc-300">
                <thead>
                  <tr className="border-b border-white/[0.04] bg-white/[0.02]">
                    <th className="text-left py-3 px-3 font-extrabold whitespace-nowrap uppercase tracking-wider text-zinc-500">Subject Name</th>
                    <th className="text-center py-3 px-2 font-extrabold text-rose-400 uppercase tracking-wider">E (40)</th>
                    <th className="text-center py-3 px-2 font-extrabold text-orange-400 uppercase tracking-wider">D (50)</th>
                    <th className="text-center py-3 px-2 font-extrabold text-yellow-400 uppercase tracking-wider">C (60)</th>
                    <th className="text-center py-3 px-2 font-extrabold text-indigo-400 uppercase tracking-wider">B (70)</th>
                    <th className="text-center py-3 px-2 font-extrabold text-blue-400 uppercase tracking-wider">A (80)</th>
                    <th className="text-center py-3 px-2 font-extrabold text-emerald-400 uppercase tracking-wider">S (90)</th>
                  </tr>
                </thead>
                <tbody>
                  {minPassingTable.map((sub) => (
                    <tr key={sub.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-3 font-semibold max-w-[150px] truncate" title={sub.name}>
                        <div className="font-bold text-zinc-200">{sub.name}</div>
                        <div className="text-[9px] text-zinc-500 font-mono mt-0.5">{sub.credits} Cr • Max ESA {sub.esaMax}</div>
                      </td>
                      
                      {['E', 'D', 'C', 'B', 'A', 'S'].map((grade) => {
                        const req = sub.gradeRequirements.find(g => g.grade === grade);
                        const isa2MiniLine = req?.showIsa2Needed ? (
                          req.isa2Needed === null ? (
                            <span className="text-[8px] text-red-500 font-bold block mt-0.5">✗ I2</span>
                          ) : (
                            <span className="text-[8px] text-zinc-500 font-mono block mt-0.5">I2: {req.isa2Needed}/{req.isa2Max}</span>
                          )
                        ) : null;

                        return (
                          <td key={grade} className="text-center py-3 px-2 font-mono">
                            {!req?.possible ? (
                              <div>
                                <span className="text-red-500 font-bold">✗</span>
                                {isa2MiniLine}
                              </div>
                            ) : req.alreadyAchieved ? (
                              <div>
                                <span className="text-emerald-400 font-black text-glow-emerald">✓</span>
                                {isa2MiniLine}
                              </div>
                            ) : (
                              <div>
                                <span className={`font-black ${
                                  req.requiresRounding 
                                    ? 'text-orange-400' 
                                    : req.easy 
                                      ? 'text-emerald-400' 
                                      : req.moderate 
                                        ? 'text-blue-400' 
                                        : 'text-orange-400'
                                }`}>
                                  {req.requiredEsa}
                                  {req.requiresRounding && '*'}
                                </span>
                                {req.minimumEsa !== null && req.minimumEsa < req.requiredEsa && (
                                  <div className="text-[8px] text-zinc-600">({req.minimumEsa})</div>
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

            {/* Passing table legend */}
            <div className="flex flex-wrap gap-4 text-[9px] text-zinc-500 font-semibold pt-2">
              <span className="flex items-center gap-1"><span className="text-emerald-400 font-extrabold">✓</span> Secured</span>
              <span className="flex items-center gap-1"><span className="text-emerald-400">Green</span> Easy (≤50)</span>
              <span className="flex items-center gap-1"><span className="text-blue-400">Blue</span> Moderate (51-75)</span>
              <span className="flex items-center gap-1"><span className="text-orange-400">Orange</span> Hard (&gt;75)</span>
              <span className="flex items-center gap-1"><span className="text-red-500 font-bold">✗</span> Locked Out</span>
              <span className="flex items-center gap-1"><span>*</span> Decimals rounding needed</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Fallback GradeMapPreset
const GradeMapPreset = [
  { grade: 'S', min: 90, gp: 10 },
  { grade: 'A', min: 80, gp: 9 },
  { grade: 'B', min: 70, gp: 8 },
  { grade: 'C', min: 60, gp: 7 },
  { grade: 'D', min: 50, gp: 6 },
  { grade: 'E', min: 40, gp: 5 },
  { grade: 'F', min: 0, gp: 0 },
];
