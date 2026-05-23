import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import {
  Trash2, Plus, Settings, ChevronDown, ChevronUp,
  RotateCcw, GraduationCap, Target, Dice5, Scale,
  Eraser, TrendingUp, Activity, Calculator,
  Lightbulb, ArrowRight, CheckCircle2, AlertCircle,
  Download, Upload, Lock, Unlock, AlertTriangle,
  BookOpen, Award, Zap, BarChart3, Moon, Sun,
  Undo2, Redo2, HelpCircle, Info, X, Heart
} from 'lucide-react';

// --- Default Data for Reset ---
const ChemistryCycleDefaults = [
  { id: 1, name: "Mathematics - I/II", credits: 4, hasLab: false, hasAssignment: true, isaWeight: 20, assignmentWeight: 10, labWeight: 0, esaWeight: 50, isa1Max: 40, isa2Max: 40, esaMax: 100 },
  { id: 2, name: "Engineering Chemistry", credits: 5, hasLab: true, hasAssignment: true, isaWeight: 20, assignmentWeight: 10, labWeight: 20, esaWeight: 50, isa1Max: 40, isa2Max: 40, esaMax: 100 },
  { id: 3, name: "Python for Computational Problem Solving/Problem Solving with C", credits: 5, hasLab: true, hasAssignment: true, isaWeight: 20, assignmentWeight: 10, labWeight: 20, esaWeight: 50, isa1Max: 40, isa2Max: 40, esaMax: 100 },
  { id: 4, name: "Engineering Mechanics", credits: 4, hasLab: false, hasAssignment: true, isaWeight: 20, assignmentWeight: 10, labWeight: 0, esaWeight: 50, isa1Max: 40, isa2Max: 40, esaMax: 100 },
  { id: 5, name: "Electronic Principles", credits: 4, hasLab: false, hasAssignment: true, isaWeight: 20, assignmentWeight: 10, labWeight: 0, esaWeight: 50, isa1Max: 40, isa2Max: 40, esaMax: 100 },
  { id: 6, name: "Constitution of India", credits: 2, hasLab: false, hasAssignment: false, isaWeight: 25, assignmentWeight: 0, labWeight: 0, esaWeight: 50, isa1Max: 30, isa2Max: 30, esaMax: 50 },
];

const PhysicsCycleDefaults = [
  { id: 1, name: "Mathematics - I/II", credits: 4, hasLab: false, hasAssignment: true, isaWeight: 20, assignmentWeight: 10, labWeight: 0, esaWeight: 50, isa1Max: 40, isa2Max: 40, esaMax: 100 },
  { id: 2, name: "Engineering Physics", credits: 5, hasLab: true, hasAssignment: true, isaWeight: 20, assignmentWeight: 10, labWeight: 20, esaWeight: 50, isa1Max: 40, isa2Max: 40, esaMax: 100 },
  { id: 3, name: "Elements of Electrical Engineering", credits: 4, hasLab: false, hasAssignment: true, isaWeight: 20, assignmentWeight: 10, labWeight: 0, esaWeight: 50, isa1Max: 40, isa2Max: 40, esaMax: 100 },
  { id: 4, name: "Mechanical Engineering Sciences", credits: 4, hasLab: false, hasAssignment: true, isaWeight: 20, assignmentWeight: 10, labWeight: 0, esaWeight: 50, isa1Max: 40, isa2Max: 40, esaMax: 100 },
  { id: 5, name: "Python for Computational Problem Solving/Problem Solving with C", credits: 5, hasLab: true, hasAssignment: true, isaWeight: 20, assignmentWeight: 10, labWeight: 20, esaWeight: 50, isa1Max: 40, isa2Max: 40, esaMax: 100 },
  { id: 6, name: "Environmental Studies", credits: 2, hasLab: false, hasAssignment: false, isaWeight: 25, assignmentWeight: 0, labWeight: 0, esaWeight: 50, isa1Max: 30, isa2Max: 30, esaMax: 50 },
];

const GenericCycleDefaults = [
  { id: 1, name: "Subject 1", credits: 4, hasLab: false, hasAssignment: true, isaWeight: 20, assignmentWeight: 10, labWeight: 0, esaWeight: 50, isa1Max: 40, isa2Max: 40, esaMax: 100 },
  { id: 2, name: "Subject 2", credits: 5, hasLab: true, hasAssignment: true, isaWeight: 20, assignmentWeight: 10, labWeight: 20, esaWeight: 50, isa1Max: 40, isa2Max: 40, esaMax: 100 },
  { id: 3, name: "Subject 3", credits: 4, hasLab: false, hasAssignment: true, isaWeight: 20, assignmentWeight: 10, labWeight: 0, esaWeight: 50, isa1Max: 40, isa2Max: 40, esaMax: 100 },
  { id: 4, name: "Subject 4", credits: 4, hasLab: false, hasAssignment: true, isaWeight: 20, assignmentWeight: 10, labWeight: 0, esaWeight: 50, isa1Max: 40, isa2Max: 40, esaMax: 100 },
  { id: 5, name: "Subject 5", credits: 5, hasLab: true, hasAssignment: true, isaWeight: 20, assignmentWeight: 10, labWeight: 20, esaWeight: 50, isa1Max: 40, isa2Max: 40, esaMax: 100 },
  { id: 6, name: "Subject 6", credits: 2, hasLab: false, hasAssignment: false, isaWeight: 25, assignmentWeight: 0, labWeight: 0, esaWeight: 50, isa1Max: 30, isa2Max: 30, esaMax: 50 },
];

const SemesterPresets = {
  "Chemistry Cycle": ChemistryCycleDefaults,
  "Physics Cycle": PhysicsCycleDefaults,
  "Generic Cycle (Editable)": GenericCycleDefaults,
};

const GradeMap = [
  { grade: 'S', min: 90, gp: 10, color: 'text-green-500', bg: 'bg-green-500' },
  { grade: 'A', min: 80, gp: 9, color: 'text-blue-500', bg: 'bg-blue-500' },
  { grade: 'B', min: 70, gp: 8, color: 'text-indigo-500', bg: 'bg-indigo-500' },
  { grade: 'C', min: 60, gp: 7, color: 'text-yellow-500', bg: 'bg-yellow-500' },
  { grade: 'D', min: 50, gp: 6, color: 'text-orange-500', bg: 'bg-orange-500' },
  { grade: 'E', min: 40, gp: 5, color: 'text-red-400', bg: 'bg-red-400' },
  { grade: 'F', min: 0, gp: 0, color: 'text-red-600', bg: 'bg-red-600' },
];

// Common grading schemes from different universities
const GradingSchemes = {
  "PES (Default)": [
    { grade: 'S', min: 90, gp: 10 },
    { grade: 'A', min: 80, gp: 9 },
    { grade: 'B', min: 70, gp: 8 },
    { grade: 'C', min: 60, gp: 7 },
    { grade: 'D', min: 50, gp: 6 },
    { grade: 'E', min: 40, gp: 5 },
    { grade: 'F', min: 0, gp: 0 },
  ],
  "10-Point (VTU Style)": [
    { grade: 'O', min: 90, gp: 10 },
    { grade: 'A+', min: 80, gp: 9 },
    { grade: 'A', min: 70, gp: 8 },
    { grade: 'B+', min: 60, gp: 7 },
    { grade: 'B', min: 55, gp: 6 },
    { grade: 'C', min: 50, gp: 5 },
    { grade: 'P', min: 40, gp: 4 },
    { grade: 'F', min: 0, gp: 0 },
  ],
  "10-Point (IIT Style)": [
    { grade: 'AA', min: 90, gp: 10 },
    { grade: 'AB', min: 80, gp: 9 },
    { grade: 'BB', min: 70, gp: 8 },
    { grade: 'BC', min: 60, gp: 7 },
    { grade: 'CC', min: 50, gp: 6 },
    { grade: 'CD', min: 45, gp: 5 },
    { grade: 'DD', min: 40, gp: 4 },
    { grade: 'FF', min: 0, gp: 0 },
  ],
  "4-Point (US Style)": [
    { grade: 'A', min: 90, gp: 4.0 },
    { grade: 'A-', min: 85, gp: 3.7 },
    { grade: 'B+', min: 80, gp: 3.3 },
    { grade: 'B', min: 75, gp: 3.0 },
    { grade: 'B-', min: 70, gp: 2.7 },
    { grade: 'C+', min: 65, gp: 2.3 },
    { grade: 'C', min: 60, gp: 2.0 },
    { grade: 'C-', min: 55, gp: 1.7 },
    { grade: 'D', min: 50, gp: 1.0 },
    { grade: 'F', min: 0, gp: 0 },
  ],
  "Custom": []
};

export default function PES_Universal_Calculator() {
  // --- Theme State ---
  const darkMode = true;

  const [subjects, setSubjects] = useState(() => {
    // --- THE RESET LOGIC ---
    const CURRENT_VERSION = '2026_MAY_V4.5'; // Change this string whenever you want to nuke again
    const savedVersion = localStorage.getItem('pes_version');

    if (savedVersion !== CURRENT_VERSION) {
      console.log('New version detected. Wiping old data...');

      // Option A: Wipe SPECIFIC data (Safest)
      localStorage.removeItem('pes_subjects');
      localStorage.removeItem('pes_marks');
      localStorage.removeItem('pes_cgpa_details');

      // Option B: Wipe EVERYTHING (Themes, other apps on same domain)
      // localStorage.clear(); 

      // Save the new version so this doesn't happen on next reload
      localStorage.setItem('pes_version', CURRENT_VERSION);

      return PhysicsCycleDefaults;
    }
    // --- END RESET LOGIC ---

    const saved = localStorage.getItem('pes_subjects');
    return saved ? JSON.parse(saved) : PhysicsCycleDefaults;
  });

  const [marks, setMarks] = useState(() => {
    const saved = localStorage.getItem('pes_marks');
    return saved ? JSON.parse(saved) : {};
  });

  const [prevCgpaDetails, setPrevCgpaDetails] = useState(() => {
    const saved = localStorage.getItem('pes_cgpa_details');
    return saved ? JSON.parse(saved) : { sgpa: '', credits: '' };
  });

  // --- CGPA Tab State (With Persistence) ---
  const [semesterData, setSemesterData] = useState(() => {
    // 1. Try to load from local storage
    const saved = localStorage.getItem('pes_cgpa_semesters');
    if (saved) {
      return JSON.parse(saved);
    }
    // 2. Fallback to empty default
    return Array(8).fill(null).map((_, i) => ({ id: i + 1, sgpa: '', credits: '' }));
  });

  // --- Persistence Effect for CGPA ---
  useEffect(() => {
    localStorage.setItem('pes_cgpa_semesters', JSON.stringify(semesterData));
  }, [semesterData]);

  const updateSemester = (id, field, value) => {
    setSemesterData(prev => prev.map(sem =>
      sem.id === id ? { ...sem, [field]: value } : sem
    ));
  };

  const resetCGPA = () => {
    if (window.confirm("Clear all semester data?")) {
      setSemesterData(Array(8).fill(null).map((_, i) => ({ id: i + 1, sgpa: '', credits: '' })));
    }
  };

  // State for Quick CGPA
  const [simpleCgpa, setSimpleCgpa] = useState({ prevCgpa: '', prevCredits: '', currSgpa: '', currCredits: '' });

  // --- UI State ---
  const [sgpa, setSgpa] = useState(0);
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [targetSgpa, setTargetSgpa] = useState(9.0);
  const [activeTab, setActiveTab] = useState('subjects');
  const [reverseTargetSgpa, setReverseTargetSgpa] = useState(8.5);
  const [reverseEsaMode, setReverseEsaMode] = useState('safe');
  const [lockedSubjects, setLockedSubjects] = useState({});
  const [showHelp, setShowHelp] = useState(false);
  const [showToffeeModal, setShowToffeeModal] = useState(false);
  const ATTENDANCE_MIN_PERCENT = 75;
  // --- Attendance (Mode 1 is the source for all planners) ---
  const [attendanceStatusMode, setAttendanceStatusMode] = useState(() => {
    const saved = localStorage.getItem('pes_attendance_mode_status');
    return saved ? JSON.parse(saved) : { total: '', attended: '', bufferPercent: '80' };
  });
  const [attendanceClassesLeftMode, setAttendanceClassesLeftMode] = useState(() => {
    const saved = localStorage.getItem('pes_attendance_mode_classes_left');
    return saved ? JSON.parse(saved) : { classesLeft: '' };
  });
  const [attendanceSemesterMode, setAttendanceSemesterMode] = useState(() => {
    const saved = localStorage.getItem('pes_attendance_mode_semester');
    return saved ? JSON.parse(saved) : { semesterTotal: '' };
  });
  const [attendanceWeeklyMode, setAttendanceWeeklyMode] = useState(() => {
    const saved = localStorage.getItem('pes_attendance_mode_weekly');
    return saved ? JSON.parse(saved) : {
      weeksLeft: '',
      minPerWeek: '',
      maxPerWeek: ''
    };
  });
  const [attendanceMissPlannerMode, setAttendanceMissPlannerMode] = useState(() => {
    const saved = localStorage.getItem('pes_attendance_mode_miss_planner');
    return saved ? JSON.parse(saved) : { misses: '' };
  });

  useEffect(() => {
    localStorage.setItem('pes_attendance_mode_status', JSON.stringify(attendanceStatusMode));
  }, [attendanceStatusMode]);

  useEffect(() => {
    localStorage.setItem('pes_attendance_mode_classes_left', JSON.stringify(attendanceClassesLeftMode));
  }, [attendanceClassesLeftMode]);

  useEffect(() => {
    localStorage.setItem('pes_attendance_mode_semester', JSON.stringify(attendanceSemesterMode));
  }, [attendanceSemesterMode]);

  useEffect(() => {
    localStorage.setItem('pes_attendance_mode_weekly', JSON.stringify(attendanceWeeklyMode));
  }, [attendanceWeeklyMode]);

  useEffect(() => {
    localStorage.setItem('pes_attendance_mode_miss_planner', JSON.stringify(attendanceMissPlannerMode));
  }, [attendanceMissPlannerMode]);

  const parseNonNegativeInt = (value) => {
    const n = parseInt(value, 10);
    if (isNaN(n) || n < 0) return null;
    return n;
  };

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const parseTargetPercent = (value, fallback = 80) => {
    const n = parseFloat(value);
    if (!Number.isFinite(n)) return fallback;
    return clamp(n, ATTENDANCE_MIN_PERCENT, 99);
  };

  const consecutiveClassesNeeded = (total, attended, targetPercent) => {
    const ratio = targetPercent / 100;
    if (ratio >= 1) return 0;
    const raw = (ratio * total - attended) / (1 - ratio);
    return Math.max(0, Math.ceil(raw));
  };

  const safeMissesWithinRemaining = (total, attended, remaining, targetPercent) => {
    if (remaining <= 0) return 0;
    const ratio = targetPercent / 100;
    const raw = Math.floor(attended + remaining - ratio * (total + remaining));
    return Math.max(0, Math.min(remaining, raw));
  };

  const buildAttendancePlan = (total, attended, remaining, bufferPercent) => {
    if (remaining < 0) return null;
    const finalTotal = total + remaining;
    const bestFinalPercentage = finalTotal > 0 ? ((attended + remaining) / finalTotal) * 100 : 0;
    const worstFinalPercentage = finalTotal > 0 ? (attended / finalTotal) * 100 : 0;

    const safeMisses75 = safeMissesWithinRemaining(total, attended, remaining, ATTENDANCE_MIN_PERCENT);
    const mustAttendFor75 = Math.max(0, remaining - safeMisses75);
    const safeMissesBuffer = safeMissesWithinRemaining(total, attended, remaining, bufferPercent);
    const mustAttendForBuffer = Math.max(0, remaining - safeMissesBuffer);

    return {
      remaining,
      bestFinalPercentage,
      worstFinalPercentage,
      safeMisses75,
      mustAttendFor75,
      safeMissesBuffer,
      mustAttendForBuffer
    };
  };

  const buildCurrentAttendanceStats = (totalInput, attendedInput) => {
    const total = parseNonNegativeInt(totalInput);
    const attended = parseNonNegativeInt(attendedInput);
    if (total === null || attended === null || total === 0) {
      return { ready: false };
    }
    if (attended > total) {
      return { ready: false, invalid: true };
    }

    const currentPercentage = (attended / total) * 100;
    const minRatio = ATTENDANCE_MIN_PERCENT / 100;
    const maxConsecutiveSkipsNow = Math.max(0, Math.floor((attended / minRatio) - total));
    const classesToAttendNow = consecutiveClassesNeeded(total, attended, ATTENDANCE_MIN_PERCENT);

    return {
      ready: true,
      total,
      attended,
      currentPercentage,
      maxConsecutiveSkipsNow,
      classesToAttendNow,
      isAboveMinimum: currentPercentage >= ATTENDANCE_MIN_PERCENT
    };
  };

  const statusStats = useMemo(() => (
    buildCurrentAttendanceStats(attendanceStatusMode.total, attendanceStatusMode.attended)
  ), [attendanceStatusMode]);

  const sharedBufferPercent = useMemo(() => (
    parseTargetPercent(attendanceStatusMode.bufferPercent, 80)
  ), [attendanceStatusMode.bufferPercent]);

  const targetStatusStats = useMemo(() => {
    if (!statusStats.ready) return null;
    const targetPercent = sharedBufferPercent;
    const targetRatio = targetPercent / 100;
    const maxConsecutiveSkipsForTarget = Math.max(0, Math.floor((statusStats.attended / targetRatio) - statusStats.total));
    const classesToAttendForTarget = consecutiveClassesNeeded(statusStats.total, statusStats.attended, targetPercent);

    return {
      targetPercent,
      maxConsecutiveSkipsForTarget,
      classesToAttendForTarget,
      isAboveTarget: statusStats.currentPercentage >= targetPercent
    };
  }, [statusStats, sharedBufferPercent]);

  const classesLeftPlan = useMemo(() => {
    if (!statusStats.ready) return null;
    const classesLeft = parseNonNegativeInt(attendanceClassesLeftMode.classesLeft);
    if (classesLeft === null) return null;
    return buildAttendancePlan(
      statusStats.total,
      statusStats.attended,
      classesLeft,
      sharedBufferPercent
    );
  }, [statusStats, attendanceClassesLeftMode.classesLeft, sharedBufferPercent]);

  const semesterPlan = useMemo(() => {
    const semesterTotal = parseNonNegativeInt(attendanceSemesterMode.semesterTotal);
    if (!statusStats.ready || semesterTotal === null) return null;
    if (semesterTotal < statusStats.total) {
      return { invalid: true, semesterTotal };
    }

    const classesLeft = semesterTotal - statusStats.total;
    const result = buildAttendancePlan(
      statusStats.total,
      statusStats.attended,
      classesLeft,
      sharedBufferPercent
    );
    const requiredAttendanceWhole = Math.ceil((ATTENDANCE_MIN_PERCENT / 100) * semesterTotal);
    const maxTotalMissesWhole75 = Math.max(0, semesterTotal - requiredAttendanceWhole);
    return result ? { ...result, semesterTotal, classesLeft, maxTotalMissesWhole75 } : null;
  }, [statusStats, attendanceSemesterMode.semesterTotal, sharedBufferPercent]);

  const weeklyPlan = useMemo(() => {
    if (!statusStats.ready) return null;
    const weeksLeft = parseNonNegativeInt(attendanceWeeklyMode.weeksLeft);
    let minPerWeek = parseNonNegativeInt(attendanceWeeklyMode.minPerWeek);
    let maxPerWeek = parseNonNegativeInt(attendanceWeeklyMode.maxPerWeek);

    if (weeksLeft === null || minPerWeek === null || maxPerWeek === null) return null;
    if (minPerWeek > maxPerWeek) {
      [minPerWeek, maxPerWeek] = [maxPerWeek, minPerWeek];
    }

    const minRemaining = weeksLeft * minPerWeek;
    const maxRemaining = weeksLeft * maxPerWeek;

    return {
      weeksLeft,
      minPerWeek,
      maxPerWeek,
      minPlan: buildAttendancePlan(statusStats.total, statusStats.attended, minRemaining, sharedBufferPercent),
      maxPlan: buildAttendancePlan(statusStats.total, statusStats.attended, maxRemaining, sharedBufferPercent)
    };
  }, [statusStats, attendanceWeeklyMode.weeksLeft, attendanceWeeklyMode.minPerWeek, attendanceWeeklyMode.maxPerWeek, sharedBufferPercent]);

  const missImpactPlan = useMemo(() => {
    if (!statusStats.ready) return null;
    const plannedMisses = parseNonNegativeInt(attendanceMissPlannerMode.misses);
    if (plannedMisses === null) return null;

    const totalAfterPlannedMisses = statusStats.total + plannedMisses;
    const attendanceAfterPlannedMisses = totalAfterPlannedMisses > 0
      ? (statusStats.attended / totalAfterPlannedMisses) * 100
      : 0;

    const isBelowAfterMisses = attendanceAfterPlannedMisses < ATTENDANCE_MIN_PERCENT;
    const classesToRecoverAfterMisses = isBelowAfterMisses
      ? consecutiveClassesNeeded(totalAfterPlannedMisses, statusStats.attended, ATTENDANCE_MIN_PERCENT)
      : 0;

    const maxMissesFor75 = statusStats.maxConsecutiveSkipsNow;
    const totalAfterMaxMissesFor75 = statusStats.total + maxMissesFor75;
    const attendanceAfterMaxMissesFor75 = totalAfterMaxMissesFor75 > 0
      ? (statusStats.attended / totalAfterMaxMissesFor75) * 100
      : 0;

    return {
      plannedMisses,
      attendanceAfterPlannedMisses,
      isBelowAfterMisses,
      classesToRecoverAfterMisses,
      maxMissesFor75,
      attendanceAfterMaxMissesFor75
    };
  }, [statusStats, attendanceMissPlannerMode.misses]);

  // --- Custom Template Builder State ---
  const [showTemplateBuilder, setShowTemplateBuilder] = useState(false);
  const [manualGrades, setManualGrades] = useState({});
  const [customTemplate, setCustomTemplate] = useState({
    name: "My Subject",
    credits: 3,
    components: [
      { name: "Midterm 1", weight: 15, maxMarks: 30, enabled: true },
      { name: "Midterm 2", weight: 15, maxMarks: 30, enabled: true },
      { name: "Assignment", weight: 10, maxMarks: 10, enabled: true },
      { name: "Lab/Practical", weight: 20, maxMarks: 20, enabled: false },
      { name: "Final Exam", weight: 40, maxMarks: 100, enabled: true },
    ],
    gradingScheme: "PES (Default)",
    customGrades: JSON.parse(JSON.stringify(GradingSchemes["PES (Default)"])),
  });

  const addComponentToTemplate = () => {
    setCustomTemplate(prev => ({
      ...prev,
      components: [...prev.components, { name: `Component ${prev.components.length + 1}`, weight: 10, maxMarks: 20, enabled: true }]
    }));
  };

  const removeComponentFromTemplate = (idx) => {
    setCustomTemplate(prev => ({ ...prev, components: prev.components.filter((_, i) => i !== idx) }));
  };

  const updateTemplateComponent = (idx, field, value) => {
    setCustomTemplate(prev => ({
      ...prev,
      components: prev.components.map((comp, i) => i === idx ? { ...comp, [field]: value } : comp)
    }));
  };

  const updateCustomGrade = (idx, field, value) => {
    setCustomTemplate(prev => ({
      ...prev,
      customGrades: prev.customGrades.map((g, i) => i === idx ? { ...g, [field]: field === 'grade' ? value : parseFloat(value) || 0 } : g)
    }));
  };

  const addCustomGrade = () => {
    setCustomTemplate(prev => ({ ...prev, customGrades: [...prev.customGrades, { grade: 'X', min: 0, gp: 0 }] }));
  };

  const removeCustomGrade = (idx) => {
    setCustomTemplate(prev => ({ ...prev, customGrades: prev.customGrades.filter((_, i) => i !== idx) }));
  };

  const applyCustomTemplate = () => {
    saveStateForUndo();
    const enabledComponents = customTemplate.components.filter(c => c.enabled);

    // 1. Identify ESA (Final Exam) - Assumed to be the heaviest component
    const sortedByWeight = [...enabledComponents].sort((a, b) => b.weight - a.weight);
    const finalComp = sortedByWeight[0];

    // 2. Identify Internals (The remaining components)
    const internalComps = enabledComponents.filter(c => c !== finalComp);

    // Map first 3 internals to distinct slots
    const slot1 = internalComps[0] || null;
    const slot2 = internalComps[1] || null;
    const slot3 = internalComps[2] || null;

    // Slot 4: CATCH-ALL for the rest (Merges Component 4, 5, 6...)
    const remainingComps = internalComps.slice(3);
    const slot4 = remainingComps.length > 0 ? {
      // FIX 1: Join names with " + " so you can see what's included
      name: remainingComps.map(c => c.name).join(' + '),

      // Sum the weights (was already doing this)
      weight: remainingComps.reduce((sum, c) => sum + c.weight, 0),

      // FIX 2: Sum the MAX MARKS (Critical fix!)
      // e.g., Lab (20) + Comp6 (50) = Input out of 70
      maxMarks: remainingComps.reduce((sum, c) => sum + c.maxMarks, 0)
    } : null;

    // 3. Create Custom Labels & Weights Map
    const customConfig = {
      labels: {
        isa1: slot1?.name || "ISA 1",
        isa2: slot2?.name || "ISA 2",
        assignment: slot3?.name || "Assignment",
        lab: slot4?.name || "Lab", // This will now hold "Lab + Component 6"
        esa: finalComp?.name || "ESA"
      },
      weights: {
        isa1: slot1?.weight || 0,
        isa2: slot2?.weight || 0,
        assignment: slot3?.weight || 0,
        lab: slot4?.weight || 0,
        esa: finalComp?.weight || 0
      }
    };

    // 4. Construct the Subject
    const gradeColors = ['text-green-500', 'text-blue-500', 'text-indigo-500', 'text-yellow-500', 'text-orange-500', 'text-red-400', 'text-red-600'];
    const gradeBgs = ['bg-green-500', 'bg-blue-500', 'bg-indigo-500', 'bg-yellow-500', 'bg-orange-500', 'bg-red-400', 'bg-red-600'];

    const customGradeMap = customTemplate.customGrades
      .sort((a, b) => b.min - a.min)
      .map((g, idx) => ({
        ...g,
        color: gradeColors[idx % gradeColors.length],
        bg: gradeBgs[idx % gradeBgs.length]
      }));

    const newSubject = {
      id: Date.now(),
      name: customTemplate.name,
      credits: customTemplate.credits,

      // Control Visibility
      hasIsa1: !!slot1,
      hasIsa2: !!slot2,
      hasAssignment: !!slot3,
      hasLab: !!slot4,

      // COMPATIBILITY: Map to engine weights
      isaWeight: (slot1?.weight || 0) + (slot2?.weight || 0),
      assignmentWeight: slot3?.weight || 0,
      labWeight: slot4?.weight || 0,
      esaWeight: finalComp?.weight || 0,

      // Map Max Marks
      isa1Max: slot1?.maxMarks || 40,
      isa2Max: slot2?.maxMarks || 40,
      assignmentMax: slot3?.maxMarks || 10,
      labMax: slot4?.maxMarks || 20,
      esaMax: finalComp?.maxMarks || 100,

      // SAVE THE CUSTOM CONFIG
      customConfig: customConfig,
      customGradeMap: customGradeMap.length > 0 ? customGradeMap : null,
    };

    setSubjects(prev => [...prev, newSubject]);
    setExpandedSubject(newSubject.id);
    setShowTemplateBuilder(false);
    setCustomTemplate(prev => ({ ...prev, name: "My Subject" }));
  };

  const applyGradingSchemeToAll = () => {
    if (!window.confirm("Apply this grading scheme to ALL subjects?")) return;
    saveStateForUndo();

    // Colors logic repeated for safety
    const gradeColors = ['text-green-500', 'text-blue-500', 'text-indigo-500', 'text-yellow-500', 'text-orange-500', 'text-red-400', 'text-red-600'];
    const gradeBgs = ['bg-green-500', 'bg-blue-500', 'bg-indigo-500', 'bg-yellow-500', 'bg-orange-500', 'bg-red-400', 'bg-red-600'];

    const customGradeMap = customTemplate.customGrades
      .sort((a, b) => b.min - a.min)
      .map((g, idx) => ({
        ...g,
        color: gradeColors[idx % gradeColors.length],
        bg: gradeBgs[idx % gradeBgs.length]
      }));

    setSubjects(prev => prev.map(sub => ({ ...sub, customGradeMap: customGradeMap })));
  };

  // --- Shuffle State ---
  const [shuffledResults, setShuffledResults] = useState(null);

  // Reset shuffle if user changes target or locks
  useEffect(() => {
    setShuffledResults(null);
  }, [reverseTargetSgpa, lockedSubjects, marks]);

  // --- Undo/Redo State ---
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  // --- Persistence Effects ---
  useEffect(() => {
    localStorage.setItem('pes_subjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('pes_marks', JSON.stringify(marks));
  }, [marks]);

  useEffect(() => {
    localStorage.setItem('pes_cgpa_details', JSON.stringify(prevCgpaDetails));
  }, [prevCgpaDetails]);

  useEffect(() => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('pes_theme', 'dark'); // Ensure it stays dark
  }, []);

  // --- Undo/Redo Functions ---
  const saveStateForUndo = () => {
    setUndoStack(prev => [...prev.slice(-20), { marks: JSON.parse(JSON.stringify(marks)), subjects: JSON.parse(JSON.stringify(subjects)) }]);
    setRedoStack([]);
  };

  const undo = () => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setRedoStack(r => [...r, { marks: JSON.parse(JSON.stringify(marks)), subjects: JSON.parse(JSON.stringify(subjects)) }]);
    setMarks(prev.marks);
    setSubjects(prev.subjects);
    setUndoStack(u => u.slice(0, -1));
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack(u => [...u, { marks: JSON.parse(JSON.stringify(marks)), subjects: JSON.parse(JSON.stringify(subjects)) }]);
    setMarks(next.marks);
    setSubjects(next.subjects);
    setRedoStack(r => r.slice(0, -1));
  };

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            undo();
            break;
          case 'y':
            e.preventDefault();
            redo();
            break;
          case 's':
            e.preventDefault();
            exportData();
            break;
        }
      }
      if (e.key === 'Escape' && expandedSubject) {
        setExpandedSubject(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [expandedSubject, undoStack, redoStack, marks, subjects]);

  // --- Mark & Subject Handlers ---
  useEffect(() => {
    const newMarks = { ...marks };
    let changed = false;
    subjects.forEach(sub => {
      if (!newMarks[sub.id]) {
        newMarks[sub.id] = {
          isa1: '', isa1Max: sub.isa1Max || 40,
          isa2: '', isa2Max: sub.isa2Max || 40,
          assignment: '', assignmentMax: 10,
          lab: '', labMax: 20,
          esa: '', esaMax: sub.esaMax || 100
        };
        changed = true;
      }
    });
    if (changed) setMarks(newMarks);
  }, [subjects.length]);

  const handleMarkChange = (id, field, value) => {
    // Input validation
    let numValue = parseFloat(value);

    if (value === '') {
      setMarks(prev => ({
        ...prev,
        [id]: { ...prev[id], [field]: '' }
      }));
      return;
    }

    if (isNaN(numValue)) return;

    if (numValue < 0) numValue = 0;

    // Cap at max for score fields
    if (!field.includes('Max')) {
      const maxField = field + 'Max';
      const max = marks[id]?.[maxField] || 100;
      if (numValue > max) numValue = max;
    }

    setMarks(prev => {
      const newMarks = { ...prev, [id]: { ...prev[id], [field]: numValue } };

      // If a Max field is updated, ensure the corresponding score doesn't exceed it
      if (field.includes('Max')) {
        const scoreField = field.replace('Max', '');
        const currentScore = newMarks[id][scoreField];
        if (currentScore !== '' && currentScore !== undefined && currentScore > numValue) {
          newMarks[id][scoreField] = numValue;
        }
      }

      return newMarks;
    });
  };

  const handleSubjectChange = (id, field, value) => {
    saveStateForUndo();
    setSubjects(prev => prev.map(sub => sub.id === id ? { ...sub, [field]: value } : sub));
  };

  const toggleLab = (id) => {
    saveStateForUndo();
    setSubjects(prev => prev.map(sub => {
      if (sub.id === id) {
        const newHasLab = !sub.hasLab;
        let newLabWeight = newHasLab ? 20 : 0;
        return { ...sub, hasLab: newHasLab, labWeight: newLabWeight };
      }
      return sub;
    }));
  };

  const toggleAssignment = (id) => {
    saveStateForUndo();
    setSubjects(prev => prev.map(sub => {
      if (sub.id === id) {
        const newHasAssign = !sub.hasAssignment;
        return { ...sub, hasAssignment: newHasAssign, assignmentWeight: newHasAssign ? 10 : 0 };
      }
      return sub;
    }));
  };

  const addNewSubject = () => {
    saveStateForUndo();
    const newId = Date.now();
    const newSubject = {
      id: newId,
      name: "New Subject",
      credits: 4,
      hasLab: false,
      hasAssignment: true,
      isaWeight: 20,
      assignmentWeight: 10,
      labWeight: 0,
      esaWeight: 50,
      isa1Max: 40,
      isa2Max: 40,
      esaMax: 100
    };
    setSubjects([...subjects, newSubject]);
    setExpandedSubject(newId);
  };

  const removeSubject = (id) => {
    if (subjects.length === 1) {
      alert("You need at least one subject!");
      return;
    }
    saveStateForUndo();
    setSubjects(subjects.filter(s => s.id !== id));
    const newMarks = { ...marks };
    delete newMarks[id];
    setMarks(newMarks);
  };

  const loadPreset = (presetName) => {
    if (!presetName) return;
    if (window.confirm(`Load ${presetName} preset?  This will replace your current subjects. `)) {
      saveStateForUndo();
      setSubjects(SemesterPresets[presetName]);
      setMarks({});
    }
  };

  const resetToDefault = () => {
    if (window.confirm("This will erase your custom subjects and restore the Physics Cycle defaults. Continue?")) {
      saveStateForUndo();
      setSubjects(PhysicsCycleDefaults);
      setMarks({});
    }
  };

  const clearAll = () => {
    if (window.confirm("Clear all subjects and start fresh? ")) {
      saveStateForUndo();
      setSubjects([{
        id: 1,
        name: "Subject 1",
        credits: 4,
        hasLab: false,
        hasAssignment: true,
        isaWeight: 20,
        assignmentWeight: 10,
        labWeight: 0,
        esaWeight: 50,
        isa1Max: 40,
        isa2Max: 40,
        esaMax: 100
      }]);
      setMarks({});
    }
  };

  const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

  const normalizeSubject = (subject, index) => {
    const base = isPlainObject(subject) ? subject : {};
    const hasAssignment = base.hasAssignment ?? true;
    const hasLab = base.hasLab ?? false;

    return {
      ...base,
      id: base.id ?? (index + 1),
      name: typeof base.name === 'string' ? base.name : `Subject ${index + 1}`,
      credits: parseFloat(base.credits) || 4,
      hasAssignment,
      hasLab,
      isaWeight: parseFloat(base.isaWeight) || 20,
      assignmentWeight: parseFloat(base.assignmentWeight) || (hasAssignment ? 10 : 0),
      labWeight: parseFloat(base.labWeight) || (hasLab ? 20 : 0),
      esaWeight: parseFloat(base.esaWeight) || 50,
      isa1Max: parseFloat(base.isa1Max) || 40,
      isa2Max: parseFloat(base.isa2Max) || 40,
      assignmentMax: parseFloat(base.assignmentMax) || 10,
      labMax: parseFloat(base.labMax) || 20,
      esaMax: parseFloat(base.esaMax) || 100
    };
  };

  // --- Export/Import Functions ---
  const exportData = () => {
    const data = {
      subjects,
      marks,
      prevCgpaDetails,
      exportedAt: new Date().toISOString(),
      version: '2.0'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pesu-calculator-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        const hasSubjects = Array.isArray(data.subjects) && data.subjects.length > 0;
        const marksOk = data.marks === undefined || isPlainObject(data.marks);
        if (hasSubjects && marksOk) {
          saveStateForUndo();
          const normalizedSubjects = data.subjects.map((s, idx) => normalizeSubject(s, idx));
          setSubjects(normalizedSubjects);
          setMarks(isPlainObject(data.marks) ? data.marks : {});
          if (data.prevCgpaDetails) {
            setPrevCgpaDetails(data.prevCgpaDetails);
          }
          alert('Data imported successfully!');
        } else {
          alert('Invalid backup file format');
        }
      } catch (err) {
        alert('Error reading backup file');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  // --- Calculations ---
  const getSubjectMetrics = (subject) => {
    const m = marks[subject.id];
    if (!m) return { finalScore: 0, rawScore: 0, currentInternals: 0, totalWeight: 100, momentumScore: 0, momentumIsa2Marks: null, hasIsa1: false, hasIsa2: false };

    const calcComponent = (score, max, weight) => {
      const s = parseFloat(score);
      const mx = parseFloat(max);
      if (isNaN(s) || isNaN(mx) || mx === 0) return 0;
      return (s / mx) * weight;
    };

    // Check which scores are available
    const hasIsa1 = m.isa1 !== '' && m.isa1 !== undefined && !isNaN(parseFloat(m.isa1));
    const hasIsa2 = m.isa2 !== '' && m.isa2 !== undefined && !isNaN(parseFloat(m.isa2));
    const hasAssignment = m.assignment !== '' && m.assignment !== undefined && !isNaN(parseFloat(m.assignment));
    const hasLab = m.lab !== '' && m.lab !== undefined && !isNaN(parseFloat(m.lab));
    const hasEsa = m.esa !== '' && m.esa !== undefined && !isNaN(parseFloat(m.esa));

    // 1. Calculate actual Internals (only filled values)
    let currentInternals = 0;
    currentInternals += calcComponent(m.isa1, m.isa1Max, subject.isaWeight);
    currentInternals += calcComponent(m.isa2, m.isa2Max, subject.isaWeight);
    if (subject.hasAssignment) currentInternals += calcComponent(m.assignment, m.assignmentMax, subject.assignmentWeight);
    if (subject.hasLab) currentInternals += calcComponent(m.lab, m.labMax, subject.labWeight);

    // 2. Calculate Current ESA
    let esaComponent = calcComponent(m.esa, m.esaMax, subject.esaWeight);

    // 3. Weights Logic
    let totalInternalWeight = (subject.isaWeight * 2) +
      (subject.hasAssignment ? subject.assignmentWeight : 0) +
      (subject.hasLab ? subject.labWeight : 0);
    let totalWeight = totalInternalWeight + subject.esaWeight;

    // 4. Standard Final Score (based on actual entered marks only)
    let rawSum = currentInternals + esaComponent;
    let finalScore = Math.ceil((rawSum / totalWeight) * 100);
    let rawScore = Math.round(rawSum * 10) / 10;

    // 5. Momentum Logic - Project unfilled components
    let momentumScore = 0;
    let momentumIsa2Marks = null;
    let projectedInternals = currentInternals;

    const assignmentMaxRaw = parseFloat(m.assignmentMax ?? subject.assignmentMax ?? 10);
    const labMaxRaw = parseFloat(m.labMax ?? subject.labMax ?? 20);
    const assignmentMax = !isNaN(assignmentMaxRaw) ? assignmentMaxRaw : 10;
    const labMax = !isNaN(labMaxRaw) ? labMaxRaw : 20;
    let momentumAssignmentMarks = null;
    let momentumLabMarks = null;

    if (hasIsa1 || hasIsa2 || hasAssignment || hasLab) {
      // Calculate ISA-only performance ratio (for projecting ISA2)
      let isaPerformance = 0;
      let isaWeightFilled = 0;

      if (hasIsa1) {
        isaPerformance += calcComponent(m.isa1, m.isa1Max, subject.isaWeight);
        isaWeightFilled += subject.isaWeight;
      }
      if (hasIsa2) {
        isaPerformance += calcComponent(m.isa2, m.isa2Max, subject.isaWeight);
        isaWeightFilled += subject.isaWeight;
      }

      // ISA performance ratio (how well they're doing in ISAs specifically)
      const isaRatio = isaWeightFilled > 0 ? (isaPerformance / isaWeightFilled) : 0;
      const isa2Max = parseFloat(m.isa2Max ?? subject.isa2Max ?? 40);
      if (!hasIsa2 && hasIsa1 && subject.hasIsa2 !== false && !isNaN(isa2Max) && isa2Max > 0) {
        const projectedIsa2 = Math.min(isa2Max, Math.max(0, isaRatio * isa2Max));
        momentumIsa2Marks = Math.round(projectedIsa2 * 10) / 10;
      }

      if (subject.hasAssignment && !hasAssignment && assignmentMax > 0) {
        momentumAssignmentMarks = Math.round(assignmentMax * 10) / 10;
      }

      if (subject.hasLab && !hasLab && labMax > 0) {
        momentumLabMarks = Math.round(labMax * 10) / 10;
      }

      // Calculate overall internal performance ratio (for projecting assignment/lab/ESA)
      let filledInternalScore = 0;
      let filledInternalWeight = 0;

      if (hasIsa1) {
        filledInternalScore += calcComponent(m.isa1, m.isa1Max, subject.isaWeight);
        filledInternalWeight += subject.isaWeight;
      }
      if (hasIsa2) {
        filledInternalScore += calcComponent(m.isa2, m.isa2Max, subject.isaWeight);
        filledInternalWeight += subject.isaWeight;
      }
      if (subject.hasAssignment && hasAssignment) {
        filledInternalScore += calcComponent(m.assignment, m.assignmentMax, subject.assignmentWeight);
        filledInternalWeight += subject.assignmentWeight;
      }
      if (subject.hasLab && hasLab) {
        filledInternalScore += calcComponent(m.lab, m.labMax, subject.labWeight);
        filledInternalWeight += subject.labWeight;
      }

      const overallInternalRatio = filledInternalWeight > 0 ? (filledInternalScore / filledInternalWeight) : 0;

      // Start with actual internals
      // Project ISA2 based on ISA1 performance (if only ISA1 is filled)
      // This makes sense because ISA1 and ISA2 are similar exam formats
      if (!hasIsa2 && hasIsa1) {
        projectedInternals += isaRatio * subject.isaWeight;
      }

      // Project assignment as full marks if not filled
      if (subject.hasAssignment && !hasAssignment) {
        projectedInternals += subject.assignmentWeight;
      }

      // Project lab as full marks if not filled
      if (subject.hasLab && !hasLab) {
        projectedInternals += subject.labWeight;
      }

      // Project ESA based on overall internal performance
      let momentumESA = hasEsa ? esaComponent : (subject.esaWeight * overallInternalRatio);

      // Calculate momentum score
      let momentumRawSum = projectedInternals + momentumESA;
      momentumScore = Math.ceil((momentumRawSum / totalWeight) * 100);
    } else {
      // No data at all, momentum equals final score (which would be 0)
      momentumScore = finalScore;
    }

    return {
      finalScore: Math.min(100, Math.max(0, finalScore)),
      rawScore: Math.max(0, rawScore),
      currentInternals,
      totalWeight,
      momentumScore: Math.min(100, Math.max(0, momentumScore)),
      momentumIsa2Marks,
      momentumAssignmentMarks,
      momentumLabMarks,
      assignmentMax,
      labMax,
      projectedInternals,
      esaWeight: subject.esaWeight,
      hasIsa1,
      hasIsa2,
      hasAssignment,
      hasLab
    };
  };

  // --- Updated Grade Helpers (Supports Custom Cutoffs) ---
  const getGradePoint = (totalMarks, subject = null) => {
    // Check if the subject has a custom map, otherwise use default
    const map = (subject && subject.customGradeMap) ? subject.customGradeMap : GradeMap;
    for (let g of map) {
      if (totalMarks >= g.min) return g.gp;
    }
    return 0;
  };

  const getGradeInfo = (score, subject = null) => {
    const map = (subject && subject.customGradeMap) ? subject.customGradeMap : GradeMap;
    return map.find(g => score >= g.min) || map[map.length - 1];
  };

  // Helper function to calculate required ESA with safety margin
  const getRequiredESAForGrade = (subject, targetScore, withSafetyMargin = true, options = {}) => {
    const m = marks[subject.id] || {};
    const { currentInternals, totalWeight, esaWeight, momentumIsa2Marks, hasIsa2, projectedInternals, hasIsa1, hasAssignment, hasLab } = getSubjectMetrics(subject);
    let effectiveInternals = currentInternals;

    const useMomentumInternals = options.useMomentumInternals === true;
    if (useMomentumInternals) {
      const missingIsa1 = !hasIsa1;
      const missingIsa2 = subject.hasIsa2 !== false && !hasIsa2;
      const missingAssignment = subject.hasAssignment && !hasAssignment;
      const missingLab = subject.hasLab && !hasLab;
      const isProjecting = missingIsa1 || missingIsa2 || missingAssignment || missingLab;
      if (isProjecting) {
        effectiveInternals = projectedInternals;
      }
    }

    if (!useMomentumInternals && options.useMomentumIsa2 && !hasIsa2 && momentumIsa2Marks !== null && subject.hasIsa2 !== false) {
      const isa2Max = parseFloat(m.isa2Max ?? subject.isa2Max ?? 40);
      if (!isNaN(isa2Max) && isa2Max > 0) {
        effectiveInternals += (momentumIsa2Marks / isa2Max) * subject.isaWeight;
      }
    }
    const esaMax = m.esaMax || 100;

    // First check: Is this grade even achievable with max ESA?
    // Calculate what score we'd get with perfect ESA
    const maxEsaComponent = (esaMax / esaMax) * esaWeight; // = esaWeight
    const maxPossibleRaw = ((effectiveInternals + maxEsaComponent) / totalWeight) * 100;
    const maxPossibleScore = Math.ceil(maxPossibleRaw);

    // If even with perfect ESA we can't reach the target, it's impossible
    if (maxPossibleScore < targetScore) {
      return { safe: null, minimum: null };
    }

    if (withSafetyMargin) {
      // Safe calculation: Ensure we DEFINITELY get the grade
      // We need: ceil((currentInternals + esaComponent) / totalWeight * 100) >= targetScore
      // To guarantee this, we need the raw percentage to be >= targetScore - 0.5 (midpoint for ceiling)
      // But to be SAFE, we calculate for exactly targetScore (no rounding benefit)
      const requiredWeightedTotal = (targetScore * totalWeight) / 100;
      const requiredEsaComponent = requiredWeightedTotal - effectiveInternals;

      if (requiredEsaComponent <= 0) return { safe: 0, minimum: 0 };

      const requiredEsaMarks = (requiredEsaComponent / esaWeight) * esaMax;

      // Safe value: round up to ensure we hit the target
      const safeEsa = Math.ceil(requiredEsaMarks);

      // Minimum value: the absolute minimum that could work due to ceiling
      // We need ceil(x) >= targetScore, so x > targetScore - 1
      // Find the minimum ESA where ceil gives us targetScore
      const minWeightedTotal = ((targetScore - 1) * totalWeight / 100) + 0.001;
      const minRequiredEsaComponent = minWeightedTotal - effectiveInternals;
      const minEsaMarks = minRequiredEsaComponent > 0
        ? Math.ceil((minRequiredEsaComponent / esaWeight) * esaMax)
        : 0;

      // Cap at esaMax - if safe > esaMax but minimum <= esaMax, show minimum as safe
      if (safeEsa > esaMax) {
        // Safe isn't achievable, but minimum might be (due to rounding)
        if (minEsaMarks <= esaMax) {
          return {
            safe: esaMax, // Best we can do
            minimum: Math.max(0, minEsaMarks),
            requiresRounding: true // Flag to indicate this relies on rounding
          };
        }
        return { safe: null, minimum: null };
      }

      return {
        safe: Math.min(esaMax, safeEsa),
        minimum: Math.max(0, Math.min(esaMax, minEsaMarks))
      };
    } else {
      // Original calculation (minimum possible)
      const minWeightedTotal = ((targetScore - 1) * totalWeight / 100) + 0.001;
      const requiredEsaComponent = minWeightedTotal - effectiveInternals;

      if (requiredEsaComponent <= 0) return 0;

      const requiredEsaMarks = (requiredEsaComponent / esaWeight) * esaMax;

      if (requiredEsaMarks > esaMax) return null;

      return Math.ceil(requiredEsaMarks);
    }
  };

  const getRequiredISA2ForGrade = (subject, targetScore, options = {}) => {
    if (subject.hasIsa2 === false) return null;
    const { assumeFullForEmptyInternals = false } = options;

    const m = marks[subject.id] || {};
    const parsedTarget = parseFloat(targetScore);
    if (isNaN(parsedTarget)) return null;

    const hasIsa2 = m.isa2 !== '' && m.isa2 !== undefined && !isNaN(parseFloat(m.isa2));
    if (hasIsa2) return null;

    const isa2MaxRaw = parseFloat(m.isa2Max ?? subject.isa2Max ?? 40);
    const isa2Max = !isNaN(isa2MaxRaw) ? isa2MaxRaw : 40;
    const isaWeight = parseFloat(subject.isaWeight ?? 0);
    if (!isaWeight || isa2Max <= 0) return null;

    const calcComponent = (score, max, weight) => {
      const s = parseFloat(score);
      const mx = parseFloat(max);
      if (isNaN(s) || isNaN(mx) || mx === 0) return 0;
      return (s / mx) * weight;
    };

    const hasIsa1 = m.isa1 !== '' && m.isa1 !== undefined && !isNaN(parseFloat(m.isa1));
    const hasAssignment = m.assignment !== '' && m.assignment !== undefined && !isNaN(parseFloat(m.assignment));
    const hasLab = m.lab !== '' && m.lab !== undefined && !isNaN(parseFloat(m.lab));
    const hasEsa = m.esa !== '' && m.esa !== undefined && !isNaN(parseFloat(m.esa));

    const assignmentWeight = subject.hasAssignment ? (subject.assignmentWeight || 0) : 0;
    const labWeight = subject.hasLab ? (subject.labWeight || 0) : 0;
    const esaWeight = subject.esaWeight || 0;

    let baseInternals = 0;
    if (hasIsa1) baseInternals += calcComponent(m.isa1, m.isa1Max, isaWeight);

    if (subject.hasAssignment) {
      baseInternals += hasAssignment
        ? calcComponent(m.assignment, m.assignmentMax, assignmentWeight)
        : (assumeFullForEmptyInternals ? assignmentWeight : 0);
    }

    if (subject.hasLab) {
      baseInternals += hasLab
        ? calcComponent(m.lab, m.labMax, labWeight)
        : (assumeFullForEmptyInternals ? labWeight : 0);
    }

    const esaComponent = hasEsa ? calcComponent(m.esa, m.esaMax, esaWeight) : 0;

    const totalWeight = (isaWeight * 2) +
      assignmentWeight +
      labWeight +
      esaWeight;
    if (totalWeight <= 0) return null;

    const requiredWeightedTotal = (parsedTarget * totalWeight) / 100;
    const requiredIsa2Component = requiredWeightedTotal - baseInternals - esaComponent;

    if (requiredIsa2Component <= 0) return { needed: 0, max: isa2Max };

    const requiredIsa2Marks = Math.ceil((requiredIsa2Component / isaWeight) * isa2Max);
    if (requiredIsa2Marks > isa2Max) return { needed: null, max: isa2Max };

    return { needed: Math.max(0, requiredIsa2Marks), max: isa2Max };
  };

  const getRequiredISA2ForPass = (subject) => getRequiredISA2ForGrade(subject, 40, {
    assumeFullForEmptyInternals: true
  });

  // --- SGPA Calculation ---
  useEffect(() => {
    let totalCredits = 0;
    let weightedPoints = 0;

    subjects.forEach(sub => {
      const { finalScore } = getSubjectMetrics(sub);
      const gp = getGradePoint(finalScore, sub);
      weightedPoints += gp * sub.credits;
      totalCredits += sub.credits;
    });

    setSgpa(totalCredits > 0 ? (weightedPoints / totalCredits).toFixed(2) : 0);
  }, [marks, subjects]);

  // --- Analysis Calculations ---
  const calculateAnalysis = () => {
    let totalCredits = subjects.reduce((sum, s) => sum + s.credits, 0);
    let maxPossibleGP = totalCredits * 10;
    let targetGP = totalCredits * targetSgpa;

    let currentLostGP = 0;
    let momentumWeightedGP = 0;

    let analysisData = [];

    subjects.forEach(sub => {
      const {
        finalScore,
        currentInternals,
        totalWeight,
        momentumScore,
        momentumIsa2Marks,
        momentumAssignmentMarks,
        momentumLabMarks,
        assignmentMax,
        labMax
      } = getSubjectMetrics(sub);
      const currentGP = getGradePoint(finalScore, sub);
      const momentumGP = getGradePoint(momentumScore, sub);
      const isa2Max = parseFloat(marks[sub.id]?.isa2Max ?? sub.isa2Max ?? 40) || 40;
      const isa2PassInfo = getRequiredISA2ForPass(sub);

      momentumWeightedGP += (momentumGP * sub.credits);

      const loss = 10 - currentGP;
      currentLostGP += (loss * sub.credits);

      // Use the new helper function with safety margin
      const reqSData = getRequiredESAForGrade(sub, 90, true, { useMomentumIsa2: true, useMomentumInternals: true });
      const reqAData = getRequiredESAForGrade(sub, 80, true, { useMomentumIsa2: true, useMomentumInternals: true });

      analysisData.push({
        id: sub.id,
        name: sub.name,
        credits: sub.credits,
        reqS: reqSData.safe,
        reqSMin: reqSData.minimum,
        reqSRequiresRounding: reqSData.requiresRounding || false,
        reqA: reqAData.safe,
        reqAMin: reqAData.minimum,
        reqARequiresRounding: reqAData.requiresRounding || false,
        currentGP,
        momentumGP,
        momentumScore,
        momentumIsa2Marks,
        momentumAssignmentMarks,
        momentumLabMarks,
        isa2Max,
        assignmentMax,
        labMax,
        isa2PassNeeded: isa2PassInfo ? isa2PassInfo.needed : null,
        isa2PassMax: isa2PassInfo ? isa2PassInfo.max : isa2Max,
        showIsa2PassNeeded: !!isa2PassInfo,
        finalScore
      });
    });

    const allowableLoss = maxPossibleGP - targetGP;
    const momentumSGPA = totalCredits > 0 ? (momentumWeightedGP / totalCredits).toFixed(2) : 0;

    return {
      totalCredits,
      maxPossibleGP,
      targetGP,
      currentLostGP,
      allowableLoss,
      momentumSGPA,
      analysisData
    };
  };

  // --- Smart Strategy Engine (Fixed) ---
  const getSmartSuggestions = () => {
    const totalCredits = subjects.reduce((acc, s) => acc + s.credits, 0);
    const targetTotalGP = totalCredits * targetSgpa;

    // 1. Build Current State
    let subState = subjects.map(s => {
      const m = marks[s.id] || {};
      const { momentumScore, totalWeight, esaWeight } = getSubjectMetrics(s);

      // REVERSE ENGINEER INTERNALS:
      // We need to know what internals the 'Momentum Score' is assuming we have.
      // If momentum is 0, this will be 0. If momentum is 90, this will be high.
      const projectedEsaPart = (momentumScore / 100) * esaWeight;
      const impliedInternals = (momentumScore * totalWeight / 100) - projectedEsaPart;

      // Current ESA "usage" in the momentum score
      const currentEsaMarks = (projectedEsaPart / esaWeight) * (m.esaMax || 100);

      const isFinal = m.esa && m.esa !== '' && !isNaN(parseFloat(m.esa));

      return {
        ...s,
        currentScore: momentumScore,
        currentGP: getGradePoint(momentumScore, s),
        impliedInternals,
        currentEsaMarks,
        totalWeight,
        esaWeight,
        esaMax: m.esaMax || 100,
        isFinal
      };
    });

    let currentTotalGP = subState.reduce((acc, s) => acc + s.currentGP * s.credits, 0);
    let deficit = targetTotalGP - currentTotalGP;

    let plan = [];
    let impossible = false;
    let iterations = 0;

    // Clone state for simulation
    let simState = JSON.parse(JSON.stringify(subState));

    while (deficit > 0.01 && iterations < 50) {
      iterations++;
      let candidates = [];

      simState.forEach((sub, idx) => {
        if (sub.isFinal || sub.currentGP >= 10) return;

        const activeMap = sub.customGradeMap || GradeMap;
        const nextGrade = activeMap.slice().reverse().find(g => g.gp > sub.currentGP);

        if (nextGrade) {
          // 1. Calculate TOTAL weighted points needed for the next grade
          const requiredWeightedScore = (nextGrade.min * sub.totalWeight) / 100;

          // 2. Subtract the internals we already have (or are projected to have)
          const requiredEsaWeight = requiredWeightedScore - sub.impliedInternals;

          // 3. Convert to ESA Marks
          // If requiredEsaWeight is negative (internals already cover it), we need 0.
          let esaNeeded = 0;
          if (requiredEsaWeight > 0) {
            esaNeeded = Math.ceil((requiredEsaWeight / sub.esaWeight) * sub.esaMax);
          }

          // 4. Check Feasibility
          if (esaNeeded <= sub.esaMax) {
            const gpGain = (nextGrade.gp - sub.currentGP) * sub.credits;

            // Cost is the ADDITIONAL marks needed on top of what we are already simulating
            const cost = Math.max(0, esaNeeded - sub.currentEsaMarks);

            candidates.push({
              idx,
              name: sub.name,
              fromGrade: GradeMap.find(g => g.gp === sub.currentGP)?.grade || 'F',
              toGrade: nextGrade.grade,
              esaNeeded: esaNeeded, // Store absolute needed
              esaMax: sub.esaMax,
              gpGain,
              cost,
              credits: sub.credits,
              efficiency: cost <= 0 ? Infinity : gpGain / cost
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
      const newGradeInfo = GradeMap.find(g => g.grade === best.toGrade);
      simState[best.idx].currentGP = newGradeInfo.gp;
      simState[best.idx].currentScore = newGradeInfo.min;
      simState[best.idx].currentEsaMarks = best.esaNeeded; // Update ESA usage

      deficit -= best.gpGain;
    }

    // --- Consolidate steps for the same subject ---
    const consolidatedPlan = [];
    const subjectMap = new Map();

    plan.forEach(step => {
      if (subjectMap.has(step.idx)) {
        const existing = subjectMap.get(step.idx);
        existing.toGrade = step.toGrade;      // Update target grade (e.g. B->A becomes B->S)
        existing.esaNeeded = step.esaNeeded;  // Update required score (Cumulative)
        existing.gpGain += step.gpGain;       // Sum GP gain
      } else {
        consolidatedPlan.push(step);
        subjectMap.set(step.idx, step);
      }
    });

    return { plan: consolidatedPlan, impossible, deficit };
  };

  // --- Advanced Reverse Calculator (Smart Greedy Strategy) ---
  const calculateReverseRequirements = () => {
    const totalCredits = subjects.reduce((sum, s) => sum + s.credits, 0);
    const targetTotalGP = reverseTargetSgpa * totalCredits;
    let usingMomentum = false;

    // 1. Initialization
    let state = subjects.map(sub => {
      const m = marks[sub.id] || {};
      const { currentInternals, totalWeight, esaWeight, momentumScore } = getSubjectMetrics(sub);
      const esaMax = m.esaMax || 100;

      // LOGIC FIX 1: Calculate Projected Internals from Momentum
      // We reverse-engineer the internals that momentum is "assuming" we have.
      // This prevents the "Zero Lab" trap for both Locked and Unlocked subjects.
      const projectedEsaScore = (momentumScore / 100) * esaWeight;
      const projectedInternals = (momentumScore * totalWeight / 100) - projectedEsaScore;

      // Check if we are relying on projection (Empty fields)
      // FIX: Explicitly check for empty fields instead of math estimation to avoid rounding errors
      const missingIsa1 = m.isa1 === '' || m.isa1 === undefined;
      const missingIsa2 = m.isa2 === '' || m.isa2 === undefined;
      const missingAssign = sub.hasAssignment && (m.assignment === '' || m.assignment === undefined);
      const missingLab = sub.hasLab && (m.lab === '' || m.lab === undefined);

      const isProjecting = missingIsa1 || missingIsa2 || missingAssign || missingLab;
      if (isProjecting) usingMomentum = true;

      // LOGIC FIX 2: Check if subject is effectively "Locked"
      // It is locked if: 
      // a) User manually locked it in UI
      // b) User already entered an ESA mark in the main Subjects tab
      const isEsaEntered = m.esa !== '' && m.esa !== undefined && !isNaN(parseFloat(m.esa));
      const manualLockVal = lockedSubjects[sub.id];
      const isLocked = manualLockVal !== undefined || isEsaEntered;

      // Determine the Effective ESA to use
      // If manually locked, use that. If ESA entered, use that. Otherwise 0.
      let effectiveEsa = 0;
      if (manualLockVal !== undefined) effectiveEsa = manualLockVal;
      else if (isEsaEntered) effectiveEsa = parseFloat(m.esa);

      if (isLocked) {
        // Use PROJECTED internals for the total calculation to avoid the trap
        const effectiveInternals = isProjecting ? projectedInternals : currentInternals;
        const esaComponent = (effectiveEsa / esaMax) * esaWeight;
        const totalScore = Math.ceil(((effectiveInternals + esaComponent) / totalWeight) * 100);
        const gradeInfo = getGradeInfo(Math.min(100, totalScore), sub);

        return {
          ...sub,
          locked: true, // Treat as locked
          currentGradeInfo: gradeInfo,
          currentGP: gradeInfo.gp,
          requiredEsa: effectiveEsa,
          esaMax,
          isImpossible: effectiveEsa > esaMax,
          currentInternals: effectiveInternals, // Pass projected
          totalWeight, esaWeight,
          isManualLock: manualLockVal !== undefined // Distinguish for UI
        };
      }

      // Handle Unlocked
      // Calculate grade with 0 ESA using PROJECTED internals
      const zeroEsaScore = Math.ceil((projectedInternals / totalWeight) * 100);
      const startGradeInfo = getGradeInfo(zeroEsaScore, sub);

      return {
        ...sub,
        locked: false,
        currentGradeInfo: startGradeInfo,
        currentGP: startGradeInfo.gp,
        requiredEsa: 0,
        esaMax,
        isImpossible: false,
        currentInternals: projectedInternals,
        totalWeight,
        esaWeight
      };
    });

    let currentTotalGP = state.reduce((sum, s) => sum + (s.currentGP * s.credits), 0);

    // 2. Optimization Loop (Hill Climbing)
    let iterations = 0;
    while (currentTotalGP < targetTotalGP && iterations < 1000) {
      iterations++;
      let bestUpgrade = null;
      let maxEfficiency = -1;

      state.forEach((sub, idx) => {
        if (sub.locked || sub.isImpossible) return;

        // FIX: Use custom map if available, otherwise default
        const activeMap = sub.customGradeMap || GradeMap;
        const nextGrade = activeMap.slice().reverse().find(g => g.gp > sub.currentGP);
        if (!nextGrade) return;

        // Calculate Cost
        const requiredTotal = (nextGrade.min * sub.totalWeight) / 100;
        const requiredEsaComponent = requiredTotal - sub.currentInternals;
        const requiredEsa = Math.ceil((requiredEsaComponent / sub.esaWeight) * sub.esaMax);

        if (requiredEsa > sub.esaMax) return;

        const markCost = requiredEsa - sub.requiredEsa;
        const gpGain = (nextGrade.gp - sub.currentGP) * sub.credits;

        // Efficiency: GP gained per ESA mark
        const efficiency = gpGain / (markCost <= 0 ? 0.0001 : markCost);

        if (efficiency > maxEfficiency) {
          maxEfficiency = efficiency;
          bestUpgrade = { idx, nextGrade, requiredEsa, gpGain };
        }
      });

      if (!bestUpgrade) break;

      const targetSub = state[bestUpgrade.idx];
      targetSub.currentGradeInfo = bestUpgrade.nextGrade;
      targetSub.currentGP = bestUpgrade.nextGrade.gp;
      targetSub.requiredEsa = Math.max(0, bestUpgrade.requiredEsa);
      currentTotalGP += bestUpgrade.gpGain;
    }

    // 3. Final Formatting
    const results = state.map(s => ({
      ...s,
      projectedScore: s.currentGradeInfo.min,
      projectedGrade: s.currentGradeInfo.grade,
      gp: s.currentGP,
      isImpossible: s.requiredEsa > s.esaMax,
      alreadyAchieved: s.requiredEsa <= 0,
      // Pass this flag so UI knows if it's a "Hard Lock" (User typed ESA in main tab)
      isHardLocked: !s.isManualLock && s.locked
    })).sort((a, b) => {
      if (a.locked !== b.locked) return a.locked ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    const achievableSGPA = (currentTotalGP / totalCredits).toFixed(2);
    const isTargetAchievable = parseFloat(achievableSGPA) >= reverseTargetSgpa;

    return { results, isTargetAchievable, achievableSGPA, avgGPNeeded: 0, usingMomentum };
  };

  // --- Randomized Path (The "Biased Teacher" Method) ---
  const calculateRandomPath = () => {

    // 1. Generate Random Bias (The "Vibe Shift")
    // We force the algorithm to prefer some subjects over others arbitrarily
    const subjectBias = {};
    subjects.forEach(s => {
      // Assign a multiplier between 0.2 (Super Cheap) and 3.0 (Super Expensive)
      // This drastically changes the "cost" landscape for the algorithm
      subjectBias[s.id] = 0.2 + (Math.random() * 2.8);
    });

    // 2. Reset: Build initial state with 0 ESA
    let state = subjects.map(sub => {
      const m = marks[sub.id] || {};
      const { currentInternals, totalWeight, esaWeight, momentumScore } = getSubjectMetrics(sub);
      const esaMax = m.esaMax || 100;

      const projectedEsaScore = (momentumScore / 100) * esaWeight;
      const projectedInternals = (momentumScore * totalWeight / 100) - projectedEsaScore;
      const isProjecting = projectedInternals > currentInternals + 0.1;

      const isEsaEntered = m.esa !== '' && m.esa !== undefined && !isNaN(parseFloat(m.esa));
      const manualLockVal = lockedSubjects[sub.id];
      const isLocked = manualLockVal !== undefined || isEsaEntered;

      let effectiveEsa = 0;
      if (manualLockVal !== undefined) effectiveEsa = manualLockVal;
      else if (isEsaEntered) effectiveEsa = parseFloat(m.esa);

      if (isLocked) {
        const effectiveInternals = isProjecting ? projectedInternals : currentInternals;
        const esaComponent = (effectiveEsa / esaMax) * esaWeight;
        const totalScore = Math.ceil(((effectiveInternals + esaComponent) / totalWeight) * 100);
        const gradeInfo = getGradeInfo(totalScore);

        return {
          ...sub,
          locked: true,
          currentGradeInfo: gradeInfo,
          currentGP: gradeInfo.gp,
          requiredEsa: effectiveEsa,
          esaMax,
          currentInternals: effectiveInternals,
          totalWeight, esaWeight
        };
      }

      // Unlocked starts at 0 ESA
      const zeroEsaScore = Math.ceil((projectedInternals / totalWeight) * 100);
      const startGradeInfo = getGradeInfo(zeroEsaScore);

      return {
        ...sub,
        locked: false,
        currentGradeInfo: startGradeInfo,
        currentGP: startGradeInfo.gp,
        requiredEsa: 0,
        esaMax,
        currentInternals: projectedInternals,
        totalWeight, esaWeight
      };
    });

    const totalCredits = subjects.reduce((sum, s) => sum + s.credits, 0);
    const targetTotalGP = reverseTargetSgpa * totalCredits;
    let currentTotalGP = state.reduce((sum, s) => sum + (s.currentGP * s.credits), 0);

    // 3. Optimization Loop (Hill Climbing with Bias)
    let iterations = 0;
    while (currentTotalGP < targetTotalGP && iterations < 1000) {
      iterations++;
      let bestUpgrade = null;
      let maxEfficiency = -Infinity; // Start very low

      state.forEach((sub, idx) => {
        if (sub.locked) return;

        // FIX: Use 'GradeMap' which is defined at the top of your file
        const activeMap = sub.customGradeMap || GradeMap;

        const nextGrade = activeMap.slice().reverse().find(g => g.gp > sub.currentGP);

        if (!nextGrade) return;

        const requiredTotal = (nextGrade.min * sub.totalWeight) / 100;
        const requiredEsaComponent = requiredTotal - sub.currentInternals;
        const requiredEsa = Math.ceil((requiredEsaComponent / sub.esaWeight) * sub.esaMax);

        if (requiredEsa > sub.esaMax) return;

        const markCost = requiredEsa - sub.requiredEsa;
        const gpGain = (nextGrade.gp - sub.currentGP) * sub.credits;

        // --- THE MAGIC IS HERE ---
        // We divide efficiency by our random bias.
        // If bias is high (expensive), efficiency drops, and the algorithm ignores this subject.
        const bias = subjectBias[sub.id];
        const biasedCost = (markCost <= 0 ? 0.0001 : markCost) * bias;

        const efficiency = gpGain / biasedCost;

        if (efficiency > maxEfficiency) {
          maxEfficiency = efficiency;
          bestUpgrade = { idx, nextGrade, requiredEsa, gpGain };
        }
      });

      if (!bestUpgrade) break;

      const targetSub = state[bestUpgrade.idx];
      targetSub.currentGradeInfo = bestUpgrade.nextGrade;
      targetSub.currentGP = bestUpgrade.nextGrade.gp;
      targetSub.requiredEsa = Math.max(0, bestUpgrade.requiredEsa);
      currentTotalGP += bestUpgrade.gpGain;
    }

    // 4. Return results (Standard Format)
    return state.map(s => ({
      ...s,
      projectedScore: s.currentGradeInfo.min,
      projectedGrade: s.currentGradeInfo.grade,
      gp: s.currentGP,
      isImpossible: s.requiredEsa > s.esaMax,
      alreadyAchieved: s.requiredEsa <= 0,
      isHardLocked: lockedSubjects[s.id] === undefined && marks[s.id]?.esa
    })).sort((a, b) => {
      if (a.locked !== b.locked) return a.locked ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  };

  // --- Balanced Path (The "Spread the Load" Method) ---
  const calculateBalancedPath = () => {
    // 1. Reset: Build initial state (Same as others)
    let state = subjects.map(sub => {
      const m = marks[sub.id] || {};
      const { currentInternals, totalWeight, esaWeight, momentumScore } = getSubjectMetrics(sub);
      const esaMax = m.esaMax || 100;

      const projectedEsaScore = (momentumScore / 100) * esaWeight;
      const projectedInternals = (momentumScore * totalWeight / 100) - projectedEsaScore;

      // FIX: Use the specific empty check (same as your recent fix)
      const missingIsa1 = m.isa1 === '' || m.isa1 === undefined;
      const missingIsa2 = m.isa2 === '' || m.isa2 === undefined;
      const missingAssign = sub.hasAssignment && (m.assignment === '' || m.assignment === undefined);
      const missingLab = sub.hasLab && (m.lab === '' || m.lab === undefined);

      const isProjecting = missingIsa1 || missingIsa2 || missingAssign || missingLab;

      const isEsaEntered = m.esa !== '' && m.esa !== undefined && !isNaN(parseFloat(m.esa));
      const manualLockVal = lockedSubjects[sub.id];
      const isLocked = manualLockVal !== undefined || isEsaEntered;

      let effectiveEsa = 0;
      if (manualLockVal !== undefined) effectiveEsa = manualLockVal;
      else if (isEsaEntered) effectiveEsa = parseFloat(m.esa);

      if (isLocked) {
        const effectiveInternals = isProjecting ? projectedInternals : currentInternals;
        const esaComponent = (effectiveEsa / esaMax) * esaWeight;
        const totalScore = Math.ceil(((effectiveInternals + esaComponent) / totalWeight) * 100);
        const gradeInfo = getGradeInfo(totalScore);

        return {
          ...sub,
          locked: true,
          currentGradeInfo: gradeInfo,
          currentGP: gradeInfo.gp,
          requiredEsa: effectiveEsa,
          esaMax,
          currentInternals: effectiveInternals,
          totalWeight, esaWeight
        };
      }

      const zeroEsaScore = Math.ceil((projectedInternals / totalWeight) * 100);
      const startGradeInfo = getGradeInfo(zeroEsaScore);

      return {
        ...sub,
        locked: false,
        currentGradeInfo: startGradeInfo,
        currentGP: startGradeInfo.gp,
        requiredEsa: 0,
        esaMax,
        currentInternals: projectedInternals,
        totalWeight, esaWeight
      };
    });

    const totalCredits = subjects.reduce((sum, s) => sum + s.credits, 0);
    const targetTotalGP = reverseTargetSgpa * totalCredits;
    let currentTotalGP = state.reduce((sum, s) => sum + (s.currentGP * s.credits), 0);

    // 2. Optimization Loop (Quadratic Cost)
    let iterations = 0;
    while (currentTotalGP < targetTotalGP && iterations < 1000) {
      iterations++;
      let bestUpgrade = null;
      let maxEfficiency = -Infinity;

      state.forEach((sub, idx) => {
        if (sub.locked) return;

        const activeMap = sub.customGradeMap || GradeMap;
        const nextGrade = activeMap.slice().reverse().find(g => g.gp > sub.currentGP);
        if (!nextGrade) return;

        const requiredTotal = (nextGrade.min * sub.totalWeight) / 100;
        const requiredEsaComponent = requiredTotal - sub.currentInternals;
        const requiredEsa = Math.ceil((requiredEsaComponent / sub.esaWeight) * sub.esaMax);

        if (requiredEsa > sub.esaMax) return;

        const markCost = requiredEsa - sub.requiredEsa;
        const gpGain = (nextGrade.gp - sub.currentGP) * sub.credits;

        // --- THE BALANCING LOGIC ---
        // We square the total ESA needed. 
        // This makes high scores EXPONENTIALLY harder to justify.
        // Going from 40->50 is cheap. Going from 90->100 is very expensive.
        const currentStrain = Math.pow(Math.max(0, sub.requiredEsa), 2);
        const nextStrain = Math.pow(requiredEsa, 2);
        const strainIncrease = nextStrain - currentStrain;

        const efficiency = gpGain / (strainIncrease <= 0 ? 0.0001 : strainIncrease);

        if (efficiency > maxEfficiency) {
          maxEfficiency = efficiency;
          bestUpgrade = { idx, nextGrade, requiredEsa, gpGain };
        }
      });

      if (!bestUpgrade) break;

      const targetSub = state[bestUpgrade.idx];
      targetSub.currentGradeInfo = bestUpgrade.nextGrade;
      targetSub.currentGP = bestUpgrade.nextGrade.gp;
      targetSub.requiredEsa = Math.max(0, bestUpgrade.requiredEsa);
      currentTotalGP += bestUpgrade.gpGain;
    }

    return state.map(s => ({
      ...s,
      projectedScore: s.currentGradeInfo.min,
      projectedGrade: s.currentGradeInfo.grade,
      gp: s.currentGP,
      isImpossible: s.requiredEsa > s.esaMax,
      alreadyAchieved: s.requiredEsa <= 0,
      isHardLocked: lockedSubjects[s.id] === undefined && marks[s.id]?.esa
    })).sort((a, b) => {
      if (a.locked !== b.locked) return a.locked ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  };

  // --- Minimum Passing Table Logic ---
  const getMinimumPassingTable = () => {
    return subjects.map(sub => {
      const { currentInternals, totalWeight, esaWeight } = getSubjectMetrics(sub);
      const esaMax = marks[sub.id]?.esaMax || 100;

      const gradeRequirements = GradeMap.slice(0, -1).map(g => {
        const result = getRequiredESAForGrade(sub, g.min, true);
        const isa2Info = getRequiredISA2ForGrade(sub, g.min, { assumeFullForEmptyInternals: true });

        return {
          grade: g.grade,
          gp: g.gp,
          requiredEsa: result.safe !== null ? Math.max(0, result.safe) : null,
          minimumEsa: result.minimum !== null ? Math.max(0, result.minimum) : null,
          possible: result.safe !== null,
          alreadyAchieved: result.safe === 0,
          requiresRounding: result.requiresRounding || false,
          easy: result.safe > 0 && result.safe <= 50 && !result.requiresRounding,
          moderate: result.safe > 50 && result.safe <= 75 && !result.requiresRounding,
          hard: (result.safe > 75 && !result.requiresRounding) || result.requiresRounding,
          showIsa2Needed: !!isa2Info,
          isa2Needed: isa2Info ? isa2Info.needed : null,
          isa2Max: isa2Info ? isa2Info.max : null
        };
      });

      const passReq = gradeRequirements.find(g => g.grade === 'E');

      return {
        ...sub,
        esaMax,
        gradeRequirements,
        minimumToPass: passReq?.requiredEsa || 0,
        canPass: passReq?.possible || false
      };
    });
  };

  // --- Range Calculation (Min/Max Achievable) ---
  const sgpaRange = useMemo(() => {
    let totalCredits = 0;
    let minWeightedGP = 0;
    let maxWeightedGP = 0;

    subjects.forEach(sub => {
      const m = marks[sub.id] || {};
      const { totalWeight } = getSubjectMetrics(sub);

      let rawLoss = 0;    // Marks definitively lost
      let rawSecured = 0; // Marks definitively secured

      // Helper to check components
      const checkComp = (val, max, weight) => {
        if (val !== '' && val !== undefined && !isNaN(parseFloat(val))) {
          const v = parseFloat(val);
          const mx = parseFloat(max);
          const w = parseFloat(weight);
          // Calculate raw weighted score
          const score = (v / mx) * w;
          rawSecured += score;
          // Calculate raw lost marks
          rawLoss += (w - score);
        }
      };

      checkComp(m.isa1, m.isa1Max, sub.isaWeight);
      checkComp(m.isa2, m.isa2Max, sub.isaWeight);
      if (sub.hasAssignment) checkComp(m.assignment, m.assignmentMax, sub.assignmentWeight);
      if (sub.hasLab) checkComp(m.lab, m.labMax, sub.labWeight);
      // For ESA: If not entered, Max assumes full marks, Min assumes 0
      checkComp(m.esa, m.esaMax, sub.esaWeight);

      // WORST CASE: Assumes 0 in all empty fields
      const minPercent = Math.ceil((rawSecured / totalWeight) * 100);

      // BEST CASE: Assumes Full Marks in all empty fields
      const maxRawScore = totalWeight - rawLoss;
      const maxPercent = Math.ceil((maxRawScore / totalWeight) * 100);

      minWeightedGP += getGradePoint(minPercent, sub) * sub.credits;
      maxWeightedGP += getGradePoint(maxPercent, sub) * sub.credits;
      totalCredits += sub.credits;
    });

    return {
      min: totalCredits > 0 ? (minWeightedGP / totalCredits).toFixed(2) : 0,
      max: totalCredits > 0 ? (maxWeightedGP / totalCredits).toFixed(2) : 10
    };
  }, [subjects, marks]);

  const metrics = calculateAnalysis();
  const strategy = getSmartSuggestions();
  const reverseResults = calculateReverseRequirements();
  const minimumPassingTable = getMinimumPassingTable();

  // Grade Distribution Calculation
  const gradeDistribution = useMemo(() => {
    const dist = { S: 0, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
    subjects.forEach(sub => {
      const { finalScore } = getSubjectMetrics(sub);
      const gradeInfo = getGradeInfo(finalScore);
      dist[gradeInfo.grade]++;
    });
    return dist;
  }, [subjects, marks]);

  // Alerts Calculation
  const alerts = useMemo(() => {
    const alertList = [];
    subjects.forEach(sub => {
      const { finalScore, momentumScore } = getSubjectMetrics(sub);
      const m = marks[sub.id] || {};

      // Critical: Failing
      if (finalScore < 40 && (m.isa1 !== '' || m.isa2 !== '')) {
        alertList.push({
          type: 'critical',
          subject: sub.name,
          message: `Currently at ${finalScore}%. Risk of failing!`
        });
      }

      // Opportunity: Easy grade jump
      const currentGP = getGradePoint(finalScore);
      const nextGrade = GradeMap.slice().reverse().find(g => g.gp > currentGP);
      if (nextGrade) {
        const { currentInternals, totalWeight, esaWeight } = getSubjectMetrics(sub);
        const esaMax = m.esaMax || 100;
        const requiredTotal = (nextGrade.min * totalWeight) / 100;
        const requiredEsaComponent = requiredTotal - currentInternals;
        const requiredEsa = Math.ceil((requiredEsaComponent / esaWeight) * esaMax);

        if (requiredEsa > 0 && requiredEsa <= 40 && !m.esa) {
          alertList.push({
            type: 'opportunity',
            subject: sub.name,
            message: `Just ${requiredEsa}/${esaMax} in ESA gets you ${nextGrade.grade} grade!`
          });
        }
      }
    });
    return alertList;
  }, [subjects, marks]);

  // CGPA Logic
  const calculateCGPA = () => {
    const prevSgpa = parseFloat(prevCgpaDetails.sgpa);
    const prevCreds = parseFloat(prevCgpaDetails.credits);
    const currSgpa = parseFloat(sgpa);
    const currCreds = metrics.totalCredits;

    if (!isNaN(prevSgpa) && !isNaN(prevCreds) && currCreds > 0) {
      const totalPoints = (prevSgpa * prevCreds) + (currSgpa * currCreds);
      const totalCreds = prevCreds + currCreds;
      return (totalPoints / totalCreds).toFixed(2);
    }
    return null;
  };

  const finalCgpa = calculateCGPA();

  // --- Theme Classes (Premium Obsidian Glass) ---
  const themeClasses = {
    bg: 'bg-transparent',
    text: 'text-[#c5c6d0]',
    card: 'glass-card rounded-2xl',
    cardHover: 'glass-card-hover',
    input: 'glass-input focus:ring-4 focus:ring-indigo-500/10 placeholder:text-zinc-700',
    inputBg: 'bg-black/40',
    muted: 'text-zinc-500',
    border: 'border-white/[0.05]',
  };

  return (
    <div className={`min-h-screen ${themeClasses.bg} ${themeClasses.text} font-sans pb-24`}>
      {/* Glass Header */}
      <div className="bg-[#030307]/60 backdrop-blur-xl border-b border-white/[0.04] text-zinc-200 py-3 px-3.5 md:py-5 md:px-6 sticky top-0 z-50 shadow-2xl shadow-black/35">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-lg md:text-2xl font-extrabold font-display flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <GraduationCap className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <span className="text-zinc-100 tracking-tight font-black">PESU Calculator</span>
            </h1>
            <p className="text-zinc-500 text-[9px] md:text-[10px] mt-1 font-medium tracking-widest uppercase pl-[40px] md:pl-[52px] hidden sm:block">
              Universal &bull; Auto-Saves &bull; Any College
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Current SGPA</div>
              <div className={`text-2xl md:text-4xl font-extrabold font-display tabular-nums tracking-tight ${parseFloat(sgpa) >= targetSgpa ? 'text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.3)]' : 'text-white'}`}>
                {sgpa}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:block sticky top-[72px] md:top-[81px] z-40 bg-[#030307]/50 backdrop-blur-xl border-b border-white/[0.04]">
        <div className="max-w-4xl mx-auto flex overflow-x-auto gap-2 px-4 py-2">
          {[
            { id: 'subjects', label: 'Subjects', icon: BookOpen },
            { id: 'analysis', label: 'Analysis', icon: Activity, accent: 'blue' },
            { id: 'reverse', label: 'Reverse Calc', icon: Target, accent: 'emerald' },
            { id: 'attendance', label: 'Attendance', icon: CheckCircle2 },
            { id: 'cgpa', label: 'CGPA', icon: Calculator },
            { id: 'guide', label: 'Guide', icon: HelpCircle },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-300 whitespace-nowrap ${activeTab === tab.id
                ? 'text-white'
                : 'text-zinc-500 hover:text-zinc-300'
                }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTabBg"
                  className="absolute inset-0 bg-white/[0.04] border border-white/[0.06] rounded-xl -z-10 shadow-sm"
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                />
              )}
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
              {tab.accent && activeTab !== tab.id && (
                <span className={`w-1.5 h-1.5 rounded-full ${tab.accent === 'blue' ? 'bg-indigo-500' : 'bg-emerald-500'} animate-pulse`} />
              )}
            </button>
          ))}
        </div>
      </div>

      <motion.div
        key={activeTab}
        className="max-w-4xl mx-auto p-3 md:p-4 space-y-4 md:space-y-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {/* ==================== SUBJECTS TAB ==================== */}
        {activeTab === 'subjects' && (
          <>
            {/* Helper Banner (Optimized for both Mobile & Desktop) */}
            <div className={`glass-card border border-white/[0.04] rounded-2xl p-3 md:p-4 text-sm flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 shadow-xl`}>

              {/* LEFT SIDE: Text Content (Unified Collapsible for Desktop & Mobile) */}
              <div className="flex-1">
                <details className="group">
                  <summary className="flex items-center gap-2 cursor-pointer list-none select-none text-indigo-400 hover:text-indigo-300 transition-colors font-semibold">
                    <Settings className="w-4 h-4 flex-shrink-0" />
                    <span className="font-bold text-zinc-100 font-display">Universal Calculator</span>
                    <span className="text-[9px] bg-indigo-500/10 px-2 py-0.5 rounded-full text-indigo-400 font-bold flex items-center gap-0.5 border border-indigo-500/15">
                      Info <ChevronDown className="w-2.5 h-2.5 transition-transform group-open:rotate-180" />
                    </span>
                  </summary>

                  <div className={`mt-3 text-xs text-zinc-500 leading-relaxed pl-6 border-t border-white/[0.04] pt-3 space-y-2`}>
                    <p>
                      Works for all semesters. 5-credit courses scale from 120% to 100%.
                    </p>
                    <p>
                      After entering ISA/Lab/Assignment marks, you can check the <strong className="text-zinc-400 font-semibold">Analysis</strong> tab for predictions and how much to score in ESA to reach your target grade in each subject and <strong className="text-zinc-400 font-semibold">Reverse Calc</strong> tab to know what to score in ESAs to reach your target SGPA.
                    </p>
                    <p>
                      This calculator works for any college. Define your assessment pattern and grading scheme below, then click "Create Subject".
                    </p>
                  </div>
                </details>
              </div>

              {/* RIGHT SIDE: Buttons (Always Visible) */}
              <div className="flex flex-wrap gap-2 items-center justify-end border-t border-white/[0.04] pt-3 md:border-none md:pt-0">
                <select
                  onChange={(e) => loadPreset(e.target.value)}
                  className="glass-input px-3 py-1.5 rounded-xl text-xs border max-w-[130px] md:max-w-none font-bold bg-black/50"
                  defaultValue=""
                >
                  <option value="">Load Preset...</option>
                  {Object.keys(SemesterPresets).map(key => (
                    <option key={key} value={key}>{key}</option>
                  ))}
                </select>

                <div className="flex gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/[0.04]">
                  <button onClick={undo} disabled={undoStack.length === 0} className={`p-1.5 rounded-lg transition-colors ${undoStack.length === 0 ? 'opacity-25 cursor-not-allowed' : 'text-zinc-300 hover:bg-white/[0.05]'}`}>
                    <Undo2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={redo} disabled={redoStack.length === 0} className={`p-1.5 rounded-lg transition-colors ${redoStack.length === 0 ? 'opacity-25 cursor-not-allowed' : 'text-zinc-300 hover:bg-white/[0.05]'}`}>
                    <Redo2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button onClick={exportData} className="flex items-center gap-1.5 bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] text-zinc-300 px-3 py-1.5 rounded-xl transition-all text-xs font-semibold">
                  <Download className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Export</span>
                </button>

                <label className="flex items-center gap-1.5 bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] text-zinc-300 px-3 py-1.5 rounded-xl transition-all text-xs font-semibold cursor-pointer font-sans">
                  <Upload className="w-3.5 h-3.5" /> <span className="hidden sm:inline font-sans font-semibold">Import</span>
                  <input type="file" accept=".json" onChange={importData} className="hidden" />
                </label>

                <button onClick={clearAll} className="flex items-center gap-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 rounded-xl border border-red-500/20 transition-colors text-xs font-bold" title="Reset All Data">
                  <Eraser className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

            {/* Grade Distribution Bar */}
            <div className="glass-card border border-white/[0.04] rounded-2xl p-4 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold flex items-center gap-2 font-display text-zinc-100">
                  <BarChart3 className="w-4 h-4 text-indigo-400" /> Grade Distribution
                </span>
                <span className="text-xs text-zinc-500 font-medium">
                  {subjects.length} subjects &bull; {metrics.totalCredits} credits
                </span>
              </div>
              <div className="flex gap-1 h-5 rounded-xl overflow-hidden bg-black/40 p-0.5 border border-white/[0.03]">
                {Object.entries(gradeDistribution).map(([grade, count]) => {
                  if (count === 0) return null;
                  const gradeInfo = GradeMap.find(g => g.grade === grade);
                  return (
                    <div
                      key={grade}
                      className={`flex items-center justify-center text-[10px] font-extrabold text-white rounded-lg transition-all duration-300 ${gradeInfo?.bg || 'bg-gray-500'} shadow-sm`}
                      style={{ width: `${(count / subjects.length) * 100}%` }}
                      title={`${grade}: ${count} subject(s)`}
                    >
                      {grade} ({count})
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Subjects List */}
            <div className="space-y-4">
              {subjects.map((subject) => {
                const m = marks[subject.id] || {};
                const { finalScore, rawScore, totalWeight } = getSubjectMetrics(subject);
                const gp = getGradePoint(finalScore, subject);
                const gradeInfo = getGradeInfo(finalScore, subject);
                const isExpanded = expandedSubject === subject.id;
                const hasLabComponent = subject.hasLab || ((subject.customConfig?.weights.lab ?? 0) > 0);
                const showTotalWeight = hasLabComponent && totalWeight > 100;
                const totalWeightLabel = Number.isInteger(totalWeight) ? totalWeight : totalWeight.toFixed(1);
                const rawScoreLabel = Number.isInteger(rawScore) ? rawScore : rawScore.toFixed(1);

                return (
                  <div key={subject.id} className={`glass-card rounded-2xl border transition-all duration-300 ease-out ${isExpanded ? 'border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.06)] ring-1 ring-indigo-500/10' : 'glass-card-hover border-white/[0.04]'}`}>
                    {/* Subject Header */}
                    <div
                      className="p-3 md:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between cursor-pointer rounded-t-2xl gap-3 md:gap-4 select-none"
                      onClick={() => setExpandedSubject(isExpanded ? null : subject.id)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold font-display text-zinc-100 text-base md:text-lg tracking-tight">{subject.name}</h3>
                          <span className="text-[9px] md:text-[10px] font-extrabold bg-white/[0.03] text-zinc-300 px-2 md:px-2.5 py-0.5 rounded-xl border border-white/[0.05] tracking-wider uppercase">
                            {subject.credits} Credits
                          </span>
                          {totalWeight > 100 && (
                            <span className="text-[8px] md:text-[9px] font-extrabold bg-indigo-500/10 text-indigo-300 px-1.5 md:px-2 py-0.5 rounded-full border border-indigo-500/15 tracking-wide uppercase">
                              Scaled ({totalWeight})
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 md:gap-4 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="text-right">
                          <div className={`text-[9px] md:text-[10px] ${themeClasses.muted} font-bold uppercase tracking-wider`}>Score</div>
                          <div className={`font-black font-display text-lg md:text-xl leading-none ${gradeInfo.color} tracking-tight`}>
                            {finalScore}
                          </div>
                          {showTotalWeight && (
                            <div className={`text-[8px] md:text-[9px] ${themeClasses.muted} mt-0.5 font-medium`}>
                              actual: {rawScoreLabel}/{totalWeightLabel}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 md:gap-3">
                          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex flex-col items-center justify-center font-extrabold text-xs md:text-sm border shadow-md transition-all duration-300 bg-white/[0.01] ${gradeInfo.color} ${isExpanded ? 'scale-105 border-white/10' : 'border-white/[0.04]'}`}>
                            <span className="text-[7px] md:text-[8px] text-zinc-500 uppercase tracking-widest font-extrabold leading-none mb-0.5">Grade</span>
                            <span className="text-sm md:text-base leading-none font-display font-black">{gradeInfo.grade}</span>
                          </div>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="p-3 md:p-4 border-t border-white/[0.04] bg-[#030307]/30 rounded-b-2xl">
                        {/* DYNAMIC INPUTS GRID (Fixed: Allows 0 marks) */}
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 md:gap-3 mb-3 md:mb-4">

                          {/* SLOT 1 */}
                          {(subject.hasIsa1 !== false) && (
                            <div className="glass-card bg-black/25 p-2.5 md:p-3 rounded-xl border border-white/[0.03] shadow-sm hover:border-white/[0.06] transition-all duration-300">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-extrabold text-[11px] truncate pr-1 text-zinc-300" title={subject.customConfig?.labels.isa1 || "ISA 1"}>
                                  {subject.customConfig?.labels.isa1 || "ISA 1"}
                                </span>
                                <span className="text-[9px] text-zinc-500 font-bold bg-white/[0.02] px-1.5 py-0.5 rounded border border-white/[0.03]">
                                  {subject.customConfig ? subject.customConfig.weights.isa1 : subject.isaWeight}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 mt-1.5 bg-black/30 px-2 md:px-2.5 py-1 md:py-1.5 rounded-xl border border-white/[0.04] focus-within:border-indigo-500/50 transition-all duration-300">
                                <input
                                  type="number"
                                  value={marks[subject.id]?.isa1 ?? ''}
                                  onChange={(e) => handleMarkChange(subject.id, 'isa1', e.target.value)}
                                  className="w-full bg-transparent text-sm font-extrabold focus:outline-none text-center text-white"
                                  placeholder="-"
                                />
                                <span className="text-zinc-600 font-bold">/</span>
                                <input
                                  type="number"
                                  value={marks[subject.id]?.isa1Max ?? 40}
                                  onChange={(e) => handleMarkChange(subject.id, 'isa1Max', e.target.value)}
                                  className="w-8 bg-transparent text-xs text-center text-zinc-500 focus:outline-none font-bold focus:text-zinc-300 transition-colors"
                                />
                              </div>
                            </div>
                          )}

                          {/* SLOT 2 */}
                          {(subject.hasIsa2 !== false) && (
                            <div className="glass-card bg-black/25 p-2.5 md:p-3 rounded-xl border border-white/[0.03] shadow-sm hover:border-white/[0.06] transition-all duration-300">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-extrabold text-[11px] truncate pr-1 text-zinc-300" title={subject.customConfig?.labels.isa2 || "ISA 2"}>
                                  {subject.customConfig?.labels.isa2 || "ISA 2"}
                                </span>
                                <span className="text-[9px] text-zinc-500 font-bold bg-white/[0.02] px-1.5 py-0.5 rounded border border-white/[0.03]">
                                  {subject.customConfig ? subject.customConfig.weights.isa2 : subject.isaWeight}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 mt-1.5 bg-black/30 px-2 md:px-2.5 py-1 md:py-1.5 rounded-xl border border-white/[0.04] focus-within:border-indigo-500/50 transition-all duration-300">
                                <input
                                  type="number"
                                  value={marks[subject.id]?.isa2 ?? ''}
                                  onChange={(e) => handleMarkChange(subject.id, 'isa2', e.target.value)}
                                  className="w-full bg-transparent text-sm font-extrabold focus:outline-none text-center text-white"
                                  placeholder="-"
                                />
                                <span className="text-zinc-600 font-bold">/</span>
                                <input
                                  type="number"
                                  value={marks[subject.id]?.isa2Max ?? 40}
                                  onChange={(e) => handleMarkChange(subject.id, 'isa2Max', e.target.value)}
                                  className="w-8 bg-transparent text-xs text-center text-zinc-500 focus:outline-none font-bold focus:text-zinc-300 transition-colors"
                                />
                              </div>
                            </div>
                          )}

                          {/* SLOT 3 */}
                          {(subject.hasAssignment || (subject.customConfig?.weights.assignment > 0)) && (
                            <div className="glass-card bg-black/25 p-2.5 md:p-3 rounded-xl border border-white/[0.03] shadow-sm hover:border-white/[0.06] transition-all duration-300">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-extrabold text-[11px] truncate pr-1 text-zinc-300" title={subject.customConfig?.labels.assignment || "Assignment"}>
                                  {subject.customConfig?.labels.assignment || "Assignment"}
                                </span>
                                <span className="text-[9px] text-zinc-500 font-bold bg-white/[0.02] px-1.5 py-0.5 rounded border border-white/[0.03]">
                                  {subject.customConfig ? subject.customConfig.weights.assignment : subject.assignmentWeight}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 mt-1.5 bg-black/30 px-2 md:px-2.5 py-1 md:py-1.5 rounded-xl border border-white/[0.04] focus-within:border-indigo-500/50 transition-all duration-300">
                                <input
                                  type="number"
                                  value={marks[subject.id]?.assignment ?? ''}
                                  onChange={(e) => handleMarkChange(subject.id, 'assignment', e.target.value)}
                                  className="w-full bg-transparent text-sm font-extrabold focus:outline-none text-center text-white"
                                  placeholder="-"
                                />
                                <span className="text-zinc-600 font-bold">/</span>
                                <input
                                  type="number"
                                  value={marks[subject.id]?.assignmentMax ?? 10}
                                  onChange={(e) => handleMarkChange(subject.id, 'assignmentMax', e.target.value)}
                                  className="w-8 bg-transparent text-xs text-center text-zinc-500 focus:outline-none font-bold focus:text-zinc-300 transition-colors"
                                />
                              </div>
                            </div>
                          )}

                          {/* SLOT 4 */}
                          {(subject.hasLab || (subject.customConfig?.weights.lab > 0)) && (
                            <div className="glass-card bg-black/25 p-2.5 md:p-3 rounded-xl border border-white/[0.03] shadow-sm hover:border-white/[0.06] transition-all duration-300">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-extrabold text-[11px] truncate pr-1 text-zinc-300" title={subject.customConfig?.labels.lab || "Lab"}>
                                  {subject.customConfig?.labels.lab || "Lab"}
                                </span>
                                <span className="text-[9px] text-zinc-500 font-bold bg-white/[0.02] px-1.5 py-0.5 rounded border border-white/[0.03]">
                                  {subject.customConfig ? subject.customConfig.weights.lab : subject.labWeight}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 mt-1.5 bg-black/30 px-2 md:px-2.5 py-1 md:py-1.5 rounded-xl border border-white/[0.04] focus-within:border-indigo-500/50 transition-all duration-300">
                                <input
                                  type="number"
                                  value={marks[subject.id]?.lab ?? ''}
                                  onChange={(e) => handleMarkChange(subject.id, 'lab', e.target.value)}
                                  className="w-full bg-transparent text-sm font-extrabold focus:outline-none text-center text-white"
                                  placeholder="-"
                                />
                                <span className="text-zinc-600 font-bold">/</span>
                                <input
                                  type="number"
                                  value={marks[subject.id]?.labMax ?? 20}
                                  onChange={(e) => handleMarkChange(subject.id, 'labMax', e.target.value)}
                                  className="w-8 bg-transparent text-xs text-center text-zinc-500 focus:outline-none font-bold focus:text-zinc-300 transition-colors"
                                />
                              </div>
                            </div>
                          )}

                          {/* SLOT 5: ESA */}
                          <div className="glass-card bg-black/25 p-2.5 md:p-3 rounded-xl border border-indigo-500/20 shadow-sm hover:border-indigo-500/40 transition-all duration-300">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-extrabold text-[11px] text-indigo-400 truncate pr-1" title={subject.customConfig?.labels.esa || "ESA"}>
                                {subject.customConfig?.labels.esa || "ESA"}
                              </span>
                              <span className="text-[9px] text-indigo-400 font-bold bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/15">
                                {subject.customConfig ? subject.customConfig.weights.esa : subject.esaWeight}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 mt-1.5 bg-indigo-950/20 px-2 md:px-2.5 py-1 md:py-1.5 rounded-xl border border-indigo-500/25 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all duration-300">
                              <input
                                type="number"
                                value={marks[subject.id]?.esa ?? ''}
                                onChange={(e) => handleMarkChange(subject.id, 'esa', e.target.value)}
                                className="w-full bg-transparent text-sm font-extrabold focus:outline-none text-center text-indigo-200"
                                placeholder="-"
                              />
                              <span className="text-indigo-700/60 font-bold">/</span>
                              <input
                                type="number"
                                value={marks[subject.id]?.esaMax ?? 100}
                                onChange={(e) => handleMarkChange(subject.id, 'esaMax', e.target.value)}
                                className="w-8 bg-transparent text-xs text-center text-indigo-500/70 focus:outline-none font-bold focus:text-indigo-300 transition-colors"
                              />
                            </div>
                          </div>

                        </div>

                        {/* Quick Config */}
                        <div className="mt-4 pt-4 border-t border-white/[0.04]">
                          <details className="group">
                            <summary className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider cursor-pointer hover:text-indigo-400 select-none transition-colors">
                              <Settings className="w-3.5 h-3.5" /> Edit Subject Details
                            </summary>
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 glass-card bg-black/30 rounded-xl border border-white/[0.04]">
                              <div className="space-y-4">
                                <div>
                                  <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block mb-1">Subject Name</label>
                                  <input
                                    type="text"
                                    value={subject.name}
                                    onChange={(e) => handleSubjectChange(subject.id, 'name', e.target.value)}
                                    className="w-full text-xs font-semibold p-2.5 glass-input font-sans"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block mb-1">Credits</label>
                                  <input
                                    type="number"
                                    value={subject.credits}
                                    onChange={(e) => handleSubjectChange(subject.id, 'credits', parseFloat(e.target.value) || 0)}
                                    className="w-full text-xs font-semibold p-2.5 glass-input"
                                  />
                                </div>
                                <div className="flex gap-4 pt-1">
                                  <label className="flex items-center gap-2 text-xs font-semibold text-zinc-400 cursor-pointer select-none">
                                    <input
                                      type="checkbox"
                                      checked={subject.hasAssignment}
                                      onChange={() => toggleAssignment(subject.id)}
                                      className="rounded border-white/10 bg-black/40 text-indigo-600 focus:ring-indigo-500/30 w-4 h-4 transition-all"
                                    />
                                    Has Assignment
                                  </label>
                                  <label className="flex items-center gap-2 text-xs font-semibold text-zinc-400 cursor-pointer select-none">
                                    <input
                                      type="checkbox"
                                      checked={subject.hasLab}
                                      onChange={() => toggleLab(subject.id)}
                                      className="rounded border-white/10 bg-black/40 text-indigo-600 focus:ring-indigo-500/30 w-4 h-4 transition-all"
                                    />
                                    Has Lab
                                  </label>
                                </div>
                              </div>
                              <div className="space-y-4">
                                <div>
                                  <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block mb-1.5">Weight Configuration</label>
                                  <div className="flex gap-2 flex-wrap">
                                    <div className="flex-1 min-w-[70px]">
                                      <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider block mb-1">ISA (Each)</span>
                                      <input
                                        type="number"
                                        value={subject.isaWeight}
                                        onChange={(e) => handleSubjectChange(subject.id, 'isaWeight', parseFloat(e.target.value) || 0)}
                                        className="w-full text-xs font-bold p-2 glass-input text-center"
                                      />
                                    </div>
                                    <div className="flex-1 min-w-[70px]">
                                      <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider block mb-1">ESA</span>
                                      <input
                                        type="number"
                                        value={subject.esaWeight}
                                        onChange={(e) => handleSubjectChange(subject.id, 'esaWeight', parseFloat(e.target.value) || 0)}
                                        className="w-full text-xs font-bold p-2 glass-input text-center"
                                      />
                                    </div>
                                    {subject.hasAssignment && (
                                      <div className="flex-1 min-w-[70px]">
                                        <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider block mb-1">Assign</span>
                                        <input
                                          type="number"
                                          value={subject.assignmentWeight}
                                          onChange={(e) => handleSubjectChange(subject.id, 'assignmentWeight', parseFloat(e.target.value) || 0)}
                                          className="w-full text-xs font-bold p-2 glass-input text-center"
                                        />
                                      </div>
                                    )}
                                    {subject.hasLab && (
                                      <div className="flex-1 min-w-[70px]">
                                        <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider block mb-1">Lab</span>
                                        <input
                                          type="number"
                                          value={subject.labWeight}
                                          onChange={(e) => handleSubjectChange(subject.id, 'labWeight', parseFloat(e.target.value) || 0)}
                                          className="w-full text-xs font-bold p-2 glass-input text-center"
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* --- Grade Cutoff Editor --- */}
                                <div className="mt-4 pt-3 border-t border-white/[0.04] w-full">
                                  <details>
                                    <summary className="text-[10px] font-bold cursor-pointer hover:text-indigo-400 flex items-center gap-1 select-none text-zinc-500 uppercase tracking-wider">
                                      <Target className="w-3.5 h-3.5" /> Adjust Grade Cutoffs (Curve)
                                    </summary>

                                    <div className="mt-3 p-3 bg-amber-500/[0.02] rounded-xl border border-amber-500/10">
                                      <p className="text-[9px] text-amber-300/70 mb-3 font-medium">
                                        If the paper was hard and cutoffs were lowered, adjust them here.
                                      </p>

                                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                        {(subject.customGradeMap || GradeMap).filter(g => g.gp > 0).map((g, idx) => (
                                          <div key={g.grade} className="flex flex-col">
                                            <label className={`text-[9px] font-extrabold text-center mb-1 ${g.color || 'text-zinc-500'}`}>
                                              {g.grade} (&ge;)
                                            </label>
                                            <input
                                              type="number"
                                              value={g.min}
                                              className="w-full text-center text-xs font-bold p-1 glass-input bg-black/50 border-white/[0.04]"
                                              onChange={(e) => {
                                                const val = parseFloat(e.target.value);
                                                if (isNaN(val)) return;

                                                // Create a copy of the current map (or default)
                                                const currentMap = subject.customGradeMap
                                                  ? JSON.parse(JSON.stringify(subject.customGradeMap))
                                                  : JSON.parse(JSON.stringify(GradeMap));

                                                // Update the specific grade
                                                currentMap[idx].min = val;

                                                // Save to subject
                                                handleSubjectChange(subject.id, 'customGradeMap', currentMap);
                                              }}
                                            />
                                          </div>
                                        ))}
                                      </div>

                                      {subject.customGradeMap && (
                                        <button
                                          onClick={() => handleSubjectChange(subject.id, 'customGradeMap', null)}
                                          className="mt-3 text-[9px] text-red-400 hover:text-red-300 hover:underline flex items-center gap-1 font-bold tracking-wide uppercase"
                                        >
                                          <RotateCcw className="w-2.5 h-2.5" /> Reset to Standards
                                        </button>
                                      )}
                                    </div>
                                  </details>
                                </div>

                                <button
                                  onClick={() => removeSubject(subject.id)}
                                  className="w-full text-red-400 text-xs border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 p-2.5 rounded-xl flex items-center justify-center gap-2 mt-4 font-bold transition-all duration-300"
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> Remove Subject
                                </button>
                              </div>
                            </div>
                          </details>
                        </div>

                      </div>
                    )}
                  </div>
                );
              })}
            </div>


            <button
              onClick={addNewSubject}
              className="w-full py-4 border-2 border-dashed border-white/[0.08] hover:border-indigo-500/40 hover:text-indigo-400 bg-white/[0.01] hover:bg-indigo-500/[0.03] rounded-2xl text-zinc-500 transition-all duration-300 flex items-center justify-center gap-2 font-bold text-sm shadow-sm font-display"
            >
              <Plus className="w-4 h-4" /> Add Custom Subject
            </button>

            {/* Subtle "Next Steps" Footer */}
            <div className="mt-8 mb-2 flex justify-center select-none">
              <div className="inline-flex flex-col sm:flex-row items-center gap-3 sm:gap-6 p-1.5 sm:p-2 sm:px-4 rounded-2xl border border-white/[0.04] bg-[#030307]/40 backdrop-blur-md shadow-lg">
                <span className="text-xs font-semibold text-zinc-500 hidden sm:block">
                  Done updating marks?
                </span>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setActiveTab('analysis')}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-extrabold text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/15 rounded-xl border border-indigo-500/15 transition-all"
                  >
                    <Activity className="w-3.5 h-3.5" /> Check Analysis
                  </button>

                  <button
                    onClick={() => setActiveTab('reverse')}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-extrabold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/15 rounded-xl border border-emerald-500/15 transition-all"
                  >
                    <Target className="w-3.5 h-3.5" /> Plan Targets
                  </button>
                </div>
              </div>
            </div>

            {/* Alerts Banner - Inside subjects tab */}
            {alerts.length > 0 && (
              <div className="glass-card border border-white/[0.04] rounded-2xl overflow-hidden shadow-lg">
                <details className="group">
                  <summary className="p-3.5 text-xs font-bold text-zinc-400 select-none list-none flex items-center gap-2 cursor-pointer hover:bg-white/[0.01]">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0" />
                    <span>Subject Warnings ({alerts.length})</span>
                    <ChevronDown className="w-4 h-4 ml-auto opacity-50 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="p-4 border-t border-white/[0.04] bg-black/10 space-y-3">
                    {alerts.filter(a => a.type === 'critical').map((alert, i) => (
                      <div key={i} className="bg-red-500/[0.02] border-l-4 border-red-500/60 p-3.5 rounded-r-2xl flex items-start gap-2.5 border border-white/[0.03]">
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-red-200 block text-xs mb-0.5">{alert.subject}</span>
                          <span className="text-red-400/80 text-xs">{alert.message}</span>
                        </div>
                      </div>
                    ))}
                    {alerts.filter(a => a.type === 'opportunity').slice(0, 2).map((alert, i) => (
                      <div key={i} className="bg-indigo-500/[0.02] border-l-4 border-indigo-500/60 p-3.5 rounded-r-2xl flex items-start gap-2.5 border border-white/[0.03]">
                        <Lightbulb className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-indigo-200 block text-xs mb-0.5">{alert.subject}</span>
                          <span className="text-indigo-400/80 text-xs">{alert.message}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            )}

            {/* ==================== QUICK SGPA ESTIMATOR (FROM GRADES) ==================== */}
            <div className="glass-card border border-white/[0.04] rounded-2xl overflow-hidden shadow-lg mt-6">
              <details className="group">
                <summary className="flex items-center justify-between p-4 cursor-pointer list-none select-none hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400/20 to-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shadow-md">
                      <span className="text-indigo-400 text-lg font-bold">✨</span>
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold font-display text-sm text-zinc-100">Quick SGPA Estimator</h3>
                      <p className="text-[11px] text-zinc-500 font-medium">Calculate SGPA by directly selecting grades</p>
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 opacity-50 transition-transform group-open:rotate-180" />
                </summary>

                <div className="p-4 border-t border-white/[0.04] bg-black/10">

                  {/* Results Header */}
                  <div className="flex items-center justify-between mb-4 bg-black/35 p-3.5 rounded-2xl border border-white/[0.03] shadow-inner">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Hypothetical SGPA</span>
                    <span className="text-2xl font-black font-display text-indigo-400 drop-shadow-[0_0_10px_rgba(99,102,241,0.25)]">
                      {(() => {
                        let totalPoints = 0;
                        let totalCredits = 0;
                        subjects.forEach(sub => {
                          const gradeLetter = manualGrades[sub.id];
                          if (gradeLetter) {
                            // Find GP for this specific subject (supports custom schemes!)
                            const scheme = sub.customGradeMap || GradeMap;
                            const gradeObj = scheme.find(g => g.grade === gradeLetter);
                            if (gradeObj) {
                              totalPoints += gradeObj.gp * sub.credits;
                              totalCredits += sub.credits;
                            }
                          }
                        });
                        return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";
                      })()}
                    </span>
                  </div>

                  {/* Subject List with Dropdowns */}
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                    {subjects.length === 0 ? (
                      <div className="text-center py-6 text-xs text-zinc-600 font-medium">No subjects added yet.</div>
                    ) : (
                      subjects.map(sub => {
                        // Determine which grading scheme to show in dropdown
                        const scheme = sub.customGradeMap || GradeMap;

                        return (
                          <div key={sub.id} className="flex items-center justify-between gap-3 p-2 px-3 bg-black/25 rounded-xl border border-white/[0.03]">
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold text-zinc-200 truncate" title={sub.name}>{sub.name}</div>
                              <div className="text-[9px] text-zinc-500 font-semibold mt-0.5">{sub.credits} Credits</div>
                            </div>

                            <select
                              value={manualGrades[sub.id] || ""}
                              onChange={(e) => setManualGrades(prev => ({ ...prev, [sub.id]: e.target.value }))}
                              className="w-24 p-1.5 glass-input text-xs font-extrabold text-center bg-black/50 border-white/[0.04]"
                            >
                              <option value="">- Select -</option>
                              {scheme.map(g => (
                                <option key={g.grade} value={g.grade}>
                                  {g.grade} ({g.gp})
                                </option>
                              ))}
                            </select>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="mt-3.5 flex justify-end">
                    <button
                      onClick={() => setManualGrades({})}
                      className="text-xs text-red-500 hover:text-red-400 font-bold tracking-wide uppercase"
                    >
                      Reset All
                    </button>
                  </div>

                </div>
              </details>
            </div>

            {/* ==================== NOT FROM PES? CUSTOM TEMPLATE BUILDER ==================== */}
            <div className="glass-card border border-white/[0.04] rounded-2xl overflow-hidden mt-6 shadow-lg">
              <button
                onClick={() => setShowTemplateBuilder(!showTemplateBuilder)}
                className="w-full p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/25 flex items-center justify-center shadow-md">
                    <Settings className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold font-display text-sm text-zinc-100">Not from PES? 🎓</h3>
                    <p className="text-[11px] text-zinc-500 font-medium">Configure for VTU, IIT, or Custom Colleges</p>
                  </div>
                </div>
                {showTemplateBuilder ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showTemplateBuilder && (
                <div className={`p-4 border-t ${themeClasses.border} space-y-6 animate-in slide-in-from-top-2`}>

                  {/* Intro Text */}
                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 from-purple-500/10 to-pink-500/10 p-4 rounded-lg border border-purple-500/20">
                    <p className="text-sm text-purple-200">
                      <strong>Universal Mode:</strong> This calculator works for any college. Define your assessment pattern and grading scheme below, then click "Create Subject".
                    </p>
                  </div>

                  {/* Step 1: Basic Info */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-sm flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-purple-500 text-zinc-200 flex items-center justify-center text-xs">1</span>
                      Basic Information
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`text-xs ${themeClasses.muted} block mb-1`}>Subject Name</label>
                        <input
                          type="text"
                          value={customTemplate.name}
                          onChange={(e) => setCustomTemplate(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g., Data Structures"
                          className={`w-full p-2 border rounded-lg text-sm ${themeClasses.input}`}
                        />
                      </div>
                      <div>
                        <label className={`text-xs ${themeClasses.muted} block mb-1`}>Credits</label>
                        <input
                          type="number"
                          value={customTemplate.credits}
                          onChange={(e) => setCustomTemplate(prev => ({ ...prev, credits: parseFloat(e.target.value) || 0 }))}
                          min="1"
                          max="10"
                          className={`w-full p-2 border rounded-lg text-sm ${themeClasses.input}`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Assessment Components */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-sm flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-purple-500 text-zinc-200 flex items-center justify-center text-xs">2</span>
                      Assessment Pattern
                    </h4>

                    <div className="space-y-2">
                      {customTemplate.components.map((comp, idx) => (
                        <div
                          key={idx}
                          /* CHANGED: 'flex-wrap' allows items to drop to next line on tiny screens */
                          className={`flex flex-wrap sm:flex-nowrap items-center gap-2 p-2 rounded-lg border transition-all ${comp.enabled
                            ? `${themeClasses.card} ${themeClasses.border}`
                            : 'bg-white/[0.04] border-white/[0.08] opacity-50'
                            }`}
                        >
                          <div className="flex items-center gap-2 flex-grow min-w-[120px]">
                            <input
                              type="checkbox"
                              checked={comp.enabled}
                              onChange={(e) => updateTemplateComponent(idx, 'enabled', e.target.checked)}
                              className="rounded"
                            />

                            <input
                              type="text"
                              value={comp.name}
                              onChange={(e) => updateTemplateComponent(idx, 'name', e.target.value)}
                              disabled={!comp.enabled}
                              /* CHANGED: reduced padding and font size for tightness */
                              className={`flex-1 p-1 text-xs border-b border-transparent hover:border-white/[0.1] bg-transparent focus:outline-none ${!comp.enabled && 'opacity-50'}`}
                            />
                          </div>

                          {/* Right Side Controls - Now grouped to stay together */}
                          <div className="flex items-center gap-2 ml-auto">
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                value={comp.weight}
                                onChange={(e) => updateTemplateComponent(idx, 'weight', parseFloat(e.target.value) || 0)}
                                disabled={!comp.enabled}
                                /* CHANGED: w-10 instead of w-12 or w-14 */
                                className={`w-10 p-1 text-xs text-center border rounded ${themeClasses.input}`}
                              />
                            </div>

                            <div className="flex items-center gap-1">
                              <span className={`text-[10px] ${themeClasses.muted}`}>Max:</span>
                              <input
                                type="number"
                                value={comp.maxMarks}
                                onChange={(e) => updateTemplateComponent(idx, 'maxMarks', parseFloat(e.target.value) || 0)}
                                disabled={!comp.enabled}
                                /* CHANGED: w-10 instead of w-12 */
                                className={`w-10 p-1 text-xs text-center border rounded ${themeClasses.input}`}
                              />
                            </div>

                            <button
                              onClick={() => removeComponentFromTemplate(idx)}
                              className="p-1 text-red-500 hover:bg-red-500/10 hover:bg-red-500/10 rounded"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={addComponentToTemplate}
                      className={`w-full py-2 border-2 border-dashed ${themeClasses.border} rounded-lg ${themeClasses.muted} hover:text-purple-400 hover:border-purple-500/40 transition-all flex items-center justify-center gap-2 text-xs font-bold`}
                    >
                      <Plus className="w-3 h-3" /> Add Component
                    </button>

                    {customTemplate.components.filter(c => c.enabled).reduce((sum, c) => sum + c.weight, 0) !== 100 && (
                      <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-3 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-yellow-300">
                          <strong>Note:</strong> Total weight is {customTemplate.components.filter(c => c.enabled).reduce((sum, c) => sum + c.weight, 0)}. (PES uses 120, but standard is 100).
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Step 3: Grading Scheme */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-sm flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-purple-500 text-zinc-200 flex items-center justify-center text-xs">3</span>
                      Grading Scheme
                    </h4>

                    <div>
                      <label className={`text-xs ${themeClasses.muted} block mb-1`}>Preset:</label>
                      <select
                        value={customTemplate.gradingScheme}
                        onChange={(e) => {
                          const scheme = e.target.value;
                          setCustomTemplate(prev => ({
                            ...prev,
                            gradingScheme: scheme,
                            customGrades: scheme === "Custom"
                              ? prev.customGrades
                              : JSON.parse(JSON.stringify(GradingSchemes[scheme]))
                          }));
                        }}
                        className={`w-full p-2 border rounded-lg text-sm ${themeClasses.input}`}
                      >
                        {Object.keys(GradingSchemes).map(key => (
                          <option key={key} value={key}>{key}</option>
                        ))}
                      </select>
                    </div>

                    <div className={`p-3 rounded-lg border ${themeClasses.border} bg-[#0e0e18]/50`}>
                      <div className="space-y-2">
                        <div className="grid grid-cols-12 gap-2 text-[10px] uppercase font-bold opacity-50 px-1">
                          <div className="col-span-3">Grade</div>
                          <div className="col-span-4">Min (≥)</div>
                          <div className="col-span-4">Points</div>
                          <div className="col-span-1"></div>
                        </div>

                        {customTemplate.customGrades.sort((a, b) => b.min - a.min).map((g, idx) => (
                          <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                            <input
                              type="text"
                              value={g.grade}
                              onChange={(e) => updateCustomGrade(idx, 'grade', e.target.value)}
                              className={`col-span-3 p-1 text-xs text-center border rounded font-bold ${themeClasses.input}`}
                            />
                            <input
                              type="number"
                              value={g.min}
                              onChange={(e) => updateCustomGrade(idx, 'min', e.target.value)}
                              className={`col-span-4 p-1 text-xs text-center border rounded ${themeClasses.input}`}
                            />
                            <input
                              type="number"
                              value={g.gp}
                              onChange={(e) => updateCustomGrade(idx, 'gp', e.target.value)}
                              className={`col-span-4 p-1 text-xs text-center border rounded ${themeClasses.input}`}
                            />
                            <button onClick={() => removeCustomGrade(idx)} className="col-span-1 text-red-500 hover:bg-red-500/10 hover:bg-red-500/10 rounded flex justify-center">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={addCustomGrade}
                        className="mt-3 text-xs text-purple-400 hover:underline flex items-center gap-1 w-full justify-center"
                      >
                        <Plus className="w-3 h-3" /> Add Grade Row
                      </button>
                    </div>

                    <button
                      onClick={applyGradingSchemeToAll}
                      className="w-full py-2 text-xs bg-indigo-500/10 text-indigo-300 rounded-lg hover:bg-indigo-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <Zap className="w-3 h-3" /> Apply Scheme to ALL Subjects
                    </button>
                  </div>

                  {/* Create Button */}
                  <div className="flex gap-3 pt-4 border-t border-white/[0.06]">
                    <button
                      onClick={applyCustomTemplate}
                      className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-zinc-200 rounded-lg font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Create Subject
                    </button>
                  </div>
                </div>
              )}
            </div>

          </>
        )}

               {/* ==================== ANALYSIS TAB ==================== */}
        {activeTab === 'analysis' && (
          <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
            {/* Target Analyzer (Top Cards) */}
            <div className="glass-card bg-[#08080f]/60 backdrop-blur-xl border border-white/[0.04] rounded-2xl shadow-2xl p-6 text-[#c5c6d0]">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-lg font-bold font-display flex items-center gap-2.5 text-zinc-100">
                  <Activity className="w-5 h-5 text-indigo-400" /> Target Analysis
                </h2>
                <div className="flex items-center gap-2.5 bg-white/[0.03] px-3.5 py-1.5 rounded-xl border border-white/[0.05]">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider font-sans">Target SGPA</span>
                  <input
                    type="number"
                    step="0.1"
                    max="10"
                    min="5"
                    value={targetSgpa}
                    onChange={(e) => setTargetSgpa(parseFloat(e.target.value) || 0)}
                    className="w-14 p-0 bg-transparent text-right font-black text-zinc-100 border-none focus:ring-0 text-lg font-display"
                  />
                </div>
              </div>

              {/* Grid with Range */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {/* Range Card */}
                <div className="glass-card bg-indigo-950/[0.02] border-indigo-500/10 rounded-2xl p-4 col-span-2 relative overflow-hidden group">
                  <div className="flex justify-between items-end mb-2 relative z-10">
                    <div>
                      <div className="text-[9px] text-zinc-500 uppercase tracking-widest font-extrabold">Achievable Range</div>
                      <div className="text-2xl font-black font-display text-zinc-100 flex items-baseline gap-2 mt-1 tracking-tight">
                        {sgpaRange.min} <span className="text-xs text-zinc-500 font-medium">to</span> {sgpaRange.max}
                      </div>
                    </div>
                    <Activity className="w-8 h-8 text-indigo-500/10 group-hover:text-indigo-500/25 transition-colors duration-300" />
                  </div>
                  <div className="w-full bg-black/40 h-2 rounded-full mt-3.5 overflow-hidden relative border border-white/[0.02]">
                    <div className="absolute h-full bg-indigo-500/20" style={{ left: `${(sgpaRange.min / 10) * 100}%`, right: `${100 - (sgpaRange.max / 10) * 100}%` }} />
                    <div className="absolute h-full w-1 bg-indigo-400 top-0 z-10 drop-shadow-[0_0_8px_rgba(129,140,248,0.7)]" style={{ left: `${(Math.min(Math.max(sgpa, sgpaRange.min), sgpaRange.max) / 10) * 100}%` }} />
                  </div>
                  <div className="flex justify-between text-[9px] mt-1.5 font-mono text-zinc-500">
                    <span>{sgpaRange.min}</span>
                    <span className="text-indigo-400 font-extrabold">Curr: {sgpa}</span>
                    <span>{sgpaRange.max}</span>
                  </div>
                </div>

                {/* Target Gap */}
                <div className="glass-card bg-white/[0.01] border-white/[0.03] rounded-2xl p-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 opacity-10"><Target className="w-10 h-10 text-indigo-400" /></div>
                  <div className="text-2xl font-black font-display text-zinc-100 tracking-tight">{metrics.allowableLoss.toFixed(1)}</div>
                  <div className="text-[9px] text-zinc-500 uppercase tracking-widest font-extrabold mt-0.5">GP Budget</div>
                  <p className="text-[9px] text-zinc-500 mt-1.5 font-medium leading-relaxed">Points you can lose to hit {targetSgpa}</p>
                </div>

                {/* Momentum */}
                <div className="glass-card bg-purple-950/[0.03] border-purple-500/15 rounded-2xl p-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 opacity-10"><TrendingUp className="w-10 h-10 text-purple-400" /></div>
                  <div className="text-2xl font-black font-display text-purple-300 tracking-tight">{metrics.momentumSGPA}</div>
                  <div className="text-[9px] text-purple-200/50 uppercase tracking-widest font-extrabold mt-0.5">Momentum SGPA *</div>
                  <p className="text-[9px] text-purple-300/40 mt-1.5 font-medium leading-relaxed">If you maintain current average form</p>
                </div>
              </div>

              {/* Subject-wise Analysis List */}
              <div className="space-y-3 md:space-y-2 max-h-[60vh] md:max-h-80 overflow-y-auto pr-1 md:pr-2 custom-scrollbar">

                {/* Table Header (Desktop Only) */}
                <div className="hidden md:grid grid-cols-12 gap-2 text-[10px] text-zinc-500 uppercase tracking-wider font-extrabold pb-2 border-b border-white/[0.04] sticky top-0 bg-[#08080f] z-10">
                  <div className="col-span-3 pl-1">Subject</div>
                  <div className="col-span-2 text-center">Momentum</div>
                  <div className="col-span-2 text-center text-zinc-300/90">Pass (40)</div>
                  <div className="col-span-2 text-center">For A (80)</div>
                  <div className="col-span-2 text-center">For S (90)</div>
                  <div className="col-span-1 text-center pr-1">GP</div>
                </div>

                {metrics.analysisData.map((d, i) => {
                  // Calculate Requirements on the fly
                  const sub = subjects.find(s => s.id === d.id);
                  const reqPass = getRequiredESAForGrade(sub, 40, true, { useMomentumIsa2: true, useMomentumInternals: true });
                  const isa2Label = sub?.customConfig?.labels?.isa2 || 'ISA2';
                  const assignmentLabel = sub?.customConfig?.labels?.assignment || 'Assignment';
                  const assignmentLabelShort = assignmentLabel === 'Assignment' ? 'Asg' : assignmentLabel;
                  const labLabel = sub?.customConfig?.labels?.lab || 'Lab';
                  const isa2PassInfo = getRequiredISA2ForPass(sub);
                  const isa2AInfo = getRequiredISA2ForGrade(sub, 80, { assumeFullForEmptyInternals: true });
                  const isa2SInfo = getRequiredISA2ForGrade(sub, 90, { assumeFullForEmptyInternals: true });
                  const buildIsa2Line = (targetLabel, info) => {
                    if (!info) return null;
                    if (info.needed === null) {
                      return <div className="text-[9px] text-red-400 font-bold leading-none mt-1">{isa2Label} {targetLabel}: impossible</div>;
                    }
                    return <div className="text-[9px] text-zinc-500 font-medium leading-none mt-1">{isa2Label} {targetLabel}: {info.needed}/{info.max}</div>;
                  };
                  const isa2PassLine = buildIsa2Line('pass', isa2PassInfo);
                  const isa2ALine = buildIsa2Line('A', isa2AInfo);
                  const isa2SLine = buildIsa2Line('S', isa2SInfo);

                  return (
                    <div
                      key={i}
                      className="flex flex-col gap-3 p-3.5 rounded-2xl border border-white/[0.03] bg-white/[0.01] md:grid md:grid-cols-12 md:gap-2 md:items-center md:py-2.5 md:border-b md:border-t-0 md:border-x-0 md:border-white/[0.03] md:bg-transparent md:rounded-none hover:bg-white/[0.02] transition-colors duration-300"
                    >
                      {/* Header: Name & GP */}
                      <div className="flex items-center justify-between md:contents">
                        <div className="md:col-span-3 truncate text-zinc-200 font-bold font-display text-sm pl-1">
                          {d.name}
                        </div>
                        <div className="md:hidden flex items-center gap-2">
                          <span className="text-[9px] uppercase text-zinc-500 font-bold">Curr GP</span>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-lg ${d.currentGP >= 9 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15' : d.currentGP >= 8 ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/15' : 'bg-white/[0.04] text-zinc-300 border border-white/[0.05]'}`}>
                            {d.currentGP}
                          </span>
                        </div>
                      </div>

                      {/* Stats Grid (2x2 on Mobile, Flat on Desktop) */}
                      <div className="grid grid-cols-2 gap-2.5 md:contents">

                        {/* 1. Momentum */}
                        <div className="bg-black/35 md:bg-transparent p-2.5 md:p-0 rounded-xl flex flex-col items-center md:block md:col-span-2 md:text-center border border-white/[0.03] md:border-none">
                          <span className="md:hidden text-[9px] text-zinc-500 uppercase font-bold tracking-wider mb-1">Momentum</span>
                          <span className={`font-black text-base md:text-sm font-display ${d.momentumScore >= 90 ? 'text-emerald-400' : d.momentumScore >= 80 ? 'text-indigo-400' : d.momentumScore >= 40 ? 'text-zinc-300' : 'text-red-400'}`}>
                            {d.momentumScore}
                          </span>
                          {d.momentumIsa2Marks !== null && (
                            <span className="text-[9px] text-indigo-300/80 mt-1 font-semibold block">
                              {isa2Label} est: {d.momentumIsa2Marks}/{d.isa2Max}
                            </span>
                          )}
                          {d.momentumAssignmentMarks !== null && (
                            <span className="text-[9px] text-indigo-300/80 mt-0.5 font-semibold block">
                              {assignmentLabelShort} est: {d.momentumAssignmentMarks}/{d.assignmentMax}
                            </span>
                          )}
                          {d.momentumLabMarks !== null && (
                            <span className="text-[9px] text-indigo-300/80 mt-0.5 font-semibold block">
                              {labLabel} est: {d.momentumLabMarks}/{d.labMax}
                            </span>
                          )}
                        </div>

                        {/* 2. Pass Requirement (Fixed Logic) */}
                        <div className="bg-black/35 md:bg-transparent p-2.5 md:p-0 rounded-xl flex flex-col items-center md:block md:col-span-2 md:text-center border border-white/[0.03] md:border-none">
                          <span className="md:hidden text-[9px] text-zinc-500 uppercase font-bold tracking-wider mb-1">To Pass</span>
                          {reqPass.safe === null ? (
                            <div className="flex flex-col items-center">
                              <span className="text-red-500 text-xs font-bold font-sans">Impossible</span>
                              {isa2PassLine}
                            </div>
                          ) : reqPass.safe === 0 ? (
                            <div className="flex flex-col items-center">
                              <div className="flex items-center justify-center gap-1">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                <span className="text-emerald-400 text-xs font-bold md:hidden">Passed</span>
                              </div>
                              {isa2PassLine}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <span className={`font-mono font-bold text-base md:text-sm ${reqPass.requiresRounding ? 'text-amber-400' : 'text-zinc-200'}`}>
                                {reqPass.safe}
                              </span>
                              {/* Show Min Value if it differs */}
                              {reqPass.minimum !== null && reqPass.minimum < reqPass.safe && (
                                <div className="text-[9px] text-zinc-500 leading-none mt-0.5 font-medium">min: {reqPass.minimum}</div>
                              )}
                              {reqPass.requiresRounding && (
                                <div className="text-[9px] text-amber-500 font-bold leading-none mt-0.5">*rounding</div>
                              )}
                              {isa2PassLine}
                            </div>
                          )}
                        </div>

                        {/* 3. Target A */}
                        <div className="bg-black/35 md:bg-transparent p-2.5 md:p-0 rounded-xl flex flex-col items-center md:block md:col-span-2 md:text-center border border-white/[0.03] md:border-none">
                          <span className="md:hidden text-[9px] text-zinc-500 uppercase font-bold tracking-wider mb-1">For A (80)</span>
                          {d.reqA === null ? (
                            <div className="flex flex-col items-center">
                              <span className="text-red-500 text-xs font-bold font-sans">Impossible</span>
                              {isa2ALine}
                            </div>
                          ) : d.reqA === 0 ? (
                            <div className="flex flex-col items-center">
                              <span className="text-emerald-400 text-xs font-bold font-sans">✓ Done</span>
                              {isa2ALine}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <span className={`font-mono font-bold text-base md:text-sm ${d.reqARequiresRounding ? 'text-amber-400' : 'text-indigo-400'}`}>{d.reqA}</span>
                              {d.reqAMin !== null && d.reqAMin < d.reqA && <div className="text-[9px] text-zinc-500 leading-none mt-0.5 font-medium">min: {d.reqAMin}</div>}
                              {isa2ALine}
                            </div>
                          )}
                        </div>

                        {/* 4. Target S */}
                        <div className="bg-black/35 md:bg-transparent p-2.5 md:p-0 rounded-xl flex flex-col items-center md:block md:col-span-2 md:text-center border border-white/[0.03] md:border-none">
                          <span className="md:hidden text-[9px] text-zinc-500 uppercase font-bold tracking-wider mb-1">For S (90)</span>
                          {d.reqS === null ? (
                            <div className="flex flex-col items-center">
                              <span className="text-red-500 text-xs font-bold font-sans">Impossible</span>
                              {isa2SLine}
                            </div>
                          ) : d.reqS === 0 ? (
                            <div className="flex flex-col items-center">
                              <span className="text-emerald-400 text-xs font-bold font-sans">✓ Done</span>
                              {isa2SLine}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <span className={`font-mono font-bold text-base md:text-sm ${d.reqSRequiresRounding ? 'text-amber-400' : 'text-yellow-400 font-black'}`}>{d.reqS}</span>
                              {d.reqSMin !== null && d.reqSMin < d.reqS && <div className="text-[9px] text-zinc-500 leading-none mt-0.5 font-medium">min: {d.reqSMin}</div>}
                              {isa2SLine}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Desktop GP (Hidden on Mobile) */}
                      <div className="hidden md:block col-span-1 text-center">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-lg ${d.currentGP >= 9 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15' : d.currentGP >= 8 ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/15' : 'bg-white/[0.04] text-zinc-300 border border-white/[0.05]'}`}>
                          {d.currentGP}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer Notes */}
              <div className="mt-4 p-3 bg-white/[0.01] rounded-xl border border-white/[0.03]">
                <div className="flex items-start gap-2.5 text-xs text-zinc-500">
                  <Lightbulb className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <strong className="text-zinc-300">Safe vs Minimum scores:</strong> The main number is the <strong className="text-zinc-300">safe</strong> ESA score that guarantees the grade.
                    The "min" value (when shown) is the absolute minimum that <em>might</em> work due to rounding up, but scoring the safe value is recommended.
                  </div>
                </div>
              </div>

              {/* Momentum Disclaimer (Collapsible) */}
              <div className="mt-3 bg-purple-950/[0.02] rounded-xl border border-purple-500/10 shadow-sm">
                <details className="group p-3">
                  <summary className="flex items-center gap-2 cursor-pointer list-none text-xs text-purple-300 font-bold select-none">
                    <span className="text-base leading-none">*️⃣</span>
                    <span>Momentum Disclaimer</span>
                    <ChevronDown className="w-3.5 h-3.5 ml-auto opacity-50 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="mt-2 text-xs text-purple-300/60 leading-relaxed pl-6 border-t border-purple-500/10 pt-2 font-medium">
                    The momentum score assumes you maintain your current average in future exams. There is a &lt;1% chance this will be your exact final score. <strong>Don't stress over it!</strong> If ISA2 is empty, the Pass/A/S ESA requirements use a momentum-projected ISA2 score and are estimates. When Assignment or Lab is empty, momentum assumes full marks for those components. ISA2 target lines (Pass/A/S) show how much ISA2 you need for that grade, assuming empty Assignment or Lab are full and ESA is 0 unless you have entered an ESA score.
                  </div>
                </details>
              </div>
            </div>

            {/* Smart Strategy Panel (Collapsible on Mobile to save space) */}
            <div className="glass-card bg-[#08080f]/60 backdrop-blur-xl border border-white/[0.04] rounded-2xl shadow-2xl p-4 md:p-6 text-[#c5c6d0]">
              <details className="group" open>
                <summary className="flex items-center justify-between cursor-pointer list-none select-none">
                  <div className="text-lg font-bold font-display flex items-center gap-2 text-zinc-100">
                    <Lightbulb className="w-5 h-5 text-indigo-400 animate-pulse" /> Path to Target ({targetSgpa} SGPA)
                  </div>
                  <ChevronDown className="w-4 h-4 opacity-60 transition-transform group-open:rotate-180" />
                </summary>

                <div className="mt-4">
                  {strategy.plan.length === 0 && !strategy.impossible && parseFloat(metrics.momentumSGPA) >= targetSgpa ? (
                    <div className="bg-emerald-500/[0.02] border border-emerald-500/25 rounded-2xl p-4 flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                      <div>
                        <div className="font-bold text-emerald-300">You're on track!</div>
                        <div className="text-xs text-emerald-400/60 font-medium">Your current momentum meets your target.</div>
                      </div>
                    </div>
                  ) : strategy.impossible ? (
                    <div className="bg-red-500/[0.02] border border-red-500/25 rounded-2xl p-4 flex items-center gap-3">
                      <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                      <div>
                        <div className="font-bold text-red-300">Target Unreachable</div>
                        <div className="text-xs text-red-400/60 font-medium font-sans">Mathematically impossible given your internals.</div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-2">Most efficient upgrades:</p>
                      {strategy.plan.map((step, idx) => (
                        <div key={idx} className="glass-card bg-black/25 p-3 rounded-xl border border-white/[0.03] flex items-start gap-3 hover:border-white/[0.06] transition-all duration-300">
                          <div className="bg-indigo-500/10 border border-indigo-500/25 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-indigo-400 flex-shrink-0 mt-0.5 font-display">
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-bold text-zinc-100 flex justify-between items-center font-display">
                              <span>{step.name}</span>
                              <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-lg border border-indigo-500/15 font-extrabold uppercase font-sans">+{step.gpGain.toFixed(1)} GP</span>
                            </div>
                            <div className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5 flex-wrap font-medium">
                              <span className="text-indigo-300 font-extrabold bg-indigo-500/10 px-1.5 py-0.5 rounded-lg border border-indigo-500/15">{step.esaNeeded}/{step.esaMax}</span>
                              <span>ESA score for</span>
                              <span className={`font-black ${step.toGrade === 'S' ? 'text-emerald-400' : 'text-indigo-400'}`}>{step.toGrade} Grade</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </details>
            </div>
          </div>
        )}

        {/* ==================== REVERSE CALCULATOR TAB ==================== */}
        {activeTab === 'reverse' && (
          <div className="space-y-4 md:space-y-6">
            <div className="glass-card rounded-2xl shadow-2xl p-3.5 md:p-6 text-zinc-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/[0.06] blur-[70px] rounded-full pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-36 h-36 bg-indigo-500/[0.04] blur-[60px] rounded-full pointer-events-none"></div>
              
              <div className="flex items-center justify-between mb-3 md:mb-4 border-b border-white/[0.05] pb-3 md:pb-4">
                <h2 className="text-xl font-bold flex items-center gap-2 font-display">
                  <Target className="w-5 h-5 text-emerald-400" /> Reverse Calculator
                </h2>
                <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.05)]">
                  Target Simulator
                </span>
              </div>

              {/* ESA Marks Detected Warning (Collapsible) */}
              {subjects.some(sub => (marks[sub.id]?.esa && parseFloat(marks[sub.id]?.esa) > 0)) && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.03] overflow-hidden mb-6 shadow-[0_0_20px_rgba(245,158,11,0.02)]">
                  <details className="group">
                    <summary className="flex items-center justify-between p-4 cursor-pointer list-none select-none hover:bg-amber-500/5 transition-colors">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
                        <h4 className="font-bold text-sm text-amber-300 font-display">
                          ESA Marks Detected (Subject Locked)
                        </h4>
                      </div>
                      <ChevronDown className="w-4 h-4 text-amber-400 opacity-70 transition-transform group-open:rotate-180" />
                    </summary>

                    <div className="px-4 pb-4 pt-0">
                      <div className="text-xs text-amber-200/80 mt-1 space-y-2 border-t border-amber-500/10 pt-3 leading-relaxed">
                        <p>
                          You have entered ESA marks for some subjects. These subjects will be treated as <strong className="text-amber-300">Fixed/Locked</strong> and will NOT be reverse-calculated.
                        </p>
                        <p>
                          If you want to <strong className="text-amber-300">predict</strong> marks for a specific subject, please go back and <strong className="text-amber-300">clear its ESA score</strong>.
                        </p>
                        <button
                          onClick={() => setActiveTab('subjects')}
                          className="mt-2 text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-lg font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.05)]"
                        >
                          Manage Subjects
                        </button>
                      </div>
                    </div>
                  </details>
                </div>
              )}

              {/* ORIGINAL TEXT: Description */}
              <p className="text-emerald-100 text-sm mb-4 leading-relaxed opacity-95">
                Set your desired SGPA and see exactly what you need to score in each ESA. Lock subjects where you're confident about your score.
              </p>

              {/* Controls: Input & Buttons (Compacted layout) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 md:gap-4 mb-3 md:mb-4">
                <div className="flex items-center justify-between gap-2.5 bg-white/[0.02] border border-white/[0.05] p-2.5 md:p-3 rounded-xl w-full">
                  <label className="text-xs md:text-sm font-semibold whitespace-nowrap text-zinc-300 font-display">Desired SGPA Target</label>
                  <input
                    type="number"
                    step="0.1"
                    min="5"
                    max="10"
                    value={reverseTargetSgpa}
                    onChange={(e) => setReverseTargetSgpa(parseFloat(e.target.value) || 0)}
                    className="w-20 md:w-24 glass-input px-2 md:px-3 py-1 md:py-1.5 text-emerald-400 font-black text-center text-lg md:text-xl focus:border-emerald-500/50 focus:ring-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.05)]"
                  />
                </div>

                <div className="flex items-center justify-between gap-2.5 bg-white/[0.02] border border-white/[0.05] p-2.5 md:p-3 rounded-xl w-full">
                  <div className="flex flex-col">
                    <span className="text-[9px] md:text-[10px] text-zinc-400 uppercase font-black tracking-wider font-display">ESA Mode</span>
                    <span className="text-[8px] md:text-[9px] text-zinc-500 mt-0.5">Min relies on rounding luck.</span>
                  </div>
                  <div className="flex bg-black/40 border border-white/[0.08] rounded-xl p-0.5 md:p-1 shadow-inner">
                    <button
                      onClick={() => setReverseEsaMode('safe')}
                      className={`px-2.5 md:px-3 py-1 md:py-1.5 text-[10px] md:text-xs font-bold rounded-lg transition-all ${reverseEsaMode === 'safe'
                        ? 'bg-white/[0.08] text-white border border-white/[0.08] shadow-sm font-black'
                        : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                    >
                      Safe
                    </button>
                    <button
                      onClick={() => setReverseEsaMode('min')}
                      className={`px-2.5 md:px-3 py-1 md:py-1.5 text-[10px] md:text-xs font-bold rounded-lg transition-all ${reverseEsaMode === 'min'
                        ? 'bg-white/[0.08] text-white border border-white/[0.08] shadow-sm font-black'
                        : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                    >
                      Min
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 md:gap-2.5 mb-3 md:mb-4">
                <button
                  onClick={() => setShuffledResults(calculateRandomPath())}
                  className="flex-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/25 hover:border-purple-500/40 p-2 md:p-2.5 rounded-xl transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1.5 md:gap-2 text-[11px] md:text-xs font-bold shadow-[0_0_15px_rgba(168,85,247,0.05)] hover:shadow-[0_0_20px_rgba(168,85,247,0.1)]"
                  title="Shuffle: Find a different combination of grades"
                >
                  <Dice5 className="w-3.5 h-3.5" /> Shuffle
                </button>

                <button
                  onClick={() => setShuffledResults(calculateBalancedPath())}
                  className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/25 hover:border-emerald-500/40 p-2 md:p-2.5 rounded-xl transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1.5 md:gap-2 text-[11px] md:text-xs font-bold shadow-[0_0_15px_rgba(16,185,129,0.05)] hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                  title="Balanced: Keeps scores even across subjects"
                >
                  <Scale className="w-3.5 h-3.5" /> Balanced
                </button>

                {shuffledResults && (
                  <button
                    onClick={() => setShuffledResults(null)}
                    className="px-3 md:px-4 py-2 md:py-2.5 text-[11px] md:text-xs text-zinc-400 hover:text-white bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] rounded-xl transition-all font-bold active:scale-95"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* ORIGINAL TEXT: Blue Help Box (Accordion for mobile) */}
              <div className="bg-indigo-500/[0.02] border border-indigo-500/20 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.02)] overflow-hidden">
                <details className="group">
                  <summary className="flex items-center justify-between p-3.5 cursor-pointer list-none select-none hover:bg-indigo-500/[0.04] transition-colors">
                    <div className="flex items-center gap-2 text-sm font-bold text-indigo-300 font-display">
                      <HelpCircle className="w-4 h-4 text-indigo-400" />
                      <span>Why are some scores high/low? (and fix)</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-indigo-400 opacity-70 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="px-4 pb-4 pt-0 text-xs text-indigo-200/80 space-y-2 border-t border-indigo-500/10 pt-3 leading-relaxed">
                    <p className="opacity-90">
                      This calculator finds the <strong className="text-indigo-300">absolute cheapest path</strong>.
                      It prioritizes subjects where you need fewer marks to jump a grade, even if that means pushing a score to 98 or 99.
                    </p>
                    <p className="text-amber-300 font-bold bg-amber-500/[0.05] p-2.5 rounded-lg border border-amber-500/10">
                      💡 Fix: If a score is unrealistically high/low, click the <Lock className="w-3.5 h-3.5 inline text-amber-400 mx-0.5" /> icon
                      to set a limit (e.g., 85 that you are confident that you will score at least that much).
                      The app will recalculate the rest!
                    </p>
                    <p className="font-medium text-zinc-300">
                      Alternatively you can Click <span className="font-bold text-white bg-white/[0.06] px-1.5 py-0.5 rounded">Balanced</span> for a realistic, balanced path.
                    </p>
                    <p className="font-medium text-zinc-300">
                      Scores look unrealistic? Click <span className="font-bold text-white bg-white/[0.06] px-1.5 py-0.5 rounded">Shuffle</span> for a different path. Click <span className="font-bold text-white bg-white/[0.06] px-1.5 py-0.5 rounded">Reset</span> to go back to the most efficient way.
                    </p>
                  </div>
                </details>
              </div>

              {!reverseResults.isTargetAchievable && (
                <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/25 p-3.5 rounded-xl text-sm mt-4 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.05)]">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 animate-pulse" />
                  <span className="font-medium">
                    Max achievable: <strong className="text-red-200 text-glow-red font-display font-extrabold text-base">{reverseResults.achievableSGPA}</strong>
                  </span>
                </div>
              )}
            </div>

            {/* Subject List - COMPACT ROW LAYOUT */}
            <div className="space-y-3">
              {(shuffledResults || reverseResults.results).map((sub, i) => {
                const baseSubject = subjects.find(s => s.id === sub.id);
                const baseMetrics = baseSubject ? getSubjectMetrics(baseSubject) : null;
                const m = marks[sub.id] || {};
                const hasEsa = m.esa !== '' && m.esa !== undefined && !isNaN(parseFloat(m.esa));
                const isManualLock = lockedSubjects[sub.id] !== undefined && !sub.isHardLocked;

                const isa2Label = baseSubject?.customConfig?.labels?.isa2 || 'ISA2';
                const assignmentLabel = baseSubject?.customConfig?.labels?.assignment || 'Assignment';
                const assignmentLabelShort = assignmentLabel === 'Assignment' ? 'Asg' : assignmentLabel;
                const labLabel = baseSubject?.customConfig?.labels?.lab || 'Lab';

                const assumptions = [];
                if (!hasEsa && !isManualLock) assumptions.push('ESA est');
                if (baseMetrics?.momentumIsa2Marks !== null) assumptions.push(`${isa2Label} proj`);
                if (baseMetrics?.momentumAssignmentMarks !== null) assumptions.push(`${assignmentLabelShort} full`);
                if (baseMetrics?.momentumLabMarks !== null) assumptions.push(`${labLabel} full`);

                const activeMap = baseSubject?.customGradeMap || GradeMap;
                const targetScore = sub.projectedScore ?? activeMap.find(g => g.grade === sub.projectedGrade)?.min ?? null;
                const esaInfo = baseSubject && targetScore !== null
                  ? getRequiredESAForGrade(baseSubject, targetScore, true, { useMomentumIsa2: true, useMomentumInternals: true })
                  : null;
                const isa2TargetInfo = baseSubject && targetScore !== null
                  ? getRequiredISA2ForGrade(baseSubject, targetScore, { assumeFullForEmptyInternals: true })
                  : null;
                const safeEsa = esaInfo?.safe ?? null;
                const minEsa = esaInfo?.minimum ?? null;
                const minDiffers = safeEsa !== null && minEsa !== null && minEsa < safeEsa;
                const useMin = reverseEsaMode === 'min' && minEsa !== null;
                const primaryEsa = useMin ? minEsa : safeEsa;
                const secondaryEsa = useMin ? safeEsa : minEsa;
                const secondaryLabel = useMin ? 'safe' : 'min';
                const showSecondary = secondaryEsa !== null && primaryEsa !== null && secondaryEsa !== primaryEsa;
                const showRounding = useMin && minDiffers;

                // Color-coded border states and backgrounds for a premium feel
                let cardClass = "glass-card glass-card-hover";
                if (sub.isImpossible) {
                  cardClass = "bg-red-500/[0.03] border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.02)]";
                } else if (sub.alreadyAchieved) {
                  cardClass = "bg-emerald-500/[0.03] border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.02)]";
                } else if (sub.locked) {
                  cardClass = "bg-amber-500/[0.04] border-amber-500/35 shadow-[0_0_20px_rgba(245,158,11,0.04)] ring-1 ring-amber-500/10";
                }

                return (
                  <div
                    key={i}
                    className={`relative flex items-center justify-between p-3 md:p-4 rounded-xl border transition-all gap-2 md:gap-3 ${cardClass}`}
                  >
                    {/* Left Side: Name & Info */}
                    <div className="flex-1 min-w-0 pr-1 md:pr-2">
                      <div className="flex items-center gap-1.5 mb-1">
                        {sub.locked && <Lock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 animate-pulse" />}
                        <span className="text-xs md:text-sm font-bold truncate block font-display text-zinc-100">
                          {sub.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 md:gap-2 text-[9px] md:text-[10px] opacity-80">
                        <span className="px-1.5 md:px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.05] text-zinc-300 font-semibold">{sub.credits} Credits</span>
                        {sub.isImpossible ? (
                          <span className="text-red-400 font-extrabold tracking-wide uppercase text-[8px] bg-red-500/10 border border-red-500/20 px-1 py-0.5 rounded-md">Impossible</span>
                        ) : (
                          <span className="text-zinc-450 text-zinc-400">Target: <strong className="text-emerald-400 font-extrabold text-glow-emerald bg-emerald-500/10 border border-emerald-500/20 px-1 md:px-1.5 py-0.5 rounded-md ml-0.5">{sub.projectedGrade}</strong></span>
                        )}
                      </div>
                      {assumptions.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 mt-1.5">
                          <span className="text-[7px] md:text-[8px] px-1 md:px-1.5 py-0.5 rounded bg-white/[0.05] text-zinc-400 font-bold uppercase tracking-wider">
                            Assumptions
                          </span>
                          {assumptions.map((item, idx) => (
                            <span key={idx} className="text-[7px] md:text-[8px] px-1 md:px-1.5 py-0.5 rounded bg-white/[0.03] text-zinc-500 border border-white/[0.02]">
                              {item}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right Side: Score & Actions */}
                    <div className="flex items-center gap-2 md:gap-3.5 flex-shrink-0">
                      <div className="text-right">
                        {sub.locked ? (
                          /* Locked Input */
                          <div className="flex flex-col items-end">
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min="0"
                                max={sub.esaMax}
                                disabled={sub.isHardLocked}
                                value={sub.isHardLocked ? (marks[sub.id]?.esa || 0) : lockedSubjects[sub.id]}
                                onChange={(e) => {
                                  if (sub.isHardLocked) return;
                                  const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                                  setLockedSubjects(prev => ({ ...prev, [sub.id]: val }));
                                }}
                                className={`w-12 md:w-14 p-1 md:p-1.5 text-center text-xs md:text-sm font-black focus:outline-none focus:ring-4 focus:ring-amber-500/10 ${sub.isHardLocked
                                  ? 'bg-white/[0.02] text-zinc-500 cursor-not-allowed border border-transparent rounded-lg'
                                  : 'glass-input border-amber-500/40 text-amber-300 font-bold'
                                  }`}
                              />
                              <span className="text-[9px] md:text-[10px] text-zinc-500">/{sub.esaMax}</span>
                            </div>
                            <span className="text-[8px] md:text-[9px] text-amber-500 mt-0.5 font-bold">
                              {sub.isHardLocked ? 'Set in Subjects tab' : 'Manual Lock'}
                            </span>
                          </div>
                        ) : sub.alreadyAchieved ? (
                          /* Done State */
                          <div className="flex flex-col items-end">
                            <span className="text-base md:text-xl font-black text-emerald-400 text-glow-emerald">0</span>
                            <span className="text-[8px] md:text-[9px] text-emerald-500/70 font-bold bg-emerald-500/10 border border-emerald-500/20 px-1 rounded">Safe</span>
                          </div>
                        ) : sub.isImpossible ? (
                          <span className="text-xs md:text-sm font-bold text-red-500">---</span>
                        ) : (
                          /* Score Needed */
                          <div className="flex flex-col items-end justify-center">
                            <span className="text-base md:text-xl font-black text-white font-display">
                              {primaryEsa !== null ? primaryEsa : sub.requiredEsa}<span className="text-[10px] md:text-xs font-normal opacity-50 ml-0.5">/{sub.esaMax}</span>
                            </span>
                            {showSecondary && (
                              <span className="text-[8px] md:text-[9px] text-zinc-400 mt-0.5">{secondaryLabel}: <strong className="text-zinc-200">{secondaryEsa}</strong></span>
                            )}
                            {showRounding && (
                              <span className="text-[8px] md:text-[9px] text-orange-400 font-semibold">*rounding</span>
                            )}
                            <span className="text-[8px] md:text-[9px] text-zinc-500 mt-0.5">Needed</span>
                          </div>
                        )}
                        {isa2TargetInfo && (
                          <div className={`text-[8px] md:text-[9px] leading-none mt-1 text-right ${isa2TargetInfo.needed === null ? 'text-red-400 font-semibold' : 'text-zinc-500'}`}>
                            {isa2Label} {sub.projectedGrade || 'target'}: <strong className="text-zinc-400">{isa2TargetInfo.needed === null ? 'impossible' : `${isa2TargetInfo.needed}/${isa2TargetInfo.max}`}</strong>
                          </div>
                        )}
                      </div>

                      {/* Lock Button */}
                      <button
                        onClick={() => {
                          if (sub.isHardLocked) return;
                          if (lockedSubjects[sub.id] !== undefined) {
                            const newLocked = { ...lockedSubjects };
                            delete newLocked[sub.id];
                            setLockedSubjects(newLocked);
                          } else {
                            setLockedSubjects({ ...lockedSubjects, [sub.id]: sub.requiredEsa });
                          }
                        }}
                        disabled={sub.isHardLocked}
                        className={`w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-xl border transition-all active:scale-95 ${sub.isHardLocked ? 'opacity-20 cursor-not-allowed border-transparent' :
                          sub.locked
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                            : 'bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:text-indigo-400 hover:border-indigo-500/40 hover:bg-indigo-500/5'
                          }`}
                      >
                        {sub.locked ? <Lock className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <Unlock className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ORIGINAL TEXT: Bottom Info */}
            <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl shadow-sm">
              <div className="flex items-start gap-3 text-sm">
                <Lightbulb className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5 animate-pulse" />
                <div className="space-y-2">
                  <p className="text-zinc-300">
                    <strong className="text-white">How to use:</strong> Lock subjects where you're confident about your ESA score.
                    The calculator will then adjust the requirements for other subjects to compensate.
                  </p>
                  <p className="text-zinc-500 text-xs italic border-t border-white/[0.05] pt-2 leading-relaxed">
                    <strong className="text-zinc-400">Note:</strong> There are many combinations of grades that can achieve your target.
                    This result is just the most efficient path (requiring the least amount of total marks).
                  </p>
                </div>
              </div>
            </div>

            {/* ORIGINAL TEXT: Momentum Warning */}
            {reverseResults.usingMomentum && (
              <div className="bg-amber-500/[0.02] border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3 shadow-[0_0_15px_rgba(245,158,11,0.02)]">
                <Zap className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5 animate-pulse" />
                <div className="text-sm">
                  <strong className="text-amber-200 font-display">Using Momentum Scores</strong>
                  <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
                    Some internals (like Lab, ISA2, or Assignment) are empty. We project ISA2 from ISA1, assume full marks for empty Assignment or Lab, and estimate ESA using your current internal ratio so the calculator does not crash early in the semester. This is optimistic, so the max achievable SGPA can be higher than reality until you enter actual marks.
                  </p>
                </div>
              </div>
            )}

            {/* Minimum Passing Table (Restored & Scrollable for Mobile) */}
            <div className="glass-card rounded-2xl shadow-2xl p-6 mt-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/[0.04] blur-[50px] rounded-full pointer-events-none"></div>
              
              <div className="border-b border-white/[0.05] pb-4 mb-4">
                <h2 className="text-lg font-display font-bold flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-indigo-400" /> Minimum ESA Scores Needed
                </h2>
                <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
                  Quick reference: minimum ESA marks required for each grade in each subject.
                </p>
              </div>

              {/* Desktop/Tablet Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.08]">
                      <th className="text-left py-3 px-3 font-bold text-zinc-400 whitespace-nowrap">Subject</th>
                      {['E (40)', 'D (50)', 'C (60)', 'B (70)', 'A (80)', 'S (90)'].map((h, i) => {
                        const colors = ['text-red-400', 'text-orange-400', 'text-amber-500', 'text-indigo-400', 'text-blue-400', 'text-emerald-400'];
                        return <th key={i} className={`text-center py-3 px-2 font-bold font-display ${colors[i]}`}>{h}</th>;
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {minimumPassingTable.map(sub => (
                      <tr key={sub.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-3">
                          <div className="truncate font-bold text-zinc-200 font-display text-sm" title={sub.name}>
                            {sub.name}
                          </div>
                          <div className="text-[10px] text-zinc-500 mt-0.5">{sub.credits} Credits • Max ESA: {sub.esaMax}</div>
                        </td>

                        {['E', 'D', 'C', 'B', 'A', 'S'].map(grade => {
                          const req = sub.gradeRequirements.find(g => g.grade === grade);
                          const isa2MiniLine = req?.showIsa2Needed ? (
                            req.isa2Needed === null ? (
                              <div className="text-[9px] text-red-400/80 leading-none mt-1">I2: ✗</div>
                            ) : (
                              <div className="text-[9px] text-zinc-500 leading-none mt-1 font-semibold">I2: {req.isa2Needed}/{req.isa2Max}</div>
                            )
                          ) : null;
                          return (
                            <td key={grade} className="text-center py-3.5 px-2">
                              {!req?.possible ? (
                                <div className="inline-flex flex-col items-center">
                                  <span className="text-red-500/50 text-xs font-bold bg-red-500/5 border border-red-500/10 px-2 py-0.5 rounded-md">✗</span>
                                  {isa2MiniLine}
                                </div>
                              ) : req.alreadyAchieved ? (
                                <div className="inline-flex flex-col items-center">
                                  <span className="text-emerald-400 font-extrabold text-xs bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">✓</span>
                                  {isa2MiniLine}
                                </div>
                              ) : (
                                <div className="inline-flex flex-col items-center">
                                  <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded-md border ${req.requiresRounding ? 'text-orange-400 bg-orange-500/5 border-orange-500/20' :
                                    req.easy ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25 shadow-[0_0_10px_rgba(16,185,129,0.05)]' :
                                      req.moderate ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' :
                                        'text-orange-400 bg-orange-500/5 border-orange-500/20'
                                    }`}>
                                    {req.requiredEsa}
                                    {req.requiresRounding && '*'}
                                  </span>
                                  {req.minimumEsa !== null && req.minimumEsa < req.requiredEsa && (
                                    <div className="text-[9px] text-zinc-500 mt-0.5">
                                      ({req.minimumEsa})
                                    </div>
                                  )}
                                  {isa2MiniLine}
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card-based Grid View */}
              <div className="block md:hidden space-y-4">
                {minimumPassingTable.map(sub => (
                  <div key={sub.id} className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl space-y-3">
                    <div className="flex justify-between items-start border-b border-white/[0.03] pb-2">
                      <div>
                        <h4 className="font-bold text-sm text-zinc-200 font-display">{sub.name}</h4>
                        <p className="text-[10px] text-zinc-500 mt-0.5">{sub.credits} Credits • Max ESA: {sub.esaMax}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      {['E', 'D', 'C', 'B', 'A', 'S'].map(grade => {
                        const req = sub.gradeRequirements.find(g => g.grade === grade);
                        const isa2MiniLine = req?.showIsa2Needed ? (
                          req.isa2Needed === null ? (
                            <div className="text-[8px] text-red-400/80 leading-none mt-1">I2: ✗</div>
                          ) : (
                            <div className="text-[8px] text-zinc-500 leading-none mt-1 font-semibold">I2: {req.isa2Needed}/{req.isa2Max}</div>
                          )
                        ) : null;

                        let badgeColorClass = "text-orange-400 bg-orange-500/5 border-orange-500/20";
                        if (!req?.possible) {
                          badgeColorClass = "text-red-500/50 bg-red-500/5 border-red-500/10";
                        } else if (req.alreadyAchieved) {
                          badgeColorClass = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
                        } else if (req.easy) {
                          badgeColorClass = "text-emerald-400 bg-emerald-500/10 border-emerald-500/25 shadow-[0_0_8px_rgba(16,185,129,0.03)]";
                        } else if (req.moderate) {
                          badgeColorClass = "text-blue-400 bg-blue-500/10 border-blue-500/20";
                        }

                        return (
                          <div key={grade} className="flex flex-col items-center p-2 rounded-lg bg-black/20 border border-white/[0.02]">
                            <span className="text-[10px] font-black text-zinc-400 mb-1.5 font-display">{grade} Grade</span>
                            {!req?.possible ? (
                              <span className={`text-xs font-bold px-1.5 py-0.5 rounded border ${badgeColorClass}`}>✗</span>
                            ) : req.alreadyAchieved ? (
                              <span className={`text-xs font-bold px-1.5 py-0.5 rounded border ${badgeColorClass}`}>✓</span>
                            ) : (
                              <div className="flex flex-col items-center">
                                <span className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded border ${badgeColorClass}`}>
                                  {req.requiredEsa}
                                  {req.requiresRounding && '*'}
                                </span>
                                {req.minimumEsa !== null && req.minimumEsa < req.requiredEsa && (
                                  <span className="text-[8px] text-zinc-500 mt-0.5">({req.minimumEsa})</span>
                                )}
                              </div>
                            )}
                            {isa2MiniLine}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Table legend */}
              <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 text-[10px] text-zinc-500 pt-4 border-t border-white/[0.05]">
                <span className="flex items-center gap-1"><span className="text-emerald-400 font-extrabold">✓</span> Achieved</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500/30 border border-emerald-500/50"></span> Easy (≤50)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500/30 border border-blue-500/50"></span> Moderate (51-75)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500/30 border border-orange-500/50"></span> Hard (&gt;75)</span>
                <span className="flex items-center gap-1"><span className="text-red-500 font-bold">✗</span> Not possible</span>
                <span className="flex items-center gap-1"><span>(xx)</span> Best case</span>
                <span className="flex items-center gap-1"><span className="text-orange-400">*</span> Rounding luck</span>
              </div>
            </div>
          </div>
        )}

        {/* ==================== ATTENDANCE TAB ==================== */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            <div className="glass-card rounded-2xl shadow-2xl p-6 text-zinc-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/[0.05] blur-[70px] rounded-full pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-36 h-36 bg-blue-500/[0.03] blur-[60px] rounded-full pointer-events-none"></div>
              
              <div className="border-b border-white/[0.05] pb-4">
                <h2 className="text-xl font-bold flex items-center gap-2 font-display">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 animate-pulse" /> Overall Attendance
                </h2>
                <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
                  One subject at a time. Mode 1 is the base, and all planning modes use it automatically.
                </p>
              </div>
            </div>

            {/* MODE 1 ACCORDION */}
            <details className="glass-card rounded-2xl group overflow-hidden" open>
              <summary className="flex items-center justify-between p-4 cursor-pointer list-none select-none hover:bg-white/[0.02] transition-colors border-b border-transparent group-open:border-white/[0.05]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/25 shadow-sm">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold font-display text-zinc-200">Mode 1 — Current Attendance and Shared Baseline</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.05]">Saved locally</span>
                  <ChevronDown className="w-4 h-4 text-zinc-400 opacity-60 transition-transform group-open:rotate-180" />
                </div>
              </summary>

              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/[0.02] border border-white/[0.05] p-3.5 rounded-xl">
                    <label className="text-[10px] text-zinc-400 uppercase font-black tracking-wider block mb-1.5 font-display">Classes Held So Far</label>
                    <input
                      type="number"
                      value={attendanceStatusMode.total}
                      onChange={(e) => setAttendanceStatusMode(prev => ({ ...prev, total: e.target.value }))}
                      placeholder="e.g. 51"
                      className="w-full glass-input p-2.5 text-sm font-bold text-center focus:border-emerald-500/50 focus:ring-emerald-500/10"
                    />
                  </div>
                  <div className="bg-white/[0.02] border border-white/[0.05] p-3.5 rounded-xl">
                    <label className="text-[10px] text-zinc-400 uppercase font-black tracking-wider block mb-1.5 font-display">Attended</label>
                    <input
                      type="number"
                      value={attendanceStatusMode.attended}
                      onChange={(e) => setAttendanceStatusMode(prev => ({ ...prev, attended: e.target.value }))}
                      placeholder="e.g. 48"
                      className="w-full glass-input p-2.5 text-sm font-bold text-center focus:border-emerald-500/50 focus:ring-emerald-500/10"
                    />
                  </div>
                </div>

                {statusStats.invalid && (
                  <div className="text-xs text-red-400 font-semibold bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Attended classes cannot be greater than classes held.</span>
                  </div>
                )}

                {statusStats.ready ? (
                  <div className="space-y-4">
                    <div className={`p-5 rounded-2xl border transition-all ${
                      statusStats.isAboveMinimum 
                        ? 'bg-emerald-500/[0.02] border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.02)]' 
                        : 'bg-red-500/[0.02] border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.02)]'
                    }`}>
                      <div className="flex justify-between items-center mb-3">
                        <span className={`text-xs font-bold font-display uppercase tracking-wider ${statusStats.isAboveMinimum ? 'text-emerald-400' : 'text-red-400'}`}>
                          Current Attendance Status
                        </span>
                        <span className={`text-2xl font-black font-display ${statusStats.isAboveMinimum ? 'text-emerald-400 text-glow-emerald' : 'text-red-400'}`}>
                          {statusStats.currentPercentage.toFixed(2)}%
                        </span>
                      </div>
                      <div className="w-full bg-black/40 border border-white/[0.05] h-3 rounded-full overflow-hidden p-0.5">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            statusStats.isAboveMinimum 
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]' 
                              : 'bg-gradient-to-r from-red-500 to-rose-400'
                          }`}
                          style={{ width: `${Math.min(100, statusStats.currentPercentage)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] mt-2 font-semibold text-zinc-500">
                        <span>0%</span>
                        <span className={`font-bold ${statusStats.isAboveMinimum ? 'text-emerald-400' : 'text-red-400'}`}>
                          {ATTENDANCE_MIN_PERCENT}% Required Baseline
                        </span>
                        <span>100%</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3.5 shadow-sm">
                        <div className="text-[9px] uppercase font-black text-zinc-400 tracking-wider font-display">Classes Attended / Held</div>
                        <div className="text-base font-black mt-1.5 text-zinc-200 font-display">{statusStats.attended}/{statusStats.total}</div>
                      </div>
                      <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3.5 shadow-sm">
                        <div className="text-[9px] uppercase font-black text-zinc-400 tracking-wider font-display">Consecutive Skip Allowance</div>
                        <div className={`text-base font-black mt-1.5 font-display ${statusStats.maxConsecutiveSkipsNow > 0 ? 'text-emerald-400' : 'text-zinc-500'}`}>
                          {statusStats.maxConsecutiveSkipsNow} {statusStats.maxConsecutiveSkipsNow === 1 ? 'class' : 'classes'}
                        </div>
                      </div>
                      {!statusStats.isAboveMinimum && (
                        <div className="bg-red-500/[0.02] border border-red-500/20 rounded-xl p-3.5 shadow-sm">
                          <div className="text-[9px] uppercase font-black text-red-300 tracking-wider font-display">Classes Needed to Recover</div>
                          <div className="text-base font-black mt-1.5 text-red-400 font-display">{statusStats.classesToAttendNow} classes</div>
                        </div>
                      )}
                      <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3.5 shadow-sm">
                        <div className="text-[9px] uppercase font-black text-zinc-400 tracking-wider font-display">Safety Margin</div>
                        <div className={`text-base font-black mt-1.5 font-display ${statusStats.currentPercentage >= ATTENDANCE_MIN_PERCENT ? 'text-emerald-400' : 'text-red-400'}`}>
                          {(statusStats.currentPercentage >= ATTENDANCE_MIN_PERCENT ? '+' : '')}
                          {(statusStats.currentPercentage - ATTENDANCE_MIN_PERCENT).toFixed(2)}%
                        </div>
                      </div>
                      {statusStats.isAboveMinimum && statusStats.maxConsecutiveSkipsNow > 0 && (
                        <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3.5 shadow-sm col-span-1 sm:col-span-2 lg:col-span-1">
                          <div className="text-[9px] uppercase font-black text-zinc-400 tracking-wider font-display">Post-Skip Attendance Projection</div>
                          <div className="text-base font-black mt-1.5 text-zinc-200 font-display">
                            {((statusStats.attended / (statusStats.total + statusStats.maxConsecutiveSkipsNow)) * 100).toFixed(2)}%
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-zinc-300 bg-white/[0.02] border border-white/[0.05] p-3.5 rounded-xl leading-relaxed">
                      {statusStats.isAboveMinimum
                        ? `You are above ${ATTENDANCE_MIN_PERCENT}%. You can miss ${statusStats.maxConsecutiveSkipsNow} consecutive classes before you need to attend again.`
                        : `You are below ${ATTENDANCE_MIN_PERCENT}%. Attend the next ${statusStats.classesToAttendNow} classes continuously to recover above the minimum.`}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-zinc-500 text-xs font-semibold bg-white/[0.01] border border-dashed border-white/[0.05] rounded-xl">
                    Enter classes held and attended to view this mode.
                  </div>
                )}

                {/* TARGET BUFFER ACCORDION SECTION */}
                <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
                    <div className="text-sm font-bold font-display text-zinc-200">Separate Target Planner (Buffer)</div>
                    <div className="text-[10px] text-zinc-500 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.05] font-semibold">Used in Mode 2/3/4</div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-black/20 p-3 rounded-xl border border-white/[0.03]">
                      <label className="text-[10px] text-zinc-400 uppercase font-black tracking-wider block mb-1.5 font-display">Target Attendance %</label>
                      <input
                        type="number"
                        value={attendanceStatusMode.bufferPercent}
                        onChange={(e) => setAttendanceStatusMode(prev => ({ ...prev, bufferPercent: e.target.value }))}
                        placeholder="e.g. 80"
                        className="w-full glass-input p-2.5 text-sm font-bold text-center focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {targetStatusStats ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3.5 shadow-sm">
                          <div className="text-[9px] uppercase font-black text-zinc-400 tracking-wider font-display">
                            Max Miss Limit (Target {targetStatusStats.targetPercent.toFixed(2)}%)
                          </div>
                          <div className={`text-base font-black mt-1.5 font-display ${targetStatusStats.maxConsecutiveSkipsForTarget > 0 ? 'text-emerald-400' : 'text-zinc-500'}`}>
                            {targetStatusStats.maxConsecutiveSkipsForTarget} classes
                          </div>
                        </div>
                        {!targetStatusStats.isAboveTarget && (
                          <div className="bg-amber-500/[0.02] border border-amber-500/20 rounded-xl p-3.5 shadow-sm">
                            <div className="text-[9px] uppercase font-black text-amber-300 tracking-wider font-display">
                              Required Attendance Streak for Target
                            </div>
                            <div className="text-base font-black mt-1.5 text-amber-400 font-display">{targetStatusStats.classesToAttendForTarget} classes</div>
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-zinc-400 leading-relaxed bg-black/20 p-3 rounded-xl border border-white/[0.03]">
                        {targetStatusStats.isAboveTarget
                          ? `You are already above ${targetStatusStats.targetPercent.toFixed(2)}%.`
                          : `You are below ${targetStatusStats.targetPercent.toFixed(2)}%. Attend ${targetStatusStats.classesToAttendForTarget} consecutive classes to recover.`}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-zinc-500 italic font-medium">
                      Fill classes held and attended above to activate this target planner.
                    </div>
                  )}
                </div>
              </div>
            </details>

            {/* MODE 2 ACCORDION */}
            <details className="glass-card rounded-2xl group overflow-hidden">
              <summary className="flex items-center justify-between p-4 cursor-pointer list-none select-none hover:bg-white/[0.02] transition-colors border-b border-transparent group-open:border-white/[0.05]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/25 shadow-sm">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold font-display text-zinc-200">Mode 2 — Plan Using Classes Remaining</span>
                </div>
                <ChevronDown className="w-4 h-4 text-zinc-400 opacity-60 transition-transform group-open:rotate-180" />
              </summary>

              <div className="p-5 space-y-4">
                <div className="text-[10px] text-zinc-400 bg-blue-500/[0.03] border border-blue-500/20 px-3.5 py-2.5 rounded-xl leading-relaxed">
                  {statusStats.ready
                    ? `Using Mode 1 baseline: ${statusStats.attended}/${statusStats.total} (${statusStats.currentPercentage.toFixed(2)}%). Buffer target: ${sharedBufferPercent.toFixed(2)}%.`
                    : 'Fill Mode 1 first to unlock this planner.'}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-white/[0.02] border border-white/[0.05] p-3.5 rounded-xl">
                    <label className="text-[10px] text-zinc-400 uppercase font-black tracking-wider block mb-1.5 font-display">Classes Left</label>
                    <input
                      type="number"
                      value={attendanceClassesLeftMode.classesLeft}
                      onChange={(e) => setAttendanceClassesLeftMode(prev => ({ ...prev, classesLeft: e.target.value }))}
                      placeholder="e.g. 24"
                      className="w-full glass-input p-2.5 text-sm font-bold text-center focus:border-blue-500/50 focus:ring-blue-500/10"
                    />
                  </div>
                </div>

                {classesLeftPlan && statusStats.ready ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3.5 shadow-sm">
                      <div className="text-[9px] uppercase font-black text-zinc-400 tracking-wider font-display">Allowed Misses (75% Target)</div>
                      <div className="text-base font-black mt-1.5 text-emerald-400 font-display">{classesLeftPlan.safeMisses75}</div>
                    </div>
                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3.5 shadow-sm">
                      <div className="text-[9px] uppercase font-black text-zinc-400 tracking-wider font-display">Must Attend (75% Target)</div>
                      <div className="text-base font-black mt-1.5 text-zinc-200 font-display">{classesLeftPlan.mustAttendFor75}</div>
                    </div>
                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3.5 shadow-sm">
                      <div className="text-[9px] uppercase font-black text-zinc-400 tracking-wider font-display">Allowed Misses (Buffer {sharedBufferPercent.toFixed(2)}%)</div>
                      <div className="text-base font-black mt-1.5 text-zinc-200 font-display">{classesLeftPlan.safeMissesBuffer}</div>
                    </div>
                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3.5 shadow-sm">
                      <div className="text-[9px] uppercase font-black text-zinc-400 tracking-wider font-display">Projected End Range</div>
                      <div className="text-sm font-black mt-1.5 text-zinc-200 font-display">{classesLeftPlan.worstFinalPercentage.toFixed(2)}% - {classesLeftPlan.bestFinalPercentage.toFixed(2)}%</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-zinc-500 text-xs font-semibold bg-white/[0.01] border border-dashed border-white/[0.05] rounded-xl">
                    {statusStats.ready ? 'Enter classes left to see the result.' : 'Complete Mode 1 first to use this planner.'}
                  </div>
                )}
              </div>
            </details>

            {/* MODE 3 ACCORDION */}
            <details className="glass-card rounded-2xl group overflow-hidden">
              <summary className="flex items-center justify-between p-4 cursor-pointer list-none select-none hover:bg-white/[0.02] transition-colors border-b border-transparent group-open:border-white/[0.05]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/25 shadow-sm">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold font-display text-zinc-200">Mode 3 — Plan Using Total Semester Classes</span>
                </div>
                <ChevronDown className="w-4 h-4 text-zinc-400 opacity-60 transition-transform group-open:rotate-180" />
              </summary>

              <div className="p-5 space-y-4">
                <div className="text-[10px] text-zinc-400 bg-emerald-500/[0.03] border border-emerald-500/20 px-3.5 py-2.5 rounded-xl leading-relaxed">
                  {statusStats.ready
                    ? `Using Mode 1 baseline: ${statusStats.attended}/${statusStats.total} (${statusStats.currentPercentage.toFixed(2)}%). Buffer target: ${sharedBufferPercent.toFixed(2)}%.`
                    : 'Fill Mode 1 first to unlock this planner.'}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-white/[0.02] border border-white/[0.05] p-3.5 rounded-xl">
                    <label className="text-[10px] text-zinc-400 uppercase font-black tracking-wider block mb-1.5 font-display">Total Classes in Semester</label>
                    <input
                      type="number"
                      value={attendanceSemesterMode.semesterTotal}
                      onChange={(e) => setAttendanceSemesterMode(prev => ({ ...prev, semesterTotal: e.target.value }))}
                      placeholder="e.g. 90"
                      className="w-full glass-input p-2.5 text-sm font-bold text-center focus:border-emerald-500/50 focus:ring-emerald-500/10"
                    />
                  </div>
                </div>

                {semesterPlan?.invalid ? (
                  <div className="text-xs text-red-400 font-semibold bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
                    Semester total cannot be less than classes already held.
                  </div>
                ) : semesterPlan && statusStats.ready ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3.5 shadow-sm">
                      <div className="text-[9px] uppercase font-black text-zinc-400 tracking-wider font-display">Classes Remaining</div>
                      <div className="text-base font-black mt-1.5 text-zinc-200 font-display">{semesterPlan.classesLeft}</div>
                    </div>
                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3.5 shadow-sm">
                      <div className="text-[9px] uppercase font-black text-zinc-400 tracking-wider font-display">Semester Miss Limit (75%)</div>
                      <div className="text-base font-black mt-1.5 text-zinc-200 font-display">{semesterPlan.maxTotalMissesWhole75}</div>
                    </div>
                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3.5 shadow-sm">
                      <div className="text-[9px] uppercase font-black text-zinc-400 tracking-wider font-display">Additional Misses Allowed (75%)</div>
                      <div className="text-base font-black mt-1.5 text-emerald-400 font-display">{semesterPlan.safeMisses75}</div>
                    </div>
                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3.5 shadow-sm">
                      <div className="text-[9px] uppercase font-black text-zinc-400 tracking-wider font-display">Must Attend (75% Target)</div>
                      <div className="text-base font-black mt-1.5 text-zinc-200 font-display">{semesterPlan.mustAttendFor75}</div>
                    </div>
                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3.5 shadow-sm">
                      <div className="text-[9px] uppercase font-black text-zinc-400 tracking-wider font-display">Additional Misses (Buffer {sharedBufferPercent.toFixed(2)}%)</div>
                      <div className="text-base font-black mt-1.5 text-zinc-200 font-display">{semesterPlan.safeMissesBuffer}</div>
                    </div>
                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3.5 shadow-sm">
                      <div className="text-[9px] uppercase font-black text-zinc-400 tracking-wider font-display">Projected End Range</div>
                      <div className="text-sm font-black mt-1.5 text-zinc-200 font-display">{semesterPlan.worstFinalPercentage.toFixed(2)}% - {semesterPlan.bestFinalPercentage.toFixed(2)}%</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-zinc-500 text-xs font-semibold bg-white/[0.01] border border-dashed border-white/[0.05] rounded-xl">
                    {statusStats.ready ? 'Enter total semester classes to see the result.' : 'Complete Mode 1 first to use this planner.'}
                  </div>
                )}
              </div>
            </details>

            {/* MODE 4 ACCORDION */}
            <details className="glass-card rounded-2xl group overflow-hidden">
              <summary className="flex items-center justify-between p-4 cursor-pointer list-none select-none hover:bg-white/[0.02] transition-colors border-b border-transparent group-open:border-white/[0.05]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400 border border-violet-500/25 shadow-sm">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold font-display text-zinc-200">Mode 4 — Weekly Class Range Planner</span>
                </div>
                <ChevronDown className="w-4 h-4 text-zinc-400 opacity-60 transition-transform group-open:rotate-180" />
              </summary>

              <div className="p-5 space-y-4">
                <div className="text-[10px] text-zinc-400 bg-violet-500/[0.03] border border-violet-500/20 px-3.5 py-2.5 rounded-xl leading-relaxed">
                  {statusStats.ready
                    ? `Using Mode 1 baseline: ${statusStats.attended}/${statusStats.total} (${statusStats.currentPercentage.toFixed(2)}%). Buffer target: ${sharedBufferPercent.toFixed(2)}%.`
                    : 'Fill Mode 1 first to unlock this planner.'}
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="bg-white/[0.02] border border-white/[0.05] p-3.5 rounded-xl col-span-2 lg:col-span-1">
                    <label className="text-[10px] text-zinc-400 uppercase font-black tracking-wider block mb-1.5 font-display">Weeks Left</label>
                    <input
                      type="number"
                      value={attendanceWeeklyMode.weeksLeft}
                      onChange={(e) => setAttendanceWeeklyMode(prev => ({ ...prev, weeksLeft: e.target.value }))}
                      placeholder="e.g. 6"
                      className="w-full glass-input p-2.5 text-sm font-bold text-center focus:border-violet-500/50 focus:ring-violet-500/10"
                    />
                  </div>
                  <div className="bg-white/[0.02] border border-white/[0.05] p-3.5 rounded-xl">
                    <label className="text-[10px] text-zinc-400 uppercase font-black tracking-wider block mb-1.5 font-display">Min Classes / Week</label>
                    <input
                      type="number"
                      value={attendanceWeeklyMode.minPerWeek}
                      onChange={(e) => setAttendanceWeeklyMode(prev => ({ ...prev, minPerWeek: e.target.value }))}
                      placeholder="e.g. 4"
                      className="w-full glass-input p-2.5 text-sm font-bold text-center focus:border-violet-500/50 focus:ring-violet-500/10"
                    />
                  </div>
                  <div className="bg-white/[0.02] border border-white/[0.05] p-3.5 rounded-xl">
                    <label className="text-[10px] text-zinc-400 uppercase font-black tracking-wider block mb-1.5 font-display">Max Classes / Week</label>
                    <input
                      type="number"
                      value={attendanceWeeklyMode.maxPerWeek}
                      onChange={(e) => setAttendanceWeeklyMode(prev => ({ ...prev, maxPerWeek: e.target.value }))}
                      placeholder="e.g. 6"
                      className="w-full glass-input p-2.5 text-sm font-bold text-center focus:border-violet-500/50 focus:ring-violet-500/10"
                    />
                  </div>
                </div>

                <div className="text-[10px] text-zinc-500 font-semibold bg-black/20 p-2.5 rounded-xl border border-white/[0.03]">
                  Use the same number for minimum and maximum if every week has the same class count.
                </div>

                {weeklyPlan?.minPlan && weeklyPlan?.maxPlan && statusStats.ready ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3.5 shadow-sm">
                      <div className="text-[9px] uppercase font-black text-zinc-400 tracking-wider font-display">Remaining Classes (Est)</div>
                      <div className="text-base font-black mt-1.5 text-zinc-200 font-display">{weeklyPlan.minPlan.remaining}{weeklyPlan.maxPlan.remaining !== weeklyPlan.minPlan.remaining && <span className="text-zinc-500 font-semibold"> - {weeklyPlan.maxPlan.remaining}</span>}</div>
                    </div>
                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3.5 shadow-sm">
                      <div className="text-[9px] uppercase font-black text-zinc-400 tracking-wider font-display">Allowed Misses (75% Target)</div>
                      <div className="text-base font-black mt-1.5 text-emerald-400 font-display">{weeklyPlan.minPlan.safeMisses75}{weeklyPlan.maxPlan.safeMisses75 !== weeklyPlan.minPlan.safeMisses75 && <span className="text-emerald-500/50 font-semibold"> - {weeklyPlan.maxPlan.safeMisses75}</span>}</div>
                    </div>
                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3.5 shadow-sm">
                      <div className="text-[9px] uppercase font-black text-zinc-400 tracking-wider font-display">Allowed Misses (Buffer {sharedBufferPercent.toFixed(2)}%)</div>
                      <div className="text-base font-black mt-1.5 text-zinc-200 font-display">{weeklyPlan.minPlan.safeMissesBuffer}{weeklyPlan.maxPlan.safeMissesBuffer !== weeklyPlan.minPlan.safeMissesBuffer && <span className="text-zinc-500 font-semibold"> - {weeklyPlan.maxPlan.safeMissesBuffer}</span>}</div>
                    </div>
                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3.5 shadow-sm">
                      <div className="text-[9px] uppercase font-black text-zinc-400 tracking-wider font-display">Projected End Range</div>
                      <div className="text-sm font-black mt-1.5 text-zinc-200 font-display">{weeklyPlan.minPlan.worstFinalPercentage.toFixed(2)}% - {weeklyPlan.maxPlan.bestFinalPercentage.toFixed(2)}%</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-zinc-500 text-xs font-semibold bg-white/[0.01] border border-dashed border-white/[0.05] rounded-xl">
                    {statusStats.ready ? 'Enter weekly range values to see the result.' : 'Complete Mode 1 first to use this planner.'}
                  </div>
                )}
              </div>
            </details>

            {/* MODE 5 ACCORDION */}
            <details className="glass-card rounded-2xl group overflow-hidden">
              <summary className="flex items-center justify-between p-4 cursor-pointer list-none select-none hover:bg-white/[0.02] transition-colors border-b border-transparent group-open:border-white/[0.05]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/25 shadow-sm">
                    <Activity className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold font-display text-zinc-200">Mode 5 — Miss Impact Planner</span>
                </div>
                <ChevronDown className="w-4 h-4 text-zinc-400 opacity-60 transition-transform group-open:rotate-180" />
              </summary>

              <div className="p-5 space-y-4">
                <div className="text-[10px] text-zinc-400 bg-amber-500/[0.03] border border-amber-500/20 px-3.5 py-2.5 rounded-xl leading-relaxed">
                  {statusStats.ready
                    ? `Using Mode 1 baseline: ${statusStats.attended}/${statusStats.total} (${statusStats.currentPercentage.toFixed(2)}%).`
                    : 'Fill Mode 1 first to unlock this planner.'}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-white/[0.02] border border-white/[0.05] p-3.5 rounded-xl">
                    <label className="text-[10px] text-zinc-400 uppercase font-black tracking-wider block mb-1.5 font-display">How many classes do you want to miss?</label>
                    <input
                      type="number"
                      value={attendanceMissPlannerMode.misses}
                      onChange={(e) => setAttendanceMissPlannerMode(prev => ({ ...prev, misses: e.target.value }))}
                      placeholder="e.g. 3"
                      className="w-full glass-input p-2.5 text-sm font-bold text-center focus:border-amber-500/50 focus:ring-amber-500/10"
                    />
                  </div>
                </div>

                {missImpactPlan && statusStats.ready ? (
                  <div className="space-y-3">
                    <div className={`grid ${missImpactPlan.isBelowAfterMisses ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'} gap-3`}>
                      <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3.5 shadow-sm">
                        <div className="text-[9px] uppercase font-black text-zinc-400 tracking-wider font-display">Attendance After Missing {missImpactPlan.plannedMisses} Class(es)</div>
                        <div className={`text-base font-black mt-1.5 font-display ${missImpactPlan.isBelowAfterMisses ? 'text-red-400' : 'text-emerald-400'}`}>
                          {missImpactPlan.attendanceAfterPlannedMisses.toFixed(2)}%
                        </div>
                      </div>
                      {missImpactPlan.isBelowAfterMisses && (
                        <div className="bg-red-500/[0.02] border border-red-500/20 rounded-xl p-3.5 shadow-sm">
                          <div className="text-[9px] uppercase font-black text-red-300 tracking-wider font-display">Streak Needed to Recover 75%</div>
                          <div className="text-base font-black mt-1.5 text-red-400 font-display">{missImpactPlan.classesToRecoverAfterMisses} classes</div>
                        </div>
                      )}
                    </div>
                    {missImpactPlan.isBelowAfterMisses && (
                      <div className="text-xs text-red-400 font-semibold bg-red-500/10 border border-red-500/20 p-3.5 rounded-xl leading-relaxed">
                        Missing {missImpactPlan.plannedMisses} class(es) will drop you below 75%. You would need to attend {missImpactPlan.classesToRecoverAfterMisses} consecutive classes after that to recover.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6 text-zinc-500 text-xs font-semibold bg-white/[0.01] border border-dashed border-white/[0.05] rounded-xl">
                    {statusStats.ready ? 'Enter planned missed classes to see the result.' : 'Complete Mode 1 first to use this planner.'}
                  </div>
                )}
              </div>
            </details>
          </div>
        )}

        {/* ==================== CGPA TAB ==================== */}
        {activeTab === 'cgpa' && (
          <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">

            {/* Header & Result Card */}
            <div className="glass-card p-6 rounded-2xl shadow-2xl text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-teal-400 via-emerald-500 to-indigo-500"></div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-teal-500/[0.06] blur-[40px] pointer-events-none"></div>

              <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400 font-display mb-3">Cumulative GPA</h2>

              <div className="flex flex-col items-center justify-center gap-1">
                <div className="relative w-28 h-28 flex items-center justify-center rounded-full border-2 border-teal-500/20 bg-teal-500/[0.02] shadow-[0_0_30px_rgba(20,184,166,0.05)] mb-3">
                  <span className="text-4xl md:text-5xl font-black text-teal-400 font-display text-glow-emerald">
                    {(() => {
                      const filledSems = semesterData.filter(s => s.sgpa && s.credits);
                      if (filledSems.length === 0) return "0.00";

                      const totalPoints = filledSems.reduce((sum, s) => sum + (parseFloat(s.sgpa) * parseFloat(s.credits)), 0);
                      const totalCredits = filledSems.reduce((sum, s) => sum + parseFloat(s.credits), 0);

                      return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";
                    })()}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider bg-white/[0.04] border border-white/[0.05] px-2.5 py-1 rounded-full">
                  Based on {semesterData.filter(s => s.sgpa && s.credits).length} semesters of data
                </p>
              </div>
            </div>

            {/* Helper Info */}
            <div className="flex items-center gap-2.5 text-xs text-zinc-400 px-3 bg-white/[0.02] border border-white/[0.05] py-2.5 rounded-xl">
              <Info className="w-4 h-4 text-teal-400 shrink-0" />
              <span>Enter SGPA and Credits for completed semesters. Leave future ones blank.</span>
            </div>

            {/* Semesters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {semesterData.map((sem) => {
                const isActive = sem.sgpa && sem.credits;
                return (
                  <div
                    key={sem.id}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all ${
                      isActive
                        ? 'glass-card border-teal-500/35 shadow-[0_0_15px_rgba(20,184,166,0.03)]'
                        : 'bg-white/[0.02] border-white/[0.05] opacity-75 hover:opacity-100 hover:border-white/[0.08]'
                    }`}
                  >
                    {/* Semester Label */}
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm font-display shrink-0 border ${
                      isActive
                        ? 'bg-teal-500/10 border-teal-500/20 text-teal-300 shadow-[0_0_10px_rgba(20,184,166,0.1)]'
                        : 'bg-white/[0.04] border-white/[0.05] text-zinc-500'
                    }`}>
                      S{sem.id}
                    </div>

                    {/* Inputs */}
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-wider text-zinc-500 mb-1 ml-1 font-display">SGPA</label>
                        <input
                          type="number"
                          value={sem.sgpa}
                          onChange={(e) => updateSemester(sem.id, 'sgpa', e.target.value)}
                          placeholder="-"
                          className="w-full glass-input p-2 text-xs font-bold text-center focus:ring-teal-500/30"
                          min="0" max="10" step="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-wider text-zinc-500 mb-1 ml-1 font-display">Credits</label>
                        <input
                          type="number"
                          value={sem.credits}
                          onChange={(e) => updateSemester(sem.id, 'credits', e.target.value)}
                          placeholder="-"
                          className="w-full glass-input p-2 text-xs text-center focus:ring-teal-500/30"
                          min="0" max="30"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex justify-end pt-2">
              <button
                onClick={resetCGPA}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/30 rounded-xl transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_10px_rgba(239,68,68,0.03)]"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear History
              </button>
            </div>

            {/* Disclaimer */}
            <div className="text-center text-[10px] text-zinc-500 opacity-60 mt-4">
              Calculated using: Σ (SGPA × Credits) / Σ Credits
            </div>

            {/* ==================== QUICK PREVIOUS CGPA CALCULATOR (Fully Manual) ==================== */}
            <div className="glass-card rounded-2xl overflow-hidden mt-6">
              <details className="group">
                <summary className="flex items-center justify-between p-4 cursor-pointer list-none select-none hover:bg-white/[0.02] transition-colors border-b border-transparent group-open:border-white/[0.05]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center shadow-sm">
                      <span className="text-lg">⚡</span>
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-zinc-200 font-display">Quick CGPA Estimator</h3>
                        <span className="text-[9px] text-zinc-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 font-bold uppercase tracking-wider">Isolated</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Calculate new CGPA by combining previous history + current sem results
                      </p>
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-zinc-400 opacity-60 transition-transform group-open:rotate-180" />
                </summary>

                <div className="p-5 bg-black/10 space-y-4">
                  {/* Row 1: Previous Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#030307]/40 border border-white/[0.05] p-3 rounded-xl">
                      <label className="text-[10px] text-zinc-400 uppercase font-black tracking-wider block mb-1.5 font-display">Previous CGPA</label>
                      <input
                        type="number"
                        placeholder="e.g. 8.5"
                        value={simpleCgpa.prevCgpa}
                        onChange={(e) => setSimpleCgpa(prev => ({ ...prev, prevCgpa: e.target.value }))}
                        className="w-full glass-input p-2 text-sm font-bold text-center focus:border-indigo-500/50"
                      />
                    </div>
                    <div className="bg-[#030307]/40 border border-white/[0.05] p-3 rounded-xl">
                      <label className="text-[10px] text-zinc-400 uppercase font-black tracking-wider block mb-1.5 font-display">Prev Credits</label>
                      <input
                        type="number"
                        placeholder="e.g. 80"
                        value={simpleCgpa.prevCredits}
                        onChange={(e) => setSimpleCgpa(prev => ({ ...prev, prevCredits: e.target.value }))}
                        className="w-full glass-input p-2 text-sm font-bold text-center focus:border-indigo-500/50"
                      />
                    </div>
                  </div>

                  {/* Row 2: Current Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-emerald-500/[0.01] border border-emerald-500/20 p-3 rounded-xl">
                      <label className="text-[10px] text-emerald-400 uppercase font-black tracking-wider block mb-1.5 font-display">Current Sem SGPA</label>
                      <input
                        type="number"
                        placeholder="e.g. 9.2"
                        value={simpleCgpa.currSgpa}
                        onChange={(e) => setSimpleCgpa(prev => ({ ...prev, currSgpa: e.target.value }))}
                        className="w-full glass-input p-2 text-sm font-bold text-center focus:border-emerald-500/50 border-emerald-500/30 text-emerald-300"
                      />
                    </div>
                    <div className="bg-emerald-500/[0.01] border border-emerald-500/20 p-3 rounded-xl">
                      <label className="text-[10px] text-emerald-400 uppercase font-black tracking-wider block mb-1.5 font-display">Sem Credits</label>
                      <input
                        type="number"
                        placeholder="e.g. 24"
                        value={simpleCgpa.currCredits}
                        onChange={(e) => setSimpleCgpa(prev => ({ ...prev, currCredits: e.target.value }))}
                        className="w-full glass-input p-2 text-sm font-bold text-center focus:border-emerald-500/50 border-emerald-500/30 text-emerald-300"
                      />
                    </div>
                  </div>

                  {/* Calculation Result */}
                  <div className="bg-[#030307]/80 rounded-xl p-4 border border-white/[0.05] shadow-inner flex items-center justify-between">
                    {(() => {
                      const pCgpa = parseFloat(simpleCgpa.prevCgpa) || 0;
                      const pCreds = parseFloat(simpleCgpa.prevCredits) || 0;
                      const cSgpa = parseFloat(simpleCgpa.currSgpa) || 0;
                      const cCreds = parseFloat(simpleCgpa.currCredits) || 0;

                      let newCGPA = "0.00";
                      if (pCreds + cCreds > 0) {
                        const totalPoints = (pCgpa * pCreds) + (cSgpa * cCreds);
                        const totalCreds = pCreds + cCreds;
                        newCGPA = (totalPoints / totalCreds).toFixed(2);
                      }

                      return (
                        <>
                          <div className="text-xs text-zinc-400">
                            <div>Total Degree Credits: <strong className="text-white font-display">{pCreds + cCreds}</strong></div>
                          </div>
                          <div className="text-right">
                            <div className="text-[9px] uppercase font-black text-zinc-500 tracking-wider font-display">Predicted CGPA</div>
                            <div className="text-3xl font-black text-indigo-400 text-glow-indigo font-display">{newCGPA}</div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </details>
            </div>

          </div>
        )}

        {/* ==================== GUIDE TAB ==================== */}
        {activeTab === 'guide' && (
          <div className="space-y-6">

            {/* Intro Banner */}
            <div className="glass-card rounded-2xl shadow-2xl p-6 text-zinc-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-yellow-500/[0.04] blur-[70px] rounded-full pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-36 h-36 bg-purple-500/[0.03] blur-[60px] rounded-full pointer-events-none"></div>
              
              <div className="relative z-10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/25 flex items-center justify-center text-yellow-400 shrink-0 shadow-[0_0_15px_rgba(234,179,8,0.05)] animate-pulse">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2 font-display">
                    User Guide & Pro Features
                  </h2>
                  <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
                    Everything you need to know: from keyboard shortcuts to the "Momentum" logic.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-[10px] text-zinc-600 text-right pr-1">
              AI assistance was used to some extent.
            </div>

            {/* 1. POWER USER FEATURES (Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Feature A: Local Storage */}
              <div className="glass-card rounded-2xl p-5 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/[0.02] blur-[30px] rounded-full pointer-events-none"></div>
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400 mb-4 shadow-[0_0_10px_rgba(59,130,246,0.05)]">
                  <Download className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm mb-2 text-zinc-100 font-display">Auto-Save & Privacy</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Your data is <strong className="text-zinc-200">saved locally</strong> in your browser. Close the tab, restart your laptop—your marks will still be here. No login required. This data is not collected or sent anywhere.
                </p>
              </div>

              {/* Feature B: Presets */}
              <div className="glass-card rounded-2xl p-5 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/[0.02] blur-[30px] rounded-full pointer-events-none"></div>
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400 mb-4 shadow-[0_0_10px_rgba(168,85,247,0.05)]">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm mb-2 text-zinc-100 font-display">One-Click Presets</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Don't type subjects manually! In the <strong className="text-zinc-200">Subjects Tab</strong>, use the dropdown at the top to instantly load the "Physics Cycle" or "Chemistry Cycle".
                </p>
              </div>

              {/* Feature C: Shortcuts */}
              <div className="glass-card rounded-2xl p-5 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.01] blur-[30px] rounded-full pointer-events-none"></div>
                <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-zinc-300 mb-4 font-mono text-xs font-black shadow-sm">
                  CTRL
                </div>
                <h3 className="font-bold text-sm mb-3 text-zinc-100 font-display">Keyboard Shortcuts</h3>
                <div className="text-xs text-zinc-400 space-y-2">
                  <div className="flex justify-between items-center border-b border-white/[0.03] pb-1.5">
                    <span>Undo</span> 
                    <kbd className="font-mono bg-white/[0.06] border border-white/[0.08] px-1.5 py-0.5 rounded text-[10px] font-bold text-zinc-300 shadow-sm">Ctrl+Z</kbd>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/[0.03] pb-1.5">
                    <span>Redo</span> 
                    <kbd className="font-mono bg-white/[0.06] border border-white/[0.08] px-1.5 py-0.5 rounded text-[10px] font-bold text-zinc-300 shadow-sm">Ctrl+Y</kbd>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/[0.03] pb-1.5">
                    <span>Export</span> 
                    <kbd className="font-mono bg-white/[0.06] border border-white/[0.08] px-1.5 py-0.5 rounded text-[10px] font-bold text-zinc-300 shadow-sm">Ctrl+S</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Close Panel</span> 
                    <kbd className="font-mono bg-white/[0.06] border border-white/[0.08] px-1.5 py-0.5 rounded text-[10px] font-bold text-zinc-300 shadow-sm">Esc</kbd>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. THE MOMENTUM LOGIC */}
            <div className="glass-card rounded-2xl overflow-hidden shadow-xl">
              <div className="p-4 border-b border-white/[0.05] bg-white/[0.01] flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400 animate-pulse" />
                <h3 className="font-bold text-sm font-display text-zinc-200">How "Momentum" Works</h3>
              </div>
              <div className="p-5 space-y-4">
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Usually, if you leave a field blank (like ISA 2), calculators treat it as a <strong className="text-zinc-300">0</strong>. This crashes your predicted SGPA.
                </p>
                <div className="bg-amber-500/[0.02] p-4 rounded-xl border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.02)]">
                  <strong className="text-xs text-amber-300 font-display block mb-2">The Solution: Smart Projection</strong>
                  <p className="text-xs text-amber-200/80 leading-relaxed space-y-2">
                    <span>If you have marks for ISA 1 but <strong>not</strong> ISA 2, we assume you will perform <em>similarly</em> in ISA 2. This "Momentum Score" is used to give you realistic predictions before you've even written the exam.</span>
                    <span className="block mt-2">If Assignment or Lab is empty, momentum assumes full marks for those components. If ESA is empty, momentum estimates it using your current internal performance ratio.</span>
                  </p>
                  <p className="text-[9px] mt-3 text-amber-400 font-mono font-bold tracking-wider uppercase">
                    *Look for the "Using Momentum" warning in the Reverse tab if you have empty fields.
                  </p>
                </div>
              </div>
            </div>

            {/* 3. THE HIDDEN GEM: Reverse Calculator */}
            <div className="glass-card bg-gradient-to-br from-emerald-500/[0.01] to-teal-500/[0.01] border border-emerald-500/20 rounded-2xl overflow-hidden shadow-xl relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/[0.03] blur-[40px] rounded-full pointer-events-none"></div>
              
              <div className="p-4 border-b border-emerald-500/10 bg-emerald-500/[0.03] flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm font-display text-emerald-300">The Hidden Gem: Reverse Calculator</h3>
              </div>
              
              <div className="p-5 space-y-4">
                <p className="text-xs font-semibold text-emerald-250 font-display">
                  You set the SGPA (e.g., 9.0), we tell you exactly what marks you need.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* The 3 Buttons Explained */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-xs text-emerald-400 font-display">The 3 Magic Buttons</h4>
                    <ul className="space-y-3.5">
                      <li className="flex gap-3 items-start">
                        <div className="bg-black/40 border border-white/[0.05] p-2 rounded-xl shadow-sm flex-shrink-0">
                          <Target className="w-4 h-4 text-blue-400" />
                        </div>
                        <div>
                          <strong className="text-xs block text-zinc-200 font-display">Default (Efficient)</strong>
                          <p className="text-[10px] text-zinc-400 leading-relaxed mt-0.5">
                            The "Lazy" path. It finds the <strong>absolute cheapest way</strong> to hit your target, even if it means getting 99 in one subject and 40 in another.
                          </p>
                        </div>
                      </li>
                      <li className="flex gap-3 items-start">
                        <div className="bg-black/40 border border-white/[0.05] p-2 rounded-xl shadow-sm flex-shrink-0">
                          <Dice5 className="w-4 h-4 text-purple-400" />
                        </div>
                        <div>
                          <strong className="text-xs block text-zinc-200 font-display">Shuffle</strong>
                          <p className="text-[10px] text-zinc-400 leading-relaxed mt-0.5">
                            Don't like the plan? Click Shuffle to get a <strong>random valid combination</strong>. It's like re-rolling the dice on your semester.
                          </p>
                        </div>
                      </li>
                      <li className="flex gap-3 items-start">
                        <div className="bg-black/40 border border-white/[0.05] p-2 rounded-xl shadow-sm flex-shrink-0">
                          <Scale className="w-4 h-4 text-teal-400" />
                        </div>
                        <div>
                          <strong className="text-xs block text-zinc-200 font-display">Balanced</strong>
                          <p className="text-[10px] text-zinc-400 leading-relaxed mt-0.5">
                            The "Smart" path. It penalizes extremely high scores, trying to keep effort <strong>spread evenly</strong> across all subjects.
                          </p>
                        </div>
                      </li>
                    </ul>
                  </div>

                  {/* Locking & Logic */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-bold text-xs text-emerald-400 font-display">Locking Scores</h4>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Confident you'll get exactly 85 in Math?
                      </p>
                      <div className="bg-black/20 p-3.5 rounded-xl border border-white/[0.05] flex items-start gap-3 shadow-inner">
                        <Lock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
                        <span className="text-[11px] text-zinc-300 leading-relaxed">Click the <strong>Lock Icon</strong>. Enter the score you are confident you will at least get. The app freezes that score and recalculates the rest of the subjects around it.</span>
                      </div>
                    </div>
                    <div className="text-[10px] text-zinc-500 italic bg-[#030307]/30 p-2.5 rounded-lg border border-white/[0.02]">
                      *Tip: If a target is "Impossible", check if you have entered marks correctly or if you need to lower the target SGPA.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. THE BASICS: Subjects Tab (Detailed) */}
            <div className="glass-card rounded-2xl overflow-hidden shadow-xl">
              <div className="p-4 border-b border-white/[0.05] bg-white/[0.01] flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-sm font-display text-zinc-200">The Basics: Subjects Tab</h3>
              </div>
              <div className="p-5 space-y-4">
                <p className="text-xs text-zinc-400 leading-relaxed">
                  The control center of the app. This is where you enter marks, but there are hidden settings inside every subject card.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/[0.02] p-4 rounded-xl border border-white/[0.05]">
                    <strong className="text-indigo-400 text-xs font-display mb-2 block">1. Configuration & Weights</strong>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Expand any subject and click <strong>"Edit Subject Details"</strong>.
                      <br />• <strong>Weights:</strong> Default is 50/50, but you can change it to anything (e.g. 40/60).
                      <br />• <strong>Credits:</strong> Change the credit value (e.g. 2 Cr for Labs) to ensure accurate SGPA calculation.
                    </p>
                  </div>
                  <div className="bg-white/[0.02] p-4 rounded-xl border border-white/[0.05]">
                    <strong className="text-indigo-400 text-xs font-display mb-2 block">2. Advanced: Custom Cutoffs</strong>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Found inside the "Edit" menu.
                      <br />If a subject is notoriously hard and the college lowers the S-Grade cutoff to 85, you can enter that here. The <strong>entire app</strong> (Analysis, Reverse Calc) will respect this new rule!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. THE ANALYST: Analysis Tab (Detailed) */}
            <div className="glass-card rounded-2xl overflow-hidden shadow-xl">
              <div className="p-4 border-b border-white/[0.05] bg-white/[0.01] flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-450" />
                <h3 className="font-bold text-sm font-display text-zinc-200">The Analyst: Analysis Tab</h3>
              </div>
              <div className="p-5 space-y-4">
                <p className="text-xs text-zinc-400 leading-relaxed">
                  This tab gives you a reality check on your standing and shows the best path forward.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl border border-white/[0.05] bg-white/[0.01]">
                    <strong className="block text-xs mb-1.5 text-zinc-200 font-display">Safe vs Minimum</strong>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      • <strong>Safe Score:</strong> The marks you need to in ESA based on your current ISA marks(and momentum is some fields are empty) to <em>guarantee</em> the grade(A/S) (e.g. 90).
                      <br />• <strong>Min Score:</strong> A lower score (e.g. 89.5) that <em>might</em> work because the college rounds up decimals.
                      <br />• <strong>Momentum Score:</strong> Shows your momentum score in ESA based on ISA if applicable.
                      <br />• <strong>Pass/A/S + ISA2 target lines:</strong> Pass/A/S show ESA needed using momentum internals. If ISA2 is empty, ISA2 lines show marks needed for Pass/A/S, assuming empty Assignment or Lab are full and ESA is 0 unless you have entered an ESA score.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border border-white/[0.05] bg-white/[0.01]">
                    <strong className="block text-xs mb-1.5 text-zinc-200 font-display">Achievable Range</strong>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      The slider at the top shows your mathematically <strong>Best Case SGPA</strong> (if you ace everything) and <strong>Worst Case SGPA</strong> (if you fail everything).
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border border-purple-500/20 bg-purple-500/[0.02] shadow-[0_0_15px_rgba(168,85,247,0.02)]">
                    <strong className="block text-xs mb-1.5 text-purple-300 flex items-center gap-1 font-display">
                      <Lightbulb className="w-3.5 h-3.5" /> Path to Target
                    </strong>
                    <p className="text-[11px] text-zinc-450 text-zinc-300 leading-relaxed">
                      A smart algorithm that generates a <strong>step-by-step plan</strong>. It identifies exactly which subjects are the easiest to upgrade (e.g., "Score 45 in Chem to get A") to hit your target SGPA with the least effort.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border border-white/[0.05] bg-white/[0.01]">
                    <strong className="block text-xs mb-1.5 text-zinc-200 font-display">GP Budget</strong>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Shows exactly how many Grade Points you can afford to "lose" while still hitting your target.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 6. STRATEGY & FUTURE: CGPA (Detailed) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Quick SGPA Estimator (Static) */}
              <div className="glass-card rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 font-bold text-zinc-100 font-display mb-3">
                  <span className="bg-teal-500/10 text-teal-300 w-8 h-8 rounded-xl border border-teal-500/20 flex items-center justify-center text-sm shadow-sm">✨</span>
                  <span>Quick SGPA Estimator</span>
                </div>
                <div className="text-xs text-zinc-400 leading-relaxed space-y-2">
                  <p>
                    Want to check your SGPA without entering specific marks?
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-zinc-450 text-zinc-400">
                    <li>Located at the bottom of the <strong>Subjects Tab</strong>.</li>
                    <li>Select hypothetical grades (S, A, B...) for each subject directly.</li>
                    <li>Instantly see what your SGPA would be if you scored those grades.</li>
                    <li>This is a "sandbox" mode—it does not affect your actual mark data.</li>
                  </ul>
                </div>
              </div>

              {/* UPDATED: CGPA Guide (Static) */}
              <div className="glass-card rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 font-bold text-zinc-100 font-display mb-3">
                  <span className="bg-indigo-500/10 text-indigo-300 w-8 h-8 rounded-xl border border-indigo-500/20 flex items-center justify-center text-sm shadow-sm">🎓</span>
                  <span>Cumulative GPA (CGPA)</span>
                </div>
                <div className="text-xs text-zinc-400 leading-relaxed space-y-2">
                  <p>
                    Track your performance across your entire degree.
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-zinc-450 text-zinc-400">
                    <li>Enter the <strong>SGPA</strong> and <strong>Total Credits</strong> for every semester you have completed.</li>
                    <li>The calculator uses the weighted average formula (Σ SGPA×Credits / Σ Credits) for 100% accuracy.</li>
                    <li>You can clear the history at any time using the "Clear History" button.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* UPDATED: Attendance Guide (Static) */}
            <div className="glass-card rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 font-bold text-zinc-100 font-display mb-3">
                <span className="bg-green-500/10 text-green-300 w-8 h-8 rounded-xl border border-green-500/20 flex items-center justify-center text-sm shadow-sm">📅</span>
                <span>How does the Attendance Calculator work?</span>
              </div>
              <div className="text-xs text-zinc-400 leading-relaxed space-y-2">
                <p>
                  The attendance tool helps you maintain the mandatory <strong>75% attendance</strong>.
                </p>
                <ul className="list-disc pl-5 space-y-1 text-zinc-450 text-zinc-400">
                  <li><strong>Mode 1 First:</strong> Enter current held and attended classes once, and the planners reuse it automatically.</li>
                  <li><strong>Clear Results:</strong> Every mode explains how many classes you can miss and how many you must attend to stay above your target.</li>
                  <li><strong>Buffer Target:</strong> Set a stricter target (like 80%) in Mode 1, and all planning modes use it.</li>
                </ul>
                <p className="mt-2 text-[11px] italic opacity-85 text-zinc-500 border-t border-white/[0.03] pt-2">
                  Attendance inputs are saved locally in your browser.
                </p>
              </div>
            </div>

            {/* UPDATED: Universal Mode Guide (Static) */}
            <div className="glass-card rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 font-bold text-zinc-100 font-display mb-3">
                <span className="bg-purple-500/10 text-purple-300 w-8 h-8 rounded-xl border border-purple-500/20 flex items-center justify-center text-sm shadow-sm">🎓</span>
                <span>I'm not from PES / Custom Curriculum</span>
              </div>
              <div className="text-xs text-zinc-400 leading-relaxed space-y-2">
                <p>
                  You can use this calculator for <strong>VTU, IIT, Manipal, or any other college</strong>.
                </p>
                <ol className="list-decimal pl-5 space-y-1 text-zinc-450 text-zinc-400">
                  <li>Go to the <strong>Subjects Tab</strong>.</li>
                  <li>Click the button <strong>"Not from PES? 🎓"</strong>.</li>
                  <li><strong>Define Components:</strong> Add your own exams (e.g., "Midterm 1", "Quiz", "Finals") and set their weights.</li>
                  <li><strong>Set Grading:</strong> Choose a preset (like VTU 10-point, US 4.0 GPA) or define your own grade cutoffs (e.g., A = 85+).</li>
                  <li>Click <strong>Create Subject</strong>.</li>
                </ol>
                <p className="mt-2 text-zinc-350">
                  Your custom grading scheme will be saved for that subject and used in all calculations (SGPA, Reverse, Analysis).
                </p>
              </div>
            </div>

            {/* Footer Note */}
            <div className="text-center text-xs text-zinc-500 opacity-60 py-4 font-semibold font-display">
              Built for PESU / PES / PESIT.
            </div>
          </div>
        )}

        {/* Footer */}
        <div className={`text-center ${themeClasses.muted} text-xs mt-8 pb-4`}>
          <p className="mt-1 opacity-50">PES SGPA Calculator v4.5.3 © 2026</p>
          <p className="mt-1 text-[10px] opacity-40">Made by AAK</p>
          <p
            className="mt-1 text-[12px] opacity-45 cursor-pointer hover:opacity-60 transition-opacity select-none inline-block translate-x-[9px]"
            onClick={() => setShowToffeeModal(true)}
          >
            buy me a toffee 🍬
          </p>
        </div>

        {/* Toffee Support Modal */}
        {showToffeeModal && (
          <div
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowToffeeModal(false)}
          >
            <div
              className="relative bg-[#111118] border border-white/[0.08] rounded-2xl p-6 max-w-xs w-full mx-4 shadow-2xl text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowToffeeModal(false)}
                className="absolute top-3 right-3 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="text-2xl mb-2">🍬</div>
              <h3 className="text-sm font-semibold text-zinc-300 mb-1">Buy me a toffee</h3>
              <p className="text-[11px] text-zinc-500 mb-4 leading-relaxed">
                If this tool helped you out, feel free to support whatever you feel like. Totally optional, no pressure.
              </p>
              <div className="bg-white rounded-xl p-3 inline-block mb-3">
                <img
                  src="/upi-qr.png"
                  alt="UPI QR Code"
                  className="w-48 h-48 object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <p className="text-[10px] text-zinc-400 hidden">QR code not found — add upi-qr.png to /public</p>
              </div>
              <p className="text-[10px] text-zinc-600">Scan with any UPI app</p>
            </div>
          </div>
        )}

      </motion.div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#030307]/80 backdrop-blur-xl border-t border-white/[0.04] md:hidden z-50 shadow-[0_-8px_30px_rgba(0,0,0,0.55)]" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 12px)' }}>
        <div className="flex justify-around items-center pt-2">
          {[
            { id: 'subjects', label: 'Subjects', icon: BookOpen },
            { id: 'analysis', label: 'Analysis', icon: Activity, accent: 'blue' },
            { id: 'reverse', label: 'Reverse', icon: Target, accent: 'emerald' },
            { id: 'attendance', label: 'Attend', icon: CheckCircle2 },
            { id: 'cgpa', label: 'CGPA', icon: Calculator },
            { id: 'guide', label: 'Guide', icon: HelpCircle },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center py-1.5 px-2 rounded-xl transition-all duration-300 ${activeTab === tab.id
                ? 'text-white'
                : 'text-[#8e909d] active:text-white'
                }`}
            >
              <div className="relative flex items-center justify-center">
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTabMobileBg"
                    className="absolute -inset-2 bg-white/[0.04] border border-white/[0.06] rounded-xl -z-10 shadow-sm"
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  />
                )}
                <tab.icon className={`w-5 h-5 transition-transform duration-300 ${activeTab === tab.id ? 'scale-110 text-indigo-400' : ''}`} />
              </div>
              <span className={`text-[9px] mt-1.5 font-semibold transition-colors duration-300 ${activeTab === tab.id ? 'text-white' : 'text-zinc-500'}`}>{tab.label}</span>
              {tab.accent && activeTab !== tab.id && (
                <span className={`absolute top-1.5 right-1 w-1.5 h-1.5 rounded-full ${tab.accent === 'blue' ? 'bg-indigo-500' : 'bg-emerald-500'} animate-pulse`} />
              )}
            </button>
          ))}
        </div>
      </div>
      <Analytics />
      <SpeedInsights />
    </div>
  );
}
