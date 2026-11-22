import React from 'react';
import { Check, X, ChevronDown, Lightbulb } from 'lucide-react';
import { getRequiredISA2ForGrade as getRequiredISA2ForGradePure } from '../utils/calculations';

function Chevron() {
  return <ChevronDown className="chev" />;
}

// A labelled cell: label is shown on phones only (desktop uses column headers).
function Cell({ label, children, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-md bg-canvas p-2 md:block md:bg-transparent md:p-0 md:text-center ${className}`}>
      <span className="mb-1 text-xs text-ink-3 md:hidden">{label}</span>
      {children}
    </div>
  );
}

function Impossible({ maxGrade, detail }) {
  return (
    <div className="flex flex-col items-center text-center leading-tight">
      <span className="text-xs font-semibold text-bad">Impossible</span>
      {maxGrade && (
        <>
          <span className="mt-1 text-xs text-ink-2">Best: <strong className="text-ink">{maxGrade}</strong></span>
          <span className="text-xs text-ink-3">{detail}</span>
        </>
      )}
    </div>
  );
}

function Secured() {
  return (
    <span className="inline-flex items-center gap-1 text-sm font-medium text-good">
      <Check className="h-4 w-4" /> Secured
    </span>
  );
}

export default function AnalysisTab({
  targetSgpa,
  setTargetSgpa,
  sgpaRange,
  sgpa,
  metrics,
  subjects,
  marks,
  getRequiredESAForGrade,
  strategy,
  minimumPassingTable,
}) {
  const [assumedEsa, setAssumedEsa] = React.useState(60);
  const [individualEsa, setIndividualEsa] = React.useState({});

  // Helper to calculate targets for ISA 2 Planner
  const isa2PlannerData = subjects.map((sub) => {
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
          esaMax: 100,
        },
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
      sNeeded: sReq ? sReq.needed : null,
    };
  });

  const renderEsaCell = (safeScore, minScore, targetScore, requiresRounding, subId) => {
    if (safeScore === null) {
      // Find highest achievable grade
      const subReq = minimumPassingTable.find((s) => s.id === subId);
      const possibleGrades = subReq?.gradeRequirements?.filter((g) => g.possible) || [];

      if (possibleGrades.length === 0) return <Impossible />;

      // Check if both A (80) and S (90) are impossible
      const d = metrics?.analysisData?.find((x) => x.id === subId);
      const bothImpossible = d ? (d.reqA === null && d.reqS === null) : false;

      // Only show the detailed fallback in the A cell if BOTH are impossible.
      const shouldShowFallback = (targetScore === 80 && bothImpossible);
      if (!shouldShowFallback) return <Impossible />;

      const maxGrade = possibleGrades.reduce((max, curr) => (curr.gp > (max?.gp || 0) ? curr : max), possibleGrades[0]);
      return <Impossible maxGrade={maxGrade.grade} detail={`${maxGrade.requiredEsa} needed`} />;
    }

    if (safeScore === 0) return <Secured />;

    return (
      <div className="flex flex-col items-center leading-tight">
        <span className={`num text-lg font-semibold md:text-base ${requiresRounding ? 'text-warn' : 'text-ink'}`}>
          {safeScore}
        </span>
        {minScore !== null && minScore < safeScore && (
          <span className="num text-xs text-ink-3">min {minScore}</span>
        )}
        {requiresRounding && <span className="text-xs text-warn">needs rounding</span>}
      </div>
    );
  };

  const renderIsa2Cell = (neededScore, targetGrade, subId) => {
    const sub = subjects.find((s) => s.id === subId);
    const m = marks?.[subId] || {};
    const isa2Max = m.isa2Max ?? sub?.isa2Max ?? 40;

    if (neededScore === 0) return <Secured />;

    if (neededScore !== null) {
      return (
        <span className="num font-semibold text-ink">
          {neededScore}
          <span className="text-xs font-normal text-ink-3">/{isa2Max}</span>
        </span>
      );
    }

    // Check if both A (80) and S (90) needed scores are impossible
    const plannerSub = isa2PlannerData.find((x) => x.id === subId);
    const bothImpossible = plannerSub ? (plannerSub.aNeeded === null && plannerSub.sNeeded === null) : false;

    const shouldShowFallback = (targetGrade === 80 && bothImpossible);
    if (!shouldShowFallback) return <Impossible />;

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
      { grade: 'E', score: 40 },
    ];

    for (const g of gradesToCheck) {
      const mockMarks = {
        ...marks,
        [subId]: {
          ...m,
          isa2: '', // Force empty so we calculate achievable grades regardless of actual entry
          esa: parseFloat(subEsaVal) || 0,
          esaMax: 100,
        },
      };
      const req = getRequiredISA2ForGradePure(sub, g.score, { assumeFullForEmptyInternals: true }, mockMarks);
      if (req && req.needed !== null) {
        maxGrade = g.grade;
        maxGradeNeeded = req.needed;
        break;
      }
    }

    if (!maxGrade) return <Impossible />;
    return <Impossible maxGrade={maxGrade} detail={`${maxGradeNeeded}/${isa2Max} needed`} />;
  };

  const rangeLeft = (sgpaRange.min / 10) * 100;
  const rangeRight = 100 - (sgpaRange.max / 10) * 100;
  const currentPos = (Math.min(Math.max(sgpa, sgpaRange.min), sgpaRange.max) / 10) * 100;
  const onTrack = strategy.plan.length === 0 && !strategy.impossible && parseFloat(metrics.momentumSGPA) >= (parseFloat(targetSgpa) || 0);

  return (
    <div className="space-y-4">
      {/* Target + range */}
      <section className="panel panel-pad">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-base font-semibold text-ink">Your target</h2>
            <p className="text-sm text-ink-2">Set the SGPA you are aiming for.</p>
          </div>
          <label className="flex items-center gap-3 rounded-md border border-line-strong bg-surface px-3 py-2">
            <span className="text-sm text-ink-2">Target SGPA</span>
            <input
              type="number"
              step="0.1"
              max="10"
              min="5"
              inputMode="decimal"
              value={targetSgpa}
              onChange={(e) => {
                const val = e.target.value;
                setTargetSgpa(val === '' ? '' : parseFloat(val));
              }}
              className="num w-16 border-none bg-transparent p-0 text-right text-xl font-semibold text-ink focus:outline-none focus:ring-0"
            />
          </label>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="inset p-4 md:col-span-2">
            <div className="text-xs text-ink-3">Achievable range with the marks you have so far</div>
            <div className="num mt-1 text-2xl font-semibold text-ink">
              {sgpaRange.min} <span className="text-sm font-normal text-ink-3">to</span> {sgpaRange.max}
            </div>
            <div className="relative mt-3 h-2 rounded-full bg-raised">
              <div className="absolute h-full rounded-full bg-accent/30" style={{ left: `${rangeLeft}%`, right: `${rangeRight}%` }} />
              <div className="absolute top-1/2 h-4 w-1 -translate-y-1/2 rounded bg-ink" style={{ left: `${currentPos}%` }} />
            </div>
            <div className="num mt-1.5 flex justify-between text-xs text-ink-3">
              <span>{sgpaRange.min}</span>
              <span className="font-medium text-ink">Now {sgpa}</span>
              <span>{sgpaRange.max}</span>
            </div>
          </div>

          <div className="inset p-4">
            <div className="text-xs text-ink-3">Momentum SGPA</div>
            <div className="num mt-1 text-2xl font-semibold text-ink">{metrics.momentumSGPA}</div>
            <p className="mt-1 text-xs text-ink-3">If your ESAs go as well as your ISAs have.</p>
          </div>
        </div>
      </section>

      {/* Per-subject targets */}
      <section className="panel panel-pad">
        <div className="mb-3">
          <h2 className="text-base font-semibold text-ink">What you need in each ESA</h2>
          <p className="text-sm text-ink-2">Marks needed in the ESA, based on how you are doing in the internals.</p>
        </div>

        <div className="mb-1 hidden grid-cols-12 gap-2 border-b border-line pb-2 text-xs text-ink-3 md:grid">
          <div className="col-span-4">Subject</div>
          <div className="col-span-2 text-center">Momentum score</div>
          <div className="col-span-2 text-center">To pass (40)</div>
          <div className="col-span-2 text-center">For A (80)</div>
          <div className="col-span-2 text-center">For S (90)</div>
        </div>

        <div className="space-y-2.5 md:space-y-0">
          {metrics.analysisData.map((d) => {
            const sub = subjects.find((s) => s.id === d.id);
            const reqPass = getRequiredESAForGrade(sub, 40, true, { useMomentumIsa2: true, useMomentumInternals: true });
            const isa2Label = sub?.customConfig?.labels?.isa2 || 'ISA 2';
            const assignmentLabel = sub?.customConfig?.labels?.assignment || 'Assignment';
            const assignmentLabelShort = assignmentLabel === 'Assignment' ? 'Asg' : assignmentLabel;
            const labLabel = sub?.customConfig?.labels?.lab || 'Lab';

            return (
              <div
                key={d.id}
                className="rounded-lg border border-line p-3 md:grid md:grid-cols-12 md:items-center md:gap-2 md:rounded-none md:border-0 md:border-b md:px-0 md:py-3 md:last:border-b-0"
              >
                <div className="mb-3 truncate text-sm font-semibold text-ink md:col-span-4 md:mb-0" title={d.name}>
                  {d.name}
                  <span className="ml-2 text-xs font-normal text-ink-3">{d.credits} cr</span>
                </div>

                <div className="grid grid-cols-2 gap-2 md:contents">
                  <Cell label="Momentum score" className="md:col-span-2">
                    <span className="num text-lg font-semibold text-ink md:text-base">{d.momentumScore}</span>
                    {d.momentumIsa2Marks !== null && (
                      <span className="block text-xs text-ink-3">{isa2Label} est. {d.momentumIsa2Marks}/{d.isa2Max}</span>
                    )}
                    {d.momentumAssignmentMarks !== null && (
                      <span className="block text-xs text-ink-3">{assignmentLabelShort} est. {d.momentumAssignmentMarks}/{d.assignmentMax}</span>
                    )}
                    {d.momentumLabMarks !== null && (
                      <span className="block text-xs text-ink-3">{labLabel} est. {d.momentumLabMarks}/{d.labMax}</span>
                    )}
                  </Cell>

                  <Cell label="To pass (40)" className="md:col-span-2">
                    {renderEsaCell(reqPass.safe, reqPass.minimum, 40, reqPass.requiresRounding, d.id)}
                  </Cell>

                  <Cell label="For A (80)" className="md:col-span-2">
                    {renderEsaCell(d.reqA, d.reqAMin, 80, d.reqARequiresRounding, d.id)}
                  </Cell>

                  <Cell label="For S (90)" className="md:col-span-2">
                    {renderEsaCell(d.reqS, d.reqSMin, 90, d.reqSRequiresRounding, d.id)}
                  </Cell>
                </div>
              </div>
            );
          })}
        </div>

        <div className="notice notice-info mt-4 flex items-start gap-2 text-xs">
          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            The big number is the <strong className="font-medium text-ink">safe</strong> ESA score that guarantees the grade. &ldquo;min&rdquo; is the lowest score that might work thanks to rounding up, but aim for the safe one.
          </p>
        </div>

        <details className="disclosure mt-3">
          <summary>
            <span>About the momentum numbers</span>
            <Chevron />
          </summary>
          <p className="mt-2 text-sm leading-relaxed text-ink-2">
            Momentum assumes you keep your current average in the exams still to come, so treat it as an estimate, not a prediction. If ISA 2 is empty, the pass/A/S requirements use a projected ISA 2 score. If Assignment or Lab is empty, momentum assumes full marks for them.
          </p>
        </details>
      </section>

      {/* Path to target */}
      <details className="disclosure panel">
        <summary className="p-4">
          <span className="text-left">
            <span className="block text-sm font-semibold text-ink">Path to {targetSgpa} SGPA</span>
            <span className="block text-xs font-normal text-ink-3">The most efficient ESA upgrades to reach your target</span>
          </span>
          <Chevron />
        </summary>

        <div className="border-t border-line p-4">
          {onTrack ? (
            <div className="notice notice-good">
              <p className="font-medium">You&apos;re on track.</p>
              <p className="text-xs opacity-90">Your current momentum already meets your target.</p>
            </div>
          ) : strategy.impossible ? (
            <div className="notice notice-bad">
              <p className="font-medium">Target not reachable.</p>
              <p className="text-xs opacity-90">It is mathematically impossible with your current internals.</p>
            </div>
          ) : (
            <>
              <p className="mb-2 text-sm text-ink-2">The most efficient upgrades, in order:</p>
              <ol className="space-y-2">
                {strategy.plan.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3 rounded-md border border-line p-3">
                    <span className="num flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-raised text-xs font-semibold text-ink-2">{idx + 1}</span>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-ink">{step.name}</div>
                      <div className="mt-0.5 text-sm text-ink-2">
                        <span className="num font-semibold text-ink">{step.esaNeeded}/{step.esaMax}</span> in the ESA for a <span className="font-semibold text-ink">{step.toGrade}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </>
          )}
        </div>
      </details>

      {/* ISA 2 planner */}
      <details className="disclosure panel">
        <summary className="p-4">
          <span className="text-left">
            <span className="block text-sm font-semibold text-ink">ISA 2 target planner</span>
            <span className="block text-xs font-normal text-ink-3">What to score in ISA 2 to make the final ESA easier</span>
          </span>
          <Chevron />
        </summary>

        <div className="space-y-4 border-t border-line p-4">
          <p className="text-sm text-ink-2">
            Choose the ESA score you would be comfortable with, and this shows the ISA 2 mark you need to still land each grade.
          </p>

          <div className="inset flex flex-col justify-between gap-3 p-3 sm:flex-row sm:items-center">
            <div>
              <div className="text-sm font-medium text-ink">Assumed ESA score</div>
              <div className="text-xs text-ink-3">Used for every subject unless you override it below</div>
            </div>
            <label className="flex items-center gap-2 rounded-md border border-line-strong bg-surface px-3 py-1.5">
              <input
                type="number"
                min="0"
                max="100"
                inputMode="numeric"
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
                className="num w-12 border-none bg-transparent p-0 text-right font-semibold text-ink focus:outline-none focus:ring-0"
              />
              <span className="text-xs text-ink-3">/ 100</span>
            </label>
          </div>

          <div className="overflow-x-auto">
            <table className="table-clean">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th className="text-center">Assumed ESA</th>
                  <th className="text-center">To pass (40)</th>
                  <th className="text-center">For A (80)</th>
                  <th className="text-center">For S (90)</th>
                </tr>
              </thead>
              <tbody>
                {isa2PlannerData.map((sub) => (
                  <tr key={sub.id}>
                    <td className="max-w-[170px] sm:max-w-none">
                      <div className="truncate font-medium" title={sub.name}>{sub.name}</div>
                      <div className="text-xs text-ink-3">{sub.credits} credits</div>
                    </td>

                    {sub.status === 'N/A' ? (
                      <td colSpan={4} className="text-center text-xs text-ink-3">
                        No ISA 2 exam for this subject
                      </td>
                    ) : (
                      <>
                        <td className="text-center">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            inputMode="numeric"
                            placeholder={assumedEsa || 0}
                            aria-label={`Assumed ESA for ${sub.name}`}
                            value={individualEsa[sub.id] ?? ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setIndividualEsa((prev) => {
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
                            className="input num mx-auto w-16 px-1 py-1 text-center"
                          />
                        </td>
                        <td className="text-center">{renderIsa2Cell(sub.passNeeded, 40, sub.id)}</td>
                        <td className="text-center">{renderIsa2Cell(sub.aNeeded, 80, sub.id)}</td>
                        <td className="text-center">{renderIsa2Cell(sub.sNeeded, 90, sub.id)}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </details>

      {/* Minimum ESA table */}
      <details className="disclosure panel">
        <summary className="p-4">
          <span className="text-left">
            <span className="block text-sm font-semibold text-ink">Minimum ESA scores for every grade</span>
            <span className="block text-xs font-normal text-ink-3">A quick reference for each subject</span>
          </span>
          <Chevron />
        </summary>

        <div className="space-y-4 overflow-x-auto border-t border-line p-4">
          <table className="table-clean">
            <thead>
              <tr>
                <th>Subject</th>
                {['E (40)', 'D (50)', 'C (60)', 'B (70)', 'A (80)', 'S (90)'].map((h) => (
                  <th key={h} className="text-center">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {minimumPassingTable.map((sub) => (
                <tr key={sub.id}>
                  <td className="max-w-[170px] sm:max-w-none">
                    <div className="truncate font-medium" title={sub.name}>{sub.name}</div>
                    <div className="text-xs text-ink-3">{sub.credits} credits &middot; ESA out of {sub.esaMax}</div>
                  </td>

                  {['E', 'D', 'C', 'B', 'A', 'S'].map((grade) => {
                    const req = sub.gradeRequirements.find((g) => g.grade === grade);
                    const isa2MiniLine = req?.showIsa2Needed ? (
                      req.isa2Needed === null ? (
                        <div className="text-xs leading-none text-bad">ISA 2: not possible</div>
                      ) : (
                        <div className="num text-xs leading-none text-ink-3">ISA 2: {req.isa2Needed}/{req.isa2Max}</div>
                      )
                    ) : null;
                    return (
                      <td key={grade} className="text-center">
                        {!req?.possible ? (
                          <div className="space-y-1">
                            <X className="mx-auto h-4 w-4 text-bad" aria-label="Not possible" />
                            {isa2MiniLine}
                          </div>
                        ) : req.alreadyAchieved ? (
                          <div className="space-y-1">
                            <Check className="mx-auto h-4 w-4 text-good" aria-label="Already achieved" />
                            {isa2MiniLine}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <span className={`num font-semibold ${req.requiresRounding || req.hard ? 'text-warn' : 'text-ink'}`}>
                              {req.requiredEsa}
                              {req.requiresRounding && '*'}
                            </span>
                            {req.minimumEsa !== null && req.minimumEsa < req.requiredEsa && (
                              <div className="num text-xs text-ink-3">({req.minimumEsa})</div>
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

          <div className="flex flex-wrap gap-x-5 gap-y-1 border-t border-line pt-3 text-xs text-ink-3">
            <span className="flex items-center gap-1"><Check className="h-3.5 w-3.5 text-good" /> Already achieved</span>
            <span className="flex items-center gap-1"><X className="h-3.5 w-3.5 text-bad" /> Not possible</span>
            <span><span className="font-medium text-warn">Amber</span> = above 75, or needs rounding luck (*)</span>
            <span><span className="num">(xx)</span> best case with rounding</span>
          </div>
        </div>
      </details>
    </div>
  );
}
