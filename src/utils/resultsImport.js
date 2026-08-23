// Map PESU Academy portal results onto the calculator's Subjects tab, and
// summarise a semester's grades for a read-only analytics panel.
//
// Where the numbers live (confirmed against the real portal, 2026-08-23):
//   • FINAL results (the "getEsaAndIsaResult" view) carry the NUMERIC component
//     marks — "ISA 1", "ISA 2", "Assignment" (each score /max), plus a derived
//     "FINAL ISA" total and subject-specific lab parts (e.g. "MATLAB 1/2"). ESA
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
// `review` is true when a value was assembled heuristically (summed lab parts)
// and the student should double-check it.
export function extractMarkFields(portalSubject, calcSubject = null) {
  const fields = {};
  let esaGrade = null;
  const labParts = [];
  let labScoreSum = 0;
  let labMaxSum = 0;
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
    } else if (score != null) {
      // Anything else with a real number is treated as a lab-like component.
      labParts.push(label);
      labScoreSum += score;
      if (Number.isFinite(comp.max)) labMaxSum += comp.max;
    }
  }

  // Fold lab parts into the single `lab` field, but only for subjects that have a
  // lab (avoids inventing a lab mark on theory-only subjects). Flag for review
  // since it's a heuristic sum of subject-specific parts (e.g. MATLAB 1 + 2).
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
//   }
export function buildImportPlan({ calcSubjects = [], finalSem = null, provisionalSem = null, marks = {} } = {}) {
  const portalSubjects = mergeSemesterSubjects(finalSem, provisionalSem);

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

  return { matched, unmatchedPortal, unmatchedCalc };
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
