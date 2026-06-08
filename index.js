import {promisify} from 'node:util';
import {pidtreeCallback} from './lib/pidtree.js';

const pidtreeAsync = promisify(pidtreeCallback);

/**
 * Get the list of children pids of the given pid.
 * @public
 * @param {number|string} pid A PID. If -1 will return all the pids.
 * @param {object} [options] Optional options object.
 * @param {boolean} [options.root=false] Include the provided PID in the list.
 * @param {boolean} [options.advanced=false] Returns a list of objects in the
 * format {ppid: X, pid: Y}.
 * @param {Function} [callback] Called when the list is ready. If not provided a
 * promise is returned instead.
 * @returns {Promise<object[]>|void} Only when the callback is not provided.
 */
function pidtree(pid, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = undefined;
  }

  if (typeof callback === 'function') {
    pidtreeCallback(pid, options, callback);
    return;
  }

  return pidtreeAsync(pid, options);
}

export default pidtree;
export {pidtree};
