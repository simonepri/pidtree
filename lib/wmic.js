import {run as defaultRun} from './bin.js';
import {parse} from './parse.js';

/**
 * Gets the list of all the pids of the system through the wmic command.
 * @param {Function} callback callback(err, list)
 * @param {Function} [run] Injectable spawner, used for testing.
 */
export function wmic(callback, run = defaultRun) {
  const args = ['PROCESS', 'get', 'ParentProcessId,ProcessId'];
  const options = {windowsHide: true, windowsVerbatimArguments: true};

  // Example of stdout
  //
  // ParentProcessId  ProcessId
  // 0                777
  run('wmic', args, options, (error, stdout, code) => {
    if (error) {
      callback(error);
      return;
    }

    if (code !== 0) {
      callback(new Error('pidtree wmic command exited with code ' + code));
      return;
    }

    try {
      callback(null, parse(stdout));
    } catch (error) {
      callback(error);
    }
  });
}
