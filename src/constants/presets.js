// --- Default Data for Reset ---
export const ChemistryCycleDefaults = [
  { id: 1, name: "Mathematics - I/II", credits: 4, hasLab: false, hasAssignment: true, isaWeight: 20, assignmentWeight: 10, labWeight: 0, esaWeight: 50, isa1Max: 40, isa2Max: 40, esaMax: 100 },
  { id: 2, name: "Engineering Chemistry", credits: 5, hasLab: true, hasAssignment: true, isaWeight: 20, assignmentWeight: 10, labWeight: 20, esaWeight: 50, isa1Max: 40, isa2Max: 40, esaMax: 100 },
  { id: 3, name: "Python for Computational Problem Solving/Problem Solving with C", credits: 5, hasLab: true, hasAssignment: true, isaWeight: 20, assignmentWeight: 10, labWeight: 20, esaWeight: 50, isa1Max: 40, isa2Max: 40, esaMax: 100 },
  { id: 4, name: "Engineering Mechanics", credits: 4, hasLab: false, hasAssignment: true, isaWeight: 20, assignmentWeight: 10, labWeight: 0, esaWeight: 50, isa1Max: 40, isa2Max: 40, esaMax: 100 },
  { id: 5, name: "Electronic Principles", credits: 4, hasLab: false, hasAssignment: true, isaWeight: 20, assignmentWeight: 10, labWeight: 0, esaWeight: 50, isa1Max: 40, isa2Max: 40, esaMax: 100 },
  { id: 6, name: "Constitution of India", credits: 2, hasLab: false, hasAssignment: false, isaWeight: 25, assignmentWeight: 0, labWeight: 0, esaWeight: 50, isa1Max: 30, isa2Max: 30, esaMax: 50 },
];

export const PhysicsCycleDefaults = [
  { id: 1, name: "Mathematics - I/II", credits: 4, hasLab: false, hasAssignment: true, isaWeight: 20, assignmentWeight: 10, labWeight: 0, esaWeight: 50, isa1Max: 40, isa2Max: 40, esaMax: 100 },
  { id: 2, name: "Engineering Physics", credits: 5, hasLab: true, hasAssignment: true, isaWeight: 20, assignmentWeight: 10, labWeight: 20, esaWeight: 50, isa1Max: 40, isa2Max: 40, esaMax: 100 },
  { id: 3, name: "Elements of Electrical Engineering", credits: 4, hasLab: false, hasAssignment: true, isaWeight: 20, assignmentWeight: 10, labWeight: 0, esaWeight: 50, isa1Max: 40, isa2Max: 40, esaMax: 100 },
  { id: 4, name: "Mechanical Engineering Sciences", credits: 4, hasLab: false, hasAssignment: true, isaWeight: 20, assignmentWeight: 10, labWeight: 0, esaWeight: 50, isa1Max: 40, isa2Max: 40, esaMax: 100 },
  { id: 5, name: "Python for Computational Problem Solving/Problem Solving with C", credits: 5, hasLab: true, hasAssignment: true, isaWeight: 20, assignmentWeight: 10, labWeight: 20, esaWeight: 50, isa1Max: 40, isa2Max: 40, esaMax: 100 },
  { id: 6, name: "Environmental Studies", credits: 2, hasLab: false, hasAssignment: false, isaWeight: 25, assignmentWeight: 0, labWeight: 0, esaWeight: 50, isa1Max: 30, isa2Max: 30, esaMax: 50 },
];

export const GenericCycleDefaults = [
  { id: 1, name: "Subject 1", credits: 4, hasLab: false, hasAssignment: true, isaWeight: 20, assignmentWeight: 10, labWeight: 0, esaWeight: 50, isa1Max: 40, isa2Max: 40, esaMax: 100 },
  { id: 2, name: "Subject 2", credits: 5, hasLab: true, hasAssignment: true, isaWeight: 20, assignmentWeight: 10, labWeight: 20, esaWeight: 50, isa1Max: 40, isa2Max: 40, esaMax: 100 },
  { id: 3, name: "Subject 3", credits: 4, hasLab: false, hasAssignment: true, isaWeight: 20, assignmentWeight: 10, labWeight: 0, esaWeight: 50, isa1Max: 40, isa2Max: 40, esaMax: 100 },
  { id: 4, name: "Subject 4", credits: 4, hasLab: false, hasAssignment: true, isaWeight: 20, assignmentWeight: 10, labWeight: 0, esaWeight: 50, isa1Max: 40, isa2Max: 40, esaMax: 100 },
  { id: 5, name: "Subject 5", credits: 5, hasLab: true, hasAssignment: true, isaWeight: 20, assignmentWeight: 10, labWeight: 20, esaWeight: 50, isa1Max: 40, isa2Max: 40, esaMax: 100 },
  { id: 6, name: "Subject 6", credits: 2, hasLab: false, hasAssignment: false, isaWeight: 25, assignmentWeight: 0, labWeight: 0, esaWeight: 50, isa1Max: 30, isa2Max: 30, esaMax: 50 },
];

export const SemesterPresets = {
  "Chemistry Cycle": ChemistryCycleDefaults,
  "Physics Cycle": PhysicsCycleDefaults,
  "Generic Cycle (Editable)": GenericCycleDefaults,
};

export const GradeMap = [
  { grade: 'S', min: 90, gp: 10, color: 'text-green-500', bg: 'bg-green-500' },
  { grade: 'A', min: 80, gp: 9, color: 'text-blue-500', bg: 'bg-blue-500' },
  { grade: 'B', min: 70, gp: 8, color: 'text-indigo-500', bg: 'bg-indigo-500' },
  { grade: 'C', min: 60, gp: 7, color: 'text-yellow-500', bg: 'bg-yellow-500' },
  { grade: 'D', min: 50, gp: 6, color: 'text-orange-500', bg: 'bg-orange-500' },
  { grade: 'E', min: 40, gp: 5, color: 'text-red-400', bg: 'bg-red-400' },
  { grade: 'F', min: 0, gp: 0, color: 'text-red-600', bg: 'bg-red-600' },
];

// Common grading schemes from different universities
export const GradingSchemes = {
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
