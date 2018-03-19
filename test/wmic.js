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

test('should parse wmic output on Windows', async t => {
  const stdout =
    '' +
    'ParentProcessId  ProcessId' +
    os.EOL +
    '0                777      ' +
    os.EOL +
    '777              778      ' +
    os.EOL +
    '0                779      ';

  mockery.registerMock('child_process', {
    spawn: () => mocks.spawn(stdout, '', null, 0, null),
  });
  mockery.registerMock('os', {
    EOL: os.EOL,
    platform: () => 'linux',
    type: () => 'type',
    release: () => 'release',
  });

  const wmic = require('../lib/wmic');

  let result = await pify(wmic)(0);
  t.deepEqual(result, [777, 779, 778]);
  result = await pify(wmic)(777);
  t.deepEqual(result, [778]);
  result = await pify(wmic)(778);
  t.deepEqual(result, []);
  result = await pify(wmic)(779);
  t.deepEqual(result, []);

  mockery.deregisterMock('child_process');
  mockery.deregisterMock('os');
});
