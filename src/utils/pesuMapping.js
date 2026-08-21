// Maps a PESUAuth profile (from https://github.com/pesu-dev/auth) onto the closest
// SemesterPreset key used by the calculator, so a successful login can prefill subjects.
//
// This is intentionally best-effort and defensive:
//   * PESU profiles do NOT expose the 1st-year cycle (Physics vs Chemistry), so for
//     Sem 1/2 we return a "cycle-choice" and let the student pick.
//   * Not every branch/semester has a built-in preset (e.g. ECE Sem 7), so we degrade
//     gracefully to a "no-preset" / "unknown" result the UI can handle.
//   * Field names vary between PESUAuth versions, so we read a few likely aliases.

import { SemesterPresets } from '../constants/presets';

/**
 * Extract an integer semester (1-8) from values like "Sem-3", "Semester 3", 3, "NA".
 * @returns {number|null}
 */
export function parseSemester(semesterRaw) {
  if (semesterRaw === null || semesterRaw === undefined) return null;
  const match = String(semesterRaw).match(/(\d+)/);
  if (!match) return null;
  const n = parseInt(match[1], 10);
  return n >= 1 && n <= 8 ? n : null;
}

/**
 * Classify a branch (name and/or short code) into a preset family.
 * AIML is checked first because its name usually also contains "computer science".
 * Returns 'AIML' | 'ECE' | 'CSE' | null. Branches without a preset family (e.g. ISE,
 * Mechanical) return null on purpose so we never load the wrong subjects.
 */
export function classifyBranchFamily(branch, branchShortCode) {
  const hay = `${branch || ''} ${branchShortCode || ''}`.toLowerCase();
  if (!hay.trim()) return null;
  if (/aiml|artificial intelligence|machine learning|a\.?i\.?\s*(?:&|and|\+)\s*m\.?l\.?/.test(hay)) {
    return 'AIML';
  }
  if (/electronic|communication|\bece\b/.test(hay)) return 'ECE';
  if (/computer|\bcse\b/.test(hay)) return 'CSE';
  return null;
}

/**
 * @typedef {Object} PresetMapping
 * @property {string|null} presetName  A valid SemesterPresets key, or null if none matched.
 * @property {'AIML'|'ECE'|'CSE'|null} family
 * @property {number|null} semester
 * @property {'matched'|'cycle-choice'|'no-preset'|'unknown'} status
 * @property {string} message           Human-friendly explanation for the UI.
 * @property {string[]} [cycleOptions]  Present when status === 'cycle-choice'.
 * @property {string} [fallback]        A suggested editable preset when nothing matched.
 */

/**
 * @param {object} profile  The `profile` object returned by PESUAuth.
 * @returns {PresetMapping}
 */
export function mapProfileToPreset(profile) {
  const p = profile || {};
  const semester = parseSemester(p.semester ?? p.sem);
  const family = classifyBranchFamily(
    p.branch ?? p.branch_name,
    p.branch_short_code ?? p.branchShortCode ?? p.branchCode
  );

  // First year is the shared foundation year; the cycle isn't in the profile.
  if (semester === 1 || semester === 2) {
    return {
      presetName: null,
      family,
      semester,
      status: 'cycle-choice',
      message:
        'First-year students follow either the Physics or Chemistry cycle. Pick yours to load its subjects.',
      cycleOptions: ['Physics Cycle', 'Chemistry Cycle'],
    };
  }

  if (semester && family) {
    const key = `${family} Sem ${semester}`;
    if (SemesterPresets[key]) {
      return { presetName: key, family, semester, status: 'matched', message: `Detected ${key}.` };
    }
    return {
      presetName: null,
      family,
      semester,
      status: 'no-preset',
      message: `There's no built-in preset for ${family} Sem ${semester} yet — load an editable starting point instead.`,
      fallback: 'Generic Cycle (Editable)',
    };
  }

  return {
    presetName: null,
    family,
    semester,
    status: 'unknown',
    message:
      'Could not auto-detect your branch/semester. Head to the Subjects tab to pick a preset manually.',
    fallback: 'Generic Cycle (Editable)',
  };
}
