import { describe, expect, it } from "vitest";

import {
  normalizeName,
  nameVariants,
  nameSimilarity,
  extractMarkFields,
  hasImportableFields,
  creditsFromCode,
  subjectDefForCredits,
  portalSubjectToDef,
  mergeSemesterSubjects,
  buildImportPlan,
  findBestPreset,
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

  it("folds MATLAB 1/2 into assignment scaled to 10 marks", () => {
    const { fields, labParts, review } = extractMarkFields(finalEee, { hasLab: true });
    expect(fields.isa1).toBe("28");
    expect(fields.assignment).toBe("8.00"); // (9 + 8 + 7) / 30 * 10
    expect(fields.assignmentMax).toBe(10);
    expect(fields.lab).toBeUndefined();
    expect(labParts).toEqual([]);
    expect(review).toBe(false);
  });

  it("does not invent a lab mark from MATLAB rows", () => {
    const { fields, labParts } = extractMarkFields(finalEee, { hasLab: false });
    expect(fields.lab).toBeUndefined();
    expect(fields.assignmentMax).toBe(10);
    expect(labParts).toEqual([]);
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

describe("creditsFromCode", () => {
  it("reads the credit from the second-to-last digit of the code", () => {
    // Real PES codes verified against the portal.
    expect(creditsFromCode("UE25MA141B")).toBe(4);
    expect(creditsFromCode("UE25PH151B")).toBe(5);
    expect(creditsFromCode("UE25EE141B")).toBe(4);
    expect(creditsFromCode("UE25ME141B")).toBe(4);
    expect(creditsFromCode("UE25CS151B")).toBe(5);
    expect(creditsFromCode("UE25EV121B")).toBe(2);
    expect(creditsFromCode("UZ25UZ221A")).toBe(2);
  });
  it("is robust to a missing trailing letter and to junk", () => {
    expect(creditsFromCode("UE25MA141")).toBe(4); // no trailing section letter
    expect(creditsFromCode("")).toBeNull();
    expect(creditsFromCode(null)).toBeNull();
    expect(creditsFromCode("XX")).toBeNull(); // no digits
  });
});

describe("subjectDefForCredits", () => {
  it("builds a 5-credit lab course", () => {
    expect(subjectDefForCredits(5)).toMatchObject({
      credits: 5, hasLab: true, hasAssignment: true,
      isaWeight: 20, assignmentWeight: 10, labWeight: 20, esaWeight: 50,
      isa1Max: 40, isa2Max: 40, esaMax: 100,
    });
  });
  it("builds a 4/3-credit theory course (no lab)", () => {
    expect(subjectDefForCredits(4)).toMatchObject({ credits: 4, hasLab: false, hasAssignment: true, labWeight: 0, esaMax: 100 });
    expect(subjectDefForCredits(3)).toMatchObject({ credits: 3, hasLab: false, hasAssignment: true });
  });
  it("builds a 1/2-credit light course (no assignment, /30 ISA, /50 ESA)", () => {
    expect(subjectDefForCredits(2)).toMatchObject({ credits: 2, hasLab: false, hasAssignment: false, isaWeight: 25, assignmentWeight: 0, isa1Max: 30, isa2Max: 30, esaMax: 50 });
    expect(subjectDefForCredits(1)).toMatchObject({ credits: 1, hasAssignment: false, esaMax: 50 });
  });
  it("falls back to a 4-credit theory template for unknown credits", () => {
    expect(subjectDefForCredits(null)).toMatchObject({ credits: 4, hasLab: false, hasAssignment: true });
  });
});

describe("portalSubjectToDef", () => {
  it("derives credits + structure from the code and imports MATLAB as assignment", () => {
    const eee5 = { ...finalEee, code: "UE23EE151B" }; // second-to-last digit 5 → lab course
    const def = portalSubjectToDef(eee5);
    expect(def.credits).toBe(5);
    expect(def.subject.hasLab).toBe(true);
    expect(def.fields.assignment).toBe("8.00");  // (9 + 8 + 7) / 30 * 10
    expect(def.fields.assignmentMax).toBe(10);
    expect(def.fields.lab).toBeUndefined();
    expect(def.fields.isa1).toBe("28");
    expect(def.name).toBe("Elements of Electrical Engineering");
  });
  it("maps MATLAB to assignment on a 4-credit subject", () => {
    const mathWithMatlab = {
      code: "UE23MA141B", // second-to-last digit 4 → theory, no lab
      name: "Engineering Mathematics II",
      components: [
        { label: "ISA 1", score: 30, max: 40 },
        { label: "ISA 2", score: 31, max: 40 },
        { label: "MATLAB 1", score: 9, max: 10 },
      ],
    };
    const def = portalSubjectToDef(mathWithMatlab);
    expect(def.credits).toBe(4);
    expect(def.subject.hasLab).toBe(false);
    expect(def.fields.lab).toBeUndefined();
    expect(def.fields.assignment).toBe("9.00");
    expect(def.fields.assignmentMax).toBe(10);
    expect(def.labParts).toEqual([]);
  });
  it("aligns the subject's ISA maxes with the imported marks (e.g. /30 for a 2-credit course)", () => {
    const evs = {
      code: "UE23EV121B", // 2 credits
      name: "Environmental Studies",
      components: [
        { label: "ISA 1", score: 24, max: 30 },
        { label: "ISA 2", score: 25, max: 30 },
      ],
    };
    const def = portalSubjectToDef(evs);
    expect(def.credits).toBe(2);
    expect(def.subject.isa1Max).toBe(30);
    expect(def.subject.isa2Max).toBe(30);
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

  it("offers `toCreate` for unmatched portal subjects and `rebuild` for the whole semester", () => {
    // Only Maths is in the calculator; EEE is not → EEE should appear in toCreate,
    // while rebuild carries BOTH as fresh definitions (credits from the code).
    const calcMathOnly = [{ id: 1, name: "Mathematics - I/II", hasLab: false }];
    const plan = buildImportPlan({ calcSubjects: calcMathOnly, finalSem });
    expect(plan.matched).toHaveLength(1);
    expect(plan.toCreate).toHaveLength(1);
    expect(plan.toCreate[0].name).toBe("Elements of Electrical Engineering");
    expect(plan.toCreate[0].credits).toBe(5); // UE23EE151B → 5-credit lab course
    expect(plan.toCreate[0].subject.hasLab).toBe(true);
    expect(plan.toCreate[0].fields.assignment).toBe("8.00");

    // rebuild = every portal subject, independent of what the calculator holds.
    expect(plan.rebuild).toHaveLength(2);
    const mathDef = plan.rebuild.find((d) => d.name === "Engineering Mathematics I");
    expect(mathDef.credits).toBe(4); // UE23MA141B → 4-credit theory
    expect(mathDef.subject.hasLab).toBe(false);
    expect(mathDef.fields.isa1).toBe("32");
  });
});

describe("findBestPreset", () => {
  it("recognizes a known semester from names even without numeric marks", () => {
    const portalSubjects = [
      { name: "Mathematics - I/II" },
      { name: "Engineering Physics" },
      { name: "Elements of Electrical Engineering" },
      { name: "Mechanical Engineering Sciences" },
      { name: "Python for Computational Problem Solving/Problem Solving with C" },
      { name: "Environmental Studies" },
    ];
    const preset = findBestPreset(portalSubjects);
    expect(preset.name).toBe("Physics Cycle");
    expect(preset.matched).toBe(6);
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
