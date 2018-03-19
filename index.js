'use strict';

function pify(fn, arg1, arg2) {
  return new Promise(function(resolve, reject) {
    fn(arg1, arg2, function(err, data) {
      if (err) return reject(err);
      resolve(data);
    });
  });
}

var tree = require('./lib/tree');

/**
 * Get the list of child pids of the given pid.
 * @public
 * @param  {Number|String} pid A pid.
 * @param  {Object} [options] Optional options object.
 * @param  {Boolean} [options.root=false] Include the provided pid in the list.
 * @param  {Function} [callback=undefined] Called when the list is ready. If not
 * provided a promise is returned instead.
 * @returns  {Promise.<Object>} Only when the callback is not provided.
 */
function pidtree(pid, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = undefined;
  }
  if (typeof callback === 'function') {
    tree(pid, options, callback);
    return;
  }
  return pify(tree, pid, options);
}

module.exports = pidtree;
