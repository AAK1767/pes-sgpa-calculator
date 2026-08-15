import { describe, expect, it } from "vitest";

import { getSmartSuggestions } from "./smartSuggestions";

const buildSubject = (id, name, overrides = {}) => ({
  id,
  name,
  credits: 4,
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

describe("smart suggestion strategy", () => {
  it("returns no plan when current momentum already meets target", () => {
    const subjects = [buildSubject(1, "Sub 1")];
    const marks = {
      1: {
        isa1: "36",
        isa2: "36",
        assignment: "9",
        lab: "18",
        esa: "90",
      },
    };

    const result = getSmartSuggestions(subjects, marks, "8.5");

    expect(result.impossible).toBe(false);
    expect(result.plan).toHaveLength(0);
    expect(result.deficit).toBeLessThanOrEqual(0.01);
  });

  it("marks target as impossible when no feasible upgrades exist", () => {
    const subjects = [
      buildSubject(1, "Locked ESA", { credits: 4 }),
      buildSubject(2, "Already S", { credits: 4 }),
    ];
    const marks = {
      1: {
        isa1: "25",
        isa2: "25",
        assignment: "6",
        lab: "14",
        esa: "60",
      },
      2: {
        isa1: "40",
        isa2: "40",
        assignment: "10",
        lab: "20",
        esa: "100",
      },
    };

    const result = getSmartSuggestions(subjects, marks, "10");

    expect(result.impossible).toBe(true);
    expect(result.plan).toHaveLength(0);
    expect(result.deficit).toBeGreaterThan(0);
  });

  it("consolidates multiple grade jumps for the same subject", () => {
    const subjects = [buildSubject(1, "Primary")];
    const marks = {
      1: {
        isa1: "26",
        isa2: "24",
        assignment: "8",
        lab: "14",
        esa: "",
      },
    };

    const result = getSmartSuggestions(subjects, marks, "9");

    expect(result.impossible).toBe(false);
    expect(result.plan.length).toBe(1);

    const primaryStep = result.plan.find((step) => step.idx === 0);
    expect(primaryStep).toBeDefined();
    expect(primaryStep.gpGain).toBeGreaterThan(4);
    expect(primaryStep.toGrade).toMatch(/A|S/);
  });

  it("prioritizes the higher efficiency candidate first", () => {
    const subjects = [
      buildSubject(1, "High Efficiency", { credits: 5 }),
      buildSubject(2, "Low Efficiency", { credits: 2 }),
    ];
    const marks = {
      1: {
        isa1: "28",
        isa2: "26",
        assignment: "8",
        lab: "16",
        esa: "",
      },
      2: {
        isa1: "28",
        isa2: "26",
        assignment: "8",
        lab: "16",
        esa: "",
      },
    };

    const result = getSmartSuggestions(subjects, marks, "9.0");

    expect(result.plan.length).toBeGreaterThan(0);
    expect(result.plan[0].name).toBe("High Efficiency");
  });
});
