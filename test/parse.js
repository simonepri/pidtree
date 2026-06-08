import test from 'ava';
import {parse} from '../lib/parse.js';

test('parses ps style output and skips the header', (t) => {
  const stdout = 'PPID   PID\n   1   430\n 430   432\n   1  7166\n';
  t.deepEqual(parse(stdout), [
    [1, 430],
    [430, 432],
    [1, 7166],
  ]);
});

test(String.raw`parses wmic style output with \r\r\n line endings`, (t) => {
  const stdout =
    'ParentProcessId  ProcessId\r\r\n' +
    '0                777\r\r\n' +
    '777              778\r\r\n';
  t.deepEqual(parse(stdout), [
    [0, 777],
    [777, 778],
  ]);
});

test('parses powershell style output without a header', (t) => {
  const stdout = '0 777\r\n777 778\r\n0 779\r\n';
  t.deepEqual(parse(stdout), [
    [0, 777],
    [777, 778],
    [0, 779],
  ]);
});

test('skips blank and non-numeric lines', (t) => {
  const stdout = '\n0 777\nsome banner line\n777 778\n';
  t.deepEqual(parse(stdout), [
    [0, 777],
    [777, 778],
  ]);
});

test('returns an empty list for empty output', (t) => {
  t.deepEqual(parse(''), []);
});
