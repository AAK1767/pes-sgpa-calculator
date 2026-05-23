import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, ChevronUp, Settings, Trash2, 
  RotateCcw, Target, Lock, Unlock, HelpCircle 
} from 'lucide-react';

export default function SubjectCard({
  subject,
  m,
  handleMarkChange,
  handleSubjectChange,
  toggleLab,
  toggleAssignment,
  removeSubject,
  isExpanded,
  setExpandedSubject,
  getSubjectMetrics,
  getGradePoint,
  getGradeInfo
}) {
  const metrics = getSubjectMetrics(subject);
  const gradeInfo = getGradeInfo(metrics.finalScore, subject);

  // Grade color profiles mapping to premium shadows/borders
  const gradeStyles = {
    S: { border: 'border-emerald-500/25', glow: 'shadow-[0_0_15px_rgba(52,211,153,0.06)]', text: 'text-emerald-400', bg: 'bg-emerald-500' },
    A: { border: 'border-blue-500/25', glow: 'shadow-[0_0_15px_rgba(59,130,246,0.06)]', text: 'text-blue-400', bg: 'bg-blue-500' },
    B: { border: 'border-indigo-500/25', glow: 'shadow-[0_0_15px_rgba(99,102,241,0.06)]', text: 'text-indigo-400', bg: 'bg-indigo-500' },
    C: { border: 'border-yellow-500/25', glow: 'shadow-[0_0_15px_rgba(251,191,36,0.06)]', text: 'text-yellow-400', bg: 'bg-yellow-500' },
    D: { border: 'border-orange-500/25', glow: 'shadow-[0_0_15px_rgba(249,115,22,0.06)]', text: 'text-orange-400', bg: 'bg-orange-500' },
    E: { border: 'border-rose-400/25', glow: 'shadow-[0_0_15px_rgba(251,113,133,0.06)]', text: 'text-rose-400', bg: 'bg-rose-400' },
    F: { border: 'border-red-600/30', glow: 'shadow-[0_0_15px_rgba(220,38,38,0.08)]', text: 'text-red-500', bg: 'bg-red-600' }
  };

  const style = gradeStyles[gradeInfo.grade] || { border: 'border-white/[0.04]', glow: '', text: 'text-zinc-400', bg: 'bg-zinc-600' };

  // Calculate secured internals progress
  const hasLabComponent = subject.hasLab || ((subject.customConfig?.weights.lab ?? 0) > 0);
  const totalWeightLabel = Number.isInteger(metrics.totalWeight) ? metrics.totalWeight : metrics.totalWeight.toFixed(1);
  const rawScoreLabel = Number.isInteger(metrics.rawScore) ? metrics.rawScore : metrics.rawScore.toFixed(1);

  // Compute Internals secured out of total internals weight
  const internalsWeight = metrics.totalWeight - subject.esaWeight;
  const internalsPct = internalsWeight > 0 ? (metrics.currentInternals / internalsWeight) * 100 : 0;
  
  const ringRadius = 14;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringStrokeOffset = ringCircumference - (Math.min(internalsPct, 100) / 100) * ringCircumference;

  return (
    <div 
      className={`glass-panel rounded-2xl transition-all duration-300 border ${
        isExpanded 
          ? `${style.border} ${style.glow} bg-[#0c0c16]/75 ring-1 ring-indigo-500/10` 
          : 'border-white/[0.04] hover:border-white/[0.08] hover:bg-[#0c0c16]/60 shadow-md shadow-black/15'
      }`}
    >
      {/* Subject Header (Tactile & Clean) */}
      <div
        className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between cursor-pointer select-none gap-4"
        onClick={() => setExpandedSubject(isExpanded ? null : subject.id)}
      >
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Circular Internals Progress Ring */}
          {internalsWeight > 0 && (
            <div className="relative w-9 h-9 flex items-center justify-center flex-shrink-0 bg-white/[0.02] rounded-full border border-white/[0.04]" title={`Internals Secured: ${metrics.currentInternals.toFixed(1)} / ${internalsWeight}%`}>
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="18" cy="18" r={ringRadius} className="stroke-zinc-800/60" strokeWidth="2.5" fill="transparent" />
                <motion.circle
                  cx="18"
                  cy="18"
                  r={ringRadius}
                  className="stroke-indigo-400"
                  strokeWidth="2.5"
                  fill="transparent"
                  strokeDasharray={ringCircumference}
                  initial={{ strokeDashoffset: ringCircumference }}
                  animate={{ strokeDashoffset: ringStrokeOffset }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute text-[8px] font-bold text-zinc-400">
                {Math.round(internalsPct)}%
              </div>
            </div>
          )}
          
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-extrabold text-base text-white tracking-tight truncate max-w-[200px] sm:max-w-none">
                {subject.name}
              </h3>
              <span className="text-[10px] font-bold bg-white/[0.06] text-zinc-400 px-2 py-0.5 rounded-full border border-white/[0.04]">
                {subject.credits} Credits
              </span>
              {metrics.totalWeight > 100 && (
                <span className="text-[9px] font-semibold bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/10">
                  Scaled ({metrics.totalWeight}%)
                </span>
              )}
            </div>
            <div className="text-[10px] text-zinc-500 mt-0.5">
              Internals: {metrics.currentInternals.toFixed(1)}/{internalsWeight}% Available
            </div>
          </div>
        </div>

        {/* Score & Expanded indicators */}
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t border-white/[0.04] pt-3 sm:pt-0 sm:border-none">
          <div className="text-right">
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Est. Score</span>
            <div className={`font-black text-xl leading-none tracking-tight ${style.text}`}>
              {metrics.finalScore}%
            </div>
            {hasLabComponent && metrics.totalWeight > 100 && (
              <div className="text-[8px] text-zinc-500 mt-0.5 font-mono">
                raw: {rawScoreLabel}/{totalWeightLabel}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-sm text-white shadow-lg ${style.bg}`}>
              {gradeInfo.grade}
            </div>
            <div className="w-8 h-8 rounded-full bg-white/[0.02] border border-white/[0.04] flex items-center justify-center text-zinc-400 hover:text-white transition-all">
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Marks Input Drawer (Smooth framer-motion slider) */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-4 border-t border-white/[0.04] bg-black/20 space-y-4 rounded-b-2xl">
              {/* Dynamic Inputs grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {/* ISA 1 Input */}
                {subject.hasIsa1 !== false && (
                  <div className="bg-black/30 p-2.5 rounded-xl border border-white/[0.04] shadow-sm">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="font-bold text-[10px] text-zinc-400 truncate pr-1" title={subject.customConfig?.labels.isa1 || "ISA 1"}>
                        {subject.customConfig?.labels.isa1 || "ISA 1"}
                      </span>
                      <span className="text-[9px] text-zinc-500 font-mono">
                        {subject.customConfig ? subject.customConfig.weights.isa1 : subject.isaWeight}%
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-black/20 rounded-lg px-2 py-1 border border-white/[0.04]">
                      <input
                        type="number"
                        value={m?.isa1 ?? ''}
                        onChange={(e) => handleMarkChange(subject.id, 'isa1', e.target.value)}
                        className="w-full bg-transparent text-sm font-extrabold text-white text-center focus:outline-none placeholder:text-zinc-700"
                        placeholder="-"
                      />
                      <span className="text-zinc-600 text-xs">/</span>
                      <input
                        type="number"
                        value={m?.isa1Max ?? 40}
                        onChange={(e) => handleMarkChange(subject.id, 'isa1Max', e.target.value)}
                        className="w-8 bg-transparent text-xs text-zinc-500 text-center font-bold focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* ISA 2 Input */}
                {subject.hasIsa2 !== false && (
                  <div className="bg-black/30 p-2.5 rounded-xl border border-white/[0.04] shadow-sm">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="font-bold text-[10px] text-zinc-400 truncate pr-1" title={subject.customConfig?.labels.isa2 || "ISA 2"}>
                        {subject.customConfig?.labels.isa2 || "ISA 2"}
                      </span>
                      <span className="text-[9px] text-zinc-500 font-mono">
                        {subject.customConfig ? subject.customConfig.weights.isa2 : subject.isaWeight}%
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-black/20 rounded-lg px-2 py-1 border border-white/[0.04]">
                      <input
                        type="number"
                        value={m?.isa2 ?? ''}
                        onChange={(e) => handleMarkChange(subject.id, 'isa2', e.target.value)}
                        className="w-full bg-transparent text-sm font-extrabold text-white text-center focus:outline-none placeholder:text-zinc-700"
                        placeholder="-"
                      />
                      <span className="text-zinc-600 text-xs">/</span>
                      <input
                        type="number"
                        value={m?.isa2Max ?? 40}
                        onChange={(e) => handleMarkChange(subject.id, 'isa2Max', e.target.value)}
                        className="w-8 bg-transparent text-xs text-zinc-500 text-center font-bold focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Assignment Component */}
                {(subject.hasAssignment || (subject.customConfig?.weights.assignment > 0)) && (
                  <div className="bg-black/30 p-2.5 rounded-xl border border-white/[0.04] shadow-sm">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="font-bold text-[10px] text-zinc-400 truncate pr-1" title={subject.customConfig?.labels.assignment || "Assignment"}>
                        {subject.customConfig?.labels.assignment || "Assignment"}
                      </span>
                      <span className="text-[9px] text-zinc-500 font-mono">
                        {subject.customConfig ? subject.customConfig.weights.assignment : subject.assignmentWeight}%
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-black/20 rounded-lg px-2 py-1 border border-white/[0.04]">
                      <input
                        type="number"
                        value={m?.assignment ?? ''}
                        onChange={(e) => handleMarkChange(subject.id, 'assignment', e.target.value)}
                        className="w-full bg-transparent text-sm font-extrabold text-white text-center focus:outline-none placeholder:text-zinc-700"
                        placeholder="-"
                      />
                      <span className="text-zinc-600 text-xs">/</span>
                      <input
                        type="number"
                        value={m?.assignmentMax ?? 10}
                        onChange={(e) => handleMarkChange(subject.id, 'assignmentMax', e.target.value)}
                        className="w-8 bg-transparent text-xs text-zinc-500 text-center font-bold focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Lab Component */}
                {(subject.hasLab || (subject.customConfig?.weights.lab > 0)) && (
                  <div className="bg-black/30 p-2.5 rounded-xl border border-white/[0.04] shadow-sm">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="font-bold text-[10px] text-zinc-400 truncate pr-1" title={subject.customConfig?.labels.lab || "Lab"}>
                        {subject.customConfig?.labels.lab || "Lab"}
                      </span>
                      <span className="text-[9px] text-zinc-500 font-mono">
                        {subject.customConfig ? subject.customConfig.weights.lab : subject.labWeight}%
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-black/20 rounded-lg px-2 py-1 border border-white/[0.04]">
                      <input
                        type="number"
                        value={m?.lab ?? ''}
                        onChange={(e) => handleMarkChange(subject.id, 'lab', e.target.value)}
                        className="w-full bg-transparent text-sm font-extrabold text-white text-center focus:outline-none placeholder:text-zinc-700"
                        placeholder="-"
                      />
                      <span className="text-zinc-600 text-xs">/</span>
                      <input
                        type="number"
                        value={m?.labMax ?? 20}
                        onChange={(e) => handleMarkChange(subject.id, 'labMax', e.target.value)}
                        className="w-8 bg-transparent text-xs text-zinc-500 text-center font-bold focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* ESA Component */}
                <div className="bg-black/30 p-2.5 rounded-xl border border-indigo-500/10 shadow-sm col-span-2 sm:col-span-1">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-extrabold text-[10px] text-indigo-400 truncate pr-1" title={subject.customConfig?.labels.esa || "ESA"}>
                      {subject.customConfig?.labels.esa || "ESA"}
                    </span>
                    <span className="text-[9px] text-indigo-500/80 font-mono font-bold">
                      {subject.customConfig ? subject.customConfig.weights.esa : subject.esaWeight}%
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-black/20 rounded-lg px-2 py-1 border border-indigo-500/20">
                    <input
                      type="number"
                      value={m?.esa ?? ''}
                      onChange={(e) => handleMarkChange(subject.id, 'esa', e.target.value)}
                      className="w-full bg-transparent text-sm font-extrabold text-white text-center focus:outline-none placeholder:text-zinc-700"
                      placeholder="-"
                    />
                    <span className="text-zinc-600 text-xs">/</span>
                    <input
                      type="number"
                      value={m?.esaMax ?? 100}
                      onChange={(e) => handleMarkChange(subject.id, 'esaMax', e.target.value)}
                      className="w-8 bg-transparent text-xs text-zinc-500 text-center font-bold focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Advanced Settings collapsible panel */}
              <div className="pt-2 border-t border-white/[0.04]">
                <details className="group">
                  <summary className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest cursor-pointer hover:text-indigo-400 select-none transition-colors">
                    <Settings className="w-3.5 h-3.5" /> Adjust Weights & Grade Curves
                  </summary>
                  
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white/[0.02] border border-white/[0.04] rounded-xl">
                    {/* Left Details: Basic Subject info & Components toggle */}
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">Subject Name</label>
                          <input
                            type="text"
                            value={subject.name}
                            onChange={(e) => handleSubjectChange(subject.id, 'name', e.target.value)}
                            className="w-full text-xs p-2 bg-black/40 border border-white/[0.06] rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">Credit Units</label>
                          <input
                            type="number"
                            value={subject.credits}
                            onChange={(e) => handleSubjectChange(subject.id, 'credits', parseFloat(e.target.value) || 0)}
                            className="w-full text-xs p-2 bg-black/40 border border-white/[0.06] rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                      
                      <div className="flex gap-4 pt-1">
                        <label className="flex items-center gap-2 text-[10px] text-zinc-400 font-semibold cursor-pointer">
                          <input
                            type="checkbox"
                            checked={subject.hasAssignment}
                            onChange={() => toggleAssignment(subject.id)}
                            className="rounded border-white/[0.08] bg-black/40 accent-indigo-500"
                          />
                          Include Assignment
                        </label>
                        <label className="flex items-center gap-2 text-[10px] text-zinc-400 font-semibold cursor-pointer">
                          <input
                            type="checkbox"
                            checked={subject.hasLab}
                            onChange={() => toggleLab(subject.id)}
                            className="rounded border-white/[0.08] bg-black/40 accent-indigo-500"
                          />
                          Include Practical/Lab
                        </label>
                      </div>
                    </div>

                    {/* Right Details: Custom curves & Weights */}
                    <div className="space-y-3.5">
                      <div className="space-y-1">
                        <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Custom Component Weights (%)</label>
                        <div className="flex gap-2 flex-wrap">
                          <div className="flex-1 min-w-[50px]">
                            <span className="text-[8px] text-zinc-400 block font-mono">ISA (Each)</span>
                            <input
                              type="number"
                              value={subject.isaWeight}
                              onChange={(e) => handleSubjectChange(subject.id, 'isaWeight', parseFloat(e.target.value) || 0)}
                              className="w-full text-center text-xs p-1 bg-black/40 border border-white/[0.06] rounded-lg text-white"
                            />
                          </div>
                          <div className="flex-1 min-w-[50px]">
                            <span className="text-[8px] text-zinc-400 block font-mono">ESA</span>
                            <input
                              type="number"
                              value={subject.esaWeight}
                              onChange={(e) => handleSubjectChange(subject.id, 'esaWeight', parseFloat(e.target.value) || 0)}
                              className="w-full text-center text-xs p-1 bg-black/40 border border-white/[0.06] rounded-lg text-white"
                            />
                          </div>
                          {subject.hasAssignment && (
                            <div className="flex-1 min-w-[50px]">
                              <span className="text-[8px] text-zinc-400 block font-mono">Asg</span>
                              <input
                                type="number"
                                value={subject.assignmentWeight}
                                onChange={(e) => handleSubjectChange(subject.id, 'assignmentWeight', parseFloat(e.target.value) || 0)}
                                className="w-full text-center text-xs p-1 bg-black/40 border border-white/[0.06] rounded-lg text-white"
                              />
                            </div>
                          )}
                          {subject.hasLab && (
                            <div className="flex-1 min-w-[50px]">
                              <span className="text-[8px] text-zinc-400 block font-mono">Lab</span>
                              <input
                                type="number"
                                value={subject.labWeight}
                                onChange={(e) => handleSubjectChange(subject.id, 'labWeight', parseFloat(e.target.value) || 0)}
                                className="w-full text-center text-xs p-1 bg-black/40 border border-white/[0.06] rounded-lg text-white"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Advanced grade curves nested details */}
                      <details className="pt-2 border-t border-white/[0.04]">
                        <summary className="text-[9px] font-bold text-zinc-500 cursor-pointer hover:text-indigo-400 flex items-center gap-1 select-none">
                          <Target className="w-3 h-3" /> Advanced: Adjust Grade Cutoff Minimums (Curve)
                        </summary>
                        <div className="mt-2.5 p-3 bg-yellow-500/[0.02] border border-yellow-500/10 rounded-xl space-y-2">
                          <p className="text-[8px] text-zinc-500 leading-normal">
                            If this specific subject was graded on a curve, lower the minimum marks required for S or A here:
                          </p>
                          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                            {(subject.customGradeMap || GradeMapPreset).filter(g => g.gp > 0).map((g, idx) => (
                              <div key={g.grade} className="flex flex-col text-center">
                                <span className={`text-[8px] font-bold ${gradeStyles[g.grade]?.text || 'text-zinc-500'}`}>{g.grade} (≥)</span>
                                <input
                                  type="number"
                                  value={g.min}
                                  className="w-full text-center text-[10px] p-1 bg-black/60 border border-white/[0.06] rounded-lg text-white font-bold"
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    if (isNaN(val)) return;
                                    const currentMap = subject.customGradeMap
                                      ? JSON.parse(JSON.stringify(subject.customGradeMap))
                                      : JSON.parse(JSON.stringify(GradeMapPreset));
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
                              className="mt-2 text-[8px] text-red-400 hover:underline flex items-center gap-1 font-bold"
                            >
                              <RotateCcw className="w-2.5 h-2.5" /> Reset to standard cutoffs
                            </button>
                          )}
                        </div>
                      </details>

                      {/* Delete subject */}
                      <button
                        onClick={() => removeSubject(subject.id)}
                        className="w-full py-2 border border-red-500/15 bg-red-500/5 hover:bg-red-500/10 text-red-400 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove Subject
                      </button>
                    </div>
                  </div>
                </details>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Fallback GradeMap representation inside components to preserve independence from App.jsx globals
const GradeMapPreset = [
  { grade: 'S', min: 90, gp: 10 },
  { grade: 'A', min: 80, gp: 9 },
  { grade: 'B', min: 70, gp: 8 },
  { grade: 'C', min: 60, gp: 7 },
  { grade: 'D', min: 50, gp: 6 },
  { grade: 'E', min: 40, gp: 5 },
  { grade: 'F', min: 0, gp: 0 },
];
