import React, { useState, useEffect } from 'react';
import { 
  Trash2, Plus, Settings, ChevronDown, ChevronUp, 
  RotateCcw, GraduationCap, Target, 
  Eraser, TrendingUp, Activity, Calculator,
  Lightbulb, ArrowRight, CheckCircle2, AlertCircle
} from 'lucide-react';

// --- Default Data for Reset ---
const ChemistryCycleDefaults = [
  { id: 1, name: "Mathematics - I", credits: 4, hasLab: false, hasAssignment: true, isaWeight: 20, assignmentWeight: 10, labWeight: 0, esaWeight: 50 },
  { id: 2, name: "Engineering Chemistry", credits: 5, hasLab: true, hasAssignment: true, isaWeight: 20, assignmentWeight: 10, labWeight: 20, esaWeight: 50 },
  { id: 3, name: "Problem Solving with C", credits: 5, hasLab: true, hasAssignment: true, isaWeight: 20, assignmentWeight: 10, labWeight: 20, esaWeight: 50 },
  { id: 4, name: "Engineering Mechanics", credits: 4, hasLab: false, hasAssignment: true, isaWeight: 20, assignmentWeight: 10, labWeight: 0, esaWeight: 50 },
  { id: 5, name: "Electronic Principles", credits: 4, hasLab: false, hasAssignment: true, isaWeight: 20, assignmentWeight: 10, labWeight: 0, esaWeight: 50 },
  { id: 6, name: "Constitution of India", credits: 2, hasLab: false, hasAssignment: true, isaWeight: 20, assignmentWeight: 10, labWeight: 0, esaWeight: 50 },
];

const GradeMap = [
  { grade: 'S', min: 90, gp: 10 },
  { grade: 'A', min: 80, gp: 9 },
  { grade: 'B', min: 70, gp: 8 },
  { grade: 'C', min: 60, gp: 7 },
  { grade: 'D', min: 50, gp: 6 },
  { grade: 'E', min: 40, gp: 5 },
  { grade: 'F', min: 0, gp: 0 },
];

export default function PES_Universal_Calculator() {
  // --- State ---
  const [subjects, setSubjects] = useState(() => {
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

  const [sgpa, setSgpa] = useState(0);
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [targetSgpa, setTargetSgpa] = useState(9.0);

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

  // --- Mark & Subject Handlers ---
  useEffect(() => {
    const newMarks = { ...marks };
    let changed = false;
    subjects.forEach(sub => {
      if (!newMarks[sub.id]) {
        newMarks[sub.id] = {
          isa1: '', isa1Max: 40,
          isa2: '', isa2Max: 40,
          assignment: '', assignmentMax: 10,
          lab: '', labMax: 20,
          esa: '', esaMax: 100
        };
        changed = true;
      }
    });
    if (changed) setMarks(newMarks);
  }, [subjects.length]);

  const handleMarkChange = (id, field, value) => {
    setMarks(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const handleSubjectChange = (id, field, value) => {
    setSubjects(prev => prev.map(sub => sub.id === id ? { ...sub, [field]: value } : sub));
  };

  const toggleLab = (id) => {
    setSubjects(prev => prev.map(sub => {
      if (sub.id === id) {
        const newHasLab = !sub.hasLab;
        let newLabWeight = newHasLab ? 20 : 0;
        let newAssignWeight = 10; 
        return { ...sub, hasLab: newHasLab, labWeight: newLabWeight, assignmentWeight: newAssignWeight };
      }
      return sub;
    }));
  };
  
  const toggleAssignment = (id) => {
      setSubjects(prev => prev.map(sub => {
          if (sub.id === id) {
              const newHasAssign = !sub.hasAssignment;
              return { ...sub, hasAssignment: newHasAssign, assignmentWeight: newHasAssign ? 10 : 0 };
          }
          return sub;
      }));
  }

  const addNewSubject = () => {
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
      esaWeight: 50 
    };
    setSubjects([...subjects, newSubject]);
    setExpandedSubject(newId);
  };

  const removeSubject = (id) => {
    if(subjects.length === 1) {
        alert("You need at least one subject!");
        return;
    }
    setSubjects(subjects.filter(s => s.id !== id));
    const newMarks = { ...marks };
    delete newMarks[id];
    setMarks(newMarks);
  };

  const resetToDefault = () => {
    if(window.confirm("This will erase your custom subjects and restore the Chemistry Cycle defaults. Continue?")) {
        setSubjects(ChemistryCycleDefaults);
        setMarks({}); 
    }
  };

  const clearAll = () => {
      if(window.confirm("Clear all subjects and start fresh?")) {
          setSubjects([{ 
            id: 1, 
            name: "Subject 1", 
            credits: 4, 
            hasLab: false, 
            hasAssignment: true, 
            isaWeight: 20, 
            assignmentWeight: 10, 
            labWeight: 0, 
            esaWeight: 50 
          }]);
          setMarks({});
      }
  }

  // --- Calculations ---
  const getSubjectMetrics = (subject) => {
      const m = marks[subject.id];
      if (!m) return { finalScore: 0, currentInternals: 0, totalWeight: 100, momentumScore: 0 };

      const calcComponent = (score, max, weight) => {
        const s = parseFloat(score);
        const mx = parseFloat(max);
        if (isNaN(s) || isNaN(mx) || mx === 0) return 0;
        return (s / mx) * weight;
      };

      // 1. Calculate Internals
      let currentInternals = 0;
      currentInternals += calcComponent(m.isa1, m.isa1Max, subject.isaWeight);
      currentInternals += calcComponent(m.isa2, m.isa2Max, subject.isaWeight);
      if (subject.hasAssignment) currentInternals += calcComponent(m.assignment, m.assignmentMax, subject.assignmentWeight);
      if (subject.hasLab) currentInternals += calcComponent(m.lab, m.labMax, subject.labWeight);

      // 2. Calculate Current ESA (for standard display)
      let esaComponent = calcComponent(m.esa, m.esaMax, subject.esaWeight);
      
      // 3. Weights Logic
      let totalInternalWeight = (subject.isaWeight * 2) + 
                                (subject.hasAssignment ? subject.assignmentWeight : 0) + 
                                (subject.hasLab ? subject.labWeight : 0);
      let totalWeight = totalInternalWeight + subject.esaWeight;

      // 4. Standard Final Score (Current inputs)
      let rawSum = currentInternals + esaComponent;
      let finalScore = Math.ceil((rawSum / totalWeight) * 100);

      // 5. Momentum Logic (Trajectory)
      // Percentage performance in internals
      let internalPerformanceRatio = totalInternalWeight > 0 ? (currentInternals / totalInternalWeight) : 0;
      
      // Predict ESA based on internal performance
      let predictedESA = subject.esaWeight * internalPerformanceRatio;
      
      // If user has already entered ESA, use real ESA, otherwise use predicted
      let momentumESA = (m.esa && m.esa !== '') ? esaComponent : predictedESA;
      
      let momentumRawSum = currentInternals + momentumESA;
      let momentumScore = Math.ceil((momentumRawSum / totalWeight) * 100);

      return {
          finalScore,
          currentInternals, 
          totalWeight,
          momentumScore
      };
  };

  const getGradePoint = (totalMarks) => {
    for (let g of GradeMap) {
      if (totalMarks >= g.min) return g.gp;
    }
    return 0;
  };

  // SGPA Calculation
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

  // Target & Momentum Analysis
  const calculateAnalysis = () => {
      let totalCredits = subjects.reduce((sum, s) => sum + s.credits, 0);
      let maxPossibleGP = totalCredits * 10;
      let targetGP = totalCredits * targetSgpa;
      
      let currentLostGP = 0;
      let momentumWeightedGP = 0;
      
      let analysisData = [];

      subjects.forEach(sub => {
          const { finalScore, currentInternals, totalWeight, momentumScore } = getSubjectMetrics(sub);
          const currentGP = getGradePoint(finalScore);
          const momentumGP = getGradePoint(momentumScore);
          
          momentumWeightedGP += (momentumGP * sub.credits);

          const loss = 10 - currentGP; 
          currentLostGP += (loss * sub.credits);

          const getRequiredESA = (targetScore) => {
              const requiredTotal = (targetScore * totalWeight) / 100;
              const requiredEsaPart = requiredTotal - currentInternals;
              if (requiredEsaPart <= 0) return 0;
              const requiredEsaMarks = (requiredEsaPart / sub.esaWeight) * 100;
              return requiredEsaMarks > 100 ? null : Math.ceil(requiredEsaMarks);
          };

          analysisData.push({
              name: sub.name,
              credits: sub.credits,
              reqS: getRequiredESA(90),
              reqA: getRequiredESA(80),
              currentGP,
              momentumGP,
              momentumScore
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

  // --- Optimization Strategy Engine ---
  const getSmartSuggestions = () => {
    let currentTotalGP = 0;
    const subState = subjects.map(s => {
      const { momentumScore, currentInternals } = getSubjectMetrics(s);
      const gp = getGradePoint(momentumScore);
      currentTotalGP += gp * s.credits;
      return { 
        ...s, 
        currentScore: momentumScore, 
        currentGP: gp, 
        currentInternals 
      };
    });

    let targetTotalGP = subjects.reduce((acc, s) => acc + s.credits, 0) * targetSgpa;
    let deficit = targetTotalGP - currentTotalGP;
    
    // We want to find the "Cheapest" upgrades to cover the deficit.
    // Cost = Increase in Total Score Needed.
    
    let plan = [];
    let impossible = false;
    let iterations = 0;
    
    // Clone state for simulation
    let simState = JSON.parse(JSON.stringify(subState));

    while (deficit > 0.01 && iterations < 50) {
        iterations++;
        let candidates = [];

        simState.forEach((sub, idx) => {
            const currentG = sub.currentGP;
            // Find next grade tier
            const nextGrade = GradeMap.slice().reverse().find(g => g.gp > currentG);
            
            if (nextGrade) {
                // Calculate Marks Needed
                // We need Total Score >= nextGrade.min
                // Total = Internals + (ESA_Score * Weight / 100)
                // ESA_Score >= (Min - Internals) * 100 / Weight
                const rawEsaNeeded = ((nextGrade.min - sub.currentInternals) / sub.esaWeight) * 100;
                const esaNeeded = Math.ceil(rawEsaNeeded);

                if (esaNeeded <= 100) {
                    const cost = nextGrade.min - sub.currentScore; // Points needed above current projection
                    const gpGain = (nextGrade.gp - currentG) * sub.credits;
                    
                    candidates.push({
                        idx,
                        name: sub.name,
                        fromGrade: GradeMap.find(g => g.gp === currentG)?.grade,
                        toGrade: nextGrade.grade,
                        esaNeeded,
                        gpGain,
                        cost,
                        credits: sub.credits
                    });
                }
            }
        });

        if (candidates.length === 0) {
            impossible = true;
            break;
        }

        // Sort candidates:
        // 1. Lowest Cost (Points needed to jump)
        // 2. Highest Credits (If costs are similar, prefer high credit subjects)
        candidates.sort((a, b) => {
            if (Math.abs(a.cost - b.cost) < 1) return b.credits - a.credits;
            return a.cost - b.cost;
        });

        const best = candidates[0];
        plan.push(best);
        
        // Update Sim State
        simState[best.idx].currentGP = GradeMap.find(g => g.grade === best.toGrade).gp;
        simState[best.idx].currentScore = GradeMap.find(g => g.grade === best.toGrade).min;
        
        deficit -= best.gpGain;
    }

    return { plan, impossible, deficit };
  };

  const metrics = calculateAnalysis();
  const strategy = getSmartSuggestions();

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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-800 to-indigo-900 text-white p-6 shadow-lg sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <GraduationCap className="w-8 h-8 text-yellow-400" />
              PESU Calculator
            </h1>
            <p className="text-blue-200 text-xs mt-1 font-medium tracking-wide">
                UNIVERSAL • ANY CYCLE • AUTO-SAVES
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs text-blue-200 uppercase tracking-wider font-semibold">Predicted SGPA</div>
            <div className={`text-4xl font-extrabold ${parseFloat(sgpa) >= targetSgpa ? 'text-green-400' : 'text-white'}`}>
                {sgpa}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        
        {/* Helper Banner */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-blue-800">
            <div className="flex items-start gap-3">
                <Settings className="w-5 h-5 mt-1 text-blue-600 flex-shrink-0" />
                <div>
                    <span className="font-bold block">Universal Calculator</span>
                    <span className="opacity-80">
                       Works for all semesters. 5-credit courses scale from 120% to 100%.
                    </span>
                </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
                <button 
                    onClick={resetToDefault}
                    className="flex items-center gap-1 bg-white hover:bg-blue-100 px-3 py-2 rounded-lg border border-blue-200 transition-colors shadow-sm text-xs"
                >
                    <RotateCcw className="w-3 h-3" /> Chem Cycle
                </button>
                <button 
                    onClick={clearAll}
                    className="flex items-center gap-1 bg-white hover:bg-red-50 text-red-600 px-3 py-2 rounded-lg border border-red-100 transition-colors shadow-sm text-xs"
                >
                    <Eraser className="w-3 h-3" /> Clear All
                </button>
            </div>
        </div>

        {/* Subjects List */}
        <div className="space-y-4">
          {subjects.map((subject) => {
             const m = marks[subject.id] || {};
             const { finalScore, totalWeight } = getSubjectMetrics(subject);
             const gp = getGradePoint(finalScore);
             const isExpanded = expandedSubject === subject.id;

             return (
              <div key={subject.id} className={`bg-white rounded-xl shadow-sm border transition-all duration-200 ${isExpanded ? 'border-blue-400 ring-2 ring-blue-50' : 'border-slate-200 hover:border-blue-200'}`}>
                {/* Subject Header */}
                <div 
                  className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between cursor-pointer rounded-t-xl gap-4"
                  onClick={() => setExpandedSubject(isExpanded ? null : subject.id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-lg text-slate-800">{subject.name}</h3>
                      <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                        {subject.credits} Cr
                      </span>
                      {totalWeight > 100 && (
                        <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                           Scaled ({totalWeight}%)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                        <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Score</div>
                        <div className={`font-bold text-xl leading-none ${finalScore >= 90 ? 'text-green-600' : finalScore >= 80 ? 'text-blue-600' : finalScore >= 40 ? 'text-slate-700' : 'text-red-500'}`}>
                            {finalScore}
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white shadow-sm ${gp >= 9 ? 'bg-green-500' : gp >= 8 ? 'bg-blue-500' : gp >= 5 ? 'bg-orange-400' : 'bg-red-500'}`}>
                        {GradeMap.find(g => finalScore >= g.min)?.grade || 'F'}
                        </div>
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="p-4 border-t border-slate-100 bg-slate-50/50 rounded-b-xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      
                      {/* Component Inputs */}
                      {[
                          { label: 'ISA 1', key: 'isa1', maxKey: 'isa1Max', w: subject.isaWeight },
                          { label: 'ISA 2', key: 'isa2', maxKey: 'isa2Max', w: subject.isaWeight },
                      ].map((field) => (
                        <div key={field.key} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 flex justify-between">
                                {field.label} <span className="font-normal text-slate-300">{field.w}%</span>
                            </label>
                            <div className="flex items-center gap-2">
                                <input type="number" placeholder="0" value={m[field.key]} onChange={(e) => handleMarkChange(subject.id, field.key, e.target.value)} className="w-full p-2 border border-slate-300 rounded font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                <span className="text-slate-300">/</span>
                                <input type="number" value={m[field.maxKey]} onChange={(e) => handleMarkChange(subject.id, field.maxKey, e.target.value)} className="w-12 p-2 bg-slate-50 text-slate-400 text-sm border-none focus:ring-0 text-center" />
                            </div>
                        </div>
                      ))}

                       <div className="space-y-3">
                        {subject.hasAssignment && (
                             <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 flex justify-between">
                                    Assign <span className="font-normal text-slate-300">{subject.assignmentWeight}%</span>
                                </label>
                                <div className="flex items-center gap-2">
                                    <input type="number" placeholder="0" value={m.assignment} onChange={(e) => handleMarkChange(subject.id, 'assignment', e.target.value)} className="w-full p-2 border border-slate-300 rounded font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                    <span className="text-slate-300">/</span>
                                    <input type="number" value={m.assignmentMax} onChange={(e) => handleMarkChange(subject.id, 'assignmentMax', e.target.value)} className="w-10 p-2 bg-slate-50 text-slate-400 text-sm border-none focus:ring-0 text-center" />
                                </div>
                            </div>
                        )}
                        {subject.hasLab && (
                            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm border-l-4 border-l-purple-400">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 flex justify-between">
                                    Lab <span className="font-normal text-slate-300">{subject.labWeight}%</span>
                                </label>
                                <div className="flex items-center gap-2">
                                    <input type="number" placeholder="0" value={m.lab} onChange={(e) => handleMarkChange(subject.id, 'lab', e.target.value)} className="w-full p-2 border border-slate-300 rounded font-semibold text-slate-700 focus:ring-2 focus:ring-purple-500 focus:outline-none" />
                                    <span className="text-slate-300">/</span>
                                    <input type="number" value={m.labMax} onChange={(e) => handleMarkChange(subject.id, 'labMax', e.target.value)} className="w-10 p-2 bg-slate-50 text-slate-400 text-sm border-none focus:ring-0 text-center" />
                                </div>
                            </div>
                        )}
                       </div>

                       <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm border-l-4 border-l-indigo-500">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 flex justify-between">
                            ESA <span className="font-normal text-slate-300">{subject.esaWeight}%</span>
                        </label>
                        <div className="flex items-center gap-2">
                            <input type="number" placeholder="0" value={m.esa} onChange={(e) => handleMarkChange(subject.id, 'esa', e.target.value)} className="w-full p-2 border border-slate-300 rounded font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                            <span className="text-slate-300">/</span>
                            <input type="number" value={m.esaMax} onChange={(e) => handleMarkChange(subject.id, 'esaMax', e.target.value)} className="w-12 p-2 bg-slate-50 text-slate-400 text-sm border-none focus:ring-0 text-center" />
                        </div>
                      </div>

                    </div>

                    {/* Quick Config */}
                    <div className="mt-4 pt-4 border-t border-slate-200">
                        <details className="group">
                            <summary className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wide cursor-pointer hover:text-blue-600 select-none transition-colors">
                                <Settings className="w-4 h-4" /> Edit Subject Details
                            </summary>
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white rounded-lg border border-slate-200">
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs text-slate-500 block mb-1">Name</label>
                                        <input type="text" value={subject.name} onChange={(e) => handleSubjectChange(subject.id, 'name', e.target.value)} className="w-full text-sm p-2 border rounded bg-slate-50" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500 block mb-1">Credits</label>
                                        <input type="number" value={subject.credits} onChange={(e) => handleSubjectChange(subject.id, 'credits', parseFloat(e.target.value))} className="w-full text-sm p-2 border rounded bg-slate-50" />
                                    </div>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 text-xs cursor-pointer"><input type="checkbox" checked={subject.hasAssignment} onChange={() => toggleAssignment(subject.id)} /> Has Assignment</label>
                                        <label className="flex items-center gap-2 text-xs cursor-pointer"><input type="checkbox" checked={subject.hasLab} onChange={() => toggleLab(subject.id)} /> Has Lab</label>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                     <label className="text-xs text-slate-500 block">Weight Configuration (%)</label>
                                     <div className="flex gap-2">
                                         <div className="flex-1"><span className="text-[10px] text-slate-400 block">ISA(Ea)</span><input type="number" value={subject.isaWeight} onChange={(e) => handleSubjectChange(subject.id, 'isaWeight', parseFloat(e.target.value))} className="w-full text-sm p-1 border rounded" /></div>
                                         <div className="flex-1"><span className="text-[10px] text-slate-400 block">ESA</span><input type="number" value={subject.esaWeight} onChange={(e) => handleSubjectChange(subject.id, 'esaWeight', parseFloat(e.target.value))} className="w-full text-sm p-1 border rounded" /></div>
                                         {subject.hasAssignment && <div className="flex-1"><span className="text-[10px] text-slate-400 block">Assign</span><input type="number" value={subject.assignmentWeight} onChange={(e) => handleSubjectChange(subject.id, 'assignmentWeight', parseFloat(e.target.value))} className="w-full text-sm p-1 border rounded" /></div>}
                                         {subject.hasLab && <div className="flex-1"><span className="text-[10px] text-slate-400 block">Lab</span><input type="number" value={subject.labWeight} onChange={(e) => handleSubjectChange(subject.id, 'labWeight', parseFloat(e.target.value))} className="w-full text-sm p-1 border rounded" /></div>}
                                     </div>
                                     <button onClick={() => removeSubject(subject.id)} className="w-full text-red-600 text-xs border border-red-200 bg-red-50 hover:bg-red-100 p-2 rounded flex items-center justify-center gap-2 mt-2"><Trash2 className="w-3 h-3" /> Remove Subject</button>
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

        <button onClick={addNewSubject} className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-400 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 font-bold text-sm">
          <Plus className="w-4 h-4" /> Add Custom Subject
        </button>

        {/* --- ANALYSIS SECTION --- */}
        <div className="grid grid-cols-1 gap-6 mt-8">
            
            {/* Target Analyzer */}
            <div className="bg-slate-900 rounded-xl shadow-lg p-6 text-white border border-slate-700">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold flex items-center gap-2 text-yellow-400">
                        <Activity className="w-5 h-5" /> Analysis
                    </h2>
                    <div className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded">
                        <span className="text-xs text-slate-400 uppercase font-bold">Target</span>
                        <input type="number" step="0.1" max="10" min="5" value={targetSgpa} onChange={(e) => setTargetSgpa(parseFloat(e.target.value))} className="w-12 p-0 bg-transparent text-right font-bold text-white border-none focus:ring-0" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                     <div className="bg-slate-800 rounded p-4 border border-slate-700 relative overflow-hidden group">
                         <div className="absolute top-0 right-0 p-2 opacity-10"><Target className="w-12 h-12"/></div>
                         <div className="text-2xl font-bold">{metrics.allowableLoss.toFixed(1)}</div>
                         <div className="text-[10px] text-slate-400 uppercase tracking-wider">GP Budget</div>
                         <p className="text-[10px] text-slate-500 mt-1">Points you can lose to hit {targetSgpa}</p>
                     </div>
                     <div className="bg-indigo-900/40 rounded p-4 border border-indigo-500/30 relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-2 opacity-10"><TrendingUp className="w-12 h-12"/></div>
                         <div className="text-2xl font-bold text-indigo-300">{metrics.momentumSGPA}</div>
                         <div className="text-[10px] text-indigo-200/70 uppercase tracking-wider">Momentum SGPA</div>
                         <p className="text-[10px] text-indigo-200/50 mt-1">If you perform same as Internals</p>
                     </div>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                    {metrics.analysisData.map((d, i) => (
                        <div key={i} className="flex justify-between items-center text-sm border-b border-slate-800 pb-2 last:border-0 hover:bg-slate-800/50 p-1 rounded transition-colors">
                            <span className="truncate flex-1 text-slate-300 font-medium mr-2">{d.name}</span>
                            <div className="flex gap-2 text-xs flex-shrink-0">
                                <span className="flex flex-col items-center w-14 bg-slate-800/50 rounded py-1">
                                    <span className="text-[10px] text-slate-500 uppercase">Momentum</span>
                                    <span className={`font-bold ${d.momentumScore >= 90 ? 'text-green-400' : d.momentumScore >= 80 ? 'text-blue-400' : 'text-slate-300'}`}>
                                        {d.momentumScore}
                                    </span>
                                </span>
                                
                                <span className="flex flex-col items-center w-12 bg-slate-800/30 rounded py-1">
                                    <span className="text-[10px] text-slate-500">For A</span>
                                    {d.reqA === null ? <span className="text-red-500 font-bold text-[10px]">Imp.</span> : d.reqA === 0 ? <span className="text-green-500 font-bold text-[10px]">Done</span> : <span className="text-blue-300 font-mono font-bold">{d.reqA}</span>}
                                </span>

                                <span className="flex flex-col items-center w-12 bg-slate-800/30 rounded py-1">
                                    <span className="text-[10px] text-slate-500">For S</span>
                                    {d.reqS === null ? <span className="text-red-500 font-bold text-[10px]">Imp.</span> : d.reqS === 0 ? <span className="text-green-500 font-bold text-[10px]">Done</span> : <span className="text-yellow-300 font-mono font-bold">{d.reqS}</span>}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Smart Strategy Panel (New) */}
            <div className="bg-slate-800 rounded-xl shadow-lg p-6 text-white border border-slate-700">
                <h2 className="text-lg font-bold flex items-center gap-2 mb-4 text-green-400">
                    <Lightbulb className="w-5 h-5" /> Path to Target
                </h2>
                
                {strategy.plan.length === 0 && !strategy.impossible && metrics.momentumSGPA >= targetSgpa ? (
                   <div className="bg-green-900/20 border border-green-800 rounded-lg p-4 flex items-center gap-3">
                       <CheckCircle2 className="w-6 h-6 text-green-400" />
                       <div>
                           <div className="font-bold text-green-300">You are on track!</div>
                           <div className="text-xs text-green-200/60">Your current momentum hits the target SGPA.</div>
                       </div>
                   </div>
                ) : strategy.impossible ? (
                   <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 flex items-center gap-3">
                       <AlertCircle className="w-6 h-6 text-red-400" />
                       <div>
                           <div className="font-bold text-red-300">Target Unreachable</div>
                           <div className="text-xs text-red-200/60">Even with 100 in all ESAs, this SGPA is mathematically impossible given your internals.</div>
                       </div>
                   </div>
                ) : (
                    <div className="space-y-3">
                        <p className="text-xs text-slate-400 mb-2">Easiest path to gain the remaining GP:</p>
                        {strategy.plan.map((step, idx) => (
                            <div key={idx} className="bg-slate-700/50 p-3 rounded-lg border border-slate-600 flex items-start gap-3 hover:bg-slate-700 transition-colors">
                                <div className="bg-slate-800 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-slate-400 flex-shrink-0 mt-0.5">
                                    {idx + 1}
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm font-bold text-slate-200 flex justify-between">
                                        <span>{step.name}</span>
                                        <span className="text-[10px] bg-indigo-900 text-indigo-200 px-1.5 rounded flex items-center">+{step.gpGain} GP</span>
                                    </div>
                                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-1 flex-wrap">
                                        <span>Score</span>
                                        <span className="text-white font-bold bg-slate-600 px-1 rounded">{step.esaNeeded}</span> 
                                        <span>in ESA to jump</span>
                                        <span className={`font-bold ${step.fromGrade === 'S' ? 'text-green-400' : 'text-blue-300'}`}>{step.fromGrade}</span>
                                        <ArrowRight className="w-3 h-3" />
                                        <span className={`font-bold ${step.toGrade === 'S' ? 'text-green-400' : 'text-blue-300'}`}>{step.toGrade}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {strategy.deficit > 0.01 && (
                            <div className="text-center text-xs text-red-400 mt-2">
                                * Plan covers most but {strategy.deficit.toFixed(1)} GP still needed. Try increasing target?
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Cumulative GPA Calculator */}
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
                <GraduationCap className="absolute top-[-20px] right-[-20px] w-40 h-40 text-white opacity-10" />
                
                <h2 className="text-lg font-bold flex items-center gap-2 mb-4 relative z-10">
                    <Calculator className="w-5 h-5" /> Cumulative GPA (CGPA)
                </h2>
                
                <p className="text-indigo-100 text-xs mb-6 relative z-10 leading-relaxed opacity-90">
                    Enter details from your previous semesters to calculate your overall CGPA including this semester's projected SGPA.
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
                    <div>
                        <label className="text-xs text-indigo-200 block mb-1 font-semibold">Previous SGPA/CGPA</label>
                        <input 
                            type="number" 
                            placeholder="e.g. 8.5" 
                            value={prevCgpaDetails.sgpa}
                            onChange={(e) => setPrevCgpaDetails({...prevCgpaDetails, sgpa: e.target.value})}
                            className="w-full bg-indigo-800/40 border border-indigo-400/30 rounded-lg p-3 text-white placeholder-indigo-300 focus:outline-none focus:border-white focus:bg-indigo-800/60 transition-all font-bold"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-indigo-200 block mb-1 font-semibold">Prev Credits Completed</label>
                        <input 
                            type="number" 
                            placeholder="e.g. 22" 
                            value={prevCgpaDetails.credits}
                            onChange={(e) => setPrevCgpaDetails({...prevCgpaDetails, credits: e.target.value})}
                            className="w-full bg-indigo-800/40 border border-indigo-400/30 rounded-lg p-3 text-white placeholder-indigo-300 focus:outline-none focus:border-white focus:bg-indigo-800/60 transition-all font-bold"
                        />
                    </div>
                </div>

                <div className="bg-white/10 rounded-xl p-4 relative z-10 backdrop-blur-sm border border-white/10 shadow-inner">
                    <div className="flex justify-between items-end">
                        <span className="text-sm font-bold text-indigo-100 uppercase tracking-wide">Projected CGPA</span>
                        <span className="text-4xl font-extrabold tracking-tight">{finalCgpa || '--'}</span>
                    </div>
                </div>
            </div>

        </div>

        {/* Footer */}
        <div className="text-center text-slate-400 text-xs mt-8 pb-4">
            <p>Data is auto-saved locally.</p>
            <p className="mt-1 opacity-50">PES SGPA Calculator © 2024</p>
        </div>

      </div>
    </div>
  );
}