import { useState } from 'react';
import { GradingSchemes } from '../constants/presets';

export const useCustomTemplate = ({ setSubjects, setExpandedSubject, saveStateForUndo }) => {
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
      name: remainingComps.map(c => c.name).join(' + '),
      weight: remainingComps.reduce((sum, c) => sum + c.weight, 0),
      maxMarks: remainingComps.reduce((sum, c) => sum + c.maxMarks, 0)
    } : null;

    // 3. Create Custom Labels & Weights Map
    const customConfig = {
      labels: {
        isa1: slot1?.name || "ISA 1",
        isa2: slot2?.name || "ISA 2",
        assignment: slot3?.name || "Assignment",
        lab: slot4?.name || "Lab",
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

  return {
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
  };
};
