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
    `ParentProcessId  ProcessId\r\n` +
    `0                777      \r\n` +
    `777              778      \r\n` +
    `0                779      `;

  mockery.registerMock('child_process', {
    spawn: () => mocks.spawn(stdout, '', null, 0, null),
  });
  mockery.registerMock('os', {
    EOL: '\r\n',
    platform: () => 'linux',
    type: () => 'type',
    release: () => 'release',
  });

  const wmic = require('../lib/wmic');

  const result = await pify(wmic)();
  t.deepEqual(result, [[0, 777], [777, 778], [0, 779]]);

  mockery.deregisterMock('child_process');
  mockery.deregisterMock('os');
});
