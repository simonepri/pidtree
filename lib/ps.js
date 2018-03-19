'use strict';

var os = require('os');
var bin = require('./bin');

/**
 * Get the list of child pids of the given pid through the ps command.
 * @param  {Number} pid
 * @param  {Function} done(err, tree)
 */
function ps(pid, done) {
  var args = ['-A', '-o', 'pid,ppid'];

  bin('ps', args, function(err, stdout, code) {
    if (err) return done(err);
    if (code !== 0) {
      return done(new Error('pidtree ps command exited with code ' + code));
    }
    // Example of stdout on *nix.
    //
    //  PID  PPID
    //  430     1
    //  432   430
    //  727     1
    // 7166     1

    // Example of stdout on Darwin
    //
    //  PID  PPID
    //  430     1
    //  432   430
    //  727     1
    // 7166     1

    stdout = stdout.split(os.EOL);

    var found = false;
    var tree = {};
    for (var i = 1; i < stdout.length; i++) {
      var line = stdout[i].trim().split(/\s+/);

      if (!line || line.length !== 2) {
        continue;
      }

      var PID = parseInt(line[0], 10);
      var PPID = parseInt(line[1], 10);

      if (pid === PID || pid === PPID) {
        found = true;
      }

      // Build the graph
      if (tree[PPID]) {
        tree[PPID].push(PID);
      } else {
        tree[PPID] = [PID];
      }
    }
    if (!found) {
      return done(new Error('No maching pid found'));
    }

    // Simplified BFS like tree visit
    var idx = 0;
    var pids = [pid];

    while (idx < pids.length) {
      var cur = pids[idx++];
      if (!tree[cur]) continue;
      var len = tree[cur].length;
      for (var j = 0; j < len; j++) {
        pids.push(tree[cur][j]);
      }
      delete tree[cur];
    }
    pids.shift(); // Remove root

    done(null, pids);
  });
}

module.exports = ps;
