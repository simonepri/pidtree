import {run as defaultRun} from './bin.js';
import {parse} from './parse.js';

/**
 * Gets the list of all the pids of the system through the ps command.
 * @param {Function} callback callback(err, list)
 * @param {Function} [run] Injectable spawner, used for testing.
 */
export function ps(callback, run = defaultRun) {
  // Example of stdout
  //
  // PPID   PID
  //    1   430
  //  430   432
  run('ps', ['-A', '-o', 'ppid,pid'], (error, stdout, code) => {
    if (error) {
      callback(error);
      return;
    }

    if (code !== 0) {
      callback(new Error('pidtree ps command exited with code ' + code));
      return;
    }

    try {
      callback(null, parse(stdout));
    } catch (error) {
      callback(error);
    }
  });
}
