const path = require('path');
const cp = require('child_process');

let started = false;
const spawned = {};
const script = path.join('test', 'helpers', 'exec', 'child.js');

for (let i = 0; i < 10; i++) {
  const child = cp.spawn('node', [script], {windowsHide: true});
  child.stdout.on(
    'data',
    (child => {
      spawned[child.pid] = true;
    }).bind(this, child)
  );
}

setInterval(() => {
  if (started) return;
  if (Object.keys(spawned).length !== 10) return;
  console.log(process.pid);
  started = true;
}, 100); // Does nothing, but prevents exit
