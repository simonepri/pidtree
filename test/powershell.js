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

test('should parse powershell output on Windows', async t => {
  const stdout = '0 777\r\n777 778\r\n0 779\r\n';

  mockery.registerMock('child_process', {
    spawn: () => mocks.spawn(stdout, '', null, 0, null),
  });
  mockery.registerMock('os', {
    EOL: '\n',
    platform: () => 'win32',
    type: () => 'type',
    release: () => 'release',
  });

  const powershell = require('../lib/powershell');

  const result = await pify(powershell)();
  t.deepEqual(result, [[0, 777], [777, 778], [0, 779]]);

  mockery.deregisterMock('child_process');
  mockery.deregisterMock('os');
});

test('should ignore non numeric lines in powershell output', async t => {
  const stdout = '\r\n0 777\r\nsome banner line\r\n777 778\r\n';

  mockery.registerMock('child_process', {
    spawn: () => mocks.spawn(stdout, '', null, 0, null),
  });
  mockery.registerMock('os', {
    EOL: '\n',
    platform: () => 'win32',
    type: () => 'type',
    release: () => 'release',
  });

  const powershell = require('../lib/powershell');

  const result = await pify(powershell)();
  t.deepEqual(result, [[0, 777], [777, 778]]);

  mockery.deregisterMock('child_process');
  mockery.deregisterMock('os');
});
