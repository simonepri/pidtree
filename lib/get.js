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

var methodToRequireFn = {
  ps: () => require('./ps'),
  wmic: () => require('./wmic'),
  powershell: () => require('./powershell'),
};

var platform = os.platform();
if (platform.startsWith('win')) {
  platform = 'win';
}

var method = platformToMethod[platform];

/**
 * Gets the list of all the pids of the system.
 * @param  {Function} callback Called when the list is ready.
 */
function get(callback) {
  if (method === undefined) {
    callback(
      new Error(
        os.platform() +
          ' is not supported yet, please open an issue (https://github.com/simonepri/pidtree)'
      )
    );
    return;
  }

  // On Windows wmic has been removed from recent versions (e.g. Windows 11
  // 24H2 and Windows Server 2025). Try it first since it is faster when
  // present, and fall back to PowerShell when the binary cannot be found.
  if (method === 'wmic') {
    var wmic = methodToRequireFn.wmic();
    wmic(function(err, list) {
      if (err && err.code === 'ENOENT') {
        var powershell = methodToRequireFn.powershell();
        powershell(callback);
        return;
      }

      callback(err, list);
    });
    return;
  }

  var list = methodToRequireFn[method]();
  list(callback);
}

module.exports = get;
