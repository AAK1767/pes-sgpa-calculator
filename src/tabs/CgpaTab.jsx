import React, { useState, useEffect } from 'react';
import { Trash2, ChevronDown, Check } from 'lucide-react';

function Chevron() {
  return <ChevronDown className="chev" />;
}

function Stat({ label, value, tone, note }) {
  const color = tone === 'bad' ? 'text-bad' : tone === 'warn' ? 'text-warn' : tone === 'good' ? 'text-good' : 'text-ink';
  return (
    <div className="inset flex flex-col justify-between p-4">
      <div>
        <div className="text-xs text-ink-3">{label}</div>
        <div className={`num mt-1 text-3xl font-semibold ${color}`}>{value}</div>
      </div>
      {note && <div className="mt-2 text-xs text-ink-3">{note}</div>}
    </div>
  );
}

export default function CgpaTab({
  semesterData,
  updateSemester,
  resetCGPA,
  simpleCgpa,
  setSimpleCgpa,
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
  const completedSems = semesterData.filter((s) => s.sgpa && s.credits);
  const totalCompletedCredits = completedSems.reduce((sum, s) => sum + parseFloat(s.credits), 0);
  const totalCompletedPoints = completedSems.reduce((sum, s) => sum + (parseFloat(s.sgpa) * parseFloat(s.credits)), 0);
  const currentCgpa = totalCompletedCredits > 0 ? totalCompletedPoints / totalCompletedCredits : 0;

  const processedSemesters = semesterData.map((sem) => {
    const isCompleted = sem.sgpa !== '' && sem.credits !== '';
    let credits = parseFloat(sem.credits);
    if (isNaN(credits) || sem.credits === '') {
      if (sem.id === 7) {
        credits = 8;
      } else if (sem.id === 8) {
        credits = 12;
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

  const futureActiveSems = processedSemesters.filter((sem) => !sem.isCompleted && !excludedSemesters[sem.id]);
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
  const uncompletedSem1to6 = processedSemesters.filter((sem) => sem.id <= 6 && !sem.isCompleted);
  const showMax6 = uncompletedSem1to6.length > 0;
  let maxAchievableCgpa6 = null;

  if (showMax6) {
    const sems1to6 = processedSemesters.filter((sem) => sem.id <= 6);
    const totalCredits6 = sems1to6.reduce((sum, s) => sum + s.credits, 0);
    const totalPoints6Max = sems1to6.reduce((sum, s) => {
      if (s.isCompleted) {
        return sum + (parseFloat(s.sgpa) * s.credits);
      }
      return sum + (10.0 * s.credits);
    }, 0);

    if (totalCredits6 > 0) {
      maxAchievableCgpa6 = totalPoints6Max / totalCredits6;
    }
  }

  const cgpaDisplay = (() => {
    const filledSems = semesterData.filter((s) => s.sgpa && s.credits);
    if (filledSems.length === 0) return '0.00';

    const totalPoints = filledSems.reduce((sum, s) => sum + (parseFloat(s.sgpa) * parseFloat(s.credits)), 0);
    const totalCredits = filledSems.reduce((sum, s) => sum + parseFloat(s.credits), 0);

    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
  })();

  const planner = (() => {
    const hasTarget = targetCgpa !== '' && targetCgpa !== undefined && !isNaN(parseFloat(targetCgpa)) && parseFloat(targetCgpa) > 0;
    if (!hasTarget) {
      return (
        <div className="notice notice-warn">
          <p className="font-medium">Enter a target CGPA</p>
          <p className="mt-0.5 text-xs opacity-90">Type the CGPA you want above to see the SGPA you&apos;ll need.</p>
        </div>
      );
    }

    if (completedSems.length === 0) {
      return (
        <div className="notice notice-info">
          <p className="font-medium text-ink">Starting fresh</p>
          <p className="mt-0.5 text-xs">Enter SGPA and credits for completed semesters in the grid above. Until then this assumes {totalFutureCredits} credits are still to come.</p>
        </div>
      );
    }

    if (totalFutureCredits === 0) {
      if (completedSems.length === 8) {
        return (
          <div className="notice notice-good">
            <p className="font-medium">All semesters completed</p>
            <p className="mt-0.5 text-xs">Your final CGPA is <strong className="num text-base">{currentCgpa.toFixed(2)}</strong>.</p>
          </div>
        );
      }

      return (
        <div className="notice notice-warn">
          <p className="font-medium">No future semesters are included</p>
          <p className="mt-0.5 text-xs">Leave at least one semester empty in the grid above and keep it ticked in the list below.</p>
        </div>
      );
    }

    const isImpossible = requiredAverageSgpa > 10.0;
    const isTooEasy = requiredAverageSgpa < 0;
    const roundedReqSgpa = isTooEasy ? '0.00' : requiredAverageSgpa.toFixed(2);
    const reqTone = isImpossible ? 'bad' : parseFloat(roundedReqSgpa) > 9.0 ? 'warn' : 'good';

    const completedPercent = Math.min(100, (totalCompletedCredits / 160) * 100);
    const futurePercent = Math.min(100 - completedPercent, (totalFutureCredits / 160) * 100);

    return (
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Stat
            label="SGPA you need on average"
            value={isImpossible ? 'Not possible' : roundedReqSgpa}
            tone={reqTone}
            note={isImpossible ? 'The target is higher than the maximum you can reach' : `In each of the ${futureActiveSems.length} remaining semesters`}
          />

          <div className="inset flex flex-col justify-between p-4">
            <div>
              <div className="text-xs text-ink-3">Highest CGPA you can reach</div>
              <div className="num mt-1 text-3xl font-semibold text-ink">{maxAchievableCgpa.toFixed(2)}</div>
              {showMax6 && maxAchievableCgpa6 !== null && (
                <div className="mt-2 flex items-center justify-between border-t border-line pt-2 text-xs">
                  <span className="text-ink-3">Highest by Sem 6</span>
                  <span className="num font-semibold text-ink">{maxAchievableCgpa6.toFixed(2)}</span>
                </div>
              )}
            </div>
            <div className="mt-2 text-xs text-ink-3">If you got a perfect 10 in every remaining semester</div>
          </div>

          <div className="inset flex flex-col justify-between p-4">
            <div>
              <div className="text-xs text-ink-3">Credits</div>
              <div className="num mt-2 flex justify-between gap-1 text-sm">
                <span className="text-ink-2">Done <strong className="text-ink">{totalCompletedCredits}</strong></span>
                <span className="text-ink-2">Planned <strong className="text-ink">{totalFutureCredits}</strong></span>
                <span className="text-ink-2">Total <strong className="text-ink">{totalCreditsPlanned}</strong></span>
              </div>
            </div>
            <div className="mt-2 text-xs text-ink-3">Default is 24 credits a semester (Sem 7: 8, Sem 8: 12)</div>
          </div>
        </div>

        {/* Graduation progress */}
        <div className="inset p-4">
          <div className="mb-2 flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
            <span className="text-sm font-medium text-ink">Progress to 160 credits</span>
            <span className="num text-xs text-ink-2">
              {totalCompletedCredits} done + {totalFutureCredits} planned = <strong className={totalCreditsPlanned >= 160 ? 'text-good' : 'text-warn'}>{totalCreditsPlanned}</strong> / 160
            </span>
          </div>

          <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-raised">
            <div style={{ width: `${completedPercent}%` }} className="h-full bg-accent transition-all" title={`${totalCompletedCredits} completed credits`} />
            <div style={{ width: `${futurePercent}%` }} className="h-full bg-accent/35 transition-all" title={`${totalFutureCredits} planned credits`} />
          </div>

          {totalCreditsPlanned < 160 && (
            <p className="mt-2 text-xs text-warn">Your plan is {160 - totalCreditsPlanned} credits short of the 160 needed to graduate. Add semesters or increase credits.</p>
          )}
          {totalCreditsPlanned >= 160 && totalCompletedCredits < 160 && (
            <p className="mt-2 text-xs text-good">On track. Your plan covers the 160 credits needed to graduate.</p>
          )}
          {totalCompletedCredits >= 160 && (
            <p className="mt-2 text-xs font-medium text-good">You&apos;ve completed all 160 required credits.</p>
          )}
        </div>

        {/* Verdict */}
        {isImpossible && (
          <div className="notice notice-bad text-sm">
            <p className="font-medium">A CGPA of {parseFloat(targetCgpa).toFixed(2)} is out of reach</p>
            <p className="mt-0.5 text-xs">Even a 10.00 in every remaining semester only gets you to {maxAchievableCgpa.toFixed(2)}. Lower the target or include more semesters.</p>
          </div>
        )}
        {!isImpossible && parseFloat(roundedReqSgpa) > 9.0 && (
          <div className="notice notice-warn text-sm">
            <p className="font-medium">That needs a high SGPA ({roundedReqSgpa})</p>
            <p className="mt-0.5 text-xs">Including more semesters (like 7 and 8) spreads the load and lowers the average you need.</p>
          </div>
        )}
        {!isImpossible && !isTooEasy && parseFloat(roundedReqSgpa) <= 9.0 && (
          <div className="notice notice-good text-sm">
            <p className="font-medium">This looks achievable</p>
            <p className="mt-0.5 text-xs">Average <strong className="num">{roundedReqSgpa}</strong> SGPA in the remaining semesters to reach a CGPA of <strong className="num">{parseFloat(targetCgpa).toFixed(2)}</strong>.</p>
          </div>
        )}
        {isTooEasy && (
          <div className="notice notice-good text-sm">
            <p className="font-medium">You&apos;ve already hit this target</p>
            <p className="mt-0.5 text-xs">Your CGPA is <strong className="num">{currentCgpa.toFixed(2)}</strong>, above <strong className="num">{parseFloat(targetCgpa).toFixed(2)}</strong>.</p>
          </div>
        )}

        {/* Remaining semesters */}
        <div>
          <div className="mb-2 flex flex-col justify-between gap-1 sm:flex-row sm:items-baseline">
            <h4 className="text-sm font-medium text-ink">Remaining semesters</h4>
            <span className="text-xs text-ink-3">Untick a semester to leave it out of the plan.</span>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
            {processedSemesters.filter((sem) => !sem.isCompleted).map((sem) => {
              const isExcluded = !!excludedSemesters[sem.id];
              return (
                <label
                  key={sem.id}
                  className={`flex cursor-pointer items-center justify-between rounded-md border p-3 transition-colors ${isExcluded ? 'border-line bg-canvas opacity-60' : 'border-line-strong bg-surface'}`}
                >
                  <span className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={!isExcluded}
                      onChange={() => setExcludedSemesters((prev) => ({ ...prev, [sem.id]: !prev[sem.id] }))}
                    />
                    <span>
                      <span className="block text-sm font-medium text-ink">Semester {sem.id}</span>
                      <span className="block text-xs text-ink-3">{sem.credits} credits</span>
                    </span>
                  </span>

                  {isExcluded ? (
                    <span className="text-xs text-ink-3">Left out</span>
                  ) : (
                    <span className="text-right">
                      <span className="block text-xs text-ink-3">Needs</span>
                      <span className={`num text-sm font-semibold ${reqTone === 'bad' ? 'text-bad' : reqTone === 'warn' ? 'text-warn' : 'text-good'}`}>
                        {isImpossible ? 'n/a' : roundedReqSgpa}
                      </span>
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        </div>

        <p className="text-xs leading-relaxed text-ink-3">
          Want different SGPAs in different semesters? Type a predicted SGPA for any semester in the grid at the top, and the remaining blank semesters adjust automatically.
        </p>
      </div>
    );
  })();

  const quickCgpa = (() => {
    const pCgpa = parseFloat(simpleCgpa.prevCgpa) || 0;
    const pCreds = parseFloat(simpleCgpa.prevCredits) || 0;
    const cSgpa = parseFloat(simpleCgpa.currSgpa) || 0;
    const cCreds = parseFloat(simpleCgpa.currCredits) || 0;

    let newCGPA = '0.00';
    if (pCreds + cCreds > 0) {
      const totalPoints = (pCgpa * pCreds) + (cSgpa * cCreds);
      const totalCreds = pCreds + cCreds;
      newCGPA = (totalPoints / totalCreds).toFixed(2);
    }
    return { newCGPA, totalCredits: pCreds + cCreds };
  })();

  return (
    <div className="space-y-4">
      {/* Result */}
      <section className="panel panel-pad text-center">
        <div className="text-sm text-ink-2">Your CGPA</div>
        <div className="num mt-1 text-6xl font-semibold tracking-tight text-ink">{cgpaDisplay}</div>
        <p className="mt-2 text-xs text-ink-3">
          Based on {completedSems.length} semester{completedSems.length === 1 ? '' : 's'} of data
        </p>
      </section>

      {/* Semesters */}
      <section className="panel panel-pad">
        <div className="mb-3 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <p className="text-sm text-ink-2">Enter SGPA and credits for each completed semester. Leave future ones blank.</p>
          <button type="button" onClick={resetCGPA} className="btn btn-danger btn-sm shrink-0">
            <Trash2 className="h-4 w-4" /> Clear history
          </button>
        </div>

        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {semesterData.map((sem) => {
            const filled = !!(sem.sgpa && sem.credits);
            return (
              <div
                key={sem.id}
                className={`flex items-center gap-3 rounded-md border p-3 ${filled ? 'border-line-strong bg-surface' : 'border-line bg-canvas'}`}
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-sm font-semibold ${filled ? 'bg-accent text-accent-ink' : 'bg-raised text-ink-3'}`}>
                  {filled ? <Check className="h-4 w-4" /> : `S${sem.id}`}
                </div>
                <div className="grid flex-1 grid-cols-2 gap-3">
                  <label>
                    <span className="label">Semester {sem.id} SGPA</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={sem.sgpa}
                      onChange={(e) => updateSemester(sem.id, 'sgpa', e.target.value)}
                      placeholder="-"
                      className="input num text-center font-semibold"
                      min="0" max="10" step="0.01"
                    />
                  </label>
                  <label>
                    <span className="label">Credits</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={sem.credits}
                      onChange={(e) => updateSemester(sem.id, 'credits', e.target.value)}
                      placeholder="-"
                      className="input num text-center"
                      min="0" max="30"
                    />
                  </label>
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-ink-3">CGPA = sum of (SGPA &times; credits) &divide; sum of credits</p>
      </section>

      {/* Target planner */}
      <details className="disclosure panel">
        <summary className="p-4">
          <span className="text-left">
            <span className="block text-sm font-semibold text-ink">What SGPA do I need for my target CGPA?</span>
            <span className="block text-xs font-normal text-ink-3">Work out the SGPA to aim for in the semesters still to come</span>
          </span>
          <Chevron />
        </summary>

        <div className="space-y-5 border-t border-line p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="inset p-4">
              <label className="label" htmlFor="target-cgpa">Target CGPA</label>
              <div className="flex items-center gap-3">
                <input
                  id="target-cgpa"
                  type="number"
                  inputMode="decimal"
                  min="1"
                  max="10"
                  step="0.05"
                  value={targetCgpa}
                  onChange={(e) => {
                    let val = parseFloat(e.target.value);
                    if (isNaN(val)) val = '';
                    setTargetCgpa(val);
                  }}
                  className="input num w-24 text-center text-xl font-semibold"
                />
                <div className="flex-1">
                  <input
                    type="range"
                    min="4.0"
                    max="10.0"
                    step="0.1"
                    value={targetCgpa || 8.5}
                    onChange={(e) => setTargetCgpa(parseFloat(e.target.value))}
                    className="h-1.5 w-full cursor-pointer"
                    aria-label="Target CGPA slider"
                  />
                  <div className="num mt-1 flex justify-between text-xs text-ink-3">
                    <span>4.0</span><span>7.0</span><span>8.5</span><span>10.0</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="notice notice-info text-xs leading-relaxed">
              <p className="mb-1 font-medium text-ink">Set your credits first</p>
              Fill in the credits you expect for future semesters in the grid above. They are used to weight the SGPA you need.
            </div>
          </div>

          {planner}
        </div>
      </details>

      {/* Quick estimator */}
      <details className="disclosure panel">
        <summary className="p-4">
          <span className="text-left">
            <span className="block text-sm font-semibold text-ink">Quick CGPA estimator</span>
            <span className="block text-xs font-normal text-ink-3">Combine your previous CGPA with this semester&apos;s SGPA</span>
          </span>
          <Chevron />
        </summary>

        <div className="space-y-4 border-t border-line p-4">
          <div className="grid grid-cols-2 gap-3">
            <label>
              <span className="label">Previous CGPA</span>
              <input
                type="number"
                inputMode="decimal"
                placeholder="e.g. 8.5"
                value={simpleCgpa.prevCgpa}
                onChange={(e) => setSimpleCgpa((prev) => ({ ...prev, prevCgpa: e.target.value }))}
                className="input num font-semibold"
              />
            </label>
            <label>
              <span className="label">Previous credits</span>
              <input
                type="number"
                inputMode="numeric"
                placeholder="e.g. 80"
                value={simpleCgpa.prevCredits}
                onChange={(e) => setSimpleCgpa((prev) => ({ ...prev, prevCredits: e.target.value }))}
                className="input num font-semibold"
              />
            </label>
            <label>
              <span className="label">This semester&apos;s SGPA</span>
              <input
                type="number"
                inputMode="decimal"
                placeholder="e.g. 9.2"
                value={simpleCgpa.currSgpa}
                onChange={(e) => setSimpleCgpa((prev) => ({ ...prev, currSgpa: e.target.value }))}
                className="input num font-semibold"
              />
            </label>
            <label>
              <span className="label">This semester&apos;s credits</span>
              <input
                type="number"
                inputMode="numeric"
                placeholder="e.g. 24"
                value={simpleCgpa.currCredits}
                onChange={(e) => setSimpleCgpa((prev) => ({ ...prev, currCredits: e.target.value }))}
                className="input num font-semibold"
              />
            </label>
          </div>

          <div className="inset flex items-center justify-between p-4">
            <div className="num text-sm text-ink-2">Total credits: <strong className="text-ink">{quickCgpa.totalCredits}</strong></div>
            <div className="text-right">
              <div className="text-xs text-ink-3">New CGPA</div>
              <div className="num text-3xl font-semibold text-ink">{quickCgpa.newCGPA}</div>
            </div>
          </div>
        </div>
      </details>
    </div>
  );
}
