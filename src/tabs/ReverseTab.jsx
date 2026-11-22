import React from 'react';
import {
  AlertTriangle, ChevronDown, Lock, Unlock, Dice5, Scale, Check, X,
} from 'lucide-react';

function Chevron() {
  return <ChevronDown className="chev" />;
}

export default function ReverseTab({
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
  GradeMap,
}) {
  const hasEsaEntered = subjects.some((sub) => (marks[sub.id]?.esa && parseFloat(marks[sub.id]?.esa) > 0));

  return (
    <div className="space-y-4">
      {/* Goal */}
      <section className="panel panel-pad space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <label className="block">
            <span className="label">The SGPA you want</span>
            <input
              type="number"
              step="0.1"
              min="5"
              max="10"
              inputMode="decimal"
              value={reverseTargetSgpa}
              onChange={(e) => {
                const val = e.target.value;
                setReverseTargetSgpa(val === '' ? '' : parseFloat(val));
              }}
              className="input num w-full text-center text-xl font-semibold sm:w-36"
            />
          </label>

          <div>
            <span className="label">How safe should the ESA scores be?</span>
            <div className="seg" role="group" aria-label="ESA mode">
              <button type="button" className="seg-item" aria-pressed={reverseEsaMode === 'safe'} onClick={() => setReverseEsaMode('safe')}>Safe</button>
              <button type="button" className="seg-item" aria-pressed={reverseEsaMode === 'min'} onClick={() => setReverseEsaMode('min')}>Minimum</button>
            </div>
          </div>
        </div>
        <p className="text-xs text-ink-3">Minimum relies on rounding going your way. Safe guarantees the grade.</p>

        {!reverseResults.isTargetAchievable && (
          <div className="notice notice-bad">
            Your target isn&apos;t reachable. The most you can get is <strong className="num">{reverseResults.achievableSGPA}</strong>.
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 border-t border-line pt-4">
          <span className="mr-1 text-sm text-ink-2">Try another way to get there:</span>
          <button type="button" onClick={() => setShuffledResults(calculateRandomPath())} className="btn btn-secondary btn-sm" title="Find a different combination of grades">
            <Dice5 className="h-4 w-4" /> Shuffle
          </button>
          <button type="button" onClick={() => setShuffledResults(calculateBalancedPath())} className="btn btn-secondary btn-sm" title="Keep scores even across subjects">
            <Scale className="h-4 w-4" /> Balanced
          </button>
          {shuffledResults && (
            <button type="button" onClick={() => setShuffledResults(null)} className="btn btn-ghost btn-sm">
              Back to the cheapest path
            </button>
          )}
        </div>

        <details className="disclosure">
          <summary>
            <span>Why are some scores very high or low?</span>
            <Chevron />
          </summary>
          <div className="mt-3 space-y-2 text-sm leading-relaxed text-ink-2">
            <p>
              The default result is the <strong className="font-medium text-ink">cheapest path</strong>: it upgrades the subjects where a few extra marks jump a whole grade, even if that means asking for 98 in one of them.
            </p>
            <p>
              To fix a score that looks unrealistic, lock the subject (the padlock) and type the score you are confident of. Everything else is recalculated around it.
            </p>
            <p>
              Or press <strong className="font-medium text-ink">Balanced</strong> for an even spread, or <strong className="font-medium text-ink">Shuffle</strong> for a different combination.
            </p>
          </div>
        </details>
      </section>

      {hasEsaEntered && (
        <details className="disclosure notice notice-warn">
          <summary className="!text-warn">
            <span className="flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Some subjects have ESA marks and are locked</span>
            <Chevron />
          </summary>
          <div className="mt-3 space-y-2 border-t border-warn/20 pt-3 text-sm">
            <p>Subjects with an ESA score entered are treated as fixed and are not calculated.</p>
            <p>To predict one of them instead, clear its ESA score on the Subjects page.</p>
            <button type="button" onClick={() => setActiveTab('subjects')} className="btn btn-secondary btn-sm">
              Go to Subjects
            </button>
          </div>
        </details>
      )}

      {reverseResults.usingMomentum && (
        <div className="notice notice-info text-sm">
          <p className="font-medium text-ink">Some marks are still empty, so this uses estimates.</p>
          <p className="mt-1 text-xs leading-relaxed">
            Missing ISA 2 is projected from ISA 1, empty Assignment or Lab count as full marks, and the ESA is estimated from your internals. That is optimistic, so the maximum SGPA can look higher than reality until you enter real marks.
          </p>
        </div>
      )}

      {/* Subject results */}
      <section className="panel divide-y divide-line">
        <div className="hidden grid-cols-12 gap-2 px-4 py-2 text-xs text-ink-3 md:grid">
          <div className="col-span-5">Subject</div>
          <div className="col-span-3">Target grade</div>
          <div className="col-span-3 text-right">ESA needed</div>
          <div className="col-span-1" />
        </div>

        {(shuffledResults || reverseResults.results).map((sub, i) => {
          const baseSubject = subjects.find((s) => s.id === sub.id);
          const baseMetrics = baseSubject ? getSubjectMetrics(baseSubject) : null;
          const m = marks[sub.id] || {};
          const hasEsa = m.esa !== '' && m.esa !== undefined && !isNaN(parseFloat(m.esa));
          const isManualLock = lockedSubjects[sub.id] !== undefined && !sub.isHardLocked;

          const isa2Label = baseSubject?.customConfig?.labels?.isa2 || 'ISA 2';
          const assignmentLabel = baseSubject?.customConfig?.labels?.assignment || 'Assignment';
          const assignmentLabelShort = assignmentLabel === 'Assignment' ? 'Asg' : assignmentLabel;
          const labLabel = baseSubject?.customConfig?.labels?.lab || 'Lab';

          const assumptions = [];
          if (!hasEsa && !isManualLock) assumptions.push('ESA estimated');
          if (baseMetrics?.momentumIsa2Marks !== null) assumptions.push(`${isa2Label} projected`);
          if (baseMetrics?.momentumAssignmentMarks !== null) assumptions.push(`${assignmentLabelShort} full marks`);
          if (baseMetrics?.momentumLabMarks !== null) assumptions.push(`${labLabel} full marks`);

          const activeMap = baseSubject?.customGradeMap || GradeMap;
          const targetScore = sub.projectedScore ?? activeMap.find((g) => g.grade === sub.projectedGrade)?.min ?? null;
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
            <div key={sub.id ?? i} className="flex items-center justify-between gap-3 px-4 py-3 md:grid md:grid-cols-12 md:gap-2">
              {/* Name and grade */}
              <div className="min-w-0 flex-1 md:col-span-5 md:flex-none">
                <div className="flex items-center gap-1.5">
                  {sub.locked && <Lock className="h-3.5 w-3.5 shrink-0 text-ink-3" />}
                  <span className="truncate text-sm font-semibold text-ink" title={sub.name}>{sub.name}</span>
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-ink-3">
                  <span>{sub.credits} credits</span>
                  <span className="md:hidden">
                    {sub.isImpossible ? <span className="font-medium text-bad">Impossible</span> : <>Target <strong className="text-ink">{sub.projectedGrade}</strong></>}
                  </span>
                </div>
                {assumptions.length > 0 && (
                  <div className="mt-1 text-xs text-ink-3">Assumes: {assumptions.join(', ')}</div>
                )}
              </div>

              <div className="hidden md:col-span-3 md:block">
                {sub.isImpossible
                  ? <span className="text-sm font-medium text-bad">Impossible</span>
                  : <span className="chip text-sm text-ink">{sub.projectedGrade}</span>}
              </div>

              {/* ESA needed */}
              <div className="shrink-0 text-right md:col-span-3">
                {sub.locked ? (
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max={sub.esaMax}
                        inputMode="decimal"
                        disabled={sub.isHardLocked}
                        aria-label={`Locked ESA score for ${sub.name}`}
                        value={sub.isHardLocked ? (marks[sub.id]?.esa || 0) : lockedSubjects[sub.id]}
                        onChange={(e) => {
                          if (sub.isHardLocked) return;
                          const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                          setLockedSubjects((prev) => ({ ...prev, [sub.id]: val }));
                        }}
                        className="input num w-16 px-1 py-1 text-center font-semibold disabled:opacity-60"
                      />
                      <span className="num text-xs text-ink-3">/{sub.esaMax}</span>
                    </div>
                    <span className="mt-0.5 text-xs text-ink-3">{sub.isHardLocked ? 'Entered on Subjects' : 'Your own score'}</span>
                  </div>
                ) : sub.alreadyAchieved ? (
                  <div className="flex flex-col items-end">
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-good"><Check className="h-4 w-4" /> Secured</span>
                    <span className="text-xs text-ink-3">0 needed</span>
                  </div>
                ) : sub.isImpossible ? (
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-bad"><X className="h-4 w-4" /> Not possible</span>
                ) : (
                  <div className="flex flex-col items-end leading-tight">
                    <span className="num text-xl font-semibold text-ink">
                      {primaryEsa !== null ? primaryEsa : sub.requiredEsa}<span className="text-xs font-normal text-ink-3">/{sub.esaMax}</span>
                    </span>
                    {showSecondary && <span className="num text-xs text-ink-3">{secondaryLabel} {secondaryEsa}</span>}
                    {showRounding && <span className="text-xs text-warn">needs rounding</span>}
                  </div>
                )}
                {isa2TargetInfo && (
                  <div className={`mt-1 text-xs ${isa2TargetInfo.needed === null ? 'text-bad' : 'text-ink-3'}`}>
                    {isa2Label} for {sub.projectedGrade || 'target'}: {isa2TargetInfo.needed === null ? 'impossible' : <span className="num">{isa2TargetInfo.needed}/{isa2TargetInfo.max}</span>}
                  </div>
                )}
              </div>

              {/* Lock */}
              <div className="shrink-0 md:col-span-1 md:text-right">
                <button
                  type="button"
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
                  aria-pressed={!!sub.locked}
                  aria-label={sub.locked ? `Unlock ${sub.name}` : `Lock ${sub.name} at a score you choose`}
                  title={sub.locked ? 'Unlock' : 'Lock at a score you choose'}
                  className={`btn btn-sm !px-2 ${sub.locked ? 'btn-secondary' : 'btn-ghost'}`}
                >
                  {sub.locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                </button>
              </div>
            </div>
          );
        })}
      </section>

      <p className="text-sm text-ink-2">
        Lock any subject where you already know roughly what you&apos;ll score, and the rest adjust to make up the difference. There are many grade combinations that reach your target; this shows the one that needs the fewest total marks.
      </p>

      {/* Minimum table */}
      <section className="panel panel-pad space-y-4">
        <div>
          <h2 className="text-base font-semibold text-ink">Minimum ESA scores for every grade</h2>
          <p className="text-sm text-ink-2">A quick reference for each subject.</p>
        </div>

        <div className="space-y-4 overflow-x-auto">
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
      </section>
    </div>
  );
}
