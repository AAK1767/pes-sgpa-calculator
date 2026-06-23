import React from 'react';
import {
  Activity, Target, TrendingUp, CheckCircle2,
  Lightbulb, AlertCircle, ChevronDown, AlertTriangle, Calculator, HelpCircle
} from 'lucide-react';
import { getRequiredISA2ForGrade as getRequiredISA2ForGradePure } from '../utils/calculations';

export default function AnalysisTab({
  themeClasses,
  targetSgpa,
  setTargetSgpa,
  sgpaRange,
  sgpa,
  metrics,
  subjects,
  marks,
  getRequiredESAForGrade,
  strategy,
  minimumPassingTable
}) {
  const [assumedEsa, setAssumedEsa] = React.useState(60);
  const [individualEsa, setIndividualEsa] = React.useState({});

  // Helper to calculate targets for ISA 2 Planner
  const isa2PlannerData = subjects.map(sub => {
    const m = marks?.[sub.id] || {};
    const isa2Max = parseFloat(m.isa2Max ?? sub.isa2Max ?? 40) || 40;

    // Check if subject has an ISA 2 component
    if (sub.hasIsa2 === false) {
      return { id: sub.id, name: sub.name, credits: sub.credits, status: 'N/A' };
    }

    // Call pure calculation function with mock marks
    const getMockedReq = (targetGrade) => {
      const subEsaVal = individualEsa[sub.id] !== undefined && individualEsa[sub.id] !== ''
        ? individualEsa[sub.id]
        : assumedEsa;
      const mockMarks = {
        ...marks,
        [sub.id]: {
          ...m,
          isa2: '', // Force empty so it calculates what is needed even if already written
          esa: parseFloat(subEsaVal) || 0,
          esaMax: 100
        }
      };
      return getRequiredISA2ForGradePure(sub, targetGrade, { assumeFullForEmptyInternals: true }, mockMarks);
    };

    const passReq = getMockedReq(40); // To Pass (40) with assumed ESA
    const aReq = getMockedReq(80); // For A (80) with assumed ESA
    const sReq = getMockedReq(90); // For S (90) with assumed ESA

    return {
      id: sub.id,
      name: sub.name,
      credits: sub.credits,
      status: 'pending',
      isa2Max,
      passNeeded: passReq ? passReq.needed : null,
      aNeeded: aReq ? aReq.needed : null,
      sNeeded: sReq ? sReq.needed : null
    };
  });

  const renderEsaCell = (safeScore, minScore, targetScore, requiresRounding, subId) => {
    if (safeScore === null) {
      // Find highest achievable grade
      const subReq = minimumPassingTable.find(s => s.id === subId);
      const possibleGrades = subReq?.gradeRequirements?.filter(g => g.possible) || [];

      if (possibleGrades.length === 0) {
        return (
          <div className="flex flex-col items-center">
            <span className="text-red-500 text-xs font-bold">Impossible</span>
          </div>
        );
      }

      // Check if both A (80) and S (90) are impossible
      const d = metrics?.analysisData?.find(x => x.id === subId);
      const bothImpossible = d ? (d.reqA === null && d.reqS === null) : false;

      // Only show the detailed fallback in the A cell if BOTH are impossible.
      // If only S is impossible, or if we are on the S cell when both are impossible,
      // just show a clean "Impossible" to avoid clutter.
      const shouldShowFallback = (targetScore === 80 && bothImpossible);

      if (!shouldShowFallback) {
        return (
          <div className="flex flex-col items-center">
            <span className="text-red-500 text-xs font-bold">Impossible</span>
          </div>
        );
      }

      const maxGrade = possibleGrades.reduce((max, curr) => (curr.gp > (max?.gp || 0) ? curr : max), possibleGrades[0]);

      return (
        <div className="flex flex-col items-center justify-center">
          <span className="text-red-500 text-[10px] font-bold leading-none">Impossible</span>
          <span className="text-zinc-400 text-[9px] mt-1 leading-none font-medium">
            Max: <strong className="text-yellow-400 font-bold">{maxGrade.grade}</strong>
          </span>
          <span className="text-zinc-500 text-[9px] mt-0.5 leading-none">
            ({maxGrade.requiredEsa} needed)
          </span>
        </div>
      );
    }

    if (safeScore === 0) {
      return (
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-green-500 text-xs font-bold md:hidden font-medium font-bold">Secured</span>
          </div>
        </div>
      );
    }

    const colorClass = targetScore === 90 ? 'text-yellow-300' : targetScore === 80 ? 'text-blue-300' : 'text-zinc-200';

    return (
      <div className="flex flex-col items-center">
        <span className={`font-mono font-bold text-base md:text-sm ${requiresRounding ? 'text-orange-300' : colorClass}`}>
          {safeScore}
        </span>
        {minScore !== null && minScore < safeScore && (
          <div className="text-[9px] text-zinc-500 leading-none">min: {minScore}</div>
        )}
        {requiresRounding && (
          <div className="text-[9px] text-orange-400 leading-none">*rounding</div>
        )}
      </div>
    );
  };

  const renderIsa2Cell = (neededScore, targetGrade, subId) => {
    const sub = subjects.find(s => s.id === subId);
    const m = marks?.[subId] || {};
    const isa2Max = m.isa2Max ?? sub?.isa2Max ?? 40;

    if (neededScore === 0) {
      return <span className="text-green-400 font-bold">✓ Secured</span>;
    }

    if (neededScore !== null) {
      const textColor = targetGrade === 90 ? 'text-green-300' : targetGrade === 80 ? 'text-blue-300' : 'text-zinc-200';
      return (
        <span className={`font-mono font-bold ${textColor}`}>
          {neededScore}
          <span className="text-[10px] text-zinc-500 font-normal">/{isa2Max}</span>
        </span>
      );
    }

    // Check if both A (80) and S (90) needed scores are impossible
    const plannerSub = isa2PlannerData.find(x => x.id === subId);
    const bothImpossible = plannerSub ? (plannerSub.aNeeded === null && plannerSub.sNeeded === null) : false;

    // Only show detailed fallback in A cell (targetGrade === 80) if both are impossible.
    // Otherwise, show a clean "Impossible" text.
    const shouldShowFallback = (targetGrade === 80 && bothImpossible);

    if (!shouldShowFallback) {
      return <span className="text-red-500 text-xs font-bold">Impossible</span>;
    }

    // It's impossible (neededScore === null) and we need to show the fallback
    // Find highest achievable grade under this assumed ESA score
    let maxGrade = null;
    let maxGradeNeeded = null;

    const subEsaVal = individualEsa[subId] !== undefined && individualEsa[subId] !== ''
      ? individualEsa[subId]
      : assumedEsa;

    const gradesToCheck = [
      { grade: 'S', score: 90 },
      { grade: 'A', score: 80 },
      { grade: 'B', score: 70 },
      { grade: 'C', score: 60 },
      { grade: 'D', score: 50 },
      { grade: 'E', score: 40 }
    ];

    for (let g of gradesToCheck) {
      const mockMarks = {
        ...marks,
        [subId]: {
          ...m,
          isa2: '', // Force empty so we calculate achievable grades regardless of actual entry
          esa: parseFloat(subEsaVal) || 0,
          esaMax: 100
        }
      };
      const req = getRequiredISA2ForGradePure(sub, g.score, { assumeFullForEmptyInternals: true }, mockMarks);
      if (req && req.needed !== null) {
        maxGrade = g.grade;
        maxGradeNeeded = req.needed;
        break;
      }
    }

    if (!maxGrade) {
      return <span className="text-red-500 text-xs font-bold">Impossible</span>;
    }

    return (
      <div className="flex flex-col items-center justify-center">
        <span className="text-red-500 text-[10px] font-bold leading-none">Impossible</span>
        <span className="text-zinc-400 text-[9px] mt-1 leading-none font-medium">
          Max: <strong className="text-yellow-400 font-bold">{maxGrade}</strong>
        </span>
        <span className="text-zinc-500 text-[9px] mt-0.5 leading-none">
          ({maxGradeNeeded}/{isa2Max} needed)
        </span>
      </div>
    );
  };

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
              onChange={(e) => {
                const val = e.target.value;
                setTargetSgpa(val === '' ? '' : parseFloat(val));
              }}
              className="w-16 p-1 bg-transparent text-right font-bold text-zinc-200 border-none focus:ring-0 focus:outline-none text-lg"
            />
          </div>
        </div>

        {/* Grid with Range */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
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

          {/* Momentum */}
          <div className="bg-indigo-900/40 rounded-lg p-4 border border-indigo-500/30 relative overflow-hidden col-span-2 md:col-span-1">
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
            <div className="col-span-4">Subject</div>
            <div className="col-span-2 text-center">Momentum</div>
            <div className="col-span-2 text-center text-zinc-200/90">Pass (40)</div>
            <div className="col-span-2 text-center">For A (80)</div>
            <div className="col-span-2 text-center">For S (90)</div>
          </div>

          {metrics.analysisData.map((d, i) => {
            const sub = subjects.find(s => s.id === d.id);
            const reqPass = getRequiredESAForGrade(sub, 40, true, { useMomentumIsa2: true, useMomentumInternals: true });
            const isa2Label = sub?.customConfig?.labels?.isa2 || 'ISA 2';
            const assignmentLabel = sub?.customConfig?.labels?.assignment || 'Assignment';
            const assignmentLabelShort = assignmentLabel === 'Assignment' ? 'Asg' : assignmentLabel;
            const labLabel = sub?.customConfig?.labels?.lab || 'Lab';

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
                  <div className="md:col-span-4 truncate text-zinc-200 font-bold md:font-medium text-sm">
                    {d.name}
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
                    {renderEsaCell(reqPass.safe, reqPass.minimum, 40, reqPass.requiresRounding, d.id)}
                  </div>
 
                  {/* 3. Target A */}
                  <div className="bg-black/30 md:bg-transparent p-2 md:p-0 rounded-lg flex flex-col items-center md:block md:col-span-2 md:text-center">
                    <span className="md:hidden text-[9px] text-zinc-500 uppercase font-bold mb-1">For A (80)</span>
                    {renderEsaCell(d.reqA, d.reqAMin, 80, d.reqARequiresRounding, d.id)}
                  </div>
 
                  {/* 4. Target S */}
                  <div className="bg-black/30 md:bg-transparent p-2 md:p-0 rounded-lg flex flex-col items-center md:block md:col-span-2 md:text-center">
                    <span className="md:hidden text-[9px] text-zinc-500 uppercase font-bold mb-1">For S (90)</span>
                    {renderEsaCell(d.reqS, d.reqSMin, 90, d.reqSRequiresRounding, d.id)}
                  </div>
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
              The momentum score assumes you maintain your current average in future exams. There is a &lt;1% chance this will be your exact final score. <strong>Don't stress over it!</strong> If ISA2 is empty, the Pass/A/S ESA requirements use a momentum-projected ISA2 score and are estimates. When Assignment or Lab is empty, momentum assumes full marks for those components.
            </div>
          </details>
        </div>
      </div>

      {/* Smart Strategy Panel */}
      <div className="bg-[#0c0c14]/90 backdrop-blur-sm rounded-xl shadow-2xl shadow-black/20 p-4 md:p-6 text-zinc-200 border border-white/[0.06]">
        <details className="group">
          <summary className="flex items-center justify-between cursor-pointer list-none select-none">
            <div className="text-lg font-bold flex items-center gap-2 text-green-400">
              <Lightbulb className="w-5 h-5" /> Path to Target ({targetSgpa} SGPA)
            </div>
            <ChevronDown className="w-4 h-4 opacity-60 transition-transform group-open:rotate-180" />
          </summary>

          <div className="mt-4">
            {strategy.plan.length === 0 && !strategy.impossible && parseFloat(metrics.momentumSGPA) >= (parseFloat(targetSgpa) || 0) ? (
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

      {/* ==================== ISA 2 TARGET PLANNER (Collapsible) ==================== */}
      <div className={`${themeClasses.card} border rounded-xl overflow-hidden mt-6`}>
        <details className="group">
          <summary className="flex items-center justify-between p-4 cursor-pointer list-none select-none hover:bg-white/[0.03] transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-500/10 text-yellow-400 flex items-center justify-center shadow-sm">
                <Target className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-sm text-zinc-200">ISA 2 Target Planner</h3>
                <p className={`text-xs ${themeClasses.muted} mt-0.5`}>
                  Calculate what ISA 2 scores you need to make final ESA exams easy
                </p>
              </div>
            </div>
            <ChevronDown className="w-5 h-5 opacity-50 transition-transform group-open:rotate-180" />
          </summary>

          <div className={`p-4 border-t ${themeClasses.border} bg-black/20`}>
            <p className={`text-xs ${themeClasses.muted} mb-4 leading-relaxed`}>
              This planner helps you target the right score in your upcoming ISA 2 exam. You choose what ESA score you want to be comfortable with in the finals, and we show what ISA 2 mark is required.
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-white/[0.02] p-4 rounded-lg border border-white/[0.04]">
              <div className="text-left">
                <span className="text-xs text-zinc-300 font-medium block">Fixed Assumed ESA Performance Score (0-100):</span>
                <span className={`text-[10px] ${themeClasses.muted}`}>All subject target calculations assume you score exactly this in the final ESA exam</span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto bg-[#0a0a10]/50 border border-white/[0.1] rounded-lg px-3 py-1.5 focus-within:border-indigo-500 transition-colors">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={assumedEsa}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') {
                      setAssumedEsa('');
                    } else {
                      const parsed = parseInt(val);
                      setAssumedEsa(isNaN(parsed) ? 0 : Math.min(100, Math.max(0, parsed)));
                    }
                  }}
                  className="bg-transparent text-right font-bold text-zinc-200 border-none focus:ring-0 focus:outline-none text-xs w-12 p-0"
                />
                <span className="text-zinc-500 text-xs font-semibold select-none">/100 ESA</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`border-b ${themeClasses.border} text-zinc-400`}>
                    <th className="text-left py-2 px-2 font-bold whitespace-nowrap">Subject</th>
                    <th className="text-center py-2 px-2 font-bold whitespace-nowrap">Assumed ESA</th>
                    <th className="text-center py-2 px-2 font-bold text-red-400">To Pass (40)</th>
                    <th className="text-center py-2 px-2 font-bold text-blue-400">For A (80)</th>
                    <th className="text-center py-2 px-2 font-bold text-green-400">For S (90)</th>
                  </tr>
                </thead>
                <tbody>
                  {isa2PlannerData.map(sub => (
                    <tr key={sub.id} className={`border-b ${themeClasses.border} hover:bg-white/[0.04]`}>
                      <td className="py-3 px-2 font-medium max-w-[150px] sm:max-w-none">
                        <div className="truncate font-bold text-zinc-200" title={sub.name}>
                          {sub.name}
                        </div>
                        <div className={`text-[10px] ${themeClasses.muted}`}>{sub.credits} Cr</div>
                      </td>

                      {sub.status === 'N/A' ? (
                        <td colSpan={4} className="text-center py-3 px-2 text-zinc-500 text-xs italic">
                          No ISA 2 exam component for this subject
                        </td>
                      ) : (
                        <>
                          <td className="text-center py-3 px-2">
                            <div className="flex items-center justify-center">
                              <div className="flex items-center gap-1 bg-[#0a0a10]/50 border border-white/[0.1] rounded px-2 py-1 focus-within:border-indigo-500 transition-colors w-16">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  placeholder={assumedEsa || 0}
                                  value={individualEsa[sub.id] ?? ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setIndividualEsa(prev => {
                                      const next = { ...prev };
                                      if (val === '') {
                                        delete next[sub.id];
                                      } else {
                                        const parsed = parseInt(val);
                                        next[sub.id] = isNaN(parsed) ? 0 : Math.min(100, Math.max(0, parsed));
                                      }
                                      return next;
                                    });
                                  }}
                                  className="bg-transparent text-center font-bold text-zinc-200 border-none focus:ring-0 focus:outline-none text-xs w-full p-0 placeholder-zinc-500"
                                />
                              </div>
                            </div>
                          </td>
                          <td className="text-center py-3 px-2">
                            {renderIsa2Cell(sub.passNeeded, 40, sub.id)}
                          </td>
                          <td className="text-center py-3 px-2">
                            {renderIsa2Cell(sub.aNeeded, 80, sub.id)}
                          </td>
                          <td className="text-center py-3 px-2">
                            {renderIsa2Cell(sub.sNeeded, 90, sub.id)}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </details>
      </div>

      {/* ==================== MINIMUM ESA SCORES NEEDED TABLE (Collapsible) ==================== */}
      <div className={`${themeClasses.card} border rounded-xl overflow-hidden mt-6`}>
        <details className="group">
          <summary className="flex items-center justify-between p-4 cursor-pointer list-none select-none hover:bg-white/[0.03] transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center shadow-sm">
                <Calculator className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-sm text-zinc-200">Minimum ESA Scores Needed</h3>
                <p className={`text-xs ${themeClasses.muted} mt-0.5`}>
                  Quick reference table of minimum ESA marks required for each grade in each subject
                </p>
              </div>
            </div>
            <ChevronDown className="w-5 h-5 opacity-50 transition-transform group-open:rotate-180" />
          </summary>

          <div className={`p-4 border-t ${themeClasses.border} bg-black/20 overflow-x-auto`}>
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
        </details>
      </div>
    </div>
  );
}
