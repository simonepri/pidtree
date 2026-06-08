import test from 'ava';
import mockery from 'mockery';

import pify from 'pify';

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

function osMock(platform) {
  return {
    EOL: '\n',
    platform: () => platform,
    type: () => 'type',
    release: () => 'release',
  };
}

test('should use wmic on Windows when it is available', async t => {
  mockery.registerMock('os', osMock('win32'));
  mockery.registerMock('./wmic', cb => cb(null, [[0, 100], [100, 101]]));
  mockery.registerMock('./powershell', () => {
    t.fail('powershell should not be used when wmic succeeds');
  });

  const get = require('../lib/get');

  const result = await pify(get)();
  t.deepEqual(result, [[0, 100], [100, 101]]);

  mockery.deregisterMock('os');
  mockery.deregisterMock('./wmic');
  mockery.deregisterMock('./powershell');
});

test('should fall back to powershell when wmic is missing on Windows', async t => {
  const enoent = new Error('spawn wmic ENOENT');
  enoent.code = 'ENOENT';

  mockery.registerMock('os', osMock('win32'));
  mockery.registerMock('./wmic', cb => cb(enoent));
  mockery.registerMock('./powershell', cb => cb(null, [[0, 777], [777, 778]]));

  const get = require('../lib/get');

  const result = await pify(get)();
  t.deepEqual(result, [[0, 777], [777, 778]]);

  mockery.deregisterMock('os');
  mockery.deregisterMock('./wmic');
  mockery.deregisterMock('./powershell');
});

test('should not fall back to powershell on a non ENOENT wmic error', async t => {
  const boom = new Error('wmic exploded');

  mockery.registerMock('os', osMock('win32'));
  mockery.registerMock('./wmic', cb => cb(boom));
  mockery.registerMock('./powershell', () => {
    t.fail('powershell should not be used on a generic wmic error');
  });

  const get = require('../lib/get');

  const err = await t.throws(pify(get)());
  t.is(err.message, 'wmic exploded');

  mockery.deregisterMock('os');
  mockery.deregisterMock('./wmic');
  mockery.deregisterMock('./powershell');
});
