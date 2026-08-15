const ATTENDANCE_MIN_PERCENT = 75;

export const parseNonNegativeInt = (value) => {
  const n = parseInt(value, 10);
  if (isNaN(n) || n < 0) return null;
  return n;
};

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const parseTargetPercent = (value, fallback = 80) => {
  const n = parseFloat(value);
  if (!Number.isFinite(n)) return fallback;
  return clamp(n, ATTENDANCE_MIN_PERCENT, 99);
};

export const consecutiveClassesNeeded = (total, attended, targetPercent) => {
  const ratio = targetPercent / 100;
  if (ratio >= 1) return 0;
  const raw = (ratio * total - attended) / (1 - ratio);
  return Math.max(0, Math.ceil(raw));
};

export const safeMissesWithinRemaining = (
  total,
  attended,
  remaining,
  targetPercent,
) => {
  if (remaining <= 0) return 0;
  const ratio = targetPercent / 100;
  const raw = Math.floor(attended + remaining - ratio * (total + remaining));
  return Math.max(0, Math.min(remaining, raw));
};

export const buildAttendancePlan = (
  total,
  attended,
  remaining,
  bufferPercent,
) => {
  if (remaining < 0) return null;
  const finalTotal = total + remaining;
  const bestFinalPercentage =
    finalTotal > 0 ? ((attended + remaining) / finalTotal) * 100 : 0;
  const worstFinalPercentage =
    finalTotal > 0 ? (attended / finalTotal) * 100 : 0;

  const safeMisses75 = safeMissesWithinRemaining(
    total,
    attended,
    remaining,
    ATTENDANCE_MIN_PERCENT,
  );
  const mustAttendFor75 = Math.max(0, remaining - safeMisses75);
  const safeMissesBuffer = safeMissesWithinRemaining(
    total,
    attended,
    remaining,
    bufferPercent,
  );
  const mustAttendForBuffer = Math.max(0, remaining - safeMissesBuffer);

  return {
    remaining,
    bestFinalPercentage,
    worstFinalPercentage,
    safeMisses75,
    mustAttendFor75,
    safeMissesBuffer,
    mustAttendForBuffer,
  };
};

export const buildCurrentAttendanceStats = (totalInput, attendedInput) => {
  const total = parseNonNegativeInt(totalInput);
  const attended = parseNonNegativeInt(attendedInput);
  if (total === null || attended === null || total === 0) {
    return { ready: false };
  }
  if (attended > total) {
    return { ready: false, invalid: true };
  }

  const currentPercentage = (attended / total) * 100;
  const maxConsecutiveSkipsNow = Math.max(
    0,
    Math.floor(attended / (ATTENDANCE_MIN_PERCENT / 100) - total),
  );
  const classesToAttendNow = consecutiveClassesNeeded(
    total,
    attended,
    ATTENDANCE_MIN_PERCENT,
  );

  return {
    ready: true,
    total,
    attended,
    currentPercentage,
    maxConsecutiveSkipsNow,
    classesToAttendNow,
    isAboveMinimum: currentPercentage >= ATTENDANCE_MIN_PERCENT,
  };
};
