'use strict';

var os = require('os');

var platformToMethod = {
  darwin: 'ps',
  sunos: 'ps',
  freebsd: 'ps',
  netbsd: 'ps',
  win: 'wmic',
  linux: 'ps',
  aix: 'ps',
};

var platform = os.platform();
if (platform.startsWith('win')) {
  platform = 'win';
}
var file = platformToMethod[platform];

/**
 * @callback pidCallback
 * @param {Error} err A possible error.
 * @param {Array.<Number>} statistics The array containing the child pids.
 */

/**
 * Get the list of child pids of the given pid
 * @public
 * @param  {Number|String} pid A pid.
 * @param  {Object} [options] Optional options object.
 * @param  {Boolean} [options.root] Include the provided pid in the list.
 * @param  {pidCallback} callback Called when the list is ready.
 */
function get(pid, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  if (file === undefined) {
    return callback(
      new Error(
        os.platform() +
          ' is not supported yet, please open an issue (https://github.com/simonepri/pidtree)'
      )
    );
  }

  pid = parseInt(pid, 10);
  if (isNaN(pid) || pid < 0) {
    return callback(new TypeError('The pid provided is invalid'));
  }

  var list = require('./' + file);
  list(pid, function(err, pids) {
    if (err) {
      return callback(err);
    }

    if (options.root) {
      pids.unshift(pid); // Add root
      return callback(null, pids);
    }
    callback(null, pids);
  });
}

module.exports = get;
