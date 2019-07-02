import { expectType } from 'tsd';
import * as pidtree from '.';

(async () => {
	expectType<number[]>(await pidtree(1));
	expectType<number[]>(await pidtree('1'));
	expectType<Array<{ ppid: number; pid: number }>>(await pidtree(1, { advanced: true }));
	expectType<Array<{ ppid: number; pid: number }>>(await pidtree('1', { advanced: true }));
})();
