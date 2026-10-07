import assert from 'node:assert/strict';
import { test } from 'node:test';

import { reminderTimes } from '../reminders';

const hours = (times: { hour: number }[]) => times.map((time) => time.hour);

test('reminderTimes spaces reminders through the day', () => {
  assert.deepEqual(hours(reminderTimes(9, 21, 2)), [9, 11, 13, 15, 17, 19, 21]);
  assert.deepEqual(hours(reminderTimes(8, 20, 3)), [8, 11, 14, 17, 20]);
  assert.ok(reminderTimes(9, 21, 2).every((time) => time.minute === 0));
});

test('reminderTimes returns nothing when the window is inverted', () => {
  assert.deepEqual(reminderTimes(21, 9, 2), []);
});
