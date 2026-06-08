import test from 'ava';
import tspan from 'time-span';
import pidtree from '../index.js';

async function execute(pid, times) {
  const end = tspan();
  for (let i = 0; i < times; i++) {
    // eslint-disable-next-line no-await-in-loop
    await pidtree(pid);
  }

  return end();
}

test.serial('should execute the benchmark', async (t) => {
  let time = await execute(-1, 100);
  t.log(
    `Get childs of all the system's pids 100 times done in ${time.toFixed(
      3,
    )} ms (${((1000 * 100) / time).toFixed(3)} op/s)`,
  );

  time = await execute(process.pid, 100);
  t.log(
    `Get childs of pid:${process.pid} 100 times done in ${time.toFixed(
      3,
    )} ms (${((1000 * 100) / time).toFixed(3)} op/s)`,
  );

  t.true(time >= 0);
});
