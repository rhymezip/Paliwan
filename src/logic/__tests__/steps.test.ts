import assert from 'node:assert/strict';
import { test } from 'node:test';

import { stepsToKcal, stepsToKm } from '../steps';

function close(actual: number, expected: number): void {
  assert.ok(Math.abs(actual - expected) < 0.001, `${actual} should be about ${expected}`);
}

test('stepsToKm uses a height-based stride', () => {
  close(stepsToKm(10000, 168, 'male'), 6.972);
  close(stepsToKm(8000, 160, 'female'), 5.2864);
});

test('stepsToKcal is 0.5 kcal per kg per km', () => {
  assert.equal(stepsToKcal(10000, 55, 168, 'male'), 192);
  assert.equal(stepsToKcal(0, 55, 168, 'male'), 0);
});
