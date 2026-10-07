import assert from 'node:assert/strict';
import { test } from 'node:test';

import { format, pickLocalized } from '../../i18n/format';

test('format fills named params', () => {
  assert.equal(format('Salam, {name}!', { name: 'Aman' }), 'Salam, Aman!');
  assert.equal(format('{n} of {total}', { n: 3, total: 12 }), '3 of 12');
});

test('format leaves unknown params visible', () => {
  assert.equal(format('Hi {who}', {}), 'Hi {who}');
});

test('pickLocalized returns the active language', () => {
  assert.equal(pickLocalized('ru', { tk: 'Suw', ru: 'Вода', en: 'Water' }), 'Вода');
});
