#!/usr/bin/env node

import os from 'node:os';
import pidtree from '../index.js';

function help() {
  console.log(
    '  Usage\n' +
      '  $ pidtree <ppid>\n' +
      '\n' +
      'Options\n' +
      '  --list                     To print the pids as a list.\n' +
      '\n' +
      'Examples\n' +
      '  $ pidtree\n' +
      '  $ pidtree --list\n' +
      '  $ pidtree 1\n' +
      '  $ pidtree 1 --list\n',
  );
}

function list(ppid) {
  pidtree(ppid === undefined ? -1 : ppid, (error, list) => {
    if (error) {
      console.error(error.message);
      return;
    }

    console.log(list.join(os.EOL));
  });
}

function tree(ppid) {
  pidtree(ppid, {advanced: true}, (error, list) => {
    if (error) {
      console.error(error.message);
      return;
    }

    const parents = {}; // Hash Map of parents
    const tree = {}; // Adjacency Hash Map
    while (list.length > 0) {
      const element = list.pop();
      if (tree[element.ppid]) {
        tree[element.ppid].push(element.pid);
      } else {
        tree[element.ppid] = [element.pid];
      }

      if (ppid === -1) {
        parents[element.pid] = element.ppid;
      }
    }

    let roots = [ppid];
    if (ppid === -1) {
      // Get all the roots.
      roots = Object.keys(tree).filter((node) => parents[node] === undefined);
    }

    for (const root of roots) {
      print(tree, root);
    }
  });

  function print(tree, start) {
    function printBranch(node, branch) {
      const isGraphHead = branch.length === 0;
      const children = tree[node] || [];

      let branchHead = '';
      if (!isGraphHead) {
        branchHead = children.length > 0 ? '┬ ' : '─ ';
      }

      console.log(branch + branchHead + node);

      let baseBranch = branch;
      if (!isGraphHead) {
        const isChildOfLastBranch = branch.slice(-2) === '└─';
        baseBranch = branch.slice(0, -2) + (isChildOfLastBranch ? '  ' : '| ');
      }

      const nextBranch = baseBranch + '├─';
      const lastBranch = baseBranch + '└─';
      for (const [index, child] of children.entries()) {
        printBranch(
          child,
          children.length - 1 === index ? lastBranch : nextBranch,
        );
      }
    }

    printBranch(start, '');
  }
}

function run() {
  let flag;
  let ppid;
  for (let i = 2; i < process.argv.length; i++) {
    if (process.argv[i].startsWith('--')) {
      flag = process.argv[i];
    } else {
      ppid = process.argv[i];
    }
  }

  if (ppid === undefined) {
    ppid = -1;
  }

  if (flag === '--list') {
    list(ppid);
  } else if (flag === undefined) {
    tree(ppid);
  } else {
    help();
  }
}

run();
