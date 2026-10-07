import assert from 'node:assert/strict';
import { test } from 'node:test';

import { waterGoalMl } from '../water';

test('waterGoalMl is 35 ml/kg plus 500 ml per hour trained', () => {
  assert.equal(waterGoalMl(55, 0), 1950);
  assert.equal(waterGoalMl(55, 90), 2700);
});

test('waterGoalMl stays between 1500 and 4500 ml', () => {
  assert.equal(waterGoalMl(30, 0), 1500);
  assert.equal(waterGoalMl(120, 240), 4500);
});
