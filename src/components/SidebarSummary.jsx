import React from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, RotateCcw, Download, Upload, Eraser, 
  Undo2, Redo2, Activity, Award, BarChart3 
} from 'lucide-react';

export default function SGPASidebar({
  sgpa,
  targetSgpa,
  setTargetSgpa,
  sgpaRange,
  gradeDistribution,
  subjects,
  undo,
  redo,
  undoStack,
  redoStack,
  exportData,
  importData,
  clearAll,
  loadPreset,
  SemesterPresets
}) {
  const parsedSgpa = parseFloat(sgpa) || 0;
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(parsedSgpa, 10) / 10) * circumference;

  // Grade badge colors matching main theme
  const gradeColors = {
    S: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', bar: 'bg-emerald-500' },
    A: { text: 'text-blue-400', bg: 'bg-blue-500/10', bar: 'bg-blue-500' },
    B: { text: 'text-indigo-400', bg: 'bg-indigo-500/10', bar: 'bg-indigo-500' },
    C: { text: 'text-yellow-400', bg: 'bg-yellow-500/10', bar: 'bg-yellow-500' },
    D: { text: 'text-orange-400', bg: 'bg-orange-500/10', bar: 'bg-orange-500' },
    E: { text: 'text-rose-400', bg: 'bg-rose-500/10', bar: 'bg-rose-500' },
    F: { text: 'text-red-500', bg: 'bg-red-500/10', bar: 'bg-red-500' }
  };

  const totalGrades = Object.values(gradeDistribution).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="space-y-6">
      {/* SGPA Circular Visualizer Dial */}
      <div className="glass-panel rounded-2xl p-6 relative overflow-hidden flex flex-col items-center justify-center text-center">
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-2xl rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-purple-500/5 blur-2xl rounded-full pointer-events-none" />
        
        <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold mb-3">Live GPA Core</span>
        
        {/* Animated Circular Progress Gauge */}
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background Track */}
            <circle
              cx="72"
              cy="72"
              r={radius}
              className="stroke-zinc-800/40"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Active Circle Progress */}
            <motion.circle
              cx="72"
              cy="72"
              r={radius}
              className="stroke-indigo-500"
              strokeWidth="10"
              fill="transparent"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              strokeLinecap="round"
              style={{ filter: 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.45))' }}
            />
          </svg>
          
          {/* Central Score Text */}
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-white tabular-nums tracking-tight text-glow-indigo">
              {sgpa}
            </span>
            <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-medium mt-0.5">
              out of 10.0
            </span>
          </div>
        </div>

        {/* Feasibility Indicator based on target */}
        <div className="mt-4 flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.04]">
          <span className={`w-1.5 h-1.5 rounded-full ${parsedSgpa >= targetSgpa ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          <span className="text-[10px] text-zinc-400 font-medium">
            {parsedSgpa >= targetSgpa ? 'Target Met!' : `Diff: ${(targetSgpa - parsedSgpa).toFixed(2)} to Target`}
          </span>
        </div>
      </div>

      {/* Target SGPA Slider & Achievable Range Card */}
      <div className="glass-panel rounded-2xl p-6 space-y-5 relative">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-zinc-400" /> Live Target Slider
        </h3>
        
        {/* Dynamic Range bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
            <span>Min {sgpaRange.min}</span>
            <span className="text-indigo-400 font-bold">Current {sgpa}</span>
            <span>Max {sgpaRange.max}</span>
          </div>
          
          <div className="w-full bg-zinc-800/40 h-2.5 rounded-full overflow-hidden relative">
            {/* Minimum to Maximum active bar */}
            <div 
              className="absolute h-full bg-gradient-to-r from-indigo-500/20 to-purple-500/25" 
              style={{ 
                left: `${(parseFloat(sgpaRange.min) / 10) * 100}%`, 
                right: `${100 - (parseFloat(sgpaRange.max) / 10) * 100}%` 
              }} 
            />
            {/* Current Indicator bubble */}
            <div 
              className="absolute h-full w-1.5 bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]" 
              style={{ left: `${(Math.min(Math.max(parsedSgpa, parseFloat(sgpaRange.min)), parseFloat(sgpaRange.max)) / 10) * 100}%` }} 
            />
            {/* Target Indicator pointer */}
            <div 
              className="absolute -top-0.5 w-1 h-3.5 bg-yellow-400" 
              style={{ left: `${(targetSgpa / 10) * 100}%` }} 
              title={`Target: ${targetSgpa}`}
            />
          </div>
          <div className="flex justify-between text-[8px] text-zinc-500 font-medium">
            <span>Range span: {(parseFloat(sgpaRange.max) - parseFloat(sgpaRange.min)).toFixed(2)} GP</span>
            <span className="text-yellow-400">Target: {targetSgpa}</span>
          </div>
        </div>

        {/* The Interactive Slider */}
        <div className="space-y-2 pt-2 border-t border-white/[0.04]">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-zinc-400">Set Goal SGPA</label>
            <span className="text-sm font-extrabold text-yellow-400 tabular-nums">{targetSgpa.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="5.0"
            max="10.0"
            step="0.05"
            value={targetSgpa}
            onChange={(e) => setTargetSgpa(parseFloat(e.target.value) || 9.0)}
            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Grade Distribution Visual Breakdown */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-zinc-400" /> Grade Distribution
          </h3>
          <span className="text-[10px] text-zinc-500 font-mono">
            {subjects.length} Subjects
          </span>
        </div>

        <div className="space-y-2.5">
          {Object.entries(gradeDistribution).map(([grade, count]) => {
            const pct = (count / totalGrades) * 100;
            const activeColor = gradeColors[grade] || { text: 'text-zinc-500', bg: 'bg-zinc-500/10', bar: 'bg-zinc-500' };

            return (
              <div key={grade} className="flex items-center gap-3">
                <span className={`w-6 text-xs font-extrabold ${activeColor.text} text-center`}>
                  {grade}
                </span>
                
                {/* Visual bar tracker */}
                <div className="flex-1 h-2 bg-zinc-800/40 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${activeColor.bar}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>

                <span className="text-[10px] text-zinc-400 font-mono w-4 text-right">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Tools Grid Panel */}
      <div className="glass-panel rounded-2xl p-4 space-y-3">
        <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold block mb-1 pl-1">
          Quick Tools
        </span>
        
        {/* Preset Load Dropdown */}
        <div className="space-y-1">
          <label className="text-[10px] text-zinc-400 font-semibold pl-1">Load College / Semester Preset</label>
          <select
            onChange={(e) => loadPreset(e.target.value)}
            className="w-full bg-black/40 border border-white/[0.06] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
            defaultValue=""
          >
            <option value="" disabled>Select presets...</option>
            {Object.keys(SemesterPresets).map(key => (
              <option key={key} value={key}>{key}</option>
            ))}
          </select>
        </div>

        {/* Undo / Redo Row */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={undo}
            disabled={undoStack.length === 0}
            className={`flex-1 py-2 rounded-xl border border-white/[0.06] flex items-center justify-center gap-1.5 text-xs font-semibold transition-all ${
              undoStack.length === 0 
                ? 'opacity-25 cursor-not-allowed' 
                : 'bg-white/[0.02] text-zinc-300 hover:bg-white/[0.06]'
            }`}
          >
            <Undo2 className="w-3.5 h-3.5" /> Undo
          </button>
          <button
            onClick={redo}
            disabled={redoStack.length === 0}
            className={`flex-1 py-2 rounded-xl border border-white/[0.06] flex items-center justify-center gap-1.5 text-xs font-semibold transition-all ${
              redoStack.length === 0 
                ? 'opacity-25 cursor-not-allowed' 
                : 'bg-white/[0.02] text-zinc-300 hover:bg-white/[0.06]'
            }`}
          >
            <Redo2 className="w-3.5 h-3.5" /> Redo
          </button>
        </div>

        {/* Import / Export / Clear row */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={exportData}
            className="py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] text-zinc-300 text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-zinc-400" />
            <span>Export</span>
          </button>
          
          <label className="py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] text-zinc-300 text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer text-center">
            <Upload className="w-3.5 h-3.5 text-zinc-400 mx-auto" />
            <span>Import</span>
            <input type="file" accept=".json" onChange={importData} className="hidden" />
          </label>

          <button
            onClick={clearAll}
            className="py-2.5 rounded-xl border border-red-500/10 bg-red-500/5 hover:bg-red-500/10 text-red-400 text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all"
          >
            <Eraser className="w-3.5 h-3.5 text-red-400" />
            <span>Reset All</span>
          </button>
        </div>
      </div>
    </div>
  );
}
