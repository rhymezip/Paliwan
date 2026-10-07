import assert from 'node:assert/strict';
import { test } from 'node:test';

import { shiftDate, streakDays } from '../streak';

test('shiftDate moves across month and year ends', () => {
  assert.equal(shiftDate('2026-10-01', -1), '2026-09-30');
  assert.equal(shiftDate('2026-12-31', 1), '2027-01-01');
});

test('streakDays counts back from today', () => {
  assert.equal(
    streakDays(['2026-10-08', '2026-10-07', '2026-10-06', '2026-10-04'], '2026-10-08'),
    3,
  );
});

test('streakDays keeps a streak alive until today ends', () => {
  assert.equal(streakDays(['2026-10-07', '2026-10-06'], '2026-10-08'), 2);
});

test('streakDays is zero after a missed day', () => {
  assert.equal(streakDays(['2026-10-05'], '2026-10-08'), 0);
  assert.equal(streakDays([], '2026-10-08'), 0);
});
