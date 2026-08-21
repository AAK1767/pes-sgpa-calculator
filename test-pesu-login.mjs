// ─────────────────────────────────────────────────────────────────────────────
// Standalone PESUAuth login tester  —  run with:  node test-pesu-login.mjs
//
// This talks DIRECTLY to the PESUAuth API. It does NOT go through Vite, React,
// the /api serverless proxy, or a browser — so it isolates one question:
// "Do my credentials + this endpoint actually work, and what does the response
// look like?"  (No CORS here either, because Node isn't a browser.)
//
// Requires Node 18+ (uses built-in fetch). You have Node 22, so you're set.
//
// Credentials are read in this order (first one found wins):
//   1. env vars:      PESU_USER / PESU_PASS
//   2. CLI args:      node test-pesu-login.mjs <username> <password>
//   3. interactive prompt (password input is hidden)
//
// The upstream URL + endpoint can be overridden with env vars if needed:
//   PESU_AUTH_URL   (default: https://pesu-auth.onrender.com)
//   PESU_AUTH_PATH  (default: /authenticate)
// ─────────────────────────────────────────────────────────────────────────────

import readline from 'node:readline';

const BASE = (process.env.PESU_AUTH_URL || 'https://pesu-auth.onrender.com').replace(/\/+$/, '');
const PATH = process.env.PESU_AUTH_PATH || '/authenticate';
const ENDPOINT = `${BASE}${PATH}`;
const TIMEOUT_MS = 60000; // Render free tier can cold-start slowly on the first hit.

function ask(query) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(query, (value) => {
      rl.close();
      resolve(value.trim());
    });
  });
}

function askHidden(query) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.stdoutMuted = true;
    rl._writeToOutput = function (str) {
      if (!rl.stdoutMuted) process.stdout.write(str);
    };
    process.stdout.write(query); // show the prompt, then mute the typed characters
    rl.question('', (value) => {
      rl.close();
      process.stdout.write('\n');
      resolve(value);
    });
  });
}

async function getCredentials() {
  let username = process.env.PESU_USER || process.argv[2];
  let password = process.env.PESU_PASS || process.argv[3];
  if (!username) username = await ask('SRN / PRN: ');
  if (!password) password = await askHidden('Password (hidden): ');
  return { username: username.trim(), password };
}

function line() {
  console.log('─'.repeat(70));
}

async function main() {
  const { username, password } = await getCredentials();

  if (!username || !password) {
    console.error('\n✗ Missing username or password. Aborting.');
    process.exit(2);
  }

  const requestBody = { username, password, profile: true };

  line();
  console.log('PESUAuth login test');
  line();
  console.log('Endpoint     :', ENDPOINT);
  console.log('Method       : POST');
  console.log('Request body :', JSON.stringify({ ...requestBody, password: '••••••••' }));
  console.log('Timeout      :', TIMEOUT_MS + 'ms (first request may be slow if the service is asleep)');
  line();
  console.log('Sending…\n');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const startedAt = Date.now();

  let res;
  let raw;
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });
    raw = await res.text();
  } catch (err) {
    clearTimeout(timer);
    if (err && err.name === 'AbortError') {
      console.error(`✗ Timed out after ${TIMEOUT_MS}ms. The service may be waking up — run it again.`);
    } else {
      console.error('✗ Network error reaching the API:', err?.message || err);
      console.error('  (Check your internet connection and that the URL above is reachable.)');
    }
    process.exit(1);
  }
  clearTimeout(timer);

  const elapsed = Date.now() - startedAt;

  console.log('HTTP status  :', res.status, res.statusText, `(${elapsed}ms)`);
  console.log('Content-Type :', res.headers.get('content-type') || '(none)');
  line();

  let data = null;
  let parseError = null;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    parseError = e;
  }

  if (parseError) {
    console.log('Response is NOT valid JSON. First 800 chars of the raw body:\n');
    console.log(raw.slice(0, 800));
    line();
    console.log('✗ The endpoint did not return JSON. Likely wrong path, or a cold-start');
    console.log('  splash/HTML page. If it looks like HTML, the path may be wrong —');
    console.log(`  try setting PESU_AUTH_PATH (current: ${PATH}).`);
    process.exit(1);
  }

  console.log('Parsed JSON response:\n');
  console.log(JSON.stringify(data, null, 2));
  line();

  const success = data.status === true || (res.ok && !!data.profile && data.status !== false);

  if (success) {
    console.log('✓ LOGIN SUCCEEDED.');
    if (data.profile && typeof data.profile === 'object') {
      const keys = Object.keys(data.profile);
      console.log(`\n  Profile field names returned (${keys.length}):`);
      console.log('  ' + keys.join(', '));
      console.log('\n  ↑ If any of these differ from what the app shows, tell me these names.');
    } else {
      console.log('  (No `profile` object was returned — status was true but profile is empty.)');
    }
    process.exit(0);
  } else {
    console.log('✗ LOGIN FAILED (per the response above).');
    if (data.message) console.log('  API message:', data.message);
    console.log('\n  If the message says invalid credentials, double-check them.');
    console.log('  If the shape looks unexpected (no `status`/`message`), copy this whole');
    console.log('  output back to me so I can match the app to the real contract.');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
