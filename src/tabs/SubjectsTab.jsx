import React from 'react';
import {
  Settings, ChevronDown, ChevronUp, Undo2, Redo2,
  Download, Upload, Eraser, BarChart3, Scale, Plus,
  Trash2, RotateCcw, Target, Activity, Zap, AlertTriangle,
  AlertCircle, GraduationCap
} from 'lucide-react';

export default function SubjectsTab({
  subjects,
  marks,
  expandedSubject,
  setExpandedSubject,
  themeClasses,
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
  pesuProfile
}) {
  const isLoggedIn = !!pesuProfile;

  return (
    <>
      {!isLoggedIn && (
        <div className="flex items-center gap-2 p-3 mb-4 bg-blue-500/10 rounded-lg border border-blue-500/20 text-xs">
          <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <span className="text-blue-200">Log in to PESU Academy to instantly import your semester's subjects. (optional)</span>
          <button onClick={() => setActiveTab('pesu')} className="ml-auto text-blue-400 font-bold hover:underline cursor-pointer">Login</button>
        </div>
      )}
      
      {/* Helper Banner (Optimized for both Mobile & Desktop) */}
      <div className={`${themeClasses.card} border rounded-xl p-3 md:p-4 text-sm flex flex-col md:flex-row md:items-center justify-between gap-4`}>

        {/* LEFT SIDE: Text Content (Unified Collapsible for Desktop & Mobile) */}
        <div className="flex-1">
          <details className="group">
            <summary className="flex items-center gap-2 cursor-pointer list-none select-none text-blue-400 hover:text-blue-300 transition-colors">
              <Settings className="w-5 h-5 flex-shrink-0" />
              <span className="font-bold text-zinc-200">Universal Calculator</span>
              <span className="text-[10px] bg-blue-500/10 px-2 py-0.5 rounded-full text-blue-400 flex items-center">
                Info <ChevronDown className="w-3 h-3 ml-1 transition-transform group-open:rotate-180" />
              </span>
            </summary>

            <div className={`mt-3 text-sm ${themeClasses.muted} leading-relaxed pl-7 border-t border-white/[0.06] pt-3 space-y-2`}>
              <p>
                Works for all semesters. 5-credit courses scale from 120% to 100%.
              </p>
              <p>
                After entering ISA/Lab/Assignment marks, you can check the <strong>Analysis</strong> tab for predictions and how much to score in ESA to reach your target grade in each subject and <strong>Reverse Calc</strong> tab to know what to score in ESAs to reach your target SGPA.
              </p>
              <p>
                This calculator works for any college. Define your assessment pattern and grading scheme below, then click "Create Subject".
              </p>
            </div>
          </details>
        </div>

        {/* RIGHT SIDE: Buttons (Always Visible) */}
        <div className="flex flex-wrap gap-2 items-center justify-end border-t border-white/[0.06] pt-3 md:border-none md:pt-0">
          <select
            onChange={(e) => loadPreset(e.target.value)}
            className={`${themeClasses.input} px-3 py-2 rounded-lg text-xs border max-w-[130px] md:max-w-none`}
            defaultValue=""
          >
            <option value="">Load Preset...</option>
            {Object.keys(SemesterPresets).map(key => (
              <option key={key} value={key}>{key}</option>
            ))}
          </select>

          <div className="flex gap-1">
            <button onClick={undo} disabled={undoStack.length === 0} className={`p-2 rounded-lg border ${themeClasses.border} ${undoStack.length === 0 ? 'opacity-30' : 'hover:bg-white/[0.06]'}`}>
              <Undo2 className="w-4 h-4" />
            </button>
            <button onClick={redo} disabled={redoStack.length === 0} className={`p-2 rounded-lg border ${themeClasses.border} ${redoStack.length === 0 ? 'opacity-30' : 'hover:bg-white/[0.06]'}`}>
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          <button onClick={exportData} className={`flex items-center gap-1 ${themeClasses.card} border px-3 py-2 rounded-lg transition-colors text-xs hover:bg-white/[0.06]`}>
            <Download className="w-3 h-3" /> <span className="hidden sm:inline">Export</span>
          </button>

          <label className={`flex items-center gap-1 ${themeClasses.card} border px-3 py-2 rounded-lg transition-colors text-xs cursor-pointer hover:bg-white/[0.06]`}>
            <Upload className="w-3 h-3" /> <span className="hidden sm:inline">Import</span>
            <input type="file" accept=".json" onChange={importData} className="hidden" />
          </label>

          <button onClick={clearAll} className="flex items-center gap-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-2 rounded-lg border border-red-500/20 transition-colors text-xs">
            <Eraser className="w-3 h-3" />
          </button>
        </div>

      </div>

      {/* Grade Distribution Bar */}
      <div className={`${themeClasses.card} border rounded-xl p-4`}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold flex items-center gap-2">
            <BarChart3 className="w-4 h-4" /> Grade Distribution
          </span>
          <span className={`text-xs ${themeClasses.muted}`}>
            {subjects.length} subjects • {metrics.totalCredits} credits
          </span>
        </div>
        <div className="flex gap-1 h-8 rounded-lg overflow-hidden">
          {Object.entries(gradeDistribution).map(([grade, count]) => {
            if (count === 0) return null;
            const gradeInfo = GradeMap.find(g => g.grade === grade);
            return (
              <div
                key={grade}
                className={`flex items-center justify-center text-xs font-bold text-zinc-200 ${gradeInfo?.bg || 'bg-gray-500'}`}
                style={{ width: `${(count / subjects.length) * 100}%` }}
                title={`${grade}:  ${count} subject(s)`}
              >
                {grade} ({count})
              </div>
            );
          })}
        </div>
      </div>

      {/* Subjects List */}
      <div className="space-y-4">
        {subjects.map((subject) => {
          const m = marks[subject.id] || {};
          const { finalScore, rawScore, totalWeight, unroundedScore, cieScaled, cieRounded, esaScaled, esaRounded, labScaled, labRounded } = getSubjectMetrics(subject);
          const gradeInfo = getGradeInfo(finalScore, subject);
          const finalIsa = getFinalIsaSummary(subject);
          const isa1Label = subject.customConfig?.labels?.isa1 || 'ISA 1';
          const isa2Label = subject.customConfig?.labels?.isa2 || 'ISA 2';
          const assignmentLabel = subject.customConfig?.labels?.assignment || 'Assignment';
          const formatIsaValue = (value) => {
            if (!Number.isFinite(value)) return '0';
            const trimmed = value.toFixed(3).replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
            return trimmed === '' ? '0' : trimmed;
          };
          const isa1Display = formatIsaValue(finalIsa.isa1);
          const isa2Display = formatIsaValue(finalIsa.isa2);
          const assignmentDisplay = formatIsaValue(finalIsa.assignment);
          const isaTotalDisplay = Math.ceil(finalIsa.total).toString();
          const isaMaxDisplay = formatIsaValue(finalIsa.max);
          const isExpanded = expandedSubject === subject.id;
          const hasLabComponent = subject.hasLab || ((subject.customConfig?.weights.lab ?? 0) > 0);
          const showTotalWeight = hasLabComponent && totalWeight > 100;
          const totalWeightLabel = Number.isInteger(totalWeight) ? totalWeight : totalWeight.toFixed(1);
          const rawScoreLabel = rawScore.toFixed(2).replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');

          return (
            <div key={subject.id} className={`${themeClasses.card} rounded-xl border transition-all duration-300 ease-out ${isExpanded ? 'border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.07)] ring-1 ring-blue-500/10' : themeClasses.cardHover}`}>
              {/* Subject Header */}
              <div
                className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between cursor-pointer rounded-t-xl gap-4"
                onClick={() => setExpandedSubject(isExpanded ? null : subject.id)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-lg">{subject.name}</h3>
                    <span className="text-xs font-bold bg-white/[0.08] text-zinc-300 px-2 py-0.5 rounded-full border border-white/[0.06]">
                      {subject.credits} Cr
                    </span>
                    {totalWeight > 100 && (
                      <span className="text-xs font-bold bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/20">
                        Scaled ({totalWeight}%)
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-right">
                    <div className={`text-xs ${themeClasses.muted} font-bold uppercase tracking-wider`}>Score</div>
                    <div className={`font-bold text-xl leading-none ${gradeInfo.color}`}>
                      {finalScore}
                    </div>
                    {showTotalWeight && (
                      <div className={`text-[10px] ${themeClasses.muted} mt-0.5`}>
                        actual: {rawScoreLabel}/{totalWeightLabel}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white shadow-lg ${gradeInfo.bg}`}>
                      {gradeInfo.grade}
                    </div>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-zinc-400" /> : <ChevronDown className="w-5 h-5 text-zinc-400" />}
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className={`p-4 border-t ${themeClasses.border} bg-black/20 rounded-b-xl`}>
                  {/* DYNAMIC INPUTS GRID (Fixed: Allows 0 marks) */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-4">

                    {/* SLOT 1 */}
                    {(subject.hasIsa1 !== false) && (
                      <div className={`${themeClasses.card} p-2 rounded-lg border shadow-sm`}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-xs truncate pr-1" title={subject.customConfig?.labels.isa1 || "ISA 1"}>
                            {subject.customConfig?.labels.isa1 || "ISA 1"}
                          </span>
                          <span className={`text-[10px] ${themeClasses.muted}`}>
                            {subject.customConfig ? subject.customConfig.weights.isa1 : subject.isaWeight}%
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={marks[subject.id]?.isa1 ?? ''}
                            onChange={(e) => handleMarkChange(subject.id, 'isa1', e.target.value)}
                            className={`w-full p-1 text-base md:text-sm font-bold border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none text-center ${themeClasses.input}`}
                            placeholder="-"
                            step="0.5"
                          />
                          <span className={themeClasses.muted}>/</span>
                          <input
                            type="number"
                            value={marks[subject.id]?.isa1Max ?? 40}
                            onChange={(e) => handleMarkChange(subject.id, 'isa1Max', e.target.value)}
                            className={`w-10 p-1 text-base md:text-sm border-none focus:ring-0 text-center ${themeClasses.inputBg} ${themeClasses.muted}`}
                          />
                        </div>
                      </div>
                    )}

                    {/* SLOT 2 */}
                    {(subject.hasIsa2 !== false) && (
                      <div className={`${themeClasses.card} p-2 rounded-lg border shadow-sm`}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-xs truncate pr-1" title={subject.customConfig?.labels.isa2 || "ISA 2"}>
                            {subject.customConfig?.labels.isa2 || "ISA 2"}
                          </span>
                          <span className={`text-[10px] ${themeClasses.muted}`}>
                            {subject.customConfig ? subject.customConfig.weights.isa2 : subject.isaWeight}%
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={marks[subject.id]?.isa2 ?? ''}
                            onChange={(e) => handleMarkChange(subject.id, 'isa2', e.target.value)}
                            className={`w-full p-1 text-base md:text-sm font-bold border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none text-center ${themeClasses.input}`}
                            placeholder="-"
                            step="0.5"
                          />
                          <span className={themeClasses.muted}>/</span>
                          <input
                            type="number"
                            value={marks[subject.id]?.isa2Max ?? 40}
                            onChange={(e) => handleMarkChange(subject.id, 'isa2Max', e.target.value)}
                            className={`w-10 p-1 text-base md:text-sm border-none focus:ring-0 text-center ${themeClasses.inputBg} ${themeClasses.muted}`}
                          />
                        </div>
                      </div>
                    )}

                    {/* SLOT 3 */}
                    {(subject.hasAssignment || (subject.customConfig?.weights.assignment > 0)) && (
                      <div className={`${themeClasses.card} p-2 rounded-lg border shadow-sm`}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-xs truncate pr-1" title={subject.customConfig?.labels.assignment || "Assignment"}>
                            {subject.customConfig?.labels.assignment || "Assignment"}
                          </span>
                          <span className={`text-[10px] ${themeClasses.muted}`}>
                            {subject.customConfig ? subject.customConfig.weights.assignment : subject.assignmentWeight}%
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={marks[subject.id]?.assignment ?? ''}
                            onChange={(e) => handleMarkChange(subject.id, 'assignment', e.target.value)}
                            className={`w-full p-1 text-base md:text-sm font-bold border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none text-center ${themeClasses.input}`}
                            placeholder="-"
                            step="0.5"
                          />
                          <span className={themeClasses.muted}>/</span>
                          <input
                            type="number"
                            value={marks[subject.id]?.assignmentMax ?? 10}
                            onChange={(e) => handleMarkChange(subject.id, 'assignmentMax', e.target.value)}
                            className={`w-10 p-1 text-base md:text-sm border-none focus:ring-0 text-center ${themeClasses.inputBg} ${themeClasses.muted}`}
                          />
                        </div>
                      </div>
                    )}

                    {/* SLOT 4 */}
                    {(subject.hasLab || (subject.customConfig?.weights.lab > 0)) && (
                      <div className={`${themeClasses.card} p-2 rounded-lg border shadow-sm`}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-xs truncate pr-1" title={subject.customConfig?.labels.lab || "Lab"}>
                            {subject.customConfig?.labels.lab || "Lab"}
                          </span>
                          <span className={`text-[10px] ${themeClasses.muted}`}>
                            {subject.customConfig ? subject.customConfig.weights.lab : subject.labWeight}%
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={marks[subject.id]?.lab ?? ''}
                            onChange={(e) => handleMarkChange(subject.id, 'lab', e.target.value)}
                            className={`w-full p-1 text-base md:text-sm font-bold border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none text-center ${themeClasses.input}`}
                            placeholder="-"
                            step="0.5"
                          />
                          <span className={themeClasses.muted}>/</span>
                          <input
                            type="number"
                            value={marks[subject.id]?.labMax ?? 20}
                            onChange={(e) => handleMarkChange(subject.id, 'labMax', e.target.value)}
                            className={`w-10 p-1 text-base md:text-sm border-none focus:ring-0 text-center ${themeClasses.inputBg} ${themeClasses.muted}`}
                          />
                        </div>
                      </div>
                    )}

                    {/* SLOT 5: ESA */}
                    <div className={`${themeClasses.card} p-2 rounded-lg border shadow-sm border-blue-500/20`}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-xs text-blue-400 truncate pr-1" title={subject.customConfig?.labels.esa || "ESA"}>
                          {subject.customConfig?.labels.esa || "ESA"}
                        </span>
                        <span className={`text-[10px] ${themeClasses.muted}`}>
                          {subject.customConfig ? subject.customConfig.weights.esa : subject.esaWeight}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={marks[subject.id]?.esa ?? ''}
                          onChange={(e) => handleMarkChange(subject.id, 'esa', e.target.value)}
                          className={`w-full p-1 text-base md:text-sm font-bold border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none text-center ${themeClasses.input}`}
                          placeholder="-"
                          step="0.5"
                        />
                        <span className={themeClasses.muted}>/</span>
                        <input
                          type="number"
                          value={marks[subject.id]?.esaMax ?? 100}
                          onChange={(e) => handleMarkChange(subject.id, 'esaMax', e.target.value)}
                          className={`w-10 p-1 text-base md:text-sm border-none focus:ring-0 text-center ${themeClasses.inputBg} ${themeClasses.muted}`}
                        />
                      </div>
                    </div>

                  </div>

                  {/* Final ISA (out of 50) */}
                  <div className={`${themeClasses.card} p-3 rounded-lg border mb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3`}>
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold text-zinc-500">
                      <Scale className="w-3 h-3" /> Final ISA (out of 50)
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <span className="text-zinc-400">{isa1Label}: <span className="text-zinc-200 font-semibold">{isa1Display}</span></span>
                      <span className="text-zinc-400">{isa2Label} (reduced): <span className="text-zinc-200 font-semibold">{isa2Display}</span></span>
                      <span className="text-zinc-400">{assignmentLabel}: <span className="text-zinc-200 font-semibold">{assignmentDisplay}</span></span>
                      <span className="text-emerald-300 font-semibold">
                        Total: {isaTotalDisplay}/{isaMaxDisplay}
                        <span className="text-zinc-400 font-normal ml-1">
                          (unrounded: {formatIsaValue(finalIsa.total)})
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Unrounded Total Equation (Moved Outside The Box) */}
                  <div className="flex items-center justify-between text-xs px-2 mb-4">
                    <span className="text-zinc-400">Unrounded Total Score:</span>
                    <span className="text-zinc-300 font-medium">
                      {totalWeight !== 100 ? (
                        <>
                          (<span className="text-zinc-300 font-semibold">{formatIsaValue(cieScaled)}</span> + <span className="text-zinc-300 font-semibold">{formatIsaValue(esaScaled)}</span> {hasLabComponent ? <>+ <span className="text-zinc-300 font-semibold">{formatIsaValue(labScaled)}</span></> : ''}) / {totalWeight} &times; 100 = <span className="text-emerald-400 font-bold ml-1">{unroundedScore.toFixed(2)}</span>
                        </>
                      ) : (
                        <>
                          <span className="text-zinc-300 font-semibold">{formatIsaValue(cieScaled)}</span> + <span className="text-zinc-300 font-semibold">{formatIsaValue(esaScaled)}</span> = <span className="text-emerald-400 font-bold ml-1">{unroundedScore.toFixed(2)}</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Collapsible Detailed Rounding Breakdown Dropdown */}
                  <div className="mb-4">
                    <details className="group">
                      <summary className={`flex items-center gap-1.5 text-xs font-bold ${themeClasses.muted} uppercase tracking-wide cursor-pointer hover:text-blue-400 select-none transition-colors`}>
                        <ChevronDown className="w-3.5 h-3.5 transition-transform group-open:rotate-180" /> Show Detailed Rounding Breakdown
                      </summary>
                      <div className="mt-2">
                        {/* Rounding & Marks Breakdown Box */}
                        <div className={`${themeClasses.card} p-4 rounded-lg border space-y-3`}>
                          <div className="flex items-center justify-between border-b pb-2 border-white/[0.06]">
                            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold text-zinc-400">
                              <Scale className="w-3.5 h-3.5" /> Marks & Rounding Breakdown
                            </div>
                            <span className={`text-[10px] ${themeClasses.muted}`}>
                              PESU Scaling Rule
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div className="space-y-1">
                              <div className="font-semibold text-zinc-300 mb-1">CIE (Internals)</div>
                              <div className="flex flex-col gap-1 text-zinc-400">
                                <div className="flex justify-between">
                                  <span>{isa1Label}:</span>
                                  <span className="text-zinc-200 font-semibold">{isa1Display}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>{isa2Label} (reduced):</span>
                                  <span className="text-zinc-200 font-semibold">{isa2Display}</span>
                                </div>
                                {(subject.hasAssignment || (subject.customConfig?.weights.assignment > 0)) && (
                                  <div className="flex justify-between">
                                    <span>{assignmentLabel}:</span>
                                    <span className="text-zinc-200 font-semibold">{assignmentDisplay}</span>
                                  </div>
                                )}
                                <div className="flex justify-between border-t border-white/[0.04] pt-1 font-medium mt-1">
                                  <span className="text-zinc-300">CIE Total (unrounded):</span>
                                  <span className="text-zinc-200">{formatIsaValue(cieScaled)} / 50</span>
                                </div>
                                <div className="flex justify-between text-emerald-400 font-semibold">
                                  <span>CIE Rounded (Ceil):</span>
                                  <span>{cieRounded} / 50</span>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="font-semibold text-zinc-300 mb-1">ESA & Lab Components</div>
                              <div className="flex flex-col gap-1 text-zinc-400">
                                <div className="flex justify-between">
                                  <span>ESA Raw Score:</span>
                                  <span className="text-zinc-200 font-semibold">{m.esa !== '' && m.esa !== undefined ? `${m.esa} / ${m.esaMax || 100}` : '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>ESA (unrounded):</span>
                                  <span className="text-zinc-200 font-semibold">{formatIsaValue(esaScaled)} / 50</span>
                                </div>
                                <div className="flex justify-between text-emerald-400 font-semibold mb-2">
                                  <span>ESA Rounded (Ceil):</span>
                                  <span>{esaRounded} / 50</span>
                                </div>

                                {hasLabComponent && (
                                  <>
                                    <div className="border-t border-white/[0.04] pt-1 flex justify-between">
                                      <span>Lab Raw Score:</span>
                                      <span className="text-zinc-200 font-semibold">{m.lab !== '' && m.lab !== undefined ? `${m.lab} / ${m.labMax || 20}` : '-'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Lab (unrounded):</span>
                                      <span className="text-zinc-200 font-semibold">{formatIsaValue(labScaled)} / {subject.labWeight || 20}</span>
                                    </div>
                                    <div className="flex justify-between text-emerald-400 font-semibold">
                                      <span>Lab Rounded (Ceil):</span>
                                      <span>{labRounded} / {subject.labWeight || 20}</span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                            <div>
                              <span className="text-zinc-400 font-medium">Unrounded Total: </span>
                              <span className="text-zinc-200 font-bold text-sm">{unroundedScore.toFixed(2)}</span>
                              <span className="text-[10px] text-zinc-500 block">Sum of raw components scaled to 100</span>
                            </div>
                            <div className="text-right sm:text-right">
                              <span className="text-emerald-400 font-semibold">Final Rounded Score: </span>
                              <span className="text-emerald-300 font-bold text-sm bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{finalScore}</span>
                              <span className="text-[10px] text-zinc-500 block">Ceil(CIE) + Ceil(Lab) + Ceil(ESA) scaled</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </details>
                  </div>

                  {/* Quick Config */}
                  <div className={`mt-4 pt-4 border-t ${themeClasses.border}`}>
                    <details className="group">
                      <summary className={`flex items-center gap-2 text-xs font-bold ${themeClasses.muted} uppercase tracking-wide cursor-pointer hover:text-blue-400 select-none transition-colors`}>
                        <Settings className="w-4 h-4" /> Edit Subject Details
                      </summary>
                      <div className={`mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 ${themeClasses.card} rounded-lg border`}>
                        <div className="space-y-3">
                          <div>
                            <label className={`text-xs ${themeClasses.muted} block mb-1`}>Name</label>
                            <input
                              type="text"
                              value={subject.name}
                              onChange={(e) => handleSubjectChange(subject.id, 'name', e.target.value)}
                              className={`w-full text-sm p-2 border rounded ${themeClasses.input}`}
                            />
                          </div>
                          <div>
                            <label className={`text-xs ${themeClasses.muted} block mb-1`}>Credits</label>
                            <input
                              type="number"
                              value={subject.credits}
                              onChange={(e) => handleSubjectChange(subject.id, 'credits', parseFloat(e.target.value) || 0)}
                              className={`w-full text-sm p-2 border rounded ${themeClasses.input}`}
                            />
                          </div>
                          <div className="flex gap-4">
                            <label className="flex items-center gap-2 text-xs cursor-pointer">
                              <input
                                type="checkbox"
                                checked={subject.hasAssignment}
                                onChange={() => toggleAssignment(subject.id)}
                                className="rounded"
                              />
                              Has Assignment
                            </label>
                            <label className="flex items-center gap-2 text-xs cursor-pointer">
                              <input
                                type="checkbox"
                                checked={subject.hasLab}
                                onChange={() => toggleLab(subject.id)}
                                className="rounded"
                              />
                              Has Lab
                            </label>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <label className={`text-xs ${themeClasses.muted} block`}>Weight Configuration (%)</label>
                          <div className="flex gap-2 flex-wrap">
                            <div className="flex-1 min-w-[60px]">
                              <span className={`text-[10px] ${themeClasses.muted} block`}>ISA (Each)</span>
                              <input
                                type="number"
                                value={subject.isaWeight}
                                onChange={(e) => handleSubjectChange(subject.id, 'isaWeight', parseFloat(e.target.value) || 0)}
                                className={`w-full text-sm p-1 border rounded ${themeClasses.input}`}
                              />
                            </div>
                            <div className="flex-1 min-w-[60px]">
                              <span className={`text-[10px] ${themeClasses.muted} block`}>ESA</span>
                              <input
                                type="number"
                                value={subject.esaWeight}
                                onChange={(e) => handleSubjectChange(subject.id, 'esaWeight', parseFloat(e.target.value) || 0)}
                                className={`w-full text-sm p-1 border rounded ${themeClasses.input}`}
                              />
                            </div>
                            {subject.hasAssignment && (
                              <div className="flex-1 min-w-[60px]">
                                <span className={`text-[10px] ${themeClasses.muted} block`}>Assign</span>
                                <input
                                  type="number"
                                  value={subject.assignmentWeight}
                                  onChange={(e) => handleSubjectChange(subject.id, 'assignmentWeight', parseFloat(e.target.value) || 0)}
                                  className={`w-full text-sm p-1 border rounded ${themeClasses.input}`}
                                />
                              </div>
                            )}
                            {subject.hasLab && (
                              <div className="flex-1 min-w-[60px]">
                                <span className={`text-[10px] ${themeClasses.muted} block`}>Lab</span>
                                <input
                                  type="number"
                                  value={subject.labWeight}
                                  onChange={(e) => handleSubjectChange(subject.id, 'labWeight', parseFloat(e.target.value) || 0)}
                                  className={`w-full text-sm p-1 border rounded ${themeClasses.input}`}
                                />
                              </div>
                            )}
                          </div>

                          {/* --- Grade Cutoff Editor --- */}
                          <div className="mt-4 pt-3 border-t border-white/[0.08] w-full">
                            <details>
                              <summary className="text-xs font-bold cursor-pointer hover:text-blue-500 flex items-center gap-1 select-none text-zinc-500">
                                <Target className="w-3 h-3" /> Advanced: Adjust Grade Cutoffs (Curve)
                              </summary>

                              <div className="mt-3 p-3 bg-yellow-500/5 rounded border border-yellow-500/15">
                                <p className="text-[10px] text-zinc-400 mb-2">
                                  If the paper was hard and cutoffs were lowered, adjust them here.
                                </p>

                                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                  {(subject.customGradeMap || GradeMap).filter(g => g.gp > 0).map((g, idx) => (
                                    <div key={g.grade} className="flex flex-col">
                                      <label className={`text-[10px] font-bold text-center mb-1 ${g.color || 'text-zinc-500'}`}>
                                        {g.grade} (&ge;)
                                      </label>
                                      <input
                                        type="number"
                                        value={g.min}
                                        className={`w-full text-center text-xs p-1 border rounded ${themeClasses.input}`}
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
                                    onClick={() => handleSubjectChange(subject.id, 'customGradeMap', null)}
                                    className="mt-2 text-[10px] text-red-500 hover:underline flex items-center gap-1"
                                  >
                                    <RotateCcw className="w-3 h-3" /> Reset to Standards
                                  </button>
                                )}
                              </div>
                            </details>
                          </div>

                          <button
                            onClick={() => removeSubject(subject.id)}
                            className="w-full text-red-400 text-xs border border-red-500/20 bg-red-500/10 hover:bg-red-500/15  p-2 rounded flex items-center justify-center gap-2 mt-2"
                          >
                            <Trash2 className="w-3 h-3" /> Remove Subject
                          </button>
                        </div>
                      </div>
                    </details>
                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={addNewSubject}
        className={`w-full py-3 border-2 border-dashed ${themeClasses.border} rounded-xl ${themeClasses.muted} hover:text-blue-400 hover:border-blue-500/40 hover:bg-blue-500/10 transition-all duration-200 flex items-center justify-center gap-2 font-bold text-sm`}
      >
        <Plus className="w-4 h-4" /> Add Custom Subject
      </button>

      {/* Subtle "Next Steps" Footer */}
      <div className="mt-8 mb-2 flex justify-center">
        <div className={`inline-flex flex-col sm:flex-row items-center gap-3 sm:gap-6 p-1 sm:p-2 sm:px-4 rounded-xl border bg-[#0e0e18]/50 border-white/[0.06] transition-all`}>

          <span className={`text-xs font-semibold ${themeClasses.muted} hidden sm:block`}>
            Done updating?
          </span>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('analysis')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-blue-300 bg-blue-500/10 hover:bg-blue-500/15 rounded-lg transition-colors"
            >
              <Activity className="w-3.5 h-3.5" /> Check Analysis
            </button>

            <button
              onClick={() => setActiveTab('reverse')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-teal-300 bg-teal-500/10 hover:bg-teal-500/15 rounded-lg transition-colors"
            >
              <Target className="w-3.5 h-3.5" /> Plan Targets
            </button>
          </div>
        </div>
      </div>

      {/* ==================== QUICK SGPA ESTIMATOR (FROM GRADES) ==================== */}
      <div className={`${themeClasses.card} border rounded-xl overflow-hidden mt-6`}>
        <details className="group">
          <summary className="flex items-center justify-between p-4 cursor-pointer list-none select-none hover:bg-white/[0.03] transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-md">
                <span className="text-zinc-200 text-lg font-bold">✨</span>
              </div>
              <div className="text-left">
                <h3 className="font-bold text-sm text-zinc-200">Quick SGPA Estimator</h3>
                <p className={`text-xs ${themeClasses.muted}`}>Calculate SGPA by directly selecting grades</p>
              </div>
            </div>
            <ChevronDown className="w-5 h-5 opacity-50 transition-transform group-open:rotate-180" />
          </summary>

          <div className={`p-4 border-t ${themeClasses.border} bg-black/20`}>

            {/* Results Header */}
            <div className="flex items-center justify-between mb-4 bg-[#0e0e18] p-3 rounded-lg border border-white/[0.06] shadow-sm">
              <span className="text-xs font-bold uppercase opacity-50">Hypothetical SGPA</span>
              <span className="text-2xl font-black text-teal-400">
                {(() => {
                  let totalPoints = 0;
                  let totalCredits = 0;
                  subjects.forEach(sub => {
                    const scheme = sub.customGradeMap || GradeMap;
                    const maxGradeObj = scheme.reduce((max, current) => current.gp > max.gp ? current : max, scheme[0]);
                    const maxGrade = maxGradeObj ? maxGradeObj.grade : "";
                    const gradeLetter = manualGrades[sub.id] !== undefined ? manualGrades[sub.id] : maxGrade;
                    if (gradeLetter) {
                      const scheme = sub.customGradeMap || GradeMap;
                      const gradeObj = scheme.find(g => g.grade === gradeLetter);
                      if (gradeObj) {
                        totalPoints += gradeObj.gp * sub.credits;
                        totalCredits += sub.credits;
                      }
                    }
                  });
                  return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";
                })()}
              </span>
            </div>

            {/* Subject List with Dropdowns */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
              {subjects.length === 0 ? (
                <div className="text-center py-4 text-xs opacity-50">No subjects added yet.</div>
              ) : (
                subjects.map(sub => {
                  const scheme = sub.customGradeMap || GradeMap;
                  const maxGradeObj = scheme.reduce((max, current) => current.gp > max.gp ? current : max, scheme[0]);
                  const maxGrade = maxGradeObj ? maxGradeObj.grade : "";
                  const selectedGrade = manualGrades[sub.id] !== undefined ? manualGrades[sub.id] : maxGrade;

                  return (
                    <div key={sub.id} className="flex items-center justify-between gap-3 p-2 bg-[#0e0e18] rounded border border-white/[0.06]">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold truncate" title={sub.name}>{sub.name}</div>
                        <div className="text-[10px] opacity-50">{sub.credits} Credits</div>
                      </div>

                      <select
                        value={selectedGrade}
                        onChange={(e) => setManualGrades(prev => ({ ...prev, [sub.id]: e.target.value }))}
                        className={`w-24 p-1.5 text-xs font-bold border rounded focus:ring-2 focus:ring-teal-500 focus:outline-none ${themeClasses.input}`}
                      >
                        <option value="">- Select -</option>
                        {scheme.map(g => (
                          <option key={g.grade} value={g.grade}>
                            {g.grade} ({g.gp})
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-3 flex justify-end">
              <button
                onClick={() => setManualGrades({})}
                className="text-xs text-red-500 hover:text-red-400 font-medium underline decoration-red-500/30 hover:decoration-red-500 underline-offset-2 transition-all"
              >
                Reset All
              </button>
            </div>

          </div>
        </details>
      </div>

      {/* ==================== NOT FROM PES? CUSTOM TEMPLATE BUILDER ==================== */}
      <div className={`${themeClasses.card} border rounded-xl overflow-hidden mt-8`}>
        <button
          onClick={() => setShowTemplateBuilder(!showTemplateBuilder)}
          className={`w-full p-4 flex items-center justify-between hover:bg-white/[0.03] hover:bg-white/[0.04] transition-colors`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
              <Settings className="w-5 h-5 text-zinc-200" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-sm">Not from PES? 🎓</h3>
              <p className={`text-xs ${themeClasses.muted}`}>Configure for VTU, IIT, or Custom Colleges</p>
            </div>
          </div>
          {showTemplateBuilder ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        {showTemplateBuilder && (
          <div className={`p-4 border-t ${themeClasses.border} space-y-6 animate-in slide-in-from-top-2`}>

            {/* Intro Text */}
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-4 rounded-lg border border-purple-500/20">
              <p className="text-sm text-purple-200">
                <strong>Universal Mode (Experimental):</strong> This calculator works for any college. Define your assessment pattern and grading scheme below, then click "Create Subject".
              </p>
              <p className="text-xs text-purple-300/80 mt-1.5 leading-relaxed">
                ⚠️ <strong>Note:</strong> Universal Mode is currently in an experimental phase and might be half-baked for complex custom curriculums or edge-case calculations.
              </p>
            </div>

            {/* Step 1: Basic Info */}
            <div className="space-y-4">
              <h4 className="font-bold text-sm flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-500 text-zinc-200 flex items-center justify-center text-xs">1</span>
                Basic Information
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`text-xs ${themeClasses.muted} block mb-1`}>Subject Name</label>
                  <input
                    type="text"
                    value={customTemplate.name}
                    onChange={(e) => setCustomTemplate(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Data Structures"
                    className={`w-full p-2 border rounded-lg text-sm ${themeClasses.input}`}
                  />
                </div>
                <div>
                  <label className={`text-xs ${themeClasses.muted} block mb-1`}>Credits</label>
                  <input
                    type="number"
                    value={customTemplate.credits}
                    onChange={(e) => setCustomTemplate(prev => ({ ...prev, credits: parseFloat(e.target.value) || 0 }))}
                    min="1"
                    max="10"
                    className={`w-full p-2 border rounded-lg text-sm ${themeClasses.input}`}
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Assessment Components */}
            <div className="space-y-4">
              <h4 className="font-bold text-sm flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-500 text-zinc-200 flex items-center justify-center text-xs">2</span>
                Assessment Pattern
              </h4>

              <div className="space-y-2">
                {customTemplate.components.map((comp, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-wrap sm:flex-nowrap items-center gap-2 p-2 rounded-lg border transition-all ${comp.enabled
                      ? `${themeClasses.card} ${themeClasses.border}`
                      : 'bg-white/[0.04] border-white/[0.08] opacity-50'
                      }`}
                  >
                    <div className="flex items-center gap-2 flex-grow min-w-[120px]">
                      <input
                        type="checkbox"
                        checked={comp.enabled}
                        onChange={(e) => updateTemplateComponent(idx, 'enabled', e.target.checked)}
                        className="rounded"
                      />

                      <input
                        type="text"
                        value={comp.name}
                        onChange={(e) => updateTemplateComponent(idx, 'name', e.target.value)}
                        disabled={!comp.enabled}
                        className={`flex-1 p-1 text-xs border-b border-transparent hover:border-white/[0.1] bg-transparent focus:outline-none ${!comp.enabled && 'opacity-50'}`}
                      />
                    </div>

                    {/* Right Side Controls - Now grouped to stay together */}
                    <div className="flex items-center gap-2 ml-auto">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={comp.weight}
                          onChange={(e) => updateTemplateComponent(idx, 'weight', parseFloat(e.target.value) || 0)}
                          disabled={!comp.enabled}
                          className={`w-10 p-1 text-xs text-center border rounded ${themeClasses.input}`}
                        />
                        <span className={`text-[10px] ${themeClasses.muted}`}>%</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <span className={`text-[10px] ${themeClasses.muted}`}>Max:</span>
                        <input
                          type="number"
                          value={comp.maxMarks}
                          onChange={(e) => updateTemplateComponent(idx, 'maxMarks', parseFloat(e.target.value) || 0)}
                          disabled={!comp.enabled}
                          className={`w-10 p-1 text-xs text-center border rounded ${themeClasses.input}`}
                        />
                      </div>

                      <button
                        onClick={() => removeComponentFromTemplate(idx)}
                        className="p-1 text-red-500 hover:bg-red-500/10 rounded"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={addComponentToTemplate}
                className={`w-full py-2 border-2 border-dashed ${themeClasses.border} rounded-lg ${themeClasses.muted} hover:text-purple-400 hover:border-purple-500/40 transition-all flex items-center justify-center gap-2 text-xs font-bold`}
              >
                <Plus className="w-3 h-3" /> Add Component
              </button>

              {customTemplate.components.filter(c => c.enabled).reduce((sum, c) => sum + c.weight, 0) !== 100 && (
                <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-3 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-yellow-300">
                    <strong>Note:</strong> Total weight is {customTemplate.components.filter(c => c.enabled).reduce((sum, c) => sum + c.weight, 0)}%. (PES uses 120%, but standard is 100%).
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Grading Scheme */}
            <div className="space-y-4">
              <h4 className="font-bold text-sm flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-500 text-zinc-200 flex items-center justify-center text-xs">3</span>
                Grading Scheme
              </h4>

              <div>
                <label className={`text-xs ${themeClasses.muted} block mb-1`}>Preset:</label>
                <select
                  value={customTemplate.gradingScheme}
                  onChange={(e) => {
                    const scheme = e.target.value;
                    setCustomTemplate(prev => ({
                      ...prev,
                      gradingScheme: scheme,
                      customGrades: scheme === "Custom"
                        ? prev.customGrades
                        : JSON.parse(JSON.stringify(GradingSchemes[scheme]))
                    }));
                  }}
                  className={`w-full p-2 border rounded-lg text-sm ${themeClasses.input}`}
                >
                  {Object.keys(GradingSchemes).map(key => (
                    <option key={key} value={key}>{key}</option>
                  ))}
                </select>
              </div>

              <div className={`p-3 rounded-lg border ${themeClasses.border} bg-[#0e0e18]/50`}>
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 text-[10px] uppercase font-bold opacity-50 px-1">
                    <div className="col-span-3">Grade</div>
                    <div className="col-span-4">Min (≥)</div>
                    <div className="col-span-4">Points</div>
                    <div className="col-span-1"></div>
                  </div>

                  {customTemplate.customGrades.sort((a, b) => b.min - a.min).map((g, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                      <input
                        type="text"
                        value={g.grade}
                        onChange={(e) => updateCustomGrade(idx, 'grade', e.target.value)}
                        className={`col-span-3 p-1 text-xs text-center border rounded font-bold ${themeClasses.input}`}
                      />
                      <input
                        type="number"
                        value={g.min}
                        onChange={(e) => updateCustomGrade(idx, 'min', e.target.value)}
                        className={`col-span-4 p-1 text-xs text-center border rounded ${themeClasses.input}`}
                      />
                      <input
                        type="number"
                        value={g.gp}
                        onChange={(e) => updateCustomGrade(idx, 'gp', e.target.value)}
                        className={`col-span-4 p-1 text-xs text-center border rounded ${themeClasses.input}`}
                      />
                      <button onClick={() => removeCustomGrade(idx)} className="col-span-1 text-red-500 hover:bg-red-500/10 rounded flex justify-center">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={addCustomGrade}
                  className="mt-3 text-xs text-purple-400 hover:underline flex items-center gap-1 w-full justify-center"
                >
                  <Plus className="w-3 h-3" /> Add Grade Row
                </button>
              </div>

              <button
                onClick={applyGradingSchemeToAll}
                className="w-full py-2 text-xs bg-indigo-500/10 text-indigo-300 rounded-lg hover:bg-indigo-250 transition-colors flex items-center justify-center gap-2"
              >
                <Zap className="w-3 h-3" /> Apply Scheme to ALL Subjects
              </button>
            </div>

            {/* Create Button */}
            <div className="flex gap-3 pt-4 border-t border-white/[0.06]">
              <button
                onClick={applyCustomTemplate}
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-zinc-200 rounded-lg font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Create Subject
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
