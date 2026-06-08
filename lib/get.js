import os from 'node:os';
import {ps} from './ps.js';
import {wmic} from './wmic.js';
import {powershell} from './powershell.js';

const platformToMethod = {
  darwin: 'ps',
  sunos: 'ps',
  freebsd: 'ps',
  netbsd: 'ps',
  win: 'win',
  linux: 'ps',
  aix: 'ps',
};

let platform = os.platform();
if (platform.startsWith('win')) {
  platform = 'win';
}

const method = platformToMethod[platform];

/**
 * Lists the system pids on Windows. wmic has been removed from recent versions
 * (Windows 11 24H2, Windows Server 2025), so it is tried first (it is faster
 * when present) and PowerShell is used as a fallback when it is missing.
 * Exported for testing.
 * @param {Function} callback callback(err, list)
 * @param {Function} [wmicFn] Injectable wmic backend, used for testing.
 * @param {Function} [powershellFn] Injectable PowerShell backend, for testing.
 */
export function getWindows(callback, wmicFn = wmic, powershellFn = powershell) {
  wmicFn((error, list) => {
    if (error && error.code === 'ENOENT') {
      powershellFn(callback);
      return;
    }

    callback(error, list);
  });
}

/**
 * Gets the list of all the pids of the system.
 * @param {Function} callback Called when the list is ready.
 */
export function get(callback) {
  if (method === undefined) {
    callback(
      new Error(
        os.platform() +
          ' is not supported yet, please open an issue (https://github.com/simonepri/pidtree)',
      ),
    );
    return;
  }

  if (method === 'win') {
    getWindows(callback);
    return;
  }

  ps(callback);
}
