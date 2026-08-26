import { SemesterPresets } from '../constants/presets.js';

// Map PESU Academy portal results onto the calculator's Subjects tab, and
// summarise a semester's grades for a read-only analytics panel.
//
// Where the numbers live (confirmed against the real portal, 2026-08-23):
//   • FINAL results (the "getEsaAndIsaResult" view) carry the NUMERIC component
//     marks — "ISA 1", "ISA 2", "Assignment" (each score /max), plus a derived
//     "FINAL ISA" total and subject-specific components (e.g. "MATLAB 1/2"). ESA
//     comes back only as a LETTER GRADE, never a number.
//   • PROVISIONAL results carry only a letter grade per subject (no numbers).
// The user wasn't sure whether ISA marks would surface in the provisional tab,
// the final tab, or both — so the extractor reads numeric components from BOTH
// (whichever a subject happens to expose) and merges by subject code, while the
// letter grade can come from either side. In practice numbers = final today, but
// the merge is future-proof if the portal ever moves them.
//
// Calculator subjects have NO course code, so portal→calculator matching is by
// NAME (normalised, with slash-variant and token-overlap handling). Nothing is
// applied silently: the caller previews the plan and confirms before overwriting.

/* ------------------------------ name matching ---------------------------- */

// Tokens that carry no discriminating meaning in a course title.
const NOISE = new Set([
  'of', 'for', 'the', 'and', 'to', 'in', 'its', 'with', 'a', 'an', 'on',
  'introduction', 'intro', 'fundamentals', 'principles', 'basics',
]);
// Pure roman numerals (course "I/II/III" suffixes) — dropped so "Maths I" and
// "Maths II" both reduce to "maths".
const ROMAN = new Set(['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x']);

// Normalise a raw name to a lowercase, punctuation-free string.
export function normalizeName(raw) {
  return String(raw || '')
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')   // drop parenthetical asides
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9/\s]/g, ' ') // keep slashes for variant splitting
    .replace(/\s+/g, ' ')
    .trim();
}

// A course name may pack two alternatives behind a slash, either a short roman
// suffix ("Mathematics - I/II") or two full titles ("Python …/Problem Solving
// with C"). Produce candidate strings to match against: the whole thing (slash
// as space) plus each substantial slash-segment.
export function nameVariants(raw) {
  const norm = normalizeName(raw);
  const variants = new Set([norm.replace(/\//g, ' ').replace(/\s+/g, ' ').trim()]);
  for (const part of norm.split('/')) {
    const p = part.trim();
    // Keep a segment only if it holds a real (non-roman) word — this discards the
    // lone "ii" in "i/ii" but keeps "problem solving with c".
    const words = p.split(' ').filter((w) => w && !ROMAN.has(w));
    if (words.length && p.length >= 3) variants.add(p);
  }
  return [...variants].filter(Boolean);
}

// Meaningful token set for a single variant string.
function tokenize(variant) {
  return new Set(
    variant
      .split(' ')
      .filter((w) => w && !NOISE.has(w) && !ROMAN.has(w)),
  );
}

// Similarity of two token sets: max of Jaccard and (containment × 0.95), so a
// subset title ("Machine Learning") still scores high against a superset
// ("Machine Learning and Applications").
function tokenScore(a, b) {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  const union = a.size + b.size - inter;
  const jaccard = union ? inter / union : 0;
  const containment = inter / Math.min(a.size, b.size);
  return Math.max(jaccard, containment * 0.95);
}

// Best similarity (0..1) between two raw names, considering all slash-variants.
export function nameSimilarity(nameA, nameB) {
  const variantsA = nameVariants(nameA);
  const variantsB = nameVariants(nameB);
  let best = 0;
  for (const va of variantsA) {
    for (const vb of variantsB) {
      if (va && va === vb) return 1;               // exact normalised match
      best = Math.max(best, tokenScore(tokenize(va), tokenize(vb)));
    }
  }
  return best;
}

// Find the preset whose subject names best describe a portal semester. This is
// deliberately independent of numeric marks: a result row with no published
// ISA number still identifies the semester and must not be mistaken for a new
// course.
function presetCoverage(portalSubjects, presetSubjects) {
  const available = new Set(presetSubjects.map((subject) => subject.name));
  let matched = 0;
  let score = 0;
  for (const portalSubject of portalSubjects) {
    let best = 0;
    let bestName = null;
    for (const presetName of available) {
      const candidate = nameSimilarity(portalSubject.name, presetName);
      if (candidate > best) {
        best = candidate;
        bestName = presetName;
      }
    }
    if (bestName && best >= 0.4) {
      matched++;
      score += best;
      available.delete(bestName);
    }
  }
  return { matched, score };
}

export function findBestPreset(portalSubjects = []) {
  let best = null;
  for (const [name, presetSubjects] of Object.entries(SemesterPresets)) {
    const coverage = presetCoverage(portalSubjects, presetSubjects);
    if (!best || coverage.matched > best.matched || (coverage.matched === best.matched && coverage.score > best.score)) {
      best = { name, total: presetSubjects.length, ...coverage };
    }
  }
  return best;
}

function confidenceOf(score) {
  if (score >= 0.9) return 'high';
  if (score >= 0.6) return 'medium';
  if (score >= 0.4) return 'low';
  return 'none';
}

/* --------------------------- component extraction ------------------------- */

const RE_ISA1 = /^isa[\s-]*0*1$/i;
const RE_ISA2 = /^isa[\s-]*0*2$/i;
const RE_ASSIGNMENT = /^assignment/i;
const RE_MATLAB = /^matlab\b/i;
const RE_ESA = /^esa$/i;
// Rows that are totals/derived or header stats — never importable inputs.
const RE_SKIP = /^(final\s*isa|earned\s*credits|sgpa|cgpa|total|grand\s*total|max(imum)?|percentage|result|grade)$/i;

function numericScore(comp) {
  if (comp == null) return null;
  const v = comp.score;
  if (v === 0) return 0;
  if (v == null || v === '') return null;
  const n = typeof v === 'number' ? v : Number(String(v).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : null;
}

// Map ONE portal subject's components to calculator mark fields.
// `calcSubject` (optional) gates lab handling to subjects that actually have a
// lab component. Returns:
//   { fields:{isa1?,isa1Max?,isa2?,isa2Max?,assignment?,assignmentMax?,lab?,labMax?},
//     esaGrade, labParts:[label...], review:boolean }
// MATLAB 1/2 are combined into assignment /10; `review` is true when a value
// was assembled heuristically (summed non-MATLAB lab parts)
// and the student should double-check it.
export function extractMarkFields(portalSubject, calcSubject = null) {
  const fields = {};
  let esaGrade = null;
  const labParts = [];
  let labScoreSum = 0;
  let labMaxSum = 0;
  let matlabScoreSum = 0;
  let matlabMaxSum = 0;
  let hasMatlab = false;
  let review = false;

  const comps = (portalSubject && portalSubject.components) || [];
  for (const comp of comps) {
    const label = String(comp.label || '').trim();
    if (!label) continue;

    if (RE_ESA.test(label)) {
      esaGrade = comp.grade != null ? String(comp.grade) : (comp.score != null ? String(comp.score) : null);
      continue; // ESA is a letter grade — never an importable number
    }
    if (RE_SKIP.test(label)) continue;

    const score = numericScore(comp);

    if (RE_ISA1.test(label)) {
      if (score != null) { fields.isa1 = String(score); if (Number.isFinite(comp.max)) fields.isa1Max = comp.max; }
    } else if (RE_ISA2.test(label)) {
      if (score != null) { fields.isa2 = String(score); if (Number.isFinite(comp.max)) fields.isa2Max = comp.max; }
    } else if (RE_ASSIGNMENT.test(label)) {
      if (score != null) {
        // Multiple assignment rows (rare) accumulate.
        fields.assignment = String((Number(fields.assignment) || 0) + score);
        if (Number.isFinite(comp.max)) fields.assignmentMax = (fields.assignmentMax || 0) + comp.max;
      }
    } else if (RE_MATLAB.test(label)) {
      if (score != null) {
        hasMatlab = true;
        matlabScoreSum += score;
        if (Number.isFinite(comp.max)) matlabMaxSum += comp.max;
      }
    } else if (score != null) {
      // Anything else with a real number is treated as a lab-like component.
      labParts.push(label);
      labScoreSum += score;
      if (Number.isFinite(comp.max)) labMaxSum += comp.max;
    }
  }

  // PES reports MATLAB 1/2 as separate rows, but the calculator treats them as
  // one assignment component worth 10 marks. Scale their combined raw score.
  if (hasMatlab) {
    const rawAssignment = Number(fields.assignment) || 0;
    const rawAssignmentMax = Number(fields.assignmentMax) || 0;
    const rawScore = matlabScoreSum + rawAssignment;
    const rawMax = matlabMaxSum + rawAssignmentMax;
    fields.assignment = (rawMax > 0 ? (rawScore * 10) / rawMax : rawScore).toFixed(2);
    fields.assignmentMax = 10;
  }

  // Fold genuine lab parts into the single `lab` field, but only for subjects
  // that have a lab (avoids inventing a lab mark on theory-only subjects).
  const hasLab = calcSubject ? calcSubject.hasLab !== false : true;
  if (labParts.length && hasLab) {
    fields.lab = String(labScoreSum);
    if (labMaxSum > 0) fields.labMax = labMaxSum;
    if (labParts.length > 1 || !/^lab/i.test(labParts[0])) review = true;
  }

  return { fields, esaGrade, labParts, review };
}

// True when a fields object holds at least one importable numeric value.
export function hasImportableFields(fields) {
  return ['isa1', 'isa2', 'assignment', 'lab'].some((k) => fields[k] != null);
}

/* --------------------- credits & subject construction -------------------- */

// PES course codes look like  UE25MA141B  (2 letters, 2-digit year, dept, a
// 3-digit course number, optional trailing section letter). The SECOND-TO-LAST
// DIGIT of the code encodes the credit count — e.g. …141→4, …151→5, …121→2.
// Because the year and course-number digits sit in the middle and the only
// trailing character is a letter, taking the second-to-last digit across the
// whole (digits-only) code is robust to a trailing letter or its absence.
// Verified against real codes: MA141B→4, PH151B→5, EE141B→4, ME141B→4,
// CS151B→5, EV121B→2.
export function creditsFromCode(code) {
  const digits = String(code || '').replace(/\D/g, '');
  if (digits.length < 2) return null;
  const c = Number(digits[digits.length - 2]);
  return Number.isInteger(c) && c >= 1 && c <= 9 ? c : null;
}

// Build a calculator subject definition (everything but id + name) for a credit
// count, mirroring the structures already used in presets.js:
//   • 5 credits → theory + lab   (ISA 20 / Assignment 10 / Lab 20 / ESA 50; maxes 40/40/100)
//   • 3–4 credits → theory       (ISA 20 / Assignment 10 / ESA 50; maxes 40/40/100)
//   • 1–2 credits → light course (ISA 25 / no assignment / ESA 50; maxes 30/30/50)
//   • anything else / unknown → a 4-credit theory template (editable fallback)
// The user's rule "you already know how 5/4/2 credit courses work" drives this.
export function subjectDefForCredits(credits) {
  const c = Number.isInteger(credits) ? credits : null;
  if (c === 5) {
    return { credits: 5, hasLab: true, hasAssignment: true, isaWeight: 20, assignmentWeight: 10, labWeight: 20, esaWeight: 50, isa1Max: 40, isa2Max: 40, esaMax: 100 };
  }
  if (c === 1 || c === 2) {
    return { credits: c, hasLab: false, hasAssignment: false, isaWeight: 25, assignmentWeight: 0, labWeight: 0, esaWeight: 50, isa1Max: 30, isa2Max: 30, esaMax: 50 };
  }
  // 3, 4, and unknown/other credit counts → theory template (keep the real credit
  // value when we have one so weighted SGPA stays correct; default to 4).
  return { credits: c && c > 0 ? c : 4, hasLab: false, hasAssignment: true, isaWeight: 20, assignmentWeight: 10, labWeight: 0, esaWeight: 50, isa1Max: 40, isa2Max: 40, esaMax: 100 };
}

// Turn ONE merged portal subject into a proposed calculator subject (def + name +
// credits) plus the mark fields to load into it. Lab handling follows the credit:
// a 5-credit course gets a real lab slot (lab marks import), while theory/light
// courses record any non-MATLAB lab-like parts as `labParts` without inventing a
// lab field. Component maxes on the def are aligned
// to the imported marks' maxes when known so nothing drifts.
export function portalSubjectToDef(ps) {
  const credits = creditsFromCode(ps && ps.code);
  const { fields, esaGrade, labParts, review } = extractMarkFields(ps, { hasLab: credits === 5 });
  const subject = subjectDefForCredits(credits);
  if (Number.isFinite(fields.isa1Max)) subject.isa1Max = fields.isa1Max;
  if (Number.isFinite(fields.isa2Max)) subject.isa2Max = fields.isa2Max;
  return {
    code: (ps && ps.code) || '',
    name: (ps && ps.name) || '',
    credits: subject.credits,
    subject,
    fields,
    esaGrade,
    labParts,
    review,
  };
}

/* ------------------------------ merge & plan ----------------------------- */

// Merge one final semester's subjects with the matching provisional semester so
// each subject carries the best numbers (final) AND a letter grade (either).
// Returns a list of portal subjects: { code, name, components, esaGrade, grade }.
export function mergeSemesterSubjects(finalSem, provisionalSem) {
  const provByCode = new Map();
  const provByName = new Map();
  for (const s of (provisionalSem && provisionalSem.subjects) || []) {
    if (s.code) provByCode.set(s.code, s);
    if (s.name) provByName.set(normalizeName(s.name), s);
  }
  const out = [];
  const usedProv = new Set();

  for (const fs of (finalSem && finalSem.subjects) || []) {
    const match = (fs.code && provByCode.get(fs.code)) || provByName.get(normalizeName(fs.name));
    if (match) usedProv.add(match);
    out.push({
      code: fs.code || (match && match.code) || '',
      name: fs.name || (match && match.name) || '',
      components: fs.components || [],
      esaGrade: fs.esaGrade || null,
      grade: (match && match.grade) || fs.esaGrade || null,
    });
  }
  // Subjects that exist ONLY in provisional (grade but no final row yet) — keep
  // them so analytics + matching still see them (they have no numbers to import).
  for (const ps of (provisionalSem && provisionalSem.subjects) || []) {
    if (usedProv.has(ps)) continue;
    out.push({ code: ps.code || '', name: ps.name || '', components: ps.components || [], esaGrade: null, grade: ps.grade || null });
  }
  return out;
}

// Build a full import plan: match portal subjects (merged final+provisional) to
// the calculator's current subjects by name, and extract the fields to set.
// `marks` (optional, keyed by subject id) is used only to flag which fields would
// OVERWRITE an existing non-empty value.
//   returns {
//     matched:  [{ code, portalName, calcId, calcName, score, confidence,
//                  fields, labParts, review, overwrites:[field...] }],
//     unmatchedPortal: [{ code, name, grade }],
//     unmatchedCalc:   [{ id, name }],
//     toCreate: [{ code, name, credits, subject, fields, esaGrade, labParts, review }],  // unmatched portal → new subjects (merge/append)
//     rebuild:  [{ code, name, credits, subject, fields, esaGrade, labParts, review }],  // ALL portal → new subjects (replace)
//   }
export function buildImportPlan({ calcSubjects = [], finalSem = null, provisionalSem = null, marks = {} } = {}) {
  const portalSubjects = mergeSemesterSubjects(finalSem, provisionalSem);
  const preset = findBestPreset(portalSubjects);

  // Score every portal×calc pair, then assign greedily highest-first, one-to-one.
  const pairs = [];
  portalSubjects.forEach((ps, pi) => {
    calcSubjects.forEach((cs, ci) => {
      const score = nameSimilarity(ps.name, cs.name);
      if (score >= 0.4) pairs.push({ pi, ci, score });
    });
  });
  pairs.sort((a, b) => b.score - a.score);

  const takenPortal = new Set();
  const takenCalc = new Set();
  const matched = [];
  for (const { pi, ci, score } of pairs) {
    if (takenPortal.has(pi) || takenCalc.has(ci)) continue;
    const ps = portalSubjects[pi];
    const cs = calcSubjects[ci];
    const { fields, esaGrade, labParts, review } = extractMarkFields(ps, cs);
    if (!hasImportableFields(fields)) continue; // nothing numeric → don't claim the pairing for import
    takenPortal.add(pi);
    takenCalc.add(ci);

    const existing = marks[cs.id] || {};
    const overwrites = ['isa1', 'isa2', 'assignment', 'lab'].filter(
      (k) => fields[k] != null && existing[k] !== undefined && existing[k] !== '' && existing[k] !== null,
    );

    matched.push({
      code: ps.code, portalName: ps.name, calcId: cs.id, calcName: cs.name,
      score, confidence: confidenceOf(score), fields, esaGrade, labParts, review, overwrites,
    });
  }

  const unmatchedPortal = portalSubjects
    .map((ps, pi) => ({ ps, pi }))
    .filter(({ pi, ps }) => !takenPortal.has(pi) && (hasImportableFields(extractMarkFields(ps).fields) || ps.grade))
    .map(({ ps }) => ({ code: ps.code, name: ps.name, grade: ps.grade }));

  const unmatchedCalc = calcSubjects
    .map((cs, ci) => ({ cs, ci }))
    .filter(({ ci }) => !takenCalc.has(ci))
    .map(({ cs }) => ({ id: cs.id, name: cs.name }));

  // Subjects to CREATE from the portal (credits + structure derived from the
  // course code):
  //   • toCreate — only the portal subjects that DIDN'T match a calculator
  //     subject, for the "fill existing + append the rest" (merge) path.
  //   • rebuild  — EVERY portal subject as a fresh definition, for the "clear
  //     and import the whole semester as a new set" (replace) path.
  const toCreate = portalSubjects
    .map((ps, pi) => ({ ps, pi }))
    .filter(({ pi }) => !takenPortal.has(pi))
    .map(({ ps }) => portalSubjectToDef(ps));

  const rebuild = portalSubjects.map((ps) => portalSubjectToDef(ps));

  return { matched, unmatchedPortal, unmatchedCalc, toCreate, rebuild, preset };
}

/* -------------------------------- analytics ------------------------------ */

const GRADE_ORDER = ['S', 'A', 'B', 'C', 'D', 'E', 'F', 'W', 'I', 'AB', 'P', 'NC'];

// Count letter grades across a semester's subjects. Grade comes from `.grade`
// (provisional) or `.esaGrade` (final). Returns ordered [{ grade, count }] plus
// the total number of graded subjects.
export function summarizeGrades(subjects = []) {
  const counts = {};
  let total = 0;
  for (const s of subjects) {
    const g = String((s.grade != null ? s.grade : s.esaGrade) || '').trim().toUpperCase();
    if (!g || g === '-' || g === 'NA') continue;
    counts[g] = (counts[g] || 0) + 1;
    total++;
  }
  const ordered = Object.keys(counts).sort((a, b) => {
    const ia = GRADE_ORDER.indexOf(a);
    const ib = GRADE_ORDER.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
  return { counts: ordered.map((g) => ({ grade: g, count: counts[g] })), total };
}
