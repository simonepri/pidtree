import os from 'os';

import test from 'ava';

import pify from 'pify';
import tspan from 'time-span';

import m from '..';

async function execute(pid, times) {
  const end = tspan();
  try {
    for (let i = 0; i < times; i++) {
      // eslint-disable-next-line no-await-in-loop
      await pify(m)(pid);
    }
    const time = end();
    return Promise.resolve(time);
  } catch (err) {
    end();
    return Promise.reject(err);
  }
}

test.serial('should execute the benchmark', async t => {
  let PPID = 1;
  if (os.platform().startsWith('win')) {
    PPID = 0;
  }

  let time = await execute(PPID, 100);
  t.log(
    `Get childs of pid:${PPID} 100 times done in ${time.toFixed(3)} ms (${(
      1000 *
      100 /
      time
    ).toFixed(3)} op/s)`
  );

  time = await execute(process.pid, 100);
  t.log(
    `Get childs of pid:${process.pid} 100 times done in ${time.toFixed(
      3
    )} ms (${(1000 * 100 / time).toFixed(3)} op/s)`
  );

  t.pass();
});
