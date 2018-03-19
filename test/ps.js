import os from 'os';

import test from 'ava';
import mockery from 'mockery';

import pify from 'pify';

import mocks from './helpers/mocks';

test.before(() => {
  mockery.enable({
    warnOnReplace: false,
    warnOnUnregistered: false,
    useCleanCache: true,
  });
});

test.beforeEach(() => {
  mockery.resetCache();
});

test.after(() => {
  mockery.disable();
});

test('should parse ps output on Darwin', async t => {
  const stdout =
    '' +
    '  PID  PPID' +
    os.EOL +
    '  430     1' +
    os.EOL +
    '  432   430' +
    os.EOL +
    '  727     1' +
    os.EOL +
    ' 7166     1';

  mockery.registerMock('child_process', {
    spawn: () => mocks.spawn(stdout, '', null, 0, null),
  });
  mockery.registerMock('os', {
    EOL: os.EOL,
    platform: () => 'darwin',
    type: () => 'type',
    release: () => 'release',
  });

  const ps = require('../lib/ps');

  let result = await pify(ps)(1);
  t.deepEqual(result, [430, 727, 7166, 432]);
  result = await pify(ps)(430);
  t.deepEqual(result, [432]);
  result = await pify(ps)(432);
  t.deepEqual(result, []);

  mockery.deregisterMock('child_process');
  mockery.deregisterMock('os');
});

test('should parse ps output on *nix', async t => {
  const stdout =
    '' +
    ' PID  PPID' +
    os.EOL +
    ' 430     1' +
    os.EOL +
    ' 432   430' +
    os.EOL +
    ' 727     1' +
    os.EOL +
    '7166     1';

  mockery.registerMock('child_process', {
    spawn: () => mocks.spawn(stdout, '', null, 0, null),
  });
  mockery.registerMock('os', {
    EOL: os.EOL,
    platform: () => 'linux',
    type: () => 'type',
    release: () => 'release',
  });

  const ps = require('../lib/ps');

  let result = await pify(ps)(1);
  t.deepEqual(result, [430, 727, 7166, 432]);
  result = await pify(ps)(430);
  t.deepEqual(result, [432]);
  result = await pify(ps)(432);
  t.deepEqual(result, []);

  mockery.deregisterMock('child_process');
  mockery.deregisterMock('os');
});
