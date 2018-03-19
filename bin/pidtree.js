#!/usr/bin/env node

'use strict';

//
// Change the default parent PID if running
// under Windows.
//
let ppid = 1;
if (process.platform === 'win32') {
  ppid = 0;
}

require('..')(process.argv[2] || ppid, (err, data) => {
  if (err) {
    return console.error(err);
  }
  console.log(data);
});
