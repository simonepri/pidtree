'use strict';

const util = require('node:util');
const pidtree = require('./lib/pidtree');

/**
 * Get the list of children pids of the given pid.
 * @public
 * @param  {Number|String} pid A PID. If -1 will return all the pids.
 * @param  {Object} [options] Optional options object.
 * @param  {Boolean} [options.root=false] Include the provided PID in the list.
 * @param  {Boolean} [options.advanced=false] Returns a list of objects in the
 * format {pid: X, ppid: Y}.
 * @param  {Function} [callback=undefined] Called when the list is ready. If not
 * provided a promise is returned instead.
 * @returns  {Promise.<Object[]>} Only when the callback is not provided.
 */
function list(pid, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = undefined;
  }

  if (typeof callback === 'function') {
    pidtree(pid, options, callback);
    return;
  }

  return util.promisify(pidtree)(pid, options);
}

module.exports = list;
