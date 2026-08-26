#!/usr/bin/env node
// Dependency-free verification for the results import plan.
// Scores are intentionally not printed; live credentials/HAR data are not used.

import assert from 'node:assert/strict';
import { buildImportPlan, creditsFromCode } from './src/utils/resultsImport.js';

const portalSubjects = [
  { code: 'UE25MA141B', name: 'Engineering Mathematics I', components: [{ label: 'ISA 1', score: 32, max: 40 }] },
  { code: 'UE25PH151B', name: 'Engineering Physics', components: [{ label: 'ISA 1', score: 28, max: 40 }] },
  { code: 'UE25EV121B', name: 'Environmental Studies', components: [{ label: 'ISA 1', score: 24, max: 30 }] },
];

assert.equal(creditsFromCode('UE25MA141B'), 4);
assert.equal(creditsFromCode('UE25PH151B'), 5);
assert.equal(creditsFromCode('UE25EV121B'), 2);

const plan = buildImportPlan({
  calcSubjects: [{ id: 1, name: 'Unrelated current subject', hasLab: false }],
  finalSem: { semester: 2, subjects: portalSubjects },
});

assert.equal(plan.matched.length, 0);
assert.equal(plan.toCreate.length, 3);
assert.equal(plan.rebuild.length, 3);
assert.deepEqual(plan.rebuild.map((item) => item.credits), [4, 5, 2]);
assert.equal(plan.rebuild[1].subject.hasLab, true);
assert.equal(plan.rebuild[2].subject.hasAssignment, false);

console.log('results import verification: passed');
console.log(`rebuild subjects: ${plan.rebuild.length}; credits: ${plan.rebuild.map((item) => item.credits).join(', ')}`);
console.log('scores: masked');
