import { describe, expect, it } from "vitest";

import { getGradeInfo, getGradePoint, getSubjectMetrics } from "./calculations";

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
    const subject = {
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
    };

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
});
