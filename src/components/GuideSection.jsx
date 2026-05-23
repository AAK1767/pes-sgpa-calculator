import React from 'react';
import { 
  HelpCircle, Zap, Target, BookOpen, Clock, 
  Download, Award, Settings, Sparkles, X 
} from 'lucide-react';

export default function GuideSection({
  setShowToffeeModal
}) {
  return (
    <div className="space-y-6">
      {/* Visual Feature Grids */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Feature A: Auto-Save */}
        <div className="glass-panel p-5 rounded-2xl space-y-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
            <Download className="w-4 h-4" />
          </div>
          <h3 className="font-extrabold text-sm text-white">Auto-Save & Offline</h3>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            All your marks and configs are saved <strong>locally</strong> in your browser. Close the tab or go offline—everything persists instantly. No logins required.
          </p>
        </div>

        {/* Feature B: Presets */}
        <div className="glass-panel p-5 rounded-2xl space-y-2.5">
          <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
            <BookOpen className="w-4 h-4" />
          </div>
          <h3 className="font-extrabold text-sm text-white">One-Click Presets</h3>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Skip manual entries! Load structural cycle presets (Physics/Chemistry Cycle) instantly using the dropdown select on the main Subjects tab.
          </p>
        </div>

        {/* Feature C: Shortcuts */}
        <div className="glass-panel p-5 rounded-2xl space-y-2.5">
          <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-zinc-400 font-mono text-xs font-bold">
            CTRL
          </div>
          <h3 className="font-extrabold text-sm text-white">Keyboard Shortcuts</h3>
          <div className="text-[10px] text-zinc-500 space-y-1">
            <div className="flex justify-between"><span>Undo changes</span> <kbd className="font-mono bg-white/[0.04] px-1.5 rounded border border-white/[0.04]">Ctrl+Z</kbd></div>
            <div className="flex justify-between"><span>Redo changes</span> <kbd className="font-mono bg-white/[0.04] px-1.5 rounded border border-white/[0.04]">Ctrl+Y</kbd></div>
            <div className="flex justify-between"><span>Save backup</span> <kbd className="font-mono bg-white/[0.04] px-1.5 rounded border border-white/[0.04]">Ctrl+S</kbd></div>
            <div className="flex justify-between"><span>Collapse card</span> <kbd className="font-mono bg-white/[0.04] px-1.5 rounded border border-white/[0.04]">Esc</kbd></div>
          </div>
        </div>
      </div>

      {/* Accordion FAQ explaining advanced details */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/[0.04] bg-white/[0.02] flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          <h3 className="font-extrabold text-sm text-white">Interactive Documentation Panel</h3>
        </div>
        
        <div className="p-4 space-y-4">
          {/* FAQ 1: Momentum */}
          <details className="group glass-panel rounded-xl border border-white/[0.03]">
            <summary className="p-4 flex items-center justify-between cursor-pointer list-none select-none text-xs font-bold text-white hover:text-indigo-400 transition-colors">
              <span>What is the "Momentum" prediction system?</span>
              <span className="text-[10px] text-zinc-500 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="p-4 pt-0 border-t border-white/[0.04] text-[11px] text-zinc-400 space-y-2 leading-relaxed bg-black/10">
              <p>
                Standard SGPA calculators treat blank fields (like an upcoming ISA 2 or Practical) as a <strong>0 score</strong>. This artificially crashes your predicted SGPA.
              </p>
              <div className="p-3 bg-yellow-500/[0.02] border border-yellow-500/10 rounded-xl text-yellow-300/80">
                <strong>Our Solution: Optimistic Form Projection</strong>
                <p className="mt-1">
                  If you have marks for ISA 1 but not ISA 2, we project that you will perform similarly in ISA 2. Empty assignments or labs assume full scores, and ESA is estimated based on your internal performance. This provides realistic targets early in the semester.
                </p>
              </div>
            </div>
          </details>

          {/* FAQ 2: Reverse Calc */}
          <details className="group glass-panel rounded-xl border border-white/[0.03]">
            <summary className="p-4 flex items-center justify-between cursor-pointer list-none select-none text-xs font-bold text-white hover:text-indigo-400 transition-colors">
              <span>How does the "Reverse Calculator" find target scores?</span>
              <span className="text-[10px] text-zinc-500 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="p-4 pt-0 border-t border-white/[0.04] text-[11px] text-zinc-400 space-y-3 leading-relaxed bg-black/10">
              <p>
                Specify your target SGPA, and a greedy hill-climbing algorithm calculates the cheapest combination of grade boundaries to hit your target.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-black/30 p-2.5 rounded-lg">
                  <strong className="text-zinc-200 block mb-0.5 text-[10px]">Cheapest Path (Default)</strong>
                  <p className="text-[9px] text-zinc-500">Prioritizes subjects requiring the fewest additional marks to secure grade jumps.</p>
                </div>
                <div className="bg-black/30 p-2.5 rounded-lg">
                  <strong className="text-zinc-200 block mb-0.5 text-[10px]">Balanced Path</strong>
                  <p className="text-[9px] text-zinc-500">Penalizes extremely high individual targets to spread the workload evenly.</p>
                </div>
                <div className="bg-black/30 p-2.5 rounded-lg">
                  <strong className="text-zinc-200 block mb-0.5 text-[10px]">Shuffle Path</strong>
                  <p className="text-[9px] text-zinc-500">Generates randomized combinations if you wish to explore alternative strategies.</p>
                </div>
              </div>
            </div>
          </details>

          {/* FAQ 3: Universal Mode */}
          <details className="group glass-panel rounded-xl border border-white/[0.03]">
            <summary className="p-4 flex items-center justify-between cursor-pointer list-none select-none text-xs font-bold text-white hover:text-indigo-400 transition-colors">
              <span>Can I use this for non-PES / custom universities?</span>
              <span className="text-[10px] text-zinc-500 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="p-4 pt-0 border-t border-white/[0.04] text-[11px] text-zinc-400 space-y-2 leading-relaxed bg-black/10">
              <p>
                Yes! Our calculator features a <strong>Universal Template Engine</strong> located at the bottom of the Subjects tab.
              </p>
              <ol className="list-decimal pl-4 space-y-1">
                <li>Click <strong>"Not from PES? 🎓"</strong> to open the builder.</li>
                <li>Add custom exams (e.g. Quizzes, Midterms, Practicals) and define their relative weights.</li>
                <li>Pick from pre-loaded grading schemes (VTU, IIT, US 4.0 GPA) or set up your own grade thresholds.</li>
                <li>Click <strong>"Create Subject"</strong> to add it to your roster.</li>
              </ol>
            </div>
          </details>
        </div>
      </div>

      {/* Support buy me a toffee card */}
      <div className="bg-gradient-to-br from-indigo-950/20 to-purple-950/20 border border-indigo-500/25 rounded-2xl p-6 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-2xl rounded-full pointer-events-none" />
        <div className="space-y-1.5 max-w-md text-center sm:text-left">
          <h3 className="text-sm font-extrabold text-zinc-200">Support the Project 🍬</h3>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            If this tool made your academic planning easier, helped you maintain your scholarship, or kept your attendance in check—consider supporting! Totally optional, no pressure.
          </p>
        </div>
        <button
          onClick={() => setShowToffeeModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-lg transition-all transform active:scale-95 shrink-0"
        >
          Buy Me A Toffee 🍬
        </button>
      </div>
    </div>
  );
}
