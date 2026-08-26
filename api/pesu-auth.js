// Serverless proxy for the PESUAuth API — https://github.com/pesu-dev/auth
//
// Why a proxy (and not a direct browser -> PESUAuth call)?
//   * Avoids browser CORS issues entirely (the browser only ever talks to our own origin).
//   * Keeps the upstream URL server-side and configurable via an env var.
//   * Mirrors the existing api/feedback.js pattern used elsewhere in this app.
//
// Privacy: credentials are forwarded once to PESUAuth and are NEVER logged or stored here.
//
// Configure the instance you want to hit with the PESU_AUTH_URL environment variable
// (e.g. your own self-hosted deployment). If unset, it falls back to the public instance.

const DEFAULT_PESU_AUTH_URL = 'https://pesu-auth.onrender.com';

// Public instances (free tier) can cold-start slowly, so give them room before giving up.
const UPSTREAM_TIMEOUT_MS = 30000;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ status: false, message: 'Method not allowed' });
  }

  const { username, password, profile } = req.body || {};

  if (!username || !password) {
    return res
      .status(400)
      .json({ status: false, message: 'Username and password are required.' });
  }

  const base = (process.env.PESU_AUTH_URL || DEFAULT_PESU_AUTH_URL).replace(/\/+$/, '');
  const endpoint = `${base}/authenticate`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  try {
    const upstream = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        password,
        // Default to requesting the profile so the client can prefill the calculator.
        profile: profile !== false,
      }),
      signal: controller.signal,
    });

    // Read as text first so a non-JSON error page (e.g. a cold-start splash) doesn't throw.
    const raw = await upstream.text();
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return res.status(502).json({
        status: false,
        message:
          'The authentication service returned an unexpected response. It may be waking up — please try again in a moment.',
      });
    }

    // Pass the upstream body through, preserving a sensible status code.
    return res.status(upstream.ok ? 200 : upstream.status).json(data);
  } catch (error) {
    const aborted = error && error.name === 'AbortError';
    // Log the failure mode only — never the request body / credentials.
    console.error('PESUAuth proxy error:', aborted ? 'upstream timeout' : error?.message || error);
    return res.status(aborted ? 504 : 502).json({
      status: false,
      message: aborted
        ? 'The authentication service timed out (it may be waking up). Please try again in a moment.'
        : 'Could not reach the authentication service. Please try again later.',
    });
  } finally {
    clearTimeout(timer);
  }
}
