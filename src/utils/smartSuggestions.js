import { GradeMap } from "../constants/presets";
import { getGradePoint, getSubjectMetrics } from "./calculations";

export const getSmartSuggestions = (subjects, marks, targetSgpa) => {
  const totalCredits = subjects.reduce((acc, s) => acc + s.credits, 0);
  const targetTotalGP = totalCredits * (parseFloat(targetSgpa) || 0);

  // 1. Build Current State
  const subState = subjects.map((s) => {
    const m = marks[s.id] || {};
    const {
      momentumScore,
      totalWeight,
      esaWeight,
      projectedCieRounded,
      projectedLabRounded,
      momentumEsaMarks,
    } = getSubjectMetrics(s, marks);

    const isFinal =
      m.esa !== undefined && m.esa !== "" && !isNaN(parseFloat(m.esa));

    return {
      ...s,
      currentScore: momentumScore,
      currentGP: getGradePoint(momentumScore, s, GradeMap),
      cieRounded: projectedCieRounded,
      labRounded: projectedLabRounded,
      currentEsaMarks: momentumEsaMarks,
      totalWeight,
      esaWeight,
      esaMax: m.esaMax || 100,
      isFinal,
    };
  });

  const currentTotalGP = subState.reduce(
    (acc, s) => acc + s.currentGP * s.credits,
    0,
  );
  let deficit = targetTotalGP - currentTotalGP;

  const plan = [];
  let impossible = false;
  let iterations = 0;

  // Clone state for simulation
  const simState = JSON.parse(JSON.stringify(subState));

  while (deficit > 0.01 && iterations < 50) {
    iterations++;
    const candidates = [];

    simState.forEach((sub, idx) => {
      if (sub.isFinal || sub.currentGP >= 10) return;

      const activeMap = sub.customGradeMap || GradeMap;
      const nextGrade = activeMap
        .slice()
        .reverse()
        .find((g) => g.gp > sub.currentGP);

      if (nextGrade) {
        // Calculate target rounded ESA sum
        const targetSum =
          sub.totalWeight > 0
            ? Math.ceil(((nextGrade.min - 1 + 0.000001) * sub.totalWeight) / 100)
            : 0;
        const targetEsaRounded = targetSum - (sub.cieRounded + sub.labRounded);
        let esaNeeded = 0;
        if (targetEsaRounded > 0) {
          esaNeeded = Math.ceil(
            ((targetEsaRounded - 1 + 0.000001) * sub.esaMax) / 50,
          );
        }

        // 4. Check Feasibility
        if (esaNeeded <= sub.esaMax) {
          const gpGain = (nextGrade.gp - sub.currentGP) * sub.credits;

          // Cost is the ADDITIONAL marks needed on top of what we are already simulating
          const cost = Math.max(0, esaNeeded - sub.currentEsaMarks);

          candidates.push({
            idx,
            name: sub.name,
            fromGrade: activeMap.find((g) => g.gp === sub.currentGP)?.grade || "F",
            toGrade: nextGrade.grade,
            esaNeeded,
            esaMax: sub.esaMax,
            gpGain,
            cost,
            credits: sub.credits,
            efficiency: cost <= 0 ? Infinity : gpGain / cost,
          });
        }
      }
    });

    if (candidates.length === 0) {
      impossible = true;
      break;
    }

    // Sort by efficiency (GP per Mark)
    candidates.sort((a, b) => {
      if (b.efficiency !== a.efficiency) {
        if (b.efficiency === Infinity) return 1;
        if (a.efficiency === Infinity) return -1;
        return b.efficiency - a.efficiency;
      }
      return a.esaNeeded - b.esaNeeded;
    });

    const best = candidates[0];
    plan.push(best);

    // Update Simulation State
    const targetSub = simState[best.idx];
    const activeMap = targetSub.customGradeMap || GradeMap;
    const newGradeInfo = activeMap.find((g) => g.grade === best.toGrade);
    targetSub.currentGP = newGradeInfo.gp;
    targetSub.currentScore = newGradeInfo.min;
    targetSub.currentEsaMarks = best.esaNeeded;

    deficit -= best.gpGain;
  }

  // --- Consolidate steps for the same subject ---
  const consolidatedPlan = [];
  const subjectMap = new Map();

  plan.forEach((step) => {
    if (subjectMap.has(step.idx)) {
      const existing = subjectMap.get(step.idx);
      existing.toGrade = step.toGrade;
      existing.esaNeeded = step.esaNeeded;
      existing.gpGain += step.gpGain;
    } else {
      consolidatedPlan.push(step);
      subjectMap.set(step.idx, step);
    }
  });

  return { plan: consolidatedPlan, impossible, deficit };
};
