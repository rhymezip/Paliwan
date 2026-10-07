import assert from 'node:assert/strict';
import { test } from 'node:test';

import { macroTargets } from '../macros';

test('macroTargets: protein 1.6 g/kg, fat 30 %, carbs the rest', () => {
  assert.deepEqual(macroTargets(2936, 55), { proteinG: 88, carbsG: 426, fatG: 98 });
  assert.deepEqual(macroTargets(1499, 45), { proteinG: 72, carbsG: 190, fatG: 50 });
});

test('macroTargets keeps carbs at 3 g/kg and trims fat to fit', () => {
  assert.deepEqual(macroTargets(1200, 70), { proteinG: 112, carbsG: 210, fatG: 27 });
});
