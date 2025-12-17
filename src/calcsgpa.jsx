import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Calculator, Settings, ChevronDown, ChevronUp, Save, RotateCcw, BookOpen, GraduationCap } from 'lucide-react';

const DefaultSubjects = [
  { id: 1, name: "Mathematics - I", credits: 4, hasLab: false, hasAssignment: true, isaWeight: 20, assignmentWeight: 10, labWeight: 0, esaWeight: 50 },
  { id: 2, name: "Engineering Chemistry", credits: 5, hasLab: true, hasAssignment: true, isaWeight: 20, assignmentWeight: 5, labWeight: 5, esaWeight: 50 },
  { id: 3, name: "Problem Solving with C", credits: 5, hasLab: true, hasAssignment: true, isaWeight: 20, assignmentWeight: 5, labWeight: 5, esaWeight: 50 },
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

export default function PES_SGPA_Calculator() {
  const [subjects, setSubjects] = useState(DefaultSubjects);
  const [marks, setMarks] = useState({});
  const [sgpa, setSgpa] = useState(0);
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [showSummary, setShowSummary] = useState(false);

  // Initialize marks state structure
  useEffect(() => {
    const initialMarks = {};
    subjects.forEach(sub => {
      // Preserve existing marks if subject ID exists, else init new
      if (marks[sub.id]) {
        initialMarks[sub.id] = marks[sub.id];
      } else {
        initialMarks[sub.id] = {
          isa1: '', isa1Max: 40,
          isa2: '', isa2Max: 40,
          assignment: '', assignmentMax: 10,
          lab: '', labMax: 20, // Lab marks often out of 20 or 50, standardized to weight later
          esa: '', esaMax: 100
        };
      }
    });
    setMarks(initialMarks);
  }, [subjects.length]); // Only re-run if number of subjects changes (adding/removing)

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
        // Auto-adjust weights for convenience
        let newAssignWeight = sub.assignmentWeight;
        let newLabWeight = sub.labWeight;
        
        if (newHasLab) {
            newLabWeight = 5;
            newAssignWeight = 5;
        } else {
            newLabWeight = 0;
            newAssignWeight = 10;
        }
        return { ...sub, hasLab: newHasLab, labWeight: newLabWeight, assignmentWeight: newAssignWeight };
      }
      return sub;
    }));
  };
  
  const toggleAssignment = (id) => {
      setSubjects(prev => prev.map(sub => {
          if (sub.id === id) {
              const newHasAssign = !sub.hasAssignment;
              return { ...sub, hasAssignment: newHasAssign, assignmentWeight: newHasAssign ? (sub.hasLab ? 5 : 10) : 0 };
          }
          return sub;
      }));
  }

  const addNewSubject = () => {
    const newId = Math.max(...subjects.map(s => s.id), 0) + 1;
    const newSubject = { 
      id: newId, 
      name: `Subject ${newId}`, 
      credits: 4, 
      hasLab: false, 
      hasAssignment: true, 
      isaWeight: 20, 
      assignmentWeight: 10, 
      labWeight: 0, 
      esaWeight: 50 
    };
    setSubjects([...subjects, newSubject]);
    setMarks(prev => ({
      ...prev,
      [newId]: { isa1: '', isa1Max: 40, isa2: '', isa2Max: 40, assignment: '', assignmentMax: 10, lab: '', labMax: 20, esa: '', esaMax: 100 }
    }));
    setExpandedSubject(newId);
  };

  const removeSubject = (id) => {
    setSubjects(subjects.filter(s => s.id !== id));
    const newMarks = { ...marks };
    delete newMarks[id];
    setMarks(newMarks);
  };

  const calculateSubjectTotal = (subject) => {
    const m = marks[subject.id];
    if (!m) return 0;

    // Helper to safely parse and calculate component score
    const calcComponent = (score, max, weight) => {
      const s = parseFloat(score);
      const mx = parseFloat(max);
      if (isNaN(s) || isNaN(mx) || mx === 0) return 0;
      return (s / mx) * weight;
    };

    // ISA 1 & 2 Weights are usually split equally from the total ISA weight (e.g. 20% total -> 10% each? No, prompt implies 2 ISAs usually count for 40 marks total (20 each) or similar).
    // The state `isaWeight` assumes weight PER ISA to keep it simple, or TOTAL?
    // Let's assume `isaWeight` in the object is the weight for EACH ISA to avoid confusion, 
    // OR we split the total internal weight. 
    // Standard PESU: ISA1 (20) + ISA2 (20) + Other (10) + ESA (50) = 100.
    // So `isaWeight` in our state defaults to 20. Let's treat it as PER ISA weight.
    
    // Note: The default state I set above uses `isaWeight: 20`. I'll use this as the weight for ONE ISA.
    
    let total = 0;
    total += calcComponent(m.isa1, m.isa1Max, subject.isaWeight);
    total += calcComponent(m.isa2, m.isa2Max, subject.isaWeight); // Using same weight for ISA 2
    
    if (subject.hasAssignment) {
      total += calcComponent(m.assignment, m.assignmentMax, subject.assignmentWeight);
    }
    
    if (subject.hasLab) {
      total += calcComponent(m.lab, m.labMax, subject.labWeight);
    }
    
    total += calcComponent(m.esa, m.esaMax, subject.esaWeight);
    
    return Math.ceil(total); // PESU rounds up totals
  };

  const getGradePoint = (totalMarks) => {
    for (let g of GradeMap) {
      if (totalMarks >= g.min) return g.gp;
    }
    return 0;
  };

  const calculateSGPA = () => {
    let totalCredits = 0;
    let weightedPoints = 0;

    subjects.forEach(sub => {
      const total = calculateSubjectTotal(sub);
      const gp = getGradePoint(total);
      weightedPoints += gp * sub.credits;
      totalCredits += sub.credits;
    });

    return totalCredits > 0 ? (weightedPoints / totalCredits).toFixed(2) : 0;
  };

  useEffect(() => {
    setSgpa(calculateSGPA());
  }, [marks, subjects]);

  const resetToCycle = () => {
    if(window.confirm("Reset all subjects and marks to default Chemistry Cycle?")) {
      setSubjects(DefaultSubjects);
      // Marks useEffect will handle the reset
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-6 shadow-lg sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <GraduationCap className="w-8 h-8" />
              PESU SGPA Calculator
            </h1>
            <p className="text-blue-200 text-sm mt-1 opacity-90">First Year • Chemistry Cycle</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-blue-200 uppercase tracking-wider font-semibold">Current SGPA</div>
            <div className="text-4xl font-extrabold">{sgpa}</div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        
        {/* Helper Card */}
        <div className="bg-white rounded-xl shadow-sm p-5 border border-slate-200">
            <h3 className="font-semibold text-slate-700 flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-blue-600"/>
                Evaluation Scheme Used
            </h3>
            <p className="text-sm text-slate-600 mb-3">
                Default calculation reduces marks to 100: <span className="font-medium text-slate-800">ISAs (40%) + ESA (50%) + Assignments/Lab (10%)</span>.
            </p>
            <div className="flex gap-2">
                 <button 
                    onClick={resetToCycle}
                    className="text-xs flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg transition-colors"
                >
                    <RotateCcw className="w-3 h-3" /> Reset to Chem Cycle Defaults
                </button>
            </div>
        </div>

        {/* Subjects List */}
        <div className="space-y-4">
          {subjects.map((subject, index) => {
             const m = marks[subject.id] || {};
             const total = calculateSubjectTotal(subject);
             const gp = getGradePoint(total);
             const isExpanded = expandedSubject === subject.id;

             return (
              <div key={subject.id} className={`bg-white rounded-xl shadow-sm border transition-all duration-200 ${isExpanded ? 'border-blue-300 ring-1 ring-blue-100' : 'border-slate-200'}`}>
                {/* Subject Header (Always Visible) */}
                <div 
                  className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between cursor-pointer hover:bg-slate-50 rounded-t-xl gap-4"
                  onClick={() => setExpandedSubject(isExpanded ? null : subject.id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg text-slate-800">{subject.name}</h3>
                      <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                        {subject.credits} Credits
                      </span>
                      {subject.hasLab && (
                        <span className="text-xs font-medium bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200">
                           Lab
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                        <div className="text-xs text-slate-500 font-medium">Predicted Score</div>
                        <div className={`font-bold text-xl ${total >= 90 ? 'text-green-600' : total >= 80 ? 'text-blue-600' : total >= 40 ? 'text-slate-700' : 'text-red-500'}`}>
                            {total} <span className="text-sm font-normal text-slate-400">/ 100</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white shadow-sm ${gp >= 9 ? 'bg-green-500' : gp >= 8 ? 'bg-blue-500' : gp >= 5 ? 'bg-orange-400' : 'bg-red-500'}`}>
                        {GradeMap.find(g => total >= g.min)?.grade || 'F'}
                        </div>
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="p-4 border-t border-slate-100 bg-slate-50/50 rounded-b-xl">
                    
                    {/* Inputs Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      
                      {/* ISA 1 */}
                      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                            ISA 1 
                            <span className="ml-1 text-slate-400 font-normal normal-case">(Weight: {subject.isaWeight}%)</span>
                        </label>
                        <div className="flex items-center gap-2">
                            <input 
                                type="number" 
                                placeholder="0"
                                value={m.isa1} 
                                onChange={(e) => handleMarkChange(subject.id, 'isa1', e.target.value)}
                                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                            <span className="text-slate-400">/</span>
                            <input 
                                type="number" 
                                value={m.isa1Max}
                                onChange={(e) => handleMarkChange(subject.id, 'isa1Max', e.target.value)}
                                className="w-16 p-2 bg-slate-50 text-slate-500 text-sm border-none focus:ring-0 text-center"
                                title="Max Marks"
                            />
                        </div>
                      </div>

                      {/* ISA 2 */}
                      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                            ISA 2 
                            <span className="ml-1 text-slate-400 font-normal normal-case">(Weight: {subject.isaWeight}%)</span>
                        </label>
                        <div className="flex items-center gap-2">
                            <input 
                                type="number" 
                                placeholder="0"
                                value={m.isa2} 
                                onChange={(e) => handleMarkChange(subject.id, 'isa2', e.target.value)}
                                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                            <span className="text-slate-400">/</span>
                            <input 
                                type="number" 
                                value={m.isa2Max}
                                onChange={(e) => handleMarkChange(subject.id, 'isa2Max', e.target.value)}
                                className="w-16 p-2 bg-slate-50 text-slate-500 text-sm border-none focus:ring-0 text-center"
                            />
                        </div>
                      </div>

                      {/* Assignments / Lab Group */}
                       <div className="space-y-3">
                        {subject.hasAssignment && (
                             <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                                    Assignment
                                    <span className="ml-1 text-slate-400 font-normal normal-case">(Wt: {subject.assignmentWeight}%)</span>
                                </label>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="number" 
                                        placeholder="0"
                                        value={m.assignment} 
                                        onChange={(e) => handleMarkChange(subject.id, 'assignment', e.target.value)}
                                        className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                    <span className="text-slate-400">/</span>
                                    <input 
                                        type="number" 
                                        value={m.assignmentMax}
                                        onChange={(e) => handleMarkChange(subject.id, 'assignmentMax', e.target.value)}
                                        className="w-12 p-2 bg-slate-50 text-slate-500 text-sm border-none focus:ring-0 text-center"
                                    />
                                </div>
                            </div>
                        )}

                        {subject.hasLab && (
                            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm border-l-4 border-l-purple-400">
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                                    Lab / Project
                                    <span className="ml-1 text-slate-400 font-normal normal-case">(Wt: {subject.labWeight}%)</span>
                                </label>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="number" 
                                        placeholder="0"
                                        value={m.lab} 
                                        onChange={(e) => handleMarkChange(subject.id, 'lab', e.target.value)}
                                        className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                    />
                                    <span className="text-slate-400">/</span>
                                    <input 
                                        type="number" 
                                        value={m.labMax}
                                        onChange={(e) => handleMarkChange(subject.id, 'labMax', e.target.value)}
                                        className="w-12 p-2 bg-slate-50 text-slate-500 text-sm border-none focus:ring-0 text-center"
                                    />
                                </div>
                            </div>
                        )}
                       </div>

                       {/* ESA */}
                       <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm border-l-4 border-l-indigo-400">
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                            ESA
                            <span className="ml-1 text-slate-400 font-normal normal-case">(Weight: {subject.esaWeight}%)</span>
                        </label>
                        <div className="flex items-center gap-2">
                            <input 
                                type="number" 
                                placeholder="0"
                                value={m.esa} 
                                onChange={(e) => handleMarkChange(subject.id, 'esa', e.target.value)}
                                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                            <span className="text-slate-400">/</span>
                            <input 
                                type="number" 
                                value={m.esaMax}
                                onChange={(e) => handleMarkChange(subject.id, 'esaMax', e.target.value)}
                                className="w-14 p-2 bg-slate-50 text-slate-500 text-sm border-none focus:ring-0 text-center"
                            />
                        </div>
                      </div>

                    </div>

                    {/* Settings for this Subject */}
                    <div className="mt-4 pt-4 border-t border-slate-200">
                        <details className="group">
                            <summary className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide cursor-pointer hover:text-blue-600 select-none">
                                <Settings className="w-4 h-4" />
                                Configure Subject (Credits & Weights)
                            </summary>
                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-white rounded-lg border border-slate-200">
                                <div>
                                    <label className="block text-xs text-slate-500 mb-1">Subject Name</label>
                                    <input 
                                        type="text" 
                                        value={subject.name} 
                                        onChange={(e) => handleSubjectChange(subject.id, 'name', e.target.value)}
                                        className="w-full text-sm p-2 border rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-500 mb-1">Credits</label>
                                    <input 
                                        type="number" 
                                        value={subject.credits} 
                                        onChange={(e) => handleSubjectChange(subject.id, 'credits', parseFloat(e.target.value))}
                                        className="w-full text-sm p-2 border rounded"
                                    />
                                </div>
                                <div className="flex flex-col justify-center gap-2">
                                    <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={subject.hasAssignment} 
                                            onChange={() => toggleAssignment(subject.id)}
                                            className="rounded text-blue-600 focus:ring-blue-500"
                                        />
                                        Has Assignment
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={subject.hasLab} 
                                            onChange={() => toggleLab(subject.id)}
                                            className="rounded text-blue-600 focus:ring-blue-500"
                                        />
                                        Has Lab
                                    </label>
                                </div>
                                <div>
                                    <button 
                                        onClick={() => removeSubject(subject.id)}
                                        className="w-full text-red-600 text-xs border border-red-200 bg-red-50 hover:bg-red-100 p-2 rounded flex items-center justify-center gap-2"
                                    >
                                        <Trash2 className="w-3 h-3" /> Remove Subject
                                    </button>
                                </div>
                                
                                <div className="col-span-full pt-2 mt-2 border-t border-dashed border-slate-200">
                                     <p className="text-xs text-slate-400 mb-2">Weight Distribution (Must sum to 100 approx)</p>
                                     <div className="flex gap-2 text-xs overflow-x-auto">
                                         <div className="flex flex-col">
                                            <span className="mb-1">ISA(Ea)</span>
                                            <input type="number" value={subject.isaWeight} onChange={(e) => handleSubjectChange(subject.id, 'isaWeight', parseFloat(e.target.value))} className="w-14 p-1 border rounded" />
                                         </div>
                                         <div className="flex flex-col">
                                            <span className="mb-1">ESA</span>
                                            <input type="number" value={subject.esaWeight} onChange={(e) => handleSubjectChange(subject.id, 'esaWeight', parseFloat(e.target.value))} className="w-14 p-1 border rounded" />
                                         </div>
                                         {subject.hasAssignment && (
                                            <div className="flex flex-col">
                                                <span className="mb-1">Assign</span>
                                                <input type="number" value={subject.assignmentWeight} onChange={(e) => handleSubjectChange(subject.id, 'assignmentWeight', parseFloat(e.target.value))} className="w-14 p-1 border rounded" />
                                            </div>
                                         )}
                                          {subject.hasLab && (
                                            <div className="flex flex-col">
                                                <span className="mb-1">Lab</span>
                                                <input type="number" value={subject.labWeight} onChange={(e) => handleSubjectChange(subject.id, 'labWeight', parseFloat(e.target.value))} className="w-14 p-1 border rounded" />
                                            </div>
                                         )}
                                     </div>
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

        {/* Add Button */}
        <button 
          onClick={addNewSubject}
          className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 font-medium"
        >
          <Plus className="w-5 h-5" /> Add Another Subject
        </button>

      </div>
    </div>
  );
}