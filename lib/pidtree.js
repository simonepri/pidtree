'use strict';

var getAll = require('./get');

/**
 * Get the list of children pids of the given pid.
 * @param  {Number|String} pid A pid.
 * @param  {Object} [options] Optional options object.
 * @param  {Boolean} [options.root=false] Include the provided pid in the list.
 * @param  {pidCallback} callback Called when the list is ready.
 */
function list(pid, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  if (typeof options !== 'object') {
    options = {};
  }

  pid = parseInt(pid, 10);
  if (isNaN(pid) || pid < -1) {
    callback(new TypeError('The pid provided is invalid'));
    return;
  }

  getAll(function(err, list) {
    if (err) {
      callback(err);
      return;
    }
    if (pid === -1) {
      for (var i = 0; i < list.length; i++) {
        list[i] = {ppid: list[i][0], pid: list[i][1]};
      }
      callback(null, list);
      return;
    }

    var root;
    for (var l = 0; l < list.length; l++) {
      if (list[l][1] === pid) {
        root = {ppid: list[l][0], pid: list[l][1]};
        break;
      }
    }
    if (!root) {
      callback(new Error('No maching pid found'));
      return;
    }

    // Build the graph
    var tree = {};
    while (list.length > 0) {
      var e = list.pop();
      if (tree[e[0]]) {
        tree[e[0]].push(e[1]);
      } else {
        tree[e[0]] = [e[1]];
      }
    }
    // Simplified BFS alike tree visit
    var idx = 0;
    var pids = [root];
    while (idx < pids.length) {
      var curpid = pids[idx++].pid;
      if (!tree[curpid]) continue;
      var len = tree[curpid].length;
      for (var j = 0; j < len; j++) {
        pids.push({ppid: curpid, pid: tree[curpid][j]});
      }
      delete tree[curpid];
    }

    if (!options || !options.root) {
      pids.shift(); // Remove root
    }
    callback(null, pids);
  });
}

module.exports = list;
