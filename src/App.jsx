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

// Custom Revamped UI Subcomponents
import SGPASidebar from './components/SidebarSummary.jsx';
import SubjectCard from './components/SubjectCard.jsx';
import AttendanceTracker from './components/AttendanceTracker.jsx';
import CGPAChart from './components/CGPAChart.jsx';
import StrategyEngine from './components/StrategyEngine.jsx';
import GuideSection from './components/GuideSection.jsx';


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

  // --- Visual Overhaul Styles ---
  return (
    <div className="min-h-screen bg-[#030307] text-zinc-300 font-sans pb-28 relative overflow-x-hidden selection:bg-indigo-500/25 selection:text-white">
      
      {/* Ambient Mesh Glow Orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none -z-10 animate-float" />
      <div className="absolute top-[20%] right-1/4 w-[400px] h-[400px] bg-purple-500/5 blur-[100px] rounded-full pointer-events-none -z-10 animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-[20%] left-1/3 w-[350px] h-[350px] bg-emerald-500/2 blur-[90px] rounded-full pointer-events-none -z-10" />

      {/* Glass Header */}
      <header className="bg-[#08080f]/70 backdrop-blur-2xl border-b border-white/[0.04] text-zinc-200 py-4 px-6 sticky top-0 z-50 shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent tracking-tight">
                PESU Calculator
              </h1>
              <p className="text-[9px] text-zinc-500 font-bold tracking-widest uppercase mt-0.5">
                Universal &bull; Cloud Save Local &bull; 100% Offline
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Estimated SGPA</span>
              <span className="text-2xl font-black text-white text-glow-indigo tabular-nums leading-none tracking-tight">
                {sgpa}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        
        {/* Floating pill navigation (Pill Segmented control) */}
        <div className="glass-panel border border-white/[0.04] rounded-2xl p-1.5 flex overflow-x-auto gap-1.5 sticky top-[76px] z-40">
          {[
            { id: 'subjects', label: 'Subjects', icon: BookOpen },
            { id: 'analysis', label: 'Analysis', icon: Activity, dot: 'indigo' },
            { id: 'reverse', label: 'Reverse Calc', icon: Target, dot: 'emerald' },
            { id: 'attendance', label: 'Attendance', icon: CheckCircle2 },
            { id: 'cgpa', label: 'CGPA', icon: Calculator },
            { id: 'guide', label: 'Help Guide', icon: HelpCircle },
          ].map(tab => {
            const IconComp = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 whitespace-nowrap flex-1 \${
                  isActive 
                    ? 'text-white' 
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]'
                }`}
              >
                <IconComp className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.dot && !isActive && (
                  <span className={`w-1.5 h-1.5 rounded-full absolute top-1.5 right-2 \${tab.dot === 'indigo' ? 'bg-indigo-500 shadow-[0_0_6px_rgba(99,102,241,0.6)]' : 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)] animate-pulse'}`} />
                )}
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-white/[0.08] rounded-xl -z-10 border border-white/[0.04]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Dashboard Split Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: Main Scrollable Content */}
          <div className="col-span-12 md:col-span-7 lg:col-span-8 space-y-6">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="space-y-6"
            >
              
              {/* TAB: SUBJECTS */}
              {activeTab === 'subjects' && (
                <>
                  {/* Info Collapsible card */}
                  <div className="glass-panel rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0 pr-2">
                      <details className="group">
                        <summary className="flex items-center gap-2 cursor-pointer list-none select-none text-indigo-400 hover:text-indigo-300 font-bold text-xs transition-colors">
                          <Settings className="w-4 h-4 animate-spin-slow text-indigo-400" />
                          <span className="text-zinc-200 text-xs font-extrabold uppercase tracking-wider">Universal Calculator Mode</span>
                          <span className="text-[9px] bg-indigo-500/10 px-2 py-0.5 rounded-full font-bold flex items-center">
                            Info <ChevronDown className="w-3 h-3 ml-1 transition-transform group-open:rotate-180" />
                          </span>
                        </summary>
                        <div className="mt-3 text-xs text-zinc-500 leading-relaxed border-t border-white/[0.04] pt-3 space-y-2">
                          <p>Works flawlessly for all semesters. 5-credit courses scale automatically from 120% to 100%.</p>
                          <p>Define custom assessment curves and cutoffs within each subject details folder. The entire app will adapt instantly!</p>
                        </div>
                      </details>
                    </div>

                    {/* Mobile preset loading selector */}
                    <div className="flex sm:hidden w-full gap-2 pt-2 border-t border-white/[0.04]">
                      <select
                        onChange={(e) => loadPreset(e.target.value)}
                        className="w-full bg-black/40 border border-white/[0.06] rounded-xl px-3 py-2 text-xs text-white"
                        defaultValue=""
                      >
                        <option value="" disabled>Load Preset...</option>
                        {Object.keys(SemesterPresets).map(key => (
                          <option key={key} value={key}>{key}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Mobile-only Quick Tools & Grade Distribution (RESTORED!) */}
                  <div className="glass-panel rounded-2xl overflow-hidden mt-4 md:hidden">
                    <details className="group">
                      <summary className="flex items-center justify-between p-4 cursor-pointer list-none select-none hover:bg-white/[0.02] transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/10">
                            <Activity className="w-4 h-4 text-white" />
                          </div>
                          <div className="text-left">
                            <h3 className="font-extrabold text-sm text-white">Quick Tools & Analytics</h3>
                            <p className="text-[10px] text-zinc-500 mt-0.5">Undo, backup data, and grade distribution analysis</p>
                          </div>
                        </div>
                        <ChevronDown className="w-4 h-4 opacity-50 transition-transform group-open:rotate-180" />
                      </summary>

                      <div className="p-4 border-t border-white/[0.04] bg-black/20 space-y-4">
                        {/* 1. Colorful Segmented Horizontal Grade Distribution Bar */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                            <span>Grade Distribution</span>
                            <span className="font-mono text-zinc-500 font-normal">{subjects.length} subjects</span>
                          </div>
                          
                          {Object.values(gradeDistribution).every(count => count === 0) ? (
                            <div className="text-center py-2.5 text-[10px] text-zinc-500 bg-black/35 rounded-xl border border-white/[0.02] font-semibold">
                              No grades active yet. Input marks or use manual sandbox below!
                            </div>
                          ) : (
                            <div className="flex gap-0.5 h-7 rounded-xl overflow-hidden border border-white/[0.04] shadow-inner p-0.5 bg-zinc-900/60">
                              {Object.entries(gradeDistribution).map(([grade, count]) => {
                                if (count === 0) return null;
                                const gradeInfo = GradeMap.find(g => g.grade === grade);
                                return (
                                  <div
                                    key={grade}
                                    className={`flex items-center justify-center text-[9px] font-black text-white ${gradeInfo?.bg || 'bg-zinc-500'} rounded-lg transition-all first:ml-0`}
                                    style={{ width: `${(count / subjects.length) * 100}%` }}
                                    title={`${grade}: ${count} subject(s)`}
                                  >
                                    {grade} ({count})
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* 2. Undo / Redo / Backup actions row */}
                        <div className="space-y-2 pt-2 border-t border-white/[0.04]">
                          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block mb-1">Backup & Edit History</span>
                          
                          {/* Undo / Redo buttons */}
                          <div className="flex gap-2">
                            <button
                              onClick={undo}
                              disabled={undoStack.length === 0}
                              className={`flex-1 py-2 rounded-xl border border-white/[0.06] flex items-center justify-center gap-1.5 text-xs font-bold transition-all ${
                                undoStack.length === 0 
                                  ? 'opacity-25 cursor-not-allowed text-zinc-600' 
                                  : 'bg-white/[0.02] text-zinc-300 hover:bg-white/[0.06]'
                              }`}
                            >
                              <Undo2 className="w-3.5 h-3.5" /> Undo
                            </button>
                            <button
                              onClick={redo}
                              disabled={redoStack.length === 0}
                              className={`flex-1 py-2 rounded-xl border border-white/[0.06] flex items-center justify-center gap-1.5 text-xs font-bold transition-all ${
                                redoStack.length === 0 
                                  ? 'opacity-25 cursor-not-allowed text-zinc-600' 
                                  : 'bg-white/[0.02] text-zinc-300 hover:bg-white/[0.06]'
                              }`}
                            >
                              <Redo2 className="w-3.5 h-3.5" /> Redo
                            </button>
                          </div>

                          {/* Export / Import / Clear */}
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              onClick={exportData}
                              className="py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] text-zinc-300 text-[10px] font-bold flex flex-col items-center justify-center gap-1 transition-all"
                            >
                              <Download className="w-3.5 h-3.5 text-zinc-400" />
                              <span>Export</span>
                            </button>
                            
                            <label className="py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] text-zinc-300 text-[10px] font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer text-center">
                              <Upload className="w-3.5 h-3.5 text-zinc-400 mx-auto" />
                              <span>Import</span>
                              <input type="file" accept=".json" onChange={importData} className="hidden" />
                            </label>

                            <button
                              onClick={clearAll}
                              className="py-2.5 rounded-xl border border-red-500/10 bg-red-500/5 hover:bg-red-500/10 text-red-400 text-[10px] font-bold flex flex-col items-center justify-center gap-1 transition-all"
                            >
                              <Eraser className="w-3.5 h-3.5 text-red-400" />
                              <span>Reset All</span>
                            </button>
                          </div>
                        </div>

                      </div>
                    </details>
                  </div>

                  {/* Roster of active subjects */}
                  <div className="space-y-4">
                    {subjects.map((subject) => (
                      <SubjectCard
                        key={subject.id}
                        subject={subject}
                        m={marks[subject.id]}
                        handleMarkChange={handleMarkChange}
                        handleSubjectChange={handleSubjectChange}
                        toggleLab={toggleLab}
                        toggleAssignment={toggleAssignment}
                        removeSubject={removeSubject}
                        isExpanded={expandedSubject === subject.id}
                        setExpandedSubject={setExpandedSubject}
                        getSubjectMetrics={getSubjectMetrics}
                        getGradePoint={getGradePoint}
                        getGradeInfo={getGradeInfo}
                      />
                    ))}
                  </div>

                  {/* Add Subject trigger button */}
                  <button
                    onClick={addNewSubject}
                    className="w-full py-4 border-2 border-dashed border-white/[0.08] hover:border-indigo-500/40 hover:bg-indigo-500/[0.03] hover:text-indigo-400 rounded-2xl text-zinc-400 font-extrabold text-sm flex items-center justify-center gap-2 transition-all"
                  >
                    <Plus className="w-4 h-4" /> Add Custom Subject
                  </button>

                  {/* Collapsible Sandbox Grade SGPA Estimator */}
                  <div className="glass-panel rounded-2xl overflow-hidden mt-6">
                    <details className="group">
                      <summary className="flex items-center justify-between p-4 cursor-pointer list-none select-none hover:bg-white/[0.02] transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-md shadow-emerald-500/10">
                            <span className="text-zinc-200 text-sm font-bold">✨</span>
                          </div>
                          <div>
                            <h3 className="font-extrabold text-sm text-white">Quick SGPA Sandbox</h3>
                            <p className="text-[10px] text-zinc-500 mt-0.5">Directly select hypothetical letter grades to estimate SGPA</p>
                          </div>
                        </div>
                        <ChevronDown className="w-4 h-4 opacity-50 transition-transform group-open:rotate-180" />
                      </summary>

                      <div className="p-4 border-t border-white/[0.04] bg-black/20 space-y-4">
                        <div className="flex items-center justify-between bg-black/40 p-3.5 rounded-xl border border-white/[0.04] shadow-sm">
                          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Hypothetical Sandbox SGPA</span>
                          <span className="text-xl font-black text-teal-400 text-glow-emerald">
                            {(() => {
                              let totalPoints = 0;
                              let totalCredits = 0;
                              subjects.forEach(sub => {
                                const gradeLetter = manualGrades[sub.id];
                                if (gradeLetter) {
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

                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                          {subjects.map(sub => (
                            <div key={sub.id} className="flex items-center justify-between p-2.5 bg-black/30 rounded-xl border border-white/[0.03]">
                              <div>
                                <span className="text-xs font-bold text-zinc-200 block">{sub.name}</span>
                                <span className="text-[9px] text-zinc-500 font-mono mt-0.5">{sub.credits} Credits</span>
                              </div>
                              <select
                                value={manualGrades[sub.id] || ""}
                                onChange={(e) => setManualGrades(prev => ({ ...prev, [sub.id]: e.target.value }))}
                                className="w-28 p-1.5 text-xs font-bold bg-black/50 border border-white/[0.06] rounded-lg text-white"
                              >
                                <option value="">Select...</option>
                                {(sub.customGradeMap || GradeMap).map(g => (
                                  <option key={g.grade} value={g.grade}>{g.grade} (GP: {g.gp})</option>
                                ))}
                              </select>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => setManualGrades({})}
                            className="text-[10px] text-red-400 hover:text-red-300 font-extrabold underline"
                          >
                            Reset Sandbox
                          </button>
                        </div>
                      </div>
                    </details>
                  </div>

                  {/* Custom Template builder curves */}
                  <div className="glass-panel rounded-2xl overflow-hidden mt-6">
                    <button
                      onClick={() => setShowTemplateBuilder(!showTemplateBuilder)}
                      className="w-full p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md shadow-purple-500/10">
                          <Settings className="w-4 h-4 text-white" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-extrabold text-sm text-white">Not from PES? 🎓</h3>
                          <p className="text-[10px] text-zinc-500 mt-0.5 font-medium">Configure custom grading systems for IIT, VTU, or other colleges</p>
                        </div>
                      </div>
                      {showTemplateBuilder ? <ChevronUp className="w-4 h-4 opacity-50" /> : <ChevronDown className="w-4 h-4 opacity-50" />}
                    </button>

                    {showTemplateBuilder && (
                      <div className="p-5 border-t border-white/[0.04] space-y-6">
                        <div className="bg-purple-500/5 p-4 rounded-xl border border-purple-500/10">
                          <p className="text-xs text-purple-300 leading-normal">
                            <strong>Custom Curriculum Settings:</strong> Choose pre-configured grading schemes or define custom weights. Click <strong>Create Subject</strong> to compile.
                          </p>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-extrabold text-xs text-white uppercase tracking-wider flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-[10px]">1</span>
                            Subject Metadata
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-[9px] text-zinc-500 font-bold block mb-1">Subject Name</label>
                              <input
                                type="text"
                                value={customTemplate.name}
                                onChange={(e) => setCustomTemplate(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="e.g. Computer Architecture"
                                className="w-full glass-input px-3 py-2 text-xs focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] text-zinc-500 font-bold block mb-1">Credits</label>
                              <input
                                type="number"
                                value={customTemplate.credits}
                                onChange={(e) => setCustomTemplate(prev => ({ ...prev, credits: parseFloat(e.target.value) || 0 }))}
                                className="w-full glass-input px-3 py-2 text-xs focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-extrabold text-xs text-white uppercase tracking-wider flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-[10px]">2</span>
                            Assessment Pattern
                          </h4>
                          <div className="space-y-2">
                            {customTemplate.components.map((comp, idx) => (
                              <div
                                key={idx}
                                className={`flex flex-wrap sm:flex-nowrap items-center gap-3 p-2.5 rounded-xl border transition-all \${
                                  comp.enabled 
                                    ? 'bg-black/45 border-white/[0.04]' 
                                    : 'bg-white/[0.02] border-white/[0.02] opacity-40'
                                }`}
                              >
                                <div className="flex items-center gap-2 flex-grow min-w-[120px]">
                                  <input
                                    type="checkbox"
                                    checked={comp.enabled}
                                    onChange={(e) => updateTemplateComponent(idx, 'enabled', e.target.checked)}
                                    className="rounded border-white/[0.08] bg-black/40 accent-purple-500"
                                  />
                                  <input
                                    type="text"
                                    value={comp.name}
                                    onChange={(e) => updateTemplateComponent(idx, 'name', e.target.value)}
                                    disabled={!comp.enabled}
                                    className="flex-1 p-1 text-xs border-b border-transparent bg-transparent focus:outline-none font-bold text-white"
                                  />
                                </div>

                                <div className="flex items-center gap-3 ml-auto text-xs">
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="number"
                                      value={comp.weight}
                                      onChange={(e) => updateTemplateComponent(idx, 'weight', parseFloat(e.target.value) || 0)}
                                      disabled={!comp.enabled}
                                      className="w-10 p-1 text-center bg-black border border-white/[0.06] rounded text-white"
                                    />
                                    <span className="text-[10px] text-zinc-500">%</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="text-[10px] text-zinc-500">Max:</span>
                                    <input
                                      type="number"
                                      value={comp.maxMarks}
                                      onChange={(e) => updateTemplateComponent(idx, 'maxMarks', parseFloat(e.target.value) || 0)}
                                      disabled={!comp.enabled}
                                      className="w-10 p-1 text-center bg-black border border-white/[0.06] rounded text-white"
                                    />
                                  </div>
                                  <button
                                    onClick={() => removeComponentFromTemplate(idx)}
                                    className="p-1 text-red-500 hover:bg-red-500/10 rounded"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <button
                            onClick={addComponentToTemplate}
                            className="w-full py-2 border border-dashed border-white/[0.08] hover:border-purple-500/30 hover:text-purple-400 rounded-xl text-zinc-500 text-xs font-bold flex items-center justify-center gap-2"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add custom component
                          </button>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-extrabold text-xs text-white uppercase tracking-wider flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-[10px]">3</span>
                            Grading Threshold System
                          </h4>
                          <div>
                            <label className="text-[9px] text-zinc-500 font-bold block mb-1">Pick Preset</label>
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
                              className="w-full bg-black/40 border border-white/[0.06] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                            >
                              {Object.keys(GradingSchemes).map(key => (
                                <option key={key} value={key}>{key}</option>
                              ))}
                            </select>
                          </div>

                          <div className="p-4 bg-black/30 rounded-xl border border-white/[0.04] space-y-2">
                            <div className="grid grid-cols-12 gap-2 text-[8px] uppercase font-bold text-zinc-500 px-1 pb-1 border-b border-white/[0.04]">
                              <div className="col-span-3">Letter Grade</div>
                              <div className="col-span-4 text-center">Minimum Score (&ge;)</div>
                              <div className="col-span-4 text-center">Grade Points</div>
                              <div className="col-span-1"></div>
                            </div>
                            
                            {customTemplate.customGrades.sort((a, b) => b.min - a.min).map((g, idx) => (
                              <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                                <input
                                  type="text"
                                  value={g.grade}
                                  onChange={(e) => updateCustomGrade(idx, 'grade', e.target.value)}
                                  className="col-span-3 p-1.5 text-center text-xs font-bold bg-black border border-white/[0.06] rounded-lg text-white"
                                />
                                <input
                                  type="number"
                                  value={g.min}
                                  onChange={(e) => updateCustomGrade(idx, 'min', e.target.value)}
                                  className="col-span-4 p-1.5 text-center text-xs bg-black border border-white/[0.06] rounded-lg text-white"
                                />
                                <input
                                  type="number"
                                  value={g.gp}
                                  onChange={(e) => updateCustomGrade(idx, 'gp', e.target.value)}
                                  className="col-span-4 p-1.5 text-center text-xs bg-black border border-white/[0.06] rounded-lg text-white"
                                />
                                <button
                                  onClick={() => removeCustomGrade(idx)}
                                  className="col-span-1 text-red-500 hover:bg-red-500/10 rounded flex justify-center py-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}

                            <button
                              onClick={addCustomGrade}
                              className="w-full text-center text-xs text-purple-400 hover:underline pt-2 font-bold"
                            >
                              + Add Grade Row
                            </button>
                          </div>

                          <button
                            onClick={applyGradingSchemeToAll}
                            className="w-full py-2.5 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 text-indigo-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                          >
                            <Zap className="w-3.5 h-3.5" /> Apply Curve System to ALL Subjects
                          </button>
                        </div>

                        <button
                          onClick={applyCustomTemplate}
                          className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-purple-500/10"
                        >
                          Create Custom Subject
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* TAB: ANALYSIS & REVERSE */}
              {(activeTab === 'analysis' || activeTab === 'reverse') && (
                <StrategyEngine
                  activeTab={activeTab}
                  subjects={subjects}
                  marks={marks}
                  lockedSubjects={lockedSubjects}
                  setLockedSubjects={setLockedSubjects}
                  reverseTargetSgpa={reverseTargetSgpa}
                  setReverseTargetSgpa={setReverseTargetSgpa}
                  reverseEsaMode={reverseEsaMode}
                  setReverseEsaMode={setReverseEsaMode}
                  shuffledResults={shuffledResults}
                  setShuffledResults={setShuffledResults}
                  calculateRandomPath={calculateRandomPath}
                  calculateBalancedPath={calculateBalancedPath}
                  reverseResults={reverseResults}
                  getMinimumPassingTable={getMinimumPassingTable}
                  getSubjectMetrics={getSubjectMetrics}
                  getGradePoint={getGradePoint}
                  getGradeInfo={getGradeInfo}
                  getRequiredESAForGrade={getRequiredESAForGrade}
                  getRequiredISA2ForGrade={getRequiredISA2ForGrade}
                  getRequiredISA2ForPass={getRequiredISA2ForPass}
                  metrics={metrics}
                  strategy={strategy}
                  setActiveTab={setActiveTab}
                  sgpa={sgpa}
                  sgpaRange={sgpaRange}
                  targetSgpa={targetSgpa}
                  setTargetSgpa={setTargetSgpa}
                />
              )}

              {/* TAB: ATTENDANCE */}
              {activeTab === 'attendance' && (
                <AttendanceTracker
                  attendanceStatusMode={attendanceStatusMode}
                  setAttendanceStatusMode={setAttendanceStatusMode}
                  attendanceClassesLeftMode={attendanceClassesLeftMode}
                  setAttendanceClassesLeftMode={setAttendanceClassesLeftMode}
                  attendanceSemesterMode={attendanceSemesterMode}
                  setAttendanceSemesterMode={setAttendanceSemesterMode}
                  attendanceWeeklyMode={attendanceWeeklyMode}
                  setAttendanceWeeklyMode={setAttendanceWeeklyMode}
                  attendanceMissPlannerMode={attendanceMissPlannerMode}
                  setAttendanceMissPlannerMode={setAttendanceMissPlannerMode}
                  statusStats={statusStats}
                  sharedBufferPercent={sharedBufferPercent}
                  targetStatusStats={targetStatusStats}
                  classesLeftPlan={classesLeftPlan}
                  semesterPlan={semesterPlan}
                  weeklyPlan={weeklyPlan}
                  missImpactPlan={missImpactPlan}
                />
              )}

              {/* TAB: CGPA */}
              {activeTab === 'cgpa' && (
                <CGPAChart
                  semesterData={semesterData}
                  updateSemester={updateSemester}
                  resetCGPA={resetCGPA}
                  finalCgpa={finalCgpa}
                  sgpa={sgpa}
                  metrics={metrics}
                  simpleCgpa={simpleCgpa}
                  setSimpleCgpa={setSimpleCgpa}
                />
              )}

              {/* TAB: HELP GUIDE */}
              {activeTab === 'guide' && (
                <GuideSection setShowToffeeModal={setShowToffeeModal} />
              )}

            </motion.div>
          </div>

          {/* RIGHT COLUMN: Sticky Visual Summary Panel (Desktop Only) */}
          <div className="hidden md:block md:col-span-5 lg:col-span-4 sticky top-[100px]">
            <SGPASidebar
              sgpa={sgpa}
              targetSgpa={targetSgpa}
              setTargetSgpa={setTargetSgpa}
              sgpaRange={sgpaRange}
              gradeDistribution={gradeDistribution}
              subjects={subjects}
              undo={undo}
              redo={redo}
              undoStack={undoStack}
              redoStack={redoStack}
              exportData={exportData}
              importData={importData}
              clearAll={clearAll}
              loadPreset={loadPreset}
              SemesterPresets={SemesterPresets}
            />
          </div>

        </div>

        {/* Footer info brand */}
        <footer className="text-center text-[10px] text-zinc-600 mt-12 pb-8 space-y-1">
          <p>PES SGPA Calculator v4.6.0 &bull; Local Auto-Saves Active</p>
          <p>Hand-crafted with visual excellence in 2026</p>
          <p
            className="mt-1 text-[12px] opacity-45 cursor-pointer hover:opacity-100 hover:text-indigo-400 transition-all select-none inline-block translate-x-[9px]"
            onClick={() => setShowToffeeModal(true)}
          >
            buy me a toffee 🍬
          </p>
        </footer>

      </main>

      {/* Mobile Floating SGPA Average Pill Drawer (Fixed sticky bottom) */}
      <div className="fixed bottom-22 left-4 right-4 bg-[#0c0c16]/85 backdrop-blur-2xl border border-indigo-500/20 rounded-2xl p-3 flex justify-between items-center shadow-2xl md:hidden z-40 flex">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-ping" />
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Live Average</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xl font-black text-white text-glow-indigo tabular-nums">{sgpa}</span>
          <span className="text-[9px] text-zinc-500 font-bold bg-white/[0.04] px-2 py-0.5 rounded-full">GPA</span>
        </div>
      </div>

      {/* Mobile Sticky Tab Bar navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#08080f]/95 backdrop-blur-2xl border-t border-white/[0.04] md:hidden z-50 shadow-[0_-4px_30px_rgba(0,0,0,0.6)]" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 16px)' }}>
        <div className="flex justify-around items-end pt-2">
          {[
            { id: 'subjects', label: 'Subjects', icon: BookOpen },
            { id: 'analysis', label: 'Analysis', icon: Activity, dot: 'indigo' },
            { id: 'reverse', label: 'Reverse', icon: Target, dot: 'emerald' },
            { id: 'attendance', label: 'Attend', icon: CheckCircle2 },
            { id: 'cgpa', label: 'CGPA', icon: Calculator },
            { id: 'guide', label: 'Guide', icon: HelpCircle },
          ].map(tab => {
            const IconComp = tab.icon;
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-200 \${
                  isTabActive ? 'text-white' : 'text-zinc-600 active:text-zinc-400'
                }`}
              >
                <div className={`relative \${isTabActive ? 'scale-110' : ''} transition-transform duration-200`}>
                  <IconComp className="w-5 h-5" />
                  {isTabActive && (
                    <div className="absolute -inset-2 bg-indigo-500/20 rounded-full blur-md -z-10" />
                  )}
                  {tab.dot && !isTabActive && (
                    <span className={`absolute top-0.5 right-0 w-1.5 h-1.5 rounded-full \${tab.dot === 'indigo' ? 'bg-indigo-500' : 'bg-emerald-500 animate-pulse'}`} />
                  )}
                </div>
                <span className="text-[9px] mt-1 font-bold tracking-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Toffee modal QR code wrapper */}
      {showToffeeModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setShowToffeeModal(false)}
        >
          <div
            className="relative bg-[#0c0c16]/90 border border-white/[0.08] rounded-3xl p-6 max-w-xs w-full mx-4 shadow-2xl text-center backdrop-blur-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowToffeeModal(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="text-3xl mb-2">🍬</div>
            <h3 className="text-sm font-extrabold text-white mb-1 uppercase tracking-wider">Buy me a toffee</h3>
            <p className="text-[10px] text-zinc-500 mb-4 leading-normal">
              If this tool helped you secure your academic standing, support the project! Totally optional.
            </p>
            <div className="bg-white rounded-2xl p-3 inline-block mb-3 shadow-xl">
              <img
                src="/upi-qr.png"
                alt="UPI QR Code"
                className="w-44 h-44 object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <p className="text-[9px] text-zinc-500 hidden font-bold">QR code not found — add upi-qr.png to /public</p>
            </div>
            <p className="text-[9px] text-zinc-400 font-semibold">Scan QR with any UPI app</p>
          </div>
        </div>
      )}

      <Analytics />
      <SpeedInsights />
    </div>
  );
}
