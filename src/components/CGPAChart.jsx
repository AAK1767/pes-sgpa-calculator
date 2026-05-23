import React from 'react';
import { motion } from 'framer-motion';
import { Calculator, RotateCcw, TrendingUp, Sparkles, ChevronDown, Settings } from 'lucide-react';

export default function CGPAChart({
  semesterData,
  updateSemester,
  resetCGPA,
  finalCgpa,
  sgpa,
  metrics,
  simpleCgpa,
  setSimpleCgpa
}) {
  
  // Extract only completed semesters for chart plotting
  const completedSemesters = semesterData.filter(
    sem => sem.sgpa !== '' && sem.sgpa !== undefined && !isNaN(parseFloat(sem.sgpa))
  );

  const hasData = completedSemesters.length > 0;

  // Chart plotting constants
  const chartWidth = 500;
  const chartHeight = 150;
  const paddingX = 40;
  const paddingY = 25;

  // Plot path coordinates for SVG Chart
  let svgPoints = [];
  let linePath = "";
  let areaPath = "";

  if (hasData) {
    const minVal = 4; // Floor for visual gpa curve
    const maxVal = 10; // Top ceiling

    // Sort by semester ID to plot chronologically
    const sorted = [...completedSemesters].sort((a, b) => a.id - b.id);
    
    svgPoints = sorted.map((sem, idx) => {
      const gpa = parseFloat(sem.sgpa);
      const x = paddingX + (idx / (sorted.length === 1 ? 1 : sorted.length - 1)) * (chartWidth - paddingX * 2);
      // Invert Y coordinate since SVG (0,0) is top-left
      const y = chartHeight - paddingY - ((gpa - minVal) / (maxVal - minVal)) * (chartHeight - paddingY * 2);
      return { x, y, gpa, id: sem.id };
    });

    if (svgPoints.length > 1) {
      linePath = `M ${svgPoints[0].x} ${svgPoints[0].y} ` + svgPoints.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
      // Form complete enclosed area for a gradient fill underneath the line
      areaPath = `${linePath} L ${svgPoints[svgPoints.length - 1].x} ${chartHeight - paddingY} L ${svgPoints[0].x} ${chartHeight - paddingY} Z`;
    }
  }

  return (
    <div className="space-y-6">
      {/* Side-by-Side GPA Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden flex items-center justify-between border-t-2 border-t-indigo-500">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-xl rounded-full pointer-events-none" />
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-extrabold block">Term GPA</span>
            <span className="text-3xl font-black text-white tracking-tight tabular-nums text-glow-indigo">
              {sgpa}
            </span>
            <p className="text-[9px] text-zinc-400">Current Semester calculated average</p>
          </div>
          <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden flex items-center justify-between border-t-2 border-t-emerald-500">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-xl rounded-full pointer-events-none" />
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-extrabold block">Cumulative CGPA</span>
            <span className="text-3xl font-black text-white tracking-tight tabular-nums text-glow-emerald">
              {finalCgpa || sgpa}
            </span>
            <p className="text-[9px] text-zinc-400">Degre-wide weighted GPA average</p>
          </div>
          <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Dynamic SVG GPA Line Chart */}
      <div className="glass-panel p-6 rounded-2xl space-y-4 relative overflow-hidden">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-zinc-400" /> GPA Progression Trend
          </h3>
          {hasData && (
            <span className="text-[9px] text-zinc-500 font-mono">
              Active: {completedSemesters.length} Semesters
            </span>
          )}
        </div>

        <div className="relative">
          {hasData ? (
            <div className="w-full overflow-hidden bg-black/25 rounded-xl border border-white/[0.04] p-2.5">
              <svg 
                viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
                className="w-full h-auto overflow-visible"
              >
                {/* SVG Gradients definitions */}
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Back Grid Lines */}
                <line x1={paddingX} y1={paddingY} x2={chartWidth - paddingX} y2={paddingY} className="stroke-zinc-800/60" strokeWidth="0.5" strokeDasharray="3 3" />
                <line x1={paddingX} y1={chartHeight / 2} x2={chartWidth - paddingX} y2={chartHeight / 2} className="stroke-zinc-800/60" strokeWidth="0.5" strokeDasharray="3 3" />
                <line x1={paddingX} y1={chartHeight - paddingY} x2={chartWidth - paddingX} y2={chartHeight - paddingY} className="stroke-zinc-800/80" strokeWidth="0.75" />

                {svgPoints.length > 1 && (
                  <>
                    {/* Shadow Area under the line */}
                    <path d={areaPath} fill="url(#areaGradient)" />
                    {/* Glowing Stroke Line */}
                    <motion.path 
                      d={linePath} 
                      fill="none" 
                      stroke="#6366f1" 
                      strokeWidth="2.5" 
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      style={{ filter: 'drop-shadow(0 0 4px rgba(99, 102, 241, 0.55))' }}
                    />
                  </>
                )}

                {/* Plot Nodes (Circles) */}
                {svgPoints.map((pt, idx) => (
                  <g key={idx}>
                    <motion.circle
                      cx={pt.x}
                      cy={pt.y}
                      r="4"
                      className="fill-indigo-500 stroke-zinc-950"
                      strokeWidth="1.5"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                    />
                    {/* Value Badge Text */}
                    <text
                      x={pt.x}
                      y={pt.y - 8}
                      className="fill-zinc-300 font-bold font-mono text-[8px]"
                      textAnchor="middle"
                    >
                      {pt.gpa.toFixed(1)}
                    </text>
                    {/* Semester label index */}
                    <text
                      x={pt.x}
                      y={chartHeight - paddingY + 12}
                      className="fill-zinc-500 font-semibold text-[8px]"
                      textAnchor="middle"
                    >
                      Sem {pt.id}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          ) : (
            <div className="bg-black/25 rounded-xl border border-white/[0.04] p-8 text-center flex flex-col items-center justify-center min-h-[150px]">
              <Sparkles className="w-6 h-6 text-zinc-700 mb-2 animate-pulse" />
              <span className="text-xs font-bold text-zinc-400 mb-0.5">Plot Graph Timeline</span>
              <p className="text-[10px] text-zinc-500 max-w-[280px]">
                Complete one or more semester cards below. We will automatically plot a chronological GPA trendline graph.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Semester History Cards Inputs */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Calculator className="w-4 h-4 text-zinc-400" /> Semester GPA History
          </h3>
          <button
            onClick={resetCGPA}
            className="text-[10px] text-red-400 hover:text-red-300 font-bold underline flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> Clear History
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {semesterData.map((sem) => (
            <div 
              key={sem.id} 
              className={`p-3 rounded-xl border transition-all ${
                sem.sgpa !== ''
                  ? 'bg-indigo-500/[0.03] border-indigo-500/20'
                  : 'bg-black/30 border-white/[0.04]'
              }`}
            >
              <span className="text-[10px] text-zinc-500 font-bold block mb-2">Semester {sem.id}</span>
              <div className="space-y-2">
                <div>
                  <label className="text-[8px] text-zinc-400 font-semibold block mb-0.5">SGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={sem.sgpa}
                    onChange={(e) => updateSemester(sem.id, 'sgpa', e.target.value)}
                    placeholder="-"
                    className="w-full bg-black/40 border border-white/[0.06] rounded-lg px-2 py-1 text-xs font-bold text-white text-center focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[8px] text-zinc-400 font-semibold block mb-0.5">Credits</label>
                  <input
                    type="number"
                    min="0"
                    value={sem.credits}
                    onChange={(e) => updateSemester(sem.id, 'credits', e.target.value)}
                    placeholder="-"
                    className="w-full bg-black/40 border border-white/[0.06] rounded-lg px-2 py-1 text-xs font-bold text-white text-center focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ==================== QUICK PREVIOUS CGPA CALCULATOR (Fully Manual) ==================== */}
      <div className="glass-panel rounded-2xl overflow-hidden mt-6">
        <details className="group">
          <summary className="flex items-center justify-between p-4 cursor-pointer list-none select-none hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/10">
                <Settings className="w-4 h-4 text-white animate-spin-slow" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm text-white">Quick CGPA Estimator</h3>
                  <span className="text-[9px] font-bold text-zinc-400 bg-white/[0.04] border border-white/[0.04] px-1.5 py-0.5 rounded">Isolated sandbox</span>
                </div>
                <p className="text-[10px] text-zinc-500 mt-0.5">
                  Calculate new CGPA by combining previous history + current sem results
                </p>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 opacity-50 transition-transform group-open:rotate-180" />
          </summary>

          <div className="p-5 border-t border-white/[0.04] bg-black/20 space-y-4">
            {/* Row 1: Previous Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-zinc-400 font-bold block mb-1">Previous CGPA</label>
                <input
                  type="number"
                  placeholder="e.g. 8.5"
                  value={simpleCgpa?.prevCgpa || ''}
                  onChange={(e) => setSimpleCgpa(prev => ({ ...prev, prevCgpa: e.target.value }))}
                  className="w-full glass-input px-3 py-2 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-400 font-bold block mb-1">Prev Credits</label>
                <input
                  type="number"
                  placeholder="e.g. 80"
                  value={simpleCgpa?.prevCredits || ''}
                  onChange={(e) => setSimpleCgpa(prev => ({ ...prev, prevCredits: e.target.value }))}
                  className="w-full glass-input px-3 py-2 text-xs focus:outline-none"
                />
              </div>
            </div>

            {/* Row 2: Current Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-zinc-400 font-bold block mb-1 text-indigo-400">Current Sem SGPA</label>
                <input
                  type="number"
                  placeholder="e.g. 9.2"
                  value={simpleCgpa?.currSgpa || ''}
                  onChange={(e) => setSimpleCgpa(prev => ({ ...prev, currSgpa: e.target.value }))}
                  className="w-full glass-input px-3 py-2 text-xs focus:outline-none border-indigo-500/20 bg-indigo-500/5 text-indigo-300"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-400 font-bold block mb-1 text-indigo-400">Sem Credits</label>
                <input
                  type="number"
                  placeholder="e.g. 24"
                  value={simpleCgpa?.currCredits || ''}
                  onChange={(e) => setSimpleCgpa(prev => ({ ...prev, currCredits: e.target.value }))}
                  className="w-full glass-input px-3 py-2 text-xs focus:outline-none border-indigo-500/20 bg-indigo-500/5 text-indigo-300"
                />
              </div>
            </div>

            {/* Calculation Result */}
            <div className="bg-black/40 rounded-2xl p-4 border border-white/[0.04] flex items-center justify-between shadow-inner">
              {(() => {
                const pCgpa = parseFloat(simpleCgpa?.prevCgpa) || 0;
                const pCreds = parseFloat(simpleCgpa?.prevCredits) || 0;
                const cSgpa = parseFloat(simpleCgpa?.currSgpa) || 0;
                const cCreds = parseFloat(simpleCgpa?.currCredits) || 0;

                let newCGPA = "0.00";
                if (pCreds + cCreds > 0) {
                  const totalPoints = (pCgpa * pCreds) + (cSgpa * cCreds);
                  const totalCreds = pCreds + cCreds;
                  newCGPA = (totalPoints / totalCreds).toFixed(2);
                }

                return (
                  <>
                    <div className="text-[10px] text-zinc-400">
                      <div>Total Combined Credits: <strong className="text-zinc-200">{pCreds + cCreds}</strong></div>
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Predicted Combined CGPA</div>
                      <div className="text-3xl font-black text-indigo-400 text-glow-indigo mt-0.5">{newCGPA}</div>
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setSimpleCgpa({ prevCgpa: '', prevCredits: '', currSgpa: '', currCredits: '' })}
                className="text-[10px] text-red-400 hover:text-red-300 font-extrabold underline"
              >
                Clear Sandbox
              </button>
            </div>
          </div>
        </details>
      </div>

    </div>
  );
}

// Fallback Award icon inside components to ensure independence
function Award(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="7" />
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
    </svg>
  );
}
