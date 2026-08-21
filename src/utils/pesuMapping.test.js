import { describe, expect, it } from "vitest";

import { parseSemester, classifyBranchFamily, mapProfileToPreset } from "./pesuMapping";

describe("parseSemester", () => {
  it("parses common PESU semester formats", () => {
    expect(parseSemester("Sem-3")).toBe(3);
    expect(parseSemester("Semester 5")).toBe(5);
    expect(parseSemester("6")).toBe(6);
    expect(parseSemester(4)).toBe(4);
  });

  it("returns null for missing / out-of-range / non-numeric values", () => {
    expect(parseSemester("NA")).toBeNull();
    expect(parseSemester("")).toBeNull();
    expect(parseSemester(null)).toBeNull();
    expect(parseSemester(undefined)).toBeNull();
    expect(parseSemester("Sem-9")).toBeNull();
    expect(parseSemester("0")).toBeNull();
  });
});

describe("classifyBranchFamily", () => {
  it("classifies AIML before generic CSE", () => {
    expect(classifyBranchFamily("Computer Science and Engineering (AI & ML)")).toBe("AIML");
    expect(classifyBranchFamily("Computer Science (AIML)", "CSE-AIML")).toBe("AIML");
    expect(classifyBranchFamily("Artificial Intelligence and Machine Learning")).toBe("AIML");
  });

  it("classifies ECE and CSE", () => {
    expect(classifyBranchFamily("Electronics and Communication Engineering")).toBe("ECE");
    expect(classifyBranchFamily("", "ECE")).toBe("ECE");
    expect(classifyBranchFamily("Computer Science and Engineering")).toBe("CSE");
    expect(classifyBranchFamily("", "CSE")).toBe("CSE");
  });

  it("returns null for branches with no matching preset family or empty input", () => {
    expect(classifyBranchFamily("Mechanical Engineering")).toBeNull();
    expect(classifyBranchFamily("Information Science and Engineering")).toBeNull();
    expect(classifyBranchFamily("")).toBeNull();
    expect(classifyBranchFamily(null, null)).toBeNull();
  });
});

describe("mapProfileToPreset", () => {
  it("matches a supported branch + semester to a preset key", () => {
    const result = mapProfileToPreset({
      branch: "Computer Science and Engineering",
      semester: "Sem-3",
    });
    expect(result.status).toBe("matched");
    expect(result.presetName).toBe("CSE Sem 3");
  });

  it("matches AIML higher semesters", () => {
    const result = mapProfileToPreset({
      branch: "Computer Science and Engineering (AI & ML)",
      semester: "Sem-6",
    });
    expect(result.status).toBe("matched");
    expect(result.presetName).toBe("AIML Sem 6");
  });

  it("offers a cycle choice for first-year students", () => {
    const result = mapProfileToPreset({ branch: "Computer Science", semester: "Sem-1" });
    expect(result.status).toBe("cycle-choice");
    expect(result.presetName).toBeNull();
    expect(result.cycleOptions).toEqual(["Physics Cycle", "Chemistry Cycle"]);
  });

  it("degrades gracefully when the branch+semester has no preset", () => {
    // ECE only has presets up to Sem 6 in the app.
    const result = mapProfileToPreset({
      branch: "Electronics and Communication Engineering",
      semester: "Sem-7",
    });
    expect(result.status).toBe("no-preset");
    expect(result.presetName).toBeNull();
    expect(result.fallback).toBe("Generic Cycle (Editable)");
  });

  it("returns 'unknown' when branch/semester can't be determined", () => {
    expect(mapProfileToPreset({ branch: "Mechanical Engineering", semester: "Sem-3" }).status).toBe(
      "unknown"
    );
    expect(mapProfileToPreset({}).status).toBe("unknown");
    expect(mapProfileToPreset(null).status).toBe("unknown");
  });
});
