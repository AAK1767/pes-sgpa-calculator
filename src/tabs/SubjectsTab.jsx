import React from 'react';
import {
  Settings, ChevronDown, Undo2, Redo2,
  Download, Upload, Eraser, Plus,
  Trash2, RotateCcw, Target, Activity, Zap, AlertTriangle,
  LogIn, Calculator,
} from 'lucide-react';

const isFilled = (v) => v !== '' && v !== undefined && v !== null && !Number.isNaN(parseFloat(v));

const formatIsaValue = (value) => {
  if (!Number.isFinite(value)) return '0';
  const trimmed = value.toFixed(3).replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
  return trimmed === '' ? '0' : trimmed;
};

function Chevron() {
  return <ChevronDown className="chev" />;
}

// Stacked bar showing how many subjects landed on each grade.
function GradeStrip({ gradeDistribution, GradeMap, count }) {
  return (
    <div className="flex h-8 gap-0.5 overflow-hidden rounded-md">
      {Object.entries(gradeDistribution).map(([grade, n]) => {
        if (n === 0) return null;
        const gradeInfo = GradeMap.find((g) => g.grade === grade);
        return (
          <div
            key={grade}
            className={`flex items-center justify-center text-xs font-semibold text-canvas ${gradeInfo?.bg || 'bg-ink-3'}`}
            style={{ width: `${(n / count) * 100}%` }}
            title={`${grade}: ${n} subject(s)`}
          >
            {grade} &middot; {n}
          </div>
        );
      })}
    </div>
  );
}

// Cards layout: the SGPA up front, with progress toward the target and the grade spread.
function SgpaHero({ sgpa, targetSgpa, metrics, gradeDistribution, GradeMap, count }) {
  const value = parseFloat(sgpa) || 0;
  const target = parseFloat(targetSgpa) || 0;
  const diff = value - target;
  const meets = target > 0 && diff >= 0;

  return (
    <section className="panel panel-pad" aria-label="Your SGPA">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-xs text-ink-3">Your SGPA so far</div>
          <div className={`num text-5xl font-semibold leading-none md:text-6xl ${meets ? 'text-good' : 'text-ink'}`}>{sgpa}</div>
        </div>
        <div className="text-right">
          {target > 0 && (
            <>
              <div className="text-sm text-ink-2">Target <span className="num font-semibold text-ink">{target}</span></div>
              <div className={`num text-xs ${meets ? 'text-good' : 'text-ink-3'}`}>
                {meets ? 'On target' : `${Math.abs(diff).toFixed(2)} below target`}
              </div>
            </>
          )}
          <div className="num mt-1 text-xs text-ink-3">{count} subjects &middot; {metrics.totalCredits} credits</div>
        </div>
      </div>

      <div
        className="relative mt-4 h-2 rounded-full bg-raised"
        role="img"
        aria-label={`SGPA ${sgpa} out of 10${target > 0 ? `, target ${target}` : ''}`}
      >
        <div className="h-full rounded-full bg-accent" style={{ width: `${Math.min(100, value * 10)}%` }} />
        {target > 0 && (
          <div className="absolute -top-1 h-4 w-0.5 rounded bg-ink" style={{ left: `${Math.min(100, target * 10)}%` }} title={`Target ${target}`} />
        )}
      </div>
      <div className="num mt-1 flex justify-between text-xs text-ink-3">
        <span>0</span>
        <span>10</span>
      </div>

      {count > 0 && (
        <div className="mt-3">
          <GradeStrip gradeDistribution={gradeDistribution} GradeMap={GradeMap} count={count} />
        </div>
      )}
    </section>
  );
}

// One mark entry: "score / max" with the component name and its weight.
function MarkField({ label, weight, scoreValue, maxValue, onScore, onMax, emphasised, wide }) {
  return (
    <div className={`rounded-md border bg-canvas/60 p-2 sm:p-3 ${wide ? 'col-span-2 sm:col-span-1' : ''} ${emphasised ? 'border-accent/40' : 'border-line'}`}>
      <div className="mb-1 flex items-baseline justify-between gap-1.5 sm:mb-1.5">
        <span className={`truncate text-sm font-medium ${emphasised ? 'text-accent' : 'text-ink'}`} title={label}>{label}</span>
        <span className="num shrink-0 text-xs text-ink-3">{weight}%</span>
      </div>
      <div className="flex items-center gap-1">
        <input
          type="number"
          inputMode="decimal"
          step="0.5"
          value={scoreValue}
          onChange={onScore}
          placeholder="Marks"
          aria-label={`${label} marks scored`}
          className="input num min-w-0 px-1 text-center font-semibold"
        />
        <span className="text-ink-3" aria-hidden="true">/</span>
        <input
          type="number"
          inputMode="decimal"
          value={maxValue}
          onChange={onMax}
          aria-label={`${label} maximum marks`}
          className="input num w-12 shrink-0 px-1 text-center text-ink-2 sm:w-14"
        />
      </div>
    </div>
  );
}

function Row({ label, value, strong, tone }) {
  return (
    <div className="flex justify-between gap-3">
      <span className={strong ? 'text-ink' : 'text-ink-2'}>{label}</span>
      <span className={`num font-medium ${tone === 'good' ? 'text-good' : 'text-ink'}`}>{value}</span>
    </div>
  );
}

export default function SubjectsTab({
  subjects,
  marks,
  expandedSubject,
  setExpandedSubject,
  undoStack,
  redoStack,
  undo,
  redo,
  exportData,
  importData,
  clearAll,
  loadPreset,
  SemesterPresets,
  GradeMap,
  GradingSchemes,
  metrics,
  gradeDistribution,
  getSubjectMetrics,
  getGradeInfo,
  getFinalIsaSummary,
  handleMarkChange,
  handleSubjectChange,
  toggleAssignment,
  toggleLab,
  removeSubject,
  addNewSubject,
  setActiveTab,
  showTemplateBuilder,
  setShowTemplateBuilder,
  manualGrades,
  setManualGrades,
  customTemplate,
  setCustomTemplate,
  addComponentToTemplate,
  removeComponentFromTemplate,
  updateTemplateComponent,
  updateCustomGrade,
  addCustomGrade,
  removeCustomGrade,
  applyCustomTemplate,
  applyGradingSchemeToAll,
  pesuProfile,
  layout = 'classic',
  onToggleLayout,
  sgpa = 0,
  targetSgpa = 0,
}) {
  const isLoggedIn = !!pesuProfile;
  const isCards = layout === 'cards';
  const [showLayoutNotice, setShowLayoutNotice] = React.useState(() => {
    try { return localStorage.getItem('pes_layout_notice_v1') !== '1'; } catch { return false; }
  });
  const dismissLayoutNotice = () => {
    setShowLayoutNotice(false);
    try { localStorage.setItem('pes_layout_notice_v1', '1'); } catch { /* storage unavailable */ }
  };
  const [presetGroup, setPresetGroup] = React.useState('Cycles');
  const [presetSearch, setPresetSearch] = React.useState('');

  const handlePesuImport = () => {
    if (!isLoggedIn) {
      setActiveTab('pesu');
    } else {
      // First ensure user is on the PESU tab
      setActiveTab('pesu');
      // Delay to allow DOM update of tab transition
      setTimeout(() => {
        const section = document.getElementById('academic-data-section');
        if (section) {
          section.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  // Quick estimator: SGPA from hand-picked grades (defaults to each subject's top grade).
  const hypotheticalSgpa = (() => {
    let totalPoints = 0;
    let totalCredits = 0;
    subjects.forEach((sub) => {
      const scheme = sub.customGradeMap || GradeMap;
      const maxGradeObj = scheme.reduce((max, current) => (current.gp > max.gp ? current : max), scheme[0]);
      const maxGrade = maxGradeObj ? maxGradeObj.grade : '';
      const gradeLetter = manualGrades[sub.id] !== undefined ? manualGrades[sub.id] : maxGrade;
      if (gradeLetter) {
        const gradeObj = scheme.find((g) => g.grade === gradeLetter);
        if (gradeObj) {
          totalPoints += gradeObj.gp * sub.credits;
          totalCredits += sub.credits;
        }
      }
    });
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
  })();

  const enabledWeightTotal = customTemplate.components.filter((c) => c.enabled).reduce((sum, c) => sum + c.weight, 0);

  // Quick SGPA estimator helpers
  const estimatorGrades = GradeMap.filter((g) => g.gp > 0).map((g) => g.grade);
  const setAllEstimatorGrades = (grade) => {
    const next = {};
    subjects.forEach((sub) => {
      const scheme = sub.customGradeMap || GradeMap;
      if (scheme.some((g) => g.grade === grade)) next[sub.id] = grade;
    });
    setManualGrades((prev) => ({ ...prev, ...next }));
  };
  const useCurrentEstimatorGrades = () => {
    const next = {};
    subjects.forEach((sub) => {
      const { finalScore } = getSubjectMetrics(sub);
      next[sub.id] = getGradeInfo(finalScore, sub).grade;
    });
    setManualGrades(next);
  };
  const estimated = parseFloat(hypotheticalSgpa) || 0;
  const currentSgpaNum = parseFloat(sgpa) || 0;
  const targetSgpaNum = parseFloat(targetSgpa) || 0;
  const formatDelta = (d) => `${d >= 0 ? '+' : ''}${d.toFixed(2)}`;

  return (
    <div className="space-y-4">
      {isCards && showLayoutNotice && (
        <div className="notice notice-info flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm">
            <strong className="font-medium text-ink">New card layout.</strong>{' '}
            Each subject now has its own card. Prefer the old one? The classic layout is still here, and you can switch any time with the layout button at the top right.
          </p>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => { dismissLayoutNotice(); if (onToggleLayout) onToggleLayout(); }}
              className="btn btn-secondary btn-sm"
            >
              Switch to Classic
            </button>
            <button type="button" onClick={dismissLayoutNotice} className="btn btn-ghost btn-sm">Got it</button>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <details className="group relative" id="subject-preset-select">
          <summary className="btn btn-secondary cursor-pointer">
            Load a preset
            <ChevronDown className="h-4 w-4 text-ink-3 transition-transform group-open:rotate-180" />
          </summary>

          <div className="absolute left-0 top-full z-40 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-lg border border-line bg-surface p-3 shadow-xl shadow-black/40">
            <input
              type="search"
              value={presetSearch}
              onChange={(e) => setPresetSearch(e.target.value)}
              placeholder="Search presets"
              aria-label="Search presets"
              className="input mb-3"
            />

            <div className="mb-3 flex flex-wrap gap-1" role="tablist" aria-label="Preset groups">
              {['Cycles', 'CSE', 'AIML', 'ECE', 'All'].map((group) => (
                <button
                  key={group}
                  type="button"
                  role="tab"
                  aria-selected={presetGroup === group}
                  onClick={() => setPresetGroup(group)}
                  className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${presetGroup === group
                    ? 'bg-accent text-accent-ink'
                    : 'text-ink-2 hover:bg-raised hover:text-ink'
                  }`}
                >
                  {group}
                </button>
              ))}
            </div>

            <div className="grid max-h-56 grid-cols-1 gap-1 overflow-y-auto sm:grid-cols-2">
              {Object.keys(SemesterPresets)
                .filter((key) => {
                  if (presetSearch && !key.toLowerCase().includes(presetSearch.toLowerCase())) return false;
                  if (presetGroup === 'All') return true;
                  if (presetGroup === 'Cycles') return key.includes('Cycle');
                  return key.startsWith(`${presetGroup} `);
                })
                .map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={(event) => {
                      loadPreset(key);
                      setPresetSearch('');
                      event.currentTarget.closest('details')?.removeAttribute('open');
                    }}
                    className="rounded-md px-2.5 py-2 text-left text-sm text-ink transition-colors hover:bg-raised"
                  >
                    {key}
                  </button>
                ))}
            </div>
          </div>
        </details>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <button type="button" onClick={undo} disabled={undoStack.length === 0} className="btn btn-secondary" aria-label="Undo" title="Undo (Ctrl+Z)">
            <Undo2 className="h-4 w-4" /> <span className="hidden sm:inline">Undo</span>
          </button>
          <button type="button" onClick={redo} disabled={redoStack.length === 0} className="btn btn-secondary" aria-label="Redo" title="Redo (Ctrl+Y)">
            <Redo2 className="h-4 w-4" /> <span className="hidden sm:inline">Redo</span>
          </button>
          <details className="group relative">
            <summary className="btn btn-secondary cursor-pointer">
              Backup &amp; reset
              <ChevronDown className="h-4 w-4 text-ink-3 transition-transform group-open:rotate-180" />
            </summary>
            <div className="absolute right-0 top-full z-40 mt-2 w-56 rounded-lg border border-line bg-surface p-1.5 shadow-lg">
              <button type="button" onClick={exportData} className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm text-ink hover:bg-raised" title="Ctrl+S">
                <Download className="h-4 w-4 text-ink-3" /> Export backup file
              </button>
              <label className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-sm text-ink hover:bg-raised">
                <Upload className="h-4 w-4 text-ink-3" /> Import backup file
                <input type="file" accept=".json" onChange={importData} className="hidden" aria-label="Import backup file" />
              </label>
              <button type="button" onClick={clearAll} className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm text-bad hover:bg-bad/10">
                <Eraser className="h-4 w-4" /> Clear all subjects
              </button>
            </div>
          </details>
        </div>
      </div>

      {/* PESU Academy shortcut + how-to */}
      <div className="panel panel-pad flex items-center justify-between gap-3">
        <details className="disclosure min-w-0 flex-1">
          <summary>
            <span>How this calculator works</span>
            <Chevron />
          </summary>
          <div className="mt-3 space-y-2 text-sm leading-relaxed text-ink-2">
            <p>Works for all semesters. 5-credit courses scale from 120% to 100%.</p>
            <p>
              After entering ISA, lab and assignment marks, open <strong className="font-medium text-ink">ESA targets</strong> to see what to score in the ESA for each grade, or <strong className="font-medium text-ink">SGPA goal</strong> to see what to score across all ESAs to hit a target SGPA.
            </p>
            <p>
              It also works for any college: define your assessment pattern and grading scheme under &ldquo;Not from PES?&rdquo; at the bottom of this page.
            </p>
          </div>
        </details>
        <button type="button" onClick={handlePesuImport} className="btn btn-ghost btn-sm shrink-0 text-ink-2" title="Optional: fill in subjects from your PESU Academy account">
          <LogIn className="h-3.5 w-3.5" />
          {isLoggedIn ? 'Import from PESU' : 'PESU sign-in'}
        </button>
      </div>

      {/* Summary: SGPA hero (cards layout) or grade distribution (classic layout) */}
      {isCards ? (
        <SgpaHero
          sgpa={sgpa}
          targetSgpa={targetSgpa}
          metrics={metrics}
          gradeDistribution={gradeDistribution}
          GradeMap={GradeMap}
          count={subjects.length}
        />
      ) : (
        <div className="panel panel-pad">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2 className="text-sm font-semibold text-ink">Grade distribution</h2>
            <span className="num text-xs text-ink-3">
              {subjects.length} subjects &middot; {metrics.totalCredits} credits
            </span>
          </div>
          <GradeStrip gradeDistribution={gradeDistribution} GradeMap={GradeMap} count={subjects.length} />
        </div>
      )}

      {/* Subjects list */}
      <div>
        <p className="mb-2 text-sm text-ink-3">
          {isCards ? 'Type your marks straight into each subject. Open Details for rounding and subject settings.' : 'Select a subject to enter or edit its marks.'}
        </p>
        <div className={isCards ? 'grid grid-cols-1 items-start gap-2.5 lg:grid-cols-2' : 'space-y-2.5'}>
          {subjects.map((subject) => {
            const m = marks[subject.id] || {};
            const { finalScore, rawScore, totalWeight, unroundedScore, cieScaled, cieRounded, esaScaled, esaRounded, labScaled, labRounded } = getSubjectMetrics(subject);
            const gradeInfo = getGradeInfo(finalScore, subject);
            const finalIsa = getFinalIsaSummary(subject);
            const labels = subject.customConfig?.labels;
            const weights = subject.customConfig?.weights;
            const isa1Label = labels?.isa1 || 'ISA 1';
            const isa2Label = labels?.isa2 || 'ISA 2';
            const assignmentLabel = labels?.assignment || 'Assignment';
            const isa1Display = formatIsaValue(finalIsa.isa1);
            const isa2Display = formatIsaValue(finalIsa.isa2);
            const assignmentDisplay = formatIsaValue(finalIsa.assignment);
            const isaTotalDisplay = Math.ceil(finalIsa.total).toString();
            const isaMaxDisplay = formatIsaValue(finalIsa.max);
            const isExpanded = expandedSubject === subject.id;
            const hasLabComponent = subject.hasLab || ((weights?.lab ?? 0) > 0);
            const hasAssignmentComponent = subject.hasAssignment || (weights?.assignment > 0);
            const showTotalWeight = hasLabComponent && totalWeight > 100;
            const totalWeightLabel = Number.isInteger(totalWeight) ? totalWeight : totalWeight.toFixed(1);
            const rawScoreLabel = rawScore.toFixed(2).replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');

            // Mark entry slots, driven by data so each component renders the same way.
            const slots = [
              {
                key: 'isa1', show: subject.hasIsa1 !== false, label: isa1Label,
                weight: subject.customConfig ? weights.isa1 : subject.isaWeight,
                max: marks[subject.id]?.isa1Max ?? subject.isa1Max ?? 40,
              },
              {
                key: 'isa2', show: subject.hasIsa2 !== false, label: isa2Label,
                weight: subject.customConfig ? weights.isa2 : subject.isaWeight,
                max: marks[subject.id]?.isa2Max ?? subject.isa2Max ?? 40,
              },
              {
                key: 'assignment', show: hasAssignmentComponent, label: assignmentLabel,
                weight: subject.customConfig ? weights.assignment : subject.assignmentWeight,
                max: marks[subject.id]?.assignmentMax ?? subject.assignmentMax ?? 10,
              },
              {
                key: 'lab', show: subject.hasLab || (weights?.lab > 0), label: labels?.lab || 'Lab',
                weight: subject.customConfig ? weights.lab : subject.labWeight,
                max: marks[subject.id]?.labMax ?? 20,
              },
              {
                key: 'esa', show: true, label: labels?.esa || 'ESA', emphasised: true,
                weight: subject.customConfig ? weights.esa : subject.esaWeight,
                max: marks[subject.id]?.esaMax ?? subject.esaMax ?? 100,
              },
            ].filter((s) => s.show);
            const enteredCount = slots.filter((s) => isFilled(m[s.key])).length;

            return (
              <div
                key={subject.id}
                data-subject-card
                className={`panel overflow-hidden transition-colors ${isExpanded ? 'border-line-strong' : 'hover:border-line-strong'} ${isCards && isExpanded ? 'lg:col-span-2' : ''}`}
              >
                {/* Cards layout header: name, score and a progress bar. Marks are always visible below. */}
                {isCards && (
                  <div className="p-3 md:p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-[15px] font-semibold text-ink md:text-base" title={subject.name}>{subject.name}</h3>
                        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-3">
                          <span>{subject.credits} credits</span>
                          <span aria-hidden="true">&middot;</span>
                          <span>{enteredCount === 0 ? 'No marks yet' : `${enteredCount} of ${slots.length} entered`}</span>
                          {totalWeight > 100 && <span className="chip">Scaled from {totalWeight}%</span>}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2.5">
                        <div className="text-right">
                          <div className={`num text-2xl font-semibold leading-none ${gradeInfo.color}`}>{finalScore}</div>
                          <div className="mt-1 text-xs text-ink-3">
                            {showTotalWeight ? `actual ${rawScoreLabel}/${totalWeightLabel}` : 'out of 100'}
                          </div>
                        </div>
                        <div className={`flex h-10 w-10 items-center justify-center rounded-md text-lg font-semibold text-canvas ${gradeInfo.bg}`} aria-label={`Grade ${gradeInfo.grade}`}>
                          {gradeInfo.grade}
                        </div>
                      </div>
                    </div>
                    <div
                      className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-raised"
                      role="img"
                      aria-label={`Score ${finalScore} out of 100`}
                    >
                      <div className={`h-full rounded-full ${gradeInfo.bg}`} style={{ width: `${Math.min(100, Math.max(0, Number(finalScore) || 0))}%` }} />
                    </div>
                  </div>
                )}

                {/* Subject header */}
                <button
                  type="button"
                  className={`${isCards ? 'hidden' : 'flex'} w-full items-center justify-between gap-3 p-3 text-left md:p-4`}
                  onClick={() => setExpandedSubject(isExpanded ? null : subject.id)}
                  aria-expanded={isExpanded}
                >
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-[15px] font-semibold text-ink md:text-base">{subject.name}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-3">
                      <span>{subject.credits} credits</span>
                      <span aria-hidden="true">&middot;</span>
                      <span>{enteredCount === 0 ? 'No marks yet' : `${enteredCount} of ${slots.length} marks entered`}</span>
                      {totalWeight > 100 && <span className="chip">Scaled from {totalWeight}%</span>}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <div className="text-right">
                      <div className={`num text-2xl font-semibold leading-none ${gradeInfo.color}`}>{finalScore}</div>
                      <div className="mt-1 text-xs text-ink-3">
                        {showTotalWeight ? `actual ${rawScoreLabel}/${totalWeightLabel}` : 'out of 100'}
                      </div>
                    </div>
                    <div className={`flex h-10 w-10 items-center justify-center rounded-md text-lg font-semibold text-canvas ${gradeInfo.bg}`} aria-label={`Grade ${gradeInfo.grade}`}>
                      {gradeInfo.grade}
                    </div>
                    <ChevronDown className={`h-5 w-5 text-ink-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {/* Expanded content */}
                {(isExpanded || isCards) && (
                  <div className="space-y-4 border-t border-line p-3 md:p-4">
                    {/* Mark inputs */}
                    <div className={isCards
                      ? 'grid grid-cols-2 gap-2 sm:grid-cols-[repeat(auto-fit,minmax(9.5rem,1fr))] sm:gap-2.5'
                      : 'grid grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-2.5 lg:grid-cols-3'}
                    >
                      {slots.map((slot, slotIdx) => (
                        <MarkField
                          key={slot.key}
                          wide={slots.length % 2 === 1 && slotIdx === slots.length - 1}
                          label={slot.label}
                          weight={slot.weight}
                          emphasised={slot.emphasised}
                          scoreValue={marks[subject.id]?.[slot.key] ?? ''}
                          maxValue={slot.max}
                          onScore={(e) => handleMarkChange(subject.id, slot.key, e.target.value)}
                          onMax={(e) => handleMarkChange(subject.id, `${slot.key}Max`, e.target.value)}
                        />
                      ))}
                    </div>

                    {isCards && (
                      <button
                        type="button"
                        onClick={() => setExpandedSubject(isExpanded ? null : subject.id)}
                        aria-expanded={isExpanded}
                        className="-mt-1.5 flex w-full items-center justify-between gap-3 rounded-md px-1 py-1.5 text-left text-sm text-ink-2 transition-colors hover:bg-raised hover:text-ink"
                      >
                        <span>Final ISA <span className="num font-medium text-ink">{isaTotalDisplay}/{isaMaxDisplay}</span></span>
                        <span className="flex items-center gap-1 text-xs">
                          {isExpanded ? 'Hide details' : 'Details & edit'}
                          <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </span>
                      </button>
                    )}

                    {(!isCards || isExpanded) && (
                    <>
                    {/* Result summary */}
                    <div className="inset space-y-3 p-3 text-sm">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <span className="font-medium text-ink">Final ISA (out of 50)</span>
                        <span className="num font-medium text-good">
                          {isaTotalDisplay}/{isaMaxDisplay}
                          <span className="ml-1 font-normal text-ink-3">(unrounded {formatIsaValue(finalIsa.total)})</span>
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-ink-2">
                        <span>{isa1Label}: <span className="num text-ink">{isa1Display}</span></span>
                        <span>{isa2Label} (reduced): <span className="num text-ink">{isa2Display}</span></span>
                        <span>{assignmentLabel}: <span className="num text-ink">{assignmentDisplay}</span></span>
                      </div>
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-line pt-3">
                        <span className="text-ink-2">Total before rounding</span>
                        <span className="num text-ink-2">
                          {totalWeight !== 100 ? (
                            <>
                              ({formatIsaValue(cieScaled)} + {formatIsaValue(esaScaled)}{hasLabComponent ? <> + {formatIsaValue(labScaled)}</> : ''}) / {totalWeight} &times; 100 ={' '}
                            </>
                          ) : (
                            <>{formatIsaValue(cieScaled)} + {formatIsaValue(esaScaled)} = </>
                          )}
                          <span className="font-semibold text-good">{unroundedScore.toFixed(2)}</span>
                        </span>
                      </div>
                    </div>

                    {/* Detailed rounding breakdown */}
                    <details className="disclosure">
                      <summary>
                        <span>Show rounding breakdown</span>
                        <Chevron />
                      </summary>
                      <div className="inset mt-3 space-y-4 p-4 text-sm">
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                          <div className="space-y-1.5">
                            <h4 className="font-medium text-ink">Internals (ISA)</h4>
                            <Row label={`${isa1Label}`} value={isa1Display} />
                            <Row label={`${isa2Label} (reduced)`} value={isa2Display} />
                            {hasAssignmentComponent && <Row label={assignmentLabel} value={assignmentDisplay} />}
                            <div className="border-t border-line pt-1.5">
                              <Row label="ISA total (unrounded)" value={`${formatIsaValue(cieScaled)} / 50`} />
                              <Row label="ISA rounded up" value={`${cieRounded} / 50`} tone="good" />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <h4 className="font-medium text-ink">ESA and lab</h4>
                            <Row label="ESA raw score" value={m.esa !== '' && m.esa !== undefined ? `${m.esa} / ${m.esaMax || subject.esaMax || 100}` : '-'} />
                            <Row label="ESA (unrounded)" value={`${formatIsaValue(esaScaled)} / 50`} />
                            <Row label="ESA rounded up" value={`${esaRounded} / 50`} tone="good" />
                            {hasLabComponent && (
                              <div className="space-y-1.5 border-t border-line pt-1.5">
                                <Row label="Lab raw score" value={m.lab !== '' && m.lab !== undefined ? `${m.lab} / ${m.labMax || 20}` : '-'} />
                                <Row label="Lab (unrounded)" value={`${formatIsaValue(labScaled)} / ${subject.labWeight || 20}`} />
                                <Row label="Lab rounded up" value={`${labRounded} / ${subject.labWeight || 20}`} tone="good" />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col justify-between gap-3 border-t border-line pt-4 sm:flex-row">
                          <div>
                            <div className="text-ink-2">Total before rounding: <span className="num font-semibold text-ink">{unroundedScore.toFixed(2)}</span></div>
                            <div className="text-xs text-ink-3">Sum of the raw components, scaled to 100</div>
                          </div>
                          <div className="sm:text-right">
                            <div className="text-ink-2">Final score: <span className="num rounded border border-good/30 bg-good/10 px-2 py-0.5 font-semibold text-good">{finalScore}</span></div>
                            <div className="text-xs text-ink-3">Ceil(ISA) + Ceil(Lab) + Ceil(ESA), scaled</div>
                          </div>
                        </div>
                      </div>
                    </details>

                    {/* Edit subject */}
                    <details className="disclosure border-t border-line pt-4">
                      <summary>
                        <span className="flex items-center gap-2"><Settings className="h-4 w-4" /> Edit subject details</span>
                        <Chevron />
                      </summary>
                      <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div className="space-y-3">
                          <div>
                            <label className="label" htmlFor={`name-${subject.id}`}>Name</label>
                            <input
                              id={`name-${subject.id}`}
                              type="text"
                              value={subject.name}
                              onChange={(e) => handleSubjectChange(subject.id, 'name', e.target.value)}
                              className="input"
                            />
                          </div>
                          <div>
                            <label className="label" htmlFor={`credits-${subject.id}`}>Credits</label>
                            <input
                              id={`credits-${subject.id}`}
                              type="number"
                              value={subject.credits}
                              onChange={(e) => handleSubjectChange(subject.id, 'credits', parseFloat(e.target.value) || 0)}
                              className="input"
                            />
                          </div>
                          <div className="flex flex-wrap gap-5 pt-1">
                            <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
                              <input type="checkbox" checked={subject.hasAssignment} onChange={() => toggleAssignment(subject.id)} />
                              Has assignment
                            </label>
                            <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
                              <input type="checkbox" checked={subject.hasLab} onChange={() => toggleLab(subject.id)} />
                              Has lab
                            </label>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <span className="label">Weights (%)</span>
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                              <div>
                                <label className="mb-1 block text-xs text-ink-3" htmlFor={`isaw-${subject.id}`}>Each ISA</label>
                                <input id={`isaw-${subject.id}`} type="number" value={subject.isaWeight} onChange={(e) => handleSubjectChange(subject.id, 'isaWeight', parseFloat(e.target.value) || 0)} className="input num" />
                              </div>
                              <div>
                                <label className="mb-1 block text-xs text-ink-3" htmlFor={`esaw-${subject.id}`}>ESA</label>
                                <input id={`esaw-${subject.id}`} type="number" value={subject.esaWeight} onChange={(e) => handleSubjectChange(subject.id, 'esaWeight', parseFloat(e.target.value) || 0)} className="input num" />
                              </div>
                              {subject.hasAssignment && (
                                <div>
                                  <label className="mb-1 block text-xs text-ink-3" htmlFor={`asw-${subject.id}`}>Assignment</label>
                                  <input id={`asw-${subject.id}`} type="number" value={subject.assignmentWeight} onChange={(e) => handleSubjectChange(subject.id, 'assignmentWeight', parseFloat(e.target.value) || 0)} className="input num" />
                                </div>
                              )}
                              {subject.hasLab && (
                                <div>
                                  <label className="mb-1 block text-xs text-ink-3" htmlFor={`labw-${subject.id}`}>Lab</label>
                                  <input id={`labw-${subject.id}`} type="number" value={subject.labWeight} onChange={(e) => handleSubjectChange(subject.id, 'labWeight', parseFloat(e.target.value) || 0)} className="input num" />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Grade cutoff editor */}
                          <details className="disclosure">
                            <summary>
                              <span className="flex items-center gap-2"><Target className="h-4 w-4" /> Adjust grade cutoffs (curve)</span>
                              <Chevron />
                            </summary>
                            <div className="notice notice-info mt-3 space-y-3">
                              <p className="text-xs">If the paper was hard and the cutoffs were lowered, set them here.</p>
                              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                                {(subject.customGradeMap || GradeMap).filter((g) => g.gp > 0).map((g, idx) => (
                                  <div key={g.grade} className="flex flex-col">
                                    <label className={`mb-1 text-center text-xs font-semibold ${g.color || 'text-ink-3'}`} htmlFor={`cut-${subject.id}-${g.grade}`}>
                                      {g.grade} (&ge;)
                                    </label>
                                    <input
                                      id={`cut-${subject.id}-${g.grade}`}
                                      type="number"
                                      value={g.min}
                                      className="input num px-1 text-center"
                                      onChange={(e) => {
                                        const val = parseFloat(e.target.value);
                                        if (isNaN(val)) return;

                                        const currentMap = subject.customGradeMap
                                          ? JSON.parse(JSON.stringify(subject.customGradeMap))
                                          : JSON.parse(JSON.stringify(GradeMap));

                                        currentMap[idx].min = val;

                                        handleSubjectChange(subject.id, 'customGradeMap', currentMap);
                                      }}
                                    />
                                  </div>
                                ))}
                              </div>
                              {subject.customGradeMap && (
                                <button
                                  type="button"
                                  onClick={() => handleSubjectChange(subject.id, 'customGradeMap', null)}
                                  className="flex items-center gap-1.5 text-xs text-ink-2 underline underline-offset-2 hover:text-ink"
                                >
                                  <RotateCcw className="h-3 w-3" /> Reset to standard cutoffs
                                </button>
                              )}
                            </div>
                          </details>

                          <button type="button" onClick={() => removeSubject(subject.id)} className="btn btn-danger w-full">
                            <Trash2 className="h-4 w-4" /> Remove subject
                          </button>
                        </div>
                      </div>
                    </details>
                    </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={addNewSubject}
          className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-line-strong py-3 text-sm font-medium text-ink-2 transition-colors hover:border-accent hover:text-accent"
        >
          <Plus className="h-4 w-4" /> Add a subject
        </button>
      </div>

      {/* Next steps */}
      <div className="flex flex-col items-stretch justify-between gap-3 rounded-lg border border-line bg-surface px-4 py-3 sm:flex-row sm:items-center">
        <span className="text-sm text-ink-2">Done entering marks? Next:</span>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button type="button" onClick={() => setActiveTab('analysis')} className="btn btn-secondary">
            <Activity className="h-4 w-4" /> See what you need in the ESA
          </button>
          <button type="button" onClick={() => setActiveTab('reverse')} className="btn btn-secondary">
            <Target className="h-4 w-4" /> Plan a target SGPA
          </button>
        </div>
      </div>

      {/* Quick SGPA estimator */}
      <details className="disclosure panel">
        <summary className="p-4">
          <span className="flex items-center gap-3">
            <Calculator className="h-5 w-5 text-ink-3" />
            <span className="text-left">
              <span className="block text-sm font-semibold text-ink">Quick SGPA estimator</span>
              <span className="block text-xs font-normal text-ink-3">Pick a grade for each subject to see the SGPA it gives</span>
            </span>
          </span>
          <Chevron />
        </summary>

        <div className="space-y-4 border-t border-line p-4">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className="inset p-3">
              <div className="text-xs text-ink-3">SGPA with these grades</div>
              <div className="num mt-1 text-3xl font-semibold leading-none text-accent">{hypotheticalSgpa}</div>
            </div>
            <div className="inset p-3">
              <div className="text-xs text-ink-3">Compared with your SGPA now ({sgpa})</div>
              <div className={`num mt-1 text-xl font-semibold ${estimated >= currentSgpaNum ? 'text-good' : 'text-bad'}`}>{formatDelta(estimated - currentSgpaNum)}</div>
            </div>
            <div className="inset p-3">
              <div className="text-xs text-ink-3">{targetSgpaNum > 0 ? `Compared with your target (${targetSgpaNum})` : 'No target set'}</div>
              {targetSgpaNum > 0 ? (
                <div className={`num mt-1 text-xl font-semibold ${estimated >= targetSgpaNum ? 'text-good' : 'text-bad'}`}>{formatDelta(estimated - targetSgpaNum)}</div>
              ) : (
                <div className="mt-1 text-sm text-ink-3">Set one on the Analysis tab</div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-xs text-ink-3">Set every subject to</span>
            {estimatorGrades.map((grade) => (
              <button
                key={grade}
                type="button"
                onClick={() => setAllEstimatorGrades(grade)}
                className="num min-w-[2rem] rounded-md border border-line-strong bg-surface px-2 py-1 text-xs font-semibold text-ink-2 transition-colors hover:bg-raised hover:text-ink"
              >
                {grade}
              </button>
            ))}
            <button type="button" onClick={useCurrentEstimatorGrades} className="btn btn-ghost btn-sm ml-auto">
              Use my current grades
            </button>
          </div>

          <div className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
            {subjects.length === 0 ? (
              <div className="py-4 text-center text-sm text-ink-3">No subjects added yet.</div>
            ) : (
              subjects.map((sub) => {
                const scheme = sub.customGradeMap || GradeMap;
                const maxGradeObj = scheme.reduce((max, current) => (current.gp > max.gp ? current : max), scheme[0]);
                const maxGrade = maxGradeObj ? maxGradeObj.grade : '';
                const selectedGrade = manualGrades[sub.id] !== undefined ? manualGrades[sub.id] : maxGrade;

                return (
                  <div key={sub.id} className="flex flex-col gap-2 rounded-md border border-line bg-canvas/60 p-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                    <div className="min-w-0 sm:flex-1">
                      <div className="truncate text-sm font-medium text-ink" title={sub.name}>{sub.name}</div>
                      <div className="text-xs text-ink-3">{sub.credits} credits</div>
                    </div>
                    <div role="group" aria-label={`Grade for ${sub.name}`} className="flex flex-wrap gap-1">
                      {scheme.map((g) => {
                        const active = selectedGrade === g.grade;
                        return (
                          <button
                            key={g.grade}
                            type="button"
                            aria-pressed={active}
                            title={`${g.grade} = ${g.gp} points${active ? ' (tap again to clear)' : ''}`}
                            onClick={() => setManualGrades((prev) => ({ ...prev, [sub.id]: active ? '' : g.grade }))}
                            className={`num min-w-[2rem] rounded-md border px-2 py-1 text-xs font-semibold transition-colors ${active
                              ? `border-transparent text-canvas ${g.bg || 'bg-accent'}`
                              : 'border-line-strong bg-surface text-ink-2 hover:bg-raised hover:text-ink'}`}
                          >
                            {g.grade}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex justify-end">
            <button type="button" onClick={() => setManualGrades({})} className="btn btn-ghost btn-sm">
              Reset grades
            </button>
          </div>
        </div>
      </details>

      {/* Custom template builder */}
      <div className="panel overflow-hidden">
        <button
          type="button"
          onClick={() => setShowTemplateBuilder(!showTemplateBuilder)}
          aria-expanded={showTemplateBuilder}
          className="flex w-full items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-raised/50"
        >
          <span className="flex items-center gap-3">
            <Settings className="h-5 w-5 text-ink-3" />
            <span>
              <span className="block text-sm font-semibold text-ink">Not from PES?</span>
              <span className="block text-xs text-ink-3">Set up your own subject for VTU, IIT or any other college</span>
            </span>
          </span>
          <ChevronDown className={`h-5 w-5 text-ink-3 transition-transform ${showTemplateBuilder ? 'rotate-180' : ''}`} />
        </button>

        {showTemplateBuilder && (
          <div className="space-y-6 border-t border-line p-4">
            <div className="notice notice-warn text-sm">
              <p className="font-medium">Universal mode is experimental.</p>
              <p className="mt-1 text-xs leading-relaxed opacity-90">
                Define your assessment pattern and grading scheme below, then choose &ldquo;Create subject&rdquo;. It may not handle complex custom curriculums or edge cases yet.
              </p>
            </div>

            {/* Step 1 */}
            <section className="space-y-3">
              <h4 className="flex items-center gap-2 text-sm font-semibold text-ink">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-raised text-xs text-ink-2">1</span>
                Subject
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label" htmlFor="tpl-name">Subject name</label>
                  <input
                    id="tpl-name"
                    type="text"
                    value={customTemplate.name}
                    onChange={(e) => setCustomTemplate((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Data Structures"
                    className="input"
                  />
                </div>
                <div>
                  <label className="label" htmlFor="tpl-credits">Credits</label>
                  <input
                    id="tpl-credits"
                    type="number"
                    value={customTemplate.credits}
                    onChange={(e) => setCustomTemplate((prev) => ({ ...prev, credits: parseFloat(e.target.value) || 0 }))}
                    min="1"
                    max="10"
                    className="input"
                  />
                </div>
              </div>
            </section>

            {/* Step 2 */}
            <section className="space-y-3">
              <h4 className="flex items-center gap-2 text-sm font-semibold text-ink">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-raised text-xs text-ink-2">2</span>
                Assessment pattern
              </h4>

              <div className="space-y-2">
                {customTemplate.components.map((comp, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-wrap items-center gap-2 rounded-md border p-2 sm:flex-nowrap ${comp.enabled ? 'border-line bg-canvas/60' : 'border-line bg-canvas/30 opacity-60'}`}
                  >
                    <div className="flex min-w-[120px] flex-grow items-center gap-2">
                      <input
                        type="checkbox"
                        checked={comp.enabled}
                        onChange={(e) => updateTemplateComponent(idx, 'enabled', e.target.checked)}
                        aria-label={`Include ${comp.name}`}
                      />
                      <input
                        type="text"
                        value={comp.name}
                        onChange={(e) => updateTemplateComponent(idx, 'name', e.target.value)}
                        disabled={!comp.enabled}
                        aria-label="Component name"
                        className="min-w-0 flex-1 border-b border-transparent bg-transparent py-1 text-sm text-ink hover:border-line-strong focus:border-accent focus:outline-none"
                      />
                    </div>

                    <div className="ml-auto flex items-center gap-3">
                      <label className="flex items-center gap-1 text-xs text-ink-3">
                        <input
                          type="number"
                          value={comp.weight}
                          onChange={(e) => updateTemplateComponent(idx, 'weight', parseFloat(e.target.value) || 0)}
                          disabled={!comp.enabled}
                          aria-label="Weight in percent"
                          className="input num w-14 px-1 py-1 text-center"
                        />
                        %
                      </label>
                      <label className="flex items-center gap-1 text-xs text-ink-3">
                        Max
                        <input
                          type="number"
                          value={comp.maxMarks}
                          onChange={(e) => updateTemplateComponent(idx, 'maxMarks', parseFloat(e.target.value) || 0)}
                          disabled={!comp.enabled}
                          aria-label="Maximum marks"
                          className="input num w-14 px-1 py-1 text-center"
                        />
                      </label>
                      <button type="button" onClick={() => removeComponentFromTemplate(idx)} className="btn btn-ghost !min-h-0 !p-1.5 text-bad" aria-label={`Remove ${comp.name}`}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addComponentToTemplate}
                className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-line-strong py-2 text-sm font-medium text-ink-2 transition-colors hover:border-accent hover:text-accent"
              >
                <Plus className="h-4 w-4" /> Add component
              </button>

              {enabledWeightTotal !== 100 && (
                <div className="notice notice-warn flex items-start gap-2 text-xs">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>Total weight is {enabledWeightTotal}%. PES uses 120%, but 100% is standard.</span>
                </div>
              )}
            </section>

            {/* Step 3 */}
            <section className="space-y-3">
              <h4 className="flex items-center gap-2 text-sm font-semibold text-ink">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-raised text-xs text-ink-2">3</span>
                Grading scheme
              </h4>

              <div>
                <label className="label" htmlFor="tpl-scheme">Start from</label>
                <select
                  id="tpl-scheme"
                  value={customTemplate.gradingScheme}
                  onChange={(e) => {
                    const scheme = e.target.value;
                    setCustomTemplate((prev) => ({
                      ...prev,
                      gradingScheme: scheme,
                      customGrades: scheme === 'Custom'
                        ? prev.customGrades
                        : JSON.parse(JSON.stringify(GradingSchemes[scheme])),
                    }));
                  }}
                  className="input"
                >
                  {Object.keys(GradingSchemes).map((key) => (
                    <option key={key} value={key}>{key}</option>
                  ))}
                </select>
              </div>

              <div className="inset p-3">
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 px-1 text-xs text-ink-3">
                    <div className="col-span-3">Grade</div>
                    <div className="col-span-4">Min (&ge;)</div>
                    <div className="col-span-4">Points</div>
                    <div className="col-span-1" />
                  </div>

                  {customTemplate.customGrades.sort((a, b) => b.min - a.min).map((g, idx) => (
                    <div key={idx} className="grid grid-cols-12 items-center gap-2">
                      <input
                        type="text"
                        value={g.grade}
                        onChange={(e) => updateCustomGrade(idx, 'grade', e.target.value)}
                        aria-label="Grade letter"
                        className="input col-span-3 px-1 text-center font-semibold"
                      />
                      <input
                        type="number"
                        value={g.min}
                        onChange={(e) => updateCustomGrade(idx, 'min', e.target.value)}
                        aria-label="Minimum score"
                        className="input num col-span-4 px-1 text-center"
                      />
                      <input
                        type="number"
                        value={g.gp}
                        onChange={(e) => updateCustomGrade(idx, 'gp', e.target.value)}
                        aria-label="Grade points"
                        className="input num col-span-4 px-1 text-center"
                      />
                      <button type="button" onClick={() => removeCustomGrade(idx)} className="col-span-1 flex justify-center rounded p-1 text-bad hover:bg-bad/10" aria-label="Remove grade row">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addCustomGrade} className="btn btn-ghost btn-sm mt-3 w-full">
                  <Plus className="h-4 w-4" /> Add grade row
                </button>
              </div>

              <button type="button" onClick={applyGradingSchemeToAll} className="btn btn-secondary w-full">
                <Zap className="h-4 w-4" /> Apply this scheme to all subjects
              </button>
            </section>

            <div className="border-t border-line pt-4">
              <button type="button" onClick={applyCustomTemplate} className="btn btn-primary w-full">
                <Plus className="h-4 w-4" /> Create subject
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
