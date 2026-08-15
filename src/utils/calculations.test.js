import { describe, expect, it } from "vitest";

import {
  getFinalIsaSummary,
  getGradeInfo,
  getGradePoint,
  getRequiredESAForGrade,
  getRequiredISA2ForGrade,
  getRequiredISA2ForPass,
  getSubjectMetrics,
} from "./calculations";

const buildSubject = (overrides = {}) => ({
  id: 1,
  hasIsa1: true,
  hasIsa2: true,
  hasAssignment: true,
  hasLab: true,
  isaWeight: 20,
  assignmentWeight: 10,
  labWeight: 20,
  esaWeight: 50,
  isa1Max: 40,
  isa2Max: 40,
  assignmentMax: 10,
  labMax: 20,
  esaMax: 100,
  ...overrides,
});

describe("calculations utilities", () => {
  it("returns the expected grade point for a score in the default grading map", () => {
    expect(getGradePoint(95)).toBe(10);
    expect(getGradePoint(82)).toBe(9);
    expect(getGradePoint(35)).toBe(0);
  });

  it("maps a score to the correct grade info", () => {
    expect(getGradeInfo(92)).toMatchObject({ grade: "S", gp: 10 });
    expect(getGradeInfo(81)).toMatchObject({ grade: "A", gp: 9 });
    expect(getGradeInfo(39)).toMatchObject({ grade: "F", gp: 0 });
  });

  it("computes a standard subject score correctly from raw marks", () => {
    const subject = buildSubject();

    const marks = {
      1: {
        isa1: "20",
        isa2: "20",
        assignment: "8",
        lab: "15",
        esa: "70",
      },
    };

    expect(getSubjectMetrics(subject, marks)).toMatchObject({
      finalScore: 66,
      unroundedScore: 65,
      rawScore: 78,
      totalWeight: 120,
    });
  });

  it("returns a safe default shape when marks are missing for the subject", () => {
    const subject = buildSubject({ id: 99 });

    expect(getSubjectMetrics(subject, {})).toMatchObject({
      finalScore: 0,
      unroundedScore: 0,
      rawScore: 0,
      totalWeight: 100,
      momentumScore: 0,
      momentumIsa2Marks: null,
      hasIsa1: false,
      hasIsa2: false,
    });
  });

  it("projects momentum values for missing ISA2, assignment, lab and ESA", () => {
    const subject = buildSubject();
    const marks = {
      1: {
        isa1: "32",
        isa2: "",
        assignment: "",
        lab: "",
        esa: "",
      },
    };

    expect(getSubjectMetrics(subject, marks)).toMatchObject({
      finalScore: 14,
      momentumScore: 85,
      momentumIsa2Marks: 32,
      momentumAssignmentMarks: 10,
      momentumLabMarks: 20,
      projectedCieRounded: 42,
      projectedLabRounded: 20,
      momentumEsaMarks: 80,
    });
  });

  it("builds a final ISA summary using configured weights", () => {
    const subject = buildSubject({
      customConfig: {
        weights: {
          isa1: 15,
          isa2: 15,
          assignment: 20,
        },
      },
    });
    const marks = {
      1: {
        isa1: "30",
        isa2: "20",
        assignment: "5",
      },
    };

    expect(getFinalIsaSummary(subject, marks)).toMatchObject({
      isa1: 11.25,
      isa2: 7.5,
      assignment: 10,
      total: 28.75,
      max: 50,
    });
  });

  it("returns impossible for ESA requirements when target cannot be reached", () => {
    const subject = buildSubject();
    const marks = {
      1: {
        isa1: "0",
        isa2: "0",
        assignment: "0",
        lab: "0",
        esa: "",
      },
    };

    expect(getRequiredESAForGrade(subject, 50, true, {}, marks)).toEqual({
      safe: null,
      minimum: null,
    });
  });

  it("computes safe and minimum ESA marks with safety margin", () => {
    const subject = buildSubject();
    const marks = {
      1: {
        isa1: "30",
        isa2: "30",
        assignment: "8",
        lab: "16",
        esa: "",
      },
    };

    expect(getRequiredESAForGrade(subject, 70, true, {}, marks)).toEqual({
      safe: 60,
      minimum: 57,
    });
  });

  it("computes exact ESA minimum when safety margin is disabled", () => {
    const subject = buildSubject();
    const marks = {
      1: {
        isa1: "30",
        isa2: "30",
        assignment: "8",
        lab: "16",
        esa: "",
      },
    };

    expect(getRequiredESAForGrade(subject, 70, false, {}, marks)).toBe(57);
  });

  it("uses projected internals when momentum internals are enabled", () => {
    const subject = buildSubject();
    const marks = {
      1: {
        isa1: "32",
        isa2: "",
        assignment: "",
        lab: "",
        esa: "",
      },
    };

    expect(getRequiredESAForGrade(subject, 70, true, {}, marks)).toEqual({
      safe: null,
      minimum: null,
    });
    expect(
      getRequiredESAForGrade(
        subject,
        70,
        true,
        { useMomentumInternals: true },
        marks,
      ),
    ).toEqual({ safe: 44, minimum: 41 });
  });

  it("reduces ESA requirement when momentum ISA2 mode is enabled", () => {
    const subject = buildSubject({ hasLab: false, labWeight: 0 });
    const marks = {
      1: {
        isa1: "32",
        isa2: "",
        assignment: "8",
        esa: "",
      },
    };

    expect(getRequiredESAForGrade(subject, 70, true, {}, marks)).toEqual({
      safe: 92,
      minimum: 91,
    });
    expect(
      getRequiredESAForGrade(
        subject,
        70,
        true,
        { useMomentumIsa2: true },
        marks,
      ),
    ).toEqual({ safe: 60, minimum: 59 });
  });

  it("returns null for ISA2 solver when a subject has no ISA2", () => {
    const subject = buildSubject({ hasIsa2: false });
    const marks = {
      1: {
        isa1: "30",
        assignment: "8",
        lab: "16",
      },
    };

    expect(getRequiredISA2ForGrade(subject, 60, {}, marks)).toBeNull();
  });

  it("returns null for ISA2 solver when ISA2 marks are already present", () => {
    const subject = buildSubject();
    const marks = {
      1: {
        isa1: "30",
        isa2: "25",
        assignment: "8",
        lab: "16",
      },
    };

    expect(getRequiredISA2ForGrade(subject, 60, {}, marks)).toBeNull();
  });

  it("returns null for ISA2 solver when target score is invalid", () => {
    const subject = buildSubject();
    const marks = {
      1: {
        isa1: "30",
      },
    };

    expect(getRequiredISA2ForGrade(subject, "abc", {}, marks)).toBeNull();
  });

  it("returns null needed ISA2 marks when target is mathematically impossible", () => {
    const subject = buildSubject();
    const marks = {
      1: {
        isa1: "20",
        assignment: "5",
        lab: "10",
        esa: "50",
      },
    };

    expect(getRequiredISA2ForGrade(subject, 70, {}, marks)).toEqual({
      needed: null,
      max: 40,
    });
  });

  it("returns concrete ISA2 marks needed for an achievable target", () => {
    const subject = buildSubject();
    const marks = {
      1: {
        isa1: "20",
        assignment: "5",
        lab: "10",
        esa: "50",
      },
    };

    expect(getRequiredISA2ForGrade(subject, 50, {}, marks)).toEqual({
      needed: 17,
      max: 40,
    });
  });

  it("returns zero ISA2 marks when target threshold is already met", () => {
    const subject = buildSubject();
    const marks = {
      1: {
        isa1: "20",
        assignment: "5",
        lab: "10",
        esa: "50",
      },
    };

    expect(getRequiredISA2ForGrade(subject, 30, {}, marks)).toEqual({
      needed: 0,
      max: 40,
    });
  });

  it("uses the pass wrapper defaults for ISA2 requirement", () => {
    const subject = buildSubject();
    const marks = {
      1: {
        isa1: "10",
        isa2: "",
        assignment: "",
        lab: "",
        esa: "",
      },
    };

    expect(getRequiredISA2ForPass(subject, marks)).toEqual({
      needed: 23,
      max: 40,
    });
    expect(getRequiredISA2ForPass(subject, marks)).toEqual(
      getRequiredISA2ForGrade(
        subject,
        40,
        { assumeFullForEmptyInternals: true },
        marks,
      ),
    );
  });
});
