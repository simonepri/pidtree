import test from 'ava';

import tspan from 'time-span';

import pidtree from '..';

async function execute(pid, times) {
  const end = tspan();
  try {
    for (let i = 0; i < times; i++) {
      // eslint-disable-next-line no-await-in-loop
      await pidtree(pid);
    }

    const time = end();
    return Promise.resolve(time);
  } catch (error) {
    end();
    return Promise.reject(error);
  }
}

test.serial('should execute the benchmark', async t => {
  let time = await execute(-1, 100);
  t.log(
    `Get childs of all the system's pids 100 times done in ${time.toFixed(
      3
    )} ms (${(1000 * 100 / time).toFixed(3)} op/s)`
  );

  time = await execute(process.pid, 100);
  t.log(
    `Get childs of pid:${process.pid} 100 times done in ${time.toFixed(
      3
    )} ms (${(1000 * 100 / time).toFixed(3)} op/s)`
  );

  t.pass();
});
