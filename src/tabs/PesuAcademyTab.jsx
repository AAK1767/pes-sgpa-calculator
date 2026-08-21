import React, { useState, useMemo } from 'react';
import {
  GraduationCap, LogIn, LogOut, Eye, EyeOff, Loader2, ShieldCheck,
  AlertCircle, CheckCircle2, ArrowRight, Github, Info
} from 'lucide-react';
import { trackEvent } from '../utils/analytics';
import { mapProfileToPreset } from '../utils/pesuMapping';

// Fields we know how to show from a PESUAuth profile, in display order.
// Only the ones actually present in the response are rendered.
const PROFILE_FIELDS = [
  { key: 'name', label: 'Name' },
  { key: 'srn', label: 'SRN' },
  { key: 'prn', label: 'PRN' },
  { key: 'program', label: 'Program' },
  { key: 'branch', label: 'Branch' },
  { key: 'semester', label: 'Semester' },
  { key: 'section', label: 'Section' },
  { key: 'campus', label: 'Campus' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
];

export default function PesuAcademyTab({ themeClasses, loadPreset, setActiveTab }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState('idle'); // 'idle' | 'submitting' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');
  const [profile, setProfile] = useState(null);

  const mapping = useMemo(() => (profile ? mapProfileToPreset(profile) : null), [profile]);

  const presentFields = useMemo(() => {
    if (!profile) return [];
    return PROFILE_FIELDS.filter(({ key }) => {
      const v = profile[key];
      return v !== undefined && v !== null && String(v).trim() !== '' && String(v).trim().toUpperCase() !== 'NA';
    });
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password || status === 'submitting') return;

    setStatus('submitting');
    setErrorMsg('');

    try {
      const res = await fetch('/api/pesu-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password, profile: true }),
      });

      let data = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      const success = data.status === true || (res.ok && !!data.profile && data.status !== false);

      if (success) {
        setProfile(data.profile || {});
        setStatus('success');
        setPassword(''); // never keep the password around after a successful login
        trackEvent('pesu_login', { status: 'success' });
      } else {
        setStatus('error');
        setErrorMsg(data.message || 'Login failed. Please check your credentials and try again.');
        trackEvent('pesu_login', { status: 'failed' });
      }
    } catch {
      setStatus('error');
      setErrorMsg('Network error — could not reach the login service. Please try again.');
      trackEvent('pesu_login', { status: 'network_error' });
    }
  };

  const handleLogout = () => {
    setProfile(null);
    setPassword('');
    setStatus('idle');
    setErrorMsg('');
  };

  const handlePrefill = (presetName) => {
    if (!presetName) return;
    // loadPreset (from App) shows its own confirm before replacing subjects.
    loadPreset(presetName);
    trackEvent('pesu_prefill', { preset_name: presetName });
    setActiveTab('subjects');
  };

  const isLoggedIn = status === 'success' && profile;

  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="bg-gradient-to-br from-[#0e0e18] to-[#0a0a12] border border-white/[0.06] rounded-xl shadow-2xl shadow-black/20 p-6 text-zinc-200 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
            <GraduationCap className="w-6 h-6 text-blue-400" /> PESU Academy
          </h2>
          <p className="text-zinc-400 opacity-90 max-w-2xl text-sm leading-relaxed">
            Sign in with your PESU Academy credentials to fetch your profile and instantly
            prefill the calculator with your branch &amp; semester subjects. Authentication is
            handled by the open-source{' '}
            <a
              href="https://github.com/pesu-dev/auth"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
            >
              PESUAuth
            </a>{' '}
            project.
          </p>
        </div>
        <GraduationCap className="absolute right-[-20px] bottom-[-40px] w-40 h-40 text-zinc-200 opacity-[0.06] rotate-12" />
      </div>

      {/* Privacy note */}
      <div className="bg-blue-500/5 border border-blue-500/15 rounded-xl p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-200/80 leading-relaxed">
          Your credentials are sent once, over HTTPS, straight to PESU&apos;s login service (via this
          site&apos;s server as a relay to avoid browser errors). They are <strong>never stored, saved,
          or logged</strong> anywhere. Your marks stay local in your browser, exactly as before.
        </p>
      </div>

      {!isLoggedIn && (
        /* ---------------- LOGIN FORM ---------------- */
        <div className={`${themeClasses.card} border rounded-xl p-5 shadow-sm`}>
          <div className="flex items-center gap-2 font-bold text-zinc-200 mb-4">
            <span className="bg-blue-500/10 text-blue-400 w-8 h-8 rounded-full flex items-center justify-center">
              <LogIn className="w-4 h-4" />
            </span>
            <span>Sign in to PESU Academy</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="pesu-username" className="text-xs font-semibold text-zinc-400">
                SRN / PRN
              </label>
              <input
                id="pesu-username"
                type="text"
                autoComplete="username"
                placeholder="e.g. PES1UG23CS001"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={status === 'submitting'}
                className={`w-full text-sm p-2.5 rounded-lg ${themeClasses.input} transition-all`}
              />
            </div>

            <div className="flex flex-col space-y-1.5">
              <label htmlFor="pesu-password" className="text-xs font-semibold text-zinc-400">
                Password
              </label>
              <div className="relative">
                <input
                  id="pesu-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Your PESU Academy password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={status === 'submitting'}
                  className={`w-full text-sm p-2.5 pr-10 rounded-lg ${themeClasses.input} transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {status === 'error' && (
              <div className="flex items-start gap-2 text-xs text-red-400 bg-red-500/5 border border-red-500/15 rounded-lg p-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'submitting' || !username.trim() || !password}
              className={`w-full py-2.5 text-sm font-bold rounded-lg shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 ${
                status === 'submitting' || !username.trim() || !password
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {status === 'submitting' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Signing in…
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" /> Sign in
                </>
              )}
            </button>
            {status === 'submitting' && (
              <p className="text-[10px] text-zinc-600 text-center">
                The login service may take a few seconds to wake up on the first request.
              </p>
            )}
          </form>
        </div>
      )}

      {isLoggedIn && (
        /* ---------------- PROFILE + PREFILL ---------------- */
        <>
          <div className={`${themeClasses.card} border rounded-xl p-5 shadow-sm`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 font-bold text-zinc-200">
                <span className="bg-emerald-500/10 text-emerald-400 w-8 h-8 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
                <span>Signed in</span>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border border-white/[0.06] transition-all"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign out
              </button>
            </div>

            {presentFields.length > 0 ? (
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
                {presentFields.map(({ key, label }) => (
                  <div key={key} className="flex flex-col border-b border-white/[0.04] pb-2">
                    <dt className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">
                      {label}
                    </dt>
                    <dd className="text-sm text-zinc-200 break-words">{String(profile[key])}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-sm text-zinc-500">
                Login succeeded, but no profile details were returned.
              </p>
            )}
          </div>

          {/* Prefill action card */}
          <div className={`${themeClasses.card} border rounded-xl p-5 shadow-sm`}>
            <div className="flex items-center gap-2 font-bold text-zinc-200 mb-2">
              <span className="bg-purple-500/10 text-purple-400 w-8 h-8 rounded-full flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </span>
              <span>Prefill the calculator</span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed mb-4 flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>{mapping?.message}</span>
            </p>

            {mapping?.status === 'matched' && (
              <button
                onClick={() => handlePrefill(mapping.presetName)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all cursor-pointer"
              >
                Load {mapping.presetName} into calculator <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {mapping?.status === 'cycle-choice' && (
              <div className="flex flex-wrap gap-2">
                {mapping.cycleOptions.map((cycle) => (
                  <button
                    key={cycle}
                    onClick={() => handlePrefill(cycle)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all cursor-pointer"
                  >
                    {cycle} <ArrowRight className="w-4 h-4" />
                  </button>
                ))}
              </div>
            )}

            {(mapping?.status === 'no-preset' || mapping?.status === 'unknown') && (
              <div className="flex flex-wrap gap-2">
                {mapping.fallback && (
                  <button
                    onClick={() => handlePrefill(mapping.fallback)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-zinc-200 border border-white/[0.08] transition-all cursor-pointer"
                  >
                    Load editable template <ArrowRight className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setActiveTab('subjects')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 transition-all cursor-pointer"
                >
                  Go to Subjects <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Attribution & disclaimer */}
      <div className={`${themeClasses.card} border rounded-xl p-4 shadow-sm`}>
        <div className="flex items-center gap-2 font-bold text-zinc-200 mb-2 text-sm">
          <Github className="w-4 h-4" /> Powered by PESUAuth
        </div>
        <p className="text-xs text-zinc-500 leading-relaxed">
          This login uses the community, open-source{' '}
          <a
            href="https://github.com/pesu-dev/auth"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
          >
            pesu-dev/auth
          </a>{' '}
          API, which authenticates directly against the official PESU Academy portal. This is an
          unofficial tool and is not affiliated with or endorsed by PES University.
        </p>
      </div>
    </div>
  );
}
