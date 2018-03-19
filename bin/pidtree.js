#!/usr/bin/env node

'use strict';

var os = require('os');
var pidtree = require('..');

function help() {
  var help = `  Usage
    $ pidtree <ppid>

  Options
    --list                     To print the pids as a list.

  Examples
    $ pidtree
    $ pidtree --list
    $ pidtree 1
    $ pidtree 1 --list
`;
  console.log(help);
}

function list(ppid) {
  pidtree(ppid === undefined ? -1 : ppid, function(err, list) {
    if (err) {
      console.error(err.message);
      return;
    }
    console.log(list.map(e => e.pid).join(os.EOL));
  });
}

function tree(ppid) {
  pidtree(ppid, function(err, list) {
    if (err) {
      console.error(err.message);
      return;
    }

    var fathers = {}; // HasMap of fathers
    var tree = {}; // Adiacency HasMap
    while (list.length > 0) {
      var e = list.pop();
      if (tree[e.ppid]) {
        tree[e.ppid].push(e.pid);
      } else {
        tree[e.ppid] = [e.pid];
      }
      fathers[e.pid] = e.ppid;
    }
    var roots = [ppid];
    if (ppid === -1) {
      // Get all the roots
      roots = Object.keys(tree).filter(node => fathers[node] === undefined);
    }

    roots.forEach(root => print(visit(tree, root)));
  });

  function visit(tree, start) {
    // Build the tree
    var root = {pid: start};
    var stack = [root];
    while (stack.length > 0) {
      var cur = stack.pop();
      if (!tree[cur.pid]) continue;
      var len = tree[cur.pid].length;
      for (var j = 0; j < len; j++) {
        var node = {pid: tree[cur.pid][j]};
        if (cur.children === undefined) {
          cur.children = [node];
        } else {
          cur.children.push(node);
        }
        stack.push(node);
      }
      delete tree[cur.pid];
    }
    return root;
  }

  function print(node) {
    function printBranch(tree, branch) {
      const isGraphHead = branch.length === 0;
      const children = tree.children || [];

      let branchHead = '';
      if (!isGraphHead) {
        branchHead = children && children.length !== 0 ? '┬ ' : '─ ';
      }

      var toPrint = tree.pid;
      console.log(`${branch}${branchHead}${toPrint}`);

      let baseBranch = branch;
      if (!isGraphHead) {
        const isChildOfLastBranch = branch.slice(-2) === '└─';
        baseBranch = branch.slice(0, -2) + (isChildOfLastBranch ? '  ' : '| ');
      }

      const nextBranch = baseBranch + '├─';
      const lastBranch = baseBranch + '└─';
      children.forEach((child, index) => {
        printBranch(
          child,
          children.length - 1 === index ? lastBranch : nextBranch
        );
      });
    }

    printBranch(node, '');
  }
}

function run() {
  var flag;
  var ppid;
  for (var i = 2; i < process.argv.length; i++) {
    if (process.argv[i].startsWith('--')) {
      flag = process.argv[i];
    } else {
      ppid = process.argv[i];
    }
  }
  if (ppid === undefined) {
    ppid = -1;
  }

  if (flag === '--list') list(ppid);
  else if (flag === undefined) tree(ppid);
  else help();
}

run();
