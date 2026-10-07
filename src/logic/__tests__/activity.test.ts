import assert from 'node:assert/strict';
import { test } from 'node:test';

import { activityKcal } from '../activity';

test('activityKcal is MET × kg × hours × intensity', () => {
  assert.equal(activityKcal(7, 60, 'moderate', 55), 385);
  assert.equal(activityKcal(7, 60, 'hard', 55), 462);
  assert.equal(activityKcal(7, 30, 'easy', 55), 154);
});

test('activityKcal ignores impossible input', () => {
  assert.equal(activityKcal(7, -5, 'moderate', 55), 0);
  assert.equal(activityKcal(7, Number.NaN, 'moderate', 55), 0);
});
