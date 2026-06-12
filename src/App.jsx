import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import SubjectsTab from './tabs/SubjectsTab';
import AnalysisTab from './tabs/AnalysisTab';
import ReverseTab from './tabs/ReverseTab';
import AttendanceTab from './tabs/AttendanceTab';
import CgpaTab from './tabs/CgpaTab';
import GuideTab from './tabs/GuideTab';
import { trackEvent, setUserProperties } from './utils/analytics';

import {
  ChemistryCycleDefaults,
  PhysicsCycleDefaults,
  GenericCycleDefaults,
  SemesterPresets,
  GradeMap,
  GradingSchemes
} from './constants/presets';

import {
  getSubjectMetrics as getSubjectMetricsPure,
  getFinalIsaSummary as getFinalIsaSummaryPure,
  getGradePoint as getGradePointPure,
  getGradeInfo as getGradeInfoPure,
  getRequiredESAForGrade as getRequiredESAForGradePure,
  getRequiredISA2ForGrade as getRequiredISA2ForGradePure,
  getRequiredISA2ForPass as getRequiredISA2ForPassPure
} from './utils/calculations';

import { useCustomTemplate } from './hooks/useCustomTemplate';
import {
  parseNonNegativeInt,
  parseTargetPercent,
  buildCurrentAttendanceStats,
  buildAttendancePlan,
  consecutiveClassesNeeded
} from './utils/attendanceCalculations';

import {
  Trash2, Plus, Settings, ChevronDown, ChevronUp,
  RotateCcw, Target, Dice5, Scale,
  Eraser, TrendingUp, Activity, Calculator,
  Lightbulb, ArrowRight, CheckCircle2, AlertCircle,
  Download, Upload, Lock, Unlock, AlertTriangle,
  BookOpen, Award, Zap, BarChart3, Moon, Sun,
  Undo2, Redo2, HelpCircle, Info, X, Heart,
  Github, ExternalLink, Star, MessageSquare
} from 'lucide-react';

export default function PES_Universal_Calculator() {
  // --- GA Refs ---
  const markTrackTimersRef = useRef({});
  const lastTrackedSgpaRef = useRef(null);

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
  
  const [activeTab, setActiveTab] = useState(() => {
    const hash = window.location.hash.replace('#/', '');
    const validTabs = ['subjects', 'analysis', 'reverse', 'attendance', 'cgpa', 'guide'];
    return validTabs.includes(hash) ? hash : 'subjects';
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '');
      const validTabs = ['subjects', 'analysis', 'reverse', 'attendance', 'cgpa', 'guide'];
      if (validTabs.includes(hash)) {
        setActiveTab(hash);
      } else {
        // Redirection fix: Update hash in address bar if it is invalid or empty
        window.location.hash = '#/subjects';
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    
    // Redirect if empty or invalid hash on mount
    const validTabs = ['subjects', 'analysis', 'reverse', 'attendance', 'cgpa', 'guide'];
    const currentHash = window.location.hash.replace('#/', '');
    if (!validTabs.includes(currentHash)) {
      window.location.hash = '#/subjects';
    }

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const [reverseTargetSgpa, setReverseTargetSgpa] = useState(8.5);
  const [reverseEsaMode, setReverseEsaMode] = useState('safe');
  const [lockedSubjects, setLockedSubjects] = useState({});
  const [showHelp, setShowHelp] = useState(false);
  const [showToffeeModal, setShowToffeeModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackName, setFeedbackName] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackStatus, setFeedbackStatus] = useState('idle'); // 'idle' | 'submitting' | 'success' | 'error'
  const [hoverRating, setHoverRating] = useState(0);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    setFeedbackStatus('submitting');
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: feedbackName.trim(),
          feedback: feedbackText.trim(),
          rating: feedbackRating,
        }),
      });

      if (response.ok) {
        trackEvent('feedback_submitted', {
          rating: feedbackRating,
          has_name: !!feedbackName.trim(),
          feedback_length: feedbackText.trim().length,
          status: 'success'
        });
        setFeedbackStatus('success');
        setFeedbackName('');
        setFeedbackText('');
        setFeedbackRating(0);
      } else {
        trackEvent('feedback_submitted', {
          status: 'failed'
        });
        setFeedbackStatus('error');
      }
    } catch {
      trackEvent('feedback_submitted', {
        status: 'failed'
      });
      setFeedbackStatus('error');
    }
  };

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

    // Set GA user properties
    const isPhysics = subjects && subjects.some(s => s && s.name && typeof s.name === 'string' && s.name.toLowerCase().includes('physics'));
    setUserProperties({
      calculator_version: '2026_MAY_V4.5',
      initial_cycle: isPhysics ? 'physics' : 'chemistry'
    });

    // Track app environment (standalone PWA vs browser, online/offline status)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    trackEvent('app_environment', {
      standalone: isStandalone,
      online_status: navigator.onLine
    });
  }, []);

  // --- Google Analytics Tab Tracking ---
  useEffect(() => {
    trackEvent('page_view', {
      page_path: '/' + activeTab,
      page_title: `PESU Calc - ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`,
      page_location: window.location.href
    });
  }, [activeTab]);

  // --- Google Analytics Modal Open Tracking ---
  useEffect(() => {
    if (showToffeeModal) {
      trackEvent('toffee_modal_open');
    }
  }, [showToffeeModal]);

  useEffect(() => {
    if (showFeedbackModal) {
      trackEvent('feedback_modal_open');
    }
  }, [showFeedbackModal]);

  // --- Google Analytics Target SGPA Tracking ---
  useEffect(() => {
    if (targetSgpa !== 9.0 && targetSgpa !== '') {
      const timer = setTimeout(() => {
        trackEvent('target_sgpa_set', {
          target_sgpa: targetSgpa,
          tab: 'analysis'
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [targetSgpa]);

  useEffect(() => {
    if (reverseTargetSgpa !== 8.5 && reverseTargetSgpa !== '') {
      const timer = setTimeout(() => {
        trackEvent('target_sgpa_set', {
          target_sgpa: reverseTargetSgpa,
          tab: 'reverse'
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [reverseTargetSgpa]);

  // --- Google Analytics Attendance Buffer Tracking ---
  useEffect(() => {
    const buffer = parseFloat(attendanceStatusMode.bufferPercent);
    if (!isNaN(buffer) && buffer !== 80) {
      const timer = setTimeout(() => {
        trackEvent('attendance_target_change', {
          target_percentage: buffer
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [attendanceStatusMode.bufferPercent]);



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

  // --- Custom Template Builder State ---
  const {
    showTemplateBuilder,
    setShowTemplateBuilder,
    manualGrades,
    setManualGrades,
    customTemplate,
    setCustomTemplate,
    addComponentToTemplate,
    removeComponentFromTemplate,
    updateTemplateComponent,
    updateCustomGrade,
    addCustomGrade,
    removeCustomGrade,
    applyCustomTemplate,
    applyGradingSchemeToAll
  } = useCustomTemplate({ setSubjects, setExpandedSubject, saveStateForUndo });

  // --- Google Analytics Custom Template Tracking ---
  useEffect(() => {
    if (customTemplate) {
      trackEvent('custom_scheme_used', {
        custom_subject_count: subjects.filter(s => s.isCustom).length,
        modified_grading_schemes: subjects.some(s => s.customGradeMap)
      });
    }
  }, [customTemplate]);



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
    // Debounced GA4 mark entry tracking
    const subject = subjects.find(s => s.id === id);
    const subjectName = subject ? subject.name : '';
    
    const presetCycleNames = [
      "Mathematics - I/II",
      "Engineering Chemistry",
      "Python for Computational Problem Solving/Problem Solving with C",
      "Engineering Mechanics",
      "Electronic Principles",
      "Constitution of India",
      "Engineering Physics",
      "Elements of Electrical Engineering",
      "Mechanical Engineering Sciences",
      "Environmental Studies"
    ];

    const isPresetCycleSubject = presetCycleNames.includes(subjectName);
    const isScoreField = ['isa1', 'isa2', 'assignment', 'lab', 'esa'].includes(field);

    if (isPresetCycleSubject && isScoreField && value !== '') {
      const timerKey = `${id}_${field}`;
      if (markTrackTimersRef.current[timerKey]) {
        clearTimeout(markTrackTimersRef.current[timerKey]);
      }
      markTrackTimersRef.current[timerKey] = setTimeout(() => {
        trackEvent('mark_input', {
          subject_name: subjectName,
          component: field,
          value: parseFloat(value)
        });
      }, 2000);
    }

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
      
      trackEvent('preset_load', {
        preset_name: presetName,
        subject_count: SemesterPresets[presetName].length
      });
    }
  };

  const resetToDefault = () => {
    if (window.confirm("This will erase your custom subjects and restore the Physics Cycle defaults. Continue?")) {
      saveStateForUndo();
      setSubjects(PhysicsCycleDefaults);
      setMarks({});

      trackEvent('data_action', { type: 'restore_defaults' });
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

      trackEvent('data_action', { type: 'clear_all' });
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

    trackEvent('data_action', { type: 'export', subject_count: subjects.length });
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

          trackEvent('data_action', { type: 'import', subject_count: normalizedSubjects.length });
        } else {
          alert('Invalid backup file format');
        }
      } catch {
        alert('Error reading backup file');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
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
  }, [expandedSubject, undoStack, redoStack, marks, subjects, undo, redo, exportData]);

  // --- Calculations ---
  // --- Calculations ---
  const getSubjectMetrics = (subject) => getSubjectMetricsPure(subject, marks);
  const getRequiredESAForGrade = (subject, targetScore, withSafetyMargin = true, options = {}) =>
    getRequiredESAForGradePure(subject, targetScore, withSafetyMargin, options, marks);
  const getRequiredISA2ForGrade = (subject, targetScore, options = {}) =>
    getRequiredISA2ForGradePure(subject, targetScore, options, marks);
  const getRequiredISA2ForPass = (subject) =>
    getRequiredISA2ForPassPure(subject, marks);
  const getGradePoint = (totalMarks, subject = null) =>
    getGradePointPure(totalMarks, subject, GradeMap);
  const getGradeInfo = (score, subject = null) =>
    getGradeInfoPure(score, subject, GradeMap);
  const getFinalIsaSummary = (subject) =>
    getFinalIsaSummaryPure(subject, marks);

  const isSubjectMarksComplete = (subject, m) => {
    if (!m) return false;
    if (subject.hasIsa1 !== false && (m.isa1 === '' || m.isa1 === undefined || isNaN(parseFloat(m.isa1)))) return false;
    if (subject.hasIsa2 !== false && (m.isa2 === '' || m.isa2 === undefined || isNaN(parseFloat(m.isa2)))) return false;
    if (subject.hasAssignment && (m.assignment === '' || m.assignment === undefined || isNaN(parseFloat(m.assignment)))) return false;
    if (subject.hasLab && (m.lab === '' || m.lab === undefined || isNaN(parseFloat(m.lab)))) return false;
    if (m.esa === '' || m.esa === undefined || isNaN(parseFloat(m.esa))) return false;
    return true;
  };

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

    const calculatedSgpa = totalCredits > 0 ? (weightedPoints / totalCredits).toFixed(2) : 0;
    setSgpa(calculatedSgpa);

    // Track SGPA summary if complete and changed
    const allComplete = subjects.every(sub => isSubjectMarksComplete(sub, marks[sub.id]));
    if (allComplete && lastTrackedSgpaRef.current !== calculatedSgpa) {
      lastTrackedSgpaRef.current = calculatedSgpa;
      
      const getSGPABucket = (val) => {
        const num = parseFloat(val);
        if (isNaN(num)) return 'none';
        if (num >= 9.0) return '9.0 - 10.0';
        if (num >= 8.0) return '8.0 - 8.99';
        if (num >= 7.0) return '7.0 - 7.99';
        return 'below_7.0';
      };

      trackEvent('calculation_summary', {
        sgpa_bucket: getSGPABucket(calculatedSgpa),
        subject_count: subjects.length
      });
    }
  }, [marks, subjects]);

  // --- Analysis Calculations ---
  const calculateAnalysis = () => {
    let totalCredits = subjects.reduce((sum, s) => sum + s.credits, 0);
    let maxPossibleGP = totalCredits * 10;
    let targetGP = totalCredits * (parseFloat(targetSgpa) || 0);

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
    const targetTotalGP = totalCredits * (parseFloat(targetSgpa) || 0);

    // 1. Build Current State
    let subState = subjects.map(s => {
      const m = marks[s.id] || {};
      const { momentumScore, totalWeight, esaWeight, projectedCieRounded, projectedLabRounded, momentumEsaMarks } = getSubjectMetrics(s);

      const isFinal = m.esa && m.esa !== '' && !isNaN(parseFloat(m.esa));

      return {
        ...s,
        currentScore: momentumScore,
        currentGP: getGradePoint(momentumScore, s),
        cieRounded: projectedCieRounded,
        labRounded: projectedLabRounded,
        currentEsaMarks: momentumEsaMarks,
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
          // Calculate target rounded ESA sum
          const targetSum = sub.totalWeight > 0 ? Math.ceil((nextGrade.min - 1 + 0.000001) * sub.totalWeight / 100) : 0;
          const targetEsaRounded = targetSum - (sub.cieRounded + sub.labRounded);
          let esaNeeded = 0;
          if (targetEsaRounded > 0) {
            esaNeeded = Math.ceil((targetEsaRounded - 1 + 0.000001) * sub.esaMax / 50);
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
    const targetTotalGP = (parseFloat(reverseTargetSgpa) || 0) * totalCredits;
    let usingMomentum = false;

    // 1. Initialization
    let state = subjects.map(sub => {
      const m = marks[sub.id] || {};
      const {
        cieRounded, labRounded,
        projectedCieRounded, projectedLabRounded,
        totalWeight, esaWeight, projectedInternals
      } = getSubjectMetrics(sub);
      const esaMax = m.esaMax || 100;

      // Check if we are relying on projection (Empty fields)
      const missingIsa1 = m.isa1 === '' || m.isa1 === undefined;
      const missingIsa2 = m.isa2 === '' || m.isa2 === undefined;
      const missingAssign = sub.hasAssignment && (m.assignment === '' || m.assignment === undefined);
      const missingLab = sub.hasLab && (m.lab === '' || m.lab === undefined);

      const isProjecting = missingIsa1 || missingIsa2 || missingAssign || missingLab;
      if (isProjecting) usingMomentum = true;

      // LOGIC FIX 2: Check if subject is effectively "Locked"
      const isEsaEntered = m.esa !== '' && m.esa !== undefined && !isNaN(parseFloat(m.esa));
      const manualLockVal = lockedSubjects[sub.id];
      const isLocked = manualLockVal !== undefined || isEsaEntered;

      let effectiveEsa = 0;
      if (manualLockVal !== undefined) effectiveEsa = manualLockVal;
      else if (isEsaEntered) effectiveEsa = parseFloat(m.esa);

      const effectiveCieRounded = isProjecting ? projectedCieRounded : cieRounded;
      const effectiveLabRounded = isProjecting ? projectedLabRounded : labRounded;

      if (isLocked) {
        const esaComponent = (effectiveEsa / esaMax) * esaWeight;
        const esaScaled = esaWeight > 0 ? (esaComponent / esaWeight) * 50 : 0;
        const esaRounded = Math.ceil(esaScaled);

        const sumRounded = effectiveCieRounded + effectiveLabRounded + esaRounded;
        const totalScore = totalWeight > 0 ? Math.ceil((sumRounded / totalWeight) * 100) : 0;
        const gradeInfo = getGradeInfo(Math.min(100, totalScore), sub);

        return {
          ...sub,
          locked: true,
          currentGradeInfo: gradeInfo,
          currentGP: gradeInfo.gp,
          requiredEsa: effectiveEsa,
          esaMax,
          isImpossible: effectiveEsa > esaMax,
          cieRounded: effectiveCieRounded,
          labRounded: effectiveLabRounded,
          totalWeight, esaWeight,
          isManualLock: manualLockVal !== undefined
        };
      }

      // Handle Unlocked
      // Calculate grade with 0 ESA using PROJECTED internals
      const sumRounded = effectiveCieRounded + effectiveLabRounded;
      const zeroEsaScore = totalWeight > 0 ? Math.ceil((sumRounded / totalWeight) * 100) : 0;
      const startGradeInfo = getGradeInfo(zeroEsaScore, sub);

      return {
        ...sub,
        locked: false,
        currentGradeInfo: startGradeInfo,
        currentGP: startGradeInfo.gp,
        requiredEsa: 0,
        esaMax,
        isImpossible: false,
        cieRounded: effectiveCieRounded,
        labRounded: effectiveLabRounded,
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

        const activeMap = sub.customGradeMap || GradeMap;
        const nextGrade = activeMap.slice().reverse().find(g => g.gp > sub.currentGP);
        if (!nextGrade) return;

        // Calculate Cost using new rounding logic
        const targetSum = sub.totalWeight > 0 ? Math.ceil((nextGrade.min - 1 + 0.000001) * sub.totalWeight / 100) : 0;
        const targetEsaRounded = targetSum - (sub.cieRounded + sub.labRounded);
        let requiredEsa = 0;
        if (targetEsaRounded > 0) {
          requiredEsa = Math.ceil((targetEsaRounded - 1 + 0.000001) * sub.esaMax / 50);
        }

        if (requiredEsa > sub.esaMax) return;

        const markCost = requiredEsa - sub.requiredEsa;
        const gpGain = (nextGrade.gp - sub.currentGP) * sub.credits;

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
    const isTargetAchievable = parseFloat(achievableSGPA) >= (parseFloat(reverseTargetSgpa) || 0);

    return { results, isTargetAchievable, achievableSGPA, avgGPNeeded: 0, usingMomentum };
  };

  // --- Randomized Path (The "Biased Teacher" Method) ---
  const calculateRandomPath = () => {

    // 1. Generate Random Bias (The "Vibe Shift")
    const subjectBias = {};
    subjects.forEach(s => {
      subjectBias[s.id] = 0.2 + (Math.random() * 2.8);
    });

    // 2. Reset: Build initial state with 0 ESA
    let state = subjects.map(sub => {
      const m = marks[sub.id] || {};
      const {
        cieRounded, labRounded,
        projectedCieRounded, projectedLabRounded,
        totalWeight, esaWeight, projectedInternals
      } = getSubjectMetrics(sub);
      const esaMax = m.esaMax || 100;

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

      const effectiveCieRounded = isProjecting ? projectedCieRounded : cieRounded;
      const effectiveLabRounded = isProjecting ? projectedLabRounded : labRounded;

      if (isLocked) {
        const esaComponent = (effectiveEsa / esaMax) * esaWeight;
        const esaScaled = esaWeight > 0 ? (esaComponent / esaWeight) * 50 : 0;
        const esaRounded = Math.ceil(esaScaled);

        const sumRounded = effectiveCieRounded + effectiveLabRounded + esaRounded;
        const totalScore = totalWeight > 0 ? Math.ceil((sumRounded / totalWeight) * 100) : 0;
        const gradeInfo = getGradeInfo(totalScore);

        return {
          ...sub,
          locked: true,
          currentGradeInfo: gradeInfo,
          currentGP: gradeInfo.gp,
          requiredEsa: effectiveEsa,
          esaMax,
          cieRounded: effectiveCieRounded,
          labRounded: effectiveLabRounded,
          totalWeight, esaWeight
        };
      }

      // Unlocked starts at 0 ESA
      const sumRounded = effectiveCieRounded + effectiveLabRounded;
      const zeroEsaScore = totalWeight > 0 ? Math.ceil((sumRounded / totalWeight) * 100) : 0;
      const startGradeInfo = getGradeInfo(zeroEsaScore);

      return {
        ...sub,
        locked: false,
        currentGradeInfo: startGradeInfo,
        currentGP: startGradeInfo.gp,
        requiredEsa: 0,
        esaMax,
        cieRounded: effectiveCieRounded,
        labRounded: effectiveLabRounded,
        totalWeight, esaWeight
      };
    });

    const totalCredits = subjects.reduce((sum, s) => sum + s.credits, 0);
    const targetTotalGP = (parseFloat(reverseTargetSgpa) || 0) * totalCredits;
    let currentTotalGP = state.reduce((sum, s) => sum + (s.currentGP * s.credits), 0);

    // 3. Optimization Loop (Hill Climbing with Bias)
    let iterations = 0;
    while (currentTotalGP < targetTotalGP && iterations < 1000) {
      iterations++;
      let bestUpgrade = null;
      let maxEfficiency = -Infinity; // Start very low

      state.forEach((sub, idx) => {
        if (sub.locked) return;

        const activeMap = sub.customGradeMap || GradeMap;
        const nextGrade = activeMap.slice().reverse().find(g => g.gp > sub.currentGP);
        if (!nextGrade) return;

        const targetSum = sub.totalWeight > 0 ? Math.ceil((nextGrade.min - 1 + 0.000001) * sub.totalWeight / 100) : 0;
        const targetEsaRounded = targetSum - (sub.cieRounded + sub.labRounded);
        let requiredEsa = 0;
        if (targetEsaRounded > 0) {
          requiredEsa = Math.ceil((targetEsaRounded - 1 + 0.000001) * sub.esaMax / 50);
        }

        if (requiredEsa > sub.esaMax) return;

        const markCost = requiredEsa - sub.requiredEsa;
        const gpGain = (nextGrade.gp - sub.currentGP) * sub.credits;

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
      const {
        cieRounded, labRounded,
        projectedCieRounded, projectedLabRounded,
        totalWeight, esaWeight, projectedInternals
      } = getSubjectMetrics(sub);
      const esaMax = m.esaMax || 100;

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

      const effectiveCieRounded = isProjecting ? projectedCieRounded : cieRounded;
      const effectiveLabRounded = isProjecting ? projectedLabRounded : labRounded;

      if (isLocked) {
        const esaComponent = (effectiveEsa / esaMax) * esaWeight;
        const esaScaled = esaWeight > 0 ? (esaComponent / esaWeight) * 50 : 0;
        const esaRounded = Math.ceil(esaScaled);

        const sumRounded = effectiveCieRounded + effectiveLabRounded + esaRounded;
        const totalScore = totalWeight > 0 ? Math.ceil((sumRounded / totalWeight) * 100) : 0;
        const gradeInfo = getGradeInfo(totalScore);

        return {
          ...sub,
          locked: true,
          currentGradeInfo: gradeInfo,
          currentGP: gradeInfo.gp,
          requiredEsa: effectiveEsa,
          esaMax,
          cieRounded: effectiveCieRounded,
          labRounded: effectiveLabRounded,
          totalWeight, esaWeight
        };
      }

      const sumRounded = effectiveCieRounded + effectiveLabRounded;
      const zeroEsaScore = totalWeight > 0 ? Math.ceil((sumRounded / totalWeight) * 100) : 0;
      const startGradeInfo = getGradeInfo(zeroEsaScore);

      return {
        ...sub,
        locked: false,
        currentGradeInfo: startGradeInfo,
        currentGP: startGradeInfo.gp,
        requiredEsa: 0,
        esaMax,
        cieRounded: effectiveCieRounded,
        labRounded: effectiveLabRounded,
        totalWeight, esaWeight
      };
    });

    const totalCredits = subjects.reduce((sum, s) => sum + s.credits, 0);
    const targetTotalGP = (parseFloat(reverseTargetSgpa) || 0) * totalCredits;
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

        const targetSum = sub.totalWeight > 0 ? Math.ceil((nextGrade.min - 1 + 0.000001) * sub.totalWeight / 100) : 0;
        const targetEsaRounded = targetSum - (sub.cieRounded + sub.labRounded);
        let requiredEsa = 0;
        if (targetEsaRounded > 0) {
          requiredEsa = Math.ceil((targetEsaRounded - 1 + 0.000001) * sub.esaMax / 50);
        }

        if (requiredEsa > sub.esaMax) return;

        const markCost = requiredEsa - sub.requiredEsa;
        const gpGain = (nextGrade.gp - sub.currentGP) * sub.credits;

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
      let cieRawSecured = 0;
      let cieWeight = (sub.isaWeight * 2) + (sub.hasAssignment ? sub.assignmentWeight : 0);

      const checkCieComp = (val, max, weight) => {
        if (val !== '' && val !== undefined && !isNaN(parseFloat(val))) {
          cieRawSecured += (parseFloat(val) / parseFloat(max)) * weight;
        }
      };
      checkCieComp(m.isa1, m.isa1Max, sub.isaWeight);
      checkCieComp(m.isa2, m.isa2Max, sub.isaWeight);
      if (sub.hasAssignment) checkCieComp(m.assignment, m.assignmentMax, sub.assignmentWeight);

      let labRawSecured = 0;
      if (sub.hasLab && m.lab !== '' && m.lab !== undefined && !isNaN(parseFloat(m.lab))) {
        labRawSecured = (parseFloat(m.lab) / parseFloat(m.labMax)) * sub.labWeight;
      }

      let esaRawSecured = 0;
      if (m.esa !== '' && m.esa !== undefined && !isNaN(parseFloat(m.esa))) {
        esaRawSecured = (parseFloat(m.esa) / parseFloat(m.esaMax)) * sub.esaWeight;
      }

      // Scaled and Rounded for WORST CASE (assumes 0 in empty fields)
      let cieScaledMin = cieWeight > 0 ? (cieRawSecured / cieWeight) * 50 : 0;
      let cieRoundedMin = Math.ceil(cieScaledMin);

      let labScaledMin = labRawSecured;
      let labRoundedMin = Math.ceil(labScaledMin);

      let esaScaledMin = sub.esaWeight > 0 ? (esaRawSecured / sub.esaWeight) * 50 : 0;
      let esaRoundedMin = Math.ceil(esaScaledMin);

      let sumRoundedMin = cieRoundedMin + labRoundedMin + esaRoundedMin;
      let totalWeight = cieWeight + (sub.hasLab ? sub.labWeight : 0) + sub.esaWeight;
      const minPercent = totalWeight > 0 ? Math.ceil((sumRoundedMin / totalWeight) * 100) : 0;

      // BEST CASE: Assumes Full Marks in all empty fields
      let cieRawMax = cieRawSecured;
      if (m.isa1 === '' || m.isa1 === undefined) cieRawMax += sub.isaWeight;
      if (m.isa2 === '' || m.isa2 === undefined) cieRawMax += sub.isaWeight;
      if (sub.hasAssignment && (m.assignment === '' || m.assignment === undefined)) cieRawMax += sub.assignmentWeight;

      let labRawMax = sub.hasLab
        ? (m.lab !== '' && m.lab !== undefined && !isNaN(parseFloat(m.lab)) ? labRawSecured : sub.labWeight)
        : 0;

      let esaRawMax = (m.esa !== '' && m.esa !== undefined && !isNaN(parseFloat(m.esa))) ? esaRawSecured : sub.esaWeight;

      let cieScaledMax = cieWeight > 0 ? (cieRawMax / cieWeight) * 50 : 0;
      let cieRoundedMax = Math.ceil(cieScaledMax);

      let labScaledMax = labRawMax;
      let labRoundedMax = Math.ceil(labScaledMax);

      let esaScaledMax = sub.esaWeight > 0 ? (esaRawMax / sub.esaWeight) * 50 : 0;
      let esaRoundedMax = Math.ceil(esaScaledMax);

      let sumRoundedMax = cieRoundedMax + labRoundedMax + esaRoundedMax;
      const maxPercent = totalWeight > 0 ? Math.ceil((sumRoundedMax / totalWeight) * 100) : 0;

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
          message: `Currently at score ${finalScore}. Risk of failing!`
        });
      }

      // Opportunity: Easy grade jump
      const currentGP = getGradePoint(finalScore);
      const nextGrade = GradeMap.slice().reverse().find(g => g.gp > currentGP);
      if (nextGrade) {
        const esaMax = m.esaMax || 100;
        const requiredEsa = getRequiredESAForGrade(sub, nextGrade.min, false);

        if (requiredEsa !== null && requiredEsa > 0 && requiredEsa <= 40 && !m.esa) {
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

  // --- Theme Classes (Premium Dark) ---
  const themeClasses = {
    bg: 'bg-black',
    text: 'text-zinc-300',
    card: 'bg-[#0c0c14]/90 backdrop-blur-sm border-white/[0.06]',
    cardHover: 'hover:border-white/[0.12] hover:shadow-lg hover:shadow-black/20',
    input: 'bg-[#0e0e18] border-white/[0.08] text-zinc-200 placeholder:text-zinc-600 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30 transition-all',
    inputBg: 'bg-[#0e0e18]',
    muted: 'text-zinc-500',
    border: 'border-white/[0.06]',
  };

  return (
    <div className={`min-h-screen ${themeClasses.bg} ${themeClasses.text} font-sans pb-24`}>
      {/* Glass Header */}
      <div className="bg-[#08080e]/80 backdrop-blur-2xl border-b border-white/[0.06] text-zinc-200 py-4 px-4 md:p-6 sticky top-0 z-50 shadow-xl shadow-black/40">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 md:gap-3">
              <h1 className="text-xl md:text-2xl font-bold inline-flex items-center gap-2">
                <img src="/header_logo.png" alt="PESU Calculator Logo" className="w-7 h-7 md:w-9 md:h-9 object-contain" />
                <span className="bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">PESU Calculator</span>
              </h1>
              
              {/* Subtle links positioned beside the title */}
              <div className="flex items-center gap-1 md:gap-1.5 text-[9px] md:text-xs font-semibold">
                <button
                  onClick={() => setShowToffeeModal(true)}
                  className="text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 bg-amber-400/5 hover:bg-amber-400/10 px-1.5 py-0.5 md:px-2 md:py-1 rounded-md md:rounded-lg border border-amber-400/10 cursor-pointer"
                >
                  <span>Toffee 🍬</span>
                </button>
                <button
                  onClick={() => setShowFeedbackModal(true)}
                  className="text-zinc-400 hover:text-zinc-200 transition-colors flex items-center gap-1 bg-white/[0.04] hover:bg-white/[0.08] px-1.5 py-0.5 md:px-2 md:py-1 rounded-md md:rounded-lg border border-white/[0.06] cursor-pointer"
                >
                  <span>Feedback 📝</span>
                </button>
              </div>
            </div>
            <p className="text-zinc-500 text-[10px] md:text-xs mt-1.5 font-medium tracking-widest uppercase">
              Universal &bull; Auto-Saves &bull; Any College
            </p>
          </div>

          <div className="text-right">
            <div className="text-[10px] md:text-xs text-zinc-500 uppercase tracking-wider font-semibold">SGPA</div>
            <div className={`text-3xl md:text-4xl font-black tabular-nums tracking-tight ${parseFloat(sgpa) >= targetSgpa ? 'text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.3)]' : 'text-white'}`}>
              {sgpa}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:block sticky top-[72px] md:top-[89px] z-40 bg-[#08080e]/80 backdrop-blur-2xl border-b border-white/[0.06]">
        <div className="max-w-4xl mx-auto flex overflow-x-auto gap-1 px-2 py-1.5">
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
              onClick={() => { window.location.hash = `#/${tab.id}`; }}
              className={`relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${activeTab === tab.id
                ? 'bg-white/[0.08] text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]'
                }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.accent && activeTab !== tab.id && (
                <span className={`w-1.5 h-1.5 rounded-full ${tab.accent === 'blue' ? 'bg-blue-500' : 'bg-emerald-500'} animate-glow-pulse`} />
              )}
            </button>
          ))}
        </div>
      </div>

      <motion.div
        key={activeTab}
        className="max-w-4xl mx-auto p-4 space-y-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
      >

        {/* ==================== SUBJECTS TAB ==================== */}
        {activeTab === 'subjects' && (
          <SubjectsTab
            subjects={subjects}
            marks={marks}
            expandedSubject={expandedSubject}
            setExpandedSubject={setExpandedSubject}
            themeClasses={themeClasses}
            undoStack={undoStack}
            redoStack={redoStack}
            undo={undo}
            redo={redo}
            exportData={exportData}
            importData={importData}
            clearAll={clearAll}
            loadPreset={loadPreset}
            SemesterPresets={SemesterPresets}
            GradeMap={GradeMap}
            GradingSchemes={GradingSchemes}
            metrics={metrics}
            gradeDistribution={gradeDistribution}
            getSubjectMetrics={getSubjectMetrics}
            getGradePoint={getGradePoint}
            getGradeInfo={getGradeInfo}
            getFinalIsaSummary={getFinalIsaSummary}
            handleMarkChange={handleMarkChange}
            handleSubjectChange={handleSubjectChange}
            toggleAssignment={toggleAssignment}
            toggleLab={toggleLab}
            removeSubject={removeSubject}
            addNewSubject={addNewSubject}
            setActiveTab={(tab) => { window.location.hash = `#/${tab}`; }}
            showTemplateBuilder={showTemplateBuilder}
            setShowTemplateBuilder={setShowTemplateBuilder}
            manualGrades={manualGrades}
            setManualGrades={setManualGrades}
            customTemplate={customTemplate}
            setCustomTemplate={setCustomTemplate}
            addComponentToTemplate={addComponentToTemplate}
            removeComponentFromTemplate={removeComponentFromTemplate}
            updateTemplateComponent={updateTemplateComponent}
            updateCustomGrade={updateCustomGrade}
            addCustomGrade={addCustomGrade}
            removeCustomGrade={removeCustomGrade}
            applyCustomTemplate={applyCustomTemplate}
            applyGradingSchemeToAll={applyGradingSchemeToAll}
          />
        )}

        {/* ==================== ANALYSIS TAB ==================== */}
        {activeTab === 'analysis' && (
          <AnalysisTab
            themeClasses={themeClasses}
            targetSgpa={targetSgpa}
            setTargetSgpa={setTargetSgpa}
            sgpaRange={sgpaRange}
            sgpa={sgpa}
            metrics={metrics}
            subjects={subjects}
            marks={marks}
            getSubjectMetrics={getSubjectMetrics}
            getRequiredESAForGrade={getRequiredESAForGrade}
            getRequiredISA2ForPass={getRequiredISA2ForPass}
            getRequiredISA2ForGrade={getRequiredISA2ForGrade}
            GradeMap={GradeMap}
            strategy={strategy}
            minimumPassingTable={minimumPassingTable}
          />
        )}

        {/* ==================== REVERSE CALCULATOR TAB ==================== */}
        {activeTab === 'reverse' && (
          <ReverseTab
            themeClasses={themeClasses}
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
            reverseResults={reverseResults}
            minimumPassingTable={minimumPassingTable}
            calculateRandomPath={calculateRandomPath}
            calculateBalancedPath={calculateBalancedPath}
            setActiveTab={(tab) => { window.location.hash = `#/${tab}`; }}
            getSubjectMetrics={getSubjectMetrics}
            getRequiredESAForGrade={getRequiredESAForGrade}
            getRequiredISA2ForGrade={getRequiredISA2ForGrade}
            GradeMap={GradeMap}
          />
        )}

        {/* ==================== ATTENDANCE TAB ==================== */}
        {activeTab === 'attendance' && (
          <AttendanceTab
            themeClasses={themeClasses}
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
            ATTENDANCE_MIN_PERCENT={ATTENDANCE_MIN_PERCENT}
          />
        )}

        {/* ==================== CGPA TAB ==================== */}
        {activeTab === 'cgpa' && (
          <CgpaTab
            themeClasses={themeClasses}
            semesterData={semesterData}
            updateSemester={updateSemester}
            resetCGPA={resetCGPA}
            simpleCgpa={simpleCgpa}
            setSimpleCgpa={setSimpleCgpa}
          />
        )}

        {/* ==================== GUIDE TAB ==================== */}
        {activeTab === 'guide' && (
          <GuideTab
            themeClasses={themeClasses}
            setShowToffeeModal={setShowToffeeModal}
          />
        )}

        {/* Footer */}
        <div className={`text-center ${themeClasses.muted} text-xs mt-8 pb-4`}>
          <p className="mt-1 opacity-50">PES SGPA Calculator v5.1 © 2026</p>
          <p className="mt-1 text-[10px] opacity-40">Made by AAK</p>
          <button
            onClick={() => setShowToffeeModal(true)}
            className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold rounded-full bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 transition-all cursor-pointer"
          >
            buy me a toffee 🍬
          </button>
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

        {/* Feedback Modal */}
        {showFeedbackModal && (
          <div
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowFeedbackModal(false)}
          >
            <div
              className="relative bg-[#111118] border border-white/[0.08] rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl text-zinc-200"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="absolute top-3 right-3 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-2 font-bold text-zinc-200 mb-3 text-sm">
                <span className="bg-purple-500/10 text-purple-400 w-7 h-7 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </span>
                <span>Send Feedback 🚀</span>
              </div>
              <p className="text-[11px] text-zinc-500 mb-4 leading-relaxed">
                Have a suggestion, bug report, or want to share your thoughts? Send feedback directly to the developer's Discord channel!
              </p>

              {feedbackStatus === 'success' ? (
                <div className="bg-green-500/10 border border-green-500/20 text-green-300 rounded-xl p-4 text-center">
                  <h4 className="font-bold text-xs mb-1">Feedback Sent! 💖</h4>
                  <p className="text-[10px] text-green-400/80 leading-relaxed">Thank you! Your feedback has been delivered to the developer.</p>
                  <button
                    onClick={() => setFeedbackStatus('idle')}
                    className="mt-3 text-[10px] underline font-semibold hover:text-white"
                  >
                    Send more feedback
                  </button>
                </div>
              ) : (
                <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                  <div className="flex flex-col gap-3">
                    {/* Rating */}
                    <div className="flex flex-col space-y-1">
                      <span className="text-[10px] font-semibold text-zinc-400">Rating (Optional)</span>
                      <div className="flex items-center gap-1 py-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setFeedbackRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="transition-transform active:scale-95 cursor-pointer focus:outline-none"
                          >
                            <Star
                              className={`w-4.5 h-4.5 ${
                                star <= (hoverRating || feedbackRating)
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-zinc-600'
                              } transition-colors`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Name */}
                    <div className="flex flex-col space-y-1">
                      <label htmlFor="modal-feedback-name" className="text-[10px] font-semibold text-zinc-400">Name (Optional)</label>
                      <input
                        id="modal-feedback-name"
                        type="text"
                        placeholder="Anonymous"
                        value={feedbackName}
                        onChange={(e) => setFeedbackName(e.target.value)}
                        className="w-full text-xs p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] focus:border-purple-500 focus:ring-purple-500/20 text-zinc-200 transition-all"
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div className="flex flex-col space-y-1">
                    <label htmlFor="modal-feedback-msg" className="text-[10px] font-semibold text-zinc-400">Message</label>
                    <textarea
                      id="modal-feedback-msg"
                      required
                      rows={3}
                      placeholder="What can we improve? Let us know!"
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] focus:border-purple-500 focus:ring-purple-500/20 text-zinc-200 transition-all resize-none"
                    />
                  </div>

                  {feedbackStatus === 'error' && (
                    <p className="text-[10px] text-red-400">
                      Failed to send feedback. Please try again.
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={feedbackStatus === 'submitting' || !feedbackText.trim()}
                    className={`w-full py-2 text-xs font-bold rounded-lg shadow-md transition-all cursor-pointer ${
                      !feedbackText.trim()
                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50'
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }`}
                  >
                    {feedbackStatus === 'submitting' ? 'Sending...' : 'Submit Feedback 🚀'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

      </motion.div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#08080e]/95 backdrop-blur-2xl border-t border-white/[0.06] md:hidden z-50 shadow-[0_-4px_30px_rgba(0,0,0,0.5)]" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 16px)' }}>
        <div className="flex justify-around items-end pt-1.5">
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
              onClick={() => { window.location.hash = `#/${tab.id}`; }}
              className={`relative flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 ${activeTab === tab.id
                ? 'text-white'
                : 'text-zinc-600 active:text-zinc-400'
                }`}
            >
              <div className={`relative ${activeTab === tab.id ? 'scale-110' : ''} transition-transform duration-200`}>
                <tab.icon className="w-5 h-5" />
                {activeTab === tab.id && (
                  <div className="absolute -inset-2 bg-blue-500/20 rounded-full blur-md -z-10" />
                )}
              </div>
              <span className={`text-[10px] mt-1 font-medium ${activeTab === tab.id ? 'text-white' : ''}`}>{tab.label}</span>
              {tab.accent && activeTab !== tab.id && (
                <span className={`absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full ${tab.accent === 'blue' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
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
