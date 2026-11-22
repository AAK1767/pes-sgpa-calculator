import React, { useState, useMemo } from 'react';
import {
  LogIn, LogOut, Eye, EyeOff, Loader2, ShieldCheck,
  ArrowRight, Github, RefreshCw, X, ChevronDown, Check,
} from 'lucide-react';
import { trackEvent } from '../utils/analytics';
import { mapProfileToPreset } from '../utils/pesuMapping';
import { PortalData } from '../components/PesuPortalData';

const PESU_DATA_TTL_MS = 2 * 24 * 60 * 60 * 1000;

function readFreshPESUStorage(key) {
  const savedAt = Number(localStorage.getItem('pesu_saved_at'));
  if (!savedAt || Date.now() - savedAt > PESU_DATA_TTL_MS) return null;
  return localStorage.getItem(key);
}

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

function PasswordField({ id, value, onChange, disabled, show, onToggle, placeholder, autoFocus }) {
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? 'text' : 'password'}
        autoComplete="current-password"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        autoFocus={autoFocus}
        className="input pr-10"
      />
      <button
        type="button"
        onClick={onToggle}
        aria-label={show ? 'Hide password' : 'Show password'}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-ink-3 hover:text-ink"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export default function PesuAcademyTab({ loadPreset, setActiveTab, onSendToPlanner, subjects, marks, onImportResults, setPesuProfile, setPortalData: setParentPortalData, lastSynced, setLastSynced }) {
  const [username, setUsername] = useState(() => {
    return readFreshPESUStorage('pesu_username') || '';
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [profile, setProfile] = useState(() => {
    try {
      const saved = readFreshPESUStorage('pesu_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [status, setStatus] = useState(() => {
    return readFreshPESUStorage('pesu_profile') ? 'success' : 'idle';
  });
  const [errorMsg, setErrorMsg] = useState('');

  // Timetable / attendance / results fetched from the portal (separate, slower call).
  const [portalData, setPortalData] = useState(() => {
    try {
      const saved = readFreshPESUStorage('pesu_portal_data');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [portalStatus, setPortalStatus] = useState(() => {
    return readFreshPESUStorage('pesu_portal_data') ? 'success' : 'idle';
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
        localStorage.setItem('pesu_saved_at', String(Date.now()));
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
      setPortalError('Network error. Could not reach the portal service.');
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
        localStorage.setItem('pesu_saved_at', String(Date.now()));
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
      setErrorMsg('Network error. Could not reach the login service. Please try again.');
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
        localStorage.setItem('pesu_saved_at', String(Date.now()));
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
      setSyncError('Network error. Could not reach the portal service.');
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
    ['pesu_profile', 'pesu_portal_data', 'pesu_username', 'pesu_last_synced', 'pesu_saved_at']
      .forEach((key) => localStorage.removeItem(key));
  };

  const handlePrefill = (presetName) => {
    if (!presetName) return;
    // loadPreset (from App) shows its own confirm before replacing subjects.
    loadPreset(presetName);
    trackEvent('pesu_prefill', { preset_name: presetName });
    setActiveTab('subjects');
  };

  const closeSyncModal = () => {
    setShowSyncModal(false);
    setSyncPassword('');
    setSyncError('');
  };

  const isLoggedIn = status === 'success' && profile;

  return (
    <div className="space-y-4">
      {/* Privacy note */}
      <div className="notice notice-info flex items-start gap-3 text-sm">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-ink-3" />
        <p className="leading-relaxed">
          Your password is sent once, over HTTPS, to PESU&apos;s login service (through this site&apos;s server as a relay, to avoid browser errors). It is <strong className="font-medium text-ink">never stored or logged</strong>. Your marks stay in your browser.
        </p>
      </div>

      {!isLoggedIn && (
        <section className="panel panel-pad mx-auto max-w-md">
          <h2 className="text-base font-semibold text-ink">Sign in to PESU Academy</h2>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label htmlFor="pesu-username" className="label">SRN or PRN</label>
              <input
                id="pesu-username"
                type="text"
                autoComplete="username"
                placeholder="e.g. PES1UG23CS001"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={status === 'submitting'}
                className="input"
              />
            </div>

            <div>
              <label htmlFor="pesu-password" className="label">Password</label>
              <PasswordField
                id="pesu-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={status === 'submitting'}
                show={showPassword}
                onToggle={() => setShowPassword((s) => !s)}
                placeholder="Your PESU Academy password"
              />
            </div>

            {status === 'error' && <div className="notice notice-bad text-xs">{errorMsg}</div>}

            <button
              type="submit"
              disabled={status === 'submitting' || !username.trim() || !password}
              className="btn btn-primary w-full"
            >
              {status === 'submitting' ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</>
              ) : (
                <><LogIn className="h-4 w-4" /> Sign in</>
              )}
            </button>
            {status === 'submitting' && (
              <p className="text-center text-xs text-ink-3">
                The login service can take a few seconds to wake up on the first request.
              </p>
            )}
          </form>
        </section>
      )}

      {isLoggedIn && (
        <>
          <section className="panel panel-pad">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-good/15 text-good">
                  <Check className="h-4 w-4" />
                </span>
                <h2 className="text-base font-semibold text-ink">Signed in</h2>
                {lastSynced && (
                  <span className="chip">Synced {formatLastSynced(lastSynced)}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setShowSyncModal(true)} className="btn btn-secondary btn-sm" title="Fetch the latest attendance and results">
                  <RefreshCw className="h-3.5 w-3.5" /> Refresh
                </button>
                <button type="button" onClick={handleLogout} className="btn btn-secondary btn-sm">
                  <LogOut className="h-3.5 w-3.5" /> Sign out
                </button>
              </div>
            </div>

            {presentFields.length > 0 ? (
              <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                {presentFields.map(({ key, label }) => (
                  <div key={key} className="border-b border-line pb-2">
                    <dt className="text-xs text-ink-3">{label}</dt>
                    <dd className="break-words text-sm text-ink">{String(profile[key])}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-sm text-ink-3">Sign-in worked, but no profile details were returned.</p>
            )}
          </section>

          {/* Preset detection */}
          <details className="disclosure panel">
            <summary className="p-4">
              <span className="text-left">
                <span className="block text-sm font-semibold text-ink">Load your current semester into the calculator</span>
                <span className="block text-xs font-normal text-ink-3">We detect the right preset from your profile</span>
              </span>
              <ChevronDown className="chev" />
            </summary>
            <div className="space-y-4 border-t border-line p-4">
              <p className="text-sm text-ink-2">{mapping?.message}</p>

              {mapping?.status === 'matched' && (
                <button type="button" onClick={() => handlePrefill(mapping.presetName)} className="btn btn-primary">
                  Load {mapping.presetName} <ArrowRight className="h-4 w-4" />
                </button>
              )}

              {mapping?.status === 'cycle-choice' && (
                <div className="flex flex-wrap gap-2">
                  {mapping.cycleOptions.map((cycle) => (
                    <button key={cycle} type="button" onClick={() => handlePrefill(cycle)} className="btn btn-primary">
                      {cycle} <ArrowRight className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              )}

              {(mapping?.status === 'no-preset' || mapping?.status === 'unknown') && (
                <div className="flex flex-wrap gap-2">
                  {mapping.fallback && (
                    <button type="button" onClick={() => handlePrefill(mapping.fallback)} className="btn btn-secondary">
                      Load an editable template <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                  <button type="button" onClick={() => setActiveTab('subjects')} className="btn btn-secondary">
                    Go to Subjects <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </details>

          {/* Academic data */}
          <section id="academic-data-section" className="pt-2">
            <h2 className="text-base font-semibold text-ink">Your academic data</h2>
            <p className="mb-4 mt-1 text-sm text-ink-2">
              To fill in your ISA marks automatically, scroll down and choose &ldquo;Import marks to calculator&rdquo;.
            </p>
            <PortalData
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
          </section>
        </>
      )}

      {/* Re-sync modal */}
      {showSyncModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center sm:p-4" onClick={() => { if (!isSyncing) closeSyncModal(); }}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Refresh from PESU Academy"
            className="w-full max-w-md space-y-4 rounded-t-xl border border-line bg-surface p-5 sm:rounded-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-ink">Refresh from PESU Academy</h3>
              <button type="button" onClick={closeSyncModal} disabled={isSyncing} className="btn btn-ghost !min-h-0 !p-1.5" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-ink-2">
              Enter the password for <strong className="font-medium text-ink">{username}</strong> to load your latest attendance and published marks.
            </p>

            <form onSubmit={handleSyncSubmit} className="space-y-4">
              <div>
                <label htmlFor="sync-password" className="label">Password</label>
                <PasswordField
                  id="sync-password"
                  value={syncPassword}
                  onChange={(e) => setSyncPassword(e.target.value)}
                  disabled={isSyncing}
                  show={showSyncPassword}
                  onToggle={() => setShowSyncPassword((s) => !s)}
                  placeholder="PESU Academy password"
                  autoFocus
                />
              </div>

              {syncError && <div className="notice notice-bad text-xs">{syncError}</div>}

              <div className="flex gap-2">
                <button type="button" onClick={closeSyncModal} disabled={isSyncing} className="btn btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" disabled={isSyncing || !syncPassword} className="btn btn-primary flex-1">
                  {isSyncing ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Syncing…</>
                  ) : (
                    <><RefreshCw className="h-4 w-4" /> Refresh now</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attribution */}
      <section className="panel panel-pad">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
          <Github className="h-4 w-4" /> Powered by PESUAuth
        </h2>
        <p className="mt-1.5 text-xs leading-relaxed text-ink-3">
          Sign-in uses the community, open-source{' '}
          <a
            href="https://github.com/pesu-dev/auth"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline underline-offset-2"
          >
            pesu-dev/auth
          </a>{' '}
          API, which authenticates directly against the official PESU Academy portal. This is an unofficial tool and is not affiliated with or endorsed by PES University.
        </p>
      </section>
    </div>
  );
}
