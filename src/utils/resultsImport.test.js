import { describe, expect, it } from "vitest";

import {
  normalizeName,
  nameVariants,
  nameSimilarity,
  extractMarkFields,
  hasImportableFields,
  mergeSemesterSubjects,
  buildImportPlan,
  summarizeGrades,
} from "./resultsImport";

// A realistic FINAL-results subject: numeric ISA/Assignment, a derived FINAL ISA
// total (must be ignored), and ESA as a letter grade (never a number).
const finalMath = {
  code: "UE23MA141B",
  name: "Engineering Mathematics I",
  components: [
    { label: "ISA 1", score: 32, max: 40 },
    { label: "ISA 2", score: 30, max: 40 },
    { label: "Assignment", score: 8, max: 10 },
    { label: "FINAL ISA", score: 45, max: 50 },
    { label: "ESA", grade: "A" },
  ],
  esaGrade: "A",
};
// A subject with a multi-part lab (MATLAB 1 + MATLAB 2), like EEE on the portal.
const finalEee = {
  code: "UE23EE151B",
  name: "Elements of Electrical Engineering",
  components: [
    { label: "ISA 1", score: 28, max: 40 },
    { label: "ISA 2", score: 33, max: 40 },
    { label: "Assignment", score: 9, max: 10 },
    { label: "MATLAB 1", score: 8, max: 10 },
    { label: "MATLAB 2", score: 7, max: 10 },
    { label: "ESA", grade: "B" },
  ],
  esaGrade: "B",
};

describe("normalizeName", () => {
  it("lowercases, drops punctuation/parens, keeps slashes", () => {
    expect(normalizeName("Mathematics - I/II")).toBe("mathematics i/ii");
    expect(normalizeName("Data Structures (DS) & Algorithms")).toBe("data structures and algorithms");
  });
});

describe("nameVariants", () => {
  it("keeps substantial slash-segments, discards lone roman suffixes", () => {
    const v = nameVariants("Mathematics - I/II");
    expect(v).toContain("mathematics i ii"); // whole (slash→space)
    expect(v).toContain("mathematics i");    // first segment
    expect(v).not.toContain("ii");           // roman-only segment dropped
  });
  it("splits two full titles behind a slash", () => {
    const v = nameVariants("Python for Computational Problem Solving/Problem Solving with C");
    expect(v).toContain("python for computational problem solving");
    expect(v).toContain("problem solving with c");
  });
});

describe("nameSimilarity", () => {
  it("scores exact/subset/unrelated names sensibly", () => {
    expect(nameSimilarity("Elements of Electrical Engineering", "Elements of Electrical Engineering")).toBe(1);
    // subset title still matches strongly (containment)
    expect(nameSimilarity("Data Structures and its Applications", "Data Structures")).toBeGreaterThanOrEqual(0.9);
    // slash-variant match: preset "Mathematics - I/II" vs portal "Engineering Mathematics I"
    expect(nameSimilarity("Mathematics - I/II", "Engineering Mathematics I")).toBeGreaterThanOrEqual(0.9);
    expect(nameSimilarity("Operating System", "Computer Networks")).toBeLessThan(0.4);
  });
});

describe("extractMarkFields", () => {
  it("maps ISA 1/2 + Assignment, ignores FINAL ISA, keeps ESA as a grade only", () => {
    const { fields, esaGrade, labParts, review } = extractMarkFields(finalMath, { hasLab: false });
    expect(fields).toEqual({ isa1: "32", isa1Max: 40, isa2: "30", isa2Max: 40, assignment: "8", assignmentMax: 10 });
    expect(esaGrade).toBe("A");
    expect(labParts).toEqual([]);
    expect(review).toBe(false);
    expect(fields.lab).toBeUndefined(); // ESA never becomes a number
  });

  it("folds multi-part labs into `lab` and flags review (subject hasLab)", () => {
    const { fields, labParts, review } = extractMarkFields(finalEee, { hasLab: true });
    expect(fields.isa1).toBe("28");
    expect(fields.lab).toBe("15");   // 8 + 7
    expect(fields.labMax).toBe(20);  // 10 + 10
    expect(labParts).toEqual(["MATLAB 1", "MATLAB 2"]);
    expect(review).toBe(true);
  });

  it("does NOT invent a lab mark on a theory-only subject", () => {
    const { fields, labParts } = extractMarkFields(finalEee, { hasLab: false });
    expect(fields.lab).toBeUndefined();
    expect(labParts).toEqual(["MATLAB 1", "MATLAB 2"]); // still surfaced for the preview
  });

  it("treats a single component literally named Lab as non-review", () => {
    const sub = { name: "X", components: [{ label: "Lab", score: 18, max: 20 }] };
    const { fields, review } = extractMarkFields(sub, { hasLab: true });
    expect(fields.lab).toBe("18");
    expect(review).toBe(false);
  });
});

describe("hasImportableFields", () => {
  it("is true only when a score field is present", () => {
    expect(hasImportableFields({ isa1: "10" })).toBe(true);
    expect(hasImportableFields({ isa1Max: 40 })).toBe(false);
    expect(hasImportableFields({})).toBe(false);
  });
});

describe("mergeSemesterSubjects", () => {
  it("carries final numbers + a grade, and keeps provisional-only subjects", () => {
    const finalSem = { subjects: [finalMath] };
    const provSem = {
      subjects: [
        { code: "UE23MA141B", name: "Engineering Mathematics I", grade: "A" },
        { code: "UE23CS151B", name: "Python", grade: "S" },
      ],
    };
    const merged = mergeSemesterSubjects(finalSem, provSem);
    expect(merged).toHaveLength(2);
    const math = merged.find((m) => m.code === "UE23MA141B");
    expect(math.components).toHaveLength(5); // numbers from final
    expect(math.grade).toBe("A");
    const py = merged.find((m) => m.code === "UE23CS151B");
    expect(py.components).toEqual([]); // provisional-only: nothing numeric
    expect(py.grade).toBe("S");
  });
});

describe("buildImportPlan", () => {
  const calcSubjects = [
    { id: 1, name: "Mathematics - I/II", hasLab: false },
    { id: 2, name: "Elements of Electrical Engineering", hasLab: false },
    { id: 3, name: "Engineering Physics", hasLab: true },
  ];
  const finalSem = { subjects: [finalMath, finalEee] };

  it("matches portal subjects to calculator subjects by name and extracts fields", () => {
    const plan = buildImportPlan({ calcSubjects, finalSem });
    expect(plan.matched).toHaveLength(2);
    const math = plan.matched.find((m) => m.calcId === 1);
    expect(math.portalName).toBe("Engineering Mathematics I");
    expect(math.confidence).toBe("high");
    expect(math.fields.isa1).toBe("32");
    expect(math.overwrites).toEqual([]); // no prior marks passed
    // Physics has no portal counterpart this run.
    expect(plan.unmatchedCalc.map((c) => c.id)).toContain(3);
  });

  it("flags fields that would overwrite existing non-empty marks", () => {
    const marks = { 1: { isa1: "10", isa2: "", assignment: "" } };
    const plan = buildImportPlan({ calcSubjects, finalSem, marks });
    const math = plan.matched.find((m) => m.calcId === 1);
    expect(math.overwrites).toEqual(["isa1"]); // isa1 already had a value
  });

  it("does not claim a pairing when there's nothing numeric to import", () => {
    const provisionalOnly = { subjects: [{ code: "Z", name: "Elements of Electrical Engineering", grade: "B" }] };
    const plan = buildImportPlan({ calcSubjects, finalSem: null, provisionalSem: provisionalOnly });
    expect(plan.matched).toHaveLength(0);
    expect(plan.unmatchedPortal.some((p) => p.grade === "B")).toBe(true);
  });
});

describe("summarizeGrades", () => {
  it("counts grades in canonical order, skipping blanks", () => {
    const { counts, total } = summarizeGrades([
      { grade: "A" }, { grade: "S" }, { grade: "A" }, { grade: "B" }, { grade: "-" }, { grade: "" },
    ]);
    expect(total).toBe(4);
    expect(counts).toEqual([{ grade: "S", count: 1 }, { grade: "A", count: 2 }, { grade: "B", count: 1 }]);
  });
  it("falls back to esaGrade for final-results subjects", () => {
    const { counts, total } = summarizeGrades([{ esaGrade: "A" }, { esaGrade: "F" }]);
    expect(total).toBe(2);
    expect(counts).toEqual([{ grade: "A", count: 1 }, { grade: "F", count: 1 }]);
  });
});
