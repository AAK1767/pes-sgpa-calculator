import { describe, expect, it } from "vitest";

import {
  isoWeekday,
  addDaysIso,
  findIsa2Start,
  excludedDateSet,
  computeTeachingDates,
  buildAttendanceProjection,
} from "./attendanceProjection";

// Synthetic timetable: Mon-Sat, so we can count sessions per subject per weekday.
//   SUB_A: Mon x2, Tue x1, Thu x1, (Sat x1 — must NEVER be counted)
//   SUB_B: Mon x1, Wed x2, Fri x1
const timetable = {
  days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  slots: [],
  entries: [
    { day: 1, slot: 1, code: "SUB_A", name: "Alpha" },
    { day: 1, slot: 2, code: "SUB_A", name: "Alpha" },
    { day: 1, slot: 3, code: "SUB_B", name: "Beta" },
    { day: 2, slot: 1, code: "SUB_A", name: "Alpha" },
    { day: 3, slot: 1, code: "SUB_B", name: "Beta" },
    { day: 3, slot: 2, code: "SUB_B", name: "Beta" },
    { day: 4, slot: 1, code: "SUB_A", name: "Alpha" },
    { day: 5, slot: 1, code: "SUB_B", name: "Beta" },
    { day: 6, slot: 1, code: "SUB_A", name: "Alpha" }, // Saturday — always off
  ],
};

const calendar = {
  calendar: { name: "Aug 2026 - Dec 2026", start: "2026-08-01", end: "2026-12-31" },
  events: [
    { name: "Independence Day", type: "National Festival", start: "2026-08-17", end: "2026-08-17", isHoliday: true, isClass: false },
    { name: "FAM 1", type: "University Events", start: "2026-11-18", end: "2026-11-18", isHoliday: false, isClass: true },
    { name: "ISA 1", type: "Test Schedule", start: "2026-09-21", end: "2026-09-25", isHoliday: false, isClass: true },
    { name: "ISA 2", type: "University Events", start: "2026-11-23", end: "2026-11-27", isHoliday: false, isClass: true },
    { name: "ESA", type: "Test Schedule", start: "2026-12-07", end: "2026-12-18", isHoliday: false, isClass: true },
  ],
};

describe("date helpers", () => {
  it("isoWeekday: Aug 23 2026 is a Sunday, Nov 16 2026 a Monday", () => {
    expect(isoWeekday("2026-08-23")).toBe(0);
    expect(isoWeekday("2026-11-16")).toBe(1);
    expect(isoWeekday("2026-11-21")).toBe(6); // Saturday
  });
  it("addDaysIso handles month/year edges", () => {
    expect(addDaysIso("2026-08-31", 1)).toBe("2026-09-01");
    expect(addDaysIso("2026-01-01", -1)).toBe("2025-12-31");
  });
});

describe("findIsa2Start", () => {
  it("returns the ISO start of the first ISA 2 event (the teaching cap)", () => {
    expect(findIsa2Start(calendar.events)).toBe("2026-11-23");
  });
  it("matches ISA-2 / ISA2 spellings and ignores ISA 1", () => {
    expect(findIsa2Start([{ name: "ISA-2", start: "2026-10-10" }])).toBe("2026-10-10");
    expect(findIsa2Start([{ name: "ISA2", start: "2026-10-11" }])).toBe("2026-10-11");
    expect(findIsa2Start([{ name: "ISA 1", start: "2026-09-01" }])).toBeNull();
  });
});

describe("excludedDateSet", () => {
  it("excludes holidays and ISA/ESA windows, but keeps FAM/CCM/PTM", () => {
    const set = excludedDateSet(calendar.events);
    expect(set.has("2026-08-17")).toBe(true); // Independence Day (holiday)
    expect(set.has("2026-09-23")).toBe(true); // inside ISA 1
    expect(set.has("2026-12-10")).toBe(true); // inside ESA
    expect(set.has("2026-11-18")).toBe(false); // FAM 1 — a normal class day
  });
});

describe("computeTeachingDates", () => {
  it("drops the whole ISA 1 week + weekend", () => {
    const days = computeTeachingDates({ events: calendar.events, fromIso: "2026-09-21", capIso: "2026-09-28" });
    expect(days).toEqual([]); // Mon-Fri are ISA 1, Sat/Sun are weekend
  });
  it("counts a clean Mon-Fri run", () => {
    const days = computeTeachingDates({ events: calendar.events, fromIso: "2026-09-28", capIso: "2026-10-03" });
    expect(days).toEqual(["2026-09-28", "2026-09-29", "2026-09-30", "2026-10-01", "2026-10-02"]);
  });
});

describe("buildAttendanceProjection", () => {
  it("projects per-subject sessions in [today, ISA2) excluding Sat/Sun", () => {
    const p = buildAttendanceProjection({ timetable, calendar, todayIso: "2026-11-16" });
    expect(p.available).toBe(true);
    expect(p.windowEnd).toBe("2026-11-23"); // exclusive — ISA 2 start
    expect(p.isa2Start).toBe("2026-11-23");
    expect(p.teachingDayCount).toBe(5); // Mon-Fri of that week
    // SUB_A: Mon2 + Tue1 + Thu1 = 4 (Saturday slot never counted)
    // SUB_B: Mon1 + Wed2 + Fri1 = 4
    expect(p.byCode.SUB_A).toBe(4);
    expect(p.byCode.SUB_B).toBe(4);
    expect(p.totalSessions).toBe(8);
  });

  it("falls back to ESA start when ISA 2 is absent", () => {
    const noIsa2 = { ...calendar, events: calendar.events.filter((e) => e.name !== "ISA 2") };
    const p = buildAttendanceProjection({ timetable, calendar: noIsa2, todayIso: "2026-11-16" });
    expect(p.available).toBe(true);
    expect(p.isa2Start).toBeNull();
    expect(p.windowEnd).toBe("2026-12-07"); // ESA start
  });

  it("reports reasons for degenerate inputs", () => {
    expect(buildAttendanceProjection({ timetable: null, calendar }).reason).toBe("no-timetable");
    expect(buildAttendanceProjection({ timetable, calendar: null }).reason).toBe("no-calendar");
    expect(buildAttendanceProjection({ timetable, calendar: { calendar: {}, events: [] } }).reason).toBe("no-calendar");
    // window already past
    expect(buildAttendanceProjection({ timetable, calendar, todayIso: "2026-12-01" }).reason).toBe("past-window");
    // events present but no ISA2/ESA and no calendar end → no cap
    const noCap = { calendar: { name: "x" }, events: [{ name: "FAM 1", start: "2026-11-18", end: "2026-11-18", isHoliday: false }] };
    expect(buildAttendanceProjection({ timetable, calendar: noCap, todayIso: "2026-11-16" }).reason).toBe("no-cap");
  });
});
