import {expectType} from 'tsd';

import pidtree = require('.');

(async () => {
  expectType<number[]>(await pidtree(1));
  expectType<number[]>(await pidtree('1'));
  expectType<Array<{ppid: number; pid: number}>>(
    await pidtree(1, {advanced: true})
  );
  expectType<Array<{ppid: number; pid: number}>>(
    await pidtree('1', {advanced: true})
  );
})();
