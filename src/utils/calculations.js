import { GradeMap } from "../constants/presets";

// --- Pure Mathematical/Calculation Helpers ---

export const getSubjectMetrics = (subject, marks) => {
  const m = marks[subject.id];
  if (!m)
    return {
      finalScore: 0,
      unroundedScore: 0,
      rawScore: 0,
      currentInternals: 0,
      totalWeight: 100,
      momentumScore: 0,
      momentumIsa2Marks: null,
      hasIsa1: false,
      hasIsa2: false,
    };

  const calcComponent = (score, max, weight) => {
    const s = parseFloat(score);
    const mx = parseFloat(max);
    if (isNaN(s) || isNaN(mx) || mx === 0) return 0;
    return (s / mx) * weight;
  };

  // Check which scores are available
  const hasIsa1 =
    m.isa1 !== "" && m.isa1 !== undefined && !isNaN(parseFloat(m.isa1));
  const hasIsa2 =
    m.isa2 !== "" && m.isa2 !== undefined && !isNaN(parseFloat(m.isa2));
  const hasAssignment =
    m.assignment !== "" &&
    m.assignment !== undefined &&
    !isNaN(parseFloat(m.assignment));
  const hasLab =
    m.lab !== "" && m.lab !== undefined && !isNaN(parseFloat(m.lab));
  const hasEsa =
    m.esa !== "" && m.esa !== undefined && !isNaN(parseFloat(m.esa));

  // Weights - Dynamic Calculation
  const isa1Weight =
    subject.customConfig?.weights?.isa1 ??
    (subject.hasIsa1 !== false ? subject.isaWeight : 0);
  const isa2Weight =
    subject.customConfig?.weights?.isa2 ??
    (subject.hasIsa2 !== false ? subject.isaWeight : 0);
  const assignmentWeight =
    subject.customConfig?.weights?.assignment ??
    (subject.hasAssignment ? subject.assignmentWeight : 0);
  const labWeight =
    subject.customConfig?.weights?.lab ??
    (subject.hasLab ? subject.labWeight : 0);
  const esaWeight = subject.esaWeight;

  let cieWeight = isa1Weight + isa2Weight + assignmentWeight;
  let totalWeight = cieWeight + labWeight + esaWeight;

  // 1. Calculate actual raw components
  let cieRaw =
    calcComponent(m.isa1, m.isa1Max || subject.isa1Max || 40, isa1Weight) +
    calcComponent(m.isa2, m.isa2Max || subject.isa2Max || 40, isa2Weight);
  if (subject.hasAssignment) {
    cieRaw += calcComponent(
      m.assignment,
      m.assignmentMax || subject.assignmentMax || 10,
      assignmentWeight,
    );
  }

  let labRaw = subject.hasLab
    ? calcComponent(m.lab, m.labMax || subject.labMax || 20, labWeight)
    : 0;
  let esaRaw = calcComponent(
    m.esa,
    m.esaMax || subject.esaMax || 100,
    esaWeight,
  );

  // Scaling to standard components: CIE to 50, Lab to standalone (e.g. 20), ESA to 50
  let cieScaled = cieWeight > 0 ? (cieRaw / cieWeight) * 50 : 0;
  let cieRounded = Math.ceil(cieScaled);

  let labScaled = labRaw; // Standalone, stays out of its labWeight (typically 20)
  let labRounded = Math.ceil(labScaled);

  let esaScaled = esaWeight > 0 ? (esaRaw / esaWeight) * 50 : 0;
  let esaRounded = Math.ceil(esaScaled);

  let sumRounded = cieRounded + labRounded + esaRounded;
  let sumUnrounded = cieScaled + labScaled + esaScaled;

  // Standard Final Score (based on actual entered marks only)
  let finalScore =
    totalWeight > 0 ? Math.ceil((sumRounded / totalWeight) * 100) : 0;
  let unroundedScore = totalWeight > 0 ? (sumUnrounded / totalWeight) * 100 : 0;
  let rawScore = sumUnrounded;

  // 5. Momentum Logic - Project unfilled components
  let momentumScore = 0;
  let momentumIsa2Marks = null;
  let projectedInternals = cieRaw + labRaw;

  const assignmentMaxRaw = parseFloat(
    m.assignmentMax || subject.assignmentMax || 10,
  );
  const labMaxRaw = parseFloat(m.labMax || subject.labMax || 20);
  const assignmentMax = !isNaN(assignmentMaxRaw) ? assignmentMaxRaw : 10;
  const labMax = !isNaN(labMaxRaw) ? labMaxRaw : 20;
  let momentumAssignmentMarks = null;
  let momentumLabMarks = null;

  let isaRatio = 0;
  let projectedCieRaw = cieRaw;
  let projectedLabRaw = labRaw;
  let overallInternalRatio = 0;

  if (hasIsa1 || hasIsa2 || hasAssignment || hasLab) {
    // Calculate ISA-only performance ratio (for projecting ISA2)
    let isaPerformance = 0;
    let isaWeightFilled = 0;

    if (hasIsa1) {
      isaPerformance += calcComponent(
        m.isa1,
        m.isa1Max || subject.isa1Max || 40,
        isa1Weight,
      );
      isaWeightFilled += isa1Weight;
    }
    if (hasIsa2) {
      isaPerformance += calcComponent(
        m.isa2,
        m.isa2Max || subject.isa2Max || 40,
        isa2Weight,
      );
      isaWeightFilled += isa2Weight;
    }

    isaRatio = isaWeightFilled > 0 ? isaPerformance / isaWeightFilled : 0;
    const isa2Max = parseFloat(m.isa2Max || subject.isa2Max || 40);
    if (
      !hasIsa2 &&
      hasIsa1 &&
      subject.hasIsa2 !== false &&
      !isNaN(isa2Max) &&
      isa2Max > 0 &&
      isa2Weight > 0
    ) {
      const projectedIsa2 = Math.min(isa2Max, Math.max(0, isaRatio * isa2Max));
      momentumIsa2Marks = Math.round(projectedIsa2 * 10) / 10;
      projectedCieRaw += (projectedIsa2 / isa2Max) * isa2Weight;
    }

    if (subject.hasAssignment && !hasAssignment && assignmentMax > 0) {
      momentumAssignmentMarks = Math.round(assignmentMax * 10) / 10;
      projectedCieRaw += assignmentWeight;
    }

    if (subject.hasLab && !hasLab && labMax > 0) {
      momentumLabMarks = Math.round(labMax * 10) / 10;
      projectedLabRaw += labWeight;
    }

    // Calculate overall internal performance ratio (for projecting assignment/lab/ESA)
    let filledInternalScore = 0;
    let filledInternalWeight = 0;

    if (hasIsa1) {
      filledInternalScore += calcComponent(
        m.isa1,
        m.isa1Max || subject.isa1Max || 40,
        isa1Weight,
      );
      filledInternalWeight += isa1Weight;
    }
    if (hasIsa2) {
      filledInternalScore += calcComponent(
        m.isa2,
        m.isa2Max || subject.isa2Max || 40,
        isa2Weight,
      );
      filledInternalWeight += isa2Weight;
    }
    if (subject.hasAssignment && hasAssignment) {
      filledInternalScore += calcComponent(
        m.assignment,
        m.assignmentMax || subject.assignmentMax || 10,
        assignmentWeight,
      );
      filledInternalWeight += assignmentWeight;
    }
    if (subject.hasLab && hasLab) {
      filledInternalScore += calcComponent(
        m.lab,
        m.labMax || subject.labMax || 20,
        labWeight,
      );
      filledInternalWeight += labWeight;
    }

    overallInternalRatio =
      filledInternalWeight > 0 ? filledInternalScore / filledInternalWeight : 0;

    // Project ESA based on overall internal performance
    let momentumESA = hasEsa ? esaRaw : esaWeight * overallInternalRatio;

    // Scaled and Rounded for Momentum
    let projectedCieScaled =
      cieWeight > 0 ? (projectedCieRaw / cieWeight) * 50 : 0;
    let projectedCieRounded = Math.ceil(projectedCieScaled);

    let projectedLabScaled = projectedLabRaw;
    let projectedLabRounded = Math.ceil(projectedLabScaled);

    let momentumEsaScaled = esaWeight > 0 ? (momentumESA / esaWeight) * 50 : 0;
    let momentumEsaRounded = Math.ceil(momentumEsaScaled);

    let momentumSumRounded =
      projectedCieRounded + projectedLabRounded + momentumEsaRounded;

    momentumScore =
      totalWeight > 0 ? Math.ceil((momentumSumRounded / totalWeight) * 100) : 0;

    projectedInternals = projectedCieRaw + projectedLabRaw;
  } else {
    momentumScore = finalScore;
  }

  return {
    finalScore: Math.min(100, Math.max(0, finalScore)),
    unroundedScore: Math.min(100, Math.max(0, unroundedScore)),
    rawScore: Math.max(0, rawScore),
    currentInternals: cieRaw + labRaw,
    totalWeight,
    momentumScore: Math.min(100, Math.max(0, momentumScore)),
    momentumIsa2Marks,
    momentumAssignmentMarks,
    momentumLabMarks,
    assignmentMax,
    labMax,
    projectedInternals,
    esaWeight,
    hasIsa1,
    hasIsa2,
    hasAssignment,
    hasLab,
    cieScaled,
    cieRounded,
    labScaled,
    labRounded,
    esaScaled,
    esaRounded,
    projectedCieScaled:
      hasIsa1 || hasIsa2 || hasAssignment || hasLab
        ? (projectedCieRaw / (cieWeight || 1)) * 50
        : 0,
    projectedCieRounded:
      hasIsa1 || hasIsa2 || hasAssignment || hasLab
        ? Math.ceil((projectedCieRaw / (cieWeight || 1)) * 50)
        : 0,
    projectedLabScaled:
      hasIsa1 || hasIsa2 || hasAssignment || hasLab ? projectedLabRaw : 0,
    projectedLabRounded:
      hasIsa1 || hasIsa2 || hasAssignment || hasLab
        ? Math.ceil(projectedLabRaw)
        : 0,
    momentumEsaScaled:
      hasIsa1 || hasIsa2 || hasAssignment || hasLab
        ? ((hasEsa ? esaRaw : esaWeight * overallInternalRatio) /
            (esaWeight || 1)) *
          50
        : 0,
    momentumEsaRounded:
      hasIsa1 || hasIsa2 || hasAssignment || hasLab
        ? Math.ceil(
            ((hasEsa ? esaRaw : esaWeight * overallInternalRatio) /
              (esaWeight || 1)) *
              50,
          )
        : 0,
    momentumEsaMarks: hasEsa
      ? parseFloat(m.esa)
      : parseFloat(m.esaMax || subject.esaMax || 100) *
        (overallInternalRatio || 0),
    momentumUnroundedScore:
      totalWeight > 0
        ? (((hasIsa1 || hasIsa2 || hasAssignment || hasLab
            ? (projectedCieRaw / (cieWeight || 1)) * 50
            : 0) +
            (hasIsa1 || hasIsa2 || hasAssignment || hasLab
              ? projectedLabRaw
              : 0) +
            (hasIsa1 || hasIsa2 || hasAssignment || hasLab
              ? ((hasEsa ? esaRaw : esaWeight * overallInternalRatio) /
                  (esaWeight || 1)) *
                50
              : 0)) /
            totalWeight) *
          100
        : 0,
  };
};

export const getFinalIsaSummary = (subject, marks) => {
  const m = marks[subject.id] || {};

  const calcComponent = (score, max, weight) => {
    const s = parseFloat(score);
    const mx = parseFloat(max);
    const w = parseFloat(weight);
    if (isNaN(s) || isNaN(mx) || isNaN(w) || mx === 0) return 0;
    return (s / mx) * w;
  };

  const hasIsa1 = subject.hasIsa1 !== false;
  const hasIsa2 = subject.hasIsa2 !== false;

  const isa1Weight = hasIsa1
    ? (subject.customConfig?.weights?.isa1 ?? subject.isaWeight ?? 0)
    : 0;
  const isa2Weight = hasIsa2
    ? (subject.customConfig?.weights?.isa2 ?? subject.isaWeight ?? 0)
    : 0;
  const assignmentWeight =
    subject.customConfig?.weights?.assignment ?? subject.assignmentWeight ?? 0;
  const hasAssignment = subject.hasAssignment || assignmentWeight > 0;

  const isa1 = hasIsa1
    ? calcComponent(m.isa1, m.isa1Max ?? subject.isa1Max ?? 40, isa1Weight)
    : 0;
  const isa2 = hasIsa2
    ? calcComponent(m.isa2, m.isa2Max ?? subject.isa2Max ?? 40, isa2Weight)
    : 0;
  const assignment = hasAssignment
    ? calcComponent(
        m.assignment,
        m.assignmentMax ?? subject.assignmentMax ?? 10,
        assignmentWeight,
      )
    : 0;

  const totalWeight =
    isa1Weight + isa2Weight + (hasAssignment ? assignmentWeight : 0);
  const scale = totalWeight > 0 ? 50 / totalWeight : 0;

  return {
    isa1: isa1 * scale,
    isa2: isa2 * scale,
    assignment: assignment * scale,
    total: (isa1 + isa2 + assignment) * scale,
    max: totalWeight > 0 ? 50 : 0,
  };
};

export const getGradePoint = (
  totalMarks,
  subject = null,
  fallbackGradeMap = GradeMap,
) => {
  const map =
    subject && subject.customGradeMap
      ? subject.customGradeMap
      : fallbackGradeMap;
  for (let g of map) {
    if (totalMarks >= g.min) return g.gp;
  }
  return 0;
};

export const getGradeInfo = (
  score,
  subject = null,
  fallbackGradeMap = GradeMap,
) => {
  const map =
    subject && subject.customGradeMap
      ? subject.customGradeMap
      : fallbackGradeMap;
  return map.find((g) => score >= g.min) || map[map.length - 1];
};

export const getRequiredESAForGrade = (
  subject,
  targetScore,
  withSafetyMargin = true,
  options = {},
  marks,
) => {
  const {
    cieRounded,
    labRounded,
    projectedCieRounded,
    projectedLabRounded,
    hasIsa2,
    momentumIsa2Marks,
    totalWeight,
  } = getSubjectMetrics(subject, marks);

  let effectiveCieRounded = cieRounded;
  let effectiveLabRounded = labRounded;

  const useMomentumInternals = options.useMomentumInternals === true;
  if (useMomentumInternals) {
    effectiveCieRounded = projectedCieRounded;
    effectiveLabRounded = projectedLabRounded;
  } else if (
    options.useMomentumIsa2 &&
    !hasIsa2 &&
    momentumIsa2Marks !== null &&
    subject.hasIsa2 !== false
  ) {
    const m = marks[subject.id] || {};
    const isa2Max = parseFloat(m.isa2Max || subject.isa2Max || 40);
    if (!isNaN(isa2Max) && isa2Max > 0) {
      const isa1Weight =
        subject.customConfig?.weights?.isa1 ??
        (subject.hasIsa1 !== false ? subject.isaWeight : 0);
      const isa2Weight =
        subject.customConfig?.weights?.isa2 ??
        (subject.hasIsa2 !== false ? subject.isaWeight : 0);
      const assignmentWeight =
        subject.customConfig?.weights?.assignment ??
        (subject.hasAssignment ? subject.assignmentWeight : 0);
      let cieWeight = isa1Weight + isa2Weight + assignmentWeight;

      const isa1Val = parseFloat(m.isa1);
      const isa1Max = parseFloat(m.isa1Max || subject.isa1Max || 40);
      const isa1Component =
        !isNaN(isa1Val) && isa1Max > 0 ? (isa1Val / isa1Max) * isa1Weight : 0;

      const assignVal = parseFloat(m.assignment);
      const assignMax = parseFloat(
        m.assignmentMax || subject.assignmentMax || 10,
      );
      const assignComponent =
        subject.hasAssignment && !isNaN(assignVal) && assignMax > 0
          ? (assignVal / assignMax) * assignmentWeight
          : 0;

      let cieRaw =
        isa1Component +
        (momentumIsa2Marks / isa2Max) * isa2Weight +
        assignComponent;
      let cieScaled = cieWeight > 0 ? (cieRaw / cieWeight) * 50 : 0;
      effectiveCieRounded = Math.ceil(cieScaled);
    }
  }

  const esaMax = marks[subject.id]?.esaMax || 100;
  const internalsRoundedSum = effectiveCieRounded + effectiveLabRounded;

  // Check if achievable
  const maxPossibleRoundedSum = internalsRoundedSum + 50;
  const maxPossibleScore =
    totalWeight > 0
      ? Math.ceil((maxPossibleRoundedSum / totalWeight) * 100)
      : 0;

  if (maxPossibleScore < targetScore) {
    return { safe: null, minimum: null };
  }

  const targetEsaRounded =
    totalWeight > 0
      ? Math.ceil(((targetScore - 1 + 0.000001) * totalWeight) / 100) -
        internalsRoundedSum
      : 0;

  if (withSafetyMargin) {
    const targetEsaSafe =
      totalWeight > 0
        ? Math.ceil((targetScore * totalWeight) / 100) - internalsRoundedSum
        : 0;

    let safeEsa = 0;
    if (targetEsaSafe > 0) {
      safeEsa = Math.ceil((targetEsaSafe / 50) * esaMax);
    }

    let minEsaMarks = 0;
    if (targetEsaRounded > 0) {
      minEsaMarks = Math.ceil(
        ((targetEsaRounded - 1 + 0.000001) * esaMax) / 50,
      );
    }

    // Cap at esaMax - if safe > esaMax but minimum <= esaMax, show minimum as safe
    if (safeEsa > esaMax) {
      if (minEsaMarks <= esaMax) {
        return {
          safe: esaMax,
          minimum: Math.max(0, minEsaMarks),
          requiresRounding: true,
        };
      }
      return { safe: null, minimum: null };
    }

    return {
      safe: Math.min(esaMax, safeEsa),
      minimum: Math.max(0, Math.min(esaMax, minEsaMarks)),
    };
  } else {
    if (targetEsaRounded <= 0) return 0;
    const minRequiredEsaMarks = Math.ceil(
      ((targetEsaRounded - 1 + 0.000001) * esaMax) / 50,
    );
    if (minRequiredEsaMarks > esaMax) return null;
    return minRequiredEsaMarks;
  }
};

export const getRequiredISA2ForGrade = (
  subject,
  targetScore,
  options = {},
  marks,
) => {
  if (subject.hasIsa2 === false) return null;
  const { assumeFullForEmptyInternals = false } = options;

  const m = marks[subject.id] || {};
  const parsedTarget = parseFloat(targetScore);
  if (isNaN(parsedTarget)) return null;

  const hasIsa2 =
    m.isa2 !== "" && m.isa2 !== undefined && !isNaN(parseFloat(m.isa2));
  if (hasIsa2) return null;

  const isa2MaxRaw = parseFloat(m.isa2Max || subject.isa2Max || 40);
  const isa2Max = !isNaN(isa2MaxRaw) ? isa2MaxRaw : 40;

  const isa1Weight =
    subject.customConfig?.weights?.isa1 ??
    (subject.hasIsa1 !== false ? subject.isaWeight : 0);
  const isa2Weight =
    subject.customConfig?.weights?.isa2 ??
    (subject.hasIsa2 !== false ? subject.isaWeight : 0);
  const assignmentWeight =
    subject.customConfig?.weights?.assignment ??
    (subject.hasAssignment ? subject.assignmentWeight : 0);
  const labWeight =
    subject.customConfig?.weights?.lab ??
    (subject.hasLab ? subject.labWeight : 0);
  const esaWeight = subject.esaWeight || 0;

  if (isa2Weight <= 0 || isa2Max <= 0) return null;

  const hasIsa1 =
    m.isa1 !== "" && m.isa1 !== undefined && !isNaN(parseFloat(m.isa1));
  const hasAssignment =
    m.assignment !== "" &&
    m.assignment !== undefined &&
    !isNaN(parseFloat(m.assignment));
  const hasLab =
    m.lab !== "" && m.lab !== undefined && !isNaN(parseFloat(m.lab));
  const hasEsa =
    m.esa !== "" && m.esa !== undefined && !isNaN(parseFloat(m.esa));

  const totalWeight =
    isa1Weight + isa2Weight + assignmentWeight + labWeight + esaWeight;

  // CIE components
  const isa1Val = parseFloat(m.isa1);
  const isa1Max = parseFloat(m.isa1Max || subject.isa1Max || 40);
  const isa1Component =
    hasIsa1 && isa1Max > 0 ? (isa1Val / isa1Max) * isa1Weight : 0;

  const assignVal = parseFloat(m.assignment);
  const assignMax = parseFloat(m.assignmentMax || subject.assignmentMax || 10);
  let assignComponent = 0;
  if (subject.hasAssignment) {
    assignComponent =
      hasAssignment && assignMax > 0
        ? (assignVal / assignMax) * assignmentWeight
        : assumeFullForEmptyInternals
          ? assignmentWeight
          : 0;
  }

  let labComponent = 0;
  const labVal = parseFloat(m.lab);
  const labMax = parseFloat(m.labMax || subject.labMax || 20);
  if (subject.hasLab) {
    labComponent =
      hasLab && labMax > 0
        ? (labVal / labMax) * labWeight
        : assumeFullForEmptyInternals
          ? labWeight
          : 0;
  }
  const labRounded = Math.ceil(labComponent);

  const esaVal = parseFloat(m.esa);
  const esaMax = parseFloat(m.esaMax || subject.esaMax || 100);
  const esaComponent = hasEsa && esaMax > 0 ? (esaVal / esaMax) * esaWeight : 0;
  const esaScaled = esaWeight > 0 ? (esaComponent / esaWeight) * 50 : 0;
  const esaRounded = Math.ceil(esaScaled);

  // Target total rounded sum out of totalWeight
  const targetCieRounded =
    totalWeight > 0
      ? Math.ceil(((parsedTarget - 1 + 0.000001) * totalWeight) / 100) -
        labRounded -
        esaRounded
      : 0;

  if (targetCieRounded <= 0) return { needed: 0, max: isa2Max };

  const cieWeight = isa1Weight + isa2Weight + assignmentWeight;
  const requiredCieRaw = ((targetCieRounded - 1 + 0.000001) * cieWeight) / 50;
  const requiredIsa2Component =
    requiredCieRaw - isa1Component - assignComponent;

  if (requiredIsa2Component <= 0) return { needed: 0, max: isa2Max };

  const requiredIsa2Marks = Math.ceil(
    (requiredIsa2Component / isa2Weight) * isa2Max,
  );
  if (requiredIsa2Marks > isa2Max) return { needed: null, max: isa2Max };

  return { needed: Math.max(0, requiredIsa2Marks), max: isa2Max };
};

export const getRequiredISA2ForPass = (subject, marks) => {
  return getRequiredISA2ForGrade(
    subject,
    40,
    { assumeFullForEmptyInternals: true },
    marks,
  );
};
