import React, { useState } from 'react';
import { Github, Download, BookOpen, Star, ChevronDown } from 'lucide-react';

function Chevron() {
  return <ChevronDown className="chev" />;
}

function Topic({ title, children, open }) {
  return (
    <details className="disclosure border-b border-line last:border-b-0" open={open}>
      <summary className="px-4 py-3.5 !text-ink">
        <span className="text-sm font-medium">{title}</span>
        <Chevron />
      </summary>
      <div className="space-y-2 px-4 pb-4 text-sm leading-relaxed text-ink-2">{children}</div>
    </details>
  );
}

function Kbd({ children }) {
  return <kbd className="rounded border border-line-strong bg-raised px-1.5 py-0.5 font-mono text-xs text-ink">{children}</kbd>;
}

export default function GuideTab({ setShowToffeeModal }) {
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
      {/* Quick start */}
      <section className="panel panel-pad">
        <h2 className="text-base font-semibold text-ink">Start here</h2>
        <ol className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          {[
            ['Enter your marks', 'On Subjects, pick a preset for your cycle or semester, then open a subject and type in the marks you have.'],
            ['See what you need', 'On Analysis, see what to score in each ESA for a pass, an A or an S, and the path of least effort to your target.'],
            ['Plan your SGPA', 'On Reverse Calc, set the SGPA you want and get the ESA score needed in every subject.'],
          ].map(([title, text], i) => (
            <li key={title} className="inset p-4">
              <div className="num flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-ink">{i + 1}</div>
              <div className="mt-2 text-sm font-medium text-ink">{title}</div>
              <p className="mt-1 text-sm text-ink-2">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Help topics */}
      <section>
        <h2 className="mb-2 text-base font-semibold text-ink">How each page works</h2>
        <div className="panel">
          <Topic title="Subjects">
            <p>This is where you enter marks. Each subject has settings tucked inside it.</p>
            <p><strong className="font-medium text-ink">Weights and credits.</strong> Open a subject and choose &ldquo;Edit subject details&rdquo;. The default is 50/50 between internals and the ESA, but you can change it, and change the credits (for example 2 for a lab) so the SGPA stays accurate.</p>
            <p><strong className="font-medium text-ink">Custom grade cutoffs.</strong> If a hard subject gets a lowered S cutoff of 85, set it under &ldquo;Adjust grade cutoffs&rdquo;. Every page (Analysis, Reverse Calc) uses it.</p>
            <p><strong className="font-medium text-ink">Presets.</strong> &ldquo;Load a preset&rdquo; fills in the subjects for a cycle or branch so you don&apos;t type them.</p>
            <p><strong className="font-medium text-ink">Quick SGPA estimator.</strong> At the bottom of Subjects. Pick a hypothetical grade for each subject to see the SGPA. It&apos;s a sandbox and doesn&apos;t touch your marks.</p>
          </Topic>

          <Topic title="Analysis">
            <p>A reality check on where you stand and the best way forward.</p>
            <p><strong className="font-medium text-ink">Safe vs minimum.</strong> The safe score is the ESA mark that guarantees the grade, using projections for anything still empty. The minimum is a lower mark that might work because decimals are rounded up.</p>
            <p><strong className="font-medium text-ink">Achievable range.</strong> Your best-case SGPA (100 in every ESA) and worst-case (0 in every ESA).</p>
            <p><strong className="font-medium text-ink">ISA 2 target planner.</strong> Pick an ESA score you would be happy with and see the ISA 2 mark you need. You can override the assumed ESA per subject, and it still works after you&apos;ve entered ISA 2.</p>
            <p><strong className="font-medium text-ink">Path to target.</strong> A step-by-step plan that upgrades the cheapest subjects first, for example &ldquo;score 45 in Chemistry to get an A&rdquo;.</p>
          </Topic>

          <Topic title="Reverse Calc">
            <p>You set the SGPA (say 9.0) and it works out the marks you need.</p>
            <p><strong className="font-medium text-ink">Cheapest path (default).</strong> The fewest total marks to hit the target, even if that means 99 in one subject and 40 in another.</p>
            <p><strong className="font-medium text-ink">Shuffle.</strong> A different valid combination of grades.</p>
            <p><strong className="font-medium text-ink">Balanced.</strong> Penalises very high scores so the effort is spread evenly.</p>
            <p><strong className="font-medium text-ink">Locking.</strong> Sure you&apos;ll score at least 85 in Maths? Press the padlock and type it. That score is fixed and the rest are recalculated around it.</p>
            <p className="text-xs text-ink-3">If a target says &ldquo;Impossible&rdquo;, check your marks or lower the target SGPA.</p>
          </Topic>

          <Topic title="What is &ldquo;momentum&rdquo;?">
            <p>Most calculators treat an empty field (like ISA 2) as zero, which wrecks your predicted SGPA.</p>
            <p>Here, if you have ISA 1 but not ISA 2, we assume you&apos;ll do about as well in ISA 2. Empty Assignment or Lab count as full marks, and an empty ESA is estimated from how you&apos;re doing in the internals. You&apos;ll see a &ldquo;using estimates&rdquo; note on Reverse Calc when this happens.</p>
          </Topic>

          <Topic title="Attendance">
            <p>Helps you stay above the 75% minimum and see the effect of skipping before you do it.</p>
            <p><strong className="font-medium text-ink">Start with &ldquo;Where do I stand?&rdquo;.</strong> Enter classes held and attended once and the other calculators reuse them.</p>
            <p><strong className="font-medium text-ink">Interactive planner.</strong> With PESU Academy connected, you get per-subject projections from your own timetable and calendar.</p>
            <p><strong className="font-medium text-ink">Target buffer.</strong> Set a stricter target than 75% for safety. Each calculator shows how many classes you can miss and how many you must attend.</p>
            <p className="text-xs text-ink-3">Your attendance inputs are saved in your browser. Live portal data stays in the session unless you refresh from PESU.</p>
          </Topic>

          <Topic title="CGPA">
            <p>Enter SGPA and credits for completed semesters to get your credit-weighted CGPA.</p>
            <p><strong className="font-medium text-ink">Target planner.</strong> Enter a target CGPA and see the average SGPA you need in the rest. You can leave semesters out of the plan.</p>
            <p><strong className="font-medium text-ink">Checkpoints.</strong> Shows the highest CGPA you can reach overall and by the end of Semester 6 (useful for placements).</p>
            <p><strong className="font-medium text-ink">Credit tracker.</strong> Shows your progress against the 160 credits needed to graduate.</p>
          </Topic>

          <Topic title="PESU Academy sign-in and result import">
            <p>Sign in with your PESU Academy details to fetch your profile, timetable, attendance, calendar and subject list.</p>
            <p>Result import maps your marks into the calculator in one click, which saves typing and avoids mistakes.</p>
          </Topic>

          <Topic title="I'm not from PES">
            <p>You can use this for VTU, IIT, Manipal or any other college.</p>
            <ol className="list-decimal space-y-1 pl-5">
              <li>Go to Subjects and open &ldquo;Not from PES?&rdquo; near the bottom.</li>
              <li>Add your own components (say Midterm, Quiz, Finals) and their weights.</li>
              <li>Pick a grading scheme (VTU 10-point, US 4.0 and so on) or set your own cutoffs.</li>
              <li>Press &ldquo;Create subject&rdquo;.</li>
            </ol>
            <p>Your scheme is saved with that subject and used everywhere.</p>
            <div className="notice notice-warn text-xs">This mode is experimental and may not handle complicated custom curriculums.</div>
          </Topic>

          <Topic title="Saving, privacy and shortcuts">
            <p>Your data is saved in your browser. Close the tab or restart your laptop and your marks are still there. There&apos;s no login, and nothing is collected or sent anywhere.</p>
            <div className="inset max-w-xs space-y-1.5 p-3 text-sm">
              <div className="flex justify-between"><span>Undo</span> <Kbd>Ctrl+Z</Kbd></div>
              <div className="flex justify-between"><span>Redo</span> <Kbd>Ctrl+Y</Kbd></div>
              <div className="flex justify-between"><span>Export backup</span> <Kbd>Ctrl+S</Kbd></div>
              <div className="flex justify-between"><span>Close a popup</span> <Kbd>Esc</Kbd></div>
            </div>
          </Topic>
        </div>
      </section>

      {/* Resources and support */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="panel panel-pad flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold text-ink">Open source</h2>
            <p className="mt-1 text-sm text-ink-2">
              The code is public. Read it, report an issue, or check the maths in the calculation guide.
            </p>
            <p className="mt-2 text-sm text-ink-2">
              Also try <strong className="font-medium text-ink">PESUClaw</strong>, a Chrome and Firefox extension that bulk-downloads course material from PESU Academy (slides, notes, assignments, question banks) as single files, zips or merged PDFs.
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <a href="https://github.com/aak1767/pes-sgpa-calculator" target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
              <Github className="h-4 w-4" /> Source code
            </a>
            <a href="https://github.com/aak1767/pes-sgpa-calculator/blob/main/CALCULATION_GUIDE.md" target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
              <BookOpen className="h-4 w-4" /> Calculation guide
            </a>
            <a href="https://github.com/AAK1767/PESUClaw/releases/latest" target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
              <Download className="h-4 w-4" /> PESUClaw
            </a>
          </div>
        </div>

        <div className="panel panel-pad flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold text-ink">Support the project</h2>
            <p className="mt-1 text-sm text-ink-2">
              If this helped you plan your SGPA or your attendance, you can support the developer. It&apos;s optional.
            </p>
          </div>
          <div className="mt-4">
            <button type="button" onClick={() => setShowToffeeModal(true)} className="btn btn-primary btn-sm">
              Buy me a toffee
            </button>
          </div>
        </div>
      </section>

      {/* Feedback */}
      <section className="panel panel-pad">
        <h2 className="text-base font-semibold text-ink">Send feedback</h2>
        <p className="mt-1 text-sm text-ink-2">Found a bug or have an idea? It goes straight to the developer.</p>

        {feedbackStatus === 'success' ? (
          <div className="notice notice-good mt-4 text-center">
            <p className="font-medium">Thank you for your feedback.</p>
            <p className="mt-0.5 text-xs opacity-90">It has been sent to the developer.</p>
            <button type="button" onClick={() => setFeedbackStatus('idle')} className="mt-2 text-sm underline">
              Send more feedback
            </button>
          </div>
        ) : (
          <form onSubmit={handleFeedbackSubmit} className="mt-4 space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div>
                <span className="label">Rating (optional)</span>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(feedbackRating === star ? 0 : star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="rounded p-1"
                      aria-label={`${star} star${star > 1 ? 's' : ''}`}
                      aria-pressed={star <= feedbackRating}
                    >
                      <Star className={`h-5 w-5 transition-colors ${star <= (hoverRating || feedbackRating) ? 'fill-warn text-warn' : 'text-ink-3'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1">
                <label htmlFor="guide-feedback-name" className="label">Name (optional)</label>
                <input
                  id="guide-feedback-name"
                  type="text"
                  placeholder="Anonymous"
                  value={feedbackName}
                  onChange={(e) => setFeedbackName(e.target.value)}
                  className="input"
                />
              </div>
            </div>

            <div>
              <label htmlFor="guide-feedback-msg" className="label">Message</label>
              <textarea
                id="guide-feedback-msg"
                required
                rows={3}
                placeholder="What should be better? Did you find a bug?"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="input resize-none"
              />
            </div>

            {feedbackStatus === 'error' && (
              <p className="text-sm text-bad">Couldn&apos;t send that. Check your connection and try again.</p>
            )}

            <button type="submit" disabled={feedbackStatus === 'submitting' || !feedbackText.trim()} className="btn btn-primary">
              {feedbackStatus === 'submitting' ? 'Sending…' : 'Send feedback'}
            </button>
          </form>
        )}
      </section>

      {/* Disclaimer */}
      <section className="mx-auto max-w-2xl space-y-3 pb-2 text-center">
        <p className="text-xs leading-relaxed text-ink-3">
          <strong className="font-medium text-ink-2">Disclaimer.</strong> This is an unofficial tool for estimating and planning. All calculations, projections and attendance plans are estimates. We try to match the official grading rules, but results can differ because of internal rounding or later grade curves. The developer isn&apos;t responsible for academic decisions or outcomes that follow from using it.
        </p>
        <p className="text-xs text-ink-3">Built for PESU / PES / PESIT. AI assistance was used to some extent.</p>
      </section>
    </div>
  );
}
