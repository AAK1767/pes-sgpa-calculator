// Serverless endpoint that fetches timetable / attendance / results from the PESU Academy
// portal by replicating the portal login server-side (see server/pesuPortal.js for why the
// PESUAuth API can't do this — it's auth-only and doesn't expose the session).
//
// Privacy: credentials are used once to log in to PESU and are NEVER stored or logged here.
// Only the parsed academic data is returned to the browser.

import { fetchAllPortalData } from '../server/pesuPortal.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ ok: false, error: 'Username and password are required.' });
  }

  try {
    const data = await fetchAllPortalData({ username, password });
    // Never leak the login debug info to the client on success; keep it only for auth failures.
    if (!data.ok) {
      return res.status(401).json({ ok: false, error: data.error || 'Sign-in failed.' });
    }
    return res.status(200).json(data);
  } catch (error) {
    // Log the failure mode only — never the request body / credentials.
    const cause = error?.cause || {};
    console.error('PESU portal error:', error?.message || error);
    if (cause.code || cause.message) console.error('  cause:', cause.code || '', cause.message || '');
    return res
      .status(502)
      .json({ ok: false, error: 'Could not reach the PESU Academy portal. Please try again later.' });
  }
}
