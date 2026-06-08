import test from 'ava';
import {getWindows} from '../lib/get.js';

function call(wmicFn, powershellFn) {
  return new Promise((resolve, reject) => {
    getWindows(
      (error, list) => {
        if (error) {
          reject(error);
        } else {
          resolve(list);
        }
      },
      wmicFn,
      powershellFn,
    );
  });
}

test('uses wmic on Windows when it is available', async (t) => {
  let powershellUsed = false;
  const list = await call(
    (callback) =>
      callback(null, [
        [0, 100],
        [100, 101],
      ]),
    (callback) => {
      powershellUsed = true;
      callback(null, []);
    },
  );
  t.false(powershellUsed, 'powershell should not be used when wmic succeeds');
  t.deepEqual(list, [
    [0, 100],
    [100, 101],
  ]);
});

test('falls back to powershell when wmic is missing', async (t) => {
  const enoent = Object.assign(new Error('spawn wmic ENOENT'), {
    code: 'ENOENT',
  });
  const list = await call(
    (callback) => callback(enoent),
    (callback) =>
      callback(null, [
        [0, 777],
        [777, 778],
      ]),
  );
  t.deepEqual(list, [
    [0, 777],
    [777, 778],
  ]);
});

test('does not fall back to powershell on a non-ENOENT wmic error', async (t) => {
  let powershellUsed = false;
  const boom = new Error('wmic exploded');
  const error = await t.throwsAsync(
    call(
      (callback) => callback(boom),
      (callback) => {
        powershellUsed = true;
        callback(null, []);
      },
    ),
  );
  t.false(
    powershellUsed,
    'powershell should not be used on a generic wmic error',
  );
  t.is(error, boom);
});
