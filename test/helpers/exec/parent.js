import cp from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const script = path.join(dirname, 'child.js');

let started = false;
const spawned = {};

for (let i = 0; i < 10; i++) {
  const child = cp.spawn('node', [script]);
  child.stdout.on('data', () => {
    spawned[child.pid] = true;
  });
}

// Prints this process's pid only once all ten children are up, so the test can
// rely on exactly ten descendants being alive.
setInterval(() => {
  if (started) return;
  if (Object.keys(spawned).length !== 10) return;
  console.log(process.pid);
  started = true;
}, 100);
