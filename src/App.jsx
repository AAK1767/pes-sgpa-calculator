import React, { useState, useEffect, useMemo } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { 
  Trash2, Plus, Settings, ChevronDown, ChevronUp, 
  RotateCcw, GraduationCap, Target, 
  Eraser, TrendingUp, Activity, Calculator,
  Lightbulb, ArrowRight, CheckCircle2, AlertCircle,
  Download, Upload, Lock, Unlock, AlertTriangle,
  BookOpen, Award, Zap, BarChart3, Moon, Sun,
  Undo2, Redo2, HelpCircle
} from 'lucide-react';

// --- Default Data for Reset ---
const ChemistryCycleDefaults = [
  { id:  1, name:  "Mathematics - I/II", credits: 4, hasLab: false, hasAssignment: true, isaWeight: 20, assignmentWeight: 10, labWeight: 0, esaWeight: 50, isa1Max: 40, isa2Max: 40, esaMax: 100 },
  { id: 2, name: "Engineering Chemistry", credits: 5, hasLab:  true, hasAssignment: true, isaWeight: 20, assignmentWeight:  10, labWeight: 20, esaWeight:  50, isa1Max: 40, isa2Max: 40, esaMax: 100 },
  { id: 3, name: "Python for Computational Problem Solving/Problem Solving with C", credits: 5, hasLab:  true, hasAssignment: true, isaWeight: 20, assignmentWeight: 10, labWeight: 20, esaWeight: 50, isa1Max: 40, isa2Max: 40, esaMax: 100 },
  { id: 4, name: "Engineering Mechanics", credits: 4, hasLab:  false, hasAssignment:  true, isaWeight:  20, assignmentWeight: 10, labWeight: 0, esaWeight:  50, isa1Max: 40, isa2Max: 40, esaMax: 100 },
  { id: 5, name: "Electronic Principles", credits: 4, hasLab:  false, hasAssignment: true, isaWeight: 20, assignmentWeight: 10, labWeight: 0, esaWeight: 50, isa1Max: 40, isa2Max: 40, esaMax: 100 },
  { id: 6, name: "Constitution of India", credits: 2, hasLab:  false, hasAssignment:  false, isaWeight: 25, assignmentWeight:  0, labWeight: 0, esaWeight: 50, isa1Max: 30, isa2Max: 30, esaMax: 50 },
];

const PhysicsCycleDefaults = [
  { id: 1, name: "Mathematics - I/II", credits: 4, hasLab:  false, hasAssignment: true, isaWeight: 20, assignmentWeight: 10, labWeight: 0, esaWeight: 50, isa1Max: 40, isa2Max: 40, esaMax: 100 },
  { id: 2, name: "Engineering Physics", credits: 5, hasLab:  true, hasAssignment: true, isaWeight: 20, assignmentWeight: 10, labWeight: 20, esaWeight: 50, isa1Max: 40, isa2Max: 40, esaMax: 100 },
  { id: 3, name: "Elements of Electrical Engineering", credits: 4, hasLab: false, hasAssignment: false, isaWeight: 20, assignmentWeight: 10, labWeight:  0, esaWeight: 50, isa1Max:  40, isa2Max: 40, esaMax:  100 },
  { id: 4, name: "Mechanical Engineering Sciences", credits: 4, hasLab:  false, hasAssignment: true, isaWeight: 20, assignmentWeight: 10, labWeight: 0, esaWeight: 50, isa1Max: 40, isa2Max: 40, esaMax: 100 },
  { id: 5, name: "Python for Computational Problem Solving/Problem Solving with C", credits: 5, hasLab:  true, hasAssignment: true, isaWeight: 20, assignmentWeight: 10, labWeight: 20, esaWeight: 50, isa1Max: 40, isa2Max: 40, esaMax: 100 },
  { id: 6, name: "Environmental Studies", credits: 2, hasLab:  false, hasAssignment: false, isaWeight: 25, assignmentWeight: 0, labWeight: 0, esaWeight: 50, isa1Max: 30, isa2Max:  30, esaMax: 50 },
];

const SemesterPresets = {
  "Chemistry Cycle": ChemistryCycleDefaults,
  "Physics Cycle": PhysicsCycleDefaults,
};

const GradeMap = [
  { grade:  'S', min: 90, gp: 10, color: 'text-green-500', bg: 'bg-green-500' },
  { grade: 'A', min: 80, gp: 9, color: 'text-blue-500', bg: 'bg-blue-500' },
  { grade: 'B', min: 70, gp: 8, color: 'text-indigo-500', bg: 'bg-indigo-500' },
  { grade: 'C', min: 60, gp: 7, color: 'text-yellow-500', bg:  'bg-yellow-500' },
  { grade: 'D', min:  50, gp: 6, color: 'text-orange-500', bg:  'bg-orange-500' },
  { grade: 'E', min: 40, gp: 5, color: 'text-red-400', bg: 'bg-red-400' },
  { grade: 'F', min: 0, gp: 0, color: 'text-red-600', bg: 'bg-red-600' },
];

export default function PES_Universal_Calculator() {
  // --- Theme State ---
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('pes_theme');
    return saved ?  saved === 'dark' : false;
  });

  // --- Core State ---
  const [subjects, setSubjects] = useState(() => {
    const saved = localStorage.getItem('pes_subjects');
    return saved ? JSON.parse(saved) : ChemistryCycleDefaults;
  });
  
  const [marks, setMarks] = useState(() => {
    const saved = localStorage.getItem('pes_marks');
    return saved ?  JSON.parse(saved) : {};
  });

  const [prevCgpaDetails, setPrevCgpaDetails] = useState(() => {
    const saved = localStorage.getItem('pes_cgpa_details');
    return saved ? JSON.parse(saved) : { sgpa: '', credits: '' };
  });

  // --- UI State ---
  const [sgpa, setSgpa] = useState(0);
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [targetSgpa, setTargetSgpa] = useState(9.0);
  const [activeTab, setActiveTab] = useState('subjects');
  const [reverseTargetSgpa, setReverseTargetSgpa] = useState(8.5);
  const [lockedSubjects, setLockedSubjects] = useState({});
  const [showHelp, setShowHelp] = useState(false);

  // --- Undo/Redo State ---
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  // --- Persistence Effects ---
  useEffect(() => {
    localStorage.setItem('pes_subjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage. setItem('pes_marks', JSON. stringify(marks));
  }, [marks]);

  useEffect(() => {
    localStorage.setItem('pes_cgpa_details', JSON.stringify(prevCgpaDetails));
  }, [prevCgpaDetails]);

  useEffect(() => {
    localStorage.setItem('pes_theme', darkMode ? 'dark' : 'light');
    if (darkMode) {
      document. documentElement.classList.add('dark');
    } else {
      document.documentElement. classList.remove('dark');
    }
  }, [darkMode]);

  // --- Undo/Redo Functions ---
  const saveStateForUndo = () => {
    setUndoStack(prev => [...prev. slice(-20), { marks:  JSON.parse(JSON.stringify(marks)), subjects: JSON.parse(JSON.stringify(subjects)) }]);
    setRedoStack([]);
  };

  const undo = () => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setRedoStack(r => [... r, { marks: JSON.parse(JSON. stringify(marks)), subjects: JSON.parse(JSON.stringify(subjects)) }]);
    setMarks(prev. marks);
    setSubjects(prev. subjects);
    setUndoStack(u => u.slice(0, -1));
  };

  const redo = () => {
    if (redoStack. length === 0) return;
    const next = redoStack[redoStack. length - 1];
    setUndoStack(u => [...u, { marks: JSON.parse(JSON.stringify(marks)), subjects: JSON.parse(JSON. stringify(subjects)) }]);
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
            e. preventDefault();
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
      if (! newMarks[sub.id]) {
        newMarks[sub.id] = {
          isa1: '', isa1Max: sub.isa1Max || 40,
          isa2: '', isa2Max: sub. isa2Max || 40,
          assignment: '', assignmentMax: 10,
          lab: '', labMax:  20,
          esa: '', esaMax: sub.esaMax || 100
        };
        changed = true;
      }
    });
    if (changed) setMarks(newMarks);
  }, [subjects. length]);

  const handleMarkChange = (id, field, value) => {
    // Input validation
    let numValue = parseFloat(value);
    
    if (value === '') {
      setMarks(prev => ({
        ...prev,
        [id]:  { ...prev[id], [field]: '' }
      }));
      return;
    }
    
    if (isNaN(numValue)) return;
    
    if (numValue < 0) numValue = 0;
    
    // Cap at max for score fields
    if (! field. includes('Max')) {
      const maxField = field + 'Max';
      const max = marks[id]?.[maxField] || 100;
      if (numValue > max) numValue = max;
    }
    
    setMarks(prev => ({
      ...prev,
      [id]:  { ...prev[id], [field]: numValue }
    }));
  };

  const handleSubjectChange = (id, field, value) => {
    saveStateForUndo();
    setSubjects(prev => prev.map(sub => sub.id === id ?  { ...sub, [field]: value } :  sub));
  };

  const toggleLab = (id) => {
    saveStateForUndo();
    setSubjects(prev => prev.map(sub => {
      if (sub.id === id) {
        const newHasLab = ! sub.hasLab;
        let newLabWeight = newHasLab ?  20 : 0;
        return { ...sub, hasLab: newHasLab, labWeight: newLabWeight };
      }
      return sub;
    }));
  };
  
  const toggleAssignment = (id) => {
    saveStateForUndo();
    setSubjects(prev => prev. map(sub => {
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
      hasAssignment:  true, 
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
    if (! presetName) return;
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
    if (window. confirm("Clear all subjects and start fresh? ")) {
      saveStateForUndo();
      setSubjects([{ 
        id: 1, 
        name: "Subject 1", 
        credits: 4, 
        hasLab: false, 
        hasAssignment: true, 
        isaWeight:  20, 
        assignmentWeight:  10, 
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
    const file = event.target. files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e. target.result);
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
    reader. readAsText(file);
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

  const getGradePoint = (totalMarks) => {
    for (let g of GradeMap) {
      if (totalMarks >= g.min) return g.gp;
    }
    return 0;
  };

  const getGradeInfo = (score) => {
    return GradeMap.find(g => score >= g.min) || GradeMap[GradeMap.length - 1];
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
      const gp = getGradePoint(finalScore);
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
      const currentGP = getGradePoint(finalScore);
      const momentumGP = getGradePoint(momentumScore);
      
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
    const totalCredits = subjects. reduce((acc, s) => acc + s.credits, 0);
    const targetTotalGP = totalCredits * targetSgpa;
    
    let subState = subjects.map(s => {
      const m = marks[s. id] || {};
      const { momentumScore, currentInternals, totalWeight, esaWeight } = getSubjectMetrics(s);
      const gp = getGradePoint(momentumScore);
      
      return { 
        ... s, 
        currentScore: momentumScore, 
        currentGP: gp, 
        currentInternals,
        totalWeight,
        esaWeight,
        esaMax: m. esaMax || 100,
        esaEntered: m.esa && m.esa !== ''
      };
    });

    let currentTotalGP = subState.reduce((acc, s) => acc + s.currentGP * s.credits, 0);
    let deficit = targetTotalGP - currentTotalGP;
    
    let plan = [];
    let impossible = false;
    let iterations = 0;
    
    let simState = JSON.parse(JSON. stringify(subState));

    while (deficit > 0.01 && iterations < 50) {
      iterations++;
      let candidates = [];

      simState.forEach((sub, idx) => {
        const currentG = sub.currentGP;
        const nextGrade = GradeMap. slice().reverse().find(g => g.gp > currentG);
        
        if (nextGrade) {
          const requiredWeightedTotal = (nextGrade.min * sub. totalWeight) / 100;
          const requiredEsaComponent = requiredWeightedTotal - sub. currentInternals;
          const esaNeeded = Math.ceil((requiredEsaComponent / sub.esaWeight) * sub.esaMax);

          if (esaNeeded >= 0 && esaNeeded <= sub. esaMax) {
            const currentProjectedEsa = ((sub.currentScore * sub.totalWeight / 100) - sub.currentInternals) / sub.esaWeight * sub.esaMax;
            const cost = Math.max(0, esaNeeded - currentProjectedEsa);
            const gpGain = (nextGrade.gp - currentG) * sub.credits;
            
            candidates.push({
              idx,
              name: sub.name,
              fromGrade: GradeMap. find(g => g.gp === currentG)?.grade || 'F',
              toGrade: nextGrade.grade,
              esaNeeded:  Math.max(0, esaNeeded),
              esaMax: sub.esaMax,
              gpGain,
              cost,
              credits: sub.credits,
              efficiency: cost > 0 ? gpGain / cost :  Infinity
            });
          }
        }
      });

      if (candidates.length === 0) {
        impossible = true;
        break;
      }

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
      
      const newGP = GradeMap.find(g => g. grade === best.toGrade).gp;
      const newMin = GradeMap.find(g => g. grade === best.toGrade).min;
      
      simState[best.idx]. currentGP = newGP;
      simState[best.idx].currentScore = newMin;
      
      deficit -= best.gpGain;
    }

    return { plan, impossible, deficit };
  };

  // --- Reverse Calculator Logic ---
  const calculateReverseRequirements = () => {
    const totalCredits = subjects.reduce((sum, s) => sum + s.credits, 0);
    const targetGP = reverseTargetSgpa * totalCredits;
    
    let results = [];
    let lockedGP = 0;
    let lockedCredits = 0;
    
    // First pass: Calculate locked subjects
    subjects.forEach(sub => {
      if (lockedSubjects[sub.id] !== undefined) {
        const { currentInternals, totalWeight, esaWeight } = getSubjectMetrics(sub);
        const lockedEsa = lockedSubjects[sub.id];
        const esaMax = marks[sub.id]?.esaMax || 100;
        const esaComponent = (lockedEsa / esaMax) * esaWeight;
        const totalScore = Math.ceil(((currentInternals + esaComponent) / totalWeight) * 100);
        const gp = getGradePoint(Math.min(100, totalScore));
        
        lockedGP += (gp * sub.credits);
        lockedCredits += sub.credits;
        
        results.push({
          ...sub,
          locked: true,
          requiredEsa: lockedEsa,
          esaMax,
          projectedScore: Math.min(100, totalScore),
          projectedGrade: getGradeInfo(Math.min(100, totalScore)).grade,
          gp
        });
      }
    });
    
    // Calculate remaining GP needed
    const remainingGP = targetGP - lockedGP;
    const remainingCredits = totalCredits - lockedCredits;
    const avgGPNeeded = remainingCredits > 0 ? remainingGP / remainingCredits : 0;
    
    // --- FIX START: Search from lowest to highest grade ---
    // We use slice().reverse() to create a temporary reversed copy of the array
    let targetGrade = GradeMap.slice().reverse().find(g => g.gp >= avgGPNeeded);
    
    // If even 'S' isn't enough (avgGPNeeded > 10), default to 'S'
    if (!targetGrade) targetGrade = GradeMap[0]; 
    // --- FIX END ---
    
    // Second pass: Calculate unlocked subjects
    subjects.forEach(sub => {
      if (lockedSubjects[sub.id] === undefined) {
        const { currentInternals, totalWeight, esaWeight } = getSubjectMetrics(sub);
        const esaMax = marks[sub.id]?.esaMax || 100;
        
        const requiredTotal = (targetGrade.min * totalWeight) / 100;
        const requiredEsaComponent = requiredTotal - currentInternals;
        const requiredEsa = Math.ceil((requiredEsaComponent / esaWeight) * esaMax);
        
        const isImpossible = requiredEsa > esaMax;
        const alreadyAchieved = requiredEsa <= 0;
        
        results.push({
          ...sub,
          locked: false,
          requiredEsa: Math.max(0, Math.min(esaMax, requiredEsa)),
          esaMax,
          projectedScore: targetGrade.min,
          projectedGrade: targetGrade.grade,
          gp: targetGrade.gp,
          isImpossible,
          alreadyAchieved
        });
      }
    });
    
    // Sort: locked first, then by name
    results.sort((a, b) => {
      if (a.locked !== b.locked) return a.locked ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    
    // Calculate if target is achievable
    const totalAchievableGP = results.reduce((sum, r) => {
      if (r.isImpossible) {
        // Best possible grade
        const { currentInternals, totalWeight, esaWeight } = getSubjectMetrics(subjects.find(s => s.id === r.id));
        const esaMax = r.esaMax;
        const maxEsaComponent = esaWeight;
        const maxScore = Math.ceil(((currentInternals + maxEsaComponent) / totalWeight) * 100);
        return sum + getGradePoint(Math.min(100, maxScore)) * r.credits;
      }
      return sum + r.gp * r.credits;
    }, 0);
    
    const achievableSGPA = (totalAchievableGP / totalCredits).toFixed(2);
    const isTargetAchievable = parseFloat(achievableSGPA) >= reverseTargetSgpa;
    
    return { results, isTargetAchievable, achievableSGPA, avgGPNeeded };
  };

  // --- Study Priority Logic ---
  const getStudyPriorities = () => {
    return subjects.map(sub => {
      const { finalScore, currentInternals, totalWeight, esaWeight } = getSubjectMetrics(sub);
      const esaMax = marks[sub. id]?.esaMax || 100;
      const currentGP = getGradePoint(finalScore);
      const currentGrade = getGradeInfo(finalScore).grade;
      
      const nextGrade = GradeMap.slice().reverse().find(g => g.gp > currentGP);
      
      if (! nextGrade) {
        return {
          ...sub,
          currentGrade,
          currentScore: finalScore,
          status: 'maxed',
          message: 'Already at S grade! ',
          priority: 0
        };
      }
      
      const requiredTotal = (nextGrade.min * totalWeight) / 100;
      const requiredEsaComponent = requiredTotal - currentInternals;
      const requiredEsa = Math.ceil((requiredEsaComponent / esaWeight) * esaMax);
      
      if (requiredEsa > esaMax) {
        return {
          ...sub,
          currentGrade,
          currentScore: finalScore,
          nextGrade:  nextGrade.grade,
          status:  'impossible',
          message: `Cannot reach ${nextGrade.grade} even with ${esaMax} in ESA`,
          priority: 0
        };
      }
      
      const gpGain = (nextGrade.gp - currentGP) * sub.credits;
      
      if (requiredEsa <= 40) {
        return {
          ...sub,
          currentGrade,
          currentScore: finalScore,
          nextGrade:  nextGrade.grade,
          requiredEsa,
          esaMax,
          status: 'easy',
          message:  `Easy upgrade!  Just ${requiredEsa}/${esaMax} in ESA for ${nextGrade.grade}`,
          priority: 100,
          gpGain
        };
      }
      
      const effort = requiredEsa;
      const priorityScore = (gpGain / effort) * 100;
      
      return {
        ...sub,
        currentGrade,
        currentScore: finalScore,
        nextGrade:  nextGrade.grade,
        requiredEsa,
        esaMax,
        status: requiredEsa <= 70 ? 'achievable' : 'hard',
        message:  `Score ${requiredEsa}/${esaMax} in ESA to jump to ${nextGrade.grade}`,
        priority: priorityScore,
        gpGain
      };
    }).sort((a, b) => b.priority - a.priority);
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

  const metrics = calculateAnalysis();
  const strategy = getSmartSuggestions();
  const reverseResults = calculateReverseRequirements();
  const studyPriorities = getStudyPriorities();
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
    const prevSgpa = parseFloat(prevCgpaDetails. sgpa);
    const prevCreds = parseFloat(prevCgpaDetails.credits);
    const currSgpa = parseFloat(sgpa);
    const currCreds = metrics.totalCredits;

    if (! isNaN(prevSgpa) && !isNaN(prevCreds) && currCreds > 0) {
      const totalPoints = (prevSgpa * prevCreds) + (currSgpa * currCreds);
      const totalCreds = prevCreds + currCreds;
      return (totalPoints / totalCreds).toFixed(2);
    }
    return null;
  };

  const finalCgpa = calculateCGPA();

  // --- Theme Classes ---
  const themeClasses = {
    bg: darkMode ? 'bg-slate-900' : 'bg-slate-50',
    text: darkMode ? 'text-slate-100' : 'text-slate-800',
    card:  darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200',
    cardHover: darkMode ?  'hover:border-slate-600' : 'hover: border-blue-200',
    input: darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-700',
    inputBg: darkMode ? 'bg-slate-800' : 'bg-slate-50',
    muted: darkMode ?  'text-slate-400' : 'text-slate-500',
    border: darkMode ? 'border-slate-700' : 'border-slate-200',
  };

  return (
    <div className={`min-h-screen ${themeClasses.bg} ${themeClasses.text} font-sans pb-24`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-800 to-indigo-900 text-white p-4 md:p-6 shadow-lg sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <GraduationCap className="w-6 h-6 md:w-8 md:h-8 text-yellow-400" />
              PESU Calculator
            </h1>
            <p className="text-blue-200 text-[10px] md:text-xs mt-1 font-medium tracking-wide">
              UNIVERSAL • ANY CYCLE • AUTO-SAVES
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] md:text-xs text-blue-200 uppercase tracking-wider font-semibold">Predicted SGPA</div>
              <div className={`text-2xl md:text-4xl font-extrabold ${parseFloat(sgpa) >= targetSgpa ? 'text-green-400' : 'text-white'}`}>
                {sgpa}
              </div>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              title={darkMode ? 'Light Mode' : 'Dark Mode'}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className={`sticky top-[72px] md:top-[88px] z-10 ${themeClasses.bg} border-b ${themeClasses. border}`}>
        <div className="max-w-4xl mx-auto flex overflow-x-auto">
          {[
            { id:  'subjects', label: 'Subjects', icon: BookOpen },
            { id: 'analysis', label: 'Analysis', icon: Activity },
            { id: 'reverse', label: 'Reverse Calc', icon: Target },
            { id: 'priority', label: 'Priority', icon: TrendingUp },
            { id: 'cgpa', label:  'CGPA', icon: Calculator },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab. id)}
              className={`flex items-center gap-1 md:gap-2 px-3 md:px-4 py-3 text-xs md:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'border-blue-500 text-blue-600' 
                  : `border-transparent ${themeClasses.muted} hover:text-blue-500`
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        
        {/* ==================== SUBJECTS TAB ==================== */}
        {activeTab === 'subjects' && (
          <>
            {/* Helper Banner */}
            <div className={`${themeClasses.card} border rounded-xl p-4 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 text-sm`}>
              <div className="flex items-start gap-3">
                <Settings className="w-5 h-5 mt-0.5 text-blue-600 flex-shrink-0" />
                <div>
                  <span className="font-bold block">Universal Calculator</span>
                  <span className={themeClasses.muted}>
                    Works for all semesters.  5-credit courses scale from 120% to 100%.
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 flex-shrink-0">
                {/* Preset Dropdown */}
                <select
                  onChange={(e) => loadPreset(e.target.value)}
                  className={`${themeClasses. input} px-3 py-2 rounded-lg text-xs border`}
                  defaultValue=""
                >
                  <option value="">Load Preset... </option>
                  {Object.keys(SemesterPresets).map(key => (
                    <option key={key} value={key}>{key}</option>
                  ))}
                </select>
                
                {/* Undo/Redo */}
                <div className="flex gap-1">
                  <button 
                    onClick={undo}
                    disabled={undoStack.length === 0}
                    className={`p-2 rounded-lg border ${themeClasses.border} ${undoStack.length === 0 ? 'opacity-30' : 'hover: bg-blue-50 dark:hover:bg-slate-700'}`}
                    title="Undo (Ctrl+Z)"
                  >
                    <Undo2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={redo}
                    disabled={redoStack.length === 0}
                    className={`p-2 rounded-lg border ${themeClasses.border} ${redoStack.length === 0 ? 'opacity-30' : 'hover: bg-blue-50 dark:hover: bg-slate-700'}`}
                    title="Redo (Ctrl+Y)"
                  >
                    <Redo2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Export/Import */}
                <button 
                  onClick={exportData}
                  className={`flex items-center gap-1 ${themeClasses. card} border px-3 py-2 rounded-lg transition-colors text-xs hover:bg-blue-50 dark: hover:bg-slate-700`}
                  title="Export (Ctrl+S)"
                >
                  <Download className="w-3 h-3" /> Export
                </button>
                <label className={`flex items-center gap-1 ${themeClasses.card} border px-3 py-2 rounded-lg transition-colors text-xs cursor-pointer hover:bg-blue-50 dark:hover:bg-slate-700`}>
                  <Upload className="w-3 h-3" /> Import
                  <input type="file" accept=".json" onChange={importData} className="hidden" />
                </label>
                
                <button 
                  onClick={clearAll}
                  className="flex items-center gap-1 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover: bg-red-900/50 text-red-600 px-3 py-2 rounded-lg border border-red-200 dark:border-red-800 transition-colors text-xs"
                >
                  <Eraser className="w-3 h-3" /> Clear
                </button>
              </div>
            </div>

            {/* Grade Distribution Bar */}
            <div className={`${themeClasses. card} border rounded-xl p-4`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" /> Grade Distribution
                </span>
                <span className={`text-xs ${themeClasses. muted}`}>
                  {subjects.length} subjects • {metrics.totalCredits} credits
                </span>
              </div>
              <div className="flex gap-1 h-8 rounded-lg overflow-hidden">
                {Object.entries(gradeDistribution).map(([grade, count]) => {
                  if (count === 0) return null;
                  const gradeInfo = GradeMap.find(g => g. grade === grade);
                  return (
                    <div 
                      key={grade}
                      className={`flex items-center justify-center text-xs font-bold text-white ${gradeInfo?. bg || 'bg-gray-500'}`}
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
                const gp = getGradePoint(finalScore);
                const gradeInfo = getGradeInfo(finalScore);
                const isExpanded = expandedSubject === subject.id;

                return (
                  <div key={subject.id} className={`${themeClasses.card} rounded-xl shadow-sm border transition-all duration-200 ${isExpanded ? 'border-blue-400 ring-2 ring-blue-500/20' : themeClasses.cardHover}`}>
                    {/* Subject Header */}
                    <div 
                      className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between cursor-pointer rounded-t-xl gap-4"
                      onClick={() => setExpandedSubject(isExpanded ? null :  subject.id)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-lg">{subject.name}</h3>
                          <span className={`text-xs font-bold ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'} px-2 py-0.5 rounded-full border ${themeClasses. border}`}>
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
                          <div className={`font-bold text-xl leading-none ${gradeInfo. color}`}>
                            {finalScore}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white shadow-sm ${gradeInfo. bg}`}>
                            {gradeInfo.grade}
                          </div>
                          {isExpanded ?  <ChevronUp className="w-5 h-5 text-slate-400" /> :  <ChevronDown className="w-5 h-5 text-slate-400" />}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className={`p-4 border-t ${themeClasses.border} ${darkMode ? 'bg-slate-800/50' : 'bg-slate-50/50'} rounded-b-xl`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                          
                          {/* ISA 1 */}
                          <div className={`${themeClasses. card} p-3 rounded-lg border shadow-sm`}>
                            <label className={`block text-xs font-bold ${themeClasses.muted} uppercase tracking-wide mb-2 flex justify-between`}>
                              ISA 1 <span className="font-normal opacity-60">{subject.isaWeight}%</span>
                            </label>
                            <div className="flex items-center gap-2">
                              <input 
                                type="number" 
                                placeholder="0" 
                                value={m. isa1} 
                                onChange={(e) => handleMarkChange(subject.id, 'isa1', e.target. value)} 
                                className={`w-full p-2 border rounded font-semibold focus:ring-2 focus: ring-blue-500 focus:outline-none ${themeClasses.input}`} 
                              />
                              <span className={themeClasses.muted}>/</span>
                              <input 
                                type="number" 
                                value={m.isa1Max} 
                                onChange={(e) => handleMarkChange(subject.id, 'isa1Max', e.target.value)} 
                                className={`w-14 p-2 text-sm border-none focus:ring-0 text-center ${themeClasses.inputBg} ${themeClasses.muted}`} 
                              />
                            </div>
                          </div>

                          {/* ISA 2 */}
                          <div className={`${themeClasses.card} p-3 rounded-lg border shadow-sm`}>
                            <label className={`block text-xs font-bold ${themeClasses. muted} uppercase tracking-wide mb-2 flex justify-between`}>
                              ISA 2 <span className="font-normal opacity-60">{subject.isaWeight}%</span>
                            </label>
                            <div className="flex items-center gap-2">
                              <input 
                                type="number" 
                                placeholder="0" 
                                value={m.isa2} 
                                onChange={(e) => handleMarkChange(subject. id, 'isa2', e. target.value)} 
                                className={`w-full p-2 border rounded font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none ${themeClasses. input}`} 
                              />
                              <span className={themeClasses. muted}>/</span>
                              <input 
                                type="number" 
                                value={m.isa2Max} 
                                onChange={(e) => handleMarkChange(subject.id, 'isa2Max', e.target.value)} 
                                className={`w-14 p-2 text-sm border-none focus:ring-0 text-center ${themeClasses.inputBg} ${themeClasses.muted}`} 
                              />
                            </div>
                          </div>

                          {/* Assignment & Lab */}
                          <div className="space-y-3">
                            {subject.hasAssignment && (
                              <div className={`${themeClasses.card} p-3 rounded-lg border shadow-sm`}>
                                <label className={`block text-xs font-bold ${themeClasses.muted} uppercase tracking-wide mb-2 flex justify-between`}>
                                  Assign <span className="font-normal opacity-60">{subject.assignmentWeight}%</span>
                                </label>
                                <div className="flex items-center gap-2">
                                  <input 
                                    type="number" 
                                    placeholder="0" 
                                    value={m.assignment} 
                                    onChange={(e) => handleMarkChange(subject.id, 'assignment', e.target.value)} 
                                    className={`w-full p-2 border rounded font-semibold focus: ring-2 focus:ring-blue-500 focus:outline-none ${themeClasses.input}`} 
                                  />
                                  <span className={themeClasses. muted}>/</span>
                                  <input 
                                    type="number" 
                                    value={m.assignmentMax} 
                                    onChange={(e) => handleMarkChange(subject.id, 'assignmentMax', e.target.value)} 
                                    className={`w-12 p-2 text-sm border-none focus:ring-0 text-center ${themeClasses.inputBg} ${themeClasses.muted}`} 
                                  />
                                </div>
                              </div>
                            )}
                            {subject. hasLab && (
                              <div className={`${themeClasses.card} p-3 rounded-lg border shadow-sm border-l-4 border-l-purple-400`}>
                                <label className={`block text-xs font-bold ${themeClasses.muted} uppercase tracking-wide mb-2 flex justify-between`}>
                                  Lab <span className="font-normal opacity-60">{subject.labWeight}%</span>
                                </label>
                                <div className="flex items-center gap-2">
                                  <input 
                                    type="number" 
                                    placeholder="0" 
                                    value={m.lab} 
                                    onChange={(e) => handleMarkChange(subject.id, 'lab', e. target.value)} 
                                    className={`w-full p-2 border rounded font-semibold focus:ring-2 focus:ring-purple-500 focus: outline-none ${themeClasses.input}`} 
                                  />
                                  <span className={themeClasses.muted}>/</span>
                                  <input 
                                    type="number" 
                                    value={m.labMax} 
                                    onChange={(e) => handleMarkChange(subject.id, 'labMax', e. target.value)} 
                                    className={`w-12 p-2 text-sm border-none focus:ring-0 text-center ${themeClasses.inputBg} ${themeClasses.muted}`} 
                                  />
                                </div>
                              </div>
                            )}
                            {! subject.hasAssignment && !subject.hasLab && (
                              <div className={`${themeClasses.card} p-3 rounded-lg border shadow-sm opacity-50`}>
                                <span className={`text-xs ${themeClasses. muted}`}>No Lab/Assignment</span>
                              </div>
                            )}
                          </div>

                          {/* ESA */}
                          <div className={`${themeClasses.card} p-3 rounded-lg border shadow-sm border-l-4 border-l-indigo-500`}>
                            <label className={`block text-xs font-bold ${themeClasses.muted} uppercase tracking-wide mb-2 flex justify-between`}>
                              ESA <span className="font-normal opacity-60">{subject.esaWeight}%</span>
                            </label>
                            <div className="flex items-center gap-2">
                              <input 
                                type="number" 
                                placeholder="0" 
                                value={m. esa} 
                                onChange={(e) => handleMarkChange(subject.id, 'esa', e. target.value)} 
                                className={`w-full p-2 border rounded font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none ${themeClasses.input}`} 
                              />
                              <span className={themeClasses.muted}>/</span>
                              <input 
                                type="number" 
                                value={m.esaMax} 
                                onChange={(e) => handleMarkChange(subject.id, 'esaMax', e.target. value)} 
                                className={`w-14 p-2 text-sm border-none focus:ring-0 text-center ${themeClasses.inputBg} ${themeClasses.muted}`} 
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
                            <div className={`mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 ${themeClasses. card} rounded-lg border`}>
                              <div className="space-y-3">
                                <div>
                                  <label className={`text-xs ${themeClasses. muted} block mb-1`}>Name</label>
                                  <input 
                                    type="text" 
                                    value={subject.name} 
                                    onChange={(e) => handleSubjectChange(subject.id, 'name', e. target.value)} 
                                    className={`w-full text-sm p-2 border rounded ${themeClasses. input}`} 
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
                                      onChange={() => toggleAssignment(subject. id)} 
                                      className="rounded"
                                    /> 
                                    Has Assignment
                                  </label>
                                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                                    <input 
                                      type="checkbox" 
                                      checked={subject. hasLab} 
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
                                      onChange={(e) => handleSubjectChange(subject.id, 'esaWeight', parseFloat(e. target.value) || 0)} 
                                      className={`w-full text-sm p-1 border rounded ${themeClasses.input}`} 
                                    />
                                  </div>
                                  {subject.hasAssignment && (
                                    <div className="flex-1 min-w-[60px]">
                                      <span className={`text-[10px] ${themeClasses.muted} block`}>Assign</span>
                                      <input 
                                        type="number" 
                                        value={subject.assignmentWeight} 
                                        onChange={(e) => handleSubjectChange(subject.id, 'assignmentWeight', parseFloat(e. target.value) || 0)} 
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
                                        onChange={(e) => handleSubjectChange(subject.id, 'labWeight', parseFloat(e. target.value) || 0)} 
                                        className={`w-full text-sm p-1 border rounded ${themeClasses.input}`} 
                                      />
                                    </div>
                                  )}
                                </div>
                                <button 
                                  onClick={() => removeSubject(subject. id)} 
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
              className={`w-full py-3 border-2 border-dashed ${themeClasses. border} rounded-xl ${themeClasses. muted} hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all flex items-center justify-center gap-2 font-bold text-sm`}
              >
              <Plus className="w-4 h-4" /> Add Custom Subject
            </button>

            {/* Alerts Banner - Inside subjects tab */}
            {alerts.length > 0 && (
              <div className="space-y-2">
                {alerts. filter(a => a.type === 'critical').map((alert, i) => (
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
          </>
        )}

        {/* ==================== ANALYSIS TAB ==================== */}
        {activeTab === 'analysis' && (
          <div className="space-y-6">
            {/* Target Analyzer */}
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

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                  <div className="text-2xl font-bold">{metrics.totalCredits}</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Total Credits</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                  <div className="text-2xl font-bold">{sgpa}</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Current SGPA</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 opacity-10"><Target className="w-10 h-10"/></div>
                  <div className="text-2xl font-bold">{metrics. allowableLoss. toFixed(1)}</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">GP Budget</div>
                  <p className="text-[10px] text-slate-500 mt-1">Points you can lose for {targetSgpa}</p>
                </div>
                <div className="bg-indigo-900/40 rounded-lg p-4 border border-indigo-500/30 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 opacity-10"><TrendingUp className="w-10 h-10"/></div>
                  <div className="text-2xl font-bold text-indigo-300">{metrics.momentumSGPA}</div>
                  <div className="text-[10px] text-indigo-200/70 uppercase tracking-wider">Momentum SGPA</div>
                  <p className="text-[10px] text-indigo-200/50 mt-1">If ESA = Internal performance</p>
                </div>
              </div>

              {/* Subject-wise Analysis */}
              <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                <div className="grid grid-cols-12 gap-2 text-[10px] text-slate-500 uppercase font-bold pb-2 border-b border-slate-700 sticky top-0 bg-slate-800">
                  <div className="col-span-5">Subject</div>
                  <div className="col-span-2 text-center">Momentum</div>
                  <div className="col-span-2 text-center">For A (80)</div>
                  <div className="col-span-2 text-center">For S (90)</div>
                  <div className="col-span-1 text-center">GP</div>
                </div>
                {metrics.analysisData.map((d, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center text-sm py-2 border-b border-slate-700/50 hover:bg-slate-700/30 rounded transition-colors">
                    <div className="col-span-5 truncate text-slate-300 font-medium">{d.name}</div>
                    <div className="col-span-2 text-center">
                      <span className={`font-bold ${d.momentumScore >= 90 ? 'text-green-400' : d.momentumScore >= 80 ? 'text-blue-400' : d.momentumScore >= 40 ? 'text-slate-300' : 'text-red-400'}`}>
                        {d.momentumScore}
                      </span>
                    </div>
                    <div className="col-span-2 text-center">
                      {d.reqA === null ? (
                        <span className="text-red-500 text-xs">Impossible</span>
                      ) : d.reqA === 0 ? (
                        <span className="text-green-500 text-xs">✓ Done</span>
                      ) : (
                        <div>
                          <span className={`font-mono font-bold ${d.reqARequiresRounding ? 'text-orange-300' : 'text-blue-300'}`}>{d.reqA}</span>
                          {d.reqAMin !== null && d.reqAMin < d.reqA && (
                            <div className="text-[9px] text-slate-500">min: {d.reqAMin}</div>
                          )}
                          {d.reqARequiresRounding && (
                            <div className="text-[9px] text-orange-400">*rounding</div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="col-span-2 text-center">
                      {d.reqS === null ? (
                        <span className="text-red-500 text-xs">Impossible</span>
                      ) : d.reqS === 0 ? (
                        <span className="text-green-500 text-xs">✓ Done</span>
                      ) : (
                        <div>
                          <span className={`font-mono font-bold ${d.reqSRequiresRounding ? 'text-orange-300' : 'text-yellow-300'}`}>{d.reqS}</span>
                          {d.reqSMin !== null && d.reqSMin < d.reqS && (
                            <div className="text-[9px] text-slate-500">min: {d.reqSMin}</div>
                          )}
                          {d.reqSRequiresRounding && (
                            <div className="text-[9px] text-orange-400">*rounding</div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="col-span-1 text-center">
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${d.currentGP >= 9 ? 'bg-green-500/20 text-green-400' : d.currentGP >= 8 ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-600 text-slate-300'}`}>
                        {d.currentGP}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Add notice about minimum scores */}
              <div className="mt-4 p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                <div className="flex items-start gap-2 text-xs text-slate-400">
                  <Lightbulb className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-300">Safe vs Minimum scores:</strong> The main number is the <strong>safe</strong> ESA score that guarantees the grade. 
                    The "min" value (when shown) is the absolute minimum that <em>might</em> work due to rounding up, but scoring the safe value is recommended.
                  </div>
                </div>
              </div>
            </div>

            {/* Smart Strategy Panel */}
            <div className={`${darkMode ? 'bg-slate-800' : 'bg-slate-800'} rounded-xl shadow-lg p-6 text-white border ${darkMode ?  'border-slate-700' : 'border-slate-700'}`}>
              <h2 className="text-lg font-bold flex items-center gap-2 mb-4 text-green-400">
                <Lightbulb className="w-5 h-5" /> Path to Target ({targetSgpa} SGPA)
              </h2>
              
              {strategy.plan.length === 0 && !strategy.impossible && parseFloat(metrics.momentumSGPA) >= targetSgpa ? (
                <div className="bg-green-900/20 border border-green-800 rounded-lg p-4 flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0" />
                  <div>
                    <div className="font-bold text-green-300">You're on track!</div>
                    <div className="text-xs text-green-200/60">Your current momentum ({metrics.momentumSGPA}) meets or exceeds your target SGPA.</div>                  </div>
                </div>
              ) : strategy.impossible ? (
                <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                  <div>
                    <div className="font-bold text-red-300">Target Unreachable</div>
                    <div className="text-xs text-red-200/60">Even with perfect ESA scores, this SGPA is mathematically impossible given your internals.</div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-slate-400 mb-2">Most efficient path to reach your target:</p>
                  {strategy.plan.map((step, idx) => (
                    <div key={idx} className="bg-slate-700/50 p-3 rounded-lg border border-slate-600 flex items-start gap-3 hover:bg-slate-700 transition-colors">
                      <div className="bg-slate-800 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-slate-400 flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-slate-200 flex justify-between items-center">
                          <span>{step.name}</span>
                          <span className="text-[10px] bg-indigo-900 text-indigo-200 px-1. 5 py-0.5 rounded flex items-center">+{step.gpGain. toFixed(1)} GP</span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1 flex items-center gap-1 flex-wrap">
                          <span>Score</span>
                          <span className="text-white font-bold bg-slate-600 px-1.5 rounded">{step.esaNeeded}/{step.esaMax}</span> 
                          <span>in ESA to upgrade</span>
                          <span className={`font-bold ${step. fromGrade === 'S' ? 'text-green-400' : step.fromGrade === 'A' ?  'text-blue-400' : 'text-slate-300'}`}>{step.fromGrade}</span>
                          <ArrowRight className="w-3 h-3" />
                          <span className={`font-bold ${step.toGrade === 'S' ? 'text-green-400' :  step.toGrade === 'A' ? 'text-blue-400' :  'text-slate-300'}`}>{step.toGrade}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {strategy.deficit > 0.01 && (
                    <div className="text-center text-xs text-yellow-400 mt-2 p-2 bg-yellow-900/20 rounded-lg border border-yellow-800">
                      ⚠️ This plan covers most of the gap but {strategy.deficit.toFixed(1)} GP still needed.  Consider lowering your target or checking if higher grades are achievable.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== REVERSE CALCULATOR TAB ==================== */}
        {activeTab === 'reverse' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-xl shadow-lg p-6 text-white">
              <h2 className="text-lg font-bold flex items-center gap-2 mb-2">
                <Target className="w-5 h-5" /> Reverse Calculator
              </h2>
              <p className="text-emerald-100 text-sm mb-6">
                Set your desired SGPA and see exactly what you need to score in each ESA.  Lock subjects where you're confident about your score.
              </p>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-3 bg-white/20 px-4 py-3 rounded-lg">
                  <label className="text-sm font-semibold">I want SGPA: </label>
                  <input
                    type="number"
                    step="0.1"

                    min="5"
                    max="10"
                    value={reverseTargetSgpa}
                    onChange={(e) => setReverseTargetSgpa(parseFloat(e.target. value) || 0)}
                    className="w-20 bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white font-bold text-center text-xl focus:outline-none focus:border-white"
                  />
                </div>
                
                {! reverseResults.isTargetAchievable && (
                  <div className="flex items-center gap-2 bg-red-500/30 px-3 py-2 rounded-lg text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>Max achievable:  <strong>{reverseResults. achievableSGPA}</strong></span>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                {reverseResults.results.map((sub, i) => (
                  <div 
                    key={i} 
                    className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-lg gap-3 ${
                      sub. isImpossible ? 'bg-red-500/30' : 
                      sub.alreadyAchieved ? 'bg-green-500/30' :  
                      sub.locked ? 'bg-yellow-500/20' : 'bg-white/10'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="font-medium flex items-center gap-2">
                        {sub.locked && <Lock className="w-3 h-3 text-yellow-400" />}
                        {sub.name}
                      </div>
                      <div className="text-xs text-emerald-200/70">
                        {sub.credits} credits • Target Grade: <strong>{sub.projectedGrade}</strong>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        {sub.isImpossible ? (
                          <div>
                            <div className="text-red-300 font-bold">Not Possible</div>
                            <div className="text-[10px] text-red-200/60">Internals too low</div>
                          </div>
                        ) : sub.alreadyAchieved ? (
                          <div>
                            <div className="text-green-300 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" /> Already there
                            </div>
                            <div className="text-[10px] text-green-200/60">No ESA needed for this grade</div>
                          </div>
                        ) : (
                          <div>
                            <div className="text-2xl font-bold">{sub.requiredEsa}<span className="text-sm text-emerald-200/70">/{sub.esaMax}</span></div>
                            <div className="text-[10px] text-emerald-200/60">ESA marks needed</div>
                          </div>
                        )}
                      </div>
                      
                      {/* Lock toggle */}
                      <button
                        onClick={() => {
                          if (lockedSubjects[sub.id] !== undefined) {
                            const newLocked = { ...lockedSubjects };
                            delete newLocked[sub. id];
                            setLockedSubjects(newLocked);
                          } else {
                            setLockedSubjects({ 
                              ... lockedSubjects, 
                              [sub.id]: sub.requiredEsa 
                            });
                          }
                        }}
                        className={`p-2 rounded-lg transition-colors ${
                          sub.locked ?  'bg-yellow-500 text-yellow-900' : 'bg-white/20 hover:bg-white/30'
                        }`}
                        title={sub.locked ?  "Unlock this subject" : "Lock this ESA score"}
                      >
                        {sub.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-white/10 rounded-lg">
                <div className="flex items-start gap-2 text-sm">
                  <Lightbulb className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>How to use:</strong> Lock subjects where you're confident about your ESA score. 
                    The calculator will then adjust the requirements for other subjects to compensate.
                  </div>
                </div>
              </div>
            </div>

            {/* Minimum Passing Table */}
            <div className={`${themeClasses.card} rounded-xl shadow-lg p-6 border`}>
              <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                <Calculator className="w-5 h-5 text-blue-500" /> Minimum ESA Scores Needed
              </h2>
              <p className={`${themeClasses. muted} text-sm mb-4`}>
                Quick reference: minimum ESA marks required for each grade in each subject.
              </p>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className={`border-b ${themeClasses.border}`}>
                      <th className="text-left py-3 px-2 font-bold">Subject</th>
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
                        <td className="py-3 px-2 font-medium">
                          <div>{sub.name}</div>
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
                                  <span className={`font-mono font-bold ${
                                    req.requiresRounding ? 'text-orange-600 dark:text-orange-400' :
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

        {/* ==================== PRIORITY TAB ==================== */}
        {activeTab === 'priority' && (
          <div className="space-y-6">
            <div className={`${darkMode ? 'bg-slate-800' : 'bg-slate-800'} rounded-xl shadow-lg p-6 text-white border border-slate-700`}>
              <h2 className="text-lg font-bold flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-orange-400" /> Study Priority Advisor
              </h2>
              <p className="text-slate-400 text-sm mb-6">
                Subjects ranked by ROI (Grade Point gain per effort). Focus on top priorities for maximum SGPA improvement. 
              </p>
              
              <div className="space-y-3">
                {studyPriorities. map((sub, idx) => (
                  <div 
                    key={sub.id}
                    className={`p-4 rounded-lg border transition-colors ${
                      sub.status === 'easy' ? 'bg-green-900/30 border-green-500/50' : 
                      sub.status === 'achievable' ? 'bg-blue-900/30 border-blue-500/50' : 
                      sub.status === 'hard' ? 'bg-orange-900/30 border-orange-500/50' :  
                      sub.status === 'impossible' ? 'bg-red-900/30 border-red-500/50' : 
                      'bg-slate-700/50 border-slate-600'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                          sub.status === 'easy' ? 'bg-green-500 text-white' : 
                          sub. status === 'achievable' ? 'bg-blue-500 text-white' :
                          sub.status === 'hard' ? 'bg-orange-500 text-white' :
                          sub.status === 'impossible' ? 'bg-red-500 text-white' : 
                          'bg-slate-600 text-slate-300'
                        }`}>
                          {idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {sub.status === 'easy' && <span className="text-lg">🎯</span>}
                            {sub.status === 'achievable' && <span className="text-lg">📈</span>}
                            {sub.status === 'hard' && <span className="text-lg">💪</span>}
                            {sub. status === 'impossible' && <span className="text-lg">⚠️</span>}
                            {sub.status === 'maxed' && <span className="text-lg">🏆</span>}
                            <span className="font-bold">{sub.name}</span>
                            <span className="text-xs bg-slate-700 px-2 py-0.5 rounded">
                              {sub.credits} Cr
                            </span>
                          </div>
                          <p className="text-sm text-slate-300 mt-1">{sub.message}</p>
                        </div>
                      </div>
                      
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-2 text-sm justify-end">
                          <span className={`font-bold text-lg ${
                            sub.currentGrade === 'S' ? 'text-green-400' :
                            sub.currentGrade === 'A' ?  'text-blue-400' :  
                            sub.currentGrade === 'F' ? 'text-red-400' : 
                            'text-slate-300'
                          }`}>{sub.currentGrade}</span>
                          {sub.nextGrade && (
                            <>
                              <ArrowRight className="w-4 h-4 text-slate-500" />
                              <span className={`font-bold text-lg ${
                                sub.nextGrade === 'S' ?  'text-green-400' : 
                                sub.nextGrade === 'A' ? 'text-blue-400' : 
                                'text-slate-300'
                              }`}>{sub.nextGrade}</span>
                            </>
                          )}
                        </div>
                        {sub.gpGain && (
                          <div className="text-xs text-emerald-400 mt-1">
                            +{sub.gpGain.toFixed(1)} Grade Points
                          </div>
                        )}
                        {sub.currentScore !== undefined && (
                          <div className="text-[10px] text-slate-500 mt-1">
                            Current: {sub.currentScore}/100
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-slate-700/50 rounded-lg">
                <div className="text-xs text-slate-400 mb-2 font-bold">Priority Legend:</div>
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
                  <span className="flex items-center gap-1">🎯 <span className="text-green-400">Easy win</span> - ESA ≤40</span>
                  <span className="flex items-center gap-1">📈 <span className="text-blue-400">Achievable</span> - ESA 41-70</span>
                  <span className="flex items-center gap-1">💪 <span className="text-orange-400">Hard</span> - ESA 71-100</span>
                  <span className="flex items-center gap-1">⚠️ <span className="text-red-400">Impossible</span> - Can't reach</span>
                  <span className="flex items-center gap-1">🏆 <span className="text-slate-300">Maxed</span> - Already S grade</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`${themeClasses.card} border rounded-xl p-4 text-center`}>
                <div className="text-3xl font-bold text-green-500">
                  {studyPriorities. filter(s => s.status === 'easy').length}
                </div>
                <div className={`text-xs ${themeClasses. muted} uppercase font-bold`}>Easy Wins</div>
              </div>
              <div className={`${themeClasses.card} border rounded-xl p-4 text-center`}>
                <div className="text-3xl font-bold text-blue-500">
                  {studyPriorities. filter(s => s.status === 'achievable').length}
                </div>
                <div className={`text-xs ${themeClasses.muted} uppercase font-bold`}>Achievable</div>
              </div>
              <div className={`${themeClasses.card} border rounded-xl p-4 text-center`}>
                <div className="text-3xl font-bold text-orange-500">
                  {studyPriorities.filter(s => s.status === 'hard').length}
                </div>
                <div className={`text-xs ${themeClasses.muted} uppercase font-bold`}>Hard</div>
              </div>
              <div className={`${themeClasses.card} border rounded-xl p-4 text-center`}>
                <div className="text-3xl font-bold text-emerald-500">
                  {studyPriorities.filter(s => s. status === 'maxed').length}
                </div>
                <div className={`text-xs ${themeClasses. muted} uppercase font-bold`}>Already S</div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== CGPA TAB ==================== */}
        {activeTab === 'cgpa' && (
          <div className="space-y-6">
            {/* CGPA Calculator */}
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
              <GraduationCap className="absolute top-[-20px] right-[-20px] w-40 h-40 text-white opacity-10" />
              
              <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                <Calculator className="w-5 h-5" /> Cumulative GPA (CGPA)
              </h2>
              
              <p className="text-indigo-100 text-sm mb-6 relative z-10 leading-relaxed opacity-90">
                Enter details from your previous semesters to calculate your overall CGPA including this semester's projected SGPA.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 relative z-10">
                <div>
                  <label className="text-xs text-indigo-200 block mb-2 font-semibold">Previous SGPA/CGPA</label>
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="e.g.  8.5" 
                    value={prevCgpaDetails. sgpa}
                    onChange={(e) => setPrevCgpaDetails({...prevCgpaDetails, sgpa:  e.target.value})}
                    className="w-full bg-indigo-800/40 border border-indigo-400/30 rounded-lg p-3 text-white placeholder-indigo-300 focus:outline-none focus:border-white focus:bg-indigo-800/60 transition-all font-bold text-lg"
                  />
                </div>
                <div>
                  <label className="text-xs text-indigo-200 block mb-2 font-semibold">Previous Credits Completed</label>
                  <input 
                    type="number" 
                    placeholder="e.g.  22" 
                    value={prevCgpaDetails.credits}
                    onChange={(e) => setPrevCgpaDetails({...prevCgpaDetails, credits: e.target.value})}
                    className="w-full bg-indigo-800/40 border border-indigo-400/30 rounded-lg p-3 text-white placeholder-indigo-300 focus:outline-none focus:border-white focus:bg-indigo-800/60 transition-all font-bold text-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                  <div className="text-xs text-indigo-200 uppercase font-bold mb-1">This Semester</div>
                  <div className="text-2xl font-bold">{sgpa} SGPA</div>
                  <div className="text-xs text-indigo-200/70">{metrics.totalCredits} credits</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                  <div className="text-xs text-indigo-200 uppercase font-bold mb-1">Previous</div>
                  <div className="text-2xl font-bold">{prevCgpaDetails.sgpa || '--'} SGPA</div>
                  <div className="text-xs text-indigo-200/70">{prevCgpaDetails.credits || '--'} credits</div>
                </div>
              </div>

              <div className="bg-white/20 rounded-xl p-6 relative z-10 backdrop-blur-sm border border-white/20 shadow-inner">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div>
                    <span className="text-sm font-bold text-indigo-100 uppercase tracking-wide block">Projected CGPA</span>
                    {finalCgpa && (
                      <span className="text-xs text-indigo-200/70">
                        Based on {parseFloat(prevCgpaDetails.credits) + metrics.totalCredits} total credits
                      </span>
                    )}
                  </div>
                  <span className="text-5xl font-extrabold tracking-tight">{finalCgpa || '--'}</span>
                </div>
              </div>

              {! finalCgpa && (
                <div className="mt-4 text-center text-indigo-200/70 text-sm relative z-10">
                  Enter your previous SGPA/CGPA and credits to calculate cumulative GPA
                </div>
              )}
            </div>

            {/* CGPA Projection Table */}
            {finalCgpa && (
              <div className={`${themeClasses.card} border rounded-xl p-6`}>
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-500" /> CGPA Scenarios
                </h3>
                <p className={`${themeClasses. muted} text-sm mb-4`}>
                  How different SGPA outcomes this semester would affect your CGPA:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {[10, 9.5, 9, 8.5, 8, 7.5, 7, 6.5, 6]. map(scenarioSgpa => {
                    const prevSgpa = parseFloat(prevCgpaDetails.sgpa);
                    const prevCreds = parseFloat(prevCgpaDetails.credits);
                    const currCreds = metrics.totalCredits;
                    
                    if (isNaN(prevSgpa) || isNaN(prevCreds)) return null;
                    
                    const scenarioCgpa = ((prevSgpa * prevCreds) + (scenarioSgpa * currCreds)) / (prevCreds + currCreds);
                    const isCurrentScenario = Math.abs(parseFloat(sgpa) - scenarioSgpa) < 0.25;
                    
                    return (
                      <div 
                        key={scenarioSgpa}
                        className={`p-3 rounded-lg text-center border ${
                          isCurrentScenario 
                            ? 'bg-blue-100 dark:bg-blue-900/50 border-blue-500' 
                            :  `${themeClasses.card} ${themeClasses. border}`
                        }`}
                      >
                        <div className={`text-xs ${themeClasses.muted} mb-1`}>If SGPA</div>
                        <div className="font-bold">{scenarioSgpa}</div>
                        <div className={`text-lg font-bold mt-2 ${
                          scenarioCgpa >= 9 ? 'text-green-500' : 
                          scenarioCgpa >= 8 ? 'text-blue-500' : 
                          scenarioCgpa >= 7 ? 'text-yellow-500' : 
                          'text-orange-500'
                        }`}>
                          {scenarioCgpa.toFixed(2)}
                        </div>
                        <div className={`text-[10px] ${themeClasses.muted}`}>CGPA</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Formula Explanation */}
            <div className={`${themeClasses.card} border rounded-xl p-6`}>
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-500" /> How CGPA is Calculated
              </h3>
              <div className={`${themeClasses.muted} text-sm space-y-3`}>
                <p>
                  <strong>Formula:</strong> CGPA = (Previous SGPA × Previous Credits + Current SGPA × Current Credits) ÷ Total Credits
                </p>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-100'} font-mono text-xs`}>
                  CGPA = ({prevCgpaDetails.sgpa || 'X'} × {prevCgpaDetails. credits || 'Y'} + {sgpa} × {metrics.totalCredits}) ÷ ({prevCgpaDetails.credits || 'Y'} + {metrics.totalCredits})
                  {finalCgpa && (
                    <>
                      <br />
                      CGPA = {finalCgpa}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className={`text-center ${themeClasses. muted} text-xs mt-8 pb-4`}>
          <p>Data is auto-saved locally in your browser. </p>
          <p className="mt-1 opacity-50">PES SGPA Calculator v2.0 © 2025</p>
          <p className="mt-2 text-[10px] opacity-30">
            Keyboard Shortcuts: Ctrl+Z (Undo) • Ctrl+Y (Redo) • Ctrl+S (Export) • Esc (Close)
          </p>
        </div>

      </div>

      {/* Mobile Bottom Navigation */}
      <div className={`fixed bottom-0 left-0 right-0 ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} border-t md:hidden z-20`}>
        <div className="flex justify-around">
          {[
            { id: 'subjects', label: 'Subjects', icon: BookOpen },
            { id: 'analysis', label: 'Analysis', icon: Activity },
            { id: 'reverse', label: 'Reverse', icon:  Target },
            { id: 'priority', label: 'Priority', icon: TrendingUp },
            { id: 'cgpa', label: 'CGPA', icon: Calculator },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center py-2 px-3 ${
                activeTab === tab.id 
                  ? 'text-blue-600' 
                  :  themeClasses.muted
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-[10px] mt-1">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
      <Analytics />
      <SpeedInsights />
    </div>
  );
}