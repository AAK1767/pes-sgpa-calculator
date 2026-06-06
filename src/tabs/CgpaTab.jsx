import React from 'react';
import {
  Info, Trash2, ChevronDown
} from 'lucide-react';

export default function CgpaTab({
  themeClasses,
  semesterData,
  updateSemester,
  resetCGPA,
  simpleCgpa,
  setSimpleCgpa
}) {
  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">

      {/* Header & Result Card */}
      <div className={`${themeClasses.card} p-6 rounded-2xl shadow-2xl border ${themeClasses.border} text-center relative overflow-hidden`}>
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-teal-400 via-blue-500 to-violet-500"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-20 bg-teal-500/[0.06] blur-[40px] pointer-events-none"></div>

        <h2 className={`text-sm font-bold uppercase tracking-wider ${themeClasses.muted} mb-2`}>Cumulative GPA</h2>

        <div className="flex items-center justify-center gap-1">
          <span className="text-5xl md:text-6xl font-black text-teal-400">
            {(() => {
              const filledSems = semesterData.filter(s => s.sgpa && s.credits);
              if (filledSems.length === 0) return "0.00";

              const totalPoints = filledSems.reduce((sum, s) => sum + (parseFloat(s.sgpa) * parseFloat(s.credits)), 0);
              const totalCredits = filledSems.reduce((sum, s) => sum + parseFloat(s.credits), 0);

              return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";
            })()}
          </span>
        </div>

        <p className={`text-xs ${themeClasses.muted} mt-2`}>
          Based on {semesterData.filter(s => s.sgpa && s.credits).length} semesters of data
        </p>
      </div>

      {/* Helper Info */}
      <div className="flex items-center gap-2 text-xs opacity-70 px-2">
        <Info className="w-4 h-4" />
        <span>Enter SGPA and Credits for completed semesters. Leave future ones blank.</span>
      </div>

      {/* Semesters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {semesterData.map((sem) => (
          <div
            key={sem.id}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${(sem.sgpa && sem.credits)
              ? `${themeClasses.card} border-teal-500/30 shadow-sm`
              : 'bg-white/[0.03] border-transparent opacity-75 hover:opacity-100'
              }`}
          >
            {/* Semester Label */}
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm ${(sem.sgpa && sem.credits)
              ? 'bg-teal-500/10 text-teal-300'
              : 'bg-white/[0.06] text-zinc-500'
              }`}>
              S{sem.id}
            </div>

            {/* Inputs */}
            <div className="flex-1 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold opacity-50 mb-1 ml-1">SGPA</label>
                <input
                  type="number"
                  value={sem.sgpa}
                  onChange={(e) => updateSemester(sem.id, 'sgpa', e.target.value)}
                  placeholder="-"
                  className={`w-full p-2 text-sm font-bold text-center border rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none ${themeClasses.input}`}
                  min="0" max="10" step="0.01"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold opacity-50 mb-1 ml-1">Credits</label>
                <input
                  type="number"
                  value={sem.credits}
                  onChange={(e) => updateSemester(sem.id, 'credits', e.target.value)}
                  placeholder="-"
                  className={`w-full p-2 text-sm text-center border rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none ${themeClasses.input}`}
                  min="0" max="30"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-end pt-4">
        <button
          onClick={resetCGPA}
          className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" /> Clear History
        </button>
      </div>

      {/* Disclaimer */}
      <div className="text-center text-[10px] opacity-40 mt-8">
        Calculated using: Σ (SGPA × Credits) / Σ Credits
      </div>

      {/* ==================== QUICK PREVIOUS CGPA CALCULATOR (Fully Manual) ==================== */}
      <div className={`${themeClasses.card} border rounded-xl overflow-hidden mt-6`}>
        <details className="group">
          <summary className="flex items-center justify-between p-4 cursor-pointer list-none select-none hover:bg-white/[0.03] transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center shadow-sm">
                <span className="text-lg">⚡</span>
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-zinc-200">Quick CGPA Estimator</h3>
                  <span className={`text-[10px] ${themeClasses.muted} font-normal px-1.5 rounded bg-white/[0.04] border`}>Isolated</span>
                </div>
                <p className={`text-xs ${themeClasses.muted} mt-0.5`}>
                  Calculate new CGPA by combining previous history + current sem results
                </p>
              </div>
            </div>
            <ChevronDown className="w-5 h-5 opacity-50 transition-transform group-open:rotate-180" />
          </summary>

          <div className={`p-4 border-t ${themeClasses.border} bg-black/20`}>

            {/* Row 1: Previous Stats */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className={`text-xs ${themeClasses.muted} block mb-1 font-bold`}>Previous CGPA</label>
                <input
                  type="number"
                  placeholder="e.g. 8.5"
                  value={simpleCgpa.prevCgpa}
                  onChange={(e) => setSimpleCgpa(prev => ({ ...prev, prevCgpa: e.target.value }))}
                  className={`w-full p-2 border rounded-lg text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none ${themeClasses.input}`}
                />
              </div>
              <div>
                <label className={`text-xs ${themeClasses.muted} block mb-1 font-bold`}>Prev Credits</label>
                <input
                  type="number"
                  placeholder="e.g. 80"
                  value={simpleCgpa.prevCredits}
                  onChange={(e) => setSimpleCgpa(prev => ({ ...prev, prevCredits: e.target.value }))}
                  className={`w-full p-2 border rounded-lg text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none ${themeClasses.input}`}
                />
              </div>
            </div>

            {/* Row 2: Current Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className={`text-xs ${themeClasses.muted} block mb-1 font-bold text-teal-400`}>Current Sem SGPA</label>
                <input
                  type="number"
                  placeholder="e.g. 9.2"
                  value={simpleCgpa.currSgpa}
                  onChange={(e) => setSimpleCgpa(prev => ({ ...prev, currSgpa: e.target.value }))}
                  className={`w-full p-2 border rounded-lg text-sm font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none ${themeClasses.input} border-teal-500/20 bg-teal-500/5`}
                />
              </div>
              <div>
                <label className={`text-xs ${themeClasses.muted} block mb-1 font-bold text-teal-400`}>Sem Credits</label>
                <input
                  type="number"
                  placeholder="e.g. 24"
                  value={simpleCgpa.currCredits}
                  onChange={(e) => setSimpleCgpa(prev => ({ ...prev, currCredits: e.target.value }))}
                  className={`w-full p-2 border rounded-lg text-sm font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none ${themeClasses.input} border-teal-500/20 bg-teal-500/5`}
                />
              </div>
            </div>

            {/* Calculation Result */}
            <div className="bg-[#0e0e18] rounded-lg p-3 border shadow-sm flex items-center justify-between">
              {(() => {
                const pCgpa = parseFloat(simpleCgpa.prevCgpa) || 0;
                const pCreds = parseFloat(simpleCgpa.prevCredits) || 0;
                const cSgpa = parseFloat(simpleCgpa.currSgpa) || 0;
                const cCreds = parseFloat(simpleCgpa.currCredits) || 0;

                let newCGPA = "0.00";
                if (pCreds + cCreds > 0) {
                  const totalPoints = (pCgpa * pCreds) + (cSgpa * cCreds);
                  const totalCreds = pCreds + cCreds;
                  newCGPA = (totalPoints / totalCreds).toFixed(2);
                }

                return (
                  <>
                    <div className="text-xs opacity-70">
                      <div>Total Credits: <strong>{pCreds + cCreds}</strong></div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold opacity-50">Predicted CGPA</div>
                      <div className="text-3xl font-black text-indigo-400">{newCGPA}</div>
                    </div>
                  </>
                );
              })()}
            </div>

          </div>
        </details>
      </div>

    </div>
  );
}
