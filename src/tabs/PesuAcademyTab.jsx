import React, { useState, useMemo } from 'react';
import {
  GraduationCap, LogIn, LogOut, Eye, EyeOff, Loader2, ShieldCheck,
  AlertCircle, CheckCircle2, ArrowRight, Github, Info, RefreshCw, X, ChevronDown
} from 'lucide-react';
import { trackEvent } from '../utils/analytics';
import { mapProfileToPreset } from '../utils/pesuMapping';
import { PortalData } from '../components/PesuPortalData';

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

function formatLastSynced(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export default function PesuAcademyTab({ themeClasses, loadPreset, setActiveTab, onSendToPlanner, subjects, marks, onImportResults, setPesuProfile, setPortalData: setParentPortalData }) {
  const [username, setUsername] = useState(() => {
    return localStorage.getItem('pesu_username') || '';
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('pesu_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [status, setStatus] = useState(() => {
    try {
      const saved = localStorage.getItem('pesu_profile');
      return saved ? 'success' : 'idle';
    } catch {
      return 'idle';
    }
  });
  const [errorMsg, setErrorMsg] = useState('');

  // Timetable / attendance / results fetched from the portal (separate, slower call).
  const [portalData, setPortalData] = useState(() => {
    try {
      const saved = localStorage.getItem('pesu_portal_data');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [portalStatus, setPortalStatus] = useState(() => {
    try {
      const saved = localStorage.getItem('pesu_portal_data');
      return saved ? 'success' : 'idle';
    } catch {
      return 'idle';
    }
  });
  const [lastSynced, setLastSynced] = useState(() => {
    return localStorage.getItem('pesu_last_synced') || '';
  });
  const [portalError, setPortalError] = useState('');

  // Re-sync modal state
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncPassword, setSyncPassword] = useState('');
  const [showSyncPassword, setShowSyncPassword] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState('');

  const fetchPortal = async (user, pass) => {
    setPortalStatus('loading');
    setPortalError('');
    try {
      const res = await fetch('/api/pesu-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, password: pass }),
      });
      let data = {};
      try { data = await res.json(); } catch { data = {}; }
      if (res.ok && data.ok) {
        setPortalData(data);
        setParentPortalData && setParentPortalData(data);
        setPortalStatus('success');
        const now = new Date().toISOString();
        setLastSynced(now);
        localStorage.setItem('pesu_portal_data', JSON.stringify(data));
        localStorage.setItem('pesu_last_synced', now);
        setPassword(''); // portal data is in; the password is no longer needed anywhere
        trackEvent('pesu_portal', { status: 'success' });
      } else {
        setPortalStatus('error');
        setPortalError(data.error || 'Could not load your academic data.');
        trackEvent('pesu_portal', { status: 'failed' });
      }
    } catch {
      setPortalStatus('error');
      setPortalError('Network error — could not reach the portal service.');
      trackEvent('pesu_portal', { status: 'network_error' });
    }
  };

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

    const user = username.trim();
    const pass = password; // captured so we can start the portal fetch even after clearing state

    setStatus('submitting');
    setErrorMsg('');

    try {
      const res = await fetch('/api/pesu-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, password: pass, profile: true }),
      });

      let data = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      const success = data.status === true || (res.ok && !!data.profile && data.status !== false);

      if (success) {
        const prof = data.profile || {};
        setProfile(prof);
        setPesuProfile && setPesuProfile(prof);
        setStatus('success');
        localStorage.setItem('pesu_profile', JSON.stringify(prof));
        localStorage.setItem('pesu_username', user);
        trackEvent('pesu_login', { status: 'success' });
        // Kick off the (slower) timetable/attendance/results fetch in parallel.
        fetchPortal(user, pass);
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

  const handleSyncSubmit = async (e) => {
    e.preventDefault();
    if (!syncPassword || isSyncing) return;
    setIsSyncing(true);
    setSyncError('');

    try {
      const user = username.trim();
      const pass = syncPassword;
      const res = await fetch('/api/pesu-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, password: pass }),
      });
      let data = {};
      try { data = await res.json(); } catch { data = {}; }
      if (res.ok && data.ok) {
        setPortalData(data);
        setParentPortalData && setParentPortalData(data);
        setPortalStatus('success');
        const now = new Date().toISOString();
        setLastSynced(now);
        localStorage.setItem('pesu_portal_data', JSON.stringify(data));
        localStorage.setItem('pesu_last_synced', now);
        setShowSyncModal(false);
        setSyncPassword('');
        trackEvent('pesu_portal_sync', { status: 'success' });
      } else {
        setSyncError(data.error || 'Sync failed. Please check your password and try again.');
        trackEvent('pesu_portal_sync', { status: 'failed' });
      }
    } catch {
      setSyncError('Network error — could not reach the portal service.');
      trackEvent('pesu_portal_sync', { status: 'network_error' });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogout = () => {
    setProfile(null);
    setPassword('');
    setStatus('idle');
    setErrorMsg('');
    setPortalData(null);
    setPortalStatus('idle');
    setPortalError('');
    setLastSynced('');
    localStorage.removeItem('pesu_profile');
    localStorage.removeItem('pesu_portal_data');
    localStorage.removeItem('pesu_last_synced');
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
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex flex-wrap items-center gap-2 font-bold text-zinc-200">
                <span className="bg-emerald-500/10 text-emerald-400 w-8 h-8 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
                <span>Signed in</span>
                {lastSynced && (
                  <span className="text-[11px] font-normal text-zinc-500 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.04]">
                    Synced: {formatLastSynced(lastSynced)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowSyncModal(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 transition-all cursor-pointer"
                  title="Fetch latest attendance and results"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Re-sync
                </button>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border border-white/[0.06] transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign out
                </button>
              </div>
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
          <details className="group">
            <summary className="flex items-center gap-2 font-bold text-zinc-400 mb-2 cursor-pointer list-none select-none hover:text-zinc-300">
              <span className="bg-purple-500/10 text-purple-400 w-8 h-8 rounded-full flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </span>
              <span>Detect and load your current sem preset in the calculator</span>
              <ChevronDown className="w-4 h-4 ml-auto opacity-50 group-open:rotate-180" />
            </summary>
            <div className={`${themeClasses.card} border rounded-xl p-5 shadow-sm`}>
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
          </details>

          {/* Academic data section */}
          <div id="academic-data-section" className="mt-6">
            <h2 className="text-sm font-bold text-zinc-300 mb-3">Academic Data</h2>
            <p className="text-xs text-zinc-500 mb-4 bg-blue-500/5 p-3 rounded-lg border border-blue-500/10">
              To prefill your ISA marks, scroll down and select "Import marks to calculator" below.
            </p>
            <PortalData
              themeClasses={themeClasses}
              status={portalStatus}
              data={portalData}
              error={portalError}
              onRetry={() => {
                if (username.trim() && password) {
                  fetchPortal(username.trim(), password);
                } else {
                  setShowSyncModal(true);
                }
              }}
              canRetry={true}
              onSendToPlanner={onSendToPlanner}
              subjects={subjects}
              marks={marks}
              onImportResults={onImportResults}
            />
          </div>
        </>
      )}

      {/* Re-sync Modal */}
      {showSyncModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0e0e18] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <RefreshCw className={`w-4 h-4 text-blue-400 ${isSyncing ? 'animate-spin' : ''}`} /> Re-sync with PESU Academy
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowSyncModal(false);
                  setSyncPassword('');
                  setSyncError('');
                }}
                disabled={isSyncing}
                className="text-zinc-500 hover:text-zinc-300 p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Enter the password for <strong className="text-zinc-200">{username}</strong> to pull the latest attendance records and published exam marks.
            </p>

            <form onSubmit={handleSyncSubmit} className="space-y-3.5">
              <div className="flex flex-col space-y-1.5">
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showSyncPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="PESU Academy Password"
                    value={syncPassword}
                    onChange={(e) => setSyncPassword(e.target.value)}
                    disabled={isSyncing}
                    autoFocus
                    className={`w-full text-sm p-2.5 pr-10 rounded-lg ${themeClasses.input} transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSyncPassword((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-1 cursor-pointer"
                  >
                    {showSyncPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {syncError && (
                <div className="flex items-start gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-2.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{syncError}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowSyncModal(false);
                    setSyncPassword('');
                    setSyncError('');
                  }}
                  disabled={isSyncing}
                  className="flex-1 py-2 text-xs font-semibold rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 border border-white/[0.06] transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSyncing || !syncPassword}
                  className="flex-1 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-800 disabled:text-zinc-500 text-white transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                >
                  {isSyncing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Syncing…
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" /> Sync Now
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
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
