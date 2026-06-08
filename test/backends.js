import test from 'ava';
import {ps} from '../lib/ps.js';
import {wmic} from '../lib/wmic.js';
import {powershell} from '../lib/powershell.js';

const backends = [
  {name: 'ps', fn: ps},
  {name: 'wmic', fn: wmic},
  {name: 'powershell', fn: powershell},
];

// A drop-in replacement for lib/bin.js `run` that handles both the
// (cmd, args, done) and (cmd, args, options, done) signatures.
function fakeRun({err, stdout = '', code = 0} = {}) {
  return (cmd, args, options, done) => {
    if (typeof options === 'function') {
      done = options;
    }

    if (err) {
      done(err);
      return;
    }

    done(null, stdout, code);
  };
}

function call(backend, run) {
  return new Promise((resolve, reject) => {
    backend((error, list) => {
      if (error) {
        reject(error);
      } else {
        resolve(list);
      }
    }, run);
  });
}

for (const {name, fn} of backends) {
  test(`${name} parses the spawned output`, async (t) => {
    const list = await call(fn, fakeRun({stdout: '0 100\n100 101\n'}));
    t.deepEqual(list, [
      [0, 100],
      [100, 101],
    ]);
  });

  test(`${name} errors on a non-zero exit code`, async (t) => {
    const error = await t.throwsAsync(call(fn, fakeRun({code: 1})));
    t.true(error.message.includes('exited with code 1'));
  });

  test(`${name} propagates a spawn error`, async (t) => {
    const boom = new Error('spawn failed');
    const error = await t.throwsAsync(call(fn, fakeRun({err: boom})));
    t.is(error, boom);
  });
}
