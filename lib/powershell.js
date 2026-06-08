import {run as defaultRun} from './bin.js';
import {parse} from './parse.js';

// PowerShell command used to list every process as "<ppid> <pid>" lines.
// Get-CimInstance is the supported replacement for the removed wmic utility
// (see https://github.com/simonepri/pidtree/issues/20). $ProgressPreference is
// silenced so PowerShell does not serialize its progress stream to stderr.
const COMMAND =
  "$ProgressPreference = 'SilentlyContinue'; " +
  'Get-CimInstance -ClassName Win32_Process | ' +
  'ForEach-Object { "$($_.ParentProcessId) $($_.ProcessId)" }';

// The command is passed through -EncodedCommand (Base64 of the UTF-16LE
// string) to avoid any cross-shell argument quoting issues on Windows.
const ENCODED = Buffer.from(COMMAND, 'utf16le').toString('base64');

/**
 * Gets the list of all the pids of the system through PowerShell.
 * Used as a fallback on Windows installations where wmic is not available
 * (e.g. Windows 11 24H2 and Windows Server 2025).
 * @param {Function} callback callback(err, list)
 * @param {Function} [run] Injectable spawner, used for testing.
 */
export function powershell(callback, run = defaultRun) {
  const args = ['-NoProfile', '-NonInteractive', '-EncodedCommand', ENCODED];
  const options = {windowsHide: true};

  // Example of stdout
  //
  // 0 777
  // 777 778
  run('powershell', args, options, (error, stdout, code) => {
    if (error) {
      callback(error);
      return;
    }

    if (code !== 0) {
      callback(
        new Error('pidtree powershell command exited with code ' + code),
      );
      return;
    }

    try {
      callback(null, parse(stdout));
    } catch (error) {
      callback(error);
    }
  });
}
