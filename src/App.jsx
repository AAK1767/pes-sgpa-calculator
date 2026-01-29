import React, { useState, useEffect, useMemo } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import {
  Trash2, Plus, Settings, ChevronDown, ChevronUp,
  RotateCcw, GraduationCap, Target, Dice5, Scale,
  Eraser, TrendingUp, Activity, Calculator,
  Lightbulb, ArrowRight, CheckCircle2, AlertCircle,
  Download, Upload, Lock, Unlock, AlertTriangle,
  BookOpen, Award, Zap, BarChart3, Moon, Sun,
  Undo2, Redo2, HelpCircle, Info
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
  { id: 3, name: "Elements of Electrical Engineering", credits: 4, hasLab: false, hasAssignment: false, isaWeight: 20, assignmentWeight: 10, labWeight: 0, esaWeight: 50, isa1Max: 40, isa2Max: 40, esaMax: 100 },
  { id: 4, name: "Mechanical Engineering Sciences", credits: 4, hasLab: false, hasAssignment: true, isaWeight: 20, assignmentWeight: 10, labWeight: 0, esaWeight: 50, isa1Max: 40, isa2Max: 40, esaMax: 100 },
  { id: 5, name: "Python for Computational Problem Solving/Problem Solving with C", credits: 5, hasLab: true, hasAssignment: true, isaWeight: 20, assignmentWeight: 10, labWeight: 20, esaWeight: 50, isa1Max: 40, isa2Max: 40, esaMax: 100 },
  { id: 6, name: "Environmental Studies", credits: 2, hasLab: false, hasAssignment: false, isaWeight: 25, assignmentWeight: 0, labWeight: 0, esaWeight: 50, isa1Max: 30, isa2Max: 30, esaMax: 50 },
];

const SemesterPresets = {
  "Chemistry Cycle": ChemistryCycleDefaults,
  "Physics Cycle": PhysicsCycleDefaults,
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
    const CURRENT_VERSION = '2026_START_V3'; // Change this string whenever you want to nuke again
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

      return ChemistryCycleDefaults;
    }
    // --- END RESET LOGIC ---

    const saved = localStorage.getItem('pes_subjects');
    return saved ? JSON.parse(saved) : ChemistryCycleDefaults;
  });

  const [marks, setMarks] = useState(() => {
    const saved = localStorage.getItem('pes_marks');
    return saved ? JSON.parse(saved) : {};
  });

  const [prevCgpaDetails, setPrevCgpaDetails] = useState(() => {
    const saved = localStorage.getItem('pes_cgpa_details');
    return saved ? JSON.parse(saved) : { sgpa: '', credits: '' };
  });

  // --- CGPA Tab State ---
  // We initialize 8 semesters with empty values
  const [semesterData, setSemesterData] = useState(
    Array(8).fill(null).map((_, i) => ({ id: i + 1, sgpa: '', credits: '' }))
  );

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
  const [lockedSubjects, setLockedSubjects] = useState({});
  const [showHelp, setShowHelp] = useState(false);
  // --- Attendance Calculator State (No persistence) ---
  const [attendanceData, setAttendanceData] = useState({ total: '', attended: '' });

  const calculateAttendance = () => {
    const total = parseInt(attendanceData.total);
    const attended = parseInt(attendanceData.attended);

    if (isNaN(total) || isNaN(attended) || total <= 0) {
      return null;
    }

    const currentPercentage = (attended / total) * 100;
    const requiredPercentage = 75;

    // Calculate how many more can be missed while staying >= 75%
    const canMiss = Math.floor((attended - requiredPercentage / 100 * total) / (requiredPercentage / 100));

    // Calculate how many consecutive classes needed to reach 75%
    const needToAttend = Math.ceil((requiredPercentage / 100 * total - attended) / (1 - requiredPercentage / 100));

    return {
      currentPercentage: currentPercentage.toFixed(1),
      isAbove75: currentPercentage >= 75,
      canMiss: Math.max(0, canMiss),
      needToAttend: Math.max(0, needToAttend),
      attended,
      total
    };
  };

  const attendanceResult = calculateAttendance();

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

    setMarks(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: numValue }
    }));
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
    if (window.confirm("This will erase your custom subjects and restore the Chemistry Cycle defaults. Continue?")) {
      saveStateForUndo();
      setSubjects(ChemistryCycleDefaults);
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
        if (data.subjects && data.marks) {
          saveStateForUndo();
          setSubjects(data.subjects);
          setMarks(data.marks);
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
    if (!m) return { finalScore: 0, currentInternals: 0, totalWeight: 100, momentumScore: 0, hasIsa1: false, hasIsa2: false };

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

    // 5. Momentum Logic - Project unfilled components
    let momentumScore = 0;

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
      let projectedInternals = currentInternals;

      // Project ISA2 based on ISA1 performance (if only ISA1 is filled)
      // This makes sense because ISA1 and ISA2 are similar exam formats
      if (!hasIsa2 && hasIsa1) {
        projectedInternals += isaRatio * subject.isaWeight;
      }

      // Project assignment based on overall internal performance (if not filled)
      // We use overall ratio here because assignment performance may differ from ISA
      if (subject.hasAssignment && !hasAssignment) {
        projectedInternals += overallInternalRatio * subject.assignmentWeight;
      }

      // Project lab based on overall internal performance (if not filled)
      if (subject.hasLab && !hasLab) {
        projectedInternals += overallInternalRatio * subject.labWeight;
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
      currentInternals,
      totalWeight,
      momentumScore: Math.min(100, Math.max(0, momentumScore)),
      esaWeight: subject.esaWeight,
      hasIsa1,
      hasIsa2
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
  const getRequiredESAForGrade = (subject, targetScore, withSafetyMargin = true) => {
    const m = marks[subject.id] || {};
    const { currentInternals, totalWeight, esaWeight } = getSubjectMetrics(subject);
    const esaMax = m.esaMax || 100;

    // First check: Is this grade even achievable with max ESA?
    // Calculate what score we'd get with perfect ESA
    const maxEsaComponent = (esaMax / esaMax) * esaWeight; // = esaWeight
    const maxPossibleRaw = ((currentInternals + maxEsaComponent) / totalWeight) * 100;
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
      const requiredEsaComponent = requiredWeightedTotal - currentInternals;

      if (requiredEsaComponent <= 0) return { safe: 0, minimum: 0 };

      const requiredEsaMarks = (requiredEsaComponent / esaWeight) * esaMax;

      // Safe value: round up to ensure we hit the target
      const safeEsa = Math.ceil(requiredEsaMarks);

      // Minimum value: the absolute minimum that could work due to ceiling
      // We need ceil(x) >= targetScore, so x > targetScore - 1
      // Find the minimum ESA where ceil gives us targetScore
      const minWeightedTotal = ((targetScore - 1) * totalWeight / 100) + 0.001;
      const minRequiredEsaComponent = minWeightedTotal - currentInternals;
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
      const requiredEsaComponent = minWeightedTotal - currentInternals;

      if (requiredEsaComponent <= 0) return 0;

      const requiredEsaMarks = (requiredEsaComponent / esaWeight) * esaMax;

      if (requiredEsaMarks > esaMax) return null;

      return Math.ceil(requiredEsaMarks);
    }
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
      const { finalScore, currentInternals, totalWeight, momentumScore, esaWeight } = getSubjectMetrics(sub);
      const currentGP = getGradePoint(finalScore, sub);
      const momentumGP = getGradePoint(momentumScore, sub);

      momentumWeightedGP += (momentumGP * sub.credits);

      const loss = 10 - currentGP;
      currentLostGP += (loss * sub.credits);

      // Use the new helper function with safety margin
      const reqSData = getRequiredESAForGrade(sub, 90, true);
      const reqAData = getRequiredESAForGrade(sub, 80, true);

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
          hard: (result.safe > 75 && !result.requiresRounding) || result.requiresRounding
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

  // --- Theme Classes (Static Dark Mode) ---
  const themeClasses = {
    bg: 'bg-slate-900',
    text: 'text-slate-100',
    card: 'bg-slate-800 border-slate-700',
    cardHover: 'hover:border-slate-600',
    input: 'bg-slate-700 border-slate-600 text-white',
    inputBg: 'bg-slate-800',
    muted: 'text-slate-400',
    border: 'border-slate-700',
  };

  return (
    <div className={`min-h-screen ${themeClasses.bg} ${themeClasses.text} font-sans pb-24`}>
      {/* Hides the up/down arrows in number inputs */}
      <style>{`
        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button { 
          -webkit-appearance: none; 
          margin: 0; 
        }
        input[type=number] {
          -moz-appearance: textfield;
        }
      `}</style>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-800 to-indigo-900 text-white py-3 px-4 md:p-6 shadow-lg sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <GraduationCap className="w-6 h-6 md:w-8 md:h-8 text-yellow-400" />
              PESU Calculator
            </h1>
            <p className="text-blue-200 text-[10px] md:text-xs mt-1 font-medium tracking-wide">
              UNIVERSAL • ANY CYCLE • AUTO-SAVES • ANY SEM • ANY COLLEGE • ANY SCHEME
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] md:text-xs text-blue-200 uppercase tracking-wider font-semibold">Predicted SGPA</div>
              <div className={`text-2xl md:text-4xl font-extrabold ${parseFloat(sgpa) >= targetSgpa ? 'text-green-400' : 'text-white'}`}>
                {sgpa}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      {/* Navigation Tabs (With Highlights for Core Features) */}
      <div className={`hidden md:block sticky top-[72px] md:top-[88px] z-10 ${themeClasses.bg} border-b ${themeClasses.border}`}>
        <div className="max-w-4xl mx-auto flex overflow-x-auto">
          {[
            { id: 'subjects', label: 'Subjects', icon: BookOpen },
            // Added 'highlight: true' and specific colors for the core tabs
            { id: 'analysis', label: 'Analysis', icon: Activity, highlight: true, color: 'text-blue-600 dark:text-blue-400' },
            { id: 'reverse', label: 'Reverse Calc', icon: Target, highlight: true, color: 'text-teal-600 dark:text-teal-400' },
            { id: 'cgpa', label: 'CGPA', icon: Calculator },
            { id: 'guide', label: 'Guide', icon: HelpCircle },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-1 md:gap-2 px-3 md:px-4 py-3 text-xs md:text-sm font-medium border-b-2 transition-all whitespace-nowrap ${activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : `border-transparent hover:text-blue-500 ${tab.highlight ? tab.color : themeClasses.muted}`
                }`}
            >
              <tab.icon className={`w-4 h-4 ${tab.highlight && activeTab !== tab.id ? 'opacity-80' : ''}`} />
              {tab.label}

              {/* The Pulsing Dot for Highlighted Tabs */}
              {tab.highlight && activeTab !== tab.id && (
                <span className="absolute top-2 right-1 flex h-1.5 w-1.5">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${tab.id === 'analysis' ? 'bg-blue-400' : 'bg-teal-400'}`}></span>
                  <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${tab.id === 'analysis' ? 'bg-blue-500' : 'bg-teal-500'}`}></span>
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">

        {/* ==================== SUBJECTS TAB ==================== */}
        {activeTab === 'subjects' && (
          <>
            {/* Helper Banner (Optimized for both Mobile & Desktop) */}
            <div className={`${themeClasses.card} border rounded-xl p-3 md:p-4 text-sm flex flex-col md:flex-row md:items-center justify-between gap-4`}>

              {/* LEFT SIDE: Text Content (Unified Collapsible for Desktop & Mobile) */}
              <div className="flex-1">
                <details className="group">
                  <summary className="flex items-center gap-2 cursor-pointer list-none select-none text-blue-600 hover:text-blue-700 transition-colors">
                    <Settings className="w-5 h-5 flex-shrink-0" />
                    <span className="font-bold text-slate-700 dark:text-slate-200">Universal Calculator</span>
                    <span className="text-[10px] bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded-full text-blue-700 dark:text-blue-300 flex items-center">
                      Info <ChevronDown className="w-3 h-3 ml-1 transition-transform group-open:rotate-180" />
                    </span>
                  </summary>

                  <div className={`mt-3 text-sm ${themeClasses.muted} leading-relaxed pl-7 border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2`}>
                    <p>
                      Works for all semesters. 5-credit courses scale from 120% to 100%.
                    </p>
                    <p>
                      After entering ISA/Lab/Assignment marks, you can check the <strong>Analysis</strong> tab for predictions and how much to score in ESA to reach your target grade in each subject and <strong>Reverse Calc</strong> tab to know what to score in ESAs to reach your target SGPA.
                    </p>
                    <p>
                      This calculator works for any college. Define your assessment pattern and grading scheme below, then click "Create Subject".
                    </p>
                  </div>
                </details>
              </div>

              {/* RIGHT SIDE: Buttons (Always Visible) */}
              <div className="flex flex-wrap gap-2 items-center justify-end border-t border-slate-100 dark:border-slate-800 pt-3 md:border-none md:pt-0">
                <select
                  onChange={(e) => loadPreset(e.target.value)}
                  className={`${themeClasses.input} px-3 py-2 rounded-lg text-xs border max-w-[130px] md:max-w-none`}
                  defaultValue=""
                >
                  <option value="">Load Preset...</option>
                  {Object.keys(SemesterPresets).map(key => (
                    <option key={key} value={key}>{key}</option>
                  ))}
                </select>

                <div className="flex gap-1">
                  <button onClick={undo} disabled={undoStack.length === 0} className={`p-2 rounded-lg border ${themeClasses.border} ${undoStack.length === 0 ? 'opacity-30' : 'hover:bg-blue-50 dark:hover:bg-slate-700'}`}>
                    <Undo2 className="w-4 h-4" />
                  </button>
                  <button onClick={redo} disabled={redoStack.length === 0} className={`p-2 rounded-lg border ${themeClasses.border} ${redoStack.length === 0 ? 'opacity-30' : 'hover:bg-blue-50 dark:hover:bg-slate-700'}`}>
                    <Redo2 className="w-4 h-4" />
                  </button>
                </div>

                <button onClick={exportData} className={`flex items-center gap-1 ${themeClasses.card} border px-3 py-2 rounded-lg transition-colors text-xs hover:bg-blue-50 dark:hover:bg-slate-700`}>
                  <Download className="w-3 h-3" /> <span className="hidden sm:inline">Export</span>
                </button>

                <label className={`flex items-center gap-1 ${themeClasses.card} border px-3 py-2 rounded-lg transition-colors text-xs cursor-pointer hover:bg-blue-50 dark:hover:bg-slate-700`}>
                  <Upload className="w-3 h-3" /> <span className="hidden sm:inline">Import</span>
                  <input type="file" accept=".json" onChange={importData} className="hidden" />
                </label>

                <button onClick={clearAll} className="flex items-center gap-1 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 px-3 py-2 rounded-lg border border-red-200 dark:border-red-800 transition-colors text-xs">
                  <Eraser className="w-3 h-3" />
                </button>
              </div>

            </div>

            {/* Grade Distribution Bar */}
            <div className={`${themeClasses.card} border rounded-xl p-4`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" /> Grade Distribution
                </span>
                <span className={`text-xs ${themeClasses.muted}`}>
                  {subjects.length} subjects • {metrics.totalCredits} credits
                </span>
              </div>
              <div className="flex gap-1 h-8 rounded-lg overflow-hidden">
                {Object.entries(gradeDistribution).map(([grade, count]) => {
                  if (count === 0) return null;
                  const gradeInfo = GradeMap.find(g => g.grade === grade);
                  return (
                    <div
                      key={grade}
                      className={`flex items-center justify-center text-xs font-bold text-white ${gradeInfo?.bg || 'bg-gray-500'}`}
                      style={{ width: `${(count / subjects.length) * 100}%` }}
                      title={`${grade}:  ${count} subject(s)`}
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
                const { finalScore, totalWeight } = getSubjectMetrics(subject);
                const gp = getGradePoint(finalScore, subject);
                const gradeInfo = getGradeInfo(finalScore, subject);
                const isExpanded = expandedSubject === subject.id;

                return (
                  <div key={subject.id} className={`${themeClasses.card} rounded-xl shadow-sm border transition-all duration-200 ${isExpanded ? 'border-blue-400 ring-2 ring-blue-500/20' : themeClasses.cardHover}`}>
                    {/* Subject Header */}
                    <div
                      className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between cursor-pointer rounded-t-xl gap-4"
                      onClick={() => setExpandedSubject(isExpanded ? null : subject.id)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-lg">{subject.name}</h3>
                          <span className={`text-xs font-bold ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'} px-2 py-0.5 rounded-full border ${themeClasses.border}`}>
                            {subject.credits} Cr
                          </span>
                          {totalWeight > 100 && (
                            <span className="text-xs font-bold bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-700">
                              Scaled ({totalWeight}%)
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="text-right">
                          <div className={`text-xs ${themeClasses.muted} font-bold uppercase tracking-wider`}>Score</div>
                          <div className={`font-bold text-xl leading-none ${gradeInfo.color}`}>
                            {finalScore}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white shadow-sm ${gradeInfo.bg}`}>
                            {gradeInfo.grade}
                          </div>
                          {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className={`p-4 border-t ${themeClasses.border} ${darkMode ? 'bg-slate-800/50' : 'bg-slate-50/50'} rounded-b-xl`}>
                        {/* DYNAMIC INPUTS GRID (Fixed: Allows 0 marks) */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-4">

                          {/* SLOT 1 */}
                          {(subject.hasIsa1 !== false) && (
                            <div className={`${themeClasses.card} p-2 rounded-lg border shadow-sm`}>
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-xs truncate pr-1" title={subject.customConfig?.labels.isa1 || "ISA 1"}>
                                  {subject.customConfig?.labels.isa1 || "ISA 1"}
                                </span>
                                <span className={`text-[10px] ${themeClasses.muted}`}>
                                  {subject.customConfig ? subject.customConfig.weights.isa1 : (subject.isaWeight / (subject.hasIsa2 ? 2 : 1))}%
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  /* FIXED: Used ?? so 0 is treated as a real number */
                                  value={marks[subject.id]?.isa1 ?? ''}
                                  onChange={(e) => handleMarkChange(subject.id, 'isa1', e.target.value)}
                                  className={`w-full p-1 text-base md:text-sm font-bold border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none text-center ${themeClasses.input}`}
                                  placeholder="-"
                                />
                                <span className={themeClasses.muted}>/</span>
                                <input
                                  type="number"
                                  value={subject.isa1Max ?? 40}
                                  onChange={(e) => handleMarkChange(subject.id, 'isa1Max', e.target.value)}
                                  className={`w-10 p-1 text-base md:text-sm border-none focus:ring-0 text-center ${themeClasses.inputBg} ${themeClasses.muted}`}
                                />
                              </div>
                            </div>
                          )}

                          {/* SLOT 2 */}
                          {(subject.hasIsa2 !== false) && (
                            <div className={`${themeClasses.card} p-2 rounded-lg border shadow-sm`}>
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-xs truncate pr-1" title={subject.customConfig?.labels.isa2 || "ISA 2"}>
                                  {subject.customConfig?.labels.isa2 || "ISA 2"}
                                </span>
                                <span className={`text-[10px] ${themeClasses.muted}`}>
                                  {subject.customConfig ? subject.customConfig.weights.isa2 : (subject.isaWeight / 2)}%
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  value={marks[subject.id]?.isa2 ?? ''}
                                  onChange={(e) => handleMarkChange(subject.id, 'isa2', e.target.value)}
                                  className={`w-full p-1 text-base md:text-sm font-bold border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none text-center ${themeClasses.input}`}
                                  placeholder="-"
                                />
                                <span className={themeClasses.muted}>/</span>
                                <input
                                  type="number"
                                  value={subject.isa2Max ?? 40}
                                  onChange={(e) => handleMarkChange(subject.id, 'isa2Max', e.target.value)}
                                  className={`w-10 p-1 text-base md:text-sm border-none focus:ring-0 text-center ${themeClasses.inputBg} ${themeClasses.muted}`}
                                />
                              </div>
                            </div>
                          )}

                          {/* SLOT 3 */}
                          {(subject.hasAssignment || (subject.customConfig?.weights.assignment > 0)) && (
                            <div className={`${themeClasses.card} p-2 rounded-lg border shadow-sm`}>
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-xs truncate pr-1" title={subject.customConfig?.labels.assignment || "Assignment"}>
                                  {subject.customConfig?.labels.assignment || "Assignment"}
                                </span>
                                <span className={`text-[10px] ${themeClasses.muted}`}>
                                  {subject.customConfig ? subject.customConfig.weights.assignment : subject.assignmentWeight}%
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  value={marks[subject.id]?.assignment ?? ''}
                                  onChange={(e) => handleMarkChange(subject.id, 'assignment', e.target.value)}
                                  className={`w-full p-1 text-base md:text-sm font-bold border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none text-center ${themeClasses.input}`}
                                  placeholder="-"
                                />
                                <span className={themeClasses.muted}>/</span>
                                <input
                                  type="number"
                                  value={subject.assignmentMax ?? 10}
                                  onChange={(e) => handleMarkChange(subject.id, 'assignmentMax', e.target.value)}
                                  className={`w-10 p-1 text-base md:text-sm border-none focus:ring-0 text-center ${themeClasses.inputBg} ${themeClasses.muted}`}
                                />
                              </div>
                            </div>
                          )}

                          {/* SLOT 4 */}
                          {(subject.hasLab || (subject.customConfig?.weights.lab > 0)) && (
                            <div className={`${themeClasses.card} p-2 rounded-lg border shadow-sm`}>
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-xs truncate pr-1" title={subject.customConfig?.labels.lab || "Lab"}>
                                  {subject.customConfig?.labels.lab || "Lab"}
                                </span>
                                <span className={`text-[10px] ${themeClasses.muted}`}>
                                  {subject.customConfig ? subject.customConfig.weights.lab : subject.labWeight}%
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  value={marks[subject.id]?.lab ?? ''}
                                  onChange={(e) => handleMarkChange(subject.id, 'lab', e.target.value)}
                                  className={`w-full p-1 text-base md:text-sm font-bold border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none text-center ${themeClasses.input}`}
                                  placeholder="-"
                                />
                                <span className={themeClasses.muted}>/</span>
                                <input
                                  type="number"
                                  value={subject.labMax ?? 20}
                                  onChange={(e) => handleMarkChange(subject.id, 'labMax', e.target.value)}
                                  className={`w-10 p-1 text-base md:text-sm border-none focus:ring-0 text-center ${themeClasses.inputBg} ${themeClasses.muted}`}
                                />
                              </div>
                            </div>
                          )}

                          {/* SLOT 5: ESA */}
                          <div className={`${themeClasses.card} p-2 rounded-lg border shadow-sm border-blue-200 dark:border-blue-900/30`}>
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-bold text-xs text-blue-600 dark:text-blue-400 truncate pr-1" title={subject.customConfig?.labels.esa || "ESA"}>
                                {subject.customConfig?.labels.esa || "ESA"}
                              </span>
                              <span className={`text-[10px] ${themeClasses.muted}`}>
                                {subject.customConfig ? subject.customConfig.weights.esa : subject.esaWeight}%
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={marks[subject.id]?.esa ?? ''}
                                onChange={(e) => handleMarkChange(subject.id, 'esa', e.target.value)}
                                className={`w-full p-1 text-base md:text-sm font-bold border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none text-center ${themeClasses.input}`}
                                placeholder="-"
                              />
                              <span className={themeClasses.muted}>/</span>
                              <input
                                type="number"
                                value={subject.esaMax ?? 100}
                                onChange={(e) => handleMarkChange(subject.id, 'esaMax', e.target.value)}
                                className={`w-10 p-1 text-base md:text-sm border-none focus:ring-0 text-center ${themeClasses.inputBg} ${themeClasses.muted}`}
                              />
                            </div>
                          </div>

                        </div>

                        {/* Quick Config */}
                        <div className={`mt-4 pt-4 border-t ${themeClasses.border}`}>
                          <details className="group">
                            <summary className={`flex items-center gap-2 text-xs font-bold ${themeClasses.muted} uppercase tracking-wide cursor-pointer hover:text-blue-600 select-none transition-colors`}>
                              <Settings className="w-4 h-4" /> Edit Subject Details
                            </summary>
                            <div className={`mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 ${themeClasses.card} rounded-lg border`}>
                              <div className="space-y-3">
                                <div>
                                  <label className={`text-xs ${themeClasses.muted} block mb-1`}>Name</label>
                                  <input
                                    type="text"
                                    value={subject.name}
                                    onChange={(e) => handleSubjectChange(subject.id, 'name', e.target.value)}
                                    className={`w-full text-sm p-2 border rounded ${themeClasses.input}`}
                                  />
                                </div>
                                <div>
                                  <label className={`text-xs ${themeClasses.muted} block mb-1`}>Credits</label>
                                  <input
                                    type="number"
                                    value={subject.credits}
                                    onChange={(e) => handleSubjectChange(subject.id, 'credits', parseFloat(e.target.value) || 0)}
                                    className={`w-full text-sm p-2 border rounded ${themeClasses.input}`}
                                  />
                                </div>
                                <div className="flex gap-4">
                                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={subject.hasAssignment}
                                      onChange={() => toggleAssignment(subject.id)}
                                      className="rounded"
                                    />
                                    Has Assignment
                                  </label>
                                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={subject.hasLab}
                                      onChange={() => toggleLab(subject.id)}
                                      className="rounded"
                                    />
                                    Has Lab
                                  </label>
                                </div>
                              </div>
                              <div className="space-y-3">
                                <label className={`text-xs ${themeClasses.muted} block`}>Weight Configuration (%)</label>
                                <div className="flex gap-2 flex-wrap">
                                  <div className="flex-1 min-w-[60px]">
                                    <span className={`text-[10px] ${themeClasses.muted} block`}>ISA (Each)</span>
                                    <input
                                      type="number"
                                      value={subject.isaWeight}
                                      onChange={(e) => handleSubjectChange(subject.id, 'isaWeight', parseFloat(e.target.value) || 0)}
                                      className={`w-full text-sm p-1 border rounded ${themeClasses.input}`}
                                    />
                                  </div>
                                  <div className="flex-1 min-w-[60px]">
                                    <span className={`text-[10px] ${themeClasses.muted} block`}>ESA</span>
                                    <input
                                      type="number"
                                      value={subject.esaWeight}
                                      onChange={(e) => handleSubjectChange(subject.id, 'esaWeight', parseFloat(e.target.value) || 0)}
                                      className={`w-full text-sm p-1 border rounded ${themeClasses.input}`}
                                    />
                                  </div>
                                  {subject.hasAssignment && (
                                    <div className="flex-1 min-w-[60px]">
                                      <span className={`text-[10px] ${themeClasses.muted} block`}>Assign</span>
                                      <input
                                        type="number"
                                        value={subject.assignmentWeight}
                                        onChange={(e) => handleSubjectChange(subject.id, 'assignmentWeight', parseFloat(e.target.value) || 0)}
                                        className={`w-full text-sm p-1 border rounded ${themeClasses.input}`}
                                      />
                                    </div>
                                  )}
                                  {subject.hasLab && (
                                    <div className="flex-1 min-w-[60px]">
                                      <span className={`text-[10px] ${themeClasses.muted} block`}>Lab</span>
                                      <input
                                        type="number"
                                        value={subject.labWeight}
                                        onChange={(e) => handleSubjectChange(subject.id, 'labWeight', parseFloat(e.target.value) || 0)}
                                        className={`w-full text-sm p-1 border rounded ${themeClasses.input}`}
                                      />
                                    </div>
                                  )}
                                </div>

                                {/* --- Grade Cutoff Editor --- */}
                                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 w-full">
                                  <details>
                                    <summary className="text-xs font-bold cursor-pointer hover:text-blue-500 flex items-center gap-1 select-none text-slate-500">
                                      <Target className="w-3 h-3" /> Advanced: Adjust Grade Cutoffs (Curve)
                                    </summary>

                                    <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded border border-yellow-200 dark:border-yellow-800/30">
                                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-2">
                                        If the paper was hard and cutoffs were lowered, adjust them here.
                                      </p>

                                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                        {(subject.customGradeMap || GradeMap).filter(g => g.gp > 0).map((g, idx) => (
                                          <div key={g.grade} className="flex flex-col">
                                            <label className={`text-[10px] font-bold text-center mb-1 ${g.color || 'text-slate-500'}`}>
                                              {g.grade} (&ge;)
                                            </label>
                                            <input
                                              type="number"
                                              value={g.min}
                                              className={`w-full text-center text-xs p-1 border rounded ${themeClasses.input}`}
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
                                          className="mt-2 text-[10px] text-red-500 hover:underline flex items-center gap-1"
                                        >
                                          <RotateCcw className="w-3 h-3" /> Reset to Standards
                                        </button>
                                      )}
                                    </div>
                                  </details>
                                </div>

                                <button
                                  onClick={() => removeSubject(subject.id)}
                                  className="w-full text-red-600 text-xs border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover: bg-red-900/50 p-2 rounded flex items-center justify-center gap-2 mt-2"
                                >
                                  <Trash2 className="w-3 h-3" /> Remove Subject
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
              className={`w-full py-3 border-2 border-dashed ${themeClasses.border} rounded-xl ${themeClasses.muted} hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all flex items-center justify-center gap-2 font-bold text-sm`}
            >
              <Plus className="w-4 h-4" /> Add Custom Subject
            </button>

            {/* Subtle "Next Steps" Footer */}
            <div className="mt-8 mb-2 flex justify-center">
              <div className={`inline-flex flex-col sm:flex-row items-center gap-3 sm:gap-6 p-1 sm:p-2 sm:px-4 rounded-xl border ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'} transition-all`}>

                <span className={`text-xs font-semibold ${themeClasses.muted} hidden sm:block`}>
                  Done updating?
                </span>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setActiveTab('analysis')}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-blue-600 bg-blue-100/50 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/40 rounded-lg transition-colors"
                  >
                    <Activity className="w-3.5 h-3.5" /> Check Analysis
                  </button>

                  <button
                    onClick={() => setActiveTab('reverse')}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-teal-600 bg-teal-100/50 hover:bg-teal-100 dark:bg-teal-900/20 dark:text-teal-300 dark:hover:bg-teal-900/40 rounded-lg transition-colors"
                  >
                    <Target className="w-3.5 h-3.5" /> Plan Targets
                  </button>
                </div>
              </div>
            </div>

            {/* Alerts Banner - Inside subjects tab */}
            {alerts.length > 0 && (
              <div className="space-y-2">
                {alerts.filter(a => a.type === 'critical').map((alert, i) => (
                  <div key={i} className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 p-3 rounded-r-lg flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 dark: text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-red-800 dark:text-red-300">{alert.subject}:  </span>
                      <span className="text-red-700 dark:text-red-400 text-sm">{alert.message}</span>
                    </div>
                  </div>
                ))}
                {alerts.filter(a => a.type === 'opportunity').slice(0, 2).map((alert, i) => (
                  <div key={i} className="bg-blue-100 dark: bg-blue-900/30 border-l-4 border-blue-500 p-3 rounded-r-lg flex items-start gap-2">
                    <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-blue-800 dark:text-blue-300">{alert.subject}:  </span>
                      <span className="text-blue-700 dark:text-blue-400 text-sm">{alert.message}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ==================== ATTENDANCE CALCULATOR (Collapsible) ==================== */}
            <div className={`${themeClasses.card} border rounded-xl overflow-hidden mt-6`}>
              <details className="group">
                <summary className="flex items-center justify-between p-4 cursor-pointer list-none select-none hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    {/* Icon */}
                    <CheckCircle2 className="w-5 h-5 text-green-500" />

                    {/* Text Column */}
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-700 dark:text-slate-200">Quick Attendance Check</span>
                        {/* The 'Not Saved' Badge */}
                        <span className={`text-[10px] ${themeClasses.muted} font-normal px-1.5 rounded bg-slate-100 dark:bg-slate-800 border`}>Not saved</span>
                      </div>

                      <p className={`text-xs ${themeClasses.muted} font-normal mt-0.5`}>
                        Calculate safe no. of classes you can miss vs. 75% requirement
                      </p>
                    </div>
                  </div>
                  <ChevronDown className="w-5 h-5 opacity-50 transition-transform group-open:rotate-180" />
                </summary>

                <div className={`p-4 border-t ${themeClasses.border} bg-slate-50/50 dark:bg-slate-900/20`}>

                  {/* Inputs */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className={`text-xs ${themeClasses.muted} block mb-1`}>Total Classes Completed</label>
                      <input
                        type="number"
                        placeholder="e.g. 40"
                        value={attendanceData.total}
                        onChange={(e) => setAttendanceData(prev => ({ ...prev, total: e.target.value }))}
                        className={`w-full p-2 border rounded-lg text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none ${themeClasses.input}`}
                      />
                    </div>
                    <div>
                      <label className={`text-xs ${themeClasses.muted} block mb-1`}>Classes Attended</label>
                      <input
                        type="number"
                        placeholder="e.g. 35"
                        value={attendanceData.attended}
                        onChange={(e) => setAttendanceData(prev => ({ ...prev, attended: e.target.value }))}
                        className={`w-full p-2 border rounded-lg text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none ${themeClasses.input}`}
                      />
                    </div>
                  </div>

                  {/* Results */}
                  {attendanceResult && (
                    <div className="space-y-3">
                      {/* Current Percentage Bar */}
                      <div className={`p-3 rounded-lg ${attendanceResult.isAbove75 ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
                        <div className="flex justify-between items-center mb-2">
                          <span className={`text-xs font-bold ${attendanceResult.isAbove75 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                            Current Attendance
                          </span>
                          <span className={`text-lg font-bold ${attendanceResult.isAbove75 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {attendanceResult.currentPercentage}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${attendanceResult.isAbove75 ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{ width: `${Math.min(100, parseFloat(attendanceResult.currentPercentage))}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] mt-1">
                          <span className={themeClasses.muted}>0%</span>
                          <span className={`font-bold ${attendanceResult.isAbove75 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>75% Required</span>
                          <span className={themeClasses.muted}>100%</span>
                        </div>
                      </div>

                      {/* Action Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {attendanceResult.isAbove75 ? (
                          <div className="bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                              <span className="text-xs font-bold text-green-700 dark:text-green-300">You're Safe!</span>
                            </div>
                            <p className="text-sm text-green-800 dark:text-green-200">
                              You can miss up to <strong className="text-lg">{attendanceResult.canMiss}</strong> more class{attendanceResult.canMiss !== 1 ? 'es' : ''} and still stay above 75%.
                            </p>
                          </div>
                        ) : (
                          <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                              <span className="text-xs font-bold text-red-700 dark:text-red-300">Below 75%!</span>
                            </div>
                            <p className="text-sm text-red-800 dark:text-red-200">
                              Attend the next <strong className="text-lg">{attendanceResult.needToAttend}</strong> class{attendanceResult.needToAttend !== 1 ? 'es' : ''} continuously to reach 75%.
                            </p>
                          </div>
                        )}

                        {/* Stats Card */}
                        <div className={`${darkMode ? 'bg-slate-700/50' : 'bg-slate-100'} rounded-lg p-3`}>
                          <div className="text-xs font-bold mb-2 opacity-70">Quick Stats</div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className={themeClasses.muted}>Attended:</span>
                              <span className="ml-1 font-bold">{attendanceResult.attended}/{attendanceResult.total}</span>
                            </div>
                            <div>
                              <span className={themeClasses.muted}>Missed:</span>
                              <span className="ml-1 font-bold">{attendanceResult.total - attendanceResult.attended}</span>
                            </div>
                            <div className="col-span-2">
                              <span className={themeClasses.muted}>Classes for 75%:</span>
                              <span className="ml-1 font-bold">{Math.ceil(attendanceResult.total * 0.75)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {!attendanceResult && (
                    <div className={`text-center py-4 ${themeClasses.muted} text-xs`}>
                      Enter total classes completed as of now and attended classes to check your attendance status.(for a subject)
                    </div>
                  )}

                </div>
              </details>
            </div>

            {/* ==================== QUICK SGPA ESTIMATOR (FROM GRADES) ==================== */}
            <div className={`${themeClasses.card} border rounded-xl overflow-hidden mt-6`}>
              <details className="group">
                <summary className="flex items-center justify-between p-4 cursor-pointer list-none select-none hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-md">
                      <span className="text-white text-lg font-bold">✨</span>
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-sm text-slate-700 dark:text-slate-200">Quick SGPA Estimator</h3>
                      <p className={`text-xs ${themeClasses.muted}`}>Calculate SGPA by directly selecting grades</p>
                    </div>
                  </div>
                  <ChevronDown className="w-5 h-5 opacity-50 transition-transform group-open:rotate-180" />
                </summary>

                <div className={`p-4 border-t ${themeClasses.border} bg-slate-50/50 dark:bg-slate-900/20`}>

                  {/* Results Header */}
                  <div className="flex items-center justify-between mb-4 bg-white dark:bg-slate-800 p-3 rounded-lg border shadow-sm">
                    <span className="text-xs font-bold uppercase opacity-50">Hypothetical SGPA</span>
                    <span className="text-2xl font-black text-teal-600 dark:text-teal-400">
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
                      <div className="text-center py-4 text-xs opacity-50">No subjects added yet.</div>
                    ) : (
                      subjects.map(sub => {
                        // Determine which grading scheme to show in dropdown
                        const scheme = sub.customGradeMap || GradeMap;

                        return (
                          <div key={sub.id} className="flex items-center justify-between gap-3 p-2 bg-white dark:bg-slate-800 rounded border dark:border-slate-700">
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold truncate" title={sub.name}>{sub.name}</div>
                              <div className="text-[10px] opacity-50">{sub.credits} Credits</div>
                            </div>

                            <select
                              value={manualGrades[sub.id] || ""}
                              onChange={(e) => setManualGrades(prev => ({ ...prev, [sub.id]: e.target.value }))}
                              className={`w-24 p-1.5 text-xs font-bold border rounded focus:ring-2 focus:ring-teal-500 focus:outline-none ${themeClasses.input}`}
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

                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => setManualGrades({})}
                      className="text-xs text-red-500 hover:text-red-600 font-medium underline decoration-red-200 hover:decoration-red-500 underline-offset-2 transition-all"
                    >
                      Reset All
                    </button>
                  </div>

                </div>
              </details>
            </div>

            {/* ==================== NOT FROM PES? CUSTOM TEMPLATE BUILDER ==================== */}
            <div className={`${themeClasses.card} border rounded-xl overflow-hidden mt-8`}>
              <button
                onClick={() => setShowTemplateBuilder(!showTemplateBuilder)}
                className={`w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-sm">Not from PES? 🎓</h3>
                    <p className={`text-xs ${themeClasses.muted}`}>Configure for VTU, IIT, or Custom Colleges</p>
                  </div>
                </div>
                {showTemplateBuilder ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>

              {showTemplateBuilder && (
                <div className={`p-4 border-t ${themeClasses.border} space-y-6 animate-in slide-in-from-top-2`}>

                  {/* Intro Text */}
                  <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 p-4 rounded-lg border border-purple-200 dark:border-purple-800/30">
                    <p className="text-sm text-purple-800 dark:text-purple-200">
                      <strong>Universal Mode:</strong> This calculator works for any college. Define your assessment pattern and grading scheme below, then click "Create Subject".
                    </p>
                  </div>

                  {/* Step 1: Basic Info */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-sm flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs">1</span>
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
                      <span className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs">2</span>
                      Assessment Pattern
                    </h4>

                    <div className="space-y-2">
                      {customTemplate.components.map((comp, idx) => (
                        <div
                          key={idx}
                          /* CHANGED: 'flex-wrap' allows items to drop to next line on tiny screens */
                          className={`flex flex-wrap sm:flex-nowrap items-center gap-2 p-2 rounded-lg border transition-all ${comp.enabled
                            ? `${themeClasses.card} ${themeClasses.border}`
                            : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-50'
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
                              className={`flex-1 p-1 text-xs border-b border-transparent hover:border-slate-300 dark:hover:border-slate-600 bg-transparent focus:outline-none ${!comp.enabled && 'opacity-50'}`}
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
                              <span className={`text-[10px] ${themeClasses.muted}`}>%</span>
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
                              className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={addComponentToTemplate}
                      className={`w-full py-2 border-2 border-dashed ${themeClasses.border} rounded-lg ${themeClasses.muted} hover:text-purple-600 hover:border-purple-400 transition-all flex items-center justify-center gap-2 text-xs font-bold`}
                    >
                      <Plus className="w-3 h-3" /> Add Component
                    </button>

                    {customTemplate.components.filter(c => c.enabled).reduce((sum, c) => sum + c.weight, 0) !== 100 && (
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg p-3 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-yellow-700 dark:text-yellow-300">
                          <strong>Note:</strong> Total weight is {customTemplate.components.filter(c => c.enabled).reduce((sum, c) => sum + c.weight, 0)}%. (PES uses 120%, but standard is 100%).
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Step 3: Grading Scheme */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-sm flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs">3</span>
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

                    <div className={`p-3 rounded-lg border ${themeClasses.border} ${darkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
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
                            <button onClick={() => removeCustomGrade(idx)} className="col-span-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded flex justify-center">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={addCustomGrade}
                        className="mt-3 text-xs text-purple-600 hover:underline flex items-center gap-1 w-full justify-center"
                      >
                        <Plus className="w-3 h-3" /> Add Grade Row
                      </button>
                    </div>

                    <button
                      onClick={applyGradingSchemeToAll}
                      className="w-full py-2 text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <Zap className="w-3 h-3" /> Apply Scheme to ALL Subjects
                    </button>
                  </div>

                  {/* Create Button */}
                  <div className="flex gap-3 pt-4 border-t dark:border-slate-700">
                    <button
                      onClick={applyCustomTemplate}
                      className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2"
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
          <div className="space-y-6">
            {/* Target Analyzer (Top Cards) */}
            <div className={`${darkMode ? 'bg-slate-800' : 'bg-slate-900'} rounded-xl shadow-lg p-6 text-white border ${darkMode ? 'border-slate-700' : 'border-slate-800'}`}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-lg font-bold flex items-center gap-2 text-yellow-400">
                  <Activity className="w-5 h-5" /> Target Analysis
                </h2>
                <div className="flex items-center gap-2 bg-slate-700 px-3 py-2 rounded-lg">
                  <span className="text-xs text-slate-400 uppercase font-bold">Target SGPA</span>
                  <input
                    type="number"
                    step="0.1"
                    max="10"
                    min="5"
                    value={targetSgpa}
                    onChange={(e) => setTargetSgpa(parseFloat(e.target.value) || 0)}
                    className="w-16 p-1 bg-transparent text-right font-bold text-white border-none focus:ring-0 text-lg"
                  />
                </div>
              </div>

              {/* Grid with Range */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {/* Range Card */}
                <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 col-span-2 relative overflow-hidden group">
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Achievable Range</div>
                      <div className="text-2xl font-bold text-white flex items-baseline gap-2">
                        {sgpaRange.min} <span className="text-sm text-slate-500 font-normal">to</span> {sgpaRange.max}
                      </div>
                    </div>
                    <Activity className="w-8 h-8 text-slate-600 group-hover:text-blue-500/50 transition-colors" />
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden relative">
                    <div className="absolute h-full bg-blue-500/30" style={{ left: `${(sgpaRange.min / 10) * 100}%`, right: `${100 - (sgpaRange.max / 10) * 100}%` }} />
                    <div className="absolute h-full w-1 bg-yellow-400 top-0 z-10" style={{ left: `${(Math.min(Math.max(sgpa, sgpaRange.min), sgpaRange.max) / 10) * 100}%` }} />
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-500 mt-1 font-mono">
                    <span>{sgpaRange.min}</span>
                    <span className="text-yellow-500 font-bold">Curr: {sgpa}</span>
                    <span>{sgpaRange.max}</span>
                  </div>
                </div>

                {/* Target Gap */}
                <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 opacity-10"><Target className="w-10 h-10" /></div>
                  <div className="text-2xl font-bold">{metrics.allowableLoss.toFixed(1)}</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">GP Budget</div>
                  <p className="text-[10px] text-slate-500 mt-1">Points you can lose to hit {targetSgpa}</p>
                </div>

                {/* Momentum */}
                <div className="bg-indigo-900/40 rounded-lg p-4 border border-indigo-500/30 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 opacity-10"><TrendingUp className="w-10 h-10" /></div>
                  <div className="text-2xl font-bold text-indigo-300">{metrics.momentumSGPA}</div>
                  <div className="text-[10px] text-indigo-200/70 uppercase tracking-wider">Momentum SGPA *</div>
                  <p className="text-[10px] text-indigo-200/50 mt-1">If you maintain current form, i.e ISA performance = ESA</p>
                </div>
              </div>

              {/* Subject-wise Analysis List */}
              <div className="space-y-3 md:space-y-2 max-h-[60vh] md:max-h-80 overflow-y-auto pr-1 md:pr-2 scrollbar-thin">

                {/* Table Header (Desktop Only) */}
                <div className="hidden md:grid grid-cols-12 gap-2 text-[10px] text-slate-500 uppercase font-bold pb-2 border-b border-slate-700 sticky top-0 bg-slate-800 z-10">
                  <div className="col-span-3">Subject</div>
                  <div className="col-span-2 text-center">Momentum</div>
                  <div className="col-span-2 text-center text-white/90">Pass (40)</div>
                  <div className="col-span-2 text-center">For A (80)</div>
                  <div className="col-span-2 text-center">For S (90)</div>
                  <div className="col-span-1 text-center">GP</div>
                </div>

                {metrics.analysisData.map((d, i) => {
                  // Calculate Passing Requirement on the fly
                  const sub = subjects.find(s => s.id === d.id);
                  const reqPass = getRequiredESAForGrade(sub, 40, true);

                  return (
                    <div
                      key={i}
                      className={`
                        flex flex-col gap-3 p-3 rounded-xl border border-slate-700/50 bg-slate-800/40
                        md:grid md:grid-cols-12 md:gap-2 md:items-center md:py-2 md:border-b md:border-t-0 md:border-x-0 md:border-slate-700/50 md:bg-transparent md:rounded-none md:hover:bg-slate-700/30
                      `}
                    >
                      {/* Header: Name & GP */}
                      <div className="flex items-center justify-between md:contents">
                        <div className="md:col-span-3 truncate text-slate-200 font-bold md:font-medium text-sm">
                          {d.name}
                        </div>
                        <div className="md:hidden flex items-center gap-2">
                          <span className="text-[10px] uppercase text-slate-500 font-bold">Curr GP</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${d.currentGP >= 9 ? 'bg-green-500/20 text-green-400' : d.currentGP >= 8 ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-600 text-slate-300'}`}>
                            {d.currentGP}
                          </span>
                        </div>
                      </div>

                      {/* Stats Grid (2x2 on Mobile, Flat on Desktop) */}
                      <div className="grid grid-cols-2 gap-2 md:contents">

                        {/* 1. Momentum */}
                        <div className="bg-slate-900/50 md:bg-transparent p-2 md:p-0 rounded-lg flex flex-col items-center md:block md:col-span-2 md:text-center">
                          <span className="md:hidden text-[9px] text-slate-500 uppercase font-bold mb-1">Momentum</span>
                          <span className={`font-bold text-lg md:text-sm ${d.momentumScore >= 90 ? 'text-green-400' : d.momentumScore >= 80 ? 'text-blue-400' : d.momentumScore >= 40 ? 'text-slate-300' : 'text-red-400'}`}>
                            {d.momentumScore}
                          </span>
                        </div>

                        {/* 2. Pass Requirement (Fixed Logic) */}
                        <div className="bg-slate-900/50 md:bg-transparent p-2 md:p-0 rounded-lg flex flex-col items-center md:block md:col-span-2 md:text-center">
                          <span className="md:hidden text-[9px] text-slate-500 uppercase font-bold mb-1">To Pass</span>
                          {reqPass.safe === null ? (
                            <span className="text-red-500 text-xs font-bold">Impossible</span>
                          ) : reqPass.safe === 0 ? (
                            <div className="flex items-center justify-center gap-1">
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                              <span className="text-green-500 text-xs font-bold md:hidden">Passed</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <span className={`font-mono font-bold text-base md:text-sm ${reqPass.requiresRounding ? 'text-orange-300' : 'text-slate-200'}`}>
                                {reqPass.safe}
                              </span>
                              {/* Show Min Value if it differs */}
                              {reqPass.minimum !== null && reqPass.minimum < reqPass.safe && (
                                <div className="text-[9px] text-slate-500 leading-none">min: {reqPass.minimum}</div>
                              )}
                              {reqPass.requiresRounding && (
                                <div className="text-[9px] text-orange-400 leading-none">*rounding</div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* 3. Target A */}
                        <div className="bg-slate-900/50 md:bg-transparent p-2 md:p-0 rounded-lg flex flex-col items-center md:block md:col-span-2 md:text-center">
                          <span className="md:hidden text-[9px] text-slate-500 uppercase font-bold mb-1">For A (80)</span>
                          {d.reqA === null ? (
                            <span className="text-red-500 text-xs font-bold">Impossible</span>
                          ) : d.reqA === 0 ? (
                            <span className="text-green-500 text-xs font-bold">✓ Done</span>
                          ) : (
                            <div className="flex flex-col items-center">
                              <span className={`font-mono font-bold text-base md:text-sm ${d.reqARequiresRounding ? 'text-orange-300' : 'text-blue-300'}`}>{d.reqA}</span>
                              {d.reqAMin !== null && d.reqAMin < d.reqA && <div className="text-[9px] text-slate-500 leading-none">min: {d.reqAMin}</div>}
                            </div>
                          )}
                        </div>

                        {/* 4. Target S */}
                        <div className="bg-slate-900/50 md:bg-transparent p-2 md:p-0 rounded-lg flex flex-col items-center md:block md:col-span-2 md:text-center">
                          <span className="md:hidden text-[9px] text-slate-500 uppercase font-bold mb-1">For S (90)</span>
                          {d.reqS === null ? (
                            <span className="text-red-500 text-xs font-bold">Impossible</span>
                          ) : d.reqS === 0 ? (
                            <span className="text-green-500 text-xs font-bold">✓ Done</span>
                          ) : (
                            <div className="flex flex-col items-center">
                              <span className={`font-mono font-bold text-base md:text-sm ${d.reqSRequiresRounding ? 'text-orange-300' : 'text-yellow-300'}`}>{d.reqS}</span>
                              {d.reqSMin !== null && d.reqSMin < d.reqS && <div className="text-[9px] text-slate-500 leading-none">min: {d.reqSMin}</div>}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Desktop GP (Hidden on Mobile) */}
                      <div className="hidden md:block col-span-1 text-center">
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${d.currentGP >= 9 ? 'bg-green-500/20 text-green-400' : d.currentGP >= 8 ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-600 text-slate-300'}`}>
                          {d.currentGP}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer Notes */}
              <div className="mt-4 p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                <div className="flex items-start gap-2 text-xs text-slate-400">
                  <Lightbulb className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-300">Safe vs Minimum scores:</strong> The main number is the <strong>safe</strong> ESA score that guarantees the grade.
                    The "min" value (when shown) is the absolute minimum that <em>might</em> work due to rounding up, but scoring the safe value is recommended.
                  </div>
                </div>
              </div>

              {/* Momentum Disclaimer (Collapsible) */}
              <div className="mt-3 mx-1 bg-indigo-900/20 rounded-lg border border-indigo-500/20">
                <details className="group p-3">
                  <summary className="flex items-center gap-2 cursor-pointer list-none text-xs text-indigo-200 font-bold select-none">
                    <span className="text-lg leading-none">*️⃣</span>
                    <span>Momentum Disclaimer</span>
                    <ChevronDown className="w-3 h-3 ml-auto opacity-50 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="mt-2 text-xs text-indigo-200/70 leading-relaxed pl-7 border-t border-indigo-500/10 pt-2">
                    The momentum score purely assumes you maintain your current average in future exams. There is a &lt;1% chance this will be your exact final score. <strong>Don't stress over it!</strong>
                  </div>
                </details>
              </div>
            </div>

            {/* Smart Strategy Panel (Collapsible on Mobile to save space) */}
            <div className={`${darkMode ? 'bg-slate-800' : 'bg-slate-800'} rounded-xl shadow-lg p-4 md:p-6 text-white border ${darkMode ? 'border-slate-700' : 'border-slate-700'}`}>
              <h2 className="text-lg font-bold flex items-center gap-2 mb-4 text-green-400">
                <Lightbulb className="w-5 h-5" /> Path to Target ({targetSgpa} SGPA)
              </h2>

              {strategy.plan.length === 0 && !strategy.impossible && parseFloat(metrics.momentumSGPA) >= targetSgpa ? (
                <div className="bg-green-900/20 border border-green-800 rounded-lg p-4 flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0" />
                  <div>
                    <div className="font-bold text-green-300">You're on track!</div>
                    <div className="text-xs text-green-200/60">Your current momentum meets your target.</div>
                  </div>
                </div>
              ) : strategy.impossible ? (
                <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                  <div>
                    <div className="font-bold text-red-300">Target Unreachable</div>
                    <div className="text-xs text-red-200/60">Mathematically impossible given your internals.</div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-slate-400 mb-2">Most efficient upgrades:</p>
                  {strategy.plan.map((step, idx) => (
                    <div key={idx} className="bg-slate-700/50 p-3 rounded-lg border border-slate-600 flex items-start gap-3">
                      <div className="bg-slate-800 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-slate-400 flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-slate-200 flex justify-between items-center">
                          <span>{step.name}</span>
                          <span className="text-[10px] bg-indigo-900 text-indigo-200 px-1.5 py-0.5 rounded">+{step.gpGain.toFixed(1)} GP</span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1 flex items-center gap-1 flex-wrap">
                          <span className="text-white font-bold bg-slate-600 px-1.5 rounded">{step.esaNeeded}/{step.esaMax}</span>
                          <span>ESA for</span>
                          <span className={`font-bold ${step.toGrade === 'S' ? 'text-green-400' : 'text-blue-400'}`}>{step.toGrade}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== REVERSE CALCULATOR TAB ==================== */}
        {activeTab === 'reverse' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-xl shadow-lg p-4 text-white">
              <h2 className="text-lg font-bold flex items-center gap-2 mb-2">
                <Target className="w-5 h-5" /> Reverse Calculator
              </h2>

              {/* ESA Marks Detected Warning (Collapsible) */}
              {subjects.some(sub => (marks[sub.id]?.esa && parseFloat(marks[sub.id]?.esa) > 0)) && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 overflow-hidden mb-6">
                  <details className="group">
                    <summary className="flex items-center justify-between p-4 cursor-pointer list-none select-none hover:bg-amber-100/50 dark:hover:bg-amber-900/40 transition-colors">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                        <h4 className="font-bold text-sm text-amber-800 dark:text-amber-300">
                          ESA Marks Detected (Subject Locked)
                        </h4>
                      </div>
                      <ChevronDown className="w-5 h-5 text-amber-600 dark:text-amber-400 opacity-70 transition-transform group-open:rotate-180" />
                    </summary>

                    <div className="px-4 pb-4 pt-0">
                      <div className="text-xs text-amber-700 dark:text-amber-400 mt-1 space-y-2 border-t border-amber-200 dark:border-amber-800/50 pt-3">
                        <p>
                          You have entered ESA marks for some subjects. These subjects will be treated as <strong>Fixed/Locked</strong> and will NOT be reverse-calculated.
                        </p>
                        <p>
                          If you want to <strong>predict</strong> marks for a specific subject, please go back and <strong>clear its ESA score</strong>.
                        </p>
                        <button
                          onClick={() => setActiveTab('subjects')}
                          className="mt-2 text-xs bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg font-bold transition-colors"
                        >
                          Manage Subjects
                        </button>
                      </div>
                    </div>
                  </details>
                </div>
              )}

              {/* ORIGINAL TEXT: Description */}
              <p className="text-emerald-100 text-sm mb-4 leading-relaxed">
                Set your desired SGPA and see exactly what you need to score in each ESA. Lock subjects where you're confident about your score.
              </p>

              {/* Controls: Input & Buttons (Compacted layout) */}
              <div className="flex flex-col gap-3 mb-4">
                <div className="flex items-center gap-3 bg-white/20 px-3 py-2 rounded-lg w-full sm:w-auto">
                  <label className="text-sm font-semibold whitespace-nowrap">I want SGPA: </label>
                  <input
                    type="number"
                    step="0.1"
                    min="5"
                    max="10"
                    value={reverseTargetSgpa}
                    onChange={(e) => setReverseTargetSgpa(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white/20 border border-white/30 rounded-lg px-2 py-1 text-white font-bold text-center text-lg focus:outline-none focus:border-white"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setShuffledResults(calculateRandomPath())}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 text-xs font-bold"
                    title="Shuffle: Find a different combination of grades"
                  >
                    <Dice5 className="w-4 h-4" /> Shuffle
                  </button>

                  <button
                    onClick={() => setShuffledResults(calculateBalancedPath())}
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white p-2 rounded-lg transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 text-xs font-bold"
                    title="Balanced: Keeps scores even across subjects"
                  >
                    <Scale className="w-4 h-4" /> Balanced
                  </button>

                  {shuffledResults && (
                    <button
                      onClick={() => setShuffledResults(null)}
                      className="px-3 text-xs text-white/70 hover:text-white underline"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {/* ORIGINAL TEXT: Blue Help Box (Accordion for mobile) */}
              <div className="bg-blue-900/30 border-l-4 border-blue-400 rounded-r shadow-md">
                <details className="group p-3">
                  <summary className="flex items-center gap-2 cursor-pointer list-none text-sm font-bold text-blue-100 select-none">
                    <HelpCircle className="w-5 h-5 text-blue-400" />
                    <span>Why are some scores high/low?(and fix)</span>
                    <ChevronDown className="w-4 h-4 ml-auto opacity-70 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="mt-3 text-sm text-blue-100 space-y-2 border-t border-blue-400/30 pt-2">
                    <p className="opacity-80">
                      This calculator finds the <strong>absolute cheapest path</strong>.
                      It prioritizes subjects where you need fewer marks to jump a grade, even if that means pushing a score to 98 or 99.
                    </p>
                    <p className="text-yellow-300 font-bold text-xs">
                      💡 Fix: If a score is unrealistically high/low, click the <Lock className="w-3 h-3 inline" /> icon
                      to set a limit (e.g., 85 that you are confident that you will score at least that much).
                      The app will recalculate the rest!
                    </p>
                    <p className="font-medium text-white/90 text-xs">
                      Alternatively you can Click <span className="font-bold text-white">Balanced</span> for a realistic, balanced path.
                    </p>
                    <p className="font-medium text-white/90 text-xs">
                      Scores look unrealistic? Click <span className="font-bold text-white">Shuffle</span> for a different path. Click <span className="font-bold text-white">Reset</span> to go back to the most efficient way.
                    </p>
                  </div>
                </details>
              </div>

              {!reverseResults.isTargetAchievable && (
                <div className="flex items-center gap-2 bg-red-500/30 px-3 py-2 rounded-lg text-sm mt-3 border border-red-500/30">
                  <AlertCircle className="w-4 h-4" />
                  <span>Max achievable: <strong>{reverseResults.achievableSGPA}</strong></span>
                </div>
              )}
            </div>

            {/* Subject List - COMPACT ROW LAYOUT */}
            <div className="space-y-2">
              {(shuffledResults || reverseResults.results).map((sub, i) => (
                <div
                  key={i}
                  className={`relative flex items-center justify-between p-3 rounded-lg border transition-all gap-2 ${sub.isImpossible ? 'bg-red-500/10 border-red-500/30' :
                    sub.alreadyAchieved ? 'bg-green-500/10 border-green-500/30' :
                      sub.locked ? 'bg-yellow-500/10 border-yellow-500/30' :
                        `${themeClasses.card} shadow-sm`
                    }`}
                >
                  {/* Left Side: Name & Info */}
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-1.5 mb-1">
                      {sub.locked && <Lock className="w-3 h-3 text-yellow-500 flex-shrink-0" />}
                      <span className="text-sm font-bold truncate block">
                        {sub.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] opacity-70">
                      <span className={`px-1.5 rounded ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>{sub.credits} Cr</span>
                      {sub.isImpossible ? (
                        <span className="text-red-500 font-bold">Impossible</span>
                      ) : (
                        <span>Target: <strong className="opacity-100">{sub.projectedGrade}</strong></span>
                      )}
                    </div>
                  </div>

                  {/* Right Side: Score & Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
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
                              className={`w-12 p-1 text-center text-sm font-bold border rounded focus:outline-none ${sub.isHardLocked
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed border-transparent'
                                : 'bg-yellow-100 dark:bg-yellow-900/40 border-yellow-400 text-yellow-700 dark:text-yellow-300'
                                }`}
                            />
                            <span className="text-[10px] opacity-50">/{sub.esaMax}</span>
                          </div>
                          <span className="text-[9px] text-yellow-500 mt-0.5">
                            {sub.isHardLocked ? 'Set in subjects tab' : 'Manual'}
                          </span>
                        </div>
                      ) : sub.alreadyAchieved ? (
                        /* Done State */
                        <div className="flex flex-col items-end">
                          <span className="text-lg font-bold text-green-500">0</span>
                          <span className="text-[9px] text-green-500/70">Safe</span>
                        </div>
                      ) : sub.isImpossible ? (
                        <span className="text-xs font-bold text-red-500">---</span>
                      ) : (
                        /* Score Needed */
                        <div className="flex flex-col items-end">
                          <span className="text-lg font-bold">
                            {sub.requiredEsa}<span className="text-xs font-normal opacity-50">/{sub.esaMax}</span>
                          </span>
                          <span className="text-[9px] opacity-50">Needed</span>
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
                      className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-all ${sub.isHardLocked ? 'opacity-20 cursor-not-allowed border-transparent' :
                        sub.locked
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700 text-yellow-600 dark:text-yellow-400'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-blue-500 hover:border-blue-300'
                        }`}
                    >
                      {sub.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* ORIGINAL TEXT: Bottom Info */}
            <div className="mt-6 p-4 bg-white/10 dark:bg-slate-800/50 rounded-lg border dark:border-slate-700">
              <div className="flex items-start gap-2 text-sm">
                <Lightbulb className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p>
                    <strong>How to use:</strong> Lock subjects where you're confident about your ESA score.
                    The calculator will then adjust the requirements for other subjects to compensate.
                  </p>
                  <p className="opacity-60 text-xs italic border-t border-slate-200 dark:border-slate-700 pt-2">
                    <strong>Note:</strong> There are many combinations of grades that can achieve your target.
                    This result is just the most efficient path (requiring the least amount of total marks).
                  </p>
                </div>
              </div>
            </div>

            {/* ORIGINAL TEXT: Momentum Warning */}
            {reverseResults.usingMomentum && (
              <div className="mt-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3 flex items-start gap-3">
                <Zap className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <strong className="text-yellow-600 dark:text-yellow-200">Using Momentum Scores</strong>
                  <p className="text-yellow-700 dark:text-yellow-100/70 text-xs mt-1 leading-relaxed">
                    Some internals (like Lab/ISA2/Assignment) are empty. We are projecting these based on your current performance trend so the calculator doesn't panic. And also the max achievable SGPA might be higher than reality (since empty internals are optimistically filled).
                  </p>
                </div>
              </div>
            )}

            {/* Minimum Passing Table (Restored & Scrollable for Mobile) */}
            <div className={`${themeClasses.card} rounded-xl shadow-lg p-6 border mt-8`}>
              <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                <Calculator className="w-5 h-5 text-blue-500" /> Minimum ESA Scores Needed
              </h2>
              <p className={`${themeClasses.muted} text-sm mb-4`}>
                Quick reference: minimum ESA marks required for each grade in each subject.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className={`border-b ${themeClasses.border}`}>
                      <th className="text-left py-3 px-2 font-bold whitespace-nowrap">Subject</th>
                      <th className="text-center py-3 px-2 font-bold text-red-400">E (40)</th>
                      <th className="text-center py-3 px-2 font-bold text-orange-400">D (50)</th>
                      <th className="text-center py-3 px-2 font-bold text-yellow-500">C (60)</th>
                      <th className="text-center py-3 px-2 font-bold text-indigo-400">B (70)</th>
                      <th className="text-center py-3 px-2 font-bold text-blue-400">A (80)</th>
                      <th className="text-center py-3 px-2 font-bold text-green-400">S (90)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {minimumPassingTable.map(sub => (
                      <tr key={sub.id} className={`border-b ${themeClasses.border} hover:${darkMode ? 'bg-slate-700/50' : 'bg-slate-50'}`}>

                        {/* CHANGED: Increased max-w to 150px for better readability on mobile */}
                        <td className="py-3 px-2 font-medium max-w-[150px] sm:max-w-none">
                          <div className="truncate font-bold text-slate-700 dark:text-slate-200" title={sub.name}>
                            {sub.name}
                          </div>
                          <div className={`text-[10px] ${themeClasses.muted}`}>{sub.credits} Cr • Max: {sub.esaMax}</div>
                        </td>

                        {['E', 'D', 'C', 'B', 'A', 'S'].map(grade => {
                          const req = sub.gradeRequirements.find(g => g.grade === grade);
                          return (
                            <td key={grade} className="text-center py-3 px-2">
                              {!req?.possible ? (
                                <span className="text-red-500 text-xs font-bold">✗</span>
                              ) : req.alreadyAchieved ? (
                                <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                              ) : (
                                <div>
                                  <span className={`font-mono font-bold ${req.requiresRounding ? 'text-orange-600 dark:text-orange-400' :
                                    req.easy ? 'text-green-600 dark:text-green-400' :
                                      req.moderate ? 'text-blue-600 dark:text-blue-400' :
                                        'text-orange-600 dark:text-orange-400'
                                    }`}>
                                    {req.requiredEsa}
                                    {req.requiresRounding && '*'}
                                  </span>
                                  {req.minimumEsa !== null && req.minimumEsa < req.requiredEsa && (
                                    <div className={`text-[9px] ${themeClasses.muted}`}>
                                      ({req.minimumEsa})
                                    </div>
                                  )}
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

              <div className={`flex flex-wrap gap-4 mt-4 text-xs ${themeClasses.muted} pt-4 border-t ${themeClasses.border}`}>
                <span><span className="text-green-600 dark:text-green-400 font-bold">✓</span> Already achieved</span>
                <span><span className="text-green-600 dark:text-green-400">Green</span> Easy (≤50)</span>
                <span><span className="text-blue-600 dark:text-blue-400">Blue</span> Moderate (51-75)</span>
                <span><span className="text-orange-600 dark:text-orange-400">Orange</span> Hard (&gt;75)</span>
                <span><span className="text-red-500 font-bold">✗</span> Not possible</span>
                <span><span className={themeClasses.muted}>(xx)</span> Best case (with rounding)</span>
                <span><span className="text-orange-600 dark:text-orange-400">*</span> Requires rounding luck</span>
              </div>
            </div>
          </div>
        )}

        {/* ==================== CGPA TAB ==================== */}
        {activeTab === 'cgpa' && (
          <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">

            {/* Header & Result Card */}
            <div className={`${themeClasses.card} p-6 rounded-2xl shadow-lg border ${themeClasses.border} text-center relative overflow-hidden`}>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 via-blue-500 to-purple-500"></div>

              <h2 className={`text-sm font-bold uppercase tracking-wider ${themeClasses.muted} mb-2`}>Cumulative GPA</h2>

              <div className="flex items-center justify-center gap-1">
                <span className="text-5xl md:text-6xl font-black text-teal-600 dark:text-teal-400">
                  {(() => {
                    const filledSems = semesterData.filter(s => s.sgpa && s.credits);
                    if (filledSems.length === 0) return "0.00";

                    const totalPoints = filledSems.reduce((sum, s) => sum + (parseFloat(s.sgpa) * parseFloat(s.credits)), 0);
                    const totalCredits = filledSems.reduce((sum, s) => sum + parseFloat(s.credits), 0);

                    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";
                  })()}
                </span>
              </div>

              <p className={`text-xs ${themeClasses.muted} mt-2`}>
                Based on {semesterData.filter(s => s.sgpa && s.credits).length} semesters of data
              </p>
            </div>

            {/* Helper Info */}
            <div className="flex items-center gap-2 text-xs opacity-70 px-2">
              <Info className="w-4 h-4" />
              <span>Enter SGPA and Credits for completed semesters. Leave future ones blank.</span>
            </div>

            {/* Semesters Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {semesterData.map((sem) => (
                <div
                  key={sem.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${(sem.sgpa && sem.credits)
                    ? `${themeClasses.card} border-teal-500/30 shadow-sm`
                    : 'bg-slate-50 dark:bg-slate-800/50 border-transparent opacity-75 hover:opacity-100'
                    }`}
                >
                  {/* Semester Label */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm ${(sem.sgpa && sem.credits)
                    ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                    }`}>
                    S{sem.id}
                  </div>

                  {/* Inputs */}
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold opacity-50 mb-1 ml-1">SGPA</label>
                      <input
                        type="number"
                        value={sem.sgpa}
                        onChange={(e) => updateSemester(sem.id, 'sgpa', e.target.value)}
                        placeholder="-"
                        className={`w-full p-2 text-sm font-bold text-center border rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none ${themeClasses.input}`}
                        min="0" max="10" step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold opacity-50 mb-1 ml-1">Credits</label>
                      <input
                        type="number"
                        value={sem.credits}
                        onChange={(e) => updateSemester(sem.id, 'credits', e.target.value)}
                        placeholder="-"
                        className={`w-full p-2 text-sm text-center border rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none ${themeClasses.input}`}
                        min="0" max="30"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex justify-end pt-4">
              <button
                onClick={resetCGPA}
                className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Clear History
              </button>
            </div>

            {/* Disclaimer */}
            <div className="text-center text-[10px] opacity-40 mt-8">
              Calculated using: Σ (SGPA × Credits) / Σ Credits
            </div>

            {/* ==================== QUICK PREVIOUS CGPA CALCULATOR (Fully Manual) ==================== */}
            <div className={`${themeClasses.card} border rounded-xl overflow-hidden mt-6`}>
              <details className="group">
                <summary className="flex items-center justify-between p-4 cursor-pointer list-none select-none hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shadow-sm">
                      <span className="text-lg">⚡</span>
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-slate-700 dark:text-slate-200">Quick CGPA Estimator</h3>
                        <span className={`text-[10px] ${themeClasses.muted} font-normal px-1.5 rounded bg-slate-100 dark:bg-slate-800 border`}>Isolated</span>
                      </div>
                      <p className={`text-xs ${themeClasses.muted} mt-0.5`}>
                        Calculate new CGPA by combining previous history + current sem results
                      </p>
                    </div>
                  </div>
                  <ChevronDown className="w-5 h-5 opacity-50 transition-transform group-open:rotate-180" />
                </summary>

                <div className={`p-4 border-t ${themeClasses.border} bg-slate-50/50 dark:bg-slate-900/20`}>

                  {/* Row 1: Previous Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className={`text-xs ${themeClasses.muted} block mb-1 font-bold`}>Previous CGPA</label>
                      <input
                        type="number"
                        placeholder="e.g. 8.5"
                        value={simpleCgpa.prevCgpa}
                        onChange={(e) => setSimpleCgpa(prev => ({ ...prev, prevCgpa: e.target.value }))}
                        className={`w-full p-2 border rounded-lg text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none ${themeClasses.input}`}
                      />
                    </div>
                    <div>
                      <label className={`text-xs ${themeClasses.muted} block mb-1 font-bold`}>Prev Credits</label>
                      <input
                        type="number"
                        placeholder="e.g. 80"
                        value={simpleCgpa.prevCredits}
                        onChange={(e) => setSimpleCgpa(prev => ({ ...prev, prevCredits: e.target.value }))}
                        className={`w-full p-2 border rounded-lg text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none ${themeClasses.input}`}
                      />
                    </div>
                  </div>

                  {/* Row 2: Current Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className={`text-xs ${themeClasses.muted} block mb-1 font-bold text-teal-600 dark:text-teal-400`}>Current Sem SGPA</label>
                      <input
                        type="number"
                        placeholder="e.g. 9.2"
                        value={simpleCgpa.currSgpa}
                        onChange={(e) => setSimpleCgpa(prev => ({ ...prev, currSgpa: e.target.value }))}
                        className={`w-full p-2 border rounded-lg text-sm font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none ${themeClasses.input} border-teal-200 dark:border-teal-900/50 bg-teal-50/30 dark:bg-teal-900/10`}
                      />
                    </div>
                    <div>
                      <label className={`text-xs ${themeClasses.muted} block mb-1 font-bold text-teal-600 dark:text-teal-400`}>Sem Credits</label>
                      <input
                        type="number"
                        placeholder="e.g. 24"
                        value={simpleCgpa.currCredits}
                        onChange={(e) => setSimpleCgpa(prev => ({ ...prev, currCredits: e.target.value }))}
                        className={`w-full p-2 border rounded-lg text-sm font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none ${themeClasses.input} border-teal-200 dark:border-teal-900/50 bg-teal-50/30 dark:bg-teal-900/10`}
                      />
                    </div>
                  </div>

                  {/* Calculation Result */}
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border shadow-sm flex items-center justify-between">
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
                          <div className="text-xs opacity-70">
                            <div>Total Credits: <strong>{pCreds + cCreds}</strong></div>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] uppercase font-bold opacity-50">Predicted CGPA</div>
                            <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{newCGPA}</div>
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
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
                  <BookOpen className="w-6 h-6 text-yellow-300" /> User Guide & Pro Features
                </h2>
                <p className="text-violet-100 opacity-90 max-w-2xl">
                  Everything you need to know: from keyboard shortcuts to the "Momentum" logic.
                </p>
              </div>
              <HelpCircle className="absolute right-[-20px] bottom-[-40px] w-40 h-40 text-white opacity-10 rotate-12" />
            </div>

            {/* 1. POWER USER FEATURES (Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Feature A: Local Storage */}
              <div className={`${themeClasses.card} border rounded-xl p-4 shadow-sm`}>
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 mb-3">
                  <Download className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm mb-1">Auto-Save & Privacy</h3>
                <p className={`text-xs ${themeClasses.muted}`}>
                  Your data is <strong>saved locally</strong> in your browser. Close the tab, restart your laptop—your marks will still be here. No login required. This data is not collected or sent anywhere.
                </p>
              </div>

              {/* Feature B: Presets */}
              <div className={`${themeClasses.card} border rounded-xl p-4 shadow-sm`}>
                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 mb-3">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm mb-1">One-Click Presets</h3>
                <p className={`text-xs ${themeClasses.muted}`}>
                  Don't type subjects manually! In the <strong>Subjects Tab</strong>, use the dropdown at the top to instantly load the "Physics Cycle" or "Chemistry Cycle".
                </p>
              </div>

              {/* Feature C: Shortcuts */}
              <div className={`${themeClasses.card} border rounded-xl p-4 shadow-sm`}>
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 mb-3 font-mono text-xs font-bold">
                  CTRL
                </div>
                <h3 className="font-bold text-sm mb-1">Keyboard Shortcuts</h3>
                <div className={`text-xs ${themeClasses.muted} space-y-1`}>
                  <div className="flex justify-between"><span>Undo</span> <kbd className="font-mono bg-slate-200 dark:bg-slate-800 px-1 rounded">Ctrl+Z</kbd></div>
                  <div className="flex justify-between"><span>Redo</span> <kbd className="font-mono bg-slate-200 dark:bg-slate-800 px-1 rounded">Ctrl+Y</kbd></div>
                  <div className="flex justify-between"><span>Export</span> <kbd className="font-mono bg-slate-200 dark:bg-slate-800 px-1 rounded">Ctrl+S</kbd></div>
                  <div className="flex justify-between"><span>Close</span> <kbd className="font-mono bg-slate-200 dark:bg-slate-800 px-1 rounded">Esc</kbd></div>
                </div>
              </div>
            </div>

            {/* 2. THE MOMENTUM LOGIC */}
            <div className={`${themeClasses.card} border rounded-xl overflow-hidden`}>
              <div className="p-4 border-b bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <h3 className="font-bold text-lg">How "Momentum" Works</h3>
              </div>
              <div className="p-5">
                <p className={`text-sm ${themeClasses.muted} mb-3`}>
                  Usually, if you leave a field blank (like ISA 2), calculators treat it as a <strong>0</strong>. This crashes your predicted SGPA.
                </p>
                <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800/30">
                  <strong className="text-sm text-yellow-800 dark:text-yellow-200 block mb-2">The Solution: Smart Projection</strong>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300/80 leading-relaxed">
                    If you have marks for ISA 1 but <strong>not</strong> ISA 2, we assume you will perform <em>similarly</em> in ISA 2.
                    This "Momentum Score" is used to give you realistic predictions before you've even written the exam.
                  </p>
                  <p className="text-[10px] mt-2 text-yellow-600 dark:text-yellow-400 font-mono">
                    *Look for the "Using Momentum" warning in the Reverse tab if you have empty fields.
                  </p>
                </div>
              </div>
            </div>

            {/* 3. THE HIDDEN GEM: Reverse Calculator */}
            <div className="bg-gradient-to-br from-emerald-900/10 to-teal-900/10 border border-emerald-500/30 rounded-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Target className="w-24 h-24 text-emerald-500" />
              </div>
              <div className="p-4 border-b border-emerald-500/20 bg-emerald-500/10 flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-lg text-emerald-800 dark:text-emerald-300">The Hidden Gem: Reverse Calculator</h3>
              </div>
              <div className="p-5">
                <p className="text-sm font-medium mb-4 text-emerald-800 dark:text-emerald-200">
                  You set the SGPA (e.g., 9.0), we tell you exactly what marks you need.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* The 3 Buttons Explained */}
                  <div>
                    <h4 className="font-bold text-sm text-emerald-700 dark:text-emerald-400 mb-2">The 3 Magic Buttons</h4>
                    <ul className="space-y-3">
                      <li className="flex gap-3 items-start">
                        <div className="bg-white dark:bg-slate-800 p-1.5 rounded shadow-sm flex-shrink-0">
                          <Target className="w-4 h-4 text-blue-500" />
                        </div>
                        <div>
                          <strong className="text-xs block text-slate-700 dark:text-slate-200">Default (Efficient)</strong>
                          <p className={`text-[10px] ${themeClasses.muted}`}>
                            The "Lazy" path. It finds the <strong>absolute cheapest way</strong> to hit your target, even if it means getting 99 in one subject and 40 in another.
                          </p>
                        </div>
                      </li>
                      <li className="flex gap-3 items-start">
                        <div className="bg-white dark:bg-slate-800 p-1.5 rounded shadow-sm flex-shrink-0">
                          <Dice5 className="w-4 h-4 text-purple-500" />
                        </div>
                        <div>
                          <strong className="text-xs block text-slate-700 dark:text-slate-200">Shuffle</strong>
                          <p className={`text-[10px] ${themeClasses.muted}`}>
                            Don't like the plan? Click Shuffle to get a <strong>random valid combination</strong>. It's like re-rolling the dice on your semester.
                          </p>
                        </div>
                      </li>
                      <li className="flex gap-3 items-start">
                        <div className="bg-white dark:bg-slate-800 p-1.5 rounded shadow-sm flex-shrink-0">
                          <Scale className="w-4 h-4 text-teal-500" />
                        </div>
                        <div>
                          <strong className="text-xs block text-slate-700 dark:text-slate-200">Balanced</strong>
                          <p className={`text-[10px] ${themeClasses.muted}`}>
                            The "Smart" path. It penalizes extremely high scores, trying to keep effort <strong>spread evenly</strong> across all subjects.
                          </p>
                        </div>
                      </li>
                    </ul>
                  </div>

                  {/* Locking & Logic */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-bold text-sm text-emerald-700 dark:text-emerald-400 mb-2">Locking Scores</h4>
                      <p className={`text-xs ${themeClasses.muted} mb-2`}>
                        Confident you'll get exactly 85 in Math?
                      </p>
                      <div className="bg-white/50 dark:bg-black/20 p-2 rounded border border-emerald-500/20 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-yellow-500" />
                        <span className="text-xs">Click the <strong>Lock Icon</strong>. Enter the score you are confident you will at least get. The app freezes that score and recalculates the rest of the subjects around it.</span>
                      </div>
                    </div>
                    <div className="text-[10px] opacity-70 italic">
                      *Tip: If a target is "Impossible", check if you have entered marks correctly or if you need to lower the target SGPA.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. THE BASICS: Subjects Tab (Detailed) */}
            <div className={`${themeClasses.card} border rounded-xl overflow-hidden`}>
              <div className="p-4 border-b bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-500" />
                <h3 className="font-bold text-lg">The Basics: Subjects Tab</h3>
              </div>
              <div className="p-5">
                <p className={`text-sm ${themeClasses.muted} mb-4`}>
                  The control center of the app. This is where you enter marks, but there are hidden settings inside every subject card.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg border dark:border-slate-700">
                    <strong className="text-blue-600 dark:text-blue-400 text-sm mb-2 block">1. Configuration & Weights</strong>
                    <p className={`text-xs ${themeClasses.muted} leading-relaxed`}>
                      Expand any subject and click <strong>"Edit Subject Details"</strong>.
                      <br />• <strong>Weights:</strong> Default is 50/50, but you can change it to anything (e.g. 40/60).
                      <br />• <strong>Credits:</strong> Change the credit value (e.g. 2 Cr for Labs) to ensure accurate SGPA calculation.
                    </p>
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg border dark:border-slate-700">
                    <strong className="text-blue-600 dark:text-blue-400 text-sm mb-2 block">2. Advanced: Custom Cutoffs</strong>
                    <p className={`text-xs ${themeClasses.muted} leading-relaxed`}>
                      Found inside the "Edit" menu.
                      <br />If a subject is notoriously hard and the college lowers the S-Grade cutoff to 85, you can enter that here. The <strong>entire app</strong> (Analysis, Reverse Calc) will respect this new rule!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. THE ANALYST: Analysis Tab (Detailed) */}
            <div className={`${themeClasses.card} border rounded-xl overflow-hidden`}>
              <div className="p-4 border-b bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700 flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-500" />
                <h3 className="font-bold text-lg">The Analyst: Analysis Tab</h3>
              </div>
              <div className="p-5">
                <p className={`text-sm ${themeClasses.muted} mb-4`}>
                  This tab gives you a reality check on your standing and shows the best path forward.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 border rounded-lg dark:border-slate-700">
                    <strong className="block text-sm mb-1">Safe vs Minimum</strong>
                    <p className={`${themeClasses.muted}`}>
                      • <strong>Safe Score:</strong> The marks you need to in ESA based on your current ISA marks(and momentum is some fields are empty) to <em>guarantee</em> the grade(A/S) (e.g. 90).
                      <br />• <strong>Min Score:</strong> A lower score (e.g. 89.5) that <em>might</em> work because the college rounds up decimals.
                      <br />• <strong>Momentum Score:</strong> Shows your momentum score in ESA based on ISA if applicable.
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg dark:border-slate-700">
                    <strong className="block text-sm mb-1">Achievable Range</strong>
                    <p className={`${themeClasses.muted}`}>
                      The slider at the top shows your mathematically <strong>Best Case SGPA</strong> (if you ace everything) and <strong>Worst Case SGPA</strong> (if you fail everything).
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg dark:border-slate-700 bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800/30">
                    <strong className="block text-sm mb-1 text-purple-700 dark:text-purple-300 flex items-center gap-1">
                      <Lightbulb className="w-3 h-3" /> Path to Target
                    </strong>
                    <p className={`${themeClasses.muted} leading-relaxed`}>
                      A smart algorithm that generates a <strong>step-by-step plan</strong>. It identifies exactly which subjects are the easiest to upgrade (e.g., "Score 45 in Chem to get A") to hit your target SGPA with the least effort.
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg dark:border-slate-700">
                    <strong className="block text-sm mb-1">GP Budget</strong>
                    <p className={`${themeClasses.muted}`}>
                      Shows exactly how many Grade Points you can afford to "lose" while still hitting your target.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 6. STRATEGY & FUTURE: CGPA (Detailed) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Quick SGPA Estimator (Static) */}
              <div className={`${themeClasses.card} border rounded-xl p-4`}>
                <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200 mb-3">
                  <span className="bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-300 w-8 h-8 rounded-full flex items-center justify-center text-lg">✨</span>
                  <span>Quick SGPA Estimator</span>
                </div>
                <div className={`text-sm ${themeClasses.muted} leading-relaxed pl-1`}>
                  <p>
                    Want to check your SGPA without entering specific marks?
                  </p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Located at the bottom of the <strong>Subjects Tab</strong>.</li>
                    <li>Select hypothetical grades (S, A, B...) for each subject directly.</li>
                    <li>Instantly see what your SGPA would be if you scored those grades.</li>
                    <li>This is a "sandbox" mode—it does not affect your actual mark data.</li>
                  </ul>
                </div>
              </div>

              {/* UPDATED: CGPA Guide (Static) */}
              <div className={`${themeClasses.card} border rounded-xl p-4`}>
                <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200 mb-3">
                  <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 w-8 h-8 rounded-full flex items-center justify-center text-lg">🎓</span>
                  <span>Cumulative GPA (CGPA)</span>
                </div>
                <div className={`text-sm ${themeClasses.muted} leading-relaxed pl-1`}>
                  <p>
                    Track your performance across your entire degree.
                  </p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Enter the <strong>SGPA</strong> and <strong>Total Credits</strong> for every semester you have completed.</li>
                    <li>The calculator uses the weighted average formula (Σ SGPA×Credits / Σ Credits) for 100% accuracy.</li>
                    <li>You can clear the history at any time using the "Clear History" button.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* UPDATED: Attendance Guide (Static) */}
            <div className={`${themeClasses.card} border rounded-xl p-4`}>
              <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200 mb-3">
                <span className="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 w-8 h-8 rounded-full flex items-center justify-center text-lg">📅</span>
                <span>How does the Attendance Calculator work?</span>
              </div>
              <div className={`text-sm ${themeClasses.muted} leading-relaxed pl-1`}>
                <p>
                  The attendance tool helps you maintain the mandatory <strong>75% attendance</strong>.
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>Safe Zone:</strong> If your attendance is above 75%, it calculates exactly how many future classes you can "bunk" (skip) while staying safe.</li>
                  <li><strong>Danger Zone:</strong> If you drop below 75%, it tells you how many classes you must attend <em>consecutively</em> to get back on track.</li>
                </ul>
                <p className="mt-2 text-xs italic opacity-70">
                  Note: Attendance data is for quick checking and is not saved when you refresh.
                </p>
              </div>
            </div>

            {/* UPDATED: Universal Mode Guide (Static) */}
            <div className={`${themeClasses.card} border rounded-xl p-4`}>
              <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200 mb-3">
                <span className="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 w-8 h-8 rounded-full flex items-center justify-center text-lg">🎓</span>
                <span>I'm not from PES / Custom Curriculum</span>
              </div>
              <div className={`text-sm ${themeClasses.muted} leading-relaxed pl-1`}>
                <p>
                  You can use this calculator for <strong>VTU, IIT, Manipal, or any other college</strong>.
                </p>
                <ol className="list-decimal pl-5 mt-2 space-y-1">
                  <li>Go to the <strong>Subjects Tab</strong>.</li>
                  <li>Click the button <strong>"Not from PES? 🎓"</strong>.</li>
                  <li><strong>Define Components:</strong> Add your own exams (e.g., "Midterm 1", "Quiz", "Finals") and set their weights.</li>
                  <li><strong>Set Grading:</strong> Choose a preset (like VTU 10-point, US 4.0 GPA) or define your own grade cutoffs (e.g., A = 85+).</li>
                  <li>Click <strong>Create Subject</strong>.</li>
                </ol>
                <p className="mt-2">
                  Your custom grading scheme will be saved for that subject and used in all calculations (SGPA, Reverse, Analysis).
                </p>
              </div>
            </div>

            {/* Footer Note */}
            <div className="text-center text-xs opacity-50 py-4">
              Built for PESU.
            </div>
          </div>
        )}

        {/* Footer */}
        <div className={`text-center ${themeClasses.muted} text-xs mt-8 pb-4`}>
          <p>Data is auto-saved locally in your browser. </p>
          <p className="mt-1 opacity-50">PES SGPA Calculator v3.0 © 2026</p>
          <p className="mt-2 text-[10px] opacity-30">
            Keyboard Shortcuts: Ctrl+Z (Undo) • Ctrl+Y (Redo) • Ctrl+S (Export) • Esc (Close)
          </p>
        </div>

      </div>

      {/* Mobile Bottom Navigation */}
      <div className={`fixed bottom-0 left-0 right-0 ${darkMode ? 'bg-slate-900/90 border-slate-700' : 'bg-white/90 border-slate-200'} backdrop-blur-md border-t md:hidden z-20 pb-5 pt-2`}>
        <div className="flex justify-around items-end">
          {[
            { id: 'subjects', label: 'Subjects', icon: BookOpen },
            { id: 'analysis', label: 'Analysis', icon: Activity, highlight: true }, // Added highlight
            { id: 'reverse', label: 'Reverse', icon: Target, highlight: true },     // Added highlight
            { id: 'cgpa', label: 'CGPA', icon: Calculator },
            { id: 'guide', label: 'Guide', icon: HelpCircle },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center py-2 px-3 transition-colors ${activeTab === tab.id
                ? 'text-blue-600'
                : tab.highlight
                  ? (tab.id === 'analysis' ? 'text-blue-600/70 dark:text-blue-400/70' : 'text-teal-600/70 dark:text-teal-400/70')
                  : themeClasses.muted
                }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-[10px] mt-1 font-medium">{tab.label}</span>

              {/* Mobile Dot */}
              {tab.highlight && activeTab !== tab.id && (
                <span className={`absolute top-2 right-3 h-1.5 w-1.5 rounded-full ${tab.id === 'analysis' ? 'bg-blue-500' : 'bg-teal-500'}`}></span>
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