import assert from 'node:assert/strict';
import { test } from 'node:test';

import { energyTargets, goalsForAge, schofieldBmr } from '../energy';

function close(actual: number, expected: number): void {
  assert.ok(Math.abs(actual - expected) < 0.01, `${actual} should be about ${expected}`);
}

test('schofieldBmr uses the age band and sex', () => {
  close(schofieldBmr('male', 15, 55), 1630.93);
  close(schofieldBmr('female', 16, 50), 1361.8);
  close(schofieldBmr('male', 20, 70), 1746.19);
  close(schofieldBmr('male', 40, 80), 1790.86);
  close(schofieldBmr('female', 9, 30), 1095.35);
});

test('goalsForAge hides weight loss under 18', () => {
  assert.deepEqual(goalsForAge(15), ['perform', 'grow']);
  assert.deepEqual(goalsForAge(18), ['perform', 'grow', 'lose']);
});

test('energyTargets scales BMR by training load', () => {
  const result = energyTargets({ sex: 'male', age: 15, weightKg: 55, load: 'high', goal: 'perform' });
  assert.equal(result.maintenance, 2936);
  assert.equal(result.target, 2936);
});

test('energyTargets adds 300 kcal to grow', () => {
  assert.equal(
    energyTargets({ sex: 'male', age: 15, weightKg: 55, load: 'high', goal: 'grow' }).target,
    3236,
  );
});

test('energyTargets never sets a deficit under 18', () => {
  assert.equal(
    energyTargets({ sex: 'male', age: 15, weightKg: 55, load: 'high', goal: 'lose' }).target,
    2936,
  );
});

test('energyTargets lets adults lose 300 kcal, floored at BMR × 1.3', () => {
  assert.equal(
    energyTargets({ sex: 'male', age: 20, weightKg: 70, load: 'moderate', goal: 'lose' }).target,
    2581,
  );
  assert.equal(
    energyTargets({ sex: 'female', age: 25, weightKg: 45, load: 'light', goal: 'lose' }).target,
    1499,
  );
});
