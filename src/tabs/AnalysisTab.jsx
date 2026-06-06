import React from 'react';
import {
  Activity, Target, TrendingUp, CheckCircle2,
  Lightbulb, AlertCircle, ChevronDown, AlertTriangle
} from 'lucide-react';

export default function AnalysisTab({
  targetSgpa,
  setTargetSgpa,
  sgpaRange,
  sgpa,
  metrics,
  subjects,
  getRequiredESAForGrade,
  getRequiredISA2ForPass,
  getRequiredISA2ForGrade,
  strategy
}) {
  return (
    <div className="space-y-6">
      {/* Target Analyzer (Top Cards) */}
      <div className="bg-[#0c0c14]/90 backdrop-blur-sm rounded-xl shadow-2xl shadow-black/20 p-6 text-zinc-200 border border-white/[0.06]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-lg font-bold flex items-center gap-2 text-yellow-400">
            <Activity className="w-5 h-5" /> Target Analysis
          </h2>
          <div className="flex items-center gap-2 bg-white/[0.08] px-3 py-2 rounded-lg">
            <span className="text-xs text-zinc-400 uppercase font-bold">Target SGPA</span>
            <input
              type="number"
              step="0.1"
              max="10"
              min="5"
              value={targetSgpa}
              onChange={(e) => setTargetSgpa(parseFloat(e.target.value) || 0)}
              className="w-16 p-1 bg-transparent text-right font-bold text-zinc-200 border-none focus:ring-0 text-lg"
            />
          </div>
        </div>

        {/* Grid with Range */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* Range Card */}
          <div className="bg-white/[0.04] rounded-lg p-4 border border-white/[0.06] col-span-2 relative overflow-hidden group">
            <div className="flex justify-between items-end mb-2">
              <div>
                <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">Achievable Range</div>
                <div className="text-2xl font-bold text-zinc-200 flex items-baseline gap-2">
                  {sgpaRange.min} <span className="text-sm text-zinc-500 font-normal">to</span> {sgpaRange.max}
                </div>
              </div>
              <Activity className="w-8 h-8 text-slate-600 group-hover:text-blue-500/50 transition-colors" />
            </div>
            <div className="w-full bg-[#0e0e18] h-2 rounded-full mt-2 overflow-hidden relative">
              <div className="absolute h-full bg-blue-500/30" style={{ left: `${(sgpaRange.min / 10) * 100}%`, right: `${100 - (sgpaRange.max / 10) * 100}%` }} />
              <div className="absolute h-full w-1 bg-yellow-400 top-0 z-10" style={{ left: `${(Math.min(Math.max(sgpa, sgpaRange.min), sgpaRange.max) / 10) * 100}%` }} />
            </div>
            <div className="flex justify-between text-[9px] text-zinc-500 mt-1 font-mono">
              <span>{sgpaRange.min}</span>
              <span className="text-yellow-500 font-bold">Curr: {sgpa}</span>
              <span>{sgpaRange.max}</span>
            </div>
          </div>

          {/* Target Gap */}
          <div className="bg-white/[0.04] rounded-lg p-4 border border-white/[0.06] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-10"><Target className="w-10 h-10" /></div>
            <div className="text-2xl font-bold">{metrics.allowableLoss.toFixed(1)}</div>
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider">GP Budget</div>
            <p className="text-[10px] text-zinc-500 mt-1">Points you can lose to hit {targetSgpa}</p>
          </div>

          {/* Momentum */}
          <div className="bg-indigo-900/40 rounded-lg p-4 border border-indigo-500/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-10"><TrendingUp className="w-10 h-10" /></div>
            <div className="text-2xl font-bold text-indigo-300">{metrics.momentumSGPA}</div>
            <div className="text-[10px] text-indigo-200/70 uppercase tracking-wider">Momentum SGPA *</div>
            <p className="text-[10px] text-indigo-200/50 mt-1">If you maintain current form, i.e ISA performance = ESA</p>
          </div>
        </div>

        {/* Subject-wise Analysis List */}
        <div className="space-y-3 md:space-y-2 max-h-[60vh] md:max-h-80 overflow-y-auto pr-1 md:pr-2 scrollbar-thin">

          {/* Table Header (Desktop Only) */}
          <div className="hidden md:grid grid-cols-12 gap-2 text-[10px] text-zinc-500 uppercase font-bold pb-2 border-b border-white/[0.06] sticky top-0 bg-[#0c0c14] z-10">
            <div className="col-span-3">Subject</div>
            <div className="col-span-2 text-center">Momentum</div>
            <div className="col-span-2 text-center text-zinc-200/90">Pass (40)</div>
            <div className="col-span-2 text-center">For A (80)</div>
            <div className="col-span-2 text-center">For S (90)</div>
            <div className="col-span-1 text-center">GP</div>
          </div>

          {metrics.analysisData.map((d, i) => {
            const sub = subjects.find(s => s.id === d.id);
            const reqPass = getRequiredESAForGrade(sub, 40, true, { useMomentumIsa2: true, useMomentumInternals: true });
            const isa2Label = sub?.customConfig?.labels?.isa2 || 'ISA 2';
            const assignmentLabel = sub?.customConfig?.labels?.assignment || 'Assignment';
            const assignmentLabelShort = assignmentLabel === 'Assignment' ? 'Asg' : assignmentLabel;
            const labLabel = sub?.customConfig?.labels?.lab || 'Lab';
            const isa2PassInfo = getRequiredISA2ForPass(sub);
            const isa2AInfo = getRequiredISA2ForGrade(sub, 80, { assumeFullForEmptyInternals: true });
            const isa2SInfo = getRequiredISA2ForGrade(sub, 90, { assumeFullForEmptyInternals: true });
            const buildIsa2Line = (targetLabel, info) => {
              if (!info) return null;
              if (info.needed === null) {
                return <div className="text-[9px] text-red-400 leading-none mt-0.5">{isa2Label} {targetLabel}: impossible</div>;
              }
              return <div className="text-[9px] text-zinc-500 leading-none mt-0.5">{isa2Label} {targetLabel}: {info.needed}/{info.max}</div>;
            };
            const isa2PassLine = buildIsa2Line('pass', isa2PassInfo);
            const isa2ALine = buildIsa2Line('A', isa2AInfo);
            const isa2SLine = buildIsa2Line('S', isa2SInfo);

            return (
              <div
                key={i}
                className={`
                  flex flex-col gap-3 p-3 rounded-xl border border-white/[0.04] bg-white/[0.02]
                  md:grid md:grid-cols-12 md:gap-2 md:items-center md:py-2 md:border-b md:border-t-0 md:border-x-0 md:border-white/[0.04] md:bg-transparent md:rounded-none md:hover:bg-white/[0.03]
                `}
              >
                {/* Header: Name & GP */}
                <div className="flex items-center justify-between md:contents">
                  <div className="md:col-span-3 truncate text-zinc-200 font-bold md:font-medium text-sm">
                    {d.name}
                  </div>
                  <div className="md:hidden flex items-center gap-2">
                    <span className="text-[10px] uppercase text-zinc-500 font-bold">Curr GP</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${d.currentGP >= 9 ? 'bg-green-500/20 text-green-400' : d.currentGP >= 8 ? 'bg-blue-500/20 text-blue-400' : 'bg-white/[0.1] text-zinc-300'}`}>
                      {d.currentGP}
                    </span>
                  </div>
                </div>

                {/* Stats Grid (2x2 on Mobile, Flat on Desktop) */}
                <div className="grid grid-cols-2 gap-2 md:contents">

                  {/* 1. Momentum */}
                  <div className="bg-black/30 md:bg-transparent p-2 md:p-0 rounded-lg flex flex-col items-center md:block md:col-span-2 md:text-center">
                    <span className="md:hidden text-[9px] text-zinc-500 uppercase font-bold mb-1">Momentum</span>
                    <span className={`font-bold text-lg md:text-sm ${d.momentumScore >= 90 ? 'text-green-400' : d.momentumScore >= 80 ? 'text-blue-400' : d.momentumScore >= 40 ? 'text-zinc-300' : 'text-red-400'}`}>
                      {d.momentumScore}
                    </span>
                    {d.momentumIsa2Marks !== null && (
                      <span className="text-[9px] text-indigo-300/80 mt-0.5">
                        {isa2Label} est: {d.momentumIsa2Marks}/{d.isa2Max}
                      </span>
                    )}
                    {d.momentumAssignmentMarks !== null && (
                      <span className="text-[9px] text-indigo-300/80 mt-0.5">
                        {assignmentLabelShort} est: {d.momentumAssignmentMarks}/{d.assignmentMax}
                      </span>
                    )}
                    {d.momentumLabMarks !== null && (
                      <span className="text-[9px] text-indigo-300/80 mt-0.5">
                        {labLabel} est: {d.momentumLabMarks}/{d.labMax}
                      </span>
                    )}
                  </div>

                  {/* 2. Pass Requirement */}
                  <div className="bg-black/30 md:bg-transparent p-2 md:p-0 rounded-lg flex flex-col items-center md:block md:col-span-2 md:text-center">
                    <span className="md:hidden text-[9px] text-zinc-500 uppercase font-bold mb-1">To Pass</span>
                    {reqPass.safe === null ? (
                      <div className="flex flex-col items-center">
                        <span className="text-red-500 text-xs font-bold">Impossible</span>
                        {isa2PassLine}
                      </div>
                    ) : reqPass.safe === 0 ? (
                      <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span className="text-green-500 text-xs font-bold md:hidden">Passed</span>
                        </div>
                        {isa2PassLine}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <span className={`font-mono font-bold text-base md:text-sm ${reqPass.requiresRounding ? 'text-orange-300' : 'text-zinc-200'}`}>
                          {reqPass.safe}
                        </span>
                        {reqPass.minimum !== null && reqPass.minimum < reqPass.safe && (
                          <div className="text-[9px] text-zinc-500 leading-none">min: {reqPass.minimum}</div>
                        )}
                        {reqPass.requiresRounding && (
                          <div className="text-[9px] text-orange-400 leading-none">*rounding</div>
                        )}
                        {isa2PassLine}
                      </div>
                    )}
                  </div>

                  {/* 3. Target A */}
                  <div className="bg-black/30 md:bg-transparent p-2 md:p-0 rounded-lg flex flex-col items-center md:block md:col-span-2 md:text-center">
                    <span className="md:hidden text-[9px] text-zinc-500 uppercase font-bold mb-1">For A (80)</span>
                    {d.reqA === null ? (
                      <div className="flex flex-col items-center">
                        <span className="text-red-500 text-xs font-bold">Impossible</span>
                        {isa2ALine}
                      </div>
                    ) : d.reqA === 0 ? (
                      <div className="flex flex-col items-center">
                        <span className="text-green-500 text-xs font-bold">✓ Done</span>
                        {isa2ALine}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <span className={`font-mono font-bold text-base md:text-sm ${d.reqARequiresRounding ? 'text-orange-300' : 'text-blue-300'}`}>{d.reqA}</span>
                        {d.reqAMin !== null && d.reqAMin < d.reqA && <div className="text-[9px] text-zinc-500 leading-none">min: {d.reqAMin}</div>}
                        {isa2ALine}
                      </div>
                    )}
                  </div>

                  {/* 4. Target S */}
                  <div className="bg-black/30 md:bg-transparent p-2 md:p-0 rounded-lg flex flex-col items-center md:block md:col-span-2 md:text-center">
                    <span className="md:hidden text-[9px] text-zinc-500 uppercase font-bold mb-1">For S (90)</span>
                    {d.reqS === null ? (
                      <div className="flex flex-col items-center">
                        <span className="text-red-500 text-xs font-bold">Impossible</span>
                        {isa2SLine}
                      </div>
                    ) : d.reqS === 0 ? (
                      <div className="flex flex-col items-center">
                        <span className="text-green-500 text-xs font-bold">✓ Done</span>
                        {isa2SLine}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <span className={`font-mono font-bold text-base md:text-sm ${d.reqSRequiresRounding ? 'text-orange-300' : 'text-yellow-300'}`}>{d.reqS}</span>
                        {d.reqSMin !== null && d.reqSMin < d.reqS && <div className="text-[9px] text-zinc-500 leading-none">min: {d.reqSMin}</div>}
                        {isa2SLine}
                      </div>
                    )}
                  </div>
                </div>

                {/* Desktop GP (Hidden on Mobile) */}
                <div className="hidden md:block col-span-1 text-center">
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${d.currentGP >= 9 ? 'bg-green-500/20 text-green-400' : d.currentGP >= 8 ? 'bg-blue-500/20 text-blue-400' : 'bg-white/[0.1] text-zinc-300'}`}>
                    {d.currentGP}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Notes */}
        <div className="mt-4 p-3 bg-white/[0.04] rounded-lg border border-white/[0.06]">
          <div className="flex items-start gap-2 text-xs text-zinc-400">
            <Lightbulb className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-zinc-300">Safe vs Minimum scores:</strong> The main number is the <strong>safe</strong> ESA score that guarantees the grade.
              The "min" value (when shown) is the absolute minimum that <em>might</em> work due to rounding up, but scoring the safe value is recommended.
            </div>
          </div>
        </div>

        {/* Momentum Disclaimer (Collapsible) */}
        <div className="mt-3 mx-1 bg-indigo-900/20 rounded-lg border border-indigo-500/20">
          <details className="group p-3">
            <summary className="flex items-center gap-2 cursor-pointer list-none text-xs text-indigo-200 font-bold select-none">
              <span className="text-lg leading-none">*️⃣</span>
              <span>Momentum Disclaimer</span>
              <ChevronDown className="w-3 h-3 ml-auto opacity-50 transition-transform group-open:rotate-180" />
            </summary>
            <div className="mt-2 text-xs text-indigo-200/70 leading-relaxed pl-7 border-t border-indigo-500/10 pt-2">
              The momentum score assumes you maintain your current average in future exams. There is a &lt;1% chance this will be your exact final score. <strong>Don't stress over it!</strong> If ISA2 is empty, the Pass/A/S ESA requirements use a momentum-projected ISA2 score and are estimates. When Assignment or Lab is empty, momentum assumes full marks for those components. ISA2 target lines (Pass/A/S) show how much ISA2 you need for that grade, assuming empty Assignment or Lab are full and ESA is 0 unless you have entered an ESA score.
            </div>
          </details>
        </div>
      </div>

      {/* Smart Strategy Panel */}
      <div className="bg-[#0c0c14]/90 backdrop-blur-sm rounded-xl shadow-2xl shadow-black/20 p-4 md:p-6 text-zinc-200 border border-white/[0.06]">
        <details className="group" open>
          <summary className="flex items-center justify-between cursor-pointer list-none select-none">
            <div className="text-lg font-bold flex items-center gap-2 text-green-400">
              <Lightbulb className="w-5 h-5" /> Path to Target ({targetSgpa} SGPA)
            </div>
            <ChevronDown className="w-4 h-4 opacity-60 transition-transform group-open:rotate-180" />
          </summary>

          <div className="mt-4">
            {strategy.plan.length === 0 && !strategy.impossible && parseFloat(metrics.momentumSGPA) >= targetSgpa ? (
              <div className="bg-green-900/20 border border-green-800 rounded-lg p-4 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0" />
                <div>
                  <div className="font-bold text-green-300">You're on track!</div>
                  <div className="text-xs text-green-200/60">Your current momentum meets your target.</div>
                </div>
              </div>
            ) : strategy.impossible ? (
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                <div>
                  <div className="font-bold text-red-300">Target Unreachable</div>
                  <div className="text-xs text-red-200/60">Mathematically impossible given your internals.</div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-zinc-400 mb-2">Most efficient upgrades:</p>
                {strategy.plan.map((step, idx) => (
                  <div key={idx} className="bg-white/[0.04] p-3 rounded-lg border border-white/[0.06] flex items-start gap-3">
                    <div className="bg-[#0e0e18] w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-zinc-400 flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-zinc-200 flex justify-between items-center">
                        <span>{step.name}</span>
                        <span className="text-[10px] bg-indigo-900 text-indigo-200 px-1.5 py-0.5 rounded">+{step.gpGain.toFixed(1)} GP</span>
                      </div>
                      <div className="text-xs text-zinc-400 mt-1 flex items-center gap-1 flex-wrap">
                        <span className="text-zinc-200 font-bold bg-white/[0.1] px-1.5 rounded">{step.esaNeeded}/{step.esaMax}</span>
                        <span>ESA for</span>
                        <span className={`font-bold ${step.toGrade === 'S' ? 'text-green-400' : 'text-blue-400'}`}>{step.toGrade}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </details>
      </div>
    </div>
  );
}
