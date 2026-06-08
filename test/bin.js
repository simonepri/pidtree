import test from 'ava';
import {stripStderr} from '../lib/bin.js';

test('returns undefined for empty stderr', (t) => {
  t.is(stripStderr(''), undefined);
});

test('trims and passes through a real error message', (t) => {
  t.is(stripStderr('  some error  '), 'some error');
});

test('strips the bogus screen size warning', (t) => {
  t.is(stripStderr('your 131072x1 screen size is bogus. expect trouble'), '');
});
