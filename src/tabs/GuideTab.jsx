import React, { useState } from 'react';
import {
  BookOpen, HelpCircle, Github, Download, Zap, Target, Dice5, Scale, Lock, Activity, Lightbulb, AlertTriangle, MessageSquare, Star
} from 'lucide-react';

export default function GuideTab({
  themeClasses,
  setShowToffeeModal
}) {
  const [feedbackName, setFeedbackName] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackStatus, setFeedbackStatus] = useState('idle'); // 'idle' | 'submitting' | 'success' | 'error'
  const [hoverRating, setHoverRating] = useState(0);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    setFeedbackStatus('submitting');
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: feedbackName.trim(),
          feedback: feedbackText.trim(),
          rating: feedbackRating,
        }),
      });

      if (response.ok) {
        setFeedbackStatus('success');
        setFeedbackName('');
        setFeedbackText('');
        setFeedbackRating(0);
      } else {
        setFeedbackStatus('error');
      }
    } catch {
      setFeedbackStatus('error');
    }
  };

  return (
    <div className="space-y-6">

      {/* Intro Banner */}
      <div className="bg-gradient-to-br from-[#0e0e18] to-[#0a0a12] border border-white/[0.06] rounded-xl shadow-2xl shadow-black/20 p-6 text-zinc-200 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
            <BookOpen className="w-6 h-6 text-yellow-300" /> User Guide & Pro Features
          </h2>
          <p className="text-violet-100 opacity-90 max-w-2xl">
            Everything you need to know: from keyboard shortcuts to the "Momentum" logic.
          </p>
        </div>
        <HelpCircle className="absolute right-[-20px] bottom-[-40px] w-40 h-40 text-zinc-200 opacity-10 rotate-12" />
      </div>

      <div className="text-[10px] opacity-30 text-right pr-1">
        AI assistance was used to some extent.
      </div>

      {/* Developer Resources & Support */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* GitHub & Docs Card */}
        <div className={`${themeClasses.card} border rounded-xl p-4 shadow-sm flex flex-col justify-between`}>
          <div>
            <div className="flex items-center gap-2 font-bold text-zinc-200 mb-3">
              <span className="bg-zinc-800 text-zinc-300 w-8 h-8 rounded-full flex items-center justify-center text-sm font-mono font-bold">
                <Github className="w-4 h-4" />
              </span>
              <span>Developer Resources</span>
            </div>
            <p className={`text-sm ${themeClasses.muted} leading-relaxed pl-1`}>
              This calculator is fully open-source. Check out the source repository to view the code, report issues, or read the detailed math breakdown.
            </p>
            <p className={`text-xs ${themeClasses.muted} leading-relaxed pl-1 mt-2`}>
              Also check out PESUClaw: a browser extension for <strong>Chrome</strong> and <strong>Firefox</strong> that adds bulk downloading of course materials from PESU Academy, including slides, notes, assignments, question banks, and answers. Download individually, zip files, or merged PDFs directly from the course page.
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 pl-1">
            <a
              href="https://github.com/aak1767/pes-sgpa-calculator"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 border border-white/[0.06] transition-all"
            >
              <Github className="w-3.5 h-3.5" /> Source Code
            </a>
            <a
              href="https://github.com/aak1767/pes-sgpa-calculator/blob/main/CALCULATION_GUIDE.md"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 transition-all"
            >
              <BookOpen className="w-3.5 h-3.5" /> Calculation Guide
            </a>
            <a
              href="https://github.com/AAK1767/PESUClaw/releases/latest"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 transition-all"
            >
              <Download className="w-3.5 h-3.5" /> PESUClaw Extension
            </a>
          </div>
        </div>

        {/* Support Card */}
        <div className={`${themeClasses.card} border rounded-xl p-4 shadow-sm flex flex-col justify-between`}>
          <div>
            <div className="flex items-center gap-2 font-bold text-zinc-200 mb-3">
              <span className="bg-yellow-500/10 text-yellow-400 w-8 h-8 rounded-full flex items-center justify-center text-lg">
                🍬
              </span>
              <span>Support the Project</span>
            </div>
            <p className={`text-sm ${themeClasses.muted} leading-relaxed pl-1`}>
              If this tool helped you project your SGPA, plan your attendance, or save your semester, consider supporting the developer!
            </p>
          </div>
          <div className="mt-4 pl-1">
            <button
              onClick={() => setShowToffeeModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black shadow-md transition-all cursor-pointer"
            >
              buy me a toffee 🍬
            </button>
          </div>
        </div>
      </div>

      {/* Feedback & Suggestions */}
      <div className={`${themeClasses.card} border rounded-xl p-5 shadow-sm`}>
        <div className="flex items-center gap-2 font-bold text-zinc-200 mb-3">
          <span className="bg-purple-500/10 text-purple-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">
            <MessageSquare className="w-4 h-4" />
          </span>
          <span>Feedback & Suggestions</span>
        </div>
        <p className={`text-sm ${themeClasses.muted} leading-relaxed mb-4`}>
          Have a suggestion, bug report, or want to share your thoughts? Send feedback directly to the developer!
        </p>

        {feedbackStatus === 'success' ? (
          <div className="bg-green-500/10 border border-green-500/20 text-green-300 rounded-lg p-4 text-center">
            <h4 className="font-bold text-sm mb-1">Thank you for your feedback! 💖</h4>
            <p className="text-xs text-green-400/80">Your submission has been sent directly to the developer's Discord channel.</p>
            <button
              onClick={() => setFeedbackStatus('idle')}
              className="mt-3 text-xs underline font-semibold hover:text-white"
            >
              Send more feedback
            </button>
          </div>
        ) : (
          <form onSubmit={handleFeedbackSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Rating */}
              <div className="flex flex-col space-y-1.5">
                <span className="text-xs font-semibold text-zinc-400">Rating (Optional)</span>
                <div className="flex items-center gap-1.5 py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-transform active:scale-95 cursor-pointer focus:outline-none"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= (hoverRating || feedbackRating)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-zinc-600'
                        } transition-colors`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div className="flex-1 flex flex-col space-y-1.5">
                <label htmlFor="feedback-name" className="text-xs font-semibold text-zinc-400">Name (Optional)</label>
                <input
                  id="feedback-name"
                  type="text"
                  placeholder="Anonymous"
                  value={feedbackName}
                  onChange={(e) => setFeedbackName(e.target.value)}
                  className={`w-full text-xs p-2 rounded-lg ${themeClasses.input} transition-all`}
                />
              </div>
            </div>

            {/* Message */}
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="feedback-msg" className="text-xs font-semibold text-zinc-400">Message</label>
              <textarea
                id="feedback-msg"
                required
                rows={3}
                placeholder="What can we improve? Did you find any bugs? Let us know!"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className={`w-full text-xs p-2 rounded-lg ${themeClasses.input} transition-all resize-none`}
              />
            </div>

            {feedbackStatus === 'error' && (
              <p className="text-xs text-red-400">
                Failed to send feedback. Please check your network connection and try again.
              </p>
            )}

            <button
              type="submit"
              disabled={feedbackStatus === 'submitting' || !feedbackText.trim()}
              className={`px-4 py-2 text-xs font-bold rounded-lg shadow-md transition-all cursor-pointer ${
                !feedbackText.trim()
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {feedbackStatus === 'submitting' ? 'Sending...' : 'Submit Feedback 🚀'}
            </button>
          </form>
        )}
      </div>

      {/* 1. POWER USER FEATURES (Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Feature A: Local Storage */}
        <div className={`${themeClasses.card} border rounded-xl p-4 shadow-sm`}>
          <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 mb-3">
            <Download className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm mb-1">Auto-Save & Privacy</h3>
          <p className={`text-xs ${themeClasses.muted}`}>
            Your data is <strong>saved locally</strong> in your browser. Close the tab, restart your laptop—your marks will still be here. No login required. This data is not collected or sent anywhere.
          </p>
        </div>

        {/* Feature B: Presets */}
        <div className={`${themeClasses.card} border rounded-xl p-4 shadow-sm`}>
          <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 mb-3">
            <BookOpen className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm mb-1">One-Click Presets</h3>
          <p className={`text-xs ${themeClasses.muted}`}>
            Don't type subjects manually! In the <strong>Subjects Tab</strong>, use the dropdown at the top to instantly load the "Physics Cycle" or "Chemistry Cycle".
          </p>
        </div>

        {/* Feature C: Shortcuts */}
        <div className={`${themeClasses.card} border rounded-xl p-4 shadow-sm`}>
          <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-zinc-400 mb-3 font-mono text-xs font-bold">
            CTRL
          </div>
          <h3 className="font-bold text-sm mb-1">Keyboard Shortcuts</h3>
          <div className={`text-xs ${themeClasses.muted} space-y-1`}>
            <div className="flex justify-between"><span>Undo</span> <kbd className="font-mono bg-white/[0.06] px-1 rounded">Ctrl+Z</kbd></div>
            <div className="flex justify-between"><span>Redo</span> <kbd className="font-mono bg-white/[0.06] px-1 rounded">Ctrl+Y</kbd></div>
            <div className="flex justify-between"><span>Export</span> <kbd className="font-mono bg-white/[0.06] px-1 rounded">Ctrl+S</kbd></div>
            <div className="flex justify-between"><span>Close</span> <kbd className="font-mono bg-white/[0.06] px-1 rounded">Esc</kbd></div>
          </div>
        </div>
      </div>

      {/* 2. THE MOMENTUM LOGIC */}
      <div className={`${themeClasses.card} border rounded-xl overflow-hidden`}>
        <div className="p-4 border-b bg-white/[0.03] border-white/[0.06] flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          <h3 className="font-bold text-lg">How "Momentum" Works</h3>
        </div>
        <div className="p-5">
          <p className={`text-sm ${themeClasses.muted} mb-3`}>
            Usually, if you leave a field blank (like ISA 2), calculators treat it as a <strong>0</strong>. This crashes your predicted SGPA.
          </p>
          <div className="bg-yellow-500/5 p-4 rounded-lg border border-yellow-500/15">
            <strong className="text-sm text-yellow-200 block mb-2">The Solution: Smart Projection</strong>
            <p className="text-xs text-yellow-300/80 leading-relaxed">
              If you have marks for ISA 1 but <strong>not</strong> ISA 2, we assume you will perform <em>similarly</em> in ISA 2.
              This "Momentum Score" is used to give you realistic predictions before you've even written the exam.
            </p>
            <p className="text-xs text-yellow-300/80 leading-relaxed mt-2">
              If Assignment or Lab is empty, momentum assumes full marks for those components. If ESA is empty, momentum estimates it using your current internal performance ratio.
            </p>
            <p className="text-[10px] mt-2 text-yellow-400 font-mono">
              *Look for the "Using Momentum" warning in the Reverse tab if you have empty fields.
            </p>
          </div>
        </div>
      </div>

      {/* 3. THE HIDDEN GEM: Reverse Calculator */}
      <div className="bg-gradient-to-br from-emerald-900/10 to-teal-900/10 border border-emerald-500/30 rounded-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Target className="w-24 h-24 text-emerald-500" />
        </div>
        <div className="p-4 border-b border-emerald-500/20 bg-emerald-500/10 flex items-center gap-2">
          <Target className="w-5 h-5 text-emerald-400" />
          <h3 className="font-bold text-lg text-emerald-300">The Hidden Gem: Reverse Calculator</h3>
        </div>
        <div className="p-5">
          <p className="text-sm font-medium mb-4 text-emerald-200">
            You set the SGPA (e.g., 9.0), we tell you exactly what marks you need.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* The 3 Buttons Explained */}
            <div>
              <h4 className="font-bold text-sm text-emerald-400 mb-2">The 3 Magic Buttons</h4>
              <ul className="space-y-3">
                <li className="flex gap-3 items-start">
                  <div className="bg-[#0e0e18] p-1.5 rounded shadow-sm flex-shrink-0">
                    <Target className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <strong className="text-xs block text-zinc-200">Default (Efficient)</strong>
                    <p className={`text-[10px] ${themeClasses.muted}`}>
                      The "Lazy" path. It finds the <strong>absolute cheapest way</strong> to hit your target, even if it means getting 99 in one subject and 40 in another.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3 items-start">
                  <div className="bg-[#0e0e18] p-1.5 rounded shadow-sm flex-shrink-0">
                    <Dice5 className="w-4 h-4 text-purple-500" />
                  </div>
                  <div>
                    <strong className="text-xs block text-zinc-200">Shuffle</strong>
                    <p className={`text-[10px] ${themeClasses.muted}`}>
                      Don't like the plan? Click Shuffle to get a <strong>random valid combination</strong>. It's like re-rolling the dice on your semester.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3 items-start">
                  <div className="bg-[#0e0e18] p-1.5 rounded shadow-sm flex-shrink-0">
                    <Scale className="w-4 h-4 text-teal-500" />
                  </div>
                  <div>
                    <strong className="text-xs block text-zinc-200">Balanced</strong>
                    <p className={`text-[10px] ${themeClasses.muted}`}>
                      The "Smart" path. It penalizes extremely high scores, trying to keep effort <strong>spread evenly</strong> across all subjects.
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Locking & Logic */}
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-sm text-emerald-400 mb-2">Locking Scores</h4>
                <p className={`text-xs ${themeClasses.muted} mb-2`}>
                  Confident you'll get exactly 85 in Math?
                </p>
                <div className="bg-white/[0.04] p-2 rounded border border-emerald-500/20 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs">Click the <strong>Lock Icon</strong>. Enter the score you are confident you will at least get. The app freezes that score and recalculates the rest of the subjects around it.</span>
                </div>
              </div>
              <div className="text-[10px] opacity-70 italic">
                *Tip: If a target is "Impossible", check if you have entered marks correctly or if you need to lower the target SGPA.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. THE BASICS: Subjects Tab (Detailed) */}
      <div className={`${themeClasses.card} border rounded-xl overflow-hidden`}>
        <div className="p-4 border-b bg-white/[0.03] border-white/[0.06] flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-500" />
          <h3 className="font-bold text-lg">The Basics: Subjects Tab</h3>
        </div>
        <div className="p-5">
          <p className={`text-sm ${themeClasses.muted} mb-4`}>
            The control center of the app. This is where you enter marks, but there are hidden settings inside every subject card.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/[0.04] p-4 rounded-lg border border-white/[0.06]">
              <strong className="text-blue-400 text-sm mb-2 block">1. Configuration & Weights</strong>
              <p className={`text-xs ${themeClasses.muted} leading-relaxed`}>
                Expand any subject and click <strong>"Edit Subject Details"</strong>.
                <br />• <strong>Weights:</strong> Default is 50/50, but you can change it to anything (e.g. 40/60).
                <br />• <strong>Credits:</strong> Change the credit value (e.g. 2 Cr for Labs) to ensure accurate SGPA calculation.
              </p>
            </div>
            <div className="bg-white/[0.04] p-4 rounded-lg border border-white/[0.06]">
              <strong className="text-blue-400 text-sm mb-2 block">2. Advanced: Custom Cutoffs</strong>
              <p className={`text-xs ${themeClasses.muted} leading-relaxed`}>
                Found inside the "Edit" menu.
                <br />If a subject is notoriously hard and the college lowers the S-Grade cutoff to 85, you can enter that here. The <strong>entire app</strong> (Analysis, Reverse Calc) will respect this new rule!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. THE ANALYST: Analysis Tab (Detailed) */}
      <div className={`${themeClasses.card} border rounded-xl overflow-hidden`}>
        <div className="p-4 border-b bg-white/[0.03] border-white/[0.06] flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-500" />
          <h3 className="font-bold text-lg">The Analyst: Analysis Tab</h3>
        </div>
        <div className="p-5">
          <p className={`text-sm ${themeClasses.muted} mb-4`}>
            This tab gives you a reality check on your standing and shows the best path forward.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 border rounded-lg border-white/[0.06]">
              <strong className="block text-sm mb-1">Safe vs Minimum</strong>
              <p className={`${themeClasses.muted}`}>
                • <strong>Safe Score:</strong> The marks you need to get in ESA based on your current internals (using momentum projections for any empty components) to <em>guarantee</em> the grade (Pass/A/S).
                <br />• <strong>Min Score:</strong> A lower score that <em>might</em> work because the college rounds up decimals.
                <br />• <strong>Momentum Score:</strong> Shows your projected final grade if you maintain your current internals performance in future exams.
              </p>
            </div>
            <div className="p-3 border rounded-lg border-white/[0.06]">
              <strong className="block text-sm mb-1">Achievable Range</strong>
              <p className={`${themeClasses.muted}`}>
                The slider at the top shows your mathematically <strong>Best Case SGPA</strong> (if you score 100 on ESAs) and <strong>Worst Case SGPA</strong> (if you score 0 on ESAs).
              </p>
            </div>
            <div className="p-3 border rounded-lg border-white/[0.06] bg-yellow-500/5 border-yellow-500/20 sm:col-span-2">
              <strong className="block text-sm mb-1 text-yellow-300 flex items-center gap-1">
                <Target className="w-3 h-3" /> ISA 2 Target Planner
              </strong>
              <p className={`${themeClasses.muted} leading-relaxed`}>
                Calculate what ISA 2 score you need to make your finals easy. Choose an assumed final ESA score (either globally or override it per subject), and we show what score you need in the upcoming ISA 2 exam to hit target grades. It works retrospectively too—even if you've already written and entered ISA 2 marks, you can play around with the scores.
              </p>
            </div>
            <div className="p-3 border rounded-lg border-white/[0.06] bg-purple-500/5 border-purple-500/20 sm:col-span-2">
              <strong className="block text-sm mb-1 text-purple-300 flex items-center gap-1">
                <Lightbulb className="w-3 h-3" /> Path to Target
              </strong>
              <p className={`${themeClasses.muted} leading-relaxed`}>
                A smart algorithm that generates a <strong>step-by-step plan</strong>. It identifies exactly which subjects are the easiest to upgrade (e.g., "Score 45 in Chem to get A") to hit your target SGPA with the least effort.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 6. STRATEGY & FUTURE: CGPA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Quick SGPA Estimator */}
        <div className={`${themeClasses.card} border rounded-xl p-4`}>
          <div className="flex items-center gap-2 font-bold text-zinc-200 mb-3">
            <span className="bg-teal-500/10 text-teal-300 w-8 h-8 rounded-full flex items-center justify-center text-lg">✨</span>
            <span>Quick SGPA Estimator</span>
          </div>
          <div className={`text-sm ${themeClasses.muted} leading-relaxed pl-1`}>
            <p>
              Want to check your SGPA without entering specific marks?
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Located at the bottom of the <strong>Subjects Tab</strong>.</li>
              <li>Select hypothetical grades (S, A, B...) for each subject directly.</li>
              <li>Instantly see what your SGPA would be if you scored those grades.</li>
              <li>This is a "sandbox" mode—it does not affect your actual mark data.</li>
            </ul>
          </div>
        </div>

        {/* CGPA Guide */}
        <div className={`${themeClasses.card} border rounded-xl p-4`}>
          <div className="flex items-center gap-2 font-bold text-zinc-200 mb-3">
            <span className="bg-indigo-500/10 text-indigo-300 w-8 h-8 rounded-full flex items-center justify-center text-lg">🎓</span>
            <span>Cumulative GPA (CGPA)</span>
          </div>
          <div className={`text-sm ${themeClasses.muted} leading-relaxed pl-1`}>
            <p>
              Track and plan your cumulative GPA across semesters.
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Enter the <strong>SGPA</strong> and <strong>Total Credits</strong> for completed semesters. Computes CGPA using standard credit-weighted average.</li>
              <li><strong>CGPA Target Planner:</strong> Enter a target CGPA to instantly find the required future average SGPA. Toggles semesters on/off to adapt your course load.</li>
              <li><strong>Checkpoints:</strong> Shows max achievable CGPA overall and specifically by the end of Semester 6 (important for placements checkpoints).</li>
              <li><strong>Degree Credit Tracker:</strong> Visualizes your path against the standard <strong>160 credits graduation requirement</strong>.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Attendance Guide */}
      <div className={`${themeClasses.card} border rounded-xl p-4`}>
        <div className="flex items-center gap-2 font-bold text-zinc-200 mb-3">
          <span className="bg-green-500/10 text-green-300 w-8 h-8 rounded-full flex items-center justify-center text-lg">📅</span>
          <span>How does the Attendance Calculator work?</span>
        </div>
        <div className={`text-sm ${themeClasses.muted} leading-relaxed pl-1`}>
          <p>
            The attendance tool helps you maintain the mandatory <strong>75% attendance</strong>.
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Mode 1 First:</strong> Enter current held and attended classes once, and the planners reuse it automatically.</li>
            <li><strong>Clear Results:</strong> Every mode explains how many classes you can miss and how many you must attend to stay above your target.</li>
            <li><strong>Buffer Target:</strong> Set a stricter target (like 80%) in Mode 1, and all planning modes use it.</li>
          </ul>
          <p className="mt-2 text-xs italic opacity-70">
            Attendance inputs are saved locally in your browser.
          </p>
        </div>
      </div>

      {/* Universal Mode Guide */}
      <div className={`${themeClasses.card} border rounded-xl p-4`}>
        <div className="flex items-center gap-2 font-bold text-zinc-200 mb-3">
          <span className="bg-purple-500/10 text-purple-300 w-8 h-8 rounded-full flex items-center justify-center text-lg">🎓</span>
          <span>I'm not from PES / Custom Curriculum</span>
        </div>
        <div className={`text-sm ${themeClasses.muted} leading-relaxed pl-1`}>
          <p>
            You can use this calculator for <strong>VTU, IIT, Manipal, or any other college</strong>.
          </p>
          <ol className="list-decimal pl-5 mt-2 space-y-1">
            <li>Go to the <strong>Subjects Tab</strong>.</li>
            <li>Click the button <strong>"Not from PES? 🎓"</strong>.</li>
            <li><strong>Define Components:</strong> Add your own exams (e.g., "Midterm 1", "Quiz", "Finals") and set their weights.</li>
            <li><strong>Set Grading:</strong> Choose a preset (like VTU 10-point, US 4.0 GPA) or define your own grade cutoffs (e.g., A = 85+).</li>
            <li>Click <strong>Create Subject</strong>.</li>
          </ol>
          <p className="mt-2">
            Your custom grading scheme will be saved for that subject and used in all calculations (SGPA, Reverse, Analysis).
          </p>
          <div className="mt-3 bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 rounded-lg p-3 text-xs leading-relaxed flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-yellow-500" />
            <div>
              <strong>Note:</strong> The custom grading template builder (Universal Mode) is currently in an experimental phase and might be half-baked for complex custom curriculums or edge-case calculations.
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer & Footer Note */}
      <div className="space-y-2 py-4">
        <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 text-center max-w-2xl mx-auto">
          <p className="text-xs font-semibold text-red-400 flex items-center justify-center gap-1.5 mb-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Disclaimer
          </p>
          <p className={`text-[11px] ${themeClasses.muted} leading-relaxed`}>
            This calculator is an unofficial utility built for estimation and planning purposes. All calculations, projections, and attendance plans are estimates. While we strive to match official grading schemas perfectly, the final results may vary due to internal rounding rules or subsequent grade curve alterations. The developer assumes no responsibility or liability for any academic decisions, grade discrepancies, or outcomes resulting from the use of this tool.
          </p>
        </div>
        <div className="text-center text-xs opacity-40 pt-2">
          Built for PESU / PES / PESIT.
        </div>
      </div>
    </div>
  );
}
