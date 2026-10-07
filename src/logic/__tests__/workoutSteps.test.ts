import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { Workout } from '../../data/programs';
import { buildWorkoutSteps } from '../workoutSteps';

const workout: Workout = {
  name: { tk: 'A', ru: 'A', en: 'A' },
  blocks: [
    { exercise: 'squats', sets: 2, reps: 10, rest: 30 },
    { exercise: 'plank', sets: 1, seconds: 20, perSide: true, rest: 15 },
  ],
};

test('buildWorkoutSteps interleaves sets and rests, with no rest at the end', () => {
  const kinds = buildWorkoutSteps(workout).map((step) => step.kind);
  assert.deepEqual(kinds, ['ready', 'work', 'rest', 'work', 'rest', 'work']);
});

test('buildWorkoutSteps doubles timed holds done on each side', () => {
  const last = buildWorkoutSteps(workout).at(-1);
  assert.ok(last && last.kind === 'work');
  assert.equal(last.seconds, 40);
});

test('rep sets have no timer', () => {
  const firstWork = buildWorkoutSteps(workout)[1];
  assert.ok(firstWork && firstWork.kind === 'work');
  assert.equal(firstWork.seconds, null);
});
