import {expectType} from 'tsd';
import pidtree, {pidtree as named, type AdvancedResult} from './index.js';

(async () => {
  expectType<number[]>(await pidtree(1));
  expectType<number[]>(await pidtree('1'));
  expectType<AdvancedResult[]>(await pidtree(1, {advanced: true}));
  expectType<AdvancedResult[]>(await pidtree('1', {advanced: true}));
  expectType<number[]>(await pidtree(1, {root: true}));

  // The named export is the same function as the default export.
  expectType<number[]>(await named(1));
})();
