// Type definitions for pidtree 0.3
// Project: https://github.com/simonepri/pidtree
// Definitions by: Silas Rech <https://github.com/lenovouser>
// Definitions: https://github.com/simonepri/pidtree
// TypeScript Version: 3.4

declare namespace pidtree {
  export interface Options {
    /**
    Include the provided PID in the list. Ignored if -1 is passed as PID.

    @default false
    */
    root?: boolean;
  }

  export interface AdvancedResult {
    /**
    PID of the parent.
    */
    ppid: number,
    /**
    PID
    */
    pid: number,
  }

  export type Result = number;
}

/**
Get the list of children and grandchildren pids of the given PID.

@param pid The PID

@example
```
import * as pidtree from 'pidtree';
(async => {
  const result = await pidtree(1, { advanced: true });
  //=> [{ppid: 1, pid: 530}, {ppid: 1, pid: 42}, ..., {ppid: 1, pid: 41241}]
})();
```
*/
declare function pidtree(pid: string | number, callback: (error: Error | undefined, result: pidtree.Result[]) => void): void;
declare function pidtree(pid: string | number, options: pidtree.Options, callback: (error: Error | undefined, result: pidtree.Result[]) => void): void;
declare function pidtree(pid: string | number, options: pidtree.Options & { advanced: true }, callback: (error: Error | undefined, result: pidtree.AdvancedResult[]) => void): void;
declare function pidtree(pid: string | number): Promise<pidtree.Result[]>;
declare function pidtree(pid: string | number, options: pidtree.Options): Promise<pidtree.Result[]>;
declare function pidtree(pid: string | number, options: pidtree.Options & { advanced: true }): Promise<pidtree.AdvancedResult[]>;

export = pidtree;
