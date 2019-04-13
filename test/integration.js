import cp from 'child_process';
import path from 'path';

import test from 'ava';

import pify from 'pify';
import treek from 'tree-kill';

import pidtree from '..';

const scripts = {
  parent: path.join(__dirname, 'helpers', 'exec', 'parent.js'),
  child: path.join(__dirname, 'helpers', 'exec', 'child.js')
};

test('should work with a single pid', async t => {
  let result = await pidtree(-1, {advanced: true});
  t.log(result);

  t.true(Array.isArray(result));
  result.forEach((p, i) => {
    t.is(typeof p, 'object', i);
    t.is(typeof p.ppid, 'number', i);
    t.false(isNaN(p.ppid), i);
    t.is(typeof p.pid, 'number', i);
    t.false(isNaN(p.pid), i);
  });

  result = await pidtree(-1);

  t.true(Array.isArray(result));
  result.forEach((p, i) => {
    t.is(typeof p, 'number', i);
    t.false(isNaN(p), i);
  });
});

test('show work with a Parent process which has zero Child processes', async t => {
  const child = cp.spawn('node', [scripts.child]);

  try {
    await new Promise((resolve, reject) => {
      child.stdout.on('data', d => resolve(d.toString()));
      child.stderr.on('data', d => reject(d.toString()));
      child.on('error', reject);
      child.on('exit', reject);
    });
  } catch (error) {
    await pify(treek)(child.pid);
    t.notThrows(() => {
      throw error;
    });
  }

  const children = await pidtree(child.pid);
  await pify(treek)(child.pid);

  t.is(children.length, 0, 'There should be no active child processes');
});

test('show work with a Parent process which has ten Child processes', async t => {
  const parent = cp.spawn('node', [scripts.parent]);

  try {
    await new Promise((resolve, reject) => {
      parent.stdout.on('data', d => resolve(d.toString()));
      parent.stderr.on('data', d => reject(d.toString()));
      parent.on('error', reject);
      parent.on('exit', reject);
    });
  } catch (error) {
    await pify(treek)(parent.pid);
    t.notThrows(() => {
      throw error;
    });
  }

  const children = await pidtree(parent.pid);
  await pify(treek)(parent.pid);

  t.is(children.length, 10, 'There should be 10 active child processes');
});

test('show include the root if the root option is passsed', async t => {
  const child = cp.spawn('node', [scripts.child]);

  try {
    await new Promise((resolve, reject) => {
      child.stdout.on('data', d => resolve(d.toString()));
      child.stderr.on('data', d => reject(d.toString()));
      child.on('error', reject);
      child.on('exit', reject);
    });
  } catch (error) {
    await pify(treek)(child.pid);
    t.notThrows(() => {
      throw error;
    });
  }

  const children = await pidtree(child.pid, {root: true, advanced: true});
  await pify(treek)(child.pid);

  t.deepEqual(
    children,
    [{ppid: process.pid, pid: child.pid}],
    'There should be the root pid in the array'
  );
});

test('should throw an error if an invalid pid is provided', async t => {
  let err = await t.throwsAsync(pidtree(null));
  t.is(err.message, 'The pid provided is invalid');
  err = await t.throwsAsync(pidtree([]));
  t.is(err.message, 'The pid provided is invalid');
  err = await t.throwsAsync(pidtree('invalid'));
  t.is(err.message, 'The pid provided is invalid');
  err = await t.throwsAsync(pidtree(-2));
  t.is(err.message, 'The pid provided is invalid');
});

test('should throw an error if the pid does not exists', async t => {
  const err = await t.throwsAsync(pidtree(65535));
  t.is(err.message, 'No maching pid found');
});

test.cb("should use the callback if it's provided", t => {
  pidtree(process.pid, t.end);
});
