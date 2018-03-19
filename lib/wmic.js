'use strict';

var os = require('os');
var bin = require('./bin');

/**
 * Get the list of child pids of the given pid through the wmic command.
 * @param  {Number} pid
 * @param  {Function} done(err, tree)
 */
function wmic(pid, done) {
  var args = ['PROCESS', 'get', 'ParentProcessId,ProcessId'];
  var options = {windowsHide: true, windowsVerbatimArguments: true};
  bin('wmic', args, options, function(err, stdout, code) {
    if (err) {
      return done(err);
    }
    if (code !== 0) {
      return done(new Error('pidtree wmic command exited with code ' + code));
    }
    // Example of stdout on Windows 10
    //
    // ParentProcessId  ProcessId
    // 0                777

    stdout = stdout.split(os.EOL);

    var found = false;
    var tree = {};
    for (var i = 1; i < stdout.length; i++) {
      var line = stdout[i]
        .trim()
        .replace(/\s\s+/g, ' ')
        .split(' ');

      if (!line || line.length !== 2) {
        continue;
      }

      var PPID = parseInt(line[0], 10);
      var PID = parseInt(line[1], 10);

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
    }
    pids.shift(); // Remove root

    done(null, pids);
  });
}

module.exports = wmic;
