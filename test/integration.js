import cp from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {promisify} from 'node:util';
import test from 'ava';
import treeKill from 'tree-kill';
import pidtree from '../index.js';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const kill = promisify(treeKill);

const scripts = {
  parent: path.join(dirname, 'helpers', 'exec', 'parent.js'),
  child: path.join(dirname, 'helpers', 'exec', 'child.js'),
};

// Resolves once the spawned helper has printed its pid, meaning it (and all of
// its own children) are up and running.
function waitForReady(child) {
  return new Promise((resolve, reject) => {
    child.stdout.on('data', (data) => resolve(data.toString()));
    child.stderr.on('data', (data) => reject(new Error(data.toString())));
    child.on('error', reject);
    child.on('exit', () => reject(new Error('the helper exited early')));
  });
}

test('should work with a single pid', async (t) => {
  let result = await pidtree(-1, {advanced: true});
  t.true(Array.isArray(result));
  for (const entry of result) {
    t.is(typeof entry.ppid, 'number');
    t.false(Number.isNaN(entry.ppid));
    t.is(typeof entry.pid, 'number');
    t.false(Number.isNaN(entry.pid));
  }

  result = await pidtree(-1);
  t.true(Array.isArray(result));
  for (const entry of result) {
    t.is(typeof entry, 'number');
    t.false(Number.isNaN(entry));
  }
});

test('should work with a parent which has zero child processes', async (t) => {
  const child = cp.spawn('node', [scripts.child]);
  await waitForReady(child);

  const children = await pidtree(child.pid);
  await kill(child.pid);

  t.is(children.length, 0, 'There should be no active child processes');
});

test('should work with a parent which has ten child processes', async (t) => {
  const parent = cp.spawn('node', [scripts.parent]);
  await waitForReady(parent);

  const children = await pidtree(parent.pid);
  await kill(parent.pid);

  t.is(children.length, 10, 'There should be 10 active child processes');
});

test('should include the root when the root option is passed', async (t) => {
  const child = cp.spawn('node', [scripts.child]);
  await waitForReady(child);

  const children = await pidtree(child.pid, {root: true, advanced: true});
  await kill(child.pid);

  t.deepEqual(children, [{ppid: process.pid, pid: child.pid}]);
});

test('should throw an error if an invalid pid is provided', async (t) => {
  for (const bad of [null, [], 'invalid', -2]) {
    // eslint-disable-next-line no-await-in-loop
    const error = await t.throwsAsync(pidtree(bad));
    t.is(error.message, 'The pid provided is invalid');
  }
});

test('should throw an error if the pid does not exist', async (t) => {
  const error = await t.throwsAsync(pidtree(65_535));
  t.is(error.message, 'No matching pid found');
});

test('should use the callback when one is provided', async (t) => {
  const list = await new Promise((resolve, reject) => {
    pidtree(process.pid, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
  t.true(Array.isArray(list));
});
