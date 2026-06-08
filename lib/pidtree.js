import {get} from './get.js';

/**
 * Get the list of children and grandchildren pids of the given PID.
 * @param {number|string} pid A PID. If -1 will return all the pids.
 * @param {object} [options] Optional options object.
 * @param {boolean} [options.root=false] Include the provided PID in the list.
 * @param {boolean} [options.advanced=false] Returns a list of objects in the
 * format {ppid: X, pid: Y}.
 * @param {Function} callback callback(err, list) Called when the list is ready.
 */
export function pidtreeCallback(pid, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  if (typeof options !== 'object' || options === null) {
    options = {};
  }

  pid = Number.parseInt(pid, 10);
  if (Number.isNaN(pid) || pid < -1) {
    callback(new TypeError('The pid provided is invalid'));
    return;
  }

  get((error, list) => {
    if (error) {
      callback(error);
      return;
    }

    // If the user wants the whole list just return it.
    if (pid === -1) {
      const all = list.map((entry) =>
        options.advanced ? {ppid: entry[0], pid: entry[1]} : entry[1],
      );
      callback(null, all);
      return;
    }

    let root;
    for (const entry of list) {
      if (entry[1] === pid) {
        root = options.advanced ? {ppid: entry[0], pid} : pid;
        break;
      }

      if (entry[0] === pid) {
        // Special pids like 0 on *nix.
        root = options.advanced ? {pid} : pid;
      }
    }

    if (root === undefined) {
      callback(new Error('No matching pid found'));
      return;
    }

    // Build the adjacency Hash Map (pid -> [children of pid]).
    const tree = {};
    for (const [parentPid, childPid] of list) {
      if (tree[parentPid]) {
        tree[parentPid].push(childPid);
      } else {
        tree[parentPid] = [childPid];
      }
    }

    // Starting from the PID provided by the user, traverse the tree using the
    // adjacency Hash Map until the whole subtree is visited. Each pid
    // encountered while visiting is added to the pids array.
    const pids = [root];
    let index = 0;
    while (index < pids.length) {
      const current = options.advanced ? pids[index].pid : pids[index];
      index++;
      const children = tree[current];
      if (!children) continue;
      for (const childPid of children) {
        pids.push(options.advanced ? {ppid: current, pid: childPid} : childPid);
      }

      delete tree[current];
    }

    if (!options.root) {
      pids.shift(); // Remove root.
    }

    callback(null, pids);
  });
}
